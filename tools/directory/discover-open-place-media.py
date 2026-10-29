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
import math
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
WIKIDATA_API = "https://www.wikidata.org/w/api.php"
WIKIDATA_DISTANCE_M = {"building": 250, "address": 350, "street": 500}
USER_AGENT = "AdOrientem-SacredMediaResearch/0.1 (https://github.com/Fulcanelli13/ad-orientem; Commons metadata only)"
CATEGORIES = {
    "EXTERIOR": "church exterior",
    "INTERIOR": "church interior nave",
    "SACRED_DETAIL": "church high altar reliquary",
}

# Search context, never automatic proof of church identity. Prefer spelling
# variants across source languages. Unknown codes simply leave this hint empty.
COUNTRY_TERMS = {
    "AU": ("Australia", "australia", "australie"),
    "BE": ("Belgium", "belgium", "belgique", "belgie"),
    "BR": ("Brazil", "brazil", "brasil", "bresil"),
    "CA": ("Canada", "canada"),
    "CH": ("Switzerland", "switzerland", "suisse", "schweiz", "svizzera"),
    "CZ": ("Czechia", "czechia", "czech republic", "cesko"),
    "DE": ("Germany", "germany", "deutschland", "allemagne"),
    "ES": ("Spain", "spain", "espana", "espagne"),
    "FR": ("France", "france"),
    "GB": ("United Kingdom", "united kingdom", "great britain", "england", "scotland", "wales"),
    "IE": ("Ireland", "ireland", "irlande", "eire"),
    "IT": ("Italy", "italy", "italia", "italie"),
    "MX": ("Mexico", "mexico", "mexique"),
    "NG": ("Nigeria", "nigeria"),
    "NZ": ("New Zealand", "new zealand"),
    "PH": ("Philippines", "philippines"),
    "PL": ("Poland", "poland", "polska", "pologne"),
    "PT": ("Portugal", "portugal"),
    "US": ("United States", "united states", "united states of america", "usa"),
    "ZA": ("South Africa", "south africa"),
}

def country_signal(country, title, description):
    """Reject explicitly foreign-location captions; missing location stays held."""
    corpus = " " + " ".join(words(title + " " + description)) + " "
    termsets = COUNTRY_TERMS.get(str(country).upper(), ())
    if not termsets:
        return "COUNTRY_NOT_EVALUATED"
    target = any(" " + " ".join(words(term)) + " " in corpus for term in termsets)
    foreign = any(
        " " + " ".join(words(term)) + " " in corpus
        for code, terms in COUNTRY_TERMS.items() if code != str(country).upper()
        for term in terms
    )
    if target:
        return "TARGET_COUNTRY_MENTIONED"
    return "FOREIGN_COUNTRY_MENTIONED" if foreign else "COUNTRY_NOT_ESTABLISHED"

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
    label = re.sub(r"[^A-Z0-9]", "", metadata(info, "LicenseShortName").upper())
    label = {"CCBY40":"CC BY 4.0","CCBYSA40":"CC BY SA 4.0",
             "CCBYSA30":"CC BY SA 3.0","CCBYSA20":"CC BY SA 2.0",
             "CC0":"CC0","PUBLICDOMAIN":"PUBLIC DOMAIN"}.get(label)
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
    required = {"id", "name", "country", "locality", "url", "lat", "lng", "precision"}
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

    def request(self, params, endpoint=API):
        wait = self.next_time - time.monotonic()
        if wait > 0:
            time.sleep(wait)
        self.next_time = time.monotonic() + self.delay
        url = endpoint + "?" + urllib.parse.urlencode(params)
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


def venue_coordinates(venue):
    try:
        lat, lng = float(venue["lat"]), float(venue["lng"])
        if math.isfinite(lat) and math.isfinite(lng) and -90 <= lat <= 90 and -180 <= lng <= 180:
            return lat, lng
    except (TypeError, ValueError, KeyError):
        pass
    return None

def geo_distance_m(a, b):
    """Haversine distance. Values must be (latitude, longitude) in degrees."""
    a_lat, a_lon = map(math.radians, a)
    b_lat, b_lon = map(math.radians, b)
    t = math.sin((b_lat-a_lat)/2)**2 + math.cos(a_lat)*math.cos(b_lat)*math.sin((b_lon-a_lon)/2)**2
    return round(12742000 * math.asin(min(1, math.sqrt(t))), 1)

def claim_values(entity, property_id):
    for claim in entity.get("claims", {}).get(property_id, []):
        if claim.get("rank") == "deprecated":
            continue
        snak = claim.get("mainsnak", {})
        if snak.get("snaktype") != "value":
            continue
        datum = snak.get("datavalue", {})
        if datum.get("type") in ("string", "globecoordinate"):
            yield datum.get("value")

