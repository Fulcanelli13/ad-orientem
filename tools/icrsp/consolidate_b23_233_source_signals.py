#!/usr/bin/env python3
"""Reconcile 5 verified B23 source-body lexical shards; no source prose retained.

The existing B22 233-ID manifest is canonical. All source-identity, authorship,
rights and release boundaries are fail-closed. Run read-only; persistence belongs
to an explicitly one-time GitHub Actions archival workflow.
"""
import argparse
import glob
import hashlib
import json
from collections import Counter
from pathlib import Path


def load(path):
    return json.loads(Path(path).read_text(encoding="utf8"))


def consolidate(manifest_path, shard_root):
    manifest=load(manifest_path)
    if manifest["schema"]!="AO_ICRSP_B22_DISTINCT_233_SOURCE_BODY_SCAN_QUEUE_V1":
        raise ValueError("Unrecognized source manifest")
    desired=manifest["rows"]
    expected={r["articleId"]:r for r in desired}
    if len(expected)!=233 or len(desired)!=233:
        raise ValueError("Must have exactly 233 source identities")

    paths=sorted(glob.glob(str(Path(shard_root)/"**"/"icrsp-b23-*.json"),recursive=True))
    if len(paths)!=5:
        raise ValueError(f"Need five shard outputs; got {len(paths)}")
    records=[]
    audits=[]
    seen_shards=set()
    for path in paths:
        raw=Path(path).read_bytes()
        obj=json.loads(raw)
        if obj["schema"]!="AO_ICRSP_B22_SOURCE_BODY_LEXICAL_SHARD_V1":
            raise ValueError("Wrong shard schema")
        shard=obj["shard"]
        if shard in seen_shards or not 0<=shard<5:
            raise ValueError("Duplicate/invalid shard")
        seen_shards.add(shard)
        if obj["shards"]!=5 or obj["totals"]["errors"]!=0 or obj["errors"]:
            raise ValueError("Partial/failing shard")
        if obj["totals"]["selected"]!=obj["totals"]["success"]!=len(obj["records"]):
            raise ValueError("Missing article from shard")
        if obj["rawFrenchCommentaryStored"] or obj["publicationApproved"]:
            raise ValueError("Unexpected release permission/host text")
        if obj["totals"]["metadataPanelCountDifferences"]:
            raise ValueError("Source panel-count drift")
        positions=[r["articleId"] for i,r in enumerate(desired) if i%5==shard]
        if obj["expectedArticleIds"]!=positions:
            raise ValueError("Source selection order changed")
        if [r["articleId"] for r in obj["records"]]!=positions:
            raise ValueError("Source rows truncated or out of order")
        audits.append({"shard":shard,"selected":len(positions),"sha256":hashlib.sha256(raw).hexdigest(),
                       "panelCount":obj["totals"]["panelsScanned"]})
        records.extend(obj["records"])
    if seen_shards!=set(range(5)):
        raise ValueError("Missing shard")
    ids=[r["articleId"] for r in records]
    if len(ids)!=233 or set(ids)!=set(expected) or len(set(ids))!=233:
        raise ValueError("B23 records are not the exact canonical 233 set")
    sort_key={r["articleId"]:i for i,r in enumerate(desired)}
    records.sort(key=lambda r:sort_key[r["articleId"]])
    categories=Counter()
    scope=Counter()
    source_hashes=Counter()
    panels=0
    for r in records:
        input_row=expected[r["articleId"]]
        if r["sourceUrl"]!=input_row["sourceUrl"] or r["section"]!=input_row["section"]:
            raise ValueError("Source URL/section ownership changed")
        if r["sourceTitle"]!=input_row["articleTitle"]:
            raise ValueError("Page title changed since metadata stage")
        if len(r["panels"])!=input_row["priorMetadataPanelCount"] or not r["sourceMetadataPanelCountMatches"]:
            raise ValueError("Unexpected body panel count")
        if r["sourceTextScanStatus"]!="AUTOMATED_FULL_BODY_LEXICAL_SCREEN__NO_CLAIM_VERIFICATION":
            raise ValueError("Automated result falsely promoted")
        if any(r[k] for k in ("originalEditionCertified","sourceReproductionLicensed","published","editoriallyReviewed")):
            raise ValueError("Claims approved contrary to contract")
        scope[r["section"]]+=1
        panels+=len(r["panels"])
        for panel in r["panels"]:
            if panel["editoriallyReviewed"] or panel["claimApproved"]:
                raise ValueError("Panel incorrectly marked accepted")
            if not isinstance(panel["bodySha256"],str) or len(panel["bodySha256"])!=64:
                raise ValueError("Bad source digest")
            source_hashes[panel["bodySha256"]]+=1
            categories.update(panel["topicSignals"].keys())
    if panels!=1072:
        raise ValueError("Panel count differs from downloaded run")
    duplicates=sum(n-1 for n in source_hashes.values() if n>1)
    result={"schema":"AO_ICRSP_B23_233_SOURCE_BODY_AUTOMATED_TOPIC_SIGNALS_V1",
        "asOf":"2026-10-26","sourceRunUrl":"https://github.com/Fulcanelli13/ad-orientem/actions/runs/40305221241",
        "sourceIdentityManifest":str(manifest_path),
        "scope":"Fully fetched 233 already-deduplicated ICRSP article bodies; automatic source-hash and literal-keyword location only. Not human commentary interpretation, historical truth, original source edition or licence.",
        "totals":{"articlesSourceBodiesMachineRead":233,"independentArticleIDs":233,
                  "fullSourceBodyPanelsMachineRead":panels,
                  "articleErrors":0,"panelCountMismatches":0,
                  "sameNormalizedBodyHashExcessOccurrences":duplicates,
                  "sectionDistribution":dict(scope),
                  "panelsWithLexicalSignal":dict(categories),
                  "humanEditorialReviewsInThisAutomatedRun":0,
                  "publicationApprovals":0,"productionChanges":0},
        "shards":sorted(audits,key=lambda x:x["shard"]),
        "rawCommentaryCopied":False,"licenceCleared":False,"publicationApproved":False,
        "records":records}
    return result


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--input-dir",required=True)
    ap.add_argument("--manifest",required=True)
    ap.add_argument("--output",required=True)
    args=ap.parse_args()
    result=consolidate(args.manifest,args.input_dir)
    Path(args.output).write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print(json.dumps(result["totals"],ensure_ascii=False))


if __name__=="__main__":
    main()
