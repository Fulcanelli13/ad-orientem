#!/usr/bin/env python3
"""Read-only one-pass Wikidata P18 photo discovery for 26-28 unsourced Places.
Candidate identity and rights remain unverified. Stop on HTTP 429; no retries.
"""
import argparse,json,re,time,math
from datetime import datetime,timezone
from pathlib import Path
from urllib.parse import urlencode,quote,urlsplit
from urllib.request import Request,urlopen
from urllib.error import HTTPError
ROOT=Path(__file__).resolve().parents[2]
HTML=ROOT/"data/geography/research/sacred-atlas-undecided66-bulk-photo-review-20261104.html"
SEED=ROOT/"data/geography/seed-registry.v1.json"
OUT=Path("/tmp/sacred-atlas-round20-p18.json")
API="https://www.wikidata.org/w/api.php"
UA="AdOrientemSacredAtlasWikidataResearch/2026-11-04 (https://github.com/Fulcanelli13/ad-orientem; source metadata only)"
def cases():
    s=json.loads(SEED.read_text());h=HTML.read_text()
    p=json.loads(re.search(r"const places=(.*?); const auditStatuses=",h,re.S).group(1))
    missing=[x for x in p if not x["candidates"] and not x.get("legalHold")]
    ids={x["place_id"]:x for x in s["places"]}
    result=[]
    for x in missing:
        o=ids[x["id"]];aliases=o.get("name",{}).get("aliases") or []
        names=list(dict.fromkeys([o["name"]["official"]]+aliases[:1]))
        g=o.get("geo") or {}
        result.append({"place_id":x["id"],"place_name":x["name"],
           "terms":names,"coord":{"lat":g.get("lat"),"lng":g.get("lng")}})
    if len(result)!=28:raise ValueError("Expected exactly 28 untouched Place IDs")
    return result
def fetch(p):
    u=API+"?"+urlencode({"format":"json","formatversion":"2",**p})
    with urlopen(Request(u,headers={"User-Agent":UA,"Accept":"application/json"}),timeout=40) as r:
        if urlsplit(r.geturl()).hostname!="www.wikidata.org":raise ValueError("Host redirect")
        raw=r.read(2500001)
    if len(raw)>2500000:raise ValueError("API payload oversized")
    d=json.loads(raw)
    if d.get("error"):raise ValueError("Wikidata API error")
    return d
def distance(a,b):
    lat1,lon1,lat2,lon2=map(math.radians,[a["lat"],a["lng"],b["latitude"],b["longitude"]])
    z=math.sin((lat2-lat1)/2)**2+math.cos(lat1)*math.cos(lat2)*math.sin((lon2-lon1)/2)**2
    return round(12742000*math.asin(min(1,math.sqrt(z))),1)
