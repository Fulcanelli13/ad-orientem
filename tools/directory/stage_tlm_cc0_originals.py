#!/usr/bin/env python3
"""Stage source-verified TLM church exteriors. Never publish or approve.
Run on a networked, review-only runner: python tools/directory/stage_tlm_cc0_originals.py.
Requires Pillow. No production media, image registry, or source ledger is modified.
"""
import hashlib
import io
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "data/directory/research/tlm-wave-a-cc0-commons-preflight-20261101.v1.json"
OUT = ROOT / "artifacts/tlm-wave-a-cc0-review"
API = "https://commons.wikimedia.org/w/api.php"
HEADERS = {"User-Agent": "AdOrientem-TLM-SourceReview/1.0 (research-only; Wikimedia Commons original verification)", "Accept": "application/json"}
MAX_ORIGINAL_BYTES = 40 * 1024 * 1024
MAX_IMAGES = 28

def open_url(url, max_bytes=MAX_ORIGINAL_BYTES):
    if not url.startswith("https://"):
        raise ValueError("HTTPS source required")
    last = None
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=60) as rsp:
                if not rsp.url.startswith("https://"):
                    raise ValueError("insecure source redirect")
                limit = rsp.headers.get("Content-Length")
                if limit and int(limit) > max_bytes:
                    raise ValueError("oversized source media")
                body = rsp.read(max_bytes + 1)
                if len(body) > max_bytes:
                    raise ValueError("oversized downloaded media")
                return body
        except (TimeoutError, urllib.error.HTTPError, urllib.error.URLError) as exc:
            last = exc
            if attempt < 2:
                time.sleep(2 * (attempt + 1))
    raise RuntimeError(f"source retrieval failed: {last}")

def load_rows(part_paths):
    rows = []
    for path in part_paths:
        doc = json.loads((ROOT / path).read_text(encoding="utf-8"))
        rows.extend(doc["records"])
    by_id = {row["site_id"]: row for row in rows}
    if len(rows) != 739 or len(by_id) != 739:
        raise ValueError("frozen 739-photo corpus mismatch")
    return by_id

def extract_license(data):
    md = data.get("extmetadata") or {}
    return str((md.get("LicenseShortName") or {}).get("value", "")).strip()

def lookup_original(row):
    title = row["commons_file"]
    if not title.startswith("File:"):
        raise ValueError("Commons namespace required")
    params = urllib.parse.urlencode({
        "action": "query", "format": "json", "prop": "imageinfo",
        "iiprop": "url|sha1|size|extmetadata", "titles": title,
    })
    doc = json.loads(open_url(API + "?" + params, max_bytes=3_000_000))
    pages = list(doc["query"]["pages"].values())
    if len(pages) != 1 or "imageinfo" not in pages[0]:
        raise ValueError("Commons source page missing image")
    image = pages[0]["imageinfo"][0]
    original = image.get("url", "")
    if urllib.parse.urlparse(original).hostname != "upload.wikimedia.org":
        raise ValueError("Unexpected Commons media host")
    claimed_sha1 = row["commons_original_sha1"].lower()
    current_sha1 = str(image.get("sha1", "")).lower()
    if not re.fullmatch("[a-f0-9]{40}", claimed_sha1) or current_sha1 != claimed_sha1:
        raise ValueError("Pinned source SHA-1 mismatch")
    claimed_license = row["claimed_license"]
    current_license = extract_license(image)
    if claimed_license != "CC0" or "cc0" not in current_license.lower():
        raise ValueError(f"Commons CC0 licence not verified ({current_license})")
    dims = row["source_native_dimensions"]
    if [image.get("width"), image.get("height")] != dims:
        raise ValueError("Current native pixel dimensions differ from pinned record")
    return image, current_license

