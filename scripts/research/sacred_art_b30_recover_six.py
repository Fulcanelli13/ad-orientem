#!/usr/bin/env python3
"""B30: recover remaining six exact historical selected originals as research-only.

The original-byte SHA must be found BOTH in the previously saved selection
gallery photo key and in the frozen B28 legacy selected-photo reference.
No editorial identity hold is automatically released by byte recovery.
"""
import csv
import hashlib
import json
from pathlib import Path
from datetime import datetime, timezone
from urllib.parse import urlsplit
import time
from PIL import Image

from sacred_art_b29_exact_selected import metadata_for, retrieve

R=Path("data/research")
OUT=Path("artifacts/b30-selected-six")
IDS={
 "ART-uido-eni-aint-ary-agdalene",
 "ART-ean-on-r-me-he-ge-of-ugustus-irth-of-hrist",
 "ART-ean-estout-entecost",
 "ART-iandomenico-iepolo-an-olo-ia-rucis-tation-02-esus-akes-p-the-ross",
 "ART-iandomenico-iepolo-an-olo-ia-rucis-tation-04-esus-eets-is-other",
 "ART-iovanni-anfranco-iracle-of-oaves-and-ishes",
}
ALLOWED={
 "Public domain":{"Public domain","PD-Art","PD-old","PD-old-100","CC0"},
 "CC BY-SA 3.0":{"CC BY-SA 3.0"},
 "CC BY-SA 4.0":{"CC BY-SA 4.0"},
}
FIELDNAMES=[
 "artwork_id","title","frozen_decision","source_identity_hold",
 "selected_original_sha256","gallery_source_page","source_file_url",
 "source_file_license_claim","current_file_license","current_license_url",
 "expected_width","expected_height","download_sha256","download_bytes",
 "verified_width","verified_height","technical_resolution_gate",
 "acquisition_status","failure","publication_rights_approved",
 "editorial_approval_created","archive_required"
]
def readcsv(name):
 with (R/name).open(encoding="utf-8",newline="") as f:
  return list(csv.DictReader(f))

