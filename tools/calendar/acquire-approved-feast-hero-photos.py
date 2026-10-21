#!/usr/bin/env python3
"""Acquire exact original photo candidates for the TEN already approved feast heroes.

Research evidence only. Nothing is pushed into assets/sacred-art or published.
Met Open Access / Wikimedia Commons per-file APIs are checked where available;
a Commons redirect fallback can recover bytes, but NOT grant any rights.
Review thumbnails use whole-surface contain, never crop/cover.
"""
from __future__ import annotations

import hashlib
import io
import json
import re
import time
from pathlib import Path
from urllib.parse import quote, urlparse

import requests
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[2]
INPUT = ROOT / "data/calendar/approved-feast-hero-photo-acquisition-20261021.v1.json"
OUT = ROOT / "artifacts/sacred-art-approved-feast-hero-photographs"
API_HOSTS = {"commons.wikimedia.org", "collectionapi.metmuseum.org"}
IMAGE_HOSTS = {"upload.wikimedia.org", "images.metmuseum.org"}
MAX_BYTES = 40_000_000
Image.MAX_IMAGE_PIXELS = 110_000_000
S = requests.Session()
S.headers.update({
    "User-Agent": "AdOrientemSacredArtResearch/1.0 (photo attribution and source verification)",
    "Accept": "application/json,image/jpeg,image/png,image/webp,*/*",
})


def host(url):
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.hostname not in API_HOSTS | IMAGE_HOSTS:
        raise ValueError("Unapproved source host or insecure URL")
    return parsed.hostname


def download(url: str, max_bytes: int = MAX_BYTES):
    host(url)
    errors = []
    for attempt in range(3):
        try:
            with S.get(url, timeout=(12, 55), stream=True, allow_redirects=True) as res:
                res.raise_for_status()
                host(res.url)
                length = 0
                chunks = []
                for chunk in res.iter_content(256 * 1024):
                    if chunk:
                        length += len(chunk)
                        if length > max_bytes:
                            raise ValueError("Source exceeds bounded download size")
                        chunks.append(chunk)
                return b"".join(chunks), res.url
        except (requests.RequestException, ValueError) as e:
            errors.append(str(e)[:150])
            if attempt < 2:
                time.sleep([5, 15][attempt]) # Wikimedia occasionally rate-limits sequential originals
    raise RuntimeError("Download failed: " + "; ".join(errors[-2:]))


def as_json(url):
    data, _ = download(url, max_bytes=3_000_000)
    return json.loads(data)


def meta(item):
    if item["route"] == "MET":
        objid = str(item["lookup"])
        api = "https://collectionapi.metmuseum.org/public/collection/v1/objects/" + quote(objid)
        rec = as_json(api)
        if str(rec.get("objectID")) != objid:
            raise ValueError("Met object ID mismatch")
        if not rec.get("isPublicDomain"):
            raise ValueError("Met object API does not mark this public domain")
        url = rec.get("primaryImage") or rec.get("primaryImageSmall")
        if not url or host(url) not in IMAGE_HOSTS:
            raise ValueError("No approved Met original-image URL")
        return {"downloadUrl": url, "api": api, "metadataAccess": "MET_API_VERIFIED_PD_FLAG",
                "licenseLabel": "MET_OPEN_ACCESS_PUBLIC_DOMAIN_REPORTED",
                "widthFromApi": None, "heightFromApi": None,
                "museumObjectTitle": rec.get("title"), "museumArtist": rec.get("artistDisplayName"),
                "objectIdentifier": rec.get("accessionNumber")}
    name = item["lookup"]
    api = ("https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2"
           "&prop=imageinfo&iiprop=url%7Csize%7Cmime%7Cextmetadata%7Csha1&iiurlwidth=1800&titles=File%3A"
           + quote(name, safe=""))
    try:
        result = as_json(api)
        pages = result.get("query", {}).get("pages", [])
        page = next((p for p in pages if p.get("imageinfo")), None)
        if not page or page.get("missing"):
            raise ValueError("Exact Commons file title not present")
        info = page["imageinfo"][0]
        url = info["url"]
        if host(url) not in IMAGE_HOSTS:
            raise ValueError("Commons returned untrusted photo host")
        ext = info.get("extmetadata") or {}
        return {"downloadUrl": url, "api": api, "metadataAccess": "COMMONS_IMAGEINFO_API",
                "licenseLabel": re.sub(r"<[^>]*>", "", (ext.get("LicenseShortName") or {}).get("value", ""))[:120],
                "licenseUrl": re.sub(r"<[^>]*>", "", (ext.get("LicenseUrl") or {}).get("value", ""))[:220],
                "attribution": re.sub(r"<[^>]*>", "", (ext.get("Artist") or {}).get("value", ""))[:200],
                "rights": re.sub(r"<[^>]*>", "", (ext.get("UsageTerms") or {}).get("value", ""))[:180],
                "widthFromApi": info.get("width"), "heightFromApi": info.get("height"),
                "thumbUrl": info.get("thumburl"),
                "commonsSha1": info.get("sha1")}
    except Exception as e:
        # A direct photo can still be documented even if Commons API is down.
        # Keep rights in HOLD because metadata retrieval was unsuccessful.
        return {"downloadUrl": "https://commons.wikimedia.org/wiki/Special:Redirect/file/" + quote(name),
                "api": api, "metadataAccess": "COMMONS_API_UNAVAILABLE_REPRODUCTION_RIGHTS_HOLD",
                "metadataError": str(e)[:260], "licenseLabel": "UNVERIFIED"}


