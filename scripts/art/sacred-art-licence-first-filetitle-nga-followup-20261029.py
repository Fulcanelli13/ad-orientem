#!/usr/bin/env python3
"""Complete licence-first source-link reconciliation without looking at photos.

Adds:
- Seven *exact Commons File:* source file licence declarations in one API batch.
- US National Gallery of Art's official OA policy for 34 source-linked objects:
  policy exists, but per-object OPEN IMAGE still unproven and is NOT marked CC0.
- Eight inaccessible Met object API responses held without inventing a rights
  verdict; preserves a previously SHA-verified original if its API transiently
  yields HTTP 403.
Never fetches source image bytes or assesses aesthetic/photographic quality.
"""
import csv,html,json,re,urllib.parse,urllib.request
from pathlib import Path
from collections import Counter
ROOT=Path(__file__).resolve().parents[2]
D=ROOT/"data/calendar"
p=D/"sacred-art-licence-first-383-exact-source-audit-20261029.v1.json"
a=json.loads(p.read_text())
pinned={z["artwork_id"]:z for z in json.loads((D/"sacred-art-22-museum-official-cc0-photo-sha-20261028.v1.json").read_text())["records"]}
UA="AdOrientem-SacredArt-Licence-SecondPass/1.0 (https://github.com/Fulcanelli13/ad-orientem)"
targets=[r for r in a["records"] if r["source_url"].startswith("File:") and r["file_licence_audit_status"]=="EXACT_FILE_METADATA_NOT_YET_CONFIRMED"]
assert len(targets)==7
url="https://commons.wikimedia.org/w/api.php?"+urllib.parse.urlencode({
   "action":"query","format":"json","formatversion":2,
   "titles":"|".join(r["source_url"] for r in targets),
   "prop":"imageinfo","iiprop":"sha1|size|extmetadata|mime"})
req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"application/json"})
with urllib.request.urlopen(req,timeout=40) as f:
    o=json.loads(f.read(1500000))
pages={}
for page in o.get("query",{}).get("pages",[]):
    if not page.get("imageinfo"):continue
    info=page["imageinfo"][0];ext=info.get("extmetadata",{})
    clean=lambda s:" ".join(html.unescape(re.sub("<[^>]*>"," ",str(s or ""))).split())[:280]
    pick=lambda key:clean(ext.get(key,{}).get("value"))
    pages[page["title"].replace("_"," ")]={
        "live_file_found":True,"source":"CURRENT_COMMONS_FILE_IMAGEINFO",
        "current_image_sha1":info.get("sha1"),"file_bytes":info.get("size"),
        "mime":info.get("mime"),
        "licence_short_name":pick("LicenseShortName"),
        "licence_url":pick("LicenseUrl"),
        "attribution":pick("Attribution"),"credit":pick("Credit"),
        "copyrighted":pick("Copyrighted"),
        "restrictions":pick("Restrictions")}
for r in targets:
    info=pages.get(r["source_url"].replace("_"," "))
    if not info:
        r["file_licence_audit_status"]="COMMONS_EXACT_FILE_NOT_FOUND_HOLD"
        r["required_licence_action"]="FIND_VALID_COMMONS_FILE_PAGE"
        continue
    r["commons_live_file_metadata"]=info
    r["commons_file_title"]=r["source_url"]
    l=info["licence_short_name"].lower()
    if "cc0" in l or "public domain" in l or "pd-art" in l:
        r["file_licence_audit_status"]="COMMONS_PUBLIC_DOMAIN_EXACT_FILE_METADATA_VERIFIED"
        r["commons_file_licence_class"]="PUBLIC_DOMAIN_OR_CC0_DECLARED"
        r["required_licence_action"]="MATCH_ARCHIVED_ORIGINAL_BYTES_TO_CURRENT_LICENSED_FILE"
    elif "by-sa" in l:
        r["file_licence_audit_status"]="COMMONS_CC_BY_SA_ATTRIBUTION_SHAREALIKE"
        r["commons_file_licence_class"]="FREE_LICENCE_CONDITIONAL_SHAREALIKE"
        r["required_licence_action"]="IMPLEMENT_ATTRIBUTION_AND_SHAREALIKE_OR_FIND_CC0"
    elif "by" in l:
        r["file_licence_audit_status"]="COMMONS_CC_BY_ATTRIBUTION_REQUIRED"
        r["commons_file_licence_class"]="FREE_LICENCE_CONDITIONAL_ATTRIBUTION"
        r["required_licence_action"]="IMPLEMENT_ATTRIBUTION_OR_FIND_CC0"
    else:
        r["file_licence_audit_status"]="COMMONS_FILE_TERMS_UNCLEAR"
        r["required_licence_action"]="CHECK_CONFLICTING_SOURCE_PHOTOGRAPH_LICENSE"
# Global NGA Washington open access terms:
# https://www.nga.gov/terms-and-notices
# policy only applies to photographs individually offered as Open Access.
ngas=[]
for r in a["records"]:
    if (r["file_licence_audit_status"]=="EXACT_FILE_METADATA_NOT_YET_CONFIRMED" and
        r["source_url"].startswith("https://www.nga.gov/artworks/")):
        r["file_licence_audit_status"]="NGA_US_OPEN_ACCESS_POLICY_FILE_ELIGIBILITY_UNCONFIRMED"
        r["required_licence_action"]="VERIFY_EXACT_OBJECT_IMAGE_HAS_OFFICIAL_OPEN_ACCESS_DOWNLOAD_AND_LINK_ARCHIVED_SHA"
        r["source_photo_policy_url"]="https://www.nga.gov/terms-and-notices"
        r["source_policy_summary"]="US National Gallery of Art CC0 only for digitally downloaded works explicitly offered as Open Access"
        ngas.append(r["artwork_id"])
