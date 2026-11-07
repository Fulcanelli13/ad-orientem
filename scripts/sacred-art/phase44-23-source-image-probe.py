#!/usr/bin/env python3
"""Phase 44: one research-only source and photo probe for 23 handpicked art rows.

Four official IIIF manifests and 19 low-resolution selected photos.
Never modify handpicked images, application content, Calendar/Prayer pairings.
A web page image is a candidate only. No image, licence or fidelity auto-approval.
"""
from __future__ import annotations
import concurrent.futures,csv,io,json,re,hashlib,html,urllib.parse
from pathlib import Path
from urllib.parse import urlsplit,urljoin,unquote
from collections import Counter
import requests
from bs4 import BeautifulSoup
from PIL import Image,ImageOps

OUT=Path("artifacts/sacred-art-phase44-23"); OUT.mkdir(parents=True,exist_ok=True)
PREVIEWS=OUT/"previews";PREVIEWS.mkdir(parents=True,exist_ok=True)
SRC=Path("scripts/sacred-art/artworks_177.csv")
UA={"User-Agent":"AdOrientemArtResearch/1.0 (museum art research; no image publication)",
    "Accept":"text/html,application/json,image/jpeg,*/*;q=.5"}
IDS=["014","051","092","179","184","279","330","369","392","394","407","409",
     "410","418","425","430","433","450","484","486","487","506","518"]
IIIF={
 "051":"https://imagehub.mskgent.be/iiif/3/7534/manifest.json",
 "179":"https://dam.museabrugge.be/iiif/3/428/manifest.json",
 "184":"https://apicollections.parismusees.paris.fr/iiif/160007869/manifest",
 "279":"https://apicollections.parismusees.paris.fr/iiif/160008208/manifest"}
OFFICIAL={
 "014":"https://collections.augustins.toulouse.fr/fr/notice/2004-1-218-les-ames-du-purgatoire-b35ce3cd-498e-4a7f-a4d9-4ed873b8270f",
 "092":"https://data.toulouse-metropole.fr/explore/dataset/inventaire-collections-augustins/",
 "330":"https://collections-mba.nancy.fr/fr/notice/87-8-1-noli-me-tangere-d160a26e-e6b6-4894-9ad5-6f589ef48b86",
 "369":"https://www.musees.strasbourg.eu/documents/d/musees/dp-musee-des-beaux-arts",
 "392":"https://pop.culture.gouv.fr/notice/joconde/000PE016876",
 "394":"https://pop.culture.gouv.fr/notice/joconde/000PE016868",
 "407":"https://pop.culture.gouv.fr/notice/joconde/000PE016989",
 "409":"https://pba-opacweb.lille.fr/fr/notice/p-867-saint-nicolas-sauvant-les-captifs-ou-saint-nicolas-arretant-le-bras-d-un-bourreau-pret-a-trancher-la-tete-d-un-captif-1b79ab0a-00a9-4f74-a781-c83503609da1",
 "410":"https://pba-opacweb.lille.fr/fr/notice/p-190-salomon-et-la-reine-de-saba-4842637b-ee19-4333-9a02-b5b811b18713",
 "418":"https://pop.culture.gouv.fr/notice/joconde/01370006162",
 "425":"https://pop.culture.gouv.fr/notice/joconde/01370005058",
 "430":"https://agorha.inha.fr/recherche?affichage=mosaic&facets=&fieldSort=&filters=&noticeType=ARTWORK&page=1&pageSize=20&selectionId=&sort=&terms=notice_liee%3A+%22dae79003-5a3f-4293-bcd8-315a6617a5bc%22&type=simple&withAttachment=false",
 "433":"https://pop.culture.gouv.fr/notice/joconde/01370002582",
 "450":"https://www.museefabre.fr/recherche/musee%3AMUS_BIEN%3A2813",
 "484":"https://www.musee-conde.fr/fr/notice/pe-87-le-portement-de-croix-c9d98307-e681-4f1f-8dbf-10186fedae67",
 "486":"https://pop.culture.gouv.fr/notice/joconde/000PE018771",
 "487":"https://www.musee-conde.fr/fr/notice/pe-303-l-annonciation-b7fea9a4-ce2f-4fb5-ba98-e31727145b94",
 "506":"https://www.museedegrenoble.fr/oeuvre/155/1922-jesus-parmi-les-docteurs.htm",
 "518":"https://www.museedegrenoble.fr/oeuvre/118/1922-le-christ-a-emmaus.htm"}
assert len(IDS)==23 and len(set(IDS))==23 and len(OFFICIAL)==19
SAFE_HOSTS=("augustins.toulouse.fr","toulouse-metropole.fr","nancy.fr","strasbourg.eu",
 "culture.gouv.fr","lille.fr","inha.fr","museefabre.fr","musee-conde.fr","museedegrenoble.fr",
 "mskgent.be","museabrugge.be","parismusees.paris.fr","wikimedia.org","wikimedia.net",
 "upload.wikimedia.org","rmngp.fr","art.rmngp.fr","museesdefrance.org","c2rmf.fr")