def one(item):
    m = meta(item)
    variant = "EXACT_ORIGINAL_BYTES"
    try:
        buf, final_url = download(m["downloadUrl"])
    except Exception as exc:
        # Wikimedia explicitly recommends generated thumbnails when original
        # media transfer is rate-limited (HTTP 429). The full composition is
        # retained but derivative bytes are NOT misreported as an original.
        thumbnail = m.get("thumbUrl")
        if "429" not in str(exc) or not thumbnail:
            raise
        buf, final_url = download(thumbnail)
        variant = "WIKIMEDIA_RENDERED_1800PX_WHOLE_IMAGE_FALLBACK"
    if host(final_url) not in IMAGE_HOSTS:
        raise ValueError("Image redirected to unapproved host")
    with Image.open(io.BytesIO(buf)) as im:
        im.verify()
    with Image.open(io.BytesIO(buf)) as im:
        if im.format not in {"JPEG", "PNG", "WEBP"}:
            raise ValueError("Not a supported painting photograph")
        image = ImageOps.exif_transpose(im).convert("RGB")
        if image.width < 400 or image.height < 400:
            raise ValueError("Photo too small for basic 320px legibility inspection")
        original_format = im.format
    sha = hashlib.sha256(buf).hexdigest()
    stub = "hero-" + item["date"] + "-" + sha[:12]
    extension = {"JPEG": "jpg", "PNG": "png", "WEBP": "webp"}[original_format]
    original_name = stub + "." + extension
    (OUT / original_name).write_bytes(buf)
    preview_name = stub + "-review.webp"
    preview = image.copy()
    preview.thumbnail((1900, 1900), Image.Resampling.LANCZOS)
    preview.save(OUT / preview_name, "WEBP", quality=88)
    mini_names = {}
    for width, height in [(320, 390), (390, 470)]:
        mini = ImageOps.contain(image, (width, height), Image.Resampling.LANCZOS)
        name = f"{stub}-contain-{width}.png"
        mini.save(OUT / name)
        mini_names[str(width)] = name
    return {
        "date": item["date"], "artist": item["artist"], "title": item["title"],
        "status": "DOWNLOADED_RESEARCH_PHOTO_NOT_RELEASED",
        "retrievedVariant": variant,
        "museumObjectUrl": item["objectUrl"], "commonsFilePage": item["filePage"],
        "sourceInfo": m, "actualImageUrl": final_url,
        "sourceSHA256": sha, "byteCount": len(buf),
        "originalDimensions": [image.width, image.height], "originalFormat": original_format,
        "files": {"original": original_name, "review": preview_name, "phoneContain": mini_names},
        "correctSelectedPhysicalOriginalConfirmedByCurator": False,
        "fullPaintedSurfaceVerifiedByCurator": False,
        "photographReuseRightsAuditedForApp": False,
        "phone320VerifiedByCurator": False,
        "phone390VerifiedByCurator": False,
        "productionReleaseApproved": False,
    }