def discover(rows,api=fetch,pause=time.sleep):
    calls=0;stopped=False
    for r in rows:
        r.update({"matches":[],"p18_files":[],"search_status":"NONE","publication_authorized":False})
        if stopped:r["search_status"]="PAUSED_AFTER_HTTP_429";continue
        for term in r["terms"]:
            if calls:pause(2.5)
            try:
                d=api({"action":"wbsearchentities","language":"en","type":"item",
                       "limit":"5","search":term});calls+=1
            except HTTPError as e:
                r["search_status"]="HOLD_HTTP_"+str(e.code)
                if e.code==429:stopped=True
                break
            except Exception as e:
                r["search_status"]="HOLD_API_"+type(e).__name__;break
            r["matches"]=[{"qid":x["id"],"label":x.get("label"),"description":x.get("description")}
                          for x in d.get("search",[]) if re.fullmatch(r"Q\d+",x.get("id",""))]
            if r["matches"]:break
        if r["search_status"]=="NONE":r["search_status"]="WIKIDATA_CANDIDATES" if r["matches"] else "NO_LABEL_MATCH"
        print("P18_SEARCH",json.dumps({"id":r["place_id"],"status":r["search_status"],"entities":len(r["matches"])}),flush=True)
    if stopped:return rows,calls,True
    qids=list(dict.fromkeys(m["qid"] for r in rows for m in r["matches"]))
    entities={}
    for i in range(0,len(qids),25):
        if calls:pause(2.5)
        try:
            d=api({"action":"wbgetentities","ids":"|".join(qids[i:i+25]),
                   "props":"claims|labels|descriptions","languages":"en"});calls+=1
            entities.update(d.get("entities") or {})
        except HTTPError as e:
            if e.code==429:stopped=True
            break
        except Exception:break
    for r in rows:
        for match in r["matches"]:
            e=entities.get(match["qid"]) or {}
            props=e.get("claims") or {}
            coords=[]
            for x in props.get("P625",[])[:2]:
                v=((x.get("mainsnak") or {}).get("datavalue") or {}).get("value")
                if isinstance(v,dict) and "latitude" in v:coords.append(v)
            for claim in props.get("P18",[])[:2]:
                v=((claim.get("mainsnak") or {}).get("datavalue") or {}).get("value")
                if not isinstance(v,str) or len(v)>250:continue
                dmin=min((distance(r["coord"],p) for p in coords),default=None) if all(isinstance(r["coord"][k],(float,int)) for k in ("lat","lng")) else None
                status="NEARBY_P18_REQUIRES_EXACT_SITE_CHECK" if dmin is not None and dmin<=750 else ("DISTANT_P18_HOLD" if dmin is not None and dmin>2500 else "P18_IDENTITY_REVIEW_REQUIRED")
                r["p18_files"].append({"qid":match["qid"],"label":match["label"],
                    "description":match["description"],"source_title":"File:"+v,
                    "source_page":"https://commons.wikimedia.org/wiki/File:"+quote(v.replace(" ","_"),safe="(),'!-_"),
                    "distance_m":dmin,"status":status,"subject_verified":False,
                    "rights_verified":False,"original_verified":False,"editorial_approved":False,"publication_authorized":False})
    return rows,calls,stopped
def main():
    a=argparse.ArgumentParser();a.add_argument("--self-test",action="store_true");a.add_argument("--dry-run",action="store_true");x=a.parse_args()
    if x.self_test:
        assert distance({"lat":0,"lng":0},{"latitude":0,"longitude":0})==0
        cases0=[{"place_id":"test","terms":["Church"],"coord":{"lat":0,"lng":0}}]
        def fake(p):
            if p["action"]=="wbsearchentities":return {"search":[{"id":"Q1","label":"Church"}]}
            return {"entities":{"Q1":{"claims":{"P18":[{"mainsnak":{"datavalue":{"value":"Church.jpg"}}}],
                    "P625":[{"mainsnak":{"datavalue":{"value":{"latitude":0,"longitude":0}}}}]}}}}
        r,c,halt=discover(cases0,api=fake,pause=lambda _:None)
        assert c==2 and not halt and len(r[0]["p18_files"])==1 and not r[0]["publication_authorized"]
        print("P18_SELFTEST_PASS");return
    rows=cases()
    if x.dry_run:print(json.dumps({"unsourced_places":len(rows),"requests":0}));return
    rows,calls,stopped=discover(rows)
    counts={"places":len(rows),"p18_places":sum(bool(x["p18_files"]) for x in rows),
           "p18_files":sum(len(x["p18_files"]) for x in rows),"api_calls":calls,
           "http_429_halt":stopped,"editorial_approved":0,"published":0}
    OUT.write_text(json.dumps({"schema":"AO_SACRED_ATLAS_ROUND20_P18_SOURCE_DISCOVERY_V1",
        "date_utc":datetime.now(timezone.utc).isoformat(),"counts":counts,"rows":rows,
        "scope":"SOURCE_MATCH_CANDIDATES_ONLY_NO_RIGHTS_OR_COVER_PUBLICATION"},indent=2,ensure_ascii=False)+"\n")
    print("P18_SUMMARY",json.dumps(counts),flush=True)
if __name__=="__main__":main()