def main():
 source=json.loads((R/"sacred-art-b29-p0-64-all-81-photo-variants.json").read_text(encoding="utf-8"))
 legacy={r["artwork_id"]:r for r in readcsv("sacred-art-b28-legacy108-master-recovery.csv")}
 preserved=json.loads((R/"sacred-art-b29-selected-exact7-corrected.summary.json").read_text(encoding="utf-8"))
 assert source["artwork_records"]==64 and source["photo_variants"]==81
 assert preserved["forensically_verified_exact_selected_originals"]==7
 recovered_ids={r["artwork_id"] for r in preserved["files"]}
 assert len(IDS)==6 and not IDS.intersection(recovered_ids)
 six={r["artwork_id"]:r for r in source["rows"] if r["artwork_id"] in IDS}
 assert set(six)==IDS
 OUT.mkdir(parents=True,exist_ok=True)
 (OUT/"originals").mkdir(exist_ok=True)
 results=[];total_bytes=0
 for id in sorted(IDS):
  art=six[id]
  sha=art["selected_historical_source_original_sha256"]
  assert len(sha)==64 and sha==legacy[id]["selected_photo_expected_sha256"]
  variants=[p for p in art["photo_variants"] if p["selected_historical_preview_sha_match"] and
            p["candidate_original_file_sha256_from_gallery_key"]==sha]
  assert variants, "Selection digest lost from original photo-key ledger: "+id
  # Multiple gallery placements can point to the SAME original. Require exact
  # source file and dimensions to agree before one physical acquisition.
  identity={(p["source_page"],urlsplit(p["original_url"]).scheme,urlsplit(p["original_url"]).netloc,
             urlsplit(p["original_url"]).path,p["width"],p["height"],p["license_claim"])
            for p in variants}
  assert len(identity)==1, "Different underlying selected source files require human adjudication: "+id
  # Gallery stores original vs thumbnail_unscaled tracking labels; these are query-only,
  # and the verified *byte SHA* and exact underlying CDN path are identical.
  candidate=next((p for p in variants if "utm_content=original" in p["original_url"]),variants[0])
  row={key:"" for key in FIELDNAMES}
  row.update(artwork_id=id,title=art["title"],frozen_decision=art["frozen_decision"],
     source_identity_hold=art["legacy_identity_hold"],selected_original_sha256=sha,
     gallery_source_page=candidate["source_page"],source_file_url=candidate["original_url"],
     source_file_license_claim=candidate["license_claim"],
     expected_width=candidate["width"],expected_height=candidate["height"],
     publication_rights_approved="NO",editorial_approval_created="NO",archive_required="YES")
  destination=OUT/"originals"/(hashlib.sha256(id.encode()).hexdigest()[:20]+"-"+sha[:20]+".jpg")
  try:
   info=metadata_for(candidate["source_page"])
   row.update(current_file_license=info["license_short_name"],
              current_license_url=info["license_url"])
   if info["license_short_name"] not in ALLOWED.get(candidate["license_claim"],set()):
    raise ValueError("Current Commons file-level license differs from recorded claim")
   if not info["mime"].startswith("image/"):
    raise ValueError("Current Commons file is not an image")
   digest,size=retrieve(candidate["original_url"],destination,400_000_000)
   if digest!=sha:
    raise ValueError(f"Exact historical selected ORIGINAL SHA mismatch: expected={sha}; downloaded={digest}")
   Image.MAX_IMAGE_PIXELS=200_000_000
   with Image.open(destination) as im:im.verify()
   with Image.open(destination) as im:width,height=im.size
   if (width,height)!=(int(candidate["width"]),int(candidate["height"])):
    raise ValueError(f"Recorded selected original dimensions mismatch: {width}x{height}")
   total_bytes+=size
   row.update(download_sha256=digest,download_bytes=size,verified_width=width,
      verified_height=height,technical_resolution_gate=("LONG_EDGE_2400_PASS" if max(width,height)>=2400 else "RESOLUTION_REVIEW"),
      acquisition_status="HISTORIC_SELECTED_ORIGINAL_BYTES_VERIFIED_IDENTITY_HOLD")
  except Exception as ex:
   destination.unlink(missing_ok=True)
   row.update(acquisition_status="HOLD_NO_BYTE_RECOVERY",
              failure=type(ex).__name__+": "+str(ex)[:250])
  print("B30_FILE",id,row["acquisition_status"],row["failure"],flush=True)
  results.append(row)
  time.sleep(1.5)
 assert len(results)==6
 with (OUT/"Acquisition_results.csv").open("w",newline="",encoding="utf-8") as f:
  w=csv.DictWriter(f,fieldnames=FIELDNAMES);w.writeheader();w.writerows(results)
 passed=[x for x in results if x["acquisition_status"]=="HISTORIC_SELECTED_ORIGINAL_BYTES_VERIFIED_IDENTITY_HOLD"]
 summary={
   "schema":"AO_B30_P0_REMAINING_SIX_SELECTED_ORIGINALS_V1",
   "target_unique_artworks":len(IDS),"strict_selected_byte_recoveries":len(passed),
   "held_unrecovered":len(results)-len(passed),
   "recovered_source_image_bytes":total_bytes,
   "technical_2400px_pass":sum(x["technical_resolution_gate"]=="LONG_EDGE_2400_PASS" for x in passed),
   "resolution_review":sum(x["technical_resolution_gate"]=="RESOLUTION_REVIEW" for x in passed),
   "historical_selection_and_source_identity_hold_preserved":6,
   "current_file_licence_metadata_checked":sum(bool(x["current_file_license"]) for x in results),
   "historical_selected_source_verification":"exact gallery key component 3, frozen B28 selected SHA and newly downloaded byte SHA",
   "rights_publication_approvals":0,"editorial_approvals_created":0,
   "archive_required":True,"source_corpus_changed":False,
   "created_utc":datetime.now(timezone.utc).isoformat()
 }
 (OUT/"Acquisition_summary.json").write_text(json.dumps(summary,indent=2)+"\n",encoding="utf-8")
 print("B30_SIX_SELECTED_SUMMARY",json.dumps(summary),flush=True)

if __name__=="__main__":
 main()
