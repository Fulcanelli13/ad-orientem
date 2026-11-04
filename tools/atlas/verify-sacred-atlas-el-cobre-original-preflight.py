#!/usr/bin/env python3
"""Read-only exact-original byte preflight for one already-selected El Cobre photo.

Never creates an approved media record, updates a public asset, substitutes a
different Commons file, or bypasses HTTP 429. Outputs a temporary review
preview/report for subsequent manual subject, crop and rights adjudication.
"""
from __future__ import annotations
import hashlib
import html
import io
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parents[2]
M=ROOT/"data/geography/research/sacred-atlas-selected34-existing-photo-recovery-20261104.v1.json"
D=ROOT/"data/geography/research/photo-finder-20261030/decisions.json"
G=ROOT/"data/geography/seed-registry.v1.json"
C=ROOT/"data/geography/approved-place-media.v1.json"
P=ROOT/"data/geography/approved-place-gallery.v1.json"
API="https://commons.wikimedia.org/w/api.php"
AGENT="AdOrientemElCobrePhotoResearch/2026-11-04 (one source only, rate-limited, no public release)"
Image.MAX_IMAGE_PIXELS=65_000_000
CALLS=[0.]
MAX_CALLS=2

def read(p):return json.loads(p.read_text(encoding="utf-8"))
def simple(s):return " ".join(html.unescape(re.sub(r"<[^>]+>"," ",str(s or ""))).split())
def trusted(url,allowed):
    u=urllib.parse.urlsplit(str(url or ""))
    if u.scheme!="https" or u.hostname not in allowed or u.username or u.password or u.port not in (None,443):
        raise ValueError("UNTRUSTED_OR_REDIRECTED_ORIGINAL_URL")
    return url
def fetch(url,limit,allowed):
    trusted(url,allowed)
    if len(CALLS)>MAX_CALLS:raise ValueError("EXCEEDED_TWO_SOURCE_REQUESTS")
    if CALLS[-1]:
        wait=6-(time.monotonic()-CALLS[-1])
        if wait>0:time.sleep(wait)
    CALLS.append(time.monotonic())
    req=urllib.request.Request(url,headers={"User-Agent":AGENT,"Accept":"*/*"})
    with urllib.request.urlopen(req,timeout=55) as response:
        trusted(response.geturl(),allowed)
        body=response.read(limit+1)
        if len(body)>limit:raise ValueError("SOURCE_SIZE_LIMIT")
        return body

