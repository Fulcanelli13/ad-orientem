#!/usr/bin/env python3
"""Create one readable QA contact sheet from fourteen archived San Polo oil WebPs.

Review aid only. The originals are not edited or overwritten; the output is
temporary QA evidence, never an artwork approval, publication asset, or archive.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT=Path("data/prayer/stations/san-polo-tiepolo-oils-1747")
OUT=Path(os.environ.get("RUNNER_TEMP","/tmp"))/"san-polo-qa"
ROMAN=("I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV")
CELL_W=360
CELL_H=490
PHOTO_BOX=(324,405)
PADDING=18

def textfont(size:int):
 for name in ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf","/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf"):
  if Path(name).exists():
   return ImageFont.truetype(name,size)
 return ImageFont.load_default()

def main():
 data=json.loads((ROOT/"acquisition-results.v1.json").read_text())
 assert data["photographsAcquired"]==14 and data["productionImagesEnabled"]==0
 assert len(data["files"])==14
 out=Image.new("RGB",(CELL_W*7,CELL_H*2),(28,30,34))
 draw=ImageDraw.Draw(out)
 font=textfont(19)
 small=textfont(14)
 records=[]
 for index,entry in enumerate(data["files"]):
  number=index+1
  assert entry["station"]==number
  path=Path(entry["file"])
  with Image.open(path) as raw:
   assert raw.format=="WEBP"
   photo=ImageOps.exif_transpose(raw).convert("RGB")
   photo.thumbnail(PHOTO_BOX,Image.Resampling.LANCZOS)
  col,row=index%7,index//7
  left=col*CELL_W
  top=row*CELL_H
  x=left+(CELL_W-photo.width)//2
  y=top+36+(PHOTO_BOX[1]-photo.height)//2
  out.paste(photo,(x,y))
  draw.rectangle((left+6,top+6,left+CELL_W-6,top+CELL_H-6),outline=(73,75,82),width=2)
  draw.text((left+PADDING,top+12),f"STATION {ROMAN[index]}",font=font,fill=(236,220,182))
  title=entry["subject"][:46]
  draw.text((left+PADDING,top+448),title,font=small,fill=(231,231,228))
  records.append({"station":number,"sha256":entry["derivativeSHA256"],
                  "source":entry["sourcePage"],"contactSheetPosition":[row,col],
                  "originalDimensions":entry["derivativeDimensions"],
                  "webpBytes":entry["derivativeBytes"]})
 OUT.mkdir(parents=True,exist_ok=True)
 imgfile=OUT/"all-14-archived-webps-review.jpg"
 out.save(imgfile,format="JPEG",quality=88,optimize=True,subsampling=0)
 manifest={"schema":"AO_SAN_POLO_QA_CONTACT_SHEET_V1",
           "notice":"Ephemeral contact sheet for checking exact archived WebPs. Not publication, not visual clearance.",
           "image":imgfile.name,
           "images":records,
           "productionEnabled":False}
 (OUT/"source-index.json").write_text(json.dumps(manifest,indent=2)+"\n")
 print(f"CONTACT SHEET: {imgfile} ({imgfile.stat().st_size} bytes), 14 numbered WebP previews")
if __name__=="__main__":main()
