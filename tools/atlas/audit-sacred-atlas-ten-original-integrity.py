#!/usr/bin/env python3
"""One-time research verification of ten shortlisted Commons originals.

No publishing, no edits to app data, no bypass/retry of rate limiting.
Images are read into a capped temporary stream, SHA1-checked, then discarded.
Output is metadata and original-byte integrity evidence only.
"""
from __future__ import annotations
import argparse
from collections import Counter
import hashlib
import html
import json
from pathlib import Path
import re
import time
from urllib.parse import urlencode, urlsplit
import urllib.request
import urllib.error

ROOT=Path(__file__).resolve().parents[2]
QUEUE=ROOT/"data/geography/research/sacred-atlas-round16-ten-visual-cover-candidates-20261104.v1.json"
APPROVED=ROOT/"data/geography/approved-place-media.v1.json"
API="https://commons.wikimedia.org/w/api.php"
OUT=Path("/tmp/ao-sacred-atlas-ten-original-byte-audit.json")
USER_AGENT="AdOrientemSacredAtlasTenOriginalResearch/2026-11-04 (https://github.com/Fulcanelli13/ad-orientem; Wikimedia rate-limit respecting read-only integrity audit)"
LIMIT_BYTES=32_000_000
MIN_INTERVAL=10.0

def tidy(x):
    return " ".join(html.unescape(re.sub(r"<[^>]*>", " ", str(x or ""))).split())[:600]

def trusted(url,host):
    p=urlsplit(url)
    return (p.scheme=="https" and p.hostname==host and p.username is None and
            p.password is None and p.port in (None,443))

