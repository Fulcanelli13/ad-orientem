#!/usr/bin/env python3
"""B37 audit all 30 exact institutional source pages without downloading images.

Source-page availability and OpenGraph image metadata are merely discovery
evidence; they do not establish reproduction rights or photo identity. Two
copyrighted Céline works are excluded from even probing here.
"""
import csv,json,re,ssl
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from urllib.request import Request,urlopen
from urllib.parse import urlsplit
ROOT=Path("data/research");OUT=Path("artifacts/b37-institutional30-site-audit")
FIELDS=["artwork_id","workstream","existing_object_url","source_host","inventory_id",
        "source_page_http_status","page_content_type","page_title",
        "inventory_id_literal_found","candidate_og_image","candidate_image_is_just_research_lead",
        "underlying_work_copyright_hold","photo_reuse_permission_granted",
        "artwork_identity_certified_from_HTML","state","failure"]
class Parser(HTMLParser):
 def __init__(self):
  super().__init__();self.title="";self.in_title=False;self.meta={}
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=="title":self.in_title=True
  if tag=="meta":
   key=a.get("property") or a.get("name")
   if key and a.get("content"):self.meta[key.lower()]=a["content"]
 def handle_endtag(self,tag):
  if tag=="title":self.in_title=False
 def handle_data(self,data):
  if self.in_title:self.title+=data
def work(c):
 r={k:"" for k in FIELDS}
 url=c["existing_institutional_url"]
 r.update(artwork_id=c["artwork_id"],workstream=c["workstream"],
     existing_object_url=url,source_host=urlsplit(url).hostname or "",
     inventory_id=c["known_institution_inventory"],
     candidate_image_is_just_research_lead="YES",
     underlying_work_copyright_hold="YES" if c["gate"]=="UNDERLYING_ARTWORK_COPYRIGHT_RESTRICTED" else "NO",
     photo_reuse_permission_granted="NO",
     artwork_identity_certified_from_HTML="NO")
 if c["gate"]=="UNDERLYING_ARTWORK_COPYRIGHT_RESTRICTED":
  r["state"]="EXCLUDED_UNDERLYING_WORK_COPYRIGHT";return r
 if not url.startswith("https://"):
  r["state"]="NO_EXACT_INSTITUTION_URL";return r
 if urlsplit(url).hostname=="commons.wikimedia.org":
  r["state"]="COMMONS_GALLERY_PHOTO_PAGE_NOT_INSTITUTION_CATALOGUE";return r
 try:
  req=Request(url,headers={"User-Agent":"AdOrientemArtResearch/2026 (+https://github.com/Fulcanelli13/ad-orientem)","Accept":"text/html,application/xhtml+xml","Accept-Encoding":"identity"})
  with urlopen(req,timeout=18,context=ssl.create_default_context()) as stream:
   status=stream.status
   typ=stream.headers.get("Content-Type","").split(";")[0].lower()
   raw=stream.read(850_000)
  r["source_page_http_status"]=status
  r["page_content_type"]=typ
  if typ not in {"text/html","application/xhtml+xml"}:
   r["state"]="NOT_READABLE_HTML_OBJECT_PAGE";return r
  txt=raw.decode("utf-8",errors="replace")
  parser=Parser();parser.feed(txt)
  r["page_title"]=re.sub(r"\s+"," ",parser.title)[:180]
  r["candidate_og_image"]=parser.meta.get("og:image","") or parser.meta.get("twitter:image","")
  inv=c["known_institution_inventory"]
  r["inventory_id_literal_found"]="YES" if inv and inv.lower() in txt.lower() else "NO_OR_NO_INVENTORY"
  r["state"]="OBJECT_PAGE_WITH_IMAGE_METADATA_RESEARCH_ONLY" if r["candidate_og_image"].startswith("https://") else "OBJECT_PAGE_NO_IMAGE_METADATA"
 except Exception as exc:
  r["state"]="SITE_UNAVAILABLE_OR_FETCH_BLOCKED"
  r["failure"]=type(exc).__name__+": "+str(exc)[:200]
 return r
def main():
 j=json.loads((ROOT/"sacred-art-b37-30-institutional-evidence-and-four-photo-leads.json").read_text())
 records=j["cases"]
 assert len(records)==30 and len({c["artwork_id"] for c in records})==30
 with ThreadPoolExecutor(max_workers=6) as ex:rows=list(ex.map(work,records))
 assert len(rows)==30
 assert sum(x["state"]=="EXCLUDED_UNDERLYING_WORK_COPYRIGHT" for x in rows)==2
 assert all(x["photo_reuse_permission_granted"]=="NO" for x in rows)
 OUT.mkdir(parents=True,exist_ok=True)
 with (OUT/"source-audit.csv").open("w",newline="",encoding="utf-8") as f:
  w=csv.DictWriter(f,fieldnames=FIELDS);w.writeheader();w.writerows(rows)
 from collections import Counter
 states=dict(Counter(x["state"] for x in rows))
 summary={"schema":"AO_B37_ALL30_LIVE_INSTITUTION_CATALOGUE_METADATA_AUDIT_V1",
 "thirty_gap_artwork_cases":30,"underlying_copyright_cases_excluded":2,
 "live_source_page_attempts":sum(x["state"] not in {"EXCLUDED_UNDERLYING_WORK_COPYRIGHT","NO_EXACT_INSTITUTION_URL","COMMONS_GALLERY_PHOTO_PAGE_NOT_INSTITUTION_CATALOGUE"} for x in rows),
 "live_source_pages_accessible_HTML":sum(x["source_page_http_status"]==200 and x["page_content_type"] in {"text/html","application/xhtml+xml"} for x in rows),
 "official_page_image_leads_extracted":sum(bool(x["candidate_og_image"]) for x in rows),
 "states":states,"downloaded_image_bytes":0,
 "photo_identity_or_publication_approvals":0,"frozen_canonical_records_changed":0}
 (OUT/"source-summary.json").write_text(json.dumps(summary,indent=2)+"\n")
 print("B37_30_INSTITUTION",json.dumps(summary),flush=True)
if __name__=="__main__":main()
