#!/usr/bin/env python3
"""CC0/PD-Art Commons painting research for Ad Orientem's documented gaps.

No work is released or counted as correctly depicting a subject until a human
checks the artwork, attribution and image copyright jurisdiction. The Commons
API license is preserved verbatim; "Public domain" is NOT silently made CC0.
"""
import csv,hashlib,html,io,json,re,time,urllib.parse
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.error import HTTPError,URLError
from PIL import Image,ImageOps,ImageDraw
import numpy as np

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"artifacts/sacred-art-commons-gap2"
IMAGES=OUT/"originals"
UA="AdOrientemOpenArtResearch/1.0 (research; source attribution preserved)"
GAPS=[
("calendar.palm-sunday",["Entry into Jerusalem painting","Christ entering Jerusalem painting"]),
("calendar.transfiguration",["Transfiguration of Christ painting Raphael","Transfiguration of Jesus painting"]),
("calendar.holy-rosary",["Virgin of the Rosary painting","Our Lady of the Rosary painting"]),
("calendar.christ-king",["Christ the King painting","Christ in Majesty painting"]),
("devotion.our-lady-perpetual-help",["Our Lady of Perpetual Help painting","Our Lady of Perpetual Succour icon"]),
("devotion.st-therese",["Saint Thérèse of Lisieux painting","Thérèse de Lisieux portrait painting"]),
("devotion.sacred-heart",["Sacred Heart of Jesus painting","Sacré Coeur de Jésus peinture"]),
("devotion.immaculate-heart",["Immaculate Heart of Mary painting","Immaculé Coeur de Marie peinture"]),
("devotion.holy-souls",["Souls in Purgatory painting","Nuestra Señora del Carmen animas del purgatorio"]),
("devotion.christ-king",["Christ the King painting","Christ in Majesty painting"]),
("devotion.st-anthony",["Saint Anthony of Padua with Child painting","Anthony of Padua painting"]),
("station.01",["Christ before Pontius Pilate painting","Jesus before Pilate painting"]),
("station.03",["First fall of Christ painting","Jesus falls under the Cross painting"]),
("station.04",["Christ meeting his Mother Way of the Cross painting"]),
("station.05",["Simon of Cyrene helps Christ painting"]),
("station.06",["Saint Veronica veil of Christ painting","Veronica sudarium painting"]),
("station.07",["Second fall of Christ painting"]),
("station.08",["Daughters of Jerusalem Christ painting"]),
("station.09",["Third fall of Christ painting"]),
("station.10",["Stripping of Christ painting","Disrobing of Christ painting"]),
("station.11",["Nailing of Christ to the Cross painting"]),
("formation.holy-orders",["Ordination of Saint Stephen painting","Ordination of a priest Catholic painting"]),
("formation.sacrament-all-seven",["Seven Sacraments Rogier van der Weyden painting"]),
("formation.scapular",["Our Lady of Mount Carmel Simon Stock painting"]),
("formation.papacy",["Pope Pius X portrait painting","Pope Leo XIII portrait painting"]),
("rosary.lum3",["Sermon on the Mount painting","Christ Preaching painting"]),
("rosary.lum4",["Transfiguration of Christ Raphael painting"]),
("calendar.holy-innocents",["Massacre of the Innocents painting"]),
("calendar.all-saints",["All Saints painting heaven"]),
]
STOP_TERMS=re.compile(r"\b(?:engraving|engraved|lithograph|etching|woodcut|photograph|fresco|wall\s*painting|mural|sculpture|statue|relief|stained\s*glass|print|drawing|sketch|tapestry|mosaic|watermark)\b",re.I)
TECH_TERMS=re.compile(r"^(?:file:(?:dsc|img|p[0-9]{6}|scan|photo|foto)|file:[0-9]{5,})",re.I)
def get(url,limit=29_000_000):
 if not url.startswith("https://"):raise ValueError("HTTPS only")
 last=None
 for k in range(3):
  try:
   with urlopen(Request(url,headers={"User-Agent":UA,"Accept":"application/json,image/jpeg,*/*"}),timeout=35) as r:
    if r.headers.get("Content-Length") and int(r.headers["Content-Length"])>limit:raise ValueError("Oversize original")
    raw=r.read(limit+1)
    if len(raw)>limit:raise ValueError("Oversize original")
    return raw
  except (HTTPError,URLError,OSError,TimeoutError) as ex:
   last=str(ex)
   if isinstance(ex,HTTPError) and ex.code not in (429,500,502,503,504):break
   time.sleep(2*(k+1))
 raise RuntimeError(last)
def clean(v):
 return re.sub(r"<[^>]+>","",html.unescape(v.get("value","") if isinstance(v,dict) else str(v or "")))[:300].strip()
def acceptable_title(name):
 return not STOP_TERMS.search(name) and not TECH_TERMS.search(name) and name.lower().endswith((".jpg",".jpeg"))
def quality(raw):
 with Image.open(io.BytesIO(raw)) as photo:
  photo.load();photo=ImageOps.exif_transpose(photo)
  w,h=photo.size
  if max(w,h)<2500:raise ValueError("Under 2500px")
  rgb=photo.convert("RGB")
  rgb.thumbnail((240,240))
  a=np.asarray(rgb,dtype=np.int16)
  color=float(np.mean((np.max(a,axis=2)-np.min(a,axis=2))>18))
  if color<.08:raise ValueError("Monochrome/near-monochrome")
  return w,h,round(color,3)