def fetch(url,host,limit):
    if not trusted(url,host): raise ValueError("Untrusted source host")
    req=urllib.request.Request(url,headers={"User-Agent":USER_AGENT,"Accept":"application/json" if host=="commons.wikimedia.org" else "image/*"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        if not trusted(resp.geturl(),host): raise ValueError("Untrusted redirect")
        n=int(resp.headers.get("Content-Length") or 0)
        if n>limit: raise ValueError("Content-Length too large")
        if host=="commons.wikimedia.org":
            value=resp.read(limit+1)
            if len(value)>limit:raise ValueError("Metadata response too large")
            return value
        dig=hashlib.sha1()
        size=0
        while True:
            part=resp.read(256*1024)
            if not part:break
            size+=len(part)
            if size>limit:raise ValueError("Original stream exceeds size cap")
            dig.update(part)
        return size,dig.hexdigest()

def metadata(ten):
    names="|".join(x["source_title"] for x in ten)
    q=urlencode({"action":"query","format":"json","formatversion":"2","titles":names,
                 "prop":"imageinfo","iiprop":"url|size|sha1|mime|extmetadata","iilimit":"1"})
    result=json.loads(fetch(API+"?"+q,"commons.wikimedia.org",7_000_000))
    if result.get("error"):raise ValueError("Commons returned API error")
    return {x.get("title"):x for x in result.get("query",{}).get("pages",[])}

def analysis(ten,meta,download=fetch,sleep=time.sleep):
    results=[]
    stop=False
    for i,row in enumerate(ten):
        out={"place_id":row["place_id"],"source_title":row["source_title"],
             "pinned_expected_sha1":row["expected_source_sha1"],
             "original_bytes_verified":False,"publication_authorized":False,
             "user_primary_cover_choice":False}
        if stop:
            out["status"]="PAUSED_AFTER_COMMONS_429"
            results.append(out);continue
        p=meta.get(row["source_title"],{})
        info=(p.get("imageinfo") or [None])[0]
        if p.get("missing") or not info:
            out["status"]="HOLD_SOURCE_MISSING"
            results.append(out);continue
        sha=str(info.get("sha1") or "")
        size=int(info.get("size") or 0)
        width,height=int(info.get("width") or 0),int(info.get("height") or 0)
        mime=info.get("mime")
        xmeta=info.get("extmetadata") or {}
        field=lambda key:tidy((xmeta.get(key) or {}).get("value"))
        artist=field("Artist")
        license_url=field("LicenseUrl")
        out.update({"live_sha1":sha,"original_expected_size":size,"live_dimensions":[width,height],
                    "mime":mime,"artist":artist,"license_short_name":field("LicenseShortName"),
                    "license_url":license_url,"description_page":info.get("descriptionurl")})
        if not re.fullmatch(r"[0-9a-f]{40}",sha) or mime!="image/jpeg":
            out["status"]="HOLD_BAD_SOURCE_SHA_OR_MIME"
        elif size<100_000 or size>LIMIT_BYTES or width<1024 or height<768 or width*height>65_000_000:
            out["status"]="HOLD_UNSUPPORTED_SIZE_OR_DIMENSIONS"
        elif row["expected_source_sha1"] is not None and row["expected_source_sha1"]!=sha:
            out["status"]="HOLD_SOURCE_REVISION_CHANGED"
        elif not artist:
            out["status"]="HOLD_ATTRIBUTION_UNKNOWN"
        elif not re.match(r"^https://creativecommons[.]org/licenses/(?:by|by-sa)/(?:2[.]0|3[.]0|4[.]0)(?:/|$)",license_url):
            out["status"]="HOLD_LICENCE_UNRESOLVED"
        else:
            # Direct only to Wikimedia upload host, never transfer original to repository.
            url=str(info.get("url") or "")
            if not trusted(url,"upload.wikimedia.org"):
                out["status"]="HOLD_UNTRUSTED_UPLOAD_URL"
            else:
                try:
                    sleep(MIN_INTERVAL)
                    downloaded_size,downloaded_sha=download(url,"upload.wikimedia.org",LIMIT_BYTES)
                    out["actual_original_sha1"]=downloaded_sha
                    out["actual_original_size"]=downloaded_size
                    if downloaded_sha!=sha or downloaded_size!=size:
                        out["status"]="HOLD_ORIGINAL_DIGEST_OR_SIZE_MISMATCH"
                    else:
                        out["status"]="ORIGINAL_INTEGRITY_PASS_USER_RIGHTS_AND_VISUAL_APPROVAL_REQUIRED"
                        out["original_bytes_verified"]=True
                except urllib.error.HTTPError as exc:
                    if exc.code==429:stop=True
                    out["status"]="HOLD_HTTP_"+str(exc.code)
                except Exception as exc:
                    out["status"]="HOLD_ORIGINAL_FETCH_"+type(exc).__name__.upper()
                    out["error"]=str(exc)[:180]
        results.append(out)
        print("TEN_ORIGINAL_SOURCE",json.dumps({"place_id":out["place_id"],"status":out["status"]}),flush=True)
    return results

def load():
    queue=json.loads(QUEUE.read_text(encoding="utf8"))
    assert queue["schema"]=="AO_SACRED_ATLAS_ROUND16_TOP10_SOURCE_LOCKED_ACQUISITION_REVIEW_QUEUE_V1"
    ten=queue["rows"]
    assert len(ten)==10 and len({r["place_id"] for r in ten})==10
    assert sum(bool(r["expected_source_sha1"]) for r in ten)==9
    assert all(not r["publication_authorized"] and not r["user_approved"] for r in ten)
    return ten

def selftest():
    sample=[{"place_id":"p","source_title":"File:Test.jpg","expected_source_sha1":"a"*40}]
    mim={"File:Test.jpg":{"title":"File:Test.jpg","imageinfo":[{
       "sha1":"a"*40,"size":1000000,"width":2000,"height":1500,"mime":"image/jpeg",
       "url":"https://upload.wikimedia.org/test.jpg",
       "extmetadata":{"Artist":{"value":"Author A"},
                      "LicenseUrl":{"value":"https://creativecommons.org/licenses/by-sa/4.0/"},
                      "LicenseShortName":{"value":"CC BY-SA 4.0"}}}]}}
    r=analysis(sample,mim,download=lambda *args:(1000000,"a"*40),sleep=lambda n:None)
    assert r[0]["status"]=="ORIGINAL_INTEGRITY_PASS_USER_RIGHTS_AND_VISUAL_APPROVAL_REQUIRED"
    assert r[0]["original_bytes_verified"] and not r[0]["publication_authorized"]
    changed=[{**sample[0],"expected_source_sha1":"b"*40}]
    r=analysis(changed,mim,download=lambda *args:(_ for _ in ()).throw(AssertionError("No fetch expected")),sleep=lambda n:None)
    assert r[0]["status"]=="HOLD_SOURCE_REVISION_CHANGED"
    assert trusted("https://upload.wikimedia.org/a/b.jpg","upload.wikimedia.org")
    assert not trusted("https://evil.example.net/a.jpg","upload.wikimedia.org")
    assert not trusted("http://upload.wikimedia.org/a.jpg","upload.wikimedia.org")

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--self-test",action="store_true")
    parser.add_argument("--dry-run",action="store_true")
    args=parser.parse_args()
    if args.self_test:
        selftest();print("TEN_ORIGINAL_SELF_TEST_PASS");return
    ten=load()
    if args.dry_run:
        print(json.dumps({"source_places":len(ten),"pinned_sha1_count":sum(bool(x["expected_source_sha1"]) for x in ten),
                          "downloads_started":0,"published":0}));return
    try:
        meta=metadata(ten)
        result=analysis(ten,meta)
    except urllib.error.HTTPError as exc:
        result=[{"place_id":x["place_id"],"source_title":x["source_title"],
                 "status":"HOLD_METADATA_HTTP_"+str(exc.code),"publication_authorized":False,
                 "original_bytes_verified":False} for x in ten]
    except Exception as exc:
        result=[{"place_id":x["place_id"],"source_title":x["source_title"],
                 "status":"HOLD_METADATA_"+type(exc).__name__.upper(),"error":str(exc)[:180],
                 "publication_authorized":False,"original_bytes_verified":False} for x in ten]
    counted=Counter(x["status"] for x in result)
    obj={"schema":"AO_SACRED_ATLAS_ROUND17_TEN_ORIGINAL_INTEGRITY_RESULTS_V1",
         "scope":"METADATA_AND_INTEGRITY_ONLY_NO_PUBLICATION",
         "files":len(result),"verified_originals":sum(bool(x.get("original_bytes_verified")) for x in result),
         "source_integrity_statuses":dict(counted),"published":0,
         "rules":["Do not promote from original SHA1 alone; exact site/subject, image rights, user editorial selection and full-resolution framing must still pass.",
                  "No image data or derivatives archived; files streamed and discarded.",
                  "HTTP 429 stops further source acquisitions without retry or workaround.",
                  "No writes to app registries and no API credentials."],"results":result}
    OUT.write_text(json.dumps(obj,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    print("TEN_ORIGINAL_SUMMARY",json.dumps({"checked":len(result),"verified_originals":obj["verified_originals"],"statuses":dict(counted),"published":0}),flush=True)

if __name__=="__main__":main()
