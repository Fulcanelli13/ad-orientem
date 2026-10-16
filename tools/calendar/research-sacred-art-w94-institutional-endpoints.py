#!/usr/bin/env python3
"""W94: read the institutional pages, collect likely ORIGINAL painting media endpoints.
Every result is a lead; neither gallery source identity nor image licensing is certified.
"""
import json,re,requests
from pathlib import Path
from urllib.parse import urljoin, urlparse, unquote
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[2]
INPUT=ROOT/"data/calendar/sacred-art-review-uploads/20261016-w94-institutional-image-endpoint-probes.v1.json"
OUT=ROOT/"artifacts/sacred-art-w94-institutional-image-endpoints"
S=requests.Session();S.headers["User-Agent"]="Mozilla/5.0 (compatible; AdOrientemSacredArtResearch/1.0)"
IMG_RE=re.compile(r"\.(?:jpeg|jpg|png|webp|tif|tiff)(?:[?#]|$)",re.I)
BAD_RE=re.compile(r"logo|favico|avatar|sprite|brand|social|placeholder|tracking|pixel|cookie|icon",re.I)
def add(items,value,label,source,base):
    if not isinstance(value,str) or len(value)>1200:return
    url=urljoin(base,value.strip())
    if not url.startswith("https://"):return
    if BAD_RE.search(url) and source!="og:image":return
    if not (IMG_RE.search(url) or "/image" in url or "/media/" in url or "fotograf" in url.lower()):return
    key=(url,source)
    if key not in {(x["url"],x["evidenceType"]) for x in items}:
        items.append({"url":url,"evidenceType":source,"caption":label[:240]})
def process(row):
    info={k:row[k] for k in ("categoryIndex","artist","work","workId","url")}
    try:
        r=S.get(row["url"],timeout=(12,25),allow_redirects=True)
        r.raise_for_status()
        if len(r.content)>12_000_000:raise ValueError("HTML > 12MB")
        html=r.text
        doc=BeautifulSoup(html,"html.parser")
        title=doc.title.get_text(" ",strip=True)[:250] if doc.title else ""
        candidates=[]
        for meta in doc.select("meta"):
            key=meta.get("property") or meta.get("name") or meta.get("itemprop") or ""
            if "image" in key.lower():
                add(candidates,meta.get("content") or "","",key,r.url)
        for img in doc.find_all("img")[:220]:
            alt=img.get("alt") or img.get("title") or ""
            for att in ("src","data-src","data-lazy-src","data-full-url","data-original","data-zoom-image"):
                if img.get(att):add(candidates,img.get(att),alt,"img:"+att,r.url)
            if img.get("srcset"):
                part=img["srcset"].split(",")[-1].strip().split(" ")[0]
                add(candidates,part,alt,"img:srcset",r.url)
        for a in doc.select("a[href]")[:300]:
            href=a["href"]
            if IMG_RE.search(href):
                add(candidates,href,a.get_text(" ",strip=True),"anchor:image",r.url)
        info.update(status="SOURCE_HTML_READ",httpCode=r.status_code,resolvedUrl=r.url,title=title,pageBytes=len(r.content),
                    potentialImageEndpoints=candidates[:60],totalEndpointCount=len(candidates))
    except Exception as e:
        info.update(status="SOURCE_PAGE_FETCH_HOLD",reason=str(e)[:260],potentialImageEndpoints=[],totalEndpointCount=0)
    print("W94",info["categoryIndex"],info["workId"],info["status"],info["totalEndpointCount"],flush=True)
    return info
def main():
    OUT.mkdir(parents=True,exist_ok=True)
    rows=[process(row) for row in json.loads(INPUT.read_text())["items"]]
    counts={"sourcePages":len(rows),"pagesFetched":sum(x["status"]=="SOURCE_HTML_READ" for x in rows),
            "pagesHeld":sum(x["status"]!="SOURCE_HTML_READ" for x in rows),
            "rawImageEndpointCandidates":sum(x["totalEndpointCount"] for x in rows),
            "imagesAcquired":0,"sourceIdentitiesCertified":0}
    result={"schema":"AO_SACRED_ART_W94_HTML_IMAGE_ENDPOINT_RESEARCH_V1","counts":counts,"rows":rows,
            "licencesNotGranted":True,"status":"RESEARCH_ONLY_NEEDS_PAINTING_VS_THUMBNAIL_REVIEW"}
    (OUT/"w94-source-image-endpoints.json").write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n")
    print("W94_COMPLETE",json.dumps(counts),flush=True)
if __name__=="__main__":main()
