#!/usr/bin/env python3
"""Acquire one complete CC0 museum Via Crucis series, not individual artwork proposals.

Downloads all 14 Cooper Hewitt scans from Wikimedia Commons, verifies object metadata,
makes 2400px quality-preserving WEBP research derivatives, and records SHA256 provenance.
Does NOT publish these files to the Prayer runtime or replace existing approved art.
"""
from __future__ import annotations

import hashlib
import io
import json
import os
import sys
import time
import urllib.parse
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path("data/prayer/stations/cooperhewitt-via-crucis-1749")
UA = "AdOrientemArtResearch/1.0 (https://github.com/Fulcanelli13/ad-orientem; open access sacred art research)"
API = "https://commons.wikimedia.org/w/api.php"


def get(url: str, attempts: int = 4) -> bytes:
    last = None
    for attempt in range(attempts):
        try:
            request = urllib.request.Request(
                url, headers={"User-Agent": UA, "Accept": "*/*"}
            )
            with urllib.request.urlopen(request, timeout=120) as response:
                return response.read()
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as err:
            last = err
            print(f"Source fetch attempt {attempt + 1}/{attempts} failed: {str(err)[:160]}", flush=True)
            time.sleep(min(3 * (attempt + 1), 12))
    raise RuntimeError(f"Failed to retrieve {url!r}: {last}")


def query_imageinfo(titles: list[str]) -> dict:
    params = {
        "action": "query", "prop": "imageinfo", "format": "json",
        "iiprop": "url|size|sha1|extmetadata",
        "titles": "|".join("File:" + t for t in titles),
    }
    raw = get(API + "?" + urllib.parse.urlencode(params))
    data = json.loads(raw)
    if data.get("error"):
        raise RuntimeError("Commons MediaWiki API returned: " + str(data["error"]))
    found = {}
    for page in data.get("query", {}).get("pages", {}).values():
        if page.get("missing") is not None or not page.get("imageinfo"):
            raise RuntimeError("Unresolved Commons file: " + str(page.get("title")))
        found[page["title"][5:].replace("_", " ")] = page["imageinfo"][0]
    if len(found) != len(titles):
        raise RuntimeError(f"Expected exactly {len(titles)} different sources; received {len(found)}")
    return found


def main() -> None:
    manifest = json.loads((ROOT / "manifest.v1.json").read_text())
    entries = manifest["stations"]
    assert len(entries) == 14
    assert [x["number"] for x in entries] == list(range(1, 15))
    assert len({x["commonsFileTitle"] for x in entries}) == 14
    assert "Lybaert" not in json.dumps(manifest)
    all_meta = query_imageinfo([x["commonsFileTitle"] for x in entries])
    staged = []
    fingerprints = set()

    # Download + validate every original before committing any outputs.
    for entry in entries:
        title = entry["commonsFileTitle"].replace("_", " ")
        ii = all_meta.get(title)
        if not ii:
            raise RuntimeError(f"Exact file missing in Commons response: {title}")
        md = ii.get("extmetadata", {})
        license_name = str(md.get("LicenseShortName", {}).get("value", ""))
        usage = str(md.get("UsageTerms", {}).get("value", ""))
        license_text = (license_name + " " + usage).casefold()
        if not any(word in license_text for word in ("public domain", "cc0", "pd-art", "pd-old")):
            raise RuntimeError(f"PD/CC0 rights assertion missing for Station {entry['roman']}: {license_name} / {usage}")
        original = get(ii["url"])
        sha = hashlib.sha256(original).hexdigest()
        if sha in fingerprints:
            raise RuntimeError(f"Duplicate photographic original for Station {entry['roman']}")
        fingerprints.add(sha)
        with Image.open(io.BytesIO(original)) as im:
            original_width, original_height = im.size
            if original_width < 1800 or original_height < 2800:
                raise RuntimeError(f"Insufficient native quality at Station {entry['roman']}: {im.size}")
            if abs(original_width - entry["expectedOriginal"]["width"]) > 3 or abs(original_height - entry["expectedOriginal"]["height"]) > 3:
                raise RuntimeError(f"Original dimensions changed for Station {entry['roman']}: {im.size}")
            resized = ImageOps.exif_transpose(im).convert("RGB")
            max_edge = int(manifest["acquisition"]["maxLongEdge"])
            resized.thumbnail((max_edge, max_edge), Image.Resampling.LANCZOS)
            out = io.BytesIO()
            resized.save(out, "WEBP", quality=int(manifest["acquisition"]["webpQuality"]), method=int(manifest["acquisition"]["webpMethod"]))
            derivative = out.getvalue()
            if len(derivative) < 80_000:
                raise RuntimeError(f"Unexpected derivative size for Station {entry['roman']}")
            output_rel = Path(entry["assetDestination"])
            output_abs = Path(".") / output_rel
            staged.append((output_abs, derivative, {
                "station": entry["number"],
                "roman": entry["roman"],
                "canonicalSlotId": entry["canonicalSlotId"],
                "sourceObject": title,
                "commonsPage": entry["commonsPage"],
                "sourceDownloadUrl": ii["url"],
                "sourceSHA1Commons": ii.get("sha1"),
                "sourceSHA256": sha,
                "sourceBytes": len(original),
                "sourceDimensions": [original_width, original_height],
                "licenseClaim": license_name,
                "usageTerms": usage,
                "museum": "Cooper Hewitt, Smithsonian Design Museum",
                "derivativePath": str(output_rel),
                "derivativeSHA256": hashlib.sha256(derivative).hexdigest(),
                "derivativeBytes": len(derivative),
                "derivativeDimensions": list(resized.size),
                "format": "WEBP",
                "artisticApprovalStatus": "SINGLE_SERIES_RESEARCH_AWAITING_VISUAL_EDITORIAL_REVIEW",
                "photoNativeQAStatus": "MEASUREMENTS_AND_DECODE_PASS; NO_MANUAL_CROP_OR_COLOR_SIGNOFF",
                "productionReady": False,
                "runtimeEnabled": False,
            }))
        print(f"Prepared Station {entry['roman']}: {len(original):,} original -> {len(derivative):,} WebP bytes", flush=True)

    assert len(staged) == 14
    for filename, pixels, _record in staged:
        filename.parent.mkdir(parents=True, exist_ok=True)
        filename.write_bytes(pixels)
    results = {
        "schema": "AO_STATIONS_COOPERHEWITT_BULK_ACQUISITION_RESULTS_V1",
        "timestampUTC": datetime.now(timezone.utc).isoformat(),
        "sourceManifest": str(ROOT / "manifest.v1.json"),
        "downloadedAndConverted": len(staged),
        "sourceOriginalCount": len(fingerprints),
        "derivativeByteTotal": sum(len(x[1]) for x in staged),
        "rightsBasis": "Smithsonian CC0 plus Commons PD-Art; metadata per exact file",
        "previouslyApprovedImagesReplaced": 0,
        "livePrayerImagesPublished": 0,
        "fullNativeImageArchivesInGit": False,
        "derivativesPersistInGit": True,
        "stations": [x[2] for x in staged],
    }
    (ROOT / "acquisition-results.v1.json").write_text(json.dumps(results, indent=2) + "\n")
    print(json.dumps({
        "readyForArchivalCommit": len(staged),
        "derivativeBytes": results["derivativeByteTotal"],
        "publishedInApp": 0,
        "rights": results["rightsBasis"],
    }, indent=2))


if __name__ == "__main__":
    main()
