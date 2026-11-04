#!/usr/bin/env python3
"""Inspect ICRSP HTML author-label markup; temporary metadata diagnostics only.

A provenance probe, NOT a publication or commentary exporter. Emits tag paths
and short author-label text nodes; deliberately excludes article paragraphs.
"""
import json
import re
import sys
import time
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlencode
from urllib.robotparser import RobotFileParser
from index_source_metadata import INDEX, UA, load_html

PILOT = [
    "a0088_ancien",  # Advent, clearly headed Guéranger / Schuster / Parsch
    "a0096_ancien",  # Christmas, several Mass variants
    "a0146_ancien",  # Candlemas, other commentary blocks
    "a0134_ancien",  # Quinquagesima, no h3 Commentaires
    "a0112_nouveau", # 1973 reference: expected zero article authors
    "a0665_ancien",  # Sanctoral
]
AUTHOR = re.compile(r"(?i)gu[eé]ranger|schuster|parsch")
IGNORE = {"script", "style", "svg", "noscript"}


class Probe(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.events = []
        self.scope = "page"
        self.heading = None
        self.heading_text = []
        self.h3s = []

    def handle_starttag(self, tag, attrs):
        props = dict(attrs)
        self.stack.append((tag, props))
        if tag in ("h2", "h3", "h4"):
            self.heading = tag
            self.heading_text = []

    def handle_endtag(self, tag):
        if self.heading == tag:
            txt = " ".join(" ".join(self.heading_text).split())
            if tag == "h3":
                self.scope = txt
                self.h3s.append(txt)
            self.heading = None
        # Recover gracefully from mismatched HTML tags.
        for pos in range(len(self.stack)-1, -1, -1):
            if self.stack[pos][0] == tag:
                self.stack = self.stack[:pos]
                break

    def handle_data(self, val):
        if self.heading:
            self.heading_text.append(val)
        if not AUTHOR.search(val):
            return
        stack = self.stack
        ignored = any(tag in IGNORE for tag, _ in stack)
        clean = " ".join(val.split())
        # Limit to plausible label nodes; paragraphs are NOT extracted.
        short = len(clean) < 150
        self.events.append({
            "nodeLength": len(clean),
            "labelCandidate": clean[:120] if short and not ignored else None,
            "isShortText": short,
            "ignoredMarkup": ignored,
            "sectionHint": self.scope,
            "tagPath": [
                {"tag": t, "id": props.get("id"), "class": props.get("class"),
                 "role": props.get("role")}
                for t, props in stack[-8:]
            ]
        })


def main():
    import argparse
    cli = argparse.ArgumentParser()
    cli.add_argument("--out", default="icrsp-markup-probe.v1.json")
    args = cli.parse_args()
    robots = RobotFileParser()
    robots.set_url("https://icrspfrance.fr/robots.txt")
    robots.read()
    report = []
    for i, article in enumerate(PILOT):
        url = INDEX + "?" + urlencode({"article": article})
        if not robots.can_fetch(UA, url):
            report.append({"articleId": article, "status": "ROBOTS_BLOCKED"})
            continue
        if i:
            time.sleep(2.5)
        try:
            html, sha = load_html(url)
            p = Probe()
            p.feed(html)
            report.append({
                "articleId": article,
                "status": "MARKUP_PROBED",
                "htmlSha256": sha,
                "h3SectionTitles": p.h3s[:50],
                "authorNameNodeCount": len(p.events),
                "authorNameTagSamples": p.events[:30]
            })
        except Exception as exc:
            report.append({"articleId": article, "status": "FETCH_FAILED",
                           "error": str(exc)[:180]})
    out = {"schema": "ICRSP_COMMENTARY_MARKUP_PROBE_V1",
           "status": "SOURCE_HTML_TAG_PATHS_ONLY_NO_BODY_REPUBLICATION",
           "records": report}
    Path(args.out).write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n",
                              encoding="utf-8")
    print(json.dumps({"results": [
        {"id": r["articleId"], "status": r["status"],
         "candidateNodes": r.get("authorNameNodeCount", 0),
         "headings": r.get("h3SectionTitles", [])[:4]}
        for r in report]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
