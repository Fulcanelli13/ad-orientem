#!/usr/bin/env python3
"""Research-only exact-file acquisition for two Curé d'Ars shrine photographs.

Downloads to short-lived GitHub Actions artifacts, NEVER to the approved media tree.
No new user approval is inferred. No editor or production code is touched.
"""
import argparse
from datetime import datetime, timezone
from hashlib import sha1, sha256
from io import BytesIO
import json
from pathlib import Path
import time
from urllib.parse import quote
from urllib.request import Request, urlopen

FILES = (
    {
        "id": "ars-cure-2022-prieur-01",
        "title": "Châsse du saint Curé d'Ars - mars 2022.JPG",
        "subpath": "0/0a",
        "sha1": "5ac22aa6ab5a975f1aeb432916c33f97a15f5b78",
        "bytes": 6707723,
        "width": 2504, "height": 4016,
    },
    {
        "id": "ars-cure-2022-prieur-02",
        "title": "Châsse du saint Curé d'Ars - mars 2022 (2).JPG",
        "subpath": "5/59",
        "sha1": "6a22c6279eb255212fac8863f2eade8a5d5ba248",
        "bytes": 8301701,
        "width": 2736, "height": 4032,
    },
)


def check_inputs():
    assert len(FILES) == 2
    assert len({item["id"] for item in FILES}) == 2
    for item in FILES:
        assert len(item["sha1"]) == 40
        assert item["bytes"] > 1_000_000
        assert item["width"] > 2000 and item["height"] > 3000
        assert "Châsse du saint Curé d'Ars" in item["title"]
    print("B22 two-source pins passed; research-only, not an approval.")


def acquire(item):
    name = quote(item["title"], safe="")
    url = f"https://upload.wikimedia.org/wikipedia/commons/{item['subpath']}/{name}"
    error = None
    for attempt in range(3):
        try:
            request = Request(
                url,
                headers={
                    "User-Agent": "AdOrientem-SacredAtlas-ExactSourceAudit/1.0 (noncommercial research)",
                    "Accept": "image/jpeg,image/*;q=0.8",
                },
            )
            with urlopen(request, timeout=45) as response:
                content_type = response.headers.get("Content-Type", "")
                data = response.read(16_000_000 + 1)
            if len(data) > 16_000_000:
                raise ValueError(f"File larger than safety cap: {item['id']}")
            digest = sha1(data).hexdigest()
            if digest != item["sha1"]:
                raise ValueError(f"Native SHA1 mismatch for {item['id']}: {digest}")
            if len(data) != item["bytes"]:
                raise ValueError(f"Native byte-size mismatch for {item['id']}: {len(data)}")
            return url, data, content_type
        except Exception as exc:
            error = exc
            if isinstance(exc, ValueError):
                raise
            print(f"Retry {attempt + 1}/3 for {item['id']}: {type(exc).__name__}: {exc}", flush=True)
            time.sleep(attempt + 1)
    raise RuntimeError(f"Native original unavailable for {item['id']}: {error}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--selftest", action="store_true")
    parser.add_argument("--out", default="artifacts/sacred-atlas-b22-ars")
    args = parser.parse_args()
    check_inputs()
    if args.selftest:
        return
    from PIL import Image, ImageDraw, ImageOps
    Image.MAX_IMAGE_PIXELS = 35_000_000
    dest = Path(args.out)
    dest.mkdir(parents=True, exist_ok=True)
    records = []
    thumbnails = []
    for item in FILES:
        url, data, content_type = acquire(item)
        original = dest / f"{item['id']}-verified-original.jpg"
        original.write_bytes(data)
        with Image.open(BytesIO(data)) as check:
            check.verify()
        with Image.open(BytesIO(data)) as jpg:
            shown = ImageOps.exif_transpose(jpg).convert("RGB")
            assert shown.size == (item["width"], item["height"]), (
                item["id"], shown.size
            )
            derivative = shown.copy()
            derivative.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
            webp = dest / f"{item['id']}-uncropped-review.webp"
            derivative.save(webp, "WEBP", quality=86, method=6)
            small = shown.copy()
            small.thumbnail((560, 750), Image.Resampling.LANCZOS)
            thumbnails.append((item["id"], small))
        records.append({
            "id": item["id"], "source_url": url,
            "source_file_title": item["title"], "photographer": "Benoît Prieur",
            "photo_license": "CC0 1.0",
            "native_sha1_verified": sha1(data).hexdigest(),
            "native_sha256": sha256(data).hexdigest(),
            "native_bytes": len(data), "native_pixels": [item["width"], item["height"]],
            "derivative_sha256": sha256(webp.read_bytes()).hexdigest(),
            "derivative_bytes": webp.stat().st_size, "derivative_pixels": list(derivative.size),
            "native_original_file": original.name, "uncropped_review_file": webp.name,
            "source_content_type": content_type, "identity_review": "PRELIMINARY_EXACT_SHRINE",
            "editorial_approved": False, "published": False,
            "underlying_work_final_legal_clearance": False,
        })
        print(f"{item['id']}: native SHA1 verified, bytes={len(data)}, pixels={shown.size}", flush=True)
    canvas = Image.new("RGB", (1260, 870), "#f4f3ef")
    draw = ImageDraw.Draw(canvas)
    draw.text((25, 15), "B22 / ARS — Exact native originals / RESEARCH ONLY", fill="black")
    draw.text((25, 40), "Same photographer/date; compare mobile visual legibility; no crop or publication.", fill="black")
    for index, (name, preview) in enumerate(thumbnails):
        left = 30 + index * 620
        top = 90
        canvas.paste(preview, (left + (560-preview.width)//2, top))
        draw.text((left, 810), name, fill="black")
    canvas.save(dest / "ars-two-originals-contact-sheet.jpg", quality=92)
    manifest = {
        "schema": "AO_SACRED_ATLAS_B22_NATIVE_ORIGINAL_BINARY_QA_V1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "subject_id": "subject:relic:FR:curé-ars",
        "place_id": "place:FR:basilique-ars",
        "purpose": "Source-original verification and no-crop mobile review only",
        "publication_allowed": False, "user_editorial_approval": False,
        "existing_approved_gallery_unchanged": True,
        "photographs": records,
        "contact_sheet": "ars-two-originals-contact-sheet.jpg",
    }
    (dest / "manifest.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


if __name__ == "__main__":
    main()
