#!/usr/bin/env python3
"""M49: transient original 1961 Kyrie XVIII printed staff evidence at 420dpi.

Independent original-print evidence, NOT an Exsurge render or editorial seal.
Never commit or deploy the source scans. Short-retention GitHub artifact only.
"""
from __future__ import annotations
import argparse
import hashlib
import io
import json
import sys
import urllib.request
from pathlib import Path

SOURCE = "https://media.churchmusicassociation.org/pdf/kyriale-solesmes.pdf"
SECONDARY = "https://gregobase.selapa.net/sources/2/934.png"
PDF_SHA256 = "119b084b5c0689fc3e87541143731f6526c404a018bc97d18e8c98a7635ce2bd"
PAGE = 58  # zero-based PDF page 59, printed Graduale Romanum folio 57*
DPI = 420
CROPS = {
    "kyrie-xviii-complete-printed-score": (0.112, 0.558, 0.91, 0.895),
    "kyrie-xviii-first-printed-staff": (0.132, 0.704, 0.873, 0.792),
    "kyrie-xviii-second-printed-staff": (0.130, 0.796, 0.876, 0.875),
    "kyrie-xviii-printed-opening-and-christe": (0.136, 0.704, 0.868, 0.785),
    "kyrie-xviii-final-phrase-neumes": (0.337, 0.785, 0.880, 0.879),
}
UA = "AdOrientem-M49-Original-Printed-Source-Capture/1.0"

def download(url: str, minimum: int) -> bytes:
    req=urllib.request.Request(url, headers={"User-Agent":UA,"Accept":"*/*"})
    with urllib.request.urlopen(req, timeout=45) as response:
        data=response.read(150*1024*1024+1)
        code=response.status
    if code!=200 or not (minimum<=len(data)<=150*1024*1024):
        raise ValueError(f"Source not usable: HTTP {code}, {len(data)} bytes")
    return data

def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def crop_fraction(im, rect):
    w,h=im.size
    x0,y0,x1,y1=rect
    assert 0<=x0<x1<=1 and 0<=y0<y1<=1
    return im.crop((round(x0*w),round(y0*h),round(x1*w),round(y1*h)))

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--output",default="artifacts/schola-m49-original-1961")
    args=ap.parse_args()
    out=Path(args.output)
    out.mkdir(parents=True,exist_ok=True)
    from PIL import Image
    import fitz
    raw=download(SOURCE,100000)
    if not raw.startswith(b"%PDF-") or sha(raw)!=PDF_SHA256:
        raise RuntimeError("Unexpected original 1961 source PDF; refuse evidence")
    pdf=fitz.open(stream=raw,filetype="pdf")
    if len(pdf)!=162: raise RuntimeError("Unexpected page count")
    page=pdf[PAGE]
    pix=page.get_pixmap(matrix=fitz.Matrix(DPI/72,DPI/72),
                        alpha=False,colorspace=fitz.csRGB)
    img=Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
    if img.size!=(2520,3780):
        raise RuntimeError(f"Unexpected page geometry: {img.size}")
    records=[]
    for name, rect in CROPS.items():
        excerpt=crop_fraction(img,rect)
        path=out/(name+".png")
        excerpt.save(path,format="PNG",optimize=True)
        records.append({"name":path.name,"type":"ORIGINAL_1961_PDF_RENDER",
                        "pixels":list(excerpt.size),"sha256":sha(path.read_bytes()),
                        "crop_fractions":list(rect),"sourcePage":PAGE+1})
    # The GregoBase printed witness is independent raster delivery of the
    # same historical page. It does not grant new pixel resolution.
    try:
        raw_png=download(SECONDARY,1000)
        if not raw_png.startswith(bytes.fromhex("89504e470d0a1a0a")):
            raise RuntimeError("Secondary source was not PNG")
        im=Image.open(io.BytesIO(raw_png)).convert("RGB")
        path=out/"kyrie-xviii-gregobase-original-printed-page.png"
        im.save(path,format="PNG",optimize=True)
        records.append({"name":path.name,"type":"SECONDARY_ORIGINAL_PAGE_RASTER",
                        "pixels":list(im.size),"sha256":sha(path.read_bytes()),
                        "source":SECONDARY,"upsampled":False})
    except Exception as error:
        records.append({"name":"secondary-source","retrieved":False,
                        "reason":str(error)[:240]})
    manifest={
      "schema":"ao-schola-m49-original-1961-cropped-print-evidence-v1",
      "score":"GREGOBASE-2522","printedFolio":"57*",
      "pdfPageOneBased":PAGE+1,"pdfSha256":sha(raw),
      "renderDpi":DPI,"renderPx":list(img.size),"fileCount":len(records),
      "imagesNotCommittedOrDeployed":True,
      "cropPixelsAreNotIndependentlyVerifiedNativeScanResolution":True,
      "physicalInkNoteByNoteCertified":False,
      "purpose":"Independent human/editorial review of source noteheads and signs",
      "files":records}
    (out/"manifest.json").write_text(json.dumps(manifest,indent=2)+"\n",
                                      encoding="utf-8")
    print("M49 original printed score captured:",
          json.dumps({"printedFolio":"57*","page":PAGE+1,
                      "sourceSha256":sha(raw),"images":records}))

if __name__=="__main__":
    try: main()
    except Exception as error:
        print("M49 FAIL CLOSED:",error,file=sys.stderr)
        raise