def safe(url):
 p=urlsplit(url)
 host=(p.hostname or "").lower()
 return p.scheme=="https" and any(host==x or host.endswith("."+x) for x in SAFE_HOSTS)
def bounded(url,limit=7_500_000):
 if not safe(url):raise ValueError("Unapproved external hostname "+str(url)[:110])
 with requests.get(url,headers=UA,timeout=(7,25),stream=True,allow_redirects=True) as r:
  if not safe(r.url):raise ValueError("Unexpected redirect to external hostname")
  r.raise_for_status()
  parts=[];total=0
  for part in r.iter_content(32768):
   total+=len(part)
   if total>limit:raise ValueError("Response exceeds bounded limit")
   parts.append(part)
  return b"".join(parts),r.url,r.headers.get("Content-Type","")
def get_json(url):
 b,_,_=bounded(url,3_000_000);return json.loads(b)
def image_probe(url,tag):
 result={"url":url,"bytes":0,"width":None,"height":None,"sha256":None,"status":"NOT_FETCHED"}
 if not url or not safe(url):return result
 try:
  b,real,ct=bounded(url,8_500_000)
  if "image" not in ct.lower() and not b.startswith((b'\xff\xd8',b'\x89PNG')):
   raise ValueError("Not image MIME")
  im=Image.open(io.BytesIO(b));im.verify()
  im=Image.open(io.BytesIO(b))
  result.update(url=real,bytes=len(b),width=im.width,height=im.height,
   sha256=hashlib.sha256(b).hexdigest(),status="FETCHED_RESEARCH_ONLY")
  # Keep research-size preview, no published image or color modification.
  im=ImageOps.exif_transpose(im).convert("RGB")
  im.thumbnail((1200,1200))
  im.save(PREVIEWS/(tag+".jpg"),quality=83)
 except Exception as ex:
  result["status"]="FETCH_FAILED";result["error"]=str(ex)[:180]
 return result
def iiif_probe(url,tag):
 out={"manifest":url,"manifest_status":"NOT_FETCHED","canvas_count":0,
      "candidate_photo":"NOT_SELECTED","canvas_rights":[],"image":None}
 try:
  m=get_json(url)
  canvases=m.get("items") or (m.get("sequences") or [{}])[0].get("canvases") or []
  out["canvas_count"]=len(canvases)
  c=canvases[0]
  body=(c.get("images") or [{}])[0].get("resource") if c.get("images") else (
       (c.get("items") or [{}])[0].get("items") or [{}])[0].get("body") or {}
  if isinstance(body,list):body=body[0]
  meta=[]
  for v in (c.get("metadata") or []):
   if isinstance(v,dict):meta.append([str(v.get("label","")),str(v.get("value",""))[:700]])
  rights=[str(m.get(k)) for k in ("rights","license") if m.get(k)]
  rights.extend(str(body.get(k)) for k in ("rights","license") if body.get(k))
  rights.extend(x[1] for x in meta if x[0].lower() in ("droits","copyright","rights","license"))
  out["canvas_rights"]=rights
  out["canvas_metadata"]=meta[:18]
  service=body.get("service") or []
  if isinstance(service,dict):service=[service]
  sid=next((s.get("id") or s.get("@id") for s in service if isinstance(s,dict)),None)
  direct=body.get("id") or body.get("@id")
  if sid and safe(sid):
   image_url=sid.rstrip("/")+"/full/1400,/0/default.jpg"
  else:image_url=direct
  out["source_image_url"]=image_url
  out["canvas_native_px"]=[c.get("width"),c.get("height")]
  out["manifest_status"]="FETCHED"
  out["image"]=image_probe(image_url,tag+"_museum") if image_url else None
 except Exception as ex:
  out["manifest_status"]="FAILED";out["error"]=str(ex)[:190]
 return out
