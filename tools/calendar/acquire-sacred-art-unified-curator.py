#!/usr/bin/env python3
"""Acquire source-identified sacred paintings BEFORE requesting curator choices.
Research branch only. Preserve originals as temporary Actions artifacts, store small
uncropped, SHA-backed photographic previews under docs/research; no app publication.
"""
from __future__ import annotations
import argparse, hashlib, io, json, os, re, sys, time, zipfile
from pathlib import Path
from urllib.parse import quote, urlparse, unquote
import requests
from PIL import Image, ImageOps, ImageFile

Image.MAX_IMAGE_PIXELS=180_000_000
ImageFile.LOAD_TRUNCATED_IMAGES=False
ROOT=Path(__file__).resolve().parents[2]
INPUT=ROOT/"data/calendar/sacred-art-review-uploads/20261016-unified-review-embedded-data.v1.json"
REGISTRY=ROOT/"data/calendar/sacred-art-candidates.v1.json"
OUT=ROOT/"docs/research/review-galleries/acquired"
ARCHIVE=ROOT/"artifacts/sacred-art-unified-acquisition"
session=requests.Session()
session.headers.update({"User-Agent":"AdOrientemArtResearch/1.1 (https://github.com/Fulcanelli13/ad-orientem; open-source research)","Accept":"application/json,image/webp,image/jpeg,*/*"})
MAX_DOWNLOAD=55_000_000
WAIT=1.4
MET_RE=re.compile(r"metmuseum\.org/art/collection/search/(\d+)")
CMA_RE=re.compile(r"clevelandart\.org/art/([\d.]+)")
cached_api={}
artifact_zips={}
last_request=0.0

def fetch(url, limit=MAX_DOWNLOAD, binary=True):
 global last_request
 if not url.startswith("https://"): raise ValueError("https required")
 last=None
 for attempt in range(2):
  try:
   if time.time()-last_request<WAIT: time.sleep(WAIT)
   last_request=time.time()
   with session.get(url,timeout=(12,35),stream=True,allow_redirects=True) as r:
    r.raise_for_status()
    cl=r.headers.get("Content-Length")
    if cl and int(cl)>limit: raise ValueError("response too large")
    raw=bytearray()
    for chunk in r.iter_content(65536):
     if chunk: raw.extend(chunk)
     if len(raw)>limit: raise ValueError("download too large")
    return bytes(raw),r.url
  except Exception as e:
   last=str(e)[:220]
   if attempt<1: time.sleep(1.8)
 raise RuntimeError(last or "no response")

def jget(url):
 if url in cached_api:return cached_api[url]
 raw,_=fetch(url,limit=12_000_000)
 doc=json.loads(raw);cached_api[url]=doc;return doc

def fname(s):return re.sub(r"[^a-zA-Z0-9_.-]","-",s)[:78]
def norm(s):return re.sub(r"[^a-z0-9]+"," ",str(s or "").lower()).strip()
def file_name_from(url):
 m=re.search(r"/(?:File:|Special:FilePath/|Special:Redirect/file/)([^?#]+)",url or "")
 return unquote(m.group(1)).replace("_"," ") if m else None

def commons_info(name):
 title="File:"+name.replace(" ","_")
 from urllib.parse import urlencode
 u="https://commons.wikimedia.org/w/api.php?"+urlencode({"action":"query","format":"json","prop":"imageinfo","titles":title,"iiprop":"url|size|extmetadata","iiurlwidth":2600})
 obj=jget(u)
 page=next(iter(obj.get("query",{}).get("pages",{}).values()),{})
 ii=(page.get("imageinfo") or [{}])[0]
 if not ii.get("url"):raise ValueError("Commons file not found")
 meta=ii.get("extmetadata",{})
 lic=(meta.get("LicenseShortName") or {}).get("value") or ""
 author=(meta.get("Artist") or {}).get("value") or ""
 # Commons copyright status is file-specific, not inherited from painter's death.
 verified=bool(re.search(r"(?i)^(?:cc0|cc[- ]?by(?:[- ]sa)?|public domain|pd[- ])",lic))
 return {"url":ii["url"],"display":ii.get("thumburl") or ii["url"],"width":ii.get("width"),"height":ii.get("height"),"license":lic,"licenseSupported":verified,"artistCredit":re.sub("<[^>]+>","",author)[:240],"sourcePage":"https://commons.wikimedia.org/wiki/File:"+quote(name.replace(" ","_"),safe="()/.-_")}

