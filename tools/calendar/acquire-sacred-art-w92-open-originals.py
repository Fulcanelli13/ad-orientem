#!/usr/bin/env python3
"""W92: source-image acquisition, not artwork approval or public release.
Existing ratings, selected paintings and app files are never read or modified.
"""
from __future__ import annotations
import hashlib
import importlib.util
import io
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[2]
INPUT = ROOT / "data/calendar/sacred-art-review-uploads/20261016-w92-open-original-image-recovery.v1.json"
OUT = ROOT / "artifacts/sacred-art-w92-open-originals"
HELPER = ROOT / "tools/calendar/acquire-sacred-art-unified-curator.py"
spec = importlib.util.spec_from_file_location("ao_sacred_art_existing_download", HELPER)
lib = importlib.util.module_from_spec(spec)
spec.loader.exec_module(lib)
Image.MAX_IMAGE_PIXELS = 200_000_000

def acquire(row):
    kind = row["sourceType"]
    info = {}
    if kind == "commons":
        info = lib.commons_info(row["sourceLocation"])
        if not info["licenseSupported"]:
            raise ValueError("Commons source lacks machine-verifiable compatible licence")
        # The 378 MP KMSKA native source is too large to decode safely in CI:
        # fetch its official Wikimedia 2600px thumbnail, which preserves ratio.
        native = row["categoryIndex"] != 139
        url = info["url"] if native else info["display"]
    else:
        url = row["sourceLocation"]
        native = True
    raw, resolved = lib.fetch(url, limit=90_000_000)
    with Image.open(io.BytesIO(raw)) as sample:
        sample.verify()
    with Image.open(io.BytesIO(raw)) as im:
        im = ImageOps.exif_transpose(im)
        w, h = im.size
        if min(w, h) < 1000:
            raise ValueError(f"source short edge too small: {w}x{h}")
        ratio = w / h
        err = abs(ratio - row["expectedAspect"]) / row["expectedAspect"]
        if err > 0.06:
            raise ValueError(f"image aspect {ratio:.4f} conflicts with painted-surface {row['expectedAspect']:.4f}")
        rgb = im.convert("RGB")
        rgb.thumbnail((2400, 2400), Image.Resampling.LANCZOS)
        img = rgb.copy()
    digest = hashlib.sha256(raw).hexdigest()
    rootname = f"w92-{row['categoryIndex']}-{digest[:14]}"
    sourcefile = rootname + ".source.jpg"
    previewfile = rootname + ".webp"
    (OUT / sourcefile).write_bytes(raw)
    img.save(OUT / previewfile, "WEBP", quality=87, method=4)
    return {
        "categoryIndex": row["categoryIndex"], "sourceIdentity": row["sourceIdentity"],
        "artist": row["artist"], "work": row["title"], "inventory": row["accession"],
        "sourcePage": row["sourcePage"], "resolvedImageUrl": resolved,
        "sourceFile": sourcefile, "previewFile": previewfile,
        "sourceSha256": digest, "sourceBytes": len(raw),
        "sourceDimensions": [w, h], "previewDimensions": list(img.size),
        "expectedAspect": row["expectedAspect"], "actualAspect": round(ratio, 6),
        "relativeAspectError": round(err, 5),
        "licenceDeclaration": info.get("license", row["rightsDeclaration"]),
        "fullNativeResolutionFile": native,
        "status": "DOWNLOADED_ASPECT_OK_EDGE_INSPECTION_PENDING",
        "humanRatingsModified": False, "publishable": False,
        "automaticCategoryPromotion": False
    }

def contact_sheet(rows):
    good = [r for r in rows if r["status"].startswith("DOWNLOADED_")]
    if not good:
        return
    from PIL import ImageFont
    width, cellheight = 1080, 370
    sheet = Image.new("RGB", (width, cellheight * len(good)), "#10151c")
    draw = ImageDraw.Draw(sheet)
    for i, row in enumerate(good):
        photo = Image.open(OUT / row["previewFile"]).convert("RGB")
        photo.thumbnail((630, 335), Image.Resampling.LANCZOS)
        x = 15 + (640-photo.width)//2
        y = i*cellheight + (350-photo.height)//2
        sheet.paste(photo, (x, y))
        lines = [
            f"{row['categoryIndex']}: {row['work']}",
            row["artist"],
            row["inventory"],
            f"{row['sourceDimensions'][0]} x {row['sourceDimensions'][1]}",
            row["sourceIdentity"],
            "Edges and original-match require human check."
        ]
        for j, s in enumerate(lines):
            draw.text((660, i*cellheight+24+j*29), s[:58], fill="#f0ecdf")
    sheet.save(OUT / "w92-contact-sheet.jpg", quality=87)

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = json.loads(INPUT.read_text(encoding="utf-8"))
    rows = []
    for source in manifest["items"]:
        try:
            record = acquire(source)
            print("W92_DOWNLOADED", source["categoryIndex"], record["sourceDimensions"], flush=True)
        except Exception as exc:
            record = {
                "categoryIndex": source["categoryIndex"], "sourceIdentity": source["sourceIdentity"],
                "artist": source["artist"], "work": source["title"], "sourcePage": source["sourcePage"],
                "status": "SOURCE_FETCH_OR_ASPECT_HOLD", "error": str(exc)[:260],
                "publishable": False, "automaticCategoryPromotion": False
            }
            print("W92_HOLD", source["categoryIndex"], str(exc)[:130], flush=True)
        rows.append(record)
    contact_sheet(rows)
    stats = {"attempted": len(rows), "downloadedAspectOK": sum(r["status"].startswith("DOWNLOADED_") for r in rows),
             "held": sum(not r["status"].startswith("DOWNLOADED_") for r in rows), "fullyCertified": 0}
    report = {"schema": "AO_SACRED_ART_W92_RESEARCH_IMAGE_BYTES_QA_V1",
              "humanRatingsUntouched": True, "strictCoverageNotAutomaticallyChanged": "146/168",
              "manualVisualEdgeAndRegistryObjectReconciliationStillRequired": True,
              "counts": stats, "rows": rows}
    (OUT / "w92-source-image-qa.json").write_text(json.dumps(report, indent=2, ensure_ascii=False)+"\n", encoding="utf-8")
    print("W92_COMPLETE", json.dumps(stats), flush=True)
    if stats["downloadedAspectOK"] == 0:
        raise SystemExit("No usable source images acquired; inspect W92 holds")

if __name__ == "__main__":
    main()
