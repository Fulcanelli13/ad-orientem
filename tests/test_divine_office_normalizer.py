"""Tests of the zero-markup, fail-closed Divine Office research converter."""
import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from scripts.office.normalize_xhtml import normalize_xhtml, convert_tree

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
