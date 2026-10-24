#!/usr/bin/env python3
"""B34 preserve unique existing P1/P2 source photos, never replace frozen art."""
import csv,hashlib,json,time
from pathlib import Path
from datetime import datetime,timezone
from PIL import Image
from sacred_art_b29_exact_selected import metadata_for,retrieve

DATA=Path("data/research")
OUT=Path("artifacts/sacred-art-b34-source35")
RIGHTS={"Public domain":{"Public domain","CC0","PD-old","PD-old-100","PD-Art"},
        "CC0":{"CC0","Public domain"},
        "CC BY-SA 4.0":{"CC BY-SA 4.0"},"CC BY 3.0":{"CC BY 3.0"},
        "CC BY 4.0":{"CC BY 4.0"}}
FIELDS=["artwork_id","title","frozen_decision","historically_selected_photo",
        "photo_key_sha256","source_page","source_original_url",
        "recorded_license","current_commons_license","current_license_url",
        "downloaded_sha256","original_bytes","width","height",
        "resolution_gate","status","hold_reason",
        "selected_photo_promoted","publication_approved","source_archive_required"]
def main():
 j=json.loads((DATA/"sacred-art-b34-74-bulk-source-gates.json").read_text())
 assert j["summary"]["artworks"]==74 and j["summary"]["legacy"]==44 and j["summary"]["image_less"]==30
 originals=[r for r in j["legacy_photo_gates"] if r["status"]=="SOURCE_RESEARCH_ELIGIBLE"]
 assert len(originals)==36
 unique={}
 for r in originals:
  sha=r["expected_original_sha256"]
  if sha in unique:
   older=unique[sha]
   assert r["artwork_id"]==older["artwork_id"]
   assert r["source_page"]==older["source_page"] and r["source_file_url"]==older["source_file_url"]
  else:unique[sha]=r
 assert len(unique)==35
 OUT.mkdir(parents=True,exist_ok=True)
 (OUT/"originals").mkdir(exist_ok=True)
 Image.MAX_IMAGE_PIXELS=200_000_000
 results=[];stored=0
 for r in sorted(unique.values(),key=lambda x:x["artwork_id"]+"|"+x["expected_original_sha256"]):
  entry={key:"" for key in FIELDS}
  entry.update(artwork_id=r["artwork_id"],title=r["title"],frozen_decision=r["frozen_decision"],
   historically_selected_photo="YES" if r["selected_photo"] else "NO",
   photo_key_sha256=r["expected_original_sha256"],source_page=r["source_page"],
   source_original_url=r["source_file_url"],recorded_license=r["recorded_license"],
   selected_photo_promoted="NO",publication_approved="NO",source_archive_required="YES")
  d=None
  try:
   m=metadata_for(r["source_page"])
   entry["current_commons_license"]=m["license_short_name"]
   entry["current_license_url"]=m["license_url"]
   if m["license_short_name"] not in RIGHTS.get(r["recorded_license"],set()):
    raise ValueError("Current file-level Commons licence not compatible with recorded claim")
   if m["mime"] not in {"image/jpeg","image/png","image/tiff","image/webp"}:
    raise ValueError("Expected an image on Commons")
   if not m["original_url"].startswith("https://upload.wikimedia.org/wikipedia/commons/"):
    raise ValueError("Current canonical Commons source location not expected")
   ext=Path(r["source_file_url"].split("?")[0]).suffix.lower()
   if ext not in {".jpg",".jpeg",".png",".webp",".tif",".tiff"}:ext=".image"
   d=OUT/"originals"/(hashlib.sha256(r["artwork_id"].encode()).hexdigest()[:18]+"-"+r["expected_original_sha256"][:14]+ext)
   checksum,size=retrieve(r["source_file_url"],d,min(250_000_000,1_500_000_000-stored))
   entry["downloaded_sha256"]=checksum;entry["original_bytes"]=size
   if checksum!=r["expected_original_sha256"]:
    raise ValueError("Historical gallery key SHA mismatch: no silent replacement")
   with Image.open(d) as image:image.verify()
   with Image.open(d) as image:w,h=image.size
   entry["width"]=w;entry["height"]=h
   if (w,h)!=(int(r["width"]),int(r["height"])):
    raise ValueError("File dimensions differ from historic source metadata")
   stored+=size
   entry["resolution_gate"]="LONG_EDGE_2400_PASS" if max(w,h)>=2400 else "RESOLUTION_REVIEW"
   entry["status"]="EXACT_SOURCE_BYTES_RECOVERED_RESEARCH_ONLY"
  except Exception as exc:
   if d:d.unlink(missing_ok=True)
   entry["status"]="SOURCE_HOLD_NO_FILE"
   entry["hold_reason"]=type(exc).__name__+": "+str(exc)[:290]
  results.append(entry)
  print("B34_FILE",entry["artwork_id"],entry["status"],entry["hold_reason"],flush=True)
  time.sleep(.5)
 success=[x for x in results if x["status"]=="EXACT_SOURCE_BYTES_RECOVERED_RESEARCH_ONLY"]
 assert len(results)==35 and len(list((OUT/"originals").iterdir()))==len(success)
 with (OUT/"source-results.csv").open("w",newline="",encoding="utf-8") as f:
  writer=csv.DictWriter(f,fieldnames=FIELDS);writer.writeheader();writer.writerows(results)
 summary={"schema":"AO_B34_35_UNIQUE_LOWER_PRIORITY_LEGACY_SOURCE_FILES_V1",
          "recorded_photo_placements":36,"distinct_file_sha_candidates":35,
          "source_files_recovered":len(success),"unrecovered_holds":35-len(success),
          "verified_new_bytes":stored,"technical_2400_pass":sum(x["resolution_gate"]=="LONG_EDGE_2400_PASS" for x in success),
          "resolution_review":sum(x["resolution_gate"]=="RESOLUTION_REVIEW" for x in success),
          "historically_selected_artworks_with_newly_recovered_files":len({x["artwork_id"] for x in success if x["historically_selected_photo"]=="YES"}),
          "frozen_editorial_choices_modified":False,
          "publication_rights_granted":0,"editorial_approvals_created":0,
          "archive_release_mandatory":True,"checked_utc":datetime.now(timezone.utc).isoformat()}
 (OUT/"source-summary.json").write_text(json.dumps(summary,indent=2)+"\n")
 print("B34_BULK35",json.dumps(summary),flush=True)
if __name__=="__main__":main()
