#!/usr/bin/env python3
"""Acquire museum-hosted image bytes from the 12 Städel research-source pages.
Licence: OAI CC BY-SA 4.0 vs object-page Public Domain claim; keep ALL held.
This script does not place images into the CC0 canonical or production registry.
"""
import hashlib,html,io,json,re,time
from pathlib import Path
from urllib.parse import urlparse,urljoin
from urllib.request import Request,urlopen
from html.parser import HTMLParser
from PIL import Image,ImageOps
ROOT=Path(__file__).resolve().parents[2]
DOC=json.loads((ROOT/"data/calendar/sacred-art-staedel-painting-leads.v1.json").read_text(encoding="utf8"))
OUT=ROOT/"artifacts/sacred-art-staedel"
OUT.mkdir(parents=True,exist_ok=True)
IMAGES=OUT/"originals"
IMAGES.mkdir(exist_ok=True)
ALLOW={"sammlung.staedelmuseum.de","www.staedelmuseum.de","staedelmuseum.de","images.staedelmuseum.de","cdn.staedelmuseum.de"}
UA={"User-Agent":"AdOrientem Museum Public-Domain Painting Research/1.0","Accept":"text/html,image/jpeg,image/png,image/webp,*/*"}
def get(url,maxbytes=32_000_000):
    if urlparse(url).scheme!="https" or urlparse(url).hostname not in ALLOW:
        raise ValueError("Not a direct museum-hosted HTTPS URL")
    with urlopen(Request(url,headers=UA),timeout=28) as resp:
        raw=resp.read(maxbytes+1)
        if len(raw)>maxbytes: raise ValueError("Image exceeds 32 MB")
        mime=resp.headers.get("Content-Type","")
    return raw,mime
class Media(HTMLParser):
    def __init__(self):super().__init__();self.urls=[]
    def handle_starttag(self,tag,attrs):
        d=dict(attrs)
        for key,value in attrs:
            if value and (key in ("src","srcset","href","content","data-src","data-original","data-download","data-download-url","data-srcset") or "image" in key):
                self.urls.append(str(value))
def candidates(page,base):
    parser=Media();parser.feed(page)
    full="\n".join([page]+parser.urls).replace("\\/","/").replace("&amp;","&")
    raw=parser.urls + re.findall(r'https?://[^"\'\s<>,\\]{15,260}',full)
    image_ext=re.compile(r"\.(?:jpe?g|png|webp)(?:[?&#]|$)",re.I)
    urls=set()
    for thing in raw:
        for val in re.split(r"[, \t\r\n]+",html.unescape(str(thing))):
            val=val.strip("'\"()")
            if not val or "thumb-xs" in val:continue
            if not image_ext.search(val):continue
            url=urljoin(base,val).replace("http://","https://",1)
            if urlparse(url).hostname not in ALLOW:continue
            urls.add(url)
    def rating(u):
        lo=u.lower()
        return (25*("download" in lo)+20*("original" in lo)+
                15*("full" in lo)+12*("large" in lo)+
                5*("thumb-xl" in lo)-16*("thumb-sm" in lo)-20*("logo" in lo),
                -len(u))
    return sorted(urls,key=rating,reverse=True)
rows=[]
for a in DOC["sources"]:
    row={"id":a["id"],"title":a["title"],"sourceUrl":a["sourceUrl"],
         "sourceMuseum":"Städel Museum, Frankfurt am Main",
         "copyrightStatus":"CC_BY_SA_4_0_MUSEUM_OAI_IMAGE_TERMS_AND_PD_OBJECT_PAGE_DIFFER",
         "publicationApproval":False,"editorialApproval":False,
         "status":"MUSEUM_PAINTING_SOURCE_LEAD_NOT_ACQUIRED"}
    try:
        raw,_=get(a["sourceUrl"],2_500_000)
        text=raw.decode("utf-8","replace")
        if "painting" not in text.lower():raise ValueError("Museum page did not expose painting subject")
        urls=candidates(text,a["sourceUrl"])
        row["detectedMuseumImageUrls"]=len(urls)
        row["candidateUrlSamples"]=urls[:5]
        if not urls:raise ValueError("No museum-hosted JPG/PNG/WebP URL discoverable in page")
        attempts=[]
        for image_url in urls[:6]:
            try:
                data,mime=get(image_url)
                with Image.open(io.BytesIO(data)) as im:
                    im.load()
                    if im.format not in ("JPEG","PNG","WEBP"):raise ValueError("unsupported image format")
                    w,h=ImageOps.exif_transpose(im).size
                attempts.append({"url":image_url,"width":w,"height":h})
                if max(w,h)<1800:continue
                suffix=".jpg" if "JPEG" in (mime or "").upper() or im.format=="JPEG" else "."+im.format.lower()
                target=a["id"]+suffix
                (IMAGES/target).write_bytes(data)
                row.update({"status":"ORIGINAL_ACQUIRED_RESEARCH_ONLY_RIGHTS_HELD",
                    "imageUrl":image_url,"file":"originals/"+target,
                    "width":w,"height":h,"bytes":len(data),
                    "originalSha256":hashlib.sha256(data).hexdigest()})
                break
            except Exception as exc:
                attempts.append({"url":image_url,"error":str(exc)[:180]})
        row["attempts"]=attempts
        if row["status"]!="ORIGINAL_ACQUIRED_RESEARCH_ONLY_RIGHTS_HELD":
            row["status"]="NO_1800PX_DIRECT_MUSEUM_ORIGINAL_AVAILABLE"
        print(a["id"],row["status"],row.get("width",""),row.get("height",""),flush=True)
    except Exception as e:
        row["error"]=str(e)[:260]
        print(a["id"],"HELD",str(e)[:125],flush=True)
    rows.append(row)
    time.sleep(.1)
report={"schema":"AO_SACRED_ART_STADEL_SOURCE_DOWNLOAD_PROBE_V1",
    "message":"Official museum source discovery with reproducible image SHA only; all items held for CC BY-SA 4.0/PD rights differences, source-identity and human final editorial review. Never import as CC0.",
    "sourcesChecked":len(rows),
    "fullSizeMuseumDownloads":sum(bool(x.get("originalSha256")) for x in rows),
    "artworks":rows}
(OUT/"download-report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
print("STADEL_ACQUISITION_SUMMARY",json.dumps({"sourcePages":len(rows),"images":report["fullSizeMuseumDownloads"]}),flush=True)
