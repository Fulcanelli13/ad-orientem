#!/usr/bin/env python3
"""One no-retry photo discovery pass for the 96 Places with no existing selected original.

Never re-audits the existing-source queue. No image bytes or public app edits.
HTTP 5xx skips only the affected query/site; HTTP 429 stops the whole batch.
"""
from __future__ import annotations
import argparse
import importlib.util
import json
import pathlib
import sys
import time
import urllib.error

ROOT=pathlib.Path(__file__).resolve().parents[2]
MODULE=ROOT/"tools/atlas/discover-sacred-atlas-151-noncommons-openverse.py"
SPEC=importlib.util.spec_from_file_location("atlas_noncommons",MODULE)
source=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(source)

PRIORITY=("PRESERVE_NONE_SELECTED","MULTISOURCE_DISCOVERY","GALLERY_ONLY_SEEK_EXACT_COVER")


def targets(scope):
    rows=scope["places"]
    result=[r for r in rows if r["previous_lane"] in PRIORITY]
    result.sort(key=lambda x:(PRIORITY.index(x["previous_lane"]),-x["priority"],x["place_id"]))
    if len(result)!=96 or len({x["place_id"] for x in result})!=96:
        raise ValueError("NEW_SOURCE_96_SCOPE_MISMATCH")
    if any(x["already_selected_source"] for x in result):
        raise ValueError("FROZEN_SELECTED_ORIGINAL_IN_NEW_SOURCE_QUEUE")
    return result


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--scope",type=pathlib.Path,default=source.DEFAULT_SCOPE)
    ap.add_argument("--out",type=pathlib.Path,default=pathlib.Path("/tmp/ao-atlas-96-new-source-openverse.json"))
    ap.add_argument("--max-sites",type=int,default=96)
    ap.add_argument("--spacing-seconds",type=float,default=3)
    args=ap.parse_args()
    if not (1<=args.max_sites<=96 and args.spacing_seconds>=2):
        ap.error("max-sites 1..96, minimum spacing 2s")
    sc=json.loads(args.scope.read_text(encoding="utf8"))
    if sc["schema"]!="AO_SACRED_ATLAS_151_COVERAGE_FIRST_NONCOMMONS_V1":
        raise ValueError("WRONG_SCOPE_SCHEMA")
    todo=targets(sc)[:args.max_sites]
    result={
       "schema":"AO_SACRED_ATLAS_151_NONCOMMONS_OPENVERSE_DISCOVERY_V1",
       "date":"2026-11-05","research_only":True,"automated_publications":0,
       "photo_coverage_goal":"96 previously unselected or no-source Places; exclude all 55 previous-source holds",
       "source_filter":"Openverse CC BY/SA, CC0, PD, excluding Wikimedia",
       "outcome":"IN_PROGRESS","sites_in_scope":len(todo),"sites_queried":0,
       "sites_with_candidates":0,"image_candidate_records":0,"provider_requests":0,
       "stopped_http_429":False,"provider_http_5xx_skipped":0,
       "failed_place_id":None,"error":None,"places":[]
    }
    last=None
    def write():
        args.out.parent.mkdir(parents=True,exist_ok=True)
        args.out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    for row in todo:
        item={"place_id":row["place_id"],"name":row["name"],"country":row["country"],
              "prior_photo_choice":row["prior_photo_choice"],"already_selected_source":None,
              "status":"NOT_YET_SEARCHED","query_used":None,"candidates":[]}
        result["places"].append(item)
        for query in row["queries"][:2]:
            if last is not None:
                delay=args.spacing_seconds-(time.monotonic()-last)
                if delay>0:time.sleep(delay)
            last=time.monotonic()
            result["provider_requests"]+=1
            item["query_used"]=query
            try:
                response=source.request(query)
                item["candidates"]=source.select_results(response,row,query)
                item["status"]="CANDIDATES_UNVERIFIED" if item["candidates"] else "NO_MATCH_IN_OPENVERSE"
            except urllib.error.HTTPError as e:
                if e.code==429:
                    item["status"]="STOP_HTTP_429";result["outcome"]="PARTIAL_RATE_LIMIT_NO_RETRY"
                    result["stopped_http_429"]=True;result["error"]="HTTP 429"
                    result["failed_place_id"]=row["place_id"];write()
                    print("Stop 429, no retries",row["place_id"],file=sys.stderr,flush=True)
                    return 2
                if e.code in (500,502,503,504):
                    item["status"]="HTTP_"+str(e.code)+"_SKIPPED_NO_RETRY"
                    result["provider_http_5xx_skipped"]+=1
                    break
                item["status"]="PROVIDER_HTTP_"+str(e.code)+"_STOP_NO_RETRY"
                result["outcome"]="PARTIAL_HTTP_ERROR_NO_RETRY"
                result["failed_place_id"]=row["place_id"]
                result["error"]="HTTP "+str(e.code);write();return 2
            except Exception as e:
                item["status"]="PROVIDER_ERROR_STOP_NO_RETRY"
                result["outcome"]="PARTIAL_PROVIDER_ERROR_NO_RETRY"
                result["failed_place_id"]=row["place_id"]
                result["error"]=type(e).__name__+": "+str(e)[:220];write();return 2
            if item["candidates"]:
                break
        result["sites_queried"]+=1
        result["sites_with_candidates"]+=int(bool(item["candidates"]))
        result["image_candidate_records"]+=len(item["candidates"])
        if result["sites_queried"]%10==0:
            write()
            print(f"NEW-SOURCE {result['sites_queried']}/{len(todo)} Places; {result['sites_with_candidates']} with image leads; {result['provider_http_5xx_skipped']} provider 5xx skipped",flush=True)
    result["outcome"]="COMPLETE_SOURCE_DISCOVERY_NOT_PUBLICATION"
    write()
    print(json.dumps({k:v for k,v in result.items() if k!="places"}),flush=True)
    return 0

if __name__=="__main__":sys.exit(main())