def draw_contact(records, width, height):
    records = [x for x in records if x.get("files")]
    if not records:
        return
    colw = width + 30
    cardh = height + 115
    canvas = Image.new("RGB", (colw * 2, cardh * 5), "#080c12")
    pen = ImageDraw.Draw(canvas)
    for idx, item in enumerate(records):
        cx, cy = (idx % 2) * colw, (idx // 2) * cardh
        mini = Image.open(OUT / item["files"]["phoneContain"][str(width)]).convert("RGB")
        canvas.paste(mini, (cx + (colw-mini.width)//2, cy + (height-mini.height)//2))
        captions = [item["date"], item["artist"], item["title"],
                    f"Original: {item['originalDimensions'][0]} x {item['originalDimensions'][1]}",
                    "NOT RELEASED - curator visual/rights QA pending"]
        for j, line in enumerate(captions):
            pen.text((cx + 9, cy + height + 8 + j*20), line[:45], fill="#ece1d1")
        pen.line((cx, cy+cardh-2, cx+colw, cy+cardh-2), fill="#55545a", width=1)
    canvas.save(OUT / f"ten-heroes-whole-image-{width}px-contact-sheet.jpg", quality=88)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    entries = json.loads(INPUT.read_text(encoding="utf-8"))["works"]
    assert len(entries) == 10, "Only the ten curator-approved dates are in scope"
    records = []
    for entry in entries:
        try:
            result = one(entry)
            print("HERO_ACQUIRED", entry["date"], result["originalDimensions"],
                  result["sourceInfo"]["metadataAccess"], flush=True)
        except Exception as e:
            result = {"date": entry["date"], "artist": entry["artist"], "title": entry["title"],
                      "status": "IMAGE_ACQUISITION_HOLD", "reason": str(e)[:350],
                      "productionReleaseApproved": False}
            print("HERO_HOLD", entry["date"], result["reason"], flush=True)
        records.append(result)
        time.sleep(2) # polite pacing avoids Commons HTTP 429
    for w, h in [(320, 390), (390, 470)]:
        draw_contact(records, w, h)
    stats = {"attempted": 10,
             "photographsAcquired": sum(bool(r.get("files")) for r in records),
             "acquisitionHolds": sum(not r.get("files") for r in records),
             "commonsApiMetadataAvailable": sum(r.get("sourceInfo",{}).get("metadataAccess")
                                                  == "COMMONS_IMAGEINFO_API" for r in records),
             "officialMetApiMetadataAvailable": sum(r.get("sourceInfo",{}).get("metadataAccess")
                                                  == "MET_API_VERIFIED_PD_FLAG" for r in records),
             "humanVerifiedPhonePhotos": 0, "photoRightsReleasedForApp": 0,
             "productionArtAssetsPublished": 0}
    report = {"schema": "AO_TEN_FEAST_HERO_SOURCE_BYTE_EVIDENCE_V1",
              "scope": "RESEARCH_ONLY_NO_APP_ASSETS",
              "counts": stats, "rows": records,
              "nonReleaseRule": "Source hashes, API public-domain tags, and contact sheets do not grant human/production release; no photo automatically replaces a curated original.",
              "noCropOrCover": True}
    (OUT / "ten-approved-feast-heroes-source-evidence.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    # Permanent source-bits evidence can be recovered from Actions text logs.
    # Action ZIP archives have limited retention and must not be the only SOT.
    for item in records:
        if item.get("files"):
            m = item.get("sourceInfo") or {}
            proof = {
                "date": item["date"], "artist": item["artist"], "title": item["title"],
                "sourcePage": item["museumObjectUrl"],
                "photoPage": item["commonsFilePage"],
                "actualImageUrl": item["actualImageUrl"],
                "sourceSHA256": item["sourceSHA256"], "sourceBytes": item["byteCount"],
                "sourceDimensions": item["originalDimensions"],
                "originalFormat": item["originalFormat"],
                "retrievedVariant": item["retrievedVariant"],
                "metadataAccess": m.get("metadataAccess"),
                "licenseCandidate": m.get("licenseLabel"),
                "licenseEvidenceUrl": m.get("licenseUrl"),
                "curatorPhotoRightsApproved": False,
                "wholePaintingHumanVerified": False,
                "releaseApproved": False,
            }
            print("HERO_SOURCE_PROOF " + json.dumps(proof, ensure_ascii=False), flush=True)
    print("HERO_COMPLETE", json.dumps(stats), flush=True)


if __name__ == "__main__":
    main()
