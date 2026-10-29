#!/usr/bin/env python3
"""Bounded FREE Wikidata country-level church P18 index. Research-only metadata.

One SPARQL query per country, no per-church requests or binary downloads.
The query deliberately covers direct P31=church building/cathedral with P17,
P18; it is a high-precision *partial* index, NOT complete worldwide coverage.
Query failures and LIMIT truncation are recorded, never silently counted as
"no images". Wikimedia WDQS quota/timeout rules are honored.
"""
import argparse
import datetime as dt
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

WDQS="https://query.wikidata.org/sparql"
SCHEMA="AO_WIKIDATA_CHURCH_IMAGES_BY_COUNTRY_V1"
UA="AdOrientemCountryPhotoResearch/0.1 (https://github.com/Fulcanelli13/ad-orientem; research only, Wikimedia policy aware)"
P31_CLASSES=("Q16970","Q2977") # church building, cathedral
MAX_PER_COUNTRY=3000

def query_for_country(country,limit=MAX_PER_COUNTRY):
    if not re.fullmatch(r"[A-Z]{2}",country):raise ValueError("country code must be ISO alpha-2")
    if not 1<=limit<=MAX_PER_COUNTRY:raise ValueError("country maximum 3000")
    return f'''SELECT DISTINCT ?item ?label ?image ?coord ?adminLabel WHERE {{
  ?country wdt:P297 "{country}" .
  VALUES ?class {{ wd:Q16970 wd:Q2977 }}
  ?item wdt:P31 ?class ; wdt:P17 ?country ; wdt:P18 ?image .
  OPTIONAL {{ ?item wdt:P625 ?coord . }}
  OPTIONAL {{ ?item rdfs:label ?label . FILTER(LANG(?label)="en") }}
  OPTIONAL {{ ?item wdt:P131 ?admin .
             ?admin rdfs:label ?adminLabel . FILTER(LANG(?adminLabel)="en") }}
}} LIMIT {limit}'''

def call_country(country,limit=MAX_PER_COUNTRY,timeout=58,retries=2,delay=time.sleep):
    query=query_for_country(country,limit)
    request=urllib.request.Request(WDQS+"?"+urllib.parse.urlencode({"query":query}),
        headers={"User-Agent":UA,"Accept":"application/sparql-results+json",
                 "Accept-Encoding":"identity"})
    errors=[]
    for attempt in range(retries+1):
        try:
            with urllib.request.urlopen(request,timeout=timeout) as resp:
                content=resp.read(8_000_001)
                if len(content)>8_000_000:
                    raise ValueError("Response exceeds 8MB safety cap")
                data=json.loads(content.decode("utf-8"))
            bindings=data["results"]["bindings"]
            if len(bindings)>limit:raise ValueError("Query exceeded expected result limit")
            entries=[]
            for item in bindings:
                def val(key):return (item.get(key) or {}).get("value") or ""
                qid=val("item").rsplit("/",1)[-1]
                if not re.fullmatch(r"Q[1-9][0-9]*",qid):continue
                image=val("image")
                if not image.startswith(("http://commons.wikimedia.org/",
                                        "https://commons.wikimedia.org/")):
                    continue
                entries.append({"country":country,"qid":qid,"label":val("label"),
                                "admin":val("adminLabel"),"image":image,
                                "coord":val("coord")})
            unique={(x["qid"],x["image"]):x for x in entries}
            return {"schema":SCHEMA,"country":country,"status":"SUCCESS",
                    "retrieved_bindings":len(bindings),"truncated":len(bindings)>=limit,
                    "query_class_qids":list(P31_CLASSES),"source_endpoint":WDQS,
                    "query_limit":limit,"records":list(unique.values()),
                    "errors":errors,
                    "publication":"RESEARCH_ONLY_NEVER_APP_VISIBLE"}
        except urllib.error.HTTPError as exc:
            errors.append("HTTP_"+str(exc.code))
            if exc.code not in (429,500,502,503,504) or attempt>=retries:break
            try: retry_after=int(exc.headers.get("Retry-After","0"))
            except (TypeError,ValueError):retry_after=0
            delay(min(90,max(8*(attempt+1),retry_after)))
        except (urllib.error.URLError,TimeoutError,ValueError,KeyError,UnicodeError) as exc:
            errors.append(type(exc).__name__+":"+str(exc)[:130])
            if attempt>=retries:break
            delay(10*(attempt+1))
    return {"schema":SCHEMA,"country":country,"status":"SOURCE_ERROR_NOT_ZERO_RESULTS",
            "retrieved_bindings":0,"truncated":False,
            "query_class_qids":list(P31_CLASSES),"source_endpoint":WDQS,
            "query_limit":limit,"records":[],"errors":errors,
            "publication":"RESEARCH_ONLY_NEVER_APP_VISIBLE"}

def harvest(countries,output_dir,delay_s=6,limit=MAX_PER_COUNTRY):
    if not 0<=delay_s<=120:raise ValueError("delay outside controlled bounds")
    countries=list(dict.fromkeys(countries))
    if not 1<=len(countries)<=16:raise ValueError("One bounded run: 1 to 16 country indexes")
    if any(not re.fullmatch(r"[A-Z]{2}",cc) for cc in countries):
        raise ValueError("Invalid country code")
    output_dir=Path(output_dir)
    if output_dir.exists() and any(output_dir.iterdir()):
        raise ValueError("Never overwrite previous country media evidence")
    output_dir.mkdir(parents=True,exist_ok=True)
    counts={"requested_countries":len(countries),"successful_countries":0,
            "error_countries":0,"source_rows":0,"truncated_countries":0,
            "photos_downloaded":0,"photos_published":0}
    for i,country in enumerate(countries):
        if i:time.sleep(delay_s)
        r=call_country(country,limit)
        path=output_dir/f"country-{country}.json"
        path.write_text(json.dumps(r,ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf-8")
        counts["successful_countries"]+=r["status"]=="SUCCESS"
        counts["error_countries"]+=r["status"]!="SUCCESS"
        counts["truncated_countries"]+=r["truncated"]
        counts["source_rows"]+=len(r["records"])
        print(f"COUNTRY {country} {r['status']} raw={r['retrieved_bindings']} items={len(r['records'])} errors={r['errors']}",flush=True)
    audit={"schema":"AO_WIKIDATA_COUNTRY_IMAGE_HARVEST_AUDIT_V1",
           "generated_at":dt.datetime.now(dt.timezone.utc).isoformat(),
           "countries":countries,"counts":counts,
           "coverage_scope":"PARTIAL_DIRECT_CHURCH_OR_CATHEDRAL_P31_AND_P17_P18_ONLY",
           "rights":"NO_LICENSE_VERIFIED_ORIGINAL_BYTES_DOWNLOADED",
           "publication":"RESEARCH_ONLY_NEVER_APP_VISIBLE"}
    (output_dir/"audit.json").write_text(json.dumps(audit,indent=2)+"\n",encoding="utf-8")
    return audit

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--countries",required=True,help="comma-separated, max 16")
    p.add_argument("--output-dir",type=Path,required=True)
    p.add_argument("--delay-seconds",type=float,default=6)
    p.add_argument("--max-rows",type=int,default=MAX_PER_COUNTRY)
    a=p.parse_args()
    print(json.dumps(harvest([s.strip().upper() for s in a.countries.split(",")],
                             a.output_dir,a.delay_seconds,a.max_rows)["counts"],sort_keys=True))
if __name__=="__main__":main()
