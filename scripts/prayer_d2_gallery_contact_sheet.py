#!/usr/bin/env python3
"""Assemble contact sheets from real D2 browser screenshots; no art edits."""
import json,os
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
out=Path(os.environ.get("RUNNER_TEMP","/tmp"))/"prayer-d2-gallery-phone-review"
report=json.loads((out/"d2-gallery-phone-evidence.json").read_text())
assert len(report["captures"])==12 and not report["errors"]
modes=["current-contain","compare-cover-center","compare-cover-upper"]
rows=[("en",320),("fr",320),("en",390),("fr",390)]
for kind in ("full","detail"):
 cell=(320,550) if kind=="full" else (320,360)
 bg=Image.new("RGB",(3*cell[0],4*cell[1]),"#ede7df")
 draw=ImageDraw.Draw(bg)
 for ri,(lang,width) in enumerate(rows):
  for ci,mode in enumerate(modes):
   rec=next(x for x in report["captures"] if x["language"]==lang and x["width"]==width and x["mode"]==mode)
   with Image.open(out/rec[kind]) as source:
    thumb=source.convert("RGB")
    thumb.thumbnail((cell[0]-16,cell[1]-58),Image.Resampling.LANCZOS)
    x=ci*cell[0]+(cell[0]-thumb.width)//2
    y=ri*cell[1]+46
    bg.paste(thumb,(x,y))
   draw.text((ci*cell[0]+10,ri*cell[1]+8),f"D2  {lang.upper()} / {width}  {mode}",fill="#231f1b")
   draw.text((ci*cell[0]+10,ri*cell[1]+25),
             f"Visible painting: {rec['geometry']['visibleImageFraction']*100:.1f}%  | HOLD",fill="#52483d")
 name="d2-review-"+("full-gallery" if kind=="full" else "tile-comparison")+".jpg"
 bg.save(out/name,quality=89,optimize=True)
 print("REVIEW_CONTACT_SHEET",out/name)
