#!/usr/bin/env python3
"""Import Photo Finder decisions into the EXISTING canonical Place media release.

The upload is one editorial choice per image, not a demand to review again.
No live image is approved from CSV claims alone: verify Commons source SHA1,
current author/license, original bytes and decoded WebP before --apply.
Data stays in the existing approved-place-media/gallery registries.
"""
from __future__ import annotations
import argparse
import collections
import csv
import datetime as dt
import hashlib
import importlib.util
import json
import re
import shutil
import urllib.parse
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
DIR=ROOT/"data/geography"
IN=DIR/"research/photo-finder-20261030"
DECISIONS=IN/"decisions.json"
CREDITS=IN/"credits.csv"
COVERS=DIR/"approved-place-media.v1.json"
GALLERY=DIR/"approved-place-gallery.v1.json"
PLACES=DIR/"seed-registry.v1.json"
STAGER=ROOT/"tools/directory/stage-bulk-place-photos.py"
spec=importlib.util.spec_from_file_location("ao_photo_staging",STAGER)
stage=importlib.util.module_from_spec(spec)
spec.loader.exec_module(stage)

POLICY={
 "CC0":"CC0","CC BY 2.0":"CC-BY-2.0","CC BY 2.5":"CC-BY-2.5",
 "CC BY 3.0":"CC-BY-3.0","CC BY 4.0":"CC-BY-4.0",
 "CC BY-SA 2.0":"CC-BY-SA-2.0","CC BY-SA 2.5":"CC-BY-SA-2.5",
 "CC BY-SA 3.0":"CC-BY-SA-3.0","CC BY-SA 4.0":"CC-BY-SA-4.0"
}
CAP=20
# These are exceptional subjects requiring a specific copyright/subject determination.
# Conservative at the filename stage; no fabricated machine vision claim.
EXCEPTION=re.compile(r"(?:stained.?glass|vitrail|modern.?art|sculpture|statue|portrait|"
                     r"memorial|relic|painting|artwork|mosaic|mural|window|figurine|"
                     r"pintura|escultura|estatua|fresque|vitral)",re.I)

def load_json(p):
 return json.loads(Path(p).read_text(encoding="utf-8"))
def norm_commons(title):
 if (not isinstance(title,str) or not title.startswith("File:")
     or len(title)>265 or any(x in title for x in ("\0","\n","\r","/","|","#","?"))):
  raise ValueError("Invalid Commons title")
 return "https://commons.wikimedia.org/wiki/"+urllib.parse.quote(
    title.replace(" ","_"),safe=":/_(),-")
def sha1(s):
 return bool(re.fullmatch(r"[a-f0-9]{40}",str(s)))
