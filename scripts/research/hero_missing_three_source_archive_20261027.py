#!/usr/bin/env python3
"""Archive 3 previously missing approved-module image leads, WITHOUT rights/quality promotion.

Runs ONLY on the pre-existing free public GitHub research-branch writer.
Keeps exact original bytes and prevents overwrite/version substitution.
"""
from __future__ import annotations
import hashlib
import io
import json
import os
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen
from PIL import Image, ImageOps

OUT = Path("assets/staged/module-hero-missing-three-20261027")
RECORDS = [
    {
        "module_id": "joseph",
        "artist": "Philippe de Champaigne",
        "title": "The Dream of Saint Joseph",
        "object_id": "National Gallery NG6276",
        "commons_filename": "Philippe de Champaigne (1602-1674) - The Dream of Saint Joseph - NG6276 - National Gallery.jpg",
        "expected_dimensions": [4421, 6000],
        "rights_status": "RESEARCH_PD_ART_COMMONS_US_ONLY_GLOBAL_PHOTO_AND_SOURCE_TERMS_PENDING",
        "quality_status": "FULL_RESOLUTION_CANDIDATE_UNREVIEWED",
        "identity_page": "https://www.nationalgallery.org.uk/paintings/philippe-de-champaigne-the-dream-of-saint-joseph",
        "notes": ["Do not confuse with cropped derivative 2605x997, or different Joseph painting in Cuba.",
                  "Commons reproduction sourced from Art UK/National Gallery; PD-Art US mark does not independently clear every worldwide distribution right."]
    },
    {
        "module_id": "angel",
        "artist": "Pietro da Cortona",
        "title": "The Guardian Angel",
        "object_id": "Palazzo Barberini Rome inv. 1753",
        "commons_filename": "Cortona Guardian Angel 01.jpg",
        "expected_dimensions": [694, 1100],
        "rights_status": "RESEARCH_PD_ART_COMMONS_US_ONLY_ITALIAN_CULTURAL_HERITAGE_AND_PHOTO_USE_HOLD",
        "quality_status": "LOW_RESOLUTION_QUALITY_HOLD_DO_NOT_UPSCALE",
        "identity_page": "https://www.museicapitolini.org/it/immagini/pietro-da-cortona-angelo-custode",
        "notes": ["The approved original is 1656 Pietro da Cortona in Galleria Nazionale d'Arte Antica, not later copy in Palazzo Mansi.",
                  "Licensed Bridgeman 2428x3852 source not available for free unrestricted use; do not fetch licensed commercial image.",
                  "This 694x1100 archived file is an object-identity REFERENCE only, not a final hero master."]
    },
    {
        "module_id": "evening",
        "artist": "Pierre-Édouard Frère",
        "title": "The Prayer",
        "object_id": "Wolverhampton Art Gallery OP6 (1857)",
        "commons_filename": "Pierre Edouard Frère (1819-1886) - The Prayer - OP6 - Wolverhampton Art Gallery.jpg",
        "expected_dimensions": [898, 1200],
        "rights_status": "HOLD_ART_UK_NON_COMMERCIAL_SOURCE_TERMS_AND_UK_PHOTOGRAPHER_REPRODUCTION_CLAIM",
        "quality_status": "LOW_RESOLUTION_QUALITY_HOLD_DO_NOT_UPSCALE",
        "identity_page": "https://artuk.org/discover/artworks/the-prayer-19241",
        "notes": ["Commons PD-Art US tag is not an independent commercial global reuse grant.",
                  "File carries Art UK/Wolverhampton photographer-use claim in metadata and is low resolution.",
                  "Exact OP6 should not be replaced with different Evening Prayer painting without user's approval."]
    }
]

def sha(data:bytes)->str: return hashlib.sha256(data).hexdigest()
def commons_url(filename:str)->str:
    underscore=filename.replace(" ","_")
    digest=hashlib.md5(underscore.encode("utf-8")).hexdigest()
    return "https://upload.wikimedia.org/wikipedia/commons/"+digest[0]+"/"+digest[:2]+"/"+quote(underscore,safe="()") 

