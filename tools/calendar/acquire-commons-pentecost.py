#!/usr/bin/env python3
"""Research-only download for Wikimedia Commons PD-Art museum-grade Pentecost works.

PD-Art/Public Domain Mark != CC0 licence. Publication approval stays blocked
until rights review, source provenance, artwork merit and crop review.
"""
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.error import HTTPError,URLError
from urllib.parse import quote
import hashlib,io,json,time
from PIL import Image,ImageOps,ImageDraw
import numpy as np

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"artifacts/sacred-art-pentecost-commons"
IMAGES=OUT/"originals"
FILES=[
 dict(id="commons-multscher-pentecost", title="The Descent of the Holy Spirit (Pentecost)",
      artist="Hans Multscher", date="1437", width=4000,height=4325,
      page="https://commons.wikimedia.org/wiki/File:Hans_Multscher_-_Au%C3%9Fenfl%C3%BCgel_des_Wurzacher_Altars_(links_unten)_-_Google_Art_Project.jpg",
      url="https://upload.wikimedia.org/wikipedia/commons/d/d1/Hans_Multscher_-_Au%C3%9Fenfl%C3%BCgel_des_Wurzacher_Altars_%28links_unten%29_-_Google_Art_Project.jpg",
      sha1="48475a65731a8f0ced018c098a7d4b82d07fa234",
      rights="PUBLIC_DOMAIN_PD_ART_PDM",origin="Google Art Project / Gemäldegalerie Berlin"),
 dict(id="commons-debray-pentecost",title="Pentecost",artist="Salomon de Bray",date="1654",
      width=4000,height=2907,
      page="https://commons.wikimedia.org/wiki/File:Pentecost,_by_Salomon_de_Bray_(1597-1664).jpg",
      url="https://upload.wikimedia.org/wikipedia/commons/1/16/Pentecost%2C_by_Salomon_de_Bray_%281597-1664%29.jpg",
      sha1="e30d9b06e54c15461144c4186915ff5322120b51",
      rights="PUBLIC_DOMAIN_PD_ART_PDM",origin="Sotheby's professional 2D reproduction"),
 dict(id="commons-baroncelli-pentecost",title="Pentecost",artist="Master of the Baroncelli Portraits",date="c. 1490",
      width=3000,height=2581,
      page="https://commons.wikimedia.org/wiki/File:Master_of_the_Baroncelli_Portraits_-_Pentecost.jpg",
      url="https://upload.wikimedia.org/wikipedia/commons/3/35/Master_of_the_Baroncelli_Portraits_-_Pentecost.jpg",
      sha1="5afe36b79ccd46f5ad2f70b1d46836ad9c41fc53",
      rights="PUBLIC_DOMAIN_PD_ART_PDM",origin="Sotheby's professional 2D reproduction")
]
def get(url):
 last=""
 for trial in range(4):
  try:
   with urlopen(Request(url,headers={"User-Agent":"AdOrientemResearch/1.0 (sacred-art coverage; low rate)","Accept":"image/jpeg,*/*"}),timeout=40) as res:
    if res.headers.get("Content-Length") and int(res.headers["Content-Length"])>30_000_000: raise ValueError("Content too large")
    body=res.read(30_000_001)
    if len(body)>30_000_000:raise ValueError("Image >30MB")
    return body
  except (HTTPError,URLError,TimeoutError,OSError) as e:
   last=str(e)
   if isinstance(e,HTTPError) and e.code not in (403,429,500,502,503,504):break
   time.sleep(min(3*(trial+1),12))
 raise RuntimeError(last)
def main():
 IMAGES.mkdir(parents=True,exist_ok=True)
 rows=[]
 for item in FILES:
  row={**item, "status":"NOT_ACQUIRED","artisticReview":"PENDING","rightsReview":"PD_ART_GLOBAL_REUSE_PENDING","cropReview":"PENDING"}
  try:
   raw=get(item["url"])
   sha1=hashlib.sha1(raw).hexdigest()
   if sha1!=item["sha1"]:raise ValueError("Commons posted SHA1 does not match downloaded original")
   with Image.open(io.BytesIO(raw)) as photo:
    photo.load()
    im=ImageOps.exif_transpose(photo)
    w,h=im.size
    if (w,h)!=(item["width"],item["height"]):raise ValueError("Wrong dimensions")
    test=im.convert("RGB");test.thumbnail((240,240))
    pixels=np.asarray(test,dtype=np.int16)
    colourFraction=float(np.mean((np.max(pixels,axis=2)-np.min(pixels,axis=2))>18))
    if colourFraction<.07:raise ValueError("Near-monochrome image")
   fname=item["id"]+".jpg"
   (IMAGES/fname).write_bytes(raw)
   row.update(status="ORIGINAL_ACQUIRED",file="originals/"+fname,sha256=hashlib.sha256(raw).hexdigest(),
        bytes=len(raw),colorFraction=round(colourFraction,4))
  except Exception as exc:row["error"]=str(exc)
  rows.append(row)
  print(row["id"],row["status"],row.get("error",""),flush=True)
  time.sleep(2)
 done=[x for x in rows if x["status"]=="ORIGINAL_ACQUIRED"]
 if done:
  sheet=Image.new("RGB",(1600,800),(241,237,230));draw=ImageDraw.Draw(sheet)
  for i,row in enumerate(done):
   with Image.open(IMAGES/(row["id"]+".jpg")) as orig:
    pic=ImageOps.exif_transpose(orig).convert("RGB");pic.thumbnail((505,700),Image.Resampling.LANCZOS)
    x=i*533+(533-pic.width)//2
    sheet.paste(pic,(x,10+(690-pic.height)//2))
   draw.text((i*533+12,715),row["artist"][:46],fill=(20,20,20))
   draw.text((i*533+12,741),row["title"][:55],fill=(20,20,20))
  sheet.save(OUT/"pentecost-contact.jpg",quality=91,optimize=True)
 (OUT/"pentecost-commons-report.json").write_text(json.dumps({
  "schema":"AO_COMMONS_PENTECOST_RESEARCH_V1",
  "rightsWarning":"Commons PD-Art and Public Domain Mark, not CC0. Global photo/neighboring rights must be checked before mobile-app publication.",
  "rows":rows},indent=2)+"\n")
 print("PENTECOST verified original files:",len(done),"/",len(FILES))
 if not done:raise SystemExit("No authentic original acquired; report source blockers")
if __name__=="__main__": main()
