#!/usr/bin/env python3
"""Read-only, ephemeral Rauth photo QA: dimensions, readability, source status.

Downloads are confined to the GitHub runner's temporary directory. No photos
or derivatives are committed, uploaded as artifacts, or enabled in the app.
The JSON output is METADATA ONLY. Copyright status is explicitly not certified.
"""
import io
import json
import math
import os
import statistics
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps, ImageStat

REG=Path("data/prayer/stations/rauth-edinburgh/series-photo-rights-research.v1.json")
ALLOWED={"images.squarespace-cdn.com","www.geocities.ws"}
MAX_BYTES=18_000_000
TIMEOUT_SECONDS=18
ROMAN=("I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV")

def sample(url,station,kind):
 row={"station":station,"collection":kind,"url":url,
      "publicationCleared":False,"visualHumanApproved":False,
      "licenseVerified":False}
 try:
  parsed=urllib.parse.urlparse(url)
  assert parsed.scheme=="https" and parsed.hostname in ALLOWED
  req=urllib.request.Request(url,headers={"User-Agent":"AdOrientem-NonPublishingResearchQA/1.0"})
  with urllib.request.urlopen(req,timeout=TIMEOUT_SECONDS) as response:
   data=response.read(MAX_BYTES+1)
   if len(data)>MAX_BYTES:raise ValueError("Image exceeds 18 MB source-QA cap")
   row["httpStatus"]=response.status
   row["contentType"]=response.headers.get("Content-Type","")
  with Image.open(io.BytesIO(data)) as original:
   if original.format not in {"JPEG","PNG","WEBP"}:raise ValueError("Unexpected format")
   image=ImageOps.exif_transpose(original).convert("RGB")
   width,height=image.size
   if width<100 or height<100:raise ValueError("Source too small to assess")
   image.thumbnail((480,480))
   stat=ImageStat.Stat(image)
   row.update({
    "available":True,"bytes":len(data),"format":original.format,
    "width":width,"height":height,"aspectRatio":round(width/height,4),
    "shortSide":min(width,height),"longSide":max(width,height),
    "rgbMeans":[round(c,2) for c in stat.mean],
    "rgbStdDev":[round(c,2) for c in stat.stddev],
    "fullSizeMobileCandidate":min(width,height)>=900,
    "notes":"Source is NOT rights-cleared; numerical diagnostics cannot certify frame-free painting or colour fidelity."
   })
 except Exception as exc:
  row.update({"available":False,"error":str(exc)[:280]})
 return row

def main():
 registry=json.loads(REG.read_text(encoding="utf-8"))
 assert len(registry["stations"])==14 and not registry["photographPublication"]["publicationAllowed"]
 assert registry["counts"]["photosActivated"]==0
 output={"schema":"AO_RAUTH_EPHEMERAL_NATIVE_PHOTO_METADATA_QA_V1",
         "nativeBytesCommitted":0,"nativeImagesUploaded":0,
         "rightsClearancesClaimed":0,"sources":[]}
 for idx,station in enumerate(registry["stations"]):
  assert station["station"]==idx+1 and station["roman"]==ROMAN[idx]
  for kind,key in (("2019_official","officialPhotographURL"),
                   ("2000_2002_archive","archival2002SourceImageURL")):
   entry=sample(station[key],idx+1,kind)
   output["sources"].append(entry)
   info=f'{entry.get("width","?")}x{entry.get("height","?")}'
   print(f"RAUTH {ROMAN[idx]:>3} {kind:20} {info:12} "+("AVAILABLE" if entry["available"] else f"UNREADABLE: {entry.get('error','')}"))
 summary={}
 for kind in ("2019_official","2000_2002_archive"):
  rows=[x for x in output["sources"] if x["collection"]==kind]
  summary[kind]={"available":sum(x["available"] for x in rows),
                 "unreadable":sum(not x["available"] for x in rows),
                 "mobileSizeCandidates":sum(x.get("fullSizeMobileCandidate",False) for x in rows)}
 output["summary"]=summary
 print("RAUTH_METADATA_QA_RESULT="+json.dumps(output,separators=(",",":"),ensure_ascii=False))
 # Never persist protected photographs. Metadata output is for one review pass.
 # No new production status may be written by this diagnostic.
 assert output["nativeBytesCommitted"]==0 and output["rightsClearancesClaimed"]==0

if __name__=="__main__": main()