def main():
    master=read(M);spec=master["next_executable_preflight"]
    assert master["schema"]=="AO_SACRED_ATLAS_SELECTED_34_EXISTING_IMAGE_RECOVERY_V1"
    assert master["scope"]=="RESEARCH_ONLY_NO_PHOTO_APPROVAL"
    assert master["counts"]["new_media_approved"]==0
    assert spec["place_id"]=="place:CU:el-cobre-caridad-basilica"
    assert spec["source_title"]=="File:De extremo a extremo, Santuario Nacional de la Virgen del Cobre - panoramio.jpg"
    assert spec["source_sha1"]=="8b1bb3dd61b0ae12eab1e4ec2f55dd8645ffb114"
    assert spec["source_revision_id"]==1197765293
    assert spec["source_dimensions"]==[4544,2545]
    assert spec["source_byte_max"]<=32_000_000
    assert spec["decoder_max_pixels"]<=65_000_000
    assert not spec["publication_authorized"]
    decisions=read(D)["decisions"]
    places={x["place_id"]:x for x in read(G)["places"]}
    covers=read(C)["items"];gallery=read(P)["items"]
    assert len(places)==530 and len(covers)>=379 and len(gallery)==42
    assert not any(x["place_id"]==spec["place_id"] for x in covers)
    assert decisions[spec["place_id"]]["files"][0]==spec["source_title"]
    assert places[spec["place_id"]]["photo_editorial"]["cover_commons_file"]==spec["source_title"]
    assert places[spec["place_id"]]["photo_editorial"]["decision"]=="SELECTED"
    assert not any(x.get("source_sha1")==spec["source_sha1"] for x in covers)
    report={"schema":"AO_SACRED_ATLAS_EL_COBRE_ORIGINAL_PREFLIGHT_V1",
        "scope":"RESEARCH_ONLY_NO_ASSET_OR_APPROVAL","place_id":spec["place_id"],
        "commons_title":spec["source_title"],"expected_sha1":spec["source_sha1"],
        "verified":False,"publication_authorized":False,
        "status":"NOT_ATTEMPTED",
        "preview_path":None,
        "source_request_count":0}
    result_path=Path(spec["report_path"])
    result_path.parent.mkdir(parents=True,exist_ok=True)
    try:
        params=urllib.parse.urlencode({"action":"query","format":"json","formatversion":"2",
            "titles":spec["source_title"],"prop":"imageinfo|revisions",
            "iiprop":"url|size|sha1|mime|extmetadata",
            "rvprop":"ids|content","rvslots":"main","rvlimit":1})
        payload=json.loads(fetch(API+"?"+params,2_000_000,{"commons.wikimedia.org"}))
        pages=payload.get("query",{}).get("pages",[])
        if len(pages)!=1 or pages[0].get("title")!=spec["source_title"] or not pages[0].get("imageinfo"):
            raise ValueError("ORIGINAL_TITLE_NOT_EXACT_OR_NOT_AVAILABLE")
        page=pages[0];info=page["imageinfo"][0]
        rev=(page.get("revisions") or [{}])[0]
        sha=str(info.get("sha1") or "").lower()
        size=int(info.get("size") or 0)
        w=int(info.get("width") or 0);h=int(info.get("height") or 0)
        if rev.get("revid")!=spec["source_revision_id"]:
            raise ValueError("DESCRIPTION_REVISION_CHANGED")
        if sha!=spec["source_sha1"] or [w,h]!=spec["source_dimensions"]:
            raise ValueError("ORIGINAL_FILE_SHA1_OR_DIMENSIONS_CHANGED")
        if not 1000<size<=spec["source_byte_max"] or min(w,h)<650 or w*h>spec["decoder_max_pixels"]:
            raise ValueError("ORIGINAL_TOO_LARGE_OR_TOO_SMALL_FOR_PINNED_DECODER")
        if info.get("mime")!="image/jpeg":
            raise ValueError("NOT_PINNED_JPEG_MIME")
        meta=info.get("extmetadata") or {}
        get=lambda k:simple((meta.get(k) or {}).get("value"))
        artist=get("Artist")
        lic=get("LicenseShortName")
        licence_url=get("LicenseUrl")
        if "DnTrotaMundos" not in artist:
            raise ValueError("ORIGINAL_PHOTOGRAPHER_CHANGED")
        if lic.casefold().replace("-"," ").strip()!="cc by 3.0":
            raise ValueError("PHOTOGRAPH_LICENSE_CHANGED")
        path=urllib.parse.urlsplit(licence_url)
        if (path.scheme not in ("https","http") or path.hostname!="creativecommons.org"
                or path.path.rstrip("/")!="/licenses/by/3.0"):
            raise ValueError("PHOTOGRAPH_LICENSE_LEGAL_CODE_CHANGED")
        wiki=str(rev.get("slots",{}).get("main",{}).get("content") or rev.get("content") or "")
        if re.search(r"\{\{\s*(?:copyvio|no permission|delete|fop-|derivative|artwork)\b",wiki,re.I):
            raise ValueError("SOURCE_DESCRIPTION_COPYRIGHT_WARNING")
        url=trusted(info.get("url"),{"upload.wikimedia.org"})
        original=fetch(url,spec["source_byte_max"],{"upload.wikimedia.org"})
        if len(original)!=size or hashlib.sha1(original).hexdigest()!=sha:
            raise ValueError("ORIGINAL_BYTES_SHA1_OR_LENGTH_MISMATCH")
        with Image.open(io.BytesIO(original)) as pic:
            if pic.format not in ("JPEG","MPO"):
                raise ValueError("ORIGINAL_DECODE_FORMAT_NOT_JPEG")
            corrected=ImageOps.exif_transpose(pic)
            if (w,h) not in (pic.size,corrected.size):
                raise ValueError("ORIGINAL_PIXEL_DIMENSIONS_DIFFER")
            corrected=corrected.convert("RGB")
        corrected.thumbnail((1280,1280),Image.Resampling.LANCZOS)
        preview=io.BytesIO()
        corrected.save(preview,format="WEBP",quality=84,method=6)
        data=preview.getvalue()
        if len(data)<3000 or data[:4]!=b"RIFF" or data[8:12]!=b"WEBP":
            raise ValueError("INVALID_REVIEW_PREVIEW")
        preview_path=Path(spec["preview_path"])
        preview_path.write_bytes(data)
        report.update({"verified":True,"status":"ORIGINAL_BYTES_VERIFIED_PREVIEW_ONLY",
            "source_request_count":len(CALLS)-1,
            "current_original_sha1":sha,"current_revision_id":rev["revid"],
            "original_bytes":size,"original_dimensions":[w,h],
            "photographer":artist,"photo_license":lic,"photo_license_url":licence_url,
            "original_sha256":hashlib.sha256(original).hexdigest(),
            "preview_path":str(preview_path),"preview_sha256":hashlib.sha256(data).hexdigest(),
            "preview_dimensions":list(corrected.size),
            "manual_holds":["SOURCE_WATERMARK_DANI2010_LOWER_RIGHT_CROP_OR_ALT_EDITORIAL_HOLD","SUBJECT_AND_PHONE_CROP","UNDERLYING_ARCHITECTURAL_RIGHTS_CONFIRMATION","EDITORIAL_PUBLICATION_APPROVAL"]})
    except urllib.error.HTTPError as err:
        # Respect Commons 429: one attempt only, no proxy/endpoint/identity rotation.
        report.update({"status":"HOLD_HTTP_"+str(err.code),"error":str(err)[:180],
            "source_request_count":len(CALLS)-1})
    except Exception as err:
        report.update({"status":"HOLD_"+type(err).__name__.upper(),"error":str(err)[:250],
            "source_request_count":len(CALLS)-1})
    result_path.write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print("SACRED_ATLAS_EL_COBRE_SOURCE_PREFLIGHT",json.dumps({
        k:report[k] for k in ("place_id","status","verified","publication_authorized","source_request_count")
    },ensure_ascii=False),flush=True)
    # No pass means the result remains a documented hold; never treat as an image release.
    # Return a nonzero exit code for unexpected integrity/licence failures, but a transient
    # HTTP 429 remains a retriable hold under a later separately authorized run.
    if not report["verified"] and report["status"]!="HOLD_HTTP_429":
        raise SystemExit(1)

if __name__=="__main__":main()
