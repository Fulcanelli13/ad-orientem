#!/usr/bin/env python3
"""B32: research-only acquisition of 15 institutionally-correlated P0 photo leads.

OBJECT_CORROBORATED means original art object or series record exists, NOT that
its Commons photo has been independently certified as the chosen reproduction.
Physical files are preserved as research-only originals in draft GitHub Releases.
Never use these files as automatic replacements of frozen editorial selections.
"""
import csv
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import time
from urllib.parse import urlsplit

from PIL import Image, ImageFile
from sacred_art_b29_exact_selected import metadata_for, retrieve

DATA=Path("data/research")
OUTPUT=Path("artifacts/b32-fifteen-provisional-research-files")
RIGHTS={"Public domain":{"Public domain","PD-old","PD-old-100","PD-Art","CC0"},
        "CC BY-SA 3.0":{"CC BY-SA 3.0"},"CC BY-SA 4.0":{"CC BY-SA 4.0"},
        "CC0":{"CC0","Public domain"}}
SUPPORT={"OBJECT_CORROBORATED_PHOTO_HOLD","SERIES_CORROBORATED_PHOTO_HOLD"}
MAX_BYTES=1_000_000_000
FIELDNAMES=[
 "artwork_id","title","frozen_decision","institution","institution_object_id",
 "identity_evidence_url","candidate_source_page","recorded_gallery_sha256",
 "current_download_sha256","original_file_url","recorded_license","current_license",
 "file_length_bytes","width","height","technical_resolution_gate",
 "candidate_photo_identity_certified","editorial_selected","publication_reuse_approved",
 "source_status","failure","archive_required"
]
def rows(path):
 with (DATA/path).open(newline="",encoding="utf-8") as f:
  return list(csv.DictReader(f))

