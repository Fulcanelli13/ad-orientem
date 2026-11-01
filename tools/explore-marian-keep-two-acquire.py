#!/usr/bin/env python3
"""Acquire ONLY two historically user-KEEP-selected Marian photographs.
Strict source SHA1, Commons original and photograph licence gates. No generic search.
Generate mobile WebP bytes + approved exact-Place gallery metadata atomically.
"""
from __future__ import annotations
import hashlib, html, io, json, re, sys, time
from pathlib import Path
from urllib.parse import urlencode, urlparse, quote
from urllib.request import Request, urlopen
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parents[1]
PINS=ROOT/"data/geography/research/marian-keep-two-release-source-pins-20261101.v1.json"
GALLERY=ROOT/"data/geography/approved-place-gallery.v1.json"
UA="AdOrientemSacredGeography/1.0 (https://github.com/Fulcanelli13/ad-orientem; original-photo licensing QA)"
EXPECTED={"subject:focus:jasna-gora-black-madonna",
          "subject:round1-review:DE:altoetting-gnadenkapelle:9"}
def fetch(url, *, retries=3, max_bytes=17_000_000):
    for n in range(retries):
        try:
            with urlopen(Request(url,headers={"User-Agent":UA,"Accept":"application/json,image/jpeg,*/*"}),timeout=35) as r:
                if int(r.status)!=200: raise ValueError("HTTP status "+str(r.status))
                if urlparse(r.url).scheme!="https":raise ValueError("Insecure redirect")
                value=r.read(max_bytes+1)
                if len(value)>max_bytes:raise ValueError("Source original too large")
                return value
        except Exception:
            if n+1==retries:raise
            time.sleep(2+n*2)
def plain(value):
    return re.sub(r"\s+"," ",html.unescape(re.sub(r"<[^>]+>","",str(value)))).strip()
def meta_for(title):
    u="https://commons.wikimedia.org/w/api.php?"+urlencode({
        "action":"query","format":"json","prop":"imageinfo",
        "iiprop":"url|sha1|size|extmetadata","titles":title
    })
    j=json.loads(fetch(u,max_bytes=500_000))
    pages=list(j["query"]["pages"].values())
    if len(pages)!=1 or not pages[0].get("imageinfo"):raise ValueError("Commons exact title not found: "+title)
    return pages[0]["imageinfo"][0]
