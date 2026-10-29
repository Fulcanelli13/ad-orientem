#!/usr/bin/env python3
"""P69: bulk, bounded Wikimedia Commons discovery for canonical Places and relics.

Output is RESEARCH_ONLY_CANDIDATE, never an image approval or app media asset.
No uploads, credentials, paid API, mutation of original owner registries or
automatic workflow scheduling. Only a deliberately invoked --discover queries
Commons; --plan and tests run entirely offline.
"""
import argparse
import html
import json
import os
import re
import sys
import tempfile
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlsplit
from urllib.request import Request, urlopen

ROOT=Path(__file__).resolve().parents[1]
GEO=ROOT/"data/geography/seed-registry.v1.json"
RELIC=ROOT/"data/explore/sacred-phenomena-seed.v1.json"
MEDIA=ROOT/"data/geography/approved-place-media.v1.json"
GALLERY=ROOT/"data/geography/approved-place-gallery.v1.json"
API="https://commons.wikimedia.org/w/api.php"
ALLOWED_LICENSES={"CC0 1.0","CC BY 4.0","CC BY SA 4.0","CC BY 3.0",
                  "CC BY SA 3.0","CC BY SA 2.0","CC BY 2.5","PUBLIC DOMAIN","PDM 1.0"}
MAX_REQUESTS=400
MAX_CANDIDATES=500

def load(path):
    return json.loads(path.read_text(encoding="utf-8"))

def compact(value):
    return re.sub(r"\s+"," ",html.unescape(re.sub(r"<[^>]*>"," ",str(value or "")))).strip()

def safe_query(value):
    value=compact(value)
    # Commons search treats these as query syntax; keep entity names only.
    value=re.sub(r'["{}|;\\[\]()]'," ",value)
    return " ".join(value.split())[:115]

def planned_rows(batch=0,batch_size=150,include_relics=True):
    if not isinstance(batch,int) or batch<0 or batch>200: raise ValueError("Batch must be 0..200")
    if batch_size<100 or batch_size>200: raise ValueError("Place batch must be 100..200")
    geography=load(GEO);relics=load(RELIC)
    approved=load(MEDIA)["items"];gallery=load(GALLERY)["items"]
    known={x["place_id"]:x for x in geography["places"]}
    hero={x["place_id"] for x in approved if x.get("status")=="APPROVED"}
    gallery_places={x["place_id"] for x in gallery if x.get("status")=="APPROVED"}
    published_sources={x.get("source_url") for x in approved+gallery if x.get("status")=="APPROVED"}
    # Fixed ID ordering: one batch never silently reallocates sites after
    # future assets are published. No duplicate Places or additional pins.
    # Stable geography preference for the Indian Ocean and Ireland before
    # the wider world; never shuffle IDs after media approvals.
    places=sorted(geography["places"],key=lambda x:(
      0 if x.get("address",{}).get("country_code") in {"MU","IE"} else 1,
      x["place_id"]))
    assert len(places)==len(known)
    start=batch*batch_size
    selected=places[start:start+batch_size]
    result=[]
    for x in selected:
        ident=x["place_id"]
        city=compact(x.get("address",{}).get("city"))
        official=compact(x["name"]["official"])
        alias=next((compact(a) for a in x["name"].get("aliases",[]) if a),None)
        query=safe_query(official+" "+city)
        result.append({
          "owner":"GEOGRAPHY","entity_id":ident,"place_id":ident,
          "entity_label":official,"alternate_name":alias,
          "city":city,"country_code":x["address"].get("country_code"),
          "place_type":x.get("place_type"),
          "search_query":query,
          "has_approved_hero":ident in hero,
          "has_approved_gallery":ident in gallery_places,
          "priority":"P1_NO_PHOTOGRAPH" if ident not in hero and ident not in gallery_places
              else ("P2_GALLERY_GAP" if ident not in gallery_places else "P3_EXISTING_MEDIA"),
          "publication":"RESEARCH_ONLY_QUERY",
        })
    # The first pass exhausts the finite existing relic catalogue; other
    # batches address Places. A flag can repeat relic-only discovery later.
    if include_relics and batch==0:
        for x in sorted(relics["relics"],key=lambda x:x["id"]):
            place=known.get(x["place_id"])
            if not place:raise ValueError("Orphan relic: "+x["id"])
            name=compact(x["title_en"])
            city=compact(place.get("address",{}).get("city"))
            result.append({
              "owner":"SACRED_PHENOMENA","entity_id":x["id"],"place_id":x["place_id"],
              "entity_label":name,"city":city,
              "country_code":place["address"].get("country_code"),
              "relic_kind":x.get("relic_kind"),
              "search_query":safe_query(name+" "+city),
              "custody_source_url":x.get("source_url"),
              "priority":"P0_RELIC_SUBJECT",
              "publication":"RESEARCH_ONLY_QUERY",
            })
    if len(result)>MAX_REQUESTS:raise ValueError("Too many search requests")
    return result,published_sources,len(places)

