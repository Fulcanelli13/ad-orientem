#!/usr/bin/env python3
"""Plan 200 genuinely uncovered ICRSP articles from the canonical 783 register.

Compare by *source article ID*, never titles, source positions or batch names.
This creates only metadata for the next wave; no hosted prose is copied.
"""
import argparse
import json
from collections import Counter
from pathlib import Path

PRIORITY = (
    ("temporal", 48), ("commons", 30), ("local_propers", 22),
    ("votives_requiem", 10), ("sanctoral", 84), ("office", 6),
)
OWNERS = {
    "temporal":"EXISTING_CALENDAR_AND_MASS_EXPLORER",
    "sanctoral":"EXISTING_1962_CALENDAR_AND_SAINTS",
    "commons":"EXISTING_MASS_EXPLORER_COMMONS",
    "local_propers":"EXISTING_PARTICULAR_CALENDAR_HOLD",
    "votives_requiem":"EXISTING_MASS_FORMULARIES_REFERENCE",
    "office":"EXISTING_CALENDAR_SEASONAL_HISTORY_ONLY",
    "ritual":"EXISTING_CUSTOMS_HISTORICAL_REFERENCE_ONLY",
}

def load(path):
    return json.loads(Path(path).read_text(encoding="utf8"))

def plan(metadata, topic_ledger, earlier_wave, handoff):
    original=metadata["records"]
    assert len(original)==783, "Canonical source corpus must have 783 commentary-bearing entries"
    ids=[r["articleId"] for r in original]
    assert len(set(ids))==783, "Duplication in primary metadata"
    read={r["articleId"] for r in topic_ledger["uniqueArticles"]}
    old_wave={r["articleId"] for r in earlier_wave["rows"]}
    pending={r["articleId"] for r in handoff["remainingInExistingWave"]}
    assert len(read)==363 and len(old_wave)==250 and len(pending)==81
    assert len(read & old_wave)==169 and pending==old_wave-read
    assert read.issubset(ids) and old_wave.issubset(ids)
    fresh=[r for r in original if r["articleId"] not in read|old_wave]
    assert len(fresh)==339, "Expected 339 genuinely unstaged pages outside first 250"
    available={}
    for row in fresh:
        key=row.get("section") or row["indexSection"]
        available.setdefault(key,[]).append(row)
    chosen=[]
    selected=set()
    for section,wanted in PRIORITY:
        for row in available.get(section,[])[:wanted]:
            if row["articleId"] not in selected:
                chosen.append(row)
                selected.add(row["articleId"])
    if len(chosen)<200:
        # Fill deficits in primary verified corpus order, never by name guess.
        for row in fresh:
            if len(chosen)>=200: break
            if row["articleId"] not in selected:
                chosen.append(row)
                selected.add(row["articleId"])
    assert len(chosen)==200 and len(selected)==200
    assert not selected & read and not selected & old_wave and not selected & pending
    known_sections=Counter(r.get("section") or r["indexSection"] for r in original)
    assert sum(known_sections.values())==783
    rows=[]
    for r in chosen:
        blocks=r["commentaryBlocks"]
        assert blocks and r["sourceUrl"].endswith("article="+r["articleId"])
        title=r.get("articleTitle") or r.get("title") or r.get("sourceTitle")
        assert title and isinstance(title,str), "Every source title must be verified"
        rows.append({
          "articleId":r["articleId"],
          "sourceUrl":r["sourceUrl"],
          "articleTitle":title,
          "section":r.get("section") or r["indexSection"],
          "candidateExistingOwner":OWNERS.get(r.get("section") or r["indexSection"],"SOURCE_REFERENCE_ONLY"),
          "priorCommentaryPanelCount":len(blocks),
          "commentaryPanelLabels":[b.get("blockLabel") or b.get("label") or "" for b in blocks],
          "sourceProseAlreadyInspectedForThisWave":False,
          "humanDirectTopicReadingComplete":False,
          "existingOwnerMatchCertified":False,
          "rightsCleared":False,
          "publicationApproved":False,
        })
    return {
      "schema":"AO_ICRSP_B29_FRESH200_UNREVIEWED_NONOVERLAPPING_METADATA_V1",
      "asOf":"2026-10-26","ownerPR":1666,
      "sourceCorpus":"data/source-text/icrsp-france-783-verified-commentary-labels.v1.json",
      "sourcePriorLedger":"data/source-text/icrsp-france-b28-eight-stream-363-unique-topic-ledger.v1.json",
      "sourceExistingWave":"data/source-text/icrsp-france-next250-metadata-reading-queue.v1.json",
      "definition":"200 never directly reviewed, never previously queued source article IDs. They are only selected until a source body screen succeeds.",
      "totals":{
        "commentaryCorpus":783,"alreadyDirectTopicReviewed":363,
        "oldMetadataWave":250,"reviewedWithinOldWave":169,
        "unreadOldWave":81,"unstagedAndUnreadPriorToB29":339,
        "newPreviouslyUnstagedBatch":200,"remainingUnstagedAfterThisSelection":139,
        "freshSelectedSections":dict(Counter(r.get("section") or r["indexSection"] for r in rows)),
        "directTopicReviewsAdded":0,"publicationApprovals":0,
      },
      "records":rows,"hostedTextStored":False,"publicationApproved":False,
    }

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--corpus",required=True)
    ap.add_argument("--ledger",required=True)
    ap.add_argument("--older-wave",required=True)
    ap.add_argument("--handoff",required=True)
    ap.add_argument("--out",required=True)
    a=ap.parse_args()
    output=plan(load(a.corpus),load(a.ledger),load(a.older_wave),load(a.handoff))
    Path(a.out).parent.mkdir(parents=True,exist_ok=True)
    Path(a.out).write_text(json.dumps(output,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print(json.dumps(output["totals"],ensure_ascii=False))
if __name__=="__main__":main()
