"""B50 offline cases: no accidental work fusion, loose normalization or publication."""
import importlib.util
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
P=ROOT/"scripts"/"icrsp_b50_salesian_ix_full_diff.py"
spec=importlib.util.spec_from_file_location("b50",P)
b50=importlib.util.module_from_spec(spec)
spec.loader.exec_module(b50)
class TestB50(unittest.TestCase):
    def setUp(self):
        self.html="""<main><p>Before this work</p>
        <p>Opening start and first complete paragraph for this historical piece.</p>
        <p>A second paragraph with historical text about prayer and Scripture.</p>
        <p>A third paragraph with reflection on charity and humility.</p>
        <p>Final ending concludes the sermon. Amen.</p>
        <h2>Different historical work</h2><p>Adjacent prose is not allowed into comparison.</p></main>"""
    def test_separate_work_boundary(self):
        extracted=b50.extract(self.html,"Opening start","Final ending",20)
        self.assertEqual(len(extracted),4)
        self.assertFalse(any("Adjacent prose" in x for x in extracted))
    def test_missing_and_duplicate_anchors_abort(self):
        with self.assertRaisesRegex(ValueError,"opening_anchor_hits_2"):
            b50.extract(self.html+"<p>Opening start repeated</p>","Opening start","Final ending",20)
        with self.assertRaisesRegex(ValueError,"ending_anchor_hits_0"):
            b50.extract(self.html,"Opening start","Unavailable ending",20)
    def test_meta_charset_fallback_decodes_legacy_french(self):
        body='<meta charset="windows-1252"><p>à l’église</p>'.encode("cp1252")
        self.assertIn("à l’église",b50.decode_html(body))
        self.assertIn("à l’église",b50.decode_html("à l’église".encode("utf-8"),"utf-8"))

    def test_normalization_keeps_word_changes(self):
        self.assertEqual(b50.normalize("vostre   [123]   cœur"),"vostre cœur")
        self.assertEqual(b50.tokens(["Bonté, et grâce."],True),b50.tokens(["bonté et grâce"],True))
        self.assertNotEqual(b50.tokens(["amour"],True),b50.tokens(["amertume"],True))
    def test_embedded_printed_page_marker_in_boundary(self):
        html="<p>Opening [137] begin with enough words now.</p><p>Middle sufficient words to compare with baseline text.</p><p>Last concluding sentence ends with Amen [138].</p>"
        self.assertEqual(len(b50.extract(html,"Opening begin","Last concluding",21)),3)

    def test_diff_stats_and_release_gates(self):
        x=b50.delta(["je","crois"],["je","ne","crois"])
        self.assertEqual(x["insert_blocks"],1)
        self.assertEqual(x["matching_ratio"],.8)
        self.assertFalse(b50.compare.__doc__ == "publication cleared")
if __name__=="__main__":unittest.main()
