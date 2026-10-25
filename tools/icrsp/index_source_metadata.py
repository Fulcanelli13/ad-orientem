#!/usr/bin/env python3
"""ICRSP France metadata-only index/section discovery for issue #1665.

No full text, translations, illustrations, or Mass/Calendar data are published.
Python standard library only. Respects robots.txt and a minimum 2-second delay.
"""
import argparse
import hashlib
import json
import re
import sys
import time
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import parse_qs, urlencode, urljoin, urlparse
from urllib.request import Request, urlopen
from urllib.robotparser import RobotFileParser

INDEX = "https://icrspfrance.fr/textes-liturgiques.php"
UA = "AdOrientemResearchIndexer/1.0 (metadata only; no text redistribution)"
MAX_BYTES = 10_485_760
SECTIONS = {
    "temporal": "temporal", "sanctoral": "sanctoral",
    "communs": "commons", "commun des saints": "commons",
    "propres diocésains": "local_propers",
    "messes votives et des défunts": "votives_requiem",
    "préfaces": "prefaces", "rituel": "ritual",
    "office divin": "office", "documents": "documents"
}

def article_url(href):
    u = urlparse(urljoin(INDEX, href))
    if u.netloc.lower() != "icrspfrance.fr" or u.path != "/textes-liturgiques.php":
        return None
    a = parse_qs(u.query).get("article", [None])[0]
    if not a or not re.fullmatch(r"a\d{4}_(ancien|nouveau)", a):
        return None
    return INDEX + "?" + urlencode({"article": a})

class IndexHTML(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.section = "unknown"
        self.heading, self.headbuf = None, []
        self.href, self.linkbuf = None, []
        self.links = []

    def handle_starttag(self, tag, attrs):
        if tag in ("h2", "h3", "h4"):
            self.heading, self.headbuf = tag, []
        if tag == "a":
            self.href, self.linkbuf = dict(attrs).get("href"), []

    def handle_data(self, value):
        if self.heading:
            self.headbuf.append(value)
        if self.href is not None:
            self.linkbuf.append(value)
        # Also handles non-heading category labels.
        key = " ".join(value.split()).casefold()
        if self.href is None and key in SECTIONS:
            self.section = SECTIONS[key]

    def handle_endtag(self, tag):
        if tag == self.heading:
            key = " ".join(" ".join(self.headbuf).split()).casefold()
            self.section = SECTIONS.get(key, self.section)
            self.heading, self.headbuf = None, []
        if tag == "a" and self.href is not None:
            u = article_url(self.href)
            if u:
                self.links.append({
                    "url": u, "label": " ".join(" ".join(self.linkbuf).split()),
                    "sectionHint": self.section, "occurrence": len(self.links) + 1
                })
            self.href, self.linkbuf = None, []

class ArticleHTML(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.current, self.buf = None, []
        self.headings = []

    def handle_starttag(self, tag, attrs):
        if tag in ("h2", "h3", "h4"):
            self.current, self.buf = tag, []

    def handle_data(self, value):
        if self.current:
            self.buf.append(value)

    def handle_endtag(self, tag):
        if tag == self.current:
            txt = " ".join(" ".join(self.buf).split())
            if txt:
                self.headings.append({"level": tag, "text": txt})
            self.current, self.buf = None, []

def load_html(url):
    req = Request(url, headers={"User-Agent": UA, "Accept": "text/html"})
    with urlopen(req, timeout=30) as response:
        if response.headers.get_content_type() != "text/html":
            raise ValueError("Refusing non-HTML source")
        payload = response.read(MAX_BYTES + 1)
        if len(payload) > MAX_BYTES:
            raise ValueError("HTML source larger than safety limit")
        charset = response.headers.get_content_charset() or "utf-8"
        return payload.decode(charset, errors="replace"), hashlib.sha256(payload).hexdigest()

def discover(html):
    parsed = IndexHTML()
    parsed.feed(html)
    pages = {}
    for occurrence in parsed.links:
        u = occurrence["url"]
        rec = pages.setdefault(u, {
            "sourceUrl": u, "articleId": parse_qs(urlparse(u).query)["article"][0],
            "labels": [], "sections": [], "state": "INDEX_ONLY",
            "edition": "UNVERIFIED_DO_NOT_READ_URL_SUFFIX",
            "rights": "NOT_CLEARED_INDEX_AND_LINK_ONLY", "promotion": "NONE"
        })
        if occurrence["label"] not in rec["labels"]:
            rec["labels"].append(occurrence["label"])
        if occurrence["sectionHint"] not in rec["sections"]:
            rec["sections"].append(occurrence["sectionHint"])
    return parsed.links, list(pages.values())

def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--inspect", type=int, default=0, help="article metadata count: 0=index only, -1=all")
    cli.add_argument("--delay", type=float, default=2.5, help="delay per inspected page; minimum 2 seconds")
    cli.add_argument("--out", default="icrsp-index-metadata.v1.json")
    args = cli.parse_args()
    if args.inspect < -1 or args.delay < 2:
        cli.error("inspect must be >= -1; delay must be >= 2")
    robots = RobotFileParser()
    robots.set_url("https://icrspfrance.fr/robots.txt")
    try:
        robots.read()
        if not robots.can_fetch(UA, INDEX):
            sys.exit("Robots disallows index; no requests made")
        html, index_hash = load_html(INDEX)
    except Exception as exc:
        sys.exit(f"Index fetch failed, no completion claim: {exc}")
    occurrences, pages = discover(html)
    errors = []
    limit = len(pages) if args.inspect == -1 else min(args.inspect, len(pages))
    for idx, page in enumerate(pages[:limit], start=1):
        u = page["sourceUrl"]
        if not robots.can_fetch(UA, u):
            page["state"] = "ROBOTS_DISALLOWED"
            continue
        time.sleep(args.delay)
        try:
            html, sha = load_html(u)
            h = ArticleHTML()
            h.feed(html)
            page.update({
                "state": "METADATA_INSPECTED", "htmlSha256": sha,
                "headings": h.headings[:80],
                "authorsMentionedHeuristic": [
                    name for name in ("Guéranger", "Schuster", "Parsch")
                    if name.casefold() in html.casefold()
                ],
            })
        except Exception as exc:
            page["state"] = "INSPECTION_FAILED"
            errors.append({"url": u, "reason": str(exc)[:300]})
        if idx % 25 == 0:
            print(f"Inspected {idx}/{limit}", file=sys.stderr)
    result = {
        "schema": "AO_ICRSP_INDEX_METADATA_V1", "issue": 1665,
        "sourceIndex": INDEX, "inspectedAtUtc": datetime.now(timezone.utc).isoformat(),
        "indexHtmlSha256": index_hash,
        "policy": "RESEARCH_ONLY_NO_REPUBLICATION_OR_CANONICAL_PROMOTION",
        "totals": {
            "indexOccurrences": len(occurrences),
            "uniqueArticleUrls": len(pages),
            "metadataInspected": sum(p["state"] == "METADATA_INSPECTED" for p in pages),
            "errors": len(errors)
        },
        "occurrences": occurrences, "pages": pages, "errors": errors,
    }
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result["totals"]))

if __name__ == "__main__":
    main()
