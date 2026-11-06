#!/usr/bin/env python3
"""Research-only Commons metadata crosswalk for the remaining 157 handpicked works.
No image admission, painting acceptance, licencing approval or app changes.
"""
import csv, html, json, re, time
from pathlib import Path
from urllib.parse import unquote, urlparse
import requests
from audit_images import HEADERS

HERE=Path(__file__).resolve().parent
OUT=Path("artifacts/sacred-art-phase20-provenance")
API="https://commons.wikimedia.org/w/api.php"
SOURCE_KEYS=("institution","source","accession number","accession_number","id","object history","credit line")
URL_RE=re.compile(r'https?://[^\s\]\[{}<>|\"\'()]+',re.I)
MUSEUM_HOSTS=("vlaamsekunstcollectie.be","kmska.be","museabrugge.be","smkgent.be",
              "pop.culture.gouv.fr","collections.louvre.fr","musee-orsay.fr",
              "musee-augustins.fr","culture.gouv.fr","mba-lyon.fr","musee-grenoble.fr",
              "musee-magnin.fr","palaisdesbeauxarts.fr","kmb.be","musee-fabre.fr",
              "kunst?museum")
def titles(url):
    p=urlparse(url)
    if p.hostname not in ("commons.wikimedia.org","www.commons.wikimedia.org") or "/wiki/File:" not in p.path:
        return ""
    return unquote(p.path.split("/wiki/",1)[1]).replace("_"," ")
def field(wikitext,key):
    patterns=[key,key.replace(" ","_")]
    for name in patterns:
        found=re.search(r"(?im)^[ \t]*\|[ \t]*"+re.escape(name)+r"[ \t]*=[ \t]*([^\r\n]*)$",wikitext)
        if found:return found.group(1).strip()[:650]
    return ""
def human(s):
    return html.unescape(re.sub(r"<[^>]*>","",str(s or ""))).strip()
def candidates(text):
    out=[]
    for uri in URL_RE.findall(text):
        uri=uri.strip(".,;")
        domain=urlparse(uri).hostname or ""
        if domain.endswith(("wikimedia.org","wikipedia.org","wikidata.org","upload.wikimedia.org")):
            continue
        out.append(uri)
    return list(dict.fromkeys(out))[:12]
