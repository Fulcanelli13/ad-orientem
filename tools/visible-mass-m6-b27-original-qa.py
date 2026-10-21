#!/usr/bin/env python3
"""M6 B27 original-source pixel acquisition. Research evidence only, no approval."""
from __future__ import annotations
import hashlib
import html
import io
import json
import re
import time
from pathlib import Path
from urllib.parse import unquote, urlsplit, quote
import requests
from PIL import Image, ImageOps, ImageDraw, ImageStat

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "previews/visible-mass-3d/M6_B27_PILOT_15_BULK_RECONCILIATION_20261019.v1.json"
OUTPUT = ROOT / "dist/visible-mass/m6-b27-original-qa"
ORIGINALS = OUTPUT / "originals"
PREVIEWS = OUTPUT / "previews"
for p in (ORIGINALS, PREVIEWS):
    p.mkdir(parents=True, exist_ok=True)
PICKS = None
MAX_BYTES = 42 * 1024 * 1024
Image.MAX_IMAGE_PIXELS = 120_000_000
UA = "AdOrientem-M6B27-ImageQA/0.1 (liturgical source research; no publication)"
S = requests.Session()
S.headers.update({"User-Agent": UA, "Accept": "application/json,image/*"})
audit = json.loads(SOURCE.read_text(encoding="utf-8"))
records = []
for i, queue in enumerate(audit["original_pixel_acquisition_queue"], 1):
    object_id = queue["object_id"]
    match = next(
        (item for obj in audit["objects"] if obj["object_id"] == object_id
         for item in obj["sources"] if item["source_url"] == queue["source_url"]),
        None,
    )
    if not match:
        raise SystemExit(f"B27 absent exact source for {object_id}")
    records.append((f"{object_id}-{i:02d}", {
        "source_url": match["source_url"],
        "file_author": match["photographer"],
        "file_license": match["license"],
        "object_id": object_id,
    }))
PICKS = [key for key, _ in records]
titles = []
for _, rec in records:
    name = unquote(urlsplit(rec["source_url"]).path.rsplit("/File:", 1)[-1]).replace("_", " ")
    titles.append("File:" + name)
info_by_title = {}
api_status = "NOT_ATTEMPTED"
try:
    response = S.get(
        "https://commons.wikimedia.org/w/api.php",
        params={"action": "query", "format": "json", "formatversion": "2",
                "titles": "|".join(titles), "prop": "imageinfo",
                "iiprop": "url|size|mime|extmetadata"},
        timeout=(15, 60),
    )
    response.raise_for_status()
    info_by_title = {p.get("title"): (p.get("imageinfo") or [None])[0]
                     for p in response.json()["query"]["pages"]}
    api_status = "OK"
except (requests.RequestException, ValueError, KeyError) as error:
    api_status = f"FAILED: {str(error)[:250]}"
def fallback_url(title):
    name = title.removeprefix("File:").replace(" ", "_")
    name = name[:1].upper() + name[1:]
    hash_ = hashlib.md5(name.encode("utf-8")).hexdigest()
    return "https://upload.wikimedia.org/wikipedia/commons/" + hash_[0] + "/" + hash_[:2] + "/" + quote(name, safe="(),_-'.")

def get_original(url):
    with S.get(url, stream=True, timeout=(18, 110)) as r:
        r.raise_for_status()
        content_type = r.headers.get("Content-Type", "")
        if not content_type.startswith("image/"):
            raise ValueError(f"Non-image: {content_type}")
        data = bytearray()
        for chunk in r.iter_content(chunk_size=65536):
            data.extend(chunk)
            if len(data) > MAX_BYTES:
                raise ValueError("Image larger than 42 MiB maximum")
        return bytes(data)