def source_status(rows,decisions,places,covers,gallery):
 """Strictly reconcile exported choices and source claims with 530 Places."""
 if decisions.get("schema")!="AO_PLACE_PHOTO_DECISIONS_V1":
  raise ValueError("Wrong Photo Finder decision schema")
 ds=decisions.get("decisions")
 if not isinstance(ds,dict) or len(ds)!=451:
  raise ValueError("Expected 451 preserved editorial decisions")
 if (places.get("schema")!="EXPLORE_GEOGRAPHY_SEED_V1"
     or covers.get("schema")!="AO_APPROVED_PLACE_MEDIA_V1"
     or gallery.get("schema")!="AO_APPROVED_PLACE_GALLERY_V1"):
  raise ValueError("Unexpected canonical media schema")
 site={p["place_id"]:p for p in places["places"]}
 if not set(ds).issubset(site):
  raise ValueError("An editor decision names an unknown canonical Place")
 credits={}
 for r in rows:
  if not r["place_id"] in ds:
   raise ValueError("Credit points outside decisions")
  k=(r["place_id"],r["commons_file"])
  if k in credits:raise ValueError("Duplicate selection credit")
  if not sha1(r.get("original_sha1")):
   raise ValueError("Missing SHA1 source claim")
  if r["commons_page"]!=norm_commons(r["commons_file"]) and (
    urllib.parse.unquote(urllib.parse.urlsplit(r["commons_page"]).path)
    .replace("_"," ")!="/wiki/"+r["commons_file"]):
   raise ValueError("Commons page URL does not match file title")
  credits[k]=r
 expected=set()
 for pid,v in ds.items():
  files=v.get("files")
  if not isinstance(files,list) or len(files)>3 or len(files)!=len(set(files)):
   raise ValueError("Invalid choice count or duplicates")
  if (v.get("none") is True)!=(len(files)==0):
   raise ValueError("None marker conflicts with chosen files")
  for rank,file in enumerate(files,1):
   k=(pid,file)
   if k not in credits:raise ValueError("Chosen photo has no credit metadata")
   r=credits[k]
   if int(r["rank"])!=rank or r["role"]!=("main" if rank==1 else "gallery"):
    raise ValueError("Role/rank not aligned with editorial choice")
   expected.add(k)
 if expected!=set(credits) or len(rows)!=972:
  raise ValueError("Unselected/missing/extra credit records")
 cover_approved={r["place_id"]:r for r in covers["items"] if r.get("status")=="APPROVED"}
 gallery_approved=collections.defaultdict(list)
 for r in gallery["items"]:
  if r.get("status")=="APPROVED":gallery_approved[r["place_id"]].append(r)
 known_hashes=collections.defaultdict(set)
 for r in covers["items"]+gallery["items"]:
  if r.get("status")=="APPROVED" and sha1(r.get("source_sha1")):
   known_hashes[r["source_sha1"]].add(r["place_id"])
 tasks=[];holds=[];skips=[];seen_hashes=collections.defaultdict(set)
 for pid,decision in ds.items():
  place=site[pid]
  for rank,title in enumerate(decision["files"],1):
   record=credits[(pid,title)]
   role="cover" if rank==1 else "gallery"
   digest=record["original_sha1"]
   gate=None
   if role=="cover" and pid in cover_approved:
    gate="PRESERVE_EXISTING_APPROVED_COVER"
   elif pid in known_hashes[digest]:
    gate="ALREADY_APPROVED_SAME_PLACE_SOURCE"
   elif known_hashes.get(digest) and pid not in known_hashes[digest]:
    gate="SAME_SOURCE_APPROVED_FOR_OTHER_PLACE"
   elif seen_hashes[digest] and pid not in seen_hashes[digest]:
    gate="SAME_SOURCE_SELECTED_FOR_OTHER_PLACE"
   elif record["licence"] not in POLICY:
    gate="NONSTANDARD_OR_PUBLIC_DOMAIN_RIGHTS_REVIEW"
   elif int(record["width"])<650 or int(record["height"])<650:
    gate="ORIGINAL_DIMENSIONS_BELOW_MINIMUM"
   elif EXCEPTION.search(title):
    gate="EXCEPTIONAL_SUBJECT_REQUIRES_COPYRIGHT_OR_IDENTITY_REVIEW"
   if gate:
    (skips if gate.startswith(("PRESERVE_","ALREADY_")) else holds).append({
       "place_id":pid,"rank":rank,"source_file":title,"reason":gate})
   else:
    tasks.append({"place_id":pid,"place_name":place["name"]["official"],
      "rank":rank,"role":role,"title":title,"sha1":digest,
      "source_page":norm_commons(title),
      "original_license_claim":record["licence"],"license":POLICY[record["licence"]],
      "original_author_claim":record["author"]})
   seen_hashes[digest].add(pid)
 return {"tasks":tasks,"holds":holds,"skips":skips,
   "reviewed_places":len(ds),
   "chosen_places":sum(bool(x["files"]) for x in ds.values()),
   "none_places":sum(x["none"] for x in ds.values()),
   "source_rows":len(rows),"total_canonical_places":len(site),
   "existing_approved_cover_places":len(cover_approved),
   "existing_approved_gallery_places":len(gallery_approved)}

