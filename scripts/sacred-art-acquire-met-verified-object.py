#!/usr/bin/env python3
"""Bounded acquisition of a Met CC0 object image by official object ID.

Reusable for additional museum-verified object IDs. Manifest must identify
the exact original artwork. Research only; never publishes a gallery file.
"""
import argparse, hashlib, io, json, re, urllib.parse, urllib.request
from datetime import datetime, timezone
from pathlib import Path
from PIL import Image, ImageStat

MAX=32*1024*1024
MAX_PIXELS=100_000_000
HOST_API="collectionapi.metmuseum.org"
HOST_PHOTO="images.metmuseum.org"

def fetch(url,host,accept,limit):
    p=urllib.parse.urlparse(url)
    if p.scheme!="https" or p.hostname!=host:
        raise ValueError("outside explicitly authorised museum host: "+url)
    request=urllib.request.Request(url,headers={
        "User-Agent":"AdOrientemResearchFirstPartyCC0/1.0",
        "Accept":accept
    })
    with urllib.request.urlopen(request,timeout=30) as response:
        u=urllib.parse.urlparse(response.geturl())
        if u.scheme!="https" or u.hostname!=host:
            raise ValueError("museum response redirected away from exact host")
        typ=response.headers.get("Content-Type","").lower()
        body=response.read(limit+1)
    if not body or len(body)>limit:raise ValueError("empty or oversized museum source")
    return body,typ

def source_photo(row):
    ident=row["museumObjectId"]
    if not isinstance(ident,int) or ident<1:
        raise ValueError("invalid Met object id")
    if row["officialMetadataApi"]!="https://"+HOST_API+"/public/collection/v1/objects/"+str(ident):
        raise ValueError("noncanonical Met object metadata URL")
    raw,typ=fetch(row["officialMetadataApi"],HOST_API,"application/json",2*1024*1024)
    if "json" not in typ and raw[:1]!=b"{":raise ValueError("invalid Met JSON response")
    obj=json.loads(raw)
    if obj.get("objectID")!=ident or str(obj.get("accessionNumber"))!=row["museumAccession"]:
        raise ValueError("museum object identity or accession differs")
    if obj.get("isPublicDomain") is not True:
        raise ValueError("Met has not marked exact object public domain")
    med=str(obj.get("medium") or "").lower()
    if "oil" not in med and "tempera" not in med:
        raise ValueError("unexpected painting medium")
    if "painting" not in str(obj.get("classification") or "").lower():
        raise ValueError("Met object not catalogued as a painting")
    url=obj.get("primaryImage")
    if not isinstance(url,str):
        raise ValueError("object has no official primary image")
    p=urllib.parse.urlparse(url)
    if p.scheme!="https" or p.hostname!=HOST_PHOTO or not re.fullmatch(r"/CRDImages/[a-zA-Z0-9_-]+/original/[A-Za-z0-9_.-]+\.jpg",p.path):
        raise ValueError("not a Met original full-resolution photo URL")
    image,mime=fetch(url,HOST_PHOTO,"image/jpeg",MAX)
    if "jpeg" not in mime and "octet-stream" not in mime:raise ValueError("not original JPEG")
    if len(image)<1024 or not image.startswith(b"\xff\xd8\xff"):
        raise ValueError("image content not JPEG")
    return obj,url,image

def inspect(blob,dest,key):
    with Image.open(io.BytesIO(blob)) as im:im.verify()
    with Image.open(io.BytesIO(blob)) as im:
        im.load()
        w,h=im.size
        if w*h>MAX_PIXELS:raise ValueError("oversized pixel count")
        rgb=im.convert("RGB")
        sm=rgb.copy();sm.thumbnail((400,400),Image.Resampling.LANCZOS)
        sat=round(ImageStat.Stat(sm.convert("HSV").getchannel("S")).mean[0],2)
        name=key.replace(":","_")+".jpg"
        original=dest/"original"/name;original.parent.mkdir(parents=True,exist_ok=True)
        original.write_bytes(blob)
        prev=rgb.copy();prev.thumbnail((900,900),Image.Resampling.LANCZOS)
        preview=dest/"review"/name;preview.parent.mkdir(parents=True,exist_ok=True)
        prev.save(preview,"JPEG",quality=87)
        r=w/h
        retain=lambda c:round(min(r/c,c/r)*100,1)
        return {"sha256":hashlib.sha256(blob).hexdigest(),"bytes":len(blob),
          "sourcePixels":[w,h],"format":im.format,"mode":im.mode,
          "meanThumbnailSaturation":sat,"colourDiagnostic":"COLOUR_PRESENT" if sat>=5 else "MONOCHROME_SOURCE_HOLD",
          "technicalWidthPass":w>=1170,"iccPresent":bool(im.info.get("icc_profile")),
          "wide390x240ImageAreaRetainedPct":retain(390/240),
          "portrait390x520ImageAreaRetainedPct":retain(390/520),
          "originalSavedFile":str(original),"reviewSavedFile":str(preview)}

def main():
    p=argparse.ArgumentParser();p.add_argument("--manifest",required=True)
    p.add_argument("--output",required=True)
    args=p.parse_args()
    d=json.loads(Path(args.manifest).read_text("utf-8"))
    if d["schema"]!="AO_SACRED_ART_MET_WENCESLAS_ALTERNATIVE_V1":raise ValueError("unexpected manifest")
    c=d["candidate"]
    if c["key"]!="Met:437005" or c["museumObjectId"]!=437005 or c["museumAccession"]!="44.147.2":
        raise ValueError("unexpected museum object/candidate identity")
    if c["ownerCalendarApproval"] or c["productionEligible"] or c["sourceImageBytesAcquired"]:
        raise ValueError("unauthorised owner approval or image claim")
    result={"schema":"AO_SACRED_ART_MET_WENCESLAS_SOURCE_ACQUISITION_V1",
        "asOfUtc":datetime.now(timezone.utc).isoformat(),
        "workKey":c["key"],"museumObjectId":c["museumObjectId"],
        "catalogue":c["objectPage"],"sourceAcquired":False,
        "ownerCalendarApproval":False,"publicationEligible":False,
        "status":"NOT_ACQUIRED"}
    out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
    try:
        obj,url,blob=source_photo(c)
        result.update(inspect(blob,out,c["key"]))
        result.update({
            "sourceAcquired":True,
            "sourceImageURL":url,
            "museumVerifiedTitle":obj.get("title"),
            "museumVerifiedArtist":obj.get("artistDisplayName"),
            "museumVerifiedMedium":obj.get("medium"),
            "museumPublicDomain":obj.get("isPublicDomain"),
            "status":"VERIFIED_BYTES_RESEARCH_ONLY_AWAITING_ICONOGRAPHIC_OWNER_REVIEW"
        })
    except Exception as ex:
        result["error"]=type(ex).__name__+": "+str(ex)[:450]
    (out/"report.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("Met 437005: "+result["status"],flush=True)
    return 0
if __name__=="__main__":
    raise SystemExit(main())
