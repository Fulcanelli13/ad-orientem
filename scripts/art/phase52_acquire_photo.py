#!/usr/bin/env python3
"""Research-only Commons photograph acquisition and mechanical QA.

Checks original source byte hash, dimensions, old/new aspect ratio, and creates
a private side-by-side reviewer contact sheet. Never writes to application assets,
the public gallery, or release manifests. All results are non-public research.
"""
import argparse
import hashlib
import json
from pathlib import Path
import time
from urllib.parse import quote
from urllib.request import Request, urlopen

from PIL import Image, ImageDraw, ImageOps, ImageStat

SOURCE = Path(__file__).resolve().parents[2] / "data/artwork/phase52-toulouse-photographic-acquisition.v1.json"

def commons_url(title):
    normalized = title.replace(" ", "_")
    hash_ = hashlib.md5(normalized.encode("utf-8")).hexdigest()
    return "https://upload.wikimedia.org/wikipedia/commons/" + hash_[0] + "/" + hash_[:2] + "/" + quote(normalized, safe="()_-.")

def fetch_exact(title, destination, max_bytes=30_000_000):
    url = commons_url(title)
    req = Request(url, headers={"User-Agent": "AdOrientemSacredArtResearch/1.0 (no publishing; research integrity check)"})
    last = None
    for attempt in range(2):
        try:
            with urlopen(req, timeout=35) as response:
                if response.status != 200:
                    raise RuntimeError("HTTP status " + str(response.status))
                content_type = response.headers.get("Content-Type", "")
                if not content_type.startswith("image/jpeg") and not content_type.startswith("image/"):
                    raise RuntimeError("Non-image response: " + content_type)
                data = response.read(max_bytes + 1)
                if len(data) > max_bytes:
                    raise RuntimeError("Image exceeds size limit")
            destination.write_bytes(data)
            return url, hashlib.sha1(data).hexdigest(), len(data)
        except Exception as exc:
            last = exc
            if attempt == 0:
                time.sleep(2)
    raise RuntimeError("Download unsuccessful: " + str(last))

