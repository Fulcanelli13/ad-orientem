#!/usr/bin/env python3
"""Flemish Art Collection: acquire a bulk research-image pack from the COMPLETE
32,476-record LIDO catalogue, NOT the 894-manifest generic Imagehub.

Research ONLY. Public-domain/CC0 object-rights gates + museum IIIF metadata.
No final approval, app publication or rights claim for undocumented photographs.
"""
import argparse
import concurrent.futures
import hashlib
import io
import json
import re
import time
import unicodedata
import urllib.parse
import urllib.request
import zipfile
from collections import Counter
from pathlib import Path
from PIL import Image, ImageDraw

ALLOWED_HOSTS={"imagehub.mskgent.be","iiif.kmska.be","dam.museabrugge.be",
               "imagehub.vlaamsekunstcollectie.be"}
SUBJECT=re.compile(
 r"(?:\bheilige[nr]?\b|\bsint[- ]|\bsaint[- ]|\bsainte?\b|"
 r"\bchristus\b|\bchrist\b|\bjezus\b|\bjesus\b|\bmaria\b|"
 r"\bmadonna\b|\bheilige familie\b|\bengel(?:en)?\b|"
 r"\bapostel\b|\bmartel(?:dood|ing|aar)\b|"
 r"\bkruis(?:iging|afneming|draging|weg)?\b|"
 r"\bverrijzenis\b|\bopstanding\b|\bpi[eë]ta\b|"
 r"\baanbidding\b|\bherders\b|\bdriekoningen\b|"
 r"\btenhemelopneming\b|\bhemelvaart\b|\bdoopsel\b|"
 r"\bvoorstelling in de tempel\b|\bpresentatie van christus\b|"
 r"\bverkondiging\b|\bbezoeking\b|\bkroning van maria\b|"
 r"\bheilige drie[- ]eenheid\b|\brozenkrans\b|"
 r"\bengel gabri[eë]l\b|\buitdrijving\b|\bcalvarie\b|"
 r"\bretabel\b|\baltaarstuk\b|\bdominicus\b|\bfranciscus\b|"
 r"\bjozef met het\b|\bh[eë]ronymus\b|\bjeronimus\b)",re.I)
NEGATIVE=re.compile(
 r"(?:\bportret van\b|\bportrait of\b|\bstudie voor het portret\b|"
 r"\blandschap in\b|\bsint[- ][a-z-]+(?:kerk|kapel|abdij)\b|"
 r"\binterieur van\b|\bkerk in\b|\bstraat\b|\bbosgezicht\b|"
 r"\bvallei\b|\buitzicht op\b|\bheilige namen\b)",re.I)
# Put exact individual original identity, not interchangeable photos, first.
PREFERRED=re.compile(
 r"(?:de crayer|rubens|van dyck|jordaens|seghers|francken|"
 r"van den heuvel|coxie|van oost|theodoor|maerten de vos|"
 r"boeijermans|janssens|van balen)",re.I)
BANNED=re.compile(r"(?:\bfra angelico\b|\bel greco\b|\bprado\b)",re.I)
GOOD_IMAGE_RIGHTS=("/publicdomain/zero/1.0","/publicdomain/mark/1.0",
 "/licenses/by/4.0","/licenses/by-sa/4.0")
LIMIT_BYTES=24*1024*1024

def norm(value):
 s=unicodedata.normalize("NFKD",str(value or "")).casefold()
 return " ".join(re.findall(r"[a-z0-9]+","".join(c for c in s if not unicodedata.combining(c))))

def rights_ok(values):
 # LIDO rights of underlying object: no unknown, NC, ND or copyright.
 arr=values if isinstance(values,list) else [values]
 return bool(arr) and all(str(x).strip() in ("CC0","Public Domain",
   "Public Domain - http://creativecommons.org/publicdomain/mark/1.0/")
 for x in arr)

def uri_ok(url):
 p=urllib.parse.urlsplit(str(url))
 return p.scheme=="https" and p.hostname in ALLOWED_HOSTS and p.port in (None,443)

def http_get(url,max_bytes=LIMIT_BYTES):
 if not uri_ok(url):raise ValueError("Unapproved asset/manifest URL")
 last=None
 for i in range(3):
  try:
   req=urllib.request.Request(url,headers={"User-Agent":"AdOrientemResearchBulk/1.0",
                                                "Accept":"application/json,image/jpeg,*/*"})
   with urllib.request.urlopen(req,timeout=35) as fp:
    final=fp.geturl()
    if not uri_ok(final):raise ValueError("Redirected outside museum IIIF hosts")
    out=fp.read(max_bytes+1)
   if len(out)>max_bytes:raise ValueError("Response too large")
   return out
  except Exception as e:
   last=e
   if i!=2:time.sleep(1.5*(2**i))
 raise last

def read_json(url):
 return json.loads(http_get(url,10*1024*1024).decode("utf8"))

def art_identity(row):
 return " / ".join(row.get("artists",[])[:1]),row.get("title","")