outcomes = []
rate_limited = False
for object_id, rec in records:
    title = titles[len(outcomes)]
    info = info_by_title.get(title)
    entry = {
        "object_id": object_id, "source_url": rec["source_url"],
        "original_title": title, "creator_from_b25": rec["file_author"],
        "licence_from_b25": rec["file_license"],
        "metadata_source": "Wikimedia Commons imageinfo API" if info else "B27 source record only",
        "original_pixels_accessed": False,
        "human_visual_signoff": False, "publication_approved": False,
        "status": "SOURCE_NOT_FETCHED",
    }
    if info:
        entry["commons_declared_dimensions"] = [info.get("width"), info.get("height")]
        ext = info.get("extmetadata") or {}
        entry["commons_licence_short"] = html.unescape(re.sub(
            "<[^>]+>", "", ext.get("LicenseShortName", {}).get("value", "")))
        entry["commons_licence_url"] = ext.get("LicenseUrl", {}).get("value")
    if rate_limited:
        entry["status"] = "SKIPPED_AFTER_WIKIMEDIA_429"
        outcomes.append(entry)
        continue
    urls = list(dict.fromkeys(u for u in [
        (info or {}).get("url"), fallback_url(title)] if u))
    errors = []
    for url in urls:
        try:
            data = get_original(url)
            with Image.open(io.BytesIO(data)) as im:
                im.load()
                corrected = ImageOps.exif_transpose(im)
                entry["verified_image_dimensions"] = [corrected.width, corrected.height]
                entry["verified_image_format"] = im.format
                low = corrected.convert("RGB")
                low.thumbnail((1000, 1000), Image.Resampling.LANCZOS)
                lum = ImageStat.Stat(low.convert("L"))
                entry["descriptive_luma_mean"] = round(lum.mean[0], 2)
                entry["descriptive_luma_stddev"] = round(lum.stddev[0], 2)
                low.save(PREVIEWS / f"{object_id}.jpg", quality=90)
            filename = ORIGINALS / f"{object_id}.jpg"
            filename.write_bytes(data)
            entry.update({
                "original_pixels_accessed": True,
                "status": "ORIGINAL_BYTES_SAVED_PENDING_HUMAN_EDITORIAL_REVIEW",
                "downloaded_bytes": len(data),
                "sha256": hashlib.sha256(data).hexdigest(),
                "original_relative_path": str(filename.relative_to(OUTPUT)),
                "preview_relative_path": f"previews/{object_id}.jpg",
                "download_source": url,
            })
            break
        except (requests.RequestException, ValueError, OSError,
                Image.DecompressionBombError) as error:
            errors.append(str(error)[:220])
            if isinstance(error, requests.HTTPError) and error.response is not None and error.response.status_code == 429:
                rate_limited = True
                entry["status"] = "WIKIMEDIA_429_STOP_NO_RETRY"
                break
    if errors:
        entry["errors"] = errors
    outcomes.append(entry)
    print("B27_PIXEL", json.dumps({"id": object_id, "status": entry["status"]}), flush=True)
    if not rate_limited:
        time.sleep(4)

cellw, cellh, ncol = 465, 560, 3
sheet = Image.new("RGB", (ncol * cellw, 3 * cellh), "#080c12")
d = ImageDraw.Draw(sheet)
for i, e in enumerate(outcomes):
    x, y = (i % ncol) * cellw, (i // ncol) * cellh
    d.rounded_rectangle((x+6,y+6,x+cellw-6,y+cellh-6),
                        outline="#40464d", width=2, radius=11)
    preview = PREVIEWS / f"{e['object_id']}.jpg"
    if preview.exists():
        with Image.open(preview) as im:
            copied = im.copy()
            copied.thumbnail((cellw-25,cellh-120),Image.Resampling.LANCZOS)
            sheet.paste(copied, (x+(cellw-copied.width)//2,
                                 y+12+(cellh-122-copied.height)//2))
    else:
        d.text((x+36,y+220), "ORIGINAL NOT ACQUIRED", fill="#e5a67e")
    d.text((x+16,y+cellh-95), e["object_id"], fill="#e8e0d5")
    d.text((x+16,y+cellh-73), e["status"][:52], fill="#b9ad9e")
    if e.get("verified_image_dimensions"):
        d.text((x+16,y+cellh-50),
               str(e["verified_image_dimensions"]), fill="#b9ad9e")
sheet.save(OUTPUT / "contact_sheet_6_sources.jpg", quality=91)
report = {
    "schema": "AO_M6_B27_ORIGINAL_SOURCE_PIXEL_EVIDENCE_V1",
    "date": "2026-10-19", "audit_source": str(SOURCE.relative_to(ROOT)),
    "api_status": api_status, "original_sources_requested": len(PICKS),
    "originals_acquired": sum(e["original_pixels_accessed"] for e in outcomes),
    "rate_limited": rate_limited,
    "publication_approved": False,
    "visual_editorial_user_approved": False,
    "warning": "Acquisition proves file bytes, dimensions and objective source metadata only; not subjective photographic clarity, image isolation, or 1962 liturgical suitability.",
    "images": outcomes
}
(OUTPUT / "source_pixel_evidence.json").write_text(
    json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
cards = []
for e in outcomes:
    id_ = e["object_id"]
    img = (f'<a href="originals/{id_}.jpg"><img src="previews/{id_}.jpg" alt=""></a>'
           if e["original_pixels_accessed"] else "<p>Original unavailable</p>")
    cards.append(f'<article>{img}<h2>{html.escape(id_)}</h2>'
                 f'<p>{html.escape(e["status"])}</p>'
                 f'<p><a href="{html.escape(e["source_url"],quote=True)}">'
                 'Source and exact image licence</a></p></article>')
(OUTPUT / "index.html").write_text(
    '<!doctype html><html lang="en"><meta charset="utf-8"><title>M6 B27 Original Pixel QA</title>'
    '<style>body{background:#080c12;color:#e7dcc9;font:15px system-ui;margin:20px}'
    'section{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:16px}'
    'article{background:#131923;border:1px solid #334050;padding:15px;border-radius:12px}'
    'img{width:100%;max-height:360px;object-fit:contain}a{color:#d8bd8d}</style>'
    '<h1>B27 source originals: technical evidence, NOT publication approval</h1>'
    '<p>Six original image downloads sought. Individual rights preserved. No automatic object acceptance.</p><section>'
    + "".join(cards) + '</section></html>', encoding="utf-8")
print("B27_SUMMARY", json.dumps({k: report[k] for k in [
    "original_sources_requested", "originals_acquired", "rate_limited",
    "publication_approved"]}), flush=True)
