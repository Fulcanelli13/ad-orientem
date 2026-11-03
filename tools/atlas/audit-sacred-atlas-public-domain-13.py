#!/usr/bin/env python3
"""Audit thirteen prior-selected Commons public-domain claims, without publishing.
Fail closed: live file SHA-1, licence terms, author and page revision are evidence,
not publication permission. This job must not access Place asset directories.
"""
from __future__ import annotations
import html
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
MANIFEST=ROOT/"data/geography/research/sacred-atlas-pd13-legal-source-audit-cohort-20261104.v1.json"
OUTPUT=Path("/tmp/ao-sacred-atlas-pd13-current-source-audit.json")
API="https://commons.wikimedia.org/w/api.php"
UA="AdOrientemSourceAudit/2026-11-04 (read-only rights audit; single-pass, 6-second pacing)"
PD_TEMPLATES=re.compile(r"\{\{\s*(PD-self|PD-author|CC0|PD-release|PD-USGov[^|}]*)\b",re.I)
DANGEROUS_ELEMENTS=re.compile(r"\b(stained glass|sculpture|statue|painting|mural|artwork|mosaic|copyright|artist)\b",re.I)

def clean(s):
    return " ".join(html.unescape(re.sub(r"<[^>]*>"," ",str(s or ""))).split())[:850]

def main():
    manifest=json.loads(MANIFEST.read_text(encoding="utf8"))
    assert manifest["schema"]=="AO_SACRED_ATLAS_PUBLIC_DOMAIN_FROZEN_AUDIT_COHORT_V1"
    assert len(manifest["rows"])==13
    rows=[];limits=0;last=0
    for entry in manifest["rows"]:
        rec={"place_id":entry["place_id"],"place_name":entry["place_name"],
             "source_file":entry["commons_file"],"source_page":entry["commons_page"],
             "pinned_source_sha1":entry["pinned_original_sha1"],
             "source_rights_claim":"Public domain",
             "review_status":"UNVERIFIED_NO_PUBLICATION"}
        if limits>=2:
            rec["review_status"]="PAUSED_AFTER_COMMONS_429"
            rows.append(rec);continue
        since=time.monotonic()-last
        if last and since<6:time.sleep(6-since)
        last=time.monotonic()
        params=urllib.parse.urlencode({
            "action":"query","format":"json","formatversion":"2",
            "titles":entry["commons_file"],"prop":"imageinfo|revisions",
            "iiprop":"url|size|sha1|mime|extmetadata",
            "rvprop":"ids|content","rvslots":"main","rvlimit":"1"})
        try:
            req=urllib.request.Request(API+"?"+params,headers={"User-Agent":UA,"Accept":"application/json"})
            with urllib.request.urlopen(req,timeout=45) as response:
                if urllib.parse.urlsplit(response.geturl()).hostname!="commons.wikimedia.org":
                    raise ValueError("Untrusted API redirect")
                data=response.read(2_000_001)
                if len(data)>2_000_000:raise ValueError("Source metadata too large")
                payload=json.loads(data)
            pages=payload.get("query",{}).get("pages",[])
            if len(pages)!=1 or pages[0].get("title")!=entry["commons_file"] or not pages[0].get("imageinfo"):
                raise ValueError("Exact Commons file missing or redirected")
            page=pages[0];info=page["imageinfo"][0]
            if info.get("sha1")!=entry["pinned_original_sha1"]:
                raise ValueError("Source original SHA1 revision changed")
            width=int(info.get("width") or 0);height=int(info.get("height") or 0)
            if [width,height]!=entry["original_dimensions"]:
                raise ValueError("Source original dimensions changed")
            if info.get("mime") not in ("image/jpeg","image/png","image/webp"):
                raise ValueError("Unsupported source MIME")
            rev=(page.get("revisions") or [{}])[0]
            wikitext=str(rev.get("slots",{}).get("main",{}).get("content") or rev.get("content") or "")
            ext=info.get("extmetadata") or {}
            get=lambda key:clean((ext.get(key) or {}).get("value"))
            tags=list(dict.fromkeys(x.group(1) for x in PD_TEMPLATES.finditer(wikitext)))
            license_name=get("LicenseShortName");usage=get("UsageTerms")
            author=get("Artist")
            rec.update({
                "current_sha1":info["sha1"],"current_width":width,"current_height":height,
                "original_bytes_reported":int(info.get("size") or 0),
                "mime":info["mime"],"source_revision_id":rev.get("revid"),
                "source_license_short_name":license_name,
                "source_usage_terms":usage,"source_license_url":get("LicenseUrl"),
                "current_artist":author,"rights_templates":tags,
                "may_include_third_party_subject":bool(DANGEROUS_ELEMENTS.search(wikitext[:4000]))
            })
            if not author or len(author)>500 or author.lower() in ("unknown author","unknown"):
                rec["review_status"]="HOLD_ATTRIBUTION_MISSING_OR_GENERIC"
            elif not any(t.lower() in ("pd-self","pd-author","cc0","pd-release") for t in tags):
                rec["review_status"]="HOLD_NO_EXPLICIT_SELF_DEDICATION_TEMPLATE"
            elif "public domain" not in (license_name+" "+usage).lower() and "cc0" not in (license_name+" "+usage).lower():
                rec["review_status"]="HOLD_CURRENT_LICENSE_TERMS_NOT_SELF_EVIDENT"
            else:
                rec["review_status"]="SOURCE_PD_DECLARATION_FOUND_LEGAL_AND_SUBJECT_REVIEW_REQUIRED"
        except urllib.error.HTTPError as error:
            if error.code==429:limits+=1
            rec["review_status"]="HOLD_HTTP_"+str(error.code)
        except Exception as error:
            rec["review_status"]="HOLD_"+type(error).__name__.upper()
            rec["error"]=str(error)[:220]
        rows.append(rec)
        print("PD13_SOURCE_AUDIT",json.dumps({"place_id":rec["place_id"],"status":rec["review_status"],
                                           "tags":rec.get("rights_templates",[])},ensure_ascii=False),flush=True)
    output={"schema":"AO_SACRED_ATLAS_PD13_LIVE_METADATA_RIGHTS_AUDIT_V1",
            "scope":"RESEARCH_ONLY_NO_ORIGINAL_BINARY_NO_PUBLICATION",
            "reviewed":len(rows),"released":0,"holds_after_rate_limit":limits,
            "rows":rows}
    OUTPUT.write_text(json.dumps(output,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    print("PD13_SOURCE_AUDIT_SUMMARY",json.dumps({
        "reviewed":len(rows),
        "pd_declarations_found":sum(x["review_status"]=="SOURCE_PD_DECLARATION_FOUND_LEGAL_AND_SUBJECT_REVIEW_REQUIRED" for x in rows),
        "holds":sum(x["review_status"]!="SOURCE_PD_DECLARATION_FOUND_LEGAL_AND_SUBJECT_REVIEW_REQUIRED" for x in rows),
        "published":0},ensure_ascii=False),flush=True)

if __name__=="__main__":main()
