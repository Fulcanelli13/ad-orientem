#!/usr/bin/env python3
"""Acquire exact, openly reusable official art file candidates. No publication/cropping."""
from __future__ import annotations
import hashlib, io, json, os, urllib.request, urllib.error
from pathlib import Path
from PIL import Image, ImageOps
ROOT = Path("assets/staged/module-hero-open-photo-candidates-20261027")
TARGETS = [
    {"id":"classi-ashwed-2026","type":"met","met_id":436839,"expected_artist":"Georges de La Tour",
     "title":"The Penitent Magdalen","feast":"2026-02-18","object_url":"https://www.metmuseum.org/art/collection/search/436839",
     "rights":"MET_OPEN_ACCESS_CC0"},
    {"id":"classi-allsaints-2026","type":"met","met_id":437607,"expected_artist":"Carlo Saraceni",
     "title":"Paradise","feast":"2026-11-01","object_url":"https://www.metmuseum.org/art/collection/search/437607",
     "rights":"MET_OPEN_ACCESS_CC0"},
    {"id":"module-rosary-lotto","type":"commons_cc_by","file_url":"https://upload.wikimedia.org/wikipedia/commons/5/5e/Lorenzo_lotto%2C_madonna_del_rosario%2C_1539%2C_01.jpg",
     "title":"Madonna del Rosario","artist":"Lorenzo Lotto","module_id":"rosary",
     "object_url":"https://commons.wikimedia.org/wiki/File:Lorenzo_lotto,_madonna_del_rosario,_1539,_01.jpg",
     "rights":"CC_BY_3_0_UNPORTED_PHOTOGRAPHER_SAILKO",
     "author":"Sailko","license_url":"https://creativecommons.org/licenses/by/3.0/",
     "license_specific_source_text_verified_on":"2026-10-27",
     "license_declarations":["photographer owns own photo","CC BY 3.0 allows commercial redistribution with credit, licence link, and change disclosure"]},
    {"id":"module-rosary-lotto-alt","type":"commons_cc_by",
     "file_url":"https://upload.wikimedia.org/wikipedia/commons/0/09/Lorenzo_lotto%2C_madonna_del_rosario%2C_1539%2C_11.jpg",
     "title":"Madonna del Rosario","artist":"Lorenzo Lotto","module_id":"rosary",
     "object_url":"https://commons.wikimedia.org/wiki/File:Lorenzo_lotto,_madonna_del_rosario,_1539,_11.jpg",
     "rights":"CC_BY_3_0_UNPORTED_PHOTOGRAPHER_SAILKO",
     "author":"Sailko","license_url":"https://creativecommons.org/licenses/by/3.0/",
     "license_specific_source_text_verified_on":"2026-10-27",
     "license_declarations":["same Lotto original and photographer; alternate ISO 6400 / 2304x3456 image","CC BY 3.0 with attribution, link and change disclosure"]},
]

