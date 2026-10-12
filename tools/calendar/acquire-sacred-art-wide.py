#!/usr/bin/env python3
"""Source-first broad sacred-art acquisition. NOT a publishing/quality certifier.

Usage: python tools/calendar/acquire-sacred-art-wide.py --group calendar
Only institution-confirmed museum public-domain/CC0 painted objects.
Preferred >=2500px and adequately coloured; 1800px / subdued-colour
borderline candidates are HELD and NEVER credited toward source minima.
Every image remains rights/art/crop HELD.
"""
import argparse, hashlib, io, json, re, time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen
from PIL import Image, ImageOps, ImageDraw
import numpy as np

ROOT=Path(__file__).resolve().parents[2]
TARGETS=ROOT/"data/calendar/sacred-art-subject-targets.v2.json"
REGISTRY=ROOT/"data/calendar/sacred-art-candidates.v1.json"
QA_POLICY=json.loads((ROOT/"data/calendar/sacred-art-research-qa-tiers.v2.json").read_text(encoding="utf8"))["automatedOriginalScreen"]
MET="https://collectionapi.metmuseum.org/public/collection/"
CMA="https://openaccess-api.clevelandart.org/api/artworks/"
AGENT="AdOrientem-SacredArtResearch/2.0 public-domain original acquisition"
GROUPS={
 "rosary":lambda t: t["id"].startswith(("rosary.","station.")),
 "devotion":lambda t: t["id"].startswith("devotion."),
 "calendar":lambda t: t["id"].startswith("calendar."),
 "scripture":lambda t: t["id"].startswith("scripture."),
 "persons":lambda t: t["id"].startswith("person.")
}
def get(url,limit=28_000_000):
 if not url.startswith("https://"):raise ValueError("HTTPS only")
 failure=""
 for attempt in range(3):
  try:
   with urlopen(Request(url,headers={"User-Agent":AGENT,"Accept":"application/json,image/jpeg,*/*"}),timeout=26) as res:
    if res.headers.get("Content-Length") and int(res.headers["Content-Length"])>limit:raise ValueError("Original larger than download byte budget")
    raw=res.read(limit+1)
    if len(raw)>limit:raise ValueError("Download byte budget exceeded")
    return raw
  except (HTTPError,URLError,TimeoutError,OSError) as e:
   failure=str(e)
   if isinstance(e,HTTPError) and e.code not in (403,429,500,502,503,504):break
   time.sleep(min(2*(attempt+1),9))
 raise RuntimeError(failure)
def jget(url):return json.loads(get(url,1_800_000))
def picture_metadata(raw):
 with Image.open(io.BytesIO(raw)) as im:
  im.load()
  im=ImageOps.exif_transpose(im)
  w,h=im.size
  if max(w,h)<QA_POLICY["borderline"]["minimumLongestDimensionPx"]:
   raise ValueError(f"Original below 1800px research floor ({w}x{h})")
  test=im.convert("RGB")
  test.thumbnail((260,260))
  rgb=np.asarray(test,dtype=np.int16)
  chroma=np.max(rgb,axis=2)-np.min(rgb,axis=2)
  colour=float(np.mean(chroma>18))
  if colour<QA_POLICY["borderline"]["minimumColourFraction"]:raise ValueError("Near-monochrome")
  preferred=(max(w,h)>=QA_POLICY["preferred"]["minimumLongestDimensionPx"]
   and colour>=QA_POLICY["preferred"]["minimumColourFraction"])
  tier="PREFERRED_SOURCE_ORIGINAL" if preferred else "BORDERLINE_HELD_FOR_IMAGE_REVIEW"
  return w,h,round(colour,4),tier
def norm(s):
 return re.sub(r"\s+"," ",re.sub(r"[^a-z0-9]+"," ",str(s or "").lower())).strip()
def confidence(title,query):
 a,b=norm(title),norm(query)
 if a==b:return "EXACT_TITLE"
 if b in a and len(b)>=10:return "TITLE_CONTAINS_QUERY"
 return None
def disfavored(title):
 t=norm(title)
 return bool(re.search(r"\b(?:sketch|study|design|drawing|copy|after|follower|bozzetto|modello|photograph)\b",t))
