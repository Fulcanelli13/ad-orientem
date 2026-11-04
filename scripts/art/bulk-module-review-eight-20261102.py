#!/usr/bin/env python3
"""Reproduce eight whole approved *source paintings* in one bulk visual review.
No crop is made into a production asset and no publication authorization is inferred.
Uses only the exact, previously archived original Git blobs; no network image download.
"""
import base64
import hashlib
import io
import json
import os
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[2]
ARCHIVE=ROOT/"data/research/module-hero-20-exact-source-archive-20261102.v1.json"
OUT=ROOT/"artifacts/module-hero-bulk-review-eight"
IDS=["joseph","regina","scripture","souls","morning","visit","confession","sorrows"]
OUT.mkdir(parents=True,exist_ok=True)
source=json.loads(ARCHIVE.read_text(encoding="utf-8"))
rows={r["module"]:r for r in source["records"]}
assert len(IDS)==8 and len(set(IDS))==8
font_path="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
def font(n):
    try:return ImageFont.truetype(font_path,n)
    except:return ImageFont.load_default()
def data_jpg(im,max_side=980,quality=82):
    im=ImageOps.exif_transpose(im)
    small=im.copy();small.thumbnail((max_side,max_side),Image.Resampling.LANCZOS)
    if small.mode!="RGB":small=small.convert("RGB")
    buf=io.BytesIO();small.save(buf,format="JPEG",quality=quality,optimize=True)
    return "data:image/jpeg;base64,"+base64.b64encode(buf.getvalue()).decode("ascii")