def commons_query(query,request_timeout=18):
    params=urlencode({
      "action":"query","format":"json","formatversion":"2",
      "generator":"search","gsrsearch":query,"gsrnamespace":"6",
      "gsrlimit":"5","prop":"imageinfo",
      "iiprop":"extmetadata|sha1|size|mime|url",
    })
    url=API+"?"+params
    request=Request(url,headers={
      "User-Agent":"AdOrientemMediaResearch/1.0 (noncommercial canonical-site provenance review)",
      "Accept":"application/json",
    })
    with urlopen(request,timeout=request_timeout) as res:
        if urlsplit(res.geturl()).hostname!="commons.wikimedia.org":
            raise ValueError("Commons API redirected to unknown host")
        data=res.read(2_000_001)
        if len(data)>2_000_000:raise ValueError("Commons metadata response oversized")
    result=json.loads(data)
    if "error" in result:raise ValueError("Commons API: "+str(result["error"].get("code")))
    return result

def license_info(meta):
    def value(k):
        return compact((meta.get(k) or {}).get("value"))
    name=value("LicenseShortName").upper().replace("-"," ").replace("  "," ")
    href=value("LicenseUrl")
    # Commons CC0 pages commonly report an HTTP Creative Commons URL.
    # Canonicalize only the standard CC0 deed, retaining all publication
    # barriers: a possible-free result is NEVER rights-cleared.
    if name=="CC0":
        name="CC0 1.0"
        parsed=urlsplit(href)
        if parsed.hostname in {"creativecommons.org","www.creativecommons.org"} and \
            parsed.path.rstrip("/").startswith("/publicdomain/zero/1.0"):
            href="https://creativecommons.org/publicdomain/zero/1.0/"
        elif not href:
            href="https://creativecommons.org/publicdomain/zero/1.0/"
    if href and urlsplit(href).scheme!="https":href=None
    valid=name in ALLOWED_LICENSES and (bool(href) or name=="PUBLIC DOMAIN")
    return name,href,valid

def candidates_from_response(task,response,already_approved):
    pages=response.get("query",{}).get("pages",[])
    out=[]
    for page in pages:
        title=page.get("title","")
        if page.get("ns")!=6 or not title.startswith("File:"):continue
        info=(page.get("imageinfo") or [None])[0]
        if not info:continue
        if info.get("mime") not in {"image/jpeg","image/png","image/webp"}:continue
        if min(info.get("width",0),info.get("height",0))<650:continue
        sha=info.get("sha1")
        if not re.fullmatch(r"[0-9a-f]{40}",str(sha or "")):continue
        link=info.get("descriptionurl")
        if not (link and urlsplit(link).scheme=="https" and
                urlsplit(link).hostname=="commons.wikimedia.org"):continue
        if link in already_approved:continue
        license_name,license_url,license_candidate=license_info(info.get("extmetadata") or {})
        author=compact(((info.get("extmetadata") or {}).get("Artist") or {}).get("value"))
        out.append({
          "schema":"AO_P69_COMMONS_CANDIDATE_V1",
          "publication":"RESEARCH_ONLY_NOT_APPROVED",
          "owner":task["owner"],"entity_id":task["entity_id"],
          "place_id":task["place_id"],"place_label":task.get("entity_label"),
          "search_query":task["search_query"],
          "commons_page_id":page.get("pageid"),
          "commons_file_title":title,
          "commons_file_page":link,
          "commons_original_sha1":sha,
          "width":info["width"],"height":info["height"],
          "mime":info["mime"],"author_unverified":author[:600],
          "license_metadata":license_name,"license_url_metadata":license_url,
          "screen":"POSSIBLE_FREE_REUSE_REQUIRES_RIGHTS_AND_SUBJECT_REVIEW" if license_candidate
                   else "RIGHTS_METADATA_HOLD",
          "subject_identity":"UNVERIFIED_SEARCH_MATCH",
          "photographed_at":"UNKNOWN",
          "visual_quality":"NOT_INSPECTED",
          "source_bytes_hash_verified":False,
          "image_binary_archived":False,
          "current_site_display":"UNVERIFIED",
          "rights_for_depicted_artwork":"NOT_ASSESSED",
        })
    # Search order is not editorial quality; stable for reproducible exports.
    return sorted(out,key=lambda x:(x["screen"]!="POSSIBLE_FREE_REUSE_REQUIRES_RIGHTS_AND_SUBJECT_REVIEW",x["commons_file_title"]))[:4]

