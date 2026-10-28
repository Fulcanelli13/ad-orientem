#!/usr/bin/env python3
"""Create only opt-in, unapproved full-composition Murillo hero test derivatives.

No image is promoted to a live app by this script. Original is NGA open access,
pinned to exact original bytes; exports are downsampled sRGB WebP, no crop, no
AI, no perspective/colour enhancement, no frame removal or enlargement.
"""
import hashlib, io, json, urllib.request
from pathlib import Path
from PIL import Image, ImageCms, ImageOps

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"assets/staged/prayer-wave1-native-perimeter-20261028"
OUT.mkdir(parents=True,exist_ok=True)
URL=("https://raw.githubusercontent.com/Fulcanelli13/ad-orientem/"
     "research/module-hero-museum-photos-20261026/assets/staged/module-hero-masters/confession.jpg")
SOURCE_SHA="b1e3d47e65f4367fd11fc23d9a63fb25ff3d8c934c3147606f1a3eba703beaa7"
req=urllib.request.Request(URL,headers={"User-Agent":"AdOrientem-Research-PhotoProof/1.0"})
with urllib.request.urlopen(req,timeout=30) as resp: raw=resp.read(13000001)
assert len(raw)<13000001
assert hashlib.sha256(raw).hexdigest()==SOURCE_SHA
with Image.open(io.BytesIO(raw)) as source:
    source.load()
    assert source.size==(4096,3712)
    source=ImageOps.exif_transpose(source)
    icc=source.info.get("icc_profile")
    if icc:
      source=ImageCms.profileToProfile(source.convert("RGB"),
          ImageCms.ImageCmsProfile(io.BytesIO(icc)),ImageCms.createProfile("sRGB"),
          outputMode="RGB")
      color_note="embedded ICC converted to standard sRGB for display derivative"
    else:
      source=source.convert("RGB")
      color_note="no embedded ICC; RGB pixel values retained without auto-correction"
    exports=[]
    for width,quality in [(800,90),(1600,92)]:
      target=source.copy()
      target.thumbnail((width,width*3),Image.Resampling.LANCZOS)
      assert target.width==width and target.height==round(source.height*width/source.width)
      file=OUT/("confession-whole-"+str(width)+"-preview.webp")
      target.save(file,"WEBP",quality=quality,method=6)
      b=file.read_bytes()
      exports.append({
        "file":str(file.relative_to(ROOT)),"sha256":hashlib.sha256(b).hexdigest(),
        "pixels":[target.width,target.height],"bytes":len(b),
        "source_full_image_pixel_ratio_unchanged":True,
        "crops":[],"subject_parts_removed":[],
        "quality":quality,"retouching":False,"upscaling":False})
manifest={
 "schema":"AO_WAVE1_CONFESSION_FULL_IMAGE_PROOF_V1",
 "asOf":"2026-10-28",
 "status":"RESEARCH_OPT_IN_PREVIEW_ONLY",
 "artwork":"Bartolomé Esteban Murillo — The Return of the Prodigal Son",
 "museum":"National Gallery of Art, Washington","accession":"1948.12.1",
 "museum_url":"https://www.nga.gov/artworks/34956-return-prodigal-son",
 "museum_open_access_terms":"https://www.nga.gov/artworks/free-images-and-open-access",
 "source_branch":"research/module-hero-museum-photos-20261026",
 "source_original_path":"assets/staged/module-hero-masters/confession.jpg",
 "source_sha256":SOURCE_SHA,"source_pixels":[4096,3712],
 "source_bytes_unchanged":True,"color_conversion":color_note,
 "complete_painted_composition_preserved":True,
 "phone_display":"object-fit: contain; never cover; do not lose dog, son, father, attendants",
 "photo_preview_only":True,"final_human_visual_acceptance":False,
 "browser_phone_acceptance":False,"production_activation":False,
 "expense_eur":0,
 "derivatives":exports}
(OUT/"confession-proof-derivatives.json").write_text(json.dumps(manifest,indent=2)+"\n")
print(json.dumps({"status":"PREVIEW_DERIVATIVES_STAGED_NO_RELEASE",
 "original_sha256_verified":True,"exports":exports},indent=2))
