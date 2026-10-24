#!/usr/bin/env python3
"""B35 discover Commons *leads* for all unresolved unprotected source-gap artworks.

No files are downloaded. Search results and their license metadata never
certify object identity or permit publishing. 37 unresolved; two Céline Martin
copyright holds excluded, 35 systematically screened for exact-object leads.
"""
import csv,json,re,time,unicodedata
from collections import Counter
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request,urlopen

R=Path("data/research")
OUT=Path("artifacts/b35-commons35-discovery")
AGENT="AdOrientemSacredArtDiscovery/2026 (+https://github.com/Fulcanelli13/ad-orientem)"
FIELDS=["artwork_id","title","artist","institutional_source","candidate_file_page",
 "candidate_file_title","candidate_original_url","image_width","image_height",
 "license_claim_current","candidate_sha256","identity_certified","publication_approved",
 "match_score_non_authoritative","research_status"]
def api(params):
 url="https://commons.wikimedia.org/w/api.php?"+urlencode(dict(params,format="json",formatversion=2))
 with urlopen(Request(url,headers={"User-Agent":AGENT,"Accept":"application/json"}),timeout=42) as f:
  return json.loads(f.read(7_000_000))
def normalized(s):
 t=unicodedata.normalize("NFD",s or "")
 return " ".join(re.findall(r"[a-z0-9]+","".join(c for c in t if not unicodedata.combining(c)).lower()))
STOP=set("the a an of and from saint st holy la le les de del des du di da der dei in with on at by".split())
def overlap(query,found):
 want=set(normalized(query).split())-STOP
 had=set(normalized(found).split())-STOP
 return len(want&had)/max(1,len(want))
def run():
 master=json.loads((R/"sacred-art-b35-40-source-gap-working-master.json").read_text())
 rows=master["rows"]
 assert len(rows)==40 and sum(x["research_source_present"] for x in rows)==3
 assert master["remaining_without_physical_source"]==37
 pending=[r for r in rows if not r["research_source_present"]]
 protected=[x for x in pending if x["previous_status"]=="COPYRIGHT_PERMISSION_HOLD"]
 targets=[x for x in pending if x not in protected]
 assert len(protected)==2 and len(targets)==35
 OUT.mkdir(parents=True,exist_ok=True)
 candidates=[];cases=[]
 for idx,r in enumerate(targets,1):
  title=r["title"];artist=r["artist"]
  phrase=title+(" "+artist if artist else "")
  phrases=[phrase,title]
  output=[];err=""
  for q in phrases:
   try:
    a=api({"action":"query","list":"search","srsearch":q,
           "srnamespace":"6","srlimit":"6","srprop":"wordcount"})
    output=a.get("query",{}).get("search",[])
    if output:break
   except Exception as exc:
    err=type(exc).__name__+": "+str(exc)[:190]
   time.sleep(.22)
  wanted=[x.get("title","") for x in output[:3] if x.get("title","").startswith("File:")]
  info={}
  if wanted:
   try:
    response=api({"action":"query","prop":"imageinfo",
       "iiprop":"url|size|mime|extmetadata","titles":"|".join(wanted)})
    for page in response.get("query",{}).get("pages",[]):
     infos=page.get("imageinfo",[])
     if infos:info[page["title"]]=infos[0]
   except Exception as exc:
    err=type(exc).__name__+": "+str(exc)[:190]
  for name in wanted:
   data=info.get(name,{})
   mt=data.get("extmetadata",{})
   lic=mt.get("LicenseShortName",{}).get("value","")
   imagePage="https://commons.wikimedia.org/wiki/"+name.replace(" ","_")
   words=overlap(title,name)
   cand={"artwork_id":r["artwork_id"],"title":title,"artist":artist,
         "institutional_source":r["source_page"],"candidate_file_page":imagePage,
         "candidate_file_title":name,
         "candidate_original_url":data.get("url",""),
         "image_width":data.get("width",""),"image_height":data.get("height",""),
         "license_claim_current":lic,"candidate_sha256":"",
         "identity_certified":"NO","publication_approved":"NO",
         "match_score_non_authoritative":f"{words:.3f}",
         "research_status":"UNVERIFIED_MEDIA_SEARCH_LEAD_NOT_OBJECT_IDENTITY"}
   candidates.append(cand)
  case={"artwork_id":r["artwork_id"],"title":title,"artist":artist,
    "prior_status":r["previous_status"],"institutional_source":r["source_page"],
    "object_accession":r["object_accession"],"discovered_candidate_count":len(wanted),
    "best_filename_title_overlap":max([overlap(title,x) for x in wanted],default=0),
    "search_error":err,"identity_certified":False,"publication_approved":False,
    "research_status":("MEDIA_LEADS_NEED_EXACT_OBJECT_INSPECTION" if wanted else
       "NO_COMMONS_CANDIDATE_FOUND_OR_SEARCH_ERROR")}
  cases.append(case)
  print("B35_MEDIA",idx,case["artwork_id"],len(wanted),err,flush=True)
  time.sleep(.45)
 assert len(cases)==35 and len({x["artwork_id"] for x in cases})==35
 assert all(x["identity_certified"]=="NO" and x["publication_approved"]=="NO" for x in candidates)
 with (OUT/"candidate-media-leads.csv").open("w",newline="",encoding="utf-8") as f:
  w=csv.DictWriter(f,fieldnames=FIELDS);w.writeheader();w.writerows(candidates)
 summary={"schema":"AO_B35_ALL_37_UNRESOLVED_35_MEDIA_SEARCH_SCREEN_V1",
  "prior_source_missing_after_three_recoveries":37,
  "copyright_excluded_from_discovery":len(protected),
  "individual_source_cases_searched":35,
  "cases_with_at_least_one_media_lead":sum(bool(x["discovered_candidate_count"]) for x in cases),
  "cases_without_media_lead":sum(not x["discovered_candidate_count"] for x in cases),
  "cases_with_search_errors":sum(bool(x["search_error"]) for x in cases),
  "candidate_media_file_entries":len(candidates),
  "zero_approved_identity_links":True,
  "zero_copyright_bypasses":True,
  "no_original_binaries_acquired":True,
  "editorial_selections_changed":0,"publication_approvals_created":0,
  "copyright_held_artworks":[r["artwork_id"] for r in protected],
  "cases":cases}
 (OUT/"discovery-summary.json").write_text(json.dumps(summary,indent=2)+"\n")
 print("B35_35_SOURCE_DISCOVERY_COMPLETE",json.dumps({k:v for k,v in summary.items() if k!="cases"}),flush=True)
if __name__=="__main__":run()
