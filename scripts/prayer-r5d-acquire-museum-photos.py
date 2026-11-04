#!/usr/bin/env python3
"""Acquire exact museum open-access images for R5D QA, never publication."""
import hashlib
import json
import os
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen

OUT = Path(os.environ.get("AO_ACQUIRE_OUT", "r5d-museum-evidence"))
OUT.mkdir(parents=True, exist_ok=True)
MAX_BYTES = 60 * 1024 * 1024
HEADERS = {"User-Agent": "AdOrientemResearch/1.0 (source-verification; no publication)", "Accept": "application/json,image/*"}
ALLOWED = {"openaccess-api.clevelandart.org", "collectionapi.metmuseum.org", "images.metmuseum.org", "www.metmuseum.org", "piction.clevelandart.org", "openaccess-cdn.clevelandart.org"}
def fetch(url, binary=False):
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.hostname not in ALLOWED:
        raise ValueError("Image or metadata host outside approved museum domains: " + str(url))
    with urlopen(Request(url, headers=HEADERS), timeout=60) as stream:
        final = urlparse(stream.geturl())
        if final.scheme != "https" or final.hostname not in ALLOWED:
            raise ValueError("Unapproved redirect: " + stream.geturl())
        data = stream.read(MAX_BYTES + 1)
        if len(data) > MAX_BYTES: raise ValueError("Museum image exceeds 60 MiB")
        return data if binary else json.loads(data)

def acquire(record, url):
    data = fetch(url, True)
    if not (data.startswith(b"\xff\xd8\xff") or data.startswith(b"\x89PNG\r\n\x1a\n") or data.startswith((b"II*\x00", b"MM\x00*"))):
        raise ValueError("Not a JPEG, PNG or TIFF museum original")
    from PIL import Image
    from io import BytesIO
    image = Image.open(BytesIO(data))
    image.verify()
    image = Image.open(BytesIO(data))
    width, height = image.size
    if min(width, height) < 1200:
        raise ValueError(f"Image too small for approval: {width}x{height}")
    suffix = ".tif" if image.format == "TIFF" else (".png" if image.format == "PNG" else ".jpg")
    path = OUT / (record["museum"] + "-" + record["object_id"] + suffix)
    path.write_bytes(data)
    record.update(image_url=url, original_file_format=image.format, file=str(path), sha256=hashlib.sha256(data).hexdigest(), width=width, height=height, bytes=len(data), image_decoded=True, publication_authorized=False)
    return record

results = []
try:
    cleveland = fetch("https://openaccess-api.clevelandart.org/api/artworks/?q=1916.786&limit=100")
    objects = cleveland.get("data", [])
    matches = [x for x in objects if str(x.get("accession_number", "")).strip() == "1916.786"]
    if len(matches) != 1: raise ValueError(f"Expected one Cleveland accession 1916.786, found {len(matches)}")
    item = matches[0]
    if "Crucifixion" not in item.get("title", "") or str(item.get("share_license_status", "")).lower() != "cc0":
        raise ValueError("Cleveland identity or CC0 metadata mismatch")
    imgs = item.get("images") or {}
    original = next((imgs[k].get("url") for k in ("print", "web", "full") if isinstance(imgs.get(k), dict) and imgs[k].get("url")), None)
    if not original: raise ValueError("No official Cleveland image URL")
    results.append(acquire({"museum":"cleveland","object_id":"1916.786","source_url":"https://www.clevelandart.org/art/1916.786","catalog_artist":str(item.get("creators")),"license":"CC0"}, original))
except Exception as exc:
    results.append({"museum":"cleveland","object_id":"1916.786","error":str(exc),"publication_authorized":False})
try:
    item=fetch("https://collectionapi.metmuseum.org/public/collection/v1/objects/437542")
    if item.get("objectID") != 437542 or not item.get("isPublicDomain") or "Teresa" not in item.get("title",""):
        raise ValueError("Met identity or public domain metadata mismatch")
    artist = item.get("artistDisplayName","")
    if "Rubens" not in artist: raise ValueError("Unexpected Met artist")
    original = item.get("primaryImage")
    if not original: raise ValueError("Met primaryImage unavailable")
    results.append(acquire({"museum":"met","object_id":"437542","source_url":"https://www.metmuseum.org/art/collection/search/437542","catalog_artist":artist,"license":"Public Domain"},original))
except Exception as exc:
    results.append({"museum":"met","object_id":"437542","error":str(exc),"publication_authorized":False})
(OUT/"evidence.json").write_text(json.dumps({"schema":"AO_PRAYER_R5D_ACQUISITION_EVIDENCE_V1","records":results,"requires_human_visual_review":True},indent=2)+"\n")
print(json.dumps(results,indent=2))
if any("error" in r for r in results): raise SystemExit("At least one museum acquisition failed; nothing approved for publication")
