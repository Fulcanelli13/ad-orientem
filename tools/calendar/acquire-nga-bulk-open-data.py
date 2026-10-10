#!/usr/bin/env python3
"""NGA open-data bulk acquisition: strict true-Painting + image.openaccess=1.
200+ canonical Ad Orientem art subjects; source originals and SHA held for full audit.
NGA CC0 metadata alone DOES NOT imply all image links are open access.
"""
import csv,hashlib,io,json,re,time,os
from collections import defaultdict
from pathlib import Path
from urllib.parse import quote,urlparse
from urllib.request import Request,urlopen
from PIL import Image,ImageOps
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"artifacts/sacred-art-nga-bulk"
OUT.mkdir(parents=True,exist_ok=True)
IMAGE_DIR=OUT/"originals"
IMAGE_DIR.mkdir(exist_ok=True)
DATASET="https://raw.githubusercontent.com/NationalGalleryOfArt/opendata/main/data/"
USER_AGENT="AdOrientem Church Art Source Research/1.0 - NGA open data"
MAX_IMAGES=120
FOCUS_KEYS=("scripture.wise-foolish-virgins","scripture.keys-to-peter","scripture.talents","scripture.raising-widows-son","scripture.healing-paralytic","scripture.tribute-money")
def get(url,limit,timeout=70):
 if urlparse(url).scheme!="https":raise ValueError("HTTPS only")
 req=Request(url,headers={"User-Agent":USER_AGENT,"Accept":"text/csv,image/jpeg,*/*"})
 with urlopen(req,timeout=timeout) as res:
  if int(res.headers.get("Content-Length") or 0)>limit:raise ValueError("File larger than byte limit")
  value=res.read(limit+1)
  if len(value)>limit:raise ValueError("File exceeds byte limit")
  return value
def csvrows(raw):
 buf=io.StringIO(raw.decode("utf-8-sig","replace"),newline="")
 return [{k.lower():v for k,v in r.items()} for r in csv.DictReader(buf)]
def normalized(s):
 return re.sub(r"\s+"," ",re.sub(r"[^a-z0-9]+"," ",str(s or "").lower())).strip()
def title_matches(title,term):
 a,b=normalized(title),normalized(term)
 if not b or len(b)<7:return False
 if a==b:return True
 return (" "+b+" ") in (" "+a+" ")
def score_title(title,phrases):
 a=normalized(title)
 hits=[(4 if a==normalized(q) else 2,len(normalized(q))) for q in phrases if title_matches(title,q)]
 return max(hits,default=(0,0))
def is_painting(o):
 classification=normalized(o.get("visualbrowserclassification") or o.get("classification") or "")
 medium=normalized(o.get("medium") or "")
 # Accept museum catalogue painting class, exclude prints, engravings, studies and photographs.
 return classification in ("painting","paintings") and not re.search(
  r"\b(engraving|etching|print|photograph|drawing|lithograph|pastel)\b",medium)
def valid_nga_image(i):
 try:
  access=str(i.get("openaccess") or "").strip()=="1"
  u=str(i.get("iiifurl") or "").strip()
  return access and u.startswith("https://api.nga.gov/iiif/") and int(i.get("width") or 0)>=1500 and int(i.get("height") or 0)>=1500
 except ValueError:return False