def make_entry(item,info,license_name,author,derivative,wh):
 pid=item["place_id"]
 digest=hashlib.sha256((pid+"\0"+item["title"]).encode()).hexdigest()[:22]
 path=("assets/approved/place-media/" if item["role"]=="cover" else
       "assets/approved/place-gallery/")+"pf-"+digest+".webp"
 license="CC0-1.0" if license_name=="CC0" else license_name
 label=item["place_name"]
 fields={"place_id":pid,"status":"APPROVED","asset_path":path,
   "source_url":item["source_page"],"source_sha1":item["sha1"],
   "derivative_sha256":hashlib.sha256(derivative).hexdigest(),
   "credit":author,"license":license,"license_url":stage.LICENSES[license_name],
   "rights_verified":True,"subject_verified":True,"crop_reviewed":True,
   "width":wh[0],"height":wh[1],
   "orientation":"portrait" if wh[1]>wh[0] else "landscape",
   "alt_en":"Photograph of "+label,"alt_fr":"Photographie de "+label,
   "changes_en":"Full-frame WebP, EXIF orientation normalized; no crop or recolouring.",
   "changes_fr":"Image entière en WebP, orientation EXIF corrigée ; ni recadrage ni retouche.",
   "reviewed_at":"2026-10-30",
   "review_method":"Photo Finder editorial selection, 2026-10-30; live Commons exact licence, author, original SHA1, original bytes and WebP digest verified."
 }
 if item["role"]=="cover":
  fields["source_place_ref"]="PHOTO_FINDER_2026-10-30_R1"
 else:
  fields.update({"media_id":"pf-"+digest,"kind":"PHOTO","chapter_id":"place",
    "display_role":"GALLERY","label_en":label,"label_fr":label,
    "caption_en":"Photograph by "+author+".",
    "caption_fr":"Photographie de "+author+"."})
 return fields

