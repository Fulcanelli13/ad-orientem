#!/usr/bin/env python3
"""Consolidate independent country P18 metadata archives into one 76-country input.

Preserves every country success/error/truncation and source SHA256; one
intentional duplicate (AU retry) is resolved by SUCCESS preference, not by
treating a failed API request as an empty country. No network or originals.
"""
import argparse
import hashlib
import json
import re
import shutil
from collections import Counter
from pathlib import Path

SCHEMA="AO_WIKIDATA_CHURCH_IMAGES_BY_COUNTRY_V1"
HOLD="RESEARCH_ONLY_NEVER_APP_VISIBLE"
OUTPUT="AO_DIRECTORY_COUNTRY_SOURCE_MERGE_AUDIT_V1"
EXISTING={"MU","IE","IT","DE","FR","US","AU","BE"}

def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def merge(audit_path,sources,output_dir):
    audit=json.loads(Path(audit_path).read_text(encoding="utf-8"))
    expected=set(audit["country_counts"])
    if len(expected)!=76 or not EXISTING<=expected:
        raise ValueError("Expected frozen 76-country intake audit")
    if len(sources)!=6 or len({label for label,_ in sources})!=6:
        raise ValueError("Exactly 1 initial source + 5 independent cohort archives required")
    candidates={}
    for order,(label,directory) in enumerate(sources):
        root=Path(directory)
        files=sorted(root.glob("country-*.json"))
        if label=="eight" and len(files)!=8:
            raise ValueError("Missing original eight-country input")
        if label!="eight" and len(files) not in (13,14,15):
            raise ValueError("Incomplete 13–15 country research cohort "+label)
        for file in files:
            cc=file.stem.removeprefix("country-")
            if not re.fullmatch(r"[A-Z]{2}",cc) or cc not in expected:
                raise ValueError("Unknown or malformed country "+cc)
            j=json.loads(file.read_text(encoding="utf-8"))
            if (j.get("schema")!=SCHEMA or j.get("country")!=cc
                or j.get("publication")!=HOLD
                or j.get("status") not in ("SUCCESS","SOURCE_ERROR_NOT_ZERO_RESULTS")
                or not isinstance(j.get("records"),list)
                or (j["status"]!="SUCCESS" and j["records"])
                or j.get("query_limit",0)>3000):
                raise ValueError("Unsafe or invalid country-source record "+cc)
            candidates.setdefault(cc,[]).append({
                "label":label,"path":file,"source_sha256":sha(file),
                "status":j["status"],"count":len(j["records"]),
                "truncated":j["truncated"],"order":order})
    if set(candidates)!=expected:raise ValueError(
        "Country coverage incomplete; missing "+",".join(sorted(expected-set(candidates))))
    dup={cc:len(rows) for cc,rows in candidates.items() if len(rows)>1}
    if dup!={"AU":2}:raise ValueError("Unexpected duplicated country source: "+str(dup))
    dest=Path(output_dir)
    if dest.exists():
        raise ValueError("Do not overwrite existing consolidated source index")
    dest.mkdir(parents=True,exist_ok=False)
    selections={}
    counts=Counter()
    for cc in sorted(expected):
        rows=candidates[cc]
        # AU appears in the original run (failed) and in the C1 retry.
        # A successful query wins, otherwise preserve the retry failure.
        chosen=sorted(rows,key=lambda x:(x["status"]=="SUCCESS",x["order"]))[-1]
        shutil.copyfile(chosen["path"],dest/f"country-{cc}.json")
        if sha(dest/f"country-{cc}.json")!=chosen["source_sha256"]:
            raise ValueError("Copy integrity mismatch")
        counts["countries_successful" if chosen["status"]=="SUCCESS" else "countries_with_source_error"]+=1
        if chosen["truncated"]:counts["countries_truncated"]+=1
        counts["wikidata_image_source_rows"]+=chosen["count"]
        selections[cc]={
            "source_label":chosen["label"],"source_relative_filename":chosen["path"].name,
            "source_sha256":chosen["source_sha256"],"source_status":chosen["status"],
            "source_records":chosen["count"],"truncated":chosen["truncated"],
            "alternate_candidates":[{"source_label":r["label"],"source_sha256":r["source_sha256"],
                                     "status":r["status"]} for r in rows if r is not chosen]
        }
    counts["countries_archived"]=len(selections)
    result={"schema":OUTPUT,"publication":HOLD,"frozen_intake_country_audit_sha256":sha(audit_path),
            "counts":dict(counts),"country_sources":selections,
            "original_images_downloaded":0,"approved_images":0,"published_images":0}
    (dest/"source-merge-audit.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",
                                             encoding="utf-8")
    return result

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--intake-audit",type=Path,required=True)
    p.add_argument("--source",action="append",required=True,
                   help="label=directory; 6 calls with eight,C1,C2,C3,C4,C5")
    p.add_argument("--output-dir",type=Path,required=True)
    args=p.parse_args()
    entries=[]
    for value in args.source:
        label,sep,path=value.partition("=")
        if not sep or label not in {"eight","C1","C2","C3","C4","C5"} or not path:
            p.error("Expected label=directory, labels eight and C1..C5")
        entries.append((label,Path(path)))
    r=merge(args.intake_audit,entries,args.output_dir)
    print(json.dumps(r["counts"],sort_keys=True))
if __name__=="__main__":main()
