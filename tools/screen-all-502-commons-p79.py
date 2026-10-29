#!/usr/bin/env python3
"""Bulk screen ALL 502 frozen Commons candidate assignments in a single campaign.

Sharding exists for Commons API constraints only. All shards belong to ONE
review/export; no human selects 17/30/48 photos between ingestion jobs.
Never automatically approves subjects, licences, artworks or publication.
Metadata original SHA1 is a Commons claim, not downloaded-original verification.
"""
from __future__ import annotations
import argparse,hashlib,html,io,json,re,time,urllib.error,urllib.parse,urllib.request
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/"data/geography/research/p79-all-502-commons-review.v1.json"
UA="AdOrientem-502CommonsBulkReview/1.0 (https://github.com/Fulcanelli13/ad-orientem; read-only photography research)"
API="https://commons.wikimedia.org/w/api.php"
ALLOWED={"upload.wikimedia.org","thumb.wikimedia.org","commons.wikimedia.org"}
LICENSE_PATHS={
 "CC0":"/publicdomain/zero/1.0",
 "CC BY 2.0":"/licenses/by/2.0","CC BY 3.0":"/licenses/by/3.0","CC BY 4.0":"/licenses/by/4.0",
 "CC BY SA 2.0":"/licenses/by-sa/2.0","CC BY SA 3.0":"/licenses/by-sa/3.0",
 "CC BY SA 4.0":"/licenses/by-sa/4.0",
}
def assert_ok(cond,msg):
 if not cond:raise ValueError(msg)
def clean(v):
 return " ".join(html.unescape(re.sub(r"<[^>]*>"," ",str(v or ""))).split())
def norm(v):
 return re.sub(r"[^a-z0-9]","",clean(v).lower())
def load():
 d=json.loads(SOURCE.read_text(encoding="utf-8"))
 rows=d["records"]
 assert_ok(d.get("schema")=="AO_P79_ONE_CAMPAIGN_ALL_502_COMMONS_ASSIGNMENTS_V1","Wrong input")
 assert_ok(len(rows)==502 and [r["id"] for r in rows]==list(range(1,503)),"All 502 source assignments mandatory")
 assert_ok(len({r["original_sha1"] for r in rows})==501,"Frozen original count changed")
 assert_ok(all(not r["subject_identity_verified"] and not r["rights_cleared"] and not r["original_bytes_verified"] for r in rows),"Unsafe preapproval")
 return rows
def get(url,cap,accept,tries=3):
 p=urllib.parse.urlsplit(url)
 assert_ok(p.scheme=="https" and p.hostname in ALLOWED and not p.username and not p.password and p.port in (None,443),"Unapproved media source host")
 last=None
 for n in range(tries):
  try:
   req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":accept})
   with urllib.request.urlopen(req,timeout=35) as res:
    final=urllib.parse.urlsplit(res.geturl())
    assert_ok(final.scheme=="https" and final.hostname in ALLOWED,"Media URL redirected off Commons")
    data=res.read(cap+1)
    assert_ok(len(data)<=cap,"Oversized media response")
    return data
  except (urllib.error.HTTPError,urllib.error.URLError,TimeoutError) as exc:
   last=exc
   if n<tries-1:time.sleep(2+4*n)
 raise last
def api_query(rows):
 req=urllib.parse.urlencode({"action":"query","format":"json","formatversion":"2",
 "prop":"imageinfo","iiprop":"url|sha1|size|mime|extmetadata",
 "iiurlwidth":"540","titles":"|".join(r["source_file"] for r in rows)})
 result=json.loads(get(API+"?"+req,5_000_000,"application/json"))
 pages=result["query"]["pages"]
 return {p["title"]:p for p in (pages.values() if isinstance(pages,dict) else pages) if not p.get("missing")}
