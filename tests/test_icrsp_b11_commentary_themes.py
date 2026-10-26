"""B11 ICRSP commentary theme inventory; research-only and nonpublishing."""
import json
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
def load(path):
    return json.loads((ROOT/path).read_text(encoding="utf-8"))

class CommentaryB11(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.b10=load("data/source-text/icrsp-france-b10-lent-pentecost51-content-screen.v1.json")
        cls.b11=load("data/source-text/icrsp-france-b11-remaining40-commentary-themes.v1.json")
        cls.paths=load("data/source-text/icrsp-france-temporal-193-sourcepath-crosswalk.v1.json")

    def test_scope_exactly_fills_remaining_b10_articles(self):
        a=self.b10["rows"]
        old={r["articleId"] for r in a if r["sourceBodyReadInBatch"]}
        waiting={r["articleId"] for r in a if not r["sourceBodyReadInBatch"]}
        new={r["articleId"] for r in self.b11["rows"]}
        self.assertEqual(len(a),51)
        self.assertEqual(len(old),11)
        self.assertEqual(len(new),40)
        self.assertEqual(new,waiting)
        self.assertFalse(new.intersection(old))
        self.assertEqual(len(new.union(old)),51)

    def test_panel_counts_and_existing_exact_source_paths(self):
        previous={r["articleId"]:r for r in self.b10["rows"]}
        paths={r["articleId"]:r for r in self.paths["rows"]}
        self.assertEqual(self.b11["totals"]["sourcePanelOccurrences"],179)
        self.assertEqual(self.b10["totals"]["sourcePanelOccurrences"],227)
        self.assertEqual(self.b11["totals"]["lentPages"],23)
        self.assertEqual(self.b11["totals"]["postPentecostPages"],17)
        self.assertEqual(sum(r["sourcePanelCount"] for r in self.b11["rows"]),179)
        for r in self.b11["rows"]:
            p=previous[r["articleId"]]
            s=paths[r["articleId"]]
            self.assertEqual(r["sourceUrl"],p["sourceUrl"])
            self.assertEqual(r["existingSourcePath"],p["existingSourcePath"])
            self.assertEqual(r["existingSourcePath"],s["sourcePathCandidate"])
            self.assertGreater(s["checkedWitnessFileCount"],0)
            self.assertEqual(r["sourcePanelCount"],p["commentaryPanelInstances"])

    def test_not_a_full_original_work_collation_and_cautionary(self):
        self.assertEqual(self.b11["totals"]["fullOriginalAuthorPrintEditionCollations"],0)
        self.assertEqual(self.b11["totals"]["actualModuleMissingGapsCertified"],0)
        self.assertEqual(self.b11["totals"]["sourceTextReproductionApprovals"],0)
        self.assertEqual(self.b11["totals"]["publishedChanges"],0)
        for r in self.b11["rows"]:
            self.assertFalse(r["passageReview"]["allPanelsCriticallyCollated"])
            self.assertFalse(r["passageReview"]["originalWorkEditionVerified"])
            self.assertFalse(r["passageReview"]["sourceTextStored"])
            self.assertFalse(r["comparisons"]["actualDaySpecificContentChecked"])
            self.assertFalse(r["comparisons"]["publicationApproved"])
            self.assertFalse(r["comparisons"]["verifiedMissingFeature"])
            self.assertTrue(r["topic"]["theme"].strip())
            self.assertTrue(r["topic"]["caution"].strip())
        conflict=next(x for x in self.b11["rows"] if x["articleId"]=="a0207_ancien")
        self.assertIn("CONFLICT",conflict["topic"]["caution"])
        caution=next(x for x in self.b11["rows"] if x["articleId"]=="a0243_ancien")
        self.assertIn("anti-Jewish",caution["topic"]["caution"])

if __name__=="__main__":
    unittest.main()
