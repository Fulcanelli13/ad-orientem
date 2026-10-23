#!/usr/bin/env python3
"""B25: metadata-only institutional page inspection for 31 still image-less artworks.

Never downloads images or publishes artwork. Source picture references are mere leads,
not object attribution or reproduction-rights certifications.
"""
import csv,json,pathlib,re,html,time,threading
from collections import Counter,defaultdict
from datetime import datetime,timezone
from html.parser import HTMLParser
from urllib.parse import urlsplit,urljoin
from urllib.error import HTTPError,URLError
from urllib.request import Request,urlopen
from concurrent.futures import ThreadPoolExecutor

ROOT=pathlib.Path("data/research")
CAT=ROOT/"sacred-art-missing-after-b24.csv"
OUTPUT=pathlib.Path("artifacts/b25-institutional31");OUTPUT.mkdir(parents=True,exist_ok=True)
AGENT="AdOrientem-OriginalSacredArtInstitutionalResearch/1.0 (+https://github.com/Fulcanelli13/ad-orientem)"
CF=["artwork_id","title","artist","source_url","source_host","http_status","page_status",
    "html_page_title","canonical_url","final_url","structured_object_metadata","image_candidates_found","high_relevance_candidates",
    "visible_copyright_text","rights_caveat","media_rights_certified","identity_certified",
    "source_binary_acquired","editorial_status","checked_utc","error"]
IM=["artwork_id","title","source_url","asset_url_candidate","image_alt","image_title","image_context",
    "metadata_role","candidate_relevance_score","same_institution_domain","photo_rights_status","object_identity_status"]
_lock=defaultdict(threading.Lock)

