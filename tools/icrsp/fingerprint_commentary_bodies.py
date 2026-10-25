#!/usr/bin/env python3
"""Hash the text of ICRSP commentary blocks, without storing any article text.

Research deduplication only. Each output is a SHA256/length signal anchored to
an independently inspected URL and its commentary panel ordinal. This does
NOT certify the historical author's actual text, rights or 1962 rubrics.
"""
import argparse
import hashlib
import json
import re
import time
from html.parser import HTMLParser
from pathlib import Path
from urllib.robotparser import RobotFileParser

from index_source_metadata import UA, load_html
from extract_commentary_blocks import folded

EXCLUDE_TAGS = {"script", "style", "noscript"}


class CommentaryTextFingerprints(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_h3 = False
        self.h3_text = []
        self.section = ""
        self.details_depth = 0
        self.summary_depth = 0
        self.title_depth = 0
        self.ignore_depth = 0
        self.parts = []
        self.fingerprints = []

    def handle_starttag(self, tag, attrs):
        props = dict(attrs)
        if tag in EXCLUDE_TAGS:
            self.ignore_depth += 1
        if tag == "h3":
            self.in_h3 = True
            self.h3_text = []
        if self.details_depth:
            if tag == "details":
                self.details_depth += 1
            elif tag == "summary":
                self.summary_depth += 1
            elif tag == "p" and "mx-comm-titre" in props.get("class", "").split():
                self.title_depth += 1
        elif (tag == "details" and folded(self.section) == "commentaires"
              and "pf-cate-cadre" in props.get("class", "").split()):
            self.details_depth = 1
            self.parts = []

    def handle_data(self, text):
        if self.in_h3:
            self.h3_text.append(text)
        if self.details_depth and not (
                self.ignore_depth or self.summary_depth or self.title_depth):
            self.parts.append(text)

    def handle_endtag(self, tag):
        if tag == "h3" and self.in_h3:
            self.section = " ".join(" ".join(self.h3_text).split())
            self.in_h3 = False
        if self.details_depth:
            if tag == "summary":
                self.summary_depth = max(0, self.summary_depth - 1)
            elif tag == "p" and self.title_depth:
                self.title_depth -= 1
            elif tag == "details":
                self.details_depth -= 1
                if self.details_depth == 0:
                    # Exactly one normalized body digest per eligible panel.
                    clean = " ".join(" ".join(self.parts).split())
                    self.fingerprints.append({
                        "blockOrdinal": len(self.fingerprints) + 1,
                        "bodyTextSha256": hashlib.sha256(
                            clean.encode("utf-8")).hexdigest(),
                        "bodyCharacterCount": len(clean),
                        "bodyTokenCount": len(clean.split()),
                        "shortPanelNeedsReview": len(clean) <= 120,
                        "textStored": False
                    })
                    self.parts = []
        if tag in EXCLUDE_TAGS:
            self.ignore_depth = max(0, self.ignore_depth - 1)


def fingerprint(html):
    parser = CommentaryTextFingerprints()
    parser.feed(html)
    return parser.fingerprints


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--inventory", required=True)
    cli.add_argument("--start", type=int, required=True)
    cli.add_argument("--end", type=int, required=True, help="Exclusive article index position")
    cli.add_argument("--delay", type=float, default=5.0)
    cli.add_argument("--out", required=True)
    args = cli.parse_args()
    if args.delay < 2.5 or not (0 <= args.start < args.end <= 855):
        cli.error("invalid window or delay")
    prior = json.loads(Path(args.inventory).read_text(encoding="utf-8"))
    rows = {r["indexPosition"]: r for r in prior["records"]}
    robots = RobotFileParser()
    robots.set_url("https://icrspfrance.fr/robots.txt")
    robots.read()
    results, errors = [], []
    for position in range(args.start, args.end):
        previous = rows.get(position)
        if not previous:
            continue
        if results or errors:
            time.sleep(args.delay)
        url = previous["sourceUrl"]
        if not robots.can_fetch(UA, url):
            errors.append({"indexPosition": position,
                           "articleId": previous["articleId"],
                           "error": "ROBOTS_BLOCKED"})
            continue
        try:
            html, page_sha = load_html(url)
            blocks = fingerprint(html)
            if len(blocks) != len(previous["commentaryBlocks"]):
                raise ValueError("BLOCK_COUNT_CHANGED_FROM_VERIFIED_INVENTORY")
            # Ordinal must be unchanged, but source text hashes may differ when
            # the website legitimately corrects a passage. Preserve page hash.
            for block in blocks:
                b0 = previous["commentaryBlocks"][block["blockOrdinal"] - 1]
                if b0["blockOrdinal"] != block["blockOrdinal"]:
                    raise ValueError("SOURCE_BLOCK_ORDINAL_CHANGED")
                block["candidateWorkFamily"] = b0.get("workCandidate")
                block["sourceLabel"] = b0["blockLabel"]
                block["sourceAnchor"] = b0["sourceAnchor"]
            results.append({
                "indexPosition": position,
                "articleId": previous["articleId"],
                "sourceUrl": url,
                "sourceSection": previous["indexSection"],
                "articleHtmlSha256": page_sha,
                "blocks": blocks,
                "rights": "NOT_CLEARED_METADATA_ONLY",
                "editionCertified": False,
                "paragraphsStored": 0
            })
        except Exception as e:
            errors.append({"indexPosition": position,
                           "articleId": previous["articleId"],
                           "error": str(e)[:200]})
        if (position - args.start + 1) % 25 == 0:
            print("Processed positions", position + 1, "/", args.end, flush=True)

    output = {
        "schema": "AO_ICRSP_COMMENTARY_CONTENT_FINGERPRINT_WINDOW_V1",
        "status": "HASH_METADATA_ONLY_NO_TEXT_REPRODUCTION",
        "window": {"start": args.start, "endExclusive": args.end},
        "totals": {
            "eligible": sum(1 for p in range(args.start, args.end) if p in rows),
            "inspected": len(results), "errors": len(errors),
            "panelFingerprints": sum(len(r["blocks"]) for r in results),
        },
        "records": results, "errors": errors
    }
    target = Path(args.out)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n",
                      encoding="utf-8")
    print(json.dumps(output["totals"], ensure_ascii=False))


if __name__ == "__main__":
    main()
