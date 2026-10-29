#!/usr/bin/env python3
"""P76: reverify thirty curated P75 original photos and stage uncropped WebPs.

Research-only. No production galleries, no approved asset paths, no push.
Each original SHA1, page identity, source-licence URL and artist is checked.
The source description is saved as untrusted evidence, not used to approve
site identity automatically. Review the high-resolution contact sheets.
"""
import argparse,hashlib,html,importlib.util,io,json,re,time
from pathlib import Path
from urllib.parse import urlencode,urlsplit
from PIL import Image,ImageOps,ImageDraw
ROOT=Path(__file__).resolve().parents[1]
MANIFEST=ROOT/"data/geography/research/p76-30-exterior-preview-manifest.v1.json"
OUT=ROOT/"data/geography/research/p76-preview-artifacts"
SPEC=importlib.util.spec_from_file_location("commons_verifier_p72",ROOT/"tools/verify-priority-commons-p72.py")
helper=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(helper)
Image.MAX_IMAGE_PIXELS=32_000_000
LICENSES={
 "CC0":"https://creativecommons.org/publicdomain/zero/1.0/",
 "CC BY 3.0":"https://creativecommons.org/licenses/by/3.0/",
 "CC BY 4.0":"https://creativecommons.org/licenses/by/4.0/",
 "CC BY-SA 3.0":"https://creativecommons.org/licenses/by-sa/3.0/",
 "CC BY-SA 4.0":"https://creativecommons.org/licenses/by-sa/4.0/"
}
def insist(p,m):
 if not p:raise ValueError(m)
def clean(v):
 return " ".join(html.unescape(re.sub(r"<[^>]*>"," ",str(v or ""))).split())
def norm(v):return re.sub(r"[^a-z0-9]+","",clean(v).casefold())
def manifest():
 d=json.loads(MANIFEST.read_text(encoding="utf-8"));a=d["candidates"]
 insist(d["schema"]=="AO_P76_THIRTY_PREVIEW_ACQUISITION_V1" and len(a)==30,"Wrong P76 manifest")
 insist(len({x["place_id"] for x in a})==len({x["source_sha1"] for x in a})==30,"Duplicated Place/source")
 for x in a:
  insist(x["commons_license"] in LICENSES,"Unsupported source licence")
  insist(re.fullmatch(r"[a-f0-9]{40}",x["source_sha1"]) is not None,"Bad pinned hash")
  insist(x["original_verified_p75"] and not x["full_resolution_approved"],"Premature approval")
  insist(x["asset_publication"]=="NOT_APPROVED","Premature publication")
 return a

def metadata(rows):
 query=urlencode({"action":"query","format":"json","formatversion":"2",
  "prop":"imageinfo","iiprop":"url|sha1|size|mime|extmetadata",
  "titles":"|".join(x["commons_title"] for x in rows)})
 result=helper.get_url_json("https://commons.wikimedia.org/w/api.php?"+query)
 pages=result["query"]["pages"]
 return {x["title"]:x for x in (pages.values() if isinstance(pages,dict) else pages) if "missing" not in x}

def check_page(x,p):
 insist(p and p.get("pageid")==x["commons_page_id"],"Commons title/page identity mismatch")
 i=p["imageinfo"][0]
 insist(i.get("sha1")==x["source_sha1"],"Pinned Commons original SHA1 changed")
 insist(i.get("mime")=="image/jpeg" and i.get("size",0)<=15*1024*1024,"Original not JPEG or exceeds 15MiB")
 insist(min(i.get("width",0),i.get("height",0))>=900,"Original too small")
 meta=i.get("extmetadata") or {}
 def field(k):return clean((meta.get(k) or {}).get("value"))
 lic=field("LicenseShortName")
 insist(norm(lic)==norm(x["commons_license"]),"Source licence grant changed: "+lic)
 uri=field("LicenseUrl")
 if x["commons_license"]=="CC0":
  if uri:
   u=urlsplit(uri)
   insist(u.hostname=="creativecommons.org" and u.path.rstrip("/")=="/publicdomain/zero/1.0","CC0 URI changed")
 else:
  u=urlsplit(uri);target=urlsplit(LICENSES[x["commons_license"]])
  insist(u.scheme=="https" and u.hostname==target.hostname and u.path.rstrip("/")==target.path.rstrip("/"),"Exact licence URL/version mismatch")
 author=field("Artist")
 insist(author and norm(x["artist"]) in norm(author),"Source photographer attribution changed")
 info={"page_id":p["pageid"],"source_sha1":i["sha1"],"source_license":lic,
  "license_url":LICENSES[x["commons_license"]],"current_artist":author[:280],
  "image_description":field("ImageDescription")[:500],
  "source_object_name":field("ObjectName")[:240],
  "source_date":field("DateTimeOriginal")[:80],
  "source_width":i["width"],"source_height":i["height"]}
 return i,info

