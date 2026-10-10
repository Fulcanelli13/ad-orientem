#!/usr/bin/env python3
"""Download only pinned, individually evidenced museum artwork originals from Commons.
Source painting != globally cleared reproduction rights != publication-ready art.
"""
import hashlib,io,json,time
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.error import HTTPError,URLError
from PIL import Image,ImageOps
import numpy as np
ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/"data/calendar/sacred-art-direct-sacred-heart-leads.v1.json"
POLICY=json.loads((ROOT/"data/calendar/sacred-art-research-qa-tiers.v2.json").read_text())["automatedOriginalScreen"]
OUT=ROOT/"artifacts/sacred-art-direct-sacred-heart";IMG=OUT/"originals"
UA="AdOrientemSacredArtwork/2026 (liturgical arts editorial provenance review)"
def acquire(url):
 if not url.startswith("https://upload.wikimedia.org/wikipedia/commons/"):raise ValueError("Source must be direct Commons original")
 err=None
 for attempt in range(3):
  try:
   with urlopen(Request(url,headers={"User-Agent":UA,"Accept":"image/jpeg,*/*"}),timeout=35) as f:
    if int(f.headers.get("Content-Length") or "0")>25_000_000:raise ValueError("oversized image")
    raw=f.read(25_000_001)
    if len(raw)>25_000_000:raise ValueError("oversized image")
    return raw
  except (HTTPError,URLError,TimeoutError,OSError) as e:
   err=str(e);time.sleep(3*(attempt+1))
 raise RuntimeError(err or "download failed")
def evaluate(raw):
 with Image.open(io.BytesIO(raw)) as im:
  if im.format!="JPEG":raise ValueError("Not a JPEG original")
  im.load();x=ImageOps.exif_transpose(im)
  w,h=x.size
  if max(w,h)<POLICY["borderline"]["minimumLongestDimensionPx"]:raise ValueError("Original below 1800px")
  x=x.convert("RGB");x.thumbnail((220,220))
  px=np.asarray(x,dtype=np.int16)
  colour=float(np.mean((np.max(px,axis=2)-np.min(px,axis=2))>18))
  if colour<POLICY["borderline"]["minimumColourFraction"]:raise ValueError("Near-monochrome")
  is_preferred=max(w,h)>=POLICY["preferred"]["minimumLongestDimensionPx"] and colour>=POLICY["preferred"]["minimumColourFraction"]
  return w,h,round(colour,4),"PREFERRED_SOURCE_ORIGINAL" if is_preferred else "BORDERLINE_HELD_FOR_IMAGE_REVIEW"
def main():
 IMG.mkdir(parents=True,exist_ok=True)
 leads=json.loads(SOURCE.read_text())
 assert leads["schema"]=="AO_SACRED_ART_DIRECT_MUSEUM_ORIGINAL_LEADS_V1"
 acquired=[]
 for lead in leads["art"]:
  row={**lead,"status":"SOURCE_NOT_ACQUIRED","publicationApproved":False}
  try:
   assert lead["rights"]=="PUBLIC_DOMAIN_PD_ART_PDM"
   raw=acquire(lead["originalUrl"])
   w,h,col,tier=evaluate(raw)
   if "sourceSHA1" in lead and hashlib.sha1(raw).hexdigest()!=lead["sourceSHA1"]:
    raise ValueError("Source SHA1 mismatch: expected actual Wikimedia original")
   if (w,h)!=(lead["claimedWidth"],lead["claimedHeight"]):
    raise ValueError("Source image dimensions changed")
   row.update(status="ORIGINAL_ACQUIRED_REVIEW_ONLY",qaTier=tier,sha256=hashlib.sha256(raw).hexdigest(),
    bytes=len(raw),width=w,height=h,colourFraction=col,filename=lead["id"]+".jpg")
   (IMG/row["filename"]).write_bytes(raw)
   acquired.append(row)
  except Exception as e:
   row["status"]="REJECTED";row["rejectionReason"]=str(e)
  print("DIRECT_SOURCE",lead["id"],row["status"],row.get("rejectionReason",""),flush=True)
  if row["status"]!="ORIGINAL_ACQUIRED_REVIEW_ONLY":acquired.append(row)
 report={"schema":"AO_SACRED_ART_DIRECT_MUSEUM_ACQUISITIONS_V1",
 "rightsNote":"PD-Art source is explicitly HELD pending worldwide commercial use review; not CC0 or curator approved.",
 "preferredCount":sum(a.get("qaTier")=="PREFERRED_SOURCE_ORIGINAL" for a in acquired),
 "sourceResults":acquired}
 (OUT/"acquisition.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
 print("DIRECT_MANIFEST",json.dumps([{k:v for k,v in a.items() if k in ("id","status","qaTier","sha256","width","height","bytes","filename","rights","rejectionReason")} for a in acquired]),flush=True)
if __name__=="__main__":main()
