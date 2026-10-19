#!/usr/bin/env python3
"""Gather rights+visual evidence for an isolated corporal, purificator and full altar card SET.

Never auto-approve or publish. Use one batch Commons API request, then small thumbnails.
The contact sheet is a review aid: it is not the selected publication asset.
"""
from pathlib import Path
from urllib.parse import quote
from PIL import Image, ImageDraw, ImageOps
from io import BytesIO
import requests,json,re,html,time
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"dist/visible-mass/m6-b19-single-object-review"
OUT.mkdir(parents=True,exist_ok=True)
photos=[
("LN01","B19-LN01-CORPORAL-GERMETE-1","Korporale in cruce salus (1).jpg"),
("LN01","B19-LN01-CORPORAL-GERMETE-2","Korporale in cruce salus (2).jpg"),
("LN02","B19-LN02-PURIFICATOR-CIESZYN-1","Purificator Cieszyn Poland.JPG"),
("LN02","B19-LN02-PURIFICATOR-CIESZYN-2","Purificator 2 Cieszyn Poland.JPG"),
("LN02","B19-LN02-PURIFICATOR-CIESZYN-3","Purificator 3 Cieszyn Poland.JPG"),
("AL16","B19-AL16-VENETIAN-ENSEMBLE","Arte veneziana, corredo di cartegloria, 1678-1736 ca.jpg"),
("AL16","B19-AL16-LIVORNO-ENSEMBLE","Livorno, museo di santa giulia, cartegloria in argento del 1770.jpg"),
("AL16","B19-AL16-ILLUSTRATION-1948","Catholic Picture Dictionary (Pfeiffer) - Altar cards.jpg")
]
agent=requests.Session()
agent.headers.update({"User-Agent":"AdOrientem-M6VisualSprint/0.1 (research attribution contact, throttles respected)"})
names="|".join("File:"+p[2] for p in photos)
response=agent.get("https://commons.wikimedia.org/w/api.php",
    params={"action":"query","format":"json","formatversion":2,"prop":"imageinfo",
    "iiprop":"size|mime|extmetadata|url","iiurlwidth":640,"titles":names},
    timeout=(15,60))
response.raise_for_status()
pages={v["title"]:v for v in response.json()["query"]["pages"]}
canvas=Image.new("RGB",(4*470,2*460),(8,12,18))
draw=ImageDraw.Draw(canvas)
rows=[]
def clean(v):return html.unescape(re.sub(r"<[^>]+>","",str(v or ""))).strip()
for i,(oid,aid,title) in enumerate(photos):
    page=pages.get("File:"+title,{})
    info=(page.get("imageinfo") or [{}])[0]
    meta=info.get("extmetadata") or {}
    pick=lambda x:clean(meta.get(x,{}).get("value",""))
    row={"object_id":oid,"asset_id":aid,"title":title,
         "source_url":"https://commons.wikimedia.org/wiki/File:"+quote(title.replace(" ","_"),safe="(),_-'"),
         "creator":pick("Artist"),"license":pick("LicenseShortName"),"license_url":pick("LicenseUrl"),
         "original_width":info.get("width"),"original_height":info.get("height"),
         "quality_state":"NOT_YET_VISUALLY_SCREENED","publication_approved":False}
    x=(i%4)*470;y=(i//4)*460
    draw.rounded_rectangle((x+5,y+5,x+465,y+456),outline=(70,81,95),width=2,radius=10)
    url=info.get("thumburl")
    if url:
        try:
            r=agent.get(url,timeout=(12,40))
            r.raise_for_status()
            if not r.headers.get("Content-Type","").startswith("image/"):raise ValueError("Unexpected nonimage payload")
            if len(r.content)>2_000_000:raise ValueError("Bounded source preview exceeded 2MB")
            raw=Image.open(BytesIO(r.content));raw.load()
            im=ImageOps.exif_transpose(raw).convert("RGB")
            im.thumbnail((440,342),Image.Resampling.LANCZOS)
            canvas.paste(im,(x+(470-im.width)//2,y+10+(346-im.height)//2))
            (OUT/(aid+".jpg")).write_bytes(r.content)
            row["quality_state"]="PREVIEW_ACQUIRED_PENDING_CURATOR_CHECK"
            row["preview_resolution"]=[raw.width,raw.height]
        except Exception as exc:
            row["quality_state"]="PREVIEW_UNAVAILABLE"
            row["download_error"]=str(exc)[:220]
            if "429" in str(exc):
                rows.append(row)
                print("SOURCE_RATE_LIMIT_STOP",aid,flush=True)
                break
    else:row["quality_state"]="NO_COMMONS_PREVIEW_URL"
    draw.text((x+12,y+365),oid+"  "+aid[:44],fill=(238,225,199))
    draw.text((x+12,y+390),f'{info.get("width")}×{info.get("height")} · {row["license"][:22]}',fill=(164,174,186))
    draw.text((x+12,y+415),row["quality_state"],fill=(164,174,186))
    rows.append(row)
    print("B19",json.dumps({"id":aid,"status":row["quality_state"],"license":row["license"]}),flush=True)
    time.sleep(0.8)
canvas.save(OUT/"M6_B19_Object_Only_Contact_Sheet.jpg",quality=91)
state={"schema":"AO_M6_SINGLE_OBJECT_B19_IMAGE_EVIDENCE_V1","date":"2026-10-19",
       "purpose":"One object only; select at most one photograph per canonical ID after visual assessment.",
       "source_rights_verified_individually":True,"publication_approved":False,
       "preview_total":len(rows),"preview_downloads":sum(r["quality_state"]=="PREVIEW_ACQUIRED_PENDING_CURATOR_CHECK" for r in rows),
       "images":rows}
(OUT/"B19_source_evidence.json").write_text(json.dumps(state,indent=2,ensure_ascii=False)+"\n")
print("SUMMARY",state["preview_downloads"],"of",len(photos),flush=True)
