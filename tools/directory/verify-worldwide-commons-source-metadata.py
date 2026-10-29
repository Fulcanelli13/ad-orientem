#!/usr/bin/env python3
"""Bulk metadata-only Commons rights/size/source-hash preflight.

Consumes source-first AO_DIRECTORY_BULK_MEDIA_SOURCE_INDEX_V1 exports.
Deduplicates Commons File titles across all physical-site leads before API
requests. No original bytes downloaded, no app/public media publication,
and NO assumption that a Commons picture depicts the physical church.
"""
import argparse
import hashlib
import html
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter,defaultdict
from pathlib import Path

API="https://commons.wikimedia.org/w/api.php"
UA="AdOrientemCommonsBulkMeta/1.0 (https://github.com/Fulcanelli13/ad-orientem; read-only research)"
INPUT="AO_DIRECTORY_BULK_MEDIA_SOURCE_INDEX_V1"
OUTPUT="AO_DIRECTORY_COMMONS_BULK_RIGHTS_PREFLIGHT_V1"
HOLD="RESEARCH_ONLY_NEVER_APP_VISIBLE"
MAX_TITLES=1500
BATCH=25
MIME={"image/jpeg","image/png","image/webp"}
LIC={
    "CC0":"https://creativecommons.org/publicdomain/zero/1.0/",
    "CC-BY-4.0":"https://creativecommons.org/licenses/by/4.0/",
    "CC-BY-SA-4.0":"https://creativecommons.org/licenses/by-sa/4.0/",
    "CC-BY-SA-3.0":"https://creativecommons.org/licenses/by-sa/3.0/",
    "CC-BY-SA-2.0":"https://creativecommons.org/licenses/by-sa/2.0/",
}
SHORT={
    "CC0":"CC0","CC010":"CC0","CCBY40":"CC-BY-4.0",
    "CCBYSA40":"CC-BY-SA-4.0","CCBYSA30":"CC-BY-SA-3.0",
    "CCBYSA20":"CC-BY-SA-2.0"
}

def clean(s):
    return " ".join(html.unescape(re.sub(r"<[^>]*>"," ",str(s or ""))).split())
def title_ok(s):
    return (isinstance(s,str) and s.startswith("File:")
            and 6<len(s)<=260 and not any(x in s for x in ("\r","\n","\0","..","|","?","#")))
def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def decode_input(index):
    if (index.get("schema")!=INPUT
        or index.get("publication")!=HOLD
        or index.get("counts",{}).get("physical_anchors_indexed")!=2579
        or index.get("counts",{}).get("published_images")!=0
        or len(index.get("records",[]))!=2579):
        raise ValueError("Expected complete unpublished worldwide 2579-anchor photo index")
    refs=defaultdict(set)
    for row in index["records"]:
        if row.get("publication")!=HOLD or row.get("approved_exterior") is not False:
            raise ValueError("Unsafe source-index approval state")
        aid=row["physical_anchor_id"]
        for photo in row.get("photographic_candidates",[]):
            if (photo.get("publication")!=HOLD or photo.get("rights_approved") is not False
                or photo.get("subject_approved") is not False):
                raise ValueError("Photo candidate already approved unexpectedly")
            t=photo.get("file_title")
            if not t or not title_ok(t):
                continue
            # Require canonical Commons URL, never an arbitrary file endpoint.
            p=urllib.parse.urlsplit(str(photo.get("source_url") or ""))
            if p.scheme!="https" or p.hostname!="commons.wikimedia.org" or p.username or p.password:
                continue
            if urllib.parse.unquote(p.path).replace("_"," ")!=("/wiki/"+t):
                continue
            refs[t].add(aid)
    return refs

def license_info(info):
    meta=info.get("extmetadata") or {}
    def field(k):return clean((meta.get(k) or {}).get("value"))
    short=re.sub(r"[^A-Z0-9]","",field("LicenseShortName").upper())
    label=SHORT.get(short)
    author=field("Artist")
    source=urllib.parse.urlsplit(field("LicenseUrl"))
    if not label:
        return None,"LICENSE_NOT_SUPPORTED_OR_PD_LEGAL_REVIEW"
    expected=urllib.parse.urlsplit(LIC[label])
    if (source.scheme!="https" or source.hostname!="creativecommons.org"
        or source.username or source.password or source.path.rstrip("/")!=expected.path.rstrip("/")):
        return None,"LICENSE_URL_INCONSISTENT_WITH_SHORT_NAME"
    if not author or len(author)>500:
        return None,"AUTHOR_NOT_CLEAR"
    return {"label":label,"url":LIC[label],"author":author},None

def verify_metadata(page,title):
    if page.get("title")!=title or page.get("missing") or not page.get("imageinfo"):
        return {"status":"HOLD_MISSING_OR_REDIRECTED_SOURCE_FILE","reason":"TITLE_NOT_EXACT"}
    info=page["imageinfo"][0]
    try:
        size=int(info["size"]);width=int(info["width"]);height=int(info["height"])
    except (ValueError,TypeError,KeyError):
        return {"status":"HOLD_INVALID_ORIGINAL_METADATA","reason":"NO_DIMENSIONS"}
    if (info.get("mime") not in MIME or size<1000 or size>16_000_000
       or min(width,height)<650 or width*height>32_000_000):
        return {"status":"HOLD_ORIGINAL_SIZE_OR_FORMAT","reason":"NOT_PHOTOGRAPHIC_SIZE_LIMITS"}
    source_hash=str(info.get("sha1") or "").lower()
    if not re.fullmatch(r"[0-9a-f]{40}",source_hash):
        return {"status":"HOLD_MISSING_COMMONS_SOURCE_SHA1","reason":"NO_SHA1"}
    original=urllib.parse.urlsplit(str(info.get("url") or ""))
    if (original.scheme!="https" or original.hostname!="upload.wikimedia.org"
        or original.username or original.password or original.port not in (None,443)):
        return {"status":"HOLD_ORIGINAL_URL_HOST","reason":"SOURCE_URL_NOT_UPLOAD_WIKIMEDIA"}
    rights,reason=license_info(info)
    if not rights:
        return {"status":"HOLD_UNCLEAR_OR_UNSUPPORTED_RIGHTS","reason":reason}
    return {"status":"METADATA_ELIGIBLE_SUBJECT_NOT_VERIFIED",
            "source_sha1":source_hash,"mime":info["mime"],
            "original_bytes":size,"width":width,"height":height,
            "source_original_url":info["url"],"license":rights["label"],
            "license_url":rights["url"],"photographer":rights["author"],
            "rights_approved":False,"subject_approved":False}

