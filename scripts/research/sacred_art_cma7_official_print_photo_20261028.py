#!/usr/bin/env python3
"""Verify exactly seven CMA CC0 print-JPEG records; avoid enormous TIFF downloads."""
import csv,hashlib,io,json,time,urllib.request,urllib.parse,urllib.error
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/"data/calendar/sacred-art-bulk-approved-107-photo-gates-20261028.csv"
OUT=ROOT/"artifacts/sacred-art-cma7-print-check"
OUT.mkdir(parents=True,exist_ok=True)
from PIL import Image
UA="AdOrientemFreeSacredArtResearch/1.0 (https://github.com/Fulcanelli13/ad-orientem; source-only research)"
def fetch(url,limit=18*1024*1024):
 req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"application/json,image/jpeg,*/*"})
 with urllib.request.urlopen(req,timeout=48) as r:
  q=urllib.parse.urlsplit(r.geturl())
  if q.scheme!="https" or q.hostname not in ("openaccess-api.clevelandart.org","openaccess-cdn.clevelandart.org"):
   raise ValueError("UNTRUSTED_HOST:"+str(q.hostname))
  content=bytearray()
  while True:
   b=r.read(131072)
   if not b:return bytes(content)
   content.extend(b)
   if len(content)>limit:raise ValueError("MAX_PRINT_JPEG_SIZE_LIMIT")
def main():
 with SRC.open(encoding="utf8",newline="") as f:recs=[r for r in csv.DictReader(f) if r["source_gate"]=="A6_EXACT_FILE_RIGHTS_EVIDENCE_PENDING" and r["artwork_id"].startswith("cma-")]
 assert len(recs)==7
 records=[]
 for i,z in enumerate(recs,1):
  num=z["artwork_id"].split("-")[1]
  row={"rank":i,"artwork_id":z["artwork_id"],"title":z["title"],"institution_object_id":num,
       "archive_image_sha256":z["source_image_archive_sha256"],"archived_dimensions":[int(z["archived_image_width"]),int(z["archived_image_height"])],
       "publication_authorized":False,"complete_framefree_certified":False}
  try:
   j=json.loads(fetch(f"https://openaccess-api.clevelandart.org/api/artworks/{num}",3*1024*1024))["data"]
   row["object_id_matched"]=str(j["id"])==num
   row["museum_title"]=j.get("title")
   row["museum_artist"]=j.get("creators")
   row["license_flag"]=j.get("share_license_status")
   row["license_CC0"]=str(j.get("share_license_status","")).lower()=="cc0"
   row["exact_original_museum_accession"]=j.get("accession_number")
   row["museum_object_page"]=j.get("museum_url")
   images=j.get("images") or {}
   jpg=(images.get("print") or {}).get("url")
   if not jpg or not jpg.lower().endswith(".jpg") or not row["license_CC0"]:
    row["source_state"]="NO_CC0_PRINT_JPEG_IN_OFFICIAL_API"
   else:
    row["official_print_url"]=jpg
    try:
     data=fetch(jpg)
     row["downloaded_bytes"]=len(data)
     row["downloaded_sha256"]=hashlib.sha256(data).hexdigest()
     with Image.open(io.BytesIO(data)) as img:
      row["jpeg_dimensions"]=list(img.size)
      row["jpeg_format"]=img.format
      row["jpeg_icc_present"]=bool(img.info.get("icc_profile"))
     row["matches_prior_archived_sha256"]=row["downloaded_sha256"]==row["archive_image_sha256"]
     row["matches_prior_archived_dimensions"]=row["jpeg_dimensions"]==row["archived_dimensions"]
     row["source_state"]="OFFICIAL_CC0_JPEG_BYTES_VERIFIED"
    except Exception as e:
     row["source_state"]="PRINT_JPEG_DOWNLOAD_FAILED"
     row["error"]=type(e).__name__+":"+str(e)[:220]
  except Exception as e:
   row["source_state"]="OBJECT_API_FAILED"
   row["error"]=type(e).__name__+":"+str(e)[:220]
  records.append(row)
  (OUT/"records.json").write_text(json.dumps({"schema":"AO_CMA7_OFFICIAL_PRINT_JPEG_V1","records":records},indent=2)+"\n")
  print("AO_CMA7_RESULT",i,num,row["source_state"],"CC0",row.get("license_CC0"),"SHA_Match",row.get("matches_prior_archived_sha256"),flush=True)
  time.sleep(1.7)
 summary={"count":len(records),"exact_object_ids":sum(x.get("object_id_matched",False) for x in records),
  "cc0_objects":sum(x.get("license_CC0",False) for x in records),
  "official_print_jpegs_downloaded":sum(x.get("source_state")=="OFFICIAL_CC0_JPEG_BYTES_VERIFIED" for x in records),
  "historical_archive_byte_sha_matches":sum(x.get("matches_prior_archived_sha256",False) for x in records),
  "dimensions_match_historical":sum(x.get("matches_prior_archived_dimensions",False) for x in records),
  "publication_certified":0,"euro_spent":0,
  "notes":"Official print JPEGs are exact CMA license-stamped photo versions; do not confuse with full TIFF masters. Different SHA/dimensions represent file variants, not identity mismatches."}
 (OUT/"summary.json").write_text(json.dumps(summary,indent=2)+"\n")
 print("AO_CMA7_SUMMARY",json.dumps(summary,sort_keys=True),flush=True)
 if summary["official_print_jpegs_downloaded"]==0:raise SystemExit(2)
if __name__=="__main__":main()
