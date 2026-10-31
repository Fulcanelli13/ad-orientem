#!/usr/bin/env python3
"""Acquire one visually screened, exact-site Commons cover for Notre-Dame de Paris.

Source: CC BY-SA 4.0 original photograph by Chabe01, 17 September 2026.
Source image is a Gothic cathedral facade, not the Crown of Thorns relic.
No source image hotlink or bypass of source SHA1 / original bytes / rights checks.
Outputs a reviewed local WebP and one approved canonical Place record.
"""
from __future__ import annotations
import hashlib
import html
import io
import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
REG = ROOT / "data/geography/approved-place-media.v1.json"
OUT = ROOT / "assets/approved/place-media/FR-notre-dame-paris-2026.webp"
TITLE = "File:Cathédrale Notre Dame - Paris IV (FR75) - 2026-09-17 - 4.jpg"
SOURCE_SHA1 = "6524c0f5eaf0f0ddaae7d669a8cdf7d1123cf3c5"
PLACE = "place:FR:notre-dame-paris"
PAGE = "https://commons.wikimedia.org/wiki/File:" + urllib.parse.quote(TITLE[5:].replace(" ", "_"), safe="()_-")
UA = "AdOrientemSacredGeography/1.0 (https://github.com/Fulcanelli13/ad-orientem)"
LICENSE = "https://creativecommons.org/licenses/by-sa/4.0/"
MAX_BYTES = 20_000_000

def get(url: str) -> bytes:
    req=urllib.request.Request(url,headers={"User-Agent": UA,"Accept": "application/json,image/jpeg,image/png,image/webp,*/*"})
    with urllib.request.urlopen(req,timeout=45) as res:
        if urllib.parse.urlparse(res.url).scheme!="https":
            raise ValueError("Non-HTTPS redirect")
        length=res.headers.get("Content-Length")
        if length and int(length)>MAX_BYTES: raise ValueError("Unexpected large original")
        data=res.read(MAX_BYTES+1)
        if len(data)>MAX_BYTES: raise ValueError("Source exceeds safe file limit")
        return data

def clean(v: str)->str:
    return re.sub(r"<[^>]+>", "", html.unescape(v or "")).strip()

params=urllib.parse.urlencode({"action":"query","format":"json","formatversion":2,
    "titles":TITLE,"prop":"imageinfo","iiprop":"url|sha1|size|mime|extmetadata"})
q=json.loads(get("https://commons.wikimedia.org/w/api.php?"+params))
pages=q.get("query",{}).get("pages",[])
if len(pages)!=1 or pages[0].get("title")!=TITLE: raise ValueError("Exact Commons file title failed")
image=pages[0].get("imageinfo",[None])[0]
if not image: raise ValueError("No original Commons media")
ext=image.get("extmetadata",{})
artist=clean(ext.get("Artist",{}).get("value",""))
license_name=clean(ext.get("LicenseShortName",{}).get("value",""))
license_url=clean(ext.get("LicenseUrl",{}).get("value",""))
if "Chabe01" not in artist: raise ValueError("Photographer is not pinned source author: "+artist)
if "CC BY-SA 4.0"!=license_name or license_url!=LICENSE:
    raise ValueError("Expected original CC BY-SA 4.0 licence: "+repr((license_name,license_url)))
if image.get("mime")!="image/jpeg" or int(image.get("width",0))!=3492 or int(image.get("height",0))!=3212:
    raise ValueError("Unexpected original MIME / pixel identity")
if image.get("sha1")!=SOURCE_SHA1: raise ValueError("Commons original SHA1 changed")
url=image.get("url","")
if urllib.parse.urlparse(url).hostname!="upload.wikimedia.org": raise ValueError("Untrusted source original host")
raw=get(url)
raw_sha1=hashlib.sha1(raw).hexdigest()
if raw_sha1!=SOURCE_SHA1: raise ValueError("Downloaded original bytes failed source SHA1 verification")
original=Image.open(io.BytesIO(raw));original.load()
picture=ImageOps.exif_transpose(original).convert("RGB")
if picture.width!=3492 or picture.height!=3212: raise ValueError("Unexpected pixel orientation")
picture.thumbnail((1280,1280),Image.Resampling.LANCZOS)
OUT.parent.mkdir(parents=True,exist_ok=True)
picture.save(OUT,"WEBP",quality=87,method=6)
digest=hashlib.sha256(OUT.read_bytes()).hexdigest()
registry=json.loads(REG.read_text("utf-8"))
if any(x["place_id"]==PLACE for x in registry["items"]):
    raise ValueError("Notre-Dame has another cover already: do not overwrite it")
record={
    "place_id": PLACE,
    "status":"APPROVED",
    "asset_path":"assets/approved/place-media/FR-notre-dame-paris-2026.webp",
    "source_url":PAGE,
    "source_sha1":SOURCE_SHA1,
    "derivative_sha256":digest,
    "credit":"Chabe01",
    "license":"CC-BY-SA-4.0",
    "license_url":LICENSE,
    "rights_verified":True,
    "subject_verified":True,
    "crop_reviewed":True,
    "width":picture.width,
    "height":picture.height,
    "orientation":"portrait" if picture.height>picture.width else "landscape",
    "alt_en":"Notre-Dame de Paris cathedral after restoration, with western tower, Gothic nave and rebuilt spire, September 2026",
    "alt_fr":"Cathédrale Notre-Dame de Paris après restauration, avec tour occidentale, nef gothique et flèche reconstruite, septembre 2026",
    "changes_en":"Whole source photograph resized to fit 1,280 pixels and converted to WebP; no crop, recolouring or compositing.",
    "changes_fr":"Photographie intégrale redimensionnée à 1 280 pixels et convertie en WebP ; sans recadrage, recoloration ni montage.",
    "reviewed_at":"2026-10-31",
    "review_method":"Photograph visually screened for exact cathedral exterior and composition; Commons author, CC BY-SA 4.0, original image SHA-1, bytes and derivative SHA-256 verified.",
    "source_place_ref":"COMMONS_NOTRE_DAME_PARIS_2026_EXACT_SITE"
}
registry["items"].append(record)
registry["items"].sort(key=lambda x:x["place_id"])
REG.write_text(json.dumps(registry,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(json.dumps({"place_id":PLACE,"source_sha1":raw_sha1,"derivative_sha256":digest,
 "pixel_size":[picture.width,picture.height],"asset_bytes":OUT.stat().st_size,
 "original_sha1_verified":True,"rights_verified":True,"exact_site_verified":True},indent=2))
