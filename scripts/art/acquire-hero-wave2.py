#!/usr/bin/env python3
"""Ad Orientem research-only next-wave image acquisition, €0.

Only download independently sourced file originals (Met, AIC IIIF, Commons).
Never change selected paintings, declare quality/licence approval, or deploy.
Checks photo identity and original-byte SHA-256; permanently archive on isolated
research Git branch via workflow (not temporary Actions artifacts).
"""
import hashlib
import io
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"assets/staged/module-hero-wave2"
REPORT=ROOT/"data/research/module-hero-acquisition-wave2-20261026.json"
UA="AdOrientem-FaithfulArtResearch/1.0 (https://github.com/Fulcanelli13/ad-orientem)"
MAX_BYTES=16*1024*1024
MAX_TOTAL=90*1024*1024

COMMONS={
 "saints-khm":("saints","Albrecht Dürer, Kunsthistorisches Museum Wien, Gemäldegalerie - Allerheiligenbild (\"Landauer Altar\") - GG 838 - Kunsthistorisches Museum.jpg","museum_object_photo; may contain frame"),
 "saints-gart":("saints","Albrecht Dürer - Adoration of the Trinity (Landauer Altar) - Google Art Project.jpg","possible painting-only image; independently check painting bounds"),
 "king":("king","Ambrosius Benson - Salvator Mundi.jpeg","verify correct artist/auction image; known previous source URL incorrect"),
 "salvation-wide":("salvation","Le Siècle d'Auguste - naissance de N.S. Jésus-Christ Amiens 04.jpg","museum installation / photograph may contain walls or perspectival skew"),
 "perpetual":("perpetual","Our Holy Mother Of Perpetual Succour.jpg","APPROVED POSTER SCAN, not historical icon; publication rights undecided"),
 "holy-spirit":("holy-spirit","Restout - La Pentecôte 01.jpg","PHOTO RIGHTS CONFLICT: Wikimedia PD-Art tag but photographer EXIF mentions CC-BY-SA; candidate research only"),
 "morning-commons":("morning","The Song of the Lark (Jules Breton, 1884).jpg","museum-referenced fallback to compare with AIC original"),
}
ALLOW_MEDIA={"upload.wikimedia.org","images.metmuseum.org","www.artic.edu","artic.edu"}
ALLOW_METADATA={"commons.wikimedia.org","collectionapi.metmuseum.org","api.artic.edu"}

def pull(url,max_bytes=MAX_BYTES,hosts=ALLOW_MEDIA):
    rq=urllib.request.Request(url,headers={"User-Agent":UA})
    with urllib.request.urlopen(rq, timeout=70) as stream:
        final=stream.geturl()
        host=urllib.parse.urlsplit(final).hostname
        if host not in hosts:raise ValueError("Unapproved redirect target: "+str(host))
        chunks=bytearray()
        while True:
            part=stream.read(min(1024*1024,max_bytes+1-len(chunks)))
            if not part:break
            chunks.extend(part)
            if len(chunks)>max_bytes:raise ValueError("Original above capped byte size")
        if not chunks:raise ValueError("Empty download")
        return bytes(chunks),final

def pull_json(url):
    raw,_=pull(url,3*1024*1024,ALLOW_METADATA)
    return json.loads(raw.decode("utf-8"))

def commons(filename):
    url="https://commons.wikimedia.org/w/api.php?"+urllib.parse.urlencode({
      "action":"query","format":"json","prop":"imageinfo","iiprop":"url|size|sha1|mime|extmetadata",
      "titles":"File:"+filename})
    response=pull_json(url)
    p=next(iter(response["query"]["pages"].values()))
    if "imageinfo" not in p:raise ValueError("Commons File absent: "+filename)
    info=p["imageinfo"][0]
    if info.get("size",0)>MAX_BYTES:raise ValueError("Commons photo >16MiB")
    rights=re.sub("<[^>]+>","",info.get("extmetadata",{}).get("LicenseShortName",{}).get("value",""))
    if not any(key in rights.lower() for key in ("public domain","cc0","cc by")):
        raise ValueError("Commons file not licensed for reuse research: "+rights)
    raw,final=pull(info["url"])
    if info.get("sha1") and hashlib.sha1(raw).hexdigest()!=info["sha1"].lower():
        raise ValueError("Commons SHA-1 mismatch")
    return raw,final,rights

