#!/usr/bin/env python3
"""Research-only batch acquisition of OPEN-LICENSED Flemish IIIF museum photographs.

No changes to canonical artwork approvals or app assets. Fail closed on unknown
rights. Designed for GitHub Actions in a public repository; no credentials,
institution contact, paid endpoints or dependency on Commons.
"""
import argparse
import concurrent.futures
import hashlib
import io
import json
import re
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter
from pathlib import Path

from PIL import Image, ImageDraw

COLLECTION = "https://imagehub.vlaamsekunstcollectie.be/iiif/3/collection/top"
USER_AGENT = "AdOrientemSacredArtResearch/1.0 (read-only IIIF metadata and public-domain image inspection)"
RELIGIOUS = re.compile(
    r"\b(christ|christus|jesus|j[eé]sus|mary|maria|marie|virgin|vierge|"
    r"madonna|saint|saints|sainte|sint|sint[e]?|sankt|sanct|santa|"
    r"apostle|apostel|apost[oó]l|annunciation|verkondiging|"
    r"crucifix|kruisig|martyr|martelaar|nativity|geboorte|"
    r"resurrection|verrijzen|adoration|aanbidding|ascension|assumpt|"
    r"heilige|heiliger|holy|apostle|baptism|doop|trinity|trinit)\b", re.I)
PAINTING = re.compile(r"\b(painting|oil|canvas|painted|panel|schilderij|olieverf|doek|"
                      r"paneel|peinture|tableau|huile|toile|tavola|dipinto|altarpiece)\b", re.I)
NOT_PAINTING = re.compile(r"\b(sculpture|bronze|marble|photograph|etching|engraving|"
                          r"print|lithograph|statue|beeldhouwwerk|sculptuur|"
                          r"tekening|drawing|aquarel|watercolor|ceramic)\b", re.I)
GOOD_RIGHTS = (
    "/publicdomain/zero/1.0", "/publicdomain/mark/1.0",
    "/licenses/by/4.0", "/licenses/by-sa/4.0", "/licenses/by/3.0",
)
MAX_BYTES = 20 * 1024 * 1024


def text(value):
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        return " ".join(text(v) for v in value)
    if isinstance(value, dict):
        if "value" in value:
            return text(value["value"])
        return " ".join(text(v) for v in value.values())
    return "" if value is None else str(value)


def norm(value):
    value = unicodedata.normalize("NFKD", str(value or "")).casefold()
    return re.sub(r"[^a-z0-9]+", " ", "".join(x for x in value if not unicodedata.combining(x))).strip()


def allowed(rights):
    rights = str(rights or "").lower().strip().replace("https://", "http://")
    if not rights.startswith("http://creativecommons.org/"):
        return False
    return any(x in rights for x in GOOD_RIGHTS) and not any(
        x in rights for x in ("/by-nc", "/by-nd", "/by-sa-nc")
    )


def get_bytes(url, limit=MAX_BYTES):
    parsed = urllib.parse.urlsplit(url)
    if parsed.scheme != "https" or not parsed.hostname or parsed.port not in (None, 443):
        raise ValueError("Unsafe or non-HTTPS URL")
    host = parsed.hostname.lower()
    if not (host.endswith(".vlaamsekunstcollectie.be")
            or host == "imagehub.vlaamsekunstcollectie.be"
            or host.endswith(".museabrugge.be")):
        raise ValueError("Unapproved image-source hostname: " + host)
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={
                "User-Agent": USER_AGENT, "Accept": "application/json, image/jpeg, */*"
            })
            with urllib.request.urlopen(req, timeout=35) as response:
                data = response.read(limit + 1)
            if len(data) > limit:
                raise ValueError("Response exceeds size limit")
            return data
        except (urllib.error.URLError, TimeoutError) as exc:
            if attempt == 2:
                raise
            time.sleep(2 ** attempt * 2)
    raise RuntimeError("No response")


def fetch_json(url):
    return json.loads(get_bytes(url, 12 * 1024 * 1024).decode("utf-8"))


def harvest_ids(max_manifests):
    queue = [COLLECTION]
    seen, manifests, problems = set(), [], []
    while queue and len(manifests) < max_manifests:
        url = queue.pop(0)
        if url in seen:
            continue
        seen.add(url)
        try:
            obj = fetch_json(url)
        except Exception as exc:
            problems.append({"url": url, "error": str(exc)[:180]})
            continue
        if str(obj.get("type", "")).lower() == "manifest":
            manifests.append(url)
            continue
        for item in obj.get("items", []):
            item_id = item.get("id", "")
            item_type = item.get("type", "").lower()
            if item_id.startswith("https://") and item_type in ("manifest", "collection"):
                queue.append(item_id)
        next_url = obj.get("next")
        if isinstance(next_url, dict):
            next_url = next_url.get("id")
        if isinstance(next_url, str) and next_url.startswith("https://"):
            queue.append(next_url)
    return manifests[:max_manifests], problems