def met_info(w):
 match=MET_RE.search(w.get("source") or "")
 if not match:return None
 num=int(match.group(1));a=jget(f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{num}")
 if a.get("objectID")!=num or a.get("isPublicDomain") is not True or not a.get("primaryImage"):return None
 artist=norm(w.get("artist"));provider_artist=norm(a.get("artistDisplayName"))
 surname=artist.split()[-1] if artist else ""
 if surname and len(surname)>3 and surname not in provider_artist and not any(s in provider_artist for s in artist.split() if len(s)>5):
  raise ValueError("Met physical painter mismatch: "+provider_artist)
 return {"url":a["primaryImage"],"display":a.get("primaryImageSmall") or a["primaryImage"],"license":"CC0 (museum official open access)","licenseSupported":True,"width":None,"height":None,"sourcePage":w["source"],"objectEvidence":"Met API "+str(num),"artistCredit":a.get("artistDisplayName","")}

def cma_info(w):
 match=CMA_RE.search(w.get("source") or "")
 if not match:return None
 num=match.group(1)
 from urllib.parse import urlencode
 a=jget("https://openaccess-api.clevelandart.org/api/artworks/?"+urlencode({"accession_number":num,"limit":10}))
 rows=a.get("data") or []
 x=next((a for a in rows if str(a.get("accession_number","")).strip()==num),None)
 if x is None:raise ValueError("CMA accession mismatch")
 imgs=x.get("images") or {}
 url=(imgs.get("print") or {}).get("url") or (imgs.get("web") or {}).get("url")
 if not url:raise ValueError("CMA open access image unavailable")
 if "openaccess-cdn.clevelandart.org" not in url:raise ValueError("CMA image origin not open access")
 return {"url":url,"display":(imgs.get("web") or {}).get("url") or url,"license":"CC0 (CMA open access)","licenseSupported":True,"width":None,"height":None,"sourcePage":w["source"],"objectEvidence":"CMA accession "+num,"artistCredit":x.get("creators", [{}])[0].get("description","") if x.get("creators") else ""}

def commons_search(w):
 """Find strong file leads only; title words and painter name must both match."""
 from urllib.parse import urlencode
 title=w.get("title") or ""
 artist=w.get("artist") or ""
 artist_terms=[x for x in norm(artist).split() if len(x)>=5 and x not in {"school","after","workshop","anonymous","possibly","attributed"}]
 subject_terms=[x for x in norm(title).split() if len(x)>=5 and x not in {"saint","holy","painting","martyrdom","virgin","church","original","study","canvas","scenes","greater","lesser"}]
 if len(artist_terms)<1 or len(subject_terms)<1:return None
 term=(artist_terms[-1]+" "+(" ".join(subject_terms[:3])))[:90]
 url="https://commons.wikimedia.org/w/api.php?"+urlencode({"action":"query","format":"json","list":"search","srnamespace":6,"srlimit":12,"srsearch":term})
 try:data=jget(url)
 except Exception:return None
 out=[]
 for row in data.get("query",{}).get("search",[]):
  n=norm(row.get("title") or "")
  hits_artist=[x for x in artist_terms if x in n]
  hits_subject=[x for x in subject_terms if x in n]
  if hits_artist and hits_subject and not re.search(r"(?i)detail|after .* copy|engraving|print of|sketch of",row.get("title") or ""):
   out.append(row.get("title","").removeprefix("File:").replace("_"," "))
 return out[0] if len(out)==1 else None

def artifact_restore(rec,cache):
 acquisition=rec.get("acquisition") or {}
 aid=acquisition.get("artifactId")
 path=acquisition.get("archiveOriginal")
 sha=acquisition.get("originalSha256")
 if not (aid and path and sha):return None
 aid=int(aid)
 if aid not in cache:
  token=os.environ.get("GITHUB_TOKEN")
  if not token:cache[aid]=None
  else:
   url=f"https://api.github.com/repos/Fulcanelli13/ad-orientem/actions/artifacts/{aid}/zip"
   old=session.headers.get("Authorization")
   session.headers["Authorization"]="Bearer "+token
   try:
    raw,_=fetch(url,limit=200_000_000)
    cache[aid]=zipfile.ZipFile(io.BytesIO(raw))
   except Exception as e:
    print("ARCHIVE_NOT_ACCESSIBLE",aid,str(e)[:100],flush=True);cache[aid]=None
   if old:session.headers["Authorization"]=old
   else:session.headers.pop("Authorization",None)
 a=cache.get(aid)
 if a is None:return None
 names=a.namelist()
 name=next((x for x in names if x==path or x.endswith("/"+path) or x.endswith(path)),None)
 if not name:return None
 raw=a.read(name)
 if hashlib.sha256(raw).hexdigest()!=sha:raise ValueError("Existing acquisition SHA-256 mismatch")
 return raw,{"url":"https://github.com/Fulcanelli13/ad-orientem/actions/runs/"+str(acquisition.get("runUrl","").rsplit("/",1)[-1]),"sourcePage":(rec.get("source") or {}).get("objectUrl",""),"license":(rec.get("source") or {}).get("rights",""),"licenseSupported":(rec.get("source") or {}).get("rights") in ("CC0","PUBLIC_DOMAIN"),"objectEvidence":"Legacy GitHub artifact "+str(aid)+" SHA256 checked","artistCredit":rec.get("artist","")}

def process(w,canonical,allow_search=False):
 result={"id":w["id"],"artist":w.get("artist"),"title":w.get("title"),"category":w.get("_category"),"categoryIndex":w.get("_index"),"source":w.get("source"),"photoPriorCount":len(w.get("photos") or []),"status":"UNRESOLVED"}
 if w.get("notEligible") or re.search("WRONG_SAINT|WRONG_ORIGINAL|PHYSICAL_ORIGINAL_MISMATCH|BERLIN_798H_NOT_CONFIRMED",w.get("hold") or ""):
  result.update(status="IDENTITY_HOLD_NO_IMAGE_PROMOTED",reason=w.get("hold"));return result
 if re.search(r"(?i)\b(?:fra angelico|el greco)\b",str(w.get("artist"))):
  result.update(status="CURATOR_EXCLUDED_ARTIST");return result
 candidates=[]
 c=canonical.get(w["id"])
 if c and (c.get("acquisition") or {}).get("originalSha256"):
  try:
   saved=artifact_restore(c,artifact_zips)
   if saved:candidates.append(("CANONICAL_SHA_ARCHIVE",saved[0],saved[1]))
  except Exception as e: result["archiveProblem"]=str(e)[:170]
 # Explicit museum original page with exact collection object identity.
 for fn,typ in ((met_info,"MUSEUM_MET_CC0"),(cma_info,"MUSEUM_CMA_CC0")):
  try:
   x=fn(w)
   if x:
    candidates.append((typ,None,x));break
  except Exception as e:result["providerIssue"]=str(e)[:170]
 # Existing exact source photo file records, already connected to original (no artist substitution).
 for p in w.get("photos") or []:
  f=file_name_from(p.get("page","")) or file_name_from(p.get("original",""))
  if not f:continue
  try:
   info=commons_info(f)
   if not info["licenseSupported"]:continue
   info["sourcePhotoId"]=p.get("id")
   candidates.append(("COMMONS_SOURCE_LINK",None,info))
  except Exception as e:
   result.setdefault("fileFailures",[]).append({"file":p["id"],"error":str(e)[:125]})
 # New discovery only for exact descriptive file names; provenance of original still a hold.
 if not candidates and allow_search:
  name=commons_search(w)
  if name:
   try:
    info=commons_info(name)
    if info["licenseSupported"]:
     candidates.append(("COMMONS_UNCONFIRMED_PHYSICAL_MATCH",None,info))
   except Exception as e: result["searchFailure"]=str(e)[:120]
 if not candidates:
  result["reason"]="No accessible source-identifiable reusable photograph";return result
 result["candidateCount"]=len(candidates)
 found=[]
 for idx,(kind,preserved,info) in enumerate(candidates[:4]):
  try:
   if not info.get("licenseSupported"):continue
   raw=preserved
   if raw is None:
    # Use original source if feasible; do not mistake downsized thumbnail for original.
    url=info.get("url")
    if not url:continue
    try:
     raw,final=fetch(url)
     was_derivative=False
    except Exception as original_error:
     derivative=info.get("display") or ""
     if not derivative or derivative==url:raise original_error
     raw,final=fetch(derivative)
     was_derivative=True
   else:
    final=info.get("url") or ""
    was_derivative=False
   with Image.open(io.BytesIO(raw)) as check: check.verify()
   with Image.open(io.BytesIO(raw)) as original:
    original=ImageOps.exif_transpose(original)
    width,height=original.size
    if max(width,height)<1050 or min(width,height)<300:raise ValueError("Insufficient source pixel dimensions")
    # Uncropped, proportional reproduction; review asset never changes physical framing.
    image=original.convert("RGB");image.thumbnail((2200,2200),Image.Resampling.LANCZOS)
    buffer=io.BytesIO();image.save(buffer,"WEBP",quality=84,method=4)
    preview=buffer.getvalue()
   digest=hashlib.sha256(raw).hexdigest()
   photokey=hashlib.sha256((w["id"]+"|"+str(info.get("sourcePhotoId",final))+"|"+digest).encode()).hexdigest()[:16]
   fn=f"{fname(w['id'])}-{photokey}.webp"
   (OUT/fn).write_bytes(preview)
   if idx==0 or kind.startswith("MUSEUM"): # Preserve one full original per record in artifact.
    (ARCHIVE/f"{fname(w['id'])}-{digest[:14]}.source").write_bytes(raw)
   found.append({"file":"acquired/"+fn,"relativeToGallery":"acquired/"+fn,"originalSha256":digest,"reviewPreviewSha256":hashlib.sha256(preview).hexdigest(),"originalWidth":width,"originalHeight":height,"previewWidth":image.width,"previewHeight":image.height,"originalBytes":len(raw),"previewBytes":len(preview),"sourceUrl":final or info.get("url"),"sourcePage":info.get("sourcePage") or w.get("source"),"license":info.get("license"),"credit":info.get("artistCredit"),"basis":kind,"identityStatus":"MUSEUM_EXACT_OBJECT" if kind.startswith("MUSEUM") or kind=="CANONICAL_SHA_ARCHIVE" else ("EXISTING_OBJECT_LINKED_FILE" if kind=="COMMONS_SOURCE_LINK" else "UNVERIFIED_DISCOVERY_CANDIDATE"),"photoId":info.get("sourcePhotoId",None),"downloadWasDerivative":was_derivative,"fullMuseumMasterVerified":not was_derivative,"masterUrl":info.get("url")})
   print("ACQUIRED",w["_index"],w["id"],kind,width,height,fn,flush=True)
  except Exception as e:
   result.setdefault("downloadFailures",[]).append({"source":info.get("sourcePage"),"reason":str(e)[:170]})
 if found:
  result["photos"]=found
  result["status"]="ACQUIRED_PREVIEW_SOURCE_SHA" if any(x["identityStatus"]!="UNVERIFIED_DISCOVERY_CANDIDATE" for x in found) else "ACQUIRED_BUT_IDENTITY_UNVERIFIED"
 else:result["reason"]="Sources identified but no file passed byte/pixel/rights verification"
 return result

def main():
 ap=argparse.ArgumentParser()
 ap.add_argument("--start",type=int,default=1)
 ap.add_argument("--end",type=int,default=100)
 ap.add_argument("--max-records",type=int,default=100)
 ap.add_argument("--search",action="store_true")
 args=ap.parse_args()
 OUT.mkdir(parents=True,exist_ok=True);ARCHIVE.mkdir(parents=True,exist_ok=True)
 model=json.loads(INPUT.read_text())
 canon={x["id"]:x for x in json.loads(REGISTRY.read_text())["artworks"]}
 works=[]
 for cat in model["categories"]:
  if args.start<=cat["index"]<=args.end:
   for w in cat["works"]:
    works.append(dict(w,_index=cat["index"],_category=cat["label"],_categoryId=cat["id"]))
 works=works[:args.max_records]
 report={"schema":"AO_SACRED_ART_UNIFIED_REAL_ACQUISITION_V1","input":str(INPUT.relative_to(ROOT)),"range":[args.start,args.end],"requestedRecords":len(works),"strictlyNoProductionMutation":True,"onlySavedOnResearchBranch":True,"rows":[]}
 for i,w in enumerate(works,1):
  try:entry=process(w,canon,allow_search=args.search)
  except Exception as e:entry={"id":w["id"],"category":w["_category"],"categoryIndex":w["_index"],"status":"FAILED","error":str(e)[:250]}
  report["rows"].append(entry)
  if i%10==0:print("PROGRESS",i,len(works),flush=True)
 report["counts"]={"submitted":len(works),"acquiredRecords":sum(bool(x.get("photos")) for x in report["rows"]),"acquiredPhotographicVersions":sum(len(x.get("photos") or []) for x in report["rows"]),"sourceMissing":sum(not x.get("photos") for x in report["rows"]),"museumSourceVerifiedVersions":sum(sum(p["identityStatus"]=="MUSEUM_EXACT_OBJECT" for p in x.get("photos") or []) for x in report["rows"]),"identityHold":sum(x.get("status")=="IDENTITY_HOLD_NO_IMAGE_PROMOTED" for x in report["rows"])}
 name=f"batch-{args.start:03d}-{args.end:03d}-source-acquisition.v1.json"
 (OUT/name).write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
 (ARCHIVE/"result-manifest.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
 print("ACQUISITION_COMPLETE",json.dumps(report["counts"]),flush=True)
 if not report["counts"]["acquiredRecords"]:sys.exit(2)

if __name__=="__main__":main()
