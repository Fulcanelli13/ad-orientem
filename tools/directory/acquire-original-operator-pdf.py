#!/usr/bin/env python3
"""Acquire a publisher-hosted PDF for Ad Orientem source verification.

Safe, explicit, no metered service, zero external Python deps. This is an
ON-DEMAND tool: no automatic external fetch/cron, no upload, no copyright
assumptions. It never writes a success manifest without actual valid PDF bytes.
Only acquire operator sources you are entitled to retain; publishing copies
requires separate rights review. Use a durable local/repository archive you own,
not short-lived GitHub Actions artifacts.
"""
from __future__ import annotations
import argparse,datetime,hashlib,json,os,tempfile
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request,build_opener,HTTPRedirectHandler

ALLOWED={"fsspx.uk","www.fsspx.uk","fssp.org.uk","www.fssp.org.uk",
         "petrusbruderschaft.de","www.petrusbruderschaft.de",
         "www.alte-messe.info","alte-messe.info"}
CAP=4_000_000

class RestrictedRedirect(HTTPRedirectHandler):
 def redirect_request(self,req,fp,code,msg,headers,newurl):
  u=urlparse(newurl)
  if u.scheme!="https" or u.hostname not in ALLOWED:
   raise ValueError("Disallowed redirect host or protocol")
  return super().redirect_request(req,fp,code,msg,headers,newurl)

def main():
 p=argparse.ArgumentParser()
 p.add_argument("--url",required=True,help="HTTPS URL at an allowlisted operator domain")
 p.add_argument("--output",type=Path,required=True,help="Local PDF path to write")
 p.add_argument("--manifest",type=Path,required=True,help="Sidecar JSON path to write")
 p.add_argument("--max-bytes",type=int,default=CAP)
 x=p.parse_args()
 parsed=urlparse(x.url)
 assert parsed.scheme=="https" and parsed.hostname in ALLOWED
 assert parsed.username is None and parsed.password is None
 assert x.max_bytes>0 and x.max_bytes<=CAP
 assert x.output.suffix.lower()==".pdf" and x.manifest.suffix.lower()==".json"
 assert x.output.resolve()!=x.manifest.resolve()
 assert not x.output.exists() and not x.manifest.exists(), "Refuse to overwrite source archive"
 x.output.parent.mkdir(parents=True,exist_ok=True)
 x.manifest.parent.mkdir(parents=True,exist_ok=True)
 digest=hashlib.sha256()
 size=0
 fd,temp=tempfile.mkstemp(prefix="ao-pdf-source-",suffix=".tmp",dir=str(x.output.parent))
 os.close(fd)
 tmp=Path(temp)
 try:
  op=build_opener(RestrictedRedirect())
  req=Request(x.url,headers={"User-Agent":"AdOrientem-SourceVerification/1.0"})
  with op.open(req,timeout=15) as response:
   if response.getcode()!=200: raise ValueError("HTTP status is not 200")
   effective=response.geturl()
   h=urlparse(effective)
   if h.scheme!="https" or h.hostname not in ALLOWED:
    raise ValueError("Final host not allowlisted")
   t=response.headers.get("Content-Type","").split(";")[0].strip().lower()
   if t and t not in ("application/pdf","application/octet-stream"):
    raise ValueError("Unexpected content type: "+t)
   with tmp.open("wb") as dest:
    first=True
    while True:
     data=response.read(64*1024)
     if not data:break
     size+=len(data)
     if size>x.max_bytes: raise ValueError("Oversized original PDF")
     if first:
      first=False
      if not data.startswith(b"%PDF-"):raise ValueError("PDF signature missing")
     digest.update(data)
     dest.write(data)
   if size<100: raise ValueError("Invalid or truncated PDF")
   with tmp.open("rb") as f:
    f.seek(-min(1024,size),2)
    if b"%%EOF" not in f.read():raise ValueError("PDF EOF marker not found; perhaps truncated")
  record={
   "schema":"AO_ORIGINAL_OPERATOR_PDF_SOURCE_ARCHIVE_V1",
   "requested_source_url":x.url,
   "effective_source_url":effective,
   "acquired_utc":datetime.datetime.now(datetime.timezone.utc).isoformat(),
   "bytes_written":size,
   "sha256":digest.hexdigest(),
   "file_path":str(x.output),
   "source_binary_retrieved":True,
   "published_to_github":False,
   "redistribution_rights_cleared":False,
   "automatic_public_directory_release":False,
   "archive_lifespan":"LOCAL_FILE_REQUIRES_DURABLE_COMMIT_OR_BACKUP",
  }
  x.manifest.write_text(json.dumps(record,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
  tmp.replace(x.output)
  print(json.dumps(record,sort_keys=True,ensure_ascii=False))
 except Exception:
  tmp.unlink(missing_ok=True)
  x.manifest.unlink(missing_ok=True)
  raise

if __name__=="__main__":
 main()
