#!/usr/bin/env python3
"""Source-owned, zero-fee museum alternative for Prayer door D2.

Do NOT equate a Cleveland Museum of Art image file to the distinct Commons
binary in the published issue. Original Commons SHA-1 remains held until its
own bytes are independently checked. Never change artwork approvals or app.
"""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.parse import urlsplit
from PIL import Image,ImageOps

OUT=Path(os.environ.get("RUNNER_TEMP","/tmp"))/"prayer-d2-cma-original-qa"
OUT.mkdir(parents=True,exist_ok=True)
OBJECT_URL="https://openaccess-api.clevelandart.org/api/artworks/1996.26"
REPORT={
 "schema":"AO_PRAYER_D2_CMA_CC0_ORIGINAL_SOURCE_QA_V1",
 "slot":"DOOR-D2","artist":"Hendrik van Balen","work":"The Trinity",
 "museum":"Cleveland Museum of Art","accession":"1996.26",
 "independent_museum_source_not_equal_to_commons":True,
 "commons_original_sha1_not_recomputed":"77bc9079adbc7e66e241737813b2c7b4b2a9f40f",
 "productionEnabled":False,"artworkPhotoApproval":"HOLD","status":"NOT_STARTED"
}

def download(url,limit):
    u=urlsplit(url)
    if u.scheme!="https" or not (u.hostname or "").endswith(".clevelandart.org"):
        raise ValueError("Museum-domain HTTPS image required, got "+url)
    req=Request(url,headers={"User-Agent":"AdOrientem/2026.11 research artwork source audit (no contact or fees)","Accept":"application/json,image/jpeg,*/*"})
    with urlopen(req,timeout=40) as h:
        final=urlsplit(h.geturl())
        if final.scheme!="https" or not (final.hostname or "").endswith(".clevelandart.org"):
            raise ValueError("Museum image redirected outside trusted domain")
        chunks=[];size=0
        while True:
            b=h.read(1024*1024)
            if not b:break
            size+=len(b)
            if size>limit:raise ValueError("Museum file larger than bounded source limit")
            chunks.append(b)
        return b"".join(chunks),h.geturl()

try:
    raw,_=download(OBJECT_URL,2_000_000)
    info=json.loads(raw).get("data")
    if not isinstance(info,dict):raise ValueError("CMA API returned no object data")
    if info.get("accession_number")!="1996.26":raise ValueError("Museum accession changed")
    if info.get("title","").lower()!="the trinity":raise ValueError("Different artwork title")
    artists=info.get("creators") or []
    if "van balen" not in json.dumps(artists).lower():raise ValueError("Different artist in CMA record")
    if (info.get("share_license_status") or "").upper()!="CC0":raise ValueError("CMA image not CC0")
    images=info.get("images") or {}
    options=[(label,images.get(label)) for label in ("print","web","original")]
    variant,meta=next(((label,v) for label,v in options if isinstance(v,dict) and v.get("url")), (None,None))
    if not meta:raise ValueError("CMA offers no open access image URL")
    source_url=meta["url"]
    payload,actual_url=download(source_url,25_000_000)
    source_path=OUT/"d2-cleveland-museum-original.jpg"
    source_path.write_bytes(payload)
    with Image.open(source_path) as im:
        if im.format!="JPEG":raise ValueError("Museum source is not a JPEG")
        im.verify()
    with Image.open(source_path) as im:
        decoded=ImageOps.exif_transpose(im)
        w,h=decoded.size
        if w<1200 or h<1200:raise ValueError("Museum photo has insufficient dimensions")
        if not (w<h):raise ValueError("Expected portrait altarpiece orientation")
        preview=decoded.convert("RGB")
        preview.thumbnail((760,1100),Image.Resampling.LANCZOS)
        preview.save(OUT/"d2-review-only.jpg",quality=90,optimize=True)
    REPORT.update({
      "status":"SOURCE_BYTES_VERIFIED_BY_MUSEUM_API_REVIEW_ONLY",
      "rights":"CC0 confirmed by authoritative CMA source object",
      "source":actual_url,"apiObjectURL":OBJECT_URL,
      "recordUpdatedAt":info.get("updated_at"),
      "museumImageVariant":variant,"museumImageMetadata":meta,
      "bytes":len(payload),"pixels":[w,h],
      "sha1":hashlib.sha1(payload).hexdigest(),
      "sha256":hashlib.sha256(payload).hexdigest(),
      "sameBinaryAsLockedCommonsOriginal":hashlib.sha1(payload).hexdigest()==REPORT["commons_original_sha1_not_recomputed"],
      "reviewPreview":"d2-review-only.jpg"
    })
    print("D2_CMA_OPEN_ACCESS_SOURCE_VERIFIED",REPORT["bytes"],REPORT["pixels"],REPORT["sha256"])
except Exception as e:
    # Source failure is a HOLD, never a pass or an artistic approval.
    REPORT["status"]="SOURCE_UNREACHABLE_OR_INCONSISTENT_HOLD"
    REPORT["error"]=f"{type(e).__name__}: {e}"
    print("D2_CMA_SOURCE_HELD",REPORT["error"])
finally:
    (OUT/"d2-source-evidence.json").write_text(json.dumps(REPORT,indent=2,ensure_ascii=False)+"\n")
    # Deliberately exclude the large original from temporary public attachment.
    try:(OUT/"d2-cleveland-museum-original.jpg").unlink()
    except FileNotFoundError:pass