def legit_license(label,url):
 if label not in LICENSE_PATHS:return False,"UNSUPPORTED_LICENSE"
 u=urllib.parse.urlsplit(url)
 stem=LICENSE_PATHS[label]
 path=u.path.rstrip("/")
 proper=(path==stem or bool(re.fullmatch(re.escape(stem)+r"/deed(?:\.[a-zA-Z-]{2,12})?",path)))
 if u.scheme not in ("http","https") or u.hostname!="creativecommons.org" or u.username or u.password or not proper:
  return False,"LICENSE_URL_OR_VERSION_CONFLICT"
 return True,"VALID_SOURCE_METADATA_NOT_APPROVED"
def verify_meta(row,p):
 assert_ok(p is not None and int(p.get("pageid",0))==row["commons_page_id"],"COMMONS_PAGE_ID_MISMATCH")
 info=p.get("imageinfo",[None])[0]
 assert_ok(info is not None,"COMMONS_IMAGEINFO_MISSING")
 assert_ok(info.get("sha1")==row["original_sha1"],"COMMONS_SOURCE_SHA1_METADATA_CHANGED")
 assert_ok(info.get("mime") in ("image/jpeg","image/png","image/webp"),"UNSUPPORTED_ORIGINAL_IMAGE_MIME")
 meta=info.get("extmetadata") or {}
 field=lambda k:clean((meta.get(k) or {}).get("value"))
 current=field("LicenseShortName")
 claim=norm(row["license_claim"])
 cur=norm(current)
 # Some Commons pages identify CC0 as "CC0 1.0".
 if claim in ("cc0","cc010"):assert_ok(cur in ("cc0","cc010"),"LICENSE_CLAIM_CHANGED")
 elif claim=="publicdomain":raise ValueError("PUBLIC_DOMAIN_REQUIRES_INDIVIDUAL_RIGHTS_REVIEW")
 else:assert_ok(cur==claim,"LICENSE_CLAIM_CHANGED")
 ok,reason=legit_license(row["license_claim"] if claim!="cc010" else "CC0",field("LicenseUrl"))
 assert_ok(ok,reason)
 author=field("Artist")
 assert_ok(author and norm(author) not in ("unknown","anonymous"),"UNVERIFIED_ARTIST")
 assert_ok(int(info.get("width",0))>=480 and int(info.get("height",0))>=480,"SOURCE_TOO_SMALL")
 return info,{"license":current,"license_url":field("LicenseUrl"),"author":author[:260],
  "source_description":field("ImageDescription")[:250],"current_sha1_metadata":info["sha1"]}
def thumbnail(info):
 u=info.get("thumburl")
 assert_ok(bool(u),"COMMONS_THUMBNAIL_MISSING")
 contents=get(u,1_500_000,"image/*",tries=2)
 with Image.open(io.BytesIO(contents)) as img:
  assert_ok(img.format in ("JPEG","PNG","WEBP"),"THUMBNAIL_FORMAT_UNSUPPORTED")
  assert_ok(img.width>80 and img.height>80,"THUMBNAIL_TOO_SMALL")
  img=ImageOps.exif_transpose(img)
  img.thumbnail((520,320),Image.Resampling.LANCZOS)
  im=img.convert("RGB")
  return im.copy()
