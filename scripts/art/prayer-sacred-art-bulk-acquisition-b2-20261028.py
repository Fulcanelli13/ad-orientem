#!/usr/bin/env python3
"""BULK Prayer Sacred Art source intake: 14 deduplicated exact-work cases.

Discovers missing sources and archives full native original files ONLY when
source names match explicitly pinned targets, pixel minimums pass, bytes are
bounded and media is a decodable raster. Source rights, identity, frames,
photo fidelity and publication all remain separate HOLD gates.
Never use AI upscaling, transformed source as original, paid APIs, or
automatic thematic substitutes. Archives research evidence permanently.
"""
from __future__ import annotations
import json, re, hashlib, time, urllib.parse, urllib.request, urllib.error
from pathlib import Path
from io import BytesIO
from PIL import Image, ImageOps, ImageDraw, ImageCms

ROOT=Path(__file__).resolve().parents[2]
IN=ROOT/"data/research/prayer-sacred-art-bulk-acquisition-b2-20261028.v1.json"
OUT=ROOT/"assets/staged/prayer-art-bulk-acquisition-b2-20261028"
OUT.mkdir(parents=True,exist_ok=True)
CASES=json.loads(IN.read_text())["cases"]
assert len(CASES)==14
UA="AdOrientem-sacred-art-research/1.0 (open-source non-commercial provenance audit; contact: public project GitHub repository)"
COMMONS="https://commons.wikimedia.org/w/api.php"
MAX_BYTES=14000000
def get(url,limit=MAX_BYTES,timeout=42):
 req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"application/json,image/*,*/*"})
 with urllib.request.urlopen(req,timeout=timeout) as resp:
  data=resp.read(limit+1)
  if len(data)>limit:raise ValueError("SOURCE_EXCEEDS_BYTE_LIMIT")
  return data
def api(params):
 url=COMMONS+"?"+urllib.parse.urlencode({"action":"query","format":"json","formatversion":2,**params})
 return json.loads(get(url,limit=3500000,timeout=30).decode("utf-8"))
def image_info(title):
 title="File:"+title if not title.startswith("File:") else title
 result=api({"titles":title,"prop":"imageinfo","iiprop":"url|size|mime|sha1|extmetadata","iilimit":1})
 page=result.get("query",{}).get("pages",[{}])[0]
 info=(page.get("imageinfo") or [{}])[0]
 if page.get("missing") or not info.get("url"):return {"found":False,"title":title}
 rights=info.get("extmetadata") or {}
 return {"found":True,"title":page.get("title",title),"url":info["url"],
  "description_url":info.get("descriptionurl"),"width":info.get("width"),
  "height":info.get("height"),"bytes":info.get("size"),"mime":info.get("mime"),
  "source_sha1":info.get("sha1"),
  "rights":{key:re.sub(r"<[^>]*>"," ",str(rights.get(key,{}).get("value",""))).strip()[:500]
    for key in ("LicenseShortName","LicenseUrl","Copyrighted","UsageTerms","Artist","Credit","AttributionRequired","Restrictions","License")}}
def search(q):
 query=api({"list":"search","srnamespace":6,"srlimit":12,"srsearch":q})
 return [{"title":x.get("title"),"score":None,"snippet":re.sub(r"<[^>]*>"," ",x.get("snippet",""))[:200]}
   for x in query.get("query",{}).get("search",[])]
def commons_md5_url(name):
 safe=name.replace(" ","_")
 md5=hashlib.md5(safe.encode("utf-8")).hexdigest()
 return "https://upload.wikimedia.org/wikipedia/commons/"+md5[0]+"/"+md5[:2]+"/"+urllib.parse.quote(safe,safe="()/,")
def image_decode(raw):
 src=Image.open(BytesIO(raw))
 src.load()
 if src.format not in ("JPEG","PNG","WEBP","TIFF"):raise ValueError("FORMAT_NOT_ACCEPTED")
 if src.width*src.height>80000000:raise ValueError("IMAGE_TOO_LARGE_PIXELS")
 return src
