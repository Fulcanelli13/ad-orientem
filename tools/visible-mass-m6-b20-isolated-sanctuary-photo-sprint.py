#!/usr/bin/env python3
"""Exact Commons-file, source-rights and image evidence for M6 isolated sanctuary objects.
No automatic approvals. Rate limiting stops downloads, and all misses remain explicit.
"""
import html,json,re,time,io
from pathlib import Path
from urllib.parse import quote
import requests
from PIL import Image,ImageOps,ImageDraw
BASE=Path(__file__).resolve().parent.parent
OUT=BASE/"dist/visible-mass/m6-b20-single-object"
OUT.mkdir(parents=True,exist_ok=True)
CASES=[
 {"object_id":"SN05","id":"M6B20-SN05-PUGIN-HARDMAN-LAMP","title":"Sanctuary Lamp, designed by A.W.N. Pugin, manufactured by J. Hardman & Co., c. 1855, gilt brass - Huntington Art Museum - San Marino, CA - DSC01810.jpg","expected_form":"One Roman Catholic designed sanctuary lamp in isolation, with chains and support rather than architectural surroundings"},
 {"object_id":"AL06","id":"M6B20-AL06-MET-ALTAR-CRUCIFIX","title":"Altar crucifix MET 88305.jpg","expected_form":"A complete freestanding altar crucifix, not a processional cross or empty cross"},
 {"object_id":"SN05","id":"M6B20-SN05-COMGALL-LAMP","title":"Sanctuary lamp.jpg","expected_form":"In-use sanctuary lamp in a Catholic church; accept only if isolated enough"}
]
S=requests.Session()
S.headers.update({"User-Agent":"AdOrientem-M6B20-source-inspection/0.1 (liturgical educational research, Commons source retained)"})
titles="|".join("File:"+r["title"] for r in CASES)
r=S.get("https://commons.wikimedia.org/w/api.php",params={"action":"query","format":"json","formatversion":"2","prop":"imageinfo","iiprop":"size|url|mime|extmetadata","iiurlwidth":690,"titles":titles},timeout=(10,60));r.raise_for_status()
pages={v.get("title"):v for v in r.json()["query"]["pages"]}
canvas=Image.new("RGB",(3*480,560),(10,13,21));draw=ImageDraw.Draw(canvas)
result=[]
for i,v in enumerate(CASES):
    info=(pages.get("File:"+v["title"],{}).get("imageinfo") or [{}])[0]
    meta=info.get("extmetadata") or {}
    clean=lambda val:html.unescape(re.sub("<[^>]+>"," ",val or "")).strip()
    get=lambda k:clean(meta.get(k,{}).get("value",""))
    obj={"object_id":v["object_id"],"asset_id":v["id"],"title":v["title"],"source_url":"https://commons.wikimedia.org/wiki/File:"+quote(v["title"].replace(" ","_"),safe="(),_'-."),
       "creator":get("Artist")[:280],"license":get("LicenseShortName"),"license_url":get("LicenseUrl"),
       "original_width":info.get("width"),"original_height":info.get("height"),"expected_form":v["expected_form"],
       "source_image_status":"NOT_INSPECTED","user_approved":False,"publication_approved":False}
    x=i*480
    draw.rounded_rectangle((x+3,3,x+477,557),radius=12,outline=(69,78,91),width=2)
    src=info.get("thumburl")
    if src:
        try:
            response=S.get(src,timeout=(15,45));response.raise_for_status()
            if not response.headers.get("Content-Type","").startswith("image/"):raise ValueError("Not image")
            if len(response.content)>2_500_000:raise ValueError("Excessive preview size")
            image=Image.open(io.BytesIO(response.content));image.load();image=ImageOps.exif_transpose(image).convert("RGB")
            image.thumbnail((455,455),Image.Resampling.LANCZOS);canvas.paste(image,(x+(480-image.width)//2,13+(455-image.height)//2))
            (OUT/(v["id"]+".jpg")).write_bytes(response.content)
            obj["source_image_status"]="THUMBNAIL_PRESENT_PENDING_EDITORIAL_INSPECTION"
        except Exception as err:
            obj["source_image_status"]="SOURCE_UNAVAILABLE"
            obj["error"]=str(err)[:240]
            if isinstance(err,requests.HTTPError) and err.response is not None and err.response.status_code==429:
                result.append(obj)
                print("RATE_LIMIT_STOP",v["id"],flush=True)
                break
    draw.text((x+14,483),v["object_id"]+" · "+v["id"][:31],fill=(235,226,208))
    draw.text((x+14,509),f'{obj["original_width"]}×{obj["original_height"]} · {obj["license"][:30]}',fill=(160,169,184))
    draw.text((x+14,533),obj["source_image_status"][:37],fill=(160,169,184))
    result.append(obj)
    print("B20_OBJECT",json.dumps({"id":v["id"],"status":obj["source_image_status"],"license":obj["license"]}),flush=True)
    time.sleep(0.7)
canvas.save(OUT/"M6_B20_SN05_AL06_visual_contact.jpg",quality=91)
doc={"schema":"AO_M6_B20_ISOLATED_SANCTUARY_IMAGE_EVIDENCE_V1","date":"2026-10-19","samples":result,
     "published":False,"image_reuse_approved":False,"human_visual_review_required":True,
     "source_gate":"Check exact photo, not metadata alone. One liturgical object on plain background."}
(OUT/"M6_B20_source_manifest.json").write_text(json.dumps(doc,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("B20_SUMMARY",len(result),sum(v["source_image_status"].startswith("THUMBNAIL_PRESENT") for v in result),flush=True)