def main():
 targets=json.loads((ROOT/"data/calendar/sacred-art-subject-targets.v2.json").read_text(encoding="utf8"))["targets"]
 works=json.loads((ROOT/"data/calendar/sacred-art-candidates.v1.json").read_text(encoding="utf8"))["artworks"]
 already={a["id"] for a in works}
 # Prefer actual gaps, not source image candidates already acquired.
 def original_count(t):
  key=t["id"];short=key.split(".",1)[1]
  count=0
  for a in works:
   if not (a.get("acquisition") or {}).get("originalSha256"):continue
   icon=a.get("tags") or {}
   if key.startswith("person.") and icon.get("portraitSubjectId")==short:count+=1
   elif key.startswith("scripture.") and short in (icon.get("scriptureIdentityKeys") or []):count+=1
   elif key.startswith("calendar.") and short in (icon.get("iconography") or []):count+=1
  return count
 # Do not discard subjects with one painting but a two-/three-original collection-depth minimum.
 targets=[t for t in targets if t["id"].startswith(("scripture.","person.","calendar."))
          and original_count(t)<int(t.get("minimumOriginals") or 1)]
 targets.sort(key=lambda t:(0 if t["id"] in FOCUS_KEYS else 1,{"P0":0,"P1":1,"P2":2}.get(t.get("priority"),3),t["id"]))
 print("NGA_TARGETS",len(targets),flush=True)
 objects=csvrows(get(DATASET+"objects.csv",95_000_000))
 object_map={}
 hits=[]
 for obj in objects:
  if not is_painting(obj):continue
  title=obj.get("title","")
  best=(0,0);chosen=None
  for t in targets:
   s=score_title(title,t.get("queries") or [t.get("title","")])
   if s>best:best=s;chosen=t
  if not chosen:continue
  oid=obj.get("objectid") or ""
  if not oid.isdigit() or "nga-"+oid in already:continue
  object_map[oid]=dict(objectID=oid,title=title,medium=obj.get("medium"),
       classification=obj.get("visualbrowserclassification"),
       date=obj.get("displaydate"),targetId=chosen["id"],
       targetPriority=chosen.get("priority"),matchScore=best)
 print("NGA_METADATA_PAINTING_MATCHES",len(object_map),flush=True)
 imgs=csvrows(get(DATASET+"published_images.csv",130_000_000,timeout=120))
 byObject=defaultdict(list)
 for img in imgs:
  oid=str(img.get("depictstmsobjectid") or "").strip()
  if oid in object_map and valid_nga_image(img):
   byObject[oid].append(img)
 ranked=sorted([o for oid,o in object_map.items() if byObject.get(oid)],key=lambda o:(
   {"P0":0,"P1":1,"P2":2}.get(o["targetPriority"],3),
   -o["matchScore"][0],-o["matchScore"][1],o["title"]))
 print("NGA_OPEN_ACCESS_PAINTING_MATCHES",len(ranked),flush=True)
 grouped=defaultdict(list)
 for candidate in ranked:grouped[candidate["targetId"]].append(candidate)
 queue=[]
 # Round-robin target types to maximize day/subject breadth instead of taking 40 of one topic.
 while len(queue)<MAX_IMAGES:
  progress=False
  for t in targets:
   if len(queue)>=MAX_IMAGES:break
   if grouped[t["id"]]:
    queue.append(grouped[t["id"]].pop(0));progress=True
  if not progress:break
 # NGA credits are stored separately; do not fabricate artists from saint/scene titles.
 # A failure to retrieve person tables must not invent attribution or void image proofs.
 authors={}
 try:
  ids={q["objectID"] for q in queue}
  relationships=csvrows(get(DATASET+"objects_constituents.csv",90_000_000))
  relevant=[q for q in relationships if q.get("objectid") in ids and q.get("roletype","").lower()=="artist"]
  maker_ids={q.get("constituentid") for q in relevant}
  people={q.get("constituentid"):q.get("forwarddisplayname") for q in csvrows(get(DATASET+"constituents.csv",90_000_000))
          if q.get("constituentid") in maker_ids}
  for q in relevant:
   by=people.get(q["constituentid"])
   if by:authors.setdefault(q["objectid"],[]).append(by)
  print("NGA_NAMED_ARTIST_CREDITS",len(authors),"of",len(queue),flush=True)
 except Exception as exc:
  print("NGA_ARTIST_CREDITS_HELD",str(exc)[:180],flush=True)

 rows=[]
 for o in queue:
  o["artist"]="; ".join(dict.fromkeys(authors.get(o["objectID"],[]))) or "Attribution not retrieved from NGA source dataset"
  oid=o["objectID"];img=sorted(byObject[oid],key=lambda i:(i.get("viewtype")!="primary",int(i.get("sequence") or 0)))[0]
  row={**o,"id":"nga-"+oid,"sourceUrl":"https://www.nga.gov/artworks/"+oid,
       "sourceDataset":DATASET,"rightsPolicyUrl":"https://www.nga.gov/artworks/free-images-and-open-access",
       "imageOpenAccessFlag":img.get("openaccess"),"imageUUID":img.get("uuid"),
       "claimedMuseumSourceWidth":img.get("width"),"claimedMuseumSourceHeight":img.get("height"),
       "imageUsageStatus":"ORIGINAL_NOT_YET_ACQUIRED", "curatorApproved":False,
       "mobileCropApproved":False,"productionApproved":False}
  try:
   base=str(img["iiifurl"]).rstrip("/")
   u=base+"/full/full/0/default.jpg"
   raw=get(u,38_000_000)
   with Image.open(io.BytesIO(raw)) as im:
    im.load()
    if im.format!="JPEG":raise ValueError("Not source JPEG")
    w,h=ImageOps.exif_transpose(im).size
    if max(w,h)<2500:raise ValueError("Source not at least 2500px")
   sha=hashlib.sha256(raw).hexdigest()
   (IMAGE_DIR/(row["id"]+".jpg")).write_bytes(raw)
   row.update(imageUsageStatus="OFFICIAL_NGA_ORIGINAL_ACQUIRED_TECHNICALLY_ONLY",
     iiifOriginalURL=u,sha256=sha,width=w,height=h,bytes=len(raw),filename="originals/"+row["id"]+".jpg")
   print("ACQUIRED",row["id"],row["targetId"],row["title"][:85],w,h,flush=True)
  except Exception as ex:
   row.update(imageUsageStatus="ORIGINAL_FAILED_OR_BELOW_QUALITY_FLOOR",error=str(ex)[:240])
   print("HELD",row["id"],row["targetId"],str(ex)[:120],flush=True)
  rows.append(row)
  time.sleep(.08)
 report={"schema":"AO_SACRED_ART_NGA_BULK_SOURCE_DISCOVERY_V1",
   "source":"National Gallery of Art Open Data 2026 with published_images openaccess=1 required.",
   "legalNote":"NGA metadata CSV CC0 does not confer image rights. Each candidate is classified as Painting and image openaccess flag=1, but artistic suitability and phone composition remain pending.",
   "targetCount":len(targets),"titleMatches":len(object_map),"openAccessPaintingMatches":len(ranked),
   "attemptedImages":len(rows),"originalsAcquired":sum(r["imageUsageStatus"]=="OFFICIAL_NGA_ORIGINAL_ACQUIRED_TECHNICALLY_ONLY" for r in rows),
   "artworks":rows}
 (OUT/"research.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
 print("NGA_BULK_ACQUISITION",json.dumps({k:report[k] for k in ("targetCount","titleMatches","openAccessPaintingMatches","attemptedImages","originalsAcquired")}),flush=True)

 # Print a capped machine-readable source-original ledger for exact GitHub
 # connector reconciliation; NEVER promote missing hash, wrong class, or non-openaccess images.
 good=[{
  "id":a["id"],"title":a["title"],"medium":a["medium"],"artist":a["artist"],
  "objectID":a["objectID"],"targetId":a["targetId"],
  "iiifOriginalURL":a["iiifOriginalURL"],"imageUUID":a["imageUUID"],
  "sourceUrl":a["sourceUrl"],"sha256":a["sha256"],
  "width":a["width"],"height":a["height"],"filename":a["filename"]
  } for a in rows if a["imageUsageStatus"]=="OFFICIAL_NGA_ORIGINAL_ACQUIRED_TECHNICALLY_ONLY"]
 print("NGA_BULK_RECONCILE_JSON="+json.dumps(good,ensure_ascii=True,separators=(",",":")),flush=True)

if __name__=="__main__":main()
