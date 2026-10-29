#!/usr/bin/env python3
"""Stage bounded Commons originals from frozen Directory discovery. NEVER publish.

Consumes the existing wave-specific W1 research export, rather than inventing
new church identities or accepting arbitrary image URLs. Source identity stays
UNVERIFIED until independently approved; original-file rights and bytes are
checked independently before a local WebP can be staged.

Usage:
 python tools/directory/stage-bulk-place-photos.py --candidate-file /tmp/r49-exterior-0-100.json \
   --wave exterior --selection-offset 0 --limit 30 --output-dir /tmp/staged \
   --report /tmp/stage-report.json
"""
from __future__ import annotations

import argparse
import hashlib
import html
import io
import json
import re
import tempfile
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ROSTER = ROOT / "data/directory/preliminary-map-r49.v1.json"
GEO = ROOT / "data/geography/seed-registry.v1.json"
COMMONS = "https://commons.wikimedia.org/w/api.php"
UA = "AdOrientemDirectoryPhotoStaging/1.0 (https://github.com/Fulcanelli13/ad-orientem; free Commons rights/hash verification)"
ROLES = {"exterior": ("EXTERIOR",), "interior": ("INTERIOR", "SACRED_DETAIL")}
LICENSES = {
    "CC0": "https://creativecommons.org/publicdomain/zero/1.0/",
    "CC-BY-4.0": "https://creativecommons.org/licenses/by/4.0/",
    "CC-BY-SA-4.0": "https://creativecommons.org/licenses/by-sa/4.0/",
    "CC-BY-SA-3.0": "https://creativecommons.org/licenses/by-sa/3.0/",
    "CC-BY-SA-2.0": "https://creativecommons.org/licenses/by-sa/2.0/",
}
MAX_SELECTION = 50
MAX_ORIGINAL_BYTES = 16_000_000
MAX_BATCH_ORIGINAL_BYTES = 160_000_000
MAX_IMAGE_PIXELS = 32_000_000
SHA1 = re.compile(r"[0-9a-f]{40}\Z")
ALLOWED_HOSTS = {"commons.wikimedia.org", "upload.wikimedia.org"}

def clean(value):
    return " ".join(html.unescape(re.sub(r"<[^>]*>", " ", str(value or ""))).split())

def licensed_url(value):
    url = urllib.parse.urlsplit(str(value or ""))
    return url.scheme == "https" and url.hostname == "creativecommons.org" and not url.username and not url.password

def checked_https(url, allowed):
    p = urllib.parse.urlsplit(str(url or ""))
    if (p.scheme != "https" or p.hostname not in allowed or p.username
            or p.password or p.port not in (None, 443)):
        raise ValueError("Unapproved source host")
    return url

def fetch(url, limit):
    checked_https(url, ALLOWED_HOSTS)
    request = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urllib.request.urlopen(request, timeout=40) as response:
        checked_https(response.geturl(), ALLOWED_HOSTS)
        data = response.read(limit + 1)
        if len(data) > limit:
            raise ValueError("Oversized Commons response")
        return data

def license_from_metadata(image):
    meta = image.get("extmetadata") or {}
    def get(key):
        return clean((meta.get(key) or {}).get("value"))
    label = re.sub(r"[^A-Z0-9]", "", get("LicenseShortName").upper())
    named = {
        "CC0": "CC0", "CC010": "CC0",
        "CCBY40": "CC-BY-4.0",
        "CCBYSA40": "CC-BY-SA-4.0",
        "CCBYSA30": "CC-BY-SA-3.0",
        "CCBYSA20": "CC-BY-SA-2.0",
    }.get(label)
    url = get("LicenseUrl")
    if not named or not licensed_url(url):
        raise ValueError("Unsupported or unverifiable licence")
    # Canonical URL may carry a query string/fragment or deed language. The
    # legal licence path, scheme and host must match exactly.
    p = urllib.parse.urlsplit(url)
    expected = urllib.parse.urlsplit(LICENSES[named])
    if p.path.rstrip("/") != expected.path.rstrip("/"):
        raise ValueError("Commons licence URL mismatch")
    author = get("Artist")
    if not author or len(author) > 500:
        raise ValueError("Source has no usable author attribution")
    return named, author