def fit_panel(im,width,height,method="contain"):
    im=ImageOps.exif_transpose(im).convert("RGB")
    if method=="cover":return ImageOps.fit(im,(width,height),Image.Resampling.LANCZOS,centering=(.5,.5))
    bg=Image.new("RGB",(width,height),(9,16,21))
    copied=ImageOps.contain(im,(width,height),Image.Resampling.LANCZOS)
    bg.paste(copied,((width-copied.width)//2,(height-copied.height)//2))
    return bg

report=[];preview=[]
cards=[]
sheet=Image.new("RGB",(1300,8*345+130),(9,16,21))
paint=ImageDraw.Draw(sheet)
paint.text((28,22),"AD ORIENTEM  /  8 APPROVED PAINTINGS  /  ORIGINAL SOURCE REVIEW",font=font(22),fill=(235,223,203))
paint.text((28,58),"Art identities approved. Framing/photographic reproductions NOT approved for release.",font=font(15),fill=(185,174,151))
for idx,module in enumerate(IDS):
    r=rows[module]
    assert r["sourcePresent"] and not r["holds"] and r["path"],(module,r["holds"])
    path=ROOT/r["path"]
    raw=path.read_bytes()
    sha=hashlib.sha256(raw).hexdigest()
    assert sha==r["expectedSHA256"],f"Original checksum mismatch for {module}"
    assert len(raw)==r["sourceBytes"],f"Original size mismatch for {module}"
    with Image.open(io.BytesIO(raw)) as inp:
        inp.load()
        original=ImageOps.exif_transpose(inp.convert("RGB"))
    w,h=original.size
    assert w>1000 and h>1000,(module,w,h)
    t=data_jpg(original)
    name=r["title"]
    record={"module":module,"artist":r["artist"],"title":name,"sourcePage":r.get("originalSourcePage"),"sha256":sha,"sizeBytes":len(raw),"width":w,"height":h,"specificHolds":r["holds"],"wholePaintingPreserved":True,"reviewStatus":"PENDING_PHOTO_AND_FRAMING_APPROVAL","productionReleased":False}
    report.append(record)
    preview.append({"module":module,"image":t,**record})
    y=110+idx*345
    paint.rounded_rectangle((24,y,1270,y+323),radius=14,fill=(18,27,33))
    paint.text((43,y+14),f"{idx+1:02d}  {module.upper()}: {name[:55]}",font=font(18),fill=(241,228,205))
    paint.text((43,y+42),f"{r['artist'][:56]}   {w} × {h} px",font=font(13),fill=(175,185,188))
    whole=fit_panel(original,340,240)
    cover=fit_panel(original,340,240,"cover")
    wide=fit_panel(original,340,240)
    for x,im,label in [(40,whole,"WHOLE / contain"),(458,cover,"COVER / illustrative only"),(876,wide,"WHOLE / 390px style")]:
        sheet.paste(im,(x,y+76))
        paint.text((x+6,y+315),label,font=font(13),fill=(194,201,203))
assert len(report)==8
sheet.save(OUT/"eight-artworks-whole-vs-cover.jpg",quality=86,subsampling=0,optimize=True)
(OUT/"verified-source-report.json").write_text(json.dumps({"schema":"AO_MODULE_HERO_BULK_EIGHT_VISUAL_QA_V1","status":"VISUAL_REVIEW_NOT_PUBLICATION","count":len(report),"sourceBranch":"research/approved-module-20-source-consolidation-20261102","records":report},indent=2)+"\n",encoding="utf-8")

cards_html=[]
for entry in preview:
    module=entry["module"]
    title=entry["title"].replace("&","&amp;").replace("<","&lt;")
    artist=entry["artist"].replace("&","&amp;").replace("<","&lt;")
    image=entry["image"]
    cards_html.append(f'''
    <section class="review" data-module="{module}">
      <div class="header"><span class="number">{IDS.index(module)+1:02d} / 08</span><h2>{title}</h2><p>{artist}</p></div>
      <div class="pair"><div class="panel"><div class="panel-label">Complete original · exact archived image</div><img src="{image}" alt="Full painting: {title}" class="whole"/></div>
        <div class="panel"><div class="panel-label">Mobile artwork placement · illustrative, not app UI</div><div class="phone"><div class="art"><img src="{image}" alt="{title}" class="preview-art"/></div><div class="caption">AD ORIENTEM · {module.upper()}</div><div class="faux-title">{title}</div><div class="faux-foot">Source painting preserved · framing in review</div></div></div></div>
      <div class="controls"><label>Fit <select class="fit"><option value="contain">Contain (no image crop)</option><option value="cover">Cover (visual crop only)</option></select></label><label>Horizontal focus <input class="focusX" type="range" min="0" max="100" value="50"/></label><label>Vertical focus <input class="focusY" type="range" min="0" max="100" value="50"/></label><label>Photograph and framing <select class="decision"><option value="pending">Pending review</option><option value="approve">Approve this reproduction &amp; framing</option><option value="adjust">Needs crop / source adjustment</option><option value="reject_photo">Reject photo, retain painting</option></select></label></div>
      <div class="meta"><span>{entry["width"]}×{entry["height"]} px · {(entry["sizeBytes"]/1e6):.2f} MB</span><code>SHA-256 {entry["sha256"]}</code><a href="{entry["sourcePage"] or '#'}" target="_blank" rel="noopener">Original provenance record</a></div>
    </section>
    ''')
html=r'''<!doctype html><html lang="en"><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Ad Orientem · Eight approved module paintings · full-source photo review</title>
<style>
:root{color-scheme:dark;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;--paper:#e1d5c0;--mute:#a4b1b9}
*{box-sizing:border-box}body{margin:0;background:#090e13;color:var(--paper)}main{max-width:1120px;margin:auto;padding:20px}
header{padding:26px 0 18px;border-bottom:1px solid #31404a}h1{font-family:Georgia,serif;font-size:clamp(28px,4vw,42px);margin:12px 0}header p{line-height:1.55;color:var(--mute);max-width:770px}
.a{letter-spacing:.16em;text-transform:uppercase;font-size:11px;color:#d0b687}.count{display:flex;gap:20px;font-size:14px;margin:18px 0}.count strong{font-size:24px;display:block;color:#e9c99a}
.review{border:1px solid #2d3943;border-radius:15px;background:#111a22;margin:26px 0;padding:22px}
.header h2{font-family:Georgia,serif;font-weight:400;font-size:27px;margin:7px 0}.header p{color:var(--mute);margin:0 0 18px}
.number{font-size:12px;color:#dfbd80}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}.panel{padding:14px;background:#0a1118;border-radius:10px;display:flex;flex-direction:column}.panel-label{font-size:12px;letter-spacing:.04em;color:#b9c6ca;margin-bottom:12px}
.whole{max-width:100%;width:100%;max-height:455px;object-fit:contain;margin:auto}
.phone{border:1px solid #374753;border-radius:24px;background:#061019;box-shadow:0 12px 30px #0006;width:min(100%,330px);margin:auto;padding:10px;overflow:hidden}
.art{height:285px;display:flex;align-items:center;justify-content:center;background:#081019;border-radius:17px;overflow:hidden}
.preview-art{width:100%;height:100%;object-fit:contain;object-position:50% 50%}
.caption{font-size:10px;color:#ceb287;letter-spacing:.2em;padding:16px 12px 4px}.faux-title{font-family:Georgia,serif;font-size:24px;padding:0 12px}.faux-foot{font-size:11px;color:#8195a1;padding:12px}
.controls{display:grid;grid-template-columns:repeat(4,minmax(160px,1fr));gap:13px;margin:20px 0}
label{font-size:12px;color:#bac5cf;display:grid;gap:7px}select,input{color:#e8e0d3;background:#1c2a33;border:1px solid #41525d;border-radius:7px;padding:8px;max-width:100%;font:inherit}input[type=range]{padding:6px}
.meta{display:flex;flex-wrap:wrap;gap:12px 26px;color:#95a6b0;font-size:12px}.meta code{font-size:10px;overflow-wrap:anywhere}.meta a{color:#e4c99b}
.actions{position:sticky;bottom:0;background:#111f29f5;padding:14px;border-top:1px solid #40535e;display:flex;gap:12px;align-items:center;z-index:5}
button{background:#d8be8d;border:0;color:#12202b;border-radius:8px;padding:12px 16px;font-weight:650;cursor:pointer}
small{color:#b8c3ca;line-height:1.4}
@media(max-width:770px){.pair{grid-template-columns:1fr}.controls{grid-template-columns:1fr 1fr}main{padding:12px}.review{padding:14px}.actions{align-items:stretch;flex-direction:column}.meta{gap:9px}}
</style><main>
<header><div class="a">Ad Orientem · Sacred Art · Batch 02</div><h1>Eight approved paintings — reproduction review</h1>
<p>These paintings have already been selected. This review checks the exact archived photographic reproductions, without choosing new artworks. The images are 1:1 <em>whole-scene previews</em> generated from original files whose SHA-256 hashes were verified. The phone cards are illustrative artwork framing tests, not a claim to reproduce the app UI.</p>
<div class="count"><div><strong>8</strong>selected originals</div><div><strong>0</strong>new art selections</div><div><strong>0</strong>photos released by this review</div></div></header>
'''+"\n".join(cards_html)+r'''
<div class="actions"><button id="download">Export eight review decisions (JSON)</button><small>Choose a decision for each painting; approval means this specific source photograph and selected framing, not a change to the painting identity.</small></div>
<script>
for(const section of document.querySelectorAll(".review")){
 const art=section.querySelector(".preview-art"),fit=section.querySelector(".fit"),x=section.querySelector(".focusX"),y=section.querySelector(".focusY");
 const update=()=>{art.style.objectFit=fit.value;art.style.objectPosition=x.value+"% "+y.value+"%"};
 for(const input of [fit,x,y])input.addEventListener("input",update);update();
}
document.querySelector("#download").addEventListener("click",()=>{
 const decisions=[...document.querySelectorAll(".review")].map(s=>({module:s.dataset.module,decision:s.querySelector(".decision").value,fit:s.querySelector(".fit").value,focusX:Number(s.querySelector(".focusX").value),focusY:Number(s.querySelector(".focusY").value)}));
 const payload={schema:"AO_MODULE_HERO_EIGHT_PHOTO_REVIEW_DECISIONS_V1",scope:"approved-artwork-reproduction-and-crop-only",decisions};
 const a=document.createElement("a"),url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}));
 a.href=url;a.download="AO_8_module_art_photo_review.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
</script></main></html>'''
(OUT/"review-eight-originals.html").write_text(html,encoding="utf-8")
print("PASS eight source bytes SHA-256; eight true originals rendered; QA review pack generated",len(html),len(report))
