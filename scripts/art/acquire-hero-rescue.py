#!/usr/bin/env python3
"""Two image-source rescue trials, original files, precise decoder diagnostics.

This never approves or deploys art and never upscales a source.
"""
import hashlib,io,json,urllib.parse,urllib.request
from pathlib import Path
from PIL import Image
ROOT=Path.cwd()
OUT=ROOT/"assets/staged/module-hero-rescue"
LOG=ROOT/"data/research/module-hero-rescue-20261026.json"
CASES=[
 ("morning","Jules Breton, le chant de l'alouette.1884.jpg","official AIC-linked Commons photo, source reference required"),
 ("salvation","Le Siècle d'Auguste - naissance de N.S. Jésus-Christ Amiens 04.jpg","CC BY-SA 3.0 Chatsam, museum photograph, evaluate glare/angle")
]
UA="AdOrientem-ArtResearch/1.0 (https://github.com/Fulcanelli13/ad-orientem)"
MAX=11*1024*1024
def fetch(url,limit=MAX):
    rq=urllib.request.Request(url,headers={"User-Agent":UA})
    with urllib.request.urlopen(rq,timeout=60) as f:
        dest=urllib.parse.urlsplit(f.geturl()).hostname
        if dest not in {"commons.wikimedia.org","upload.wikimedia.org"}:raise ValueError("Unapproved host "+str(dest))
        d=f.read(limit+1)
        if not d or len(d)>limit:raise ValueError("Empty or >11MiB")
        return d

result=[]
for mod,name,why in CASES:
    base={"module_id":mod,"name":name,"publication":"NOT CLEARED"}
    try:
        q=urllib.parse.urlencode({"action":"query","format":"json","prop":"imageinfo",
             "iiprop":"url|size|mime|sha1|extmetadata","titles":"File:"+name})
        data=json.loads(fetch("https://commons.wikimedia.org/w/api.php?"+q,2*1024*1024))
        info=next(iter(data["query"]["pages"].values()))["imageinfo"][0]
        lic=info["extmetadata"].get("LicenseShortName",{}).get("value","")
        if not any(s in lic.lower() for s in ("public domain","cc by","cc0")):
            raise ValueError("Licence unsupported: "+lic)
        raw=fetch(info["url"])
        if hashlib.sha1(raw).hexdigest().lower()!=info["sha1"].lower():
            raise ValueError("Original content SHA1 mismatch")
        with Image.open(io.BytesIO(raw)) as im:
            im.verify()
        with Image.open(io.BytesIO(raw)) as im:
            fmt,w,h=im.format,im.width,im.height
            exif=im.getexif();iso=exif.get(34855)
            has_icc=bool(im.info.get("icc_profile"))
        base.update({"PIL_format":fmt,"width":w,"height":h,"bytes":len(raw),"ISO":iso,"has_icc":has_icc})
        if fmt not in ("JPEG","PNG","TIFF","WEBP") or min(w,h)<700:
            raise ValueError(f"Low-resolution/unsupported image: format={fmt} dimensions={w}x{h}")
        ext={"JPEG":".jpg","PNG":".png","TIFF":".tif","WEBP":".webp"}[fmt]
        out=OUT/(mod+ext);out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(raw)
        base.update({"file":str(out.relative_to(ROOT)),"sha256":hashlib.sha256(raw).hexdigest(),
          "licence_claim":lic,"rights_details":why,"status":"ARCHIVED_SOURCE_UNAPPROVED"})
    except Exception as exc:
        base.update({"status":"FAILED","error":str(exc)[:400]})
    result.append(base)
    print(json.dumps(base,ensure_ascii=False),flush=True)
LOG.parent.mkdir(parents=True,exist_ok=True)
LOG.write_text(json.dumps({"results":result,"selection_changes":0,
 "visual_approval_count":0,"new_live_app_assets":0},indent=2,ensure_ascii=False)+"\n")
