#!/usr/bin/env python3
"""Generate opt-in, review-only two photo candidates for Angelus and Rosary.
Rosary uses exact unframed Yorck project Commons original, NOT Sailko crop.
Angelus shows a new painted-surface estimate; no accepted framing promised.
"""
from pathlib import Path
from io import BytesIO
from urllib.request import Request,urlopen
from PIL import Image,ImageCms,ImageOps,ImageDraw
import hashlib,json
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"assets/staged/prayer-wave1-photo-comparison-20261028"
ROOTSRC=OUT/"rosary_yorck-new-commons-original.jpg"
SOURCE={
 "rosary":{"raw":ROOTSRC.read_bytes(),"source_sha256":"595c186cf5e71cfba242f2db6af53c75169e2498bf15c7f4f08966bfba0605ca","size":(1880,2886)},
 "angelus":{"raw":None,"source_sha256":"ae59a42e39896646d3d18d4761e04b8ce6fa1d84bfaa9f79bd23f8d72aa95be6","size":(3741,3658)}
}
url="https://raw.githubusercontent.com/Fulcanelli13/ad-orientem/research/module-hero-wave2-20261026/assets/staged/module-hero-wave2/angelus-met.jpg"
with urlopen(Request(url,headers={"User-Agent":"AdOrientem-Free-Research/1.0"}),timeout=30) as resp:
 SOURCE["angelus"]["raw"]=resp.read(10000000)
def srgb(im):
 im=ImageOps.exif_transpose(im)
 icc=im.info.get("icc_profile")
 if icc:
  try:return ImageCms.profileToProfile(im.convert("RGB"),ImageCms.ImageCmsProfile(BytesIO(icc)),ImageCms.createProfile("sRGB"),outputMode="RGB")
  except Exception:pass
 return im.convert("RGB")
def save(img,name,width,quality=91):
 img=srgb(img)
 img.thumbnail((width,5000),Image.Resampling.LANCZOS)
 fp=OUT/name
 img.save(fp,"WEBP",quality=quality,method=6)
 return {"path":str(fp.relative_to(ROOT)),"sha256":hashlib.sha256(fp.read_bytes()).hexdigest(),
         "pixels":list(img.size),"bytes":fp.stat().st_size,"retouched":False,"upscaled":False}
for key,info in SOURCE.items():
 assert hashlib.sha256(info["raw"]).hexdigest()==info["source_sha256"],"SHA mismatch: "+key
 info["image"]=Image.open(BytesIO(info["raw"]))
 info["image"].load()
 assert info["image"].size==info["size"]
proposal=(88,87,3648,3581)
proposed=SOURCE["angelus"]["image"].crop(proposal)
ratio=proposed.width/proposed.height
assert abs(ratio-70.5/69.2)<.005,(ratio,70.5/69.2)
# Two further native-corner panels verify painted boundary; record estimate but do not pass human gate.
corner=Image.new("RGB",(1076,1090),(17,21,26))
d=ImageDraw.Draw(corner)
d.text((20,12),"ANGELUS PROPOSED PAINTED EDGE — 512 NATIVE PX CORNERS",fill="white")
for i,(x,y) in enumerate([(0,0),(proposed.width-512,0),(0,proposed.height-512),(proposed.width-512,proposed.height-512)]):
 tile=srgb(proposed.crop((x,y,x+512,y+512)))
 px=20+(i%2)*528;py=36+(i//2)*526
 corner.paste(tile,(px,py))
 d.text((px,py+513),["TL","TR","BL","BR"][i],fill="#ddcbb6")
panel=OUT/"angelus-v2-corner-grid.jpg"
corner.save(panel,"JPEG",quality=90,subsampling=0)
angelus_variants=[save(proposed,"angelus-paint-proposal-v2-720.webp",720),
                  save(proposed,"angelus-paint-proposal-v2-1440.webp",1440)]
rosary_variants=[save(SOURCE["rosary"]["image"],"rosary-yorck-complete-720.webp",720),
                 save(SOURCE["rosary"]["image"],"rosary-yorck-complete-1440.webp",1440)]
manifest={
 "schema":"AO_WAVE1_BEST_PHOTO_PROOF_V1","date":"2026-10-28",
 "scope":"Research preview candidates ONLY; zero released artwork","production_releases":0,
 "cost_eur":0,"editorial_primaries_unchanged":True,
 "entries":[
  {"module":"angelus","artwork":"Philippe de Champaigne — The Annunciation",
   "museum":"The Met","accession":"2004.31",
   "source_url":"https://www.metmuseum.org/art/collection/search/438724",
   "master_sha256":SOURCE["angelus"]["source_sha256"],
   "original_dimensions":[3741,3658],"proposed_crop_xyxy":list(proposal),
   "painted_surface_reference_cm":[70.5,69.2],
   "painted_boundary_exactly_certified":False,
   "dove_and_lilies_policy":"Natural-aspect contain only; no widescreen/portrait cover crop",
   "rights":"Institutional public domain notice confirmed; final product provenance gate pending",
   "previews":angelus_variants,"original_master_bytes_modified":False,
   "final_photo_approved":False},
  {"module":"rosary","artwork":"Lorenzo Lotto — Madonna del Rosario",
   "source_url":"https://commons.wikimedia.org/wiki/File:Lorenzo_Lotto_057.jpg",
   "master_sha256":SOURCE["rosary"]["source_sha256"],
   "original_dimensions":[1880,2886],"proposed_crop_xyxy":None,
   "all_fifteen_roundels_and_lower_angels_preserved":True,
   "sailko_clip_crops_rejected":True,
   "rights":"Commons single painting reproduction PD Mark; original compiled Yorck Project collection has GFDL metadata",
   "suggested_credit":"Lorenzo Lotto, Madonna del Rosario, 1539 — reproduction via Wikimedia Commons / The Yorck Project",
   "previews":rosary_variants,"original_master_bytes_modified":False,
   "final_photo_approved":False}
 ],
 "next_gates":["human check Met native perimeter v2","institutional photo provenance",
  "source-correct attribution","phone/desktop containment test","formal editorial approval"]
}
(OUT/"candidate-proof-manifest.json").write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n")
print(json.dumps({"result":"TWO_UNPUBLISHED_PHOTO_PROOFS_PREPARED",
 "candidates":len(manifest["entries"]),"webp":4,"angelus_proposed_crop":list(proposal),
 "released":0},indent=2))
