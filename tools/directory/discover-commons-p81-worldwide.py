#!/usr/bin/env python3
"""P81: one high-volume Commons File-namespace search across all 2579 CL2 anchors.

11 worker shards are transport only. All source candidates remain research leads,
not confirmed photos of the exact church or a licence/right to publish.
The complete worker record for every anchor is emitted to stdout for permanent
connector-side archival, as well as to one JSON shard artifact.
"""
from __future__ import annotations
import argparse,hashlib,html,json,re,time,unicodedata
import urllib.error,urllib.parse,urllib.request
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
PLAN=ROOT/"data/directory/research/p81-all-2579-direct-commons-plan.v1.json"
API="https://commons.wikimedia.org/w/api.php"
UA="AdOrientemDirectoryP81/1.0 (https://github.com/Fulcanelli13/ad-orientem; research-only Commons discovery)"
BAD={"the","and","our","saint","sainte","santa","santo","notre","dame","church","chapel",
"cathedral","basilica","st","san","of","de","du","des","da","dos","del","di","kirche","eglise","iglesia","parish","catholic","catholique","in","at","l","d","a","la","le"}
def check(v,msg):
 if not v:raise ValueError(msg)
def norm(value):
 s=unicodedata.normalize("NFKD",str(value or "")).encode("ascii","ignore").decode().casefold()
 return re.sub(r"\s+"," ",re.sub(r"[^a-z0-9]+"," ",s)).strip()
def clean(value):
 return " ".join(html.unescape(re.sub(r"<[^>]*>"," ",str(value or ""))).split())
def get_plan():
 m=json.loads(PLAN.read_text(encoding="utf8"))
 check(m["schema"]=="AO_P81_ONE_WAVE_ALL_2579_COMMONS_DIRECT_SOURCE_SEARCH_V1","Bad P81 plan")
 check(m["total_anchors"]==2579 and m["shards"]==11,"Frozen scope drift")
 return m
def load_rows(folder,manifest,segment):
 spec=manifest["shards"][segment]
 name=spec["path"];path=folder/name;content=path.read_bytes()
 check(len(content)==spec["bytes"],"Source shard changed size")
 check(hashlib.sha256(content).hexdigest()==spec["sha256"],"Source shard SHA256 changed")
 rows=json.loads(content)["records"]
 check(len(rows)==spec["count"] and len({x["physical_anchor_id"] for x in rows})==len(rows),"Source IDs changed")
 check(all(x["publication"]=="RESEARCH_ONLY_NEVER_APP_VISIBLE" and not x["building_subject_verified"] for x in rows),"Unsafe published source anchor")
 return rows
def source_tokens(t):
 return {x for x in norm(t).split() if len(x)>2 and x not in BAD}
def query_for(anchor):
 name=clean(anchor["name"])
 name=re.sub(r"[\r\n\t\"{}\[\]\\|]", " ",name)
 name=" ".join(name.split())[:115]
 if len(source_tokens(name))<1 or len(name)<6:
  return None,"NO_DISTINCT_BUILDING_NAME"
 # One name-only search, no fabricated physical location or derived map pin.
 # Keep broad historic names ambiguous rather than asserting source matches.
 return name,None
def request_api(params,retries=3):
 query=urllib.parse.urlencode(params)
 check(len(query)<3500,"Unsafe search URL length")
 url=API+"?"+query
 err=None
 for t in range(retries):
  try:
   req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"application/json"})
   with urllib.request.urlopen(req,timeout=35) as res:
    u=urllib.parse.urlsplit(res.geturl())
    check(u.hostname=="commons.wikimedia.org" and u.scheme=="https","Unapproved API redirect")
    raw=res.read(2_000_001)
    check(len(raw)<=2_000_000,"API response too large")
    data=json.loads(raw.decode("utf8"))
    check("error" not in data,"Commons API replied error")
    return data
  except (urllib.error.HTTPError,urllib.error.URLError,TimeoutError,ValueError,KeyError) as exc:
   err=type(exc).__name__+":"+str(exc)[:100]
   if t<retries-1:
    wait=min(35,4*(t+1))
    if isinstance(exc,urllib.error.HTTPError):
     try:wait=min(35,max(wait,int(exc.headers.get("Retry-After","0"))))
     except (TypeError,ValueError):pass
    time.sleep(wait)
 raise RuntimeError(err)
def file_search(phrase,limit):
 params={"action":"query","format":"json","formatversion":"2",
   "generator":"search","gsrnamespace":"6","gsrsearch":phrase,
   "gsrlimit":str(limit),"prop":"imageinfo",
   "iiprop":"sha1|size|mime|extmetadata|url",
   "iiurlwidth":"540"}
 data=request_api(params)
 pages=data.get("query",{}).get("pages",[])
 if isinstance(pages,dict):pages=list(pages.values())
 return pages
