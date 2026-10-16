#!/usr/bin/env python3
"""Acquire Wikimedia source files only where exact painting research warrants it.
The images are research-only, uncropped and SHA-backed; no publication or approval.
"""
import importlib.util,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location("ao_acquire",ROOT/"tools/calendar/acquire-sacred-art-unified-curator.py")
a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a)
MANIFEST=ROOT/"data/calendar/sacred-art-review-uploads/20261016-w86-frame-aware-acquisition.v1.json"
MODEL=ROOT/"data/calendar/sacred-art-review-uploads/20261016-unified-review-embedded-data.v1.json"
REGISTRY=ROOT/"data/calendar/sacred-art-candidates.v1.json"
a.ARCHIVE=ROOT/"artifacts/sacred-art-w86-image-acquisition"
a.OUT=ROOT/"docs/research/review-galleries/acquired"
def main():
 a.OUT.mkdir(parents=True,exist_ok=True)
 a.ARCHIVE.mkdir(parents=True,exist_ok=True)
 m=json.loads(MODEL.read_text(encoding="utf-8"))
 candidates=json.loads(MANIFEST.read_text(encoding="utf-8"))["items"]
 originals={x["id"]:x for x in json.loads(REGISTRY.read_text(encoding="utf-8"))["artworks"]}
 by_index={x["index"]:x for x in m["categories"]}
 rows=[]
 for i,c in enumerate(candidates,1):
  cat=by_index.get(c["categoryIndex"])
  if cat is None or not cat["works"]:raise RuntimeError("Category not mapped: "+str(c["categoryIndex"]))
  art=cat["works"][0]
  w=dict(art,_index=cat["index"],_category=cat["label"],_categoryId=cat["id"])
  w["photos"]=[{"id":c["file"],"page":c["sourcePage"],"status":"CURATED_W86_SOURCE_FILE"}]
  try:
   obj=a.process(w,originals,allow_search=False)
  except Exception as ex:
   obj={"id":art["id"],"status":"FAILED","reason":str(ex)[:300]}
  obj.update({"categoryIndex":cat["index"],"category":cat["label"],"file":c["file"],"researchIdentity":c["identityStatus"],"researchEvidence":c["evidence"]})
  for p in obj.get("photos",[]):
   p["sourceIdentityEvidence"]=c["identityStatus"]
   p["curatorApproval"]=False
   if c["identityStatus"]=="WORK_VARIANT_HOLD":
    p["identityStatus"]="PROVISIONAL_REAL_PHYSICAL_WORK_NOT_CERTIFIED_AS_OCT12_SELECTED_ORIGINAL"
  rows.append(obj)
  print("W86_SOURCE",i,len(candidates),cat["index"],obj.get("status"),len(obj.get("photos",[])),flush=True)
 out={"schema":"AO_SACRED_ART_W86_DOWNLOAD_OUTCOME_V1","researchOnly":True,"publicationApproved":False,"counts":{"attempted":len(candidates),"acquiredEntries":sum(bool(x.get("photos")) for x in rows),"acquiredFiles":sum(len(x.get("photos",[])) for x in rows),"newCategoriesWithAcquiredImages":len({x["categoryIndex"] for x in rows if x.get("photos")}),"failed":sum(not x.get("photos") for x in rows)},"rows":rows}
 (a.OUT/"w86-source-acquisition.v1.json").write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n")
 (a.ARCHIVE/"w86-source-acquisition.v1.json").write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n")
 print("W86_ACQUISITION_COMPLETE",json.dumps(out["counts"]),flush=True)
if __name__=="__main__":main()
