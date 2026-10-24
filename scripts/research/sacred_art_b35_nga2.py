#!/usr/bin/env python3
"""B35: exact NGA image-level Open Access 2-record acquisition, research only.

Uses NGA published_images.csv image.openaccess=1 (not dataset-wide CC0
alone). Select the primary IIIF image for exact object id. Saves a bounded
3200px research rendition, not the raw camera master, to an UNPUBLISHED
release only after the mandatory archive gate. No editorial approval.
"""
import csv,hashlib,io,json,re,time
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.parse import urlsplit
from datetime import datetime,timezone
from PIL import Image

ROOT=Path("data/research")
OUT=Path("artifacts/b35-nga2-imagelevel")
MANIFEST=ROOT/"sacred-art-b35-nga-two-imagelevel-targets.json"
CSV_URL="https://raw.githubusercontent.com/NationalGalleryOfArt/opendata/main/data/published_images.csv"
RIGHTS="https://www.nga.gov/artworks/free-images-and-open-access"
AGENT="AdOrientem-SacredArt-Research/3.0 (+https://github.com/Fulcanelli13/ad-orientem)"
FIELDS=["artwork_id","object_id","title","source_object_url","NGA_image_uuid",
        "NGA_image_openaccess","NGA_image_role","NGA_IIIF_base",
        "requested_rendition_url","recorded_image_width","recorded_image_height",
        "download_sha256","rendition_bytes","rendition_width","rendition_height",
        "resolution_gate","status","hold_reason","source_image_licence_verified",
        "research_only","editorial_selection_changed","publication_approved"]
def req(url,accept):
 if not url.startswith("https://"):raise ValueError("HTTPS only")
 return urlopen(Request(url,headers={"User-Agent":AGENT,"Accept":accept,"Accept-Encoding":"identity"}),timeout=90)