def current_source(p):
 ii=(p.get("imageinfo") or [{}])[0]
 meta=ii.get("extmetadata") or {}
 def fld(k):return clean((meta.get(k) or {}).get("value"))[:240]
 title=p.get("title","")
 check(title.startswith("File:") and isinstance(p.get("pageid"),int),"Not a Commons File page")
 if not re.fullmatch(r"[a-f0-9]{40}",ii.get("sha1","")):return None
 if ii.get("mime") not in ("image/jpeg","image/png","image/webp"):return None
 w,h=int(ii.get("width",0)),int(ii.get("height",0))
 if min(w,h)<480 or ii.get("size",0)>20_000_000:return None
 url="https://commons.wikimedia.org/wiki/"+urllib.parse.quote(title.replace(" ","_"),safe="():,_-.'")
 return {"commons_page_id":p["pageid"],"file_title":title,"source_url":url,
  "original_sha1_claim":ii["sha1"],"mime":ii["mime"],"width":w,"height":h,
  "original_bytes_claim":ii["size"],"license_claim":fld("LicenseShortName"),
  "license_url":fld("LicenseUrl"),"artist_claim":fld("Artist"),
  "description_claim":fld("ImageDescription"),
  "preview_url":ii.get("thumburl","")[:900],
  "original_sha1_bytes_verified":False,"license_independently_cleared":False,
  "exact_building_subject_verified":False,"published":False}
def score(anchor,item):
 s=norm(item["file_title"]+" "+item["description_claim"])
 a=source_tokens(anchor["name"])
 b=source_tokens(s)
 if not a or not b:return 0
 hit=len(a&b)
 if hit<1:return 0
 # A candidate with only "Mary" or "Peter" remains a low-confidence lead.
 ratio=hit/max(1,len(a))
 return round(min(0.98,0.25+0.5*ratio+0.07*min(hit,3)),3)
def process(anchor,limit):
 row={"schema":"AO_P81_ONE_SITE_COMMONS_DISCOVERY_V1",
  "physical_anchor_id":anchor["physical_anchor_id"],
  "country":anchor["country"],"place_name":anchor["name"],
  "source_ids":anchor["source_ids"],
  "source_description_hint":anchor["physical_description_search_hint"][:150],
  "query_text":None,"search_status":"NOT_QUERIED",
  "source_media_candidates":[],"candidate_count":0,
  "subject_verified":False,"rights_cleared":False,"published":False}
 query,hold=query_for(anchor)
 if hold:
  row["search_status"]=hold
  return row
 row["query_text"]=query
 try:
  pages=file_search(query,limit)
  media=[]
  for page in pages:
   m=current_source(page)
   if not m:continue
   m["name_similarity_hint"]=score(anchor,m)
   m["review_status"]="UNVERIFIED_MEDIA_DISCOVERY_LEAD"
   media.append(m)
  media.sort(key=lambda x:(-x["name_similarity_hint"],x["commons_page_id"]))
  row["source_media_candidates"]=media
  row["candidate_count"]=len(media)
  row["search_status"]="SEARCH_SUCCESS_WITH_CANDIDATES" if media else "SEARCH_SUCCESS_EMPTY"
 except Exception as exc:
  row["search_status"]="SOURCE_ERROR_NOT_ZERO_RESULTS"
  row["source_error"]=type(exc).__name__+":"+str(exc)[:200]
 return row
def main():
 ap=argparse.ArgumentParser()
 ap.add_argument("--source-root",type=Path,required=True)
 ap.add_argument("--shard",type=int,required=True)
 ap.add_argument("--output",type=Path,required=True)
 ap.add_argument("--delay",type=float,default=1.1)
 ap.add_argument("--check",action="store_true")
 args=ap.parse_args()
 plan=get_plan()
 check(0<=args.shard<11,"Must process full 11-shard campaign")
 check(0.8<=args.delay<=4.0,"Commons rate limit interval must be >=0.8s")
 manifest=json.loads((args.source_root/"manifest.json").read_text(encoding="utf8"))
 check(manifest["schema"]=="AO_DIRECTORY_UNIFIED_PHOTO_QUEUE_INDEX_V1","Wrong Directory source intake")
 check(manifest["cl2_commit"]==plan["source_cl2_sha"],"Source CL2 commit changed")
 check(len(manifest["shards"])==11 and manifest["counts"]["distinct_consolidated_physical_anchors"]==2579,"Source count drift")
 rows=load_rows(args.source_root,manifest,args.shard)
 if args.check:
  print("P81_OFFLINE="+json.dumps({"shard":args.shard,"anchors":len(rows),"unique_ids":len({x["physical_anchor_id"] for x in rows}),"publication":False}),flush=True)
  return
 output=[]
 for i,anchor in enumerate(rows):
  result=process(anchor,plan["max_source_image_candidates_per_site"])
  output.append(result)
  print("P81_SITE_RECORD="+json.dumps(result,ensure_ascii=False,separators=(",",":")),flush=True)
  if i<len(rows)-1 and result["query_text"] is not None:time.sleep(args.delay)
 args.output.mkdir(parents=True,exist_ok=True)
 summary={"shard":args.shard,"source_anchors":len(output),
   "source_query_success":sum(x["search_status"].startswith("SEARCH_SUCCESS") for x in output),
   "source_query_errors":sum(x["search_status"]=="SOURCE_ERROR_NOT_ZERO_RESULTS" for x in output),
   "no_specific_name":sum(x["search_status"]=="NO_DISTINCT_BUILDING_NAME" for x in output),
   "anchors_with_candidate_media":sum(bool(x["candidate_count"]) for x in output),
   "media_candidate_assignments":sum(x["candidate_count"] for x in output),
   "approved_images":0,"published_images":0}
 file=args.output/("p81-shard-%02d.json"%args.shard)
 file.write_text(json.dumps({"schema":"AO_P81_COMMONS_2579_SHARD_V1","summary":summary,"records":output},ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf8")
 print("P81_SHARD_SUMMARY="+json.dumps(summary),flush=True)
 check(len(output)==len(rows),"Incomplete source anchor coverage")
if __name__=="__main__":main()
