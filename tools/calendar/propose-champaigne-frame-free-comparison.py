#!/usr/bin/env python3
"""Create NON-RELEASED frame-free photo proposals from a PD-self original.

Manual painting-edge quadrilaterals defined in original image pixel coordinates.
Pillow QUAD operation corrects mild camera keystone while retaining content from
the photographed canvas; no inpainting, generative fill, colour or detail edits.
Human must verify ALL painted edges at original source and museum reference.
"""
import hashlib, io, json
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps
ROOT=Path.cwd()
BASE=ROOT/"assets/staged/champaigne-petite-cene-research"
ORIGINAL=BASE/"tangopaso-museum-original.jpg"
MANIFEST=BASE/"frame-free-proposals.json"
EXPECTED="3fce64afc767c16b803fd250e685f3a64caedb7e474380d3afeca68d84331942"
raw=ORIGINAL.read_bytes()
sha=hashlib.sha256(raw).hexdigest()
if sha!=EXPECTED:raise ValueError("Full original photograph hash mismatch")
with Image.open(io.BytesIO(raw)) as source:
    im=ImageOps.exif_transpose(source).convert("RGB")
if im.size!=(2816,2112):raise ValueError("Unexpected photo orientation or dimensions: "+str(im.size))
# Order: upper left, lower left, lower right, upper right.
# A follows visible canvas boundaries conservatively; B is only a tight
# diagnostic comparison, NOT an approved replacement.
quads={
 "A-complete-edge-approx":{"tl":[251,429],"bl":[245,1688],"br":[2571,1691],"tr":[2560,425]},
 "B-inset-quality-diagnostic":{"tl":[270,450],"bl":[268,1669],"br":[2549,1672],"tr":[2545,446]},
 "C-canvas-interior-clean":{"tl":[272,453],"bl":[270,1654],"br":[2537,1655],"tr":[2536,451]}
}
out=[]
overlay=im.copy();mark=ImageDraw.Draw(overlay)
for k,q in quads.items():
    points=[q["tl"],q["tr"],q["br"],q["bl"],q["tl"]]
    mark.line([tuple(p) for p in points],fill="#fef5b1" if k.startswith("A") else "#e34545",width=8)
for name,q in quads.items():
    coordinates=tuple(value for pt in [q["tl"],q["bl"],q["br"],q["tr"]] for value in pt)
    target=(2250,1208) # preserves actual painting 149:80 aspect ratio within <0.2%
    ungraded=im.transform(target,Image.Transform.QUAD,coordinates,
                          resample=Image.Resampling.BICUBIC)
    dest=BASE/(name+"-ungraded-source-derived.jpg")
    ungraded.save(dest,"JPEG",quality=94,subsampling=0)
    preview=ungraded.copy();preview.thumbnail((1200,850),Image.Resampling.LANCZOS)
    view=BASE/(name+"-full-preview.jpg");preview.save(view,"JPEG",quality=90,subsampling=0)
    out.append({"candidate":name,"quad_source_pixels":q,"target_size":target,
         "master_original_sha256":sha,"derivative_sha256":hashlib.sha256(dest.read_bytes()).hexdigest(),
         "original_saved":str(ORIGINAL.relative_to(ROOT)),
         "derivative_research_only":str(dest.relative_to(ROOT)),
         "preview_path":str(view.relative_to(ROOT)),
         "untouched_painting_source_retained":True,"perspective_only_sampling":True,
         "colour_tone_grading":False,"synthetic_fill":False,"ai_detail_enhancement":False,
         "human_painted_bounds_and_full_composition_verified":False,
         "production_release_approved":False})
overlay.thumbnail((1300,1000),Image.Resampling.LANCZOS)
overlay_path=BASE/"quad-boundary-visual-review.jpg"
overlay.save(overlay_path,"JPEG",quality=90)
MANIFEST.write_text(json.dumps({
 "schema":"AO_CHAMPAIGNE_INV1125_CROP_PROPOSAL_NOT_PUBLICATION",
 "source":"commons photographer Tangopaso public-domain dedication",
 "photo_has_physical_frame":True,
 "proposal_A":"Likely includes most/all canvas; corner precision still requires manual checking",
 "proposal_B":"Slightly inset diagnostic, faint frame trace may remain",
 "proposal_C":"Manual refinement aims to remove physical frame entirely while retaining visible painted surface. Still requires final edge and museum reference review.",
 "camera_geometry_corrected_with_interpolation":True,
 "color_reference_checked":False,
 "app_asset_promotion":False,
 "review_overlay":str(overlay_path.relative_to(ROOT)),
 "candidates":out},indent=2)+"\n")
print("Created 3 unapproved review proposals; original unchanged.")
