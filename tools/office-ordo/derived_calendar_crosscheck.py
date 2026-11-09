#!/usr/bin/env python3
"""Two-year Roman 1962 date/rank source consistency check (NOT independent).

The Ambo calendar is a separately packaged *derived Divinum Officium*
dataset. Its independent implementation/translation is useful for
identifying divergences, but agreement is NEVER independent rubrical
certification. No Vespers structure exists in this dataset.
"""
from __future__ import annotations

import argparse
from collections import Counter
import json
from pathlib import Path
import sys

from independent_ordo_concordance import (
    HOURS, SOURCE_PIN, YEARS, load_hour_source, reader_title_and_rank, sha
)

AMBO_REPO = "igorlaguiar/ambo-liturgical-calendars"
AMBO_COMMIT = "af4a22a4014e9a46cadafc4c2ede4aa784f5a6f2"
AMBO_BLOBS = {
    2026: "62eba8c1d0f410eb446c89d1cfb030e07529b3f8",
    2027: "923ad8de7f9b09a9746402c9560031ec79b1b565",
}
SPECIAL_SOURCE_FORMAT = {
    "2026-04-02", "2026-04-03", "2026-04-04", "2026-11-02",
    "2027-03-25", "2027-03-26", "2027-03-27", "2027-11-02",
}
CODES = {"class-1": "1", "class-2": "2", "class-3": "3", "class-4": "4"}


def load_derived_calendar(file: Path, year: int) -> dict:
    raw = json.loads(file.read_text(encoding="utf-8"))
    if not isinstance(raw, dict) or raw.get("schemaVersion") != 1 or (
        raw.get("form") != "1962" or raw.get("calendar") != "general-roman"
        or raw.get("year") != year
    ):
        raise ValueError("DERIVED_CALENDAR_UNTRUSTED_SCOPE")
    rows = raw.get("days")
    if not isinstance(rows, list) or len(rows) != 365:
        raise ValueError("DERIVED_CALENDAR_INCOMPLETE_YEAR")
    dates = {}
    for row in rows:
        d = row.get("date")
        feast = row.get("celebration")
        if (not isinstance(d, str) or not d.startswith(f"{year}-")
            or d in dates or not isinstance(feast, dict)
            or not isinstance(feast.get("rank"), dict)):
            raise ValueError("DERIVED_CALENDAR_INVALID_DAY_OR_DUPLICATE")
        dates[d] = row
    return {"days": dates, "original_sha256": sha(file),
            "schemaVersion": raw.get("schemaVersion")}


