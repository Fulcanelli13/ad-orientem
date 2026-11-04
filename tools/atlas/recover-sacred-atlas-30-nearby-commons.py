#!/usr/bin/env python3
"""Read-only near-coordinate Commons photo discovery for the 30 unresolved Places.

Only the canonical AO Place ID coordinates may be used for this query.
A geotagged photograph within 500 m is a DISCOVERY LEAD, not proof it depicts
the church, nor author/rights verification. No media download/publication.
"""
from __future__ import annotations
from collections import Counter
from datetime import datetime, timezone
import json
import math
from pathlib import Path
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT=Path(__file__).resolve().parents[2]
T=ROOT/"data/geography/research/sacred-atlas-round17-all35-source-triage-20261104.v1.json"
G=ROOT/"data/geography/seed-registry.v1.json"
OUT=Path("/tmp/ao-sacred-atlas-round18-geotagged-30-discovery.json")
API="https://commons.wikimedia.org/w/api.php"
USER_AGENT="AdOrientemSacredAtlasGeoPhotoResearch/2026-11-04 (https://github.com/Fulcanelli13/ad-orientem; read-only, one pass, geo-proximity discovery)"
INTERVAL=8
RADIUS=500
MAX_RECORDS=20
MAX_RESPONSE=4_000_000

def inputs():
    x=json.loads(T.read_text(encoding="utf-8"))
    y=json.loads(G.read_text(encoding="utf-8"))
    assert len(y["places"])==530
    registry={p["place_id"]:p for p in y["places"]}
    unresolved=[r for r in x["rows"] if not r["source_candidates"]]
    assert len(unresolved)==30 and len({r["place_id"] for r in unresolved})==30
    cases=[]
    for row in unresolved:
        place=registry[row["place_id"]]
        lat=place.get("geo",{}).get("lat")
        lon=place.get("geo",{}).get("lng")
        if not isinstance(lat,(float,int)) or not isinstance(lon,(float,int)):
            raise ValueError("Missing canonical coordinate: "+row["place_id"])
        assert -90<=lat<=90 and -180<=lon<=180
        cases.append({"place_id":row["place_id"],"place_name":row["place_name"],
                      "lat":lat,"lon":lon,"geo_precision":place.get("geo",{}).get("precision")})
    return cases

def distance(lat1,lon1,lat2,lon2):
    r=6371000
    a=math.sin(math.radians(lat2-lat1)/2)**2+math.cos(math.radians(lat1))*math.cos(math.radians(lat2))*math.sin(math.radians(lon2-lon1)/2)**2
    return round(2*r*math.asin(min(1,math.sqrt(a))),1)

def query(lat,lon):
    params={
      "action":"query","format":"json","formatversion":"2",
      "generator":"geosearch","ggscoord":str(lat)+"|"+str(lon),
      "ggsprimary":"all","ggsnamespace":"6",
      "ggsradius":str(RADIUS),"ggslimit":str(MAX_RECORDS),
      "prop":"coordinates|imageinfo","coprimary":"all","colimit":"1",
      "iiprop":"size|sha1|mime|extmetadata","iilimit":"1"}
    u=API+"?"+urllib.parse.urlencode(params)
    if urllib.parse.urlsplit(u).hostname!="commons.wikimedia.org":
        raise ValueError("Unexpected host")
    req=urllib.request.Request(u,headers={"User-Agent":USER_AGENT,"Accept":"application/json"})
    with urllib.request.urlopen(req,timeout=45) as resp:
        if urllib.parse.urlsplit(resp.geturl()).hostname!="commons.wikimedia.org":
            raise ValueError("Unexpected redirect")
        data=resp.read(MAX_RESPONSE+1)
        if len(data)>MAX_RESPONSE:raise ValueError("Metadata too large")
    obj=json.loads(data)
    if "error" in obj:raise ValueError("Commons API error: "+str(obj["error"])[:130])
    return obj.get("query",{}).get("pages",[])

def candidates(case,pages):
    out=[]
    for p in pages:
        title=p.get("title","")
        if p.get("ns")!=6 or not title.startswith("File:"):
            continue
        coords=p.get("coordinates") or []
        point=coords[0] if coords else None
        separation=distance(case["lat"],case["lon"],float(point["lat"]),float(point["lon"])) if point else None
        info=(p.get("imageinfo") or [{}])[0]
        w,h=int(info.get("width") or 0),int(info.get("height") or 0)
        photo=info.get("mime") in ("image/jpeg","image/png","image/webp")
        out.append({
          "source_title":title,
          "source_page":"https://commons.wikimedia.org/wiki/File:"+urllib.parse.quote(title[5:].replace(" ","_"),safe="(),'!-_"),
          "distance_m_from_canonical_coord":separation,
          "original_dimensions":[w,h],
          "current_sha1_claim":info.get("sha1") or None,
          "mime":info.get("mime"),
          "basic_image_format_pass":photo and w>=1024 and h>=768,
          "evidence_scope":"GEOTAGGED_NEAR_SITE_ONLY_NOT_EXACT_BUILDING_MATCH",
          "exact_subject_verified":False,
          "rights_verified":False,
          "original_bytes_verified":False,
          "user_selected":False,
          "publication_authorized":False,
        })
    return sorted(out,key=lambda x:(x["distance_m_from_canonical_coord"] is None, x["distance_m_from_canonical_coord"] or 99999))[:MAX_RECORDS]

