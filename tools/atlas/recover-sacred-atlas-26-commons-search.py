#!/usr/bin/env python3
"""One-pass filename/text search of Commons for 26 Sacred Atlas Places with no file lead.
Never approves, downloads or edits media. Stop all work on first HTTP 429.
"""
from __future__ import annotations
import argparse, html, json, re, time, urllib.error, urllib.parse, urllib.request
from datetime import datetime, timezone
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
REVIEW=ROOT/"data/geography/research/sacred-atlas-undecided66-bulk-photo-review-20261104.html"
OUT=Path("/tmp/ao-sacred-atlas-round21-commons-search26.json")
API="https://commons.wikimedia.org/w/api.php"
UA="AdOrientemSacredAtlas26SourceSearch/2026-11-04 (https://github.com/Fulcanelli13/ad-orientem; read-only, one-time, paced)"
WAIT=5
MAX_RESULTS=12
MAX_RESP=5_000_000
SEARCH={
"place:NZ:st-peter-chanel-russell":["St Peter Chanel Russell","Peter Chanel Kororareka"],
"place:NG:ugwogo-nike-national-marian-shrine":["Our Mother Perpetual Help Ugwogo","Marian shrine Ugwogo Nike Enugu"],
"place:NG:nne-enyemaka-umuaka":["Nne Enyemaka Umuaka","Our Lady Perpetual Help Umuaka"],
"place:US:st-mary-assumption-oswego":["St Mary Oswego New York","St Mary Assumption Oswego church"],
"place:US:st-anne-fiskdale":["Saint Anne shrine Fiskdale","Saint Anne Sturbridge Massachusetts"],
"place:BE:sanctuaire-sainte-julienne-cornillon":["Sanctuaire Sainte Julienne Cornillon","sanctuaire Mont Cornillon Liege"],
"place:JP:our-lady-akita-convent":["Our Lady of Akita convent","Seitai Hoshikai Akita"],
"place:IE:solas-bhride-kildare":["Solas Bhride Kildare","Solas Bríde centre"],
"place:ZM:archdiocese-lusaka-marian-shrine":["Marian Shrine Lusaka","Mother Mary shrine Lusaka Zambia"],
"place:MZ:namaacha-fatima-sanctuary":["santuario Nossa Senhora Fatima Namaacha","church Fatima Namaacha Mozambique"],
"place:TT:laventille-our-lady-fatima-shrine":["Our Lady Fatima Laventille","Lady of Fatima Picton Road Trinidad"],
"place:BZ:belmopan-our-lady-guadalupe-co-cathedral":["Our Lady Guadalupe Belmopan","Guadalupe Co Cathedral Belize"],
"place:CR:montes-oca-our-lady-lourdes-parish":["Nuestra Senora Lourdes Montes Oca","Nuestra Señora de Lourdes San Pedro Costa Rica"],
"place:GL:christ-the-king-catholic-church-nuuk":["Christ King Church Nuuk","Kristus Kongens Nuuk church"],
"place:OM:saints-peter-paul-catholic-church-ruwi":["Saints Peter Paul Ruwi","Catholic church Ruwi Oman"],
"place:BB:st-patrick-catholic-cathedral-bridgetown":["Saint Patrick Cathedral Bridgetown","St Patrick Cathedral Barbados"],
"place:JM:holy-trinity-cathedral-kingston":["Holy Trinity Cathedral Kingston Jamaica","Catholic cathedral North Street Kingston"],
"place:MW:maula-cathedral-lilongwe":["Maula Cathedral Lilongwe","Our Lady Queen Africa Lilongwe cathedral"],
"place:AS:holy-family-cathedral-tafuna":["Holy Family Cathedral Tafuna","Holy Family Cathedral American Samoa"],
"place:PG:holy-cross-procathedral-vanimo":["Holy Cross Pro Cathedral Vanimo","Catholic Cathedral Vanimo PNG"],
"place:IT:santuario-san-paolo-della-croce-ovada":["Santuario San Paolo Croce Ovada","chiesa San Paolo Croce Ovada"],
"place:MY:st-jude-church-rawang":["Church of Saint Jude Rawang","St Jude Rawang Selangor"],
"place:PE:santuario-san-martin-de-porres-jicamarca":["Santuario San Martin Porres Jicamarca","San Martin de Porres Huarochiri santuario"],
"place:US:sacred-heart-shrine-hales-corners":["Sacred Heart Shrine Hales Corners","Sacred Heart Wisconsin shrine Hales Corners"],
"place:NI:ermita-guadalupe-matagalpa":["Ermita Guadalupe Matagalpa","Santuario Guadalupe Matagalpa Nicaragua"],
"place:LK:national-shrine-our-lady-matara":["Our Lady of Matara shrine","St Mary's church Matara Sri Lanka"]
}
def clean(s):
    return " ".join(html.unescape(re.sub(r"<[^>]*>"," ",str(s or ""))).split())[:450]
