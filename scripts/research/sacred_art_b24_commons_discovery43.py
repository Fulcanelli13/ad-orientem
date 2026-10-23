#!/usr/bin/env python3
"""B24: broad Commons file-namespace candidate discovery for 43 catalogue artworks.
This script does NOT acquire images, assert identity, or grant reproduction rights.
It preserves source IDs and raw attribution/rights clues for manual exact-object review.
"""
import csv, html, json, pathlib, re, time
from collections import Counter
from datetime import datetime, timezone
from urllib.error import HTTPError,URLError
from urllib.parse import urlencode
from urllib.request import Request,urlopen

ROOT=pathlib.Path("data/research");SOURCE=ROOT/"sacred-art-missing-after-b23r2.csv"
OUT=pathlib.Path("artifacts/b24-commons-discovery43");OUT.mkdir(parents=True,exist_ok=True)
AGENT="AdOrientem-SacredArt-CatalogueDiscovery/1.0 (+https://github.com/Fulcanelli13/ad-orientem)"
API="https://commons.wikimedia.org/w/api.php"
FIELDS=["artwork_id","artwork_title","artist","catalogue_object_url","search_query","rank",
"commons_file_title","commons_file_page","image_url_candidate","image_width","image_height",
"image_bytes","file_license_label","artist_metadata_excerpt","object_metadata_excerpt",
"credit_metadata_excerpt","exact_object_url_in_metadata","title_token_overlap",
"artist_surname_in_candidate","rights_auto_approval","identity_verdict",
"licence_status","recommendation","checked_utc"]
STOP_ON_429=False

def clean(markup):
    text=re.sub(r"<[^>]+>"," ",html.unescape(str(markup or "")))
    return re.sub(r"\s+"," ",text).strip()

def normalize(s):
    return re.sub(r"[^a-z0-9]+"," ",str(s or "").casefold()).strip()

def score(a,b):
    a={x for x in normalize(a).split() if len(x)>2}
    b={x for x in normalize(b).split() if len(x)>2}
    if not a:return 0
    return round(len(a&b)/len(a),3)

def query(source):
    global STOP_ON_429
    if STOP_ON_429:return {"pages":[],"error":"COMMONS_429_DEFERRED"}
    params={
        "action":"query","generator":"search","gsrsearch":source,
        "gsrnamespace":6,"gsrlimit":6,
        "prop":"imageinfo","iiprop":"url|size|extmetadata",
        "iiextmetadatafilter":"LicenseShortName|Artist|ObjectName|ImageDescription|Credit|Source|UsageTerms",
        "format":"json","formatversion":2,"maxlag":5
    }
    url=API+"?"+urlencode(params)
    request=Request(url,headers={"User-Agent":AGENT,"Accept":"application/json"})
    try:
        with urlopen(request,timeout=32) as response:data=json.load(response)
        if "error" in data:return {"pages":[],"error":str(data["error"])[:300]}
        return {"pages":data.get("query",{}).get("pages",[]),"error":""}
    except HTTPError as e:
        if e.code==429:STOP_ON_429=True
        return {"pages":[],"error":"HTTP_"+str(e.code)}
    except (URLError,TimeoutError,ValueError) as e:
        return {"pages":[],"error":str(e)[:250]}

def choose_queries(row):
    title=row["title"].strip()
    artist=row["artist"].strip()
    # Prioritize exact author+title over generic saints so false matches do not drown results.
    if artist and not re.search(r"(unidentified|anonymous|local school|school of|attributed)",artist,re.I):
        author=re.sub(r"\([^)]*\)","",artist).strip().split(",")[0]
        return [f'"{title}" "{author}"',f'{title} {author}']
    return [f'"{title}" painting',title]

