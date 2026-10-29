#!/usr/bin/env python3
"""Ad Orientem Sacred Art LICENSE-ONLY audit of the 383 canonical artwork IDs.

No visual/photo-quality analysis, no image download, no painting selection, no
production release. Reconcile original-file rights using live official museum
APIs, batch Wikimedia Commons ImageInfo, exact frozen source SHA provenance,
and recorded rights evidence. Every record gets a licence disposition.
"""
from __future__ import annotations
import csv,html,json,re,time,urllib.parse,urllib.request,urllib.error
from concurrent.futures import ThreadPoolExecutor,as_completed
from collections import Counter
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
DIR=ROOT/"data/calendar"
def load(p):return json.loads((DIR/p).read_text())
def readcsv(p):return list(csv.DictReader((DIR/p).open(newline="",encoding="utf-8")))
def v(x):return str(x).lower() in ("true","yes","1")
master=load("sacred-art-curator-queues-383-20261029.v1.json")
candidates={x["id"]:x for x in load("sacred-art-candidates.v1.json")["artworks"]}
museum={x["artwork_id"]:x for x in load("sacred-art-22-museum-official-cc0-photo-sha-20261028.v1.json")["records"]}
approved={x["artwork_id"]:x for x in readcsv("sacred-art-bulk-approved-107-photo-gates-20261028.csv")}
assert len(master["main_records"])==383 and len(approved)==107 and len(museum)==22
UA="AdOrientem-SacredArt-LicenceReview/1.0 (+https://github.com/Fulcanelli13/ad-orientem)"
def request(url,limit=1500000,timeout=23):
    req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"application/json","Accept-Encoding":"identity"})
    with urllib.request.urlopen(req,timeout=timeout) as h:
        data=h.read(limit+1)
    if len(data)>limit:raise ValueError("UNEXPECTED_LARGE_METADATA_RESPONSE")
    return json.loads(data.decode("utf-8"))
def clean(htmlstr):
    return " ".join(html.unescape(re.sub(r"<[^>]*>"," ",str(htmlstr or ""))).split())[:400]
def filetitle(url):
    p=urllib.parse.urlparse(url)
    if p.netloc.lower()!="commons.wikimedia.org":return None
    path=urllib.parse.unquote(p.path)
    if "/wiki/File:" in path:part=path.split("/wiki/File:",1)[1]
    elif "/wiki/Special:FilePath/" in path:part=path.split("/wiki/Special:FilePath/",1)[1]
    else:return None
    return "File:"+part.replace("_"," ")
def official_locator(r,cand):
    id=r["artwork_id"]
    if re.fullmatch(r"met-\d+",id):
        oid=int(id.split("-")[1]);return ("met",oid)
    if re.fullmatch(r"cma-\d+",id):
        oid=int(id.split("-")[1]);return ("cma",oid)
    url=(cand or {}).get("source",{}).get("objectUrl","")
    m=re.search(r"metmuseum.org/art/collection/search/(\d+)",url)
    if m:return ("met",int(m.group(1)))
    m=re.search(r"clevelandart.org/art/(\d+)",url)
    if m:return ("cma",int(m.group(1)))
    return None
def museum_check(inp):
    org,oid=inp
    url=f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{oid}" if org=="met" else f"https://openaccess-api.clevelandart.org/api/artworks/{oid}"
    try:
        result=request(url,limit=3000000)
        if org=="met":
            if result.get("objectID")!=oid:raise ValueError("OBJECT_ID_MISMATCH")
            pd=result.get("isPublicDomain") is True
            return {"institution":"Metropolitan Museum of Art","object_id":oid,"api_url":url,
                    "live_api_verified":True,"official_open_access_rights": "CC0_ELIGIBLE" if pd else "NOT_MARKED_PUBLIC_DOMAIN",
                    "primary_image_present":bool(result.get("primaryImage"))}
        item=result.get("data") or {}
        if item.get("id")!=oid:raise ValueError("OBJECT_ID_MISMATCH")
        licence=item.get("share_license_status")
        return {"institution":"Cleveland Museum of Art","object_id":oid,"api_url":url,
                "live_api_verified":True,"official_open_access_rights": "CC0_ELIGIBLE" if licence=="CC0" else "NON_CC0_OR_UNKNOWN",
                "source_license_text":licence,"primary_image_present":bool((item.get("images") or {}).get("print") or (item.get("images") or {}).get("web"))}
    except Exception as e:
        return {"institution":org,"object_id":oid,"api_url":url,"live_api_verified":False,
                "error":type(e).__name__+": "+str(e)[:130],"official_open_access_rights":"NOT_LIVE_CONFIRMED"}