assert len(ngas)==34
for r in a["records"]:
    if (r["file_licence_audit_status"]=="EXACT_FILE_METADATA_NOT_YET_CONFIRMED" and
        r["source_url"].startswith("https://www.metmuseum.org/")):
        r["file_licence_audit_status"]="MET_OFFICIAL_OBJECT_API_RIGHTS_NOT_LIVE_VERIFIED"
        r["required_licence_action"]="RETRY_OFFICIAL_OBJECT_IMAGE_RIGHTS_WHEN_API_RESPONDS"
# Preserve independently verified source-byte + institution CC0 original-file
# evidence against an unrelated live API access error.
prior=0
for r in a["records"]:
    x=pinned.get(r["artwork_id"])
    if r["file_licence_audit_status"]=="OFFICIAL_CC0_PHOTOGRAPH_VERSION_REQUIRES_JOIN" and x and x.get("source_photo_bytes_same_as_frozen_archive"):
        assert x["official_photo_sha256_current"]==r["recorded_archive_image_sha256"]
        r["file_licence_audit_status"]="EXACT_OFFICIAL_CC0_ARCHIVE_PREVIOUSLY_VERIFIED_API_403_HOLD"
        r["required_licence_action"]="NO_NEW_LICENCE_RESEARCH_NEEDED_RETAIN_20261028_VERIFIED_CC0_SOURCE_BYTE_PROOF"
        r["licence_check_unresolved_detail"]+="; Current API 403 does not revoke 2026-10-28 official CC0 and exact source SHA verification."
        prior+=1
assert prior==1
cnt=Counter(r["file_licence_audit_status"] for r in a["records"])
ap=Counter(r["file_licence_audit_status"] for r in a["records"] if r["approved_107"])
assert sum(cnt.values())==383 and sum(ap.values())==107
a["schema"]="AO_SACRED_ART_LICENCE_FIRST_383_20261029_V2"
a["counts"]["licence_dispositions"]=dict(cnt)
a["counts"]["approved_107_dispositions"]=dict(ap)
a["counts"]["additional_exact_commons_file_metadata_checked"]=7
a["counts"]["additional_NGA_US_policy_sources_classified"]=34
a["counts"]["earlier_museum_CC0_exact_original_proof_preserved_despite_transient_API_403"]=1
a["counts"]["commons_exact_file_titles_queried"]+=7
a["counts"]["commons_exact_file_metadata_received"]+=sum(z["commons_live_file_metadata"] is not None for z in targets)
a["counts"]["exact_official_CC0_archived_sha_provenance"]=(cnt.get("EXACT_SELECTED_ARCHIVE_OFFICIAL_CC0_SHA_VERIFIED",0)
    +cnt.get("EXACT_OFFICIAL_CC0_ARCHIVE_PREVIOUSLY_VERIFIED_API_403_HOLD",0)
    +cnt.get("OFFICIAL_CC0_ARCHIVE_PROVENANCE_SHA_LINKED",0))
a["counts"]["commons_public_domain_file_metadata_only"]=cnt.get("COMMONS_PUBLIC_DOMAIN_EXACT_FILE_METADATA_VERIFIED",0)
a["counts"]["conditional_cc_by_sa_photographer_terms"]=cnt.get("COMMONS_CC_BY_SA_ATTRIBUTION_SHAREALIKE",0)
a["counts"]["licence_only_phase_complete_all_dispositioned"]=True
a["counts"]["quality_review_performed_in_this_pass"]=0
a["licence_policy_sources"]={
   "met":"https://www.metmuseum.org/policies/image-resources",
   "cleveland":"https://www.clevelandart.org/terms-and-conditions",
   "nga_us":"https://www.nga.gov/terms-and-notices",
   "commons":"https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia"}
p.write_text(json.dumps(a,indent=2,ensure_ascii=False)+"\n")
fields=["artwork_id","title","artist","editorial_state","approved_107","file_licence_audit_status","required_licence_action","source_url",
        "museum_api","museum_current_live_policy","commons_file_title","commons_file_licence_class","recorded_archive_image_sha256",
        "archived_photo_hash_matches_candidate_original","licence_check_unresolved_detail"]
with (D/"sacred-art-licence-first-383-review-20261029.csv").open("w",newline="",encoding="utf-8") as f:
    w=csv.DictWriter(f,fieldnames=fields,extrasaction="ignore",lineterminator="\n")
    w.writeheader();w.writerows(a["records"])
with (D/"sacred-art-licence-first-383-holds-20261029.csv").open("w",newline="",encoding="utf-8") as f:
    w=csv.DictWriter(f,fieldnames=fields,extrasaction="ignore",lineterminator="\n");w.writeheader()
    for r in a["records"]:
        if r["file_licence_audit_status"] not in ("EXACT_SELECTED_ARCHIVE_OFFICIAL_CC0_SHA_VERIFIED",
            "EXACT_OFFICIAL_CC0_ARCHIVE_PREVIOUSLY_VERIFIED_API_403_HOLD",
            "OFFICIAL_CC0_ARCHIVE_PROVENANCE_SHA_LINKED"):
            w.writerow(r)
print(json.dumps(a["counts"],ensure_ascii=False,sort_keys=True))