def main():
 queue=rows("sacred-art-b32-fifteen-provisional-source-queue.csv")
 assert len(queue)==15 and len({r["artwork_id"] for r in queue})==15
 assert all(r["B32_evidence_disposition"] in SUPPORT for r in queue)
 assert all(r["photographic_object_identity_certified"]=="NO" and
            r["automatic_editorial_promotion"]=="NO" and
            r["publication_reuse_approved"]=="NO" for r in queue)
 source=json.loads((DATA/"sacred-art-b29-p0-64-all-81-photo-variants.json").read_text(encoding="utf-8"))
 assert source["artwork_records"]==64 and source["photo_variants"]==81
 byId={r["artwork_id"]:r for r in source["rows"]}
 previous=rows("sacred-art-b31-29-candidate-results.csv")
 assert len(previous)==29
 oldHashes={r["original_file_sha256_measured"].lower() for r in previous}
 oldHashes|={r["sha256"].lower() for r in rows("sacred-art-b27-physical-image-inventory.csv")}
 oldHashes|={r["download_sha256"].lower() for r in rows("sacred-art-b30-six-selected-acquisition.csv")}
 b29=json.loads((DATA/"sacred-art-b29-selected-exact7-corrected.summary.json").read_text())
 oldHashes|={r["recovered_original_sha256"] for r in b29["files"]}
 hashes={r["existing_candidate_gallery_sha256"] for r in queue}
 assert len(hashes)==15 and not hashes & oldHashes,"Refusing duplicate archival bytes"
 assert not {r["artwork_id"] for r in queue} & {
     "ART-usepe-de-ibera-aint-eter-postolate",
     "G25-003",
     "ART-iandomenico-iepolo-an-olo-ia-rucis-tation-12-eath-on-the-ross",
     "ART-uido-eni-usannah-and-the-lders"}
 OUTPUT.mkdir(parents=True,exist_ok=True)
 (OUTPUT/"originals").mkdir(exist_ok=True)
 Image.MAX_IMAGE_PIXELS=200_000_000
 ImageFile.LOAD_TRUNCATED_IMAGES=False
 output=[]
 byte_count=0
 for r in sorted(queue,key=lambda a:a["artwork_id"]):
  id=r["artwork_id"]
  assert byId[id]["selected_historical_source_original_sha256"] is None
  hashExpected=r["existing_candidate_gallery_sha256"]
  assert re.fullmatch("[0-9a-f]{64}",hashExpected)
  assert hashExpected==r["existing_candidate_gallery_sha256"]
  p=byId[id]["photo_variants"]
  assert len(p)==1
  variant=p[0]
  assert variant["candidate_original_file_sha256_from_gallery_key"]==hashExpected
  assert variant["source_page"]==r["existing_candidate_commons_page"]
  assert variant["original_url"]==r["existing_candidate_original_url"]
  result={key:"" for key in FIELDNAMES}
  result.update({
    "artwork_id":id,"title":r["title"],"frozen_decision":r["frozen_decision"],
    "institution":r["institution"],"institution_object_id":r["institution_object_id"],
    "identity_evidence_url":r["institution_source_url"],
    "candidate_source_page":variant["source_page"],
    "recorded_gallery_sha256":hashExpected,
    "original_file_url":variant["original_url"],
    "recorded_license":r["previous_current_license_claim"],
    "candidate_photo_identity_certified":"NO","editorial_selected":"NO",
    "publication_reuse_approved":"NO","archive_required":"YES"})
  parsed=urlsplit(variant["original_url"])
  suffix=Path(parsed.path).suffix.lower()
  if suffix not in {".jpg",".jpeg",".png",".webp",".tif",".tiff"}: suffix=".image"
  filename=hashlib.sha256(id.encode()).hexdigest()[:20]+"-"+hashExpected[:18]+suffix
  dest=OUTPUT/"originals"/filename
  try:
   current=metadata_for(variant["source_page"])
   result["current_license"]=current["license_short_name"]
   if current["license_short_name"] not in RIGHTS.get(result["recorded_license"],set()):
    raise ValueError("Current Commons license not compatible with B29 research claim")
   if current["mime"] not in {"image/jpeg","image/png","image/webp","image/tiff"}:
    raise ValueError("Unexpected MIME of recorded historical Commons file")
   if not current["original_url"].startswith("https://upload.wikimedia.org/wikipedia/commons/"):
    raise ValueError("Commons metadata original source not an accepted CDN URL")
   sha,size=retrieve(variant["original_url"],dest,min(220_000_000,MAX_BYTES-byte_count))
   result.update(current_download_sha256=sha,file_length_bytes=size)
   if sha!=hashExpected:
    raise ValueError("Downloaded original file does not match saved exact gallery-byte hash")
   with Image.open(dest) as f:f.verify()
   with Image.open(dest) as f:width,height=f.size
   result.update(width=width,height=height)
   if (width,height)!=(int(variant["width"]),int(variant["height"])):
    raise ValueError("Saved provenance image dimensions do not match downloaded bytes")
   byte_count+=size
   result["technical_resolution_gate"]="LONG_EDGE_2400_PASS" if max(width,height)>=2400 else "RESOLUTION_REVIEW"
   result["source_status"]="EXACT_TECHNICAL_RESEARCH_FILE_ARCHIVED_PENDING_PHOTO_IDENTITY"
  except Exception as ex:
   dest.unlink(missing_ok=True)
   result["source_status"]="SOURCE_HOLD_NOT_ACQUIRED"
   result["failure"]=type(ex).__name__+": "+str(ex)[:300]
  output.append(result)
  print("B32_SOURCE",id,result["source_status"],result["failure"],flush=True)
  time.sleep(0.6)
 assert len(output)==15
 successful=[r for r in output if r["source_status"]=="EXACT_TECHNICAL_RESEARCH_FILE_ARCHIVED_PENDING_PHOTO_IDENTITY"]
 assert len(list((OUTPUT/"originals").iterdir()))==len(successful)
 with (OUTPUT/"acquisition-results.csv").open("w",encoding="utf-8",newline="") as f:
  w=csv.DictWriter(f,fieldnames=FIELDNAMES);w.writeheader();w.writerows(output)
 summary={
  "schema":"AO_SACRED_ART_B32_15_SOURCE_OBJECT_RESEARCH_ORIGINALS_V1",
  "source_artwork_candidates":15,
  "exact_technical_research_source_files":len(successful),
  "source_holds":len(output)-len(successful),
  "source_bytes_acquired":byte_count,
  "long_edge_2400_pass":sum(r["technical_resolution_gate"]=="LONG_EDGE_2400_PASS" for r in successful),
  "resolution_review_hold":sum(r["technical_resolution_gate"]=="RESOLUTION_REVIEW" for r in successful),
  "institutional_object_evidence_present":15,
  "physical_photo_object_identity_certified":0,
  "editorial_selections_approved":0,
  "publication_reuse_approvals":0,
  "frozen_451_catalogue_unchanged":True,
  "research_only_release_archive_required":True,
  "checked_utc":datetime.now(timezone.utc).isoformat()
 }
 (OUTPUT/"acquisition-summary.json").write_text(json.dumps(summary,indent=2)+"\n")
 print("B32_15_SOURCE_RESEARCH_RESULT",json.dumps(summary),flush=True)

if __name__=="__main__":main()
