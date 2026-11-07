#!/usr/bin/env python3
"""Phase 39: read-only, bounded official catalogue/source probe for 14 artwork holds.

No changes to artwork approvals, images, Prayer, Calendar, galleries or main.
Every hit is a candidate: no automatic institutional identity promotion.
"""
from __future__ import annotations
import concurrent.futures
import json
import re
import time
from pathlib import Path
from urllib.parse import urlparse
import requests

OUT = Path("artifacts/sacred-art-phase39-fourteen-source-probe")
OUT.mkdir(parents=True, exist_ok=True)
UA = {"User-Agent": "AdOrientemSacredArtResearch/1.0 (noncommercial source verification; contact via project GitHub)", "Accept": "application/json,text/html;q=0.8,*/*;q=0.5"}
MAX_BYTES = 3_000_000
TIMEOUT = (6, 20)
PHASE38 = Path("data/research/sacred-art/phase38-fifteen-work-consolidated-museum-source-recheck-20261107.v1.json")
EXPECTED = {"RECENT575::005","RECENT575::031","RECENT575::032","RECENT575::033","RECENT575::034","RECENT575::035",
            "RECENT575::142","RECENT575::154","RECENT575::179","RECENT575::392","RECENT575::402",
            "RECENT575::440","RECENT575::503","RECENT575::542"}

def fetch(url,params=None):
    record = {"url":url,"params":params or {},"status":None,"content_type":"","error":"","size":0,"json":False,"excerpt":""}
    try:
        with requests.get(url,params=params,headers=UA,timeout=TIMEOUT,stream=True,allow_redirects=True) as response:
            record["status"]=response.status_code
            record["url_final"]=response.url
            record["content_type"]=response.headers.get("Content-Type","")
            buf=bytearray()
            for chunk in response.iter_content(8192):
                if len(buf)+len(chunk)>MAX_BYTES:
                    record["error"]="RESPONSE_EXCEEDS_3MB"
                    break
                buf.extend(chunk)
            record["size"]=len(buf)
            if not record["error"]:
                text=buf.decode("utf-8","replace")
                record["excerpt"]=text[:400]
                try:
                    record["document"]=json.loads(text)
                    record["json"]=True
                except Exception:
                    record["text"]=re.sub(r"\s+"," ",re.sub(r"<[^>]+>"," ",text))[:16000]
    except Exception as exc:
        record["error"]=f"{type(exc).__name__}: {str(exc)[:250]}"
    return record

def find_records(node, depth=0):
    if depth>5: return []
    if isinstance(node,list):
        if node and isinstance(node[0],dict):
            return node
        return []
    if isinstance(node,dict):
        for key in ("results","records","data","items","member","members","objects","_embedded"):
            sub=node.get(key)
            if isinstance(sub,list):return sub
            if isinstance(sub,dict):
                match=find_records(sub,depth+1)
                if match:return match
    return []

def scan_kmska():
    base="https://datahub.kmska.be/api/v1/data.json"
    first=fetch(base,{"limit":99,"offset":0})
    diagnostics=[{k:v for k,v in first.items() if k not in ("document","text")}]
    found=[]
    if first["status"]!=200 or not first["json"]:
        return {"status":"ENDPOINT_UNAVAILABLE","diagnostics":diagnostics,"candidate_records":[],"pages_examined":1}
    page_records=find_records(first.get("document"))
    if not page_records:
        return {"status":"UNRECOGNIZED_API_SHAPE","diagnostics":diagnostics,"candidate_records":[],"pages_examined":1}
    def screen(records,offset):
        matches=[]
        for i,item in enumerate(records):
            raw=json.dumps(item,ensure_ascii=False)
            if re.search("herreyns|herryns|heereyns|areyns",raw,re.I):
                matches.append({"offset":offset,"page_item_index":i,"candidate_excerpt":raw[:9000],
                  "identity_grade":"SEARCH_CANDIDATE_ONLY_EXACT_OBJECT_NOT_VERIFIED"})
        return matches
    found.extend(screen(page_records,0))
    total=13977
    if isinstance(first.get("document"),dict):
        for key in ("total","total_count","count","numFound"):
            v=first["document"].get(key)
            if isinstance(v,int) and v>0:total=min(v,15000)
    count=1
    # Respectful bounded paging; 99 items/request, no more than 143 pages.
    for offset in range(99,min(total,14157),99):
        rec=fetch(base,{"limit":99,"offset":offset})
        count+=1
        if rec["status"]!=200 or not rec["json"]:
            diagnostics.append({"offset":offset,"status":rec["status"],"error":rec["error"],"excerpt":rec["excerpt"]})
            if len(diagnostics)>=5:break
            continue
        page=find_records(rec.get("document"))
        if not page:break
        found.extend(screen(page,offset))
        if len(page)<99:break
        time.sleep(0.08)
    return {"status":"SCANNED_WITH_REVIEW_CANDIDATES" if found else "NO_HERREYNS_METADATA_MATCH",
      "pages_examined":count,"candidate_count":len(found),"candidate_records":found[:100],
      "diagnostics":diagnostics}

