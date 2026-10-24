#!/usr/bin/env python3
"""B35 preserve three pre-recorded image originals after exact object corroboration.

Three old gallery original SHA256+dimension locks; institutional accession
links are independent. No image is automatically selected or rights-cleared for
publication by source preservation. Unpublished remote SHA archive mandatory.
"""
import csv,hashlib,json,time
from pathlib import Path
from PIL import Image
from sacred_art_b29_exact_selected import metadata_for,retrieve

ROOT=Path("data/research")
OUT=Path("artifacts/b35-three-institutional-source-originals")
COLS=["artwork_id","title","institution","institution_identifier","official_institution_page",
      "historical_gallery_file_sha256","original_source_page","original_url",
      "source_file_license_current","actual_image_sha256","acquired_bytes",
      "width","height","resolution_gate","acquisition_status","hold_reason",
      "source_object_identity_correlated","specific_photo_publication_approved",
      "editorial_selection_changed"]
def main():
 j=json.loads((ROOT/"sacred-art-b35-3-exact-object-source-correlations.json").read_text())
 refs=j["artworks"]
 assert len(refs)==3 and len({x["artwork_id"] for x in refs})==3
 assert all(x["status"]=="ART_OBJECT_IDENTITY_HOLD" and x["recorded_license"]=="Public domain" for x in refs)
 OUT.mkdir(parents=True,exist_ok=True); (OUT/"originals").mkdir(exist_ok=True)
 Image.MAX_IMAGE_PIXELS=200_000_000
 items=[];total=0;success=0
 for rec in refs:
  row=dict.fromkeys(COLS,"")
  row.update(artwork_id=rec["artwork_id"],title=rec["title"],
    institution=rec["institution"],institution_identifier=rec["identifier"],
    official_institution_page=rec["official_page"],
    historical_gallery_file_sha256=rec["expected_original_sha256"],
    original_source_page=rec["source_page"],original_url=rec["source_file_url"],
    source_object_identity_correlated="YES_OBJECT_ONLY",
    specific_photo_publication_approved="NO",editorial_selection_changed="NO")
  dest=OUT/"originals"/(hashlib.sha256(rec["artwork_id"].encode()).hexdigest()[:20]+".jpg")
  try:
   m=metadata_for(rec["source_page"])
   row["source_file_license_current"]=m["license_short_name"]
   if m["license_short_name"] not in {"Public domain","PD-old","PD-old-100","PD-Art","CC0"}:
    raise ValueError("Current photo licence not compatible with original Public Domain claim")
   if m["mime"] not in {"image/jpeg","image/png","image/webp"}:
    raise ValueError("Current Commons file is not supported image")
   sha,size=retrieve(rec["source_file_url"],dest,75_000_000-total)
   row.update(actual_image_sha256=sha,acquired_bytes=size)
   if sha!=rec["expected_original_sha256"]:
    raise ValueError("Exact original historical SHA256 changed")
   with Image.open(dest) as image:image.verify()
   with Image.open(dest) as image:width,height=image.size
   if (width,height)!=(int(rec["width"]),int(rec["height"])):
    raise ValueError("Historical image dimension mismatch")
   row.update(width=width,height=height,
      resolution_gate="LONG_EDGE_2400_PASS" if max(width,height)>=2400 else "RESOLUTION_REVIEW",
      acquisition_status="EXACT_PREEXISTING_GALLERY_BYTES_ARCHIVED_RESEARCH_ONLY")
   total+=size;success+=1
  except Exception as exc:
   dest.unlink(missing_ok=True)
   row.update(acquisition_status="HOLD_SOURCE_NOT_RECOVERED",hold_reason=type(exc).__name__+": "+str(exc)[:350])
  items.append(row)
  print("B35_EXISTING_EXACT",row["artwork_id"],row["acquisition_status"],row["hold_reason"],flush=True)
  time.sleep(.6)
 assert len(items)==3 and len(list((OUT/"originals").iterdir()))==success
 with (OUT/"source-results.csv").open("w",encoding="utf-8",newline="") as f:
  w=csv.DictWriter(f,fieldnames=COLS);w.writeheader();w.writerows(items)
 summary={"schema":"AO_B35_THREE_INSTITUTION_CORRELATED_ORIGINALS_V1",
    "target_artworks":3,"technically_archived":success,"held":3-success,
    "archived_source_image_bytes":total,
    "technical_2400px_pass":sum(x["resolution_gate"]=="LONG_EDGE_2400_PASS" for x in items),
    "resolution_review_holds":sum(x["resolution_gate"]=="RESOLUTION_REVIEW" for x in items),
    "previous_451_IDs_unchanged":True,
    "publication_rights_approvals":0,"new_selected_source_approvals":0,
    "unpublished_release_SHA_archive_mandatory":True}
 (OUT/"source-summary.json").write_text(json.dumps(summary,indent=2)+"\n")
 print("B35_THREE_ORIGINALS_SUMMARY",json.dumps(summary),flush=True)
if __name__=="__main__":main()
