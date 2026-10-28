#!/usr/bin/env python3
"""B22: read previously untouched ICRSP source bodies, retain only lexical signal metadata.

Uses the existing B21 TopicParser; no source commentary prose or translations retained.
Not a human editorial reading, publication approval, or biblical-typology classifier.
"""
import argparse
import json
import sys
import time
from pathlib import Path
from urllib.robotparser import RobotFileParser

from scan_commentary_topic_signals import scan_html
from index_source_metadata import UA, load_html

def read(path):
    return json.loads(Path(path).read_text(encoding="utf8"))

def cohort(path):
    master=read(path)
    if master["schema"]!="AO_ICRSP_B22_DISTINCT_233_SOURCE_BODY_SCAN_QUEUE_V1":
        raise ValueError("Unexpected B22 master schema")
    rows=master["rows"]
    if len(rows)!=233 or len({x["articleId"] for x in rows})!=233:
        raise ValueError("233 unique records required")
    if any(x["articleId"] in master["dedup"]["overlapArticleIds"] for x in rows):
        raise ValueError("Previously read article included")
    return rows

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--manifest",required=True)
    ap.add_argument("--shard",required=True,type=int)
    ap.add_argument("--shards",type=int,default=5)
    ap.add_argument("--delay",type=float,default=3.5)
    ap.add_argument("--out",required=True)
    a=ap.parse_args()
    if a.shards!=5 or not 0<=a.shard<5 or a.delay<3.0:
        ap.error("five shards required, >=3 seconds politeness delay")
    all_rows=cohort(a.manifest)
    selected=[x for i,x in enumerate(all_rows) if i%a.shards==a.shard]
    robots=RobotFileParser()
    robots.set_url("https://icrspfrance.fr/robots.txt")
    robots.read()
    if not robots.can_fetch(UA,"https://icrspfrance.fr/textes-liturgiques.php"):
        raise SystemExit("ROBOTS_DISALLOWED")
    records=[]
    errors=[]
    for k,row in enumerate(selected):
        if k:time.sleep(a.delay)
        if not robots.can_fetch(UA,row["sourceUrl"]):
            errors.append({"articleId":row["articleId"],"code":"ROBOTS_DISALLOWED"})
            continue
        try:
            html,hashval=load_html(row["sourceUrl"])
            rec=scan_html(html,row)
            rec["htmlSha256"]=hashval
            if rec["articleId"]!=row["articleId"] or rec["sourceUrl"]!=row["sourceUrl"]:
                raise ValueError("SOURCE_ID_MISMATCH")
            # Source may change; a mismatch is an exception for review, not silently ignored.
            rec["originalPanelCountFromMetadata"]=row["priorMetadataPanelCount"]
            rec["sourceMetadataPanelCountMatches"]=len(rec["panels"])==row["priorMetadataPanelCount"]
            rec["editoriallyReviewed"]=False
            records.append(rec)
        except Exception as ex:
            errors.append({"articleId":row["articleId"],"code":str(ex)[:180]})
        if (k+1)%10==0:print(f"B22 shard {a.shard}: {k+1}/{len(selected)}",flush=True)
    total=sum(len(r["panels"]) for r in records)
    out={"schema":"AO_ICRSP_B22_SOURCE_BODY_LEXICAL_SHARD_V1","asOf":"2026-10-26",
        "shard":a.shard,"shards":a.shards,"expectedArticleIds":[x["articleId"] for x in selected],
        "scope":"Full source HTML transiently scanned for generic thematic lexical signals; not original passage or independent author/source certification.",
        "totals":{"selected":len(selected),"success":len(records),"errors":len(errors),"panelsScanned":total,
          "metadataPanelCountDifferences":sum(not r["sourceMetadataPanelCountMatches"] for r in records),
          "humanEditorialReviews":0,"approvedExplanations":0,"appChanges":0},
        "records":records,"errors":errors,
        "rawFrenchCommentaryStored":False,"publicationApproved":False}
    Path(a.out).write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    if errors:
        print(json.dumps({"errors":errors},ensure_ascii=False),file=sys.stderr)
        raise SystemExit("INCOMPLETE_B22_SHARD")

if __name__=="__main__":main()
