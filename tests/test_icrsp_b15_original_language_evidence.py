"""ICRSP B15: source-language TEI has not silently become critical print approval."""
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
def load(p):
    return json.loads((ROOT/p).read_text(encoding="utf8"))

class OriginalLanguageEvidence(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.p=load("data/source-text/icrsp-france-b15-original-language-and-print-evidence.v1.json")
        cls.b14=load("data/source-text/icrsp-france-b14-gueranger-aphrahat-source-claims.v1.json")

    def test_three_correct_aphrahat_sections_are_linked_to_existing_loci(self):
        p=self.p
        self.assertEqual(len(p["loci"]),3)
        originals={r["id"]:r for r in cls_b14_loci(self.b14)}
        seen=set()
        for row in p["loci"]:
            self.assertIn(row["id"],originals)
            self.assertNotIn(row["id"],seen)
            seen.add(row["id"])
            self.assertEqual(row["language"] if "language" in row else row["originalLanguage"],"Classical Syriac")
            self.assertEqual(originals[row["id"]]["locus"],f"{roman(row['demonstration'])}.{row['section']}")
            self.assertTrue(row["sectionStructureVerifiedInTEI"])
            self.assertTrue(row["originalSyriacAlphabetTextPresent"])
            self.assertGreater(row["sectionOriginalLanguageChars"],100)
            self.assertTrue(all(len(key)>0 for key in row["sourceVisibleLexemes"]))
            self.assertFalse(row["preciseParisotPageOrColumnIdentified"])
            self.assertFalse(row["criticalEditionSemanticsApproved"])
            self.assertFalse(row["directPublishedCommentaryApproved"])
            self.assertEqual(len(row["inspectedCommitFileBlobSha"]),40)

    def test_not_accidentally_lying_about_original_print_or_rights(self):
        p=self.p
        self.assertEqual(p["count"]["digitalOriginalLanguageSectionTextRead"],3)
        self.assertEqual(p["count"]["digitalFilesRead"],2)
        for k in ("printedParisotRelevantPagesCompared","printedFabriciusPage27Compared",
                  "printedGueranger1903DayPagesCompared",
                  "originalLanguageCriticalPhilologicalTranslationsCertified","visibleSourceAppChanges"):
            self.assertEqual(p["count"][k],0)
        self.assertFalse(p["publicationApproved"])
        cats={s["id"]:s for s in p["sourceCataloguing"]}
        self.assertTrue(cats["PARISOT1894"]["digitalEditionUncorrected"])
        self.assertFalse(cats["PARISOT1894"]["printedRelevantPagesVisuallyInspected"])
        self.assertEqual(cats["FABRICIUS1716"]["digitalId"],"bsb11759163")
        self.assertFalse(cats["FABRICIUS1716"]["relevantPrintedPage27VisuallyInspected"])
        self.assertFalse(cats["GUERANGER1903"]["authentic1903OriginalPrintImagesForTwoDayParagraphsInspected"])
        self.assertIn("1911",cats["GUERANGER1903"]["sourceScanIssue"])

    def test_different_episodes_not_conflated(self):
        p={r["id"]:r for r in self.p["loci"]}
        self.assertTrue(p["APHRAHAT_DEM8_11"]["sourceVisibleLexemes"]["elijah"])
        self.assertTrue(p["APHRAHAT_DEM8_11"]["sourceVisibleLexemes"]["elisha"])
        self.assertTrue(p["APHRAHAT_DEM21_14"]["sourceVisibleLexemes"]["lazarus"])
        self.assertTrue(p["APHRAHAT_DEM21_15"]["sourceVisibleLexemes"]["elisha"])
        self.assertFalse(p["APHRAHAT_DEM21_15"]["sourceVisibleLexemes"]["lazarus"])

def cls_b14_loci(b14):
    return b14["patristicLoci"]

def roman(n):
    return {8:"VIII",21:"XXI"}[n]

if __name__=="__main__":
    unittest.main()
