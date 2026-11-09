"""Tests of the research-only cross-Hour source structure audit."""
import datetime as dt
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import zipfile


ROOT = Path(__file__).parent


def module_from_file(name: str, filename: str):
    spec = importlib.util.spec_from_file_location(name, ROOT / filename)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


importer = module_from_file("annual_source_importer", "import_epub.py")
audit = module_from_file("annual_source_auditor", "audit_annual.py")
REVISION = "126a07f91ede04664108abb6fb20ace3f4de14b9"


class AnnualAuditTests(unittest.TestCase):
    def test_title_reads_original_generator_office_heading(self):
        self.assertEqual(audit.title({
            "tag": "p",
            "text": "S. Joannis Bosco Confessoris ~ III. classis "
                    "Vespera ↓ 01-31-2026 ↑",
        }), "S. Joannis Bosco Confessoris")
        self.assertEqual(audit.title({
            "text": "Dominica in Septuagesima ~ II. classis "
                    "Vespera ↓ 01-31-2026 ↑",
        }), "Dominica in Septuagesima")

    def test_annual_structure_report_is_source_only_and_detects_transition(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / "sample.epub"
            with zipfile.ZipFile(source, "w") as archive:
                for n, hour in enumerate(importer.HOURS, 1):
                    label = ("Sunday First Vespers"
                             if hour in ("Vespera", "Completorium") else "Saturday Saint")
                    chapter = (
                        '<html><body><div>'
                        f'<p>{label} ~ II. classis {hour} 01-02-2027</p>'
                        f'<h2>Ad {hour}</h2>'
                        '<table><tr><td id="Section1"><p><b>Oratio</b><br/>'
                        'Deus, qui nos ad principium huius diei pervenire fecisti, '
                        'tua nos hodie salva virtute. Amen.</p></td></tr></table>'
                        '</div></body></html>'
                    )
                    archive.writestr(f"01-02-2027-{n}-{hour}.html",
                                     chapter.encode("utf-8"))
            folder = root / "parsed"
            manifest = importer.analyze_epub(
                source, 2027, REVISION, folder,
                first=dt.date(2027, 1, 2), last=dt.date(2027, 1, 2),
            )
            self.assertTrue(manifest["coverage"]["complete"])
            report = audit.audit_directory(folder)
            self.assertEqual(report["source_records"], 8)
            self.assertEqual(report["days_with_eight_hours"], 1)
            self.assertEqual(report["evening_office_transition_count"], 1)
            self.assertEqual(report["vespers_compline_title_divergences"], [])
            self.assertEqual(report["explicit_generator_section_labels"]["Oratio"], 8)
            self.assertTrue(report["quality_gate"]["source_structure_audited"])
            self.assertFalse(report["quality_gate"]["public_reader_authorized"])
            self.assertEqual(json.loads((folder / "structure-audit.json")
                                        .read_text())["source_records"], 8)

    def test_divergent_compline_is_reported_as_source_review_not_autocorrected(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / "divergent.epub"
            with zipfile.ZipFile(source, "w") as archive:
                for n, hour in enumerate(importer.HOURS, 1):
                    label = "Compline source discrepancy" if hour == "Completorium" else (
                        "Evening Sunday" if hour == "Vespera" else "Daytime Saint"
                    )
                    chapter = (
                        '<html><body><div>'
                        f'<p>{label} ~ II. classis {hour}</p>'
                        f'<h2>Ad {hour}</h2><table><tr><td id="X">'
                        '<p><b>Hymnus</b><br/>Te lucis ante terminum, '
                        'rerum Creator poscimus; in omni nocte gloriam '
                        'Trinitatis sanctae nostris piis cordibus.</p>'
                        '</td></tr></table></div></body></html>'
                    )
                    archive.writestr(f"01-02-2027-{n}-{hour}.html", chapter)
            folder = root / "parsed"
            importer.analyze_epub(source, 2027, REVISION, folder,
                                  first=dt.date(2027, 1, 2), last=dt.date(2027, 1, 2))
            report = audit.audit_directory(folder)
            self.assertEqual(len(report["vespers_compline_title_divergences"]), 1)
            self.assertEqual(report["vespers_compline_title_divergences"][0]["civil_date"],
                             "2027-01-02")
            self.assertFalse(report["quality_gate"]["independent_ordo_review_complete"])


if __name__ == "__main__":
    unittest.main()
