#!/usr/bin/env python3
"""P93: bounded, shardable original-file verification of 28 pinned Commons files.
Never infer a worship building, silently substitute Commons titles, or publish media.
All errors remain individually documented research holds. No paid services.
"""
import argparse, hashlib, html, io, json, pathlib, re, time, urllib.parse, urllib.request
from PIL import Image, ImageOps, ImageStat

INPUT=pathlib.Path("data/directory/research/p93-28-pinned-commons-originals-intake-20261029.json")
UA="AdOrientemP93ChurchPhotoOriginalAudit/1.0 (https://github.com/Fulcanelli13/ad-orientem)"
COMMONS="https://commons.wikimedia.org/w/api.php"
MAX_BYTES=16_000_000
Image.MAX_IMAGE_PIXELS=40_000_000
CANON={
 "CC0":"https://creativecommons.org/publicdomain/zero/1.0/",
 "CC BY 2.0":"https://creativecommons.org/licenses/by/2.0/",
 "CC BY 3.0":"https://creativecommons.org/licenses/by/3.0/",
 "CC BY 4.0":"https://creativecommons.org/licenses/by/4.0/",
 "CC BY-SA 2.0":"https://creativecommons.org/licenses/by-sa/2.0/",
 "CC BY-SA 3.0":"https://creativecommons.org/licenses/by-sa/3.0/",
 "CC BY-SA 4.0":"https://creativecommons.org/licenses/by-sa/4.0/"
}
def get(url,allowed,limit=MAX_BYTES):
 p=urllib.parse.urlsplit(url)
 if p.scheme!="https" or p.hostname not in allowed or p.username or p.password or p.port not in (None,443):
  raise ValueError("unapproved-source-host")
 last=None
 for i in range(3):
  try:
   req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"*/*","Accept-Encoding":"identity"})
   with urllib.request.urlopen(req,timeout=45) as stream:
    end=urllib.parse.urlsplit(stream.geturl())
    if end.scheme!="https" or end.hostname not in allowed:raise ValueError("unsafe-redirect")
    data=stream.read(limit+1)
   if not 0<len(data)<=limit:raise ValueError("oversized-or-empty-response")
   return data
  except Exception as e:
   last=e
   if i<2:time.sleep(2*(i+1))
 raise RuntimeError("source-request-unavailable: "+type(last).__name__) from last
def clean(s):
 return " ".join(html.unescape(re.sub(r"<[^>]+>"," ",str(s or ""))).split())
def metadata_string(md,key):
 return clean((md.get(key) or {}).get("value",""))
def licence(md):
 label=metadata_string(md,"LicenseShortName")
 norm=re.sub(r"[^A-Z0-9]","",label.upper())
 patterns={re.sub(r"[^A-Z0-9]","",x.upper()):x for x in CANON}
 patterns["CC010"]="CC0"
 kind=patterns.get(norm)
 if not kind:raise ValueError("unknown-or-disallowed-license-short-name: "+label[:70])
 link=metadata_string(md,"LicenseUrl")
 url=urllib.parse.urlsplit(link)
 expected=urllib.parse.urlsplit(CANON[kind])
 if url.hostname!="creativecommons.org" or url.scheme not in ("https","http") or not url.path.rstrip("/").startswith(expected.path.rstrip("/")):raise ValueError("license-url-not-canonical")
 author=metadata_string(md,"Artist")
 if not author or len(author)>1500:raise ValueError("no-usable-attribution-author")
 return kind,CANON[kind],author