def main():
 j=json.loads(MANIFEST.read_text())
 records=j["records"]
 assert len(records)==2 and {r["object_id"] for r in records}=={"63264","96688"}
 assert {r["artwork_id"] for r in records}=={"G17-010","nga-96688"}
 assert j["publication_approvals_created"]==0 and j["selection_approvals_created"]==0
 image_rows={r["object_id"]:[] for r in records}
 with req(CSV_URL,"text/csv") as f:
  reader=csv.DictReader(io.TextIOWrapper(f,encoding="utf-8-sig",errors="replace",newline=""))
  lower_cols={k.lower():k for k in reader.fieldnames}
  needed=("depictstmsobjectid","openaccess","iiifurl","uuid","viewtype")
  assert all(k in lower_cols for k in needed)
  for row in reader:
   id=(row.get(lower_cols["depictstmsobjectid"]) or "").strip()
   if id in image_rows:
    image_rows[id].append({key.lower():val for key,val in row.items()})
 OUT.mkdir(parents=True,exist_ok=True)
 (OUT/"iiif_renditions").mkdir(exist_ok=True)
 Image.MAX_IMAGE_PIXELS=160_000_000
 decisions=[];downloaded=0;total=0
 for r in records:
  o={k:"" for k in FIELDS}
  o.update(artwork_id=r["artwork_id"],object_id=r["object_id"],title=r["title"],
           source_object_url=r["source_page"],source_image_licence_verified="NO",
           research_only="YES",editorial_selection_changed="NO",publication_approved="NO")
  valid=[x for x in image_rows[r["object_id"]] if x.get("openaccess","").strip()=="1"
         and x.get("iiifurl","").strip()]
  primary=[x for x in valid if x.get("viewtype","").strip().lower()=="primary"]
  pool=primary or valid
  pool.sort(key=lambda x:int(x.get("width") or 0)*int(x.get("height") or 0),reverse=True)
  dest=OUT/"iiif_renditions"/(r["artwork_id"]+".jpg")
  try:
   if not image_rows[r["object_id"]]:
    raise ValueError("NGA_PUBLISHED_IMAGES_HAS_NO_OBJECT_ROW")
   if not pool:
    raise ValueError("NGA_IMAGE_LEVEL_OPENACCESS_1_ABSENT")
   im=pool[0];base=im["iiifurl"].strip().rstrip("/")
   p=urlsplit(base)
   if p.scheme!="https" or p.hostname!="api.nga.gov" or not re.fullmatch("/iiif/[A-Za-z0-9-]+",p.path):
    raise ValueError("NGA source URL does not resolve to expected IIIF host")
   url=base+"/full/!3200,3200/0/default.jpg"
   o.update(NGA_image_uuid=im.get("uuid",""),NGA_image_openaccess="1",
    NGA_image_role=im.get("viewtype",""),NGA_IIIF_base=base,
    requested_rendition_url=url,recorded_image_width=im.get("width",""),
    recorded_image_height=im.get("height",""),source_image_licence_verified="YES")
   h=hashlib.sha256();size=0
   with req(url,"image/jpeg,image/*") as stream, dest.open("wb") as output:
    if not stream.headers.get("Content-Type","").lower().startswith("image/"):
     raise ValueError("NGA IIIF HTTP response not image")
    for piece in iter(lambda:stream.read(1024*1024),b""):
     size+=len(piece)
     if size>40_000_000:raise ValueError("40MB per-image cap")
     h.update(piece);output.write(piece)
   with Image.open(dest) as image:
    image.verify()
   with Image.open(dest) as image:
    width,height=image.size
    assert image.format=="JPEG"
   if size<10000:raise ValueError("Image rendition too small")
   if max(width,height)>3200:raise ValueError("Unexpected IIIF requested tier")
   o.update(download_sha256=h.hexdigest(),rendition_bytes=size,
       rendition_width=width,rendition_height=height,
       resolution_gate=("LONG_EDGE_2400_PASS" if max(width,height)>=2400 else "RESOLUTION_REVIEW"),
       status="IMAGE_LEVEL_OPENACCESS_1_IIIF_SOURCE_RECOVERED_RESEARCH_ONLY")
   downloaded+=1;total+=size
  except Exception as ex:
   dest.unlink(missing_ok=True)
   o.update(status="SOURCE_NO_DOWNLOAD_HOLD",hold_reason=type(ex).__name__+": "+str(ex)[:300])
  decisions.append(o)
  print("B35_NGA",o["artwork_id"],o["status"],o["hold_reason"],flush=True)
  time.sleep(.6)
 assert len(decisions)==2 and len(list((OUT/"iiif_renditions").iterdir()))==downloaded
 with (OUT/"source-results.csv").open("w",encoding="utf-8",newline="") as f:
  w=csv.DictWriter(f,fieldnames=FIELDS);w.writeheader();w.writerows(decisions)
 summary={"schema":"AO_B35_NGA_TWO_IMAGELEVEL_RIGHTS_AND_ORIGINALS_V1",
  "fixed_exact_object_ids":["63264","96688"],"image_level_rights_checked":2,
  "NGA_openaccess_1_source_images_found":sum(x["source_image_licence_verified"]=="YES" for x in decisions),
  "research_iiif_renditions_downloaded":downloaded,"rights_or_source_holds":2-downloaded,
  "new_research_bytes":total,
  "technical_2400px_pass":sum(x["resolution_gate"]=="LONG_EDGE_2400_PASS" for x in decisions),
  "research_iiif_renditions_not_raw_camera_originals":True,
  "image_level_rights_authority":CSV_URL,"NGA_policy":RIGHTS,
  "editorial_selections_approved":0,"publication_approvals_created":0,
  "canonical_451_modified":False,
  "unpublished_archive_gate_required":True,
  "checked_utc":datetime.now(timezone.utc).isoformat()}
 (OUT/"source-summary.json").write_text(json.dumps(summary,indent=2)+"\n")
 print("B35_NGA_SUMMARY",json.dumps(summary),flush=True)
if __name__=="__main__":main()
