#!/usr/bin/env python3
"""Acquire source-confirmed major-feast museum paintings, review only.

No photo, engraving, fresco, icon substitute or Commons rights claim is silently
accepted; each downloaded candidate gets a SHA256 and a rejection reason.
Kress public-domain records must never be relabelled museum CC0.
"""
import hashlib,io,json,time
from pathlib import Path
from urllib.error import HTTPError,URLError
from urllib.parse import quote
from urllib.request import Request,urlopen
from PIL import Image,ImageOps,ImageDraw
import numpy as np
ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/"data/calendar/sacred-art-major-feast-research-leads.v1.json"
OUT=ROOT/"artifacts/sacred-art-major-feast"
ORIGINALS=OUT/"originals"
AGENT="AdOrientemResearch/2.2 (museum public-domain artwork acquisition)"
ALLOWED=("https://bmmweb.blob.core.windows.net/kress/","https://images.metmuseum.org/CRDImages/")
def get(url,budget=35_000_000):
 if not url.startswith("https://"):raise ValueError("HTTPS required")
 err=None
 for attempt in range(3):
  try:
   with urlopen(Request(url,headers={"User-Agent":AGENT,"Accept":"image/jpeg,application/json,*/*"}),timeout=34) as resp:
    size=int(resp.headers.get("Content-Length") or 0)
    if size>budget:raise ValueError("Original exceeds 35MB")
    raw=resp.read(budget+1)
    if len(raw)>budget:raise ValueError("Original exceeds 35MB")
    return raw
  except (HTTPError,URLError,TimeoutError,OSError) as e:
   err=str(e)
   if isinstance(e,HTTPError) and e.code not in (403,429,500,502,503,504):break
   time.sleep(2+attempt*3)
 raise RuntimeError(err or "unknown retrieval error")
def verify(raw):
 with Image.open(io.BytesIO(raw)) as img:
  if img.format!="JPEG":raise ValueError("Original not JPEG")
  img.load();im=ImageOps.exif_transpose(img)
  w,h=im.size
  if max(w,h)<2500:raise ValueError("Original below 2500-pixel minimum (%s x %s)"%(w,h))
  mini=im.convert("RGB");mini.thumbnail((220,220))
  pix=np.asarray(mini,dtype=np.int16)
  colour=float(np.mean((np.max(pix,axis=2)-np.min(pix,axis=2))>18))
  if colour<.07:raise ValueError("Original near monochrome")
  return w,h,round(colour,4)
def met_validate(lead):
 obj=json.loads(get(lead["metadataUrl"],2_000_000))
 if str(obj.get("objectID"))!=lead["id"][4:]:raise ValueError("Met ID mismatch")
 if obj.get("classification")!="Paintings" or obj.get("isPublicDomain") is not True:raise ValueError("Not an eligible Met CC0 painting")
 title=str(obj.get("title") or "").strip()
 if title.lower()!=lead["title"].lower():raise ValueError("Museum subject/title changed: "+title)
 url=str(obj.get("primaryImage") or "")
 if not url.startswith("https://images.metmuseum.org/CRDImages/") or "/original/" not in url:
  raise ValueError("No original museum JPEG URL")
 return quote(url,safe=":/-_.~%")
def sheet(acquired):
 for offset in range(0,len(acquired),8):
  page=Image.new("RGB",(1600,1040*(min(2,(len(acquired)-offset+3)//4))),(237,235,229))
  draw=ImageDraw.Draw(page)
  for i,a in enumerate(acquired[offset:offset+8]):
   x=(i%4)*400;y=(i//4)*1040
   with Image.open(ORIGINALS/a["filename"]) as im:
    pic=ImageOps.exif_transpose(im).convert("RGB")
    pic.thumbnail((372,920),Image.Resampling.LANCZOS)
    page.paste(pic,(x+(400-pic.width)//2,y+5+(920-pic.height)//2))
   draw.text((x+8,y+928),a["id"]+" "+a["relation"],fill=(25,25,25))
   draw.text((x+8,y+951),a["title"][:46],fill=(25,25,25))
   draw.text((x+8,y+974),a["artist"][:46],fill=(55,55,55))
  page.save(OUT/("contact-%02d.jpg"%(1+offset//8)),quality=88)
def main():
 ORIGINALS.mkdir(parents=True,exist_ok=True)
 source=json.loads(SOURCE.read_text(encoding="utf8"))
 assert source["schema"]=="AO_SACRED_ART_MAJOR_FEAST_RESEARCH_LEADS_V1"
 existing={a["id"] for a in json.loads((ROOT/"data/calendar/sacred-art-candidates.v1.json").read_text(encoding="utf8"))["artworks"]}
 rows=[];acquired=[]
 for lead in source["leads"]:
  a={**lead,"status":"NOT_ACQUIRED","publicationApproved":False,"artisticReview":"PENDING","globalReuseApproved":False}
  try:
   if lead["id"] in existing:
    a["status"]="ALREADY_IN_REGISTRY"
   else:
    url=met_validate(lead) if lead.get("metadataUrl") else lead["originalUrl"]
    if not any(url.startswith(root) for root in ALLOWED):raise ValueError("Source image URL not official whitelisted domain")
    raw=get(url)
    w,h,chroma=verify(raw)
    filename=lead["id"]+".jpg"
    (ORIGINALS/filename).write_bytes(raw)
    a.update(status="ORIGINAL_ACQUIRED_REVIEW_ONLY",filename=filename,
     resolvedOriginalUrl=url,sha256=hashlib.sha256(raw).hexdigest(),
     width=w,height=h,colourFraction=chroma,bytes=len(raw),
     rights="CC0_MUSEUM_API_VERIFIED" if lead.get("metadataUrl") else "PUBLIC_DOMAIN_KRESS_REUSE_REVIEW_HOLD")
    acquired.append(a)
  except Exception as e:
   a["status"]="SOURCE_ORIGINAL_REJECTED"
   a["rejectionReason"]=str(e)
  rows.append(a)
  print("ART",a["id"],a["status"],a.get("rejectionReason",""),flush=True)
 sheet(acquired)
 output={"schema":"AO_SACRED_ART_MAJOR_FEAST_ACQUISITION_V1",
  "note":"Acquired files are new source originals only: subject, rights, crop and visual quality must be manually approved; Kress is NOT CC0.",
  "leadCount":len(rows),"acquiredCount":len(acquired),
  "sourceClassifiedCC0":sum(r["rights"]=="CC0_MUSEUM_API_VERIFIED" for r in acquired),
  "kressPublicDomainHeld":sum(r["rights"]=="PUBLIC_DOMAIN_KRESS_REUSE_REVIEW_HOLD" for r in acquired),
  "artworks":rows}
 (OUT/"acquisition.json").write_text(json.dumps(output,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
 print("SUMMARY",json.dumps({k:output[k] for k in ("leadCount","acquiredCount","sourceClassifiedCC0","kressPublicDomainHeld")}),flush=True)
 print("RECONCILE_MANIFEST",json.dumps([{k:a[k] for k in ("id","targetIds","relation","sha256","width","height","colourFraction","bytes","filename","rights")} for a in acquired],sort_keys=True),flush=True)
if __name__=="__main__":main()
