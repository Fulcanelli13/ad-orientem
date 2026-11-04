#!/usr/bin/env python3
"""Validate B29 fresh source-body shard results, produce durable corpus evidence.

Never interpret keyword signals as source-checked editorial or patristic claims.
"""
import argparse
import glob
import json
from collections import Counter
from pathlib import Path

def read(p):return json.loads(Path(p).read_text(encoding="utf8"))

def consolidate(manifest, shard_docs):
    queued=manifest["records"]
    assert len(queued)==200
    byid={row["articleId"]:row for row in queued}
    assert len(byid)==200
    assert len(shard_docs)==5
    records=[]
    for d in shard_docs:
        assert d["schema"]=="AO_ICRSP_B29_FRESH200_LEXICAL_SHARD_V1"
        assert d["totals"]["selected"]==40
        assert d["totals"]["screened"]==40
        assert d["totals"]["errors"]==0 and not d["errors"]
        assert not d["publicationApproved"] and not d["fullHostTextRetained"]
        records.extend(d["records"])
    assert len(records)==200
    ids=[r["articleId"] for r in records]
    assert len(set(ids))==200 and set(ids)==set(byid)
    panel_count=0
    topical=Counter()
    section=Counter()
    drift=[]
    for r in records:
        owner=byid[r["articleId"]]
        assert r["sourceUrl"]==owner["sourceUrl"]
        assert r["section"]==owner["section"]
        assert r["sourceTitle"]==owner["articleTitle"]
        assert not r["published"] and not r["sourceReproductionLicensed"]
        assert not r["originalEditionCertified"]
        section[r["section"]]+=1
        panel_count+=len(r["panels"])
        if not r["panelCountMatchesMetadata"]:
            drift.append(r["articleId"])
        for panel in r["panels"]:
            assert len(panel["bodySha256"])==64
            assert not panel["editoriallyReviewed"] and not panel["claimApproved"]
            assert not any(k in panel for k in ("bodyText","fullText","bodyHtml","html"))
            topical.update(panel["topicSignals"].keys())
    order={r["articleId"]:i for i,r in enumerate(queued)}
    records.sort(key=lambda r:order[r["articleId"]])
    return {
      "schema":"AO_ICRSP_B29_FRESH200_REAL_SOURCE_BODY_LEXICAL_SCREEN_V1",
      "asOf":"2026-10-26","ownerPR":1666,
      "sourceQueue":"data/source-text/icrsp-france-b29-200-new-source-metadata.v1.json",
      "scope":"200 previously unstaged source article bodies mechanically inspected for lexical signals/hashes. No claim reading or publishing.",
      "totals":{
         "newDistinctSourceBodiesScanned":200,
         "sourcePanelsScanned":panel_count,
         "sectionDistribution":dict(section),
         "topicPanelSignals":dict(topical),
         "panelMetadataMismatchCount":len(drift),
         "humanNewTopicReads":0,
         "newPublicationApprovals":0
      },
      "metadataDriftIds":drift,
      "records":records,
      "sourceProseCopied":False,
      "publicationApproved":False,
    }

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--manifest",required=True)
    ap.add_argument("--shard-dir",required=True)
    ap.add_argument("--out",required=True)
    args=ap.parse_args()
    files=sorted(glob.glob(args.shard_dir+"/**/b29-source-*.json",recursive=True))
    if len(files)!=5:raise SystemExit(f"Require 5 exact B29 shards; got {len(files)}")
    d=consolidate(read(args.manifest),[read(p) for p in files])
    Path(args.out).write_text(json.dumps(d,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print(json.dumps(d["totals"],ensure_ascii=False))
if __name__=="__main__":main()
