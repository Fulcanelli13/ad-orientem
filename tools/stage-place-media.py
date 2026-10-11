#!/usr/bin/env python3
"""Stage Wikimedia Commons physical-site photographs without publishing them.

Validation is deliberately fail-closed: this script NEVER writes to
data/geography/approved-place-media.v1.json. Site/rights/crop review is a
separate editorial act after the generated files can be inspected.
"""
import argparse
import hashlib
import html
import io
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data/geography/research/place-media-candidates-r58.v1.json"
FEATURED = ROOT / "data/geography/major-places-editorial.v1.json"
PLACES = ROOT / "data/geography/seed-registry.v1.json"
APPROVED = ROOT / "data/geography/approved-place-media.v1.json"
STAGING = ROOT / "assets/staged/place-media"
REPORT = ROOT / "data/geography/research/place-media-stage-report-r58.v1.json"
AGENT = "AdOrientemPlaceMediaResearch/1.0 (https://github.com/Fulcanelli13/ad-orientem; rights-audit)"

def load(path):
    return json.loads(path.read_text(encoding="utf-8"))

def request_bytes(url, max_bytes=15_000_000):
    host = urllib.parse.urlparse(url).hostname
    if host not in {"commons.wikimedia.org", "upload.wikimedia.org", "thumb.wikimedia.org"}:
        raise ValueError("Source host not allowlisted: " + str(host))
    last_error = None
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": AGENT,
                "Accept": "application/json" if "/api.php" in url else "image/*"})
            with urllib.request.urlopen(req, timeout=35) as response:
                if urllib.parse.urlparse(response.geturl()).hostname not in {
                    "commons.wikimedia.org", "upload.wikimedia.org", "thumb.wikimedia.org"}:
                    raise ValueError("Unsafe image redirect destination")
                data = response.read(max_bytes + 1)
                if len(data) > max_bytes:
                    raise ValueError("Source image exceeds size bound")
                return data
        except Exception as error:
            last_error = error
            if attempt < 2:
                time.sleep(2 ** attempt + 1)
    raise RuntimeError(str(last_error))

def cleaned(value):
    return html.unescape(re.sub(r"<[^>]+>", " ", str(value or ""))).strip()

def metadata_for(title):
    params = {
        "action": "query", "format": "json", "formatversion": "2",
        "prop": "imageinfo", "titles": title,
        "iiprop": "url|extmetadata|sha1|size|mime", "iiurlwidth": "1440",
    }
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
    data = json.loads(request_bytes(url, max_bytes=1_500_000))
    pages = data.get("query", {}).get("pages", [])
    if len(pages) != 1 or pages[0].get("missing"):
        raise ValueError("Commons file no longer exists")
    info = (pages[0].get("imageinfo") or [None])[0]
    if not info or not str(info.get("mime", "")).startswith("image/"):
        raise ValueError("Commons file is not an image")
    fields = info.get("extmetadata") or {}
    get = lambda key: cleaned((fields.get(key) or {}).get("value"))
    declared_license = get("LicenseShortName").replace("-", " ").upper()
    if declared_license not in {"CC BY SA 4.0", "CC BY-SA 4.0".replace("-", " ")}:
        raise ValueError("Licence is not CC BY-SA 4.0: " + declared_license)
    license_url = get("LicenseUrl")
    if not license_url.startswith("https://creativecommons.org/licenses/by-sa/4.0"):
        raise ValueError("Licence URL does not match CC BY-SA 4.0")
    image_url = info.get("thumburl") or info.get("url")
    if urllib.parse.urlparse(image_url).hostname not in {"upload.wikimedia.org", "thumb.wikimedia.org"}:
        raise ValueError("Image source is not from Wikimedia image delivery hosts")
    return {"source_image_url": image_url, "original_url": info.get("url"),
            "source_sha1": info.get("sha1"), "author": get("Artist"),
            "license": "CC-BY-SA-4.0", "license_url": license_url,
            "license_short_name": get("LicenseShortName"),
            "description": get("ImageDescription"),
            "original_file_bytes": info.get("size"),
            "source_mime": info.get("mime")}