def metadata_query(titles):
    if not 1<=len(titles)<=BATCH or any(not title_ok(s) for s in titles):
        raise ValueError("Invalid batch of Commons file titles")
    return API+"?"+urllib.parse.urlencode({
        "action":"query","format":"json","formatversion":"2",
        "titles":"|".join(titles),"prop":"imageinfo",
        "iiprop":"url|size|sha1|mime|extmetadata",
        "redirects":"0",
    })

def fetch_batch(titles,retries=2,sleep=time.sleep):
    url=metadata_query(titles)
    last=None
    for attempt in range(retries+1):
        try:
            req=urllib.request.Request(url,headers={
                "User-Agent":UA,"Accept":"application/json",
                "Accept-Encoding":"identity"})
            with urllib.request.urlopen(req,timeout=35) as f:
                if urllib.parse.urlsplit(f.geturl()).hostname!="commons.wikimedia.org":
                    raise ValueError("Commons metadata request redirected to another host")
                payload=f.read(5_000_001)
            if len(payload)>5_000_000:raise ValueError("Commons metadata response too large")
            return json.loads(payload.decode("utf-8"))
        except urllib.error.HTTPError as e:
            last="HTTP_"+str(e.code)
            if e.code not in (429,500,502,503,504) or attempt>=retries:break
            try: retry_after=int(e.headers.get("Retry-After","0"))
            except (ValueError,TypeError):retry_after=0
            sleep(min(90,max(8*(attempt+1),retry_after)))
        except (urllib.error.URLError,TimeoutError,ValueError,UnicodeError) as e:
            last=type(e).__name__+":"+str(e)[:130]
            if attempt>=retries:break
            sleep(10*(attempt+1))
    return {"error":"METADATA_API_FAILED","reason":last}

def scan(index_path,out_path,*,limit=MAX_TITLES,offset=0,delay=4,loader=fetch_batch):
    if not 1<=limit<=MAX_TITLES or offset<0 or not 0<=delay<=120:
        raise ValueError("Photo preflight bounded to 1–1500 titles / valid offset / safe delay")
    source=Path(index_path)
    index=json.loads(source.read_text(encoding="utf-8"))
    refs=decode_input(index)
    ordered=sorted(refs,key=lambda s:s.casefold())
    selected=ordered[offset:offset+limit]
    if not selected:raise ValueError("No Commons source titles in selected range")
    checks=[]
    for start in range(0,len(selected),BATCH):
        batch=selected[start:start+BATCH]
        if start: time.sleep(delay)
        response=loader(batch)
        if response.get("error"):
            checks.extend({"file_title":title,"status":"HOLD_METADATA_REQUEST_FAILED",
                           "reason":response.get("reason"),"anchor_ids":sorted(refs[title]),
                           "publication":HOLD} for title in batch)
            continue
        pages=(response.get("query") or {}).get("pages") or []
        by_title={p.get("title"):p for p in pages}
        for title in batch:
            result=verify_metadata(by_title.get(title,{}),title)
            checks.append({"file_title":title,"anchor_ids":sorted(refs[title]),
                           "publication":HOLD,**result})
    stats=Counter(c["status"] for c in checks)
    counts={
        "source_index_anchors":len(index["records"]),
        "unique_commons_titles_in_whole_index":len(refs),
        "selected_unique_titles":len(selected),
        "distinct_anchors_referenced":len({a for t in selected for a in refs[t]}),
        "commons_metadata_batch_calls":(len(selected)+BATCH-1)//BATCH,
        "metadata_eligible_source_files":stats["METADATA_ELIGIBLE_SUBJECT_NOT_VERIFIED"],
        "rights_or_other_holds":len(selected)-stats["METADATA_ELIGIBLE_SUBJECT_NOT_VERIFIED"],
        "original_images_downloaded":0,"images_approved":0,"images_published":0,
    }
    output={"schema":OUTPUT,"publication":HOLD,
            "source_index_sha256":sha256(source),"offset":offset,
            "counts":counts,"dispositions":dict(stats),
            "status":"RESEARCH_METADATA_ONLY_NOT_IMAGE_ACQUISITION",
            "records":checks}
    dest=Path(out_path)
    if dest.exists():raise ValueError("Refuse to overwrite immutable Commons source audit")
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text(json.dumps(output,ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf-8")
    print(json.dumps(counts,sort_keys=True),flush=True)
    return output

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--index",type=Path,required=True)
    p.add_argument("--output",type=Path,required=True)
    p.add_argument("--limit",type=int,default=MAX_TITLES)
    p.add_argument("--offset",type=int,default=0)
    p.add_argument("--delay-seconds",type=float,default=4)
    a=p.parse_args()
    scan(a.index,a.output,limit=a.limit,offset=a.offset,delay=a.delay_seconds)
if __name__=="__main__":main()
