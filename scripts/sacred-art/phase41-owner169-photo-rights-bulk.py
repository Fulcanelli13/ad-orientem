#!/usr/bin/env python3
"""Phase41: read-only photo-rights/source readiness for 169 owner-handpicked artworks.

The artist/object identities were curated in Phase40. This audit never modifies the
canonical 177-row selection list, published images or Prayer/Calendar assignments.
HTTP metadata (especially rights at *object* scope) is not photo reuse permission.
"""
from __future__ import annotations
import collections
import concurrent.futures
import csv
import json
import re
import time
import urllib.parse
from pathlib import Path

import requests

ROOT=Path("scripts/sacred-art/artworks_177.csv")
BASE=Path("data/research/sacred-art/phase40-nine-artworks-oai-identity-conclusions-eight-remaining-20261107.v1.json")
OUT=Path("artifacts/sacred-art-phase41-owner169-photo-audit")
OUT.mkdir(parents=True,exist_ok=True)
UA={"User-Agent":"AdOrientemArtResearch/1.1 (source metadata only; project GitHub Fulcanelli13/ad-orientem)",
    "Accept":"application/json"}
WIKI="https://commons.wikimedia.org/w/api.php"
ALLOWED_IIIF={"iiif.kmska.be","imagehub.mskgent.be","dam.museabrugge.be",
              "imagehub.vlaamsekunstcollectie.be","iiif.parismusees.paris.fr",
              "images.metmuseum.org","www.museabrugge.be"}
TIMEOUT=(6,18)
MAX_BYTES=2_500_000

def bounded_json(url,params=None):
    result={"status":None,"error":"","doc":None}
    try:
        with requests.get(url,params=params,headers=UA,timeout=TIMEOUT,stream=True,
                          allow_redirects=False) as r:
            result["status"]=r.status_code
            chunks=[];size=0
            for chunk in r.iter_content(16384):
                size+=len(chunk)
                if size>MAX_BYTES:
                    result["error"]="RESPONSE_TOO_LARGE"
                    break
                chunks.append(chunk)
            if not result["error"] and r.status_code==200:
                result["doc"]=json.loads(b"".join(chunks))
            elif not result["error"]:
                result["error"]=f"HTTP_{r.status_code}"
    except Exception as ex:
        result["error"]=f"{type(ex).__name__}:{str(ex)[:140]}"
    return result

def safe_manifest(url):
    p=urllib.parse.urlsplit(url or "")
    return p.scheme=="https" and p.hostname in ALLOWED_IIIF and (p.path.endswith(".json") or "manifest" in p.path)

def crawl_rights(manifest):
    url=manifest.strip()
    out={"manifest":url,"status":"NOT_MAPPED" if not url else "NOT_FETCHED",
         "http_status":None,"manifest_rights":None,"canvas_rights":[],
         "candidate_images":0,"canvas_count":0,"multiple_canvases":False,
         "scope":"SOURCE_METADATA_ONLY"}
    if not url:return out
    if not safe_manifest(url):
        out["status"]="UNSUPPORTED_OR_UNSAFE_MANIFEST";return out
    res=bounded_json(url)
    out["http_status"]=res["status"]
    if res["doc"] is None:
        out["status"]="FETCH_FAILED";out["error"]=res["error"];return out
    doc=res["doc"]
    out["status"]="RETRIEVED"
    out["manifest_rights"]=doc.get("rights") or doc.get("license") or doc.get("attribution") or None
    canvases=[]
    if doc.get("sequences"):
        canvases=(doc["sequences"][0].get("canvases") or [])
        for c in canvases[:30]:
            for anno in c.get("images",[])[:2]:
                resource=anno.get("resource") or {}
                out["canvas_rights"].append(resource.get("rights") or resource.get("license") or
                     anno.get("rights") or anno.get("license"))
                out["candidate_images"]+=1
    elif doc.get("items"):
        canvases=doc.get("items") or []
        for c in canvases[:30]:
            for page in (c.get("items") or [])[:2]:
                for anno in (page.get("items") or [])[:2]:
                    body=anno.get("body") or {}
                    bodies=body if isinstance(body,list) else [body]
                    for b in bodies[:2]:
                        out["canvas_rights"].append(b.get("rights") or b.get("license") or
                             anno.get("rights") or anno.get("license"))
                        out["candidate_images"]+=1
    out["canvas_count"]=len(canvases)
    out["multiple_canvases"]=len(canvases)!=1
    rights=[str(x) for x in [out["manifest_rights"],*out["canvas_rights"]] if x]
    out["rights_metadata_values"]=sorted(set(rights))[:20]
    if any(("creativecommons.org/publicdomain/zero" in x.lower() or
            "creativecommons.org/publicdomain/mark" in x.lower()) for x in rights):
        out["rights_metadata_class"]="EXPLICIT_CC0_OR_PDM_PRESENT__PHOTO_SCOPE_REVIEW"
    elif any(("rightsstatements.org" in x.lower() or
            "in copyright" in x.lower()) for x in rights):
        out["rights_metadata_class"]="RIGHTS_STATEMENT_PRESENT__REVIEW"
    elif rights:
        out["rights_metadata_class"]="OTHER_RIGHTS_METADATA__REVIEW"
    else:
        out["rights_metadata_class"]="NO_EXPLICIT_MACHINE_READABLE_PHOTO_RIGHTS"
    return out

