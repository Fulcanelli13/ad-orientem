#!/usr/bin/env python3
"""Acquire six exact, source-verified original oil-painting scans from Commons.
Research artefact only: never change app, production art, curator ratings or rights.
All failures are explicit HOLDs, never a fallback to a different painting/photo.
"""
from __future__ import annotations

import hashlib
import html
import io
import json
import re
import time
from pathlib import Path
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "data/calendar/sacred-art-commons-six-strict-acquisition-20261013.v1.json"
OUT = ROOT / "artifacts/sacred-art-commons-six-originals"
ORIGINALS = OUT / "originals"
MAX_BYTES = 50_000_000
AGENT = "AdOrientemSacredArtCuration/1.0 (research; Wikimedia Commons file verification; GitHub public art project)"
HOSTS = {"commons.wikimedia.org", "upload.wikimedia.org"}

def fetch(url, cap=MAX_BYTES):
    last = None
    for i in range(3):
        try:
            parsed = urlparse(url)
            if parsed.scheme != "https" or parsed.hostname not in HOSTS:
                raise ValueError("Unexpected source hostname")
            with urlopen(Request(url, headers={"User-Agent":AGENT, "Accept":"application/json,image/jpeg,*/*"}), timeout=110) as response:
                final = urlparse(response.url)
                if final.scheme != "https" or final.hostname not in HOSTS:
                    raise ValueError("Disallowed redirect host")
                if int(response.headers.get("Content-Length") or 0) > cap:
                    raise ValueError("File exceeds maximum byte cap")
                body = response.read(cap + 1)
                if len(body) > cap:
                    raise ValueError("File exceeds maximum byte cap")
                return body
        except (HTTPError, URLError, OSError, TimeoutError) as exc:
            last = exc
            if isinstance(exc, HTTPError) and exc.code not in (429, 500, 502, 503, 504):
                break
            time.sleep(i*3 + 2)
    raise RuntimeError("Source download error: "+str(last)[:200])

def plain(value):
    return html.unescape(re.sub(r"<[^>]*>", " ", str(value or ""))).strip()

def check_one(item, queue, existing):
    lid = item["leadId"]
    row = queue.get(lid)
    if not row:
        raise ValueError("Unknown master lead")
    if row.get("newOriginalMasterAcquired") or row.get("numericUserRating") is not None:
        raise ValueError("Already acquired or has user rating; do not reacquire")
    if row.get("artist") != item["artist"] or not row.get("title", "").startswith(item["title"]):
        raise ValueError("Artwork title/artist mismatch against immutable source queue")
    if item["accession"] != row.get("accession") and row.get("accession"):
        raise ValueError("Museum accession mismatch with queue")
    for old in existing:
        if old.get("source", {}).get("objectUrl") == row.get("sourceUrl"):
            raise ValueError("Exact museum object already acquired in existing canonical collection")
    filename = item["commonsFile"]
    if not filename or "/" in filename or not filename.lower().endswith((".jpg",".jpeg")):
        raise ValueError("Invalid exact Wikimedia filename")
    q = urlencode({"action":"query","prop":"imageinfo","iiprop":"url|size|mime|sha1|extmetadata","titles":"File:"+filename,"format":"json","formatversion":2})
    meta = json.loads(fetch("https://commons.wikimedia.org/w/api.php?"+q, 4_000_000))
    pages = meta.get("query", {}).get("pages") or []
    if len(pages) != 1 or pages[0].get("missing") or not pages[0].get("imageinfo"):
        raise ValueError("Commons original file record does not exist")
    page = pages[0]
    if page.get("title", "").replace("_"," ") != "File:"+filename.replace("_"," "):
        raise ValueError("Commons returned a different page title")
    info = page["imageinfo"][0]
    uri = info.get("url") or ""
    if not uri.startswith("https://upload.wikimedia.org/") or "thumb/" in uri:
        raise ValueError("Not direct full-original Commons URL")
    if info.get("mime") != "image/jpeg":
        raise ValueError("Original not JPEG")
    ext = info.get("extmetadata") or {}
    license_name = plain((ext.get("LicenseShortName") or {}).get("value")).lower()
    licence_url = plain((ext.get("LicenseUrl") or {}).get("value"))
    restrictions = plain((ext.get("Restrictions") or {}).get("value"))
    if "cc by" in license_name or "copyright" in license_name or not (
        "public domain" in license_name or "cc0" in license_name or license_name in ("pd","pdm")
    ):
        raise ValueError("File-level Commons metadata does not confirm PD/CC0: "+license_name)
    if restrictions and not re.search(r"none|no restrictions", restrictions, flags=re.I):
        raise ValueError("File-level restrictions need human review: "+restrictions[:100])
    if (int(info.get("width") or 0), int(info.get("height") or 0)) != (
        item["expectedWidth"], item["expectedHeight"]
    ):
        raise ValueError("Commons exact original pixel dimensions changed; re-review file identity")
    pinned_sha1 = item.get("expectedCommonsSha1")
    if pinned_sha1 and str(info.get("sha1") or "").lower() != pinned_sha1.lower():
        raise ValueError("Commons SHA1 differs from independent previously published hash pin")
    if max(int(info.get("width") or 0),int(info.get("height") or 0)) < item["minLongSide"]:
        raise ValueError("Live source too low-resolution")
    body = fetch(uri)
    if len(body)<100_000 or not body.startswith(b"\xff\xd8\xff"):
        raise ValueError("Not credible original JPEG bytes")
    sha1=hashlib.sha1(body).hexdigest()
    if sha1.lower() != str(info.get("sha1") or "").lower():
        raise ValueError("Wikimedia Commons original SHA1 differs from downloaded bytes")
    with Image.open(io.BytesIO(body)) as image:
        image.load()
        if image.format != "JPEG":
            raise ValueError("Source file not JPEG after parsing")
        w,h=ImageOps.exif_transpose(image).size
    if max(w,h)<item["minLongSide"] or min(w,h)<item["expectedShortSideMin"]:
        raise ValueError("Transposed source pixels below accepted minimum")
    if sorted([w,h]) != sorted([int(info["width"]),int(info["height"])]):
        raise ValueError("Commons imageinfo dimensions do not match verified JPEG")
    sha256=hashlib.sha256(body).hexdigest()
    output = ORIGINALS/(lid+".jpg")
    output.write_bytes(body)
    return {
        "status":"ORIGINAL_ACQUIRED_RESEARCH_ONLY",
        "commonsFileTitle":page["title"],"commonsPage":item["commonsPage"],
        "fileUrl":uri,"commonsLicenseName":license_name,
        "commonsLicenseUrl":licence_url,
        "expectedOriginalDimensions":[item["expectedWidth"],item["expectedHeight"]],
        "expectedCommonsSha1":pinned_sha1,
        "museumReproductionRightsStatus":"MUSEUM_PHOTOGRAPHER_AND_EU_COMMERCIAL_RIGHTS_REVIEW_HOLD",
        "rights":"COMMONS_PD_DECLARED_US_JURISDICTION_AND_PROVIDER_COMMERCIAL_REVIEW_PENDING",
        "originalSha1Commons":sha1,"originalSha256":sha256,
        "width":w,"height":h,"bytes":len(body),
        "filename":str(output.relative_to(OUT)),
        "copyrightReview":"PENDING_PER_PHOTOGRAPH_AND_TARGET_COUNTRY",
    }

