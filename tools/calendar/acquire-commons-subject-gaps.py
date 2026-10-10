#!/usr/bin/env python3
"""Find and acquire hard-to-source sacred subjects through Wikimedia Commons.

Coverage-first research only. Source rights must be freely reusable worldwide:
only explicit CC0 or old-master PD-Art 2D reproductions qualify as leads.
Do not promote to runtime, or assert museum fidelity / portrait authenticity.
"""
import hashlib, io, json, re, time
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from PIL import Image, ImageOps, ImageDraw
import numpy as np
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"artifacts/sacred-art-commons-gaps"
MEDIA="https://commons.wikimedia.org/w/api.php"
UA="AdOrientemResearch/2.0 (public-domain sacred-art research, 10 Oct 2026)"
# Upfront iconographic/source targets; search results are title-only hints.
TASKS=[
("calendar.palm-sunday","Entry into Jerusalem painting",r"\bentry into jerusalem\b|\bchrist entering jerusalem\b",2),
("calendar.transfiguration","Transfiguration of Christ oil painting",r"\btransfiguration\b",2),
("calendar.holy-rosary","Our Lady of the Rosary oil painting",r"\bour lady of the rosary\b|\bmadonna of the rosary\b",2),
("devotion.christ-king","Christ in Majesty oil painting",r"\bchrist in majesty\b|\bchrist enthroned\b|\bchrist the king\b",2),
("devotion.st-therese","Saint Thérèse of Lisieux portrait painting",r"\bth[eé]r[eè]se of lisieux\b|\btherese of lisieux\b",1),
("devotion.our-lady-perpetual-help","Our Lady of Perpetual Help icon",r"\bperpetual help\b|\bperpetual succour\b",2),
("devotion.st-anthony","Saint Anthony of Padua Child Jesus painting",r"\bsaint anthony of padua\b|\bst anthony of padua\b",1),
("formation.holy-orders","Ordination of Saint Stephen painting",r"\bordination\b.*\bstephen\b",2),
("formation.scapular","Our Lady of Mount Carmel Saint Simon Stock painting",r"\bmount carmel\b|\bsimon stock\b",2),
("station.01","Christ before Pilate painting",r"\bchrist before pilate\b|\bjesus before pilate\b",1),
("station.06","Saint Veronica veil painting",r"\bsaint veronica\b|\bvera icon\b",1),
("station.08","Daughters of Jerusalem Christ painting",r"\bdaughters of jerusalem\b|\bwomen of jerusalem\b",1),
("station.10","Stripping of Christ painting",r"\bstripping of christ\b|\bchrist stripped\b",1),
("calendar.sacred-heart","Sacred Heart of Jesus oil painting",r"\bsacred heart\b",2),
("devotion.immaculate-heart","Immaculate Heart of Mary painting",r"\bimmaculate heart\b",2),
("formation.sacrament-all-seven","Seven Sacraments altarpiece painting",r"\bseven sacraments\b",1),
("devotion.holy-souls","Souls of Purgatory painting",r"\bsouls in purgatory\b|\bpurgatory\b",2),
("formation.papacy","Pope Pius X painted portrait",r"\bpius x\b",1)
]
def request(url,limit=28_000_000):
 if not url.startswith("https://"):raise ValueError("HTTPS required")
 error=None
 for retry in range(3):
  try:
   with urlopen(Request(url,headers={"User-Agent":UA,"Accept":"application/json,image/jpeg,*/*"}),timeout=24) as res:
    if int(res.headers.get("Content-Length") or "0")>limit:raise ValueError("too many bytes")
    body=res.read(limit+1)
    if len(body)>limit:raise ValueError("too many bytes")
    return body
  except (HTTPError,URLError,TimeoutError,OSError) as e:
   error=str(e)
   if isinstance(e,HTTPError) and e.code not in (403,429,500,502,503,504):break
   time.sleep(3*(retry+1))
 raise RuntimeError(error or "download failed")
def wiki(params):return json.loads(request(MEDIA+"?"+urlencode(params),4_000_000))
def normalized(s):return re.sub(r"\s+"," ",str(s).lower()).strip()
def is_allowed_license(ext):
 licenses=((ext.get("LicenseShortName") or {}).get("value") or "").lower()
 templates=((ext.get("License") or {}).get("value") or "").lower()
 if "cc0" in licenses:return "CC0_LICENSE_CLAIM"
 if licenses in ("public domain","public domain mark","pd-art") or ("pd-art" in templates):
  return "PD_ART_COMMONS_JURISDICTION_HOLD"
 return None
def check_image(raw):
 with Image.open(io.BytesIO(raw)) as im:
  im.load();im=ImageOps.exif_transpose(im)
  if im.format not in ("JPEG","PNG"):raise ValueError("Not JPEG/PNG")
  w,h=im.size
  if max(w,h)<2500:raise ValueError("Too small")
  im=im.convert("RGB");im.thumbnail((250,250))
  p=np.asarray(im,dtype=np.int16)
  colour=float(np.mean((np.max(p,axis=2)-np.min(p,axis=2))>18))
  if colour<.07:raise ValueError("Near monochrome")
  return w,h,round(colour,4)
