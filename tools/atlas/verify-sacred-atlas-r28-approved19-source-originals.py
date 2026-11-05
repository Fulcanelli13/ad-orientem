#!/usr/bin/env python3
"""One-shot, read-only original-source audit for the 19 owner-selected photos.

Default: offline source identity contract, no network.
--verify-originals: sequentially queries the exact Wikimedia Commons source and
downloads its original ONLY after checking the current source metadata against
the user's pinned photo. No retries, no mirrors, no branch pushes, no publication.
Any HTTP 429 halts the entire batch. Derivatives are private temporary review
artifacts, not public Place cover assets.
"""
from __future__ import annotations
import argparse
import hashlib
import html
import io
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
MANIFEST=ROOT/"data/geography/research/sacred-atlas-r28-owner-approved19-source-lock-20261104.v1.json"
SOURCE=ROOT/"data/geography/research/sacred-atlas-round25-23place-64-original-review-20261104.json"
DEST=Path("/tmp/ao-sacred-atlas-owner-approved19")
COMMONS="https://commons.wikimedia.org/w/api.php"
UA="AdOrientem-SacredAtlas-ExactOwnerSelectionPreflight/1.0 (Github Fulcanelli13/ad-orientem; no retry; image QA)"
MAX_IMAGE_ORIGINAL_BYTES=20_000_000
MAX_IMAGE_PIXELS=40_000_000
MAX_THUMB_SIDE=1280
LAST=0.0

def load(path):return json.loads(path.read_text(encoding="utf-8"))
def clean(value):return " ".join(html.unescape(re.sub(r"<[^>]*>"," ",str(value or ""))).split())
def norm_license(url):
    parts=urllib.parse.urlsplit(str(url or ""))
    if parts.hostname!="creativecommons.org":return None
    return (parts.path.rstrip("/").removesuffix("/deed.en")).rstrip("/")

def assert_url(url,hostname):
    p=urllib.parse.urlsplit(url)
    if (p.scheme!="https" or p.hostname!=hostname or p.username or p.password
        or p.port not in (None,443)):
        raise ValueError("UNTRUSTED_EXTERNAL_URL")
    return url

def fetch(url,cap,host):
    global LAST
    assert_url(url,host)
    since=time.monotonic()-LAST if LAST else 1000
    if since<6:time.sleep(6-since)
    LAST=time.monotonic()
    req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"*/*"})
    with urllib.request.urlopen(req,timeout=50) as reply:
        assert_url(reply.geturl(),host)
        b=reply.read(cap+1)
        if len(b)>cap:raise ValueError("SOURCE_FILE_OR_METADATA_EXCEEDS_LIMIT")
        return b

def source_lookup(row):
    args=urllib.parse.urlencode({
       "action":"query","format":"json","formatversion":2,
       "prop":"imageinfo","iiprop":"url|sha1|size|mime|extmetadata",
       "titles":row["exact_original_file"]
    })
    data=json.loads(fetch(COMMONS+"?"+args,2_000_000,"commons.wikimedia.org"))
    pages=data.get("query",{}).get("pages",[])
    if len(pages)!=1 or pages[0].get("title")!=row["exact_original_file"]:
        raise ValueError("ORIGINAL_COMMONS_FILE_TITLE_CHANGED_OR_MISSING")
    infos=pages[0].get("imageinfo",[])
    if len(infos)!=1:raise ValueError("ORIGINAL_FILE_INFO_MISSING")
    return infos[0]

