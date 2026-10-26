#!/usr/bin/env python3
"""Create SMALL review JPGs from original archived painting bytes (no master edits).
Full-view reduced images and detail tiles sampled 1:1, never upscaled.
These are marked research previews; originals stay in the research branch.
"""
import hashlib, io, json
from pathlib import Path
from PIL import Image, ImageCms, ImageOps

ROOT=Path.cwd()
INPUT=ROOT/"assets/staged/module-hero-masters"
OUTPUT=ROOT/"assets/staged/module-hero-preview-jpegs"
OUTPUT.mkdir(parents=True,exist_ok=True)
rows=[]
for file in sorted(INPUT.glob("*")):
    if file.suffix.lower() not in (".jpg",".jpeg",".png"):continue
    src=file.read_bytes()
    with Image.open(io.BytesIO(src)) as im:
        base=ImageOps.exif_transpose(im)
        icc=base.info.get("icc_profile")
        converted=False
        if icc:
            try:
                base=ImageCms.profileToProfile(base.convert("RGB"),
                    ImageCms.ImageCmsProfile(io.BytesIO(icc)),
                    ImageCms.createProfile("sRGB"),outputMode="RGB")
                converted=True
            except Exception:base=base.convert("RGB")
        else: base=base.convert("RGB")
        original=base.size
        stem=file.stem
        full=base.copy()
        full.thumbnail((720,720),Image.Resampling.LANCZOS)
        whole=OUTPUT/(stem+"-whole-preview.jpg")
        full.save(whole,"JPEG",quality=83,optimize=True,subsampling=0)
        w,h=base.size
        size=min(420,w,h)
        for name,cy in (("upper-detail",.30),("centre-detail",.58)):
            x=min(max(int(w*.5-size/2),0),w-size)
            y=min(max(int(h*cy-size/2),0),h-size)
            tile=base.crop((x,y,x+size,y+size))
            tile.save(OUTPUT/(stem+"-"+name+".jpg"),"JPEG",
                      quality=86,optimize=True,subsampling=0)
        rows.append({"module_id":stem,"master_sha256":hashlib.sha256(src).hexdigest(),
                     "source_dimensions":original,"icc_to_srgb_preview":converted,
                     "preview_paths":[str(x.relative_to(ROOT)) for x in [
                      whole,OUTPUT/(stem+"-upper-detail.jpg"),OUTPUT/(stem+"-centre-detail.jpg")]],
                     "preview_is_not_master":True,"quality_approved":False})
(OUTPUT/"preview-manifest.json").write_text(json.dumps(
 {"kind":"non-authoritative lower-weight JPEG display previews",
  "full_painting_scaled_for_screen":True,"detail_tiles_unscaled_native_pixels":True,
  "no_master_modified":True,"records":rows},indent=2)+"\n")
print("Preview triples:",len(rows))