def audit(rows,fetch=query,sleep=time.sleep):
    output=[];paused=False
    for i,case in enumerate(rows):
        base={**case,"query_radius_m":RADIUS,"query_status":"UNQUERIED","candidates":[],"publication_authorized":False}
        if paused:
            base["query_status"]="PAUSED_AFTER_FIRST_COMMONS_429"
        else:
            if i:sleep(INTERVAL)
            try:
                data=fetch(case["lat"],case["lon"])
                base["candidates"]=candidates(case,data)
                base["query_status"]="RESULTS_NEAR_COORDINATE_NOT_SUBJECT_VERIFIED" if base["candidates"] else "NO_GEOTAGGED_FILES_WITHIN_500M"
            except urllib.error.HTTPError as e:
                base["query_status"]="HOLD_HTTP_"+str(e.code)
                if e.code==429:paused=True
            except Exception as e:
                base["query_status"]="HOLD_"+type(e).__name__.upper()
                base["error"]=str(e)[:140]
        output.append(base)
        print("GEO_SOURCE",json.dumps({"id":case["place_id"],"status":base["query_status"],"count":len(base["candidates"])}),flush=True)
    return output

def selftest():
    x={"place_id":"foo","place_name":"test","lat":51.5,"lon":11.95}
    assert distance(0,0,0,0)==0
    p={"ns":6,"title":"File:Test church.jpg",
       "coordinates":[{"lat":51.5001,"lon":11.9501}],
       "imageinfo":[{"sha1":"a"*40,"width":4000,"height":3000,"mime":"image/jpeg"}]}
    v=audit([x],fetch=lambda *args:[p],sleep=lambda n:None)[0]
    assert v["candidates"][0]["distance_m_from_canonical_coord"]<20
    assert v["candidates"][0]["original_bytes_verified"] is False
    assert v["publication_authorized"] is False
    assert v["candidates"][0]["exact_subject_verified"] is False

def main():
    import argparse
    parser=argparse.ArgumentParser()
    parser.add_argument("--self-test",action="store_true")
    parser.add_argument("--dry-run",action="store_true")
    args=parser.parse_args()
    if args.self_test:selftest();print("ROUND18_GEO_SELFTEST_PASS");return
    rows=inputs()
    if args.dry_run:
        print(json.dumps({"cases":len(rows),"radius_m":RADIUS,"max_results_per_site":MAX_RECORDS,"network_requests":0}));return
    done=audit(rows)
    stats={
      "sites":len(done),
      "queries_with_candidates":sum(bool(r["candidates"]) for r in done),
      "sites_with_no_geotagged_images":sum(r["query_status"]=="NO_GEOTAGGED_FILES_WITHIN_500M" for r in done),
      "candidate_file_records":sum(len(r["candidates"]) for r in done),
      "format_eligible_leads":sum(c["basic_image_format_pass"] for r in done for c in r["candidates"]),
      "paused_on_429":sum(r["query_status"]=="PAUSED_AFTER_FIRST_COMMONS_429" for r in done),
      "approved":0,"published":0}
    result={"schema":"AO_SACRED_ATLAS_ROUND18_THIRTY_PLACE_GEOTAGGED_COMMONS_SOURCE_LEADS_V1",
            "created_at":datetime.now(timezone.utc).isoformat(),
            "method":"One Commons generator=geosearch metadata-only query per canonical geo coordinate; 500 m radius; first HTTP429 stops all subsequent queries.",
            "scope":"NOT_A_SITE_MATCH_NOT_RIGHTS_REVIEW_NOT_EDITED_MEDIA",
            "counts":stats,
            "notes":["Coordinate proximity does not prove a file depicts the Place. Identify the building through image, file metadata and independent place source before selecting.","Direct images were never downloaded. Commons tag authorship/rights not independently cleared.","Some canonical coordinates have address rather than entrance precision; this is an imprecise search, never a source of authoritative pins.","This is a research artifact, not an approval of new files or a substitute for the original user editorial decision."],
            "rows":done}
    OUT.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print("ROUND18_GEO_SUMMARY",json.dumps(stats),flush=True)

if __name__=="__main__":main()
