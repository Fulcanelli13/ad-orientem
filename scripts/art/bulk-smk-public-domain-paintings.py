#!/usr/bin/env python3
"""Bulk acquire research photographs of public-domain paintings from SMK (Denmark).

Uses the museum's documented open art/search API, NOT Wikimedia or API keys.
Acquired research files are NOT approved artwork, Home heroes or production assets.
"""
import argparse, concurrent.futures, hashlib, io, json, re, time, unicodedata
import urllib.parse, urllib.request
from pathlib import Path
from PIL import Image, ImageDraw

API="https://api.smk.dk/api/v1/art/search/"
AGENT="AdOrientemSacredArtResearch/1.1 (open public domain painting dataset; no registration)"
RELIGIOUS=re.compile(r"\b(saint|saints|sankt|sanct|helgen|hellig|holy|"
 r"christ|christus|jesus|jesu|maria|mary|madonna|virgin|jomfru|"
 r"angel|engel|apostle|apostel|evangelist|martyr|martyrdom|"
 r"crucifix|crucified|korsfæst|pieta|pietà|nativity|fødsel|"
 r"resurrection|opstandelse|annunciation|bebudelse|visitation|"
 r"assumption|ascension|himmelfart|baptism|dåb|"
 r"adoration|tilbedelse|epiphany|helligtrekong|"
 r"trinity|treenighed|last supper|nadver|"
 r"st\.|st |sankt|sankt[a-z]*)\b",re.I)
EXCLUDED_ARTISTS=("fra angelico","el greco")
DA_EN={"maria":"mary","peter":"peter","peters":"peter",
 "johannes":"john","paulus":"paul","markus":"mark",
 "matthæus":"matthew","jakob":"james","andreas":"andrew",
 "laurentius":"lawrence","bartolomæus":"bartholomew",
 "visitatie":"visitation","bebudelse":"annunciation",
 "himmelfart":"ascension","korsfæstelse":"crucifixion"}
STOP=set("saint saints sts st the a an of and to in our lord lady blessed holy feast vigil"
         " sunday after for with on from week christmas ascension of jesus christ".split())

def norm(s):
 s=unicodedata.normalize("NFKD",str(s or "")).casefold()
 s="".join(c for c in s if not unicodedata.combining(c))
 return " ".join(re.findall(r"[a-z0-9]+",s))

def flatten(value):
 if isinstance(value,str):return value
 if isinstance(value,list):return " ".join(flatten(x) for x in value)
 if isinstance(value,dict):
  return " ".join(flatten(x) for x in value.values())
 return ""

def get_bytes(url,lim=20*1024*1024):
 p=urllib.parse.urlsplit(url)
 if p.scheme!="https" or not p.hostname or not (p.hostname=="api.smk.dk" or p.hostname.endswith(".smk.dk")):
  raise ValueError("Unapproved HTTPS host: "+str(p.hostname))
 for attempt in range(3):
  try:
   request=urllib.request.Request(url,headers={"User-Agent":AGENT,"Accept":"application/json,image/jpeg,*/*"})
   with urllib.request.urlopen(request,timeout=50) as resp:
    body=resp.read(lim+1)
   if len(body)>lim:raise ValueError("Response exceeds max bytes")
   return body
  except Exception:
   if attempt==2:raise
   time.sleep(2**attempt*2)

def get_json(url):return json.loads(get_bytes(url,20*1024*1024))

def load_known(paths):
 known=set()
 def walk(x):
  if isinstance(x,dict):
   a=x.get("artist")
   t=x.get("title")
   if isinstance(a,str) and isinstance(t,str) and a and t:
    known.add(norm(a)+"|"+norm(t))
   for v in x.values():walk(v)
  elif isinstance(x,list):
   for v in x:walk(v)
 for p in paths:
  with open(p,encoding="utf8") as f:walk(json.load(f))
 return known

