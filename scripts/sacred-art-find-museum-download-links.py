#!/usr/bin/env python3
"""Bounded first-party image-link discovery for Nationalmuseum and MNK.
This deliberately fetches no image bytes and never touches production assets.
"""
import argparse, html, json, re, urllib.parse, urllib.request
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

HOSTS={"media.nationalmuseum.se","zbiory.mnk.pl"}
MAX_BYTES=4*1024*1024
MEDIA_RE=re.compile(r"/search/all/media/([0-9]{1,10})(?:[/?#]|$)")
IMAGE_RE=re.compile(r"\.(?:jpe?g|tif|tiff|png)(?:[?#]|$)",re.I)

class TagParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links=[];self.meta=[];self.images=[];self.scripts=[];self.strings=[]
        self._link=None
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=="a":
            self._link={"url":a.get("href"),"text":""}
            self.links.append(self._link)
        elif tag=="img":
            self.images.append({k:a.get(k) for k in ["src","srcset","alt","data-src"] if a.get(k)})
        elif tag=="meta":
            v=a.get("content")
            if v and (a.get("property") or a.get("name")):
                self.meta.append({"key":a.get("property") or a.get("name"),"value":v[:250]})
        elif tag=="script":
            self.scripts.append(a.get("src","INLINE"))
    def handle_endtag(self,tag):
        if tag=="a":self._link=None
    def handle_data(self,data):
        d=" ".join(data.split())
        if d and len(self.strings)<1800:self.strings.append(d[:300])
        if self._link and d:self._link["text"]+=d[:200]+" "

def fetch_html(url,host):
    parsed=urllib.parse.urlparse(url)
    if parsed.scheme!="https" or parsed.hostname!=host:
        raise ValueError("unallowlisted host")
    req=urllib.request.Request(url,headers={"User-Agent":"AdOrientemSacredArtResearch/1.0","Accept":"text/html"})
    with urllib.request.urlopen(req,timeout=25) as resp:
        final=resp.geturl()
        if urllib.parse.urlparse(final).hostname!=host:
            raise ValueError("cross-host redirect")
        mime=resp.headers.get("Content-Type","").lower()
        data=resp.read(MAX_BYTES+1)
    if len(data)>MAX_BYTES or "html" not in mime:
        raise ValueError("not bounded HTML response")
    text=data.decode("utf-8","replace")
    parse=TagParser();parse.feed(text)
    return {"url":final,"bytes":len(data),"parser":parse,"html":text}

def public_portal(row, limit):
    hits=[];searches=[]
    for query in row["queries"][:2]:
        q=urllib.parse.urlencode({"search":query,"sortBy":"relevance"})
        url=row["firstPartyPortal"]+"?"+q
        try:
            res=fetch_html(url,"media.nationalmuseum.se")
            p=res["parser"]
            ids=list(dict.fromkeys(x.group(1) for link in p.links
                if isinstance(link.get("url"),str)
                for x in MEDIA_RE.finditer(link["url"])))
            if not ids:
                ids=list(dict.fromkeys(MEDIA_RE.findall(res["html"])))[:40]
            searches.append({"query":query,"status":"HTML_RETRIEVED","bytes":res["bytes"],
                             "itemLinkCount":len(ids),"firstItemIds":ids[:20]})
            for item_id in ids[:limit]:
                if any(z.get("mediaId")==item_id for z in hits):continue
                media_url="https://media.nationalmuseum.se/search/all/media/"+item_id
                try:
                    item=fetch_html(media_url,"media.nationalmuseum.se")
                    text_blob=" ".join(item["parser"].strings)
                    # require exact museum inventory number, not arbitrary digits.
                    inventory_ok=bool(re.search(r"(?<![A-Za-z0-9])NM\s*"+re.escape(row["accession"].split(" ")[-1])+r"(?![0-9])",text_blob,re.I))
                    rights_ok=bool(re.search(r"Public\s*Domain",text_blob,re.I))
                    filename=(item["parser"].strings[:60])
                    downloads=[link["url"] for link in item["parser"].links if link.get("url") and
                         ("download" in (link.get("text") or "").lower() or "download" in link["url"].lower())]
                    hits.append({"mediaId":item_id,"mediaUrl":media_url,"exactInventoryMatch":inventory_ok,
                                 "publicDomainPhotoMark":rights_ok,"downloadLinkCandidates":downloads[:6],
                                 "sourceTextEvidence":" ".join(filename)[:650] if inventory_ok else None,
                                 "status":"ITEM_PAGE_INSPECTED"})
                except Exception as e:
                    hits.append({"mediaId":item_id,"mediaUrl":media_url,"status":"ITEM_PAGE_ERROR","error":type(e).__name__+": "+str(e)[:130]})
        except Exception as e:
            searches.append({"query":query,"status":"SEARCH_FAILED","error":type(e).__name__+": "+str(e)[:200]})
    exact=[x for x in hits if x.get("exactInventoryMatch")]
    return {"searches":searches,"inspectedMediaPages":len(hits),"exactInventoryMatchedMedia":exact[:15],
            "status":"FIRST_PARTY_ASSET_PAGE_IDENTIFIED" if exact else "MUSEUM_MEDIA_RECORD_NOT_IDENTIFIED",
            "downloadOriginalSourceBytesVerified":False}

