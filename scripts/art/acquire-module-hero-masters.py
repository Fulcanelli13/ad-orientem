#!/usr/bin/env python3
"""Ad Orientem: no-cost, source-verified Commons master acquisition.

Default is metadata inspection only. --download stages *bytes* for human QA.
Never publishes, approves, alters the 22 editorial choices, or uploads to Actions artifacts.
Only Commons files explicitly classified as commons_pd_art in the audited manifest
are eligible. Other/attribution-licensed works are deliberately gated out.
"""
import argparse
import hashlib
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

API = "https://commons.wikimedia.org/w/api.php"
ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "data/research/module-hero-artwork-production-readiness-2026-10-26.audit1.json"
STAGE = ROOT / "assets/staged/module-hero-masters"
USER_AGENT = "AdOrientem-HeroAudit/1.0 (https://github.com/Fulcanelli13/ad-orientem; research-only)"
MAX_BYTES = 30 * 1024 * 1024


def fetch_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=45) as f:
        return json.load(f)


def info_for_commons_file(page_url):
    title = urllib.parse.unquote(urllib.parse.urlsplit(page_url).path.rsplit("/", 1)[-1])
    if not title.startswith("File:"):
        raise ValueError("Not a Commons File: URL: " + page_url)
    query = urllib.parse.urlencode({
        "action": "query", "format": "json", "redirects": 1,
        "prop": "imageinfo", "iiprop": "url|size|sha1|mime|extmetadata",
        "titles": title,
    })
    payload = fetch_json(API + "?" + query)
    pages = list(payload["query"]["pages"].values())
    if len(pages) != 1 or "imageinfo" not in pages[0]:
        raise ValueError("No current image metadata for " + title)
    return pages[0]["imageinfo"][0]


def download_verified(url, path, max_bytes, expected_sha1):
    host = urllib.parse.urlsplit(url).hostname
    if host != "upload.wikimedia.org":
        raise ValueError("Refusing non-Wikimedia media host " + str(host))
    if max_bytes > MAX_BYTES:
        raise ValueError("File exceeds capped download size")
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    path.parent.mkdir(parents=True, exist_ok=True)
    partial = path.with_suffix(path.suffix + ".part")
    sha1, sha256 = hashlib.sha1(), hashlib.sha256()
    length = 0
    try:
        with urllib.request.urlopen(req, timeout=90) as remote, partial.open("wb") as f:
            while (chunk := remote.read(1024 * 1024)):
                length += len(chunk)
                if length > MAX_BYTES or length > max_bytes + 4096:
                    raise ValueError("Download exceeded announced/capped bytes")
                sha1.update(chunk)
                sha256.update(chunk)
                f.write(chunk)
        if expected_sha1 and sha1.hexdigest().lower() != expected_sha1.lower():
            raise ValueError("Commons SHA1 and downloaded image differ")
        if length == 0:
            raise ValueError("Empty file")
        partial.replace(path)
        return length, sha256.hexdigest()
    finally:
        partial.unlink(missing_ok=True)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--download", action="store_true", help="Stage eligible public-domain bytes; otherwise inspection only")
    p.add_argument("--module", action="append", default=[], help="Limit to module ID (repeatable)")
    args = p.parse_args()
    doc = json.loads(MANIFEST.read_text(encoding="utf-8"))
    results = []
    for item in doc["entries"]:
        mid = item["module_id"]
        if args.module and mid not in args.module:
            continue
        candidate = item["master_candidate"]
        url = candidate.get("source_page") or ""
        if candidate["source_status"] != "commons_pd_art" or not url.startswith("https://commons.wikimedia.org/wiki/File:"):
            results.append({"module_id": mid, "status": "excluded_requires_manual_rights_or_source_review"})
            continue
        try:
            info = info_for_commons_file(url)
            licence = info.get("extmetadata", {}).get("LicenseShortName", {}).get("value", "")
            if "public domain" not in licence.lower() and "cc0" not in licence.lower():
                results.append({"module_id": mid, "status": "blocked_license", "license_reported": licence})
                continue
            size = info.get("size") or 0
            mime = info.get("mime") or ""
            original_url = info.get("url") or ""
            if size <= 0 or size > MAX_BYTES or mime not in ("image/jpeg", "image/png"):
                raise ValueError("Image too big or unsupported: " + str((size, mime)))
            filename = mid + (".png" if mime == "image/png" else ".jpg")
            record = {"module_id": mid, "status": "metadata_checked", "source_page": url,
                      "file_url": original_url, "license_reported": licence,
                      "width_px": info.get("width"), "height_px": info.get("height"),
                      "source_sha1": info.get("sha1"), "source_bytes": size}
            if args.download:
                dest = STAGE / filename
                written, digest = download_verified(original_url, dest, size, info.get("sha1"))
                record.update({"status": "staged_not_approved", "path": str(dest.relative_to(ROOT)),
                               "bytes": written, "sha256": digest})
            results.append(record)
        except (ValueError, OSError, urllib.error.URLError, KeyError) as exc:
            results.append({"module_id": mid, "status": "error", "error": str(exc)})
        time.sleep(0.25)  # Respect Wikimedia, no rapid repeated requests.
    print(json.dumps({"mode": "stage" if args.download else "inspect", "results": results}, indent=2))
    # Deliberately return failure if any attempted item cannot be inspected/downloaded.
    return int(any(x["status"] == "error" for x in results))


if __name__ == "__main__":
    sys.exit(main())
