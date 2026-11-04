import pathlib
import sys
import unittest
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "tools" / "artwork"))
import lyon_official_source_discovery as d

class LyonSourceDiscoveryTest(unittest.TestCase):
    def test_exact_official_media_only(self):
        self.assertTrue(d.eligible_media_url(
            "https://www.mba-lyon.fr/sites/mba/files/medias/images/poussin.jpg"))
        self.assertFalse(d.eligible_media_url(
            "https://fake.mba-lyon.fr/sites/mba/files/medias/images/poussin.jpg"))
        self.assertFalse(d.eligible_media_url("http://www.mba-lyon.fr/sites/mba/files/x.jpg"))
        self.assertFalse(d.eligible_media_url("https://www.mba-lyon.fr/other/file.jpg"))

    def test_matches_only_relevant_image(self):
        markup = '''
        <figure><img alt="Pérugin L'Ascension du Christ"
          src="/sites/mba/files/medias/images/perugin-ascension.jpg"></figure>
        <figure><img alt="Rubens l'Adoration des mages"
          src="/sites/mba/files/medias/images/rubens.jpg"></figure>
        <figure><img alt="Nicolas Poussin La Fuite en Egypte"
          src="/sites/mba/files/medias/images/poussin.jpg"></figure>
        <figure><img alt="Landscape"
          src="/sites/mba/files/medias/images/landscape.jpg"></figure>
        '''
        result = d.collect(markup)
        self.assertEqual(len(result["targets"]), 3)
        self.assertEqual([len(t["matches"]) for t in result["targets"]], [1,1,1])
        for t in result["targets"]:
            m = t["matches"][0]
            self.assertTrue(m["exact_artist_and_subject_in_label"])
            self.assertTrue(m["must_verify_visual_identity"])
        self.assertFalse(result["publication"])

    def test_same_artist_different_subject_not_accepted(self):
        markup = '<img alt="Nicolas Poussin La Mort de Chione" src="/sites/mba/files/content/medias/images/poussin_chione_presse.jpg">'
        result = d.collect(markup)
        poussin = next(x for x in result["targets"] if x["approved_record_index"] == 373)
        self.assertEqual(poussin["matches"], [])

    def test_no_false_publication_when_no_match(self):
        result = d.collect('<img src="/sites/mba/files/other.jpg" alt="Nature morte">')
        self.assertTrue(all(not t["matches"] for t in result["targets"]))
        self.assertFalse(result["automatically_approved"])

if __name__ == "__main__":
    unittest.main()
