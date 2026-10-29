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
OPENVERSE_API = "https://api.openverse.org/v1/images/"
OPENVERSE_REQUEST_BUDGET_PER_VENUE = 2
OPENVERSE_DEFAULT_RUN_REQUEST_BUDGET = 20
OPENVERSE_RESULTS_PER_QUERY = 20
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

def unsuitable_photo_subject(title, description):
    """Block obvious scans/drawings and no-longer-standing buildings from a
    visitor-photo shortlist. Other evidence stays HOLD for visual review.
    """
    corpus = " " + " ".join(words(title + " " + description)) + " "
    bad_phrases = (
        " engraving ", " etching ", " lithograph ", " drawing ", " sketch ",
        " gravure ", " gravering ", " woodcut ", " aquatint ", " plan view ",
        " postcard ", " carte postale ", " dessin ",
        " convent during demolition ", " demolition of the convent ",
        " former convent during demolition ", " historic map ",
    )
    return any(phrase in corpus for phrase in bad_phrases)

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
    variants = [name]
    short_name = re.sub(r"\s*\([^)]*\)", "", name).strip()
    if short_name != name and len(short_name) >= 8:
        variants.append(short_name)
    ids = []
    for variant in variants:
        results = client.request({
            "action": "wbsearchentities", "format": "json", "language": "en",
            "type": "item", "search": variant, "limit": 7,
        }, endpoint=WIKIDATA_API)
        ids.extend(row.get("id") for row in results.get("search", [])
                   if re.fullmatch(r"Q[1-9]\d*", str(row.get("id") or "")))
        if ids:  # Another search is worthwhile only if there was no exact hit.
            break
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
    if unsuitable_photo_subject(title, description):
        return None
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


def commons_subcategory_role(title):
    """Identify explicit thematic subfolders, never infer one from a QID."""
    terms=set(words(title))
    if terms & {"interior", "interiors", "interieur", "interieurs", "nave",
                "inside", "innenraum", "sanctuary", "choir", "nef"}:
        return "INTERIOR"
    if terms & {"altar", "altars", "autel", "autels", "relic", "relics",
                "reliquary", "reliquaries", "retable", "retables", "statue",
                "statues", "vitraux", "chapels", "altare", "paintings"}:
        return "SACRED_DETAIL"
    if terms & {"exterior", "exteriors", "facade", "facades", "outside",
                "towers", "exterieur", "exterieurs"}:
        return "EXTERIOR"
    return None

def relevant_commons_subcategories(client, category):
    """Get at most one exact-child subcategory per role; no recursive crawl."""
    data=client.request({
        "action":"query","format":"json","list":"categorymembers",
        "cmtitle":"Category:"+category,"cmtype":"subcat","cmlimit":50,
    })
    selected={}
    for entry in data.get("query",{}).get("categorymembers",[]):
        title=str(entry.get("title") or "")
        if not title.startswith("Category:"):
            continue
        role=commons_subcategory_role(title)
        if role and role not in selected:
            selected[role]=title[9:]
    return selected

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
            pages.extend((page, "WIKIDATA_P18", None) for page in
                         commons_pages(client, {"titles": "File:" + match["image"]}))
        except (urllib.error.URLError, ValueError, KeyError, TimeoutError):
            info["image_fetch_error"] = "COMMONS_P18_METADATA_UNAVAILABLE"
    if match.get("category"):
        category = str(match["category"])[:140]
        if not re.search(r"[\[\]{}|<>\n\r]", category):
            try:
                pages.extend((page, "WIKIDATA_COMMONS_CATEGORY", None) for page in
                             commons_pages(client, {
                    "generator": "categorymembers", "gcmtitle": "Category:" + category,
                    "gcmtype": "file", "gcmlimit": 40, "gcmnamespace": 6,
                }))
            except (urllib.error.URLError, ValueError, KeyError, TimeoutError):
                info["category_fetch_error"] = "COMMONS_CATEGORY_UNAVAILABLE"
    if match.get("category"):
        try:
            relevant = relevant_commons_subcategories(client, str(match["category"])[:140])
        except (urllib.error.URLError, ValueError, KeyError, TimeoutError):
            relevant = {}
            info["subcategory_fetch_error"] = "COMMONS_SUBCATEGORY_LIST_UNAVAILABLE"
        for role in ("INTERIOR","SACRED_DETAIL","EXTERIOR"):
            if role not in relevant:
                continue
            try:
                child = relevant[role]
                pages.extend((page,"WIKIDATA_COMMONS_SUBCATEGORY",role) for page in
                             commons_pages(client,{"generator":"categorymembers",
                                 "gcmtitle":"Category:"+child,"gcmtype":"file",
                                 "gcmlimit":30,"gcmnamespace":6}))
            except (urllib.error.URLError, ValueError, KeyError, TimeoutError):
                info.setdefault("subcategory_errors",[]).append(role)
    seen = set()
    for page, method, preferred_role in pages:
        title = page.get("title")
        key = (title, preferred_role or "UNCLASSIFIED")
        if not title or key in seen:
            continue
        seen.add(key)
        for kind in CATEGORIES:
            if preferred_role and kind!=preferred_role:
                continue
            c = candidate_from_page(page, venue, kind,
                                    discovery_method=method,
                                    entity_id=match["qid"])
            if not c:
                continue
            if preferred_role:
                c["category_evidence"]="STRUCTURED_SUBCATEGORY_ROLE_UNVERIFIED"
                c["commons_subcategory"]=relevant.get(preferred_role)
            elif kind == "EXTERIOR" and (
                classify_evidence("INTERIOR",str(title),c["description"])=="CATEGORY_TEXT_MATCH"
                or classify_evidence("SACRED_DETAIL",str(title),c["description"])=="CATEGORY_TEXT_MATCH"
            ):
                continue
            elif c["category_evidence"] == "CATEGORY_UNCONFIRMED" and kind != "EXTERIOR":
                continue
            out[kind].append(c)
    for kind, values in out.items():
        values.sort(key=lambda x: (
            x["category_evidence"] not in ("CATEGORY_TEXT_MATCH","STRUCTURED_SUBCATEGORY_ROLE_UNVERIFIED"),
            x["discovery_method"] != "WIKIDATA_P18",
            -x["discovery_score_only"], -(x["width"] * x["height"]), x["commons_title"]))
        out[kind] = values[:MAX_CANDIDATES_PER_CATEGORY]
    return info, out



