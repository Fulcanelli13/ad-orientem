#!/usr/bin/env python3
"""Bounded, one-time read-only source-byte audit of existing Sacred Atlas 39 photo leads.

Preserves exact canonical IDs and prior SHA-1 claims. Never publishes,
approves, crops, rewrites app media, or retries API throttling.
"""
import argparse
from collections import Counter
from datetime import datetime, timezone
import importlib.util
import json
from pathlib import Path
import re
import time
import urllib.error

ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/"data/geography/research/sacred-atlas-undecided66-bulk-photo-review-20261104.html"
OUT=Path("/tmp/ao-sacred-atlas-round24-existing39-original-audit.json")
PRIOR=ROOT/"tools/atlas/audit-sacred-atlas-altoetting15-originals.py"
spec=importlib.util.spec_from_file_location("atlas_prior_original_audit",PRIOR)
verifier=importlib.util.module_from_spec(spec)
spec.loader.exec_module(verifier)
MAX_CANDIDATES=39
MAX_API_PER_BATCH=8
MIN_DELAY=10.0

def sources():
    html=SOURCE.read_text(encoding="utf-8")
    a=html.index("const places=")+len("const places=")
    b=html.index("]; const auditStatuses=",a)+1
    places=json.loads(html[a:b])
    selected=[]
    for p in places:
        if any(c.get("originalVerified") for c in p["candidates"]):
            continue
        for c in p["candidates"]:
            audit=c.get("audit") or {}
            if audit.get("status")!="METADATA_ELIGIBLE_MANUAL_SUBJECT_RIGHTS_AND_ORIGINAL":
                continue
            item={"place_id":p["id"],"place_name":p["name"],"source_title":c["title"],
                  "source_url":c["url"],"prior_sha1":audit["sha1"],
                  "prior_author":audit["author"],"prior_license":audit["license"],
                  "prior_width":audit.get("width"),"prior_height":audit.get("height")}
            selected.append(item)
    if len(selected)!=MAX_CANDIDATES or len({x["source_title"] for x in selected})!=len(selected):
        raise ValueError("Expected exactly 39 unique source-title leads; fail closed if master changes")
    if len({x["place_id"] for x in selected})!=12:
        raise ValueError("Expected exactly 12 distinct canonical Places")
    for x in selected:
        if not re.fullmatch("[0-9a-f]{40}",x["prior_sha1"]):raise ValueError("Missing prior SHA1")
        if not x["source_title"].startswith("File:") or not x["source_url"].startswith("https://commons.wikimedia.org/wiki/File:"):
            raise ValueError("Non-Commons source")
    return selected

def audit(items,metadata,hash_original=None,pause=None):
    hash_original=hash_original or verifier.hash_original
    pause=pause or time.sleep
    records=[]
    blocked=False
    for x in items:
        r={**x,"metadata_matched":False,"original_bytes_verified":False,
           "visual_scene_approved":False,"underlying_rights_cleared":False,
           "user_editorial_approved":False,"published":False}
        if blocked:
            r["status"]="HOLD_STOPPED_AFTER_RATE_LIMIT";records.append(r);continue
        image=(metadata.get(x["source_title"],{}).get("imageinfo") or [None])[0]
        if not image:
            r["status"]="HOLD_MISSING_METADATA";records.append(r);continue
        actual=image.get("sha1")
        size=int(image.get("size") or 0)
        width=int(image.get("width") or 0)
        height=int(image.get("height") or 0)
        mime=image.get("mime")
        ext=image.get("extmetadata") or {}
        get=lambda k:verifier.clean((ext.get(k) or {}).get("value"))
        author=get("Artist")
        license_name=get("LicenseShortName")
        license_url=get("LicenseUrl")
        r.update({"current_sha1":actual,"claimed_size_bytes":size,
                  "current_width":width,"current_height":height,"mime":mime,
                  "current_author":author,"current_license":license_name,
                  "current_license_url":license_url})
        if actual!=x["prior_sha1"]:
            r["status"]="HOLD_SOURCE_REVISION_CHANGED"
        elif mime not in verifier.ALLOWED_MIME or width<1024 or height<768 or not (50000<=size<=verifier.MAX_ORIGINAL_BYTES):
            r["status"]="HOLD_FORMAT_DIMENSIONS_OR_SIZE"
        elif not author or not verifier.CC.fullmatch(license_url.rstrip("/")+"/"):
            r["status"]="HOLD_PHOTOGRAPHER_OR_LICENSE_URL"
        else:
            r["metadata_matched"]=True
            url=image.get("url") or ""
            if not verifier.check_host(url,"upload.wikimedia.org"):
                r["status"]="HOLD_UNTRUSTED_FILE_HOST"
            else:
                try:
                    pause(MIN_DELAY)
                    actual_bytes,digest=hash_original(url)
                    r["original_sha1"]=digest
                    r["downloaded_bytes"]=actual_bytes
                    if digest==actual and actual_bytes==size:
                        r["original_bytes_verified"]=True
                        r["status"]="BYTE_VERIFIED_FINAL_VISUAL_RIGHTS_CROP_EDITORIAL_PENDING"
                    else:r["status"]="HOLD_DIGEST_OR_SIZE_MISMATCH"
                except urllib.error.HTTPError as error:
                    r["status"]="HOLD_HTTP_"+str(error.code)
                    if error.code==429:blocked=True
                except Exception as error:
                    r["status"]="HOLD_FILE_"+type(error).__name__.upper()
                    r["error_summary"]=str(error)[:120]
        records.append(r)
        print("R24_ORIGINAL",json.dumps({"file":x["source_title"],"status":r["status"]}),flush=True)
    return records

