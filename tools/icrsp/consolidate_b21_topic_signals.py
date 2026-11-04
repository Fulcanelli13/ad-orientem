#!/usr/bin/env python3
"""Consolidate four B21 lexical shards; never promote signals into factual claims."""
import argparse
import glob
import json
from collections import Counter
from pathlib import Path

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--input-dir",required=True)
    ap.add_argument("--cohort",required=True)
    ap.add_argument("--reviewed",required=True)
    ap.add_argument("--out",required=True)
    args=ap.parse_args()
    cohort=json.loads(Path(args.cohort).read_text(encoding="utf-8"))
    b21=json.loads(Path(args.reviewed).read_text(encoding="utf-8"))
    reviewed={r["articleId"] for r in b21["reviewedRows"]}
    expected=[r for r in cohort["records"] if r["sourceTextStatus"].startswith("METADATA_TRIAGED") and r["articleId"] not in reviewed]
    owners={r["articleId"]:r for r in expected}
    assert len(owners)==140
    shards=sorted(glob.glob(args.input_dir+"/**/icrsp-b21-lexical-*.json",recursive=True))
    assert len(shards)==4,shards
    records=[]
    for fn in shards:
        piece=json.loads(Path(fn).read_text(encoding="utf-8"))
        assert piece["schema"]=="AO_ICRSP_B21_140_COMMENTARY_PROSE_LEXICAL_SHARD_V1"
        assert piece["totals"]["errors"]==0 and not piece["errors"], fn
        assert piece["totals"]["selected"]==piece["totals"]["scannedSuccessfully"]
        assert not piece["rawCommentaryIncluded"] and not piece["publicationApproved"]
        records.extend(piece["records"])
    ids=[r["articleId"] for r in records]
    assert len(ids)==140 and set(ids)==set(owners) and len(set(ids))==140
    topics=Counter()
    areas=Counter()
    panels=0
    for r in records:
        assert r["sourceUrl"]==owners[r["articleId"]]["sourceUrl"]
        assert r["section"]==owners[r["articleId"]]["section"]
        assert r["sourceTextScanStatus"]=="AUTOMATED_FULL_BODY_LEXICAL_SCREEN__NO_CLAIM_VERIFICATION"
        assert not r["originalEditionCertified"] and not r["sourceReproductionLicensed"] and not r["published"]
        areas[r["section"]]+=1
        panels+=len(r["panels"])
        for p in r["panels"]:
            assert not p["claimApproved"] and not p["editoriallyReviewed"]
            assert len(p["bodySha256"])==64
            topics.update(p["topicSignals"].keys())
    pos={r["articleId"]:i for i,r in enumerate(cohort["records"])}
    records.sort(key=lambda r:pos[r["articleId"]])
    result={
      "schema":"AO_ICRSP_B21_140_AUTOMATED_SOURCE_PROSE_TOPIC_SIGNALS_V1",
      "asOf":"2026-10-26",
      "ownerPR":1666,
      "scope":"140 ICRSP source page bodies successfully fetched and lexically screened; author claims, historical facts and original editions NOT independently authenticated.",
      "totals":{
        "articleBodiesAutomatedScreened":140,
        "humanReviewedPreviousB20AndB21":20,
        "distinctSelectedArticles":160,
        "panelsAutoScanned":panels,
        "sections":dict(areas),
        "topicPanelsByFamily":dict(topics),
        "approvedHistoricalClaims":0,
        "publishedFeatures":0},
      "rawFrenchCommentaryStored":False,
      "topicSignalNotAClaim":True,
      "records":records,
      "publicationApproved":False}
    Path(args.out).write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(result["totals"],ensure_ascii=False))
if __name__=="__main__":
    main()
