#!/usr/bin/env python3
"""Rights metadata probe for 3 Rijksmuseum sacred paintings, no image bytes."""
import json,re,urllib.request,urllib.parse
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"data/calendar/sacred-art-rijks-edm-rights-probe-20261029.v1.json"
ids=["200109177","20025782","20028546"]
def get(url):
 req=urllib.request.Request(url,headers={"User-Agent":"AdOrientem-Rights-Research/1.0 (https://github.com/Fulcanelli13/ad-orientem)","Accept":"application/json, application/ld+json, application/xml, text/xml"})
 with urllib.request.urlopen(req,timeout=18) as r: data=r.read(1000000);type=r.headers.get("Content-Type","")
 return {"url":url,"contentType":type,"content":data.decode("utf-8","replace")}
def scan(t):
 matches=re.findall(r'(?:https?://)?(?:creativecommons\.org/(?:publicdomain/(?:mark|zero)/1\.0|licenses/[^/]+/[\d.]+)|rightsstatements\.org/vocab/[a-zA-Z-]+/[\d.]+)/?',t,re.I)
 return list(dict.fromkeys(matches))[:15]
results=[]
for id in ids:
 row={"id":id,"profiles":[]}
 for profile in ("edm-framed","edm"):
  url=f"https://data.rijksmuseum.nl/{id}?_profile={profile}"
  try:
   r=get(url);body=r["content"]
   entry={"profile":profile,"type":r["contentType"],"characters":len(body),"rightsUris":scan(body),"textHead":body[:600],"keys":[]}
   try:
    j=json.loads(body)
    if isinstance(j,dict):
     entry["keys"]=list(j.keys())[:30]
     entry["edmRightsValues"]=[]
     def walk(x,path="",depth=0):
      if depth>14:return
      if isinstance(x,dict):
       for k,v in x.items():
        if k.split(":")[-1].lower()=="rights" or k.lower().endswith("/rights"):
         entry["edmRightsValues"].append({"path":path+"/"+k,"value":str(v)[:360]})
        walk(v,path+"/"+k,depth+1)
      elif isinstance(x,list):
       for i,v in enumerate(x[:40]):walk(v,path+f"/{i}",depth+1)
     walk(j)
   except Exception:pass
   row["profiles"].append(entry)
  except Exception as e:row["profiles"].append({"profile":profile,"error":type(e).__name__+": "+str(e)[:160]})
 results.append(row)
OUT.write_text(json.dumps({"schema":"Rijks-EDM-object-rights-probe-v1","date":"2026-10-29","imageDownloaded":False,"records":results},indent=2,ensure_ascii=False)+"\n")
print(json.dumps({"out":str(OUT.relative_to(ROOT)),"data":results},ensure_ascii=False)[:12000])
