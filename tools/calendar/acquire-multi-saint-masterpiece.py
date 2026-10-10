#!/usr/bin/env python3
"""Acquire one high-value, verified original painting picturing multiple documented saints.
No user editorial approval, final phone crop or publication authorization implied.
"""
import hashlib,io,json
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request,urlopen
from PIL import Image,ImageOps
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"artifacts/sacred-art-multi-saint"
OUT.mkdir(parents=True,exist_ok=True)
TITLE="Saints Presenting a Devout Woman to the Virgin and Child"
SOURCE="https://www.clevelandart.org/art/1982.36"
API="https://openaccess-api.clevelandart.org/api/artworks/"
HEAD={"User-Agent":"AdOrientem-1962-SacredArt-Acquisition/1.0","Accept":"application/json,image/jpeg,*/*"}
def get(url,budget=35000000):
 with urlopen(Request(url,headers=HEAD),timeout=45) as res:
  raw=res.read(budget+1)
 if len(raw)>budget:raise ValueError("Source exceeds 35 MB")
 return raw
meta=json.loads(get(API+"?"+urlencode({"q":TITLE,"cc0":"","type":"Painting","has_image":"1","limit":40}),2500000))
hits=[a for a in meta.get("data",[]) if a.get("title","").casefold()==TITLE.casefold()
      and a.get("accession_number")=="1982.36"
      and a.get("share_license_status")=="CC0"
      and a.get("type")=="Painting"]
if len(hits)!=1:
 (OUT/"research-blocker.json").write_text(json.dumps({"title":TITLE,"accession":"1982.36","matches":len(hits),"status":"UNRESOLVED_CMA_METADATA"},indent=2))
 raise ValueError("Official source classification/rights/accession not uniquely verified")
work=hits[0]
url=((work.get("images") or {}).get("print") or {}).get("url") or ""
if not url.startswith("https://openaccess-cdn.clevelandart.org/"):raise ValueError("No official high resolution JPEG")
original=get(url)
with Image.open(io.BytesIO(original)) as im:
 im.load()
 if im.format!="JPEG":raise ValueError("Museum source not JPEG")
 x=ImageOps.exif_transpose(im)
 w,h=x.size
 if max(w,h)<2500:raise ValueError("Actual original below image resolution floor")
 if len(x.getbands())<3:raise ValueError("No RGB colour channels")
sha=hashlib.sha256(original).hexdigest()
(OUT/("cma-"+str(work["id"])+".jpg")).write_bytes(original)
record={"schema":"AO_SACRED_ART_SOURCE_ORIGINAL_V1","status":"ACQUIRED_FOR_RESEARCH_ONLY",
 "id":"cma-"+str(work["id"]),"title":work["title"],
 "artist":"Giovanni Battista Pittoni", "sourceUrl":SOURCE,"sourceApi":API+"?id="+str(work["id"]),
 "sourceRights":"CC0","sourceType":"Painting","width":w,"height":h,
 "originalSha256":sha,"file":"cma-"+str(work["id"])+".jpg",
 "reviewedIconography":{
  "main":"Virgin and Child receiving a devout woman, attended by documented saints",
  "secondarySaintIdentifications":[
   "saint-lucy","saint-agnes","saint-scholastica","saint-benedict",
   "saint-veronica","saint-anthony-padua"
  ]},
 "restrictions":["Composite painting, not a portrait of each saint alone",
  "Saint Anthony of Padua is not Anthony Abbot",
  "Iconographic attribution, artistic beauty, mobile crop and final release require separate review"]}
(OUT/"acquisition.json").write_text(json.dumps(record,indent=2,ensure_ascii=False)+"\n")
print("MULTI_SAINT_SOURCE_ACQUIRED",json.dumps({k:record[k] for k in ("id","title","width","height","originalSha256")}),flush=True)