def compare_derived(private_reader: Path, calendars: dict[int, Path]) -> dict:
    config = json.loads((private_reader/"config.json").read_text(encoding="utf8"))
    if (config.get("schema") != "ao.office.1960.private-reader-index.v1"
        or config.get("source_revision") != SOURCE_PIN
        or config.get("total_days") != 730
        or config.get("total_hours") != 5840
        or config.get("public_reader_authorized") is not False):
        raise ValueError("PRIVATE_SOURCE_READER_730_DATES_REQUIRED")
    imported = {year: load_derived_calendar(calendars[year], year)
                for year in YEARS}
    counts = Counter()
    review_queue = []
    rows = []
    for year in YEARS:
        for date, witness in sorted(imported[year]["days"].items()):
            hours = load_hour_source(private_reader, date)
            principal = hours["Matutinum"]
            title, original_rank = reader_title_and_rank(principal)
            witness_rank_code = witness["celebration"]["rank"].get("code")
            witness_rank = CODES.get(witness_rank_code)
            issues = []
            def flag(item: str) -> None:
                issues.append(item)
                counts[item] += 1
            if original_rank is None:
                flag("ORIGINAL_OFFICE_SOURCE_RANK_NOT_MACHINE_READABLE")
            elif witness_rank is None:
                flag("DERIVED_1962_CALENDAR_RANK_UNKNOWN")
            elif original_rank != witness_rank:
                flag("SOURCE_RANK_CROSSCHECK_DISAGREEMENT")
            else:
                counts["rank_concordant"] += 1
            morning_title = hours["Matutinum"]["title"]
            evening_title = hours["Vespera"]["title"]
            compline_title = hours["Completorium"]["title"]
            evening_changed = morning_title != evening_title
            if evening_changed:
                counts["source_evening_office_transitions"] += 1
            if evening_title != compline_title:
                flag("SOURCE_VESPERS_COMPLINE_TITLE_DIVERGENCE")
            alternatives = witness.get("alternatives") or []
            if not isinstance(alternatives, list):
                flag("DERIVED_ALTERNATIVES_NOT_A_LIST")
                alternatives = []
            if alternatives:
                counts["dates_with_derived_commemorations"] += 1
            if date in SPECIAL_SOURCE_FORMAT:
                flag("PRINTED_TRIDUUM_OR_ALL_SOULS_REVIEW_REQUIRED")
            row = {
                "date": date,
                "source_1960_latin": {
                    "office_title": title, "office_class": original_rank,
                    "vespers_office_title": evening_title,
                    "completorium_office_title": compline_title,
                    "evening_title_transition": evening_changed,
                    "matins_xhtml_sha256": principal["source"]["xhtml_sha256"],
                    "vespers_xhtml_sha256": hours["Vespera"]["source"]["xhtml_sha256"],
                },
                "derived_1962_english": {
                    "celebration": witness["celebration"]["title"].get("en"),
                    "rank_code": witness_rank_code,
                    "liturgical_season": witness.get("season", {}).get("code"),
                    "alternatives_count": len(alternatives),
                },
                "observations": issues,
                "english_latin_names_independently_matched": False,
                "independent_ordo_validated": False,
                "published": False,
            }
            rows.append(row)
            if issues:
                review_queue.append(row)
    if len(rows) != 730:
        raise ValueError("TWO_YEAR_DERIVED_CALENDAR_730_DAY_CHECK_FAILED")
    return {
        "schema": "ao.office.1960.source-derived-calendar-consistency.v1",
        "status": "RESEARCH_ONLY_INDEPENDENCE_NOT_ESTABLISHED",
        "source_hours_checked": 5840,
        "civil_days_checked": len(rows),
        "original_office_source": {
            "repository": "DivinumOfficium/divinum-officium",
            "revision": SOURCE_PIN,
        },
        "derived_calendar": {
            "repository": AMBO_REPO,
            "commit": AMBO_COMMIT,
            "original_git_blobs": {str(y): AMBO_BLOBS[y] for y in YEARS},
            "json_sha256": {str(y): imported[y]["original_sha256"] for y in YEARS},
            "calendar": "general-roman", "form": "1962", "languages": ["en"],
            "ultimate_calendar_source": "Divinum Officium (as acknowledged by Ambo)",
            "independent": False,
        },
        "summary": {
            "dates_compared": len(rows),
            "concordant_machine_ranks": counts["rank_concordant"],
            "machine_rank_disagreements": counts["SOURCE_RANK_CROSSCHECK_DISAGREEMENT"],
            "source_rank_unreadable": counts["ORIGINAL_OFFICE_SOURCE_RANK_NOT_MACHINE_READABLE"],
            "derived_rank_unknown": counts["DERIVED_1962_CALENDAR_RANK_UNKNOWN"],
            "source_evening_office_transitions": counts["source_evening_office_transitions"],
            "dates_with_derived_commemorations": counts["dates_with_derived_commemorations"],
            "distinct_review_dates": len(review_queue),
            "issue_counts": dict(sorted(counts.items())),
        },
        "queue": review_queue,
        "quality_gate": {
            "source_calendar_consistency_checked": True,
            "independent_ordo_witness_confirmed": False,
            "original_1961_breviary_independently_collated": False,
            "public_reader_authorized": False,
        },
    }


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--reader", required=True, type=Path)
    p.add_argument("--calendar-2026", required=True, type=Path)
    p.add_argument("--calendar-2027", required=True, type=Path)
    p.add_argument("--output", required=True, type=Path)
    args = p.parse_args()
    result = compare_derived(args.reader, {
        2026: args.calendar_2026, 2027: args.calendar_2027,
    })
    args.output.mkdir(parents=True, exist_ok=True)
    (args.output/"derived-calendar-crosscheck.json").write_text(
        json.dumps(result, sort_keys=True, indent=2, ensure_ascii=False)+"\n",encoding="utf8")
    report = {key: value for key, value in result.items() if key != "queue"}
    (args.output/"summary.json").write_text(
        json.dumps(report, sort_keys=True, indent=2, ensure_ascii=False)+"\n",encoding="utf8")
    n = result["summary"]
    print(f"AO_OFFICE_DERIVED_CALENDAR_CROSSCHECK days={n['dates_compared']} "
          f"hours={result['source_hours_checked']} "
          f"rank_agreement={n['concordant_machine_ranks']} "
          f"rank_mismatch={n['machine_rank_disagreements']} "
          f"rank_unreadable={n['source_rank_unreadable']} "
          f"review_dates={n['distinct_review_dates']} "
          "independent=false public=false")
    return 0


if __name__ == "__main__":
    sys.exit(main())