def validate():
    research = load(SOURCE)
    curated = load(FEATURED)
    places = load(PLACES)
    approved = load(APPROVED)
    assert research["schema"] == "AO_EXPLORE_PLACE_MEDIA_RESEARCH_V1"
    assert curated["schema"] == "AO_EXPLORE_MAJOR_PLACES_EDITORIAL_V1"
    assert approved["schema"] == "AO_APPROVED_PLACE_MEDIA_V1"
    assert not approved.get("items"), "This acquisition must not modify the publication registry"
    candidates = research.get("candidates", [])
    held = research.get("held", [])
    assert len(candidates) == 18 and len(held) == 2
    featured = {p["place_id"] for p in curated["items"]}
    known = {p["place_id"] for p in places["places"]}
    seen = set()
    for row in candidates + held:
        key = row["place_id"]
        assert key in featured and key in known and key not in seen, key
        seen.add(key)
        assert row.get("source_page_url", "").startswith(
            "https://commons.wikimedia.org/wiki/File:"), key
    assert seen == featured, "Every curated physical site requires a source or explicit hold"
    for row in candidates:
        assert row["commons_title"].startswith("File:")
        assert row["expected_license"] == "CC BY-SA 4.0"
        assert row["publication_approved"] is False
        assert row["subject_crop_reviewed"] is False
        assert row["alt_en"].strip() and row["alt_fr"].strip()
    return research

def stage(research):
    from PIL import Image, ImageOps
    Image.MAX_IMAGE_PIXELS = 28_000_000
    STAGING.mkdir(parents=True, exist_ok=True)
    out = []
    for row in research["candidates"]:
        key = row["place_id"]
        entry = {"place_id": key, "file_page": row["source_page_url"],
                 "commons_title": row["commons_title"],
                 "status": "ERROR_NOT_PUBLISHED"}
        try:
            meta = metadata_for(row["commons_title"])
            raw = request_bytes(meta["source_image_url"])
            with Image.open(io.BytesIO(raw)) as origin:
                if origin.format not in {"JPEG", "PNG", "WEBP"}:
                    raise ValueError("Unsupported raster format")
                im = ImageOps.exif_transpose(origin)
                if im.width < 640 or im.height < 480:
                    raise ValueError("Original lacks minimum useful resolution")
                im = im.convert("RGB")
                im.thumbnail((1440, 1440), Image.Resampling.LANCZOS)
                path = STAGING / (key.replace("place:", "").replace(":", "-") + ".webp")
                im.save(path, "WEBP", quality=83, method=6)
                entry.update(status="STAGED_NOT_APPROVED",
                    asset_path=str(path.relative_to(ROOT)),
                    output_width=im.width, output_height=im.height,
                    output_bytes=path.stat().st_size,
                    derivative_sha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                    changes="Resized to maximum 1440px, converted to WebP; no crop.",
                    original_author_observed=row.get("observed_author"),
                    original_author_live=meta["author"],
                    alt_en=row["alt_en"], alt_fr=row["alt_fr"],
                    license=meta["license"], license_url=meta["license_url"],
                    source_sha1=meta["source_sha1"],
                    source_image_url=meta["source_image_url"])
        except Exception as exc:
            entry["error"] = str(exc)
            print("HOLD", key, str(exc), flush=True)
        else:
            print("STAGED", key, entry["output_bytes"], flush=True)
        out.append(entry)
    report = {
        "schema": "AO_EXPLORE_PHOTO_STAGE_REPORT_V1",
        "release_status": "STAGED_NOT_PUBLISHED",
        "summary": {"staged": sum(x["status"] == "STAGED_NOT_APPROVED" for x in out),
                    "failed": sum(x["status"] != "STAGED_NOT_APPROVED" for x in out),
                    "older_license_held": len(research["held"]),
                    "published": 0},
        "media": out, "held": research["held"],
        "next_gate": "Inspect physical site and crop, assess credits and ShareAlike; separately populate exact-ID approved-place-media after review. No automatic approval.",
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    print(json.dumps(report["summary"]), flush=True)
    if not report["summary"]["staged"]:
        sys.exit("No photos staged: Commons/API inaccessible or all candidates invalid.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--validate-only", action="store_true")
    options = parser.parse_args()
    manifest = validate()
    if options.validate_only:
        print("PASS source-aligned media manifest: 18 candidates + 2 explicit holds; zero approved.")
    else:
        stage(manifest)