def load_dates(path):
 with open(path,encoding="utf8") as f:docs=json.load(f)
 entries=[]
 for d in docs.get("days",[]):
  if d.get("rank") not in ("I","II","III") or d.get("dateSelectedArt"):continue
  title=d.get("observedTitle") or ""
  if title.casefold().startswith(("feria","sabbato","sunday","ember")):continue
  tokens=[x for x in norm(title).split() if x not in STOP and len(x)>3]
  if tokens:entries.append({"date":d["date"],"rank":d["rank"],"title":title,"tokens":tokens})
 return entries

def get_artist(item):
 p=item.get("production") or []
 artists=[]
 if isinstance(p,list):
  for z in p:
   if isinstance(z,dict):
    for key in ("creator","name","artist"):
     if key in z:artists.append(flatten(z[key]))
 return flatten(item.get("artist") or item.get("artists") or item.get("artist_en") or artists).strip()

def as_row(item,known,dates):
 ident=str(item.get("object_number") or item.get("id") or "")
 title=flatten(item.get("titles_en") or item.get("titles_da") or item.get("title") or "").strip()
 artist=get_artist(item)
 desc=flatten(item.get("content_description_en") or item.get("content_description_da") or [])
 desc=desc[:1200]
 labels=flatten(item.get("labels_en") or item.get("labels_da") or [])[:600]
 media=flatten(item.get("object_names_en") or item.get("object_names_da") or item.get("object_names") or item.get("object_type") or [])[:250]
 dtext=norm(title+" "+desc+" "+labels)
 tokens=set(dtext.split())
 date_matches=[]
 for d in dates:
  overlap=sum(1 for w in d["tokens"] if w in tokens or DA_EN.get(w,"") in tokens)
  if (len(d["tokens"])==1 and overlap==1) or (len(d["tokens"])>=2 and overlap>=max(2,len(d["tokens"])-1)):
   date_matches.append({"date":d["date"],"rank":d["rank"],"feast":d["title"],"tokenOverlap":overlap,"type":"TEXTUAL_PROPOSAL_NOT_ARTWORK_APPROVAL"})
 image=item.get("image_native") or item.get("image_thumbnail") or ""
 exclude_artist=any(x in norm(artist) for x in EXCLUDED_ARTISTS)
 signature=norm(artist)+"|"+norm(title)
 return {
  "museum":"SMK National Gallery of Denmark","objectId":ident,"title":title,"artist":artist,
  "medium":media,"dateMatches":date_matches[:12],
  "isPaintingByOfficialMedium":bool(re.search(r"\b(painting|maleri|oil on|olieverf|olio|peinture|schilderij|tavola|canvas|panel)\b",norm(media))) and not bool(re.search(r"\b(drawing|print|photograph|sculpture|engraving|etching|watercolor|tegn|tryk|grafik)\b",norm(media))),
  "publicDomain":item.get("public_domain") is True,
  "hasImage":bool(image),"imageNative":item.get("image_native"),
  "imageThumbnail":item.get("image_thumbnail"),
  "imageWidth":item.get("image_width"),"imageHeight":item.get("image_height"),
  "officialArtworkURL":item.get("frontend_url") or ("https://open.smk.dk/en/artwork/image/"+urllib.parse.quote(ident)),
  "openRightsStatement":item.get("rights"),
  "religiousSubjectDetected":bool(RELIGIOUS.search(title+" "+desc+" "+labels)),
  "existingArtistTitleMatch":signature in known if title and artist else None,
  "artistPolicyExcluded":exclude_artist,
  "candidateStatus":"RESEARCH_ONLY_UNAPPROVED",
  "sourceIdentifier":item.get("id"),"sourceAPI":API
 }

