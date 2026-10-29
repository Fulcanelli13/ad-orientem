#!/usr/bin/env python3
"""Acquire TWO independently source-checked St Alphonsus photos, staging only.

Never alters an approved-media manifest. Requires exact existing canonical
Directory->Place relation, Wikimedia originals and real source-file SHA1.
Outputs no cropped/recoloured imagery. Final visual review is a separate gate.
"""
from __future__ import annotations

import argparse
import hashlib
import html
import io
import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GEO = ROOT / "data/geography/seed-registry.v1.json"
OUT = ROOT / "assets/staged/directory-st-alphonsus"
REPORT = ROOT / "data/geography/research/directory-st-alphonsus-photo-stage-20261029.v1.json"
PLACE = "place:US:st-alphonsus-baltimore"
VENUE = "ao-fssp-national-shrine-of-st-alphonsus-liguori-114-w-saratoga-st-baltimore-md-21201-usa"
SOURCE_API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "AdOrientemChurchPhotos/1.0 (https://github.com/Fulcanelli13/ad-orientem; Commons rights/provenance check)"

SOURCES = (
    {
        "role": "EXTERIOR",
        "title": "File:Saint Alphonsus Church (1845), 114 W. Saratoga Street, Baltimore, MD 21201 (39227069094).jpg",
        "asset": "US-st-alphonsus-baltimore-exterior-2018.webp",
        "credit": "Baltimore Heritage / Eli Pousson",
        "author_contains": "Baltimore Heritage",
        "license": "CC0",
        "license_path": "/publicdomain/zero/1.0",
        "alt_en": "Street-corner exterior of the National Shrine of Saint Alphonsus Liguori in Baltimore",
        "alt_fr": "Vue extérieure du sanctuaire national Saint-Alphonse-de-Liguori à Baltimore",
        "label_en": "Exterior — Saint Alphonsus Shrine",
        "label_fr": "Extérieur — sanctuaire Saint-Alphonse",
    },
    {
        "role": "INTERIOR",
        "title": "File:St. Alphonsus Church interior, Baltimore.JPG",
        "asset": "US-st-alphonsus-baltimore-nave-2013.webp",
        "credit": "Farragutful",
        "author_contains": "Farragutful",
        "license": "CC-BY-SA-3.0",
        "license_path": "/licenses/by-sa/3.0",
        "expected_source_sha1": "232b01eff30d4bea08cd756108f5fcaf15d2b15b",
        "alt_en": "Interior nave and Gothic Revival architecture of Saint Alphonsus Church in Baltimore",
        "alt_fr": "Nef et architecture néogothique de l'église Saint-Alphonse de Baltimore",
        "label_en": "Interior — church nave",
        "label_fr": "Intérieur — nef de l'église",
    },
)
ImageGuardBytes = 12_000_000


def assert_identity():
    data = json.loads(GEO.read_text(encoding="utf-8"))
    assert data["schema"] == "EXPLORE_GEOGRAPHY_SEED_V1"
    places = [p for p in data["places"] if p["place_id"] == PLACE]
    assert len(places) == 1
    assert places[0]["address"]["country_code"] == "US"
    confirmed = [link for link in data["directoryPlaceLinks"]
                 if link["venue_id"] == VENUE and link["place_id"] == PLACE
                 and link["relationship"] == "LOCATED_AT"
                 and link["confidence"] == "CONFIRMED"]
    assert len(confirmed) == 1, "Cannot stage a photo for an unverified venue-Place join"
    assert "SHR-ALPHONSUS-BALTIMORE" in confirmed[0]["source_ids"]


def request(url, limit=ImageGuardBytes):
    parsed = urllib.parse.urlsplit(url)
    if parsed.scheme != "https" or parsed.hostname not in {
        "commons.wikimedia.org", "upload.wikimedia.org", "thumb.wikimedia.org"
    }:
        raise ValueError("Unexpected Wikimedia request host")
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=40) as response:
        redirect = urllib.parse.urlsplit(response.geturl())
        if redirect.scheme != "https" or redirect.hostname not in {
            "commons.wikimedia.org", "upload.wikimedia.org", "thumb.wikimedia.org"
        }:
            raise ValueError("Unexpected Wikimedia redirect")
        body = response.read(limit + 1)
    if len(body) > limit:
        raise ValueError("Oversized response")
    return body


def clean(text):
    return html.unescape(re.sub(r"<[^>]*>", " ", str(text or ""))).strip()


