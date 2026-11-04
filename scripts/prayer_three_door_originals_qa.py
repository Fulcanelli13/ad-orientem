#!/usr/bin/env python3
"""One zero-cost, fail-closed original-byte QA batch for three ALREADY selected Prayer door works.

This script NEVER modifies app publication bindings or the approved artwork master.
Only temporary derivative previews and machine-verifiable source evidence are uploaded
as short-lived CI artifacts. Wikimedia's file-description rights notes remain
editorial evidence, NOT automatic worldwide photograph clearance.
"""
from __future__ import annotations

import hashlib
import json
import os
import sys
from pathlib import Path
from urllib.parse import urlencode, urlsplit
from urllib.request import Request, urlopen
from PIL import Image, ImageDraw, ImageOps

Image.MAX_IMAGE_PIXELS = 190_000_000
MAX_SOURCE_BYTES = 25_000_000
AGENT = "AdOrientemArtworkQA/2026.11 (read-only Commons image original validation)"
WORKS = [
    {
        "slot": "DOOR-D2", "category": "Essential Prayers",
        "artist": "Hendrik van Balen", "title": "The Trinity",
        "commons_file": "Clevelandart_1996.26.jpg",
        "source_sha1": "77bc9079adbc7e66e241737813b2c7b4b2a9f40f",
        "size": 4_352_983, "width": 2720, "height": 3400,
        "rights_review": "Cleveland Museum of Art CC0/Open Access; identity and source-file rights to reconfirm",
    },
    {
        "slot": "DOOR-D3", "category": "Rosary & Chaplets",
        "artist": "Caravaggio", "title": "Madonna of the Rosary",
        "commons_file": "Madonna_of_the_Rosary-Caravaggio_(1607).jpg",
        "source_sha1": "289a9980d41f280da89bed2bed12dc3c59887d36",
        "size": 20_767_267, "width": 9803, "height": 14480,
        "rights_review": "Commons public-domain/PD-Art reproduction marking; jurisdiction review still required",
    },
    {
        "slot": "DOOR-D8", "category": "Saints & Angels",
        "artist": "Marcantonio Franceschini", "title": "The Guardian Angel",
        "commons_file": "Franceschini,_Marcantonio_-_The_Guardian_Angel_-_Google_Art_Project.jpg",
        "source_sha1": "9e493cd7fbc8a01c368e7d5f1081d58a2573e16a",
        "size": 3_030_391, "width": 2501, "height": 3304,
        "rights_review": "Commons public-domain/PD-Art reproduction marking; no FXD remaster; jurisdiction review still required",
    },
]


def fetch(url: str, limit: int) -> bytes:
    parsed = urlsplit(url)
    if parsed.scheme != "https" or parsed.hostname not in {"commons.wikimedia.org", "upload.wikimedia.org"}:
        raise ValueError("Unexpected source host or non-HTTPS URL: " + url)
    req = Request(url, headers={"User-Agent": AGENT, "Accept": "application/json,image/jpeg,*/*"})
    with urlopen(req, timeout=120) as response:
        final = urlsplit(response.geturl())
        if final.scheme != "https" or final.hostname not in {"commons.wikimedia.org", "upload.wikimedia.org"}:
            raise ValueError("Unexpected download redirect to " + response.geturl())
        chunks, total = [], 0
        while True:
            block = response.read(1024 * 1024)
            if not block:
                break
            total += len(block)
            if total > limit:
                raise ValueError("Source larger than its locked expected size")
            chunks.append(block)
        return b"".join(chunks)


def exact_image_info(item: dict) -> dict:
    query = urlencode({
        "action": "query", "format": "json", "formatversion": "2",
        "prop": "imageinfo", "iiprop": "url|size|sha1|mime",
        "titles": "File:" + item["commons_file"],
    })
    raw = fetch("https://commons.wikimedia.org/w/api.php?" + query, 1_000_000)
    pages = json.loads(raw).get("query", {}).get("pages", [])
    if len(pages) != 1 or "imageinfo" not in pages[0]:
        raise ValueError("Commons exact original missing: " + item["commons_file"])
    info = pages[0]["imageinfo"][0]
    for key, value in {
        "sha1": item["source_sha1"], "size": item["size"],
        "width": item["width"], "height": item["height"], "mime": "image/jpeg",
    }.items():
        if info.get(key) != value:
            raise ValueError(f"{item['slot']} Commons {key}: {info.get(key)!r} != locked {value!r}")
    return info


