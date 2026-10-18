#!/usr/bin/env python3
"""Bundle *real Wikimedia images* inside the M6 single-file reviewer; no fake pictures.

Downloads a bounded selection of small source thumbnails with a verified Commons
title-to-imageinfo map, embeds them as base64 data URLs, and reports every miss.
First 4 sources are the SV02 patens shown on initial open. Stops immediately
on rate limit (HTTP 429), never silently promotes a failed image or invents one.
"""
import base64, html, io, json, os, re, sys, time, hashlib
from collections import OrderedDict
from pathlib import Path
from urllib.parse import urlparse, unquote
import requests
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parent.parent
INPUT=ROOT/"previews/visible-mass-3d/M6_Rapid_30_Object_Photo_Triage_20261019.html"
OUT=ROOT/"dist/visible-mass/Ad_Orientem_M6_Rapid_30_Object_Offline_Photos.html"
REPORT=ROOT/"dist/visible-mass/M6_Embedded_Thumbnail_Acquisition.json"
# Friendly research client; do not alter User-Agent to evade site restrictions.
SESSION=requests.Session()
SESSION.headers.update({"User-Agent":"AdOrientemResearch/0.2 (noncommercial source review, attribution retained)",
                        "Accept":"application/json,image/jpeg,image/png,*/*"})
SIZE=520
MAX=75
PACING_SECONDS=1.4

def decode_dataset(raw):
    m=re.search(r'<script id="dataset" type="application/json">([\s\S]*?)</script>',raw)
    if not m: raise ValueError("Missing embedded canonical dataset")
    return m, json.loads(m.group(1))

def title_from_url(url):
    if not url or "/File:" not in url: return None
    return unquote(urlparse(url).path.split("/File:",1)[1]).replace("_"," ")

def collect(data):
    priority=["SV02","SV03","LN04","LN05","SV01","LN03","AL16","EQ01","EQ02","BK02","BK01","EQ06"]
    priority += [o["object_id"] for o in data["objects"] if o["object_id"] not in priority]
    by_id={o["object_id"]:o for o in data["objects"]}
    candidates=OrderedDict()
    for oid in priority:
        for rec in by_id[oid]["records"]:
            if rec.get("medium")!="photograph": continue
            title=title_from_url(rec.get("source_url"))
            if title and title not in candidates:
                candidates[title]=rec["source_url"]
            if len(candidates)>=MAX: return candidates
    return candidates

def get_meta(files):
    # One large, bounded MediaWiki API request; no per-file metadata queries.
    names=list(files)
    params={"action":"query","format":"json","formatversion":"2","prop":"imageinfo",
            "iiprop":"url|mime|size","iiurlwidth":SIZE,"redirects":1,
            "titles":"|".join("File:"+n for n in names)}
    r=SESSION.get("https://commons.wikimedia.org/w/api.php",params=params,timeout=(15,70))
    r.raise_for_status()
    doc=r.json()
    if "error" in doc: raise RuntimeError(json.dumps(doc["error"])[:200])
    result={}
    for page in doc.get("query",{}).get("pages",[]):
        title=page.get("title","").removeprefix("File:")
        info=(page.get("imageinfo") or [{}])[0]
        if info.get("thumburl") and str(info.get("mime","")).startswith("image/"):
            result[title]=info["thumburl"]
    for n in names:
        if n not in result:
            print("NO_THUMB_METADATA",n[:80],flush=True)
    return result

def convert_thumb(src):
    with SESSION.get(src,timeout=(15,50),stream=True) as r:
        r.raise_for_status()
        if not r.headers.get("Content-Type","").lower().startswith("image/"):
            raise ValueError("Non-image HTTP response")
        buf=bytearray()
        for chunk in r.iter_content(32768):
            buf+=chunk
            if len(buf)>1_800_000: raise ValueError("Thumbnail too large")
    im=Image.open(io.BytesIO(buf));im.load()
    if im.width<60 or im.height<60: raise ValueError("Unexpected tiny thumbnail")
    im=ImageOps.exif_transpose(im).convert("RGB")
    im.thumbnail((SIZE,SIZE),Image.Resampling.LANCZOS)
    out=io.BytesIO();im.save(out,format="JPEG",quality=80,optimize=True)
    payload=out.getvalue()
    return "data:image/jpeg;base64,"+base64.b64encode(payload).decode("ascii"),{"width":im.width,"height":im.height,"bytes":len(payload),"sha256":hashlib.sha256(payload).hexdigest()}

def main():
    raw=INPUT.read_text("utf-8")
    m,data=decode_dataset(raw)
    candidates=collect(data)
    thumb_map={}
    errors={}
    status="COMPLETE"
    try:
        meta=get_meta(candidates)
    except (requests.RequestException,ValueError,RuntimeError) as e:
        meta={}
        status="SOURCE_API_UNAVAILABLE"
        errors["_source_api"]=str(e)[:250]
    print("METADATA",len(meta),"of",len(candidates),"status",status,flush=True)
    for i,(title,src) in enumerate(candidates.items(),1):
        if title not in meta: continue
        try:
            payload,info=convert_thumb(meta[title])
            thumb_map[title]=payload
            print("PHOTO",i,"OK",title[:65],info["bytes"],flush=True)
        except requests.HTTPError as e:
            code=e.response.status_code if e.response is not None else None
            errors[title]=str(e)[:180]
            print("PHOTO",i,"HTTP",code,title[:65],flush=True)
            if code==429:
                status="SOURCE_THROTTLED_STOPPED"
                break
        except (requests.RequestException, OSError,ValueError) as e:
            errors[title]=str(e)[:180]
            print("PHOTO",i,"FAILED",str(e)[:120],flush=True)
        time.sleep(PACING_SECONDS)
    hits=0
    for obj in data["objects"]:
        for rec in obj["records"]:
            title=title_from_url(rec.get("source_url"))
            if title in thumb_map:
                rec["embedded_thumbnail_data_uri"]=thumb_map[title]
                hits+=1
    data["thumbnail_bundle"]={"source":"Wikimedia Commons thumbnails, provenance URLs remain in original records",
        "number_unique_downloaded":len(thumb_map),"records_with_embedded_preview":hits,
        "attempted_unique":len(candidates),"fetch_status":status,"review_approval":False}
    fixed=raw[:m.start(1)]+json.dumps(data,separators=(",",":"),ensure_ascii=False).replace("<","\\u003c")+raw[m.end(1):]
    OUT.parent.mkdir(parents=True,exist_ok=True)
    OUT.write_text(fixed,"utf-8")
    report={"schema":"AO_M6_PREVIEW_BUNDLE_V1","status":status,"candidate_unique":len(candidates),
        "embedded_unique":len(thumb_map),"records_with_embedded_preview":hits,
        "missing_titles":[t for t in candidates if t not in thumb_map],"errors":errors,
        "image_licences_not_changed":True,"review_approval":False}
    REPORT.write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n","utf-8")
    print("SUMMARY",json.dumps({k:report[k] for k in ["status","candidate_unique","embedded_unique","records_with_embedded_preview"]}),flush=True)
    # Never declare an image gallery fixed if no photograph is bundled.
    if len(thumb_map)<4:
        print("INCOMPLETE: fewer than four image thumbnails acquired; this does not fix first-page review",file=sys.stderr)
        return 1
    return 0

if __name__=="__main__": sys.exit(main())