def known_signatures(paths):
 found=set()
 def walk(x):
  if isinstance(x,dict):
   a=x.get("artist")
   t=x.get("title")
   if isinstance(a,str) and isinstance(t,str) and a and t:
    found.add(norm(a)+"|"+norm(t))
   for v in x.values():walk(v)
  elif isinstance(x,list):
   for y in x:walk(y)
 for path in paths:
  with open(path,encoding="utf8") as fp:walk(json.load(fp))
 return found

def candidate(row,known):
 if not row.get("paintingTypeMatch") or not rights_ok(row.get("rightsText",[])):
  return None
 title=row.get("title","")
 if not title or len(title)>255 or not SUBJECT.search(title) or NEGATIVE.search(title):
  return None
 artist,title=art_identity(row)
 if BANNED.search(artist+" "+title):return None
 manifests=[url for url in row.get("resourceLinks",[]) if
   uri_ok(url) and re.search(r"/manifest(?:\.json)?$",url)]
 if not manifests:return None
 s=norm(artist)+"|"+norm(title)
 return {
  "recordId":row.get("recordId"),"inventory":row.get("inventory"),
  "title":title,"artist":artist,"workRights":row.get("rightsText"),
  "originalObjectURL":(row.get("objectUrls") or [None])[0],
  "manifest":manifests[0],"objectWorkIdentity":s,
  "knownExactIdentity":s in known,
  "preferredBaroque":bool(PREFERRED.search(artist)),
  "reviewPriority":(100 if PREFERRED.search(artist) else 0)
    +(15 if re.search(r"(martel|kruis|christus|maria|heilige)",title,re.I) else 0),
  "status":"UNREVIEWED_RESEARCH_ONLY"
 }

def manifest_media(m):
 rights=m.get("rights","")
 for canvas in m.get("items",[]):
  if not rights:rights=canvas.get("rights","")
  for page in canvas.get("items",[]):
   for anno in page.get("items",[]):
    body=anno.get("body",{})
    if isinstance(body,list):body=body[0] if body else {}
    if not isinstance(body,dict):continue
    services=body.get("service") or []
    if isinstance(services,dict):services=[services]
    service=next((z.get("id") or z.get("@id") for z in services
       if isinstance(z,dict) and (z.get("id") or z.get("@id"))),None)
    return service,rights or body.get("rights",""),body.get("width"),body.get("height")
 # IIIF Presentation v2 fallback
 for seq in m.get("sequences",[]):
  for canvas in seq.get("canvases",[]):
   for ann in canvas.get("images",[]):
    body=ann.get("resource",{})
    services=body.get("service",[])
    if isinstance(services,dict):services=[services]
    for z in services:
     service=z.get("@id") or z.get("id")
     if service:return service,rights or body.get("rights",""),body.get("width"),body.get("height")
 return None,rights,None,None

def image_rights_label(s):
 if isinstance(s,dict):s=s.get("id") or s.get("@id") or ""
 s=str(s or "").lower().replace("https://","http://")
 if any(z in s for z in ("by-nc","by-nd","inc-nc","/inc/","copyright")):
  return "RESTRICTED"
 if any(x in s for x in GOOD_IMAGE_RIGHTS):
  return "EXPLICIT_OPEN"
 return "NO_EXPLICIT_IMAGE_RIGHTS"

def fetch_candidate(job):
 idx,item,path=job
 try:
  manifest=read_json(item["manifest"])
  service,r,w,h=manifest_media(manifest)
  if not service or not uri_ok(service):raise ValueError("Missing approved IIIF image service")
  status=image_rights_label(r)
  if status=="RESTRICTED":raise ValueError("Image manifest says restricted")
  # Underlying object is individually labelled PD/CC0. No final photo rights claim.
  base=service.rstrip("/")
  options=[base+"/full/!2000,2000/0/default.jpg",base+"/full/1000,/0/default.jpg"]
  binary=None
  failures=[]
  for url in options:
   try:
    binary=http_get(url)
    break
   except Exception as exc:failures.append(str(exc)[:100])
  if not binary:raise ValueError("IIIF image download failed: "+"; ".join(failures))
  with Image.open(io.BytesIO(binary)) as im:
   im.load()
   if min(im.size)<600 or max(im.size)<1000:
    raise ValueError("Image dimensions below review threshold")
   pixels=list(im.size)
   im=im.convert("RGB")
   im.thumbnail((1750,1750))
   target=path/("%04d.jpg"%idx)
   im.save(target,"JPEG",quality=86,optimize=True)
  return {"index":idx,"file":target.name,"pixels":pixels,
   "bytes":target.stat().st_size,"sha256":hashlib.sha256(target.read_bytes()).hexdigest(),
   "sourceSha256":hashlib.sha256(binary).hexdigest(),"imageRightsSource":r,
   "imageRightsStatus":status,"releaseCertified":False}
 except Exception as exc:
  return {"index":idx,"error":str(exc)[:260]}