def verify(row,retain_verified_original=False):
    info=source_lookup(row)
    if info.get("sha1")!=row["original_sha1"]:
        raise ValueError("ORIGINAL_SOURCE_SHA1_DRIFT")
    if int(info.get("size",0))!=row["original_bytes"]:
        raise ValueError("ORIGINAL_SOURCE_BYTE_SIZE_DRIFT")
    if info.get("mime")!="image/jpeg":raise ValueError("EXPECTED_ORIGINAL_JPEG")
    w,h=int(info.get("width") or 0),int(info.get("height") or 0)
    expected=row["pixel_dimensions"]
    if all(isinstance(x,int) for x in expected) and [w,h]!=expected:
        raise ValueError("ORIGINAL_PIXEL_DIMENSIONS_CHANGED")
    if min(w,h)<640 or w*h>MAX_IMAGE_PIXELS or row["original_bytes"]>MAX_IMAGE_ORIGINAL_BYTES:
        raise ValueError("ORIGINAL_IMAGE_DIMENSION_OR_SIZE_UNSAFE")
    xmeta=info.get("extmetadata") or {}
    nowlicense=clean(xmeta.get("LicenseUrl",{}).get("value"))
    if norm_license(nowlicense)!=norm_license(row["license_url"]):
        raise ValueError("ORIGINAL_COMMONS_LICENCE_URL_CHANGED")
    artist=clean(xmeta.get("Artist",{}).get("value"))
    expected_artist=row["source_author"].split(" - ")[0].split(" (")[0].strip()
    if expected_artist.casefold() not in artist.casefold():
        raise ValueError("CURRENT_ARTIST_DOES_NOT_MATCH_FROZEN_CREDIT")
    original_url=assert_url(str(info.get("url") or ""),"upload.wikimedia.org")
    orig=fetch(original_url,MAX_IMAGE_ORIGINAL_BYTES,"upload.wikimedia.org")
    if len(orig)!=row["original_bytes"] or hashlib.sha1(orig).hexdigest()!=row["original_sha1"]:
        raise ValueError("DOWNLOAD_BYTES_DO_NOT_MATCH_FROZEN_SHA1")
    from PIL import Image, ImageOps
    Image.MAX_IMAGE_PIXELS=MAX_IMAGE_PIXELS
    with Image.open(io.BytesIO(orig)) as image:
        if image.format!="JPEG":raise ValueError("JPEG_DECODER_FORMAT_MISMATCH")
        decoded=ImageOps.exif_transpose(image)
        if sorted(decoded.size)!=sorted((w,h)):raise ValueError("DECODER_PIXEL_DIMENSIONS_MISMATCH")
        preview=decoded.convert("RGB")
    preview.thumbnail((MAX_THUMB_SIDE,MAX_THUMB_SIDE),Image.Resampling.LANCZOS)
    output=io.BytesIO()
    preview.save(output,format="WEBP",quality=82,method=5)
    bytes_out=output.getvalue()
    name=hashlib.sha256((row["place_id"]+"\0"+row["exact_original_file"]).encode()).hexdigest()[:22]
    path=DEST/"previews"/("r28-"+name+".webp")
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_bytes(bytes_out)
    # Only an explicit operator-run verification may retain the original JPEG.
    # This remains an ephemeral CI artifact; never an approved public asset.
    original_path=None
    if retain_verified_original:
        target=DEST/"originals"/(row["original_sha1"]+".jpg")
        target.parent.mkdir(parents=True,exist_ok=True)
        target.write_bytes(orig)
        if target.stat().st_size!=row["original_bytes"] or hashlib.sha1(target.read_bytes()).hexdigest()!=row["original_sha1"]:
            target.unlink(missing_ok=True)
            raise ValueError("RETAINED_ORIGINAL_BYTES_FAILED_SECOND_SHA1_CHECK")
        original_path=str(target.relative_to(DEST))
    return {
       "result":"ORIGINAL_BYTES_VERIFIED_TEMP_PREVIEW_ONLY",
       "current_author":artist,"current_license_url":nowlicense,
       "original_pixel_dimensions":[w,h],
       "original_sha1":row["original_sha1"],
       "original_bytes":len(orig),
       "preview_webp_sha256":hashlib.sha256(bytes_out).hexdigest(),
       "preview_webp_path":path.name,
       "preview_pixel_dimensions":list(preview.size),
       "retained_original_path":original_path,
       "rights_and_site_publication_cleared":False,
       "production_cover_record_created":False
    }

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--verify-originals",action="store_true")
    ap.add_argument("--retain-verified-originals",action="store_true",
                    help="Manually opted-in: keep checksum-verified JPEGs under temporary artifacts, never in public site")
    ap.add_argument("--start-index",type=int,default=0,help="Zero-based first frozen owner selection")
    ap.add_argument("--max-files",type=int,default=19,help="Number of frozen selections in this single pass")
    args=ap.parse_args()
    if args.retain_verified_originals and not args.verify_originals:
        ap.error("--retain-verified-originals requires --verify-originals")
    if not (0<=args.start_index<19 and 1<=args.max_files<=19 and args.start_index+args.max_files<=19):
        ap.error("Requested selection range must fit inside the 19 frozen originals")
    m=load(MANIFEST);src=load(SOURCE)
    assert m["schema"]=="AO_SACRED_ATLAS_R28_OWNER_APPROVED_19_EXACT_ORIGINALS_V1"
    assert m["publication"]=="FROZEN_OWNER_EDITORIAL_ONLY_NOT_YET_RIGHTS_OR_RELEASE_CLEARED"
    assert len(m["decisions"])==19 and m["counts"]["place_holds"]==1
    assert len(m["unreviewed_places"])==3 and m["counts"]["cover_photos_published"]==0
    lookup={p["place_id"]:p for p in src["places"]}
    for item in m["decisions"]:
        matches=[x for x in lookup[item["place_id"]]["images"] if
                 x["file"]==item["exact_original_file"] and
                 x["sha1"]==item["original_sha1"] and
                 x["role"]=="COVER_CANDIDATE" and x["byte_verified"]]
        assert len(matches)==1,"SOURCE_LOCK_MISMATCH"
        assert not item["publication_authorized"]
        assert not item["release_rights_passed"]
    if not args.verify_originals:
        print("R28 OFFLINE CONTRACT: 19 exact owner-approved originals, 1 HOLD, 3 not reviewed. NO downloads/publication.")
        return 0
    # A single unthrottled source pass; no retries, no continuation after rate limiting.
    DEST.mkdir(parents=True,exist_ok=True)
    results=[]
    subset=m["decisions"][args.start_index:args.start_index+args.max_files]
    for index,item in enumerate(subset,args.start_index+1):
        print(f"Source {index}/19 {item['place_id']}",flush=True)
        try:
            outcome=verify(item,retain_verified_original=args.retain_verified_originals)
        except urllib.error.HTTPError as exc:
            if exc.code==429:
                results.append({"place_id":item["place_id"],"result":"STOP_HTTP_429_WIKIMEDIA_RATE_LIMIT"})
                break
            results.append({"place_id":item["place_id"],"result":"SOURCE_HTTP_ERROR", "http_code":exc.code})
            # Do not switch hosts or bypass source errors
            break
        except Exception as exc:
            results.append({"place_id":item["place_id"],"result":"HOLD_VERIFICATION_FAILURE","reason":str(exc)})
            continue
        results.append({"place_id":item["place_id"],**outcome})
    all_19=args.start_index==0 and args.max_files==19 and len(results)==19 and all(x["result"]=="ORIGINAL_BYTES_VERIFIED_TEMP_PREVIEW_ONLY" for x in results)
    report={
       "schema":"AO_R28_SELECTED19_SOURCE_BINARY_PREFLIGHT_REPORT_V1",
       "source_export_sha256":m["source_export_sha256"],
       "user_selected":19,
       "source_attempts":len(results),
       "selection_start_index":args.start_index,
       "selection_requested":args.max_files,
       "retained_originals":sum(bool(x.get("retained_original_path")) for x in results),
       "retained_originals_ephemeral_only":True,
       "originals_verified":sum(x["result"]=="ORIGINAL_BYTES_VERIFIED_TEMP_PREVIEW_ONLY" for x in results),
       "stopped_due_to_wikimedia_429":any(x["result"]=="STOP_HTTP_429_WIKIMEDIA_RATE_LIMIT" for x in results),
       "original_all_19_verified":all_19,
       "source_rights_and_crop_final_approval":False,
       "photos_published":0,
       "results":results
    }
    (DEST/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print(json.dumps({k:v for k,v in report.items() if k!="results"},ensure_ascii=False),flush=True)
    return 0

if __name__=="__main__":sys.exit(main())
