"""B17 evidence guard: hosted passages and edition catalogue rows are not printed-edition collation."""
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
def load(p):return json.loads((ROOT/p).read_text(encoding="utf-8"))

class FromageEditionLedger(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.b14=load("data/source-text/icrsp-france-b14-continued-work-authorship-and-original-loci.v1.json")
        cls.b16=load("data/source-text/icrsp-france-b16-fromage-six-sunday-passage-crosscheck.v1.json")
        cls.b17=load("data/source-text/icrsp-france-b17-fromage-edition-ledger-and-two-more-text-matches.v1.json")

    def test_exact_b14_owner_paths_and_non_duplicate_eight(self):
        p=self.b17
        prior={r["articleId"] for r in self.b16["records"]}
        flagged={r["articleId"]:r for r in self.b14["attributionCohort"]["items"]}
        new=p["incrementalCrossHostPassages"]
        self.assertEqual({r["articleId"] for r in new},{"a0223_nouveau","a0241_ancien"})
        self.assertEqual(len(prior),6)
        self.assertEqual(set(p["previouslyCrossHostedArticleIds"]),prior)
        self.assertFalse(prior & {r["articleId"] for r in new})
        self.assertEqual(len(prior | {r["articleId"] for r in new}),8)
        for r in new:
            owner=flagged[r["articleId"]]
            self.assertEqual(r["primaryHostWebPage"],owner["sourceUrl"])
            self.assertEqual(r["existingProperSourcePath"],owner["existingMassSourcePath"])
            self.assertFalse(r["originalPrintedParagraphRead"])
            self.assertFalse(r["releaseApproved"])
        self.assertEqual(p["counts"]["totalDistinctTextAnchorsInSample"],8)
        self.assertEqual(p["counts"]["b14FlaggedPostPentecostArticles"],22)

    def test_edition_evidence_grades_and_unresolved_century(self):
        p=self.b17
        years={r["year"]:r for r in p["editionWitnesses"]}
        self.assertEqual(sorted(years),[1882,1883,1886,1902,1905,1911])
        self.assertEqual(years[1886]["editionStatement"].split(",")[1].strip(),"troisième édition")
        self.assertEqual(years[1883]["role"],"contemporary_publication_review")
        self.assertTrue(all(not r["originalTitlePageInspected"] for r in years.values()))
        self.assertEqual(p["centuryVariant"]["firstHostReading"],"XVIe siècle")
        self.assertEqual(p["centuryVariant"]["secondHostReading"],"XVe siècle")
        self.assertFalse(p["centuryVariant"]["historicalCenturyAssertionPromotable"])

    def test_no_derived_publication_or_1962_claim(self):
        p=self.b17
        for k in ("originalPhotographedTitlePagesInspected",
                  "originalPhotographedFourthSundayParagraphsInspected",
                  "actualNineteenthCenturyFirstPrintingEditionVerified",
                  "productionChanges"):
            self.assertEqual(p["counts"][k],0)
        self.assertFalse(p["releaseApproved"])
        self.assertIn("Do not infer 1962", " ".join(p["provenanceBoundaries"]))
        self.assertIn("492", " ".join(p["provenanceBoundaries"]))

if __name__=="__main__":
    unittest.main()
