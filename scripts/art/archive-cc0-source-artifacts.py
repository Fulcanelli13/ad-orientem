#!/usr/bin/env python3
"""Preserve CC0-only Sacred Art originals; validate every recorded SHA-256 first.

Research source archive, not a production image release. Never includes PD-Art
or Kress-held items. Never deletes original GitHub Actions artifacts.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import urllib.request
import zipfile

TAG = "sacred-art-cc0-sources-20261028"

def digest(data):
    return hashlib.sha256(data).hexdigest()

def github_artifact(repo, token, artifact_id, dest):
    request = urllib.request.Request(
        f"https://api.github.com/repos/{repo}/actions/artifacts/{artifact_id}/zip",
        headers={"Authorization": f"Bearer {token}",
                 "Accept": "application/vnd.github+json",
                 "X-GitHub-Api-Version": "2026-03-10"})
    with urllib.request.urlopen(request, timeout=180) as source, open(dest, "wb") as target:
        shutil.copyfileobj(source, target, length=1024*1024)
    if not zipfile.is_zipfile(dest):
        raise RuntimeError("Artifact is not a ZIP: " + str(artifact_id))

def cmd(*args):
    return subprocess.run(["gh", *args], check=True, text=True, capture_output=True).stdout

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--cache", required=True, type=Path)
    parser.add_argument("--publish", action="store_true")
    args = parser.parse_args()
    data = json.loads(args.manifest.read_text())
    assert data["schema"] == "AO_SACRED_ART_CC0_ONLY_BACKUP_ALLOWLIST"
    approved = [r for r in data["rows"] if r["backupClassification"] == "ALLOW_CC0_ARCHIVAL"]
    excluded = [r for r in data["rows"] if r["backupClassification"] != "ALLOW_CC0_ARCHIVAL"]
    if len(approved) != 256 or len(excluded) != 10 or any(r["rightsClaim"] != "CC0" for r in approved):
        raise RuntimeError("CC0 allowlist invariants failed; refusing backup")
    groups = {}
    for item in approved:
        groups.setdefault(int(item["artifactId"]), []).append(item)
    if len(groups) != 33:
        raise RuntimeError("Expected 33 distinct CC0-containing artifacts")
    args.output.mkdir(parents=True, exist_ok=True)
    args.cache.mkdir(parents=True, exist_ok=True)
    token = os.environ.get("GITHUB_TOKEN", "")
    repo = os.environ.get("GITHUB_REPOSITORY", "Fulcanelli13/ad-orientem")
    results, files = [], []
    for artifact_id, rows in sorted(groups.items()):
        source_zip = args.cache / f"{artifact_id}.zip"
        if not source_zip.exists():
            if not token:
                raise RuntimeError("GITHUB_TOKEN required for archival artifact downloads")
            github_artifact(repo, token, artifact_id, source_zip)
        output_zip = args.output / f"cc0-originals-{artifact_id}.zip"
        members = []
        with zipfile.ZipFile(source_zip) as source, zipfile.ZipFile(output_zip, "w", compression=zipfile.ZIP_STORED, allowZip64=True) as output:
            for record in rows:
                oldpath = record["archiveZipMember"]
                if oldpath.startswith("/") or ".." in oldpath.split("/"):
                    raise RuntimeError("Unsafe archived image member path")
                with source.open(oldpath) as photo:
                    original = photo.read()
                sha = digest(original)
                if sha != record["artworkSha256"]:
                    raise RuntimeError("Original SHA-256 mismatch: " + record["id"])
                newpath = "originals/" + record["id"] + (Path(oldpath).suffix or ".jpg")
                output.writestr(newpath, original)
                info = {"artworkId": record["id"], "sha256": sha, "bytes": len(original),
                        "path": newpath, "source": record["sourceObjectUrl"],
                        "rightsClaim": "CC0", "rightsPolicy": record["rightsPolicyUrl"]}
                members.append(info)
                files.append(info)
            output.writestr("provenance.json", json.dumps({"sourceArtifactId": artifact_id, "files": members}, indent=2))
        sha = digest(output_zip.read_bytes())
        results.append({"asset": output_zip.name, "sha256": sha, "bytes": output_zip.stat().st_size,
                        "sourceArtifactId": artifact_id, "originals": len(rows)})
        print("VERIFIED", artifact_id, len(rows), sha, flush=True)
    if len(files) != 256 or len(results) != 33:
        raise RuntimeError("Verified-file count mismatch; release forbidden")
    index = {"schema": "AO_CC0_SOURCE_BACKUP_VERIFIED_V1", "date": "2026-10-28",
             "scope": "RESEARCH_SOURCES_NOT_PRODUCTION_MASTERS",
             "originalsVerified": len(files), "artifactsVerified": len(results),
             "nonCc0Excluded": 10, "assets": results, "files": files}
    (args.output / "verified-index.json").write_text(json.dumps(index, indent=2)+"\n")
    (args.output / "SHA256SUMS.txt").write_text(
        "".join(f"{a['sha256']}  {a['asset']}\n" for a in results))
    if not args.publish:
        print("VERIFIED_ONLY — no public release made", flush=True)
        return
    if not token:
        raise RuntimeError("No GitHub token: release forbidden")
    note = args.output / "ARCHIVE_NOTES.md"
    note.write_text("# Ad Orientem Sacred Art — archival sources only\n\n"
        "256 CC0-classified original research images, checked byte-for-byte against "
        "the previously recorded SHA-256 values. Ten non-CC0 or rights-held items "
        "were expressly excluded. This is not a final editorial, photographic or "
        "app-production approval. No originals or app assets were changed.\n")
    try:
        cmd("release", "view", TAG, "--repo", repo)
    except subprocess.CalledProcessError:
        cmd("release", "create", TAG, "--repo", repo, "--title",
            "Ad Orientem Sacred Art CC0 source backup (research only)",
            "--notes-file", str(note), "--target", os.environ.get("GITHUB_SHA", "HEAD"))
    paths = [str(args.output / r["asset"]) for r in results] + [
        str(args.output / "verified-index.json"), str(args.output / "SHA256SUMS.txt")]
    cmd("release", "upload", TAG, *paths, "--repo", repo, "--clobber")
    present = json.loads(cmd("release", "view", TAG, "--repo", repo, "--json", "assets"))["assets"]
    sizes = {x["name"]: x["size"] for x in present}
    if any(sizes.get(x["asset"]) != x["bytes"] for x in results):
        raise RuntimeError("Release asset size verification failed")
    if not {"verified-index.json", "SHA256SUMS.txt"}.issubset(sizes):
        raise RuntimeError("Release verification files missing")
    print(json.dumps({"release": f"https://github.com/{repo}/releases/tag/{TAG}",
                      "verifiedOriginals": len(files), "releaseAssets": len(paths)}), flush=True)

if __name__ == "__main__":
    main()