def main():
    global STOP_ON_429
    with SOURCE.open(newline="",encoding="utf-8") as f:catalogue=list(csv.DictReader(f))
    assert len(catalogue)==43 and all(x["priority"]=="P2" for x in catalogue)
    all_rows=[];status=[]
    for index,record in enumerate(catalogue):
        sid=record["artwork_id"]
        queries=choose_queries(record)
        results={};errors=[]
        for qs in queries:
            found=query(qs)
            if found["error"]:errors.append(found["error"])
            for idx,pg in enumerate(found["pages"]):
                file=pg.get("title","")
                if not file.startswith("File:"):continue
                info=(pg.get("imageinfo") or [{}])[0]
                extra=info.get("extmetadata",{})
                meta=lambda k:clean((extra.get(k) or {}).get("value",""))
                obj_excerpt=" | ".join([meta("ObjectName"),meta("ImageDescription"),meta("Source")])
                credit=meta("Credit")
                author=meta("Artist")
                url=record["legacy_source_url"] or record["legacy_object_url"]
                uuid=re.search(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",url or "",re.I)
                exact=bool(uuid and uuid.group().lower() in (obj_excerpt+" "+credit).lower())
                if not exact and url and re.search(r"/(?:artworks|notice|HistoricOrArtisticProperty|entry|ark:)/",url,re.I):
                    # Only a literally identical object URL supports an exact-source flag.
                    exact=url.lower() in (obj_excerpt+" "+credit).lower()
                author_surname=record["artist"].split(",")[0].split()[-1].casefold() if record["artist"].split(",")[0].split() else ""
                authors=(file+" "+author+" "+obj_excerpt).casefold()
                authors_ok=len(author_surname)>3 and author_surname in authors
                title_score=score(record["title"],file.replace("File:",""))
                lic=meta("LicenseShortName")
                license_candidate=lic.upper().startswith(("CC","PUBLIC DOMAIN","PD-")) or lic.lower() in ("public domain","cc0")
                row={
                    "artwork_id":sid,"artwork_title":record["title"],"artist":record["artist"],
                    "catalogue_object_url":url or "","search_query":qs,"rank":idx+1,
                    "commons_file_title":file,"commons_file_page":"https://commons.wikimedia.org/wiki/"+file.replace(" ","_"),
                    "image_url_candidate":info.get("url",""),"image_width":info.get("width",""),
                    "image_height":info.get("height",""),"image_bytes":info.get("size",""),
                    "file_license_label":lic,"artist_metadata_excerpt":author[:270],
                    "object_metadata_excerpt":obj_excerpt[:580],"credit_metadata_excerpt":credit[:300],
                    "exact_object_url_in_metadata":"YES" if exact else "NO",
                    "title_token_overlap":title_score,"artist_surname_in_candidate":"YES" if authors_ok else "NO",
                    "rights_auto_approval":"NO","identity_verdict":"EXACT_SOURCE_REFERENCE_CANDIDATE" if exact else "UNVERIFIED_DISCOVERY_CANDIDATE",
                    "licence_status":"FILE_METADATA_CANDIDATE_REVIEW_REQUIRED" if license_candidate else "UNKNOWN_OR_RESTRICTED",
                    "recommendation":"HUMAN_IDENTITY_AND_RIGHTS_CHECK_BEFORE_DOWNLOAD",
                    "checked_utc":datetime.now(timezone.utc).isoformat(timespec="seconds")
                }
                if file not in results or (exact and results[file]["exact_object_url_in_metadata"]!="YES"):
                    results[file]=row
            if STOP_ON_429:break
            time.sleep(1.0)
        ordered=sorted(results.values(),key=lambda r:(
            r["exact_object_url_in_metadata"]=="YES",r["artist_surname_in_candidate"]=="YES",
            float(r["title_token_overlap"]),int(r["image_width"] or 0)*int(r["image_height"] or 0)),reverse=True)
        all_rows.extend(ordered)
        status.append({"artwork_id":sid,"candidate_count":len(ordered),
                       "exact_source_reference_count":sum(x["exact_object_url_in_metadata"]=="YES" for x in ordered),
                       "error":" | ".join(errors),"rate_limit_deferred":STOP_ON_429})
        print(f"DISCOVERY {index+1}/43 {sid} => {len(ordered)} candidates; {errors}",flush=True)
        if STOP_ON_429:
            status.extend({"artwork_id":a["artwork_id"],"candidate_count":0,"exact_source_reference_count":0,
                          "error":"COMMONS_RATE_LIMIT_REMAINING_DEFERRED","rate_limit_deferred":True} for a in catalogue[index+1:])
            break
    with (OUT/"Candidates.csv").open("w",encoding="utf-8",newline="") as f:
        w=csv.DictWriter(f,fieldnames=FIELDS);w.writeheader();w.writerows(all_rows)
    with (OUT/"Artwork_screen.csv").open("w",encoding="utf-8",newline="") as f:
        w=csv.DictWriter(f,fieldnames=["artwork_id","candidate_count","exact_source_reference_count","error","rate_limit_deferred"])
        w.writeheader();w.writerows(status)
    summary={"artwork_entries_requested":43,"artwork_entries_screened":len(status),
             "with_any_commons_candidates":sum(int(x["candidate_count"])>0 for x in status),
             "candidate_file_records":len(all_rows),
             "with_exact_source_url_candidate":sum(x["exact_source_reference_count"]>0 for x in status),
             "rightsmatched_identity_approved":0,"images_downloaded":0,
             "manual_identity_approvals":0,"publication_approvals":0,
             "rate_limit_triggered":STOP_ON_429,"checked_utc":datetime.now(timezone.utc).isoformat(timespec="seconds")}
    (OUT/"Discovery_summary.json").write_text(json.dumps(summary,indent=2),encoding="utf-8")
    print("SUMMARY "+json.dumps(summary,sort_keys=True),flush=True)
if __name__=="__main__":main()
