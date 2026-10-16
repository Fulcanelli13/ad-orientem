#!/usr/bin/env python3
"""Polite second-pass source-byte acquisition for actual missing Sacred Art records."""
import importlib.util,json,time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location("artsource",ROOT/"tools/calendar/acquire-sacred-art-unified-curator.py")
a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a)
TARGETS=ROOT/"data/calendar/sacred-art-review-uploads/20261016-missing-image-source-retry-queue.v1.json"
INPUT=ROOT/"data/calendar/sacred-art-review-uploads/20261016-unified-review-embedded-data.v1.json"
REGISTRY=ROOT/"data/calendar/sacred-art-candidates.v1.json"
a.OUT=ROOT/"docs/research/review-galleries/acquired"
a.ARCHIVE=ROOT/"artifacts/sacred-art-unified-retry"
basefetch=a.fetch
def fetch_polite(url,*args,**kw):
 if "wikimedia.org" in url:time.sleep(2.7)
 try:return basefetch(url,*args,**kw)
 except Exception as e:
  if "429" not in str(e):raise
  print("SOURCE_RATE_LIMIT_PAUSE",url.split("/")[2],flush=True)
  time.sleep(26)
  return basefetch(url,*args,**kw)
a.fetch=fetch_polite

def main():
 model=json.loads(INPUT.read_text())
 data=json.loads(TARGETS.read_text())
 source={x["id"]:x for x in json.loads(REGISTRY.read_text())["artworks"]}
 byid={(c["index"],w["id"]):dict(w,_index=c["index"],_category=c["label"],_categoryId=c["id"]) for c in model["categories"] for w in c["works"]}
 a.OUT.mkdir(parents=True,exist_ok=True);a.ARCHIVE.mkdir(parents=True,exist_ok=True)
 results=[]
 for i,t in enumerate(data["targets"],1):
  w=byid.get((t["index"],t["id"]))
  if not w:continue
  try:r=a.process(w,source,allow_search=True)
  except Exception as e:r={"id":t["id"],"category":t["category"],"categoryIndex":t["index"],"status":"FAILED","reason":str(e)[:240]}
  results.append(r)
  if i%10==0:print("SECOND_PASS_PROGRESS",i,len(data["targets"]),flush=True)
 report={"schema":"AO_SOURCE_IMAGE_POLITE_RETRY_V1","allTargetCount":len(data["targets"]),"processed":len(results),"sourcePhotosAcquired":sum(bool(x.get("photos")) for x in results),"newSourceVersions":sum(len(x.get("photos") or []) for x in results),"identityHeld":sum(x.get("status")=="IDENTITY_HOLD_NO_IMAGE_PROMOTED" for x in results),"rows":results,"publicationApproved":False}
 (a.OUT/"polite-retry-source-acquisition.v1.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
 (a.ARCHIVE/"result-manifest.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
 print("POLITE_RETRY_COMPLETE",json.dumps({k:v for k,v in report.items() if k!="rows"}),flush=True)
if __name__=="__main__":main()
