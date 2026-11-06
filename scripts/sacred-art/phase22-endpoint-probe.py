#!/usr/bin/env python3
"""Bounded public museum catalogue endpoint probe. Read-only, no image fetch."""
import concurrent.futures, json, time
from pathlib import Path
from urllib.parse import urlparse
import requests

OUT=Path("artifacts/sacred-art-phase22-endpoint-probe")
UA="AdOrientemArtResearch/1.0 (museum object identification only)"
DATASET="base-joconde-extrait"
SAMPLE="2004 1 296"
HOSTS=[
 "https://data.culturecommunication.gouv.fr",
 "https://data.smartidf.services",
 "https://data.toulouse-metropole.fr",
 "https://data.culture.gouv.fr"
]
PROBES=[]
for h in HOSTS[:2]+HOSTS[3:4]:
 PROBES.extend([
  (h+"/api/explore/v2.1/catalog/datasets/"+DATASET+"/records",{"limit":1}),
  (h+"/api/records/1.0/search/",{"dataset":DATASET,"rows":1,"q":SAMPLE}),
  (h+"/api/explore/v2.1/catalog/datasets/"+DATASET,{}),
 ])
for dataset in ("inventaire-collections-augustins","inventaire-des-oeuvres-deposees-au-musee-des-augustins"):
 h=HOSTS[2]
 PROBES.extend([
  (h+"/api/explore/v2.1/catalog/datasets/"+dataset+"/records",{"limit":1}),
  (h+"/api/records/1.0/search/",{"dataset":dataset,"rows":1,"q":SAMPLE}),
  (h+"/api/explore/v2.1/catalog/datasets/"+dataset+"/exports/json",{}),
 ])
# Probe only a small bounded part of each response. Never download entire 1.2-GB Joconde dataset.
def probe(entry):
 url,params=entry
 record={"url":url,"params":params,"status":None,"content_type":"","bytes_read":0,"is_json":False,
         "json_keys":[],"dataset_record_keys":[],"error":"","preview":""}
 try:
  r=requests.get(url,params=params,headers={"User-Agent":UA,"Accept":"application/json"},timeout=(6,18),stream=True,allow_redirects=False)
  record.update(status=r.status_code,content_type=r.headers.get("Content-Type",""),
                redirect_to=r.headers.get("Location",""))
  chunks=[]
  n=0
  for chunk in r.iter_content(chunk_size=8192):
   n+=len(chunk)
   if n>65536:break
   chunks.append(chunk)
  blob=b"".join(chunks)
  record["bytes_read"]=len(blob)
  preview=blob[:350].decode("utf-8","replace")
  record["preview"]=preview
  if r.status_code==200:
   try:
    doc=json.loads(blob)
    record["is_json"]=True
    if isinstance(doc,dict):
     record["json_keys"]=list(doc)[:15]
     sample=(doc.get("results") or doc.get("records") or [{}])
     if isinstance(sample,list) and sample:
      v=sample[0]
      if isinstance(v,dict):
       record["dataset_record_keys"]=list(v.get("fields",v))[:35]
    elif isinstance(doc,list) and doc:
     record["json_keys"]=["array"]
     if isinstance(doc[0],dict):record["dataset_record_keys"]=list(doc[0])[:35]
   except Exception as ex:
    record["error"]="JSON_PARSE: "+str(ex)[:100]
 except Exception as ex:
  record["error"]=str(ex)[:180]
 return record
def main():
 OUT.mkdir(parents=True,exist_ok=True)
 with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
  records=list(pool.map(probe,PROBES))
 records.sort(key=lambda r:(urlparse(r["url"]).netloc,r["url"],str(r["params"])))
 (OUT/"endpoints.json").write_text(json.dumps(records,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
 status={}
 for r in records:
  k=urlparse(r["url"]).hostname
  status.setdefault(k,[]).append({"path":urlparse(r["url"]).path,"status":r["status"],
      "is_json":r["is_json"],"record_keys":r["dataset_record_keys"][:12],"error":r["error"]})
 (OUT/"summary.json").write_text(json.dumps(status,indent=2)+"\n",encoding="utf-8")
 print(json.dumps(status,indent=2),flush=True)
if __name__=="__main__":main()
