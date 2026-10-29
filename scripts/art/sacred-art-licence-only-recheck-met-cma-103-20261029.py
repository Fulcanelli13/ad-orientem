#!/usr/bin/env python3
"""Recheck official museum CC0 object flags, licence-only (no imagery)."""
import json,urllib.request,urllib.error,time
from concurrent.futures import ThreadPoolExecutor,as_completed
from collections import Counter
from pathlib import Path
P=Path("data/calendar")
file=P/"sacred-art-license-only-master-audit-20261029.v1.json"
a=json.loads(file.read_text())
targets=[r for r in a["main_383"] if r["photo_licence_status"]=="INSTITUTION_CC0_ARCHIVED_IMAGE_SOURCE_EVIDENCE"
 and r["artwork_id"].startswith(("met-","cma-"))]
assert len(targets)==103
UA="AdOrientem-OriginalArt-LicenseAudit/1.0 (GitHub: Fulcanelli13/ad-orientem)"
def check(r):
 id=r["artwork_id"];kind=id.split("-")[0];number=id.split("-",1)[1]
 url=("https://collectionapi.metmuseum.org/public/collection/v1/objects/" if kind=="met" else
      "https://openaccess-api.clevelandart.org/api/artworks/")+number
 v={"artwork_id":id,"official_api":url,"institution":kind,"archived_image_sha256":r["source_archive_sha256"]}
 try:
  req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"application/json"})
  with urllib.request.urlopen(req,timeout=13) as response: data=json.loads(response.read(700000))
  if kind=="met":
   v["object_id_confirmed"]=str(data.get("objectID"))==number
   v["public_domain_or_cc0"]=data.get("isPublicDomain") is True
   v["image_link_available"]=bool(data.get("primaryImage"))
  else:
   d=data.get("data") or {}
   v["object_id_confirmed"]=str(d.get("id"))==number
   v["public_domain_or_cc0"]=d.get("share_license_status")=="CC0"
   v["image_link_available"]=bool((d.get("images") or {}).get("print",{}).get("url"))
  v["result"]="OBJECT_CC0_RECONFIRMED" if v["object_id_confirmed"] and v["public_domain_or_cc0"] else "RIGHTS_OR_ID_HOLD"
 except Exception as e:
  v["result"]="INSTITUTION_API_UNAVAILABLE";v["error"]=type(e).__name__+": "+str(e)[:160]
 return v
out=[]
with ThreadPoolExecutor(max_workers=3) as pool:
 for job in as_completed([pool.submit(check,r) for r in targets]):
  v=job.result();out.append(v)
  print(v["artwork_id"],v["result"],flush=True)
checks={x["artwork_id"]:x for x in out}
for r in a["main_383"]:
 z=checks.get(r["artwork_id"])
 if not z:continue
 r["latest_official_object_rights_check"]=z["result"]
 r["latest_institutional_api_url"]=z["official_api"]
 if z["result"]=="OBJECT_CC0_RECONFIRMED":
  r["photo_licence_status"]="OFFICIAL_CC0_POLICY_RECONFIRMED_ARCHIVED_SOURCE_CHAIN_PENDING"
  r["required_licence_action"]="MATCH_SAVED_SOURCE_SHA_TO_OFFICIAL_CURRENT_FILE"
 elif z["result"]=="RIGHTS_OR_ID_HOLD":
  r["photo_licence_status"]="LIVE_MUSEUM_RIGHTS_OR_OBJECT_ID_MISMATCH_HOLD"
  r["required_licence_action"]="DO_NOT_USE_RESOLVE_POLICY_ID"
 else:
  r["photo_licence_status"]="PRIOR_CC0_MUSEUM_EVIDENCE_API_UNAVAILABLE"
  r["required_licence_action"]="RECHECK_OBJECT_API_AND_EXACT_FILE_VERSION"
a["live_museum_recheck"]={"checked":len(out),"status_counts":dict(Counter(z["result"] for z in out)),
 "official_object_checks":out,"no_image_downloads":True}
a["counts"]["main_statuses"]=dict(Counter(z["photo_licence_status"] for z in a["main_383"]))
a["counts"]["live_official_museum_objects_queried"]=len(out)
a["counts"]["live_open_access_confirmed"]=sum(z["result"]=="OBJECT_CC0_RECONFIRMED" for z in out)
a["counts"]["live_unavailable_or_rights_hold"]=sum(z["result"]!="OBJECT_CC0_RECONFIRMED" for z in out)
a["counts"]["visual_inspections"]=0
file.write_text(json.dumps(a,indent=2,ensure_ascii=False)+"\n")
print("SUMMARY",json.dumps(a["live_museum_recheck"]["status_counts"]))
