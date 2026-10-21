#!/usr/bin/env python3
"""W102: download eight exact CC0 museum painting photographs for research review.
Sources: Met Open Access object API and Cleveland Museum Open Access artwork API.
Downloads are SHA-identified research artifacts (not app assets / art approvals).
"""
from __future__ import annotations

import hashlib
import io
import json
import time
from pathlib import Path
from urllib.parse import urlparse

import requests
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[2]
INPUT = ROOT / "data/calendar/sacred-art-biblical-kings-judges-prophets-wave102-20261021.v1.json"
OUTPUT = ROOT / "artifacts/sacred-art-w102-open-access-original-evidence"
MET_IDS = {"436453", "437745", "435649", "435894", "437763", "441229", "435962"}
CMA_IDS = {"1972.50"}
ALLOWED_IMAGE_HOSTS = {"images.metmuseum.org", "openaccess-cdn.clevelandart.org"}
Image.MAX_IMAGE_PIXELS = 140_000_000


def get(url: str, limit: int = 55_000_000) -> bytes:
    host = urlparse(url).hostname
    if urlparse(url).scheme != "https":
        raise ValueError("Source must use HTTPS")
    with requests.Session() as session:
        session.headers.update({"User-Agent": "AdOrientemSacredArtResearch/1.0 (institutional API acquisition)"})
        for attempt in range(3):
            try:
                with session.get(url, timeout=(12, 45), stream=True, allow_redirects=True) as res:
                    res.raise_for_status()
                    if urlparse(res.url).hostname not in (ALLOWED_IMAGE_HOSTS | {
                        "collectionapi.metmuseum.org", "openaccess-api.clevelandart.org"
                    }):
                        raise ValueError("Unexpected cross-host redirect")
                    parts = []
                    total = 0
                    for chunk in res.iter_content(128 * 1024):
                        if chunk:
                            total += len(chunk)
                            if total > limit:
                                raise ValueError("File exceeds bounded research acquisition limit")
                            parts.append(chunk)
                    return b"".join(parts)
            except (requests.RequestException, ValueError):
                if attempt == 2:
                    raise
                time.sleep(2 + attempt * 3)
    raise AssertionError("unreachable")


def resolve_source(item):
    accession = item["accession"]
    if item["collection"] == "Metropolitan Museum of Art" and item["sourceUrl"].startswith("https://www.metmuseum.org/"):
        object_id = item["sourceUrl"].rstrip("/").split("/")[-1]
        if object_id not in MET_IDS:
            raise ValueError("Met object not in bounded W102 allowed set")
        api = f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{object_id}"
        rec = json.loads(get(api, limit=3_000_000))
        if str(rec.get("objectID")) != object_id or rec.get("accessionNumber") != accession:
            raise ValueError("Object ID or accession mismatch")
        if not rec.get("isPublicDomain"):
            raise ValueError("Met not marked Public Domain")
        url = rec.get("primaryImage") or rec.get("primaryImageSmall")
        licence = "Met Open Access / Public Domain according to current object API"
    elif item["collection"] == "Cleveland Museum of Art" and accession in CMA_IDS:
        api = f"https://openaccess-api.clevelandart.org/api/artworks/{accession}"
        rec = json.loads(get(api, limit=3_000_000)).get("data") or {}
        if rec.get("accession_number") != accession:
            raise ValueError("CMA accession mismatch")
        if rec.get("share_license_status") != "CC0":
            raise ValueError("CMA object photograph not CC0")
        images = rec.get("images") or {}
        url = (images.get("print") or images.get("web") or {}).get("url")
        licence = "CMA CC0 according to current object API"
    else:
        raise ValueError("Not an approved API acquisition route")
    if not url or urlparse(url).hostname not in ALLOWED_IMAGE_HOSTS:
        raise ValueError("Missing image or unapproved image host")
    return url, api, licence