def existing_matches(target,works):
 key=target["id"]
 vals=target.get("contexts",[])
 counted=[]
 for a in works:
  assoc=a.get("association") or {}
  links=set(assoc.get("prayerKeys") or [])
  if key.startswith("rosary.") and key in links: counted.append(a)
  elif key.startswith("devotion.") and key[9:] in links: counted.append(a)
  elif key.startswith("calendar.") and any(x=="calendar."+key[9:] for x in vals):
   if key[9:] in (assoc.get("subjectKeys") or []):counted.append(a)
  elif key.startswith("scripture.") and key[10:] in (a.get("tags",{}).get("scriptureIdentityKeys") or []):
   counted.append(a)
  elif key.startswith("person.") and a.get("tags",{}).get("portraitSubjectId")==key[7:]:
   counted.append(a)
 return [a for a in counted if a.get("review",{}).get("image")=="ACQUIRED_REVIEW_ARCHIVE_ONLY"
   and re.fullmatch("[0-9a-f]{64}",(a.get("acquisition") or {}).get("originalSha256") or "")]
def search_met(q):
 api=MET+"v1.1/search?"+urlencode({"q":q,"hasImages":"true","limit":35,"offset":0})
 data=jget(api)
 return data.get("objectIDs") or []
def search_cma(q):
 api=CMA+"?"+urlencode({"q":q,"cc0":"","type":"Painting","has_image":"1","limit":50})
 data=jget(api)
 return data.get("data") or []
def metadata_met(obj_id):
 d=jget(MET+"v1/objects/"+str(obj_id))
 if d.get("isPublicDomain") is not True or d.get("classification")!="Paintings":return None
 url=d.get("primaryImage") or ""
 if not re.match(r"^https://images\.metmuseum\.org/CRDImages/[^/]+/original/[^?#]+\.jpe?g$",url,re.I):return None
 return dict(id="met-"+str(obj_id),title=d.get("title") or "",
   artist=d.get("artistDisplayName") or "Unknown",dated=d.get("objectDate"),
   sourceUrl="https://www.metmuseum.org/art/collection/search/"+str(obj_id),
   sourceApi=MET+"v1/objects/"+str(obj_id),originalUrl=quote(url,safe=":/-_.~%"),
   medium=d.get("medium"),department=d.get("department"),imageMuseum="Metropolitan Museum of Art",
   rights="CC0",rightsEvidence="Met public domain flag + official original reproduction")
def metadata_cma(d):
 if d.get("type")!="Painting" or d.get("share_license_status")!="CC0":return None
 image=((d.get("images") or {}).get("print") or {}).get("url") or ""
 if not image.startswith("https://openaccess-cdn.clevelandart.org/"):return None
 src=d.get("url") or ""
 if not src.startswith("https://"):return None
 creators=d.get("creators") or []
 return dict(id="cma-"+str(d["id"]),title=d.get("title") or "",
   artist=", ".join(x.get("description","") for x in creators)[:180],dated=d.get("creation_date"),
   sourceUrl=src,sourceApi=CMA+"?id="+str(d["id"]),originalUrl=image,
   medium=d.get("technique"),department=d.get("department"),imageMuseum="Cleveland Museum of Art",
   rights="CC0",rightsEvidence="Cleveland share_license_status=CC0 + print original")