def display_rgb(src):
 src=ImageOps.exif_transpose(src)
 icc=src.info.get("icc_profile")
 if icc:
  try:return ImageCms.profileToProfile(src.convert("RGB"),ImageCms.ImageCmsProfile(BytesIO(icc)),
   ImageCms.createProfile("sRGB"),outputMode="RGB")
  except Exception:pass
 return src.convert("RGB")
def thumbs(rows):
 # All previews are labelled explicitly as research evidence.
 files=[]
 for start in range(0,len(rows),5):
  group=rows[start:start+5]
  W=1000; H=300
  panel=Image.new("RGB",(W,H*len(group)+31),(18,22,27));d=ImageDraw.Draw(panel)
  d.text((12,10),"BATCH 2 — SOURCE CANDIDATE WHOLES + NATIVE CORNERS; NO PRISTINE APPROVAL",fill=(240,222,188))
  for i,(target,img) in enumerate(group):
   yy=31+i*H
   d.text((12,yy+5),target[:90],fill=(240,225,199))
   whole=display_rgb(img)
   whole.thumbnail((215,255),Image.Resampling.LANCZOS)
   panel.paste(whole,(10+(215-whole.width)//2,yy+32+(255-whole.height)//2))
   rgb=display_rgb(img)
   side=min(170,rgb.width,rgb.height)
   for q,(xx,xy) in enumerate([(0,0),(rgb.width-side,0),(0,rgb.height-side),(rgb.width-side,rgb.height-side)]):
    tile=rgb.crop((xx,xy,xx+side,xy+side))
    if side!=170:tile=tile.resize((170,170),Image.Resampling.NEAREST)
    panel.paste(tile,(251+q*182,yy+44))
    d.text((251+q*182,yy+222),["native TL","native TR","native BL","native BR"][q],fill=(175,190,196))
  name="batch2-candidate-inspection-"+str(start//5+1).zfill(2)+".jpg"
  fp=OUT/name;panel.save(fp,"JPEG",quality=88,optimize=True)
  files.append({"path":str(fp.relative_to(ROOT)),
      "sha256":hashlib.sha256(fp.read_bytes()).hexdigest(),"bytes":fp.stat().st_size})
 return files

records=[]
contact=[]
for idx,case in enumerate(CASES):
 record={"case_id":case["id"],"target":case["target"],"artist":case["artist"],
 "title":case["title"],"mode":case["mode"],"research_only":True,"editorial_reselected":False,
 "native_file_released":False,"publication_allowed":False,"pristine_approved":False,
 "candidate_search":[],"source_check":None,"native_archive":None,"errors":[]}
 try:
  if case["mode"]=="met_exact":
   obj=json.loads(get("https://collectionapi.metmuseum.org/public/collection/v1/objects/"+str(case["met_object_id"]),limit=2000000))
   record["source_check"]={"institution":"Met","object_id":obj.get("objectID"),"isPublicDomain":obj.get("isPublicDomain"),
    "artistDisplayName":obj.get("artistDisplayName"),"title":obj.get("title"),
    "objectURL":obj.get("objectURL"),"primaryImage":obj.get("primaryImage")}
   url=obj.get("primaryImage")
   if not obj.get("isPublicDomain") or not url or "Carracci" not in obj.get("artistDisplayName",""):
    raise ValueError("INSTITUTION_IDENTITY_OR_PD_IMAGE_NOT_CONFIRMED")
   raw=get(url)
   image=image_decode(raw)
   assert image.width>=case["minimum"][0] and image.height>=case["minimum"][1],"IMAGE_BELOW_MINIMUM"
   name=case["id"]+"-met-native."+("jpg" if image.format=="JPEG" else image.format.lower())
   fp=OUT/name;fp.write_bytes(raw)
   record["native_archive"]={"path":str(fp.relative_to(ROOT)),"sha256":hashlib.sha256(raw).hexdigest(),
    "width":image.width,"height":image.height,"bytes":len(raw),"original_unmodified":True,"origin":url,
    "rights_basis":"Met API isPublicDomain=true; review exact file terms at release"}
   record["status"]="RESEARCH_SOURCE_ARCHIVED_NOT_PRISTINE"
   contact.append((case["id"],image))
  elif case["mode"]=="commons_exact":
   info=image_info(case["file"])
   record["source_check"]=info
   if not info.get("found"):raise ValueError("EXACT_COMMONS_TITLE_NOT_FOUND")
   dims=(info.get("width") or 0,info.get("height") or 0)
   record["original_dimensions_declared"]=list(dims)
   good=dims[0]>=case["minimum"][0] and dims[1]>=case["minimum"][1]
   if not good:
    record["status"]="REFERENCE_ONLY_BELOW_SOURCE_QUALITY_FLOOR"
   elif (info.get("bytes") or MAX_BYTES+1)>MAX_BYTES:
    record["status"]="NATIVE_SOURCE_TOO_LARGE_FOR_SINGLE_BATCH"
   else:
    raw=get(info["url"]);image=image_decode(raw)
    if image.size!=dims:raise ValueError("UPSTREAM_PIXEL_MISMATCH")
    sha=hashlib.sha1(raw).hexdigest()
    if info.get("source_sha1") and sha!=info["source_sha1"]:
     raise ValueError("WIKIMEDIA_SHA1_MISMATCH")
    ext=".jpg" if image.format=="JPEG" else "."+image.format.lower()
    fp=OUT/(case["id"]+"-commons-native"+ext);fp.write_bytes(raw)
    record["native_archive"]={"path":str(fp.relative_to(ROOT)),"sha256":hashlib.sha256(raw).hexdigest(),
       "source_sha1":sha,"width":image.width,"height":image.height,"bytes":len(raw),
       "origin":info["url"],"original_unmodified":True,
       "rights_basis":"Wikimedia source metadata recorded; legal conditions not finally approved"}
    record["status"]="RESEARCH_SOURCE_ARCHIVED_NOT_PRISTINE"
    contact.append((case["id"],image))
   # Independent Wikimedia search even when exact source is below threshold.
   if case.get("search"):
    try:record["candidate_search"]=search(case["search"])
    except Exception as exc:record["errors"].append("SEARCH: "+str(exc)[:150])
  else:
   record["status"]="DISCOVERY_PENDING_EXACT_OBJECT_IDENTIFICATION"
   record["candidate_search"]=search(case["search"])
 except Exception as e:
  record["status"]=record.get("status") or "SOURCE_FETCH_FAILED"
  record["errors"].append(str(e)[:450])
 records.append(record)
 print(idx+1,"/",len(CASES),case["id"],record["status"],flush=True)
 time.sleep(.3)
evidence=thumbs(contact)
summary={}
for r in records:summary[r["status"]]=summary.get(r["status"],0)+1
out={
 "schema":"AO_PRAYER_ART_BULK_B2_ACQUISITION_RESULTS_V1","date":"2026-10-28",
 "attempted":len(CASES),"cases":records,
 "summary":summary,"original_native_sources_archived":len(contact),
 "only_original_decodable_source_bytes_archived":True,
 "contact_sheets":evidence,"cost_eur":0,
 "fake_upscale_count":0,"production_releases":0,"pristine_photo_final_certifications":0,
 "rule":"This is an acquisition pass, not final artwork quality or legal approval. Rejected/copy/ambiguous candidates remain discovery leads only."
}
(OUT/"intake-results.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
print(json.dumps({"result":"B2_BULK_ACQUISITION_COMPLETED_NO_PUBLICATION",
 "attempted":len(records),"statuses":summary,"originals_archived":len(contact),"contact_sheets":len(evidence)},indent=2))
