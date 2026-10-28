#!/usr/bin/env python3
"""Second native-source acquisition pass, one pinned Commons work per worker.

Each job fetches only one exact Commons original (six workers in parallel).
HTTP 429 is backoff/retried; failed fetches remain HOLD with metadata, not
silent approval. Original bytes are never edited, cropped or upscaled.
"""
import sys,hashlib,json,time,urllib.request,urllib.error,urllib.parse
from pathlib import Path
from io import BytesIO
from PIL import Image, ImageOps, ImageDraw
BASE=Path(__file__).resolve().parents[2]
OUT=BASE/"assets/staged/prayer-art-bulk-acquisition-b2b-20261028"
CASES={
 "reni-michael":("Cappouccini, guido reni, san michele arcangelo 02.JPG","Guido Reni","Archangel Michael Defeating Satan",[2112,2816],"Pietro? no; verify exact original Santa Maria della Concezione"),
 "tiepolo-station12":("Chiesa di San Polo (Venice) - VIA CRUCIS XII - Jesus dies on the cross.jpg","Giandomenico Tiepolo","San Polo Station XII",[3277,4316],"Exact San Polo Station XII; no substitutions"),
 "tiepolo-prado-descent":("Giovanni Domenico Tiepolo - El Descendimiento.jpg","Giandomenico Tiepolo","The Descent from the Cross — Prado P000361",[2705,2362],"Museo del Prado Passion series, 1772"),
 "teniers-agony-antwerp":("David Teniers the Elder - The Agony in the Garden.jpg","David Teniers the Elder","Agony in the Garden — Antwerp Rosary cycle",[1333,1799],"Exact St Paul's Antwerp 1615–1620 panel"),
 "paired-hearts-lopez":("Sagrados corazones de Jesús y María (Sacred Hearts of Jesus and Mary), workshop of Vicente López Portaña.jpg","Workshop of Vicente López Portaña","Sacred Hearts of Jesus and Mary",[1725,2560],"Check Commons inconsistent generic artwork title metadata"),
 "vandyck-holy-spirit":("Dyck, Anthonis van - Pouring of the Holy Ghost - Bildergalerie Sanssouci.jpeg","Anthony van Dyck","Outpouring of the Holy Spirit — Sanssouci",[6064,7368],"Full work, PD-Art Commons / Google Arts & Culture")
}
if len(sys.argv)!=2 or sys.argv[1] not in CASES:
 raise SystemExit("Expected one of "+", ".join(CASES))
key=sys.argv[1]
file,artist,title,px,note=CASES[key]
target=OUT/key;target.mkdir(parents=True,exist_ok=True)
md=hashlib.md5(file.replace(" ","_").encode("utf-8")).hexdigest()
src="https://upload.wikimedia.org/wikipedia/commons/"+md[0]+"/"+md[:2]+"/"+urllib.parse.quote(file.replace(" ","_"),safe="()/,")
page="https://commons.wikimedia.org/wiki/File:"+urllib.parse.quote(file.replace(" ","_"),safe="()/,")
r={"id":key,"artwork":title,"artist":artist,"source_filename":file,
 "source_page":page,"original_url":src,"expected_pixels_web_reference":px,
 "image_source_reuse_rights":"HOLD_FILE_SPECIFIC_REVIEW",
 "original_artwork_identity":"EXACT_NAMED_REFERENCE_NOT_FINAL_VISUAL_CERTIFICATION",
 "status":"SOURCE_RETRIEVAL_NOT_STARTED","attempts":[],"native_archive":None,
 "pristine_publication_approved":False,"production_release":False,"cost_eur":0,
 "notes":note}
raw=None
urls=[src, "https://commons.wikimedia.org/wiki/Special:Redirect/file/"+urllib.parse.quote(file.replace(" ","_"),safe="()/,")]
for url in urls:
 for delay in (0,9,24,49):
  if delay:time.sleep(delay)
  try:
   req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 (compatible; AdOrientemBot/1.0; research-only exact work validation)","Accept":"image/jpeg,image/png,*/*","Referer":"https://commons.wikimedia.org/"})
   with urllib.request.urlopen(req,timeout=50) as response:
    blob=response.read(14000001)
   if len(blob)>14000000:raise ValueError("EXCEEDS_14MB_STORAGE_CAP")
   with Image.open(BytesIO(blob)) as test:
    test.load()
    if test.format!="JPEG":raise ValueError("unexpected source format: "+str(test.format))
    if list(test.size)!=px:raise ValueError("SOURCE_PIXELS_CHANGED: "+str(test.size))
   raw=blob
   r["attempts"].append({"result":"success","source":url})
   break
  except Exception as exc:
   r["attempts"].append({"result":"failed","source":url,"reason":str(exc)[:200]})
 if raw is not None:break
if raw is not None:
 p=target/(key+"-native.jpg")
 p.write_bytes(raw)
 img=Image.open(BytesIO(raw));img.load()
 r["native_archive"]={"path":str(p.relative_to(BASE)),"sha256":hashlib.sha256(raw).hexdigest(),
 "pixels":list(img.size),"bytes":len(raw),"source_original_unchanged":True}
 r["status"]="ARCHIVED_SOURCE_EXACT_FILENAME_QUALITY_PENDING"
 # One whole image and 4 UNRESIZED source native 170px corner sections for visual triage.
 canvas=Image.new("RGB",(1180,340),(18,22,27));d=ImageDraw.Draw(canvas)
 d.text((15,12),key+" | EXACT COMMONS ORIGINAL / PHOTO RIGHTS & PRISTINE STILL HOLD",fill=(243,222,190))
 orig=ImageOps.exif_transpose(img).convert("RGB")
 whole=orig.copy();whole.thumbnail((230,285),Image.Resampling.LANCZOS)
 canvas.paste(whole,(8+(230-whole.width)//2,40+(285-whole.height)//2))
 side=min(190,orig.width,orig.height)
 for i,(xx,yy) in enumerate([(0,0),(orig.width-side,0),(0,orig.height-side),(orig.width-side,orig.height-side)]):
  tile=orig.crop((xx,yy,xx+side,yy+side))
  canvas.paste(tile,(260+i*225,59))
  d.text((260+i*225,260),["TL native","TR native","BL native","BR native"][i],fill=(219,204,182))
 snap=target/(key+"-native-review.jpg");canvas.save(snap,"JPEG",quality=90,optimize=True)
 r["inspection_sheet"]={"path":str(snap.relative_to(BASE)),"sha256":hashlib.sha256(snap.read_bytes()).hexdigest()}
else:r["status"]="RETRY_EXHAUSTED_UPSTREAM_RATE_LIMIT_OR_SOURCE_ERROR"
(target/"source-result.json").write_text(json.dumps(r,indent=2,ensure_ascii=False)+"\n")
print(json.dumps({"id":key,"status":r["status"],"retry_attempts":len(r["attempts"]),"native_archive":r["native_archive"]},indent=2))
