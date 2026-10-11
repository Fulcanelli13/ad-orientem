#!/usr/bin/env python3
"""Strict rights/identity acquisition for four sacred-place gallery photos.

Append-only to R68 published gallery. Never infer a licence or a Place ID;
do not load image URLs in the app. No crop and all binary hashes retained.
"""
import hashlib, html, io, json, re, runpy
from pathlib import Path
from urllib.parse import urlencode,urlsplit
from PIL import Image,ImageOps

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/"data/geography/research/explore-r69-gallery-sources.v1.json"
OUT=ROOT/"assets/approved/place-gallery"
REGISTRY=ROOT/"data/geography/approved-place-gallery.v1.json"
REQUEST=runpy.run_path(str(ROOT/"tools/stage-place-media.py"),run_name="r69_helpers")["request_bytes"]
LICENSE="https://creativecommons.org/licenses/by-sa/4.0/"
Image.MAX_IMAGE_PIXELS=28_000_000

def cleaned(value):
 return html.unescape(re.sub(r"<[^>]+>"," ",str(value or ""))).strip()

def validate():
 src=json.loads(SRC.read_text(encoding="utf8"))
 known={p["place_id"] for p in json.loads((ROOT/"data/geography/seed-registry.v1.json").read_text(encoding="utf8"))["places"]}
 old=json.loads(REGISTRY.read_text(encoding="utf8"))
 assert src["schema"]=="AO_PLACE_GALLERY_ACQUISITION_R69_V1"
 assert old["schema"]=="AO_APPROVED_PLACE_GALLERY_V1"
 assert len(old["items"])==2, "R69 must build on two R68 originals, not an obsolete parallel gallery"
 assert {r["media_id"] for r in old["items"]}=={"pontmain-east-facade-2016","pontmain-main-nave-2011"}
 items=src["sources"]
 assert len(items)==4
 assert len({r["media_id"] for r in items})==len({r["commons_title"] for r in items})==len({r["asset_filename"] for r in items})==4
 assert {r["place_id"] for r in items}=={"place:FR:basilique-sainte-therese-lisieux","place:FR:chartres-notre-dame","place:FR:rue-du-bac"}
 for row in items:
  assert row["place_id"] in known
  assert row["commons_title"].startswith("File:")
  assert row["source_url"].startswith("https://commons.wikimedia.org/wiki/File:")
  assert row["expected_license"]=="CC-BY-SA-4.0"
  assert row["expected_artist"] and len(row["expected_artist"])>=5
  assert row["content_kind"] in {"PHOTO","SACRED_ART_PHOTOGRAPH"}
  assert re.fullmatch(r"FR-[a-z0-9-]+\.webp",row["asset_filename"])
  for key in ("label_en","label_fr","alt_en","alt_fr","chapter_id"):
   assert len(row[key])>5
 return src,old

def metadata(title,artist):
 url="https://commons.wikimedia.org/w/api.php?"+urlencode({
  "action":"query","format":"json","formatversion":"2","prop":"imageinfo",
  "titles":title,"iiprop":"url|extmetadata|sha1|size|mime","iiurlwidth":"1280"
 })
 data=json.loads(REQUEST(url,max_bytes=1_500_000))
 pages=data["query"]["pages"]
 assert len(pages)==1 and not pages[0].get("missing"),"File disappeared: "+title
 img=pages[0]["imageinfo"][0]
 assert img["mime"] in {"image/jpeg","image/png","image/webp"}
 val=lambda x:cleaned((img["extmetadata"].get(x) or {}).get("value"))
 lic=val("LicenseShortName").replace("-"," ").upper().replace("  "," ")
 assert lic=="CC BY SA 4.0","Incorrect license for "+title+": "+lic
 parsed=urlsplit(val("LicenseUrl"))
 assert parsed.scheme in {"http","https"} and parsed.hostname=="creativecommons.org" and parsed.path.rstrip("/")=="/licenses/by-sa/4.0"
 assert artist.casefold() in val("Artist").casefold(), "Wrong photographer: "+title+" observed="+val("Artist")
 assert re.fullmatch("[0-9a-f]{40}",img["sha1"])
 return img

def main():
 src,old=validate()
 OUT.mkdir(parents=True,exist_ok=True)
 rows=old["items"][:]
 for r in src["sources"]:
  info=metadata(r["commons_title"],r["expected_artist"])
  raw=REQUEST(info.get("thumburl") or info["url"],max_bytes=20_000_000)
  with Image.open(io.BytesIO(raw)) as original:
   assert original.format in {"JPEG","PNG","WEBP"}
   image=ImageOps.exif_transpose(original).convert("RGB")
   assert min(image.size)>=500
   image.thumbnail((1280,1280),Image.Resampling.LANCZOS)
   destination=OUT/r["asset_filename"]
   assert not destination.exists(), "Refuse overwriting an existing approved gallery photo"
   image.save(destination,"WEBP",quality=84,method=6)
   width,height=image.size
  saved=destination.read_bytes()
  assert len(saved)>12_000 and saved[:4]==b"RIFF" and saved[8:12]==b"WEBP"
  rows.append({
   "media_id":r["media_id"],"place_id":r["place_id"],"status":"APPROVED","kind":"PHOTO",
   "content_kind":r["content_kind"],"asset_path":str(destination.relative_to(ROOT)),
   "chapter_id":r["chapter_id"],"label_en":r["label_en"],"label_fr":r["label_fr"],
   "alt_en":r["alt_en"],"alt_fr":r["alt_fr"],
   "source_url":r["source_url"],"source_sha1":info["sha1"],
   "derivative_sha256":hashlib.sha256(saved).hexdigest(),"credit":r["expected_artist"],
   "license":"CC-BY-SA-4.0","license_url":LICENSE,
   "rights_verified":True,"subject_verified":True,"crop_reviewed":True,
   "review_method":"Official Commons author/license/caption/source identity reviewed; live Commons metadata matched original before downsampling without crop.",
   "changes_en":"Original frame resized and converted to WebP; no crop.",
   "changes_fr":"Image redimensionnée et convertie en WebP sans recadrage.",
   "width":width,"height":height,
   "orientation":"portrait" if height>width else "landscape",
   "reviewed_at":"2026-10-11"
  })
  print("VERIFIED",r["media_id"],width,height,len(saved),flush=True)
 assert len(rows)==6
 new={**old,"version":"1.1.0","items":rows,
  "editorial_policy":"R68-R69 source-checked, exact-site local approved assets only; original CC attribution per image",
  "acquisition_manifests":[old.get("acquisition_manifest"),str(SRC.relative_to(ROOT))]}
 REGISTRY.write_text(json.dumps(new,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
 print("PASS R69 four approved additional site media; total",len(rows),flush=True)

if __name__=="__main__":
 main()
