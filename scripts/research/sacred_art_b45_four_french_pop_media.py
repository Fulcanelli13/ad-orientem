#!/usr/bin/env python3
"""B45 — look up 4 accession-specific French POP / Mémoire photo crosswalks
through official Opendatasoft v2.1, not repeated blocked museum pages.
The open dataset license covers metadata; independently clear photo copyright
before any commercial/editorial use. Nothing in this script promotes images.
"""
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.parse import urlencode,urlsplit
from urllib.error import HTTPError,URLError
import json,re,time

ROOT=Path("data/research")
WORK=ROOT/"sacred-art-b45-four-palissy-prado-lenzi-worklist.json"
OUT=ROOT/"sacred-art-b45-four-pop-memoire-official-api-results.json"
API="https://data.culture.gouv.fr/api/explore/v2.1"
UA="AdOrientemHistoricalArtResearch/2026 (+https://github.com/Fulcanelli13/ad-orientem)"
ALLOWED={"data.culture.gouv.fr"}
MAX_BODY=2_500_000
def fetch(path,params):
    qs=urlencode(params)
    url=API+path+"?"+qs
    req=Request(url,headers={"User-Agent":UA,"Accept":"application/json"})
    with urlopen(req,timeout=18) as f:
        h=urlsplit(f.geturl())
        if h.hostname not in ALLOWED or h.scheme!="https" or f.status!=200:
            raise RuntimeError("Bad official API redirect or HTTP status")
        ct=f.headers.get("Content-Type","").lower()
        if "json" not in ct:raise RuntimeError("Unexpected metadata response MIME "+ct)
        b=f.read(MAX_BODY+1)
        if len(b)>MAX_BODY:raise RuntimeError("Official JSON too large")
        return json.loads(b)
def safe_failure(e):
    return type(e).__name__+": "+str(e)[:200]
def safe_export(record):
    # Limit evidence size and never expose arbitrary private contact fields.
    data=record.get("record") or record
    if not isinstance(data,dict):return {}
    out={}
    for k,v in data.items():
        if k.lower() in ("record_id","id","ref","reference","lbase","photo","photographe",
                         "img","url","url_img","url_media","lien","cote","titre","sujet","leg",
                         "autp","cred","autr","desc","source","mem","copyright","droit","cliché"):
            out[k]=v if isinstance(v,(str,int,float,bool)) else json.dumps(v,ensure_ascii=False)[:700]
    return out
def main():
    master=json.loads(WORK.read_text(encoding="utf-8"))
    cases=master["scope"]
    assert len(cases)==4
    out={"schema":"AO_B45_PALISSY_MEMOIRE_EXACT_MEDIA_CROSSWALK_V1","date":"2026-10-24",
         "strategy":"search licensed government metadata by exact Palissy/Mémoire references; do not infer image rights from text open data or missing API access",
         "scope_cases":4,"official_catalogue_discovery_status":"UNKNOWN",
         "dataset_matches":[],"dataset_discovery_errors":[],"target_cases":[],
         "source_photo_files_downloaded":0,"source_photo_original_bytes":0,
         "frozen_artworks_newly_completed":0,"app_photo_reuse_approvals":0,
         "editorial_photo_selections":0,"strictly_zero_euro":True}
    discovered={}
    for term in ("mémoire", "palissy"):
        # Official Opendatasoft API, no scraping or repeated 401.
        try:
            j=fetch("/catalog/datasets",{"where":"search('"+term+"')","limit":40})
            hits=j.get("results",[])
            if not isinstance(hits,list):raise ValueError("Bad official dataset list")
            for x in hits:
                did=x.get("dataset_id") or x.get("dataset",{}).get("dataset_id")
                if not did or not re.fullmatch(r"[a-z0-9-]{4,120}",did):continue
                texts=" ".join([did,str(x.get("metas",{}).get("default",{}).get("title",""))])
                if ("memoir" in texts.lower() or "palissy" in texts.lower() or "monument" in texts.lower()):
                    discovered[did]={"dataset_id":did,"public_title":texts[:260],"matched_search_term":term}
            out["dataset_discovery_errors"].append({"term":term,"status":"OK","candidates":len(hits)})
        except Exception as e:
            out["dataset_discovery_errors"].append({"term":term,"status":"OFFICIAL_API_ACCESS_BLOCKED","error":safe_failure(e)})
        time.sleep(.3)
    # Query only high relevance photo linked metadata datasets. Do not harvest broad collections.
    ranked=sorted(discovered.values(),key=lambda x:(0 if "memoir" in x["dataset_id"] else 1, 0 if "palissy" in x["dataset_id"] else 1))
    chosen=[x for x in ranked if "memoir" in x["dataset_id"] or "palissy" in x["dataset_id"]][:5]
    out["dataset_matches"]=chosen
    out["official_catalogue_discovery_status"]="FOUND_DATASET_CANDIDATES" if chosen else "NO_DATASET_IDENTIFIED_OR_ACCESS_BLOCKED"
    for item in cases:
        ref=item["palissy"]; case={"artwork_id":item["artwork_id"],"record_id":ref,
           "accessions_not_guessed":True,"exact_source_photo_url_certified":False,
           "photo_app_rights_cleared":False,"original_image_downloaded":False,
           "evidence":[],"records_with_exact_ref":0,"access_holds":[]}
        for d in chosen:
            # Target exact accession via keyword search, safe fallback if ID not in exposed fields.
            try:
                j=fetch("/catalog/datasets/"+d["dataset_id"]+"/records",
                  {"where":"search('"+ref+"')","limit":10})
                raw=j.get("results",[])
                if not isinstance(raw,list):raise ValueError("non-records response")
                matched=[]
                for v in raw:
                    serial=json.dumps(v,ensure_ascii=False)
                    if ref not in serial:continue
                    matched.append(safe_export(v))
                case["evidence"].append({"dataset_id":d["dataset_id"],
                     "queried_accession":ref,
                     "records_returned":len(raw),"exact_reference_records":len(matched),
                     "safe_catalogue_fields":matched[:4]})
                case["records_with_exact_ref"]+=len(matched)
            except Exception as e:
                case["access_holds"].append({"dataset_id":d["dataset_id"],"status":"API_ACCESS_HOLD_NOT_ABSENCE_PROOF","error":safe_failure(e)})
            time.sleep(.15)
        out["target_cases"].append(case)
        print("B45_FRENCH",ref,"matches",case["records_with_exact_ref"],"holds",len(case["access_holds"]),flush=True)
    assert len(out["target_cases"])==4
    out["datasets_examined"]=len(chosen)
    out["dataset_exact_reference_case_hits"]=sum(bool(c["records_with_exact_ref"]) for c in out["target_cases"])
    out["official_metadata_requests_blocked"]=sum(len(c["access_holds"]) for c in out["target_cases"])+sum(x["status"]!="OK" for x in out["dataset_discovery_errors"])
    out["new_photo_source_candidates_found"]=0
    out["no_photo_exists_inference_allowed"]=False
    OUT.write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print("B45_FRENCH_SUMMARY",json.dumps({k:out[k] for k in
        ("scope_cases","datasets_examined","dataset_exact_reference_case_hits",
        "official_metadata_requests_blocked","new_photo_source_candidates_found")}),flush=True)
if __name__=="__main__":main()
