"""No-network tests for the pinned annual Divine Office EPUB importer."""
import datetime as dt
import gzip
import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

module_path = Path(__file__).with_name("import_epub.py")
spec = importlib.util.spec_from_file_location("office_bulk_importer", module_path)
importer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(importer)
REVISION = "126a07f91ede04664108abb6fb20ace3f4de14b9"
DATE = dt.date(2026, 1, 1)


def make_epub(path, skip=None, wrong_source=False):
    skip = skip or set()
    with zipfile.ZipFile(path, mode="w") as archive:
        for index, hour in enumerate(importer.HOURS, start=1):
            if hour in skip:
                continue
            name = f"01-01-2026-{index}-{hour}.html"
            body = (
                '<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml">'
                '<head><title>Generator test</title></head><body><div>'
                f'<h1>Ad {hour}</h1>'
                '<p class="rubric">The 1960 Office source and proper are to be '
                'read with fidelity to the dated Roman calendar and correct psalter.</p>'
                '<p><b>Deus, in adiutorium meum intende.</b> Domine, ad adiuvandum me '
                'festina. Gloria Patri, et Filio, et Spiritui Sancto. Amen.</p>'
                '<p class="cen"><a>Matutinum</a><a>Laudes</a><a>Prima</a>'
                '<a>Tertia</a><a>Sexta</a><a>Nona</a><a>Vespera</a>'
                '<a>Completorium</a></p></div></body></html>'
            )
            archive.writestr(name, b"\xff" if wrong_source and hour == "Nona"
                             else body.encode("utf-8"))
        archive.writestr("01-01-2026-9-Missa.html",
                         "This Mass is never an Office hour")
        archive.writestr("toc2026.html", "Not an Hour")


class ImporterTests(unittest.TestCase):
    def test_exact_eight_hour_order_and_exclusions(self):
        with tempfile.TemporaryDirectory() as scratch:
            root = Path(scratch)
            epub = root / "breviarium2026.epub"
            make_epub(epub)
            report = importer.analyze_epub(epub, 2026, REVISION, root / "parsed",
                                            first=DATE, last=DATE)
            self.assertEqual(report["coverage"]["expected_hour_instances"], 8)
            self.assertEqual(report["coverage"]["extracted_hour_instances"], 8)
            self.assertTrue(report["coverage"]["complete"])
            self.assertFalse(report["coverage"]["full_year"])
            self.assertEqual(report["coverage"]["hour_counts"],
                             dict.fromkeys(importer.HOURS, 1))
            with gzip.open(root / "parsed" / "office-2026-01-la-1960.jsonl.gz",
                           "rt", encoding="utf-8") as output:
                records = [json.loads(line) for line in output]
            self.assertEqual([x["hour"] for x in records], list(importer.HOURS))
            self.assertTrue(all(x["date"] == "2026-01-01" for x in records))
            self.assertTrue(all(x["review"]["public_reader_authorized"] is False
                                for x in records))
            self.assertTrue(all(x["source"]["revision"] == REVISION for x in records))
            self.assertTrue(all(x["blocks"][0]["kind"] == "heading" for x in records))
            self.assertTrue(all("Matutinum Laudes Prima" not in x["plain_text"]
                                for x in records))
            self.assertEqual(json.loads((root / "parsed" / "exceptions.json")
                                        .read_text())["issues"], [])

    def test_missing_hour_creates_explicit_exception_not_a_fake_success(self):
        with tempfile.TemporaryDirectory() as scratch:
            root = Path(scratch)
            epub = root / "partial.epub"
            make_epub(epub, skip={"Completorium"})
            report = importer.analyze_epub(epub, 2026, REVISION, root / "partial",
                                            first=DATE, last=DATE)
            self.assertFalse(report["coverage"]["complete"])
            self.assertEqual(report["coverage"]["extracted_hour_instances"], 7)
            issues = json.loads((root / "partial" / "exceptions.json").read_text())["issues"]
            self.assertEqual(len(issues), 1)
            self.assertEqual(issues[0]["hour"], "Completorium")
            self.assertEqual(issues[0]["code"], "MISSING_HOUR")

    def test_bad_utf8_does_not_disappear_from_coverage_report(self):
        with tempfile.TemporaryDirectory() as scratch:
            root = Path(scratch)
            epub = root / "bad.epub"
            make_epub(epub, wrong_source=True)
            report = importer.analyze_epub(epub, 2026, REVISION, root / "out",
                                            first=DATE, last=DATE)
            self.assertEqual(report["coverage"]["missing_or_invalid_instances"], 1)
            self.assertEqual(report["coverage"]["extracted_hour_instances"], 7)
            self.assertEqual(report["issue_count"], 1)
            self.assertEqual(json.loads((root / "out" / "exceptions.json")
                                        .read_text())["issues"][0]["code"],
                             "INVALID_SOURCE_HTML")

    def test_gzip_and_source_hashes_are_reproducible(self):
        with tempfile.TemporaryDirectory() as scratch:
            root = Path(scratch)
            epub = root / "source.epub"
            make_epub(epub)
            for folder in ("a", "b"):
                importer.analyze_epub(epub, 2026, REVISION, root / folder,
                                      first=DATE, last=DATE)
            filename = "office-2026-01-la-1960.jsonl.gz"
            self.assertEqual(hashlib.sha256((root / "a" / filename).read_bytes()).hexdigest(),
                             hashlib.sha256((root / "b" / filename).read_bytes()).hexdigest())

    def test_full_year_expected_counts_include_leap_year(self):
        for year, expected_days in ((2026, 365), (2027, 365), (2028, 366)):
            first, last = dt.date(year, 1, 1), dt.date(year, 12, 31)
            names = importer.expected_entries(year, first, last)
            self.assertEqual(len(names), expected_days * 8)
            self.assertIn(f"12-31-{year}-8-Completorium.html", names)
            self.assertIn(f"01-01-{year}-1-Matutinum.html", names)


if __name__ == "__main__":
    unittest.main()
