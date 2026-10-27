#!/usr/bin/env python3
"""Archive original Lotto photographs for fidelity comparison, not app publication."""
import hashlib, io, json, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image
R=Path(__file__).resolve().parents[2]
DIR=R/"assets/staged/module-hero-comparisons"
REP=R/"data/research/lotto-rosary-photo-comparison-20261026.json"
API="https://commons.wikimedia.org/w/api.php?"
UA="AdOrientem-EditorialVisualQA/1.0 (https://github.com/Fulcanelli13/ad-orientem)"
NAMES=("Lorenzo_lotto,_madonna_del_rosario,_1539,_01.jpg",
       "Lorenzo_lotto,_madonna_del_rosario,_1539,_11.jpg")
results=[]
for name in NAMES:
    title="File:"+name
    url=API+urllib.parse.urlencode({"action":"query","format":"json","prop":"imageinfo",
                                  "iiprop":"url|size|sha1|extmetadata","titles":title})
    try:
        with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":UA}),timeout=40) as r:
            dat=json.load(r)
        info=next(iter(dat["query"]["pages"].values()))["imageinfo"][0]
        license=info["extmetadata"]["LicenseShortName"]["value"]
        if license.strip().lower()!="cc by 3.0":
            raise ValueError("Photographer's expected CC BY 3.0 licence not confirmed: "+license)
        if info["size"]>8*1024*1024:
            raise ValueError("File above 8MiB staging cap")
        with urllib.request.urlopen(urllib.request.Request(info["url"],headers={"User-Agent":UA}),timeout=65) as r:
            if urllib.parse.urlsplit(r.geturl()).hostname!="upload.wikimedia.org":
                raise ValueError("Unexpected image host")
            raw=r.read(8*1024*1024+1)
        if len(raw)>8*1024*1024 or not raw:raise ValueError("Invalid file bytes")
        if hashlib.sha1(raw).hexdigest()!=info["sha1"].lower():raise ValueError("Source SHA1 mismatch")
        with Image.open(io.BytesIO(raw)) as im:
            im.verify()
        with Image.open(io.BytesIO(raw)) as im:
            w,h,fmt=im.width,im.height,im.format
            iso=im.getexif().get(34855)
            icc=bool(im.info.get("icc_profile"))
        if fmt!="JPEG" or min(w,h)<900:raise ValueError("Unexpected photograph")
        DIR.mkdir(parents=True,exist_ok=True)
        out=DIR/("rosary-lotto-"+name.rsplit("_",1)[1])
        out.write_bytes(raw)
        results.append({"filename":name,"status":"STAGED_NOT_APPROVED","source_page":
            "https://commons.wikimedia.org/wiki/"+urllib.parse.quote(title),
            "path":str(out.relative_to(R)),"sha256":hashlib.sha256(raw).hexdigest(),
            "width":w,"height":h,"camera_ISO":iso,"icc_present":icc,"bytes":len(raw),
            "photographer":"Sailko","licence":"CC BY 3.0",
            "credit_required":True,"edit_disclosure_required":True,"visual_quality_passed":False})
    except Exception as exc:
        results.append({"filename":name,"status":"FAILED","reason":str(exc)[:400]})
REP.parent.mkdir(parents=True,exist_ok=True)
REP.write_text(json.dumps({"type":"frozen selection reproduction comparison ONLY",
  "primary_approved_artist":"Lorenzo Lotto","editorial_change":False,"results":results},
  indent=2)+"\n")
print(json.dumps({"files":len([x for x in results if x["status"]=="STAGED_NOT_APPROVED"]),
                  "errors":[x for x in results if x["status"]=="FAILED"]},indent=2))