def frozen_venues():
    roster = json.loads(ROSTER.read_text(encoding="utf-8"))
    if roster.get("schema") != "AO_PRELIMINARY_TLM_MAP_R49":
        raise ValueError("Wrong frozen roster schema")
    columns = roster["columns"]
    if len(roster["records"]) != 1879 or "id" not in columns:
        raise ValueError("Unexpected venue count or source columns")
    ids = [row[columns.index("id")] for row in roster["records"]]
    if len(set(ids)) != len(ids):
        raise ValueError("Duplicate frozen Directory venue")
    return set(ids)

def place_links():
    geo = json.loads(GEO.read_text(encoding="utf-8"))
    if geo.get("schema") != "EXPLORE_GEOGRAPHY_SEED_V1":
        raise ValueError("Unexpected Geography identity registry")
    return {
        row["venue_id"]: row["place_id"]
        for row in geo.get("directoryPlaceLinks", [])
        if row.get("relationship") == "LOCATED_AT"
        and row.get("confidence") == "CONFIRMED"
    }

def commons_title(value):
    if (not isinstance(value, str) or not value.startswith("File:")
            or len(value) > 260 or any(c in value for c in "\r\n\0")):
        raise ValueError("Invalid Commons source title")
    return value

def source_url(title):
    return "https://commons.wikimedia.org/wiki/" + urllib.parse.quote(
        title.replace(" ", "_"), safe=":/_(),-")

def candidate_selection(payload, wave):
    """Select at most one image per site/role, held for subject/visual audit."""
    if wave not in ROLES or payload.get("schema") != "AO_DIRECTORY_OPEN_PHOTO_CANDIDATES_V1":
        raise ValueError("Expected wave-specific Directory discovery export")
    if payload.get("publication") != "RESEARCH_ONLY_NEVER_APP_VISIBLE":
        raise ValueError("Discovery data must remain research only")
    if payload.get("wave", "all") not in (wave, "all"):
        raise ValueError("Wrong source wave")
    roster = frozen_venues()
    links = place_links()
    choices, seen_pairs, seen_files = [], set(), set()
    for venue in payload.get("venues", []):
        ident = venue.get("source_id")
        if ident not in roster:
            raise ValueError("Candidate venue is not in frozen Directory roster")
        if ident in seen_pairs:
            raise ValueError("Repeated candidate venue")
        seen_pairs.add(ident)
        for role in ROLES[wave]:
            for photo in venue.get("categories", {}).get(role, []):
                if photo.get("category_requested") != role:
                    continue
                if photo.get("discovery_method") == "OPENVERSE_API_SEARCH":
                    continue  # Openverse indices lack original Commons SHA1.
                sha = str(photo.get("source_sha1") or "").lower()
                if not SHA1.fullmatch(sha):
                    continue
                try:
                    title = commons_title(photo.get("commons_title"))
                except ValueError:
                    continue
                # Source URL must resolve to that exact Commons file, never a
                # third-party URL smuggled into the discovery metadata.
                supplied = photo.get("source_url", "")
                if (urllib.parse.unquote(str(supplied)).replace("_", " ")
                        != urllib.parse.unquote(source_url(title)).replace("_", " ")):
                    continue
                if photo.get("license") not in LICENSES:
                    continue
                key = (ident, sha)
                if key in seen_files:
                    continue
                seen_files.add(key)
                choices.append({
                    "venue_id": ident, "place_id": links.get(ident),
                    "role": role, "title": title, "expected_sha1": sha,
                    "expected_license": photo["license"],
                    "discovery_method": photo["discovery_method"],
                    "panorama_hint": photo.get("panorama_hint", "UNSPECIFIED"),
                    "subject_identity": "UNVERIFIED_DISCOVERY_MATCH",
                    "site_verification": "CONFIRMED_DIRECTORY_PLACE_LINK"
                        if ident in links else "VENUE_ONLY_RESEARCH_HOLD",
                })
                break
    return choices