def fetch_meta(entry):
    query = urllib.parse.urlencode({
        "action": "query", "format": "json", "formatversion": "2",
        "titles": entry["title"], "prop": "imageinfo",
        "iiprop": "url|extmetadata|sha1|size|mime",
    })
    data = json.loads(request(SOURCE_API + "?" + query, 1_500_000))
    pages = data["query"]["pages"]
    assert len(pages) == 1 and not pages[0].get("missing"), entry["title"]
    img = pages[0]["imageinfo"][0]
    assert img["mime"] == "image/jpeg"
    assert img["width"] >= 1280 and img["height"] >= 960
    assert img["size"] < ImageGuardBytes
    assert re.fullmatch(r"[0-9a-f]{40}", img["sha1"])
    if entry.get("expected_source_sha1"):
        assert img["sha1"] == entry["expected_source_sha1"], "Commons original changed"
    get = lambda key: clean(img.get("extmetadata", {}).get(key, {}).get("value"))
    author = get("Artist")
    assert entry["author_contains"].casefold() in author.casefold(), (
        "Unexpected author for " + entry["title"] + ": " + author)
    declared = get("LicenseShortName").upper().replace("-", " ").replace("  ", " ")
    target = entry["license"].replace("-", " ").upper()
    # CC0 is also labeled CC0 1.0; no other licence is allowed.
    assert (declared.startswith("CC0") if entry["license"] == "CC0"
            else declared == target), f"Licence mismatch: {declared} vs {target}"
    parsed = urllib.parse.urlsplit(get("LicenseUrl"))
    assert parsed.hostname == "creativecommons.org"
    license_path = parsed.path.rstrip("/")
    expected_path = entry["license_path"]
    assert license_path == expected_path or (entry["license"] == "CC0" and license_path == expected_path + "/deed.en"), (
        "Unexpected licence URL path " + license_path + " for " + entry["title"]
    )
    assert urllib.parse.urlsplit(img["url"]).hostname == "upload.wikimedia.org"
    return img


def stage(*, validate_only=False):
    assert_identity()
    assert len(SOURCES) == 2
    assert {r["role"] for r in SOURCES} == {"EXTERIOR", "INTERIOR"}
    assert len({r["asset"] for r in SOURCES}) == 2
    if validate_only:
        return {"schema": "AO_ST_ALPHONSUS_STAGE_REPORT_V1",
                "status": "VALIDATED_MANIFEST_NOT_DOWNLOADED",
                "publication": False, "records": []}
    from PIL import Image, ImageOps
    Image.MAX_IMAGE_PIXELS = 32_000_000
    OUT.mkdir(parents=True, exist_ok=True)
    records = []
    for entry in SOURCES:
        info = fetch_meta(entry)
        source = request(info["url"])
        assert hashlib.sha1(source).hexdigest() == info["sha1"], "Original hash mismatch"
        with Image.open(io.BytesIO(source)) as img:
            assert img.format == "JPEG"
            image = ImageOps.exif_transpose(img).convert("RGB")
            assert min(image.size) >= 960
            image.thumbnail((1280, 1280), Image.Resampling.LANCZOS)
            path = OUT / entry["asset"]
            image.save(path, "WEBP", quality=84, method=6)
            width, height = image.size
        binary = path.read_bytes()
        assert len(binary) > 15_000 and binary[:4] == b"RIFF" and binary[8:12] == b"WEBP"
        records.append({
            "place_id": PLACE, "venue_id": VENUE, "role": entry["role"],
            "status": "STAGED_REVIEW_REQUIRED_NOT_APPROVED",
            "asset_path": path.relative_to(ROOT).as_posix(),
            "source_title": entry["title"],
            "source_url": "https://commons.wikimedia.org/wiki/" + urllib.parse.quote(
                entry["title"].replace(" ", "_"), safe=":/_(),-"),
            "original_sha1": info["sha1"],
            "original_bytes": info["size"],
            "width": width, "height": height,
            "derivative_sha256": hashlib.sha256(binary).hexdigest(),
            "credit": entry["credit"], "license": entry["license"],
            "license_url": "https://creativecommons.org" + entry["license_path"] + "/",
            "alt_en": entry["alt_en"], "alt_fr": entry["alt_fr"],
            "label_en": entry["label_en"], "label_fr": entry["label_fr"],
            "transformation": "EXIF orientation; RGB; fit within 1280px; full frame; WebP quality 84; no crop or recolour",
            "publication": False,
        })
    result = {
        "schema": "AO_ST_ALPHONSUS_STAGE_REPORT_V1",
        "date": "2026-10-29",
        "publication": False,
        "status": "STAGED_FOR_VISUAL_REVIEW_ONLY",
        "venue_id": VENUE, "place_id": PLACE,
        "records": records,
        "held_sacred_detail": "Individual altar photograph rights and original source not independently checked",
        "notes": "Assets must not be used in approved Directory gallery until visual quality, precise physical subject, rights, alt, and derivative SHA256 are reviewed.",
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return result


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--validate-only", action="store_true")
    args = ap.parse_args()
    result = stage(validate_only=args.validate_only)
    print(result["status"], len(result["records"]), flush=True)
