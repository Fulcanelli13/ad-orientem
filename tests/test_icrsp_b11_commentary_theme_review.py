"""Verify B11 website-grounded thematic review does not imply source or rights approval."""
import json
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
def load(path):
    return json.loads((ROOT/path).read_text(encoding="utf-8"))

class B11Themes(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.b10=load("data/source-text/icrsp-france-b10-lent-pentecost51-content-screen.v1.json")
        cls.b11=load("data/source-text/icrsp-france-b11-40-commentary-theme-review.v1.json")
        cls.paths=load("data/source-text/icrsp-france-temporal-193-sourcepath-crosswalk.v1.json")
        cls.sourceById={r["articleId"]:r for r in cls.paths["rows"]}

    def test_every_unread_b10_source_now_has_one_research_topic(self):
        old=[r for r in self.b10["rows"] if not r["sourceBodyReadInBatch"]]
        new=self.b11["rows"]
        self.assertEqual(len(old),40)
        self.assertEqual(len(new),40)
        self.assertEqual({r["articleId"] for r in old},{r["articleId"] for r in new})
        self.assertEqual(len({r["articleId"] for r in new}),40)
        self.assertEqual(len({r["oneSourceGroundedTheme"] for r in new}),40)
        self.assertEqual(self.b11["combinedArticleThemesSampled"],51)
        self.assertEqual({r["articleId"] for r in self.b10["rows"] if r["sourceBodyReadInBatch"]}
                         &{r["articleId"] for r in new},set())

    def test_original_source_identification_and_owner_paths_not_conflated(self):
        old={r["articleId"]:r for r in self.b10["rows"]}
        for row in self.b11["rows"]:
            id=row["articleId"]
            self.assertEqual(row["sourceUrl"],old[id]["sourceUrl"])
            self.assertEqual(row["existingScriptureSourcePath"],old[id]["existingSourcePath"])
            self.assertEqual(row["temporalIndexPosition"],old[id]["indexPosition"])
            self.assertEqual(row["sourceUrl"],self.sourceById[id]["sourceUrl"])
            self.assertGreater(self.sourceById[id]["checkedWitnessFileCount"],0)
            self.assertTrue(row["sourceSubsectionLocator"].startswith("Commentaires /"))
            self.assertTrue(row["directlyInspectedICRSPCommentaryOpening"])
            self.assertFalse(row["entireFourOrSixPanelBodiesExhaustivelyCollated"])

    def test_no_licence_authority_or_missing_app_feature_is_inferred(self):
        for row in self.b11["rows"]:
            self.assertFalse(row["originalCommentaryWorkEditionVerified"])
            self.assertFalse(row["originalAuthorQuoteAuthorized"])
            self.assertFalse(row["translatedFrenchTextCopied"])
            self.assertFalse(row["sourceReproductionRightsCleared"])
            self.assertFalse(row["sourceTextUniqueAgainstOtherIcrspArticlesCertified"])
            self.assertFalse(row["paragraphLevelProofAgainstAllAppExistingDayNarrative"])
            self.assertFalse(row["userFacingFeatureGapProven"])
            self.assertFalse(row["productionImportApproved"])
        self.assertEqual(self.b11["fullTextWorksOrOriginalEditionsCollated"],0)
        self.assertEqual(self.b11["completeHistoricalCommentaryPanelsExhaustivelyCriticallyRead"],0)
        self.assertEqual(self.b11["newExplicitlyCertifiedAbsencesInApp"],0)
        self.assertEqual(self.b11["publicationApproved"],0)
        self.assertEqual(self.b11["sourceParagraphsStored"],0)

    def test_editorial_risk_remains_explicit(self):
        rows=self.b11["rows"]
        self.assertEqual(sum(self.b11["dispositions"].values()),40)
        self.assertEqual(self.b11["riskReviewRows"],6)
        self.assertEqual(len([r for r in rows if
            r["decision"]=="HIGH_CONTEXTUALIZATION_RISK_DO_NOT_PROMOTE"]),6)
        self.assertIn("JERUSALEM_SIEGE_AND_ESCHATOLOGY",
                      {r["primaryThemeCode"] for r in rows})
        self.assertTrue(any("different" in r["editorialCaution"].lower()
                            for r in rows if r["articleId"]=="a0207_ancien")
                            or any("differ" in r["editorialCaution"].lower()
                            for r in rows if r["articleId"]=="a0207_ancien"))

if __name__=="__main__":
    unittest.main()