def main():
 (OUT/"originals").mkdir(parents=True,exist_ok=True)
 report=[];images=[]; seen=set()
 for target,query,subject_regex,needed in TASKS:
  row={"targetId":target,"query":query,"reviewOnly":True,"found":0,"qualified":0,"acquired":0,"hits":[],"errors":[]}
  try:
   result=wiki({"action":"query","generator":"search","gsrsearch":'filetype:bitmap '+query,
    "gsrnamespace":6,"gsrlimit":20,"prop":"imageinfo","iiprop":"url|size|extmetadata|sha1","format":"json"})
   pages=list((result.get("query") or {}).get("pages",{}).values())
   row["found"]=len(pages)
   for p in pages:
    if row["acquired"]>=needed:break
    title=p.get("title") or ""
    if not re.search(subject_regex,title,re.I):continue
    low=normalized(title)
    if any(w in low for w in ("fresco","mural","sketch","etching","print","drawing","photograph","poster","statue","sculpture")):continue
    inf=(p.get("imageinfo") or [None])[0]
    if not inf:continue
    ext=inf.get("extmetadata") or {}
    rights=is_allowed_license(ext)
    if rights is None:continue
    source=inf.get("url") or ""
    if not source.startswith("https://upload.wikimedia.org/wikipedia/commons/"):continue
    if max(inf.get("width") or 0,inf.get("height") or 0)<2500:continue
    key="commons-"+hashlib.sha256(title.encode()).hexdigest()[:16]
    if key in seen:continue
    record={"id":key,"targetId":target,"title":title,"sourcePage":"https://commons.wikimedia.org/wiki/"+title.replace(" ","_"),
     "imageUrl":source,"sha1":inf.get("sha1"),"sourceWidth":inf.get("width"),"sourceHeight":inf.get("height"),
     "rights":rights,"artistStatement":(ext.get("Artist") or {}).get("value"),
     "creditStatement":(ext.get("Credit") or {}).get("value"),"sourceRightsStatement":(ext.get("LicenseShortName") or {}).get("value"),
     "status":"CANDIDATE_NOT_ACQUIRED","artCuratorApproved":False,"globalReuseApproved":False}
    row["qualified"]+=1
    try:
     body=request(source)
     if hashlib.sha1(body).hexdigest()!=inf.get("sha1"):raise ValueError("SHA1 did not match Wikimedia original")
     w,h,chroma=check_image(body)
     filename=key+(".png" if source.lower().endswith(".png") else ".jpg")
     (OUT/"originals"/filename).write_bytes(body)
     record.update(status="ORIGINAL_ACQUIRED_RIGHTS_HELD",originalFilename=filename,
       width=w,height=h,colourFraction=chroma,bytes=len(body),sha256=hashlib.sha256(body).hexdigest())
     row["acquired"]+=1;seen.add(key)
     print("ACQUIRED",target,key,title[:100],flush=True)
    except Exception as e:record["rejectionReason"]=str(e)
    row["hits"].append(record)
    if record["status"]=="ORIGINAL_ACQUIRED_RIGHTS_HELD":images.append(record)
    time.sleep(1.2)
  except Exception as e:row["errors"].append(str(e))
  report.append(row)
  print("TARGET",target,"search",row["found"],"qualified",row["qualified"],"acquired",row["acquired"],flush=True)
  time.sleep(1.5)
 for start in range(0,len(images),8):
  bg=Image.new("RGB",(1600,2020),(236,234,228));draw=ImageDraw.Draw(bg)
  for n,r in enumerate(images[start:start+8]):
   x=n%4*400;y=n//4*1010
   with Image.open(OUT/"originals"/r["originalFilename"]) as im:
    thumb=ImageOps.exif_transpose(im).convert("RGB");thumb.thumbnail((372,876),Image.Resampling.LANCZOS)
    bg.paste(thumb,(x+(400-thumb.width)//2,y+(890-thumb.height)//2))
   draw.text((x+8,y+903),r["targetId"][:52],fill=(25,25,25))
   draw.text((x+8,y+930),r["title"][:50],fill=(25,25,25))
  bg.save(OUT/("contact-%02d.jpg"%(start//8+1)),quality=90)
 (OUT/"research.json").write_text(json.dumps({"schema":"AO_COMMONS_TARGETED_GAPS_V1","warning":"Title and Commons licence claims only; no painted medium attribution, worldwide legal approval, or aesthetic/phone approval.", "targets":report,"artworks":images},indent=2,ensure_ascii=False)+"\n")
 print("FINAL",len(images),"originals; research-only, rights held",flush=True)
if __name__=="__main__":main()
