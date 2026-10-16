#!/usr/bin/env python3
"""Recover museum photographs without specifying crop-inducing height.
Reject pictures whose decoded ratio conflicts with documented panel/canvas edges.
"""
import io,json,time,hashlib,requests
from pathlib import Path
from PIL import Image,ImageOps
ROOT=Path(__file__).resolve().parents[2]
DATA=json.loads((ROOT/"data/calendar/sacred-art-review-uploads/20261016-w89-uncropped-source-retry.v1.json").read_text())
OUT=ROOT/"docs/research/review-galleries/acquired"
ARC=ROOT/"artifacts/sacred-art-w89-native-ratio"
Image.MAX_IMAGE_PIXELS=130_000_000
def fetch(u):
 for i in range(2):
  try:
   r=requests.get(u,timeout=(12,35),headers={"User-Agent":"Mozilla/5.0 (AdOrientemSacredArtResearch/1.0)"})
   r.raise_for_status()
   if len(r.content)>40_000_000:raise ValueError("source >40MB")
   return r.content,r.url
  except Exception:
   if i:raise
   time.sleep(3)
def main():
 OUT.mkdir(parents=True,exist_ok=True);ARC.mkdir(parents=True,exist_ok=True)
 rows=[]
 for it in DATA["items"]:
  trials=[];accepted=None
  for url in it["candidateUrls"]:
   try:
    raw,actual=fetch(url)
    with Image.open(io.BytesIO(raw)) as check:check.verify()
    with Image.open(io.BytesIO(raw)) as im: w,h=ImageOps.exif_transpose(im).size
    err=abs(w/h-it["naturalAspectRatio"])/it["naturalAspectRatio"]
    good=err<=it["ratioTolerance"] and min(w,h)>=it["minShortSide"]
    trials.append({"url":actual,"width":w,"height":h,"ratioError":round(err,4),"isFullAspectUsable":good})
    if good and (accepted is None or w*h>accepted["pixels"]):
     accepted={"bytes":raw,"url":actual,"size":(w,h),"pixels":w*h,"err":err}
   except Exception as e:trials.append({"url":url,"error":str(e)[:150]})
  rec={"categoryIndex":it["categoryIndex"],"paintingId":it["id"],"inventory":it["museumId"],"trials":trials,"sourcePage":it["sourcePage"],"ratingChanged":False,"releaseRightsCertified":False}
  if accepted is None:
   rec["status"]="STILL_MISSING_FULL_PICTURE_REPRODUCTION"
  else:
   raw=accepted["bytes"];sha=hashlib.sha256(raw).hexdigest()
   with Image.open(io.BytesIO(raw)) as im:
    p=ImageOps.exif_transpose(im).convert("RGB");p.thumbnail((2200,2200),Image.Resampling.LANCZOS)
    buf=io.BytesIO();p.save(buf,"WEBP",quality=88,method=4);body=buf.getvalue()
   name="w89-"+str(it["categoryIndex"])+"-"+sha[:14]+".webp"
   (OUT/name).write_bytes(body);(ARC/("w89-"+str(it["categoryIndex"])+".source")).write_bytes(raw)
   rec.update(status="EXACT_ORIGINAL_FULL_ASPECT_NATIVE_IMAGE_ACQUIRED",sourceUrl=accepted["url"],pixels=accepted["size"],sourceSha256=sha,previewSha256=hashlib.sha256(body).hexdigest(),previewFile="acquired/"+name,photographicCompositionPreserved=True)
  rows.append(rec)
  print("W89_IMAGE",rec["categoryIndex"],rec["status"],flush=True)
 d={"schema":"AO_SACRED_ART_W89_DOWNLOAD_QA_V1","rows":rows,"counts":{"attempted":len(rows),"fullUncroppedSourceAcquisitions":sum(x["status"].startswith("EXACT_") for x in rows),"stillMissing":sum(x["status"].startswith("STILL_") for x in rows)}}
 (OUT/"w89-download-qa.v1.json").write_text(json.dumps(d,indent=2)+"\n")
 (ARC/"w89-download-qa.v1.json").write_text(json.dumps(d,indent=2)+"\n")
 print("W89_COMPLETE",json.dumps(d["counts"]),flush=True)
if __name__=="__main__": main()