def make_contact_sheets(candidates,results,output):
 entries=[x for x in results if x.get("file")]
 for start in range(0,len(entries),60):
  subset=entries[start:start+60]
  sheet=Image.new("RGB",(1200,192*((len(subset)+5)//6)),"#1b1b20")
  dr=ImageDraw.Draw(sheet)
  for n,r in enumerate(subset):
   with Image.open(output/"images"/r["file"]) as im:
    im.thumbnail((182,151))
    xx=(n%6)*200+(200-im.width)//2
    yy=(n//6)*192
    sheet.paste(im,(xx,yy))
   name=candidates[r["index"]]["title"][:24]
   dr.text(((n%6)*200+6,(n//6)*192+154),
    name.encode("ascii","ignore").decode("ascii"),fill="white")
  sheet.save(output/("contact-%02d.jpg"%(start//60+1)),quality=82)

def main():
 ap=argparse.ArgumentParser()
 ap.add_argument("--source",required=False)
 ap.add_argument("--existing",action="append",default=[])
 ap.add_argument("--out",default="artifacts/sacred-art-flemish-works")
 ap.add_argument("--max-images",type=int,default=350)
 ap.add_argument("--max-mb",type=int,default=175)
 ap.add_argument("--test",action="store_true")
 args=ap.parse_args()
 if args.test:
  assert rights_ok(["CC0"])
  assert rights_ok(["Public Domain"])
  assert not rights_ok(["In Copyright"])
  assert not rights_ok(["Auteursrechtelijke bescherming niet bepaald"])
  assert SUBJECT.search("De marteldood van de heilige Laurentius")
  assert NEGATIVE.search("Portret van Maria Lippens")
  assert uri_ok("https://imagehub.mskgent.be/iiif/3/123/manifest.json")
  assert not uri_ok("https://evil.example/manifest.json")
  print("PASS rights/subject/host filtering");return
 if not args.source:raise SystemExit("--source required")
 output=Path(args.out);(output/"images").mkdir(parents=True,exist_ok=True)
 src=json.loads(Path(args.source).read_text(encoding="utf8"))
 known=known_signatures(args.existing)
 candidates=[]
 seen=set()
 for row in src:
  x=candidate(row,known)
  if x and x["recordId"] not in seen:
   seen.add(x["recordId"]);candidates.append(x)
 candidates.sort(key=lambda x:(x["knownExactIdentity"],-x["reviewPriority"],x["title"]))
 eligible=[x for x in candidates if not x["knownExactIdentity"]][:args.max_images]
 results=[]
 used=0
 with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
  for res in pool.map(fetch_candidate,[(i,row,output/"images") for i,row in enumerate(eligible)]):
   if res.get("file"):
    used+=res["bytes"]
    if used>args.max_mb*1024*1024:
     (output/"images"/res["file"]).unlink()
     res={"index":res["index"],"error":"Storage cap exceeded"}
   results.append(res)
 make_contact_sheets(eligible,results,output)
 report={
  "schema":"AO_FLEMISH_FULL_CATALOGUE_BULK_IMAGES_V1",
  "status":"RESEARCH_ORIGINALS_NOT_RELEASE_CLEARED",
  "sourceRows":len(src),
  "cataloguePaintingReligiousPDCandidates":len(candidates),
  "nonExactMatchAfterLoadedLedgers":sum(not x["knownExactIdentity"] for x in candidates),
  "scheduledForReviewDownload":len(eligible),
  "imagesAcquired":sum(bool(x.get("file")) for x in results),
  "imageManifestOpenRights":sum(x.get("imageRightsStatus")=="EXPLICIT_OPEN" for x in results),
  "imageManifestRightsMissing":sum(x.get("imageRightsStatus")=="NO_EXPLICIT_IMAGE_RIGHTS" for x in results),
  "sourceUrlVerified":True,"licenseReleaseCertified":0,
  "full856PhysicalDedupComplete":False,"editorialApproved":0,
  "appImagesPublished":0,
  "scope":"Objects individually PD/CC0 in LIDO; source IIIF manifests/medium verified, but without explicit photo rights the acquired images are held for research only. Any app publication requires independent rights and curator proof.",
  "errorsByReason":dict(Counter(x.get("error") for x in results if x.get("error"))),
  "sourceRun":"https://github.com/Fulcanelli13/ad-orientem/actions/runs/41347958909"
 }
 (output/"report.json").write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding="utf8")
 (output/"candidates.json").write_text(json.dumps(eligible,indent=2,ensure_ascii=False),encoding="utf8")
 (output/"download-status.json").write_text(json.dumps(results,indent=2,ensure_ascii=False),encoding="utf8")
 print(json.dumps({k:report[k] for k in ("sourceRows","cataloguePaintingReligiousPDCandidates","scheduledForReviewDownload","imagesAcquired","imageManifestOpenRights","imageManifestRightsMissing","errorsByReason")}),flush=True)
 if not report["imagesAcquired"]:raise SystemExit("FAIL: zero research images acquired (see report.json)")
if __name__=="__main__":main()