def sheet(rows,group,out):
 w,h=380,300
 board=Image.new("RGB",(w*5,h*4),"#f4f4ef")
 dr=ImageDraw.Draw(board)
 for j,(source,record,preview) in enumerate(rows):
  x=(j%5)*w;y=(j//5)*h
  if preview:
   thumb=preview.copy();thumb.thumbnail((w-14,h-86),Image.Resampling.LANCZOS)
   board.paste(thumb,(x+(w-thumb.width)//2,y+(h-86-thumb.height)//2))
  else:
   dr.rectangle((x+8,y+5,x+w-8,y+h-88),outline="#ac7062",width=2)
   dr.text((x+20,y+70),"NOT VERIFIED",fill="#a2483b")
  dr.text((x+9,y+h-79),"#"+str(source["id"])+" "+record["status"][:24],fill="#222222")
  dr.text((x+9,y+h-57),source["entity_label"][:51],fill="#333333")
  dr.text((x+9,y+h-34),source["source_file"].removeprefix("File:")[:50],fill="#555555")
  dr.text((x+9,y+h-16),str(record.get("license") or source["license_claim"])[:48],fill="#777777")
 path=out/f"p79-contact-{group:03d}.jpg"
 board.save(path,quality=84)
 return path
def main(rows,shard,step,out,delay):
 assert_ok(shard>=0 and step==105 and shard*step<502,"Invalid shard selection")
 assert_ok(0.1<=delay<=3,"Delay must be bounded")
 out.mkdir(parents=True,exist_ok=True)
 current=rows[shard*step:min((shard+1)*step,len(rows))]
 records=[];previews=[];batchno=0
 for offset in range(0,len(current),20):
  group=current[offset:offset+20]
  try:pages=api_query(group);api_error=None
  except Exception as exc:pages={};api_error=str(exc)[:220]
  for row in group:
   entry={"schema":"AO_P79_BULK_SOURCE_META_SCREEN_V1","id":row["id"],"entity_id":row["entity_id"],
     "owner":row["owner"],"original_sha1":row["original_sha1"],"source_page":row["source_page"],
     "original_bytes_verified":False,"rights_cleared":False,"subject_verified":False,"approved":False,
     "published":row["published"],"status":"HOLD","preview_verified":False}
   preview=None
   try:
    assert_ok(api_error is None,"COMMONS_METADATA_BATCH_ERROR: "+str(api_error))
    info,metadata=verify_meta(row,pages.get(row["source_file"]))
    entry.update(metadata)
    entry["source_meta_verified"]=True
    try:
     preview=thumbnail(info)
     name="p79-thumbnails/p79-%03d.jpg"%row["id"]
     path=out/name;path.parent.mkdir(exist_ok=True)
     preview.save(path,quality=80)
     entry.update({"status":"SOURCE_METADATA_AND_THUMBNAIL_SCREENED","preview_verified":True,
                   "thumbnail_sha256":hashlib.sha256(path.read_bytes()).hexdigest()})
    except Exception as exc:
     entry["status"]="SOURCE_METADATA_OK_THUMBNAIL_HOLD"
     entry["preview_error"]=type(exc).__name__+": "+str(exc)[:160]
   except Exception as exc:
    entry["status"]="HOLD_SOURCE_IDENTITY_OR_RIGHTS"
    entry["hold_reason"]=type(exc).__name__+": "+str(exc)[:160]
   records.append(entry);previews.append((row,entry,preview))
   print("P79_RECORD="+json.dumps(entry,ensure_ascii=False),flush=True)
   time.sleep(delay)
  sheet(previews[-len(group):],shard*6+batchno,out)
  batchno+=1
 report=out/("p79-shard-%d.json"%shard)
 report.write_text(json.dumps({"schema":"AO_P79_ALL_502_SHARD_V1","shard":shard,"count":len(records),
     "source_meta_verified":sum(x.get("source_meta_verified",False) for x in records),
     "thumbnails":sum(x["preview_verified"] for x in records),"records":records},ensure_ascii=False,indent=2)+"\n",encoding="utf8")
 print("P79_SHARD="+json.dumps({"shard":shard,"attempted":len(records),"checked":sum(x.get("source_meta_verified",False) for x in records),
    "preview_verified":sum(x["preview_verified"] for x in records),"holds":sum(not x.get("source_meta_verified",False) for x in records)}),flush=True)
 assert_ok(len(records)==len(current),"Missing source records")
if __name__=="__main__":
 ap=argparse.ArgumentParser()
 ap.add_argument("--shard",type=int,required=True);ap.add_argument("--shard-size",type=int,default=105)
 ap.add_argument("--out",type=Path,default=ROOT/"data/geography/research/p79-run")
 ap.add_argument("--delay",type=float,default=0.25)
 ap.add_argument("--dry-run",action="store_true")
 args=ap.parse_args();rows=load()
 if args.dry_run:
  assert_ok(args.shard_size==105 and 0<=args.shard<5,"Expected full campaign 5 shards")
  print("P79_OFFLINE_PASS="+json.dumps({"total":len(rows),"shard":args.shard,"rows":len(rows[args.shard*105:(args.shard+1)*105]),"published_without_review":0}))
 else:main(rows,args.shard,args.shard_size,args.out,args.delay)