def find_picture(manifest):
    for canvas in manifest.get("items", []):
        for page in canvas.get("items", []):
            for ann in page.get("items", []):
                body = ann.get("body") or {}
                if isinstance(body, list):
                    body = body[0] if body else {}
                if not isinstance(body, dict) or body.get("type") not in ("Image", None):
                    continue
                services = body.get("service") or []
                if isinstance(services, dict):
                    services = [services]
                service = next((x.get("id") or x.get("@id")
                                for x in services if isinstance(x, dict)), None)
                return {
                    "service": service, "direct": body.get("id") or body.get("@id"),
                    "width": body.get("width") or canvas.get("width"),
                    "height": body.get("height") or canvas.get("height"),
                    "canvasRights": canvas.get("rights") or body.get("rights"),
                }
    return {}


def museum_item(url):
    obj = fetch_json(url)
    metadata = obj.get("metadata") or []
    fields = {norm(text(x.get("label"))): text(x.get("value"))
              for x in metadata if isinstance(x, dict)}
    title = text(obj.get("label"))
    artist = next((value for key, value in fields.items()
                   if any(word in key for word in ("maker", "creator", "artist", "kunstena", "auteur"))), "")
    medium = " ".join(v for k, v in fields.items()
                      if any(word in k for word in ("medium", "materiaal", "objecttype", "object type", "technique", "type")))
    rights = obj.get("rights") or ""
    image = find_picture(obj)
    rights = rights or image.get("canvasRights") or ""
    description = text(obj.get("summary")) + " " + text(obj.get("description"))
    subject = (title + " " + description + " " + " ".join(fields.values()))[:4000]
    is_religious = bool(RELIGIOUS.search(subject))
    painting = bool(PAINTING.search(medium)) and not bool(NOT_PAINTING.search(medium))
    if not medium:
        painting_state = "UNKNOWN_MEDIUM"
    else:
        painting_state = "PAINTING" if painting else "OTHER_OR_UNCERTAIN"
    return {
        "provider": "Vlaamse Kunstcollectie IIIF", "manifest": url,
        "title": title, "artist": artist, "medium": medium,
        "rights": rights, "rightsEligible": allowed(rights),
        "religiousSubject": is_religious, "paintingState": painting_state,
        "objectId": obj.get("id"), "sourceUrl": text(obj.get("homepage")),
        "image": image, "metadata": fields, "requiredStatement": text(obj.get("requiredStatement")),
    }


def signatures(obj, out):
    if isinstance(obj, dict):
        artist, title = obj.get("artist"), obj.get("title")
        if isinstance(artist, str) and isinstance(title, str) and artist and title:
            out.add(norm(artist) + "|" + norm(title))
        for val in obj.values():
            signatures(val, out)
    elif isinstance(obj, list):
        for x in obj:
            signatures(x, out)


def read_existing(paths):
    known = set()
    for path in paths:
        with open(path, encoding="utf-8") as file:
            signatures(json.load(file), known)
    return known


def image_url(item):
    source = item["image"]
    service = source.get("service")
    if isinstance(service, str) and service.startswith("https://"):
        return service.rstrip("/") + "/full/!2400,2400/0/default.jpg"
    direct = source.get("direct")
    return direct if isinstance(direct, str) and direct.startswith("https://") else None


def acquire(task):
    index, item, out = task
    url = image_url(item)
    if not url:
        return {"index": index, "error": "No image endpoint"}
    try:
        binary = get_bytes(url, MAX_BYTES)
        im = Image.open(io.BytesIO(binary))
        im.load()
        if min(im.size) < 850 or max(im.size) < 1400:
            return {"index": index, "error": "Image too small", "pixels": list(im.size)}
        if im.format not in ("JPEG", "PNG", "WEBP"):
            return {"index": index, "error": "Unexpected image format"}
        dest = out / ("%05d.jpg" % index)
        im.convert("RGB").save(dest, "JPEG", quality=86, optimize=True)
        return {
            "index": index, "file": dest.name, "sourceImage": url,
            "sourceSha256": hashlib.sha256(binary).hexdigest(),
            "archiveSha256": hashlib.sha256(dest.read_bytes()).hexdigest(),
            "pixels": list(im.size), "size": dest.stat().st_size,
            "license": item["rights"], "status": "ACQUIRED_NOT_EDITORIALLY_APPROVED"
        }
    except Exception as exc:
        return {"index": index, "error": str(exc)[:230]}


