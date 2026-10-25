#!/usr/bin/env python3
"""ICRSP France commentary block metadata extractor, issue #1665.

Limits output to section labels, explicit bibliographical headers and source
locators. NO commentary paragraphs, liturgical translations, or images are
retained. Respects robots.txt; no inferred edition/rights certifications.
"""
import argparse
import json
import re
import time
import unicodedata
from html.parser import HTMLParser
from pathlib import Path
from urllib.robotparser import RobotFileParser

from index_source_metadata import UA, load_html


def folded(value):
    txt = unicodedata.normalize("NFKD", value or "")
    return " ".join("".join(c for c in txt if not unicodedata.combining(c))
                    .lower().replace("’", "'").split())


def classify(label):
    name = folded(label)
    if "gueranger" in name and "annee liturgique" in name:
        return "GUERANGER_ANNEE_LITURGIQUE", "EXPLICIT_WEBSITE_WORK_LABEL"
    if "schuster" in name and "liber sacramentorum" in name:
        return "SCHUSTER_LIBER_SACRAMENTORUM", "EXPLICIT_WEBSITE_WORK_LABEL"
    if "parsch" in name and "guide" in name and "annee liturgique" in name:
        return "PARSCH_GUIDE_ANNEE_LITURGIQUE", "EXPLICIT_WEBSITE_WORK_LABEL"
    # Do not assign an author to "Présentation", "Office du jour" etc.
    return None, "UNATTRIBUTED_OR_OTHER_BLOCK_NEEDS_EDITORIAL_REVIEW"