def contact_sheet(selected_file, candidate_file, target, credit):
    with Image.open(selected_file) as selected, Image.open(candidate_file) as candidate:
        selected = ImageOps.exif_transpose(selected).convert("RGB")
        candidate = ImageOps.exif_transpose(candidate).convert("RGB")
        sheet = Image.new("RGB", (1280, 820), "#222222")
        draw = ImageDraw.Draw(sheet)
        caption = [("ORIGINAL SELECTED",selected), ("ALTERNATIVE — UNAPPROVED",candidate)]
        for idx, (text, artwork) in enumerate(caption):
            rect = (idx*640+20, 50, (idx+1)*640-20, 720)
            thumbnail = ImageOps.contain(artwork, (rect[2]-rect[0], rect[3]-rect[1]))
            x = (rect[0] + rect[2] - thumbnail.width)//2
            y = (rect[1] + rect[3] - thumbnail.height)//2
            sheet.paste(thumbnail, (x,y))
            draw.text((idx*640+20, 22), text, fill="#ffffff")
            draw.text((idx*640+20, 742), f"{artwork.width} × {artwork.height} pixels", fill="#eeeeee")
        draw.text((20, 780), credit[:180], fill="#d2d2d2")
        sheet.save(target, format="JPEG", quality=86, optimize=True)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default="phase52-review-output")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    assert data["counts"]["candidates"] == 2
    assert data["counts"]["app_published"] == 0
    assert data["counts"]["editorially_approved"] == 0
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    results = []
    any_failure = False
    for candidate in data["candidates"]:
        source = candidate["selected_original"]
        photo = candidate["candidate"]
        assert not photo["is_user_handpicked"] and not photo["verified_image_bytes_in_this_phase"]
        assert photo["status"] == "RESEARCH_CANDIDATE_NOT_EDITORIALLY_ADMITTED"
        assert photo["license_id"] == "CC-BY-SA-4.0"
        prefix = candidate["id"].lower()
        row = {
            "id": candidate["id"], "selected_id": candidate["selected_id"],
            "physical_object_id": candidate["physical_object_id"],
            "photo_source": photo["commons_description_url"],
            "photo_license": photo["license_id"],
            "photographer": photo["photographer"],
            "license_url": photo["license_url"],
            "release_approved": False, "owner_original_preserved": True,
            "human_visual_review_required": True, "commercial_photo_rights_subject_to_license": True,
            "candidate_download_url": commons_url(photo["commons_file_title"]),
            "original_download_url": commons_url(source["source_file_title"])
        }
        if args.dry_run:
            row["state"] = "DRY_RUN_NOT_DOWNLOADED"
            results.append(row)
            continue
        try:
            original = out / (prefix + "-owner-original.jpg")
            alternative = out / (prefix + "-candidate.jpg")
            old_url, old_hash, old_size = fetch_exact(source["source_file_title"], original)
            new_url, new_hash, new_size = fetch_exact(photo["commons_file_title"], alternative)
            assert new_hash == photo["sha1_hex"], "Retrieved candidate SHA1 differs from verified Commons image file"
            with Image.open(original) as a, Image.open(alternative) as b:
                a.verify()
                b.verify()
            with Image.open(original) as a, Image.open(alternative) as b:
                old_size_px = [a.width, a.height]
                new_size_px = [b.width, b.height]
                assert new_size_px == [photo["width"], photo["height"]], "Candidate dimensions mismatch"
                assert min(old_size_px) == source["short_side_px_reported"], "Selected original file not expected edition"
                aspect_delta = abs(a.width/a.height-b.width/b.height)/(a.width/a.height)
                if aspect_delta > 0.12:
                    raise RuntimeError("Aspect-ratio difference too high for automatic side-by-side review")
                row["short_side_increase_factor"] = round(min(new_size_px)/min(old_size_px),2)
                row["aspect_ratio_relative_difference"] = round(aspect_delta,4)
                row["selected_dimensions"] = old_size_px
                row["candidate_dimensions"] = new_size_px
                row["selected_sha1"] = old_hash
                row["candidate_sha1"] = new_hash
                row["selected_bytes"] = old_size
                row["candidate_bytes"] = new_size
                row["candidate_rgb_means"] = [round(x,1) for x in ImageStat.Stat(b.resize((32,32)).convert("RGB")).mean]
            contact_sheet(original,alternative,out/(prefix+"-contact-sheet.jpg"),
                "Candidate: Didier Descouens, CC BY-SA 4.0; modified side-by-side reviewer copy. Original selected photo preserved.")
            row["state"] = "DOWNLOADED_HASH_AND_PIXELS_VERIFIED_VISUAL_REVIEW_PENDING"
        except Exception as exc:
            row["state"] = "FAILED_CANNOT_CERTIFY"
            row["error"] = str(exc)
            any_failure = True
        results.append(row)
    report = {"schema":"AO_PHASE52_ACQUISITION_RUN_V1","research_only":True,
              "publication_changes":0,"photos_editorially_approved":0,"results":results}
    (out/"run-report.json").write_text(json.dumps(report,indent=2)+"\n",encoding="utf-8")
    (out/"PHOTO-LICENSE-AND-STATUS.txt").write_text(
        "Research-only images. NOT approved for app publication.\n"
        "Alternative photographs: © Didier Descouens, CC BY-SA 4.0, "
        "https://creativecommons.org/licenses/by-sa/4.0/\n"
        "Any app use and adapted photo require proper attribution and share-alike compliance.\n"
        "Preserve original selected photographs. No automatic Commons promotion.\n", encoding="utf-8")
    print(json.dumps(report,indent=2))
    if any_failure:
        raise SystemExit(1)

if __name__ == "__main__":
    main()
