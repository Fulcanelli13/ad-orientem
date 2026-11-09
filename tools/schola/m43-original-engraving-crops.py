#!/usr/bin/env python3
"""Schola M43: capture original 1961 engraved Kyrie XVI as evidence-only crops.

No alteration of canonical GABC, no renderer-derived 'print' evidence, no
musical certification, and NO publication of source scans in the site bundle.
Outputs go exclusively into short-retention workflow artifacts.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import sys
import urllib.request
from pathlib import Path

SOURCE_PDF = "https://media.churchmusicassociation.org/pdf/kyriale-solesmes.pdf"
PRIMARY_PNG = "https://gregobase.selapa.net/sources/2/931.png"
LIBER_PNG = "https://gregobase.selapa.net/sources/3/170.png"
CHANTS_PNG = "https://gregobase.selapa.net/sources/5/55.png"
PDF_PAGE_INDEX = 55  # original printed p. 54*, PDF viewer page 56
DPI = 420
# x0,y0,x1,y1 as fractions of *original physical facsimile page*.
# Include substantial margins so cropped evidence cannot be misidentified.
CROPS = {
 "kyrie-full-two-staff-systems": (0.11, 0.18, 0.90, 0.405),
 "kyrie-first-staff": (0.115, 0.225, 0.875, 0.310),
 "kyrie-second-staff": (0.115, 0.310, 0.875, 0.395),
 "kyrie-closing-phrase": (0.365, 0.310, 0.755, 0.400),
 "kyrie-final-son-and-cadence": (0.580, 0.315, 0.765, 0.400),
}
UA = "AdOrientem-Research-Glyph-Collation/1.0 (original-source verification; editorial artifact only)"


def fetch(url: str, minimum: int = 10000) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=45) as response:
        raw = response.read(150 * 1024 * 1024 + 1)
        actual = response.headers.get("Content-Type", "")
        status = response.status
    if status != 200 or len(raw) < minimum or len(raw) > 150 * 1024 * 1024:
        raise RuntimeError(f"Source not usable: {url} HTTP={status}, bytes={len(raw)}")
    if url.endswith(".pdf") and not raw.startswith(b"%PDF-"):
        raise RuntimeError("Original primary source is not a PDF; fail closed")
    if url.endswith(".png") and not raw.startswith(bytes.fromhex("89504e470d0a1a0a")):
        raise RuntimeError("Original printed witness is not a PNG; fail closed")
    return raw


def sha(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


def normalized_crop(image, box):
    from PIL import Image
    w, h = image.size
    x0, y0, x1, y1 = box
    if not(0 <= x0 < x1 <= 1 and 0 <= y0 < y1 <= 1):
        raise RuntimeError(f"Invalid crop bounds: {box}")
    return image.crop((round(x0*w), round(y0*h), round(x1*w), round(y1*h)))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="artifacts/schola-m43-original-source")
    args = parser.parse_args()
    out = Path(args.output)
    out.mkdir(parents=True, exist_ok=True)

    import fitz
    from PIL import Image
    pdf_bytes = fetch(SOURCE_PDF, minimum=100000)
    pdf = fitz.open(stream=pdf_bytes, filetype="pdf")
    if len(pdf) != 162:
        raise RuntimeError(f"Unexpected original 1961 source page count: {len(pdf)}")
    page = pdf[PDF_PAGE_INDEX]
    pix = page.get_pixmap(matrix=fitz.Matrix(DPI/72, DPI/72), alpha=False, colorspace=fitz.csRGB)
    image = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
    # A final original page region must have enough native pixels for a
    # genuine multi-glyph visual review; enlarged low-res replicas do not count.
    if min(image.size) < 2800:
        raise RuntimeError(f"Primary render unexpectedly low resolution: {image.size}")
    records = []
    for name, rect in CROPS.items():
        crop = normalized_crop(image, rect)
        path = out / (name + ".png")
        crop.save(path, format="PNG", optimize=True)
        records.append({"id": name, "path": path.name, "crop_fraction": rect,
                        "width_px": crop.width, "height_px": crop.height,
                        "sha256": sha(path.read_bytes()),
                        "source": SOURCE_PDF, "pdf_page_1_based": PDF_PAGE_INDEX+1})
    witnesses = [
       ("graduale-1961-printed-p54", PRIMARY_PNG, (0.12,0.16,0.96,0.405)),
       ("liber-1961-printed-p59", LIBER_PNG, (0.10,0.535,0.96,0.785)),
       ("chants-1956-printed-p40", CHANTS_PNG, (0.10,0.420,0.98,0.605)),
    ]
    for name, url, rect in witnesses:
        try:
            raw=fetch(url,minimum=1000)
            original=Image.open(io.BytesIO(raw)).convert("RGB")
            clipped=normalized_crop(original,rect)
            path=out/(name+".png")
            clipped.save(path,format="PNG",optimize=True)
            records.append({"id":name,"path":path.name,"crop_fraction":rect,
                            "width_px":clipped.width,"height_px":clipped.height,
                            "sha256":sha(path.read_bytes()),"source":url,
                            "original_page_px":list(original.size),
                            "note":"Secondary raster image: never upsample and claim new detail"})
        except Exception as err:
            records.append({"id":name,"source":url,"status":"NOT_RETRIEVED",
                            "reason":str(err),"independent_confirmation":False})
    manifest={
       "schema":"ao-schola-m43-original-print-evidence-artifact-v1",
       "purpose":"transient editorial original-engraving crop review",
       "score":"GREGOBASE-545", "source_gabc_sha_fingerprint":"acef0d62",
       "primary":{"url":SOURCE_PDF,"sha256":sha(pdf_bytes),"pdf_page_index":PDF_PAGE_INDEX,
                  "printed_folio":"54*","page_count":len(pdf),
                  "render_dpi":DPI,"render_width_px":image.width,"render_height_px":image.height,
                  "embedded_raster_effective_resolution_independently_known":False},
       "license":"No rights cleared for public reproduction; artifact-only research excerpt",
       "never_commit_or_publish_to_site":True,
       "no_source_transcription_change":True,
       "no_print_sign_certification_granted":True,
       "records":records
    }
    (out/"manifest.json").write_text(json.dumps(manifest,indent=2)+chr(10),encoding="utf-8")
    print("M43 evidence: "+json.dumps({"page_pixels":image.size,
        "primary_sha256":sha(pdf_bytes),"files":[{"name":r["id"],"size":(r.get("width_px"),r.get("height_px")),
        "status":r.get("status","CAPTURED")} for r in records]},sort_keys=True))
    return 0

if __name__=="__main__":
    try:
        sys.exit(main())
    except Exception as error:
        print(f"M43 FAIL CLOSED: {error}",file=sys.stderr)
        raise