def acquire(task):
 i,row,out=task
 url=row["imageNative"] or row["imageThumbnail"]
 if not url:return {"index":i,"error":"No source image"}
 try:
  raw=get_bytes(url)
  with Image.open(io.BytesIO(raw)) as im:
   im.load()
   pixels=[im.width,im.height]
   if max(pixels)<1300 or min(pixels)<750:raise ValueError("Photo too small for hero review")
   if im.format not in ("JPEG","PNG","WEBP"):raise ValueError("Unsupported file format")
   # Capped review derivative; do not misrepresent as lossless museum original.
   im=im.convert("RGB")
   im.thumbnail((2200,2200))
   path=out/("%04d.jpg"%i)
   im.save(path,"JPEG",quality=85,optimize=True)
   return {"index":i,"file":path.name,"pixelsOriginal":pixels,"pixelsReview":list(im.size),
    "downloadURL":url,"sourceSHA256":hashlib.sha256(raw).hexdigest(),
    "researchDerivativeSHA256":hashlib.sha256(path.read_bytes()).hexdigest(),
    "sizeBytes":path.stat().st_size,"publishable":False}
 except Exception as exc:return {"index":i,"error":str(exc)[:240]}

def sheets(rows,results,out):
 successes=[v for v in results if v.get("file")]
 for start in range(0,len(successes),60):
  batch=successes[start:start+60]
  sheet=Image.new("RGB",(1200,190*((len(batch)+5)//6)),"#18171b")
  pen=ImageDraw.Draw(sheet)
  for position,v in enumerate(batch):
   with Image.open(out/"images"/v["file"]) as im:
    im.thumbnail((185,150))
    x=(position%6)*200+(200-im.width)//2
    y=(position//6)*190
    sheet.paste(im,(x,y))
   name=rows[v["index"]]["title"][:26]
   pen.text(((position%6)*200+5,(position//6)*190+153),name.encode("ascii","ignore").decode("ascii"),fill="white")
  sheet.save(out/("contact-%02d.jpg"%(start//60+1)),quality=83)

def selftest():
 assert norm("Saint André")=="saint andre"
 assert RELIGIOUS.search("Bebudelse til jomfru Maria")
 assert not RELIGIOUS.search("Still life with apples")
 assert get_artist({"artist_en":["Rubens"]})=="Rubens"
 assert as_row({"object_number":"KMS-123","titles_en":["Saint John"],"artist_en":["Anonymous"],
  "public_domain":True,"image_native":"https://iip.smk.dk/a.jpg"},set(),[])["religiousSubjectDetected"]
 print("PASS SMK API normalization, public domain gates and metadata parsing")

def main():
 p=argparse.ArgumentParser()
 p.add_argument("--self-test",action="store_true")
 p.add_argument("--output",default="artifacts/sacred-art-smk-bulk")
 p.add_argument("--existing",action="append",default=[])
 p.add_argument("--calendar",required=False)
 p.add_argument("--max-metadata",type=int,default=12000)
 p.add_argument("--download-limit",type=int,default=250)
 p.add_argument("--max-output-mb",type=int,default=100)
 args=p.parse_args()
 if args.self_test:return selftest()
 out=Path(args.output);(out/"images").mkdir(parents=True,exist_ok=True)
 known=load_known(args.existing)
 dates=load_dates(args.calendar)
 records,errors=[],[]
 offset=0;batch_size=500
 # Filter syntax changed at times; prefer source-authoritative PD/image filter,
 # then classify painting using the returned object type locally.
 # An empty strict response is NOT a successful bulk harvest.
 filters_to_try=[
  "[has_image:true],[object_names:maleri],[public_domain:true]",
  "[has_image:true],[public_domain:true]",
  "[public_domain:true]",
  ""
 ]
 filter_used=None
 api_attempts=[]
 for test_filter in filters_to_try:
  query={"keys":"*","offset":0,"rows":10,"lang":"en"}
  if test_filter:query["filters"]=test_filter
  url=API+"?"+urllib.parse.urlencode(query)
  try:
   data=get_json(url)
   test_batch=data.get("items") or []
   api_attempts.append({"filters":test_filter or "UNFILTERED","items":len(test_batch),"resultKeys":list(data)[:12]})
   if test_batch:
    filter_used=test_filter
    break
  except Exception as exc:
   api_attempts.append({"filters":test_filter or "UNFILTERED","error":str(exc)[:230]})
 if filter_used is None:
  # Empty string is a valid unfiltered setting, not a failure if it gave items.
  if not api_attempts or api_attempts[-1].get("items",0)==0:
   errors.append({"error":"No objects were returned by any SMK API filter","attempts":api_attempts})
 if filter_used is not None or (api_attempts and api_attempts[-1].get("items",0)>0):
  while len(records)<args.max_metadata:
   query={"keys":"*","offset":offset,"rows":batch_size,"lang":"en"}
   if filter_used:query["filters"]=filter_used
   url=API+"?"+urllib.parse.urlencode(query)
   try:data=get_json(url)
   except Exception as exc:
    errors.append({"offset":offset,"error":str(exc)[:300]})
    break
   batch=data.get("items") or []
   if not isinstance(batch,list):raise RuntimeError("Unexpected API payload structure")
   if not batch:break
   records.extend(batch)
   offset+=len(batch)
   if offset%2000==0:print("SMK records",offset,flush=True)
   if len(batch)<batch_size:break
   time.sleep(.4)
 print("SMK API filter diagnostic:",json.dumps(api_attempts),flush=True)
 rows=[as_row(x,known,dates) for x in records[:args.max_metadata]]
 by_object={}
 for row in rows:
  if row["objectId"] and row["objectId"] not in by_object:by_object[row["objectId"]]=row
 rows=list(by_object.values())
 candidates=[(i,x) for i,x in enumerate(rows) if x["publicDomain"] and x["hasImage"] and
  x["religiousSubjectDetected"] and x["isPaintingByOfficialMedium"] and x["existingArtistTitleMatch"] is False and
  not x["artistPolicyExcluded"] and x["imageNative"]]
 candidates.sort(key=lambda p:(not bool(p[1]["dateMatches"]),-len(p[1]["dateMatches"]),p[1]["title"]))
 selected=candidates[:args.download_limit]
 results=[];used=0
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
  for res in pool.map(acquire,[(i,row,out/"images") for i,row in selected]):
   if res.get("file"):
    used+=res["sizeBytes"]
    if used>args.max_output_mb*1024*1024:
     (out/"images"/res["file"]).unlink()
     res={"index":res["index"],"error":"Artifact storage cap"}
   results.append(res)
 sheets(rows,results,out)
 report={
 "schema":"AO_SMK_PUBLIC_DOMAIN_PAINTINGS_BATCH_V1",
 "source":API,"status":"RESEARCH_ONLY_NOT_EDITORIALLY_APPROVED",
 "apiFilter":filter_used or "UNFILTERED_FALLBACK", "apiAttempts":api_attempts,
 "metadataItemsParsed":len(records),"distinctObjectNumbers":len(rows),
 "religiousSubjectRecords":sum(x["religiousSubjectDetected"] for x in rows),
 "paintingTypeRecords":sum(x["isPaintingByOfficialMedium"] for x in rows),
 "potentialNewReligiousPaintingsAgainstInspectedArchive":len(candidates),
 "provisionalCalendarDateMatches":len(set(d["date"] for _,x in candidates for d in x["dateMatches"])),
 "imagesDownloaded":sum(bool(x.get("file")) for x in results),
 "imagesActuallyPublished":0,"newArtworkApprovals":0,
 "all856PhysicalDedupCertified":False,
 "losslessOriginalsArchived":0,
 "researchPhotosAreLossyPreviewsNotProductionMasters":True,
 "sourcesUseOfficialMuseumURLs":True,"errors":errors[:50],
 "guard":"Object public_domain and image availability are authoritative per official SMK API, but full image fidelity and 856 physical-ID dedup remain unverified"
 }
 (out/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf8")
 (out/"candidate-objects.json").write_text(json.dumps([x for _,x in candidates],ensure_ascii=False,indent=2),encoding="utf8")
 (out/"all-objects.json").write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding="utf8")
 (out/"acquired-research-images.json").write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding="utf8")
 print(json.dumps({k:report[k] for k in ("metadataItemsParsed","religiousSubjectRecords","potentialNewReligiousPaintingsAgainstInspectedArchive","provisionalCalendarDateMatches","imagesDownloaded")}),flush=True)

if __name__=="__main__":main()
