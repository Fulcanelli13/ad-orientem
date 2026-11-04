#!/usr/bin/env python3
"""Read-only Commons metadata triage of Sacred Atlas's 85 unselected source leads.

Uses at most five spaced API requests for up to 20 distinct files each. Never
downloads image bytes, selects photographs, changes approved registries, retries
429, or publishes media. Network failures are recorded as holds.
"""
from __future__ import annotations

import argparse
from collections import Counter
from datetime import datetime, timezone
import html
import json
from pathlib import Path
import re
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[2]
RESEARCH = ROOT / "data/geography/research"
API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "AdOrientemSacredAtlasResearch/2026-11-04 (https://github.com/Fulcanelli13/ad-orientem; read-only, paced Commons source metadata)"
SOURCES = {
    "queue": "sacred-atlas-undecided66-editorial-review-20261104.v1.json",
    "a": "sacred-atlas-undecided66-fresh-source-leads-20261104.v1.json",
    "b": "sacred-atlas-undecided66-fresh-source-webscreen-b2-20261104.v1.json",
    "c": "sacred-atlas-undecided66-fresh-source-webscreen-b3-20261104.v1.json",
    "d": "sacred-atlas-undecided66-bulk-category-candidate-screen-20261104.v1.json",
}
SUPPORTED_CC = re.compile(r"^https://creativecommons[.]org/licenses/(?:by|by-sa)/(?:2[.]0|3[.]0|4[.]0)/?$")
CC0 = re.compile(r"^https://creativecommons[.]org/publicdomain/zero/1[.]0/?$")
MAX_RESPONSE = 7_000_000
MIN_SECONDS_BETWEEN_REQUESTS = 15


def clean(value):
    return " ".join(html.unescape(re.sub(r"<[^>]*>", " ", str(value or ""))).split())[:800]


def get_data():
    return {k: json.loads((RESEARCH / path).read_text(encoding="utf-8"))
            for k, path in SOURCES.items()}


def construct_queue(data):
    places = data["queue"]["rows"]
    if len(places) != 66 or len({p["place_id"] for p in places}) != 66:
        raise ValueError("66-place frozen editorial queue changed")
    valid_ids = {p["place_id"] for p in places}
    unique = {}

    def add(place_id, title, source_page, provenance, note):
        if place_id not in valid_ids or not isinstance(title, str):
            raise ValueError("Invalid place ID or Commons filename")
        if not title.startswith("File:") or len(title) > 400 or "\n" in title:
            raise ValueError("Unsafe Commons filename")
        key = (place_id, title.casefold())
        if key not in unique:
            unique[key] = {
                "place_id": place_id, "source_title": title,
                "source_page_claim": source_page, "provenance": provenance,
                "source_note": note, "publication_authorized": False,
            }

    for row in data["a"]["leads"]:
        add(row["place_id"], row["title"], row["url"], "PRIOR_WEB_LEAD", row["review"])
    for row in data["b"]["records"]:
        add(row["place_id"], row["title"], row["source_page"], "PRIOR_WEB_SCREEN", row["disposition"])
    for row in data["c"]["records"]:
        add(row["place_id"], row["source_title"], row["source_page"], "PRIOR_WEB_SCREEN", row["disposition"])
    for group in data["d"]["category_review"]:
        for row in group["candidates"]:
            add(group["place_id"], row["source_title"], row["source_page"],
                "CATEGORY_INDEX_ONLY", row["evidence_level"])
    for row in data["d"]["direct_file_review"]:
        title = row["name"]
        add(row["id"], title if title.startswith("File:") else "File:" + title,
            row["source_page"], "DIRECT_WEB_LEAD", row["note"])

    items = list(unique.values())
    if len(items) != 85 or len({x["place_id"] for x in items}) != 24:
        raise ValueError("Frozen 85-file / 24-place queue changed; reconcile before query")
    return items