def met():
    obj=pull_json("https://collectionapi.metmuseum.org/public/collection/v1/objects/438724")
    if obj.get("objectID")!=438724 or obj.get("accessionNumber")!="2004.31" or not obj.get("isPublicDomain"):
        raise ValueError("Met identity/CC0 gate failed")
    if not obj.get("primaryImage"):raise ValueError("Met primary image absent")
    raw,url=pull(obj["primaryImage"])
    return raw,url,"Met CC0, object 2004.31, Philippe de Champaigne Annunciation"

def artic():
    obj=pull_json("https://api.artic.edu/api/v1/artworks/94841?fields=id,title,artist_title,image_id,is_public_domain,main_reference_number")
    data=obj["data"]
    if (data.get("id")!=94841 or not data.get("is_public_domain") or
         data.get("main_reference_number")!="1894.1033" or
         "Breton" not in (data.get("artist_title") or "")):
        raise ValueError("AIC original object/artist/public-domain gate failed")
    image_id=data.get("image_id")
    if not image_id:raise ValueError("No IIIF image")
    # Moderate source size; no synthetic resize/upscale. One request, respectful to AIC.
    url="https://www.artic.edu/iiif/2/"+urllib.parse.quote(image_id)+"/full/3000,/0/default.jpg"
    raw,final=pull(url)
    return raw,final,"AIC public-domain collection record 94841; 3000px-wide IIIF photo"

CASES=[
 ("angelus-met","angelus","met",None),
 ("morning-aic","morning","artic",None),
 *[(k,v[0],"commons",v[1]) for k,v in COMMONS.items()]
]

def main():
    results=[];errors=[];total=0
    for ident,mod,kind,param in CASES:
        try:
            if kind=="commons":raw,url,rights=commons(param)
            elif kind=="met":raw,url,rights=met()
            else:raw,url,rights=artic()
            if len(raw)+total>MAX_TOTAL:raise ValueError("combined run exceeded research cap")
            with Image.open(io.BytesIO(raw)) as im:im.verify()
            with Image.open(io.BytesIO(raw)) as im:
                w,h,fmt=im.width,im.height,im.format
                icc=bool(im.info.get("icc_profile"))
                exif=im.getexif()
                iso=exif.get(34855)
            if fmt not in ("JPEG","PNG") or w<700 or h<700:raise ValueError("invalid original format/dimensions")
            ext=".png" if fmt=="PNG" else ".jpg"
            file=OUT/(ident+ext)
            file.parent.mkdir(parents=True,exist_ok=True)
            file.write_bytes(raw)
            total+=len(raw)
            results.append({"id":ident,"module_id":mod,"source_kind":kind,
                "source_url":url,"commons_filename":param,"file":str(file.relative_to(ROOT)),
                "width":w,"height":h,"bytes":len(raw),"sha256":hashlib.sha256(raw).hexdigest(),
                "icc_profile":icc,"exif_iso":iso,"source_rights":rights,
                "quality_potential_only":True,"master_visual_pass":False,"app_released":False,
                "source_specific_risks":COMMONS.get(ident,("","",""))[2] if kind=="commons" else "Institutional source; needs colour and painting QA"})
            print("ACQUIRED",ident,w,h,len(raw),flush=True)
        except Exception as exc:
            errors.append({"id":ident,"module_id":mod,"error":str(exc)[:360]})
            print("NOT ACQUIRED",ident,str(exc)[:160],flush=True)
        time.sleep(1.1)
    REPORT.parent.mkdir(parents=True,exist_ok=True)
    REPORT.write_text(json.dumps({
      "scope":"research originals only, zero-cost, 22 editorial hero selections frozen",
      "bytes_saved":total,"files_acquired":len(results),"failures":errors,
      "photos":results,"approved_hero_master_count":0,"new_live_assets":0},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print(json.dumps({"photos":len(results),"bytes":total,"failures":len(errors)}))

if __name__=="__main__":main()