def main():
    manifest=json.loads(MANIFEST.read_text(encoding="utf-8"))
    if len(manifest["items"])!=6 or manifest.get("schema") != "AO_SACRED_ART_COMMONS_EXACT_SOURCE_ACQUISITION_6_V2":
        raise ValueError("Expected six V2 pin-protected source originals")
    for item in manifest["items"]:
        if not all(item.get(k) for k in ("expectedWidth","expectedHeight","expectedPhysicalSourceOrigin")):
            raise ValueError("Missing immutable expected original JPEG identity pin")
    master=json.loads((ROOT/manifest["master"]).read_text(encoding="utf-8"))
    queue={x["leadId"]:x for x in master["queue"]}
    existing=json.loads((ROOT/manifest["registry"]).read_text(encoding="utf-8"))["artworks"]
    ORIGINALS.mkdir(parents=True,exist_ok=True)
    results=[]
    for item in manifest["items"]:
        rec={"leadId":item["leadId"],"artist":item["artist"],"title":item["title"],
             "accession":item["accession"],"commonsFile":item["commonsFile"],
             "status":"NOT_ACQUIRED","rating":None,"artCuratorApproved":False,
             "mobileCropApproved":False,"productionApproved":False}
        try:
            rec.update(check_one(item, queue, existing))
            print("ACQUIRED",rec["leadId"],rec["width"],rec["height"],flush=True)
        except Exception as exc:
            rec.update(status="SOURCE_OR_RIGHTS_HELD",holdReason=str(exc)[:300])
            print("HELD",rec["leadId"],rec["holdReason"],flush=True)
        results.append(rec)
    report={"schema":"AO_SACRED_ART_COMMONS_EXACT6_ACQUISITION_RESULT_V1",
       "manifest":str(MANIFEST.relative_to(ROOT)),"requested":len(results),
       "acquired":sum(x["status"]=="ORIGINAL_ACQUIRED_RESEARCH_ONLY" for x in results),
       "results":results,"productionChanges":0,
       "note":"Research-only Wikimedia original scans: PD declaration is not blanket worldwide commercial image clearance."}
    (OUT/"acquisition.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("RESEARCH_ONLY",report["acquired"],"/",report["requested"],flush=True)

if __name__=="__main__":
    main()
