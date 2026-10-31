#!/usr/bin/env python3
"""Read-only native-photo diagnostics on fourteen *unlicensed* official Rauth JPGs.

This cannot decide photographic copyright, independent creativity, painting
fidelity, frame-free composition, perspective or artistic approval. It only
flags objectively measurable problems that need human visual inspection.
Images are processed in memory and never written to disk or uploaded.
"""
from __future__ import annotations

import hashlib
import io
import json
import math
import statistics
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps, ImageStat, ImageFilter

REG=Path("data/prayer/stations/rauth-edinburgh/series-photo-rights-research.v1.json")
MAX_BYTES=16_000_000
ALLOWED_HOST="images.squarespace-cdn.com"

def rect_img(im, bounds):
 return im.crop((round(im.width*bounds[0]),round(im.height*bounds[1]),
                 round(im.width*bounds[2]),round(im.height*bounds[3])))

def metrics(im):
 sample=im.copy()
 sample.thumbnail((512,800),Image.Resampling.LANCZOS)
 rgb=ImageStat.Stat(sample)
 gray=ImageOps.grayscale(sample)
 hist=gray.histogram()
 area=sample.width*sample.height
 def band(a,b,c,d):
  strip=rect_img(sample,(a,b,c,d))
  stat=ImageStat.Stat(strip)
  vals=ImageOps.grayscale(strip).histogram()
  px=strip.width*strip.height
  return {"meanLightness":round(stat.mean[0]*.299+stat.mean[1]*.587+stat.mean[2]*.114,2),
          "darkUnder20Pct":round(sum(vals[:20])*100/max(px,1),2),
          "lightOver235Pct":round(sum(vals[236:])*100/max(px,1),2)}
 outer={
  "left":band(0,0,.035,1),
  "right":band(.965,0,1,1),
  "top":band(0,0,1,.025),
  "bottom":band(0,.975,1,1),
 }
 inner=band(.15,.15,.85,.85)
 edge=ImageStat.Stat(gray.filter(ImageFilter.FIND_EDGES))
 greys=ImageStat.Stat(gray)
 def entropy(h):
  return round(-sum((n/area)*math.log2(n/area) for n in h if n),3)
 near_black=sum(hist[:20])/area
 near_white=sum(hist[236:])/area
 asym=abs(outer["left"]["meanLightness"]-outer["right"]["meanLightness"])
 flags=[]
 if near_black>.62:flags.append("MOSTLY_NEAR_BLACK")
 if near_white>.65:flags.append("MOSTLY_OVEREXPOSED")
 if edge.stddev[0]<16:flags.append("LOW_LOCAL_DETAIL_CHECK")
 if asym>65:flags.append("LEFT_RIGHT_EDGE_IMBALANCE_CHECK")
 if any(x["darkUnder20Pct"]>95 for x in outer.values()): flags.append("UNIFORMLY_DARK_EDGE_CHECK")
 if any(x["lightOver235Pct"]>95 for x in outer.values()): flags.append("UNIFORMLY_LIGHT_EDGE_CHECK")
 if min(im.size)<900:flags.append("SHORT_SIDE_BELOW_900_PX_ADVISORY")
 return {"width":im.width,"height":im.height,"pixelMeanRGB":[round(x,2) for x in rgb.mean],
         "pixelStdDevRGB":[round(x,2) for x in rgb.stddev],
         "meanLightness":round(greys.mean[0],2),
         "imageEntropyBits":entropy(hist),
         "greyContrastStdDev":round(greys.stddev[0],2),
         "edgeVariation":round(edge.stddev[0],2),
         "nearBlackPct":round(100*near_black,2),
         "nearWhitePct":round(100*near_white,2),
         "leftRightEdgeLightnessDifference":round(asym,2),
         "outerStrips":outer,"innerRegion":inner,
         "reviewFlags":flags,
         "visualFrameFreeCertified":False,
         "perspectiveCertified":False,
         "accuratePaintColoursCertified":False,
         "mobileCompositionHumanApproved":False,
         "photographCopyrightCleared":False}

def main():
 registry=json.loads(REG.read_text())
 assert len(registry["stations"])==14
 assert registry["counts"]["photosActivated"]==0
 rows=[]
 for stage in registry["stations"]:
  u=stage["officialPhotographURL"]
  assert u.startswith("https://"+ALLOWED_HOST+"/")
  request=urllib.request.Request(u,headers={"User-Agent":"AdOrientem-PrivateResearchQualityDiagnostics/1.0"})
  with urllib.request.urlopen(request,timeout=22) as res:
   data=res.read(MAX_BYTES+1)
  if len(data)>MAX_BYTES:raise RuntimeError("Unexpectedly large source "+str(stage["station"]))
  with Image.open(io.BytesIO(data)) as raw:
   assert raw.format=="JPEG"
   img=ImageOps.exif_transpose(raw).convert("RGB")
   result=metrics(img)
  result.update({"station":stage["station"],"roman":stage["roman"],
                 "sourceURL":u,"sourceSHA256":hashlib.sha256(data).hexdigest(),
                 "nativeBytes":len(data),"nativeImageFormat":"JPEG",
                 "automatedQAOnly":True,"productionReleased":False})
  rows.append(result)
  print(f"RAUTH {stage['roman']:>3}  {result['width']}x{result['height']}  "
        f"entropy={result['imageEntropyBits']}  "
        f"edgeVariation={result['edgeVariation']}  "
        f"flags={','.join(result['reviewFlags']) or 'none'}")
 assert len(set(x["sourceSHA256"] for x in rows))==14,"Exact photo files duplicated"
 counts={}
 for row in rows:
  for flag in row["reviewFlags"]:
   counts[flag]=counts.get(flag,0)+1
 output={"schema":"AO_RAUTH_NATIVE_14_PHOTOGRAPHS_READONLY_VISUAL_DIAGNOSTICS_V1",
         "comment":"Metrics do not certify copyright, artistic quality, perspective or frame-free composition.",
         "photosAssessed":len(rows),"uniqueSourceSHA256":14,
         "publishedPhotos":0,"licenseClearedPhotos":0,
         "flagCounts":counts,"records":rows}
 print("RAUTH_VISUAL_DIAGNOSTIC_JSON="+json.dumps(output,separators=(",",":")))
 assert output["licenseClearedPhotos"]==0 and output["publishedPhotos"]==0

if __name__=="__main__":main()