def describe(info):
    x = info.get("extmetadata") or {}
    field = lambda name: clean((x.get(name) or {}).get("value"))
    w, h = int(info.get("width") or 0), int(info.get("height") or 0)
    n = int(info.get("size") or 0)
    author, licence = field("Artist"), field("LicenseUrl")
    return {
        "current_sha1": str(info.get("sha1") or ""),
        "current_width": w, "current_height": h,
        "current_size_bytes": n, "mime": info.get("mime"),
        "author": author, "license_short_name": field("LicenseShortName"),
        "license_url": licence,
        "source_description_url": info.get("descriptionurl"),
    }


def assess(meta):
    if not re.fullmatch(r"[0-9a-f]{40}", meta["current_sha1"]):
        return "HOLD_SHA1_MISSING"
    if meta["mime"] not in ("image/jpeg", "image/png", "image/webp"):
        return "HOLD_UNSUPPORTED_IMAGE_TYPE"
    if meta["current_width"] < 1024 or meta["current_height"] < 768:
        return "HOLD_ORIGINAL_TOO_SMALL"
    if meta["current_width"] * meta["current_height"] > 65_000_000 or meta["current_size_bytes"] > 32_000_000:
        return "HOLD_ORIGINAL_SAFETY_LIMIT"
    artist = meta["author"].strip().casefold()
    if not artist or artist in {"unknown", "unknown author", "anonymous", "own work", "self"}:
        return "HOLD_ATTRIBUTION"
    url = meta["license_url"].rstrip("/") + "/"
    if CC0.fullmatch(url) or SUPPORTED_CC.fullmatch(url):
        return "METADATA_ELIGIBLE_MANUAL_SUBJECT_RIGHTS_AND_ORIGINAL"
    if "/licenses/" in url and "creativecommons.org" in url:
        return "HOLD_NONSTANDARD_OR_PORTED_CC_LEGAL_CODE"
    if "publicdomain" in url or "public domain" in meta["license_short_name"].lower():
        return "HOLD_PUBLIC_DOMAIN_LEGAL_BASIS"
    return "HOLD_LICENCE_NOT_CLEAR"


def trusted_url(url):
    u = urllib.parse.urlsplit(url)
    return u.scheme == "https" and u.hostname == "commons.wikimedia.org" and not u.username and not u.password and u.port in (None, 443)


def fetch_batch(titles):
    params = urllib.parse.urlencode({
        "action": "query", "format": "json", "formatversion": "2",
        "titles": "|".join(titles), "prop": "imageinfo",
        "iiprop": "size|sha1|mime|extmetadata|url",
        "iilimit": "1",
    })
    url = API + "?" + params
    if not trusted_url(url):
        raise ValueError("Unexpected Commons host")
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    with urllib.request.urlopen(request, timeout=45) as response:
        if not trusted_url(response.geturl()):
            raise ValueError("Unexpected Commons redirect")
        raw = response.read(MAX_RESPONSE + 1)
    if len(raw) > MAX_RESPONSE:
        raise ValueError("Commons metadata response exceeds bounded limit")
    payload = json.loads(raw)
    if payload.get("error"):
        raise ValueError("Commons API error: " + str(payload["error"])[:150])
    return {p.get("title"): p for p in payload.get("query", {}).get("pages", [])}


def audit(items, fetch=fetch_batch, sleep=time.sleep):
    results = []
    pause = False
    by_title = {}
    for row in items:
        by_title.setdefault(row["source_title"], []).append(row)
    titles = list(by_title)
    # Non-bot API limit is 50 titles; 20 provides bounded metadata responses.
    for offset in range(0, len(titles), 20):
        chunk = titles[offset:offset + 20]
        if offset and not pause:
            sleep(MIN_SECONDS_BETWEEN_REQUESTS)
        if pause:
            for title in chunk:
                for row in by_title[title]:
                    results.append({**row, "status": "PAUSED_AFTER_COMMONS_429"})
            continue
        try:
            pages = fetch(chunk)
        except urllib.error.HTTPError as exc:
            code = int(exc.code)
            if code == 429:
                pause = True
            for title in chunk:
                for row in by_title[title]:
                    results.append({**row, "status": "HOLD_COMMONS_HTTP_" + str(code)})
            continue
        except Exception as exc:
            for title in chunk:
                for row in by_title[title]:
                    results.append({**row, "status": "HOLD_COMMONS_REQUEST_ERROR",
                                    "error": type(exc).__name__ + ": " + str(exc)[:140]})
            continue
        for title in chunk:
            page = pages.get(title)
            for row in by_title[title]:
                out = dict(row)
                if not page or page.get("missing") or not page.get("imageinfo"):
                    out["status"] = "HOLD_ORIGINAL_NOT_FOUND_OR_TITLE_CHANGED"
                else:
                    details = describe(page["imageinfo"][0])
                    out.update(details)
                    out["status"] = assess(details)
                results.append(out)
    # Stable ordering for human review, never by alphabetical Commons API pages.
    lookup = {(r["place_id"], r["source_title"]): r for r in results}
    return [lookup[(r["place_id"], r["source_title"])] for r in items]


