#!/usr/bin/env python3
"""Mandatory €0 original-image rescue gate for Ad Orientem acquisition jobs.

Runs *after* acquisition and before a job may report successful acquisition.
Makes an unpublished GitHub Release for every workflow run/attempt.  It never
changes images, edits the research catalogue or approves publication.
"""
import argparse
import datetime as dt
import filecmp
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import tarfile
import tempfile

EXTS = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".jp2", ".avif", ".mpo"}


def run(*args, capture=False):
    result = subprocess.run(list(args), text=True, check=True,
                            stdout=subprocess.PIPE if capture else None)
    return result.stdout.strip() if capture else None


def sha(path):
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def clean_rel(path):
    p = Path(path)
    assert not p.is_absolute() and ".." not in p.parts and path not in ("", ".")
    return path


def indexed_files(folder):
    result = []
    for path in sorted(folder.rglob("*")):
        if path.is_symlink():
            raise RuntimeError(f"Refusing symlink: {path}")
        if not path.is_file():
            continue
        relative = clean_rel(path.relative_to(folder).as_posix())
        result.append({
            "path": relative, "bytes": path.stat().st_size, "sha256": sha(path),
            "image_file": path.suffix.lower() in EXTS,
        })
    return result


def verify_archive(tar_path, expected):
    with tarfile.open(tar_path, mode="r") as archive:
        members = {m.name.removeprefix("./"): m for m in archive.getmembers() if m.isfile()}
        expected_paths = {r["path"] for r in expected["files"]}
        assert set(members) == expected_paths | {"AO_ARCHIVE_ACQUISITION_INDEX.json"}, "TAR file set mismatch"
        idx = json.load(archive.extractfile(members["AO_ARCHIVE_ACQUISITION_INDEX.json"]))
        assert idx == expected, "Archive index mismatch"
        for row in expected["files"]:
            member = members[row["path"]]
            assert member.size == row["bytes"], "Size mismatch: " + row["path"]
            h = hashlib.sha256()
            stream = archive.extractfile(member)
            for piece in iter(lambda: stream.read(1024 * 1024), b""):
                h.update(piece)
            assert h.hexdigest() == row["sha256"], "Digest mismatch: " + row["path"]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", required=True)
    parser.add_argument("--wave", required=True)
    args = parser.parse_args()
    if not re.fullmatch("[a-z0-9-]{1,45}", args.wave):
        raise ValueError("Wave name must be a safe slug")
    root = Path(args.source_dir).resolve()
    if not root.is_dir():
        raise FileNotFoundError("Acquisition output missing: " + str(root))
    repository = os.environ["GITHUB_REPOSITORY"]
    run_id = os.environ["GITHUB_RUN_ID"]
    attempt = os.environ["GITHUB_RUN_ATTEMPT"]
    if not os.environ.get("GH_TOKEN"):
        raise ValueError("Missing GITHUB_TOKEN; no unverified success allowed")
    tag = f"ao-art-originals-{run_id}-{attempt}"
    asset = f"ao-originals-{args.wave}-{run_id}-{attempt}.tar"
    rows = indexed_files(root)
    if not rows:
        raise RuntimeError("Acquisition folder has no auditable files; refusing a successful archive gate")
    images = sum(r["image_file"] for r in rows)
    manifest = {
        "schema_version": 1,
        "research_only": True,
        "publication_rights_approved": False,
        "editorial_approvals_created": 0,
        "source_run_id": int(run_id),
        "run_attempt": int(attempt),
        "wave": args.wave,
        "source_dir": args.source_dir,
        "created_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "images": images,
        "source_bytes": sum(r["bytes"] for r in rows),
        "files": rows,
    }
    with tempfile.TemporaryDirectory(prefix="ao-durable-art-") as scratch:
        dest = Path(scratch)
        tar = dest / asset
        index = dest / "AO_ARCHIVE_ACQUISITION_INDEX.json"
        index.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
        with tarfile.open(tar, "w") as archive:
            for row in rows:
                archive.add(root / row["path"], arcname=row["path"], recursive=False)
            archive.add(index, arcname=index.name)
        if tar.stat().st_size >= 2_000_000_000:
            raise RuntimeError("Release asset >2 GB; shard wave before archiving")
        release = run("gh", "release", "view", tag, "--repo", repository,
                      "--json", "isDraft", "--jq", ".isDraft", capture=True) if subprocess.run(
                          ["gh", "release", "view", tag, "--repo", repository],
                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
                      ).returncode == 0 else None
        if release is None:
            run("gh", "release", "create", tag, "--repo", repository,
                "--target", os.environ["GITHUB_SHA"], "--draft",
                "--title", f"Ad Orientem artwork originals, workflow {run_id}/{attempt} (UNPUBLISHED)",
                "--notes", "Preservation only. Originals and provenance; not rights-cleared or approved for distribution.")
        elif release != "true":
            raise RuntimeError("Refusing to upload to a published release")
        run("gh", "release", "upload", tag, str(tar), "--repo", repository, "--clobber")
        verify_dir = dest / "verify"
        verify_dir.mkdir()
        run("gh", "release", "download", tag, "--repo", repository,
            "--pattern", asset, "--dir", str(verify_dir))
        remote = verify_dir / asset
        if not filecmp.cmp(tar, remote, shallow=False):
            raise RuntimeError("Uploaded archive and downloaded copy differ")
        verify_archive(remote, manifest)
        if run("gh", "release", "view", tag, "--repo", repository,
               "--json", "isDraft", "--jq", ".isDraft", capture=True) != "true":
            raise RuntimeError("Archive release became published")
    report = f"ARCHIVED_AND_REMOTE_VERIFIED wave={args.wave} images={images} files={len(rows)} bytes={manifest['source_bytes']} draft_tag={tag}"
    print(report, flush=True)
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as summary:
            summary.write("### Original-art storage gate\n\n" + report + "\n\n")
    # No successful execution unless remote reread, exact archive and image checks pass.


if __name__ == "__main__":
    main()