# Official museum APIs are one object per request. Bounded concurrency, no
# image bytes; any backend failure leaves a hold instead of a green label.
in_scope=[]
urls={}
commons_titles={}
for r in master["main_records"]:
    id=r["artwork_id"]; cand=candidates.get(id)
    loc=official_locator(r,cand)
    if loc:urls[id]=loc
    approvedSource=(approved.get(id) or {}).get("source_page","")
    url=approvedSource or (cand or {}).get("source",{}).get("objectUrl","")
    if (r["source_lane"] in ("NO_PHYSICAL_ORIGINAL","PARTIAL_WORK_ONLY") or r["historical_exclusion"] or r.get("historical_editorial_conflict")):
        url=""
    name=filetitle(url)
    if name:commons_titles[id]=name
    in_scope.append({"id":id,"source_url":url,"candidate":cand})
unique_official=sorted(set(urls.values()))
verified={}
with ThreadPoolExecutor(max_workers=5) as pool:
    tasks={pool.submit(museum_check,loc):loc for loc in unique_official}
    for f in as_completed(tasks):
        loc=tasks[f]
        try:verified[loc]=f.result()
        except Exception as e:verified[loc]={"live_api_verified":False,"error":str(e)[:150],"official_open_access_rights":"NOT_LIVE_CONFIRMED"}
print("Official museum API objects checked",len(verified),flush=True)