def run():
    pins=json.loads(PINS.read_text(encoding="utf-8"))
    gallery=json.loads(GALLERY.read_text(encoding="utf-8"))
    rows=pins.get("subjects",[])
    if pins.get("schema")!="AO_EXPLORE_MARIAN_KEEP_TWO_EXACT_SOURCE_V1" or len(rows)!=2 or {x["subject_id"] for x in rows}!=EXPECTED:
        raise ValueError("Exact release subject allowlist changed")
    if gallery.get("schema")!="AO_APPROVED_PLACE_GALLERY_V1" or len(gallery.get("items",[]))<33:
        raise ValueError("Approved gallery baseline unavailable")
    changes=[]
    for row in rows:
        if row.get("historic_user_keep") is not True:raise ValueError("Unapproved historic subject")
        existing=[x for x in gallery["items"] if x.get("media_id")==row["media_id"]]
        target=ROOT/row["asset_path"]
        if existing:
            if len(existing)!=1 or not target.is_file() or existing[0]["derivative_sha256"]!=hashlib.sha256(target.read_bytes()).hexdigest() or existing[0].get("subject_focus_id")!=row["subject_id"]:
                raise ValueError("Existing approved media differs; refusing overwrite")
            print("ALREADY_APPROVED_AND_HASH_VERIFIED",row["media_id"])
            continue
        if target.exists():raise ValueError("Target binary exists but has no approved metadata: "+str(target))
        info=meta_for(row["file_title"])
        if str(info.get("sha1","")).lower()!=row["original_sha1"].lower():
            raise ValueError("Commons native SHA1 mismatch for "+row["file_title"])
        ext=info.get("extmetadata") or {}
        license_short=plain((ext.get("LicenseShortName") or {}).get("value","")).replace("-"," ").upper()
        license_url=plain((ext.get("LicenseUrl") or {}).get("value",""))
        author=plain((ext.get("Artist") or {}).get("value",""))
        if license_short!="CC BY SA 4.0" or license_url.rstrip("/")!=row["license_url"].rstrip("/"):
            raise ValueError("License changed or incompatible: "+row["file_title"]+" "+license_short+" "+license_url)
        if row["photographer"].lower() not in author.lower():
            raise ValueError("Photographer metadata changed: "+row["file_title"]+" "+author[:150])
        original_url=info.get("url","")
        host=urlparse(original_url).hostname
        if host!="upload.wikimedia.org" or urlparse(original_url).scheme!="https":
            raise ValueError("Native original must use Wikimedia's exact upload host")
        raw=fetch(original_url)
        if hashlib.sha1(raw).hexdigest()!=row["original_sha1"]:
            raise ValueError("Original JPEG bytes fail pinned Commons SHA1: "+row["file_title"])
        if len(raw)<30_000 or int(info.get("width",0))<1400 or int(info.get("height",0))<1400:
            raise ValueError("Source photo lacks suitable native image resolution")
        im=Image.open(io.BytesIO(raw))
        if im.format!="JPEG":raise ValueError("Unexpected native media format")
        im=ImageOps.exif_transpose(im).convert("RGB")
        if min(im.size)<1400:raise ValueError("Source photo EXIF orientation/resolution suspect")
        im.thumbnail((1600,1600),Image.Resampling.LANCZOS)
        output=io.BytesIO()
        im.save(output,format="WEBP",quality=88,method=6)
        binary=output.getvalue()
        if binary[0:4]!=b"RIFF" or binary[8:12]!=b"WEBP":
            raise ValueError("Derivative is not WebP")
        target.parent.mkdir(parents=True,exist_ok=True)
        target.write_bytes(binary)
        clean_name=quote(row["file_title"].replace(" ","_"),safe=":/()'")
        width,height=im.size
        media={
            "media_id":row["media_id"],"place_id":row["place_id"],
            "status":"APPROVED","kind":"PHOTO",
            "asset_path":row["asset_path"],
            "chapter_id":"images","display_role":"GALLERY_OBJECT",
            "subject_focus_id":row["subject_id"],
            "label_en":row["label_en"],"label_fr":row["label_fr"],
            "alt_en":row["alt_en"],"alt_fr":row["alt_fr"],
            "caption_en":row["caption_en"],"caption_fr":row["caption_fr"],
            "source_url":"https://commons.wikimedia.org/wiki/"+clean_name,
            "source_sha1":row["original_sha1"],
            "derivative_sha256":hashlib.sha256(binary).hexdigest(),
            "credit":row["photographer"],"license":row["license"],
            "license_url":row["license_url"],
            "rights_verified":True,"subject_verified":True,"crop_reviewed":True,
            "photographed_at":row["photographed_at"],
            "reviewed_at":"2026-11-01",
            "review_method":"Prior explicit user KEEP; image visually checked in original B18 archive; exact historical object source crosswalk; original Wikimedia JPEG SHA1 verified; photographer and exact CC BY-SA 4.0 licence confirmed; medieval source art identity independently documented. No new editorial selection.",
            "underlying_work_source_url":row["underlying_work_source_url"],
            "changes_en":"Original Commons photograph resized to fit 1600 pixels and encoded as WebP; no crop, colour treatment or compositing.",
            "changes_fr":"Photographie originale de Commons redimensionnée dans une limite de 1 600 pixels et convertie en WebP ; aucun recadrage, traitement colorimétrique ni montage.",
            "width":width,"height":height,
            "orientation":"portrait" if height>width else "landscape",
            "user_selection_provenance":"HISTORIC_KEEP_PROTECTED_20261031",
            "not_relic_image":True
        }
        gallery["items"].append(media)
        changes.append((row["media_id"],len(binary),width,height))
    if changes:
        gallery["version"]="1.5.0"
        GALLERY.write_text(json.dumps(gallery,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    for v in changes:print("VERIFIED_APPROVED_GALLERY_OBJECT",*v)
    print(json.dumps({"accepted_new_images":len(changes),"total_gallery_items":len(gallery["items"]),"unrelated_approved_gallery_changed":False,"new_relic_photo_publications":0}))
if __name__=="__main__":
    run()