PROBES={
 "RECENT575::142":[("KIK_IRPA_HERREGOUTS_DIFFERENT_ARTWORK","https://balat.kikirpa.be/en/object/89062/")],
 "RECENT575::154":[("FLEMISH_OFFICIAL_ST_JEROME","https://vlaamsekunstcollectie.be/en/collection/0000-GRO0420-I"),
   ("BRUGGE_OFFICIAL_ST_JEROME","https://www.museabrugge.be/collection/work/id/0000_gro0420_i")],
 "RECENT575::179":[("KIK_IRPA_NICHOLAS_ALTARPIECE","https://balat.kikirpa.be/en/object/152399/")],
 "RECENT575::392":[("POP_JOCONDE_P85","https://pop.culture.gouv.fr/notice/joconde/000PE016876")],
 "RECENT575::402":[("POP_JOCONDE_P48","https://pop.culture.gouv.fr/notice/joconde/000PE017694")],
 "RECENT575::503":[("POP_JOCONDE_MG2405","https://pop.culture.gouv.fr/notice/joconde/09940006297")],
 "RECENT575::542":[("POP_JOCONDE_MAGNIN","https://pop.culture.gouv.fr/notice/joconde/50110001768")],
}
for key,term in (("RECENT575::392","P 85"),("RECENT575::402","P 48"),("RECENT575::503","MG 2405"),("RECENT575::542","1938 E 294")):
    PROBES.setdefault(key,[]).append(("FRENCH_CULTURE_OPEN_DATA", 
       "https://data.culture.gouv.fr/api/explore/v2.1/catalog/datasets/base-joconde-extrait/records"))
    PROBES[key][-1] += ({"where":'search("'+term+'")',"limit":20},)
# Unmatched Dijon original needs a composition/canonical ID, not a generic title search.
PROBES["RECENT575::440"]=[("EXISTING_PHOTO_REFERENCE",
    "https://commons.wikimedia.org/wiki/File:La_D%C3%A9position_de_Croix.png")]
def probe_entry(entry):
    rid,label,url,*args=entry
    r=fetch(url,args[0] if args else None)
    result={"registry_id":rid,"probe":label,"http_status":r["status"],"url":url,
       "resolved_url":r.get("url_final",url),"error":r["error"],"content_type":r["content_type"],
       "bytes":r["size"],"identity_decision":"UNVERIFIED_REQUIRES_HUMAN_SOURCE_CROSSWALK"}
    if r["json"]:
        doc=r["document"]
        results=find_records(doc)
        selected=[]
        for item in results[:20]:
            selected.append(json.dumps(item,ensure_ascii=False)[:3000])
        result["record_count"]=len(results)
        result["sample_records"]=selected[:20]
        result["json_keys"]=list(doc)[:25] if isinstance(doc,dict) else []
    else:
        raw=r.get("text","")
        result["page_excerpt"]=raw[:3500]
        result["term_occurrences"]={term:len(re.findall(re.escape(term),raw,re.I))
              for term in ("Herreyns","Ter Brugghen","Jordaens","de Wet","Teniers","GRO0420","Herregouts")}
    return result

def main():
    phase=json.loads(PHASE38.read_text(encoding="utf-8"))
    outstanding=set(phase["still_unresolved_ids"])
    assert outstanding==EXPECTED,(sorted(outstanding),sorted(EXPECTED))
    start=time.monotonic()
    kmska=scan_kmska()
    jobs=[(rid,label,url,*rest) for rid,entries in PROBES.items() for label,url,*rest in entries]
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        retrieved=list(pool.map(probe_entry,jobs))
    retrieved.sort(key=lambda o:(o["registry_id"],o["probe"]))
    manifest={
      "schema":"AO_SACRED_ART_PHASE39_BOUNDED_OFFICIAL_ENDPOINT_EVIDENCE",
      "baseline":{"identity_supported":163,"unresolved":14,"handpicked":177},
      "reviewed_registry_ids":sorted(outstanding),
      "kmska_scan":kmska,
      "other_source_probes":retrieved,
      "elapsed_seconds":round(time.monotonic()-start,2),
      "research_only":True,"gallery_replacements":0,"new_artwork_admissions":0,
      "note":"A successful HTTP request or search token match is NOT exact object identity evidence. All discovered candidates require artist/title/accession and exact original-composition crosswalk."
    }
    (OUT/"evidence.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    counts={}
    for item in retrieved:counts[str(item["http_status"])]=counts.get(str(item["http_status"]),0)+1
    summary={"kmska_scan_status":kmska["status"],"kmska_pages_examined":kmska["pages_examined"],
             "kmska_herreyns_candidate_count":kmska.get("candidate_count",0),
             "other_probes":len(retrieved),"http_statuses":counts,"manual_reviews_required":14,
             "photograph_replacements":0,"elapsed_seconds":manifest["elapsed_seconds"]}
    (OUT/"summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(summary,ensure_ascii=False,indent=2),flush=True)
if __name__=="__main__":
    main()
