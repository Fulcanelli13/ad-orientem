#!/usr/bin/env python3
"""One-pass Openverse non-Wikimedia discovery for every unphotographed Sacred Atlas Place.

Research metadata ONLY. Never downloads, approves, or publishes a photograph.
No paid services, no source-license impersonation, no retries, no mirrors.
"""
from __future__ import annotations
import argparse
import json
import pathlib
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://api.openverse.org/v1/images/"
LICENSES = {"by", "by-sa", "cc0", "pdm"}
EXCLUDED = "wikimedia"
DEFAULT_SCOPE = pathlib.Path("data/geography/research/sacred-atlas-151-noncommons-coverage-scope-20261105.v1.json")
DEFAULT_OUTPUT = pathlib.Path("/tmp/ao-atlas-151-noncommons-sweep.json")


def https(value):
    try:
        url = urllib.parse.urlparse(str(value or ""))
        return value if url.scheme == "https" and url.netloc else None
    except ValueError:
        return None


def normal(s):
    return " ".join(str(s or "").split()).strip()


def select_results(data, place, query):
    out = []
    for item in data.get("results", []):
        if not isinstance(item, dict):
            continue
        license_code = str(item.get("license") or "").lower().strip()
        source = str(item.get("source") or "").lower().strip()
        url = https(item.get("foreign_landing_url")) or https(item.get("detail_url"))
        if license_code not in LICENSES or not url:
            continue
        # Openverse metadata can be indexed from Commons even when provider differs.
        if "wikimedia" in source or "commons.wikimedia.org" in url.lower():
            continue
        if any(r["source_page"] == url for r in out):
            continue
        title = normal(item.get("title")) or "(Untitled source photograph)"
        creator = normal(item.get("creator")) or None
        out.append({
            "source_page": url, "image_title": title, "creator": creator,
            "license_claim": license_code.upper(),
            "license_version": normal(item.get("license_version")) or None,
            "license_url": https(item.get("license_url")),
            "thumbnail_url": https(item.get("thumbnail")),
            "image_original_url": https(item.get("url")),
            "provider": normal(item.get("provider")) or "Openverse",
            "source": normal(item.get("source")) or None,
            "source_id": normal(item.get("id")) or None,
            "search_query": query,
            "width": item.get("width") if isinstance(item.get("width"), int) else None,
            "height": item.get("height") if isinstance(item.get("height"), int) else None,
            "exact_site_verified": False, "depicted_subject_verified": False,
            "source_license_independently_verified": False,
            "underlying_artwork_rights_checked": False, "publication_authorized": False,
        })
    return out[:10]


def request(query):
    params = {
        "q": query[:195], "page_size": "12",
        "license": "by,by-sa,cc0,pdm",
        "license_type": "commercial,modification",
        "excluded_source": EXCLUDED,
        "mature": "false", "filter_dead": "true",
    }
    endpoint = API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(endpoint, headers={
        "Accept": "application/json",
        "User-Agent": "AdOrientemSacredAtlasResearch/1.0 (github.com/Fulcanelli13/ad-orientem; open-license source discovery, no image downloads)",
    })
    with urllib.request.urlopen(req, timeout=40) as response:
        if response.status != 200:
            raise RuntimeError("OPENVERSE_HTTP_" + str(response.status))
        b = response.read(2_000_001)
        if len(b) > 2_000_000:
            raise ValueError("API_RESPONSE_TOO_LARGE")
        return json.loads(b.decode("utf-8"))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--scope", type=pathlib.Path, default=DEFAULT_SCOPE)
    parser.add_argument("--out", type=pathlib.Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--max-sites", type=int, default=151)
    parser.add_argument("--spacing-seconds", type=float, default=3.0)
    args = parser.parse_args()
    if args.max_sites < 1 or args.max_sites > 151 or args.spacing_seconds < 2.0:
        parser.error("max-sites must be 1..151; spacing must be at least 2s")
    scope = json.loads(args.scope.read_text(encoding="utf-8"))
    if scope["schema"] != "AO_SACRED_ATLAS_151_COVERAGE_FIRST_NONCOMMONS_V1" or len(scope["places"]) != 151:
        raise ValueError("151-site source contract missing")
    state = {
        "schema": "AO_SACRED_ATLAS_151_NONCOMMONS_OPENVERSE_DISCOVERY_V1",
        "date": "2026-11-05",
        "research_only": True,
        "automated_publications": 0,
        "source_filter": "Openverse commercial+modification permitted, Wikimedia excluded",
        "outcome": "IN_PROGRESS",
        "sites_in_scope": 151,
        "sites_queried": 0,
        "sites_with_candidates": 0,
        "image_candidate_records": 0,
        "provider_requests": 0,
        "stopped_http_429": False,
        "failed_place_id": None,
        "error": None,
        "places": [],
    }
    ids = set()
    t_last = None

    def write():
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf8")

    for site in scope["places"][:args.max_sites]:
        ident = site["place_id"]
        if ident in ids:
            raise ValueError("DUPLICATE_PLACE_ID_" + ident)
        ids.add(ident)
        queries = site.get("queries") or []
        record = {
            "place_id": ident, "name": site["name"], "country": site["country"],
            "prior_photo_choice": site["prior_photo_choice"],
            "already_selected_source": site["already_selected_source"],
            "status": "NOT_SEARCHED", "query_used": None, "candidates": [],
        }
        state["places"].append(record)
        for index, query in enumerate(queries[:2]):
            if t_last is not None:
                delay = args.spacing_seconds - (time.monotonic() - t_last)
                if delay > 0:
                    time.sleep(delay)
            state["provider_requests"] += 1
            try:
                t_last = time.monotonic()
                response = request(query)
                candidates = select_results(response, site, query)
                record["status"] = "CANDIDATES_UNVERIFIED" if candidates else "NO_MATCH_IN_THIS_OPEN_LIBRARY"
                record["query_used"] = query
                record["candidates"] = candidates
            except urllib.error.HTTPError as e:
                record["status"] = "STOP_HTTP_" + str(e.code)
                state["error"] = "Provider HTTP " + str(e.code)
                state["stopped_http_429"] = e.code == 429
                state["failed_place_id"] = ident
                state["outcome"] = "PARTIAL_PROVIDER_ERROR_NO_RETRY"
                write()
                print("STOP_HTTP", e.code, ident, file=sys.stderr, flush=True)
                return 2
            except Exception as e:
                record["status"] = "STOP_PROVIDER_ERROR"
                state["error"] = type(e).__name__ + ": " + str(e)[:280]
                state["failed_place_id"] = ident
                state["outcome"] = "PARTIAL_PROVIDER_ERROR_NO_RETRY"
                write()
                print("STOP_PROVIDER_ERROR", ident, state["error"], file=sys.stderr, flush=True)
                return 2
            if candidates:
                break
        state["sites_queried"] += 1
        state["sites_with_candidates"] += bool(record["candidates"])
        state["image_candidate_records"] += len(record["candidates"])
        if len(state["places"]) % 10 == 0:
            write()
            print(f"Non-Commons discovery {len(state['places'])}/{min(args.max_sites,151)}: {state['sites_with_candidates']} places with unverified image leads", flush=True)

    state["outcome"] = "COMPLETE_SOURCE_SEARCH_NOT_SITE_APPROVAL"
    write()
    print(json.dumps({k: v for k, v in state.items() if k != "places"}, ensure_ascii=False), flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
