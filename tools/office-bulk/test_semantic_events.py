"""No-network source fidelity tests for annual eight-Hour semantic projection."""
import datetime as dt
import gzip
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

ROOT = Path(__file__).parent


def load(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / filename)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


importer = load("office_importer_for_semantic", "import_epub.py")
semantic = load("office_semantic", "semantic_events.py")
REV = "126a07f91ede04664108abb6fb20ace3f4de14b9"


def sample_hour(hour="Completorium", date="2026-01-01"):
    blocks = [
        {"ordinal": 0, "tag": "p", "attrs": {"class": "cen"},
         "kind": "source_block", "source_section_label": None,
         "text": "Octave Day of Christmas ~ I. classis",
         "lines": ["Octave Day of Christmas ~ I. classis"]},
        {"ordinal": 1, "tag": "h2", "attrs": {"id": hour+"top"},
         "kind": "heading", "source_section_label": None,
         "text": "Ad Completorium", "lines": ["Ad Completorium"]},
        {"ordinal": 2, "tag": "td", "attrs": {"id": hour+"1"},
         "kind": "explicit_source_section", "source_section_label": "Psalmi",
         "text": "Psalmi Ant. Miserére Psalmus 4 [1] 4:2 Cum invocárem.",
         "lines": ["Psalmi", "Ant. Miserére * mihi, Dómine.",
                   "Psalmus 4 [1]", "4:2 Cum invocárem.", "℣. Glória Patri.",
                   "℟. Sicut erat in princípio."]},
        {"ordinal": 3, "tag": "td", "attrs": {"id": hour+"2"},
         "kind": "source_block", "source_section_label": None,
         "text": "Psalmus 90 [2] 90:1 Qui hábitat.",
         "lines": ["Psalmus 90 [2]", "90:1 Qui hábitat.", "Ant. Miserére mihi."]},
        {"ordinal": 4, "tag": "td", "attrs": {"id": hour+"3"},
         "kind": "explicit_source_section", "source_section_label": "Hymnus",
         "text": "Hymnus Te lucis ante términum.",
         "lines": ["Hymnus", "Te lucis ante términum.",
                   "Præsta, Pater piíssime.", "Amen."]},
        {"ordinal": 5, "tag": "td", "attrs": {"id": hour+"4"},
         "kind": "explicit_source_section", "source_section_label": "Oratio",
         "text": "Oratio Orémus. Vísita quǽsumus.",
         "lines": ["Oratio", "℣. Dómine, exáudi.", "℟. Et clamor.",
                   "Orémus.", "Vísita, quǽsumus, Dómine."]},
    ]
    return {"date": date, "hour": hour, "language": "la",
            "rubrics": "Rubrics 1960 - 1960",
            "source": {"repository": "DivinumOfficium/divinum-officium",
                       "revision": REV, "epub_entry":
                           "01-01-2026-8-Completorium.html",
                       "xhtml_sha256": "a"*64},
            "blocks": blocks}