def make_contact(group,sequence):
 W,H=600,455
 board=Image.new("RGB",(W*5,H*2),"#faf8f4");dr=ImageDraw.Draw(board)
 for j,(x,record,photo) in enumerate(group):
  xx=(j%5)*W;yy=(j//5)*H
  if photo:
   photo.thumbnail((W-20,H-92),Image.Resampling.LANCZOS)
   board.paste(photo,(xx+(W-photo.width)//2,yy+(H-92-photo.height)//2))
  else:
   dr.rectangle((xx+10,yy+8,xx+W-10,yy+H-90),outline="#d9bdb5",width=3)
   dr.text((xx+30,yy+80),"HOLD - NOT VERIFIED",fill="#a34c46")
  dr.text((xx+12,yy+H-88),f'#{x["review_number"]:03d} | {record["status"][:32]}',fill="#333333")
  dr.text((xx+12,yy+H-66),x["place_label"][:78],fill="#111111")
  dr.text((xx+12,yy+H-43),x["commons_title"].replace("File:","")[:78],fill="#555555")
  dr.text((xx+12,yy+H-21),x["commons_license"]+" | "+str(x["artist"])[:57],fill="#666666")
 file=OUT/f"p76-exteriors-{sequence:02d}.jpg"
 board.save(file,quality=91)
 return str(file)

def run(rows,delay):
 insist(2<=delay<=10,"Use 2-10 seconds interfile delay")
 OUT.mkdir(parents=True,exist_ok=True)
 results=[]
 for g in range(3):
  group=rows[g*10:(g+1)*10]
  try: pages=metadata(group);error=None
  except Exception as exc: pages={};error=type(exc).__name__+": "+str(exc)[:220]
  contacts=[]
  for x in group:
   row={"schema":"AO_P76_IMAGE_ACQUISITION_V1","review_number":x["review_number"],
    "place_id":x["place_id"],"place_label":x["place_label"],
    "file_title":x["commons_title"],"source_url":x["source_url"],
    "expected_sha1":x["source_sha1"],"status":"HOLD",
    "original_bytes_verified":False,"derivative_sha256":None,
    "licensed_source_metadata_checked":False,"exact_site_approved":False,
    "full_resolution_approved":False,"published":False}
   preview=None
   try:
    insist(not error,"Commons metadata failed: "+str(error))
    page=pages.get(x["commons_title"])
    ii,check=check_page(x,page);row.update(check)
    row["licensed_source_metadata_checked"]=True
    binary,sha1=helper.download_original(ii["url"])
    insist(sha1==x["source_sha1"],"Original-bytes SHA1 mismatch")
    with Image.open(io.BytesIO(binary)) as raw:
     insist(raw.format=="JPEG" and raw.size==(ii["width"],ii["height"]),"Image decode/size mismatch")
     im=ImageOps.exif_transpose(raw).convert("RGB");im.thumbnail((1280,1280),Image.Resampling.LANCZOS)
     name=f'p76-{x["review_number"]:03d}.webp';im.save(OUT/name,"WEBP",quality=84,method=6)
     with Image.open(OUT/name) as verify:
      insist(verify.format=="WEBP" and verify.size==im.size,"Bad derivative")
     preview=im.copy();w,h=im.size
    contents=(OUT/name).read_bytes()
    row.update({"status":"SOURCE_AND_DERIVATIVE_VERIFIED_REVIEW_PENDING",
     "original_bytes_verified":True,"original_byte_count":len(binary),
     "derivative_sha256":hashlib.sha256(contents).hexdigest(),
     "derivative_file":name,"derivative_bytes":len(contents),
     "derivative_width":w,"derivative_height":h})
   except Exception as exc:
    row["status"]="HOLD_NEEDS_REVIEW"
    row["hold_reason"]=type(exc).__name__+": "+str(exc)[:260]
   contacts.append((x,row,preview))
   results.append(row)
   print("P76_SOURCE="+json.dumps(row,ensure_ascii=False),flush=True)
   if len(results)<30:time.sleep(delay)
  print("P76_CONTACT="+make_contact(contacts,g+1),flush=True)
 with (OUT/"p76-acquisition-results.jsonl").open("w",encoding="utf8") as f:
  for row in results:f.write(json.dumps(row,ensure_ascii=False)+"\n")
 summary={"input":len(rows),"verified":sum(x["original_bytes_verified"] for x in results),
  "held":sum(not x["original_bytes_verified"] for x in results),"new_places_published":0,
  "images_approved":0,"full_resolution_quality_review":"PENDING"}
 (OUT/"p76-summary.json").write_text(json.dumps(summary,indent=2)+"\n",encoding="utf8")
 print("P76_SUMMARY="+json.dumps(summary),flush=True)
 insist(summary["verified"]>0,"No images passed original-byte gate")

if __name__=="__main__":
 p=argparse.ArgumentParser();p.add_argument("--check",action="store_true")
 p.add_argument("--delay",type=float,default=2.5)
 args=p.parse_args();rows=manifest()
 if args.check:print("P76_OFFLINE_PASS="+json.dumps({"sources":len(rows),"unique_places":len({x["place_id"] for x in rows}),"approved":0}))
 else:run(rows,args.delay)
