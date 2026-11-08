#!/usr/bin/env python3
"""Research-only extraction: preserve original 1961 printed evidence; NO music certification."""
from __future__ import annotations
import hashlib, json
from pathlib import Path
from urllib.request import Request, urlopen
import fitz
from PIL import Image

ROOT=Path(".tmp/mass-preface-1961-print-ictus-evidence")
ROOT.mkdir(parents=True,exist_ok=True)
SOURCES={
 "GR_1961_132star":"https://media.churchmusicassociation.org/pdf/kyriale-solesmes.pdf",
 "LU_1961_110":"https://gregobase.selapa.net/sources/3/221.png",
}
def fetch(uri):
 req=Request(uri,headers={"User-Agent":"Mozilla/5.0 (compatible; AdOrientemResearch/1.0)"})
 with urlopen(req,timeout=60) as response:
  payload=response.read()
 if len(payload)<10000:raise RuntimeError(f"Unusually small original source: {uri} {len(payload)} bytes")
 return payload
record={
 "schema":"ao-preface-1961-original-staff-highres-crops-v1",
 "purpose":"Evidence for HUMAN comparison of Solemnior Et cum spiritu tuo at syllable spí; not musical approval",
 "printedReadings":{"primaryGabc":"spí(g)","alternateGabc":"spí(g')","sourceInterpretation":"Vertical episema only; no pitch change"},
 "evidence":[]
}
pdf=fetch(SOURCES["GR_1961_132star"])
(ROOT/"source-gr-1961-kyriale.sha256").write_text(hashlib.sha256(pdf).hexdigest()+"  kyriale-solesmes.pdf\n")
document=fitz.open(stream=pdf,filetype="pdf")
p=133
if document.page_count<=p:raise RuntimeError("GR PDF no longer contains page 134")
page=document.load_page(p)
w,h=page.rect.width,page.rect.height
# Normalized coordinates grounded in the original 1961 printed 132* folio.
# Inclusion boxes deliberately contain context on both sides of "spí".
clips={
 "GR132_full_preface_response":(0.18,0.285,0.97,0.365),
 "GR132_et_cum_staff":(0.47,0.285,0.86,0.36),
 "GR132_spi_neume_context":(0.59,0.29,0.72,0.35),
}
for name,(x0,y0,x1,y1) in clips.items():
 rect=fitz.Rect(x0*w,y0*h,x1*w,y1*h)
 # Clip-render from original PDF raster directly at up to 864 dpi; no interpolation.
 pix=page.get_pixmap(matrix=fitz.Matrix(12,12),clip=rect,alpha=False)
 path=ROOT/(name+".png");pix.save(path)
 record["evidence"].append({
  "name":name,"sourceUrl":SOURCES["GR_1961_132star"],
  "sourcePdfPageZeroBased":p,"physicalPrintedPage":"132*",
  "pdfPageSizePt":[w,h],"clipNormalized":[x0,y0,x1,y1],
  "renderDpi":864,"pixelSize":[pix.width,pix.height],
  "imageFile":path.name,"sha256":hashlib.sha256(path.read_bytes()).hexdigest(),
  "reviewStatus":"ORIGINAL_PRINT_IMAGE_CAPTURED_NOT_INTERPRETED"
 })
(ROOT/"GR132_source_1961.png").write_bytes(b"") if False else None
lu=fetch(SOURCES["LU_1961_110"])
p=ROOT/"LU110_original.png";p.write_bytes(lu)
im=Image.open(p).convert("RGB")
record["evidence"].append({
 "name":"LU110_original_page","sourceUrl":SOURCES["LU_1961_110"],
 "physicalPrintedPage":"110","pixelSize":list(im.size),
 "imageFile":p.name,"sha256":hashlib.sha256(lu).hexdigest(),
 "reviewStatus":"ORIGINAL_PRINT_IMAGE_CAPTURED_NOT_INTERPRETED"
})
# This source print groups the Preface dialogue in the upper-left third.
for name,box in {
 "LU110_et_cum_staff":(.06,.165,.68,.255),
 "LU110_spi_neume_context":(.13,.17,.51,.25)
}.items():
 rect=tuple(round(z*t) for z,t in zip(box,(im.width,im.height,im.width,im.height)))
 cropped=im.crop(rect);out=ROOT/(name+".png");cropped.save(out)
 record["evidence"].append({
 "name":name,"sourceUrl":SOURCES["LU_1961_110"],
 "physicalPrintedPage":"110","cropNormalized":list(box),
 "nativeCropPixelSize":list(cropped.size),"imageFile":out.name,
 "sha256":hashlib.sha256(out.read_bytes()).hexdigest(),
 "reviewStatus":"ORIGINAL_PRINT_IMAGE_CAPTURED_NOT_INTERPRETED"
 })
record["counts"]={"sourceBooks":2,"printStaffImageFiles":len(record["evidence"]),
 "fullyCertifiedVerticalEpisemata":0,"newPublicNotationApprovals":0}
(ROOT/"capture-manifest.json").write_text(json.dumps(record,indent=2)+"\n")
print("PASS original 1961 source images captured with hashes; GR PDF physical p.132* pdf index 133; LU p.110; ZERO musical certifications.")
print("EVIDENCE",json.dumps(record["counts"]))