class SemanticProjectionTests(unittest.TestCase):
    def test_semantic_types_only_from_original_source_markers(self):
        r = semantic.project_hour(sample_hour())
        self.assertEqual(r["hour"], "Completorium")
        self.assertEqual(r["source_block_count"], 6)
        self.assertEqual(r["token_counts"]["psalm_heading"], 2)
        self.assertEqual(r["token_counts"]["antiphon_line"], 2)
        self.assertEqual(r["token_counts"]["numbered_scripture_line"], 2)
        self.assertEqual(r["quality_gate"]["public_reader_authorized"], False)
        self.assertEqual([s["kind"] for s in r["sections"]],
                         ["source_prelude", "hour_title", "psalmody",
                          "hymn", "collect_and_prayer"])
        psalm = r["sections"][2]
        self.assertEqual(psalm["label"], "Psalmi")
        self.assertEqual(len(psalm["source_blocks"]), 2)
        self.assertEqual(psalm["source_blocks"][0]["source_attrs"]["id"], "Completorium1")
        self.assertEqual(psalm["source_blocks"][1]["source_attrs"]["id"], "Completorium2")
        psalm_ref = psalm["source_blocks"][1]["lines"][0]
        self.assertEqual(psalm_ref["type"], "psalm_heading")
        self.assertEqual(psalm_ref["psalm"], 90)
        self.assertEqual(psalm_ref["source_block"], 3)
        self.assertEqual(psalm_ref["source_line"], 0)
        self.assertEqual(r["source_line_count"],
                         sum(len(b["lines"]) for b in sample_hour()["blocks"]))

    def test_line_classes_are_evidence_not_generated_text(self):
        for text, kind in [
            ("Psalmus 118(33-48) [3]", "psalm_heading"),
            ("Ant. Salva nos, * Dómine.", "antiphon_line"),
            ("121:3 Non det in commotiónem pedem tuum.", "numbered_scripture_line"),
            ("℣. Custódi nos, Dómine.", "versicle_line"),
            ("℟. In manus tuas.", "response_line"),
            ("℟.br. In manus tuas.", "response_line"),
            ("Orémus.", "prayer_invitation"),
            ("Nocturnus III", "nocturn_heading"),
            ("Lectio 2", "lesson_heading"),
            ("Preces Feriales{omittitur}", "ferial_prayers_marker"),
            ("Te lucis ante términum.", "unclassified_source_line"),
            ("Deus, qui salútis ætérnæ.", "unclassified_source_line"),
        ]:
            with self.subTest(text=text):
                self.assertEqual(semantic.line_role(text, None)[0], kind)
        self.assertEqual(semantic.line_role("Psalmus 118(33-48) [3]", None)[1],
                         {"psalm": 118, "portion": "(33-48)",
                          "psalm_source_order": 3})

    def test_modified_original_block_order_is_rejected(self):
        r = sample_hour()
        r["blocks"][1]["ordinal"] = 77
        with self.assertRaisesRegex(ValueError, "Nonconsecutive"):
            semantic.project_hour(r)

    def test_all_eight_hour_records_in_a_bounded_source_day(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            epub = root / "hours.epub"
            date = dt.date(2026, 1, 1)
            with zipfile.ZipFile(epub, "w") as z:
                for index, hour in enumerate(semantic.HOURS, start=1):
                    markup = (
                        '<html><body><div>'
                        '<p>In Octava Nativitatis ~ I. classis</p>'
                        f'<h2>Ad {hour}</h2>'
                        f'<table><tr><td id="{hour}1"><p><b>Psalmi</b><br/>'
                        'Ant. Miserere mihi.<br/>Psalmus 4 [1]<br/>'
                        '4:2 Cum invocarem exaudivit me Deus iustitiae meae.'
                        '</p></td></tr><tr><td id="X">'
                        '<p><b>Hymnus</b><br/>Te lucis ante terminum. '
                        'Rerum creator poscimus. Praesta, Pater piissime.'
                        '</p></td></tr></table></div></body></html>'
                    )
                    z.writestr(f"01-01-2026-{index}-{hour}.html", markup)
            parsed = root / "parsed"
            first = importer.analyze_epub(epub, 2026, REV, parsed, date, date)
            self.assertEqual(first["coverage"]["extracted_hour_instances"], 8)
            result = semantic.import_year(parsed, root / "semantic")
            self.assertEqual(result["hours_projected"], 8)
            self.assertEqual(result["days_projected"], 1)
            self.assertEqual(result["source_issues_count"], 0)
            self.assertFalse(result["quality_gate"]["public_reader_authorized"])
            day = json.loads((root / "semantic" / "reader" / "2026" / "01" /
                              "01.json").read_text())
            self.assertEqual(set(day["hours"]), set(semantic.HOURS))
            self.assertEqual(day["date"], "2026-01-01")
            self.assertFalse(day["public_reader_authorized"])
            self.assertEqual(day["hours"]["Completorium"]["token_counts"]["psalm_heading"], 1)
            with gzip.open(root / "semantic" /
                           "semantic-2026-01-la-1960.jsonl.gz", "rt") as gz:
                self.assertEqual(len(gz.readlines()), 8)

    def test_both_years_special_source_layout_holds_are_exactly_sixteen(self):
        known = semantic.KNOWN_SPECIAL_FORMAT_SOURCE_REVIEWS
        self.assertEqual(len(known), 16)
        for year, days in [(2026, ("04-02", "04-03", "04-04")),
                           (2027, ("03-25", "03-26", "03-27"))]:
            for day in days:
                self.assertIn((f"{year}-{day}", "Completorium"), known)
            for hour in ("Prima", "Tertia", "Sexta", "Nona", "Completorium"):
                self.assertIn((f"{year}-11-02", hour), known)
        self.assertNotIn(("2027-01-01", "Completorium"), known)

    def test_absence_of_psalm_is_logged_as_uncertified_exception(self):
        record = sample_hour()
        for b in record["blocks"]:
            if b["source_section_label"] == "Psalmi":
                b["source_section_label"] = "Hymnus"
            b["lines"] = [v for v in b["lines"] if not v.startswith("Psalmus ")]
        result = semantic.project_hour(record)
        self.assertEqual(result["token_counts"]["missing_source_psalm_headings"], 1)
        self.assertEqual(result["token_counts"]["missing_explicit_psalmody_section"], 1)
        self.assertFalse(result["quality_gate"]["liturgically_certified"])


if __name__ == "__main__":
    unittest.main()
