"""B13 verifies handoff is bounded by real B12 claim IDs and never licenses source text."""
import json
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
def read(path):
    return json.loads((ROOT/path).read_text(encoding="utf-8"))

class B13PatristicHandoff(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.b12=read("data/source-text/icrsp-france-b12-atomic-claim-and-lection-boundaries.v1.json")
        cls.b13=read("data/source-text/icrsp-france-b13-patristic-loci-crossbranch-handoff.v1.json")

    def test_all_b12_claims_mapped_without_creating_new_corpus(self):
        x=self.b13
        self.assertEqual(len(x["rows"]),7)
        self.assertEqual({r["b12ClaimId"] for r in x["rows"]},
                         {r["id"] for r in self.b12["readings"]})
        byid={r["id"]:r for r in self.b12["readings"]}
        for r in x["rows"]:
            self.assertEqual(r["topicCode"],byid[r["b12ClaimId"]]["topicCode"])
            self.assertEqual(r["existingThematicOwner"],"SCRIPTURE_CORRESPONDENCES_PR_1553")
            self.assertIs(r["newThematicTopicToCreateWithoutOwnerReview"],False)
            for flag in ("originalWorkCriticalTextApproved","originalLanguageVerified",
                         "appAbsenceProven","licenceCleared","directPublishedTextApproved"):
                self.assertIs(r[flag],False)
        self.assertIs(x["noProductionChanges"],True)
        self.assertIs(x["scriptureCorrespondencesOwner"]["mergedIntoOtherBranch"],False)
        self.assertEqual(x["scriptureCorrespondencesOwner"]["pr"],1553)

    def test_two_specific_loci_are_translations_not_original_critical_editions(self):
        refs={w["id"]:w for w in self.b13["bibliographicTrail"]}
        self.assertEqual(refs["AMBR_MYST"]["locus"],"III.16–17")
        self.assertIs(refs["AMBR_MYST"]["sourcePassageLocated"],True)
        self.assertIs(refs["AMBR_MYST"]["originalLatinEditionCollated"],False)
        self.assertEqual(refs["HIP_DAN"]["locus"],"I.15.5–6; related baptismal/Church imagery I.17.3–6")
        self.assertEqual(refs["HIP_DAN"]["modernTranslationPrintedPage"],25)
        self.assertIs(refs["HIP_DAN"]["printedModernTranslationPageVisuallyVerified"],True)
        self.assertIs(refs["HIP_DAN"]["originalGreekOrSlavonicCollated"],False)
        self.assertIs(refs["HIP_DAN"]["appTextReproductionApproved"],False)
        self.assertIs(refs["GUE_1903"]["articleDayTextIdentityInThisEditionConfirmed"],False)
        self.assertEqual(self.b13["counts"]["distinctEarlyChristianAuthorWorksLocated"],2)
        self.assertEqual(self.b13["counts"]["originalLatinGreekSlavonicPassagesCriticallyCollated"],0)

    def test_art_edition_polemic_and_lection_holds_are_not_discarded(self):
        holds={h["id"]:h for h in self.b13["holds"]}
        self.assertEqual(len(holds),5)
        self.assertEqual(holds["SUSANNA_ART_IDENTIFICATION"]["disposition"],
            "HOLD_UNTIL_ARCHAEOLOGICAL_SITE_OBJECT_AND_DATE_VERIFIED")
        self.assertIn("PERIOD_POLEMIC",holds)
        self.assertIn("GUE_ORIGINAL_DAY_EDITION",holds)
        self.assertEqual(holds["JOSEPH_OUTSIDE_MASS_LECTION"]["disposition"],
            "STRICT_PROPER_BOUNDARY_REMAINS_HOLD")
        self.assertIn("NO_RIGHTS_OVERRIDE",holds)
        for key in ("printedOriginalFrenchGuerangerDayLociCollated",
                    "independentHistoricArtworkObjectsVerified",
                    "clearedModernCommentaryReproductionRights",
                    "certifiedNewUserVisibleContentGaps",
                    "createdProductionTypologyRecords"):
            self.assertEqual(self.b13["counts"][key],0,key)

if __name__=="__main__":
    unittest.main()