def verify_and_stage(tasks,out_dir,*,apply=False,metadata_loader=None,downloader=None):
 if not (1<=len(tasks)<=CAP):
  raise ValueError("Bounded to 1–20 selected photo tasks")
 out_dir=Path(out_dir)
 if out_dir.exists():raise ValueError("Refuse overwrite of existing batch directory")
 out_dir.mkdir(parents=True)
 loader=metadata_loader or stage.api_metadata
 fetch=downloader or stage.fetch
 accepted=[];held=[];total=0
 for item in tasks:
  source={"title":item["title"],"expected_sha1":item["sha1"],
          "expected_license":item["license"],"venue_id":item["place_id"],
          "panorama_hint":"UNSPECIFIED"}
  try:
   info,name,author=loader(source)
   if (name!=item["license"] or info.get("sha1")!=item["sha1"]
       or info.get("mime") not in {"image/jpeg","image/png","image/webp"}
       or int(info.get("size") or 0)<1000 or int(info["size"])>stage.MAX_ORIGINAL_BYTES
       or total+int(info["size"])>stage.MAX_BATCH_ORIGINAL_BYTES):
    raise ValueError("Source SHA1/licence/MIME/size changed or unsupported")
   original=fetch(info["url"],stage.MAX_ORIGINAL_BYTES)
   if len(original)!=int(info["size"]) or hashlib.sha1(original).hexdigest()!=item["sha1"]:
    raise ValueError("Original file bytes do not match current Commons SHA1")
   derivative,shape,possible_360=stage.convert_original(original,info,source)
   if possible_360:raise ValueError("Unverified panorama")
   if min(shape)<500:raise ValueError("Derivative too small for Place gallery")
   meta=make_entry(item,info,name,author,derivative,shape)
   p=out_dir/Path(meta["asset_path"]).name
   p.write_bytes(derivative)
   total+=len(original)
   accepted.append({"item":meta,"local":str(p),"rank":item["rank"]})
  except Exception as error:
   held.append({"place_id":item["place_id"],"file":item["title"],
               "reason":type(error).__name__+": "+str(error)[:200]})
 if apply and accepted:
  covers=load_json(COVERS);gallery=load_json(GALLERY)
  for record in accepted:
   m=record["item"]
   if (ROOT/m["asset_path"]).exists():
    raise ValueError("Refuse overwrite of previously published asset")
   if m.get("media_id"):
    if any(i.get("media_id")==m["media_id"] for i in gallery["items"]):
     raise ValueError("Duplicate gallery media ID")
   elif any(x["place_id"]==m["place_id"] for x in covers["items"]):
    raise ValueError("Do not replace an existing cover")
  for record in accepted:
   m=record["item"];target=ROOT/m["asset_path"]
   target.parent.mkdir(parents=True,exist_ok=True)
   shutil.copyfile(record["local"],target)
   (gallery if m.get("media_id") else covers)["items"].append(m)
  covers["items"].sort(key=lambda x:x["place_id"])
  gallery["items"].sort(key=lambda x:(x["place_id"],x["media_id"]))
  for p,obj in [(COVERS,covers),(GALLERY,gallery)]:
   tmp=p.with_suffix(".json.tmp")
   tmp.write_text(json.dumps(obj,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
   tmp.replace(p)
 report={"schema":"AO_FINDER_SELECTED_PHOTO_STAGE_V1",
   "status":"APP_FILES_UPDATED" if apply else "STAGED_ONLY",
   "attempted":len(tasks),"verified":len(accepted),
   "exceptions":held,"media_records":accepted,
   "new_files_in_app_tree":len(accepted) if apply else 0,
   "verified_visible_in_running_app":0}
 (out_dir/"verification-report.json").write_text(
   json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 return report

def main():
 p=argparse.ArgumentParser()
 p.add_argument("--plan",action="store_true")
 p.add_argument("--role",choices=["all","cover","gallery"],default="all")
 p.add_argument("--offset",type=int,default=0)
 p.add_argument("--limit",type=int,default=20)
 p.add_argument("--output-dir",type=Path)
 p.add_argument("--apply",action="store_true")
 a=p.parse_args()
 with CREDITS.open(encoding="utf-8-sig",newline="") as f:
  rows=list(csv.DictReader(f))
 src=source_status(rows,load_json(DECISIONS),load_json(PLACES),
                   load_json(COVERS),load_json(GALLERY))
 tasks=[x for x in src["tasks"] if a.role=="all" or x["role"]==a.role]
 if a.plan:
  print(json.dumps({"schema":"AO_FINDER_20261030_INTAKE_PLAN_V1",
   "reviewed_places":src["reviewed_places"],
   "chosen_places":src["chosen_places"],
   "none_places":src["none_places"],"selected_photos":src["source_rows"],
   "total_canonical_places":src["total_canonical_places"],
   "releasable_metadata_claims":len(tasks),
   "potential_new_covers":sum(x["role"]=="cover" for x in tasks),
   "potential_new_gallery":sum(x["role"]=="gallery" for x in tasks),
   "held":len(src["holds"]),"skipped":len(src["skips"]),
   "holds_by_reason":dict(collections.Counter(x["reason"] for x in src["holds"])),
   "skips_by_reason":dict(collections.Counter(x["reason"] for x in src["skips"])),
   "new_files_in_app":0,"photos_verified_live":0},ensure_ascii=False))
  return
 if a.offset<0 or not 1<=a.limit<=CAP or a.offset>=len(tasks):
  p.error("Choose a valid nonempty bounded slice: --offset N --limit 1..20")
 if not a.output_dir:p.error("--output-dir required for live source verification")
 result=verify_and_stage(tasks[a.offset:a.offset+a.limit],a.output_dir,apply=a.apply)
 print(json.dumps({k:result[k] for k in
   ("status","attempted","verified","new_files_in_app_tree","verified_visible_in_running_app")}))
if __name__=="__main__":main()
