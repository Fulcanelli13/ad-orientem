#!/usr/bin/env python3
"""Refine ONLY visible, nonpainted Met oak support in research image proposal.
Never auto-accept this approximation; preserve original source and all sacred
image anchors; source SHA and native ratio must be independently verified.
"""
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
from io import BytesIO
from urllib.request import Request,urlopen
import hashlib,json
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"assets/staged/prayer-wave1-photo-comparison-20261028"
url="https://raw.githubusercontent.com/Fulcanelli13/ad-orientem/research/module-hero-wave2-20261026/assets/staged/module-hero-wave2/angelus-met.jpg"
with urlopen(Request(url,headers={"User-Agent":"AdOrientem-Photo-QA/1.0"}),timeout=35) as f:b=f.read(10000000)
digest=hashlib.sha256(b).hexdigest()
assert digest=="ae59a42e39896646d3d18d4761e04b8ce6fa1d84bfaa9f79bd23f8d72aa95be6"
img=Image.open(BytesIO(b));img.load()
assert img.size==(3741,3658)
box=(106,91,3630,3550)
cropped=img.crop(box)
target_ratio=70.5/69.2
ratio=cropped.width/cropped.height
assert abs(ratio-target_ratio)<.003,(ratio,target_ratio)
def check_file(name):
 p=OUT/name
 return {"file":str(p.relative_to(ROOT)),"sha256":hashlib.sha256(p.read_bytes()).hexdigest(),"bytes":p.stat().st_size}
preview=[]
for size in [720,1440]:
 copy=ImageOps.exif_transpose(cropped).convert("RGB")
 copy.thumbnail((size,size),Image.Resampling.LANCZOS)
 fp=OUT/("angelus-v3-paint-only-"+str(size)+".webp")
 copy.save(fp,"WEBP",quality=92,method=6)
 preview.append({**check_file(fp.name),"pixels":list(copy.size),"production":False})
im=cropped.convert("RGB")
panel=Image.new("RGB",(1076,1090),(15,19,24))
d=ImageDraw.Draw(panel)
d.text((20,12),"MET ANNUNCIATION V3 — NO AUTOMATIC PAINTED BOUNDARY CERTIFICATION",fill="white")
for i,(x,y) in enumerate([(0,0),(im.width-512,0),(0,im.height-512),(im.width-512,im.height-512)]):
 px=20+(i%2)*528;py=36+(i//2)*526
 panel.paste(im.crop((x,y,x+512,y+512)),(px,py))
 d.text((px,py+513),["TL","TR","BL","BR"][i],fill="#ddcbb6")
panel.save(OUT/"angelus-v3-four-corners.jpg","JPEG",quality=90,subsampling=0)
report={"schema":"AO_PRAYER_ANGELUS_V3_PHOTO_CROP_V1","date":"2026-10-28",
  "editorial_choice_changed":False,"production_released":False,"cost_eur":0,
  "museum":"Met 2004.31","official_source":"https://www.metmuseum.org/art/collection/search/438724",
  "source_sha256":digest,"source_pixels":list(img.size),"cropped_box_xyxy":list(box),
  "cropped_pixels":list(cropped.size),"proportions_painted_area_cm":[70.5,69.2],
  "ratio_error":ratio-target_ratio,"edges_certified":False,
  "original_bytes_modified":False,"pixel_grid":check_file("angelus-v3-four-corners.jpg"),
  "previews":preview,
  "preserve":["Virgin Mary","Gabriel","dove","lilies","signature","basket and all painted field"],
  "next_gate":"Review visible native painted border in four corners. If any oak remains or any paint lost, do not release.",
  "app_enabled":False}
(OUT/"angelus-v3-native-edge.json").write_text(json.dumps(report,indent=2)+"\n")
print(json.dumps({"result":"V3_RESEARCH_CANDIDATE_GENERATED","bbox":list(box),
 "ratio_error":ratio-target_ratio,"released":False},indent=2))