def stage(row):
    imageinfo, license_name = lookup_original(row)
    body = open_url(imageinfo["url"])
    real_sha = hashlib.sha1(body).hexdigest()
    if real_sha != row["commons_original_sha1"].lower():
        raise ValueError("Downloaded original checksum differs from Commons API and pinned audit")
    with Image.open(io.BytesIO(body)) as raw:
        raw.load()
        if [raw.width, raw.height] != row["source_native_dimensions"]:
            raise ValueError("Original image dimensions mismatch")
        frame = ImageOps.exif_transpose(raw).convert("RGB")
    original_display_dimensions = [frame.width, frame.height]
    frame.thumbnail((1600, 2000), Image.Resampling.LANCZOS)
    # No centre-crop or content inference: preserve the entire photographed frame.
    target = OUT / "review-images" / (row["site_id"] + ".webp")
    target.parent.mkdir(parents=True, exist_ok=True)
    frame.save(target, "WEBP", quality=88, method=6)
    data = target.read_bytes()
    return {
        "state": "STAGED_REVIEW_ONLY",
        "commons_source_url": row["commons_page"],
        "commons_original_sha1_verified": real_sha,
        "commons_licence_verified": license_name,
        "original_dimensions": original_display_dimensions,
        "derivative_dimensions": [frame.width, frame.height],
        "original_bytes": len(body),
        "derivative_bytes": len(data),
        "review_derivative_sha256": hashlib.sha256(data).hexdigest(),
        "review_derivative_path": str(target.relative_to(ROOT)),
        "rights_approved": False, "identity_approved": False,
        "editorial_approved": False, "published_from_batch": False,
    }

def contact_sheet(results, by_id):
    tile_w, tile_h, cols = 280, 274, 4
    rows = (len(results) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * tile_w, rows * tile_h), (238, 238, 238))
    draw = ImageDraw.Draw(sheet)
    for i, r in enumerate(results):
        x, y = (i % cols) * tile_w, (i // cols) * tile_h
        identifier = r["site_id"]
        draw.text((x + 8, y + 6), identifier, fill=(0, 0, 0))
        name = by_id[identifier]["site_name"]
        draw.text((x + 8, y + 23), name[:36], fill=(0, 0, 0))
        if r["state"] == "STAGED_REVIEW_ONLY":
            with Image.open(ROOT / r["review_derivative_path"]) as im:
                preview = im.copy()
            preview.thumbnail((tile_w - 16, tile_h - 63))
            sheet.paste(preview, (x + (tile_w - preview.width) // 2, y + 47))
        else:
            draw.text((x + 8, y + 70), r["state"], fill=(150, 0, 0))
    sheet.save(OUT / "cc0-contact-sheet.jpg", quality=86)

def main():
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    if manifest["schema"] != "AO_TLM_WAVE_A_CC0_ORIGINAL_SOURCE_PREFLIGHT_V1":
        raise ValueError("Unknown source-review contract")
    if len(manifest["candidate_site_ids"]) != 28 or len(set(manifest["candidate_site_ids"])) != 28:
        raise ValueError("Batch identity count mismatch")
    if manifest["stage_candidate_count"] > MAX_IMAGES:
        raise ValueError("Unbounded acquisition disallowed")
    by_id = load_rows(manifest["source_audit_parts"])
    OUT.mkdir(parents=True, exist_ok=True)
    results = []
    for identifier in manifest["candidate_site_ids"]:
        r = by_id[identifier]
        if (r["audit_status"] != "PROMISING_EXTERIOR_NEEDS_SOURCE_VERIFICATION"
                or r["claimed_license"] != "CC0" or r["confirmed_place_id"]
                or r["rights_approved"] or r["identity_approved"]
                or r["editorial_approved"] or r["published_from_batch"]):
            raise ValueError("Never stage a rejected, previously cleared or already published candidate")
        result = {"site_id": identifier, "site_name": r["site_name"],
                  "country": r["country"], "commons_file": r["commons_file"],
                  "claimed_license": "CC0", "zip_sha256": r["zip_sha256"]}
        try:
            result.update(stage(r))
        except Exception as exc:
            result.update({"state": "HOLD_SOURCE_VERIFICATION",
                           "reason": str(exc)[:350],
                           "rights_approved": False, "identity_approved": False,
                           "editorial_approved": False, "published_from_batch": False})
        results.append(result)
        print(identifier, result["state"], flush=True)
    receipt = {
        "schema": "AO_TLM_CC0_REVIEW_ONLY_RECEIPT_V1",
        "candidate_count": len(results), "staged_count": sum(r["state"] == "STAGED_REVIEW_ONLY" for r in results),
        "held_count": sum(r["state"] != "STAGED_REVIEW_ONLY" for r in results),
        "public_approvals": 0, "publications": 0,
        "no_approved_media_mutations": True, "items": results,
    }
    (OUT / "source-verification-receipt.json").write_text(
        json.dumps(receipt, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    contact_sheet(results, by_id)
    print(json.dumps({"staged": receipt["staged_count"], "held": receipt["held_count"], "publications": 0}))
    # Failure is reserved for invalid batch/schema; per-file source holds are recorded explicitly.
    return 0

if __name__ == "__main__":
    sys.exit(main())
