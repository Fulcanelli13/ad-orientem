#!/usr/bin/env python3
"""P78: verify and stage 48 previously screened Commons images. Never publish.

Three groups of 16; full source-file SHA1, author and licence-url guard, WebP
SHA256 and full-frame contact previews. All outcomes remain unapproved.
"""
import argparse,hashlib,html,importlib.util,io,json,re,time
from pathlib import Path
from urllib.parse import urlencode,urlsplit
from PIL import Image,ImageOps,ImageDraw
ROOT=Path(__file__).resolve().parents[1]
MANIFEST=ROOT/"data/geography/research/p78-48-candidate-manifest.v1.json"
OUT=ROOT/"data/geography/research/p78-review-artifacts"
spec=importlib.util.spec_from_file_location("commons_p72",ROOT/"tools/verify-priority-commons-p72.py")
api=importlib.util.module_from_spec(spec)
spec.loader.exec_module(api)
Image.MAX_IMAGE_PIXELS=34_000_000
LICENSES={
 "CC0":("CC0-1.0","/publicdomain/zero/1.0/"),
 "CC BY 2.0":("CC-BY-2.0","/licenses/by/2.0/"),
 "CC BY 3.0":("CC-BY-3.0","/licenses/by/3.0/"),
 "CC BY 4.0":("CC-BY-4.0","/licenses/by/4.0/"),
 "CC BY SA 2.0":("CC-BY-SA-2.0","/licenses/by-sa/2.0/"),
 "CC BY SA 3.0":("CC-BY-SA-3.0","/licenses/by-sa/3.0/"),
 "CC BY SA 4.0":("CC-BY-SA-4.0","/licenses/by-sa/4.0/")
}
def insist(cond,msg):
 if not cond:raise ValueError(msg)
def clean(v):
 return " ".join(html.unescape(re.sub(r"<[^>]*>"," ",str(v or ""))).split())
def normalize(v):
 return re.sub(r"[^a-z0-9]","",clean(v).lower())
def canonical_license(label,uri):
 insist(label in LICENSES,"Unsupported Commons source licence "+str(label))
 normalized,want=LICENSES[label]
 parts=urlsplit(uri)
 # Commons may link a human-readable deed, including localized /deed.fr
 # rather than the licence root. Both names are individually grant-checked.
 path=parts.path
 root=want.rstrip("/")
 insist(parts.scheme in ("http","https") and parts.hostname=="creativecommons.org" and
  not parts.username and not parts.password and parts.port in (None,80,443) and
  (path in (root,root+"/") or
   re.fullmatch(re.escape(root)+r"/deed(?:\.[a-zA-Z-]{2,12})?",path)),
  "Creative Commons grant URI is not an exact licensed root/deed")
 return normalized,"https://creativecommons.org"+want
def source_rows():
 data=json.loads(MANIFEST.read_text(encoding="utf8"));rows=data["candidates"]
 insist(data["schema"]=="AO_P78_48_PENDING_SOURCE_CHECK_V1" and len(rows)==48,"Wrong P78 manifest")
 insist(sum(x["requested_role"]=="HERO" for x in rows)==17,"Wrong main hero cohort")
 insist(len({x["original_sha1"] for x in rows})==48,"Duplicate source originals")
 insist(all(x["published"] is False and x["final_photo_approved"] is False for x in rows),"No automatic approval")
 for x in rows:
  insist(re.fullmatch(r"[0-9a-f]{40}",x["original_sha1"]) is not None,"Wrong SHA1 pin")
  insist(x["claimed_license"] in LICENSES,"Unexpected licence claim")
 return rows
def get_metadata(rows):
 q=urlencode({"action":"query","format":"json","formatversion":"2","prop":"imageinfo",
  "iiprop":"url|sha1|size|mime|extmetadata",
  "titles":"|".join(x["file_title"] for x in rows)})
 obj=api.get_url_json("https://commons.wikimedia.org/w/api.php?"+q)
 pages=obj["query"]["pages"]
 return {x["title"]:x for x in (pages.values() if isinstance(pages,dict) else pages) if "missing" not in x}
def verified_metadata(x,page):
 insist(page and int(page.get("pageid",0))==x["commons_page_id"],"Exact Commons file/page ID drift")
 info=page["imageinfo"][0]
 insist(info.get("sha1")==x["original_sha1"],"Source Commons SHA1 changed")
 insist(info.get("mime") in ("image/jpeg","image/png") and info.get("size",0)<=15*1024*1024,"Unsupported file type or >15MiB")
 insist(int(info["width"])==x["source_width"] and int(info["height"])==x["source_height"],"Source dimensions drift")
 insist(min(info["width"],info["height"])>=900,"Too-small original")
 ext=info.get("extmetadata") or {}
 fld=lambda k:clean((ext.get(k) or {}).get("value"))
 current=fld("LicenseShortName")
 insist(normalize(current)==normalize(x["claimed_license"]),"Commons licence label changed "+current)
 lic,canonical=canonical_license(x["claimed_license"],fld("LicenseUrl"))
 artist=fld("Artist")
 insist(artist and normalize(x["claimed_artist"]) in normalize(artist),"Commons author attribution mismatch")
 return info,{"source_license":lic,"canonical_license_url":canonical,
  "source_artist":artist[:320],"source_description":fld("ImageDescription")[:480],
  "source_date":fld("DateTimeOriginal")[:90],"license_source_url":fld("LicenseUrl")[:240]}