def output_jsonl(path,items):
    if not path:
        for item in items:print(json.dumps(item,ensure_ascii=False))
        return
    resolved=Path(path).resolve()
    research=(ROOT/"data/geography/research").resolve()
    if research not in resolved.parents or resolved.suffix!=".jsonl":
        raise ValueError("Candidate output must be a .jsonl inside data/geography/research")
    if resolved.exists():raise ValueError("Output exists; use a new batch/review filename")
    resolved.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.NamedTemporaryFile("w",encoding="utf-8",dir=resolved.parent,
                                     delete=False,prefix=".p69-") as out:
        temporary=Path(out.name)
        for item in items:out.write(json.dumps(item,ensure_ascii=False)+"\n")
    os.replace(temporary,resolved)

def main(argv=None):
    parser=argparse.ArgumentParser()
    parser.add_argument("--mode",choices=["plan","discover"],default="plan")
    parser.add_argument("--batch",type=int,default=0)
    parser.add_argument("--batch-size",type=int,default=150)
    parser.add_argument("--without-relics",action="store_true")
    parser.add_argument("--candidate-cap",type=int,default=500)
    parser.add_argument("--max-requests",type=int,default=300)
    parser.add_argument("--delay",type=float,default=0.7)
    parser.add_argument("--output")
    opts=parser.parse_args(argv)
    if not 1<=opts.candidate_cap<=MAX_CANDIDATES:parser.error("Max 500 candidates")
    if not 1<=opts.max_requests<=MAX_REQUESTS:parser.error("Max 400 requests")
    if not 0.5<=opts.delay<=10:parser.error("Delay must be 0.5–10 seconds")
    tasks,already_approved,total=planned_rows(opts.batch,opts.batch_size,
                                                 not opts.without_relics)
    if opts.mode=="plan":
        output_jsonl(opts.output,tasks)
        print(json.dumps({"mode":"PLAN_ONLY_NO_NETWORK",
          "batch":opts.batch,"total_places":total,
          "selected_places":sum(x["owner"]=="GEOGRAPHY" for x in tasks),
          "selected_relics":sum(x["owner"]=="SACRED_PHENOMENA" for x in tasks),
          "requests_if_discovered":len(tasks),
          "unverified_photos_created":0,
          "note":"No Commons calls, no image approval or copied binaries."}),file=sys.stderr)
        return 0
    if not opts.output:parser.error("--discover requires --output")
    if len(tasks)>opts.max_requests:parser.error("Increase --max-requests to cover the whole planned batch (up to 400)")
    candidates=[];failures=[];duplicate_sha=set()
    for i,task in enumerate(tasks):
        if len(candidates)>=opts.candidate_cap:break
        try:
            response=commons_query(task["search_query"])
            for c in candidates_from_response(task,response,already_approved):
                # Same image might depict distinct subjects. Keep the exact
                # separate entity link if found, but don't inflate the file count.
                k=(c["entity_id"],c["commons_original_sha1"])
                if k in duplicate_sha:continue
                duplicate_sha.add(k);candidates.append(c)
                if len(candidates)>=opts.candidate_cap:break
        except (URLError,HTTPError,ValueError,TimeoutError,KeyError,TypeError) as exc:
            failures.append({"entity_id":task["entity_id"],"error_type":type(exc).__name__})
        if (i+1)%25==0:
            print(f"Discovery progress: {i+1}/{len(tasks)} queries, "
                  f"{len(candidates)} unverified candidates, {len(failures)} errors",file=sys.stderr)
        if i+1<len(tasks):time.sleep(opts.delay)
    if not candidates and failures:raise RuntimeError("Commons discovery failed without candidates; no output written")
    output_jsonl(opts.output,candidates)
    print(json.dumps({
       "mode":"RESEARCH_ONLY_COMMONS_DISCOVERY",
       "place_batch":opts.batch,
       "queries_planned":len(tasks),
       "entities_with_candidates":len({x["entity_id"] for x in candidates}),
       "candidates":len(candidates),
       "rights_metadata_possible":sum(x["screen"].startswith("POSSIBLE") for x in candidates),
       "held_for_rights":sum(x["screen"]=="RIGHTS_METADATA_HOLD" for x in candidates),
       "errors":len(failures),"sample_errors":failures[:8],
       "approved_photographs":0,"new_asset_files":0,
       "output":opts.output,
    },ensure_ascii=False),file=sys.stderr)
    return 0

if __name__=="__main__":
    sys.exit(main())
