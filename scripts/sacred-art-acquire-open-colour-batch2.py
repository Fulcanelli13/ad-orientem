#!/usr/bin/env python3
"""Fetch three individually source-documented public-domain painting photographs.

Research only. Source URLs are first-party institutional records or institution-
provided IIIF; returned RGB/JPEG must be checked byte-for-byte, and no images
ever enter public app assets, galleries or GitHub Pages.
"""
import argparse
import hashlib
import io
import json
import re
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from PIL import Image, ImageStat

MAX_BYTES = 32 * 1024 * 1024
MAX_PIXELS = 100_000_000
MIN_WIDTH = 1170
RIJKS_DATA = "data.rijksmuseum.nl"
RIJKS_IIIF = "iiif.micr.io"
NATIONAL_HOST = "collection.nationalmuseum.se"

def get_bytes(url, host, *, accept="image/jpeg", limit=MAX_BYTES):
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme != "https" or parsed.hostname != host or parsed.username or parsed.password:
        raise ValueError("URL not on exact official host allowlist: " + url)
    req = urllib.request.Request(url, headers={
        "User-Agent": "AdOrientemSacredArtResearch/1.0",
        "Accept": accept
    })
    with urllib.request.urlopen(req, timeout=28) as resp:
        final = resp.geturl()
        redirected = urllib.parse.urlparse(final)
        if redirected.scheme != "https" or redirected.hostname != host:
            raise ValueError("source redirects away from exact museum host: "+final)
        mime = resp.headers.get("Content-Type","").lower()
        data = resp.read(limit+1)
    if len(data) > limit or not data:
        raise ValueError("empty/oversized HTTP content")
    return data, final, mime

def get_json(url, host):
    data, final, mime = get_bytes(url,host,accept="application/json",limit=4_000_000)
    if "json" not in mime and not data[:1] in (b"{",b"["):
        raise ValueError("museum response is not JSON: "+mime)
    return json.loads(data.decode("utf-8")),final

def nested_key_values(obj, name):
    found=[]
    if isinstance(obj,dict):
        for k,v in obj.items():
            if k==name:
                found.extend(v if isinstance(v,list) else [v])
            elif isinstance(v,(dict,list)):
                found.extend(nested_key_values(v,name))
    elif isinstance(obj,list):
        for v in obj:
            found.extend(nested_key_values(v,name))
    return found

def extract_ids(data,key,host):
    items=nested_key_values(data,key)
    ids=[]
    for item in items:
        if isinstance(item,str):candidate=item
        elif isinstance(item,dict):candidate=item.get("id") or item.get("@id")
        else:continue
        if not isinstance(candidate,str):continue
        p=urllib.parse.urlparse(candidate)
        if p.scheme=="https" and p.hostname==host and re.fullmatch(r"/\d+",p.path):
            ids.append(p.path.strip("/"))
    return list(dict.fromkeys(ids))

def resolve_rijks(row,trail):
    object_id=row["museumObjectId"]
    if not re.fullmatch(r"\d{7,15}",object_id):
        raise ValueError("invalid source PURL object id")
    obj_url="https://"+RIJKS_DATA+"/"+object_id+"?_profile=la-framed"
    doc,final=get_json(obj_url,RIJKS_DATA)
    trail.append({"step":"OBJECT","url":final,"visualItems":extract_ids(doc,"shows","id.rijksmuseum.nl")})
    visual_ids=extract_ids(doc,"shows","id.rijksmuseum.nl")
    if not visual_ids:
        raise ValueError("Rijks object has no Linked Art visual item")
    if len(visual_ids)>4:raise ValueError("ambiguous object visual item set")
    for v in visual_ids:
        vd,vfinal=get_json("https://"+RIJKS_DATA+"/"+v+"?_profile=la-framed",RIJKS_DATA)
        digital_ids=extract_ids(vd,"digitally_shown_by","id.rijksmuseum.nl")
        trail.append({"step":"VISUAL","id":v,"url":vfinal,"digitalObjectIds":digital_ids})
        for digital in digital_ids[:5]:
            dd,dfinal=get_json("https://"+RIJKS_DATA+"/"+digital+"?_profile=la-framed",RIJKS_DATA)
            access=nested_key_values(dd,"access_point")
            for item in access:
                link=item if isinstance(item,str) else item.get("id") or item.get("@id") if isinstance(item,dict) else None
                if not isinstance(link,str):continue
                p=urllib.parse.urlparse(link)
                if p.scheme=="https" and p.hostname==RIJKS_IIIF and re.fullmatch(r"/[A-Za-z0-9_-]{3,30}/full/(max|\d+,)/0/default\.jpg",p.path):
                    trail.append({"step":"DIGITAL","id":digital,"url":dfinal,"iiifSource":link})
                    return link
    raise ValueError("no unambiguous official full-colour Rijks IIIF image URL")

