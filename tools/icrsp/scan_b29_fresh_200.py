#!/usr/bin/env python3
"""Source-body lexical triage of the 200 freshly selected ICRSP articles.

No verbatim third-party body text is stored. Topic signals are NOT historical
fact certifications or confirmations of new Ad Orientem module gaps.
"""
import argparse
import json
import sys
import time
from pathlib import Path
from urllib.robotparser import RobotFileParser

from scan_commentary_topic_signals import scan_html
from index_source_metadata import UA, load_html

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--manifest",required=True)
    ap.add_argument("--shard",type=int,required=True)
    ap.add_argument("--shards",type=int,default=5)
    ap.add_argument("--delay",type=float,default=3.5)
    ap.add_argument("--out",required=True)
    args=ap.parse_args()
    if args.shards!=5 or not 0<=args.shard<5 or args.delay<3:
        ap.error("Require five shards, minimum three seconds between each request")
    d=json.loads(Path(args.manifest).read_text(encoding="utf8"))
    if d["schema"]!="AO_ICRSP_B29_FRESH200_UNREVIEWED_NONOVERLAPPING_METADATA_V1" or len(d["records"])!=200:
        raise ValueError("Unexpected 200-item source metadata manifest")
    rows=d["records"][args.shard::args.shards]
    assert len(rows)==40 and len({x["articleId"] for x in rows})==40
    parser=RobotFileParser()
    parser.set_url("https://icrspfrance.fr/robots.txt")
    parser.read()
    if not parser.can_fetch(UA,"https://icrspfrance.fr/textes-liturgiques.php"):
        raise SystemExit("ROBOTS_DISALLOWED")
    records,errors=[],[]
    for index,row in enumerate(rows):
        if index:time.sleep(args.delay)
        if not parser.can_fetch(UA,row["sourceUrl"]):
            errors.append({"articleId":row["articleId"],"error":"ROBOTS_DISALLOWED"})
            continue
        try:
            html,sha=load_html(row["sourceUrl"])
            signal=scan_html(html,row)
            signal["htmlSha256"]=sha
            assert signal["articleId"]==row["articleId"]
            assert signal["sourceUrl"]==row["sourceUrl"]
            # Discrepancy means source has changed: keep it for review, not fabricated parity.
            signal["originalPanelCountFromMetadata"]=row["priorCommentaryPanelCount"]
            signal["panelCountMatchesMetadata"]=len(signal["panels"])==row["priorCommentaryPanelCount"]
            records.append(signal)
        except Exception as e:
            errors.append({"articleId":row["articleId"],"error":repr(e)[:220]})
        if (index+1)%10==0:
            print(f"B29 shard {args.shard}: {index+1}/{len(rows)} source bodies checked",flush=True)
    result={
        "schema":"AO_ICRSP_B29_FRESH200_LEXICAL_SHARD_V1","ownerPR":1666,
        "shard":args.shard,"shards":args.shards,
        "scope":"Full source page bodies transiently read. Retained signals/hashes only, NO source claims certified.",
        "totals":{"selected":len(rows),"screened":len(records),"errors":len(errors),
                  "panels":sum(len(r["panels"]) for r in records),
                  "panelMetadataDrift":sum(not r["panelCountMatchesMetadata"] for r in records),
                  "approvedClaims":0},
        "records":records,"errors":errors,"rightsCleared":False,
        "fullHostTextRetained":False,"publicationApproved":False,
    }
    Path(args.out).write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    if errors:
        print(json.dumps(errors,ensure_ascii=False),file=sys.stderr)
        raise SystemExit("B29 incomplete shard; failed source IDs preserved")
if __name__=="__main__":main()
