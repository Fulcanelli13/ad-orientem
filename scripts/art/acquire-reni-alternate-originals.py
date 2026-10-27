#!/usr/bin/env python3
"""Compare actual Guido Reni Rome altarpiece with independently licensed photographs."""
import hashlib,io,json,urllib.parse,urllib.request
from pathlib import Path
from PIL import Image
ROOT=Path.cwd();OUT=ROOT/"assets/staged/reni-alt-source";REPORT=ROOT/"data/research/reni-painting-fidelity-20261026.json"
cases=[
 ("reni-sailko","Cappouccini, guido reni, san michele arcangelo 02.JPG"),
 ("reni-church","Chiesa di Santa Maria Immacolata a via Veneto 04.jpg")]
UA="AdOrientem-ArtQA/1.0 (https://github.com/Fulcanelli13/ad-orientem)"
results=[]
for ident,name in cases:
    try:
        q=urllib.parse.urlencode({"action":"query","format":"json","prop":"imageinfo","iiprop":"url|size|sha1|mime|extmetadata","titles":"File:"+name})
        req=urllib.request.Request("https://commons.wikimedia.org/w/api.php?"+q,headers={"User-Agent":UA})
        with urllib.request.urlopen(req,timeout=40) as f:info=next(iter(json.load(f)["query"]["pages"].values()))["imageinfo"][0]
        rights=info["extmetadata"]["LicenseShortName"]["value"]
        if not ("cc by" in rights.lower() or "public domain" in rights.lower()):raise ValueError("license not approved for study: "+rights)
        if info["size"]>12*1024*1024:raise ValueError("exceeds 12MiB")
        with urllib.request.urlopen(urllib.request.Request(info["url"],headers={"User-Agent":UA}),timeout=65) as f:
            if urllib.parse.urlsplit(f.geturl()).hostname!="upload.wikimedia.org":raise ValueError("host unexpected")
            raw=f.read(12*1024*1024+1)
        if not raw or len(raw)>12*1024*1024 or hashlib.sha1(raw).hexdigest()!=info["sha1"].lower():
            raise ValueError("download/hash/cap mismatch")
        with Image.open(io.BytesIO(raw)) as im:
            im.verify()
        with Image.open(io.BytesIO(raw)) as im:
            fmt,w,h=im.format,im.width,im.height
        if fmt not in ("JPEG","MPO") or min(w,h)<700:raise ValueError("not useable JPG")
        OUT.mkdir(parents=True,exist_ok=True);out=OUT/(ident+".jpg");out.write_bytes(raw)
        results.append({"id":ident,"file":str(out.relative_to(ROOT)),"source_file":name,"source_rights":rights,
             "sha256":hashlib.sha256(raw).hexdigest(),"width":w,"height":h,"original_bytes":len(raw),
             "visual_quality":"TO EXAMINE, no master approval"})
    except Exception as e:results.append({"id":ident,"error":str(e)[:300]})
REPORT.parent.mkdir(parents=True,exist_ok=True);REPORT.write_text(json.dumps({"results":results,"new_app_assets":0},indent=2)+"\n")
print(json.dumps(results))
