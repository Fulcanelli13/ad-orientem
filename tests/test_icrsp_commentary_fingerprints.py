"""Synthetic regression tests: fingerprints never expose liturgical/commentary text."""
import importlib.util
import sys
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]/"tools"/"icrsp"
sys.path.insert(0,str(ROOT))
spec=importlib.util.spec_from_file_location("icrsp_hashes", ROOT/"fingerprint_commentary_bodies.py")
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

HTML = """<h2>1st Advent</h2><h3>Commentaires</h3>
<details class='pf-cate-cadre'>
<summary>Dom Guéranger, l'Année liturgique</summary>
<div class='corps'>
<p class='mx-comm-titre'>Dom Guéranger, l'Année liturgique</p>
<p>The first original passage contains sacred references, without copying them into the result.</p>
</div></details>
<h3>Textes de la Messe</h3><details class='pf-cate-cadre'>
<summary>Other non-commentary text</summary><p>Must not be indexed.</p>
</details>"""

class FingerprintTests(unittest.TestCase):
    def test_exact_one_commentary_body_hash(self):
        rows=mod.fingerprint(HTML)
        self.assertEqual(len(rows),1)
        self.assertEqual(len(rows[0]['bodyTextSha256']),64)
        self.assertNotIn('passage',str(rows))
        self.assertFalse(rows[0]['textStored'])
        self.assertGreater(rows[0]['bodyCharacterCount'],20)

    def test_same_content_ignoring_summary_and_title(self):
        newer=HTML.replace('Dom Guéranger, l\\'Année liturgique',
                           'Dom Schuster, Liber Sacramentorum')
        self.assertEqual(mod.fingerprint(HTML)[0]['bodyTextSha256'],
                         mod.fingerprint(newer)[0]['bodyTextSha256'])

    def test_text_changed_changes_hash(self):
        newer=HTML.replace('original passage', 'newer passage')
        self.assertNotEqual(mod.fingerprint(HTML)[0]['bodyTextSha256'],
                            mod.fingerprint(newer)[0]['bodyTextSha256'])

    def test_sitewide_author_string_no_commentary_panel(self):
        self.assertEqual(mod.fingerprint('<script>Guéranger Schuster Parsch</script>'
                                         '<h2>Document</h2>'),[])

if __name__=="__main__":
    unittest.main()
