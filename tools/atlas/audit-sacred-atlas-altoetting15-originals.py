#!/usr/bin/env python3
"""One controlled Wikimedia Commons metadata/original-byte audit for Altötting's 15 files.

Input: exact-category source list in AO Round 18 ledger.
Output: short-lived JSON evidence only. No modifications to approved cover registry,
no thumbnails in git, no retry/429 circumvention. Download bytes into hash only.
"""
import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
import html
import json
from pathlib import Path
import re
import time
from urllib.parse import urlencode, urlsplit
import urllib.error
import urllib.request

ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/"data/geography/research/sacred-atlas-round18-30-geotagged-curated-triage-20261104.v1.json"
OUT=Path("/tmp/ao-sacred-atlas-round19-altoetting15-original-evidence.json")
API="https://commons.wikimedia.org/w/api.php"
USER_AGENT="AdOrientemSacredAtlasRound19/2026-11-04 (https://github.com/Fulcanelli13/ad-orientem; read-only original integrity, rate-limit respectful)"
MAX_ORIGINAL_BYTES=24_000_000
MAX_METADATA_BYTES=5_000_000
MIN_SPACING_SECONDS=10.0
ALLOWED_MIME={"image/jpeg","image/png","image/webp"}
CC=re.compile(r"^https://creativecommons\.org/licenses/(by|by-sa)/(2\.0|2\.5|3\.0|4\.0)/?$")

def clean(value):
    return " ".join(html.unescape(re.sub("<[^>]+>"," ",str(value or ""))).split())[:700]

def check_host(url, expected):
    p=urlsplit(url)
    return p.scheme=="https" and p.hostname==expected and p.port in (None,443) and p.username is None and p.password is None

def request_metadata(titles):
    q=urlencode({"action":"query","format":"json","formatversion":"2",
                 "titles":"|".join(titles),"prop":"imageinfo",
                 "iiprop":"url|size|sha1|mime|extmetadata","iilimit":"1"})
    url=API+"?"+q
    if not check_host(url,"commons.wikimedia.org"):raise ValueError("Invalid API host")
    req=urllib.request.Request(url,headers={"User-Agent":USER_AGENT,"Accept":"application/json"})
    with urllib.request.urlopen(req,timeout=60) as r:
        if not check_host(r.geturl(),"commons.wikimedia.org"):raise ValueError("Unsafe API redirect")
        data=r.read(MAX_METADATA_BYTES+1)
    if len(data)>MAX_METADATA_BYTES:raise ValueError("Metadata oversized")
    payload=json.loads(data)
    if payload.get("error"):raise ValueError("Commons API error: "+str(payload["error"])[:160])
    return {p["title"]:p for p in payload.get("query",{}).get("pages",[])}

def hash_original(url):
    if not check_host(url,"upload.wikimedia.org"):raise ValueError("Untrusted original host")
    req=urllib.request.Request(url,headers={"User-Agent":USER_AGENT,"Accept":"image/*"})
    with urllib.request.urlopen(req,timeout=75) as r:
        if not check_host(r.geturl(),"upload.wikimedia.org"):raise ValueError("Unsafe original redirect")
        advertised=int(r.headers.get("Content-Length") or 0)
        if advertised>MAX_ORIGINAL_BYTES:raise ValueError("Original too large according to server")
        h=hashlib.sha1()
        size=0
        while True:
            chunk=r.read(256*1024)
            if not chunk:break
            size+=len(chunk)
            if size>MAX_ORIGINAL_BYTES:raise ValueError("Actual original too large")
            h.update(chunk)
    return size,h.hexdigest()

def sources():
    doc=json.loads(SRC.read_text(encoding="utf8"))
    s=doc["exact_site_category"]
    if s["place_id"]!="place:DE:friedhofskirche-st-michael-altoetting":raise ValueError("Wrong exact Place ID")
    files=s["files"]
    if len(files)!=15 or len({f["source_title"] for f in files})!=15:raise ValueError("Must be exact 15 unique source files")
    for f in files:
        if not f["source_title"].startswith("File:Friedhofskirche Altötting "):raise ValueError("File outside exact series")
        if not re.fullmatch(r"[0-9a-f]{40}",f["current_sha1_claim"]):raise ValueError("Pinned source sha missing")
    return files

