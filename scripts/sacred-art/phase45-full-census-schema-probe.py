#!/usr/bin/env python3
"""Read-only discovery of all Sacred Art source and release data schemas on current branch.
No gallery edits; concise evidence with full-file SHA256 and inferred structures.
"""
from pathlib import Path
from collections import Counter, defaultdict
import json,hashlib,re,os
SRC={
 "source_3205":"data/artwork/research-source-records-3205.v1.json",
 "operational_989":"data/artwork/research-operational-989.v1.json",
 "semantic_989":"data/artwork/research-semantic-candidates-989.v1.json",
 "prior_duplicates":"data/artwork/research-prior-duplicate-decisions.v1.json",
 "calendar_365":"data/artwork/home-2026-annual-release-census.v1.json",
 "date_evidence":"data/artwork/2026-prior-date-artwork-evidence.v1.json",
 "module_release":"src/art/released-module-paintings.v1.js"
}
OUT=Path("artifacts/sacred-art-phase45-full-census-probe");OUT.mkdir(parents=True,exist_ok=True)
def summarize(node):
 if isinstance(node,list):
  return {"type":"list","length":len(node),"first":node[:2] if len(str(node[:2]))<8500 else [str(x)[:4000] for x in node[:2]]}
 if isinstance(node,dict):
  out={"type":"dict","keys":list(node.keys())}
  for k,v in node.items():
   if isinstance(v,list):out[k+"_length"]=len(v)
   elif isinstance(v,(int,float,str,bool)) and len(str(v))<800:out[k]=v
   elif isinstance(v,dict):
    if k.lower() in ("counts","summary","totals","metrics","policy","schema","status","source"):out[k]=v
    else:out[k+"_keys"]=list(v.keys())[:35]
  return out
 return {"type":type(node).__name__,"head":str(node)[:300]}
def walk_list_fields(obj,depth=0):
 if depth>3:return {}
 result={}
 if isinstance(obj,dict):
  for k,v in obj.items():
   if isinstance(v,list):
    typ=Counter(type(x).__name__ for x in v)
    result[k]={"count":len(v),"types":dict(typ),"sample":v[:1]}
   elif isinstance(v,dict):
    for k2,inner in walk_list_fields(v,depth+1).items():
     result[f"{k}.{k2}"]=inner
 return result
files={}
for label,path in SRC.items():
 try:
  b=Path(path).read_bytes();s=b.decode("utf8");rec={"path":path,"bytes":len(b),
    "sha256":hashlib.sha256(b).hexdigest()}
  if label=="module_release":
   ids=re.findall(r'^\s*(?:"([^"]+)"|([a-zA-Z0-9_-]+)):Object\.freeze\(\{',s,re.M)
   rec["static_release_entries"]=len(ids)
   rec["ids"]=[a or b for a,b in ids]
   rec["release_image_refs"]=re.findall(r'image:"([^"]+)"',s)
  else:
   j=json.loads(s)
   rec["summary"]=summarize(j)
   rec["list_fields"]={k:{"count":v["count"],"types":v["types"],"first":str(v["sample"])[:2500]}
                       for k,v in walk_list_fields(j).items()}
  files[label]=rec
 except Exception as e:
  files[label]={"path":path,"error":f"{type(e).__name__}: {str(e)[:400]}"}
assets={}
for path in ("assets/active","assets/approved","assets/editorial","assets/home","assets/prayer","assets/recovered","assets/staged","assets/review","assets/inventory"):
 d=Path(path)
 if not d.exists():continue
 extensions=Counter();samples=[]
 for f in d.rglob("*"):
  if f.is_file():
   extensions[f.suffix.lower()]+=1
   if len(samples)<10:samples.append(str(f))
 assets[path]={"files":sum(extensions.values()),"extension_counts":dict(extensions),"sample_paths":samples}
result={"schema":"AO_PHASE45_FULL_SACRED_ART_CORPUS_SCHEMA_PROBE_V1",
        "read_only":True,"files":files,"asset_directories":assets}
(OUT/"schema_probe.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
print(json.dumps({"files":{k:{"bytes":v.get("bytes"),"error":v.get("error"),
   "keys":v.get("summary",{}).get("keys"),
   "list_fields":{name:val["count"] for name,val in v.get("list_fields",{}).items()},
   "static_release_entries":v.get("static_release_entries")} for k,v in files.items()},
  "asset_paths":{k:v["files"] for k,v in assets.items()}},indent=2),flush=True)