def wikidata_photo_identity(client, venue):
    """Find ONE nearby Wikidata church-like item with a substantial name match.

    A geographic entity match is only a research lead, NEVER a published
    Church->Wikidata identity assertion. R49 coordinates can be street-level.
    """
    latlng = venue_coordinates(venue)
    if latlng is None:
        return {"state": "NO_SOURCE_COORDINATES"}, None
    name = plain(venue["name"])[:120]
    results = client.request({
        "action": "wbsearchentities", "format": "json", "language": "en",
        "type": "item", "search": name, "limit": 7,
    }, endpoint=WIKIDATA_API)
    ids = [row.get("id") for row in results.get("search", [])
           if re.fullmatch(r"Q[1-9]\d*", str(row.get("id") or ""))]
    ids = list(dict.fromkeys(ids))
    if not ids:
        return {"state": "NO_WIKIDATA_SEARCH_HITS", "search_term": name}, None
    entities = client.request({
        "action": "wbgetentities", "format": "json", "ids": "|".join(ids),
        "props": "claims|labels|aliases|sitelinks", "languages": "en|fr|de|it",
    }, endpoint=WIKIDATA_API).get("entities", {})
    matched = []
    for qid in ids:
        entity = entities.get(qid, {})
        if entity.get("missing") is not None:
            continue
        coordinates = [x for x in claim_values(entity, "P625") if isinstance(x, dict)
                       and isinstance(x.get("latitude"), (int, float))
                       and isinstance(x.get("longitude"), (int, float))
                       and x.get("globe", "http://www.wikidata.org/entity/Q2").endswith("/Q2")]
        if not coordinates:
            continue
        distance = min(geo_distance_m(latlng, (x["latitude"], x["longitude"])) for x in coordinates)
        tolerance = WIKIDATA_DISTANCE_M.get(str(venue.get("precision")).lower(), 250)
        if distance > tolerance:
            continue
        labels = [v.get("value", "") for v in entity.get("labels", {}).values()]
        labels.extend(str(alias.get("value") or "") for values in entity.get("aliases", {}).values()
                      for alias in values[:5])
        score = max((match_score(name, "", label, "") for label in labels), default=0)
        if score < 0.50:
            continue
        matched.append((distance, -score, qid, entity))
    if len(matched) != 1:
        return {
            "state": "AMBIGUOUS_WIKIDATA_IDENTITY" if matched else "NO_GEO_NAME_CORROBORATED_IDENTITY",
            "nearby_matching_ids": [match[2] for match in matched[:7]],
        }, None
    distance, minus_score, qid, entity = matched[0]
    category = next((v for v in claim_values(entity, "P373") if isinstance(v, str)), None)
    if not category:
        commons = entity.get("sitelinks", {}).get("commonswiki", {}).get("title", "")
        if commons.startswith("Category:"):
            category = commons.removeprefix("Category:")
    image = next((v for v in claim_values(entity, "P18") if isinstance(v, str)), None)
    return {
        "state": "GEO_AND_NAME_CORROBORATED_RESEARCH_ONLY", "wikidata_id": qid,
        "wikidata_url": "https://www.wikidata.org/wiki/" + qid,
        "distance_m": distance, "name_score": round(-minus_score, 3),
        "image_property": image, "commons_category": category,
        "publication": "HOLD_UNTIL_INDEPENDENT_PLACE_IDENTITY_VERIFICATION",
    }, {"qid": qid, "category": category, "image": image}

def candidate_from_page(page, venue, kind, *, discovery_method, entity_id=None):
    info = (page.get("imageinfo") or [None])[0]
    if not info or info.get("mime") not in ("image/jpeg", "image/png", "image/webp"):
        return None
    if min(int(info.get("width", 0)), int(info.get("height", 0))) < MIN_EDGE:
        return None
    licence = license_name(info)
    if not licence:
        return None
    title = str(page.get("title") or "")
    description = metadata(info, "ImageDescription")[:1800]
    location_signal = country_signal(venue["country"], title, description)
    if location_signal == "FOREIGN_COUNTRY_MENTIONED":
        return None
    score = match_score(plain(venue["name"]), plain(venue["locality"]), title, description)
    return {
        "commons_title": title,
        "source_url": "https://commons.wikimedia.org/wiki/" + urllib.parse.quote(
            title.replace(" ", "_"), safe=":/_()-"),
        "source_sha1": info.get("sha1"), "width": info.get("width"),
        "height": info.get("height"), "mime": info.get("mime"),
        "photographer": metadata(info, "Artist")[:400],
        "license": licence, "license_url": metadata(info, "LicenseUrl"),
        "description": description[:500], "category_requested": kind,
        "category_evidence": classify_evidence(kind, title, description),
        "country_evidence": location_signal, "discovery_score_only": score,
        "discovery_method": discovery_method,
        "candidate_wikidata_entity": entity_id,
        "publication_state": "HOLD_IDENTITY_CATEGORY_AND_RIGHTS_REVIEW",
    }