def sheet(items,chunk):
 W,H=560,405
 canvas=Image.new("RGB",(W*4,H*4),"#f9f7f4")
 dr=ImageDraw.Draw(canvas)
 for i,(x,row,preview) in enumerate(items):
  xx=(i%4)*W;yy=(i//4)*H
  if preview is not None:
   preview.thumbnail((W-16,H-78),Image.Resampling.LANCZOS)
   canvas.paste(preview,(xx+(W-preview.width)//2,yy+(H-78-preview.height)//2))
  else:
   dr.rectangle((xx+12,yy+10,xx+W-12,yy+H-83),outline="#a96d60",width=2)
   dr.text((xx+30,yy+100),"SOURCE HOLD",fill="#a63a35")
  dr.text((xx+10,yy+H-77),f'{x["number"]:03d} | {row["status"][:30]}',fill="#333333")
  dr.text((xx+10,yy+H-58),x["place_label"][:65],fill="#111111")
  dr.text((xx+10,yy+H-40),x["file_title"][5:][:72],fill="#444444")
  dr.text((xx+10,yy+H-19),x["requested_role"]+" | "+x["claimed_license"],fill="#666666")
 path=OUT/f"p78-contact-{chunk:02d}.jpg"
 canvas.save(path,quality=88)
 return str(path)
def main(rows,delay):
 insist(1.5<=delay<=8.0,"Rate limit must be 1.5 to 8 seconds")
 OUT.mkdir(parents=True,exist_ok=True)
 results=[]
 for seg in range(3):
  subset=rows[seg*16:(seg+1)*16]
  try:pages=get_metadata(subset);group_error=None
  except Exception as exc:pages={};group_error=type(exc).__name__+": "+str(exc)[:200]
  thumbs=[]
  for x in subset:
   r={"schema":"AO_P78_SOURCE_BYTES_REVIEW_V1","number":x["number"],
      "place_id":x["place_id"],"file_title":x["file_title"],"source_url":x["source_url"],
      "expected_sha1":x["original_sha1"],"status":"HOLD",
      "original_sha1_verified":False,"derivative_sha256":None,"rights_cleared":False,
      "subject_verified":False,"final_visual_approved":False,"published":False}
   im=None
   try:
    insist(group_error is None,"Commons metadata request failed: "+str(group_error))
    info,source=verified_metadata(x,pages.get(x["file_title"]))
    r.update(source)
    binary,actual=api.download_original(info["url"])
    insist(actual==x["original_sha1"],"Original-byte SHA1 mismatch")
    with Image.open(io.BytesIO(binary)) as raw:
     insist(raw.format in ("JPEG","PNG") and raw.size==(info["width"],info["height"]),
      "Original decode/dimensions mismatch")
     img=ImageOps.exif_transpose(raw).convert("RGB")
     img.thumbnail((1280,1280),Image.Resampling.LANCZOS)
     der=OUT/f'p78-{x["number"]:03d}.webp'
     img.save(der,"WEBP",quality=84,method=6)
     im=img.copy();w,h=img.size
    b=der.read_bytes()
    insist(len(b)>10000 and b[:4]==b"RIFF" and b[8:12]==b"WEBP","Invalid WebP derivative")
    with Image.open(io.BytesIO(b)) as readback:
     insist(readback.format=="WEBP" and readback.size==(w,h),"WebP decode/dimensions changed")
    r.update({"status":"ORIGINAL_AND_DERIVATIVE_VERIFIED_NOT_APPROVED",
      "original_sha1_verified":True,"original_size":len(binary),
      "derivative_file":der.name,"derivative_sha256":hashlib.sha256(b).hexdigest(),
      "derivative_size":len(b),"width":w,"height":h})
   except Exception as exc:
    r.update({"status":"HOLD_SOURCE_OR_RIGHTS_RECHECK","hold_reason":type(exc).__name__+": "+str(exc)[:250]})
   results.append(r);thumbs.append((x,r,im))
   print("P78_RESULT="+json.dumps(r,ensure_ascii=False),flush=True)
   if len(results)<len(rows):time.sleep(delay)
  print("P78_CONTACT="+sheet(thumbs,seg+1),flush=True)
 (OUT/"p78-results.jsonl").write_text("".join(json.dumps(x,ensure_ascii=False)+"\n" for x in results),encoding="utf8")
 totals={"attempted":len(results),"verified":sum(x["original_sha1_verified"] for x in results),
         "held":sum(not x["original_sha1_verified"] for x in results),
         "published":0,"final_approved":0}
 (OUT/"p78-summary.json").write_text(json.dumps(totals,indent=2)+"\n",encoding="utf8")
 print("P78_SUMMARY="+json.dumps(totals),flush=True)
 insist(totals["verified"]>0,"No files passed frozen SHA1, licence and decode gates")
if __name__=="__main__":
 p=argparse.ArgumentParser();p.add_argument("--dry-run",action="store_true");p.add_argument("--delay",type=float,default=1.6)
 args=p.parse_args();rows=source_rows()
 if args.dry_run:print("P78_OFFLINE_PASS="+json.dumps({"count":len(rows),"hero":17,"gallery":31,"approved":0}))
 else:main(rows,args.delay)