def review_image(original_path: Path, out: Path, item: dict) -> tuple[Path, Path]:
    with Image.open(original_path) as original:
        if original.format != "JPEG" or original.size != (item["width"], item["height"]):
            raise ValueError(item["slot"] + ": decoded image dimensions/format wrong")
        original.verify()
    with Image.open(original_path) as source:
        rgb = ImageOps.exif_transpose(source).convert("RGB")
        if rgb.size != (item["width"], item["height"]):
            raise ValueError(item["slot"] + ": EXIF orientation changed pixel geometry")
        preview = rgb.copy()
        preview.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
        preview_path = out / (item["slot"].lower() + "-preview.webp")
        preview.save(preview_path, "WEBP", quality=86, method=6)
        thumb = rgb.copy()
        thumb.thumbnail((342, 510), Image.Resampling.LANCZOS)
        mini_path = out / (item["slot"].lower() + "-thumb.png")
        thumb.save(mini_path)
    return preview_path, mini_path


def sheet(items: list[dict], out: Path) -> None:
    width, height = 3 * 392, 630
    canvas = Image.new("RGB", (width, height), "#eee5d5")
    paint = ImageDraw.Draw(canvas)
    for idx, item in enumerate(items):
        left = idx * 392
        with Image.open(out / (item["slot"].lower() + "-thumb.png")) as thumb:
            x = left + (392 - thumb.width) // 2
            canvas.paste(thumb, (x, 75))
        paint.text((left + 18, 16), item["slot"] + "  " + item["category"], fill="#322819")
        paint.text((left + 18, 40), item["artist"] + " / " + item["title"], fill="#322819")
        paint.text((left + 18, 600), "Exact original verified; image NOT released", fill="#654e38")
    canvas.save(out / "prayer-three-door-review-contact.png")


def main() -> None:
    out = Path(os.environ.get("AO_ART_REVIEW_OUTPUT", os.environ.get("RUNNER_TEMP", "/tmp") + "/prayer-three-door-qa"))
    originals = out / "_temporary_originals_not_in_artifact"
    originals.mkdir(parents=True, exist_ok=True)
    report = {
        "schema": "AO_PRAYER_THREE_EXACT_ORIGINAL_QA_V1",
        "source": "Wikimedia Commons original-file metadata and actual downloaded bytes",
        "artwork_publication": "HOLD_NOT_RELEASED",
        "policy": "No new art assignments; selected works only; no cropping or color changes",
        "records": [], "errors": [],
    }
    try:
        for item in WORKS:
            record = {
                "slot": item["slot"], "category": item["category"],
                "artist": item["artist"], "work": item["title"],
                "commons_file": item["commons_file"],
                "rights_review": item["rights_review"],
                "production_approved": False,
            }
            report["records"].append(record)
            info = exact_image_info(item)
            source_url = info["url"]
            original = fetch(source_url, min(MAX_SOURCE_BYTES, item["size"] + 1))
            sha1 = hashlib.sha1(original).hexdigest()
            sha256 = hashlib.sha256(original).hexdigest()
            if len(original) != item["size"] or sha1 != item["source_sha1"]:
                raise ValueError(item["slot"] + ": actual source-byte hash or size mismatch")
            original_path = originals / item["commons_file"]
            original_path.write_bytes(original)
            derivative, thumb = review_image(original_path, out, item)
            record.update({
                "source_page": "https://commons.wikimedia.org/wiki/File:" + item["commons_file"],
                "original_url": source_url,
                "original_sha1_recomputed": sha1, "original_sha256_recomputed": sha256,
                "original_bytes": len(original),
                "original_pixels": [item["width"], item["height"]],
                "review_derivative": derivative.name,
                "review_derivative_sha256": hashlib.sha256(derivative.read_bytes()).hexdigest(),
                "state": "EXACT_SOURCE_BYTES_VERIFIED_RIGHTS_AND_VISUAL_RELEASE_PENDING",
            })
            print("VERIFIED_EXACT_ORIGINAL", item["slot"], len(original), sha1, sha256, flush=True)
        sheet(report["records"], out)
        report["result"] = "3_OF_3_ORIGINALS_VERIFIED_REVIEW_ONLY"
    except Exception as exc:
        report["errors"].append(str(exc))
        report["result"] = "FAIL_CLOSED"
        raise
    finally:
        (out / "source-evidence.v1.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
        for candidate in originals.iterdir():
            candidate.unlink()
        originals.rmdir()


if __name__ == "__main__":
    main()