def fetch_one(item):
    url, api, licence = resolve_source(item)
    raw = get(url)
    with Image.open(io.BytesIO(raw)) as image:
        image.verify()
    with Image.open(io.BytesIO(raw)) as image:
        img = ImageOps.exif_transpose(image).convert("RGB")
        dimensions = [img.width, img.height]
        preview = img.copy()
        preview.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
        phone = img.copy()
        phone.thumbnail((350, 410), Image.Resampling.LANCZOS)
        preview_buffer = io.BytesIO()
        preview.save(preview_buffer, "WEBP", quality=88, method=4)
        phone_buffer = io.BytesIO()
        phone.save(phone_buffer, "PNG")
    checksum = hashlib.sha256(raw).hexdigest()
    stem = f"{item['leadId'].lower()}-{checksum[:12]}"
    filenames = {"original": stem + ".jpg", "review": stem + ".webp", "phone": stem + "-phone.png"}
    (OUTPUT / filenames["original"]).write_bytes(raw)
    (OUTPUT / filenames["review"]).write_bytes(preview_buffer.getvalue())
    (OUTPUT / filenames["phone"]).write_bytes(phone_buffer.getvalue())
    return {
        "leadId": item["leadId"],
        "title": item["title"],
        "artist": item["artist"],
        "sourceUrl": item["sourceUrl"],
        "museumApi": api,
        "exactImageUrl": url,
        "apiImageRights": licence,
        "accession": item["accession"],
        "sourceSHA256": checksum,
        "sourceBytes": len(raw),
        "sourceDimensions": dimensions,
        "phoneDimensions": [phone.width, phone.height],
        "files": filenames,
        "state": "DOWNLOADED_AS_RESEARCH_ARTIFACT",
        "fullPaintedSurfaceVerifiedByCurator": False,
        "humanAestheticRating": None,
        "appPhotoRightsReleaseApproved": False,
        "appArtReleaseApproved": False,
    }


def contact_sheet(rows):
    rows = [r for r in rows if "files" in r]
    if not rows:
        return
    canvas = Image.new("RGB", (900, len(rows) * 432), (11, 16, 22))
    d = ImageDraw.Draw(canvas)
    for i, r in enumerate(rows):
        im = Image.open(OUTPUT / r["files"]["phone"]).convert("RGB")
        canvas.paste(im, (20 + (350 - im.width) // 2, i * 432 + (410 - im.height) // 2))
        labels = [
            r["leadId"],
            r["artist"],
            r["title"],
            f"{r['sourceDimensions'][0]} x {r['sourceDimensions'][1]} | {r['accession']}",
            "Research only: review full surface, rights, and fit before release",
        ]
        for j, line in enumerate(labels):
            d.text((390, i * 432 + 18 + j * 64), line[:65], fill=(239, 226, 206))
        d.line((0, (i + 1) * 432 - 1, 900, (i + 1) * 432 - 1), fill=(67, 75, 84))
    canvas.save(OUTPUT / "w102-phone-research-contact-sheet.jpg", quality=90)


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    source = json.loads(INPUT.read_text(encoding="utf-8"))
    selected = [
        item for item in source["works"]
        if (item["collection"] == "Metropolitan Museum of Art" and item["sourceUrl"].rsplit("/", 1)[-1] in MET_IDS)
        or (item["collection"] == "Cleveland Museum of Art" and item["accession"] in CMA_IDS)
    ]
    records = []
    for item in selected:
        try:
            record = fetch_one(item)
            print("W102_DOWNLOADED", item["leadId"], record["sourceDimensions"], flush=True)
        except Exception as e:
            record = {"leadId": item["leadId"], "state": "IMAGE_API_OR_DOWNLOAD_HOLD",
                      "reason": str(e)[:300], "appArtReleaseApproved": False}
            print("W102_HOLD", item["leadId"], record["reason"], flush=True)
        records.append(record)
    contact_sheet(records)
    report = {"schema": "AO_SACRED_ART_W102_API_ORIGINAL_BYTE_EVIDENCE",
              "sources": ["Met Open Access", "Cleveland Museum Open Access"],
              "counts": {"attempted": len(selected),
                         "sourceImageFilesDownloaded": sum("files" in rec for rec in records),
                         "sourceImageHolds": sum("files" not in rec for rec in records),
                         "publicationCertified": 0},
              "records": records,
              "noAppOrHumanDecisionMutation": True,
              "noCroppingOfPaintedSurface": True}
    (OUTPUT / "w102-image-source-proof.json").write_text(
        json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("W102_DONE", json.dumps(report["counts"]), flush=True)


if __name__ == "__main__":
    main()
