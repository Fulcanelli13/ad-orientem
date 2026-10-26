#!/usr/bin/env python3
"""Build a self-contained offline review surface on the isolated research branch.
This is NOT the app and cannot release the artwork.
"""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import hashlib, json, html

ROOT=Path.cwd()
DIR=ROOT/"assets/staged/champaigne-petite-cene-research"
SOURCE=DIR/"C-canvas-interior-clean-ungraded-source-derived.jpg"
ORIGINAL=DIR/"tangopaso-museum-original.jpg"
FALLBACK=DIR/"whole-commons-original.jpg"
EXPECTED={
  SOURCE:"99e102df2d3644783bce3ac4cb81002337f8eb166583d84f74c630be6a8efc0f",
  ORIGINAL:"3fce64afc767c16b803fd250e685f3a64caedb7e474380d3afeca68d84331942",
  FALLBACK:"d4d8b3c1ea957c9517a24c62a97ab7143e07cdec2434c77ee05df17a5b29a320"
}
for p,sha in EXPECTED.items():
    if hashlib.sha256(p.read_bytes()).hexdigest()!=sha:raise ValueError("Source SHA mismatch: "+str(p))
with Image.open(SOURCE) as im:
    if im.size!=(2250,1208):raise ValueError("Preview source format unexpectedly changed")
    painting=im.convert("RGB")

# Actual source-native pixels near each outside edge; no visual smoothing.
edge=DIR/"C-frame-free-perimeter-inspection.png"
thickness=85
samples={
  "top":(0,0,2250,thickness),
  "bottom":(0,1208-thickness,2250,1208),
  "left":(0,0,thickness,1208),
  "right":(2250-thickness,0,2250,1208)
}
sheet=Image.new("RGB",(2320,710),"#eeeeee")
draw=ImageDraw.Draw(sheet)
y=26
for lab in ["top","bottom"]:
    z=painting.crop(samples[lab]); # Render at native width, no interpolation
    sheet.paste(z,(35,y+22))
    draw.text((35,y),lab+" - original pixel edge strip; CHECK FOR PHYSICAL FRAME",fill="#111111")
    y+=143
for i,lab in enumerate(["left","right"]):
    z=painting.crop(samples[lab]);z.thumbnail((85,325))
    sheet.paste(z,(35+i*180,y+25))
    draw.text((35+i*180,y),lab,fill="#111111")
sheet.save(edge)
# The research UI includes both sources for side-by-side fidelity judgement.
html_doc="""<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ad Orientem · Champaigne photo-source fidelity QA</title>
<style>
:root{color-scheme:dark;background:#080c12;color:#e1dfd8;font-family:Georgia,serif}
*{box-sizing:border-box}body{margin:0}main{max-width:1100px;margin:0 auto;padding:18px}
header{border-bottom:1px solid #343633;padding:12px 0 20px}
.eyebrow{font:10px/1.6 sans-serif;letter-spacing:.25em;text-transform:uppercase;color:#aa9b80}
h1{font-size:clamp(21px,3.5vw,36px);font-weight:400;margin:10px 0}
p{color:#bcb8ad;line-height:1.55;font-size:14px}
.artwork{margin:20px 0 9px;width:100%;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#0e1216;border:0}
.artwork img{display:block;width:100%;height:auto;object-fit:contain;max-width:100%;background:#0e1216}
.caption{font:11px/1.5 sans-serif;color:#aaa79d;letter-spacing:.04em}
section{margin-top:32px;padding-top:14px;border-top:1px solid #3a3935}
section h2{font:normal 17px/1.3 Georgia;margin:10px 0 14px}
.comparison{display:grid;grid-template-columns:1fr 1fr;gap:18px}
figure{margin:0}figure img{width:100%;height:auto;display:block;object-fit:contain}
figcaption{color:#aaa79d;font:11px/1.4 sans-serif;padding:8px 0}
button{background:transparent;color:#ddd3bd;border:1px solid #736954;font:12px Georgia;padding:10px 16px}
#fullview{display:none;background:#080a0d;position:fixed;inset:0;z-index:9;overflow:auto;padding:35px 12px}
#fullview.active{display:flex;flex-direction:column;align-items:center;justify-content:center}
#fullview img{display:block;width:auto;max-width:100%;max-height:calc(100vh - 100px);height:auto;object-fit:contain}
#fullview button{align-self:flex-end}
@media(max-width:460px){main{padding:10px}header{padding:14px 5px}.comparison{grid-template-columns:1fr}section{margin-top:24px}.artwork{margin:16px 0 8px}}
@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
</style></head>
<body><main>
<header><div class="eyebrow">Editorial artwork quality research · Not published</div>
<h1>La Petite Cène</h1>
<p>Philippe de Champaigne · Louvre INV 1125 · Shared Holy Thursday and Pentecost Ember Wednesday painting.
This is a research-only responsive test, not the live Ad Orientem Calendar.</p></header>
<figure class="artwork" id="hero"><img src="C-canvas-interior-clean-ungraded-source-derived.jpg"
alt="Philippe de Champaigne, La Petite Cène — complete unframed painting candidate" width="2250" height="1208"></figure>
<div class="caption">Entire painted composition. Source-based, not AI restored. Colour and boundary fidelity pending.</div>
<p><button id="openfull" type="button">Inspect full painting</button></p>
<section><h2>Source comparison</h2><div class="comparison">
<figure><img src="whole-commons-original.jpg" alt="Existing 1112 pixel full-painting photograph" width="1112" height="591">
<figcaption>Existing small frame-free source, 1112 × 591</figcaption></figure>
<figure><img src="C-canvas-interior-clean-ungraded-source-derived.jpg"
alt="New 2250 pixel frame-free candidate" width="2250" height="1208">
<figcaption>New source-based frame-free candidate, 2250 × 1208</figcaption></figure>
</div></section>
<section><h2>Actual outer boundary review</h2>
<img src="C-frame-free-perimeter-inspection.png" style="display:block;width:100%;height:auto;object-fit:contain" alt="Native-pixel perimeter inspection strips" width="2320" height="710">
<p>Native-pixel perimeter details. This screen does not certify painted boundaries or colour.</p></section>
</main>
<div id="fullview" role="dialog" aria-modal="true" aria-label="Full painting inspection">
<button type="button" id="closefull">Close</button>
<img src="C-canvas-interior-clean-ungraded-source-derived.jpg" alt="Entire unframed La Petite Cène photograph" width="2250" height="1208"></div>
<script>
const view=document.getElementById("fullview"), open=document.getElementById("openfull");
open.addEventListener("click",()=>{view.classList.add("active");document.getElementById("closefull").focus()});
document.getElementById("closefull").addEventListener("click",()=>{view.classList.remove("active");open.focus()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){view.classList.remove("active");open.focus()}});
</script></body></html>"""
view=DIR/"mobile-desktop-visual-qa.html"
view.write_text(html_doc,encoding="utf-8")
record={"kind":"SOURCE-PHOTO RESEARCH UI, NOT LIVE AD ORIENTEM",
 "source_sha256":EXPECTED[SOURCE],"source_size":[2250,1208],
 "html":str(view.relative_to(ROOT)),"edge_contact_sheet":str(edge.relative_to(ROOT)),
 "contains_full_painting":True,"CSS_fit":"contain",
 "pixel_bounds_approved":False,"colour_approved":False,"rights_signed_off":False,
 "publication_approved":False}
(DIR/"ui-review-manifest.json").write_text(json.dumps(record,indent=2)+"\n")
print("Prepared offline research preview and native-pixel edge strips")