def selftest(items):
    item=items[0]
    demo={"imageinfo":[{"sha1":item["prior_sha1"],"size":170000,"width":1800,"height":1400,
       "mime":"image/jpeg","url":"https://upload.wikimedia.org/test.jpg",
       "extmetadata":{"Artist":{"value":"Example author"},"LicenseShortName":{"value":"CC BY-SA 4.0"},
                    "LicenseUrl":{"value":"https://creativecommons.org/licenses/by-sa/4.0/"}}}]}
    good=audit([item],{item["source_title"]:demo},hash_original=lambda u:(170000,item["prior_sha1"]),pause=lambda s:None)[0]
    assert good["original_bytes_verified"] and not good["published"]
    assert not good["visual_scene_approved"] and not good["underlying_rights_cleared"]
    bad=audit([item],{item["source_title"]:{**demo,"imageinfo":[{**demo["imageinfo"][0],"sha1":"0"*40}]}},
              hash_original=lambda u:(_ for _ in ()).throw(AssertionError("No file request on changed source")),
              pause=lambda s:None)[0]
    assert bad["status"]=="HOLD_SOURCE_REVISION_CHANGED" and not bad["original_bytes_verified"]

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--self-test",action="store_true")
    parser.add_argument("--dry-run",action="store_true")
    args=parser.parse_args()
    selected=sources()
    if args.self_test:
        selftest(selected);print("ROUND24_SELFTEST_PASS");return
    if args.dry_run:
        print(json.dumps({"sources":len(selected),"sites":len({x["place_id"] for x in selected}),
                          "metadata_batches":(len(selected)+MAX_API_PER_BATCH-1)//MAX_API_PER_BATCH,
                          "downloaded_originals":0,"published":0}));return
    metadata={}
    blocked=False
    for i in range(0,len(selected),MAX_API_PER_BATCH):
        try:
            metadata.update(verifier.request_metadata([x["source_title"] for x in selected[i:i+MAX_API_PER_BATCH]]))
        except urllib.error.HTTPError as error:
            print("R24_METADATA_HTTP",error.code,flush=True)
            if error.code==429:
                blocked=True
                break
            continue
        except Exception as error:
            print("R24_METADATA_HOLD",type(error).__name__,str(error)[:150],flush=True)
    records=audit(selected,metadata) if not blocked else [
        {**x,"status":"HOLD_METADATA_RATE_LIMIT","original_bytes_verified":False,
         "user_editorial_approved":False,"published":False} for x in selected]
    summary={"files":len(records),"sites":len({x["place_id"] for x in records}),
             "byte_verified":sum(x.get("original_bytes_verified",False) for x in records),
             "status_counts":dict(Counter(x["status"] for x in records)),
             "editorially_approved":0,"published":0}
    obj={"schema":"AO_SACRED_ATLAS_ROUND24_EXISTING39_READONLY_SOURCE_AUDIT_V1",
         "as_of_utc":datetime.now(timezone.utc).isoformat(),
         "scope":"ORIGINAL_BYTES_ONLY_NO_EXACT_SITE_OR_RIGHTS_OR_CROP_OR_EDITORIAL_APPROVAL",
         "policy":"One bounded metadata pass (5 batches); originals hashed in memory only, 10s between file requests, no rate limit retries.",
         "summary":summary,"records":records}
    OUT.write_text(json.dumps(obj,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print("R24_SUMMARY",json.dumps(summary),flush=True)

if __name__=="__main__":main()
