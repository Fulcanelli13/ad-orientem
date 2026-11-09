#!/usr/bin/env python3
"""Source-anchored Latin 1960 annual Office semantic projection.

Transforms all 8 original EPUB Hours into typed, source-linked display
sections and line-level reading units. Never fabricates a prayer, translates
words, or independently certifies an Office/rubric. The raw XHTML chapter
SHA-256, block ordinal and original line number remain attached throughout.
"""
from __future__ import annotations

import argparse
from collections import Counter
import datetime as dt
import gzip
import json
from pathlib import Path
import re
import sys

HOURS = (
    "Matutinum", "Laudes", "Prima", "Tertia",
    "Sexta", "Nona", "Vespera", "Completorium",
)
SECTION_KINDS = {
    "Incipit": "opening",
    "Invitatorium": "invitatory",
    "Hymnus": "hymn",
    "Psalmi": "psalmody",
    "Psalmi cum lectionibus": "psalmody_and_lessons",
    "Lectio brevis": "short_reading",
    "Capitulum Responsorium Versus": "chapter_responsory_versicle",
    "Capitulum Hymnus Versus": "chapter_hymn_versicle",
    "Canticum: Benedictus": "gospel_canticle",
    "Canticum: Magnificat": "gospel_canticle",
    "Canticum: Nunc dimittis": "gospel_canticle",
    "Oratio": "collect_and_prayer",
    "Conclusio": "conclusion",
    "Martyrologium": "martyrology",
    "De Officio Capituli": "chapter_office",
    "Preces Feriales": "ferial_prayers",
    "Antiphona finalis B.M.V.": "marian_antiphon_and_collect",
    "Versus (In loco Capituli)": "versicle",
    "Litaniæ": "litany",
}
PSALM = re.compile(r"^Psalmus\s+(?P<number>\d+)(?P<portion>\([^)]*\))?\s+\[(?P<order>\d+)\](?:\s|$)")
VERSE = re.compile(r"^(?P<chapter>\d{1,3}):(?P<verse>\d{1,3})(?:-\d{1,3})?\s")
LECTIO = re.compile(r"^Lectio (?P<index>\d+)$")
NOCTURN = re.compile(r"^Nocturnus\s+[IVX]+$")
REFERENCE = re.compile(
    r"^(?:[123]\s+)?(?:Tim\.?|Pet\.?|Ioan\.?|Joan\.?|Luc\.?|"
    r"Matth\.?|Marc\.?|Rom\.?|Phil\.?|Col\.?|Heb\.?|Isa\.?|Jer\.?|"
    r"Dan\.?|Apoc\.?|Eccli\.?|Ps\.?|Sap\.?|Gen\.?|Ex\.?|Job|"
    r"Act\.?|Cor\.?|Eph\.?|Tit\.?|Prov\.?|Cant\.?|Ier\.?)"
    r"\s+\d+(?::\d+(?:-\d+)?)?$", re.IGNORECASE
)
SCRIPTURE_CANTICLE = re.compile(r"^Canticum\s+\S")
ANTIPHON = re.compile(r"^Ant\.\s+")
VERSICLE = re.compile(r"^℣\.\s*")
RESPONSE = re.compile(r"^℟(?:\.|br\.)\s*")
GLOSSARY = re.compile(r"^Glória Patri,")
BARE_SOURCE = re.compile(r"^Preces Feriales(?:\{.*\})?$")

def line_role(line: str, section_label: str | None) -> tuple[str, dict]:
    """Evidence from exact rendered Latin source prefixes, not liturgical guesses."""
    if section_label and line == section_label:
        return "section_title", {"source_marker": section_label}
    psalm = PSALM.match(line)
    if psalm:
        return "psalm_heading", {
            "psalm": int(psalm["number"]),
            "portion": psalm["portion"],
            "psalm_source_order": int(psalm["order"]),
        }
    if SCRIPTURE_CANTICLE.match(line):
        return "canticle_heading", {"source_marker": line}
    verse = VERSE.match(line)
    if verse:
        return "numbered_scripture_line", {
            "chapter_or_psalm": int(verse["chapter"]),
            "verse": int(verse["verse"]),
        }
    if ANTIPHON.match(line):
        return "antiphon_line", {}
    if VERSICLE.match(line):
        return "versicle_line", {}
    if RESPONSE.match(line):
        return "response_line", {}
    if NOCTURN.fullmatch(line):
        return "nocturn_heading", {}
    if LECTIO.fullmatch(line):
        return "lesson_heading", {"lesson": int(LECTIO.fullmatch(line)["index"])}
    if line in ("Orémus.", "Oremus."):
        return "prayer_invitation", {}
    if line.startswith("Benedictio."):
        return "blessing_line", {}
    if GLOSSARY.match(line):
        return "gloria_patri_line", {}
    if BARE_SOURCE.match(line):
        return "ferial_prayers_marker", {}
    if line.startswith("{") and line.endswith("}"):
        return "source_rubric_marker", {}
    if REFERENCE.fullmatch(line):
        return "scripture_reference", {}
    return "unclassified_source_line", {}


