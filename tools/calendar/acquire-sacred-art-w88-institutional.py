#!/usr/bin/env python3
"""Acquire exact physically identified paintings from source institutional images.
A research preview never substitutes for licensing or verified release.
"""
import json,hashlib,io,requests,time
from pathlib import Path
from PIL import Image,ImageOps
ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/"data/calendar/sacred-art-review-uploads/20261016-w88-exact-original-institutional-sources.v1.json"
DEST=ROOT/"docs/research/review-galleries/acquired"
ARCH=ROOT/"artifacts/sacred-art-w88"
Image.MAX_IMAGE_PIXELS=100_000_000
def retrieve(url):
 hdr={"User-Agent":"Mozilla/5.0 (compatible; AdOrientemSacredArtResearch/1.0; +https://github.com/Fulcanelli13/ad-orientem)","Accept":"image/jpeg,image/webp,*/*"}
 last=None
 for t in range(2):
  try:
   with requests.get(url,headers=hdr,timeout=(12,35),stream=True,allow_redirects=True) as r:
    r.raise_for_status()
    chunks=[];num=0
    for chunk in r.iter_content(65536):
     chunks.append(chunk);num+=len(chunk)
     if num>45_000_000:raise ValueError("Image exceeds 45MB source limit")
    return b"".join(chunks),r.url
  except Exception as e:
   last=e
   if t<1:time.sleep(2.2)
 raise last
def main():
 DEST.mkdir(parents=True,exist_ok=True);ARCH.mkdir(parents=True,exist_ok=True)
 records=[]
 for item in json.loads(SOURCE.read_text())["items"]:
  itemrecord={"categoryIndex":item["categoryIndex"],"paintingId":item["paintingId"],"inventory":item["inventory"],"museumPage":item["museumPage"],"rights":item["rights"],"identity":item["identity"],"status":"FAILED","attempts":[]}
  best=None
  for uri in item["candidates"]:
   try:
    b,actual=retrieve(uri)
    with Image.open(io.BytesIO(b)) as im: im.verify()
    with Image.open(io.BytesIO(b)) as original:
     original=ImageOps.exif_transpose(original)
     size=original.size
     if min(size)<500:raise ValueError("Source below 500px even as reference")
     if best is None or min(size)>min(best[0]):
      best=(size,b,actual)
    itemrecord["attempts"].append({"url":uri,"result":"FETCHED","pixels":size,"bytes":len(b)})
   except Exception as e:itemrecord["attempts"].append({"url":uri,"result":"FAILED","reason":str(e)[:160]})
  if best is not None:
   (w,h),raw,url=best
   image_hash=hashlib.sha256(raw).hexdigest()
   with Image.open(io.BytesIO(raw)) as im:
    rgb=ImageOps.exif_transpose(im).convert("RGB")
    rgb.thumbnail((2200,2200),Image.Resampling.LANCZOS)
    buf=io.BytesIO();rgb.save(buf,"WEBP",quality=87,method=4);preview=buf.getvalue()
   filename="w88-"+str(item["categoryIndex"])+"-"+image_hash[:14]+".webp"
   (DEST/filename).write_bytes(preview)
   (ARCH/("w88-"+str(item["categoryIndex"])+".original")).write_bytes(raw)
   verified=min(w,h)>=item["minShortSide"]
   itemrecord.update(status="USABLE_EXACT_ORIGINAL_RESEARCH_PREVIEW" if verified else "LOW_RES_EXACT_ORIGINAL_REFERENCE_ONLY",
    sourceUrl=url,sourceSha256=image_hash,originalPixels=[w,h],sourceBytes=len(raw),
    previewSha256=hashlib.sha256(preview).hexdigest(),previewBytes=len(preview),previewPixels=[rgb.width,rgb.height],
    previewFile="acquired/"+filename,qualifiesForVisualReview=verified,
    cropStatus="ORIGINAL_AS_DOWNLOADED_FULL_FRAME_UNCROPPED",reproductionRightsCleared=False)
  records.append(itemrecord)
  print("W88_IMAGE",item["categoryIndex"],itemrecord["status"],itemrecord.get("originalPixels"),flush=True)
 report={"schema":"AO_SACRED_ART_W88_SOURCE_BYTE_QA_V1","rows":records,"counts":{"attempted":len(records),
 "downloaded":sum(x["status"]!="FAILED" for x in records),
 "usable":sum(x["status"]=="USABLE_EXACT_ORIGINAL_RESEARCH_PREVIEW" for x in records),
 "lowRes":sum(x["status"]=="LOW_RES_EXACT_ORIGINAL_REFERENCE_ONLY" for x in records),
 "missing":sum(x["status"]=="FAILED" for x in records)}}
 for p in (DEST/"w88-acquisition.v1.json",ARCH/"w88-acquisition.v1.json"):p.write_text(json.dumps(report,indent=2)+"\n")
 print("W88_COMPLETE",json.dumps(report["counts"]),flush=True)
if __name__=="__main__": main()
