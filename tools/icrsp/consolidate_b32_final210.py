#!/usr/bin/env python3
"""B32 validate all 210 original bodies; derive noncertified editorial triage."""
import argparse,glob,json
from collections import Counter
from pathlib import Path
def load(p): return json.loads(Path(p).read_text(encoding="utf8"))
def consolidate(manifest,shards):
    assert manifest["schema"]=="AO_ICRSP_B32_EXACT_UNSCANNED210_QUEUE_V1"
    sources={r["articleId"]:r for r in manifest["records"]}
    assert len(sources)==210 and len(shards)==5
    assert {d["shard"] for d in shards}==set(range(5))
    scanned=[]
    for d in shards:
        assert d["schema"]=="AO_ICRSP_B32_42_LEXICAL_SHARD_V1"
        assert d["totals"]["selected"]==d["totals"]["screened"]==42
        assert d["totals"]["errors"]==0 and not d["errors"]
        assert not d["sourceProseCopied"] and not d["publicationApproved"]
        scanned.extend(d["records"])
    assert len(scanned)==210
    assert {r["articleId"] for r in scanned}==set(sources)
    counts=Counter()
    panels=0
    drift=[]
    seen={}
    prioritized=[]
    for r in scanned:
        src=sources[r["articleId"]]
        assert r["sourceUrl"]==src["sourceUrl"]
        assert r["sourceTitle"]==src["articleTitle"]
        assert r["section"]==src["section"]
        assert not r["published"] and not r["sourceReproductionLicensed"] and not r["originalEditionCertified"]
        assert len(r["htmlSha256"])==64
        if not r["panelCountMatchesMetadata"]:drift.append(r["articleId"])
        local=Counter()
        for p in r["panels"]:
            assert len(p["bodySha256"])==64
            assert not p["claimApproved"] and not p["editoriallyReviewed"]
            assert not any(k in p for k in ("bodyText","fullText","bodyHtml","html"))
            counts.update(p["topicSignals"].keys())
            local.update(p["topicSignals"].keys())
            seen.setdefault(p["bodySha256"],[]).append(r["articleId"])
            panels+=1
        relevance=3*local["SCRIPTURAL_FIGURES_PARALLELS"]+3*local["PATRISTIC_REFERENCE"]+2*local["ROMAN_STATION_OR_CHURCH"]+2*local["CUSTOM_PROCESSION_BLESSING"]+2*local["SAINTS_CULT_AND_HISTORY"]+local["LITURGICAL_CALENDAR_HISTORY"]
        historic=local["HISTORIC_EDITION_SCOPE"]>0 or "avant 1955" in r["sourceTitle"].lower()
        prioritized.append({"articleId":r["articleId"],"articleTitle":r["sourceTitle"],"sourceUrl":r["sourceUrl"],
            "section":r["section"],"candidateExistingOwner":src["candidateExistingOwner"] if "candidateExistingOwner" in src else "EXISTING_OWNER_TO_VERIFY",
            "heuristicRelevance":relevance,"historicalEditionCaution":historic,
            "sourceRhetoricReviewRequired":local["SOURCE_RHETORIC_CONTEXT_REVIEW"]>0,
            "panelMetadataDrift":not r["panelCountMatchesMetadata"],
            "topicPanelSignalCount":dict(local),"humanTopicReviewed":False,"appGapConfirmed":False,"publicationApproved":False})
    order={r["articleId"]:i for i,r in enumerate(manifest["records"])}
    scanned.sort(key=lambda r:order[r["articleId"]])
    prioritized.sort(key=lambda r:(-r["heuristicRelevance"],r["articleId"]))
    repeats=[{"bodySha256":h,"articleIds":a} for h,a in seen.items() if len(a)>1]
    signals={"schema":"AO_ICRSP_B32_ALL210_AUTOMATED_SOURCE_SIGNALS_V1","ownerPR":1666,
        "totals":{"newArticleBodiesScanned":210,"priorArticleBodiesScanned":573,
        "totalCorpusBodyScreened":783,"commentaryPanelsInLast210":panels,
        "panelCountDriftCount":len(drift),"duplicateNormalizedBodyHashGroups":len(repeats),
        "sourceErrors":0,"humanDirectTopicReviewsAdded":0,"publicationApprovals":0,
        "topicPanelSignals":dict(counts)},
        "panelMetadataDriftArticleIds":drift,"duplicatedNormalizedPanelBodyHashes":repeats,
        "records":scanned,"sourceProseCopied":False,"publicationApproved":False}
    ranked={"schema":"AO_ICRSP_B32_RESEARCH_PRIORITY_NOT_EDITIONAL_APPROVAL_V1",
        "ownerPR":1666,"scope":"Machine-generated triage only; scoring cannot prove source claims, original-edition attribution, rights, or missing features.",
        "totals":{"screened":210,"ranked":210,"humanReviewsAdded":0,"approvedAppClaims":0},
        "rows":prioritized,"publicationApproved":False}
    return signals,ranked
def main():
    p=argparse.ArgumentParser()
    for n in ("manifest","shard-dir","out","ranked-out"):p.add_argument("--"+n,required=True)
    a=p.parse_args()
    paths=sorted(glob.glob(a.shard_dir+"/**/b32-source-*.json",recursive=True))
    assert len(paths)==5, f"Need five B32 shards; found {len(paths)}"
    signal,ranked=consolidate(load(a.manifest),[load(f) for f in paths])
    for path,doc in ((a.out,signal),(a.ranked_out,ranked)):
        Path(path).write_text(json.dumps(doc,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print(signal["totals"])
if __name__=="__main__":main()
