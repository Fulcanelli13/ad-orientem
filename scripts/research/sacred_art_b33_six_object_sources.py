#!/usr/bin/env python3
"""B33: fetch six exact-object Commons source *candidates*, never editorial assets."""
import csv,hashlib,json,time
from pathlib import Path
from datetime import datetime,timezone
from PIL import Image
from sacred_art_b29_exact_selected import metadata_for,retrieve

R=Path("data/research")
O=Path("artifacts/b33-six-exact-object-candidates")
ALLOWED={"Public domain","CC0","CC BY-SA 3.0","CC BY-SA 4.0","CC BY 4.0","CC BY 3.0"}
FIELD=["artwork_id","institutional_object_id","Commons_file_page","current_Commons_license",
       "original_file_url","downloaded_sha256","bytes_acquired","width","height",
       "resolution_gate","acquisition_status","hold_reason","previous_archive_match",
       "photo_identity_approved","editorial_choice_changed","publication_rights_approved"]
def read(name):
 with (R/name).open(encoding="utf-8",newline="") as f:return list(csv.DictReader(f))
def past_hashes():
 result={}
 for x in read("sacred-art-b27-physical-image-inventory.csv"):result[x["sha256"]]="B27:"+x["file_path"]
 for x in read("sacred-art-b31-29-candidate-results.csv"):
  if x["original_file_sha256_measured"]:result[x["original_file_sha256_measured"]]="B31:"+x["artwork_id"]
 for x in read("sacred-art-b30-six-selected-acquisition.csv"):
  if x["download_sha256"]:result[x["download_sha256"]]="B30:"+x["artwork_id"]
 for x in read("sacred-art-b32-15-source-file-results.csv"):
  if x["source_status"]=="EXACT_TECHNICAL_RESEARCH_FILE_ARCHIVED_PENDING_PHOTO_IDENTITY":
   result[x["current_download_sha256"]]="B32:"+x["artwork_id"]
 b29=json.loads((R/"sacred-art-b29-selected-exact7-corrected.summary.json").read_text())
 for x in b29["files"]:result[x["recovered_original_sha256"]]="B29:"+x["artwork_id"]
 return result
def main():
 evidence=json.loads((R/"sacred-art-b33-seven-case-exact-source-and-two-alias-evidence.json").read_text())
 cases=evidence["new_research_candidate_sources"]
 assert len(cases)==6 and len({x["artwork_id"] for x in cases})==6
 assert len(evidence["remaining_no_source"])==1 and len(evidence["existing_duplicate_SHA_identity_pairs"])==2
 assert not evidence["publication_approvals_created"] and not evidence["editorial_approvals_created"]
 base=json.loads((R/"sacred-art-b32-p0-64-combined-physical-and-legal-gates.json").read_text())
 states={r["artwork_id"]:r["physical_state"] for r in base["rows"]}
 assert all(states[x["artwork_id"]] in {"BLOCKED_WRONG_PHOTO","BLOCKED_IDENTITY","BLOCKED_PHOTO_RIGHTS"} for x in cases)
 old=past_hashes()
 O.mkdir(parents=True,exist_ok=True)
 (O/"originals").mkdir(exist_ok=True)
 Image.MAX_IMAGE_PIXELS=200_000_000
 outcomes=[];total=0
 for c in sorted(cases,key=lambda x:x["artwork_id"]):
  row=dict.fromkeys(FIELD,"")
  row.update(artwork_id=c["artwork_id"],institutional_object_id=c["institutional_object_id"],
    Commons_file_page=c["commons_file_page"],photo_identity_approved="NO",
    editorial_choice_changed="NO",publication_rights_approved="NO")
  dest=None
  try:
   if not c["institutional_record_url"].startswith("https://"):raise ValueError("Missing institution")
   m=metadata_for(c["commons_file_page"])
   row["current_Commons_license"]=m["license_short_name"]
   row["original_file_url"]=m["original_url"]
   if m["license_short_name"] not in ALLOWED:raise ValueError("Commons current licence not eligible for research")
   if m["mime"] not in {"image/jpeg","image/png","image/webp","image/tiff"}:raise ValueError("Non-image MIME")
   if not m["original_url"].startswith("https://upload.wikimedia.org/wikipedia/commons/"):
    raise ValueError("Unsupported original CDN host")
   ext=Path(m["original_url"].split("?")[0]).suffix.lower()
   if ext not in {".jpg",".jpeg",".png",".webp",".tif",".tiff"}:ext=".image"
   dest=O/"originals"/(hashlib.sha256(c["artwork_id"].encode()).hexdigest()[:20]+ext)
   digest,size=retrieve(m["original_url"],dest,min(150_000_000,450_000_000-total))
   row.update(downloaded_sha256=digest,bytes_acquired=size)
   with Image.open(dest) as img:img.verify()
   with Image.open(dest) as img:width,height=img.size
   row.update(width=width,height=height)
   if max(width,height)!=c["expected_long_edge"]:raise ValueError("Original size disagrees with source page")
   if digest in old:
    dest.unlink(missing_ok=True)
    row.update(acquisition_status="EXACT_SHA_ALREADY_ARCHIVED_OTHER_WAVE",previous_archive_match=old[digest])
   else:
    total+=size
    row.update(acquisition_status="NEW_RESEARCH_ORIGINAL_SOURCE_NOT_SELECTED",
               resolution_gate="LONG_EDGE_2400_PASS" if max(width,height)>=2400 else "RESOLUTION_REVIEW")
  except Exception as exc:
   if dest:dest.unlink(missing_ok=True)
   row.update(acquisition_status="HOLD_NOT_ACQUIRED",hold_reason=type(exc).__name__+": "+str(exc)[:260])
  outcomes.append(row)
  print("B33_OBJECT",row["artwork_id"],row["acquisition_status"],row["hold_reason"],flush=True)
  time.sleep(0.6)
 assert len(outcomes)==6
 acquired=[x for x in outcomes if x["acquisition_status"]=="NEW_RESEARCH_ORIGINAL_SOURCE_NOT_SELECTED"]
 assert len(acquired)==len(list((O/"originals").iterdir()))
 with (O/"source-decisions.csv").open("w",encoding="utf-8",newline="") as f:
  w=csv.DictWriter(f,fieldnames=FIELD);w.writeheader();w.writerows(outcomes)
 summary={"schema":"AO_B33_SIX_EXACT_OBJECT_SOURCE_CANDIDATES_V1",
   "research_object_cases":6,"new_source_files_archived":len(acquired),
   "already_in_prior_archive":sum(x["acquisition_status"]=="EXACT_SHA_ALREADY_ARCHIVED_OTHER_WAVE" for x in outcomes),
   "source_holds":sum(x["acquisition_status"]=="HOLD_NOT_ACQUIRED" for x in outcomes),
   "new_source_bytes":total,
   "technical_2400px_pass":sum(x["resolution_gate"]=="LONG_EDGE_2400_PASS" for x in acquired),
   "resolution_review":sum(x["resolution_gate"]=="RESOLUTION_REVIEW" for x in acquired),
   "Prado_P001314_missing_original_held":True,"prior_two_cross_id_alias_holds":2,
   "new_editorial_approvals":0,"new_publication_rights_approvals":0,
   "frozen_catalogue_changed":False,"draft_release_archive_required":True,
   "created_utc":datetime.now(timezone.utc).isoformat()}
 (O/"source-summary.json").write_text(json.dumps(summary,indent=2)+"\n",encoding="utf-8")
 print("B33_SUMMARY",json.dumps(summary),flush=True)
if __name__=="__main__":main()
