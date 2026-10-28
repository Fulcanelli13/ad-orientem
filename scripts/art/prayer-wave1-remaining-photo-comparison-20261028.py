#!/usr/bin/env python3
"""Strictly read-only original comparison for the locked Wave 1 paintings.
Acquires exact original files from Commons + existing GitHub research refs,
verifies prior SHA256 on archival masters, and produces nonproduction photo-QA.
Never upscales or edits a source original, never changes production asset links.
"""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageCms
from io import BytesIO
from urllib.request import Request, urlopen
import hashlib, json

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"assets/staged/prayer-wave1-photo-comparison-20261028"
OUT.mkdir(parents=True,exist_ok=True)
USER_AGENT="AdOrientem-ImageResearch/1.0 (research; attributed open access)"
SOURCE={
 "sorrows_old":("https://raw.githubusercontent.com/Fulcanelli13/ad-orientem/research/module-hero-museum-photos-20261026/assets/staged/module-hero-masters/sorrows.jpg",
 "c9c338596bc2a1f069535facfab1fe11cee1aaad7d67e5440c2114cfe9f09f2a",(2220,3000)),
 "sorrows_new":("https://upload.wikimedia.org/wikipedia/commons/8/8a/Master_of_the_Half_Lengths_-_Virgin_of_the_Seven_Sorrows_-_Google_Art_Project.jpg",
 None,(3250,4391)),
 "angelus":("https://raw.githubusercontent.com/Fulcanelli13/ad-orientem/research/module-hero-wave2-20261026/assets/staged/module-hero-wave2/angelus-met.jpg",
 "ae59a42e39896646d3d18d4761e04b8ce6fa1d84bfaa9f79bd23f8d72aa95be6",(3741,3658)),
 "rosary_sailko":("https://raw.githubusercontent.com/Fulcanelli13/ad-orientem/research/module-hero-pd-masters-20261026/assets/staged/module-hero-open-photo-candidates-20261027/module-rosary-lotto-original.jpg",
 "5563d32307c7b479e86b0060dc8bc17f9b699c938d293ff5bd6f4555ee1f7045",(1772,2652)),
 "rosary_yorck":("https://upload.wikimedia.org/wikipedia/commons/6/68/Lorenzo_Lotto_057.jpg",None,(1880,2886)),
}
def retrieve(key):
 url,expected,size=SOURCE[key]
 req=Request(url,headers={"User-Agent":USER_AGENT})
 with urlopen(req,timeout=40) as fh:
  raw=fh.read(12500000)
 if not 0<len(raw)<12500000:raise RuntimeError("Oversize or empty "+key)
 digest=hashlib.sha256(raw).hexdigest()
 if expected and digest!=expected:raise AssertionError("Archived master hash changed: "+key)
 src=Image.open(BytesIO(raw));src.load()
 if src.size!=size:raise AssertionError("Dimensions changed: "+key+" got "+str(src.size))
 return raw,src,digest
def rgb(img):
 img=ImageOps.exif_transpose(img)
 icc=img.info.get("icc_profile")
 if icc:
  try:
   return ImageCms.profileToProfile(img.convert("RGB"),ImageCms.ImageCmsProfile(BytesIO(icc)),ImageCms.createProfile("sRGB"),outputMode="RGB")
  except Exception:pass
 return img.convert("RGB")
def save_jpg(image,name):
 fp=OUT/name
 image.save(fp,"JPEG",quality=90,optimize=True,subsampling=0)
 return {"file":str(fp.relative_to(ROOT)),"sha256":hashlib.sha256(fp.read_bytes()).hexdigest(),"pixels":list(image.size)}
def fit(image,box):
 out=image.copy();out.thumbnail(box,Image.Resampling.LANCZOS);return out
