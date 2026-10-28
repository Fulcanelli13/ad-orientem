#!/usr/bin/env python3
"""One respectful retry only for 2 prior Wikimedia Commons HTTP 429 original JPEGs.
No paid services or image release. Do not download if 429 recurs.
"""
import hashlib,io,json,urllib.parse,urllib.request,urllib.error
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
P=ROOT/"data/calendar/sacred-art-a8-44-photographic-preflight-20261028.v1.json"
S=ROOT/"data/calendar/sacred-art-a8-44-original-byte-audit-20261028.v1.json"
OUT=ROOT/"data/calendar/sacred-art-a8-44-rate-limit-retry-20261028.v1.json"
master=json.loads(P.read_text())["records"]
prior=json.loads(S.read_text())["records"]
failed=[x for x in prior if x["run_20261028_byte_verification"]=="HTTP_429_RATE_LIMIT_NO_NEW_BYTE_CHECK"]
assert len(failed)==2
source={x["id"]:x for x in master}
results=[]
for item in failed:
 z=source[item["artwork_id"]]
 f=z["source_file"]
 row={"artwork_id":z["id"],"title":z["title"],"source_commons":z["source_page"],"previous_error":"HTTP_429","expected_sha256":z["source_archive_sha256"],"new_original_bytes_downloaded":False,"production_ready":False}
 try:
  q=urllib.parse.urlencode({"action":"query","prop":"imageinfo","titles":"File:"+f,"iiprop":"url|size|sha1","format":"json","formatversion":"2"})
  req=urllib.request.Request("https://commons.wikimedia.org/w/api.php?"+q,headers={"User-Agent":"AdOrientemArtResearch/1.0 (https://github.com/Fulcanelli13/ad-orientem; zero-cost source audit)"})
  with urllib.request.urlopen(req,timeout=35) as r:js=json.loads(r.read(500000))
  info=js["query"]["pages"][0]["imageinfo"][0]
  url=info["url"];p=urllib.parse.urlsplit(url)
  if p.scheme!="https" or p.hostname!="upload.wikimedia.org":raise RuntimeError("invalid original url")
  req=urllib.request.Request(url,headers={"User-Agent":"AdOrientemArtResearch/1.0 (https://github.com/Fulcanelli13/ad-orientem; zero-cost source audit)"})
  with urllib.request.urlopen(req,timeout=70) as resp:
   b=resp.read(24*1024*1024+1)
   if len(b)>24*1024*1024:raise RuntimeError("oversized_original")
  sha=hashlib.sha256(b).hexdigest()
  with Image.open(io.BytesIO(b)) as im:d=list(im.size)
  row.update({"new_original_bytes_downloaded":True,"current_image_sha256":sha,"sha256_matches_old_archive":sha==z["source_archive_sha256"],"dimensions":d,"current_size_matches_source_metadata":d==[z["width"],z["height"]],"result":"SHA_MATCH" if sha==z["source_archive_sha256"] else "SOURCE_VERSION_MISMATCH"})
 except Exception as e:
  row.update({"result":"STILL_ON_DOWNLOAD_HOLD","error":type(e).__name__+":"+str(e)[:220]})
 results.append(row)
 print("AO_A8_RETRY",row["artwork_id"],row["result"],flush=True)
doc={"schema":"AO_A8_TWO_WIKIMEDIA_RATE_LIMIT_RETRY_V1","asOf":"2026-10-28","records":results,"summary":{"attempted":len(results),"current_sha_exact_matches":sum(x["result"]=="SHA_MATCH" for x in results),"still_held":sum(x["result"]=="STILL_ON_DOWNLOAD_HOLD" for x in results),"app_images_released":0,"fee_eur":0},"policy":"Single retry, no repeated HTTP429, source-only hash verification; no user painting decisions changed."}
OUT.write_text(json.dumps(doc,indent=2)+"\n")
print("AO_A8_RETRY_SUMMARY",json.dumps(doc["summary"]),flush=True)
