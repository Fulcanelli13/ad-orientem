"""Tests of the zero-markup, fail-closed Divine Office research converter."""
import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from scripts.office.normalize_xhtml import normalize_xhtml, convert_tree, classify_latin_cell

PIN = "126a07f91ede04664108abb6fb20ace3f4de14b9"
DAY = "2026-10-31"
HTML = """<?xml version="1.0" encoding="UTF-8"?><html><head><title>Office</title></head>
<body><div>
<p class="cen"><span class="rd">Omnium Sanctorum ~ I. classis<br/></span>
<span class="s m">Vespera de sequenti; nihil de præcedenti</span><br/>
<a href="x">date</a></p>
<p class="cen"><a href="unsafe">Matutinum</a> <a href="unsafe">Laudes</a></p>
<H2 ID='Vesperatop'>Ad Vesperas</H2>
<TR><TD VALIGN='TOP' WIDTH='100%' ID='Vespera1'><p><b>Incipit</b><br/>
<span class="ri">℣.</span> Deus &#10016; in adiutórium meum inténde.<br/>
<span class="ri">℟.</span> Dómine, ad adiuvándum me festína.</p></TD></TR>
<TR><TD ID='Vespera2'><p><b>Antiphona</b><br/>Magnificat anima mea Dominum.
<script>alert('malicious')</script>Non potest in nobis.</p></TD></TR>
<p><a href="unsafe">Unrelated navigation</a></p>
</div></body></html>"""

