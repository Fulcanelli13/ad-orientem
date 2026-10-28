#!/usr/bin/env python3
"""Free, read-only Wikimedia Commons discovery for Ad Orientem church photos.

Scans one set of already-known Directory identities for exterior, interior and
sacred-detail candidates in the SAME pass. Downloads metadata only. NEVER
writes to approved-place-media / approved-place-gallery, never promotes an
image or infers that a Commons file depicts the target church.

Usage:
 python3 tools/directory/discover-open-place-media.py --offset 0 --limit 200 --output /tmp/photos-0000.json
Use --source to select another manifest with the same frozen R49 columns.
"""
from __future__ import annotations

import argparse
import datetime as dt
import html
import json
import re
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
R49 = ROOT / "data/directory/preliminary-map-r49.v1.json"
API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "AdOrientem-SacredMediaResearch/0.1 (https://github.com/Fulcanelli13/ad-orientem; Commons metadata only)"
CATEGORIES = {
    "EXTERIOR": "church exterior",
    "INTERIOR": "church interior nave",
    "SACRED_DETAIL": "church high altar reliquary",
}
MIN_EDGE = 640
MAX_CANDIDATES_PER_CATEGORY = 4
MAX_API_RESULTS = 12
MAX_BATCH = 500
ACCEPTED = {
    "CC BY 4.0": "CC-BY-4.0",
    "CC BY SA 4.0": "CC-BY-SA-4.0",
    "CC BY SA 3.0": "CC-BY-SA-3.0",
    "CC BY SA 2.0": "CC-BY-SA-2.0",
    "CC0": "CC0",
    "PUBLIC DOMAIN": "PUBLIC_DOMAIN",
}

def words(value: str) -> list[str]:
    value = unicodedata.normalize("NFKD", str(value or ""))
    value = "".join(c for c in value if not unicodedata.combining(c))
    return re.findall(r"[a-z0-9]+", value.lower())

def plain(value) -> str:
    return re.sub(r"<[^>]*>", " ", html.unescape(str(value or ""))).strip()

def metadata(info, key: str) -> str:
    return plain((info.get("extmetadata") or {}).get(key, {}).get("value"))

def license_name(info):
    label = " ".join(words(metadata(info, "LicenseShortName"))).upper()
    label = label.replace("CC BY SA", "CC BY SA").strip()
    license_url = metadata(info, "LicenseUrl")
    if label not in ACCEPTED:
        return None
    name = ACCEPTED[label]
    if name.startswith("CC-BY"):
        suffix = "/licenses/" + ("by-sa" if "BY-SA" in name else "by") + "/" + name.rsplit("-", 1)[-1]
        if not license_url.startswith("https://creativecommons.org" + suffix + "/"):
            return None
    elif name == "CC0":
        if not license_url.startswith("https://creativecommons.org/publicdomain/zero/"):
            return None
    elif name == "PUBLIC_DOMAIN":
        # Public-domain claims vary by country, law and source: preserve as
        # candidates only, requiring later rights qualification.
        pass
    return name

STOP = {"the", "of", "st", "saint", "saints", "church", "chapel", "our",
        "lady", "notre", "dame", "de", "la", "le", "du", "des", "holy",
        "roman", "catholic", "parish", "sainte", "san", "santa", "and", "et"}

def match_score(name, locality, title, description) -> float:
    target = {s for s in words(name) if len(s) >= 4 and s not in STOP}
    observed = set(words(title + " " + description))
    if not target:
        return 0.0
    hit = len(target & observed) / len(target)
    places = {s for s in words(locality) if len(s) >= 4 and s not in STOP}
    local_match = bool(places & observed)
    # This is discovery ordering, NOT an identity certification.
    return round(min(1.0, hit * 0.78 + (0.22 if local_match else 0.0)), 3)

def classify_evidence(kind, title, description):
    tokens = set(words(title + " " + description))
    signal = {
        "EXTERIOR": {"exterior", "facade", "front", "outside", "aerial", "facade"},
        "INTERIOR": {"interior", "inside", "nave", "sanctuary", "choir"},
        "SACRED_DETAIL": {"altar", "altarpiece", "reliquary", "relic", "statue", "retable"},
    }
    return "CATEGORY_TEXT_MATCH" if signal[kind] & tokens else "CATEGORY_UNCONFIRMED"

def source_rows(source: Path):
    payload = json.loads(source.read_text(encoding="utf-8"))
    if payload.get("schema") != "AO_PRELIMINARY_TLM_MAP_R49":
        raise ValueError("Expected frozen R49 physical venue snapshot, not arbitrary leads")
    names = payload.get("columns") or []
    required = {"id", "name", "country", "locality", "url"}
    if not required.issubset(names):
        raise ValueError("Missing R49 identity/source columns")
    if len(payload.get("records") or []) != 1879:
        raise ValueError("Frozen R49 count changed; fail closed")
    idx = {key: names.index(key) for key in required}
    rows = []
    for raw in payload["records"]:
        if len(raw) != len(names):
            raise ValueError("Malformed R49 venue row")
        item = {key: raw[position] for key, position in idx.items()}
        if not item["id"] or not item["name"] or not item["country"] or not str(item["url"]).startswith("http"):
            raise ValueError("Invalid research identity / source")
        rows.append(item)
    if len({r["id"] for r in rows}) != len(rows):
        raise ValueError("Repeated venue IDs")
    return rows