class ArtPage(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.images=[];self.meta={};self.title="";self._in_title=False;self._in_script=False
        self.canonical="";self.jsonld=[];self._buffer=""
    def handle_starttag(self,tag,attrs):
        a={str(k).lower():str(v or "") for k,v in attrs if k}
        if tag=="title":self._in_title=True
        if tag=="link" and "canonical" in a.get("rel","").lower():
            self.canonical=a.get("href","")
        if tag=="meta":
            n=(a.get("name") or a.get("property") or "").lower()
            if n:self.meta.setdefault(n,a.get("content",""))
        if tag in ("img","source"):
            for key in ("src","data-src","data-lazy-src","data-original","data-img","srcset","data-srcset"):
                u=a.get(key,"")
                if u:self.images.append({"url":u.split(",")[0].split(" ")[0].strip(),"alt":a.get("alt",""),
                    "title":a.get("title",""),"role":key,"context":a.get("class","")})
        if tag=="script" and a.get("type","").lower()=="application/ld+json":
            self._in_script=True;self._buffer=""
    def handle_endtag(self,tag):
        if tag=="title":self._in_title=False
        if tag=="script" and self._in_script:
            self._in_script=False
            self.jsonld.append(self._buffer[:12000]);self._buffer=""
    def handle_data(self,data):
        if self._in_title and len(self.title)<400:self.title+=data
        if self._in_script and len(self._buffer)<12000:self._buffer+=data

def tokens(q):
    ignore={"saint","sainte","san","sant","santo","st","del","de","da","la","le","the","of","with","and","des","du","et","pour","et","portrait","tableau","painting"}
    return {x for x in re.findall(r"[a-zà-ÿ0-9]{3,}",(q or "").lower()) if x not in ignore}
def relevance(title,artist,text):
    items=tokens(title);person=tokens(artist)
    matched=sum(bool(x in text.lower()) for x in items)
    person_match=sum(bool(x in text.lower()) for x in person)
    return matched*4+min(person_match,2)*2
def good_url(url,base):
    if not url:return ""
    try:
        resolved=urljoin(base,html.unescape(url))
        u=urlsplit(resolved)
        if u.scheme!="https" or not u.hostname:return ""
        if not re.search(r"\.(jpe?g|png|tiff?|webp|jp2)(?:[?#]|$)",resolved,re.I) and "/image/" not in resolved.lower() and "/media/" not in resolved.lower():
            return ""
        if re.search(r"(logo|favicon|sprite|icon|transparent|blank)\b",resolved,re.I):return ""
        return resolved
    except ValueError:return ""
def check(row):
    art=row["artwork_id"];src=row["legacy_source_url"] or row["legacy_object_url"]
    host=urlsplit(src).hostname if src.startswith("https://") else ""
    z={k:"" for k in CF}
    z.update(artwork_id=art,title=row["title"],artist=row["artist"],source_url=src,
        source_host=host or "NO_SOURCE",media_rights_certified="NO",identity_certified="NO",
        source_binary_acquired="NO",editorial_status="HOLD",checked_utc=datetime.now(timezone.utc).isoformat(timespec="seconds"),
        rights_caveat="HTML media links and API records do not confer commercial reproduction permission")
    if not src or not src.startswith("https://"):
        z["page_status"]="MISSING_OR_INVALID_SOURCE";return z,[]
    if host in ("google.com","www.google.com"):
        z["page_status"]="SEARCH_LINK_NOT_ART_OBJECT";return z,[]
    with _lock[host]:
        time.sleep(0.6)
        try:
            req=Request(src,headers={"User-Agent":AGENT,"Accept":"text/html,application/xhtml+xml","Accept-Encoding":"identity"})
            with urlopen(req,timeout=27) as response:
                z["http_status"]=response.status
                z["final_url"]=response.url
                contenttype=response.headers.get("Content-Type","")
                if "html" not in contenttype.lower():
                    z["page_status"]="NOT_HTML_PAGE";return z,[]
                page=response.read(650000).decode("utf-8","replace")
            doc=ArtPage();doc.feed(page)
            z["html_page_title"]=re.sub(r"\s+"," ",doc.title)[:200]
            z["canonical_url"]=urljoin(src,doc.canonical) if doc.canonical else ""
            z["page_status"]="PARSED_INSTITUTIONAL_HTML"
            z["structured_object_metadata"]="YES" if doc.jsonld else "NO"
            p=page.lower()
            if any(k in p for k in ("copyright","rights reserved","droits réservés","©","licence","crédit photographique")):
                z["visible_copyright_text"]="POTENTIAL_RIGHTS_SIGNAL_MANUAL_REVIEW"
            inputs=list(doc.images)
            for k in ("og:image","twitter:image","image"):
                if doc.meta.get(k):inputs.append({"url":doc.meta[k],"alt":"","title":"","context":"","role":k})
            for ld in doc.jsonld:
                for raw in re.findall(r'"(?:image|thumbnailUrl|contentUrl)"\s*:\s*"([^"]+)"',ld,re.I):
                    inputs.append({"url":raw,"alt":"","title":"","context":"","role":"json-ld"})
            imgs=[];seen=set()
            for item in inputs:
                url=good_url(item["url"],src)
                if not url or url in seen:continue
                seen.add(url)
                description=" ".join((item["alt"],item["title"],item["context"],url.split("/")[-1]))
                sc=relevance(row["title"],row["artist"],description)
                matched_host=urlsplit(url).hostname in (host,host.replace("www.",""))
                imgs.append({
                    "artwork_id":art,"title":row["title"],"source_url":src,"asset_url_candidate":url,
                    "image_alt":item["alt"][:200],"image_title":item["title"][:160],
                    "image_context":item["context"][:100],"metadata_role":item["role"],
                    "candidate_relevance_score":sc,"same_institution_domain":"YES" if matched_host else "NO",
                    "photo_rights_status":"UNVERIFIED","object_identity_status":"UNVERIFIED"})
            imgs.sort(key=lambda a:int(a["candidate_relevance_score"]),reverse=True)
            z["image_candidates_found"]=len(imgs)
            z["high_relevance_candidates"]=sum(int(i["candidate_relevance_score"])>=4 for i in imgs)
            return z,imgs[:12]
        except HTTPError as e:
            z["http_status"]=e.code
            z["page_status"]=("ACCESS_RESTRICTED" if e.code in (401,403,429) else "HTTP_ERROR")
            z["error"]=str(e)[:200]
        except (OSError,URLError,TimeoutError,ValueError) as e:
            z["page_status"]="FETCH_ERROR";z["error"]=str(e)[:200]
        return z,[]

def main():
    with CAT.open(newline="",encoding="utf-8") as f:catalogue=list(csv.DictReader(f))
    assert len(catalogue)==31 and len({r["artwork_id"] for r in catalogue})==31
    with ThreadPoolExecutor(max_workers=4) as worker:
        out=list(worker.map(check,catalogue))
    rows=[x for x,_ in out];images=[i for _,items in out for i in items]
    with (OUTPUT/"Institutional31_page_status.csv").open("w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=CF);w.writeheader();w.writerows(rows)
    with (OUTPUT/"Institutional31_image_leads.csv").open("w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=IM);w.writeheader();w.writerows(images)
    summary={"artworks_in_scope":31,"records_with_parseable_html":sum(x["page_status"]=="PARSED_INSTITUTIONAL_HTML" for x in rows),
        "status_counts":dict(Counter(x["page_status"] for x in rows)),"media_url_leads":len(images),
        "artworks_with_media_leads":len({x["artwork_id"] for x in images}),
        "high_relevance_media_leads":sum(int(i["candidate_relevance_score"])>=4 for i in images),
        "verified_file_licences":0,"exact_image_object_match_approved":0,"files_downloaded":0,"release_approvals":0,
        "caveat":"No HTML image URL, OG thumbnail or structured-data image is a licensed artwork master. Source and photo rights separately required.",
        "timestamp":datetime.now(timezone.utc).isoformat(timespec="seconds")}
    (OUTPUT/"Institutional31_summary.json").write_text(json.dumps(summary,indent=2),encoding="utf-8")
    print("SUMMARY "+json.dumps(summary,sort_keys=True),flush=True)
if __name__=="__main__":main()