def summary(items, results, live):
    return {
        "schema": "AO_SACRED_ATLAS_UNDECIDED66_BULK_COMMONS_METADATA_AUDIT_V1",
        "date_utc": datetime.now(timezone.utc).isoformat(),
        "scope": "READ_ONLY_NO_IMAGE_BYTES_NO_EDITORIAL_APPROVAL_NO_PUBLICATION",
        "source_items": len(items), "source_places": len({r["place_id"] for r in items}),
        "statuses": dict(Counter(row["status"] for row in results)),
        "commons_live_attempted": live,
        "published": 0, "publication_authorized": False,
        "human_review_requirements": [
            "Inspect the actual image for exact current physical site and cover composition.",
            "Recheck current Commons source, author, exact licence, attribution, and any underlying work rights.",
            "Acquire original bytes only with permission-compliant source access and verify recorded SHA1.",
            "Obtain explicit user editorial selection; do not infer approval from metadata.",
            "Reconcile metadata and approved media registry against current main before any release.",
        ],
        "results": results,
    }


def self_test():
    base = {"sha1": "a" * 40, "mime": "image/jpeg", "width": 4000, "height": 3000, "size": 2_000_000,
            "extmetadata": {"Artist": {"value": "Jane Doe"}, "LicenseUrl": {
                "value": "https://creativecommons.org/licenses/by-sa/4.0"}}}
    assert assess(describe(base)) == "METADATA_ELIGIBLE_MANUAL_SUBJECT_RIGHTS_AND_ORIGINAL"
    assert assess(describe({**base, "width": 400})) == "HOLD_ORIGINAL_TOO_SMALL"
    assert assess(describe({**base, "extmetadata": {**base["extmetadata"], "Artist": {"value": "Unknown author"}}})) == "HOLD_ATTRIBUTION"
    assert assess(describe({**base, "extmetadata": {**base["extmetadata"], "LicenseUrl": {
        "value": "https://creativecommons.org/licenses/by-sa/3.0/nl/deed.en"}}})) == "HOLD_NONSTANDARD_OR_PORTED_CC_LEGAL_CODE"
    one = {"place_id": "place:X", "source_title": "File:One.jpg", "source_page_claim": "", "publication_authorized": False}
    run = audit([one], fetch=lambda _: {"File:One.jpg": {"title": "File:One.jpg", "imageinfo": [base]}}, sleep=lambda _: None)
    assert len(run) == 1 and run[0]["publication_authorized"] is False
    assert run[0]["status"] == "METADATA_ELIGIBLE_MANUAL_SUBJECT_RIGHTS_AND_ORIGINAL"


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--self-test", action="store_true")
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--output", default="/tmp/ao-sacred-atlas-undecided66-bulk-commons-metadata.json")
    args = p.parse_args()
    if args.self_test:
        self_test()
        print("SELF_TEST_PASS")
        return
    items = construct_queue(get_data())
    if args.dry_run:
        print(json.dumps({"queue": 66, "source_items": len(items), "source_places": len({
            x["place_id"] for x in items}), "network_calls": 0}))
        return
    results = audit(items)
    report = summary(items, results, True)
    Path(args.output).write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("BULK_COMMONS_METADATA_AUDIT", json.dumps({
        "input": len(items), "checked": len(results), "statuses": report["statuses"], "published": 0
    }))


if __name__ == "__main__":
    main()
