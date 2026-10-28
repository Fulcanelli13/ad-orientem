#!/usr/bin/env python3
"""Read-only, no-fee evidence check for the 22 previously A6-held museum originals.

Only an institution's own CC0 / Public Domain image API can establish museum
Open Access. Object match and current original image sha are checked separately.
This script MUST NOT approve final photo cropping, visual fidelity or app release.
"""
import csv,hashlib,io,json,re,sys,time,urllib.parse,urllib.request,urllib.error
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/"data/calendar/sacred-art-bulk-approved-107-photo-gates-20261028.csv"
OUT=ROOT/"artifacts/sacred-art-museum22-api-originals"
OUT.mkdir(parents=True,exist_ok=True)
try:
 from PIL import Image,ImageOps
 Image.MAX_IMAGE_PIXELS=140_000_000
except ImportError:
 Image=None
UA="AdOrientemMuseumOpenAccessResearch/1.0 (https://github.com/Fulcanelli13/ad-orientem; no publication, zero-cost academic source audit)"
ALLOWED={"collectionapi.metmuseum.org","openaccess-api.clevelandart.org","images.metmuseum.org","openaccess-cdn.clevelandart.org","openaccess-cdn.clevelandart.org"}
def request(url, cap=32*1024*1024, attempts=2):
 for attempt in range(attempts):
  try:
   req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"application/json,image/*,*/*"})
   with urllib.request.urlopen(req,timeout=55) as res:
    q=urllib.parse.urlparse(res.geturl())
    if q.scheme!="https" or not any(q.hostname==h or q.hostname.endswith("."+h) for h in ALLOWED):
     raise RuntimeError("UNTRUSTED_HOST_"+str(q.hostname))
    buf=bytearray()
    while True:
     p=res.read(65536)
     if not p:return bytes(buf)
     buf.extend(p)
     if len(buf)>cap:raise RuntimeError("MAX_IMAGE_BYTES_EXCEEDED")
  except (urllib.error.HTTPError,urllib.error.URLError,TimeoutError) as e:
   if attempt+1>=attempts:raise
   time.sleep(3+attempt*4)
 raise RuntimeError("FAIL_FETCH")
def clean(s):return re.sub(r"[^a-z0-9]+"," ",str(s).lower()).strip()
def titleoverlap(a,b):
 a=set(clean(a).split())-{"the","of","saint","st","and","with","a","at","an","to"}
 b=set(clean(b).split())-{"the","of","saint","st","and","with","a","at","an","to"}
 return sorted(a&b)