def nearby_commons_discovery(client, venue):
    """Geotagged Commons file *camera* locations near a source pin.

    Geographic proximity is NOT proof of the photo's subject or exact Church.
    Only shortlist files whose captions share a distinctive church-name token;
    still require later independent visual/site/license verification.
    """
    out = {kind: [] for kind in CATEGORIES}
    loc = venue_coordinates(venue)
    if not loc:
        return out
    radius = min(WIKIDATA_DISTANCE_M.get(str(venue.get("precision")).lower(), 250), 300)
    pages = commons_pages(client, {
        "generator": "geosearch", "ggsprimary": "all",
        "ggsnamespace": 6, "ggscoord": f"{loc[0]}|{loc[1]}",
        "ggsradius": radius, "ggslimit": 35,
    })
    seen = set()
    for page in pages:
        title = page.get("title", "")
        if not title or title in seen:
            continue
        seen.add(title)
        for kind in CATEGORIES:
            item = candidate_from_page(page, venue, kind,
                                       discovery_method="COMMONS_GEOTAG_NEAR_PIN_UNVERIFIED")
            if not item or item["discovery_score_only"] < 0.55:
                continue
            if item["category_evidence"] == "CATEGORY_UNCONFIRMED" and kind != "EXTERIOR":
                continue
            item["geo_search_radius_m"] = radius
            item["geographic_disclaimer"] = "Camera coordinate near pin; subject not proven"
            out[kind].append(item)
    for kind in CATEGORIES:
        out[kind].sort(key=lambda x: (
            x["category_evidence"] != "CATEGORY_TEXT_MATCH",
            -x["discovery_score_only"], -(x["width"] * x["height"]), x["commons_title"]))
        out[kind] = out[kind][:MAX_CANDIDATES_PER_CATEGORY]
    return out

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


# Search query variants are derived only from the venue's existing source name.
# They are search hints; they never constitute alternate-site identities.
def search_name_variants(name):
    name = re.sub(r"\s+", " ", plain(name)).strip()
    variants = [name]
    unparenthesized = re.sub(r"\s*\([^)]*\)", "", name).strip()
    if unparenthesized != name and unparenthesized:
        variants.append(unparenthesized)
    # Orthographic variants, not translations of the dedication itself.
    forms = [
        (r"\bSt\.\s+", "Saint "), (r"\bSt\s+", "Saint "),
        (r"\bSte\.\s+", "Sainte "), (r"\bSte\s+", "Sainte "),
        (r"\bSaint\s+", "St "), (r"\bSainte\s+", "Ste "),
        (r"\bEglise\s+", "Église "), (r"\bÉglise\s+", "Eglise "),
        (r"\bSs\.\s+", "Saints "),
    ]
    for root in list(variants):
        for pattern, repl in forms:
            alt = re.sub(pattern, repl, root, count=1, flags=re.I)
            if alt != root:
                variants.append(alt)
    # As a last resort, remove the generic building prefix while retaining
    # at least two nontrivial title words. Never search for just "church".
    for root in list(variants[:2]):
        stripped = re.sub(
            r"^(?:church|chapel|église|eglise|kapelle|kirche|chiesa|"
            r"iglesia|igreja|kerk)\s+(?:(?:of|de|des|du|la|the|della)\s+)*",
            "", root, count=1, flags=re.I,
        ).strip()
        distinctive = [w for w in words(stripped) if w not in STOP and len(w)>2]
        if stripped != root and len(distinctive)>=2:
            variants.append(stripped)
    return list(dict.fromkeys(variants))[:5]

