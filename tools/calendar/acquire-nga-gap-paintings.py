#!/usr/bin/env python3
"""Download exact National Gallery of Art official CC0 original JPEGs.
No image is approved until an independent artistic/crop inspection.
"""
from pathlib import Path
from urllib.request import Request,urlopen
import hashlib,io,json
from PIL import Image,ImageOps
import numpy as np
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"artifacts/sacred-art-cma-gaps"
IMAGES=OUT/"nga-originals"
LEADS=[
 {"id":"nga-34956","prayerKey":"confession","title":"The Return of the Prodigal Son",
  "object":"https://www.nga.gov/artworks/34956-return-prodigal-son",
  "original":"https://api.nga.gov/iiif/676fa96e-ad4e-4209-b985-ae0c15f5d902/full/full/0/default.jpg"},
 {"id":"nga-41659","prayerKey":"stations","title":"Saint Veronica [obverse]",
  "object":"https://www.nga.gov/artworks/41659-saint-veronica-obverse",
  "original":"https://api.nga.gov/iiif/8788f9a6-142d-40b7-953b-a9a208ff2eef/full/full/0/default.jpg"},
 {"id":"nga-45890","prayerKey":"rosary.glo2","title":"The Ascension",
  "object":"https://www.nga.gov/artworks/45890-ascension",
  "original":"https://api.nga.gov/iiif/644d2492-3c7c-4f1e-ab33-c837edc019c2/full/full/0/default.jpg"},
 {"id":"nga-505","prayerKey":"rosary.joy2","title":"The Visitation with Saint Nicholas and Saint Anthony Abbot",
  "object":"https://www.nga.gov/artworks/505-visitation-saint-nicholas-and-saint-anthony-abbot",
  "original":"https://api.nga.gov/iiif/53a3d42d-c211-4df6-b199-88086fdbd5a9/full/full/0/default.jpg"},
 {"id":"nga-41656","prayerKey":"rosary.joy5","title":"Christ among the Doctors",
  "object":"https://www.nga.gov/artworks/41656-christ-among-doctors",
  "original":"https://api.nga.gov/iiif/a3148763-333a-4e64-ae77-bd37a93b4a34/full/full/0/default.jpg"},
 {"id":"nga-41661","prayerKey":"rosary.joy5","title":"Christ among the Doctors [obverse]",
  "object":"https://www.nga.gov/artworks/41661-christ-among-doctors-obverse",
  "original":"https://api.nga.gov/iiif/d81bc3eb-69f6-4fdc-be42-e0ed3ef0dae0/full/full/0/default.jpg"},
 {"id":"nga-41696","prayerKey":"rosary.sor2","title":"The Flagellation of Christ",
  "object":"https://www.nga.gov/artworks/41696-flagellation-christ",
  "original":"https://api.nga.gov/iiif/618a3d88-ccc6-4fbd-8fbd-0e1d671ace07/full/full/0/default.jpg"},
 {"id":"nga-46470","prayerKey":"rosary.glo4","title":"The Assumption of the Virgin",
  "object":"https://www.nga.gov/artworks/46470-assumption-virgin",
  "original":"https://api.nga.gov/iiif/c77f8b64-98a2-4b3c-b270-1863ece147c5/full/full/0/default.jpg"},
 {"id":"nga-46145","prayerKey":"rosary.glo4","title":"The Assumption of the Virgin",
  "object":"https://www.nga.gov/artworks/46145-assumption-virgin",
  "original":"https://api.nga.gov/iiif/af07c4b6-b9a9-48a1-a53a-a6a9b31e8c07/full/full/0/default.jpg"},
 {"id":"nga-12134","prayerKey":"rosary.glo5","title":"The Coronation of the Virgin",
  "object":"https://www.nga.gov/artworks/12134-coronation-virgin",
  "original":"https://api.nga.gov/iiif/4f1c0f86-404b-41f3-81e3-75a35fea96eb/full/full/0/default.jpg"}
]
def main():
 IMAGES.mkdir(parents=True,exist_ok=True)
 report=[]
 for lead in LEADS:
  row={**lead,"status":"DOWNLOAD_FAILED","rights":"CC0","artisticApproved":False,"cropApproved":False}
  try:
   with urlopen(Request(lead["original"],headers={"User-Agent":"AdOrientem/1.0 MuseumPublicDomainImageResearch"}),timeout=48) as response:
    raw=response.read(40_000_001)
   if len(raw)>40_000_000:raise ValueError("Source >40MB")
   with Image.open(io.BytesIO(raw)) as im:
    im.load();im=ImageOps.exif_transpose(im)
    w,h=im.size
    if max(w,h)<2500: raise ValueError("below 2500px")
    pix=im.convert("RGB");pix.thumbnail((220,220))
    a=np.asarray(pix,dtype=np.int16)
    fraction=float(np.mean((np.max(a,axis=2)-np.min(a,axis=2))>18))
    if fraction<.07: raise ValueError("Near-monochrome source")
   (IMAGES/(lead["id"]+".jpg")).write_bytes(raw)
   row.update(status="ORIGINAL_ACQUIRED",width=w,height=h,colourFraction=round(fraction,4),
      bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest(),file="nga-originals/"+lead["id"]+".jpg")
  except Exception as exc:
   row["error"]=str(exc)
  report.append(row)
  print(row["id"],row["status"],row.get("error",""),flush=True)
 (OUT/"nga-originals-report.json").write_text(json.dumps(report,indent=2)+"\n",encoding="utf-8")
 print("NGA original downloads:",sum(x["status"]=="ORIGINAL_ACQUIRED" for x in report),"/",len(report))
if __name__=="__main__":main()
