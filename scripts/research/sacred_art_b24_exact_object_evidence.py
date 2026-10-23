#!/usr/bin/env python3
"""B24 provenance pass: inspect Wikimedia file-page SOURCE WIKITEXT for the
EXACT institutional art-object identifier attached to the frozen catalogue entry.

A filename or artist match alone NEVER passes the object identity gate. Verified
literal source-ID references are still only acquisition candidates, NOT release.
"""
import csv,html,json,pathlib,re,time
from collections import defaultdict,Counter
from datetime import datetime,timezone
from urllib.request import Request,urlopen
from urllib.error import HTTPError,URLError
from urllib.parse import urlencode, urlsplit,unquote

ROOT=pathlib.Path("data/research")
INPUT=ROOT/"sacred-art-b24-commons-43-candidates.csv"
CATALOG=ROOT/"sacred-art-missing-after-b23r2.csv"
OUT=pathlib.Path("artifacts/b24-objectid-verification")
OUT.mkdir(parents=True,exist_ok=True)
API="https://commons.wikimedia.org/w/api.php"
AGENT="AdOrientem-SacredArt-ExactArtworkValidation/1.0 (+https://github.com/Fulcanelli13/ad-orientem)"
FIELDS=["artwork_id","artwork_title","catalogue_object_url","catalogue_object_identity_token","commons_file_title",
        "commons_file_page","image_url_candidate","file_license_label","file_width","file_height",
        "exact_object_identifier_found_in_wikitext","identity_match_evidence_snippet","artist_supported_by_wikitext",
        "wikitext_status","rights_verification","editorial_identity_verdict","technical_retrieval_status",
        "publication_approval","checked_utc"]
RATE_LIMIT=False

def readcsv(p):
    with p.open(newline="",encoding="utf-8") as f:return list(csv.DictReader(f))
