#!/usr/bin/env python3
"""Import a pinned Divinum Officium 1960 Latin yearly EPUB into research records.

No network, no rubrical inference and no public-reader authorization. Uses
Python's standard library only. The original EPUB is retained independently
by CI so every parsed block can be reconciled to source XHTML.
"""
from __future__ import annotations

import argparse
import calendar
import datetime as dt
import gzip
import hashlib
import html
from html.parser import HTMLParser
import json
from pathlib import Path, PurePosixPath
import re
import sys
import zipfile

HOURS = (
    "Matutinum", "Laudes", "Prima", "Tertia",
    "Sexta", "Nona", "Vespera", "Completorium",
)
ENTRY = re.compile(
    r"^(?P<month>\d{2})-(?P<day>\d{2})-(?P<year>\d{4})-"
    r"(?P<index>[1-8])-(?P<hour>[A-Za-z]+)\.html$"
)
BLOCK_TAGS = frozenset(("h1", "h2", "h3", "h4", "h5", "p", "li", "pre", "blockquote", "td"))
NAVIGATION = frozenset(HOURS)
SOURCE = "DivinumOfficium/divinum-officium"
MAX_ENTRY_BYTES = 4 * 1024 * 1024
MAX_TOTAL_BYTES = 1024 * 1024 * 1024


def normalize(value: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(value)).strip()