def run(files, meta, digest=hash_original, sleep=time.sleep):
    result=[];rate_limit=False
    for idx,f in enumerate(files):
        r={"place_id":"place:DE:friedhofskirche-st-michael-altoetting",
           "source_title":f["source_title"],"source_page":f["source_page"],
           "prior_source_sha1":f["current_sha1_claim"],
           "current_source_sha1":None,"sha1_from_original_bytes":None,
           "original_bytes_verified":False,"license_metadata_check":False,
           "exact_cover_subject_verified":False,"user_selected":False,
           "rights_fully_cleared":False,"published":False}
        if rate_limit:
            r["status"]="PAUSED_AFTER_COMMONS_429"
            result.append(r);continue
        page=meta.get(f["source_title"],{})
        image=(page.get("imageinfo") or [None])[0]
        if page.get("missing") or not image:
            r["status"]="HOLD_SOURCE_MISSING"
            result.append(r);continue
        ext=image.get("extmetadata") or {}
        field=lambda name:clean((ext.get(name) or {}).get("value"))
        sha=image.get("sha1")
        size=int(image.get("size") or 0)
        width=int(image.get("width") or 0)
        height=int(image.get("height") or 0)
        author=field("Artist")
        license=field("LicenseShortName")
        license_url=field("LicenseUrl")
        mime=image.get("mime")
        r.update({"current_source_sha1":sha,"size_bytes_claim":size,
                  "original_dimensions":[width,height],"mime":mime,
                  "photographer":author,"license_short_name":license,
                  "license_url":license_url,"file_description_url":image.get("descriptionurl")})
        if sha!=f["current_sha1_claim"]:
            r["status"]="HOLD_SOURCE_REVISION_CHANGED"
        elif mime not in ALLOWED_MIME or width<1024 or height<768 or size>MAX_ORIGINAL_BYTES or size<50000:
            r["status"]="HOLD_SOURCE_FORMAT_OR_SIZE"
        elif not author or not CC.fullmatch(license_url.rstrip("/")+"/"):
            r["status"]="HOLD_SOURCE_ATTRIBUTION_OR_LICENCE"
        else:
            r["license_metadata_check"]=True
            url=image.get("url","")
            if not check_host(url,"upload.wikimedia.org"):
                r["status"]="HOLD_UNTRUSTED_UPLOAD_URL"
            else:
                try:
                    sleep(MIN_SPACING_SECONDS)
                    count,actual_sha=digest(url)
                    r["sha1_from_original_bytes"]=actual_sha
                    r["original_download_bytes"]=count
                    if actual_sha==sha and count==size:
                        r["status"]="ORIGINAL_INTEGRITY_PASS_EDITORIAL_CROP_RIGHTS_PENDING"
                        r["original_bytes_verified"]=True
                    else:r["status"]="HOLD_DIGEST_OR_SIZE_MISMATCH"
                except urllib.error.HTTPError as e:
                    r["status"]="HOLD_HTTP_"+str(e.code)
                    if e.code==429:rate_limit=True
                except Exception as e:
                    r["status"]="HOLD_ORIGINAL_"+type(e).__name__.upper()
                    r["exception_summary"]=str(e)[:120]
        result.append(r)
        print("ALTOETTING_ORIGINAL",json.dumps({"title":r["source_title"],"status":r["status"]}),flush=True)
    return result

def selftest():
    x=[{"source_title":"File:Friedhofskirche Altötting 1.jpg",
        "source_page":"https://commons.wikimedia.org/wiki/File:test","current_sha1_claim":"a"*40}]
    meta={"File:Friedhofskirche Altötting 1.jpg":{"title":x[0]["source_title"],
          "imageinfo":[{"sha1":"a"*40,"size":150000,"width":2000,"height":1200,
            "mime":"image/jpeg","url":"https://upload.wikimedia.org/valid.jpg",
            "extmetadata":{"Artist":{"value":"Photographer Example"},
                           "LicenseShortName":{"value":"CC BY-SA 4.0"},
                           "LicenseUrl":{"value":"https://creativecommons.org/licenses/by-sa/4.0/"}}}]}}
    r=run(x,meta,digest=lambda u:(150000,"a"*40),sleep=lambda x:None)
    assert r[0]["original_bytes_verified"]
    assert not r[0]["rights_fully_cleared"] and not r[0]["published"] and not r[0]["user_selected"]
    changed=[{**x[0],"current_sha1_claim":"b"*40}]
    r=run(changed,meta,digest=lambda _:(_ for _ in ()).throw(AssertionError("never download")),sleep=lambda _:None)
    assert r[0]["status"]=="HOLD_SOURCE_REVISION_CHANGED"
    assert not check_host("http://upload.wikimedia.org/file","upload.wikimedia.org")
    assert not check_host("https://elsewhere.example/file","upload.wikimedia.org")

def main():
    a=argparse.ArgumentParser()
    a.add_argument("--self-test",action="store_true")
    a.add_argument("--dry-run",action="store_true")
    opts=a.parse_args()
    if opts.self_test:
        selftest();print("ALTOETTING_SELFTEST_PASS");return
    files=sources()
    if opts.dry_run:
        print(json.dumps({"expected_files":len(files),"metadata_batches":0,"original_bytes_downloaded":0,"published":0}));return
    try:
        meta=request_metadata([f["source_title"] for f in files])
        records=run(files,meta)
    except Exception as e:
        records=[{"place_id":"place:DE:friedhofskirche-st-michael-altoetting",
                  "source_title":f["source_title"],"status":"HOLD_METADATA_"+type(e).__name__.upper(),
                  "original_bytes_verified":False,"published":False} for f in files]
    summary={"total":len(records),"originals_verified":sum(bool(r["original_bytes_verified"]) for r in records),
             "rights_metadata_pass":sum(bool(r.get("license_metadata_check")) for r in records),
             "status_counts":dict(Counter(r["status"] for r in records)),"user_approved":0,"published":0}
    result={"schema":"AO_SACRED_ATLAS_ROUND19_ALTOETTING15_ORIGINAL_SOURCE_AUDIT_V1",
            "as_of_utc":datetime.now(timezone.utc).isoformat(),
            "scope":"READ_ONLY_ORIGINAL_INTEGRITY_NOT_RIGHTS_APPROVAL_NOT_MEDIA_PUBLISHING",
            "run_policy":"One bounded Commons metadata query plus serial original hashes with >=10s spacing; stop on 429, no retries. Original bytes discarded.",
            "summary":summary,"rows":records}
    OUT.write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    print("ALTOETTING_SUMMARY",json.dumps(summary),flush=True)

if __name__=="__main__":main()