def official_page(url,tag):
 out={"url":url,"status":"NOT_FETCHED","image_candidates":[],"rights_review":"UNASSESSED"}
 try:
  b,final,ct=bounded(url,3_500_000)
  out["status"]="FETCHED";out["final_url"]=final;out["content_type"]=ct
  if ct.lower().startswith("application/pdf") or b.startswith(b"%PDF"):
   out["status"]="PDF_ONLY_NO_IMAGE_EXTRACTION";return out
  if ct.lower().startswith("application/json"):
   obj=json.loads(b)
   s=json.dumps(obj,ensure_ascii=False)
  else:
   s=b.decode("utf8","replace")
  out["text_size"]=len(s)
  out["mentions_rights_reserved"]=bool(re.search(r"rights? reserved|droits r.serv.s|copyright|©",s,re.I))
  candidates=[]
  if "<html" in s.lower() or "<meta" in s.lower():
   soup=BeautifulSoup(s,"html.parser")
   for prop in ("og:image","twitter:image","og:image:secure_url"):
    for item in soup.select('meta[property="'+prop+'"],meta[name="'+prop+'"]')[:2]:
     u=item.get("content","").strip()
     if u:candidates.append((prop,urljoin(final,u)))
   for img in soup.find_all("img",src=True)[:25]:
    u=urljoin(final,img["src"])
    if any(k in u.lower() for k in ("oeuvre","artwork","image","collection","media","visuel","photo")):
     candidates.append(("html_img",u))
   for link in re.findall(r'https://[^"\'\s<>\\]{20,260}\.(?:jpg|jpeg|webp|png)(?:\?[^"\'\s<>\\]*)?',s,re.I)[:15]:
    candidates.append(("embedded_image",link))
  else:
   for link in re.findall(r'https://[^"\s<>\\]{20,260}\.(?:jpg|jpeg|webp|png)(?:\?[^"\s<>\\]*)?',s,re.I)[:15]:
    candidates.append(("json_image",link))
  seen=set()
  for source,u in candidates:
   if u in seen or not safe(u):continue
   seen.add(u)
   out["image_candidates"].append({"locator":source,"url":u})
   if len(out["image_candidates"])==12:break
  # Test first 3 candidates only; a generic cover image does not prove artwork identity.
  for i,item in enumerate(out["image_candidates"][:3]):
   item["probe"]=image_probe(item["url"],tag+"_official"+str(i))
  out["best_probe_index"]=max(range(min(3,len(out["image_candidates"]))),
        key=lambda k: (out["image_candidates"][k].get("probe") or {}).get("width") or 0,
        default=None)
 except Exception as ex:
  out["status"]="FAILED";out["error"]=str(ex)[:220]
 return out
def main():
 with SRC.open(encoding="utf-8-sig",newline="") as f:rows={r["registry_id"].split("::")[1]:r for r in csv.DictReader(f)}
 assert len(rows)==177 and all(x in rows for x in IDS)
 results=[]
 def task(id):
  row=rows[id]
  out={"registry_id":row["registry_id"],"title":row["title"],"artist":row["artist"],
    "museum":row["museum"],"selected_commons":row["commons_url"],
    "selected_original_short_px":int(row["original_short_px"]),"group":"P0_MAPPED_IIIF" if id in IIIF else "P1_LOW_RES",
    "identity_gate":"SUPPORTED_PHASE40","image_rights_gate":"NOT_CLEARED","replacement_approved":False,
    "publication_changed":False}
  if id in IIIF:out["official"]=iiif_probe(IIIF[id],id)
  else:out["official"]=official_page(OFFICIAL[id],id)
  return out
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
  results=list(ex.map(task,IDS))
 summary={"records":23,"p0":4,"p1":19,
   "manifest_fetched":sum(x["group"]=="P0_MAPPED_IIIF" and x["official"]["manifest_status"]=="FETCHED" for x in results),
   "official_pages_fetched":sum(x["group"]=="P1_LOW_RES" and x["official"]["status"]=="FETCHED" for x in results),
   "pdf_pages":sum(x["official"]["status"]=="PDF_ONLY_NO_IMAGE_EXTRACTION" for x in results if x["group"]=="P1_LOW_RES"),
   "official_photo_preview_downloads":sum(
     ((x["official"].get("image") or {}).get("status")=="FETCHED_RESEARCH_ONLY") if x["group"]=="P0_MAPPED_IIIF" else
     sum((c.get("probe") or {}).get("status")=="FETCHED_RESEARCH_ONLY" for c in x["official"].get("image_candidates",[])[:3])
      for x in results),
   "selected_original_downloads":0,"geometric_identity_certifications":0,
   "rights_cleared":0,"replacements_approved":0,"gallery_changes":0,
   "note":"Official site preview metadata and images are unverified candidates until selected original pixel comparison. Open-data catalogue terms do not automatically clear photo rights."}
 (OUT/"evidence_23.json").write_text(json.dumps(results,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
 (OUT/"summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
 columns=["registry_id","title","museum","group","selected_original_short_px","official_source","source_status",
    "candidates","retrieved_previews","rights_gate","publication_approved"]
 with (OUT/"source_23.csv").open("w",encoding="utf8",newline="") as f:
  w=csv.DictWriter(f,fieldnames=columns);w.writeheader()
  for o in results:
   src=o["official"]
   prev=(int((src.get("image") or {}).get("status")=="FETCHED_RESEARCH_ONLY") if o["group"]=="P0_MAPPED_IIIF" else
         sum((c.get("probe") or {}).get("status")=="FETCHED_RESEARCH_ONLY" for c in src.get("image_candidates",[])[:3]))
   w.writerow({"registry_id":o["registry_id"],"title":o["title"],"museum":o["museum"],"group":o["group"],
    "selected_original_short_px":o["selected_original_short_px"],
    "official_source":src.get("manifest") or src.get("url"),
    "source_status":src.get("manifest_status") or src.get("status"),
    "candidates":len(src.get("image_candidates",[])),"retrieved_previews":prev,
    "rights_gate":o["image_rights_gate"],"publication_approved":False})
 print(json.dumps(summary,ensure_ascii=False,indent=2),flush=True)
if __name__=="__main__":main()
