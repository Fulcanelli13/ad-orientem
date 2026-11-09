#!/usr/bin/env python3
"""Independently compare *source-generated* 1960 Office with FSSPX's 1962 Ordo.

Not a license to publish or an independent full-Breviary certification:
the Ordo is a 1962 *calendar witness*, not a parallel source of 1961
printed prayers or of every ancient Roman Office rule.

Read only: a complete 730-day source research reader plus 2026/2027
independently generated universal-calendars. Retain both originals'
SHA-256 and all divergent dates without quietly substituting text.
"""
from __future__ import annotations

import argparse
from collections import Counter
import hashlib
import html
import json
from pathlib import Path
import re
import sys
import unicodedata

YEARS = (2026, 2027)
HOURS = ("Matutinum", "Laudes", "Prima", "Tertia",
         "Sexta", "Nona", "Vespera", "Completorium")
SOURCE_PIN = "126a07f91ede04664108abb6fb20ace3f4de14b9"
SOURCE_URL = "https://ordo.fsspx.org/api/v1/export/json"
ROMAN_RANK = re.compile(r"~\s*(I|II|III|IV)\.?\s*classis", re.IGNORECASE)
RANKS = {"I": "1", "II": "2", "III": "3", "IV": "4"}
SPECIAL_DATES = {
    ("2026-04-02", "2026-04-03", "2026-04-04", "2026-11-02"),
    ("2027-03-25", "2027-03-26", "2027-03-27", "2027-11-02"),
}
VALID_DATE = re.compile(r"^202[67]-\d{2}-\d{2}$")


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def compact_name(name: str) -> str:
    if not isinstance(name, str):
        return ""
    # Literal spelling similarity is *context*, not a calendar verdict.
    clean = re.sub(r"<[^>]*>", " ", html.unescape(name))
    clean = unicodedata.normalize("NFKD", clean)
    return " ".join("".join(
        char for char in clean.casefold() if not unicodedata.combining(char)
    ).split())


def reader_title_and_rank(record: dict) -> tuple[str, str | None]:
    title = record["title"]
    first_section = record["sections"][0]["source_blocks"][0]
    first_line = first_section["lines"][0]["text"]
    match = ROMAN_RANK.search(first_line)
    return title, RANKS[match[1].upper()] if match else None


def load_independent_calendar(file: Path, year: int) -> dict:
    root = json.loads(file.read_text(encoding="utf8"))
    if not isinstance(root, dict) or root.get("year") != year or (
        root.get("count") != 365 or root.get("mode") != "civil" or
        root.get("lang") not in ("la", "en")
    ):
        raise ValueError(f"INDEPENDENT_ORDO_WRONG_YEAR_MODE_OR_SCOPE:{year}")
    # There are no local or congregational propers in a universal
    # 1960 comparison. If requested flags were ignored by the external
    # provider, do not silently relabel it as a universal calendar.
    if root.get("congregation") not in ("", None):
        raise ValueError("INDEPENDENT_ORDO_CONGREGATIONAL_PROPER_UNEXPECTED")
    if root.get("source") not in ("", None):
        raise ValueError("INDEPENDENT_ORDO_LOCAL_PROPER_UNEXPECTED")
    days = root.get("days")
    if not isinstance(days, list) or len(days) != 365:
        raise ValueError(f"INDEPENDENT_ORDO_365_DATES_REQUIRED:{year}")
    result = {}
    for row in days:
        date = row.get("date")
        if not isinstance(date, str) or not VALID_DATE.fullmatch(date) or (
            not date.startswith(f"{year}-") or date in result
        ):
            raise ValueError(f"INDEPENDENT_ORDO_DATE_INVALID_OR_DUPLICATE:{date}")
        feast = row.get("celebration")
        if not isinstance(feast, dict) or feast.get("id") is None or (
            str(feast.get("rank")) not in ("1", "2", "3", "4", "7")
        ):
            raise ValueError(f"INDEPENDENT_ORDO_PRINCIPAL_MISSING:{date}")
        vespers = row.get("vespers")
        if vespers is not None and (
            not isinstance(vespers, dict) or vespers.get("id") is None
        ):
            raise ValueError(f"INDEPENDENT_ORDO_VESPERS_UNREADABLE:{date}")
        result[date] = row
    return {
        "year": year,
        "days": result,
        "source_file_sha256": sha(file),
        "witness_generated": root.get("generated"),
        "calendar_source": root.get("source"),
        "congregation": root.get("congregation"),
        "language": root.get("lang"),
        "mode": root.get("mode"),
    }