def krakow_page(row):
    try:
        res=fetch_html(row["objectPage"],"zbiory.mnk.pl")
        p=res["parser"]
        contents=" ".join(p.strings)
        accession=row["accession"]
        links=[]
        for z in p.links:
            url=z.get("url")
            if not isinstance(url,str):continue
            if re.search(r"download|pobierz|image|file|media",url,re.I):
                links.append({"href":url[:350],"label":(z.get("text") or "")[:100]})
        candidates=[]
        for img in p.images:
            for key in ["src","srcset","data-src"]:
                val=img.get(key)
                if not val:continue
                for bit in re.split(r",(?=\s*https?://)|\s+\d+w",val):
                    first=bit.strip().split()[0]
                    full=urllib.parse.urljoin(res["url"],first)
                    u=urllib.parse.urlparse(full)
                    if u.scheme=="https" and u.hostname in HOSTS and IMAGE_RE.search(u.path):
                        candidates.append({"url":full[:500],"alt":img.get("alt","")[:200]})
        return {"status":"OBJECT_HTML_INSPECTED","sourceUrl":res["url"],"htmlBytes":res["bytes"],
                "accessionVisibleInHtml":accession.lower() in res["html"].lower(),
                "visibleTextIncludesAccession":accession.lower() in contents.lower(),
                "imagesFoundInStaticHtml":len(p.images),
                "potentialObjectPhotoLinks":candidates[:20],
                "downloadAnchors":links[:20],
                "scriptTags":len(p.scripts),"scriptSourcePaths":p.scripts[:16],
                "publishedDownloadIconMentioned":bool(re.search(r"pobierz|download",res["html"],re.I)),
                "exactDownloadPhotoResolved":False}
    except Exception as e:
        return {"status":"OBJECT_HTML_FAILED","error":type(e).__name__+": "+str(e)[:250],
                "exactDownloadPhotoResolved":False}

def main():
    arg=argparse.ArgumentParser();arg.add_argument("--manifest",required=True);arg.add_argument("--output",required=True)
    opts=arg.parse_args()
    m=json.loads(Path(opts.manifest).read_text("utf-8"))
    expected=["Nationalmuseum:NM420","Nationalmuseum:NM1134","MNK:II-a-448","MNK:II-a-9"]
    if [x["key"] for x in m["records"]]!=expected:
        raise ValueError("source identity mismatch")
    if any(x["sourceBytesRetrieved"] or x["firstPartyOriginalImageUrl"] or x["mediaPortalAssetId"] for x in m["records"]):
        raise ValueError("unexpected prevalidated photo")
    report={"schema":"AO_SACRED_ART_MUSEUM_LINK_DISCOVERY_REPORT_V1",
            "asOfUtc":datetime.now(timezone.utc).isoformat(),
            "researchOnly":True,"sourcePhotoBytesAcquired":0,"ownerApproval":False,
            "publicAssetsModified":False,"records":[]}
    for row in m["records"]:
        key=row["key"]
        result=public_portal(row,m["runtimeConstraints"]["assetPageReviewLimitPerArtwork"]) if key.startswith("Nationalmuseum:") else krakow_page(row)
        report["records"].append({"key":key,"accession":row["accession"],**result})
        print(key+": "+result["status"],flush=True)
    path=Path(opts.output);path.mkdir(parents=True,exist_ok=True)
    (path/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("Verified original photo byte acquisitions: 0 (URL-discovery only)")
    return 0
if __name__=="__main__":
    raise SystemExit(main())
