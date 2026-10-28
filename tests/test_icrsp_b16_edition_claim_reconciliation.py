"""B16: no spurious section concordance, verse inflation or production release."""
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
def data(path):
    return json.loads((ROOT/path).read_text(encoding="utf-8"))

class SourceEditionAndOwnerParity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.b12=data("data/source-text/icrsp-france-b12-atomic-claim-and-lection-boundaries.v1.json")
        cls.b15=data("data/source-text/icrsp-france-b15-original-language-and-print-evidence.v1.json")
        cls.b16=data("data/source-text/icrsp-france-b16-edition-divergence-crossdomain-parity.v1.json")

    def test_all_existing_b12_claims_preserved_with_original_readings(self):
        previous={r["id"]:r for r in self.b12["readings"]}
        rows=self.b16["rows"]
        self.assertEqual(len(rows),7)
        self.assertEqual({r["b12ClaimId"] for r in rows},set(previous))
        self.assertEqual(len({r["sourcePath"] for r in rows}),5)
        for r in rows:
            original=previous[r["b12ClaimId"]]
            self.assertEqual(r["articleId"],original["articleId"])
            self.assertEqual(r["sourcePath"],original["sourcePath"])
            self.assertEqual(r["actualProperReadingPair"],original["currentReadingPair"])
            self.assertEqual(r["ownerTarget"],"EXISTING_SCRIPTURE_CORRESPONDENCES_PR_1553")
            self.assertFalse(r["allOtherCompendiumEvidenceSemanticallyChecked"])
            self.assertFalse(r["criticalPrintWitnessApproved"])
            self.assertFalse(r["rightsAndAttributionGatePassed"])
            self.assertFalse(r["productionRecordApproved"])

    def test_hippolytus_original_language_does_not_overcertify_numbering(self):
        exc=self.b16["sectionIdentityException"]
        self.assertEqual(exc["claimId"],"ICRSP-B12-CLM-004")
        self.assertFalse(exc["normalizedUnambiguousSectionIdentifierApproved"])
        self.assertIn("I.15.5",exc["modernNumber"])
        self.assertEqual(exc["separateGreekSearchIndexNumber"],"14.5")
        self.assertIn("GCS",exc["bonwetschOcrGroup"])
        sources=self.b16["recheckSources"]
        self.assertEqual(len(sources),3)
        self.assertFalse(sources[0]["originalPrintedPageImageRead"])
        self.assertFalse(sources[0]["greekOCRReliablyPrintable"])
        self.assertFalse(sources[1]["sourceEditionMappingNotVerified"] is False)
        self.assertFalse(sources[2]["reproductionRightsCleared"])

    def test_six_print_page_gates_remain_open(self):
        p=self.b16["historicalPrintGates"]
        self.assertEqual(len(p),6)
        self.assertEqual({x["id"] for x in p},
          {"FABRICIUS1716_P27","GUERANGER1903_NAAMAN","GUERANGER1903_SUSANNA",
           "PARISOT1894_VIII11","PARISOT1894_XXI14","PARISOT1894_XXI15"})
        self.assertTrue(all(x["printedPageVisualInspection"] is False for x in p))
        self.assertEqual(self.b16["totals"]["originalPrintedPageVisualChecks"],0)
        self.assertEqual(self.b15["count"]["printedFabriciusPage27Compared"],0)

    def test_claims_are_not_produced_or_duplicate_overclaimed(self):
        x=self.b16
        self.assertEqual(x["scriptureCorrespondencesCrosswalk"]["existingOwnerPr"],1553)
        self.assertEqual(x["scriptureCorrespondencesCrosswalk"]["namedTopicRows"],56)
        self.assertEqual(x["scriptureCorrespondencesCrosswalk"]["specificNamedNaamanSusannaElijahElishaTopics"],0)
        self.assertEqual(x["totals"]["b12AtomicClaimsMapped"],7)
        self.assertEqual(x["totals"]["publishedAppClaims"],0)
        self.assertTrue(all(value is False for value in x["protection"].values()))
        hold=next(r for r in x["rows"] if r["b12ClaimId"]=="ICRSP-B12-CLM-007")
        self.assertEqual(hold["actualProperReadingPair"]["lesson"],"Genesis 37:6–22")
        self.assertIn("GENESIS37_28",hold["attestationGrade"])

if __name__=="__main__":
    unittest.main()