def api_metadata(entry):
    url = COMMONS + "?" + urllib.parse.urlencode({
        "action": "query", "format": "json", "formatversion": "2",
        "titles": entry["title"], "prop": "imageinfo",
        "iiprop": "url|size|sha1|mime|extmetadata",
    })
    result = json.loads(fetch(url, 2_000_000))
    pages = result.get("query", {}).get("pages", [])
    if len(pages) != 1 or pages[0].get("missing") or not pages[0].get("imageinfo"):
        raise ValueError("Commons original does not exist")
    if pages[0].get("title") != entry["title"]:
        raise ValueError("Commons file title redirected or changed")
    info = pages[0]["imageinfo"][0]
    if (info.get("mime") not in {"image/jpeg", "image/png", "image/webp"}
            or int(info.get("size", 0)) > MAX_ORIGINAL_BYTES
            or min(int(info.get("width", 0)), int(info.get("height", 0))) < 650
            or int(info["width"]) * int(info["height"]) > MAX_IMAGE_PIXELS):
        raise ValueError("Unsupported/oversized/undersized original")
    if info.get("sha1") != entry["expected_sha1"]:
        raise ValueError("Commons source revision SHA1 changed")
    name, author = license_from_metadata(info)
    if name != entry["expected_license"]:
        raise ValueError("Commons licence changed after discovery")
    checked_https(info.get("url"), {"upload.wikimedia.org"})
    return info, name, author

def safe_filename(entry):
    venue_digest = hashlib.sha256(entry["venue_id"].encode("utf-8")).hexdigest()[:16]
    return venue_digest + "-" + entry["role"].lower() + "-" + entry["expected_sha1"][:16] + ".webp"

def convert_original(original, info, entry):
    from PIL import Image, ImageOps, UnidentifiedImageError
    Image.MAX_IMAGE_PIXELS = MAX_IMAGE_PIXELS
    with Image.open(io.BytesIO(original)) as img:
        fmt = {"image/jpeg": "JPEG", "image/png": "PNG", "image/webp": "WEBP"}[info["mime"]]
        if img.format != fmt or img.size != (info["width"], info["height"]):
            raise ValueError("Decoded original differs from Commons metadata")
        picture = ImageOps.exif_transpose(img).convert("RGB")
        # Wide possible 360 views remain higher-resolution candidates; never
        # claim their projection is verified or enable interactive rendering.
        is_possible_360 = (
            entry.get("panorama_hint") == "POSSIBLE_360_EQUIRECTANGULAR_REQUIRES_REVIEW"
            and 1.8 <= picture.width / max(1, picture.height) <= 2.2
        )
        max_dim = 4096 if is_possible_360 else 1280
        picture.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
        output = io.BytesIO()
        picture.save(output, "WEBP", quality=84, method=6)
        result = output.getvalue()
        if len(result) < 3000 or result[:4] != b"RIFF" or result[8:12] != b"WEBP":
            raise ValueError("Invalid WebP conversion")
        return result, picture.size, is_possible_360