def generate_contacts(good,dir_path):
 good.sort(key=lambda o:(o["targetId"],o["id"]))
 for start in range(0,len(good),12):
  segment=good[start:start+12]
  bg=Image.new("RGB",(1800,2160),(239,236,229));draw=ImageDraw.Draw(bg)
  for i,w in enumerate(segment):
   x=(i%4)*450;y=(i//4)*720
   with Image.open(dir_path/"originals"/w["filename"]) as original:
    thumb=ImageOps.exif_transpose(original).convert("RGB");thumb.thumbnail((423,602),Image.Resampling.LANCZOS)
    bg.paste(thumb,(x+(450-thumb.width)//2,y+10+(602-thumb.height)//2))
   draw.text((x+9,y+621),(w["targetId"]+" | "+w["id"])[:60],fill=(31,31,31))
   draw.text((x+9,y+644),w["title"][:57],fill=(31,31,31))
   draw.text((x+9,y+666),w["artist"][:56],fill=(73,73,73))
  bg.save(dir_path/("contact-%02d.jpg"%(start//12+1)),quality=89,optimize=True)
def main():
 parser=argparse.ArgumentParser();parser.add_argument("--group",choices=list(GROUPS),required=True)
 parser.add_argument("--max-originals",type=int,default=36);args=parser.parse_args()
 base=ROOT/"artifacts/sacred-art-wide"/args.group;images=base/"originals"
 images.mkdir(parents=True,exist_ok=True)
 all_targets=json.loads(TARGETS.read_text(encoding="utf8"))["targets"]
 targets=[t for t in all_targets if GROUPS[args.group](t)]
 existing=json.loads(REGISTRY.read_text(encoding="utf8"))["artworks"]
 known={r["id"] for r in existing}
 rows=[]; search_stats=[]
 for t in targets:
  need=max(0,t["minimumOriginals"]-len(existing_matches(t,existing)))
  report=dict(id=t["id"],type=t["type"],priority=t["priority"],
   requested=t["minimumOriginals"],alreadyAcquired=len(existing_matches(t,existing)),
   added=0,borderlineHeld=0,searchQueries=[],status="UNSEARCHED")
  if need==0:
   report["status"]="EXISTING_ORIGINAL_COVERED";search_stats.append(report);continue
  if len(rows)>=args.max_originals:
   report["status"]="NOT_SEARCHED_BUDGET";search_stats.append(report);continue
  candidate_rejected=set()
  for q in t["queries"][:3]:
   if report["added"]>=need or len(rows)>=args.max_originals:break
   for src in ["met","cma"]:
    if report["added"]>=need or len(rows)>=args.max_originals:break
    attempts=0;match_count=0
    try:
     results=search_met(q) if src=="met" else search_cma(q)
     for hit in results[:28]:
      if report["added"]>=need or len(rows)>=args.max_originals:break
      if attempts>=11:break
      try:
       if src=="met":
        oid="met-"+str(hit)
        if oid in known or oid in candidate_rejected:continue
        art=metadata_met(hit)
       else:
        oid="cma-"+str(hit.get("id"))
        if oid in known or oid in candidate_rejected:continue
        art=metadata_cma(hit)
       attempts+=1
       if not art:continue
       evidence=confidence(art["title"],q)
       if not evidence or disfavored(art["title"]):
        candidate_rejected.add(oid);continue
       match_count+=1
       raw=get(art["originalUrl"])
       width,height,colour,qa_tier=picture_metadata(raw)
       filename=art["id"]+".jpg"
       (images/filename).write_bytes(raw)
       art.update(targetId=t["id"],contextIds=t["contexts"],subjectType=t["type"],
        targetLabel=t["title"],query=q,matchEvidence=evidence,
        width=width,height=height,colourFraction=colour,qaTier=qa_tier,
        bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest(),filename=filename,
        originalReviewed=False,cropReviewed=False,publicationApproved=False,
        status="ORIGINAL_ACQUIRED_TECHNICALLY_ONLY" if qa_tier=="PREFERRED_SOURCE_ORIGINAL" else "ORIGINAL_RETAINED_BORDERLINE_NOT_COUNTED")
       rows.append(art);known.add(art["id"])
       if qa_tier=="PREFERRED_SOURCE_ORIGINAL":report["added"]+=1
       else:report["borderlineHeld"]+=1
       print("SOURCE",qa_tier,args.group,t["id"],art["id"],art["title"][:55],flush=True)
       time.sleep(.45)
      except Exception as e:
       report.setdefault("errors",[]).append(str(e)[:190])
    except Exception as e:
     report.setdefault("errors",[]).append(f"{src} search {q}: {e}"[:180])
    report["searchQueries"].append(dict(q=q,source=src,inspected=min(len(results) if "results" in locals() else 0,28),
      matchCount=match_count))
  report["status"]="SOURCE_ORIGINAL_ACQUIRED" if report["added"]>=need else ("PARTIAL" if report["added"] else "UNRESOLVED")
  search_stats.append(report)
  print("TARGET",args.group,t["id"],"new",report["added"],"need",need,report["status"],flush=True)
 generate_contacts(rows,base)
 output=dict(schema="AO_SACRED_ART_WIDE_ACQUISITION_V1",group=args.group,
  warning="Originals are source-verified/technically filtered only; no visual, authenticity of subject, attribution, or user-app approval",
  count=sum(a["qaTier"]=="PREFERRED_SOURCE_ORIGINAL" for a in rows),
  borderlineHeldCount=sum(a["qaTier"]!="PREFERRED_SOURCE_ORIGINAL" for a in rows),
  artworks=rows,coverage=search_stats)
 (base/"acquisition.json").write_text(json.dumps(output,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
 print("FINISHED",args.group,"preferred",sum(a["qaTier"]=="PREFERRED_SOURCE_ORIGINAL" for a in rows),"borderline-held",sum(a["qaTier"]!="PREFERRED_SOURCE_ORIGINAL" for a in rows),"of",len(targets),"targets",
       "unresolved",sum(r["status"] in ("UNRESOLVED","PARTIAL") for r in search_stats),flush=True)
if __name__=="__main__":main()