def commons_pages(client, params):
    data = client.request({
        **params, "action": "query", "format": "json",
        "formatversion": 2, "prop": "imageinfo",
        "iiprop": "url|size|mime|sha1|extmetadata",
    })
    return data.get("query", {}).get("pages") or []

def structured_discovery(client, venue):
    """One Wikidata identity search, then P18 and Commons category, as available.

    One item is provisionally matched to an R49 pin by name AND coordinates.
    Even then, no user-visible photo may be published on this evidence alone.
    """
    info, match = wikidata_photo_identity(client, venue)
    out = {kind: [] for kind in CATEGORIES}
    if match is None:
        return info, out
    pages = []
    if match.get("image"):
        try:
            pages.extend(commons_pages(client, {"titles": "File:" + match["image"]}))
        except (urllib.error.URLError, ValueError, KeyError, TimeoutError):
            info["image_fetch_error"] = "COMMONS_P18_METADATA_UNAVAILABLE"
    if match.get("category"):
        category = str(match["category"])[:140]
        if not re.search(r"[\[\]{}|<>\n\r]", category):
            try:
                pages.extend(commons_pages(client, {
                    "generator": "categorymembers", "gcmtitle": "Category:" + category,
                    "gcmtype": "file", "gcmlimit": 40, "gcmnamespace": 6,
                }))
            except (urllib.error.URLError, ValueError, KeyError, TimeoutError):
                info["category_fetch_error"] = "COMMONS_CATEGORY_UNAVAILABLE"
    seen = set()
    for page in pages:
        title = page.get("title")
        if not title or title in seen:
            continue
        seen.add(title)
        for kind in CATEGORIES:
            c = candidate_from_page(page, venue, kind,
                                    discovery_method="WIKIDATA_P18_OR_EXACT_COMMONS_CATEGORY",
                                    entity_id=match["qid"])
            if not c:
                continue
            if c["category_evidence"] == "CATEGORY_UNCONFIRMED" and kind != "EXTERIOR":
                continue
            out[kind].append(c)
    for kind, values in out.items():
        values.sort(key=lambda x: (
            x["category_evidence"] != "CATEGORY_TEXT_MATCH",
            -x["discovery_score_only"], -(x["width"] * x["height"]), x["commons_title"]))
        out[kind] = values[:MAX_CANDIDATES_PER_CATEGORY]
    return info, out


def discover(client, venue, kind):
    name = plain(venue["name"])[:120]
    locality = plain(venue["locality"])[:80]
    country_hint = COUNTRY_TERMS.get(str(venue["country"]).upper(), ("",))[0]
    query = " ".join(filter(None, [name, locality, country_hint, CATEGORIES[kind]]))
    data = client.request({
        "action": "query", "format": "json", "formatversion": 2,
        "generator": "search", "gsrsearch": query, "gsrnamespace": 6,
        "gsrlimit": MAX_API_RESULTS, "prop": "imageinfo",
        "iiprop": "url|size|mime|sha1|extmetadata", "iiurlwidth": 480,
    })
    found = []
    for page in (data.get("query", {}).get("pages") or []):
        candidate = candidate_from_page(page, venue, kind, discovery_method="COUNTRY_CONSTRAINED_TEXT")
        if candidate:
            found.append(candidate)
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
        try:
            identity, structured = structured_discovery(client, venue)
            row["wikidata_identity_research"] = identity
        except (urllib.error.URLError, ValueError, KeyError, TimeoutError) as exc:
            structured = {kind: [] for kind in CATEGORIES}
            row["wikidata_identity_research"] = {"state": "WIKIDATA_API_UNAVAILABLE"}
            row["errors"]["WIKIDATA"] = type(exc).__name__ + ": " + str(exc)[:160]
        for kind in CATEGORIES:
            if structured[kind]:
                row["categories"][kind] = structured[kind]
                continue
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
    if not 0 <= args.offset < 1879 or not 1 <= args.limit <= MAX_BATCH or args.offset+args.limit > 1879:
        ap.error("Offset 0..1878 and limit 1..500 required")
    result = run(args.source, args.output, args.offset, args.limit, WikimediaClient(args.delay))
    print("RESEARCH ONLY", result["processed"], "venues; 3 categories; zero images published", flush=True)

if __name__ == "__main__":
    main()