class OfficeTextParser(HTMLParser):
    """Preserve ordered display blocks, not invented liturgical boundaries."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.in_body = False
        self.suppressed = 0
        self.active = None
        self.blocks: list[dict] = []
        self.body_parts: list[str] = []
        self.found_body = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        if tag == "body":
            self.found_body = self.in_body = True
            return
        if not self.in_body:
            return
        if tag in ("script", "style"):
            self.suppressed += 1
            return
        if self.suppressed:
            return
        if tag in BLOCK_TAGS and self.active is None:
            attr = {k: v for k, v in attrs if k in ("class", "id", "align")}
            self.active = {"tag": tag, "attrs": attr, "parts": []}
        elif tag in ("br", "hr") and self.active is not None:
            self.active["parts"].append(" ")

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag in ("script", "style") and self.suppressed:
            self.suppressed -= 1
            return
        if self.suppressed:
            return
        if self.active is not None and tag == self.active["tag"]:
            candidate = self.active
            value = normalize("".join(candidate["parts"]))
            if value and not self._is_navigation(value):
                self.blocks.append({
                    "ordinal": len(self.blocks),
                    "tag": candidate["tag"],
                    "kind": "heading" if candidate["tag"].startswith("h") else "source_block",
                    "attrs": candidate["attrs"],
                    "text": value,
                })
            self.active = None
        if tag == "body":
            self.in_body = False

    def handle_data(self, data: str) -> None:
        if self.in_body and not self.suppressed:
            self.body_parts.append(data)
            if self.active is not None:
                self.active["parts"].append(data)

    @staticmethod
    def _is_navigation(text: str) -> bool:
        # The EPUB generator appends the same eight internal Hour links
        # to each chapter. They must not masquerade as liturgical content.
        return sum(name in text for name in NAVIGATION) >= 6

    def finish(self) -> tuple[list[dict], str]:
        if self.active is not None:
            value = normalize("".join(self.active["parts"]))
            if value and not self._is_navigation(value):
                self.blocks.append({
                    "ordinal": len(self.blocks),
                    "tag": self.active["tag"],
                    "kind": "source_block",
                    "attrs": self.active["attrs"],
                    "text": value,
                })
        return self.blocks, normalize(" ".join(self.body_parts))


def expected_entries(year: int, first: dt.date, last: dt.date) -> dict[str, tuple[str, str]]:
    expected: dict[str, tuple[str, str]] = {}
    current = first
    while current <= last:
        for index, hour in enumerate(HOURS, 1):
            name = f"{current.month:02d}-{current.day:02d}-{year}-{index}-{hour}.html"
            expected[name] = (current.isoformat(), hour)
        current += dt.timedelta(days=1)
    return expected


def digest_file(path: Path) -> str:
    sha = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            sha.update(chunk)
    return sha.hexdigest()


def analyze_epub(epub: Path, year: int, revision: str, out: Path,
                 first: dt.date | None = None, last: dt.date | None = None) -> dict:
    if not epub.is_file():
        raise ValueError(f"EPUB does not exist: {epub}")
    first = first or dt.date(year, 1, 1)
    last = last or dt.date(year, 12, 31)
    if first.year != year or last.year != year or last < first:
        raise ValueError("Date bounds must be within the selected year and ordered")
    full_year = first == dt.date(year, 1, 1) and last == dt.date(year, 12, 31)
    expected = expected_entries(year, first, last)
    seen: dict[str, tuple[str, str, bytes]] = {}
    issues: list[dict] = []
    total_uncompressed = 0
    with zipfile.ZipFile(epub) as archive:
        for entry in archive.infolist():
            if entry.is_dir() or not entry.filename.lower().endswith(".html"):
                continue
            name = PurePosixPath(entry.filename).name
            match = ENTRY.fullmatch(name)
            if match is None or name not in expected:
                continue
            if (int(match["index"]) - 1 >= len(HOURS)
                    or HOURS[int(match["index"]) - 1] != match["hour"]):
                issues.append({"entry": name, "code": "HOUR_FILENAME_MISMATCH"})
                continue
            if name in seen:
                issues.append({"entry": name, "code": "DUPLICATE_CHAPTER"})
                continue
            if entry.file_size > MAX_ENTRY_BYTES:
                issues.append({"entry": name, "code": "OVERSIZE_CHAPTER", "size": entry.file_size})
                continue
            total_uncompressed += entry.file_size
            if total_uncompressed > MAX_TOTAL_BYTES:
                raise ValueError("Uncompressed Office data exceeds safety limit")
            try:
                content = archive.read(entry)
            except (OSError, RuntimeError, zipfile.BadZipFile) as error:
                issues.append({"entry": name, "code": "UNREADABLE_CHAPTER", "detail": str(error)})
                continue
            seen[name] = (expected[name][0], expected[name][1], content)

    grouped: dict[int, list[dict]] = {month: [] for month in range(1, 13)}
    hour_counts = {hour: 0 for hour in HOURS}
    valid = set()
    for name, (date, hour) in sorted(expected.items(), key=lambda pair: (pair[1][0], HOURS.index(pair[1][1]))):
        if name not in seen:
            issues.append({"entry": name, "date": date, "hour": hour, "code": "MISSING_HOUR"})
            continue
        _, _, source_bytes = seen[name]
        try:
            source_html = source_bytes.decode("utf-8-sig")
            parser = OfficeTextParser()
            parser.feed(source_html)
            blocks, raw_body = parser.finish()
        except (UnicodeError, ValueError) as error:
            issues.append({"entry": name, "date": date, "hour": hour,
                           "code": "INVALID_SOURCE_HTML", "detail": str(error)})
            continue
        if not parser.found_body or len(raw_body) < 90 or len(blocks) < 2:
            issues.append({"entry": name, "date": date, "hour": hour,
                           "code": "INCOMPLETE_OR_EMPTY_HOUR",
                           "visible_characters": len(raw_body),
                           "blocks": len(blocks)})
            continue
        if any(token in raw_body for token in (
            "Internal Server Error", "500 Internal Server Error",
            "CGI Error: Premature end of script headers",
        )):
            issues.append({"entry": name, "date": date, "hour": hour,
                           "code": "GENERATOR_ERROR_BODY"})
            continue
        record = {
            "schema": "ao.office.1960.generated-latin-hour.v1",
            "date": date,
            "hour": hour,
            "language": "la",
            "rubrics": "Rubrics 1960 - 1960",
            "source": {
                "repository": SOURCE,
                "revision": revision,
                "generator": "standalone/tools/epubgen2/epubgen2.sh",
                "epub_entry": name,
                "xhtml_sha256": hashlib.sha256(source_bytes).hexdigest(),
                "traceability": "Retain original yearly EPUB alongside these parsed records",
            },
            # HTML structure is kept as ordered blocks; labels such as
            # psalm/antiphon/lesson are NOT inferred from typography.
            "blocks": blocks,
            "plain_text": normalize(" ".join(block["text"] for block in blocks)),
            "review": {
                "text_extracted": True,
                "liturgical_classification_certified": False,
                "independent_text_collation_certified": False,
                "public_reader_authorized": False,
                "translation_certified": False,
            },
        }
        grouped[int(date[5:7])].append(record)
        hour_counts[hour] += 1
        valid.add(name)

    out.mkdir(parents=True, exist_ok=True)
    for month, records in grouped.items():
        dest = out / f"office-{year}-{month:02d}-la-1960.jsonl.gz"
        with dest.open("wb") as output:
            with gzip.GzipFile(filename="", fileobj=output, mode="wb", mtime=0) as compressed:
                for row in records:
                    compressed.write(
                        (json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n").encode("utf-8")
                    )
    missing = len(expected) - len(valid)
    report = {
        "schema": "ao.office.1960.annual-extraction-manifest.v1",
        "year": year,
        "language": "la",
        "rubrics": "Rubrics 1960 - 1960",
        "source": {"repository": SOURCE, "revision": revision,
                   "yearly_epub_sha256": digest_file(epub),
                   "yearly_epub_name": epub.name},
        "coverage": {
            "first": first.isoformat(), "last": last.isoformat(),
            "full_year": full_year,
            "days": (last - first).days + 1,
            "expected_hour_instances": len(expected),
            "extracted_hour_instances": len(valid),
            "missing_or_invalid_instances": missing,
            "hour_counts": hour_counts,
            "month_counts": {f"{month:02d}": len(rows) for month, rows in grouped.items()},
            "complete": missing == 0 and not issues,
        },
        "quality_gate": {
            "structural_extraction_only": True,
            "independent_liturgical_certification": False,
            "text_collation_complete": False,
            "approved_for_public_reader": False,
            "all_eight_hours_present_if_complete": missing == 0,
        },
        "issue_count": len(issues),
        "issues_file": "exceptions.json",
    }
    (out / "manifest.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    (out / "exceptions.json").write_text(
        json.dumps({"schema": "ao.office.1960.source-exceptions.v1",
                    "year": year, "issues": issues}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return report


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--epub", type=Path, required=True)
    parser.add_argument("--year", type=int, required=True)
    parser.add_argument("--revision", required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--from-date", type=dt.date.fromisoformat)
    parser.add_argument("--through-date", type=dt.date.fromisoformat)
    args = parser.parse_args()
    if not re.fullmatch("[a-fA-F0-9]{40}", args.revision):
        parser.error("--revision must be the exact 40-character upstream Git commit")
    if (args.from_date is None) != (args.through_date is None):
        parser.error("Bounded smoke checks require both --from-date and --through-date")
    report = analyze_epub(args.epub, args.year, args.revision, args.output,
                          args.from_date, args.through_date)
    print(json.dumps({"year": args.year, **report["coverage"],
                      "issue_count": report["issue_count"]}, indent=2))
    return 0 if report["coverage"]["complete"] else 2


if __name__ == "__main__":
    sys.exit(main())
