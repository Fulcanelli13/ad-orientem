#!/usr/bin/env python3
"""Read-only audit of all 24 remaining non-PD-self original Place photo holds.

This job does not fetch picture binaries, change an approved asset or infer approval
of an alternate. Current exact Commons metadata and URI evidence only.
"""
from __future__ import annotations
import collections
import html
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
M=ROOT/"data/geography/research/sacred-atlas-selected24-hold-closure-20261104.v1.json"
OUT=Path("/tmp/ao-sacred-atlas-selected24-live-source-audit.json")
API="https://commons.wikimedia.org/w/api.php"
UA="AdOrientemSacredAtlasSourceAudit/2026-11-04 (read-only; exact selected photos)"
LIMIT=2_000_000

def clean(s):return " ".join(html.unescape(re.sub(r"<[^>]*>"," ",str(s or ""))).split())[:800]
def trusted(url):
    u=urllib.parse.urlsplit(str(url))
    return u.scheme=="https" and u.hostname=="commons.wikimedia.org" and not u.username and not u.password and u.port in (None,443)

def main():
    m=json.loads(M.read_text(encoding="utf8"))
    assert m["schema"]=="AO_SACRED_ATLAS_SELECTED24_HOLDS_CLOSURE_MANIFEST_V1"
    assert len(m["rows"])==24 and len({r["place_id"] for r in m["rows"]})==24
    out=[];rate_limited=0;last=0.0
    for row in m["rows"]:
        result={"place_id":row["place_id"],"place_name":row["place_name"],
                "source_file":row["source_title"],"pinned_sha1":row["sha1"],
                "original_blocker":row["classification"],"publication_allowed":False}
        if rate_limited>=2:
            result["status"]="PAUSED_AFTER_SECOND_COMMONS_429"
            out.append(result);continue
        elapsed=time.monotonic()-last
        if last and elapsed<6:time.sleep(6-elapsed)
        last=time.monotonic()
        params=urllib.parse.urlencode({"action":"query","format":"json","formatversion":"2",
            "titles":row["source_title"],"prop":"imageinfo|revisions",
            "iiprop":"url|size|sha1|mime|extmetadata",
            "rvprop":"ids|content","rvslots":"main","rvlimit":1})
        url=API+"?"+params
        try:
            if not trusted(url):raise ValueError("Source host not authorized")
            req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"application/json"})
            with urllib.request.urlopen(req,timeout=50) as response:
                if not trusted(response.geturl()):raise ValueError("Unapproved metadata redirect")
                body=response.read(LIMIT+1)
            if len(body)>LIMIT:raise ValueError("Metadata too large")
            payload=json.loads(body)
            pages=payload.get("query",{}).get("pages",[])
            if len(pages)!=1 or pages[0].get("title")!=row["source_title"] or not pages[0].get("imageinfo"):
                raise ValueError("Current original missing or redirected")
            page=pages[0];info=page["imageinfo"][0]
            rev=(page.get("revisions") or [{}])[0]
            wiki=str(rev.get("slots",{}).get("main",{}).get("content") or rev.get("content") or "")
            meta=info.get("extmetadata") or {}
            get=lambda k:clean((meta.get(k) or {}).get("value"))
            sha=info.get("sha1","")
            w,h=int(info.get("width") or 0),int(info.get("height") or 0)
            n=int(info.get("size") or 0)
            license_url=get("LicenseUrl")
            u=urllib.parse.urlsplit(license_url)
            artist=get("Artist")
            result.update({"current_source_sha1":sha,"same_original_revision_sha1":sha==row["sha1"],
                "same_dimensions":[w,h]==row["dimensions"],"current_size_bytes":n,"pixels":w*h,
                "mime":info.get("mime"),"source_revision_id":rev.get("revid"),
                "license_short_name":get("LicenseShortName"),"license_url":license_url,
                "license_url_scheme":u.scheme,"license_legal_code_path":u.path,
                "artist":artist,"artist_present":bool(artist),
                "source_description_has_pd_self":bool(re.search(r"\{\{\s*PD-self\b",wiki,re.I)),
                "source_description_has_usgov":bool(re.search(r"\{\{\s*PD-USGov",wiki,re.I)),
                "source_description_mentions_copyright_exception":bool(re.search(
                     r"\{\{\s*(?:Copyvio|FoP-|Derivative|Artwork|No permission)",wiki,re.I))})
            if sha!=row["sha1"]:result["status"]="HOLD_SOURCE_SHA1_REVISION_CHANGED"
            elif [w,h]!=row["dimensions"]:result["status"]="HOLD_DIMENSIONS_CHANGED"
            elif not artist or artist.casefold() in ("unknown author","unknown","anonymous","own work"):
                result["status"]="HOLD_ATTRIBUTION_MISSING_OR_GENERIC"
            elif w*h>65_000_000 or n>32_000_000:
                result["status"]="HOLD_ORIGINAL_TOO_LARGE_FOR_APPROVED_DECODER"
            elif row["classification"]=="SAME_ORIGINAL_SELECTED_FOR_ANOTHER_PLACE":
                result["status"]="HOLD_DUPLICATE_PLACE_SOURCE_IDENTITY"
            elif row["classification"]=="PUBLIC_DOMAIN_SPECIAL_RIGHTS":
                result["status"]="HOLD_PUBLIC_DOMAIN_LEGAL_BASIS"
            elif row["classification"]=="PORTED_CC_LEGAL_CODE":
                result["status"]="PORTED_CC_REQUIRES_EXACT_LEGAL_CODE_AND_APP_WHITELIST"
            elif row["classification"]=="SOURCE_AUTHOR_MISSING":
                result["status"]="ATTRIBUTION_EVIDENCE_REQUIRES_EDITORIAL_REVIEW"
            else:result["status"]="METADATA_CHECK_PASS_REQUIRES_RELEASE_RIGHTS_REVIEW"
        except urllib.error.HTTPError as exc:
            if exc.code==429:rate_limited+=1
            result["status"]="HOLD_HTTP_"+str(exc.code)
        except Exception as exc:
            result["status"]="HOLD_"+type(exc).__name__.upper()
            result["error"]=str(exc)[:200]
        out.append(result)
        print("SELECTED24_SOURCE",json.dumps({"place_id":row["place_id"],
            "status":result["status"]},ensure_ascii=False),flush=True)
    counts=dict(collections.Counter(x["status"] for x in out))
    result={"schema":"AO_SACRED_ATLAS_SELECTED24_LIVE_SOURCE_AUDIT_V1",
        "scope":"READ_ONLY_METADATA_NO_ORIGINAL_BINARY_NO_PUBLICATION",
        "reviewed":len(out),"published":0,"http_429_count":rate_limited,
        "statuses":counts,"rows":out}
    OUT.write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    print("SELECTED24_SUMMARY",json.dumps({"reviewed":len(out),"published":0,
        "statuses":counts},ensure_ascii=False),flush=True)

if __name__=="__main__":main()