def whole_grid(keymap,name,detail_boxes):
 col_w=460;thumb_h=630;head=70;pad=24;details_w=400;detail_h=400
 canvas=Image.new("RGB",(pad*2+len(keymap)*col_w,pad*3+head+thumb_h+detail_h),(15,19,24))
 d=ImageDraw.Draw(canvas)
 d.text((pad,pad),"NONPRODUCTION PHOTO QA — ORIGINAL COMPOSITION + SOURCE-PIXEL DETAILS",fill="white")
 for i,(label,img) in enumerate(keymap):
  x=pad+i*col_w;y=pad+head
  frame=fit(rgb(img),(col_w-20,thumb_h))
  canvas.paste(frame,(x+(col_w-frame.width)//2,y+(thumb_h-frame.height)//2))
  d.text((x+10,y+thumb_h+8),label,fill=(239,211,175))
  region=detail_boxes[i]
  tile=img.crop(region)
  tile=fit(rgb(tile),(details_w,detail_h))
  canvas.paste(tile,(x+(col_w-tile.width)//2,y+thumb_h+30))
 return save_jpg(canvas,name)
results={}
raw={}
images={}
for key in SOURCE:
 raw[key],images[key],digest=retrieve(key)
 results[key]={"source_url":SOURCE[key][0],"sha256":digest,
  "bytes":len(raw[key]),"pixels":list(images[key].size),
  "prior_hash_matched":SOURCE[key][1] is not None,
  "source_file_reused_unchanged":True}
 if key in ("sorrows_new","rosary_yorck"):
  path=OUT/(key+"-new-commons-original.jpg");path.write_bytes(raw[key])
  results[key]["archived_source_original"]=str(path.relative_to(ROOT))
# Two full works plus native 500x500 tiles around centre and upper medallion.
compare=[]
for old,new,label in [("sorrows_old","sorrows_new","seven-sorrows"),
                       ("rosary_sailko","rosary_yorck","rosary")]:
 dims=[images[old].size,images[new].size]
 boxes=[]
 for w,h in dims:
  cx=int(w*.51);cy=int(h*.34 if label=="seven-sorrows" else h*.17)
  tile=min(500,w,h)
  boxes.append((max(0,cx-tile//2),max(0,cy-tile//2),min(w,max(0,cx-tile//2)+tile),min(h,max(0,cy-tile//2)+tile)))
 compare.append(whole_grid([(old,images[old]),(new,images[new])],label+"-source-comparison.jpg",boxes))
# Angelus candidate exact painted boundary vs full oak support, no subject crop.
angelus=images["angelus"];ac=(82,77,3660,3590)
aimg=angelus.crop(ac)
assert abs(aimg.width/aimg.height-70.5/69.2)<.01,"Painted-surface physical ratio inconsistent"
compare.append(whole_grid([("angelus unmodified full support",angelus),("angelus provisional painted surface",aimg)],
 "angelus-painted-perimeter-proposal.jpg",[(0,0,500,500),(0,0,500,500)]))
# Produce candidate downsampled unretouched full-image crop, not automatically approved.
candidate=fit(rgb(aimg),(1500,1500))
compare.append(save_jpg(candidate,"angelus-paint-only-UNAPPROVED.jpg"))
# Rosary external hardware variants (cropping only outside the painting, pending manual pixel review).
rosary=images["rosary_sailko"]
rosary_boxes={"conservative":(14,28,1758,2635),
              "tighter":(24,44,1748,2609)}
for kind,box in rosary_boxes.items():
 variant=rosary.crop(box)
 compare.append(whole_grid([("full Sailko source",rosary),(kind+" EXTERNAL crop",variant)],
   "rosary-"+kind+"-perimeter-proposal.jpg",[(0,0,500,500),(0,0,500,500)]))
 compare.append(save_jpg(fit(rgb(variant),(1100,1700)),"rosary-"+kind+"-UNAPPROVED.jpg"))
report={
 "schema":"AO_PRAYER_WAVE1_PHOTO_COMPARISON_V1","created":"2026-10-28",
 "review_only":True,"photo_releases":0,"editorial_changes":0,"cost_eur":0,
 "source_images":results,"evidence":compare,
 "provisional_crop_rects":{"angelus":list(ac),"rosary":{k:list(v) for k,v in rosary_boxes.items()}},
 "rights":{
  "angelus":"Met 2004.31 institutional Public Domain; attribution still required by product policy",
  "sorrows_new":"Wikimedia Commons PD-Art / PDM 1.0 notice; verify exact file and relevant jurisdiction before release",
  "rosary_yorck":"Commons public-domain reproduced artwork; Yorck compilation GFDL metadata is distinct from single-image status",
  "rosary_sailko":"Sailko CC BY 3.0, attribution/license URL/change notice required for any derived crop"
 },
 "release_policy":"All crops/alternates unapproved; review native painted boundaries and detail, do not crop any mystery roundels, do not switch master without documented quality grounds.",
 "evening":{"approved_work":"Frere The Prayer Wolverhampton OP6","action":"HOLD_SOURCE_RIGHTS_AND_QUALITY","known_commons_pixels":[898,1200],"substitute_allowed":False}
}
(OUT/"comparison-evidence.json").write_text(json.dumps(report,indent=2)+"\n")
print(json.dumps({"result":"SOURCE_COMPARISON_RESEARCH_READY",
 "sha_verified_existing":3,"new_originals":2,"evidence_files":len(compare),
 "photo_released":0},indent=2))