def stage(payload, wave, offset, limit, output_dir, report_path, *, validate_only=False, metadata_loader=api_metadata, downloader=fetch):
    if limit < 1 or limit > MAX_SELECTION or offset < 0:
        raise ValueError("Requested download batch exceeds cap")
    choices = candidate_selection(payload, wave)
    selected = choices[offset:offset + limit]
    if validate_only:
        return {"schema": "AO_DIRECTORY_BULK_STAGE_REPORT_V1",
                "wave": wave, "available_candidates": len(choices),
                "selected": len(selected), "status": "VALIDATED_NO_NETWORK",
                "publication": False, "staged": [], "held": []}
    if not selected:
        raise ValueError("No eligible SHA1-anchored Commons candidates in selection range")
    output_dir = Path(output_dir)
    report_path = Path(report_path)
    if output_dir.exists() and any(output_dir.iterdir()):
        raise ValueError("Output directory is not empty; refuse overwrite")
    if report_path.exists():
        raise ValueError("Report already exists; refuse overwrite")
    staged, held, bytes_read = [], [], 0
    # Only one batch is processed. A failed image is a hold, not permission to
    # substitute a similarly named church or a different Commons original.
    with tempfile.TemporaryDirectory(prefix="ao-photo-bulk-") as work:
        scratch = Path(work)
        for entry in selected:
            try:
                info, license_name, author = metadata_loader(entry)
                if bytes_read + int(info["size"]) > MAX_BATCH_ORIGINAL_BYTES:
                    raise ValueError("Batch original-byte cap reached")
                original = downloader(info["url"], MAX_ORIGINAL_BYTES)
                if hashlib.sha1(original).hexdigest() != entry["expected_sha1"]:
                    raise ValueError("Original downloaded bytes differ from Commons SHA1")
                bytes_read += len(original)
                derivative, (width, height), possible_360 = convert_original(original, info, entry)
                filename = safe_filename(entry)
                (scratch / filename).write_bytes(derivative)
                staged.append({
                    "venue_id": entry["venue_id"], "place_id": entry["place_id"],
                    "role": entry["role"], "status": "STAGED_AWAITING_SUBJECT_AND_VISUAL_REVIEW",
                    "site_verification": entry["site_verification"],
                    "subject_identity": "UNVERIFIED_DISCOVERY_MATCH",
                    "asset_path": filename, "source_title": entry["title"],
                    "source_url": source_url(entry["title"]),
                    "original_sha1": entry["expected_sha1"],
                    "original_bytes": len(original),
                    "original_width": info["width"], "original_height": info["height"],
                    "width": width, "height": height,
                    "derivative_sha256": hashlib.sha256(derivative).hexdigest(),
                    "photographer_source": author,
                    "license": license_name, "license_url": LICENSES[license_name],
                    "panorama_hint": entry.get("panorama_hint", "UNSPECIFIED"),
                    "possible_360_not_verified": possible_360,
                    "transformation": "EXIF orientation, RGB, full-frame WebP quality 84; no crop or recolour",
                    "publication": False,
                })
            except (ValueError, KeyError, TypeError, OSError, TimeoutError,
                    urllib.error.URLError, json.JSONDecodeError) as error:
                held.append({
                    "venue_id": entry["venue_id"], "role": entry["role"],
                    "source_title": entry["title"], "status": "HOLD_ORIGINAL_UNVERIFIED",
                    "reason": type(error).__name__ + ": " + str(error)[:160],
                })
        if not staged:
            raise ValueError("No image files passed original-byte and licence checks")
        output_dir.mkdir(parents=True, exist_ok=True)
        for item in staged:
            (scratch / item["asset_path"]).replace(output_dir / item["asset_path"])
    report = {
        "schema": "AO_DIRECTORY_BULK_STAGE_REPORT_V1", "wave": wave,
        "status": "STAGED_NOT_PUBLISHED", "publication": False,
        "source_records": payload.get("processed"), "available_candidates": len(choices),
        "selection_offset": offset, "selected": len(selected), "staged_count": len(staged),
        "held_count": len(held), "original_bytes_downloaded": bytes_read,
        "source_verification_policy": "Original Commons SHA1, CC licence URL, MIME, author and local SHA256 verified",
        "subject_verification_policy": "All candidate identities remain unverified; visual audit plus independent subject confirmation required",
        "staged": staged, "held": held,
    }
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return report

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--candidate-file", type=Path, required=True)
    ap.add_argument("--wave", choices=tuple(ROLES), required=True)
    ap.add_argument("--selection-offset", type=int, default=0)
    ap.add_argument("--limit", type=int, default=30)
    ap.add_argument("--output-dir", type=Path, required=True)
    ap.add_argument("--report", type=Path, required=True)
    ap.add_argument("--validate-only", action="store_true")
    args = ap.parse_args()
    payload = json.loads(args.candidate_file.read_text(encoding="utf-8"))
    report = stage(payload, args.wave, args.selection_offset, args.limit,
                   args.output_dir, args.report, validate_only=args.validate_only)
    print(json.dumps({k: v for k, v in report.items() if k not in {"staged", "held"}},
                     sort_keys=True))

if __name__ == "__main__":
    main()