def run():
 with SOURCE.open(newline="",encoding="utf-8") as f:base=[r for r in csv.DictReader(f) if r["source_gate"]=="A6_EXACT_FILE_RIGHTS_EVIDENCE_PENDING"]
 assert len(base)==22
 records=[]
 for rank,r in enumerate(base,1):
  artwork_id=r["artwork_id"]
  ins="Met" if artwork_id.startswith("met-") or artwork_id.startswith("ART-hilippe-de-hampaigne-he-nnunciation") else "CMA"
  oid="438724" if artwork_id=="ART-hilippe-de-hampaigne-he-nnunciation" else artwork_id.split("-")[1]
  assert oid.isdigit(),(rank,oid,artwork_id)
  endpoint=(f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{oid}" if ins=="Met" else f"https://openaccess-api.clevelandart.org/api/artworks/{oid}")
  row={"rank":rank,"artwork_id":artwork_id,"expected_title":r["title"],"expected_artist":r["artist"],"institution":ins,"institution_object_id":oid,
   "api_url":endpoint,"old_source_sha256":r["source_image_archive_sha256"],"old_width":int(r["archived_image_width"]),"old_height":int(r["archived_image_height"]),
   "exact_same_physical_object_certified":False,"final_photo_rights_certified":False,"native_frame_free_certified":False,"colour_calibrated":False,"app_released":False}
  try:
   data=json.loads(request(endpoint,3*1024*1024))
   obj=data.get("data",{}) if ins=="CMA" else data
   image=obj.get("primaryImage","") if ins=="Met" else (((obj.get("images") or {}).get("full") or {}).get("url") or "")
   license_flag=(obj.get("isPublicDomain") is True) if ins=="Met" else str(obj.get("share_license_status","")).strip().lower()=="cc0"
   row.update({"api_reachable":True,"return_object_id":str(obj.get("objectID" if ins=="Met" else "id","")),
    "museum_title":obj.get("title"),"museum_artist":obj.get("artistDisplayName" if ins=="Met" else "creators"),
    "official_work_url":obj.get("objectURL","") if ins=="Met" else (obj.get("url","") or ""),
    "official_image_url":image,"official_oa_object_flag":license_flag,
    "current_photo_reuse_policy":"MET_PUBLIC_DOMAIN_CC0" if (ins=="Met" and license_flag) else ("CMA_OBJECT_CC0" if license_flag else "OBJECT_NOT_CONFIRMED_CC0"),
    "title_shared_keywords":titleoverlap(r["title"],obj.get("title","")),
    "api_object_id_exact_match":row.get("institution_object_id")==str(obj.get("objectID" if ins=="Met" else "id","")),
    "image_available_from_institution":bool(image)})
   if image and license_flag:
    try:
     original=request(image,32*1024*1024)
     row["institution_image_bytes"]=len(original)
     row["institution_image_sha256"]=hashlib.sha256(original).hexdigest()
     row["institution_image_matches_old_source_SHA"]=row["institution_image_sha256"]==r["source_image_archive_sha256"]
     if Image:
      with Image.open(io.BytesIO(original)) as im:
       row["institution_original_dimensions"]=list(im.size)
       row["institution_original_approx_old_dimensions_match"]=list(im.size)==[int(r["archived_image_width"]),int(r["archived_image_height"])]
       row["icc_present"]=bool(im.info.get("icc_profile"))
     row["file_status"]="OFFICIAL_FULL_IMAGE_BYTES_HASHED"
    except Exception as exc:
     row["file_status"]="OFFICIAL_IMAGE_FETCH_HOLD"
     row["download_exception"]=type(exc).__name__+":"+str(exc)[:230]
   else:row["file_status"]="OA_FLAG_NOT_TRUE_OR_NO_OFFICIAL_IMAGE"
  except Exception as exc:
   row["api_reachable"]=False
   row["file_status"]="API_RESPONSE_HOLD"
   row["api_exception"]=type(exc).__name__+":"+str(exc)[:230]
  records.append(row)
  (OUT/"records.json").write_text(json.dumps({"schema":"AO_SACRED_ART_22_MUSEUM_API_OBJECT_ORIGINALS_V1","records":records},indent=2)+"\n",encoding="utf8")
  print("AO_MUSEUM22_PROGRESS",rank,"of",len(base),ins,oid,row["file_status"],"OA",row.get("official_oa_object_flag"),"SHA",row.get("institution_image_matches_old_source_SHA"),flush=True)
  time.sleep(1.1)
 result={"schema":"AO_SACRED_ART_22_MUSEUM_API_ORIGINALS_V1","date":"2026-10-28","museum_count":len(records),
  "api_accessible":sum(x.get("api_reachable",False) for x in records),"object_id_exact_match":sum(x.get("api_object_id_exact_match",False) for x in records),
  "object_oa_flags":sum(x.get("official_oa_object_flag",False) for x in records),
  "official_images_downloaded_hash_verified":sum(bool(x.get("institution_image_sha256")) for x in records),
  "official_photo_SHA_matches_historical":sum(x.get("institution_image_matches_old_source_SHA",False) for x in records),
  "original_dimensions_equal_historical":sum(x.get("institution_original_approx_old_dimensions_match",False) for x in records),
  "final_artwork_visual_and_photo_rights_signoff":0,
  "app_assets_released":0,"euro_spent":0,
  "limitations":"Museum policy and object OA flag are distinct from exact archived source version and final visual QA; an image mismatch does not reject the chosen artwork. Original bytes used in memory only."}
 (OUT/"summary.json").write_text(json.dumps(result,indent=2)+"\n",encoding="utf8")
 print("AO_MUSEUM22_SUMMARY",json.dumps(result,sort_keys=True),flush=True)
 if sum(x.get("api_reachable",False) for x in records)==0:sys.exit(2)
if __name__=="__main__":run()
