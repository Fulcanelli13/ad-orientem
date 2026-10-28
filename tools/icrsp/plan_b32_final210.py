#!/usr/bin/env python3
"""Select the last 210 unscanned ICRSP commentaries by exact article ID."""
import argparse,json
from pathlib import Path
from collections import Counter
def load(p): return json.loads(Path(p).read_text(encoding="utf8"))
def ids(rows):
    a=[r["articleId"] for r in rows]
    assert len(a)==len(set(a))
    return set(a)
def plan(corpus,b21,b23,b22,b29):
    all_ids=ids(corpus["records"])
    subsets=[ids(x["records"]) for x in (b21,b23,b29)]
    assert len(all_ids)==783 and list(map(len,subsets))==[140,233,200]
    assert subsets[1]==ids(b22["rows"])
    assert not (subsets[0]&subsets[1] or subsets[0]&subsets[2] or subsets[1]&subsets[2])
    done=set.union(*subsets)
    assert len(done)==573 and done<=all_ids
    remaining=all_ids-done
    assert len(remaining)==210
    rows=[]
    for r in corpus["records"]:
        if r["articleId"] not in remaining:continue
        blocks=r["commentaryBlocks"]
        title=r.get("articleTitle") or r.get("title") or r.get("sourceTitle")
        section=r.get("section") or r["indexSection"]
        assert title and blocks and r["sourceUrl"].endswith("article="+r["articleId"])
        rows.append({"articleId":r["articleId"],"sourceUrl":r["sourceUrl"],
        "articleTitle":title,"section":section,
        "priorCommentaryPanelCount":len(blocks),
        "commentaryPanelLabels":[b.get("blockLabel") or b.get("label") or "" for b in blocks],
        "humanDirectTopicReadingComplete":False,"rightsCleared":False,"publicationApproved":False})
    assert len(rows)==210
    return {"schema":"AO_ICRSP_B32_EXACT_UNSCANNED210_QUEUE_V1","ownerPR":1666,
        "totals":{"corpus":783,"previouslyScreened":573,"remaining":210,
        "shards":5,"perShard":42,"sections":dict(Counter(r["section"] for r in rows)),"approved":0},
        "records":rows,"sourceProseCopied":False,"publicationApproved":False}
def main():
    p=argparse.ArgumentParser()
    for k in ("corpus","b21","b23","b22","b29","out"):p.add_argument("--"+k,required=True)
    a=p.parse_args()
    q=plan(*(load(getattr(a,k)) for k in ("corpus","b21","b23","b22","b29")))
    Path(a.out).write_text(json.dumps(q,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    print(q["totals"])
if __name__=="__main__":main()