def fetch_bounded(url:str,limit:int=26000000)->bytes:
    req=Request(url,headers={"User-Agent":"Mozilla/5.0 (Ad Orientem archival research; zero-fee no-contact)","Accept":"image/jpeg,image/png,*/*"})
    with urlopen(req,timeout=60) as resp:
        got=resp.read(limit+1)
        ct=resp.headers.get("Content-Type","")
    if len(got)>limit or not got or not got.startswith(b"\xff\xd8"):
        raise RuntimeError("Non-JPEG or empty/oversized file: "+str(ct))
    return got

def stage(record:dict)->dict:
    key=record["module_id"]
    filename=record["commons_filename"]
    url=commons_url(filename)
    raw=fetch_bounded(url)
    with Image.open(io.BytesIO(raw)) as im:
        im.load()
        w,h=im.size
        if [w,h]!=record["expected_dimensions"]:
            raise ValueError(f"Source dimensions/version changed for {key}: got {w}x{h}; no overwrite")
        icc=bool(im.info.get("icc_profile"))
        photo=ImageOps.exif_transpose(im).convert("RGB")
    path=OUT/(key+"-original.jpg")
    if path.exists() and sha(path.read_bytes())!=sha(raw):
        raise RuntimeError("Existing original changed: refuse to overwrite "+str(path))
    path.write_bytes(raw)
    reduced=photo.copy()
    reduced.thumbnail((1100,1100),Image.Resampling.LANCZOS)
    preview=OUT/(key+"-uncropped-preview.jpg")
    reduced.save(preview,"JPEG",quality=92,subsampling=0)
    tiles=[]
    width,height=w,h
    edge=min(width,height,512)
    rects={"top_left":(0,0,edge,edge),
           "top_right":(width-edge,0,width,edge),
           "bottom_left":(0,height-edge,edge,height),
           "bottom_right":(width-edge,height-edge,width,height),
           "center":((width-edge)//2,(height-edge)//2,(width+edge)//2,(height+edge)//2)}
    for kind,box in rects.items():
        p=OUT/(key+"-"+kind+"-native.png")
        photo.crop(box).save(p,"PNG")
        tiles.append({"kind":kind,"path":str(p),"bbox":list(box),"sha256":sha(p.read_bytes()),"rescaled":False})
    return {"module_id":key,"artist":record["artist"],"painting":record["title"],
            "object_id":record["object_id"],"identity_page":record["identity_page"],
            "exact_commons_file_page":"https://commons.wikimedia.org/wiki/File:"+quote(filename.replace(" ","_")),
            "source_url":url,"original_repo_path":str(path),"source_sha256":sha(raw),
            "source_bytes":len(raw),"source_dimensions":[w,h],"source_icc_present":icc,
            "uncropped_preview_path":str(preview),"uncropped_preview_sha256":sha(preview.read_bytes()),
            "native_pixel_samples":tiles,"rights_status":record["rights_status"],
            "quality_status":record["quality_status"],"research_warnings":record["notes"],
            "painting_choice_unchanged":True,"artificial_upscaling":False,"crop_applied":False,
            "rights_cleared_for_global_app":False,"master_quality_approved":False,
            "production_released":False,"stage_status":"EXACT_SOURCE_ARCHIVED_RESEARCH_ONLY"}

def main()->None:
    if os.environ.get("GITHUB_ACTIONS")=="true" and os.environ.get("GITHUB_REF")!="refs/heads/research/module-hero-pd-masters-20261026":
        raise RuntimeError("Ref mismatch: do not write outside canonical research branch")
    OUT.mkdir(parents=True,exist_ok=True)
    results=[]
    for record in RECORDS:
        try:
            result=stage(record)
        except Exception as e:
            result={"module_id":record["module_id"],"stage_status":"FETCH_OR_VERIFY_HOLD",
                    "reason":type(e).__name__+": "+str(e)[:220],
                    "painting_choice_unchanged":True,"production_released":False}
        results.append(result)
        print(result["module_id"],result["stage_status"])
    (OUT/"missing-three-manifest.json").write_text(
        json.dumps({"schema":"AO_20261027_MISSING_3_APPROVED_HERO_RESEARCH_IMAGE_STAGING_V1",
            "rule":"Never confuse staging with clearance of use rights or photographic quality.",
            "strict_cost":"EUR0","contact_attempts":0,"artwork_selections_changed":0,
            "staged_count":sum(r["stage_status"].startswith("EXACT_") for r in results),
            "production_approved":0,"records":results},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

if __name__=="__main__": main()
