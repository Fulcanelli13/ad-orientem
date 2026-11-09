#!/usr/bin/env python3
"""M44: visual evidence montage, not an automated music certification.

The original 1961 print crop is always visually and provably separate from
the Exsurge-generated GABC SVG. Preserve source pixels, no AI enlargement,
no claims of glyph-by-glyph parity from this illustrative montage.
"""
from __future__ import annotations
import hashlib
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def composite(panels, target, title):
    originals = [(name, Image.open(path).convert("RGB"), path) for name, path in panels]
    pad, caption, header = 24, 40, 65
    width = max(800, *(im.width for _, im, _ in originals)) + 2*pad
    height = header + sum(im.height + caption + pad for _, im, _ in originals)
    image = Image.new("RGB", (width, height), "#fff")
    pen = ImageDraw.Draw(image)
    pen.text((pad, 20), title, fill="#111")
    y = header
    rows = []
    for name, im, path in originals:
        pen.text((pad, y), name + " | native pixel dimensions: " + str(im.size), fill="#111")
        y += caption
        image.paste(im,(pad,y))
        rows.append({"label":name,"origin_file":path.name,"sha256":sha(path),
                     "pixels":[im.width,im.height],"montage_top":y})
        y += im.height + pad
    image.save(target,"PNG",optimize=True)
    return {"name":target.name,"sha256":sha(target),"rows":rows,
            "composite_is_not_pixel_registration":True}

def main():
    root=Path(sys.argv[1]) if len(sys.argv)>1 else Path("artifacts/schola-m44-exsurge")
    orig=Path(sys.argv[2]) if len(sys.argv)>2 else Path("artifacts/schola-m44-original")
    original_manifest=json.loads((orig/"manifest.json").read_text("utf8"))
    expected="119b084b5c0689fc3e87541143731f6526c404a018bc97d18e8c98a7635ce2bd"
    assert original_manifest["primary"]["sha256"]==expected, "Unexpected original 1961 source PDF: evidence held"
    assert original_manifest["primary"]["printed_folio"]=="54*"
    assert original_manifest["primary"]["render_dpi"]==420
    assert original_manifest["primary"]["render_width_px"]==2520
    assert original_manifest["primary"]["render_height_px"]==3780
    out=[]
    out.append(composite([
        ("Original 1961 Solesmes print p.54*: two Kyrie staff systems",orig/"kyrie-full-two-staff-systems.png"),
        ("Exsurge GABC render at 720 px: NOT original printed source",root/"kyrie-xvi-exsurge-720px.png")
    ],root/"m44-original1961-versus-exsurge720.png","Kyrie XVI | original 1961 scan vs Exsurge rendered source reference"))
    out.append(composite([
        ("Original 1961 Solesmes print p.54*: isolated final son/cadence",orig/"kyrie-final-son-and-cadence.png"),
        ("Exsurge GABC source render at 374 px (full chant)",root/"kyrie-xvi-exsurge-374px.png")
    ],root/"m44-terminal-son-original-versus-exsurge374.png","Kyrie XVI | terminal engraving comparison – NOT editor-certified"))
    out.append(composite([
        ("Exsurge at approx. 320 px reader width (304 px engraving)",root/"kyrie-xvi-exsurge-304px.png"),
        ("Exsurge at approx. 390 px reader width (374 px engraving)",root/"kyrie-xvi-exsurge-374px.png"),
    ],root/"m44-phone-width-exsurge-304-374.png","Kyrie XVI | same GABC, two phone engraving widths"))
    report={
      "schema":"ao-schola-m44-original-v-rendered-evidence-montage-v1",
      "scoreId":"GREGOBASE-545",
      "originalPrintSourceSha256":expected,
      "renderingNotCertification":True,
      "publishingApproval":False,
      "audioApproval":False,
      "originalScansNotPublicWebsiteAssets":True,
      "montages":out
    }
    (root/"comparison-manifest.json").write_text(json.dumps(report,indent=2)+"\n",encoding="utf8")
    print("M44 COMPARISON",json.dumps({"sourcePdfSha256":expected,
                                   "montages":[{"name":x["name"],"sha256":x["sha256"]} for x in out]}))
if __name__=="__main__":
    main()
