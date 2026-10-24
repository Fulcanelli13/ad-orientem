#!/usr/bin/env python3
"""B35: download only Kress K2016 and K2017 official PD photos (research only).

Require exact institutional K number + Public Domain on official object page,
specific pinned Kress download host/path, decodable JPEG, verified SHA256,
and independent unpublished Release archive before acquisition success.
Never auto-select the photos for Ad Orientem or publish app assets.
"""
import csv,hashlib,json,re,time
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.parse import urlsplit
from datetime import datetime,timezone
from PIL import Image

DATA=Path("data/research")
OUT=Path("artifacts/b35-kress2-public-domain")
SOURCE=DATA/"sacred-art-b35-kress-two-object-open-image-leads.json"
AGENT="AdOrientemSacredArtResearch/2026 (+https://github.com/Fulcanelli13/ad-orientem)"
FIELD=["artwork_id","K_number","source_object_page","source_image_url","rights_text_status",
       "download_sha256","download_bytes","width","height","resolution_gate",
       "source_state","hold_reason","image_publication_approved",
       "editorial_image_selected","draft_archival_copy_required"]
def req(url,accept):
 if not url.startswith("https://"):raise ValueError("only https")
 return urlopen(Request(url,headers={"User-Agent":AGENT,"Accept":accept,"Accept-Encoding":"identity"}),timeout=90)
def main():
 j=json.loads(SOURCE.read_text(encoding="utf-8"));a=j["records"]
 assert len(a)==2 and {x["K_number"] for x in a}=={"K2016","K2017"}
 assert j["publication_approvals_created"]==0 and not j["artwork_selection_changed"]
 OUT.mkdir(parents=True,exist_ok=True);(OUT/"originals").mkdir(exist_ok=True)
 Image.MAX_IMAGE_PIXELS=200_000_000
 results=[];acquired=0;tot=0
 for x in a:
  row=dict.fromkeys(FIELD,"")
  row.update(artwork_id=x["artwork_id"],K_number=x["K_number"],
       source_object_page=x["institution_object_page"],source_image_url=x["official_download_url"],
       image_publication_approved="NO",editorial_image_selected="NO",
       draft_archival_copy_required="YES")
  dest=OUT/"originals"/(x["K_number"].lower()+".jpg")
  try:
   objectUrl=urlsplit(x["institution_object_page"])
   blobUrl=urlsplit(x["official_download_url"])
   if objectUrl.hostname!="www.kressfoundation.org" or blobUrl.hostname!="bmmweb.blob.core.windows.net":
    raise ValueError("Not the exact Kress institution/source CDN")
   if blobUrl.path!="/kress/"+x["K_number"].lower()+"_"+("3222_001" if x["K_number"]=="K2016" else "3223_001")+".jpg":
    raise ValueError("Kress accession original source path does not match approved source manifest")
   with req(x["institution_object_page"],"text/html") as stream:
    body=stream.read(3_000_000).decode("utf-8",errors="replace")
   if not re.search(r"\bPublic\s*Domain\b",body,re.IGNORECASE) or x["K_number"] not in body:
    raise ValueError("Object page does not currently identify this K number as Public Domain")
   row["rights_text_status"]="CURRENT_KRESS_ITEM_SPECIFIC_PUBLIC_DOMAIN"
   size=0;sha=hashlib.sha256()
   with req(x["official_download_url"],"image/jpeg,application/octet-stream") as stream, dest.open("wb") as f:
    if stream.status!=200:raise ValueError("Non-200 Kress image")
    for chunk in iter(lambda:stream.read(1024*1024),b""):
     size+=len(chunk)
     if size>250_000_000:raise ValueError("Per-file byte limit")
     sha.update(chunk);f.write(chunk)
   if size<10000:raise ValueError("Unreasonably small artwork image")
   with Image.open(dest) as im:
    im.verify()
   with Image.open(dest) as im:
    width,height=im.size
    if im.format!="JPEG":raise ValueError("Image format not JPEG")
   row.update(download_sha256=sha.hexdigest(),download_bytes=size,
      width=width,height=height,
      resolution_gate=("LONG_EDGE_2400_PASS" if max(width,height)>=2400 else "RESOLUTION_REVIEW"),
      source_state="EXACT_INSTITUTION_PUBLIC_DOMAIN_IMAGE_ARCHIVED_RESEARCH_ONLY")
   acquired+=1;tot+=size
  except Exception as err:
   dest.unlink(missing_ok=True)
   row.update(source_state="SOURCE_HOLD_NOT_ACQUIRED",hold_reason=type(err).__name__+": "+str(err)[:300])
  results.append(row)
  print("B35_KRESS",row["artwork_id"],row["source_state"],row["hold_reason"],flush=True)
  time.sleep(.5)
 assert len(results)==2 and len(list((OUT/"originals").iterdir()))==acquired
 with (OUT/"source-results.csv").open("w",encoding="utf-8",newline="") as f:
  w=csv.DictWriter(f,fieldnames=FIELD);w.writeheader();w.writerows(results)
 summary={"schema":"AO_B35_TWO_EXACT_KRESS_INSTITUTION_PD_SOURCES_V1",
  "Kress_objects_checked":2,"exact_PD_photo_source_recovered":acquired,
  "held":2-acquired,"source_bytes_recovered":tot,
  "technical_2400_pass":sum(x["resolution_gate"]=="LONG_EDGE_2400_PASS" for x in results),
  "resolution_review_hold":sum(x["resolution_gate"]=="RESOLUTION_REVIEW" for x in results),
  "editorial_selected":0,"publication_approved":0,"frozen_catalogue_modified":False,
  "source_license_basis":"Individual Kress object pages Public Domain and Kress collection FAQ on free reuse",
  "unpublished_release_archive_required":True,
  "checked_utc":datetime.now(timezone.utc).isoformat()}
 (OUT/"source-summary.json").write_text(json.dumps(summary,indent=2)+"\n")
 print("B35_KRESS_SUMMARY",json.dumps(summary),flush=True)
if __name__=="__main__":main()
