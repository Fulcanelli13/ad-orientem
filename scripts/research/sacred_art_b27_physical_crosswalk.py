#!/usr/bin/env python3
"""Read-only, 451-row Sacred Art archive/canonical-artwork crosswalk.

Compares literal SHA-256 values stored in research rows and acquisition registers
to byte-verified original files inside unpublished B26 GitHub Release TAR assets.
Never creates approval, publication, or a catalogue update.
"""
import argparse
from collections import Counter, defaultdict
import csv
import hashlib
import json
from pathlib import Path
import re
import tarfile

REQUIRED_WAVES = {
    "b19", "b20", "b21", "b21r1", "b21r2", "b20r1",
    "b22nga", "b22kress", "b23p1", "b23p2", "b23commons35",
    "b23r2commons46", "b23r3mpo", "b24exact8", "b24exact4", "b25ribera",
}
SHA_RE = re.compile(r"\b[a-fA-F0-9]{64}\b")
EXTS = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".mpo", ".jp2", ".avif"}
CATALOGUE = Path("data/research/sacred-art-catalogue451-after-b25.csv")
ACQUISITIONS = Path("data/research/sacred-art-acquisition-245-source-rollup.csv")
BASELINE = Path("data/research/sacred-art-catalogue451-after-b25.summary.json")
FIELDS = [
    "artwork_id", "title", "artist", "frozen_decision", "priority",
    "recorded_previously_as_image_or_preview", "match_basis",
    "recorded_hashes", "verified_matching_original_files",
    "verified_distinct_sha256", "archive_waves", "matching_file_hashes",
    "physical_file_status", "publication_status", "next_action"
]


def csv_read(p):
    with p.open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def csv_write(path, rows, keys):
    with path.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=keys, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)


def hashes(value):
    return {m.lower() for m in SHA_RE.findall(value or "")}


def byte_sha(stream):
    h = hashlib.sha256()
    n = 0
    for chunk in iter(lambda: stream.read(1024 * 1024), b""):
        h.update(chunk)
        n += len(chunk)
    return h.hexdigest(), n


