#!/usr/bin/env python3
"""P80 one worldwide source-first sweep, no human reviews between worker groups.

All 2,579 CL2 physical research anchors from the existing immutable 11-shard
intake are accounted for. Wikidata country P18 lookups are metadata leads only:
never treated as a photograph of a verified church or as a licence grant.
"""
import argparse,datetime,hashlib,importlib.util,json,re,time,unicodedata
from collections import defaultdict,Counter
from difflib import SequenceMatcher
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
PLAN=ROOT/"data/directory/research/p80-worldwide-2579-campaign-plan.v1.json"
HARVESTER=ROOT/"tools/directory/harvest-wikidata-country-photo-index.py"
spec=importlib.util.spec_from_file_location("ao_country_p18",HARVESTER)
P18=importlib.util.module_from_spec(spec);spec.loader.exec_module(P18)
COMMON={"saint","sainte","santa","santo","san","st","church","chapel","cathedral","basilica",
"the","of","our","lady","notre","dame","de","des","del","di","du","da","dos",
"paroisse","eglise","église","iglesia","catholic","catholique","parish",
"parroquia","chapelle","kirche","pfarrkirche","maria","marie","virgin","mary"}

def check(cond,why):
 if not cond:raise ValueError(why)
def load_plan():
 d=json.loads(PLAN.read_text(encoding="utf8"))
 check(d["schema"]=="AO_P80_WORLDWIDE_2579_ONE_SWEEP_PLAN_V1","Wrong P80 plan")
 check(d["source_physical_anchors"]==2579 and d["source_countries"]==76,"Population changed")
 check(d["source_branch_commit"]=="f3408ab9448c1fd1fade2b8f0c2c161d3b0c21c2","Source branch not pinned")
 return d
def load_anchors(src,plan):
 m=json.loads((src/"manifest.json").read_text(encoding="utf8"))
 check(m["schema"]=="AO_DIRECTORY_UNIFIED_PHOTO_QUEUE_INDEX_V1","Wrong legacy intake schema")
 check(m["cl2_commit"]==plan["source_cl2_commit"],"CL2 source identity changed")
 check(m["counts"]["distinct_consolidated_physical_anchors"]==2579,"Expected exactly 2579 anchors")
 check(len(m["shards"])==11 and sum(x["count"] for x in m["shards"])==2579,"Missing 11 input shards")
 rows=[]
 for i,part in enumerate(m["shards"]):
  name=part["path"]
  check(re.fullmatch(r"anchors-[0-9]{4}-[0-9]{4}\.json",name),"Unsafe source filename")
  f=src/name
  b=f.read_bytes()
  check(len(b)==part["bytes"] and hashlib.sha256(b).hexdigest()==part["sha256"],"Original intake shard changed")
  shard=json.loads(b)
  check(shard["schema"]=="AO_DIRECTORY_UNIFIED_PHOTO_INTAKE_V1","Non-CL2 shard")
  check(shard["count"]==part["count"]==len(shard["records"]),"Source shard length drifted")
  rows.extend(shard["records"])
 check(len(rows)==2579 and len({x["physical_anchor_id"] for x in rows})==2579,"Duplicate or lost physical anchor IDs")
 check(all(x["publication"]=="RESEARCH_ONLY_NEVER_APP_VISIBLE" and not x["building_subject_verified"] and not x["approved_cover_photo"] for x in rows),"Unexpected approved source")
 countries=sorted({x["country"] for x in rows})
 check(len(countries)==76,"Expected 76 source countries; got "+str(len(countries)))
 return rows,countries,m

def clean_name(t):
 t=unicodedata.normalize("NFKD",str(t or "")).encode("ascii","ignore").decode("ascii").lower()
 return re.sub(r"\s+"," ",re.sub(r"[^a-z0-9]+"," ",t)).strip()
def name_tokens(n):
 return set(t for t in clean_name(n).split() if len(t)>3 and t not in COMMON)
