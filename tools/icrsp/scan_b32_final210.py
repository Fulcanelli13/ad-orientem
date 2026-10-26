#!/usr/bin/env python3
"""B32: 5 x 42 read-only source-body scans; retain metadata/hashes, not prose."""
import argparse,json,sys,time
from pathlib import Path
from urllib.robotparser import RobotFileParser
from scan_commentary_topic_signals import scan_html
from index_source_metadata import UA,load_html

def main():
    p=argparse.ArgumentParser()
    for k in ("manifest","out"):p.add_argument("--"+k,required=True)
    p.add_argument("--shard",type=int,required=True)
    p.add_argument("--shards",type=int,default=5)
    p.add_argument("--delay",type=float,default=3.5)
    a=p.parse_args()
    assert a.shards==5 and 0<=a.shard<5 and a.delay>=3
    m=json.loads(Path(a.manifest).read_text(encoding="utf8"))
    assert m["schema"]=="AO_ICRSP_B32_EXACT_UNSCANNED210_QUEUE_V1"
    assert len(m["records"])==210
    todo=m["records"][a.shard::a.shards]
    assert len(todo)==42 and len({r["articleId"] for r in todo})==42
    robots=RobotFileParser()
    robots.set_url("https://icrspfrance.fr/robots.txt")
    robots.read()
    if not robots.can_fetch(UA,"https://icrspfrance.fr/textes-liturgiques.php"):
        raise SystemExit("ROBOTS_DISALLOWED")
    done,errors=[],[]
    for i,r in enumerate(todo):
        if i: time.sleep(a.delay)
        if not robots.can_fetch(UA,r["sourceUrl"]):
            errors.append({"articleId":r["articleId"],"error":"ROBOTS_DISALLOWED"})
            continue
        try:
            html,html_hash=load_html(r["sourceUrl"])
            row=scan_html(html,r)
            row["htmlSha256"]=html_hash
            row["originalPanelCountFromMetadata"]=r["priorCommentaryPanelCount"]
            row["panelCountMatchesMetadata"]=len(row["panels"])==r["priorCommentaryPanelCount"]
            assert row["articleId"]==r["articleId"] and row["sourceUrl"]==r["sourceUrl"]
            done.append(row)
        except Exception as ex:
            errors.append({"articleId":r["articleId"],"error":repr(ex)[:200]})
        if (i+1)%7==0:print(f"B32 shard {a.shard}: {i+1}/{len(todo)} checked",flush=True)
    result={"schema":"AO_ICRSP_B32_42_LEXICAL_SHARD_V1","ownerPR":1666,
        "shard":a.shard,"shards":5,
        "totals":{"selected":42,"screened":len(done),"errors":len(errors),
        "panels":sum(len(row["panels"]) for row in done),"approved":0},
        "records":done,"errors":errors,
        "sourceProseCopied":False,"publicationApproved":False}
    Path(a.out).write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    if errors:
        print(json.dumps(errors,ensure_ascii=False),file=sys.stderr)
        raise SystemExit("INCOMPLETE_B32_SHARD")
if __name__=="__main__":main()