def get(url:str,max_bytes:int=25000000)->bytes:
    req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 (Ad Orientem zero-fee photo provenance verification)","Accept":"application/json,image/jpeg,image/png,*/*"})
    with urllib.request.urlopen(req,timeout=35) as u:
        b=u.read(max_bytes+1)
    if not b or len(b)>max_bytes: raise RuntimeError("Missing/over-size image response")
    return b

def hash_bytes(data:bytes)->str: return hashlib.sha256(data).hexdigest()

def acquire_one(t:dict)->dict:
    row={"id":t["id"],"title":t["title"],"artwork_identity":t["object_url"],
         "rights_evidence":t["rights"],"source_type":t["type"],"publication_authorized":False,
         "human_photo_approval":False,"painting_identity_modified":False,
         "external_frame_removed":False,"photo_cropped":False}
    if t["type"]=="met":
        api=f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{t['met_id']}"
        metadata=json.loads(get(api,1000000))
        if metadata.get("objectID")!=t["met_id"] or metadata.get("isPublicDomain") is not True:
            raise RuntimeError("Museum API object/public-domain mismatch")
        if t["expected_artist"].lower() not in (metadata.get("artistDisplayName") or "").lower():
            raise RuntimeError("Museum artist mismatch")
        if t["title"].lower() not in (metadata.get("title") or "").lower():
            raise RuntimeError("Museum title mismatch")
        img_url=metadata.get("primaryImage")
        if not img_url or not img_url.startswith("https://images.metmuseum.org/"):
            raise RuntimeError("Official original image not supplied by museum")
        row.update({"official_api":api,"artist":metadata.get("artistDisplayName"),
                    "museum_object_id":t["met_id"],"official_image_url":img_url,
                    "original_object_isPublicDomain":True})
    else:
        img_url=t["file_url"]
        row.update({"official_image_url":img_url,"artist":t["artist"],
                    "photographer":t["author"],"photographer_license_url":t["license_url"],
                    "photographer_attribution_necessary":True,
                    "modification_disclosure_necessary":True,
                    "license_source_page":t["object_url"],
                    "exact_commons_file_license_source_checked":t["license_specific_source_text_verified_on"]})
    raw=get(img_url)
    if raw[:4].startswith(b"<htm") or raw[:5]==b"<?xml":raise RuntimeError("Image URL returned HTML/XML")
    with Image.open(io.BytesIO(raw)) as image:
        image.load()
        fmt=image.format
        if fmt not in ("JPEG","PNG"):raise RuntimeError("Not an acceptable image format: "+str(fmt))
        w,h=image.size
        if min(w,h)<1200: raise RuntimeError(f"Source dimensions insufficient {w}x{h}")
        if w*h>90000000: raise RuntimeError("Unexpectedly large decoded image")
        icc=bool(image.info.get("icc_profile"))
        camera_iso=image.getexif().get(34855)
        display=ImageOps.exif_transpose(image).convert("RGB")
    ext=".jpg" if fmt=="JPEG" else ".png"
    path=ROOT/(t["id"]+"-original"+ext)
    digest=hash_bytes(raw)
    if path.exists() and hash_bytes(path.read_bytes())!=digest:
        raise RuntimeError("Source has changed; existing SHA-locked original MUST NOT be overwritten")
    path.write_bytes(raw)
    row.update({"status":"STAGED_SHA_VERIFIED_SOURCE_FILE_NOT_RELEASE_APPROVED",
                "sha256":digest,"bytes":len(raw),"format":fmt,"dimensions":[w,h],
                "icc_present":icc,"exif_iso":camera_iso,"repo_path":str(path)})
    reduced=display.copy()
    reduced.thumbnail((1100,1000),Image.Resampling.LANCZOS)
    p=ROOT/(t["id"]+"-full-uncropped-review.jpg")
    reduced.save(p,"JPEG",quality=94,subsampling=0)
    row["whole_photo_review_preview"]=str(p)
    row["whole_photo_review_preview_sha256"]=hash_bytes(p.read_bytes())
    tile=min(512,w,h)
    samples={"top_left":(0,0,tile,tile),"top_right":(w-tile,0,w,tile),
             "bottom_left":(0,h-tile,tile,h),
             "bottom_right":(w-tile,h-tile,w,h),
             "center":((w-tile)//2,(h-tile)//2,(w+tile)//2,(h+tile)//2)}
    row["native_pixel_crops"]=[]
    for name,box in samples.items():
        dest=ROOT/(t["id"]+"-"+name+"-native.png")
        display.crop(box).save(dest,"PNG")
        row["native_pixel_crops"].append({"name":name,"source_bbox":box,"path":str(dest),"resized":False,"sha256":hash_bytes(dest.read_bytes())})
    row["release_holds"]=[
      "Check actual full resolution photography for colour fidelity, glare and compression",
      "Examine original versus photographic frame/mount/painted edges",
      "Determine phone/desktop contain versus safe optional artistically approved crop",
      "Human artwork-photo acceptance and production manifest signature remain mandatory",
    ]
    return row

def main():
    if os.environ.get("GITHUB_ACTIONS")=="true" and os.environ.get("GITHUB_REF")!="refs/heads/research/module-hero-pd-masters-20261026":
        raise RuntimeError("Not on approved research branch")
    ROOT.mkdir(parents=True,exist_ok=True)
    rows=[]
    for t in TARGETS:
        try:
            row=acquire_one(t)
            print(t["id"], row["status"],row["dimensions"],row["sha256"])
        except Exception as e:
            row={"id":t["id"],"status":"ACQUISITION_HOLD","error_type":type(e).__name__,
                 "error_message":str(e)[:240],"publication_authorized":False,
                 "manual_source_review_required":True}
            print(t["id"],row["status"],row["error_type"],row["error_message"])
        rows.append(row)
    (ROOT/"four-source-acquisition-status.json").write_text(
       json.dumps({"schema":"AO_B57_FOUR_OPEN_IMAGE_VARIANTS_V2",
        "date":"2026-10-27","cost":"EUR0","no_contact":True,
        "no_permissions_requested":True,"no_artwork_substitutions":True,
        "staged":sum(r.get("status","").startswith("STAGED_") for r in rows),
        "holds":sum(r.get("status")=="ACQUISITION_HOLD" for r in rows),
        "photo_quality_approved":0,"app_released":0,"records":rows},
        ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
if __name__=="__main__":main()