def parse_commons_url(url):
    parsed=urllib.parse.urlsplit(url or "")
    if parsed.hostname!="commons.wikimedia.org" or not parsed.path.startswith("/wiki/File:"):
        return None
    return urllib.parse.unquote(parsed.path.removeprefix("/wiki/"))

def query_commons(batch):
    titles="|".join(x[1] for x in batch)
    params={"action":"query","format":"json","formatversion":"2","prop":"imageinfo",
            "titles":titles,"iiprop":"size|mime|extmetadata","maxlag":"3"}
    r=bounded_json(WIKI,params)
    output={}
    if r["doc"]:
        for page in r["doc"].get("query",{}).get("pages",[]):
            title=page.get("title","")
            info=(page.get("imageinfo") or [{}])[0]
            meta=info.get("extmetadata") or {}
            output[title]={
                "api_status":"FOUND" if info.get("width") else "MISSING_OR_NO_IMAGEINFO",
                "width":info.get("width"),"height":info.get("height"),
                "mime":info.get("mime"),
                "commons_license_short":(meta.get("LicenseShortName") or {}).get("value"),
                "commons_license_url":(meta.get("LicenseUrl") or {}).get("value"),
                "commons_restrictions":(meta.get("Restrictions") or {}).get("value"),
                "commons_attribution_required":(meta.get("AttributionRequired") or {}).get("value"),
                "image_description_source":"ORIGINAL_OWNER_HANDPICKED_COMMONS_FILE"
            }
    return {"batch_ids":[x[0] for x in batch],"http_status":r["status"],"error":r["error"],
            "pages":output}

