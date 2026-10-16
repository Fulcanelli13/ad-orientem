#!/usr/bin/env python3
"""Acquire Commons source photos attached to the protected October 12 selections.
A matching filename/artist is provisional research evidence, not physical-object approval.
"""
import argparse, importlib.util, json, os
from pathlib import Path
from urllib.parse import urlparse,unquote,quote
HERE=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location("ao_acquirer",HERE/"tools/calendar/acquire-sacred-art-unified-curator.py")
ao=importlib.util.module_from_spec(spec)
spec.loader.exec_module(ao)
INPUT=HERE/"data/calendar/sacred-art-w78-oct12-preferred-paintings-recovery-20261016.v1.json"
MODEL=HERE/"data/calendar/sacred-art-review-uploads/20261016-unified-review-embedded-data.v1.json"
REGISTRY=HERE/"data/calendar/sacred-art-candidates.v1.json"
OUT=HERE/"docs/research/review-galleries/acquired"
ARCHIVE=HERE/"artifacts/sacred-art-oct12-image-recovery"
ao.OUT=OUT
ao.ARCHIVE=ARCHIVE

def name_from_url(u):
 if "wikimedia.org" not in (urlparse(u).netloc or ""):return None
 p=unquote(urlparse(u).path)
 if "/Special:FilePath/" in p:return p.split("/Special:FilePath/",1)[1].replace("_"," ")
 if "/File:" in p:return p.split("/File:",1)[1].replace("_"," ")
 parts=p.split("/")
 if "/thumb/" in p and len(parts)>4:return parts[-2].replace("_"," ")
 return parts[-1].replace("_"," ")

def main():
 out=json.loads(MODEL.read_text())
 choices={c["selectedOriginalId"]:c for c in json.loads(INPUT.read_text())["choices"]}
 canon={x["id"]:x for x in json.loads(REGISTRY.read_text())["artworks"]}
 OUT.mkdir(parents=True,exist_ok=True);ARCHIVE.mkdir(parents=True,exist_ok=True)
 rows=[]
 for cat in out["categories"]:
  for w in cat["works"]:
   if not w.get("oct12Selected") or w.get("photos"):continue
   old=choices.get(w["id"])
   if not old:continue
   lead=old.get("previewLead") or {}
   if lead.get("artistStringMatch") is not True:continue
   link=lead.get("url") or old.get("originalPreviewUrl")
   name=name_from_url(link or "")
   if not name:continue
   p="https://commons.wikimedia.org/wiki/File:"+quote(name.replace(" ","_"),safe="()/.-_")
   work=dict(w,_index=cat["index"],_category=cat["label"],_categoryId=cat["id"])
   work["photos"]=[{"id":name,"page":p,"status":"PROVISIONAL_HISTORIC_USER_CHOICE_PHOTOGRAPH_REFERENCE"}]
   try:rec=ao.process(work,canon,False)
   except Exception as e:rec={"id":w["id"],"category":cat["label"],"categoryIndex":cat["index"],"status":"FAILED","error":str(e)[:240]}
   for x in rec.get("photos") or []:
    x["identityStatus"]="UNVERIFIED_W78_ORIGINAL_PAINTING_CROSSWALK"
    x["photoResearchHold"]="Commons artist string match only. User-selected physical original remains to be proven."
   rows.append(rec)
 report={"schema":"AO_PROTECTED_OCT12_COMMONS_SOURCE_PHOTO_RECOVERY_V1","scope":"Unreviewed selected paintings with exact Wikimedia lead, no auto-upgrade or production approval","recordsScanned":len(rows),"acquired":sum(bool(r.get("photos")) for r in rows),"sourceImageVersions":sum(len(r.get("photos") or []) for r in rows),"rows":rows}
 (OUT/"protected-oct12-photo-recovery.v1.json").write_text(json.dumps(report,indent=2,ensure_ascii=False))
 (ARCHIVE/"result-manifest.json").write_text(json.dumps(report,indent=2,ensure_ascii=False))
 print("PROTECTED_OCT12_RECOVERY",json.dumps({k:report[k] for k in ("recordsScanned","acquired","sourceImageVersions")}),flush=True)

if __name__=="__main__":main()
