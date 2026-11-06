#!/usr/bin/env python3
"""Phase 29: read-only Paris Musées CC0 object-image inspection.

Only two already handpicked art objects, two official museum IIIF endpoints.
Never substitute images, infer a licence beyond exact source metadata, or publish.
"""
import csv,hashlib,html,io,json,math,sys
from pathlib import Path
from urllib.parse import urlparse,urljoin
import requests
from PIL import Image,ImageOps
from audit_images import commons_preview,HEADERS

ROOT=Path(__file__).resolve().parent
OUT=Path("artifacts/sacred-art-phase29-paris-iiif")
TARGETS=[
 {"registry_id":"RECENT575::184","inventory":"PPP3770",
  "object_url":"https://parismuseescollections.paris.fr/fr/petit-palais/oeuvres/la-mort-de-la-vierge-0",
  "manifest":"https://apicollections.parismusees.paris.fr/iiif/160007869/manifest",
  "page_rights":"CC0 indicated on official object page"},
 {"registry_id":"RECENT575::279","inventory":"PPP4856",
  "object_url":"https://parismuseescollections.paris.fr/fr/petit-palais/oeuvres/le-retour-de-l-enfant-prodigue",
  "manifest":"https://apicollections.parismusees.paris.fr/iiif/160008208/manifest",
  "page_rights":"CC0 indicated on official object page"},
]
VALID_HOSTS={"apicollections.parismusees.paris.fr","parismuseescollections.paris.fr",
             "www.parismuseescollections.paris.fr"}
def allowed_url(url):
 p=urlparse(url)
 return p.scheme=="https" and (p.hostname in VALID_HOSTS or
     p.hostname.endswith(".parismusees.paris.fr") or
     p.hostname.endswith(".parismuseescollections.paris.fr"))
def bounded(s,url,accept,max_bytes=16_000_000):
 target=url
 for _ in range(4):
  if not allowed_url(target):raise ValueError("Unallowlisted museum host: "+str(urlparse(target).hostname))
  with s.get(target,headers={"Accept":accept},timeout=(8,35),stream=True,allow_redirects=False) as res:
   if res.status_code in (301,302,303,307,308):
    target=urljoin(target,res.headers["Location"]);continue
   res.raise_for_status()
   pieces=[];n=0
   for p in res.iter_content(65536):
    n+=len(p)
    if n>max_bytes:raise ValueError("Response > allowed byte limit")
    pieces.append(p)
   return b"".join(pieces),res.headers.get("Content-Type",""),target
 raise ValueError("Excessive redirects")
def all_canvases(doc):
 records=[]
 def add_canvas(i,label,body):
  bs=body if isinstance(body,list) else [body]
  for b in bs:
   if not isinstance(b,dict):continue
   svc=b.get("service") or []
   if isinstance(svc,dict):svc=[svc]
   for x in svc:
    if not isinstance(x,dict):continue
    uri=x.get("id") or x.get("@id")
    if uri:records.append({"canvas":i,"label":label,"service":uri,"width":b.get("width"),"height":b.get("height")})
 if "sequences" in doc:
  for i,c in enumerate((doc.get("sequences") or [{}])[0].get("canvases",[])[:12]):
   for a in (c.get("images") or [])[:2]:
    add_canvas(i,str(c.get("label","")),(a.get("resource") or {}))
 elif "items" in doc:
  for i,c in enumerate((doc.get("items") or [])[:12]):
   label=c.get("label")
   for page in (c.get("items") or [])[:2]:
    for a in (page.get("items") or [])[:2]:
     add_canvas(i,json.dumps(label,ensure_ascii=False)[:150],a.get("body") or {})
 return records[:15]
