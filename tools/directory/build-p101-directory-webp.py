#!/usr/bin/env python3
"""P101: SHA-pinned church-photo WebP *staging*, not an app publication.

Requires Pillow. Reads original bytes from a pinned Git tree (the permanent P93
archive); never downloads a substitute image or edits approved-place-media.
"""
import argparse
import hashlib
import io
import json
from pathlib import Path
import subprocess
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[2]
INPUT = ROOT / "data/directory/research/p101-three-source-locked-derivatives-input.json"
OUTPUT = ROOT / "data/directory/research/p101-three-derivative-build-results.json"
SHEET = ROOT / "docs/research/directory/p101-three-mobile-full-frame-review.jpg"
MAX_EDGE = 1400

def sha(data, algorithm):
    return hashlib.new(algorithm, data).hexdigest()

def archived_original(commit, relative):
    if not all(x.isalnum() or x in "-_" for x in commit):
        raise ValueError("Archive git ref is not a commit SHA")
    if not relative.startswith("docs/research/directory/p93-bulk-28-originals-20261029/"):
        raise ValueError("Source outside permanent P93 archive")
    return subprocess.run(["git", "show", commit + ":" + relative],
                          cwd=ROOT, check=True, capture_output=True).stdout

def render_full_frame(im):
    im = ImageOps.exif_transpose(im)
    if im.mode != "RGB":
        im = im.convert("RGB")
    im.thumbnail((MAX_EDGE, MAX_EDGE), Image.Resampling.LANCZOS)
    return im

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--archive-commit", required=True)
    args = parser.parse_args()
    data = json.loads(INPUT.read_text(encoding="utf-8"))
    if data.get("schema") != "AO_P101_SOURCE_PINNED_THREE_DIRECTORY_DERIVATIVES_V1":
        raise ValueError("Wrong P101 source schema")
    if len(data["records"]) != 3 or {x["row"] for x in data["records"]} != {230, 366, 330}:
        raise ValueError("Unexpected candidate selection")

    results = []
    thumbnails = []
    for rec in data["records"]:
        original_path = data["source_archive_directory"] + "/" + rec["source_file"]
        raw = archived_original(args.archive_commit, original_path)
        if len(raw) != rec["original_bytes"]:
            raise ValueError("Source length mismatch for " + original_path)
        if sha(raw, "sha1") != rec["original_sha1"]:
            raise ValueError("Original source SHA1 mismatch for " + original_path)
        if sha(raw, "sha256") != rec["original_sha256"]:
            raise ValueError("Original P93 SHA256 mismatch for " + original_path)
        with Image.open(io.BytesIO(raw)) as source:
            if source.format != "JPEG" or source.size != (rec["original_width"], rec["original_height"]):
                raise ValueError("Original JPEG dimensions / type mismatch for " + original_path)
            source.load()  # full native decode; reject corrupt or truncated originals
            out = render_full_frame(source)

        dest = ROOT / rec["staged_path"]
        if not str(dest.resolve()).startswith(str((ROOT / "assets/staged/directory-p101").resolve())):
            raise ValueError("Output must stay in nonproduction staging")
        dest.parent.mkdir(parents=True, exist_ok=True)
        out.save(dest, format="WEBP", quality=85, method=6, exif=b"")
        rendered = dest.read_bytes()
        with Image.open(io.BytesIO(rendered)) as check:
            check.load()
            if check.format != "WEBP" or check.size != out.size:
                raise ValueError("Derivative decode failure")
        if max(out.size) > MAX_EDGE or not (0.95 <= out.width/out.height/(rec["original_width"]/rec["original_height"]) <= 1.05):
            raise ValueError("Incorrect aspect ratio, must never crop")
        if len(rendered) > 2_000_000:
            raise ValueError("Mobile derivative exceeds 2MB")

        results.append({
            "row": rec["row"], "place_id": rec["place_id"],
            "original_archive_commit": args.archive_commit,
            "archive_file": original_path,
            "source_sha1_verified": sha(raw, "sha1"),
            "original_sha256_verified": sha(raw, "sha256"),
            "native_decode_ok": True,
            "original_dimensions": [rec["original_width"], rec["original_height"]],
            "staged_path": rec["staged_path"],
            "staged_sha256": sha(rendered, "sha256"),
            "staged_bytes": len(rendered),
            "staged_dimensions": list(out.size),
            "applied_changes": "Resize to at most 1400 px, EXIF orientation normalized, RGB WebP quality 85; no crop, painting, recolour, synthesis or montage",
            "source_claimed_author": rec["creator"], "source_claimed_license": rec["license"],
            "source_claimed_license_url": rec["license_url"],
            "source_file_url": rec["source_url"],
            "status": "STAGED_ONLY_NOT_APPROVED",
            "native_visual_editorial_review": "PENDING",
            "mobile_card_qa": "PENDING",
            "rights_approval": "PENDING_FINAL_PUBLICATION_REVIEW",
            "approved_media_registry_written": False
        })
        thumbnails.append((rec["row"], out.copy()))

    # A review illustration, never a substitute or a cropped production derivative.
    sheet = Image.new("RGB", (3*420, 790), "#1a1a1a")
    draw = ImageDraw.Draw(sheet)
    for i, (row, out) in enumerate(thumbnails):
        preview = ImageOps.contain(out, (380, 710), Image.Resampling.LANCZOS)
        x = 420*i + (420-preview.width)//2
        y = 44+(710-preview.height)//2
        sheet.paste(preview, (x, y))
        draw.text((420*i + 16, 12), str(row) + " - FULL FRAME / NO CROP", fill="white")
    SHEET.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(SHEET, "JPEG", quality=88, optimize=True)

    output = {
        "schema": "AO_P101_THREE_CHECKSUM_VERIFIED_WEBP_STAGING_RESULTS_V1",
        "source_input": str(INPUT.relative_to(ROOT)),
        "source_archive_commit": args.archive_commit,
        "status": "STAGING_ONLY_NO_APPROVAL_NO_APP_VISIBILITY",
        "counts": {"originals_verified": 3, "native_jpeg_decodes": 3,
                   "webp_derivatives_staged": 3, "approved_media_written": 0,
                   "new_photos_live": 0},
        "contact_sheet": str(SHEET.relative_to(ROOT)),
        "contact_sheet_sha256": sha(SHEET.read_bytes(), "sha256"),
        "records": results
    }
    OUTPUT.write_text(json.dumps(output, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    print(json.dumps(output["counts"]))
    for r in results:
        print(r["place_id"], r["staged_dimensions"], r["staged_bytes"], r["staged_sha256"])

if __name__ == "__main__":
    main()
