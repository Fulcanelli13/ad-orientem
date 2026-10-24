#!/usr/bin/env python3
"""B39 one precise KMSKA CC0 art-object original source.

File-level Commons rights metadata, original-byte SHA and image dimensions
must all pass. Individual institutional photographer rights, identity
qualification and publication remain held; Correa covers only one face.
"""
import csv, hashlib, json, time
from pathlib import Path
from PIL import Image
from sacred_art_b29_exact_selected import metadata_for,retrieve
R=Path("data/research");O=Path("artifacts/b39-holy-family-two-identity-hold-sources")
FIELDS=["artwork_id","source_page","institutional_evidence","role","expected_dimensions",
"current_commons_license","current_commons_file_url","sha256","bytes","width","height",
"technical_resolution","status","hold_reason","full_artwork_scope_closed",
"file_image_rights_publication_approved","editorial_source_photo_selected"]
def main():
 j=json.loads((R/"sacred-art-b39-two-distinct-rubens-holy-family-commons-leads.json").read_text())
 cand=j["exact_photo_leads"]
 assert len(j["cases"])==1 and len(cand)==2
 assert j["protected_underlying_copyright_cases"]==0
 assert all(not x["publication_approved"] for x in j["cases"])
 O.mkdir(parents=True,exist_ok=True);(O/"originals").mkdir(exist_ok=True)
 Image.MAX_IMAGE_PIXELS=450_000_000
 outcome=[];total=0
 for r in cand:
  x={k:"" for k in FIELDS}
  x.update(artwork_id=r["artwork_id"],source_page=r["file_page"],
    institutional_evidence=r["institutional_object_evidence"],
    role=r["role"],expected_dimensions=str(r["expected_width"])+"x"+str(r["expected_height"]),
    full_artwork_scope_closed="NO" if not r["closing_gap_if_downloaded"] else "PROVISIONAL_RESEARCH_ONLY",
    file_image_rights_publication_approved="NO",editorial_source_photo_selected="NO")
  ext=".jpg"
  dest=O/"originals"/(hashlib.sha256(r["artwork_id"].encode()).hexdigest()[:20]+ext)
  try:
   info=metadata_for(r["file_page"])
   x["current_commons_license"]=info["license_short_name"]
   x["current_commons_file_url"]=info["original_url"]
   if info["license_short_name"] not in {"Public domain","PD-old","PD-old-100","PD-Art","CC0"}:
    raise ValueError("No compatible public-domain Commons claim")
   if info["mime"]!="image/jpeg":raise ValueError("Source file is not JPEG")
   if not info["original_url"].startswith("https://upload.wikimedia.org/wikipedia/commons/"):
    raise ValueError("Source binary not at the official Commons CDN")
   digest,n=retrieve(info["original_url"],dest,70_000_000)
   x["sha256"]=digest;x["bytes"]=n
   with Image.open(dest) as im:im.verify()
   with Image.open(dest) as im:w,h=im.size
   x["width"]=w;x["height"]=h
   if (w,h)!=(r["expected_width"],r["expected_height"]):raise ValueError("Exact candidate original dimensions changed")
   x["technical_resolution"]="LONG_EDGE_2400_PASS" if max(w,h)>=2400 else "RESOLUTION_REVIEW"
   x["status"]="EXACT_OBJECT_RESEARCH_FILE_SHA_VERIFIED_PENDING_RIGHTS"
   total+=n
  except Exception as err:
   dest.unlink(missing_ok=True)
   x["status"]="UNVERIFIED_SOURCE_HOLD_NO_DOWNLOAD"
   x["hold_reason"]=type(err).__name__+": "+str(err)[:300]
  outcome.append(x)
  print("B39_FILE",x["artwork_id"],x["status"],x["hold_reason"],flush=True)
  time.sleep(.5)
 ok=[r for r in outcome if r["status"]=="EXACT_OBJECT_RESEARCH_FILE_SHA_VERIFIED_PENDING_RIGHTS"]
 assert len(outcome)==2 and len(list((O/"originals").iterdir()))==len(ok)
 with (O/"source-results.csv").open("w",newline="",encoding="utf-8") as f:
  writer=csv.DictWriter(f,fieldnames=FIELDS);writer.writeheader();writer.writerows(outcome)
 summary={"schema":"AO_B39_TWO_IDENTITY_HOLD_COMMONS_RESEARCH_FILES_V1",
 "candidate_image_files":2,"source_files_byte_verified":len(ok),"file_download_holds":2-len(ok),
 "new_research_image_bytes_gross":total,
 "technical_2400_pass":sum(r["technical_resolution"]=="LONG_EDGE_2400_PASS" for r in ok),
 "resolution_review":sum(r["technical_resolution"]=="RESOLUTION_REVIEW" for r in ok),
 "provisionally_closed_full_object_file_gaps":sum(r["full_artwork_scope_closed"]=="PROVISIONAL_RESEARCH_ONLY" for r in ok),
 "two_sided_object_one_face_only":any(r["role"]=="ONE_FACE_OF_TWO_SIDED_OBJECT_RESEARCH_PHOTO" for r in ok),
 "publication_approvals":0,"new_editorial_selections":0,"original_catalogue_unchanged":True,
 "unpublished_SHA_verified_archive_required":True}
 (O/"source-summary.json").write_text(json.dumps(summary,indent=2)+"\n")
 print("B39_FOUR_RESULT",json.dumps(summary),flush=True)
if __name__=="__main__":main()