def fetch_image(url,kind):
    if kind=="NATIONALMUSEUM_IMAGE":
        p=urllib.parse.urlparse(url)
        if p.hostname!=NATIONAL_HOST or not re.fullmatch(r"/multimedia/\d+/multimedia-\d+\.large\.jpg",p.path):
            raise ValueError("Nationalmuseum photo filename not exact allowlisted form")
        host=NATIONAL_HOST
    elif kind=="RIJKSMUSEUM_LINKED_ART_IIIF":
        p=urllib.parse.urlparse(url)
        if p.hostname!=RIJKS_IIIF or not re.fullmatch(r"/[A-Za-z0-9_-]{3,30}/full/(max|\d+,)/0/default\.jpg",p.path):
            raise ValueError("Rijks IIIF source URL not allowed")
        host=RIJKS_IIIF
    else:
        raise ValueError("unrecognized acquisition method")
    data,final,mime=get_bytes(url,host)
    if "jpeg" not in mime and "octet-stream" not in mime:
        raise ValueError("selected source not JPEG content-type: "+mime)
    if len(data)<1024 or not data.startswith(b"\xff\xd8\xff"):
        raise ValueError("selected source not JPEG")
    return data,final

def analyse(data,key,dest):
    with Image.open(io.BytesIO(data)) as im:
        im.verify()
    with Image.open(io.BytesIO(data)) as im:
        im.load()
        w,h=im.size
        if w*h>MAX_PIXELS:raise ValueError("decoding pixel cap exceeded")
        rgb=im.convert("RGB")
        preview=rgb.copy()
        preview.thumbnail((450,450),Image.Resampling.LANCZOS)
        sat=round(ImageStat.Stat(preview.convert("HSV").getchannel("S")).mean[0],2)
        filename=key.replace(":","_").replace("/","_")+".jpg"
        p=dest/"original"/filename
        p.parent.mkdir(parents=True,exist_ok=True)
        p.write_bytes(data)
        thumb=rgb.copy()
        thumb.thumbnail((900,900),Image.Resampling.LANCZOS)
        t=dest/"review"/filename
        t.parent.mkdir(parents=True,exist_ok=True)
        thumb.save(t,"JPEG",quality=87)
        ratio=w/h
        area=lambda r:round(100*min(ratio/r,r/ratio),1)
        return {"originalFilename":str(p),"reviewFilename":str(t),
                "byteLength":len(data),"sha256":hashlib.sha256(data).hexdigest(),
                "pixelWidth":w,"pixelHeight":h,"decodedMode":im.mode,
                "iccEmbedded":bool(im.info.get("icc_profile")),
                "meanThumbnailSaturation":sat,"colourDiagnostic":
                "HAS_MEASURABLE_COLOUR" if sat>=5 else "MONOCHROME_HOLD",
                "technicalWidthPass":w>=MIN_WIDTH,
                "wide390x240CoverRetainedPercent":area(390/240),
                "portrait390x520CoverRetainedPercent":area(390/520)}

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--manifest",required=True)
    parser.add_argument("--output",required=True)
    args=parser.parse_args()
    manifest=json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    candidates=manifest["candidates"]
    expected={"Nationalmuseum:NM420","Nationalmuseum:NM1134","Rijks:SK-A-868"}
    if len(candidates)!=3 or set(x["workKey"] for x in candidates)!=expected:
        raise ValueError("source selection changed, 3 explicit items required")
    if any(x["ownerApproved"] or x["releaseReady"] or x["originalPhotoDownloaded"] for x in candidates):
        raise ValueError("source manifest wrongly claims release or acquisition")
    dest=Path(args.output)
    dest.mkdir(parents=True,exist_ok=True)
    report={"schema":"AO_OPEN_COLOUR_PHOTO_BATCH2_ACTUAL_FETCH_V1",
       "asOfUtc":datetime.now(timezone.utc).isoformat(),
       "licenceSource":"Museums' per-object public-domain marks and published image-use policies",
       "researchOnly":True,"ownerApproved":False,"deployed":False,
       "sourcePhotosRetrieved":0,"sourcePhotosTechnicallyUsable":0,"results":[]}
    for candidate in candidates:
        key=candidate["workKey"]
        item={"workKey":key,"museumObjectUrl":candidate["catalogue"],
              "photoRights":candidate["sourceRights"],"status":"RETRIEVAL_FAILED",
              "ownerPlacementApproved":False,"releaseReady":False,
              "method":"LINKED_ART_IIIF" if key.startswith("Rijks:") else "EXACT_MUSEUM_PHOTO"}
        try:
            if key.startswith("Rijks:"):
                trail=[]
                url=resolve_rijks(candidate,trail)
                item["apiResolutionTrail"]=trail
                method="RIJKSMUSEUM_LINKED_ART_IIIF"
            else:
                url=candidate["museumImageUrl"]
                method="NATIONALMUSEUM_IMAGE"
            data,final=fetch_image(url,method)
            info=analyse(data,key,dest)
            item.update(sourceImageUrl=url,verifiedFinalUrl=final,**info)
            item["status"]="RETRIEVED_NEEDS_EDITORIAL_QA" if info["technicalWidthPass"] and info["colourDiagnostic"]=="HAS_MEASURABLE_COLOUR" else "RETRIEVED_TECHNICAL_HOLD"
        except Exception as ex:
            item["error"]=type(ex).__name__+": "+str(ex)[:350]
        report["results"].append(item)
        print(key+": "+item["status"],flush=True)
    report["sourcePhotosRetrieved"]=sum(x["status"].startswith("RETRIEVED") for x in report["results"])
    report["sourcePhotosTechnicallyUsable"]=sum(x["status"]=="RETRIEVED_NEEDS_EDITORIAL_QA" for x in report["results"])
    (dest/"report.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print("Source JPEGs retrieved:",report["sourcePhotosRetrieved"],"of 3")
    # Workflow success does not imply any download succeeded. Report is authoritative.
    return 0

if __name__=="__main__":
    raise SystemExit(main())
