#!/usr/bin/env python3
"""Fetch two exact user-approved Met originals. Stage only, never auto-publish."""
import argparse, hashlib, io, json, time, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image, ImageOps
OBJECTS={
 "angelus":{"id":438724,"accession":"2004.31","artist":"Philippe de Champaigne","title":"The Annunciation","artwork_id":"ART-hilippe-de-hampaigne-he-nnunciation","surface_crop":[90,82,3654,3545]},
 "adoration":{"id":438434,"accession":"2005.186","artist":"Jean Auguste Dominique Ingres","title":"The Virgin Adoring the Host","artwork_id":"met-438434","surface_crop":[205,145,2960,3615]},
}
HOSTS={"collectionapi.metmuseum.org","images.metmuseum.org"}
def fetch(url,limit=30000000):
 p=urllib.parse.urlsplit(url)
 if p.scheme!="https" or p.hostname not in HOSTS:raise ValueError("Unapproved source host")
 last=None
 for attempt in range(3):
  try:
   req=urllib.request.Request(url,headers={"User-Agent":"AdOrientemFrozenArtworkRelease/1.0","Accept":"application/json,image/jpeg"})
   with urllib.request.urlopen(req,timeout=50) as resp:
    if urllib.parse.urlsplit(resp.url).hostname not in HOSTS:raise ValueError("Redirected outside Met")
    blob=resp.read(limit+1)
   if len(blob)>limit:raise ValueError("Oversize source")
   return blob
  except Exception as e:
   last=e
   if attempt<2:time.sleep(2*(attempt+1))
 raise last
def validate(meta,approved):
 assert meta.get("objectID")==approved["id"],"Wrong museum object"
 assert meta.get("accessionNumber")==approved["accession"],"Wrong physical accession"
 assert meta.get("title","").strip().casefold()==approved["title"].casefold(),"Wrong painting title"
 assert approved["artist"].casefold() in meta.get("artistDisplayName","").casefold(),"Wrong artist"
 assert meta.get("isPublicDomain") is True,"Museum does not release as public domain"
 assert "painting" in meta.get("classification","").casefold(),"Wrong object class"
 url=meta.get("primaryImage","")
 assert url.startswith("https://images.metmuseum.org/") and url.lower().endswith((".jpg",".jpeg")),"No Met original JPEG"
 return url
def main():
 p=argparse.ArgumentParser()
 p.add_argument("--test",action="store_true")
 p.add_argument("--out",default="assets/staged/sacred-art-met-approved")
 args=p.parse_args()
 if args.test:
  x={"objectID":438724,"accessionNumber":"2004.31","title":"The Annunciation","artistDisplayName":"Philippe de Champaigne","isPublicDomain":True,"classification":"Paintings","primaryImage":"https://images.metmuseum.org/CRDImages/ep/original/example.jpg"}
  assert validate(x,OBJECTS["angelus"])==x["primaryImage"]
  for key,val in (("objectID",1),("isPublicDomain",False),("title","Different work"),("accessionNumber","WRONG")):
   try:validate({**x,key:val},OBJECTS["angelus"])
   except AssertionError:pass
   else:raise AssertionError("Fail-open validation")
  print("PASS exact museum ID, accession, artwork, rights, original URL");return
 dest=Path(args.out);dest.mkdir(parents=True,exist_ok=True)
 rows=[]
 for module,approved in OBJECTS.items():
  obj=approved["id"]
  meta=json.loads(fetch(f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{obj}",100000))
  url=validate(meta,approved)
  raw=fetch(url)
  with Image.open(io.BytesIO(raw)) as im:im.verify()
  with Image.open(io.BytesIO(raw)) as im:
   im.load()
   if im.format!="JPEG" or min(im.size)<1250 or im.width*im.height<2000000:raise ValueError("Not a high-resolution JPEG")
   w,h=im.size
   ImageOps.contain(im.convert("RGB"),(950,950)).save(dest/(module+"-review.jpg"),quality=86)
   left,top,right,bottom=approved["surface_crop"]
   assert 0<left<right<w and 0<top<bottom<h,"Crop extends outside original"
   # The user selected the whole painting; eliminate photographed outer frame,
   # preserve the artwork within. Derived file remains a reviewed *candidate*.
   surface=im.crop((left,top,right,bottom)).convert("RGB")
   candidate=dest/(module+"-frameless-candidate.webp")
   surface.save(candidate,"WEBP",quality=90,method=6)
   candidate_sha=hashlib.sha256(candidate.read_bytes()).hexdigest()
  local=dest/f"{module}-met-{obj}.jpg"
  local.write_bytes(raw)
  sha=hashlib.sha256(raw).hexdigest()
  rows.append({"module":module,"artworkId":approved["artwork_id"],"title":meta["title"],"artist":meta["artistDisplayName"],
   "museum":"Metropolitan Museum of Art","physicalAccession":approved["accession"],"museumObjectId":obj,
   "sourceURL":url,"objectPage":f"https://www.metmuseum.org/art/collection/search/{obj}",
   "rights":"Met Open Access isPublicDomain=true, original JPEG","file":str(local),
   "originalSha256":sha,"originalSizeBytes":len(raw),"width":w,"height":h,
   "originalUnmodified":True,"surfaceCrop":approved["surface_crop"],"framelessCandidatePath":str(candidate),
   "framelessCandidateSha256":candidate_sha,"framelessCandidatePixels":[right-left,bottom-top],
   "humanPhotoAndCropApproved":False,"releasedInApp":False,
   "status":"ORIGINAL_STAGED_FOR_APPROVED_ARTWORK_NOT_PUBLISHED"})
  print("ACQUIRED",module,obj,w,h,sha,flush=True)
 (dest/"source-manifest.json").write_text(json.dumps({"schema":"AO_APPROVED_MET_TWO_SOURCE_STAGING_V1",
  "approvalBasis":"data/research/module-hero-editorial-decision-ledger-2026-10-26.review19.json",
  "scope":"ONLY TWO EXACT PREVIOUSLY_APPROVED OBJECTS","rows":rows,
  "acquired":len(rows),"humanPhotoApproved":0,"published":0},indent=2)+"\n")
if __name__=="__main__":main()
