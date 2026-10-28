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
# 1960-rubrics output sometimes emits a vernacular-only status cell whose
# entire contents explicitly say that ferial preces are omitted. Preserve it
# as provenance, not as a prayer card. Do NOT drop a cell containing prayers.
EXPLICIT_OMITTED_PRECES = {
    "en": re.compile(r"^Weekday Intercessions\s*\{omit\}$", re.IGNORECASE),
    "fr": re.compile(r"^Prières fériales\s*\{omises\}$", re.IGNORECASE),
}


# Grouped content is kept together: a Psalm cell may contain both its
# antiphon and psalm, and a Chapter cell may include hymn and versicle.
# This is source labeling for navigation, NOT verse-level parsing.
LATIN_CELL_PREFIXES = (
    (re.compile(r"^Incipit(?:$|\n|\s)", re.I), "OPENING"),
    (re.compile(r"^(?:Psalmi\b|Psalmus\b|Ant\.)", re.I), "PSALMODY"),
    (re.compile(r"^Capitulum(?:\s|$)", re.I), "CHAPTER_HYMN_VERSE"),
    (re.compile(r"^Canticum:\s*(?:Benedictus|Magnificat)", re.I), "GOSPEL_CANTICLE"),
    (re.compile(r"^Canticum(?:\s|$|:)", re.I), "CANTICLE"),
    (re.compile(r"^(?:Lectio|Lectiónes|Lectiones|Absolutio)\b", re.I), "LESSON_OR_ABSOLUTION"),
    (re.compile(r"^(?:Responsorium|Resp\.)\b", re.I), "RESPONSORY"),
    (re.compile(r"^(?:Invitatorium|Invit\.)\b", re.I), "INVITATORY"),
    (re.compile(r"^(?:Hymnus|Hymn\.)\b", re.I), "HYMN"),
    (re.compile(r"^(?:Oratio|Preces)\b", re.I), "PRAYER"),
    (re.compile(r"^Conclusio(?:$|\n|\s)", re.I), "CONCLUSION"),
    (re.compile(r"^(?:Nocturnus|Nocturnum)\b", re.I), "NOCTURN"),
    # These are literal first-line headings observed in the 96-hour pilot.
    # The Iube cell can include blessing AND lesson; do not call it merely a blessing.
    (re.compile(r"^℣\.\s*Iube,\s*Dómine,\s*benedícere", re.I), "LESSON_WITH_BLESSING"),
    (re.compile(r"^Pater Noster dicitur secreto", re.I), "MATINS_PREPARATION"),
    (re.compile(r"^Antiphona finalis B\.M\.V\.", re.I), "MARIAN_ANTIPHON"),
    (re.compile(r"^Martyrologium\b", re.I), "MARTYROLOGY"),
    (re.compile(r"^De Officio Capituli\b", re.I), "PRIME_CHAPTER_OFFICE"),
    (re.compile(r"^Reliqua omittuntur", re.I), "RUBRICAL_NOTE"),
    (re.compile(r"^℣\.\s*Deus\s*✠\s*in adiutórium", re.I), "OPENING"),
    (re.compile(r"^℣\.", re.I), "VERSICLE_RESPONSE"),
)
def classify_latin_cell(text: str) -> dict:
    # Never classify an arbitrary verse in the middle of the cell.
    first = str(text).split("\n", 1)[0].strip()
    for pattern, role in LATIN_CELL_PREFIXES:
        if pattern.search(first):
            return {"role": role, "basis": "LATIN_SOURCE_PREFIX", "certainty": "HEURISTIC"}
    return {"role": "SOURCE_SECTION", "basis": "UNCLASSIFIED_LATIN_SOURCE", "certainty": "NONE"}


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
    # Source cells are intact and consecutive; presentation cells may exclude
    # only source-proven, explicitly omitted preces markers.
    source_cells = sections
    sections = []
    omitted = []
    omission_rule = EXPLICIT_OMITTED_PRECES.get(language)
    for cell in source_cells:
        if omission_rule and omission_rule.fullmatch(cell["text"]):
            omitted.append({
                "sourceCellId": cell["sourceCellId"],
                "sourceIndex": cell["index"],
                "text": cell["text"],
                "reason": "UPSTREAM_EXPLICIT_PRECES_OMISSION",
            })
            continue
        sections.append({
            **cell, "sourceIndex": cell["index"],
            "index": len(sections) + 1,
        })
    if not sections:
        raise ValueError("OFFICE_NORMALIZE_ALL_CONTENT_OMITTED")
    return {
        "schema": "ao.office.source-cells.v1",
        "date": date,
        "hour": hour,
        "language": language,
        "sourceRevision": source_revision,
        "sourceEngine": "DivinumOfficium/EofficiumXhtml.pl",
        "headline": headline,
        "sections": sections,
        "omittedSourceCells": omitted,
        "metrics": {
            "rawSourceCellCount": len(source_cells),
            "explicitlyOmittedSourceCellCount": len(omitted),
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
            "explicitOmissions": [x["sourceCellId"] for x in doc["omittedSourceCells"]],
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
    # Semantic roles are derived solely from the canonical Latin source cell
    # at the SAME display index, and projected to the matching EN/FR cells.
    # Unaligned groups stay unclassified and are not reader-ready.
    semantic_stats = {}
    for date, hour in sorted(groups):
        docs = [normalized[(date, hour, locale)] for locale in LANGS]
        section_ids = [[s["index"] for s in doc["sections"]] for doc in docs]
        if not all(v == section_ids[0] for v in section_ids[1:]):
            continue
        roles = [classify_latin_cell(s["text"]) for s in docs[0]["sections"]]
        for locale, doc in zip(LANGS, docs):
            for section, role in zip(doc["sections"], roles):
                section["semantic"] = {
                    **role, "latinSourceCellId": docs[0]["sections"][section["index"] - 1]["sourceCellId"]
                }
            outfile = root / date / hour.lower() / (locale + ".research.json")
            outfile.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        for role in roles:
            semantic_stats[role["role"]] = semantic_stats.get(role["role"], 0) + 1
    # Research diagnostic: inspect the *actual* remaining headings before
    # extending semantic labels. Never invent an identity from a verse body.
    unclassified = {}
    for date, hour in sorted(groups):
        for section in normalized[(date, hour, "la")]["sections"]:
            if section.get("semantic", {}).get("role") != "SOURCE_SECTION":
                continue
            first = section["text"].split("\n", 1)[0][:120]
            key = (hour, first)
            unclassified[key] = unclassified.get(key, 0) + 1
    print("OFFICE_UNCLASSIFIED_HEADINGS", json.dumps([
        {"hour": hour, "heading": heading, "count": count}
        for (hour, heading), count in sorted(
            unclassified.items(), key=lambda item: (-item[1], item[0]))
    ], ensure_ascii=False))
    summary = {
        "schema": "ao.office.normalization-audit.v1",
        "sourceRevision": revision, "records": records,
        "count": len(records),
        "structurallyAligned": sum(bool(x["structurallyAligned"]) for x in comparisons),
        "alignmentSamples": len(comparisons),
        "identicalLongEnglishFrenchBlocks": sum(x["identicalLongEnglishFrenchBlocks"] for x in comparisons),
        "comparisons": comparisons,
        "semanticRolesInLatinGroups": semantic_stats,
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
    print("OFFICE_SEMANTIC_COUNTS", json.dumps(summary["semanticRolesInLatinGroups"]))
    if summary["count"] == 6:
        # Short source incipits only, for manual chant-text collation. All
        # substantive text stays in CI scratch, not public/Git repository.
        for date in ("2026-11-28", "2026-11-29"):
            key = (date, "VESPERS", "la")
            document = None
            # The current pilot has 2 dates x 1 hour x 3 languages.
            # Audit their numbered first-line anchors, never assert match.
            for record in summary["records"]:
                if record["date"] == date and record["hour"] == "VESPERS" and record["language"] == "la":
                    path = args.out / record["file"]
                    document = json.loads(path.read_text(encoding="utf-8"))
            if document:
                print("OFFICE_ADVENT_VESPERS_INCIPITS", json.dumps({
                    "date": date, "headline": document["headline"],
                    "cells": [{
                        "index": s["index"],
                        "heading": s["text"].split("\\n")[0][:100],
                        "incipit": s["text"].split("\\n")[1][:110] if "\\n" in s["text"] else "",
                    } for s in document["sections"]],
                },ensure_ascii=False))

    # Exception register only: compare numbered source-cell headings for the
    # three All Souls Office hours whose localized source structures diverge.
    # Never discard or zip source cells to force a false bilingual match.
    if summary["count"] == 24:
        for hour in ("MATINS", "LAUDS", "VESPERS"):
            records = {
                lang: next(
                    (x for x in summary["records"] if x["date"] == "2026-11-02"
                     and x["hour"] == hour and x["language"] == lang), None
                ) for lang in LANGS
            }
            if not all(records.values()):
                continue
            sample = {}
            for lang, record in records.items():
                document = json.loads((args.out / record["file"]).read_text(encoding="utf8"))
                sample[lang] = [
                    {"displayIndex": s["index"], "sourceIndex": s["sourceIndex"],
                     "sourceCellId": s["sourceCellId"],
                     "heading": s["text"].split("\\n", 1)[0][:80]}
                    for s in document["sections"]
                ]
            print("OFFICE_ALL_SOULS_SOURCE_HEADINGS", json.dumps({
                "date": "2026-11-02", "hour": hour, "languages": sample
            }, ensure_ascii=False))
    for row in summary["comparisons"]:
        if not row["structurallyAligned"] or row["identicalLongEnglishFrenchBlocks"]:
            print("OFFICE_LANGUAGE_REVIEW", json.dumps(row))
    for row in summary["records"]:
        if row["hour"] == "VESPERS" and row["language"] == "la":
            print("OFFICE_VESPERS_HEADLINE", row["date"], row["headline"][:300])