class BlockParser(HTMLParser):
    """Only direct summary and mx-comm-titre of pf-cate-cadre under Commentaires."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.tags = []
        self.heading_level = None
        self.heading_buffer = []
        self.section = ""
        self.commentary_headings = 0
        self.article_h2 = ""
        self.blocks = []
        self.active = None
        self.capture = None
        self.capture_buffer = []
        self.in_bad_tags = 0

    def handle_starttag(self, tag, attrs):
        props = dict(attrs)
        self.tags.append((tag, props))
        if tag in ("script", "style", "noscript"):
            self.in_bad_tags += 1
        if tag in ("h2", "h3"):
            self.heading_level = tag
            self.heading_buffer = []
        if (tag == "details" and "pf-cate-cadre" in props.get("class", "").split()
                and folded(self.section) == "commentaires" and self.active is None):
            self.active = {"summary": "", "bodyTitle": "", "summaryTags": [],
                           "bodyTitleTags": [], "bodyCharacterCount": 0}
        if self.active is None:
            return
        if tag == "summary" and not self.capture:
            self.capture = "summary"
            self.capture_buffer = []
        elif tag == "p" and "mx-comm-titre" in props.get("class", "").split():
            self.capture = "bodyTitle"
            self.capture_buffer = []

    def handle_data(self, text):
        if self.in_bad_tags:
            return
        if self.heading_level:
            self.heading_buffer.append(text)
        if self.active is not None:
            if self.capture:
                self.capture_buffer.append(text)
            elif any(t == "div" and "corps" in p.get("class", "").split()
                     for t, p in self.tags):
                self.active["bodyCharacterCount"] += len(text)

    def handle_endtag(self, tag):
        if self.capture == "summary" and tag == "summary":
            val = " ".join(" ".join(self.capture_buffer).split())
            self.active["summary"] = val[:180]
            self.active["summaryTags"] = ["details", "summary"]
            self.capture = None
            self.capture_buffer = []
        elif self.capture == "bodyTitle" and tag == "p":
            val = " ".join(" ".join(self.capture_buffer).split())
            self.active["bodyTitle"] = val[:180]
            self.active["bodyTitleTags"] = ["details", "div.corps", "p.mx-comm-titre"]
            self.capture = None
            self.capture_buffer = []
        if self.heading_level == tag:
            heading = " ".join(" ".join(self.heading_buffer).split())
            if tag == "h2" and not self.article_h2:
                self.article_h2 = heading
            if tag == "h3":
                self.section = heading
                if folded(heading) == "commentaires":
                    self.commentary_headings += 1
            self.heading_level, self.heading_buffer = None, []
        if tag == "details" and self.active is not None:
            # The source's author sections are nonnested pf-cate-cadre details.
            b = self.active
            heading = b["summary"] or b["bodyTitle"]
            work, confidence = classify(heading)
            if b["bodyTitle"] and b["summary"] and folded(b["bodyTitle"]) != folded(b["summary"]):
                confidence = "HEADER_TITLE_MISMATCH_REVIEW"
            self.blocks.append({
                "blockOrdinal": len(self.blocks) + 1,
                "blockLabel": heading, "bodyTitle": b["bodyTitle"],
                "labelConfirmedTwice": bool(b["summary"] and b["bodyTitle"]
                                            and folded(b["summary"]) == folded(b["bodyTitle"])),
                "workCandidate": work,
                "attributionStatus": confidence,
                "hasBody": b["bodyCharacterCount"] > 120,
                "bodyCharacterCount": b["bodyCharacterCount"],
                "sourceAnchor": "Commentaires / details.pf-cate-cadre:"
                                + str(len(self.blocks) + 1),
                "rights": "NOT_CLEARED_LINK_AND_METADATA_ONLY"
            })
            self.active = None
            self.capture = None
        if tag in ("script", "style", "noscript") and self.in_bad_tags:
            self.in_bad_tags -= 1
        for i in range(len(self.tags) - 1, -1, -1):
            if self.tags[i][0] == tag:
                self.tags = self.tags[:i]
                break


def inspect_html(html, source_url, expected_heading=None):
    parsed = BlockParser()
    parsed.feed(html)
    if not parsed.article_h2:
        raise ValueError("ARTICLE_H2_NOT_FOUND")
    if expected_heading and not parsed.article_h2.strip():
        raise ValueError("EXPECTED_HEADING_MISSING")
    return {
        "sourceUrl": source_url,
        "articleTitle": parsed.article_h2,
        "commentaryHeadingCount": parsed.commentary_headings,
        "commentaryBlocks": parsed.blocks,
        "explicitAuthorWorkBlocks": sum(bool(b["workCandidate"]) for b in parsed.blocks),
        "anonymousOrOtherBlocks": sum(not bool(b["workCandidate"]) for b in parsed.blocks),
        "status": "STRUCTURAL_METADATA_ONLY_NOT_ORIGINAL_WORK_EDITION_VERIFIED",
        "sourceTextRights": "NOT_CLEARED_LINK_AND_METADATA_ONLY"
    }


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--manifest", default="data/source-text/icrsp-france-index-discovery.v1.json")
    cli.add_argument("--indices", default="", help="comma-separated 0-based index positions")
    cli.add_argument("--start", type=int, default=0)
    cli.add_argument("--count", type=int, default=0)
    cli.add_argument("--delay", type=float, default=3.0)
    cli.add_argument("--out", required=True)
    args = cli.parse_args()
    if args.delay < 2.5 or args.start < 0 or args.count < 0:
        cli.error("min delay 2.5 seconds, start/count nonnegative")
    master = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    pages = master["pages"]
    if args.indices:
        positions = [int(s) for s in args.indices.split(",") if s.strip()]
    else:
        positions = list(range(args.start, args.start + args.count))
    if len(positions) != len(set(positions)) or any(i < 0 or i >= len(pages) for i in positions):
        cli.error("invalid, duplicated or out-of-bounds positions")
    robots = RobotFileParser()
    robots.set_url("https://icrspfrance.fr/robots.txt")
    robots.read()
    rows, errors = [], []
    for i, pos in enumerate(positions):
        page = pages[pos]
        if i:
            time.sleep(args.delay)
        if not robots.can_fetch(UA, page["sourceUrl"]):
            errors.append({"articleId": page["articleId"], "reason": "ROBOTS_DISALLOWED"})
            continue
        try:
            html, fingerprint = load_html(page["sourceUrl"])
            result = inspect_html(html, page["sourceUrl"])
            if page["articleId"] not in result["sourceUrl"]:
                raise ValueError("SOURCE_ID_NOT_IN_URL")
            result.update({
                "articleId": page["articleId"], "indexPosition": pos,
                "indexSection": page["sections"][0],
                "htmlSha256": fingerprint,
                "editionCertification": "NOT_CERTIFIED_1962"
            })
            rows.append(result)
        except Exception as e:
            errors.append({"articleId": page["articleId"], "reason": str(e)[:180]})
        if (i + 1) % 25 == 0:
            print(f"Screened {i+1}/{len(positions)} source pages", flush=True)
    output = {
        "schema": "AO_ICRSP_COMMENTARY_BLOCK_METADATA_V1",
        "status": "SOURCE_BLOCK_LABELS_ONLY_NO_FULL_TEXT_NO_CANONICAL_PUBLICATION",
        "sourceIndex": master["sourceIndex"],
        "indexPositionsRequested": positions,
        "totals": {
            "requested": len(positions), "inspected": len(rows),
            "errors": len(errors), "pagesWithCommentary": sum(r["commentaryHeadingCount"] > 0 for r in rows),
            "pagesWithBlockStructure": sum(bool(r["commentaryBlocks"]) for r in rows),
            "explicitWorkLabeledBlocks": sum(r["explicitAuthorWorkBlocks"] for r in rows),
            "otherBlocks": sum(r["anonymousOrOtherBlocks"] for r in rows)
        },
        "records": rows, "errors": errors
    }
    Path(args.out).write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n",
                              encoding="utf-8")
    print(json.dumps(output["totals"]))


if __name__ == "__main__":
    main()