def analyze(row,out):
 base={"global_source_row":row["global_source_row"],"physical_anchor_id":row["physical_anchor_id"],
  "site_name":row["site_name"],"file_title":row["commons_title"],
  "commons_page_id":row["commons_page_id"],
  "source_sha1":row["expected_original_sha1"],"source_url":row["commons_source_url"],
  "publication":"RESEARCH_ONLY_NEVER_APP_VISIBLE","image_approved":False,
  "rights_independently_approved":False,"exact_site_production_verified":False}
 try:
  parameters={"action":"query","format":"json","formatversion":"2","prop":"imageinfo",
   "titles":row["commons_title"],"iiprop":"url|sha1|size|mime|extmetadata"}
  link=COMMONS+"?"+urllib.parse.urlencode(parameters)
  pages=json.loads(get(link,{"commons.wikimedia.org"},3_000_000))["query"]["pages"]
  if len(pages)!=1:raise ValueError("not-a-single-source-page")
  page=pages[0]
  if page.get("title")!=row["commons_title"] or page.get("pageid")!=row["commons_page_id"]:
   raise ValueError("source-title-or-pageid-changed")
  info=page["imageinfo"][0]
  if str(info.get("sha1","")).lower()!=row["expected_original_sha1"]:
   raise ValueError("original-sha1-revision-changed")
  if info.get("mime") not in ("image/jpeg","image/png","image/webp"):
   raise ValueError("unsupported-visual-source-format")
  if not (500<=int(info.get("width",0))<=15000 and 500<=int(info.get("height",0))<=15000):
   raise ValueError("source-resolution-outside-bounds")
  if not 1000<int(info.get("size",0))<=MAX_BYTES:raise ValueError("source-file-oversized")
  kind,license_link,author=licence(info["extmetadata"])
  u=urllib.parse.urlsplit(info.get("url",""))
  if u.scheme!="https" or u.hostname!="upload.wikimedia.org":raise ValueError("original-not-from-Wikimedia")
  original=get(info["url"],{"upload.wikimedia.org"})
  if len(original)!=info["size"]:raise ValueError("original-byte-length-conflict")
  if hashlib.sha1(original).hexdigest()!=row["expected_original_sha1"]:
   raise ValueError("original-bytes-sha1-conflict")
  try:
   with Image.open(io.BytesIO(original)) as im:im.verify()
   with Image.open(io.BytesIO(original)) as im:
    if im.size!=(info["width"],info["height"]):raise ValueError("decoded-dimensions-conflict")
    if im.format not in ("JPEG","PNG","WEBP") or getattr(im,"is_animated",False):
     raise ValueError("unsupported-original-image")
    rgb=ImageOps.exif_transpose(im).convert("RGB")
    gray=ImageOps.grayscale(rgb)
    stat=ImageStat.Stat(gray.resize((300,300)))
    visual_flags=[]
    if stat.stddev[0]<19:visual_flags.append("LOW_CONTRAST_REVIEW")
    if min(rgb.size)<1000:visual_flags.append("SMALL_RESOLUTION_REVIEW")
    thumb=rgb.copy();thumb.thumbnail((1100,1100),Image.Resampling.LANCZOS)
    target=out/(str(row["global_source_row"])+"-quality-preview.webp")
    thumb.save(target,format="WEBP",quality=83,method=4)
  except Exception as e:
   raise ValueError("decode-or-quality-validation-failed: "+type(e).__name__) from e
  ext={"image/jpeg":".jpg","image/png":".png","image/webp":".webp"}[info["mime"]]
  name=str(row["global_source_row"])+"-original"+ext
  (out/name).write_bytes(original)
  return {**base,"status":"ORIGINAL_SOURCE_BYTES_HASH_VERIFIED",
   "original_file":name,"original_sha256":hashlib.sha256(original).hexdigest(),
   "original_bytes":len(original),"dimensions":[int(info["width"]),int(info["height"])],
   "mime":info["mime"],"license":kind,"license_url":license_link,"credit":author,
   "attribution_required":metadata_string(info["extmetadata"],"AttributionRequired").lower()=="true",
   "preview_file":target.name,"preview_sha256":hashlib.sha256(target.read_bytes()).hexdigest(),
   "technical_visual_flags":visual_flags,"human_original_quality_review":False}
 except Exception as e:
  return {**base,"status":"HOLD_SOURCE_ORIGINAL_NOT_VERIFIED",
   "reason":str(e)[:200],"human_original_quality_review":False}

def main():
 ap=argparse.ArgumentParser()
 ap.add_argument("--shard",type=int,required=True,choices=range(3))
 ap.add_argument("--output",type=pathlib.Path,required=True)
 args=ap.parse_args()
 data=json.loads(INPUT.read_text(encoding="utf8"))
 if data.get("schema")!="AO_P93_BULK_28_COMMONS_FROZEN_ORIGINAL_INTAKE_V1" or len(data["candidates"])!=28:
  raise ValueError("unsafe-P93-source-intake")
 if args.output.exists():raise FileExistsError("output already exists")
 args.output.mkdir(parents=True)
 selected=[x for n,x in enumerate(data["candidates"]) if n%3==args.shard]
 outcomes=[]
 for idx,row in enumerate(selected):
  rec=analyze(row,args.output)
  outcomes.append(rec)
  print("P93",args.shard,idx+1,len(selected),row["global_source_row"],rec["status"],flush=True)
  time.sleep(.4)
 result={"schema":"AO_P93_ORIGINAL_SOURCE_SHARD_RESEARCH_V1","shard":args.shard,
  "input_count":len(selected),"retrieved":sum(x["status"]=="ORIGINAL_SOURCE_BYTES_HASH_VERIFIED" for x in outcomes),
  "held":sum(x["status"].startswith("HOLD_") for x in outcomes),
  "rights_approved":0,"photos_published":0,"records":outcomes}
 (args.output/("p93-shard-"+str(args.shard)+".json")).write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
 print("P93_SHARD_COMPLETE",args.shard,result["retrieved"],result["held"],flush=True)

if __name__=="__main__": main()
