#!/usr/bin/env python3
"""Single exact-source water-cruet original-pixel acquisition; research only."""
import hashlib, io, json, html, re
from pathlib import Path
from urllib.parse import quote
import requests
from PIL import Image, ImageOps
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/"previews/visible-mass-3d/M6_B27_EQ02_KRAKOW_WATER_CRUET_RESEARCH_20261019.v1.json"
OUT=ROOT/"dist/visible-mass/m6-b27-water-cruet"
OUT.mkdir(parents=True,exist_ok=True)
meta=json.loads(SRC.read_text())
title="File:Kraków Late gothic water cruet.jpg"
session=requests.Session()
session.headers.update({"User-Agent":"AdOrientem-M6B27-Cruet-SourceResearch/0.1 (Catholic photo provenance only)"})
result={"object_id":"EQ02","source_url":meta["source_url"],"original_requested":1,
        "original_saved":False,"publication_approved":False,"user_approved":False}
try:
    r=session.get("https://commons.wikimedia.org/w/api.php",params={
      "action":"query","format":"json","formatversion":2,"titles":title,
      "prop":"imageinfo","iiprop":"url|size|mime|extmetadata"},timeout=(12,45))
    r.raise_for_status()
    page=r.json()["query"]["pages"][0]
    info=page["imageinfo"][0]
    em=info.get("extmetadata") or {}
    get=lambda key:html.unescape(re.sub("<[^>]+>","",em.get(key,{}).get("value","")))
    result.update(source_api_title=page.get("title"),source_api_license=get("LicenseShortName"),
                  source_api_license_url=get("LicenseUrl"),
                  source_api_dimensions=[info["width"],info["height"]])
    if get("LicenseShortName").lower() not in ["cc0","public domain"]:
        raise ValueError("Exact source photo licence unverified")
    with session.get(info["url"],timeout=(15,100),stream=True) as response:
        response.raise_for_status()
        if not response.headers.get("content-type","").lower().startswith("image/"):
            raise ValueError("Not an image")
        raw=bytearray()
        for chunk in response.iter_content(65536):
            raw.extend(chunk)
            if len(raw)>12*1024*1024: raise ValueError("Original >12MiB")
    with Image.open(io.BytesIO(raw)) as f:
        f.load()
        im=ImageOps.exif_transpose(f).convert("RGB")
        result["actual_dimensions"]=[im.width,im.height]
        preview=im.copy()
        preview.thumbnail((1200,1200),Image.Resampling.LANCZOS)
        preview.save(OUT/"eq02_preview.jpg",quality=91)
    if result["actual_dimensions"]!=result["source_api_dimensions"]:
        raise ValueError("Source dimensions mismatch")
    (OUT/"eq02_original.jpg").write_bytes(raw)
    result.update(original_saved=True,sha256=hashlib.sha256(raw).hexdigest(),
                  bytes=len(raw),status="ORIGINAL_ACQUIRED_SUBJECT_TO_HUMAN_ISOLATION_REVIEW")
except Exception as e:
    result.update(status="SOURCE_UNAVAILABLE_OR_RIGHTS_HOLD",error=str(e)[:280])
(OUT/"source_evidence.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
print("B27_EQ02",json.dumps(result,ensure_ascii=False),flush=True)
