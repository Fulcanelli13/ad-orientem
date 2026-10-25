"""Author-boundary extraction tests. Entirely synthetic; no third-party text."""
import importlib.util
from pathlib import Path
import sys
import unittest
ROOT = Path(__file__).resolve().parents[1] / "tools" / "icrsp"
sys.path.insert(0, str(ROOT))
spec = importlib.util.spec_from_file_location("commentary_extractor", ROOT / "extract_commentary_blocks.py")
extractor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(extractor)

def block(label):
    return ("<details class='pf-cate-cadre'><summary>" + label
            + "</summary><div class='corps'><p class='mx-comm-titre'>" + label
            + "</p><p>" + ("test content " * 20) + "</p></div></details>")

class CommentaryBlocks(unittest.TestCase):
    def test_exact_author_divisions_not_duplicate_labels(self):
        html = ("<div><h2>1er dimanche de l’Avent</h2><h3>Commentaires</h3>"
                + block("Dom Guéranger, l’Année Liturgique")
                + block("Bhx Cardinal Schuster, Liber Sacramentorum")
                + block("Dom Pius Parsch, le Guide dans l’année liturgique")
                + "</div>")
        d = extractor.inspect_html(html, "https://icrspfrance.fr/textes-liturgiques.php?article=a0088_ancien")
        self.assertEqual(d["commentaryHeadingCount"], 1)
        self.assertEqual(d["explicitAuthorWorkBlocks"], 3)
        self.assertTrue(all(x["labelConfirmedTwice"] for x in d["commentaryBlocks"]))
        self.assertEqual([x["workCandidate"] for x in d["commentaryBlocks"]],
                         ["GUERANGER_ANNEE_LITURGIQUE", "SCHUSTER_LIBER_SACRAMENTORUM",
                          "PARSCH_GUIDE_ANNEE_LITURGIQUE"])

    def test_unattributed_candlemas_not_guessed(self):
        html = ("<h2>Candlemas</h2><h3>Commentaires</h3>" + block("Présentation")
                + "<h3>Textes de la Messe</h3>" + block("Dom Guéranger, l’Année Liturgique"))
        d = extractor.inspect_html(html, "https://icrspfrance.fr/textes-liturgiques.php?article=a0146_ancien")
        self.assertEqual(d["explicitAuthorWorkBlocks"], 0)
        self.assertEqual(d["anonymousOrOtherBlocks"], 1)

    def test_script_footer_and_prose_name_does_not_certify(self):
        html = ("""<script>Dom Guéranger, l’Année Liturgique</script>
                    <h2>Reference document 1973</h2><h3>I. NORMES</h3>
                    <p>Dom Guéranger, l’Année Liturgique</p>""")
        d = extractor.inspect_html(html, "https://icrspfrance.fr/textes-liturgiques.php?article=a0112_nouveau")
        self.assertEqual(d["commentaryHeadingCount"], 0)
        self.assertEqual(len(d["commentaryBlocks"]), 0)

    def test_mismatched_author_titles_do_not_certify(self):
        html = ("<h2>Saint</h2><h3>Commentaires</h3>"
                "<details class='pf-cate-cadre'><summary>Dom Guéranger, l’Année Liturgique</summary>"
                "<div class='corps'><p class='mx-comm-titre'>Anonymous editorial</p>"
                "<p>test prose</p></div></details>")
        d = extractor.inspect_html(html, "https://icrspfrance.fr/textes-liturgiques.php?article=a0665_ancien")
        self.assertEqual(d["commentaryBlocks"][0]["attributionStatus"], "HEADER_TITLE_MISMATCH_REVIEW")

if __name__ == "__main__":
    unittest.main()
