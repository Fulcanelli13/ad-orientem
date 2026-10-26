#!/usr/bin/env python3
"""Photograph-only investigation of Louvre INV 1125 (La Petite Cène).

Compare two Commons originals with their own documented image rights.
Do NOT download or redistribute third-party licensed Louvre/RMN/Gallerix/Bridgeman files.
No automated frame cropping, retouching, promotion or app changes.
"""
from __future__ import annotations
import hashlib
import io
import json
import urllib.parse
import urllib.request
from pathlib import Path
from PIL import Image, ImageOps, ImageCms

ROOT = Path.cwd()
BASE = ROOT / "assets/staged/champaigne-petite-cene-research"
REPORT = ROOT / "data/calendar/champaigne-petite-cene-photo-investigation-20261026.json"
USER_AGENT = "AdOrientem-QualityAudit/1.0 (https://github.com/Fulcanelli13/ad-orientem)"
MAX_FILE_BYTES = 6 * 1024 * 1024
NAMES = [
    ("whole-commons", "Champaigne Petite Cène Louvre.jpg", "existing complete frame-free candidate"),
    ("tangopaso-museum", "Philippe de Champaigne - La Petite Cène (Louvre, INV 1125).jpg",
     "self-dedicated public-domain museum photograph; frame/perspective completeness unresolved")
]
APPROVED_ORIGINAL = "d4d8b3c1ea957c9517a24c62a97ab7143e07cdec2434c77ee05df17a5b29a320"

def get(url: str, maxsize: int, hosts: set[str]):
    req=urllib.request.Request(url,headers={"User-Agent":USER_AGENT, "Accept":"*/*"})
    with urllib.request.urlopen(req,timeout=60) as resp:
        host=urllib.parse.urlsplit(resp.geturl()).hostname
        if host not in hosts: raise ValueError("Unexpected redirect host: "+str(host))
        data=resp.read(maxsize+1)
        if not data or len(data)>maxsize: raise ValueError("Original empty or exceeds capped bytes")
        return data,resp.geturl()

def to_preview(image, warnings):
    im=ImageOps.exif_transpose(image)
    profile=im.info.get("icc_profile")
    if profile:
        try: return ImageCms.profileToProfile(im.convert("RGB"),
                    ImageCms.ImageCmsProfile(io.BytesIO(profile)),
                    ImageCms.createProfile("sRGB"), outputMode="RGB")
        except Exception as exc: warnings.append("ICC conversion failed: "+str(exc))
    else:
        warnings.append("No embedded ICC profile; compare colours against authoritative museum reference")
    return im.convert("RGB")

def main():
    BASE.mkdir(parents=True,exist_ok=True)
    results=[]
    for key,name,purpose in NAMES:
        record={"id":key,"filename":name,"purpose":purpose,"app_release":False,
                "human_whole_painting_verified":False,"frameless_crop_approved":False}
        try:
            api="https://commons.wikimedia.org/w/api.php?"+urllib.parse.urlencode({
                "action":"query","format":"json","prop":"imageinfo",
                "iiprop":"url|size|sha1|mime|extmetadata","titles":"File:"+name
            })
            payload,_=get(api,2*1024*1024,{"commons.wikimedia.org"})
            p=next(iter(json.loads(payload.decode("utf-8"))["query"]["pages"].values()))
            info=p["imageinfo"][0]
            license_short=info.get("extmetadata",{}).get("LicenseShortName",{}).get("value","")
            if not ("public domain" in license_short.lower() or "cc0" in license_short.lower()):
                raise ValueError("Candidate not PD/CC0 under Commons file-specific license: "+license_short)
            if info.get("size",0)>MAX_FILE_BYTES:raise ValueError("Commons media above capped 6MiB")
            raw,url=get(info["url"],MAX_FILE_BYTES,{"upload.wikimedia.org"})
            sha256=hashlib.sha256(raw).hexdigest()
            if hashlib.sha1(raw).hexdigest().lower()!=info["sha1"].lower():
                raise ValueError("Actual original Commons SHA-1 mismatch")
            if key=="whole-commons" and sha256!=APPROVED_ORIGINAL:
                raise ValueError("Previously acquired full-painting bytes unexpectedly changed")
            with Image.open(io.BytesIO(raw)) as im:im.verify()
            warnings=[]
            with Image.open(io.BytesIO(raw)) as im:
                if im.format!="JPEG":raise ValueError("Research JPEG expected")
                width,height=im.size;iso=im.getexif().get(34855)
                rgb=to_preview(im,warnings)
            path=BASE/(key+"-original.jpg")
            path.write_bytes(raw)
            full=rgb.copy();full.thumbnail((1300,1000),Image.Resampling.LANCZOS)
            preview=BASE/(key+"-full-review.jpg")
            full.save(preview,"JPEG",quality=90,subsampling=0)
            # 1:1 detail tiles. Coordinates for diagnostics, not publication crops.
            for detail,fx,fy in [("left-subject",.16,.50),("christ",.48,.47),
                                 ("right-subject",.84,.50),("lower",.54,.81)]:
                size=min(500,width,height)
                x=max(0,min(width-size,round(width*fx-size/2)))
                y=max(0,min(height-size,round(height*fy-size/2)))
                rgb.crop((x,y,x+size,y+size)).save(BASE/(key+"-"+detail+".png"))
            record.update({"status":"SOURCE_BYTES_ARCHIVED_UNAPPROVED",
                "commons_page":"https://commons.wikimedia.org/wiki/File:"+urllib.parse.quote(name.replace(" ","_")),
                "source_url":url,"rights_claim":license_short,"commons_sha1":info["sha1"],
                "sha256":sha256,"width":width,"height":height,"bytes":len(raw),
                "exif_iso":iso,"original_file":str(path.relative_to(ROOT)),
                "full_review_preview":str(preview.relative_to(ROOT)),
                "quality_warnings":warnings,
                "source_photo_framing_risk":("Physical museum frame visible; cannot pass without verified full painted boundary"
                  if key=="tangopaso-museum" else "Potential lower effective detail and origin unclear"),
                "verified_correct_object":"INV 1125 via Commons own file identification",
                "rights_release":"PENDING APPLICABLE JURISDICTION REVIEW"})
        except Exception as exc: record.update({"status":"RESEARCH_ACQUISITION_FAILED","error":str(exc)[:550]})
        print(key,record["status"],flush=True)
        results.append(record)
    REPORT.parent.mkdir(parents=True,exist_ok=True)
    REPORT.write_text(json.dumps({
        "schema":"AO_CHAMPAIGNE_INV1125_PHOTO_RESEARCH_20261026",
        "research_context":"User selected exact Louvre INV1125 for BOTH Holy Thursday and Pentecost Ember Wednesday",
        "object_reference":"https://collections.louvre.fr/ark:/53355/cl010062076",
        "sources":results,"final_source_promoted":False,
        "displayed_painting_frame_free_required":True,
        "new_app_assets":0,
        "excluded_restricted_candidates":[
          {"provider":"Louvre collections/RMN","reason":"commercial distribution not freely licensed under Louvre Collections CGU"},
          {"provider":"Gallerix 3528x1881","reason":"photograph's independent reuse licence not established; research visual lead only"},
          {"provider":"Bridgeman 7912x4287","reason":"paid licence violates user €0 rule"}
        ]
    },indent=2,ensure_ascii=False)+"\n")
    print("Research report: "+str(REPORT.relative_to(ROOT)))

if __name__=="__main__": main()
