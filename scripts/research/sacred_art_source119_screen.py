#!/usr/bin/env python3
"""Source-page metadata screening for 46 artwork gaps and 73 P0 legacy previews.

Gather page health, canonical/preview metadata and explicit *candidate* licence
signals. NEVER infer permission, artwork identity, quality, or publication from HTML.
No media download occurs.
"""
import concurrent.futures,csv,html,json,pathlib,re,threading,time
from collections import Counter,defaultdict
from datetime import datetime,timezone
from html.parser import HTMLParser
from urllib.parse import urljoin,urlsplit
from urllib.request import Request,urlopen
from urllib.error import HTTPError,URLError

MANIFEST=pathlib.Path("data/research/sacred-art-b23-source119.manifest.json")
OUT=pathlib.Path("artifacts/b23-source119")
OUT.mkdir(parents=True,exist_ok=True)
AGENT="AdOrientem-Research/1.0 (+https://github.com/Fulcanelli13/ad-orientem)"
FIELDS=["artwork_id","kind","priority","title","artist","frozen_decision","source_url","source_host",
"source_screen_status","http_status","final_url","html_title","html_canonical","og_image_candidate",
"candidate_licence_text","rights_verification","visual_identity_status","photo_quality_status",
"selected_photo_exists_in_registry","next_action","error","checked_utc"]
class Head(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.page_title="";self.in_title=False;self.metas={};self.canonical=""
    def handle_starttag(self,tag,attrs):
        d={k.lower():v for k,v in attrs if k}
        if tag=="title":self.in_title=True
        if tag=="meta":
            key=(d.get("property") or d.get("name") or "").lower()
            if key and key not in self.metas:self.metas[key]=d.get("content") or ""
        if tag=="link" and "canonical" in (d.get("rel") or "").lower():
            self.canonical=d.get("href") or ""
    def handle_endtag(self,tag):
        if tag=="title":self.in_title=False
    def handle_data(self,chunk):
        if self.in_title and len(self.page_title)<300:self.page_title+=chunk
seen_hosts=defaultdict(lambda:threading.Lock())
blocked=set()
block_lock=threading.Lock()
def status_for_source(url):
    if not url:return "NO_OBJECT_SOURCE"
    if not url.startswith("https://"):return "INVALID_URL"
    host=urlsplit(url).hostname or ""
    if host in ("google.com","www.google.com","www.google.co.uk","google.co.uk"):
        return "SEARCH_RESULT_NOT_AUTHORITATIVE_SOURCE"
    return ""
def check(rec):
    now=datetime.now(timezone.utc).isoformat(timespec="seconds")
    url=(rec.get("source_url") or "").strip()
    out={k:"" for k in FIELDS}
    out.update(artwork_id=rec["artwork_id"],kind=rec["kind"],priority=rec["priority"],
    title=rec["title"],artist=rec["artist"],frozen_decision=rec["frozen_decision"],source_url=url,
    rights_verification="NOT_VERIFIED_FROM_WEB_PAGE",visual_identity_status="NOT_INSPECTED",
    photo_quality_status="NOT_INSPECTED",selected_photo_exists_in_registry="UNCONFIRMED",
    checked_utc=now)
    gate=status_for_source(url)
    if gate:
        out.update(source_screen_status=gate,next_action="SOURCE_DISCOVERY_OR_AUTHORITATIVE_OBJECT_URL")
        return out
    host=urlsplit(url).hostname or ""
    out["source_host"]=host
    with seen_hosts[host]:
        with block_lock:isblocked=host in blocked
        if isblocked:
            out.update(source_screen_status="DEFERRED_HOST_RATE_LIMIT",next_action="WAIT_AND_OBSERVE_RETRY_AFTER")
            return out
        time.sleep(0.65)
        try:
            request=Request(url,headers={"User-Agent":AGENT,"Accept":"text/html,application/xhtml+xml","Accept-Encoding":"identity"})
            with urlopen(request,timeout=22) as response:
                out["http_status"]=response.status
                out["final_url"]=response.url
                finalhost=urlsplit(response.url).hostname or ""
                if response.url.startswith("http:") or not finalhost:
                    raise ValueError("Insecure or invalid redirect")
                if "text/html" not in (response.headers.get("Content-Type") or "").lower():
                    out.update(source_screen_status="NON_HTML_OBJECT_RESOURCE",
                        next_action="VERIFY_OBJECT_AND_RIGHTS_ON_INSTITUTIONAL_SITE")
                    return out
                source=response.read(420_000).decode("utf-8","replace")
            parser=Head();parser.feed(source)
            out.update(html_title=parser.page_title.strip()[:240],
                html_canonical=urljoin(out["final_url"],parser.canonical) if parser.canonical else "",
                og_image_candidate=urljoin(out["final_url"],parser.metas.get("og:image","")) if parser.metas.get("og:image") else "",
                candidate_licence_text=(parser.metas.get("dc.rights") or parser.metas.get("rights") or parser.metas.get("license") or "")[:250])
            out["source_screen_status"]="HTTP_OK_PAGE_METADATA"
            out["next_action"]="CHECK_EXACT_WORK_ID_IMAGE_RIGHTS_AND_PHOTO_FORMAT"
        except HTTPError as exc:
            out["http_status"]=exc.code
            if exc.code==429:
                with block_lock:blocked.add(host)
                out["source_screen_status"]="HOST_429_DEFERRED"
                out["next_action"]="RESPECT_RETRY_AFTER_NO_CIRCUMVENTION"
            elif exc.code in (401,403):
                out["source_screen_status"]="RESTRICTED_ACCESS_OR_ANTIBOT"
                out["next_action"]="HUMAN_INSTITUTIONAL_SOURCE_REVIEW"
            elif exc.code in (404,410):
                out["source_screen_status"]="LINK_BROKEN_OR_OBJECT_MOVED"
                out["next_action"]="SEARCH_EXACT_OBJECT_ACCESSION_AT_INSTITUTION"
            else:
                out["source_screen_status"]="HTTP_ERROR"
                out["next_action"]="RECHECK_INSTITUTIONAL_OBJECT_SOURCE"
            out["error"]=str(exc)[:220]
        except (ValueError,URLError,TimeoutError,OSError) as exc:
            out["source_screen_status"]="FETCH_ERROR_OR_BLOCKED"
            out["next_action"]="MANUAL_OBJECT_AND_PHOTO_SOURCE_CHECK"
            out["error"]=str(exc)[:220]
    return out
def main():
    data=json.loads(MANIFEST.read_text(encoding="utf-8"));items=data["records"]
    assert len(items)==119 and len({x["artwork_id"] for x in items})==119
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        rows=list(pool.map(check,items))
    assert len(rows)==119
    with (OUT/"source_screen.csv").open("w",newline="",encoding="utf-8") as f:
        writer=csv.DictWriter(f,fieldnames=FIELDS);writer.writeheader();writer.writerows(rows)
    by_kind={}
    for k in ("P0_LEGACY_PREVIEW_QA","P2_MISSING_IMAGE"):
        group=[r for r in rows if r["kind"]==k]
        by_kind[k]={"count":len(group),"status_counts":dict(Counter(r["source_screen_status"] for r in group)),
        "image_metadata_candidate_count":sum(bool(x["og_image_candidate"]) for x in group),
        "explicit_rights_metadata_candidate_count":sum(bool(x["candidate_licence_text"]) for x in group)}
    summary={"source_count":119,"by_kind":by_kind,"human_visual_reviews_completed":0,
        "artwork_identity_verifications_completed":0,"source_photo_reuse_rights_approved":0,
        "frozen_approvals_changed":0,"publication_approvals":0,
        "limitations":"HTML OG image candidate is a thumbnail hint, never a file download URL or licence grant; HTTP access does not certify artwork identity",
        "checked_utc":datetime.now(timezone.utc).isoformat(timespec="seconds")}
    (OUT/"source_screen.summary.json").write_text(json.dumps(summary,indent=2),encoding="utf-8")
    print("SUMMARY "+json.dumps(summary,sort_keys=True),flush=True)
if __name__=="__main__":main()