def main():
    src=list(csv.DictReader((HERE/"artworks_177.csv").open(encoding="utf-8-sig",newline="")))
    rows=[r for r in src if not r["iiif_manifest"]]
    assert len(src)==177 and len(rows)==157
    s=requests.Session()
    s.headers.update({**HEADERS,"Accept":"application/json"})
    results={r["registry_id"]:{"registry_id":r["registry_id"],"title":r["title"],"artist":r["artist"],
       "recorded_holding_museum":r["museum"],"commons_file":r["commons_url"],
       "current_museum_object_url":r["museum_object_url"],
       "commons_title":titles(r["commons_url"]),"commons_page_status":"NOT_FOUND",
       "wikimedia_license_label":"","commons_width":"","commons_height":"",
       "institution_template":"","source_field":"","accession_field":"",
       "external_source_urls":"","candidate_direct_museum_url":"",
       "museum_match_status":"RESEARCH_ONLY_NEEDS_EXACT_OBJECT_VERIFICATION"} for r in rows}
    previous=Path("reference-provenance/metadata_recovery_157.json")
    if previous.is_file():
        cached=json.loads(previous.read_text(encoding="utf-8"))
        for saved in cached:
            rid=saved.get("registry_id","")
            if rid in results and saved.get("commons_page_status")=="FOUND":
                for key in results[rid]:
                    if key in saved:results[rid][key]=saved[key]
                for key in ("institution_template","source_field","accession_field"):
                    if results[rid][key].lstrip().startswith("|"):
                        results[rid][key]=""
                if results[rid]["candidate_direct_museum_url"]:
                    results[rid]["museum_match_status"]="CANDIDATE_MUSEUM_URL_REQUIRES_OBJECT_CONFIRMATION"
                elif results[rid]["accession_field"]:
                    results[rid]["museum_match_status"]="ACCESSION_HINT_REQUIRES_MUSEUM_LOOKUP"
                elif results[rid]["institution_template"]:
                    results[rid]["museum_match_status"]="INSTITUTION_HINT_ONLY"
                else:
                    results[rid]["museum_match_status"]="RESEARCH_ONLY_NEEDS_EXACT_OBJECT_VERIFICATION"
    ids={v["commons_title"]:k for k,v in results.items() if v["commons_title"]}
    names=[title for title,rid in ids.items() if results[rid]["commons_page_status"]!="FOUND"]
    for start in range(0,len(names),5):
        subset=names[start:start+5]
        try:
            for retry in range(3):
                response=s.get(API,params={"action":"query","format":"json","formatversion":"2",
                 "prop":"imageinfo|revisions","iiprop":"extmetadata|size|url",
                 "rvprop":"content","rvslots":"main","titles":"|".join(subset)},
                 timeout=(10,40))
                if response.status_code!=429:break
                time.sleep((retry+1)*6)
            response.raise_for_status()
            pages=response.json().get("query",{}).get("pages",[])
            for page in pages:
                title=page.get("title","")
                rid=ids.get(title)
                if not rid:continue
                row=results[rid]
                if page.get("missing"):continue
                row["commons_page_status"]="FOUND"
                info=(page.get("imageinfo") or [{}])[0]
                row["commons_width"]=info.get("width","")
                row["commons_height"]=info.get("height","")
                licence=info.get("extmetadata",{}).get("LicenseShortName",{}).get("value","")
                row["wikimedia_license_label"]=human(licence)[:120]
                rev=(page.get("revisions") or [{}])[0]
                wikitext=(rev.get("slots") or {}).get("main",{}).get("content","") or rev.get("*","")
                row["institution_template"]=field(wikitext,"institution")
                row["source_field"]=field(wikitext,"source")
                row["accession_field"]=field(wikitext,"accession number") or field(wikitext,"accession_number")
                uris=candidates(wikitext)
                row["external_source_urls"]=" | ".join(uris)
                museum_uris=[u for u in uris if any(k in (urlparse(u).hostname or "") for k in MUSEUM_HOSTS)]
                if museum_uris:
                    row["candidate_direct_museum_url"]=museum_uris[0]
                    row["museum_match_status"]="CANDIDATE_MUSEUM_URL_REQUIRES_OBJECT_CONFIRMATION"
                elif row["accession_field"]:
                    row["museum_match_status"]="ACCESSION_HINT_REQUIRES_MUSEUM_LOOKUP"
                elif row["institution_template"]:
                    row["museum_match_status"]="INSTITUTION_HINT_ONLY"
        except Exception as e:
            for item in subset:
                results[ids[item]]["commons_page_status"]="REQUEST_FAILED_"+str(e)[:100]
        time.sleep(2.5)
    items=sorted(results.values(),key=lambda r:r["registry_id"])
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"metadata_recovery_157.json").write_text(json.dumps(items,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    columns=list(items[0])
    with (OUT/"metadata_recovery_157.csv").open("w",encoding="utf-8",newline="") as f:
        writer=csv.DictWriter(f,fieldnames=columns);writer.writeheader();writer.writerows(items)
    summary={"records":len(items),"commons_page_found":sum(r["commons_page_status"]=="FOUND" for r in items),
       "external_museum_url_candidates":sum(bool(r["candidate_direct_museum_url"]) for r in items),
       "accession_hints":sum(bool(r["accession_field"]) for r in items),
       "institution_template_hints":sum(bool(r["institution_template"]) for r in items),
       "objects_verified":0,"image_quality_approved":0,"gallery_changes":0}
    (OUT/"summary.json").write_text(json.dumps(summary,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(summary,indent=2),flush=True)
if __name__=="__main__":
    main()
