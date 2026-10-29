#!/usr/bin/env python3
"""P70 recovery: pace Commons requests, report every failed exact entity ID.

No binary downloads, approval, authentication, main writes, or unbounded
crawl. Output only review-only source metadata for the original P69 batch.
"""
import argparse,importlib.util,json,sys,time
from pathlib import Path
from urllib.error import HTTPError,URLError
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("p69_media",ROOT/"tools/discover-sacred-media-p69.py")
p69=importlib.util.module_from_spec(spec);spec.loader.exec_module(p69)
def main():
  parser=argparse.ArgumentParser()
  parser.add_argument("--owner",choices=["GEOGRAPHY","SACRED_PHENOMENA"],required=True)
  parser.add_argument("--delay",type=float,default=2.0)
  parser.add_argument("--dry-run",action="store_true")
  args=parser.parse_args()
  if not 2<=args.delay<=12:parser.error("Require 2–12 seconds between requests")
  tasks,approved,_=p69.planned_rows(0,150)
  tasks=[x for x in tasks if x["owner"]==args.owner]
  if len(tasks)!=(150 if args.owner=="GEOGRAPHY" else 122):
    raise ValueError("Original P69 batch identity has changed: refuse scan")
  tag="places" if args.owner=="GEOGRAPHY" else "relics"
  if args.dry_run:
    print(json.dumps({"mode":"OFFLINE_NO_NETWORK","owner":args.owner,
      "queries":len(tasks),"first":tasks[0]["entity_id"],"last":tasks[-1]["entity_id"]}))
    return
  candidates=[];failures=[];seen=set();successful=0;attempted=0
  # Consecutive service failures stop network activity without falsely
  # describing unattempted entities as 0-image source results.
  consecutive_service_errors=0;stopped_reason=None
  for idx,task in enumerate(tasks):
    result=None;error=None;status=None
    attempted+=1
    for try_index in range(3):
      try:
        result=p69.commons_query(task["search_query"],request_timeout=15)
        break
      except HTTPError as e:
        status=e.code;error="HTTPError"
        if e.code in {429,502,503,504} and try_index<2:
          time.sleep(4*(try_index+1))
          continue
        break
      except (URLError,TimeoutError,ValueError,KeyError,TypeError) as e:
        error=type(e).__name__
        break
    if result is not None:
      successful+=1;consecutive_service_errors=0
      for row in p69.candidates_from_response(task,result,approved):
        key=(row["entity_id"],row["commons_original_sha1"])
        if key not in seen:
          seen.add(key);candidates.append(row)
    else:
      failures.append({"schema":"AO_P70_COMMONS_ERROR_V1",
        "publication":"RESEARCH_ONLY_RETRY_REQUIRED",
        "owner":args.owner,"entity_id":task["entity_id"],"place_id":task["place_id"],
        "search_query":task["search_query"],"error_type":error or "Unknown",
        "http_status":status})
      consecutive_service_errors=consecutive_service_errors+1 if status in {403,429,500,502,503,504} else 0
    if (idx+1)%20==0:
      print("P70_RECOVERY_PROGRESS",tag,idx+1,"/",len(tasks),
        "candidates",len(candidates),"errors",len(failures),file=sys.stderr,flush=True)
    if len(candidates)>=500:
      stopped_reason="CANDIDATE_CAP_500";break
    if consecutive_service_errors>=12:
      stopped_reason="TWELVE_CONSECUTIVE_SERVICE_ERRORS";break
    if idx+1<len(tasks):time.sleep(args.delay)
  for task in tasks[attempted:]:
    failures.append({"schema":"AO_P70_COMMONS_ERROR_V1",
       "publication":"RESEARCH_ONLY_NOT_YET_QUERIED",
       "owner":args.owner,"entity_id":task["entity_id"],"place_id":task["place_id"],
       "search_query":task["search_query"],"error_type":"NOT_ATTEMPTED",
       "http_status":None})
  directory=ROOT/"data/geography/research"
  candfile=directory/("p70-recovery-"+tag+"-candidates.jsonl")
  errfile=directory/("p70-recovery-"+tag+"-errors.jsonl")
  for path,rows in [(candfile,candidates),(errfile,failures)]:
    if path.exists():raise ValueError("Refuse to overwrite reviewed candidate research file "+str(path))
    path.write_text("".join(json.dumps(x,ensure_ascii=False)+"\n" for x in rows),encoding="utf8")
  counts={}
  for r in failures:
    k=str(r["http_status"]) if r["http_status"] else r["error_type"]
    counts[k]=counts.get(k,0)+1
  summary={"schema":"AO_P70_COMMONS_RECOVERY_SUMMARY_V1","owner":args.owner,
    "tasks":len(tasks),"queries_attempted":attempted,
    "queries_successful":successful,"queries_failed":len(failures)-(len(tasks)-attempted),
    "queries_unattempted":len(tasks)-attempted,
    "candidates":len(candidates),"distinct_entities":len({x["entity_id"] for x in candidates}),
    "error_status_counts":counts,"stop_reason":stopped_reason,
    "rights_cleared":0,"approved_photographs":0,"image_binaries":0}
  print("AO_P70_RECOVERY_SUMMARY="+json.dumps(summary,ensure_ascii=False))
  for row in candidates:
    print("AO_P70_RECOVERY_CANDIDATE="+json.dumps(row,ensure_ascii=False))
  for row in failures:
    print("AO_P70_RECOVERY_FAILURE="+json.dumps(row,ensure_ascii=False))
  if successful==0:
    raise RuntimeError("No source requests succeeded; recorded all failures, no approval")
if __name__=="__main__":
  main()
