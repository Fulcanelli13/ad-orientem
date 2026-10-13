#!/usr/bin/env python3
"""Acquire exact, new Met/NGA open-access originals from favourite-artists manifest.

Research only. Never writes runtime art, scores, or old acquisition originals.
The official museum object identity, copyright permission, artist, medium and
image bytes are rechecked at execution time. A hold never falls back to a
different image or attribution.
"""
from __future__ import annotations
import csv, hashlib, io, json, re, time, unicodedata
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "data/calendar/sacred-art-favourite-artist-open-access-8-20261013.v1.json"
REGISTRY = ROOT / "data/calendar/sacred-art-candidates.v1.json"
MASTER = ROOT / "data/calendar/sacred-art-source-identity-master-153-queue-20261013.v2.json"
OUT = ROOT / "artifacts/sacred-art-favourite-artist-open-access"
ORIGINALS = OUT / "originals"
DATASET = "https://raw.githubusercontent.com/NationalGalleryOfArt/opendata/main/data/"
AGENT = "AdOrientemChurchSacredArt/1.0 (Met/NGA public domain research, no production)"
MAX_ORIGINAL = 48_000_000

def normalize(text):
    s = unicodedata.normalize("NFKD", str(text or "")).casefold()
    s = "".join(ch for ch in s if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9]+", "", s)

def fetch(url, limit=MAX_ORIGINAL, attempts=3):
    p = urlparse(url)
    if p.scheme != "https" or p.hostname not in {
       "collectionapi.metmuseum.org", "images.metmuseum.org",
       "raw.githubusercontent.com", "api.nga.gov"
    }:
        raise ValueError("Source hostname is not an allowed official image source")
    last = None
    for i in range(attempts):
        try:
            with urlopen(Request(url, headers={"User-Agent": AGENT, "Accept": "application/json,text/csv,image/jpeg,*/*"}), timeout=85) as resp:
                final = urlparse(resp.url)
                if final.scheme != "https" or final.hostname not in {
                    "collectionapi.metmuseum.org", "images.metmuseum.org",
                    "raw.githubusercontent.com", "api.nga.gov"
                }:
                    raise ValueError("Unexpected redirect host")
                if int(resp.headers.get("Content-Length") or 0) > limit:
                    raise ValueError("Museum resource larger than configured original byte cap")
                blob = resp.read(limit + 1)
                if len(blob) > limit:
                    raise ValueError("Museum resource exceeds configured byte cap")
                return blob
        except (HTTPError, URLError, TimeoutError, OSError) as e:
            last = e
            if isinstance(e, HTTPError) and e.code not in (429, 500, 502, 503, 504):
                break
            time.sleep(2 + 3*i)
    raise RuntimeError("Museum source fetch failed: " + str(last)[:150])

def records(url, cap):
    body = fetch(url, cap)
    return [{str(k).lower(): v for k,v in row.items()}
            for row in csv.DictReader(io.StringIO(body.decode("utf-8-sig")))]

def verified_image(blob, minimum):
    if not blob.startswith(b"\xff\xd8\xff"):
        raise ValueError("Not a JPEG original (may be HTML response)")
    with Image.open(io.BytesIO(blob)) as im:
        im.load()
        if im.format != "JPEG":
            raise ValueError("Not an original JPEG")
        width, height = ImageOps.exif_transpose(im).size
    if max(width, height) < minimum or min(width, height) < 950:
        raise ValueError("Museum original too small for source master")
    return width, height

def lookup_nga(manifest_items):
    ids = {str(x["objectId"]) for x in manifest_items}
    objects = {o.get("objectid"):o for o in records(DATASET+"objects.csv", 110_000_000)
               if o.get("objectid") in ids}
    published = {}
    for im in records(DATASET+"published_images.csv", 150_000_000):
        oid = str(im.get("depictstmsobjectid") or "")
        if oid in ids and str(im.get("openaccess")) == "1" and str(im.get("iiifurl") or "").startswith("https://api.nga.gov/iiif/"):
            published.setdefault(oid, []).append(im)
    rels = [r for r in records(DATASET+"objects_constituents.csv", 110_000_000)
            if r.get("objectid") in ids and (r.get("roletype") or "").lower() == "artist"]
    person_ids = {r.get("constituentid") for r in rels}
    people = {r.get("constituentid"):r.get("forwarddisplayname")
              for r in records(DATASET+"constituents.csv", 110_000_000) if r.get("constituentid") in person_ids}
    makers = {}
    for r in rels:
        if people.get(r.get("constituentid")):
            makers.setdefault(r["objectid"], []).append(people[r["constituentid"]])
    return objects, published, makers

def acquire_met(item):
    oid = str(item["objectId"])
    meta = json.loads(fetch("https://collectionapi.metmuseum.org/public/collection/v1/objects/"+oid, 2_000_000))
    if str(meta.get("objectID")) != oid:
        raise ValueError("Met object ID mismatch")
    if meta.get("classification") != "Paintings" or meta.get("isPublicDomain") is not True:
        raise ValueError("Met item is not a public-domain Painting")
    if "oil" not in (meta.get("medium") or "").casefold():
        raise ValueError("Expected authenticated original oil painting")
    if normalize(meta.get("title")) != normalize(item["expectedTitle"]):
        raise ValueError("Met artwork title mismatch")
    if normalize(item["expectedArtist"]) not in normalize(meta.get("artistDisplayName")):
        raise ValueError("Met artwork maker mismatch")
    url = str(meta.get("primaryImage") or "")
    if not re.fullmatch(r"https://images\.metmuseum\.org/CRDImages/[^/]+/original/[^?#]+\.jpe?g", url, flags=re.I):
        raise ValueError("Official Met original image URL absent or outside approved host")
    return url, {"museumObjectID": oid, "museumArtist": meta.get("artistDisplayName"),
                 "medium":meta.get("medium"), "imageRights":"MET_OPEN_ACCESS_CC0",
                 "museumTitle":meta.get("title")}