def queue():
    h=REVIEW.read_text(encoding="utf8")
    m=re.search(r"const places=(.*?); const auditStatuses=",h,re.S)
    if not m:raise ValueError("Missing canonical review")
    places=json.loads(m.group(1))
    # Freeze this initial Round 21 cohort by canonical ID: subsequent reviewed
    # research leads must not invalidate reproducibility of the original search.
    missing=[p for p in places if p["id"] in SEARCH]
    ids={p["id"] for p in missing}
    if len(missing)!=26 or ids!=set(SEARCH):raise ValueError(f"Frozen 26 cohort mismatch {len(missing)}")
    return missing
def fetch(term):
    params=urllib.parse.urlencode({
        "action":"query","format":"json","formatversion":"2",
        "generator":"search","gsrsearch":term,"gsrnamespace":"6",
        "gsrlimit":str(MAX_RESULTS),"prop":"imageinfo","iiprop":"size|sha1|mime|extmetadata",
        "iilimit":"1",
    })
    url=API+"?"+params
    req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"application/json"})
    with urllib.request.urlopen(req,timeout=45) as resp:
        if urllib.parse.urlsplit(resp.geturl()).hostname!="commons.wikimedia.org":
            raise ValueError("Unsafe Commons redirect")
        data=resp.read(MAX_RESP+1)
    if len(data)>MAX_RESP:raise ValueError("Oversized search metadata")
    obj=json.loads(data)
    if obj.get("error"):raise ValueError("Commons API query error: "+str(obj["error"])[:130])
    return obj.get("query",{}).get("pages",[])
def photos(pages,term):
    found=[]
    for p in pages:
        title=p.get("title","")
        if not title.startswith("File:") or p.get("ns")!=6:continue
        info=(p.get("imageinfo") or [{}])[0]
        w,h=int(info.get("width") or 0),int(info.get("height") or 0)
        meta=info.get("extmetadata") or {}
        val=lambda k:clean((meta.get(k) or {}).get("value"))
        found.append({
          "source_title":title,
          "source_url":"https://commons.wikimedia.org/wiki/File:"+urllib.parse.quote(title[5:].replace(" ","_"),safe="(),'!-_"),
          "search_term":term,
          "dimensions":[w,h],"source_sha1_claim":info.get("sha1"),
          "mime":info.get("mime"),"license_claim":val("LicenseShortName"),
          "license_url_claim":val("LicenseUrl"),"author_claim":val("Artist"),
          "photo_format_and_size_eligible":(info.get("mime") in {"image/jpeg","image/png","image/webp"} and w>=1024 and h>=768),
          "exact_site_verified":False,"original_bytes_verified":False,
          "rights_verified":False,"user_selected":False,"publication_authorized":False
        })
    return found