def main():
    with ROOT.open(encoding="utf-8-sig",newline="") as f:
        rows=list(csv.DictReader(f))
    led=json.loads(BASE.read_text(encoding="utf8"))
    assert len(rows)==177 and len({x["registry_id"] for x in rows})==177
    held={x["registry_id"] for x in led["retained_eight"]}
    assert len(held)==8
    supported=[x for x in rows if x["registry_id"] not in held]
    assert len(supported)==169
    manifests={r["iiif_manifest"].strip() for r in supported if r.get("iiif_manifest")}
    manifests=sorted(manifests)
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
        manifest_results=list(ex.map(crawl_rights,manifests))
    mapped={r["manifest"]:r for r in manifest_results}
    lookups=[]
    for x in supported:
        key=parse_commons_url(x["commons_url"])
        if key:lookups.append((x["registry_id"],key))
    batches=[lookups[n:n+8] for n in range(0,len(lookups),8)]
    # Be respectful of Wikimedia rate limiting; limit concurrency to two batches.
    results=[]
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as ex:
        results=list(ex.map(query_commons,batches))
    commons={}
    for b, res in zip(batches,results):
        for rid,title in b:
            match=res["pages"].get(title) or res["pages"].get(title.replace("_"," "))
            commons[rid]=match or {"api_status":"API_UNRESOLVED","http_status":res["http_status"],
                 "error":res["error"]}
    evidence=[]
    for row in rows:
        rid=row["registry_id"]
        hold=rid in held
        cm=commons.get(rid,{})
        iiif=mapped.get((row.get("iiif_manifest") or "").strip(),{})
        selected_short=(int(row.get("original_short_px") or 0) if
                        str(row.get("original_short_px") or "").isdigit() else None)
        evidence.append({
            "registry_id":rid,"painting":row["title"],"selected_artist":row["artist"],
            "holding":row["museum"],"museum_accession_from_older_registry":row.get("museum_accession",""),
            "identity_gate":"HOLD_EXACT_OBJECT" if hold else "SUPPORTED_PHASE40",
            "selected_original_commons":row["commons_url"],
            "selected_current_short_px":selected_short,
            "selected_original_dimensions_from_prior_registry":[row.get("original_width_px"),row.get("original_height_px")],
            "commons_metadata":cm,
            "iiif_manifest":row.get("iiif_manifest",""),
            "museum_metadata":iiif or {"status":"NO_IIIF_MANIFEST_MAPPED"},
            "gallery_photo_replacement_approved":False,
            "same_photo_geometric_comparison":"SEPARATE_EXISTING_IMAGE_QA_NOT_RECALCULATED",
            "photo_rights_status":"NOT_APPROVED_REQUIRE_IMAGE_SCOPED_VERIFICATION",
            "release_decision":"RESEARCH_ONLY_DO_NOT_PUBLISH"
        })
    counts=collections.Counter(str(x.get("api_status","NOT_QUERIED")) for x in commons.values())
    manifest_counts=collections.Counter(x["status"] for x in manifest_results)
    rights_counts=collections.Counter(x.get("rights_metadata_class","NO_FETCH") for x in manifest_results)
    short_counts=collections.Counter(
       "UNDER_600" if x.get("selected_current_short_px") and x["selected_current_short_px"]<600
       else "600_TO_899" if x.get("selected_current_short_px") and x["selected_current_short_px"]<900
       else "900_PLUS" if x.get("selected_current_short_px") else "UNKNOWN"
       for x in evidence if x["identity_gate"]=="SUPPORTED_PHASE40")
    summary={"phase":"41","registry_rows":len(rows),"identity_supported":169,"identity_holds":8,
        "selected_commons_api_statuses":dict(counts),"selected_commons_api_requests":len(batches),
        "mapped_museum_iiif_manifests":len(manifests),"manifest_fetch_status":dict(manifest_counts),
        "manifest_rights_metadata":dict(rights_counts),"current_selected_short_edge_bands":dict(short_counts),
        "geometric_photo_matches_new":0,"image_downloads":0,
        "photo_replacements_approved":0,"published_assets_changed":0,
        "policy":"The selected Commons license is NOT the license of an unrelated candidate museum reproduction. IIIF manifest/object metadata does not by itself clear photographic rights, crop, color or fidelity."}
    (OUT/"source_photo_readiness_177.json").write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    fields=["registry_id","painting","selected_artist","holding","identity_gate","selected_original_commons",
            "selected_current_short_px","commons_api_status","commons_license_short",
            "museum_iiif","manifest_status","manifest_rights_class","photo_rights_status",
            "same_photo_geometric_comparison","release_decision"]
    with (OUT/"source_photo_readiness_177.csv").open("w",encoding="utf8",newline="") as f:
        writer=csv.DictWriter(f,fieldnames=fields);writer.writeheader()
        for x in evidence:
            cm=x["commons_metadata"];mu=x["museum_metadata"]
            writer.writerow({"registry_id":x["registry_id"],"painting":x["painting"],
                "selected_artist":x["selected_artist"],"holding":x["holding"],
                "identity_gate":x["identity_gate"],"selected_original_commons":x["selected_original_commons"],
                "selected_current_short_px":x["selected_current_short_px"],
                "commons_api_status":cm.get("api_status","NOT_QUERIED"),
                "commons_license_short":cm.get("commons_license_short",""),
                "museum_iiif":x["iiif_manifest"],
                "manifest_status":mu.get("status",""),"manifest_rights_class":mu.get("rights_metadata_class",""),
                "photo_rights_status":x["photo_rights_status"],
                "same_photo_geometric_comparison":x["same_photo_geometric_comparison"],
                "release_decision":x["release_decision"]})
    (OUT/"summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print(json.dumps(summary,ensure_ascii=False,indent=2),flush=True)
if __name__=="__main__":
    main()