def acquire_nga(item, objects, images, makers):
    oid = str(item["objectId"])
    obj = objects.get(oid)
    if not obj:
        raise ValueError("NGA source object does not appear in official open data")
    classification = normalize(obj.get("visualbrowserclassification") or obj.get("classification"))
    if classification not in ("painting","paintings") or "oil" not in (obj.get("medium") or "").lower():
        raise ValueError("NGA object not an original oil painting")
    if normalize(obj.get("title")) != normalize(item["expectedTitle"]):
        raise ValueError("NGA exact artwork title mismatch: " + str(obj.get("title")))
    author_names = makers.get(oid) or []
    if not any(normalize(item["expectedArtist"]) in normalize(a) for a in author_names):
        raise ValueError("NGA named constituent painter not authenticated as expected artist")
    pics = images.get(oid) or []
    pics = [i for i in pics if int(i.get("width") or 0)>1200 and int(i.get("height") or 0)>950]
    if not pics:
        raise ValueError("No NGA openaccess=1 image in institutional published dataset")
    image = sorted(pics, key=lambda i: (str(i.get("viewtype") or "").lower()!="primary",
                        int(i.get("sequence") or 0),-int(i.get("width") or 0)*int(i.get("height") or 0)))[0]
    url = image["iiifurl"].rstrip("/") + "/full/full/0/default.jpg"
    return url, {"museumObjectID":oid,"museumArtist":"; ".join(author_names),
                 "medium":obj.get("medium"),"museumTitle":obj.get("title"),
                 "imageRights":"NGA_IMAGE_OPENACCESS_1","museumImageUUID":image.get("uuid"),
                 "sourceListedWidth":image.get("width"),"sourceListedHeight":image.get("height")}

def main():
    doc = json.loads(MANIFEST.read_text(encoding="utf-8"))
    assert len(doc["items"]) == 8 and doc["imagePolicy"]["productionApproved"] is False
    existing = json.loads(REGISTRY.read_text(encoding="utf-8"))["artworks"]
    queue = {x["leadId"]:x for x in json.loads(MASTER.read_text(encoding="utf-8"))["queue"]}
    originalIds = {x["id"] for x in existing}
    ORIGINALS.mkdir(parents=True,exist_ok=True)
    nga_items = [x for x in doc["items"] if x["provider"]=="nga"]
    nga_error = None
    try:
        objects, images, makers = lookup_nga(nga_items)
    except Exception as e:
        nga_error = str(e)[:240]
        objects, images, makers = {}, {}, {}
    results=[]
    for item in doc["items"]:
        oid = str(item["objectId"])
        provider = item["provider"]
        museum_id = provider+"-"+oid
        row = {"leadId":item["leadId"],"artworkId":museum_id,
               "expectedTitle":item["expectedTitle"],"artist":item["expectedArtist"],
               "museumSourceUrl":item["officialUrl"],"provider":provider,
               "status":"NOT_ACQUIRED","artCuratorApproved":False,
               "mobileHeroCropApproved":False,"productionApproved":False,
               "userRating":None}
        try:
            source = queue[item["leadId"]]
            if source["artist"] != item["expectedArtist"]:
                raise ValueError("Queue artist and official-source item disagree")
            if museum_id in originalIds:
                raise ValueError("Artwork ID already exists in acquired registry; no re-download allowed")
            if provider=="nga":
                if nga_error:
                    raise ValueError("NGA source dataset retrieval held: "+nga_error)
                url,meta = acquire_nga(item, objects, images, makers)
            elif provider=="met":
                url,meta = acquire_met(item)
            else:
                raise ValueError("Invalid provider")
            raw = fetch(url, MAX_ORIGINAL)
            width,height = verified_image(raw, doc["imagePolicy"]["minimumLongSidePixels"])
            sha = hashlib.sha256(raw).hexdigest()
            fn = "originals/"+museum_id+".jpg"
            (OUT/fn).write_bytes(raw)
            row.update(meta)
            row.update(status="ORIGINAL_ACQUIRED_RESEARCH_ONLY",sourceOriginalURL=url,
                       originalSha256=sha, width=width,height=height,bytes=len(raw),filename=fn)
            print("ACQUIRED_RESEARCH_ONLY",museum_id,width,height,flush=True)
        except Exception as e:
            row.update(status="SOURCE_OR_IMAGE_HELD",holdReason=str(e)[:280])
            print("HELD",museum_id,row["holdReason"],flush=True)
        results.append(row)
    report={"schema":"AO_SACRED_ART_FAVOURITE_ARTISTS_OPEN_ACCESS_ACQUISITION_RESULT_V1",
            "manifest":str(MANIFEST.relative_to(ROOT)),
            "artistRatingPolicy":"Source acquisition never implies 5/5 rating or production approval",
            "requested":len(results),
            "originalsAcquired":sum(x["status"]=="ORIGINAL_ACQUIRED_RESEARCH_ONLY" for x in results),
            "results":results,"productionChanges":0}
    (OUT/"acquisition.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print("ACQUISITION_COMPLETE",report["originalsAcquired"],"/",report["requested"],flush=True)

if __name__ == "__main__":
    main()