def research(cases,request=fetch,sleep=time.sleep):
    out=[];queries=0;halt=False
    for item in cases:
        row={"place_id":item["id"],"place_name":item["name"],"country":item["country"],
             "terms":SEARCH[item["id"]],"queries":[],"candidates":[],"status":"UNQUERIED",
             "publication_authorized":False}
        if halt:
            row["status"]="PAUSED_AFTER_FIRST_HTTP_429"
            out.append(row);continue
        unique={}
        for term in row["terms"]:
            if queries:sleep(WAIT)
            try:
                pages=request(term);queries+=1
                results=photos(pages,term)
                for r in results:unique.setdefault(r["source_title"].casefold(),r)
                row["queries"].append({"term":term,"returned":len(results),"status":"OK"})
            except urllib.error.HTTPError as e:
                row["queries"].append({"term":term,"status":"HTTP_"+str(e.code)})
                if e.code==429:halt=True
                break
            except Exception as e:
                row["queries"].append({"term":term,"status":"ERROR_"+type(e).__name__,"detail":str(e)[:120]})
                break
            # Always research both exact-name and alternate-language terms, for coverage.
        row["candidates"]=list(unique.values())
        row["status"]="PAUSED_DURING_PLACE" if halt else ("FOUND_UNVERIFIED_SEARCH_RESULTS" if unique else "NO_COMMONS_FILE_RESULTS")
        out.append(row)
        print("ROUND21_SITE",json.dumps({"place_id":row["place_id"],"status":row["status"],"candidates":len(unique)}),flush=True)
    return out,queries,halt
def selftest():
    cases=[{"id":"place:US:st-mary-assumption-oswego","name":"St Mary","country":"US"}]
    def fake(q):
        return [{"title":"File:St Mary's church Oswego.jpg","ns":6,"imageinfo":[{"width":2400,"height":1600,"mime":"image/jpeg","sha1":"a"*40}]}]
    x,n,halt=research(cases,request=fake,sleep=lambda _:None)
    assert n==2 and not halt and len(x[0]["candidates"])==1 and x[0]["candidates"][0]["exact_site_verified"] is False
def main():
    arg=argparse.ArgumentParser();arg.add_argument("--dry-run",action="store_true");arg.add_argument("--self-test",action="store_true");a=arg.parse_args()
    if a.self_test:selftest();print("ROUND21_SELFTEST_PASS");return
    cases=queue()
    if a.dry_run:print(json.dumps({"exact_canonical_places":len(cases),"searches_max":52,"network_requests":0}));return
    rows,calls,halt=research(cases)
    summary={"target_places":len(cases),"places_with_file_results":sum(bool(r["candidates"]) for r in rows),
      "file_search_results":sum(len(r["candidates"]) for r in rows),
      "potentially_format_eligible":sum(c["photo_format_and_size_eligible"] for r in rows for c in r["candidates"]),
      "requests_completed":calls,"halted_on_429":halt,"selected":0,"published":0}
    d={"schema":"AO_SACRED_ATLAS_ROUND21_26_COMMONS_TEXT_SEARCH_RESULTS_V1",
       "retrieved_utc":datetime.now(timezone.utc).isoformat(),
       "scope":"UNVERIFIED_FILENAME_OR_TEXT_MATCHES_ONLY_NOT_IMAGE_APPROVAL",
       "method":"Paced one-time Commons generator=search with two location-specific names per canonical Place, File namespace only, original metadata attached; halt at first 429.",
       "restrictions":["No file with a mere text match is presumed to depict the specified physical Place.","Image source metadata and copyright require independent review. No image binary downloaded.","Do not infer creative licence from Commons listing or promote any result without visual proof and exact address.","No use of alternate accounts, API endpoints or repeated requests to bypass rate limits.","No existing approved covers or 51 explicit NONE_SELECTED results changed."],
       "counts":summary,"rows":rows}
    OUT.write_text(json.dumps(d,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    print("ROUND21_SEARCH_SUMMARY",json.dumps(summary),flush=True)
if __name__=="__main__":main()