def commons_search(query):
 args={"action":"query","generator":"search","gsrsearch":query+" filetype:bitmap",
       "gsrnamespace":"6","gsrlimit":"25","prop":"imageinfo","iiprop":"url|size|extmetadata|sha1",
       "format":"json","formatversion":"2"}
 url="https://commons.wikimedia.org/w/api.php?"+urllib.parse.urlencode(args)
 result=json.loads(get(url,4_000_000))
 return result.get("query",{}).get("pages",[]),url
def review_sheet(rows):
 for off in range(0,len(rows),8):
  piece=rows[off:off+8]
  bg=Image.new("RGB",(1600,2060),(238,235,226));draw=ImageDraw.Draw(bg)
  for i,r in enumerate(piece):
   xx=i%4*400;yy=i//4*1030
   with Image.open(IMAGES/r["filename"]) as orig:
    prev=ImageOps.exif_transpose(orig).convert("RGB");prev.thumbnail((375,885))
    bg.paste(prev,(xx+(400-prev.width)//2,yy+5+(885-prev.height)//2))
   draw.text((xx+8,yy+910),r["targetId"][:47],fill=(20,20,20))
   draw.text((xx+8,yy+935),r["fileTitle"][5:57],fill=(20,20,20))
   draw.text((xx+8,yy+960),r["licence"][:55],fill=(50,50,50))
  bg.save(OUT/("review-%02d.jpg"%(off//8+1)),quality=90)
def main():
 IMAGES.mkdir(parents=True,exist_ok=True)
 acquired=[];searched=[];ids=set(); per=2
 for id,queries in GAPS:
  found=0;log={"targetId":id,"status":"UNRESOLVED","queries":[],"originals":0}
  for query in queries:
   if found>=per:break
   try:
    pages,api=commons_search(query)
    qlog={"query":query,"api":api,"hits":len(pages),"eligible":0,"rejected":[]}
    for page in pages:
     if found>=per:break
     title=page.get("title") or ""
     if not acceptable_title(title):continue
     info=(page.get("imageinfo") or [{}])[0];props=info.get("extmetadata") or {}
     licence=clean(props.get("LicenseShortName"))
     image=info.get("url") or ""
     copyright=clean(props.get("Copyrighted"))
     usage=clean(props.get("UsageTerms"))
     if info.get("width",0)<500 and info.get("height",0)<500:continue
     if not (licence.lower() in {"public domain","cc0","public domain mark 1.0","pd-old","pd-art"} or licence.upper().startswith("PD-")):continue
     if copyright.lower()=="true":continue
     if not image.startswith("https://upload.wikimedia.org/wikipedia/commons/"):continue
     key=str(page.get("pageid")); 
     if key in ids: continue
     try:
      raw=get(image)
      if info.get("sha1") and hashlib.sha1(raw).hexdigest().lower()!=info["sha1"].lower():
       raise ValueError("Commons API SHA1 mismatch")
      w,h,c=quality(raw)
      filename="commons-"+key+".jpg"
      (IMAGES/filename).write_bytes(raw)
      item={"id":"commons-"+key,"targetId":id,"query":query,
        "fileTitle":title,"filePage":"https://commons.wikimedia.org/wiki/"+urllib.parse.quote(title.replace(" ","_"),safe=":/_().-"),
        "originalImageUrl":image,"creator":clean(props.get("Artist")),"credit":clean(props.get("Credit")),
        "sourceDescription":clean(props.get("ImageDescription")),"licence":licence,"usageTerms":usage,
        "copyrightedFlag":copyright,"originalWidth":w,"originalHeight":h,"colourFraction":c,
        "sha256":hashlib.sha256(raw).hexdigest(),"commonsSha1":info.get("sha1"),
        "bytes":len(raw),"filename":filename,
        "technicalStatus":"ORIGINAL_ACQUIRED",
        "subjectStatus":"TITLE_MATCH_ONLY_MANUAL_ICONOGRAPHIC_REVIEW",
        "rightsStatus":"COMMONS_PUBLIC_DOMAIN_CLAIM_JURISDICTION_REVIEW",
        "beautyStatus":"NOT_REVIEWED","publishable":False}
      acquired.append(item);ids.add(key);found+=1;qlog["eligible"]+=1
      print("ACQUIRED",id,item["id"],title[:90],w,h,flush=True)
      time.sleep(.9)
     except Exception as ex:qlog["rejected"].append({"file":title[:75],"reason":str(ex)[:100]})
    log["queries"].append(qlog)
   except Exception as ex:
    log["queries"].append({"query":query,"error":str(ex)})
   time.sleep(.7)
  log["status"]="TWO_ORIGINALS" if found>=per else ("PARTIAL" if found else "NO_MATCH")
  log["originals"]=found;searched.append(log)
  print("TARGET",id,log["status"],found,flush=True)
 review_sheet(acquired)
 (OUT/"acquisition.json").write_text(json.dumps({"schema":"AO_COMMONS_GAP_BATCH_V1","policy":"Review-only. Commons PD claims ≠ approved worldwide reuse. No automatic liturgical matching.","rows":acquired,"searches":searched},indent=2,ensure_ascii=False)+"\n")
 with (OUT/"summary.csv").open("w",newline="",encoding="utf8") as f:
  writer=csv.DictWriter(f,fieldnames=["id","targetId","fileTitle","creator","licence","originalWidth","originalHeight","filePage","sha256"],extrasaction="ignore")
  writer.writeheader();writer.writerows(acquired)
 print("FINAL",len(acquired),"originals for",len([x for x in searched if x["originals"]>0]),"of",len(GAPS),"subjects",flush=True)
if __name__=="__main__":main()