commons={}
w_errors=[]
names=sorted(set(commons_titles.values()))
for start in range(0,len(names),25):
    batch=names[start:start+25]
    url="https://commons.wikimedia.org/w/api.php?"+urllib.parse.urlencode({
        "action":"query","format":"json","formatversion":2,"prop":"imageinfo",
        "iiprop":"sha1|size|extmetadata|mime","titles":"|".join(batch)})
    try:
        response=request(url,limit=2000000,timeout=42)
        for page in response.get("query",{}).get("pages",[]):
            name=page.get("title","")
            if not page.get("imageinfo"):
                commons[name]={"live_file_found":False,"live_file_source":"COMMONS_FILE_NOT_FOUND"}
                continue
            p=page["imageinfo"][0];ext=p.get("extmetadata",{})
            def x(k):return clean(ext.get(k,{}).get("value",""))
            commons[name]={"live_file_found":True,"current_image_sha1":p.get("sha1"),
                "mime":p.get("mime"),"file_bytes":p.get("size"),
                "licence_short_name":x("LicenseShortName"),"licence_url":x("LicenseUrl"),
                "copyrighted":x("Copyrighted"),"attribution":x("Attribution"),
                "credit":x("Credit"),"artist_metadata":x("Artist"),
                "restrictions":x("Restrictions"),"source":"CURRENT_COMMONS_FILE_IMAGEINFO"}
    except Exception as e:
        w_errors.append({"batch":start//25+1,"count":len(batch),"error":type(e).__name__+": "+str(e)[:170]})
    time.sleep(0.25)
print("Commons exact-file live metadata",len(commons),"errors",len(w_errors),flush=True)

def commons_class(z):
    s=(z.get("licence_short_name") or "").casefold()
    if not z.get("live_file_found"):return "FILE_NOT_CONFIRMED"
    if "cc0" in s or "cc-zero" in s or "public domain" in s or "pd-art" in s:
        return "PUBLIC_DOMAIN_OR_CC0_DECLARED"
    if re.search(r"cc[\s-]*by[\s-]*sa",s):return "FREE_LICENCE_CONDITIONAL_SHAREALIKE"
    if re.search(r"cc[\s-]*by",s):return "FREE_LICENCE_CONDITIONAL_ATTRIBUTION"
    if "copyright" in s or "all rights" in s:return "RESTRICTED_OR_RIGHTS_UNKNOWN"
    return "LICENCE_DECLARATION_UNCLEAR"
rows=[]
for r in master["main_records"]:
    id=r["artwork_id"];cand=candidates.get(id)
    source=(cand or {}).get("source",{})
    acq=(cand or {}).get("acquisition",{})
    loc=urls.get(id)
    official=verified.get(loc) if loc else None
    one=museum.get(id)
    aid=approved.get(id)
    pinned=r.get("prior_source_sha256") or ""
    matched=(bool(pinned) and bool(acq.get("originalSha256")) and pinned==acq["originalSha256"])
    sourceurl=(aid or {}).get("source_page") or source.get("objectUrl") or ""
    if r["source_lane"] in ("NO_PHYSICAL_ORIGINAL","PARTIAL_WORK_ONLY"):sourceurl=""
    co=commons.get(commons_titles.get(id)) if commons_titles.get(id) else None
    cc=commons_class(co) if co else None
    status="SOURCE_IDENTIFICATION_NEEDED"
    next_task="FIND_EXACT_SOURCE_FILE_AND_IDENTIFY_PHOTO_RIGHTS"
    exception=""
    if r["historical_exclusion"]:
        status="HISTORICALLY_EXCLUDED_NO_NEW_LICENSING"
        next_task="DO_NOT_REINTRODUCE_THIS_IMAGE"
    elif r.get("historical_editorial_conflict"):
        status="FROZEN_CONTRADICTORY_EDITORIAL_AUTHORITIES"
        next_task="RECONCILE_PREVIOUS_APPROVAL_VS_REJECTION"
    elif r["source_lane"] in ("NO_PHYSICAL_ORIGINAL","PARTIAL_WORK_ONLY"):
        status="NO_COMPLETE_IMAGE_TO_LICENSE"
        next_task="ESTABLISH_EXACT_FULL_ORIGINAL_THEN_CHECK_FILE_RIGHTS"
    elif one and one.get("official_eligible_photo_policy")=="CC0" and one.get("official_object_oa_flag_confirmed_20261028"):
        if one.get("source_photo_bytes_same_as_frozen_archive") and (not official or official.get("official_open_access_rights")=="CC0_ELIGIBLE"):
            status="EXACT_SELECTED_ARCHIVE_OFFICIAL_CC0_SHA_VERIFIED"
            next_task="LICENCE_COMPLETE_FOR_FROZEN_IMAGE_VERSION"
        else:
            status="OFFICIAL_CC0_PHOTOGRAPH_VERSION_REQUIRES_JOIN"
            next_task="LINK_SELECTED_ARCHIVE_SHA_TO_CC0_MUSEUM_SOURCE_OR_ACCEPT_NEW_VERSION"
    elif official and official.get("official_open_access_rights")=="CC0_ELIGIBLE":
        if matched and acq.get("archiveOriginal"):
            status="OFFICIAL_CC0_ARCHIVE_PROVENANCE_SHA_LINKED"
            next_task="PRESERVE_SOURCE_OBJECT_AND_ARCHIVE_PROVENANCE"
        else:
            status="OFFICIAL_CC0_OBJECT_NOT_EXACT_ARCHIVED_PHOTO_CERTIFIED"
            next_task="LINK_ORIGINAL_SHA_TO_IMAGE_FROM_OFFICIAL_CC0_API"
    elif co and co.get("live_file_found"):
        if cc=="PUBLIC_DOMAIN_OR_CC0_DECLARED":
            status="COMMONS_PUBLIC_DOMAIN_EXACT_FILE_METADATA_VERIFIED"
            next_task="CONFIRM_ARCHIVED_SELECTED_SHA_IS_SAME_COMMONS_FILE_BYTES"
        elif cc=="FREE_LICENCE_CONDITIONAL_SHAREALIKE":
            status="COMMONS_CC_BY_SA_ATTRIBUTION_SHAREALIKE"
            next_task="IMPLEMENT_PHOTOGRAPHER_ATTRIBUTION_LICENCE_AND_SHAREALIKE_OR_REPLACE_WITH_CC0"
        elif cc=="FREE_LICENCE_CONDITIONAL_ATTRIBUTION":
            status="COMMONS_CC_BY_ATTRIBUTION_REQUIRED"
            next_task="IMPLEMENT_PHOTOGRAPHER_ATTRIBUTION_LICENCE_OR_REPLACE_WITH_CC0"
        else:
            status="COMMONS_SOURCE_RESTRICTION_OR_UNCLEAR_LICENSE"
            next_task="CHECK_FILE_SPECIFIC_RESTRICTIONS_OR_FIND_CC0_ALTERNATIVE"
    elif official and official.get("live_api_verified") and official.get("official_open_access_rights")!="CC0_ELIGIBLE":
        status="INSTITUTION_SOURCE_NOT_CC0"
        next_task="CHECK_EXACT_IMAGE_LICENCE_OR_REPLACE_SOURCE"
    elif source.get("rights") in ("PUBLIC_DOMAIN_KRESS_REUSE_HOLD",):
        status="MUSEUM_COLLECTION_REUSE_RIGHTS_HOLD"
        next_task="FIND_PUBLIC_DOMAIN_FIDELITY_SOURCE_NO_PERMISSION_FEE"
    elif sourceurl:
        status="EXACT_FILE_METADATA_NOT_YET_CONFIRMED"
        next_task="CHECK_SOURCE_FILE_LICENCE_AT_URL"
    if official and not official.get("live_api_verified"):
        exception="OFFICIAL_API_UNREACHABLE_" + official.get("error","")[:130]
    rows.append({
      "artwork_id":id,"title":r["title"],"artist":r["artist"],"editorial_state":r["editorial_state"],
      "approved_107":r["approved_primary_cohort"],"source_lane":r["source_lane"],
      "file_licence_audit_status":status,"required_licence_action":next_task,
      "source_url":sourceurl,"museum_api":official.get("api_url") if official else None,
      "museum_current_live_policy":official.get("official_open_access_rights") if official else None,
      "museum_api_checked":official.get("live_api_verified") if official else False,
      "commons_file_title":commons_titles.get(id),"commons_live_file_metadata":co,
      "commons_file_licence_class":cc,
      "museum_source_recorded_rights":source.get("rights"),
      "museum_source_policy_recorded":source.get("rightsPolicyUrl"),
      "recorded_archive_image_sha256":pinned,
      "candidate_archived_original_sha256":acq.get("originalSha256"),
      "archived_photo_hash_matches_candidate_original":matched,
      "previous_official_sha_check":bool(one and one.get("source_photo_bytes_same_as_frozen_archive")),
      "licence_check_unresolved_detail":exception,
      "quality_review_performed_in_this_pass":False,
      "image_bytes_downloaded_in_this_pass":0,
      "production_released":False})
counts=Counter(z["file_licence_audit_status"] for z in rows)
byapproval=Counter(z["file_licence_audit_status"] for z in rows if z["approved_107"])
assert len(rows)==383 and len({z["artwork_id"] for z in rows})==383
assert len([z for z in rows if z["approved_107"]])==107
assert sum(counts.values())==383
report={"schema":"AO_SACRED_ART_LICENCE_FIRST_383_20261029_V1",
        "date":"2026-10-29",
        "scope":"Complete license-only audit. Original photographic quality expressly deferred.",
        "no_image_downloads":True,"original_artwork_selection_changes":0,
        "policy":{"license_free_preference":"CC0 or verified public-domain exact-image reproduction; conditional CC BY / BY-SA requires attribution and license obligations",
            "exact_source_sha_required_for_final_no_licence_holds":True,
            "subject_public_domain_is_not_photo_rights":True,
            "copyright_conflicts_require_hold":True,
            "do_not_publish_unverified":True},
        "evidence_inputs":["data/calendar/sacred-art-curator-queues-383-20261029.v1.json",
           "data/calendar/sacred-art-candidates.v1.json",
           "data/calendar/sacred-art-bulk-approved-107-photo-gates-20261028.csv",
           "data/calendar/sacred-art-22-museum-official-cc0-photo-sha-20261028.v1.json"],
        "counts":{"total_canonical_records":len(rows),"approved_artworks":107,
            "museum_unique_live_object_checks":len(unique_official),
            "museum_object_apis_cc0":sum(v.get("official_open_access_rights")=="CC0_ELIGIBLE" for v in verified.values()),
            "museum_object_api_holds":sum(not v.get("live_api_verified") for v in verified.values()),
            "commons_exact_file_titles_queried":len(names),
            "commons_exact_file_metadata_received":sum(v.get("live_file_found",False) for v in commons.values()),
            "commons_metadata_api_batch_errors":len(w_errors),
            "licence_dispositions":dict(counts),"approved_107_dispositions":dict(byapproval),
            "new_final_curatorial_photo_certifications":0,"image_files_downloaded":0,
            "production_releases":0,"cost_eur":0},
        "errors":{"commons_batch":w_errors},
        "records":rows}
p=DIR/"sacred-art-licence-first-383-exact-source-audit-20261029.v1.json"
p.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
fields=["artwork_id","title","artist","editorial_state","approved_107","file_licence_audit_status","required_licence_action","source_url",
        "museum_api","museum_current_live_policy","commons_file_title","commons_file_licence_class","recorded_archive_image_sha256",
        "archived_photo_hash_matches_candidate_original","licence_check_unresolved_detail"]
with (DIR/"sacred-art-licence-first-383-review-20261029.csv").open("w",newline="",encoding="utf-8") as f:
    w=csv.DictWriter(f,fieldnames=fields,extrasaction="ignore",lineterminator="\n");w.writeheader();w.writerows(rows)
print(json.dumps(report["counts"],ensure_ascii=False,sort_keys=True))
