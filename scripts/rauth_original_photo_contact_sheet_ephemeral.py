#!/usr/bin/env python3
"""Create ONE-DAY internal editorial preview of fourteen public-gallery photographs.

This is NOT a production asset pipeline. Source images are not saved.
The low-resolution contact sheet is for checking what is depicted and whether
frame/perspective or other nonpainting visual elements require exclusion.
The archive expires after one day; publication is forbidden without clearance.
"""
from io import BytesIO
from pathlib import Path
import json
import urllib.request
from PIL import Image,ImageDraw,ImageFont,ImageOps

ROOT=Path("data/prayer/stations/rauth-edinburgh/series-photo-rights-research.v1.json")
OUT=Path("/tmp/rauth-editorial-qa")
COLS=4
CELL_W=370
CELL_H=540
LABEL_H=52
MARGIN=15
MAXBYTES=18_000_000

def preview(url):
 request=urllib.request.Request(url,headers={"User-Agent":"AdOrientem-Image-QA-Internal-Not-Publication/1.0"})
 with urllib.request.urlopen(request,timeout=20) as r:
  raw=r.read(MAXBYTES+1)
  if len(raw)>MAXBYTES:raise ValueError("source exceeds limit")
 with Image.open(BytesIO(raw)) as im:
  canvas=ImageOps.exif_transpose(im).convert("RGB")
  canvas.thumbnail((CELL_W-2*MARGIN,CELL_H-LABEL_H-2*MARGIN),Image.Resampling.LANCZOS)
  return canvas

def render(rows,filename):
 maxrows=(len(rows)+COLS-1)//COLS
 width=COLS*CELL_W
 height=maxrows*CELL_H+50
 sheet=Image.new("RGB",(width,height),(24,25,27))
 draw=ImageDraw.Draw(sheet)
 draw.text((15,12),"RAUTH EDINBURGH • FOURTEEN ORIGINAL PHOTOGRAPHS • INTERNAL REVIEW ONLY",fill=(240,230,212))
 draw.text((15,29),"©2019 Jesuit Church of the Sacred Heart / Peter Tuffy; NOT CLEARED for app publication",fill=(206,170,159))
 for i,stage in enumerate(rows):
  col=i%COLS
  row=i//COLS
  x=col*CELL_W
  y=50+row*CELL_H
  draw.rectangle((x+4,y+4,x+CELL_W-5,y+CELL_H-5),outline=(89,91,94),width=1)
  image=preview(stage["officialPhotographURL"])
  ix=x+(CELL_W-image.width)//2
  iy=y+MARGIN+LABEL_H+(CELL_H-LABEL_H-2*MARGIN-image.height)//2
  sheet.paste(image,(ix,iy))
  draw.text((x+MARGIN,y+13),f'Station {stage["roman"]}: {stage["subject"][:39]}',fill=(241,236,222))
  draw.text((x+MARGIN,y+29),"Original displayed in complete aspect ratio",fill=(162,166,169))
 OUT.mkdir(parents=True,exist_ok=True)
 sheet.save(OUT/filename,"JPEG",quality=88,optimize=True)
 print("SHEET_WRITTEN",filename,sheet.size)

if __name__=="__main__":
 items=json.loads(ROOT.read_text())["stations"]
 assert len(items)==14
 render(items,"rauth-14-original-source-contact-sheet.jpg")
 render(items[:7],"rauth-01-07-full-paintings.jpg")
 render(items[7:],"rauth-08-14-full-paintings.jpg")
