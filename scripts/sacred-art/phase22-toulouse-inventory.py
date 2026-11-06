#!/usr/bin/env python3
"""Batch reconcile 15 handpicked Toulouse paintings using official inventory exports.
Research metadata only. Do not download/use photographs or auto-promote art.
"""
import collections, concurrent.futures, difflib, json, re, unicodedata
from pathlib import Path
from urllib.parse import quote
import requests

ROOT=Path("reference-phase20/metadata_recovery_157.json")
OUT=Path("artifacts/sacred-art-phase22-toulouse")
PROVIDER="https://data.toulouse-metropole.fr"
SETS=("inventaire-collections-augustins","inventaire-des-oeuvres-deposees-au-musee-des-augustins")
HEADERS={"User-Agent":"AdOrientemArtResearch/1.0 (official inventory identity check only)","Accept":"application/json"}

def fetch_inventory(dataset):
 url=f"{PROVIDER}/api/explore/v2.1/catalog/datasets/{dataset}/exports/json"
 with requests.get(url,headers=HEADERS,timeout=(12,85),stream=True,allow_redirects=False) as r:
  r.raise_for_status()
  if "json" not in r.headers.get("Content-Type","").lower(): raise ValueError("Non-JSON response: "+r.headers.get("Content-Type",""))
  data=bytearray()
  for part in r.iter_content(262144):
   data.extend(part)
   if len(data)>16000000:raise ValueError("Museum export exceeds 16MB")
 doc=json.loads(data)
 if not isinstance(doc,list):raise ValueError("Unexpected museum inventory format")
 return dataset,doc,url

def norm(s):
 s=unicodedata.normalize("NFKD",str(s or "")).encode("ascii","ignore").decode().lower()
 return re.sub(r"\s+"," ",re.sub(r"[^a-z0-9]+"," ",s)).strip()
def number(s):return re.sub("[^a-z0-9]","",norm(s))
def accessions(value):
 raw=re.split(r"(?:https?://|, dépôt|, http)",str(value or ""))[0]
 raw=re.sub(r"(?i)^\s*(?:num(?:ero)? d'?(?:inv(?:entaire)?|objet)|inv(?:entaire)?\.?)\s*[:.]?\s*","",raw)
 return [number(raw)] if number(raw) else []

def first(row,stems):
 for stem in stems:
  for k,v in row.items():
   if norm(k).replace(" ","").startswith(stem.replace("_","")) and v:
    return str(v)
 return ""

def match_item(record,target,dataset,uri):
 acc=accessions(target.get("accession_field",""))
 nums=[str(v) for k,v in record.items() if any(word in norm(k).replace(" ","") for word in ("inventaire","numinventaire","numdepot","numeroacquisition","numdeposant")) and v]
 # Other inventory keys often encode 'num_inventaire'; accept 'num_' only for exact matching.
 nums+= [str(v) for k,v in record.items() if str(k).startswith("num_") and v]
 accession_match=bool(acc and any(number(v)==acc[0] for v in nums))
 title=first(record,["titre","designation","denomination","nom_de_l_oeuvre"])
 author=first(record,["auteur","artiste","attrib"])
 title_norm=norm(target["title"]).replace("french ","").split("label qs")[0].strip()
 title_sim=difflib.SequenceMatcher(None,title_norm,norm(title)).ratio() if title else 0
 author_sim=difflib.SequenceMatcher(None,norm(target["artist"]),norm(author)).ratio() if author else 0
 # Conclusive when inventory number and title broadly agree, or title+artist both exceptionally close.
 by_number=accession_match and (title_sim>=.52 or author_sim>=.70)
 by_names=(not acc) and title_sim>=.88 and author_sim>=.75
 if not (by_number or by_names or accession_match):return None
 state=("CONFIRMED_ACCESSION_TITLE_OR_ARTIST" if by_number else
        "CANDIDATE_TITLE_ARTIST" if by_names else "ACCESSION_MATCH_SUBJECT_HOLD")
 return {"museum_dataset":dataset,"source_dataset":uri,"accession_values":" | ".join(nums[:5]),
   "source_title":title,"source_author":author,
   "title_similarity":round(title_sim,3),"artist_similarity":round(author_sim,3),
   "accession_equal":accession_match,"classification":state,
   "source_excerpt":{k:str(v)[:180] for k,v in list(record.items())[:18]}}

def main():
 source=json.loads(ROOT.read_text("utf-8"))
 assert len(source)==157
 targets=[r for r in source if "Toulouse" in r["recorded_holding_museum"]]
 assert len(targets)==15
 downloads=[];errors=[]
 with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
  futures=[pool.submit(fetch_inventory,name) for name in SETS]
  for future in concurrent.futures.as_completed(futures):
   try: downloads.append(future.result())
   except Exception as e: errors.append(str(e)[:350])
 out=[]
 for t in targets:
  entry={"registry_id":t["registry_id"],"title":t["title"],"artist":t["artist"],
   "accession_input":t.get("accession_field",""),"original_holding":t["recorded_holding_museum"],
   "status":"UNRESOLVED","match_count":0,"matches":[]}
  matches=[]
  for dataset,items,url in downloads:
   for item in items:
    if not isinstance(item,dict):continue
    one=match_item(item,t,dataset,url)
    if one:matches.append(one)
  matches.sort(key=lambda x:(x["classification"]!="CONFIRMED_ACCESSION_TITLE_OR_ARTIST",
     -x["title_similarity"],-x["artist_similarity"]))
  entry["matches"]=matches[:10];entry["match_count"]=len(matches)
  if matches and matches[0]["classification"]=="CONFIRMED_ACCESSION_TITLE_OR_ARTIST":
   entry["status"]="EXACT_INVENTORY_AND_SUBJECT_SUPPORTED"
  elif matches:entry["status"]="CANDIDATE_REQUIRES_MANUAL_OBJECT_CHECK"
  elif not downloads:entry["status"]="PROVIDER_EXPORT_FAILED"
  out.append(entry)
 OUT.mkdir(parents=True,exist_ok=True)
 (OUT/"toulouse_15.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
 (OUT/"export_errors.json").write_text(json.dumps(errors,indent=2)+"\n",encoding="utf-8")
 summary={"scanned":len(targets),"museum_export_datasets_downloaded":len(downloads),
  "museum_export_records":{dataset:len(items) for dataset,items,_ in downloads},
  "classified":dict(collections.Counter(row["status"] for row in out)),
  "export_errors":errors,"artwork_approved":0,"photo_licence_granted":0,"app_changes":0}
 (OUT/"summary.json").write_text(json.dumps(summary,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
 print(json.dumps(summary,indent=2,ensure_ascii=False),flush=True)
if __name__=="__main__":main()
