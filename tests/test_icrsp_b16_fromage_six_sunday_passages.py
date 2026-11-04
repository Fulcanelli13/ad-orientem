"""B16: Fromage source concordance is not original print collation or app release."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
def load(path):
    return json.loads((ROOT/path).read_text(encoding="utf-8"))

class FromageSixSundayPassageCrosscheck(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.b16 = load("data/source-text/icrsp-france-b16-fromage-six-sunday-passage-crosscheck.v1.json")
        cls.b14 = load("data/source-text/icrsp-france-b14-continued-work-authorship-and-original-loci.v1.json")

    def test_six_real_source_pages_keep_existing_owners(self):
        rows = self.b16["records"]
        self.assertEqual(len(rows), 6)
        expected = {4:"a0222_nouveau", 11:"a0364_ancien", 12:"a0365_ancien",
                    17:"a0443_ancien", 19:"a0478_ancien", 22:"a0488_ancien"}
        flagged = {r["articleId"]:r for r in self.b14["attributionCohort"]["items"]}
        self.assertEqual({r["sundayAfterPentecost"]:r["articleId"] for r in rows}, expected)
        for row in rows:
            previous = flagged[row["articleId"]]
            self.assertEqual(row["sourceUrl"], previous["sourceUrl"])
            self.assertEqual(row["existingProperSourcePath"], previous["existingMassSourcePath"])
            self.assertTrue(row["independentlyLocatedInSecondaryHistoricalStudy"])
            self.assertEqual(row["authorInference"], "FROMAGE_CONTINUATION_STRONGLY_SUPPORTED_NOT_ORIGINAL_PAGE_PROVEN")
            self.assertFalse(row["continuationPrintedDayPageVisualInspection"])
            self.assertFalse(row["workEditionDayPageIdentified"])
            self.assertFalse(row["publicAttributionApproved"])
            self.assertTrue(row["notNormative1962Rubric"])

    def test_citations_editions_and_release_holds(self):
        p=self.b16
        self.assertEqual(p["counts"]["postPentecostSourceArticlesAlreadyFlaggedInB14"], 22)
        self.assertEqual(p["counts"]["distinctSundayPassagesWithHostAndSecondaryTextualAnchor"], 6)
        for key in ("originalContinuationPrintedDayPagesVisuallyInspected",
                    "fullyCriticalOriginalParagraphCollations",
                    "canonicalAuthorChanges","productionPublicationChanges"):
            self.assertEqual(p["counts"][key], 0)
        self.assertTrue(p["records"][0]["secondaryCenturyNumeralVariantNeedsPrintCheck"])
        self.assertEqual(sum(r["secondaryCenturyNumeralVariantNeedsPrintCheck"] for r in p["records"]), 1)
        self.assertIn("1883", p["sources"]["historical1883ReviewLocation"])
        self.assertIn("1882", " ".join(p["editionCaveats"]))
        self.assertFalse(p["rights"]["projectReadyToPublish"])
        self.assertFalse(p["rights"]["hostedFrenchCommentaryRedistributionApproved"])
        self.assertEqual(p["routing"]["massReaderOrRubrics"],"DO_NOT_CHANGE")

if __name__=="__main__":
    unittest.main()
