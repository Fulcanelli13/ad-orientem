#!/usr/bin/env python3
"""Research-only lexical scan of ICRSP Commentaires; no hosted text retained."""
import argparse
import hashlib
import json
import re
import sys
import time
from collections import Counter
from pathlib import Path
from urllib.robotparser import RobotFileParser

from extract_commentary_blocks import BlockParser, folded
from index_source_metadata import UA, load_html

# Signals indicate REVIEW TOPICS, never a proven factual or patristic claim.
TOPICS = {
    "ROMAN_STATION_OR_CHURCH": r"\bstation\b|basiliqu|catacomb|sanctuair|titulus|cimeti[eè]re",
    "LITURGICAL_CALENDAR_HISTORY": r"calendri|sacramentair|missel|anciennement|autrefois|transf[eé]r|octav|vigil|r[eé]forme|supprim",
    "CUSTOM_PROCESSION_BLESSING": r"rogation|procession|litanie|b[eé]n[eé]dict|cierges|je[uû]n|p[eé]nitenc|eau b[eé]nite",
    "SAINTS_CULT_AND_HISTORY": r"martyr|reliqu|culte|canonisa|translation|tombeau|s[eé]pulcre|hagiograph",
    "SCRIPTURAL_FIGURES_PARALLELS": r"pr[eé]figur|figure du christ|figure du sauveur|typolog|proph[eé]t|accompliss",
    "PATRISTIC_REFERENCE": r"saint augustin|saint ambroise|chrysostom|saint gr[eé]goire|saint j[eé]r[oô]me|les p[eè]res",
    "SACRED_ART_HISTORY": r"fresque|peintur|mosa[iï]qu|iconograph|repr[eé]sentation|sculptur",
    "HISTORIC_EDITION_SCOPE": r"avant 1955|1955|1960|1962|rite double|rite simple|semi.double",
    "SOURCE_RHETORIC_CONTEXT_REVIEW": r"juif|isra[eé]l|synagogue|infid[eè]le|h[eé]r[eé]tiqu",
}
COMPILED = {key: re.compile(regex) for key, regex in TOPICS.items()}

class TopicParser(BlockParser):
    def __init__(self):
        super().__init__()
        self._parts = []
        self.textSignals = []

    def handle_starttag(self, tag, attrs):
        was_in = self.active is not None
        super().handle_starttag(tag, attrs)
        if not was_in and self.active is not None:
            self._parts = []

    def handle_data(self, value):
        if self.active is not None and not self.capture and any(
            t == "div" and "corps" in p.get("class", "").split()
            for t, p in self.tags
        ):
            self._parts.append(value)
        super().handle_data(value)

    def handle_endtag(self, tag):
        if tag == "details" and self.active is not None:
            body = folded(" ".join(self._parts))
            hits = {}
            for theme, rex in COMPILED.items():
                matches = list(rex.finditer(body))
                if matches:
                    hits[theme] = {
                        "lexicalHitCount": len(matches),
                        "firstCharOffset": matches[0].start(),
                    }
            self.textSignals.append({
                "blockOrdinal": len(self.blocks) + 1,
                "normalizedBodySha256": hashlib.sha256(body.encode("utf-8")).hexdigest(),
                "bodyCharCount": len(body),
                "topicSignals": hits,
            })
            self._parts = []
        super().handle_endtag(tag)

