#!/usr/bin/env python3
"""Targeted 1:1 details of actual subjects, NOT black background or auto-focus."""
import hashlib,io,json
from pathlib import Path
from PIL import Image,ImageCms,ImageOps
R=Path.cwd()
IN=R/"assets/staged/module-hero-masters"
OUT=R/"assets/staged/module-hero-subject-details"
MARKS={
 "scripture":[("jerome-face",.77,.28),("jerome-writing-hand",.52,.44),("jerome-skull",.25,.34),("jerome-red-drapery",.84,.73)],
 "michael":[("michael-face",.53,.18),("michael-blue-breastplate",.48,.37),("michael-wing-shadow",.81,.23),("michael-devil-face",.59,.78)],
 "visit":[("christ-and-mary-faces",.69,.61),("lower-right-painted-arms",.96,.94),("dark-shadows-and-beams",.38,.12)],
 "mass":[("altar-priest",.35,.38),("kneeling-congregation",.53,.61),("distant-figures",.78,.47)],
}
OUT.mkdir(parents=True,exist_ok=True)
report=[]
for mod,targets in MARKS.items():
    file=IN/(mod+".jpg")
    if not file.exists(): continue
    raw=file.read_bytes();sha=hashlib.sha256(raw).hexdigest()
    with Image.open(io.BytesIO(raw)) as img:
        a=ImageOps.exif_transpose(img);icc=a.info.get("icc_profile")
        if icc:
            try:
                a=ImageCms.profileToProfile(a.convert("RGB"),ImageCms.ImageCmsProfile(io.BytesIO(icc)),ImageCms.createProfile("sRGB"),outputMode="RGB")
            except Exception:a=a.convert("RGB")
        else:a=a.convert("RGB")
        w,h=a.size
        for name,cx,cy in targets:
            size=min(540,w,h)
            x=max(0,min(w-size,round(w*cx-size/2)))
            y=max(0,min(h-size,round(h*cy-size/2)))
            patch=a.crop((x,y,x+size,y+size))
            out=OUT/(mod+"-"+name+".png")
            patch.save(out,format="PNG")
            report.append({"module_id":mod,"source_sha256":sha,"subject":name,
                           "source_rect":[x,y,size,size],"normalized_focal":[cx,cy],
                           "native_pixels_no_rescaling":True,"preview":str(out.relative_to(R)),
                           "visual_judgement":"PENDING, not automated"})
(OUT/"subject-detail-manifest.json").write_text(json.dumps(report,indent=2)+"\n")
print("Targeted native-pixel details created:",len(report))