def main():
 rows=list(csv.DictReader((ROOT/"artworks_177.csv").open(encoding="utf-8-sig",newline="")))
 source={x["registry_id"]:x for x in rows}
 OUT.mkdir(parents=True,exist_ok=True)
 results=[]
 for target in TARGETS:
  rid=target["registry_id"];key=rid.replace(":","_")
  row=source[rid]
  item={**target,"selected_title":row["title"],"selected_commons_url":row["commons_url"],
    "selected_original_short_px":row["original_short_px"],"manifest_status":"FAILED",
    "iiif_declared_rights":"","canvases":0,"image_downloads":0,"reference_download":"FAILED",
    "official_object_page_cc0":True,"photograph_rights_approved":False,"photo_quality_approved":False,
    "gallery_replacement_approved":False,"candidates":[],"errors":[]}
  session=requests.Session();session.headers.update(HEADERS)
  try:
   blob,typ,final=bounded(session,target["manifest"],"application/json",5_000_000)
   doc=json.loads(blob)
   item["manifest_status"]="SUCCESS"
   item["manifest_final_url"]=final
   item["iiif_declared_rights"]=doc.get("rights") or doc.get("license") or ""
   candidates=all_canvases(doc)
   item["canvases"]=len(candidates)
   for c in candidates:
    result=dict(c,status="FAILED",file="",sha256="",pixels="",error="")
    try:
     if not allowed_url(c["service"]):raise ValueError("Service not on Paris Musées domain")
     dest=OUT/"images"/(key+f"_canvas{c['canvas']}.jpg")
     url=c["service"].rstrip("/")+"/full/1600,/0/default.jpg"
     raw,ctype,final=bounded(session,url,"image/jpeg,image/*",15_000_000)
     if "image" not in ctype.lower():raise ValueError("Image endpoint returned "+str(ctype))
     with Image.open(io.BytesIO(raw)) as im:
      im.verify()
     dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(raw)
     with Image.open(dest) as im:
      result.update(status="DOWNLOADED",file=str(dest.relative_to(OUT)),sha256=hashlib.sha256(raw).hexdigest(),
       pixels=f"{im.width}x{im.height}",short_px=min(im.width,im.height),format=im.format,
       byte_count=len(raw),download_url=final)
     item["image_downloads"]+=1
    except Exception as e:result["error"]=str(e)[:220]
    item["candidates"].append(result)
  except Exception as e:item["errors"].append("MANIFEST:"+str(e)[:220])
  try:
   selected=OUT/"images"/(key+"_selected_commons.jpg")
   meta=commons_preview(session,row["commons_url"],selected)
   item["reference_download"]="SUCCESS"
   item["reference_pixels"]=f'{meta["pixels_width"]}x{meta["pixels_height"]}'
   item["reference_sha256"]=meta["sha256"]
  except Exception as e:item["errors"].append("SELECTED_REFERENCE:"+str(e)[:200])
  print(json.dumps({k:item[k] for k in ("registry_id","manifest_status","canvases","image_downloads","reference_download","iiif_declared_rights")}),flush=True)
  results.append(item)
 (OUT/"paris_two_artworks.json").write_text(json.dumps(results,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
 cols=["registry_id","selected_title","inventory","object_url","manifest","manifest_status","iiif_declared_rights",
       "canvases","image_downloads","reference_download","official_object_page_cc0","photograph_rights_approved",
       "photo_quality_approved","gallery_replacement_approved"]
 with (OUT/"paris_two_artworks.csv").open("w",encoding="utf-8",newline="") as fh:
  wr=csv.DictWriter(fh,fieldnames=cols);wr.writeheader();wr.writerows([{k:r.get(k,"") for k in cols} for r in results])
 blocks=[]
 for item in results:
  key=item["registry_id"].replace(":","_")
  sel=OUT/"images"/(key+"_selected_commons.jpg")
  l="<img src='images/"+sel.name+"'>" if sel.exists() else "<p>Handpicked selected file not available</p>"
  right="".join("<figure><img src='"+html.escape(c["file"])+"'><figcaption>Canvas "+str(c["canvas"])+
     " · "+html.escape(c["pixels"])+"</figcaption></figure>" for c in item["candidates"] if c.get("file"))
  blocks.append("<article><h2>"+html.escape(item["selected_title"])+"</h2><p>Exact image rights and photographic fidelity are NOT publication approved.</p><div>"+l+"<section>"+right+"</section></div></article>")
 css="body{font:16px system-ui;background:#f1f2f4;color:#233;margin:20px}article{background:white;border-radius:12px;padding:20px;margin:20px auto;max-width:1300px}article>div{display:grid;grid-template-columns:1fr 2fr;gap:14px}section{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}img{width:100%;max-height:600px;object-fit:contain}figcaption{font-size:12px}@media(max-width:800px){article>div,section{grid-template-columns:1fr}}"
 (OUT/"paris_museums_photo_comparisons.html").write_text("<!doctype html><html><meta charset='utf-8'><style>"+css+"</style><h1>Ad Orientem — Paris Musées official IIIF evidence, research only</h1>"+"".join(blocks)+"</html>",encoding="utf-8")
 summary={"objects":2,"manifests_success":sum(x["manifest_status"]=="SUCCESS" for x in results),
   "museum_iiif_photographs":sum(x["image_downloads"] for x in results),
   "handpicked_reference_images":sum(x["reference_download"]=="SUCCESS" for x in results),
   "object_pages_mark_cc0":2,"specific_photos_reuse_cleared":0,"gallery_replacements":0}
 (OUT/"summary.json").write_text(json.dumps(summary,indent=2)+"\n",encoding="utf-8")
 print(json.dumps(summary,indent=2),flush=True)
if __name__=="__main__":main()