def openverse_license(item):
    """Openverse is only a discovery index; these rights remain unverified."""
    key = str(item.get("license") or "").lower()
    ver = str(item.get("license_version") or "").strip()
    if key in ("by", "by-sa") and ver in ("2.0", "3.0", "4.0"):
        canonical = "CC-" + key.upper() + "-" + ver
        suffix = "by-sa" if key == "by-sa" else "by"
        expected = "https://creativecommons.org/licenses/" + suffix + "/" + ver + "/"
    elif key == "cc0":
        canonical = "CC0"
        expected = "https://creativecommons.org/publicdomain/zero/1.0/"
    elif key == "pdm":
        canonical = "PUBLIC_DOMAIN"
        expected = "https://creativecommons.org/publicdomain/mark/1.0/"
    else:
        return None
    link = str(item.get("license_url") or "")
    if not link.startswith(expected):
        return None
    return canonical

def valid_external_url(value):
    parsed = urllib.parse.urlparse(str(value or ""))
    return parsed.scheme == "https" and bool(parsed.hostname) and not parsed.username and not parsed.password

def openverse_candidate(item, venue):
    if not isinstance(item, dict) or item.get("mature"):
        return None
    license_id = openverse_license(item)
    if not license_id:
        return None
    title = plain(item.get("title"))[:200]
    source_url = item.get("foreign_landing_url") or ""
    if not title or not valid_external_url(source_url):
        return None
    try:
        width, height = int(item.get("width")), int(item.get("height"))
    except (ValueError, TypeError):
        return None
    if min(width, height) < MIN_EDGE:
        return None
    category = str(item.get("category") or "").lower()
    if category and category not in ("photograph", "photography"):
        return None
    tags = " ".join(str(tag.get("name") or "")[:70] for tag in (item.get("tags") or [])[:8]
                    if isinstance(tag, dict))
    description = title + " " + tags
    if unsuitable_photo_subject(title, description):
        return None
    country = country_signal(venue["country"], title, description)
    if country == "FOREIGN_COUNTRY_MENTIONED":
        return None
    name = plain(venue["name"])
    # Name matching is discovery filtering, not proof the depicted subject is
    # this church. Country often goes unmentioned even when a source is correct.
    score = max((match_score(variant, venue.get("locality"), title, description)
                 for variant in search_name_variants(name)[:3]), default=0)
    if score < 0.60:
        return None
    media_id = str(item.get("id") or "")
    if not re.fullmatch(r"[0-9a-fA-F-]{36}", media_id):
        return None
    direct_image_url = str(item.get("url") or "")
    roles = [role for role in ("INTERIOR", "SACRED_DETAIL")
             if classify_evidence(role, title, description) == "CATEGORY_TEXT_MATCH"]
    role = roles[0] if roles else "EXTERIOR"
    return {
        "openverse_id": media_id,
        "source_url": source_url,
        "image_url_research_only": direct_image_url if valid_external_url(direct_image_url) else None,
        "title": title, "width": width, "height": height,
        "license": license_id, "license_url": str(item["license_url"]),
        "photographer": plain(item.get("creator"))[:250],
        "provider": str(item.get("provider") or "")[:70],
        "source": str(item.get("source") or "")[:70],
        "category_requested": role,
        "category_evidence": classify_evidence(role, title, description),
        "country_evidence": country,
        "discovery_score_only": score,
        "discovery_method": "OPENVERSE_API_SEARCH",
        "publication_state": "HOLD_IDENTITY_CATEGORY_AND_RIGHTS_REVIEW",
        "rights_note": "Openverse metadata is not independent proof of reuse rights; verify at original provider",
    }

