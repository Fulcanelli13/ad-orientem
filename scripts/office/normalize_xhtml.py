#!/usr/bin/env python3
"""Research-only, source-structure-preserving Divine Office XHTML normalizer.

Parses ONLY text of explicitly identified upstream Office <td id="Vespera1">
source cells; strips all markup, links, scripts and attributes. Never exposes
upstream HTML to the app. Output is not certified liturgical content.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from html.parser import HTMLParser
from pathlib import Path

HOURS = {
    "MATINS": "Matutinum",
    "LAUDS": "Laudes",
    "PRIME": "Prima",
    "TERCE": "Tertia",
    "SEXT": "Sexta",
    "NONE": "Nona",
    "VESPERS": "Vespera",
    "COMPLINE": "Completorium",
}
LANGS = ("la", "en", "fr")
SECTION_LIMIT = 300
UNRESOLVED_MACRO = re.compile(r"(?:^|\n)\s*[@$&][A-Za-z][A-Za-z0-9_/-]*")
ELEMENT_ID = re.compile(r"^([A-Za-z]+)([1-9][0-9]*)$")


def clean_text(parts: list[str]) -> str:
    raw = "".join(parts).replace("\r\n", "\n").replace("\xa0", " ")
    lines = [re.sub(r"[ \t\v\f]+", " ", line).strip() for line in raw.split("\n")]
    return "\n".join(x for x in lines if x)


class OfficeCells(HTMLParser):
    """Retain paragraphs from the real Office cells only, never navigation."""

    def __init__(self, hour: str):
        super().__init__(convert_charrefs=True)
        self.expected = HOURS[hour]
        self.hour = hour
        self.sections: list[dict] = []
        self.current: dict | None = None
        self.invalid: list[str] = []
        self.depth = 0
        self.skip = 0
        self.headline: list[str] = []
        self.in_headline = False
        self.headline_started = False
        self.seen_h2 = False
        self.body = False

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        attrs = dict(attrs)
        if tag == "body":
            self.body = True
        if tag in ("script", "style", "iframe", "object", "svg"):
            self.skip += 1
            return
        if self.skip:
            return
        if tag == "p" and self.body and not self.seen_h2 and not self.headline_started:
            if "cen" in attrs.get("class", "").split():
                self.in_headline = True
                self.headline_started = True
        if tag == "h2" and self.body:
            self.seen_h2 = True
        if tag == "td":
            if self.current is not None:
                self.invalid.append("NESTED_SOURCE_CELL")
            match = ELEMENT_ID.fullmatch(attrs.get("id", ""))
            if self.seen_h2 and match and match.group(1) == self.expected:
                self.current = {"sourceCellId": attrs["id"], "index": int(match.group(2)), "parts": []}
                self.depth = 1
            return
        if self.current is not None:
            if tag == "br":
                self.current["parts"].append("\n")
            elif tag in ("p", "div", "h1", "h2", "h3", "tr"):
                self.current["parts"].append("\n")
        elif self.in_headline and tag == "br":
            self.headline.append("\n")

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag.lower() not in ("br", "hr", "meta", "link", "img", "input"):
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in ("script", "style", "iframe", "object", "svg") and self.skip:
            self.skip -= 1
            return
        if self.skip:
            return
        if tag == "td" and self.current:
            self.finish_cell()
            return
        if tag == "p":
            if self.current is not None:
                self.current["parts"].append("\n")
            if self.in_headline:
                self.in_headline = False

    def handle_data(self, data):
        if self.skip:
            return
        if self.current is not None:
            self.current["parts"].append(data)
        elif self.in_headline:
            self.headline.append(data)

    def finish_cell(self):
        current = self.current
        self.current = None
        text = clean_text(current["parts"])
        if not text:
            self.invalid.append("EMPTY_SOURCE_CELL:" + current["sourceCellId"])
        if UNRESOLVED_MACRO.search(text):
            self.invalid.append("UNRESOLVED_SOURCE_REFERENCE:" + current["sourceCellId"])
        self.sections.append({
            "sourceCellId": current["sourceCellId"],
            "index": current["index"],
            "kind": "SOURCE_OFFICE_CELL",
            "text": text,
        })


def normalize_xhtml(xhtml: str, *, date: str, hour: str, language: str, source_revision: str) -> dict:
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", date):
        raise ValueError("OFFICE_NORMALIZE_DATE_INVALID")
    if hour not in HOURS or language not in LANGS:
        raise ValueError("OFFICE_NORMALIZE_SELECTION_INVALID")
    if not re.fullmatch(r"[a-f0-9]{40}", source_revision):
        raise ValueError("OFFICE_NORMALIZE_SOURCE_REVISION_INVALID")
    if "<body" not in xhtml.lower() or "</html>" not in xhtml.lower():
        raise ValueError("OFFICE_NORMALIZE_DOCUMENT_INVALID")
    parser = OfficeCells(hour)
    parser.feed(xhtml)
    parser.close()
    if parser.current is not None:
        raise ValueError("OFFICE_NORMALIZE_UNCLOSED_SOURCE_CELL")
    sections = parser.sections
    if not sections or len(sections) > SECTION_LIMIT:
        raise ValueError("OFFICE_NORMALIZE_SOURCE_CELLS_MISSING_OR_EXCESSIVE")
    indices = [x["index"] for x in sections]
    if indices != list(range(1, len(indices) + 1)):
        raise ValueError("OFFICE_NORMALIZE_SOURCE_CELLS_NONCONTIGUOUS")
    if parser.invalid:
        raise ValueError("OFFICE_NORMALIZE_SOURCE_INTEGRITY:" + ",".join(parser.invalid[:6]))
    headline = clean_text(parser.headline)
    if not headline:
        raise ValueError("OFFICE_NORMALIZE_DAY_HEADLINE_MISSING")
    return {
        "schema": "ao.office.source-cells.v1",
        "date": date,
        "hour": hour,
        "language": language,
        "sourceRevision": source_revision,
        "sourceEngine": "DivinumOfficium/EofficiumXhtml.pl",
        "headline": headline,
        "sections": sections,
        "metrics": {
            "sectionCount": len(sections),
            "characters": sum(len(s["text"]) for s in sections),
            "textSha256": hashlib.sha256("\n\n".join(s["text"] for s in sections).encode("utf-8")).hexdigest(),
        },
        "verification": {
            "structural": True,
            "rubrical": False,
            "languageCompleteness": False,
            "crossLanguageAlignment": False,
            "independentPrintedBreviary": False,
        },
        "publishable": False,
        "status": "STRUCTURED_UNVERIFIED",
    }


def convert_tree(root: Path) -> dict:
    manifest_path = root / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("researchOnly") is not True or manifest.get("counts", {}).get("published") != 0:
        raise ValueError("OFFICE_NORMALIZE_RESEARCH_MANIFEST_REQUIRED")
    revision = manifest["sourceRevision"]
    records = []
    normalized = {}
    for row in manifest["records"]:
        date, hour, language = (row[x] for x in ("date", "hour", "language"))
        if row.get("envelopePass") is not True or row.get("status") != "CAPTURED_UNVERIFIED":
            raise ValueError("OFFICE_NORMALIZE_UNVERIFIED_ENVELOPE:" + row["file"])
        relative = Path(row["file"])
        if relative.is_absolute() or ".." in relative.parts or len(relative.parts) != 3:
            raise ValueError("OFFICE_NORMALIZE_UNSAFE_PATH")
        content = (root / relative).read_text(encoding="utf-8")
        if hashlib.sha256(content.encode("utf-8")).hexdigest() != row["sha256"]:
            raise ValueError("OFFICE_NORMALIZE_RAW_CHECKSUM_MISMATCH")
        doc = normalize_xhtml(content, date=date, hour=hour, language=language, source_revision=revision)
        outfile = root / date / hour.lower() / (language + ".research.json")
        outfile.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        normalized[(date, hour, language)] = doc
        records.append({
            "date": date, "hour": hour, "language": language,
            "sectionCount": doc["metrics"]["sectionCount"],
            "characters": doc["metrics"]["characters"],
            "textSha256": doc["metrics"]["textSha256"],
            "headline": doc["headline"],
            "file": str(outfile.relative_to(root)), "status": doc["status"],
        })

    groups = {(date, hour) for date, hour, _ in normalized}
    for date, hour in groups:
        if any((date, hour, lang) not in normalized for lang in LANGS):
            raise ValueError("OFFICE_NORMALIZE_TRILINGUAL_ROW_MISSING:" + date + ":" + hour)

    comparisons = []
    for date, hour, language in sorted(normalized):
        if language != "fr":
            continue
        english = normalized.get((date, hour, "en"))
        french = normalized[(date, hour, "fr")]
        latin = normalized.get((date, hour, "la"))
        if not english or not latin:
            raise ValueError("OFFICE_NORMALIZE_TRILINGUAL_ROW_MISSING")
        ids = [[s["index"] for s in doc["sections"]] for doc in (latin, english, french)]
        aligned = all(items == ids[0] for items in ids[1:])
        shared = set(s["text"] for s in english["sections"]) & set(s["text"] for s in french["sections"])
        exact_nontrivial = [x for x in shared if len(x) > 120]
        comparisons.append({
            "date": date, "hour": hour,
            "sectionCount": [len(x) for x in ids],
            "structurallyAligned": aligned,
            "identicalLongEnglishFrenchBlocks": len(exact_nontrivial),
            "translationVerified": False,
        })
    summary = {
        "schema": "ao.office.normalization-audit.v1",
        "sourceRevision": revision, "records": records,
        "count": len(records),
        "structurallyAligned": sum(bool(x["structurallyAligned"]) for x in comparisons),
        "alignmentSamples": len(comparisons),
        "identicalLongEnglishFrenchBlocks": sum(x["identicalLongEnglishFrenchBlocks"] for x in comparisons),
        "comparisons": comparisons,
        "liturgicallyVerified": 0, "published": 0,
    }
    (root / "normalized-manifest.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    # Diagnosis of source cell count differences; no automated text rewrites.
    for hour in ("LAUDS", "VESPERS"):
        key_date = "2026-10-31"
        if all((key_date, hour, locale) in normalized for locale in LANGS):
            print("OFFICE_CELL_DIFFERENTIAL", json.dumps({
                "date": key_date, "hour": hour,
                "cells": {locale: [
                    {"id": x["sourceCellId"], "incipit": x["text"][:64]}
                    for x in normalized[(key_date,hour,locale)]["sections"]
                ] for locale in LANGS}
            }, ensure_ascii=False))
    return summary


if __name__ == "__main__":
    cli = argparse.ArgumentParser()
    cli.add_argument("--out", type=Path, required=True)
    args = cli.parse_args()
    summary = convert_tree(args.out)
    print("OFFICE_NORMALIZED_SUMMARY", json.dumps({
        "count": summary["count"],
        "aligned": summary["structurallyAligned"], "compared": summary["alignmentSamples"],
        "sharedLongEnFr": summary["identicalLongEnglishFrenchBlocks"], "published": summary["published"],
    }))
    for row in summary["comparisons"]:
        if not row["structurallyAligned"] or row["identicalLongEnglishFrenchBlocks"]:
            print("OFFICE_LANGUAGE_REVIEW", json.dumps(row))
    for row in summary["records"]:
        if row["hour"] == "VESPERS" and row["language"] == "la":
            print("OFFICE_VESPERS_HEADLINE", row["date"], row["headline"][:300])