def scan_archive(tar_path):
    wave = tar_path.name.removeprefix("ao-source-b26-").removesuffix(".tar")
    if wave not in REQUIRED_WAVES:
        raise ValueError("Unexpected preservation archive " + tar_path.name)
    files = []
    with tarfile.open(tar_path, mode="r") as archive:
        members = {m.name.removeprefix("./"): m for m in archive.getmembers() if m.isfile()}
        assert "AO_PRESERVATION_SHA256_INDEX.json" in members
        idx = json.load(archive.extractfile(members["AO_PRESERVATION_SHA256_INDEX.json"]))
        assert idx["wave"] == wave
        assert idx["publication_rights_checked"] is False
        assert idx["editorial_approvals_created"] == 0
        recorded = idx["file_sha256"]
        assert len(recorded) == idx["files_with_image_extensions"]
        recorded_names = {r["path"] for r in recorded}
        assert len(recorded_names) == len(recorded), wave + ": repeated filenames"
        seen_names = set()
        for record in recorded:
            name = record["path"]
            assert not name.startswith("/") and ".." not in Path(name).parts
            assert Path(name).suffix.lower() in EXTS
            assert name in members, f"Archive missing {wave}/{name}"
            member = members[name]
            assert member.size == int(record["bytes"])
            actual_sha, n = byte_sha(archive.extractfile(member))
            assert actual_sha == record["sha256"].lower(), f"SHA mismatch {wave}/{name}"
            assert n == int(record["bytes"])
            seen_names.add(name)
            files.append({
                "archive_wave": wave,
                "file_path": name,
                "sha256": actual_sha,
                "bytes": n,
                "source_run_id": idx["source_run_id"],
                "source_artifact_id": idx["source_artifact_id"],
                "rights_status": "RESEARCH_UNAPPROVED",
            })
        physical_names = {n for n in members if Path(n).suffix.lower() in EXTS}
        assert seen_names == physical_names, f"Index omits files {wave}"
        assert sum(r["bytes"] for r in files) == idx["source_bytes"]
    return files


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--archive-dir", default="artifacts/sacred-art-b27-archive")
    ap.add_argument("--output-dir", default="artifacts/sacred-art-b27-crosswalk")
    a = ap.parse_args()
    catalog = csv_read(CATALOGUE)
    source = csv_read(ACQUISITIONS)
    baseline = json.loads(BASELINE.read_text(encoding="utf-8"))
    assert len(catalog) == 451 and len({r["artwork_id"] for r in catalog}) == 451
    assert len(source) == 245 and len({r["asset_source_id"] for r in source}) == 245
    assert baseline["active_artworks"] == 383
    assert baseline["rejected_preserved"] == 68
    archive_paths = sorted(Path(a.archive_dir).glob("ao-source-b26-*.tar"))
    found_waves = {p.name.removeprefix("ao-source-b26-").removesuffix(".tar") for p in archive_paths}
    assert found_waves == REQUIRED_WAVES, {"missing": sorted(REQUIRED_WAVES - found_waves),
                                             "unexpected": sorted(found_waves - REQUIRED_WAVES)}
    all_files = []
    for path in archive_paths:
        batch = scan_archive(path)
        all_files.extend(batch)
        print("ARCHIVE_BYTE_VERIFIED", path.name, len(batch), flush=True)
    assert len(all_files) == 290, len(all_files)
    assert sum(x["bytes"] for x in all_files) == 3076497763, "Known source-byte count changed"
    file_by_sha = defaultdict(list)
    for row in all_files:
        file_by_sha[row["sha256"]].append(row)
    acquisition_by_id = {r["asset_source_id"]: r for r in source}
    catalog_rows = []
    for row in catalog:
        direct_hashes = set()
        for key, val in row.items():
            if "sha256" in key.lower():
                direct_hashes.update(hashes(val))
        via_acquisition = set()
        accession_ids = [s.strip() for s in (row.get("matched_acquisition_ids") or "").split("|") if s.strip()]
        for sid in accession_ids:
            record = acquisition_by_id.get(sid)
            if record:
                via_acquisition |= hashes(record.get("original_sha256"))
                via_acquisition |= hashes(record.get("museum_print_sha256"))
        recorded_hashes = direct_hashes | via_acquisition
        available = sorted(recorded_hashes & file_by_sha.keys())
        exact_direct = bool(direct_hashes & file_by_sha.keys())
        count_instances = sum(len(file_by_sha[h]) for h in available)
        match_basis = ("EXPLICIT_CATALOGUE_SHA" if exact_direct else
                       ("REGISTERED_SOURCE_SHA" if available else "NO_PHYSICAL_SHA_MATCH"))
        if match_basis == "REGISTERED_SOURCE_SHA" and row.get("match_basis") == "SOURCE_URL_ALIAS_CANDIDATE":
            match_basis = "PROVISIONAL_URL_ALIAS_AND_SOURCE_SHA"
        frozen = row.get("frozen_decision", "")
        rejected = frozen == "PERMANENTLY_REJECTED"
        status = "ARCHIVED_EXACT_BYTES" if available else "NO_HASH_LINKED_ARCHIVE_FILE"
        action = ("PRESERVE_REJECTED_NO_PUBLICATION" if rejected else
                  ("VERIFY_IDENTITY_RIGHTS_RESOLUTION_EDITORIAL" if available else
                   ("SOURCE_DISCOVERY_AND_RIGHTS" if row.get("legacy_preview") != "YES" else
                    "VERIFY_LEGACY_ASSET_AND_LOCATE_MASTER")))
        catalog_rows.append({
            "artwork_id": row["artwork_id"], "title": row["title"], "artist": row["artist"],
            "frozen_decision": frozen, "priority": row["priority"],
            "recorded_previously_as_image_or_preview": row.get("legacy_preview", ""),
            "match_basis": match_basis, "recorded_hashes": len(recorded_hashes),
            "verified_matching_original_files": count_instances,
            "verified_distinct_sha256": len(available),
            "archive_waves": " | ".join(sorted({f["archive_wave"] for h in available for f in file_by_sha[h]})),
            "matching_file_hashes": " | ".join(available),
            "physical_file_status": status, "publication_status": row.get("release_status", "HOLD"),
            "next_action": action,
        })
    # File-to-artwork crosswalk (no inference from filenames, titles or vague URLs).
    artworks_by_hash = defaultdict(list)
    for c in catalog_rows:
        for digest in c["matching_file_hashes"].split(" | "):
            if digest:
                artworks_by_hash[digest].append(c["artwork_id"])
    physical_rows = []
    for row in all_files:
        ids = sorted(set(artworks_by_hash.get(row["sha256"], [])))
        physical_rows.append({
            **row, "catalogue_ids_with_recorded_hash": " | ".join(ids),
            "catalogue_match_count": len(ids),
            "identity_conflict_hold": "YES" if len(ids) > 1 else "NO",
            "publication_allowed": "NO",
        })
    active = [r for r in catalog_rows if r["frozen_decision"] != "PERMANENTLY_REJECTED"]
    matched = [r for r in active if r["verified_distinct_sha256"] > 0]
    no_match = [r for r in active if r["verified_distinct_sha256"] == 0]
    repeated_sha = {digest: len(files) for digest, files in file_by_sha.items() if len(files) > 1}
    unmatched_physical = [r for r in physical_rows if r["catalogue_match_count"] == 0]
    multi_match_physical = [r for r in physical_rows if r["catalogue_match_count"] > 1]
    report = {
        "scope": "B19-B25 SHA-exact archived originals vs canonical B25 451-artwork register",
        "archive_release_tag": "sacred-art-originals-b26-20261024",
        "catalogue_rows": 451, "active_artworks": len(active),
        "rejected_preserved": 68, "frozen_approved_preserved": baseline["frozen_approved_preserved"],
        "active_with_recorded_image_or_preview": baseline["active_with_image_or_preview"],
        "active_without_recorded_image": baseline["active_no_image"],
        "archive_packages_byte_verified": len(archive_paths),
        "physical_image_instances_byte_verified": len(physical_rows),
        "physical_source_bytes_byte_verified": sum(f["bytes"] for f in all_files),
        "distinct_binary_sha256": len(file_by_sha),
        "repeated_sha256_groups": len(repeated_sha),
        "repeated_image_file_instances_above_unique": sum(n - 1 for n in repeated_sha.values()),
        "active_artwork_ids_with_exact_sha256_linked_archive_file": len(matched),
        "active_artwork_ids_without_exact_sha256_linked_archive_file": len(no_match),
        "active_sha_matches_by_basis": dict(Counter(r["match_basis"] for r in matched)),
        "archive_file_instances_not_linked_to_canonical_id": len(unmatched_physical),
        "archive_file_instances_linked_to_multiple_ids": len(multi_match_physical),
        "matching_rejected_artworks": sum(r["verified_distinct_sha256"] > 0 for r in catalog_rows if r["frozen_decision"] == "PERMANENTLY_REJECTED"),
        "new_editorial_approvals": 0,
        "new_publication_approvals": 0,
        "not_release_certified": len(active),
        "limitations": [
            "An exact hash match proves only file identity, not artistic subject correctness or copyright.",
            "Multiple catalogue IDs per exact hash require identity review, not automatic promotion.",
            "Source-registration and URL alias matching are research claims, not independent identity certification.",
            "Originals captured in earlier alternative B20 or supplemental packs not counted here.",
            "Existing previews and approved editorial decisions do not automatically imply distributable assets.",
            "No canonical workbook, approval status, or production asset has been altered."
        ],
    }
    out = Path(a.output_dir)
    out.mkdir(parents=True, exist_ok=True)
    csv_write(out / "sacred-art-b27-physical-image-inventory.csv", physical_rows,
              list(physical_rows[0].keys()))
    csv_write(out / "sacred-art-b27-451-physical-crosswalk.csv", catalog_rows, FIELDS)
    (out / "sacred-art-b27-physical-summary.json").write_text(
        json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("P1_CATALOGUE_RECONCILED", json.dumps(report, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
