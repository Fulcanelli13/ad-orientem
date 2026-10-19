#!/usr/bin/env python3
"""Single-pass contact sheet for candidate existing-source one-object M6 photos; no automatic promotions."""
from __future__ import annotations
import base64, io, json, re, time
from pathlib import Path
from urllib.parse import unquote, urlsplit
import requests
from PIL import Image, ImageDraw, ImageOps
ROOT=Path(__file__).resolve().parent.parent
MASTER=ROOT/"previews/visible-mass-3d/M6_PHOTOGRAPHIC_ATLAS_COVERAGE_20261018.v1.json"
OUT=ROOT/"dist/visible-mass/m6-existing-source-sprint"
FILES=[
 ("SN05","EXISTING-SN05"),
 ("SN07","EXISTING-SN07"),
 ("AL03","EXISTING-AL03"),
 ("AL14","EXISTING-AL14"),
 ("SV13","EXISTING-SV13"),
 ("LN01","EXISTING-LN01"),
 ("LN02","EXISTING-LN02"),
 ("EQ06","M6-EQ06-ALTAR-BELL-ALTERNATE"),
 ("BK01","EXISTING-BK01"),
 ("BK02","M6-BK02-JAPANESE-MISSAL-STAND-PROSPECT"),
 ("AL13","M6B2-AL13-MET-GENOA-ALTAR-CLOTH"),
 ("AL16","EXISTING-AL16")
]
def commons_title(url):
    if "commons.wikimedia.org/wiki/File:" not in url:return None
    return "File:"+unquote(urlsplit(url).path.split("File:",1)[1]).replace("_"," ")
def main():
    OUT.mkdir(parents=True,exist_ok=True)
    data=json.loads(MASTER.read_text())
    image_map={x["asset_id"]:x for x in data["images"]}
    rows=[]
    for oid,aid in FILES:
        if aid not in image_map: raise ValueError("Missing original registered image ID: "+aid)
        x=image_map[aid];t=commons_title(x.get("source_url",""))
        if not t: raise ValueError("Source is not Commons: "+aid)
        rows.append({"object_id":oid,"asset_id":aid,"title":t,"source_url":x["source_url"],"source_rights_from_registry":x.get("licence"),"photo_status":"UNINSPECTED"})
    session=requests.Session()
    session.headers.update({"User-Agent":"AdOrientemM6-SourceQualityResearch/0.1 (source attribution preserved)"})
    titles="|".join(r["title"] for r in rows)
    try:
        a=session.get("https://commons.wikimedia.org/w/api.php",params={"action":"query","format":"json","formatversion":"2","prop":"imageinfo","iiprop":"url|size|mime|extmetadata","iiurlwidth":540,"titles":titles},timeout=60)
        a.raise_for_status()
        pages={p["title"]:p for p in a.json()["query"]["pages"]}
    except Exception as ex:
        pages={}
        print("SOURCE API FAILED",str(ex)[:200],flush=True)
    sheet=Image.new("RGB",(4*430,3*440),(10,14,21));d=ImageDraw.Draw(sheet)
    for i,r in enumerate(rows):
        x=(i%4)*430;y=(i//4)*440
        d.rectangle((x+3,y+3,x+426,y+437),outline=(80,89,101),width=2)
        p=pages.get(r["title"],{})
        info=(p.get("imageinfo") or [{}])[0]
        r["original_dimensions"]=[info.get("width"),info.get("height")]
        ext=info.get("extmetadata") or {}
        r["commons_license"]=str(ext.get("LicenseShortName",{}).get("value",""))
        r["commons_artist_raw"]=re.sub("<[^>]+>"," ",str(ext.get("Artist",{}).get("value","")))[:250]
        src=info.get("thumburl")
        if src:
            try:
                with session.get(src,timeout=35) as resp:
                    resp.raise_for_status()
                    if not resp.headers.get("Content-Type","").startswith("image/"):raise ValueError("Not image")
                    payload=resp.content
                    if len(payload)>2_000_000:raise ValueError("Image exceeded 2 MB")
                im=Image.open(io.BytesIO(payload));im.load()
                if im.width<90 or im.height<90:raise ValueError("Tiny thumbnail")
                im=ImageOps.exif_transpose(im).convert("RGB")
                im.thumbnail((415,355),Image.Resampling.LANCZOS)
                sheet.paste(im,(x+(430-im.width)//2,y+10+(350-im.height)//2))
                (OUT/(r["object_id"]+"_"+r["asset_id"]+".jpg")).write_bytes(payload)
                r["photo_status"]="THUMBNAIL_INSPECTABLE_NOT_EDITORIALLY_APPROVED"
            except Exception as ex:
                r["photo_status"]="UNAVAILABLE"
                r["error"]=str(ex)[:170]
                if isinstance(ex,requests.HTTPError) and ex.response is not None and ex.response.status_code==429:
                    print("RATE_LIMIT_STOP",r["asset_id"],flush=True)
                    # Will leave later image records explicitly uninspected
                    for rest in rows[i+1:]:rest["photo_status"]="SKIPPED_AFTER_RATE_LIMIT"
                    d.text((x+15,y+160),"RATE LIMIT / UNAVAILABLE",(214,154,119))
                    break
                d.text((x+15,y+160),"SOURCE UNAVAILABLE",(214,154,119))
        else:d.text((x+15,y+160),"NO COMMONS THUMB URL",(214,154,119))
        d.text((x+12,y+367),f'{r["object_id"]} - {r["asset_id"][:39]}',(238,228,209))
        d.text((x+12,y+392),r["photo_status"][:45],(156,169,187))
        print("ROW",json.dumps({"id":r["asset_id"],"status":r["photo_status"],"pixels":r["original_dimensions"],"license":r["commons_license"]}),flush=True)
        time.sleep(1.0)
    sheet.save(OUT/"M6_existing_candidates_contact.jpg",quality=90)
    manifest={"schema":"AO_VISIBLE_MASS_EXISTING_SOURCE_PHOTO_SCREEN_V1","source_master":MASTER.name,"status":"PREVIEW_IMAGE_EVIDENCE_ONLY","editorially_approved":False,"photos":rows}
    (OUT/"inspection_manifest.json").write_text(json.dumps(manifest,indent=2)+"\n")
    print("SUMMARY",json.dumps({"inspected_thumbnails":sum(x["photo_status"].startswith("THUMBNAIL_INSPECTABLE") for x in rows),"target":len(rows)}),flush=True)
if __name__=="__main__":main()