def project_hour(record: dict) -> dict:
    """One source-aligned 1960 Hour, with no output text not in the source."""
    hour = record["hour"]
    if hour not in HOURS:
        raise ValueError(f"Unknown 1960 canonical Hour: {hour}")
    if record.get("language") != "la" or record.get("rubrics") != "Rubrics 1960 - 1960":
        raise ValueError("Only pinned 1960 Latin generator records accepted")
    original = record["blocks"]
    if not original:
        raise ValueError("No source blocks")
    sections: list[dict] = []
    current: dict | None = None
    stats = Counter()
    source_count = 0
    for i, block in enumerate(original):
        if block["ordinal"] != i:
            raise ValueError(f"Nonconsecutive original block: {record['date']} {hour} #{i}")
        label = block.get("source_section_label")
        if label and label not in SECTION_KINDS and not LECTIO.fullmatch(label):
            raise ValueError(f"Unknown explicit upstream section marker: {label}")
        kind = "lesson" if label and LECTIO.fullmatch(label) else SECTION_KINDS.get(label, "untitled_source")
        if label or current is None or block.get("kind") == "heading":
            current = {
                "index": len(sections),
                "label": label,
                "kind": kind if label else (
                    "hour_title" if block.get("kind") == "heading" else "source_prelude"
                ),
                "label_provenance": "original_xhtml_bold" if label else "none",
                "source_blocks": [],
            }
            sections.append(current)
        tokens = []
        lines = block.get("lines")
        if not isinstance(lines, list) or not all(isinstance(t, str) and t for t in lines):
            raise ValueError(f"Original source lines missing: {record['date']} {hour} #{i}")
        for line_index, line in enumerate(lines):
            role, extra = line_role(line, label)
            token = {
                "type": role,
                "text": line,
                "source_block": block["ordinal"],
                "source_line": line_index,
                **extra,
            }
            tokens.append(token)
            stats[role] += 1
            source_count += 1
        current["source_blocks"].append({
            "ordinal": block["ordinal"],
            "source_tag": block["tag"],
            "source_attrs": block.get("attrs", {}),
            "source_section_label": label,
            "source_text": block["text"],
            "lines": tokens,
        })
    if sum(len(b["lines"]) for s in sections for b in s["source_blocks"]) != source_count:
        raise ValueError("Lost original line in semantic projection")
    if source_count != sum(len(block["lines"]) for block in original):
        raise ValueError("Projected source-line count does not match input")
    if not any(section["kind"] in ("psalmody", "psalmody_and_lessons") for section in sections):
        # Preserve as a flagged exception, never invent missing sections.
        stats["missing_explicit_psalmody_section"] += 1
    if not stats.get("psalm_heading"):
        stats["missing_source_psalm_headings"] += 1
    title = original[0]["text"].split(" ~ ", 1)[0]
    return {
        "schema": "ao.office.1960.source-anchored-semantic-hour.v1",
        "date": record["date"],
        "hour": hour,
        "title": title,
        "source": record["source"],
        "language": "la",
        "rubrics": record["rubrics"],
        "sections": sections,
        "token_counts": dict(sorted(stats.items())),
        "source_block_count": len(original),
        "source_line_count": source_count,
        "quality_gate": {
            "source_lines_preserved": True,
            "typed_source_markers": True,
            "source_classification_independently_verified": False,
            "liturgically_certified": False,
            "public_reader_authorized": False,
        },
    }


