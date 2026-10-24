#!/usr/bin/env python3
"""B31: bulk research-only acquisition of 29 already-recorded unselected art photos.

Guards:
 * Input is the B30 fixed 51-row P0 exceptions list, never new fuzzy matches.
 * Exactly 29 distinct B29 metadata-supported source candidates.
 * Excludes hashes already preserved in B19-B30 sources.
 * Rechecks live Commons file-level licence metadata.
 * Downloads recorded CDN original only, verifies the *gallery photo-key*
   historical byte SHA256 and image decodability, checks recorded dimensions.
 * Saves only technical research files to a private unpublished draft Release
   via a mandatory later workflow step, never to production or app assets.
 * Cannot create editorial, copyright, identity, or selected-photo approvals.
"""
from collections import Counter
import csv
import hashlib
import json
from pathlib import Path
import re
from urllib.parse import urlsplit
from datetime import datetime, timezone
import time

from PIL import Image, ImageFile
from sacred_art_b29_exact_selected import metadata_for, retrieve

R=Path("data/research")
OUT=Path("artifacts/b31-29-existing-original-candidates")
EXPECTED_COUNT=29
ALLOWED_LICENSES={
 "Public domain":{"Public domain","PD-Art","PD-old","PD-old-100","CC0"},
 "CC0":{"CC0","Public domain"},
 "CC BY-SA 3.0":{"CC BY-SA 3.0"},
 "CC BY-SA 4.0":{"CC BY-SA 4.0"},
}
IMAGE_EXTENSIONS={".jpg",".jpeg",".png",".webp",".tiff",".tif"}
MAX_SINGLE_BYTES=220_000_000
MAX_BATCH_BYTES=1_300_000_000
HEX64=re.compile(r"^[0-9a-f]{64}$")
FIELDNAMES=[
 "artwork_id","title","artist","frozen_decision","selected_photo_sha_in_register",
 "source_candidate_sha_from_gallery_photo_key","candidate_source_page",
 "candidate_original_url","candidate_metadata_license","current_metadata_license",
 "current_metadata_license_url","identity_basis","source_identity_not_selected",
 "original_file_sha256_measured","bytes_measured","expected_long_edge",
 "actual_width","actual_height","resolution_gate","file_content_valid",
 "original_technical_status","exception_detail","research_only",
 "publication_approved","editorial_selected","original_artwork_provenance_approved",
 "archive_required","checked_utc"
]

def csvrows(filename):
    with (R/filename).open(encoding="utf-8",newline="") as stream:
        return list(csv.DictReader(stream))

def sha_digest(files):
    return {f["sha256"].lower() for f in files if f.get("sha256")}

def source_hash_set():
    physical=csvrows("sacred-art-b27-physical-image-inventory.csv")
    assert len(physical)==290
    first=json.loads((R/"sacred-art-b29-selected-exact7-corrected.summary.json").read_text(encoding="utf-8"))
    assert first["forensically_verified_exact_selected_originals"]==7
    second=csvrows("sacred-art-b30-six-selected-acquisition.csv")
    assert len(second)==6 and all(s["acquisition_status"]=="HISTORIC_SELECTED_ORIGINAL_BYTES_VERIFIED_IDENTITY_HOLD" for s in second)
    return ({row["sha256"].lower() for row in physical} |
            {r["recovered_original_sha256"].lower() for r in first["files"]} |
            {r["download_sha256"].lower() for r in second})