def load_hour_source(root: Path, date: str) -> dict:
    year, month, day = date.split("-")
    path = root / year / month / (day + ".json")
    if not path.is_file():
        raise ValueError(f"PINNED_OFFICE_SOURCE_DATE_MISSING:{date}")
    content = json.loads(path.read_text(encoding="utf8"))
    if content.get("date") != date or content.get("private_research_only") is not True or (
        content.get("public_reader_authorized") is not False or
        set(content.get("hours", {})) != set(HOURS)
    ):
        raise ValueError(f"INCOMPLETE_OR_PUBLICLY_AUTHORIZED_OFFICE_SOURCE:{date}")
    for hour, body in content["hours"].items():
        if body.get("date") != date or body.get("hour") != hour or (
            body.get("source", {}).get("revision") != SOURCE_PIN
        ) or body.get("quality_gate", {}).get("public_reader_authorized") is not False:
            raise ValueError(f"OFFICE_SOURCE_REVISION_OR_READER_GATE_MISMATCH:{date}:{hour}")
    return content["hours"]


def compare(private_reader: Path, calendar_files: dict[int, Path]) -> dict:
    if not all((private_reader / str(y)).is_dir() for y in YEARS):
        raise ValueError("TWO_YEAR_SOURCE_READER_REQUIRED")
    config = json.loads((private_reader / "config.json").read_text(encoding="utf8"))
    if config.get("schema") != "ao.office.1960.private-reader-index.v1" or (
        config.get("source_revision") != SOURCE_PIN or
        config.get("total_days") != 730 or config.get("total_hours") != 5840 or
        config.get("public_reader_authorized") is not False
    ):
        raise ValueError("PRIVATE_730_DAY_SOURCE_READER_INTEGRITY_FAILED")
    originals = {year: load_independent_calendar(calendar_files[year], year)
                 for year in YEARS}
    witness_dates = {day: row for year in YEARS
                     for day, row in originals[year]["days"].items()}
    rows = []
    issues = Counter()
    switch_count = Counter()
    rank_count = Counter()
    commemoration_count = 0
    source_rank_unreadable = 0
    for date in sorted(witness_dates):
        row = witness_dates[date]
        hours = load_hour_source(private_reader, date)
        morning = hours["Matutinum"]
        evening = hours["Vespera"]
        compline = hours["Completorium"]
        morning_title, morning_rank = reader_title_and_rank(morning)
        evening_title, _ = reader_title_and_rank(evening)
        compline_title, _ = reader_title_and_rank(compline)
        source_evening_switch = morning_title != evening_title
        ordo_evening = row.get("vespers")
        ordo_evening_switch = ordo_evening is not None and (
            ordo_evening["id"] != row["celebration"]["id"]
        )
        observations = []
        def flag(value: str) -> None:
            observations.append(value)
            issues[value] += 1
        if source_evening_switch != ordo_evening_switch:
            flag("INDEPENDENT_VESPERS_PRECEDENCE_DISAGREEMENT_REVIEW")
        else:
            switch_count["concordant"] += 1
        if source_evening_switch:
            switch_count["divinum_officium"] += 1
        if ordo_evening_switch:
            switch_count["independent_ordo"] += 1
            # Unlike names, celebration IDs are stable across the two
            # adjoining FSSPX day objects. This is a stronger control.
            following = row["date"]
            tomorrow = None
            # dates are lexical ISO; date addition in Python, no timezone
            from datetime import date as Date, timedelta
            following = (Date.fromisoformat(following) + timedelta(days=1)).isoformat()
            tomorrow = witness_dates.get(following)
            if tomorrow is None:
                observations.append("CROSS_YEAR_ORDO_TOMORROW_OUT_OF_SCOPE")
            elif tomorrow["celebration"]["id"] != ordo_evening["id"]:
                flag("INDEPENDENT_VESPERS_NOT_NEXT_DAY_PRINCIPAL_REVIEW")
        if evening_title != compline_title:
            flag("OFFICE_VESPERS_COMPLINE_TITLE_DIVERGENCE_REVIEW")
        other_rank = str(row["celebration"].get("rank"))
        if morning_rank is None:
            source_rank_unreadable += 1
        elif morning_rank == other_rank:
            rank_count["concordant"] += 1
        else:
            flag("INDEPENDENT_RANK_DISAGREEMENT_REVIEW")
            rank_count["disagreed"] += 1
        if row["celebration"].get("transferred") is True:
            flag("INDEPENDENT_TRANSFERRED_FEAST_REQUIRES_REVIEW")
        commemorations = row.get("commemorations") or []
        if commemorations:
            commemoration_count += 1
        vespers_mem = row.get("vespersCommemoration")
        if vespers_mem:
            flag("INDEPENDENT_VESPERS_COMMEMORATION_REVIEW")
        if date in {d for group in SPECIAL_DATES for d in group}:
            flag("SPECIAL_TRIDUUM_OR_ALL_SOULS_SOURCE_FORMAT_REVIEW")
        if not observations and not (morning_rank is None):
            disposition = "SOURCE_CALENDAR_CHECKS_CONCORDANT_NOT_CERTIFIED"
        else:
            disposition = "INDEPENDENT_WITNESS_REVIEW_REQUIRED"
        rows.append({
            "date": date,
            "year": int(date[:4]),
            "status": disposition,
            "divinum_officium": {
                "morning_title": morning_title,
                "vespers_title": evening_title,
                "completorium_title": compline_title,
                "source_rank": morning_rank,
                "evening_title_switch": source_evening_switch,
                "matins_xhtml_sha256": morning["source"]["xhtml_sha256"],
                "vespers_xhtml_sha256": evening["source"]["xhtml_sha256"],
                "completorium_xhtml_sha256": compline["source"]["xhtml_sha256"],
            },
            "independent_1962_calendar": {
                "principal_id": row["celebration"]["id"],
                "principal_name": row["celebration"].get("name"),
                "principal_rank": other_rank,
                "kind": row["celebration"].get("kind"),
                "transferred": row["celebration"].get("transferred"),
                "evening_vespers_id": ordo_evening["id"] if ordo_evening else None,
                "evening_vespers_name": ordo_evening.get("name") if ordo_evening else None,
                "evening_title_switch": ordo_evening_switch,
                "commemorations_count": len(commemorations),
                "vespers_commemoration": bool(vespers_mem),
                "season": row.get("season"),
                "marian": row.get("marian"),
            },
            "observations": observations,
            "liturgically_certified": False,
            "public_reader_authorized": False,
        })
    if len(rows) != 730:
        raise ValueError(f"ANNUAL_ORDO_COMPARE_EXPECTED_730_ACTUAL_{len(rows)}")
    review = [row for row in rows if row["status"] == "INDEPENDENT_WITNESS_REVIEW_REQUIRED"]
    return {
        "schema": "ao.office.1960-1962.annual-independent-ordo-concordance.v1",
        "status": "SOURCE_COMPARISON_RESEARCH_ONLY",
        "years": list(YEARS),
        "days_compared": len(rows),
        "hours_source_verified": 8 * len(rows),
        "source": {"repository": "DivinumOfficium/divinum-officium",
                   "revision": SOURCE_PIN,
                   "reader_source": "GitHub Actions annual archive",
                   "reader_public": False},
        "independent_witness": {
            "publisher": "FSSPX Ordo",
            "canonical_scope": "UNIVERSAL_CALENDAR_ONLY",
            "api": SOURCE_URL,
            "basis": "1962 Roman Missal calendar, not independent 1961 Breviary collation",
            "annual": {
                str(year): {
                    "original_json_sha256": original["source_file_sha256"],
                    "generated": original["witness_generated"],
                    "language": original["language"],
                    "source": original["calendar_source"],
                    "congregation": original["congregation"],
                } for year, original in originals.items()
            },
        },
        "summary": {
            "days_compared": len(rows),
            "source_vespers_transitions": switch_count["divinum_officium"],
            "independent_vespers_transitions": switch_count["independent_ordo"],
            "evening_switch_concordant_dates": switch_count["concordant"],
            "source_principal_ranks_compared": sum(rank_count.values()),
            "rank_concordant": rank_count["concordant"],
            "rank_disagreed": rank_count["disagreed"],
            "source_rank_unreadable": source_rank_unreadable,
            "days_with_independent_commemorations": commemoration_count,
            "dates_flagged_for_review": len(review),
            "issue_counts": dict(sorted(issues.items())),
        },
        "research_queue": review,
        "quality_gate": {
            "both_independent_years_witnessed": True,
            "all_730_dates_and_5840_hours_verified_for_source_integrity": True,
            "calendar_disagreements_reviewed": False,
            "original_1961_breviary_collation_completed": False,
            "public_reader_authorized": False,
        },
    }


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--reader", required=True, type=Path)
    p.add_argument("--ordo-2026", required=True, type=Path)
    p.add_argument("--ordo-2027", required=True, type=Path)
    p.add_argument("--output", required=True, type=Path)
    args = p.parse_args()
    report = compare(args.reader, {2026: args.ordo_2026, 2027: args.ordo_2027})
    args.output.mkdir(parents=True, exist_ok=True)
    (args.output / "concordance.json").write_text(
        json.dumps(report, indent=2, sort_keys=True, ensure_ascii=False) + "\n",
        encoding="utf8",
    )
    (args.output / "summary.json").write_text(
        json.dumps({key: value for key, value in report.items()
                    if key != "research_queue"},
                   indent=2, sort_keys=True, ensure_ascii=False) + "\n",
        encoding="utf8",
    )
    q = report["summary"]
    print("AO_OFFICE_INDEPENDENT_ORDO_ANNUAL_RESEARCH "
          f"days={q['days_compared']} hours={report['hours_source_verified']} "
          f"morning_ranks_compared={q['source_principal_ranks_compared']} "
          f"rank_agreement={q['rank_concordant']} "
          f"source_vespers_transitions={q['source_vespers_transitions']} "
          f"independent_vespers_transitions={q['independent_vespers_transitions']} "
          f"evening_switch_concordant={q['evening_switch_concordant_dates']} "
          f"review_dates={q['dates_flagged_for_review']} "
          "certified=false published=false")
    return 0


if __name__ == "__main__":
    sys.exit(main())
