#!/usr/bin/env python3
"""Stage source-verified TLM church exteriors. Never publish or approve.
Use the thirteen already-acquired ZIPs: AO_TLM_ARCHIVES_DIR=/path/to/zips python tools/directory/stage_tlm_cc0_originals.py.
Requires Pillow. No production media, image registry, or source ledger is modified.
"""
import hashlib
import os
import zipfile
import io
import json
import sys
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "data/directory/research/tlm-wave-a-cc0-commons-preflight-20261101.v1.json"
OUT = ROOT / "artifacts/tlm-wave-a-cc0-review"
MAX_IMAGES = 28

def load_rows(part_paths):
    rows = []
    for path in part_paths:
        doc = json.loads((ROOT / path).read_text(encoding="utf-8"))
        rows.extend(doc["records"])
    by_id = {row["site_id"]: row for row in rows}
    if len(rows) != 739 or len(by_id) != 739:
        raise ValueError("frozen 739-photo corpus mismatch")
    return by_id

def stage(row):
    """Read previously supplied ZIP: source-hash proof, full-frame preview, no network."""
    archives = os.environ.get("AO_TLM_ARCHIVES_DIR")
    if not archives:
        raise ValueError("AO_TLM_ARCHIVES_DIR required; no external acquisition allowed")
    archive_path = Path(archives) / row["zip_batch"]
    with zipfile.ZipFile(archive_path) as archive:
        body = archive.read(row["zip_path"])
    archived_sha256 = hashlib.sha256(body).hexdigest()
    if archived_sha256 != row["zip_sha256"]:
        raise ValueError("ZIP image hash differs from the frozen 739-image audit")
    original_match = hashlib.sha1(body).hexdigest() == row["commons_original_sha1"].lower()
    with Image.open(io.BytesIO(body)) as raw:
        raw.load()
        if [raw.width, raw.height] != row["archive_preview_dimensions"]:
            raise ValueError("Archive image dimensions mismatch frozen screen")
        frame = ImageOps.exif_transpose(raw).convert("RGB")
    original_display_dimensions = [frame.width, frame.height]
    frame.thumbnail((1600, 2000), Image.Resampling.LANCZOS)
    target = OUT / "review-images" / (row["site_id"] + ".webp")
    target.parent.mkdir(parents=True, exist_ok=True)
    frame.save(target, "WEBP", quality=87, method=4)
    data = target.read_bytes()
    return {
        "state": "STAGED_EXACT_ORIGINAL_REVIEW_ONLY" if original_match else "STAGED_PREVIEW_REVIEW_ONLY",
        "commons_source_url": row["commons_page"],
        "archived_image_sha256_verified": archived_sha256,
        "matches_pinned_original_commons_sha1": original_match,
        "commons_licence_claim_in_frozen_audit": row["claimed_license"],
        "commons_current_licence_reverified": False,
        "original_dimensions": original_display_dimensions,
        "derivative_dimensions": [frame.width, frame.height],
        "archive_bytes": len(body),
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
        if r["state"].startswith("STAGED_"):
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
    if not os.environ.get("AO_TLM_ARCHIVES_DIR"):
        raise ValueError("Provide already-acquired local ZIPs; never retry Wikimedia HTTP 429")
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
        "candidate_count": len(results), "staged_count": sum(r["state"].startswith("STAGED_") for r in results),
        "held_count": sum(not r["state"].startswith("STAGED_") for r in results),
        "exact_original_count": sum(r["state"] == "STAGED_EXACT_ORIGINAL_REVIEW_ONLY" for r in results),
        "preview_only_count": sum(r["state"] == "STAGED_PREVIEW_REVIEW_ONLY" for r in results),
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