def candidate_match(anchor,source):
 a=clean_name(anchor["name"]);b=clean_name(source["label"])
 if len(a)<10 or len(b)<10 or " " not in a or " " not in b:return 0.0
 tokens=name_tokens(a);target=name_tokens(b)
 if not tokens or not target:return 0.0
 overlap=tokens&target
 if not overlap:return 0.0
 containment=len(overlap)/min(len(tokens),len(target))
 sim=SequenceMatcher(None,a,b).ratio()
 score=0.52*containment+0.48*sim
 return round(score,4) if (score>=0.76 and (len(overlap)>=2 or sim>=0.89)) else 0.0

def harvest_group(anchors,countries,plan,index,out,delay_seconds=5):
 check(index in range(5),"Must process all five groups 0-4")
 check(delay_seconds>=4,"Wikidata query pacing must be >=4 s")
 batch=countries[index*16:(index+1)*16]
 check(len(batch)==(16 if index<4 else 12),"Country group width changed")
 out.mkdir(parents=True,exist_ok=True)
 results=[]
 for n,country in enumerate(batch):
  if n:time.sleep(delay_seconds)
  result=P18.call_country(country,limit=plan["max_wikidata_rows_per_country"],timeout=27,retries=1)
  result["campaign_group"]=index
  result["manual_subject_status"]="UNVERIFIED_COUNTRY_SOURCE_LEAD"
  result["queried_anchor_count"]=sum(x["country"]==country for x in anchors)
  target=out/("country-"+country+".json")
  target.write_text(json.dumps(result,ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf8")
  results.append({"country":country,"status":result["status"],"source_records":len(result["records"]),
    "truncated":result["truncated"],"anchor_count":result["queried_anchor_count"],"errors":result["errors"]})
  print("P80_COUNTRY="+json.dumps(results[-1]),flush=True)
 counts={"source_countries":len(batch),"anchors_accounted":sum(x["anchor_count"] for x in results),
   "countries_success":sum(x["status"]=="SUCCESS" for x in results),
   "countries_error":sum(x["status"]!="SUCCESS" for x in results),
   "source_metadata_records":sum(x["source_records"] for x in results),
   "truncated":sum(x["truncated"] for x in results),"photos_approved":0,"photos_published":0}
 audit={"schema":"AO_P80_WORLDWIDE_COUNTRY_GROUP_V1","group":index,"countries":batch,"counts":counts,"country_evidence":results}
 (out/("group-"+str(index)+".json")).write_text(json.dumps(audit,indent=2)+"\n",encoding="utf8")
 print("P80_GROUP="+json.dumps({"index":index,**counts}),flush=True)

def consolidate(anchors,countries,plan,harvest_root,out):
 out.mkdir(parents=True,exist_ok=True)
 files=sorted(harvest_root.glob("country-*.json"))
 check(len(files)==76,"Not all 76 country harvest files available")
 found={};error=[];truncated=[]
 image_keys=set();source_by_country=defaultdict(list)
 for f in files:
  country=f.stem.split("-")[-1]
  d=json.loads(f.read_text(encoding="utf8"))
  check(d["schema"]=="AO_WIKIDATA_CHURCH_IMAGES_BY_COUNTRY_V1" and d["country"]==country,"Source country schema mismatch")
  check(country not in found and country in countries,"Unexpected/duplicate country")
  check(d["publication"]=="RESEARCH_ONLY_NEVER_APP_VISIBLE","Unexpected approved Wikidata result")
  found[country]=d
  if d["status"]!="SUCCESS":error.append(country)
  if d["truncated"]:truncated.append(country)
  for row in d["records"]:
   check(row["country"]==country and str(row["image"]).startswith(("https://commons.wikimedia.org/","http://commons.wikimedia.org/")),"Unsafe foreign media pointer")
   image_keys.add((row["qid"],row["image"]))
   source_by_country[country].append(row)
 check(set(found)==set(countries),"Missing country results")
 # Use one short token index per country to avoid comparing thousands of
 # irrelevantly named churches to every CL2 record.
 indexes={}
 for country,items in source_by_country.items():
  idx=defaultdict(list)
  for i,item in enumerate(items):
   for word in name_tokens(item["label"]):idx[word].append(i)
  indexes[country]=idx
 output=[];anchors_with_leads=0;lead_links=0
 for a in anchors:
  idx=indexes.get(a["country"],{})
  tokens=name_tokens(a["name"])
  bucket=set()
  for token in tokens:bucket.update(idx.get(token,()))
  if len(bucket)>500:
   # Ambiguous names receive a hold, not an arbitrary nearest photo.
   bucket=set()
  scored=[]
  for i in bucket:
   item=source_by_country[a["country"]][i]
   val=candidate_match(a,item)
   if val:scored.append((val,item))
  scored.sort(key=lambda pair:(-pair[0],pair[1]["qid"]))
  leads=[{"wikidata_qid":item["qid"],"wikidata_label":item["label"],
     "commons_image_pointer":item["image"],"match_score":score,
     "match_state":"RESEARCH_LEAD_EXACT_BUILDING_NOT_VERIFIED",
     "original_sha1_checked":False,"license_checked":False,"site_approved":False}
     for score,item in scored[:3]]
  anchors_with_leads+=bool(leads);lead_links+=len(leads)
  country_data=found[a["country"]]
  output.append({"physical_anchor_id":a["physical_anchor_id"],"country":a["country"],
   "name":a["name"],"source_ids":a["source_ids"],
   "source_country_status":country_data["status"],
   "source_country_truncated":country_data["truncated"],
   "candidate_image_leads":leads,
   "review_status":"EXACT_BUILDING_IDENTITY_AND_MEDIA_RIGHTS_NOT_VERIFIED",
   "approved_exterior":False,"published":False})
 counts={"anchors_accounted":len(output),"countries_attempted":len(found),
   "successful_country_queries":len(found)-len(error),
   "source_error_countries":error,"source_truncated_countries":truncated,
   "raw_country_image_rows":sum(len(x) for x in source_by_country.values()),
   "distinct_qid_image_keys":len(image_keys),
   "anchors_with_name_only_unverified_leads":anchors_with_leads,
   "candidate_anchor_image_links":lead_links,
   "approved_photo_count":0,"published_photo_count":0}
 summary={"schema":"AO_P80_WORLDWIDE_SOURCE_FIRST_CONSOLIDATION_V1","source_cl2_commit":plan["source_cl2_commit"],
   "source_intake_commit":plan["source_branch_commit"],
   "scope":"2579 physical research anchors, 76 countries; partial direct P31/P18 Wikidata imagery only",
   "publication":"RESEARCH_ONLY_NEVER_APP_VISIBLE",
   "counts":counts,"records":output}
 check(len(output)==2579 and len({x["physical_anchor_id"] for x in output})==2579,"Whole population not accounted")
 (out/"p80-2579-source-first-index.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
 (out/"p80-audit.json").write_text(json.dumps({k:v for k,v in summary.items() if k!="records"},ensure_ascii=False,indent=2)+"\n",encoding="utf8")
 print("P80_COMPLETE="+json.dumps(counts),flush=True)

def main():
 p=argparse.ArgumentParser()
 p.add_argument("--source-root",type=Path,required=True)
 p.add_argument("--out",type=Path,required=True)
 p.add_argument("--group",type=int)
 p.add_argument("--consolidate-from",type=Path)
 p.add_argument("--check",action="store_true")
 p.add_argument("--delay",type=float,default=5.0)
 args=p.parse_args()
 plan=load_plan();anchors,countries,manifest=load_anchors(args.source_root,plan)
 if args.check:
  print("P80_FROZEN_SOURCE_PASS="+json.dumps({"anchors":len(anchors),"countries":len(countries),
     "shards":len(manifest["shards"]),"groups":[len(countries[i*16:(i+1)*16]) for i in range(5)],
     "source_only":True}),flush=True)
 if args.group is not None:
  harvest_group(anchors,countries,plan,args.group,args.out,args.delay)
 elif args.consolidate_from:
  consolidate(anchors,countries,plan,args.consolidate_from,args.out)
 elif not args.check:raise ValueError("Specify --group or --consolidate-from")
if __name__=="__main__":main()
