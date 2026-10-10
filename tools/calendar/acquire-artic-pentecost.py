#!/usr/bin/env python3
"""Direct Chicago Museum official CC0 painting acquisition for Pentecost gap."""
import hashlib,io,json,re,time,urllib.parse
from pathlib import Path
from urllib.request import Request,urlopen
from PIL import Image,ImageOps
import numpy as np
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"artifacts/sacred-art-cma-gaps"
IMAGES=OUT/"artic-originals"
API="https://api.artic.edu/api/v1/artworks/"
USER_AGENT="AdOrientem/1.0 ArtResearch"
def load(url,max_bytes=24_000_000):
  if not url.startswith("https://"):raise ValueError("Non-HTTPS URL")
  request=Request(url,headers={"User-Agent":USER_AGENT,"Accept":"image/jpeg,application/json,*/*"})
  with urlopen(request,timeout=40) as r:
    return r.read(max_bytes+1)
def main():
  IMAGES.mkdir(parents=True,exist_ok=True)
  url=API+"search?"+urllib.parse.urlencode({"q":"Pentecost","limit":"35","fields":"id,title,artist_title,is_public_domain,image_id,artwork_type_title,date_display"})
  j=json.loads(load(url,3_000_000))
  matches=j.get("data") or []
  results=[]
  for item in matches:
    if len([x for x in results if x["status"]=="ORIGINAL_ACQUIRED"])>=4:break
    if "pentecost" not in (item.get("title") or "").lower():continue
    if item.get("is_public_domain") is not True or item.get("artwork_type_title")!="Painting":continue
    ident=item.get("image_id") or ""
    if not re.fullmatch(r"[a-z0-9-]{36}",ident):continue
    art_id="artic-"+str(item["id"])
    source_url="https://www.artic.edu/artworks/"+str(item["id"])
    image_url="https://www.artic.edu/iiif/2/"+ident+"/full/3000,/0/default.jpg"
    rec={"id":art_id,"title":item["title"],"creator":item.get("artist_title"),
        "date":item.get("date_display"),"prayerKey":"rosary.glo3",
        "objectUrl":source_url,"imageUrl":image_url,"isPublicDomain":True,
        "status":"DOWNLOAD_FAILED","curatorialApproval":False}
    try:
      raw=load(image_url)
      if len(raw)>24_000_000:raise ValueError("Source exceeds size limit")
      with Image.open(io.BytesIO(raw)) as im:
        im.load();im=ImageOps.exif_transpose(im)
        w,h=im.size
        if max(w,h)<2500:raise ValueError("Too small")
        im=im.convert("RGB");im.thumbnail((220,220))
        p=np.asarray(im,dtype=np.int16)
        colour=float(np.mean((np.max(p,axis=2)-np.min(p,axis=2))>18))
        if colour<.07: raise ValueError("Nearly monochrome")
      fname=art_id+".jpg"
      (IMAGES/fname).write_bytes(raw)
      rec.update(width=w,height=h,colourFraction=round(colour,4),bytes=len(raw),
        filename="artic-originals/"+fname,sha256=hashlib.sha256(raw).hexdigest(),
        status="ORIGINAL_ACQUIRED")
    except Exception as exc:rec["reason"]=str(exc)
    results.append(rec)
    print(art_id,rec["status"],rec.get("reason",""),flush=True)
    time.sleep(1.0)
  (OUT/"artic-pentecost-acquisition.json").write_text(json.dumps({
    "museum":"Art Institute of Chicago","schema":"AO_PENTECOST_ARTIC_GAP_V1",
    "warning":"Source/technical screening only, no artistic/phone crop approval",
    "works":results},indent=2)+"\n")
  if not [a for a in results if a["status"]=="ORIGINAL_ACQUIRED"]:
    print("ArtIC original painting not acquired. See source results; do not claim coverage.")
if __name__=="__main__":main()