def sheets(items, completed, out):
    ok = [x for x in completed if x.get("file")]
    for start in range(0, len(ok), 64):
        batch = ok[start:start + 64]
        sheet = Image.new("RGB", (1200, 180 * ((len(batch) + 5) // 6)), "#141416")
        dr = ImageDraw.Draw(sheet)
        for n, entry in enumerate(batch):
            path = out / "images" / entry["file"]
            with Image.open(path) as im:
                im.thumbnail((180, 148))
                xx = (n % 6) * 200 + (200 - im.width) // 2
                yy = (n // 6) * 180
                sheet.paste(im, (xx, yy))
            label = items[entry["index"]]["title"][:24]
            dr.text(((n % 6) * 200 + 6, (n // 6) * 180 + 149),
                    label.encode("ascii", errors="ignore").decode("ascii"), fill="white")
        sheet.save(out / ("contact-%03d.jpg" % (start // 64 + 1)), quality=83)


def self_test():
    assert allowed("https://creativecommons.org/publicdomain/zero/1.0/")
    assert allowed("http://creativecommons.org/licenses/by-sa/4.0/")
    assert not allowed("https://creativecommons.org/licenses/by-nc/4.0/")
    assert not allowed("https://rightsstatements.org/vocab/InC/1.0/")
    assert norm("Saint Jérôme") == "saint jerome"
    assert RELIGIOUS.search("Martyrdom of Saint Lawrence")
    assert PAINTING.search("Oil on canvas")
    known = set()
    signatures({"works": [{"artist": "Rubens", "title": "The Assumption"}]}, known)
    assert "rubens|the assumption" in known
    print("PASS: fail-closed rights, subject and source dedup tests")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--output", default="artifacts/sacred-art-flemish-bulk")
    parser.add_argument("--existing", action="append", default=[])
    parser.add_argument("--manifest-limit", type=int, default=1100)
    parser.add_argument("--download-limit", type=int, default=250)
    parser.add_argument("--max-output-mb", type=int, default=100)
    args = parser.parse_args()
    if args.self_test:
        return self_test()
    out = Path(args.output)
    (out / "images").mkdir(parents=True, exist_ok=True)
    manifest_ids, errors = harvest_ids(args.manifest_limit)
    print("Enumerated", len(manifest_ids), "source manifests; errors", len(errors), flush=True)
    items = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        futures = {pool.submit(museum_item, u): u for u in manifest_ids}
        for future in concurrent.futures.as_completed(futures):
            url = futures[future]
            try:
                items.append(future.result())
            except Exception as exc:
                errors.append({"url": url, "error": str(exc)[:250]})
    items.sort(key=lambda x: x["manifest"])
    known = read_existing(args.existing)
    for item in items:
        item["exactArtistTitleInInspectedArchive"] = (
            (norm(item["artist"]) + "|" + norm(item["title"])) in known
            if item["artist"] and item["title"] else None
        )
        item["newness"] = ("POSSIBLE_DUPLICATE" if item["exactArtistTitleInInspectedArchive"]
                           else "PROVISIONAL_UNVERIFIED_856")
    eligible = [
        (i, item) for i, item in enumerate(items)
        if item["rightsEligible"] and item["religiousSubject"]
        and item["paintingState"] == "PAINTING"
        and item["exactArtistTitleInInspectedArchive"] is False
        and image_url(item)
    ]
    eligible.sort(key=lambda entry: entry[1]["title"])
    eligible = eligible[:args.download_limit]
    completed, used = [], 0
    # Harvest whole source metadata; image downloads are bounded separately.
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        for result in pool.map(acquire, [(i, item, out / "images") for i, item in eligible]):
            if result.get("file"):
                used += result["size"]
                if used > args.max_output_mb * 1024 * 1024:
                    (out / "images" / result["file"]).unlink()
                    result = {"index": result["index"], "error": "Image artifact size cap"}
            completed.append(result)
    sheets(items, completed, out)
    counts = Counter((x["rightsEligible"], x["religiousSubject"], x["paintingState"]) for x in items)
    report = {
        "schema": "AO_FLEMISH_OPEN_IIIF_COLLECTION_BULK_2026_V1",
        "publicationStatus": "RESEARCH_ONLY_NOT_APP_ART",
        "sourceCollection": COLLECTION,
        "manifestsEnumerated": len(manifest_ids), "metadataParsed": len(items),
        "rightsEligible": sum(x["rightsEligible"] for x in items),
        "religiousSubjects": sum(x["religiousSubject"] for x in items),
        "paintingsWithOpenRightsReligiousSubjectsUnmatchedInInspectedArchive": len(eligible),
        "imagesAcquired": sum(bool(x.get("file")) for x in completed),
        "photographRightsVerifiedBeyondSourceManifest": False,
        "full856ArchiveDedupComplete": False,
        "editorialApprovalsAdded": 0, "appAssetsPublished": 0,
        "newnessCaveat": "Artist/title exact join with loaded 383/451/III records only. Full 856 and image perceptual dedup still pending.",
        "sourceRightsPolicy": "Only manifest/canvas explicit PDM, CC0, CC BY or BY-SA. Unknown/NC/ND held.",
        "limits": {"manifestLimit": args.manifest_limit, "downloadLimit": args.download_limit, "artifactMaxMB": args.max_output_mb},
        "errors": errors,
        "acquisition": completed,
        "classificationCounts": [{"openRights": a, "religious": b, "medium": c, "count": n} for (a,b,c), n in counts.items()]
    }
    (out / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    (out / "all-museum-items.json").write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({key: report[key] for key in (
        "manifestsEnumerated", "metadataParsed", "rightsEligible",
        "religiousSubjects", "paintingsWithOpenRightsReligiousSubjectsUnmatchedInInspectedArchive",
        "imagesAcquired")}), flush=True)


if __name__ == "__main__":
    main()