class NormalizerTests(unittest.TestCase):
    def test_semantic_navigation_labels_never_split_source_content(self):
        examples = {
            "Incipit\n℣. Deus": "OPENING",
            "Psalmi {ex Psalterio}\nAnt.": "PSALMODY",
            "Ant. Vidi turbam\nPsalmus 109": "PSALMODY",
            "Capitulum Hymnus Versus {ex Proprio}": "CHAPTER_HYMN_VERSE",
            "Canticum: Magnificat": "GOSPEL_CANTICLE",
            "Oratio {ex Proprio}": "PRAYER",
            "Conclusio\n℣.": "CONCLUSION",
        }
        for text, expected in examples.items():
            self.assertEqual(classify_latin_cell(text)["role"], expected, text)
        further = {
            "℣. Iube, Dómine, benedícere.": "LESSON_WITH_BLESSING",
            "Pater Noster dicitur secreto usque ad Et ne nos": "MATINS_PREPARATION",
            "Antiphona finalis B.M.V.": "MARIAN_ANTIPHON",
            "Martyrologium {anticipatur}": "MARTYROLOGY",
            "De Officio Capituli": "PRIME_CHAPTER_OFFICE",
            "Reliqua omittuntur, nisi Laudes separandæ sint.": "RUBRICAL_NOTE",
            "℣. Deus ✠ in adiutórium meum inténde.": "OPENING",
            "℣. Pretiósa in conspéctu Dómini.": "VERSICLE_RESPONSE",
            "℣. Constítues eos príncipes super omnem terram.": "VERSICLE_RESPONSE",
        }
        for text, expected in further.items():
            self.assertEqual(classify_latin_cell(text)["role"], expected, text)
        unknown = classify_latin_cell("Textus sine titulo")
        self.assertEqual(unknown["role"], "SOURCE_SECTION")
        self.assertEqual(unknown["certainty"], "NONE")

    def test_convert_to_plain_sourced_blocks(self):
        doc = normalize_xhtml(HTML, date=DAY, hour="VESPERS", language="la", source_revision=PIN)
        self.assertEqual(doc["status"], "STRUCTURED_UNVERIFIED")
        self.assertFalse(doc["publishable"])
        self.assertEqual(len(doc["sections"]), 2)
        self.assertEqual([s["sourceCellId"] for s in doc["sections"]], ["Vespera1", "Vespera2"])
        self.assertIn("Vespera de sequenti", doc["headline"])
        self.assertNotIn("Unrelated navigation", str(doc))
        self.assertNotIn("alert", str(doc))
        self.assertNotIn("<span", json.dumps(doc))
        self.assertIn("✠", doc["sections"][0]["text"])
        self.assertNotIn("Matutinum", doc["headline"])
        self.assertFalse(doc["verification"]["crossLanguageAlignment"])

    def test_vernacular_omitted_preces_only_is_not_a_prayer_card(self):
        for lang, label in (("en", "Weekday Intercessions{omit}"),
                            ("fr", "Prières fériales{omises}")):
            with_omitted = HTML.replace(
                "<TR><TD ID='Vespera2'>",
                "<TR><TD ID='Vespera2'><p>" + label + "</p></TD></TR>"
                "<TR><TD ID='Vespera3'>")
            doc = normalize_xhtml(with_omitted, date=DAY, hour="VESPERS",
                                  language=lang, source_revision=PIN)
            self.assertEqual(len(doc["sections"]), 2)
            self.assertEqual(doc["sections"][1]["sourceCellId"], "Vespera3")
            self.assertEqual(doc["sections"][1]["sourceIndex"], 3)
            self.assertEqual(doc["sections"][1]["index"], 2)
            self.assertEqual(doc["metrics"]["rawSourceCellCount"], 3)
            self.assertEqual(doc["metrics"]["explicitlyOmittedSourceCellCount"], 1)
            self.assertEqual(doc["omittedSourceCells"][0]["sourceCellId"], "Vespera2")
            self.assertEqual(doc["omittedSourceCells"][0]["reason"],
                             "UPSTREAM_EXPLICIT_PRECES_OMISSION")
            # If the marker includes even one actual prayer, it must NOT be
            # automatically dropped.
            with_prayer = with_omitted.replace(label, label + "\\n℣. Deus")
            not_omitted = normalize_xhtml(with_prayer, date=DAY, hour="VESPERS",
                                         language=lang, source_revision=PIN)
            self.assertEqual(len(not_omitted["sections"]), 3)
            self.assertEqual(not_omitted["omittedSourceCells"], [])

    def test_all_souls_exact_status_only_markers_preserve_source_ids(self):
        for language, labels in (
            ("en", ("Start{omit}", "Hymn{omit}")),
            ("fr", ("Début{omises}", "Hymne{omises}")),
        ):
            def fixture(first, second):
                rows = [
                    first, "Invitatorium {ex Proprio}",
                    second, "Lectio 1\\nVerbum Domini",
                ]
                cells = "".join(
                    f"<tr><td id='Matutinum{i}'><p>{row}</p></td></tr>"
                    for i, row in enumerate(rows, 1)
                )
                return (
                    "<html><body><p class='cen'>In Commemoratione Defunctorum</p>"
                    "<h2>Matutinum</h2><table>" + cells + "</table></body></html>"
                )

            data = normalize_xhtml(
                fixture(*labels), date="2026-11-02", hour="MATINS",
                language=language, source_revision=PIN,
            )
            self.assertEqual(len(data["sections"]), 2)
            self.assertEqual(data["metrics"]["rawSourceCellCount"], 4)
            self.assertEqual(data["metrics"]["explicitlyOmittedSourceCellCount"], 2)
            self.assertEqual([x["sourceIndex"] for x in data["sections"]], [2, 4])
            self.assertEqual([x["index"] for x in data["sections"]], [1, 2])
            self.assertEqual(
                [x["sourceCellId"] for x in data["omittedSourceCells"]],
                ["Matutinum1", "Matutinum3"],
            )
            self.assertEqual(
                [x["reason"] for x in data["omittedSourceCells"]],
                ["UPSTREAM_EXPLICIT_START_OMISSION", "UPSTREAM_EXPLICIT_HYMN_OMISSION"],
            )
            # Never remove a real source sentence or a loosely matched marker.
            contaminated = fixture(labels[0] + " V. Domine exaudi", labels[1])
            not_omitted = normalize_xhtml(
                contaminated, date="2026-11-02", hour="MATINS",
                language=language, source_revision=PIN,
            )
            self.assertEqual(len(not_omitted["sections"]), 3)
            self.assertEqual(len(not_omitted["omittedSourceCells"]), 1)

    def test_reject_duplicate_or_noncontiguous_cells(self):
        malformed = HTML.replace("Vespera2", "Vespera3")
        with self.assertRaisesRegex(ValueError, "NONCONTIGUOUS"):
            normalize_xhtml(malformed, date=DAY, hour="VESPERS", language="la", source_revision=PIN)
        malformed = HTML.replace("Vespera2", "Vespera1")
        with self.assertRaisesRegex(ValueError, "NONCONTIGUOUS"):
            normalize_xhtml(malformed, date=DAY, hour="VESPERS", language="la", source_revision=PIN)

    def test_missing_or_wrong_hour_cells_fail_closed(self):
        with self.assertRaisesRegex(ValueError, "MISSING_OR_EXCESSIVE"):
            normalize_xhtml(HTML, date=DAY, hour="LAUDS", language="la", source_revision=PIN)
        with self.assertRaisesRegex(ValueError, "SELECTION_INVALID"):
            normalize_xhtml(HTML, date=DAY, hour="VESPERS", language="it", source_revision=PIN)

    def test_unresolved_macro_and_empty_cell_rejected(self):
        with self.assertRaisesRegex(ValueError, "UNRESOLVED_SOURCE_REFERENCE"):
            normalize_xhtml(HTML.replace("Magnificat anima", "@Commune/C1:Lectio4\nMagnificat anima"),
                            date=DAY, hour="VESPERS", language="la", source_revision=PIN)
        with self.assertRaisesRegex(ValueError, "EMPTY_SOURCE_CELL"):
            normalize_xhtml(HTML.replace("<b>Antiphona</b><br/>Magnificat anima mea Dominum.\n<script>alert('malicious')</script>Non potest in nobis.", ""),
                            date=DAY, hour="VESPERS", language="la", source_revision=PIN)

    def test_trilingual_semantic_json_is_valid_and_uses_latin_provenance(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            rows = []
            for language in ("la", "en", "fr"):
                target = root / DAY / "vespers"
                target.mkdir(parents=True, exist_ok=True)
                filename = DAY + "/vespers/" + language + ".xhtml"
                (root / filename).write_text(HTML, encoding="utf-8")
                rows.append({
                    "date": DAY, "hour": "VESPERS", "language": language,
                    "file": filename, "sha256": hashlib.sha256(HTML.encode()).hexdigest(),
                    "envelopePass": True, "status": "CAPTURED_UNVERIFIED",
                })
            (root / "manifest.json").write_text(json.dumps({
                "researchOnly": True, "sourceRevision": PIN,
                "counts": {"published": 0}, "records": rows,
            }), encoding="utf-8")
            summary = convert_tree(root)
            self.assertEqual(summary["count"], 3)
            self.assertEqual(summary["structurallyAligned"], 1)
            self.assertEqual(summary["semanticRolesInLatinGroups"]["OPENING"], 1)
            for language in ("la", "en", "fr"):
                serialized = (root / DAY / "vespers" / (language+".research.json")).read_text(encoding="utf-8")
                document = json.loads(serialized)
                self.assertEqual(document["sections"][0]["semantic"]["role"], "OPENING")
                self.assertEqual(document["sections"][0]["semantic"]["latinSourceCellId"], "Vespera1")
                self.assertFalse(document["publishable"])
            self.assertEqual(json.loads((root/"normalized-manifest.json").read_text(encoding="utf-8"))["published"], 0)

    def test_raw_checksum_and_research_only_guards(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            target = root / DAY / "vespers"
            target.mkdir(parents=True)
            (target / "la.xhtml").write_text(HTML, encoding="utf-8")
            row = {
                "date": DAY, "hour": "VESPERS", "language": "la",
                "file": DAY + "/vespers/la.xhtml",
                "sha256": hashlib.sha256(HTML.encode()).hexdigest(),
                "envelopePass": True, "status": "CAPTURED_UNVERIFIED",
            }
            data = {
                "researchOnly": True, "sourceRevision": PIN,
                "counts": {"published": 0}, "records": [row],
            }
            (root / "manifest.json").write_text(json.dumps(data), encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "TRILINGUAL_ROW_MISSING"):
                convert_tree(root)
            row["sha256"] = "0" * 64
            (root / "manifest.json").write_text(json.dumps(data), encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "RAW_CHECKSUM_MISMATCH"):
                convert_tree(root)
            row["sha256"] = hashlib.sha256(HTML.encode()).hexdigest()
            row["file"] = "../escape.xhtml"
            (root / "manifest.json").write_text(json.dumps(data), encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "UNSAFE_PATH"):
                convert_tree(root)


if __name__ == "__main__":
    unittest.main()
