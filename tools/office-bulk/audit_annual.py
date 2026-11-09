#!/usr/bin/env python3
"""Build a source-anchored, research-only full-year Divine Office structure audit.

This does NOT certify rubrical choices or public prayer-event boundaries.
Every finding links to the exact dated Hour and original XHTML Git SHA.
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
import gzip
import json
from pathlib import Path


def title(block: dict) -> str:
    # The original EPUB generator's first <p> begins with its
    # dated principal Office; the '~' separates its class.
    value = (block or {}).get("text", "")
    return value.split(" ~ ", 1)[0].strip()


def audit_directory(root: Path) -> dict:
    manifest = json.loads((root / "manifest.json").read_text(encoding="utf-8"))
    year = manifest["year"]
    source = manifest["source"]["revision"]
    coverage = manifest["coverage"]
    expected = coverage["expected_hour_instances"]
    bydate: dict[str, dict[str, dict]] = defaultdict(dict)
    sections = Counter()
    sections_by_hour = defaultdict(Counter)
    source_blocks = Counter()
    lines_total = 0
    records_seen = 0
    errors: list[dict] = []
    for month in range(1, 13):
        path = root / f"office-{year}-{month:02d}-la-1960.jsonl.gz"
        if not path.is_file():
            errors.append({"code": "MISSING_MONTHLY_SOURCE_FILE", "month": month})
            continue
        with gzip.open(path, "rt", encoding="utf-8") as stream:
            for line in stream:
                if not line.strip():
                    continue
                row = json.loads(line)
                date, hour = row["date"], row["hour"]
                if date in bydate and hour in bydate[date]:
                    errors.append({"code": "DUPLICATE_DATED_HOUR", "date": date, "hour": hour})
                    continue
                records_seen += 1
                if row["source"]["revision"] != source:
                    errors.append({"code": "SOURCE_REVISION_MISMATCH", "date": date, "hour": hour})
                blocks = row["blocks"]
                if not blocks:
                    errors.append({"code": "NO_SOURCE_BLOCKS", "date": date, "hour": hour})
                    continue
                bydate[date][hour] = {
                    "title": title(blocks[0]),
                    "raw_xhtml_sha256": row["source"]["xhtml_sha256"],
                    "source_epub_entry": row["source"]["epub_entry"],
                }
                for block in blocks:
                    label = block.get("source_section_label")
                    if label is not None:
                        sections[label] += 1
                        sections_by_hour[hour][label] += 1
                    source_blocks[block.get("kind", "untyped_source_block")] += 1
                    lines_total += len(block.get("lines", []))
    if records_seen != expected:
        errors.append({
            "code": "ANNUAL_HOUR_INSTANCE_MISMATCH",
            "expected": expected, "actual": records_seen,
        })
    transitions = []
    divergence = []
    orphans = []
    for day in sorted(bydate):
        rows = bydate[day]
        if len(rows) != 8:
            orphans.append({"date": day, "hours_present": sorted(rows)})
            continue
        matins = rows["Matutinum"]["title"]
        vespers = rows["Vespera"]["title"]
        compline = rows["Completorium"]["title"]
        if vespers != matins:
            transitions.append({
                "civil_date": day,
                "matins_office": matins,
                "vespers_office": vespers,
                "completorium_office": compline,
                "source_vespers_xhtml_sha256": rows["Vespera"]["raw_xhtml_sha256"],
                "source_compline_xhtml_sha256": rows["Completorium"]["raw_xhtml_sha256"],
                "classification": "FIRST_VESPERS_OR_OTHER_EVENING_PRECEDENCE_REVIEW",
            })
        if compline != vespers:
            divergence.append({
                "civil_date": day,
                "vespers_office": vespers,
                "completorium_office": compline,
                "code": "EVENING_COMPLINE_OFFICE_TITLE_DIVERGENCE_REVIEW",
            })
    report = {
        "schema": "ao.office.1960.annual-structure-research-audit.v1",
        "year": year,
        "language": "la",
        "rubrics": "Rubrics 1960 - 1960",
        "source_revision": source,
        "source_epub_sha256": manifest["source"]["yearly_epub_sha256"],
        "source_records": records_seen,
        "days_with_eight_hours": sum(len(rows) == 8 for rows in bydate.values()),
        "source_block_counts": dict(sorted(source_blocks.items())),
        "source_line_count": lines_total,
        "explicit_generator_section_labels": dict(sorted(sections.items())),
        "section_labels_by_hour": {
            hour: dict(sorted(counts.items())) for hour, counts in sorted(sections_by_hour.items())
        },
        "evening_office_transitions": transitions,
        "evening_office_transition_count": len(transitions),
        "vespers_compline_title_divergences": divergence,
        "missing_hour_sets": orphans,
        "structural_issues": errors,
        "quality_gate": {
            "source_structure_audited": not errors and not orphans,
            "source_hymn_psalm_lesson_boundaries_certified": False,
            "independent_ordo_review_complete": False,
            "public_reader_authorized": False,
        },
    }
    (root / "structure-audit.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    return report


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--parsed", type=Path, required=True)
    args = parser.parse_args()
    report = audit_directory(args.parsed)
    print(
        f"AO_OFFICE_SOURCE_STRUCTURE_AUDIT year={report['year']} "
        f"hours={report['source_records']} days_with_eight_hours={report['days_with_eight_hours']} "
        f"evening_transitions={report['evening_office_transition_count']} "
        f"vespers_compline_divergences={len(report['vespers_compline_title_divergences'])} "
        f"explicit_labels={sum(report['explicit_generator_section_labels'].values())} "
        f"issues={len(report['structural_issues'])} certified=false published=false"
    )
    return 0 if (not report["structural_issues"] and not report["missing_hour_sets"]) else 2


if __name__ == "__main__":
    raise SystemExit(main())