def scan_html(html, source):
    p = TopicParser()
    p.feed(html)
    if not p.article_h2 or not p.blocks:
        raise ValueError("MISSING_ARTICLE_TITLE_OR_COMMENTARY_BLOCK")
    if len(p.textSignals) != len(p.blocks):
        raise ValueError("BODY_METADATA_SIGNAL_BLOCK_COUNT_MISMATCH")
    panels = []
    for label, scan in zip(p.blocks, p.textSignals):
        panels.append({
            "blockOrdinal": label["blockOrdinal"],
            "sourceSectionLocator": label["sourceAnchor"],
            "hostWorkLabel": label["blockLabel"],
            "candidateWorkFamily": label["workCandidate"],
            "bodySha256": scan["normalizedBodySha256"],
            "normalizedBodyCharCount": scan["bodyCharCount"],
            "topicSignals": scan["topicSignals"],
            "editoriallyReviewed": False,
            "claimApproved": False,
        })
    return {
        "articleId": source["articleId"],
        "sourceUrl": source["sourceUrl"],
        "sourceTitle": source["articleTitle"],
        "section": source["section"],
        "panels": panels,
        "sourceTextScanStatus": "AUTOMATED_FULL_BODY_LEXICAL_SCREEN__NO_CLAIM_VERIFICATION",
        "originalEditionCertified": False,
        "sourceReproductionLicensed": False,
        "published": False,
    }

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--manifest", required=True)
    p.add_argument("--reviewed", required=True, help="B21 ten already directly reviewed source pages")
    p.add_argument("--shard", type=int, required=True)
    p.add_argument("--shards", type=int, default=4)
    p.add_argument("--delay", type=float, default=3.0)
    p.add_argument("--output", required=True)
    args = p.parse_args()
    if args.shards < 1 or not 0 <= args.shard < args.shards or args.delay < 2.5:
        p.error("invalid shard or delay (minimum 2.5 seconds)")
    master = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    editorial = json.loads(Path(args.reviewed).read_text(encoding="utf-8"))
    already_read = {r["articleId"] for r in editorial["reviewedRows"]}
    if len(already_read) != 10:
        raise ValueError("Expected exactly ten B21 new editorial-reviewed source articles")
    cohort = [
        r for r in master["records"]
        if r["sourceTextStatus"] == "METADATA_TRIAGED_COMMENTARY_PROSE_NOT_YET_READ"
        and r["articleId"] not in already_read
    ]
    if len(cohort) != 140 or len(master["records"]) != 160:
        raise ValueError("Expected B20 140 metadata-only pages after 20 selected editorial leads")
    selected = [r for i, r in enumerate(cohort) if i % args.shards == args.shard]
    robots = RobotFileParser()
    robots.set_url("https://icrspfrance.fr/robots.txt")
    robots.read()
    if not robots.can_fetch(UA, "https://icrspfrance.fr/textes-liturgiques.php"):
        raise SystemExit("ROBOTS_DISALLOWED: no page fetches")
    records, errors = [], []
    for i, source in enumerate(selected):
        if i:
            time.sleep(args.delay)
        if not robots.can_fetch(UA, source["sourceUrl"]):
            errors.append({"articleId": source["articleId"], "reason": "ROBOTS_DISALLOWED"})
            continue
        try:
            html, sha = load_html(source["sourceUrl"])
            rec = scan_html(html, source)
            rec["htmlSha256"] = sha
            records.append(rec)
        except Exception as exc:
            errors.append({"articleId": source["articleId"], "reason": str(exc)[:150]})
        if (i + 1) % 10 == 0:
            print(f"Lexically scanned {i+1}/{len(selected)} B21 shard {args.shard}", flush=True)
    counts = Counter(key for r in records for panel in r["panels"]
                     for key in panel["topicSignals"])
    out = {
        "schema": "AO_ICRSP_B21_140_COMMENTARY_PROSE_LEXICAL_SHARD_V1",
        "asOf": "2026-10-26",
        "shard": args.shard, "shards": args.shards,
        "scope": "Raw French source text used transiently to locate topic signals; no prose retained; NOT an editorial review.",
        "totals": {
            "selected": len(selected), "scannedSuccessfully": len(records),
            "errors": len(errors), "panelsScanned": sum(len(r["panels"]) for r in records),
            "topicPanelsByFamily": dict(counts), "approvedClaims": 0,
            "appChanges": 0,
        },
        "records": records, "errors": errors,
        "rawCommentaryIncluded": False, "publicationApproved": False,
    }
    Path(args.output).write_text(
        json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    if errors:
        print(json.dumps({"errors": errors}, ensure_ascii=False), file=sys.stderr)
        raise SystemExit("INCOMPLETE_BATCH: errors recorded; not marked complete")

if __name__ == "__main__":
    main()