class WikimediaClient:
    def __init__(self, delay=1.2):
        self.delay = max(1.0, float(delay))
        self.next_time = 0.0

    def request(self, params):
        wait = self.next_time - time.monotonic()
        if wait > 0:
            time.sleep(wait)
        self.next_time = time.monotonic() + self.delay
        url = API + "?" + urllib.parse.urlencode(params)
        request = urllib.request.Request(url, headers={
            "User-Agent": USER_AGENT, "Accept": "application/json",
        })
        for attempt in range(3):
            try:
                with urllib.request.urlopen(request, timeout=35) as response:
                    if response.headers.get("Content-Type", "").split(";")[0] != "application/json":
                        raise ValueError("Unexpected Commons response")
                    data = response.read(2_500_001)
                    if len(data) > 2_500_000:
                        raise ValueError("Oversized Commons response")
                    return json.loads(data)
            except urllib.error.HTTPError as error:
                if error.code not in (429, 502, 503, 504) or attempt == 2:
                    raise
                try:
                    delay = min(90, max(2, int(error.headers.get("Retry-After", "4"))))
                except ValueError:
                    delay = 4
                time.sleep(delay)
        raise RuntimeError("Commons API request not completed")

def discover(client, venue, kind):
    name = plain(venue["name"])[:120]
    locality = plain(venue["locality"])[:80]
    query = " ".join(filter(None, [name, locality, CATEGORIES[kind]]))
    data = client.request({
        "action": "query", "format": "json", "formatversion": 2,
        "generator": "search", "gsrsearch": query, "gsrnamespace": 6,
        "gsrlimit": MAX_API_RESULTS, "prop": "imageinfo",
        "iiprop": "url|size|mime|sha1|extmetadata", "iiurlwidth": 480,
    })
    found = []
    for page in (data.get("query", {}).get("pages") or []):
        info = (page.get("imageinfo") or [None])[0]
        if not info or info.get("mime") not in ("image/jpeg", "image/png", "image/webp"):
            continue
        if min(int(info.get("width", 0)), int(info.get("height", 0))) < MIN_EDGE:
            continue
        license_id = license_name(info)
        if not license_id:
            continue
        title = str(page.get("title") or "")
        description = metadata(info, "ImageDescription")[:1800]
        score = match_score(name, locality, title, description)
        url = "https://commons.wikimedia.org/wiki/" + urllib.parse.quote(title.replace(" ", "_"), safe=":/_()-")
        found.append({
            "commons_title": title, "source_url": url,
            "source_sha1": info.get("sha1"), "width": info.get("width"),
            "height": info.get("height"), "mime": info.get("mime"),
            "photographer": metadata(info, "Artist")[:400],
            "license": license_id, "license_url": metadata(info, "LicenseUrl"),
            "description": description[:500],
            "category_requested": kind,
            "category_evidence": classify_evidence(kind, title, description),
            "discovery_score_only": score,
            "publication_state": "HOLD_IDENTITY_CATEGORY_AND_RIGHTS_REVIEW",
        })
    found.sort(key=lambda r: (-r["discovery_score_only"], -r["width"] * r["height"], r["commons_title"]))
    return found[:MAX_CANDIDATES_PER_CATEGORY]

def run(source, output, offset, limit, client):
    rows = source_rows(source)
    subset = rows[offset:offset + limit]
    if not subset:
        raise ValueError("No source records in requested window")
    results = []
    for venue in subset:
        row = {
            "source_id": venue["id"], "name": venue["name"],
            "country": venue["country"], "locality": venue["locality"],
            "venue_source_url": venue["url"], "categories": {}, "errors": {},
        }
        for kind in CATEGORIES:
            try:
                row["categories"][kind] = discover(client, venue, kind)
            except (urllib.error.URLError, ValueError, KeyError, TimeoutError) as exc:
                row["categories"][kind] = []
                row["errors"][kind] = type(exc).__name__ + ": " + str(exc)[:160]
        results.append(row)
        print("STAGED", venue["id"], {k: len(v) for k, v in row["categories"].items()}, flush=True)
    payload = {
        "schema": "AO_DIRECTORY_OPEN_PHOTO_CANDIDATES_V1",
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "source_schema": "AO_PRELIMINARY_TLM_MAP_R49",
        "offset": offset, "processed": len(results),
        "licensing_policy": "Metadata screening only; no copyright or identity publication decision",
        "publication": "RESEARCH_ONLY_NEVER_APP_VISIBLE",
        "image_downloads": 0, "publications": 0,
        "categories": list(CATEGORIES), "venues": results,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    temp = output.with_suffix(output.suffix + ".tmp")
    temp.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    temp.replace(output)
    return payload

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--source", type=Path, default=R49)
    ap.add_argument("--output", type=Path, required=True)
    ap.add_argument("--offset", type=int, default=0)
    ap.add_argument("--limit", type=int, default=200)
    ap.add_argument("--delay", type=float, default=1.2)
    args = ap.parse_args()
    if not 0 <= args.offset < 1879 or not 1 <= args.limit <= MAX_BATCH:
        ap.error("Offset 0..1878 and limit 1..500 required")
    result = run(args.source, args.output, args.offset, args.limit, WikimediaClient(args.delay))
    print("RESEARCH ONLY", result["processed"], "venues; 3 categories; zero images published", flush=True)

if __name__ == "__main__":
    main()
