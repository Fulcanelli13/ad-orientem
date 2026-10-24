#!/usr/bin/env python3
"""Forensic correction: exact selected photo digest is the key's 3rd component.

Compare historic selected-photo references, current download byte SHA, physical
release TAR index and gallery photo variants. Do not alter old audit observations
or frozen editorial decisions. No network or image re-acquisition here.
"""
import csv
import hashlib
import json
from pathlib import Path
import tarfile

DATA=Path("data/research")
OUT=Path("artifacts/b29-historical-sha-forensics")
ARCHIVE=Path("artifacts/b29-historical-archive/ao-originals-b29-seven-selected-40071629985-1.tar")
RUN_ID=40071629985
ARCHIVE_TAG="ao-art-originals-40071629985-1"

def read(name):
    with (DATA/name).open(newline="",encoding="utf-8") as f:
        return list(csv.DictReader(f))

def sha_stream(stream):
    h=hashlib.sha256()
    n=0
    for block in iter(lambda:stream.read(1024*1024),b""):
        h.update(block);n+=len(block)
    return h.hexdigest(),n

def main():
    old=read("sacred-art-b29-seven-exact-acquisition-results.csv")
    legacy=read("sacred-art-b28-legacy108-master-recovery.csv")
    gallery=json.loads((DATA/"sacred-art-b29-p0-64-all-81-photo-variants.json").read_text())
    legacy_by_id={r["artwork_id"]:r for r in legacy}
    gallery_by_id={r["artwork_id"]:r for r in gallery["rows"]}
    assert len(old)==7 and len({x["artwork_id"] for x in old})==7
    assert gallery["photo_variants"]==81 and gallery["artwork_records"]==64
    assert ARCHIVE.exists()
    with tarfile.open(ARCHIVE,"r") as tar:
        members={m.name.removeprefix("./"):m for m in tar if m.isfile()}
        idx=json.load(tar.extractfile(members["AO_ARCHIVE_ACQUISITION_INDEX.json"]))
        assert idx["source_run_id"]==RUN_ID and idx["wave"]=="b29-seven-selected"
        assert idx["publication_rights_approved"] is False
        assert idx["editorial_approvals_created"]==0
        binary_index={r["sha256"]:r for r in idx["files"] if r["image_file"]}
        assert len(binary_index)==7
        results=[]
        for row in old:
            id=row["artwork_id"]
            expect=legacy_by_id[id]["selected_photo_expected_sha256"]
            stored=row["selected_preview_sha256"]
            actual=row["downloaded_sha256"]
            # Authoritative linkage: workbook selected-photo reference and
            # gallery key's historic digest match current acquired bytes.
            assert expect==stored==actual, "Historic original byte SHA drift: "+id
            variants=gallery_by_id[id]["photo_variants"]
            exact=[p for p in variants if p["selected_historical_preview_sha_match"] and
                        p["photo_key"].split("|")[2]==actual and
                        p["original_url"]==row["source_file_url"]]
            assert exact, "Gallery original selection and source URL differ: "+id
            assert row["recorded_dimensions_match"]=="YES"
            assert int(row["preview_dhash_distance"])<=10
            assert row["metadata_license_short_name"] in {"Public domain","CC BY-SA 3.0"}
            assert actual in binary_index
            member=binary_index[actual]
            contents=members[member["path"]]
            physical_sha,physical_bytes=sha_stream(tar.extractfile(contents))
            assert physical_sha==actual==member["sha256"]
            assert physical_bytes==int(row["acquired_bytes"])==member["bytes"]
            results.append({
                "artwork_id":id,
                "title":row["title"],
                "historical_selected_original_sha256":expect,
                "recovered_original_sha256":physical_sha,
                "historical_selected_original_recovered":"YES",
                "historical_selected_source_url":row["source_file_url"],
                "gallery_alt_photo_sha256_not_the_selected_byte_sha":exact[0]["original_recorded_sha256"],
                "source_original_width":int(row["width"]),
                "source_original_height":int(row["height"]),
                "selected_preview_dhash_distance":int(row["preview_dhash_distance"]),
                "source_rights_metadata":row["metadata_license_short_name"],
                "resolution_gate":row["resolution_gate"],
                "technical_status":"EXACT_SELECTED_BYTES_PRESERVED_AWAITING_EDITORIAL_AND_RIGHTS_GATES",
                "draft_release_tag":ARCHIVE_TAG,
                "publication_allowed":"NO",
            })
    assert len(results)==7
    summary={
        "schema":"AO_SACRED_ART_B29_SELECTED_ORIGINAL_SHA_CORRECTION_V1",
        "source_workflow_run_id":RUN_ID,
        "source_archive_tag":ARCHIVE_TAG,
        "historical_checksum_interpretation":"The selected-photo hash is in gallery photos[].key component 3 and workbook selected_photo_expected_sha256; the separate gallery photos[].sha256 is NOT the selected download byte SHA.",
        "forensically_verified_exact_selected_originals":7,
        "original_source_bytes_verified":sum(int(x["source_original_width"])>0 for x in results),
        "total_selected_image_bytes":sum(int(x["acquired_bytes"]) for x in old),
        "technical_resolution_pass":sum(x["resolution_gate"]=="LONG_EDGE_2400_PASS" for x in results),
        "resolution_review_held":sum(x["resolution_gate"]=="RESOLUTION_REVIEW" for x in results),
        "remaining_P0_legacy_artworks_without_recovered_selected_bytes":57,
        "new_publication_approvals":0,
        "new_editorial_approvals":0,
        "previous_B27_catalogue_legacy_only_count":108,
        "B29_selected_photo_technical_recovery_count":7,
        "catalogue_frozen_decisions_unchanged":True,
        "copyright_and_object_identity_approval":"NOT_GRANTED",
        "files":results,
    }
    OUT.mkdir(parents=True,exist_ok=True)
    with (OUT/"sacred-art-b29-selected-exact7-corrected.csv").open("w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=list(results[0]))
        w.writeheader();w.writerows(results)
    (OUT/"sacred-art-b29-selected-exact7-corrected.summary.json").write_text(json.dumps(summary,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print("B29_HISTORIC_ORIGINAL_SHA_RECONCILED",json.dumps({k:v for k,v in summary.items() if k!="files"}),flush=True)

if __name__=="__main__":
    main()