def openverse_discovery(client, venue, max_queries=OPENVERSE_REQUEST_BUDGET_PER_VENUE):
    """At most two ordinary Openverse API searches, never website scraping.

    No pagination, image downloads or cross-query collection enumeration. Each
    candidate is subject to the same manual identity/subject/rights gates.
    """
    output = {kind: [] for kind in CATEGORIES}
    if max_queries <= 0:
        return output, 0
    variants = search_name_variants(venue["name"])
    country = COUNTRY_TERMS.get(str(venue["country"]).upper(), ("",))[0]
    # First query remains country-specific; the fallback drops the country
    # qualifier to improve recall, but retains the venue name and all holds.
    query_options = [" ".join(filter(None, (name, venue.get("locality", ""), country)))[:200]
                     for name in variants[:max_queries]]
    if len(query_options) < max_queries:
        query_options.append(" ".join(filter(None, (variants[0], venue.get("locality", ""))))[:200])
    searched = []
    for query in query_options[:max_queries]:
        if query in searched:
            continue
        searched.append(query)
        data = client.request({
            "q": query, "page": 1, "page_size": OPENVERSE_RESULTS_PER_QUERY,
            "category": "photograph",
            "license": "by,by-sa,cc0,pdm",
            "filter_dead": "true",
        }, endpoint=OPENVERSE_API)
        if not isinstance(data, dict):
            raise ValueError("Unexpected Openverse response")
        for item in data.get("results") or []:
            result = openverse_candidate(item, venue)
            if result:
                output[result["category_requested"]].append(result)
        if any(output.values()):
            break
    for kind in CATEGORIES:
        seen = set()
        ordered = sorted(output[kind], key=lambda c: (
            c["country_evidence"] != "TARGET_COUNTRY_MENTIONED",
            -c["discovery_score_only"], -c["width"]*c["height"],
            c["source_url"]))
        output[kind] = []
        for candidate in ordered:
            if candidate["source_url"] not in seen:
                output[kind].append(candidate)
                seen.add(candidate["source_url"])
            if len(output[kind]) >= MAX_CANDIDATES_PER_CATEGORY:
                break
    return output, len(searched)


def merge_photo_candidates(existing, additional):
    """Preserve higher-confidence prior sources, dedup by original landing URL,
    and never exceed the per-site-per-category research cap."""
    retained = []
    seen = set()
    for item in list(existing) + list(additional):
        key = str(item.get("source_url") or "").strip()
        if not key or key in seen:
            continue
        if len(retained) >= MAX_CANDIDATES_PER_CATEGORY:
            break
        retained.append(item)
        seen.add(key)
    return retained

class BoundedOpenverseClient:
    """Shared per-run quota. Counts attempted Openverse API calls, even on error."""
    def __init__(self, inner, budget):
        self.inner = inner
        self.remaining = max(0, int(budget))
        self.used = 0

    def request(self, params, endpoint=API):
        if endpoint == OPENVERSE_API:
            if self.remaining <= 0:
                raise ValueError("Openverse request budget exhausted")
            self.remaining -= 1
            self.used += 1
        return self.inner.request(params, endpoint=endpoint)