def import_year(source_dir: Path, output_dir: Path) -> dict:
    manifest = json.loads((source_dir / "manifest.json").read_text(encoding="utf8"))
    year = manifest["year"]
    c = manifest["coverage"]
    if not c["complete"] or c["expected_hour_instances"] != 8 * c["days"]:
        raise ValueError("Refusing semantic projection of incomplete annual Latin source")
    output_dir.mkdir(parents=True, exist_ok=True)
    yearly = Counter()
    kind_counts = Counter()
    role_counts = Counter()
    days = {}
    source_issues: list[dict] = []
    count = 0
    for month in range(1, 13):
        source_file = source_dir / f"office-{year}-{month:02d}-la-1960.jsonl.gz"
        semantic_file = output_dir / f"semantic-{year}-{month:02d}-la-1960.jsonl.gz"
        with gzip.open(source_file, "rt", encoding="utf8") as source:
            original = [json.loads(line) for line in source if line.strip()]
        with semantic_file.open("wb") as destination:
            with gzip.GzipFile(filename="", fileobj=destination, mode="wb", mtime=0) as compressed:
                for record in original:
                    projected = project_hour(record)
                    date, hour = projected["date"], projected["hour"]
                    count += 1
                    yearly[hour] += 1
                    kind_counts.update(s["kind"] for s in projected["sections"])
                    role_counts.update(projected["token_counts"])
                    if date not in days:
                        days[date] = {}
                    if hour in days[date]:
                        source_issues.append({"date": date, "hour": hour,
                                              "code": "DUPLICATED_DAY_HOUR"})
                    days[date][hour] = projected
                    if projected["token_counts"].get("missing_explicit_psalmody_section"):
                        source_issues.append({"date": date, "hour": hour,
                                              "code": "SOURCE_PSALMODY_LABEL_ABSENT"})
                    if projected["token_counts"].get("missing_source_psalm_headings"):
                        source_issues.append({"date": date, "hour": hour,
                                              "code": "SOURCE_PSALM_HEADING_ABSENT"})
                    compressed.write((json.dumps(projected, ensure_ascii=False,
                                                sort_keys=True, separators=(",", ":"))
                                      + "\n").encode("utf8"))
        for date, hours in sorted(days.items()):
            if date[5:7] != f"{month:02d}":
                continue
            if set(hours) != set(HOURS):
                source_issues.append({"date": date, "code": "INCOMPLETE_DAY",
                                      "hours": sorted(hours)})
            # Source-aligned data for the **internal** date/Hour reader only.
            # Do not copy these files into the production static Pages tree.
            p = output_dir / "reader" / date[:4] / date[5:7] / f"{date[8:10]}.json"
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(json.dumps({
                "schema": "ao.office.1960.private-day-preview.v1",
                "date": date,
                "language": "la",
                "hours": {h: hours[h] for h in HOURS if h in hours},
                "private_research_only": True,
                "public_reader_authorized": False,
            }, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf8")
    if count != c["expected_hour_instances"] or any(yearly[h] != c["days"] for h in HOURS):
        source_issues.append({"code": "ANNUAL_SEMANTIC_COVERAGE_MISMATCH",
                              "expected": c["expected_hour_instances"],
                              "actual": count, "counts": dict(yearly)})
    report = {
        "schema": "ao.office.1960.annual-semantic-source-audit.v1",
        "year": year, "rubrics": "Rubrics 1960 - 1960",
        "language": "la",
        "upstream_source": manifest["source"],
        "hours_expected": c["expected_hour_instances"],
        "hours_projected": count,
        "days_projected": len(days),
        "canonical_hour_counts": dict(sorted(yearly.items())),
        "explicit_section_type_counts": dict(sorted(kind_counts.items())),
        "source_line_token_counts": dict(sorted(role_counts.items())),
        "source_issues": source_issues,
        "source_issues_count": len(source_issues),
        "quality_gate": {
            "source_projection_complete": count == c["expected_hour_instances"]
            and len(days) == c["days"],
            "source_line_traceability": True,
            "liturgical_type_assignment_independently_validated": False,
            "independent_ordo_verified": False,
            "public_reader_authorized": False,
        },
    }
    (output_dir / "semantic-audit.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf8",
    )
    return report


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--parsed", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    report = import_year(args.parsed, args.output)
    q = report["quality_gate"]
    print(
        f"AO_OFFICE_ALL_HOURS_SEMANTIC_PROJECTED year={report['year']} "
        f"hours={report['hours_projected']} days={report['days_projected']} "
        f"typed_sections={sum(report['explicit_section_type_counts'].values())} "
        f"psalm_headings={report['source_line_token_counts'].get('psalm_heading', 0)} "
        f"source_issues={report['source_issues_count']} "
        f"complete={q['source_projection_complete']} certified=false published=false"
    )
    return 0 if q["source_projection_complete"] else 2


if __name__ == "__main__":
    sys.exit(main())