def main():
    queue=csvrows("sacred-art-b30-remaining51-p0-acquisition-gates.csv")
    assert len(queue)==51 and len({r["artwork_id"] for r in queue})==51
    candidates=[r for r in queue if r["disposition"]=="EXACT_SOURCE_CANDIDATE_NOT_FROZEN_SELECTED"]
    assert len(candidates)==EXPECTED_COUNT
    assert all(r["frozen_historical_editorial_choice_preserved"]=="YES" and
               r["new_candidate_as_approved_selected_original"]=="NO" and
               r["publication_rights_approved"]=="NO" and
               r["historically_selected_original_sha256"]=="UNRECORDED"
               for r in candidates)
    assert all(r["identity_basis"]=="EXISTING_OBJECT_LINKED_FILE" for r in candidates)
    assert len({r["candidate_original_sha_from_gallery_key"] for r in candidates})==EXPECTED_COUNT

    gallery=json.loads((R/"sacred-art-b29-p0-64-all-81-photo-variants.json").read_text(encoding="utf-8"))
    assert gallery["artwork_records"]==64 and gallery["photo_variants"]==81
    by_id={r["artwork_id"]:r for r in gallery["rows"]}
    previously_archived=source_hash_set()
    assert not {r["candidate_original_sha_from_gallery_key"] for r in candidates} & previously_archived, \
        "One or more candidate byte-shas already preserved by earlier waves. Do not duplicate storage."

    OUT.mkdir(parents=True,exist_ok=True)
    images=OUT/"originals"
    images.mkdir(exist_ok=True)
    Image.MAX_IMAGE_PIXELS=200_000_000
    ImageFile.LOAD_TRUNCATED_IMAGES=False
    items=[]
    byte_budget=MAX_BATCH_BYTES
    for record in sorted(candidates,key=lambda r:r["artwork_id"]):
        id=record["artwork_id"]
        expected=record["candidate_original_sha_from_gallery_key"].lower()
        assert HEX64.fullmatch(expected)
        assert record["candidate_photo_key"].split("|")[1:3]==[id,expected]
        assert id in by_id
        assert by_id[id]["selected_historical_source_original_sha256"] is None
        original=[p for p in by_id[id]["photo_variants"] if
                  p["candidate_original_file_sha256_from_gallery_key"]==expected]
        assert len(original)==1 and original[0]["original_url"]==record["candidate_original_url"]
        assert original[0]["source_page"]==record["candidate_source_page"]
        assert original[0]["selected_historical_preview_sha_match"] is False

        result={k:"" for k in FIELDNAMES}
        result.update({
          "artwork_id":id,"title":record["title"],"artist":record["artist"],
          "frozen_decision":record["frozen_decision"],
          "selected_photo_sha_in_register":"UNRECORDED",
          "source_candidate_sha_from_gallery_photo_key":expected,
          "candidate_source_page":record["candidate_source_page"],
          "candidate_original_url":record["candidate_original_url"],
          "candidate_metadata_license":record["candidate_current_commons_license"],
          "identity_basis":record["identity_basis"],
          "source_identity_not_selected":"YES",
          "research_only":"YES",
          "publication_approved":"NO","editorial_selected":"NO",
          "original_artwork_provenance_approved":"NO",
          "archive_required":"YES",
          "checked_utc":datetime.now(timezone.utc).isoformat(),
          "expected_long_edge":record["candidate_long_edge_px"],
        })
        parsed=urlsplit(record["candidate_original_url"])
        ext=Path(parsed.path).suffix.lower()
        if ext==".jpeg": ext=".jpg"
        if ext not in IMAGE_EXTENSIONS: ext=".image"
        filename=hashlib.sha256(id.encode("utf-8")).hexdigest()[:20]+"-"+expected[:16]+ext
        destination=images/filename
        try:
            meta=metadata_for(record["candidate_source_page"])
            result["current_metadata_license"]=meta["license_short_name"]
            result["current_metadata_license_url"]=meta["license_url"]
            license_set=ALLOWED_LICENSES.get(record["candidate_current_commons_license"],set())
            if meta["license_short_name"] not in license_set:
                raise ValueError("Current Commons file-level rights claim is incompatible")
            if not meta["mime"].startswith("image/"):
                raise ValueError("Wikimedia file metadata is not an image")
            if not meta["original_url"].startswith("https://upload.wikimedia.org/wikipedia/commons/"):
                raise ValueError("Commons canonical original does not resolve to approved image CDN")
            if parsed.hostname not in {"upload.wikimedia.org","thumb.wikimedia.org"} or parsed.scheme!="https":
                raise ValueError("Previous photo file URL is not HTTPS Wikimedia CDN")
            if byte_budget<=0:
                raise ValueError("Batch byte cap exceeded")
            digest,size=retrieve(record["candidate_original_url"],destination,min(MAX_SINGLE_BYTES,byte_budget))
            result["original_file_sha256_measured"]=digest
            result["bytes_measured"]=size
            if digest!=expected:
                raise ValueError("Historical gallery photo-key raw file SHA mismatch: do not substitute")
            with Image.open(destination) as img:
                img.verify()
            with Image.open(destination) as img:
                width,height=img.size
            result["actual_width"],result["actual_height"]=width,height
            if max(width,height)!=int(record["candidate_long_edge_px"]):
                raise ValueError("Expected largest image dimension differs from earlier gallery record")
            # Technical evidence is independent of object attribution or editorial choice.
            result["file_content_valid"]="YES"
            result["resolution_gate"]="LONG_EDGE_2400_PASS" if max(width,height)>=2400 else "RESOLUTION_REVIEW"
            result["original_technical_status"]="EXACT_GALLERY_CANDIDATE_BYTES_VERIFIED_UNSELECTED"
            byte_budget-=size
        except Exception as ex:
            destination.unlink(missing_ok=True)
            result["original_technical_status"]="SOURCE_HOLD_NOT_ACQUIRED"
            result["exception_detail"]=type(ex).__name__+": "+str(ex)[:450]
        items.append(result)
        print("B31_SOURCE",id,result["original_technical_status"],result["exception_detail"],flush=True)
        time.sleep(0.7)
    assert len(items)==EXPECTED_COUNT
    sumbytes=sum(int(r["bytes_measured"]) for r in items if
                 r["original_technical_status"]=="EXACT_GALLERY_CANDIDATE_BYTES_VERIFIED_UNSELECTED")
    n=sum(r["original_technical_status"]=="EXACT_GALLERY_CANDIDATE_BYTES_VERIFIED_UNSELECTED" for r in items)
    assert len(list(images.iterdir()))==n
    with (OUT/"acquisition-results.csv").open("w",encoding="utf-8",newline="") as f:
        writer=csv.DictWriter(f,fieldnames=FIELDNAMES)
        writer.writeheader();writer.writerows(items)
    summary={
       "schema":"AO_SACRED_ART_B31_EXISTING_P0_SOURCE_CANDIDATES_V1",
       "artworks_in_fixed_research_queue":29,
       "source_variant_records":29,
       "physically_recovered_candidate_originals":n,
       "not_acquired_source_holds":EXPECTED_COUNT-n,
       "candidate_original_bytes_acquired":sumbytes,
       "technical_resolution_pass":sum(r["resolution_gate"]=="LONG_EDGE_2400_PASS" for r in items),
       "technical_resolution_hold":sum(r["resolution_gate"]=="RESOLUTION_REVIEW" for r in items),
       "candidate_sha_hash_match_recorded_key":n,
       "selected_historical_originals_promoted":0,
       "new_editorial_approvals":0,
       "new_publication_approvals":0,
       "rights_for_app_publication_approved":False,
       "workbook_frozen_choices_preserved":True,
       "archive_verification_required_before_success":True,
       "separate_identity_check_required":True,
       "source_files_not_in_git":True,
       "summary_status":"RESEARCH_SOURCE_BYTES_ONLY",
    }
    (OUT/"acquisition-summary.json").write_text(json.dumps(summary,indent=2)+"\n",encoding="utf-8")
    print("B31_COMPLETE",json.dumps(summary),flush=True)

if __name__=="__main__":
    main()