def run(source, output, offset, limit, client, *, indices=None, openverse_budget=OPENVERSE_DEFAULT_RUN_REQUEST_BUDGET,
        openverse_per_venue=OPENVERSE_REQUEST_BUDGET_PER_VENUE):
    rows = source_rows(source)
    selected_indices = list(indices) if indices is not None else list(range(offset, min(offset+limit, len(rows))))
    if not selected_indices or len(selected_indices) > MAX_BATCH or len(set(selected_indices)) != len(selected_indices):
        raise ValueError("Invalid/duplicate batch source indices")
    if any(i < 0 or i >= len(rows) for i in selected_indices):
        raise ValueError("Batch index out of frozen R49 range")
    subset = [rows[i] for i in selected_indices]
    bounded_openverse = BoundedOpenverseClient(client, openverse_budget)
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
        nearby = {kind: [] for kind in CATEGORIES}
        if not any(structured.values()):
            try:
                nearby = nearby_commons_discovery(client, venue)
            except (urllib.error.URLError, ValueError, KeyError, TimeoutError) as exc:
                row["errors"]["COMMONS_GEOSEARCH"] = type(exc).__name__ + ": " + str(exc)[:160]
        for kind in CATEGORIES:
            if structured[kind] or nearby[kind]:
                row["categories"][kind] = structured[kind] or nearby[kind]
                continue
            try:
                row["categories"][kind] = discover(client, venue, kind)
            except (urllib.error.URLError, ValueError, KeyError, TimeoutError) as exc:
                row["categories"][kind] = []
                row["errors"][kind] = type(exc).__name__ + ": " + str(exc)[:160]
        row["openverse_queries"] = 0
        row["openverse_budget_exhausted"] = bounded_openverse.remaining == 0
        try:
            before = bounded_openverse.used
            alternatives, query_count = openverse_discovery(
                bounded_openverse, venue, max_queries=min(
                    openverse_per_venue, bounded_openverse.remaining))
            row["openverse_queries"] = bounded_openverse.used-before
            for kind in CATEGORIES:
                row["categories"][kind] = merge_photo_candidates(
                    row["categories"][kind], alternatives[kind])
        except (urllib.error.URLError, urllib.error.HTTPError, ValueError, KeyError, TimeoutError) as exc:
            row["openverse_queries"] = bounded_openverse.used-before
            row["errors"]["OPENVERSE"] = type(exc).__name__ + ": " + str(exc)[:160]
        results.append(row)
        print("STAGED", venue["id"], {k: len(v) for k, v in row["categories"].items()}, flush=True)
    methods = {}
    categories = {kind: 0 for kind in CATEGORIES}
    unique_media_urls = set()
    for row in results:
        for kind in CATEGORIES:
            for photo in row["categories"][kind]:
                method = photo["discovery_method"]
                methods[method] = methods.get(method, 0) + 1
                categories[kind] += 1
                unique_media_urls.add(photo["source_url"])
    metrics = {
        "candidates_by_source": dict(sorted(methods.items())),
        "candidates_by_category": categories,
        "unique_source_urls": len(unique_media_urls),
        "venues_with_any_candidate": sum(any(row["categories"].values()) for row in results),
        "venues_with_geo_name_wikidata_match": sum(
            row.get("wikidata_identity_research", {}).get("state") ==
            "GEO_AND_NAME_CORROBORATED_RESEARCH_ONLY" for row in results),
        "venues_with_openverse_error": sum("OPENVERSE" in row["errors"] for row in results),
        "openverse_api_queries": bounded_openverse.used,
        "openverse_request_budget": openverse_budget,
        "venues_skipped_due_to_openverse_budget": sum(row["openverse_budget_exhausted"] for row in results),
        "approved_images": 0,
        "published_images": 0,
    }
    payload = {
        "schema": "AO_DIRECTORY_OPEN_PHOTO_CANDIDATES_V1",
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "source_schema": "AO_PRELIMINARY_TLM_MAP_R49",
        "offset": offset, "processed": len(results),
        "selected_source_indices": selected_indices,
        "source_countries_in_sample": sorted({row["country"] for row in results}),
        "licensing_policy": "Metadata screening only; no copyright or identity publication decision",
        "publication": "RESEARCH_ONLY_NEVER_APP_VISIBLE",
        "image_downloads": 0, "publications": 0,
        "openverse_api_queries": metrics["openverse_api_queries"],
        "pilot_metrics": metrics,
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
    ap.add_argument("--indices", type=str, default=None,
                    help="Comma-separated frozen R49 indices for representative sampling")
    ap.add_argument("--openverse-budget", type=int, default=OPENVERSE_DEFAULT_RUN_REQUEST_BUDGET,
                    help="Maximum total Openverse requests in this run (default 20, max 40)")
    ap.add_argument("--openverse-per-venue", type=int, default=OPENVERSE_REQUEST_BUDGET_PER_VENUE,
                    help="Queries per venue (0..2); set 1 for representative samples")
    args = ap.parse_args()
    if not 0 <= args.openverse_per_venue <= OPENVERSE_REQUEST_BUDGET_PER_VENUE:
        ap.error("Openverse per-venue requests must be 0..2")
    if not 0 <= args.openverse_budget <= 40:
        ap.error("Openverse quota must be 0..40 requests per batch")
    if not 0 <= args.offset < 1879 or not 1 <= args.limit <= MAX_BATCH or args.offset+args.limit > 1879:
        ap.error("Offset 0..1878 and limit 1..500 required")
    try:
        indices = [int(x.strip()) for x in args.indices.split(",")] if args.indices else None
    except ValueError:
        ap.error("indices must be comma-separated integers")
    result = run(args.source, args.output, args.offset, args.limit, WikimediaClient(args.delay),
                 indices=indices, openverse_budget=args.openverse_budget,
                 openverse_per_venue=args.openverse_per_venue)
    print("RESEARCH ONLY", result["processed"], "venues; 3 categories; zero images published", flush=True)
    print("CANDIDATE METRICS", json.dumps(result["pilot_metrics"], sort_keys=True), flush=True)

if __name__ == "__main__":
    main()