def obj_token(url):
    if not url:return ""
    un=unquote(url)
    m=re.search(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",un,re.I)
    if m:return m.group().lower()
    m=re.search(r"/(?:notice/palissy|HistoricOrArtisticProperty|artworks)/([A-Z]{0,3}[0-9]{5,})",un,re.I)
    if m:return m.group(1).lower()
    m=re.search(r"/ark:/[0-9]+/(cl[0-9]{7,})",un,re.I)
    if m:return m.group(1).lower()
    m=re.search(r"/artwork/([0-9a-zA-Z]{8,})",un,re.I)
    if m:return m.group(1).lower()
    return ""
def pieces(arr):
    for i in range(0,len(arr),20):yield arr[i:i+20]

def fetch_content(titles):
    global RATE_LIMIT
    if RATE_LIMIT:return {},{"error":"RATE_LIMIT_DEFERRED"}
    args={"action":"query","prop":"revisions","rvslots":"main","rvprop":"content",
          "format":"json","formatversion":2,"titles":"|".join(titles),"maxlag":5}
    request=Request(API,data=urlencode(args).encode("utf-8"),
      headers={"User-Agent":AGENT,"Accept":"application/json","Content-Type":"application/x-www-form-urlencoded"},method="POST")
    try:
        with urlopen(request,timeout=58) as response:data=json.load(response)
        if data.get("error"):return {},{"error":str(data["error"])[:280]}
        found={}
        for x in data.get("query",{}).get("pages",[]):
            rev=(x.get("revisions") or [{}])[0]
            wikitext=(rev.get("slots") or {}).get("main",{}).get("content",rev.get("content",""))
            found[x.get("title","")]=wikitext
        return found,{"error":""}
    except HTTPError as e:
        if e.code==429:RATE_LIMIT=True
        return {},{"error":"HTTP_"+str(e.code)}
    except (URLError,ValueError,TimeoutError,OSError) as e:
        return {},{"error":str(e)[:280]}

def main():
    candidates=readcsv(INPUT);master=readcsv(CATALOG)
    ids={x["artwork_id"]:x for x in master}
    assert len(ids)==43 and candidates
    unique_files=sorted({c["commons_file_title"] for c in candidates})
    wiki={};errors=[]
    for i,part in enumerate(pieces(unique_files)):
        got,err=fetch_content(part)
        wiki.update(got)
        if err["error"]:errors.append({"batch":i+1,"error":err["error"]})
        print(f"WIKITEXT BATCH {i+1} of {(len(unique_files)+19)//20}: {len(got)}/{len(part)}",flush=True)
        if RATE_LIMIT:break
        time.sleep(1.1)
    records=[]
    for c in candidates:
        source=ids[c["artwork_id"]]
        url=source["legacy_source_url"] or source["legacy_object_url"]
        token=obj_token(url)
        wiki_text=wiki.get(c["commons_file_title"],"")
        needle=token.lower()
        exact=bool(needle and len(needle)>=8 and needle in html.unescape(wiki_text).lower())
        loc=html.unescape(wiki_text).lower().find(needle) if exact else -1
        snippet=re.sub(r"\s+"," ",html.unescape(wiki_text[max(0,loc-130):loc+len(needle)+130]))[:360] if exact else ""
        sur=source["artist"].split(",")[0].split(" ")[-1].casefold() if source["artist"] else ""
        artist_match=bool(len(sur)>3 and sur in wiki_text.casefold())
        row={"artwork_id":c["artwork_id"],"artwork_title":c["artwork_title"],"catalogue_object_url":url,
            "catalogue_object_identity_token":token,"commons_file_title":c["commons_file_title"],
            "commons_file_page":c["commons_file_page"],"image_url_candidate":c["image_url_candidate"],
            "file_license_label":c["file_license_label"],"file_width":c["image_width"],"file_height":c["image_height"],
            "exact_object_identifier_found_in_wikitext":"YES" if exact else "NO",
            "identity_match_evidence_snippet":snippet,"artist_supported_by_wikitext":"YES" if artist_match else "NO",
            "wikitext_status":"SOURCE_WIKITEXT_FETCHED" if wiki_text else "WIKITEXT_NOT_RETURNED",
            "rights_verification":"CANDIDATE_LICENCE_ONLY_NOT_RELEASE_CLEARED",
            "editorial_identity_verdict":"EXACT_INSTITUTIONAL_OBJECT_ID_REFERENCED" if exact else "NOT_IDENTITY_CONFIRMED",
            "technical_retrieval_status":"DISCOVERED_NOT_ACQUIRED",
            "publication_approval":"HOLD","checked_utc":datetime.now(timezone.utc).isoformat(timespec="seconds")}
        records.append(row)
    with (OUT/"Object_identity_evidence.csv").open("w",newline="",encoding="utf-8") as f:
        writer=csv.DictWriter(f,fieldnames=FIELDS);writer.writeheader();writer.writerows(records)
    summary={"artwork_entries":43,"candidate_files":len(records),"unique_file_wikitext_requested":len(unique_files),
         "unique_file_wikitext_received":len(wiki),
         "exact_object_referenced_candidate_files":sum(r["exact_object_identifier_found_in_wikitext"]=="YES" for r in records),
         "artworks_with_exact_object_references":len({r["artwork_id"] for r in records if r["exact_object_identifier_found_in_wikitext"]=="YES"}),
         "possible_file_licences_cleared_for_publication":0,"new_editorial_approvals":0,
         "images_acquired":0,"limitations":"Exact UUID/identifier string on a Commons file page is strong SOURCE DOCUMENTARY evidence, not an independently approved photo or validated copyright claim.",
         "errors":errors,"rate_limit_deferred":RATE_LIMIT,
         "checked_utc":datetime.now(timezone.utc).isoformat(timespec="seconds")}
    (OUT/"Object_identity_summary.json").write_text(json.dumps(summary,indent=2),encoding="utf-8")
    print("SUMMARY "+json.dumps(summary,sort_keys=True),flush=True)
if __name__=="__main__":main()
