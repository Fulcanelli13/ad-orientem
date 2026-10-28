"""B49: exact source-work boundary and three-zone concordance cannot claim full text or rights."""
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]/"data"/"source-text"
def rd(name):
    return json.loads((ROOT/name).read_text(encoding="utf-8"))

class TestB49WorkEnvelopes(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.r=rd("icrsp-france-b49-vol9-three-whole-work-boundary-three-zone-concordance.v1.json")
        cls.b48=rd("icrsp-france-b48-annecy-vii-ix-institutional-opening-date-gates.v1.json")
        cls.b47=rd("icrsp-france-b47-annecy-vol7-vol9-eleven-workitem-crosswalk.v1.json")

    def test_3_existing_distinct_work_envelopes(self):
        indexed={r["articleId"]:r for r in self.b48["volumeIXOpeningConcordances"]}
        records=self.r["records"]
        self.assertEqual(len(records),3)
        self.assertEqual({r["articleId"] for r in records},set(indexed))
        self.assertEqual({r["editionWorkId"] for r in records},{"IX.IV","IX.XVI","IX.XIX"})
        self.assertEqual([r["otherWorksOnHostArticle"] for r in records],[4,3,2])
        for r in records:
            parent=indexed[r["articleId"]]
            self.assertGreaterEqual(r["hostContentLineEnvelope"][0],parent["hostStart"]+1)
            self.assertLessEqual(r["hostContentLineEnvelope"][0],parent["hostStart"]+2)
            self.assertEqual(r["hostContentLineEnvelope"][1]+1,r["nextDistinctHistoricalWorkBeginsAt"]["host"])
            self.assertEqual(r["editionWorkContentLineEnvelope"][1]+1,r["nextDistinctHistoricalWorkBeginsAt"]["edition"])

    def test_opening_middle_ending_correspondence_is_not_full_diff(self):
        for r in self.r["records"]:
            anchors=r["orderedAnchorPairs"]
            self.assertEqual([a["name"] for a in anchors],["OPENING","MIDDLE","ENDING"])
            for a in anchors:
                self.assertLessEqual(r["hostContentLineEnvelope"][0],a["host"][0])
                self.assertLessEqual(a["host"][1],r["hostContentLineEnvelope"][1])
                self.assertLessEqual(r["editionWorkContentLineEnvelope"][0],a["edition"][0])
                self.assertLessEqual(a["edition"][1],r["editionWorkContentLineEnvelope"][1])
            self.assertFalse(r["fullWordByWordCollationCertified"])
        self.assertEqual(self.r["counts"]["individualAnchorsCompared"],9)

    def test_host_versus_edition_no_misclassification(self):
        for r in self.r["records"]:
            self.assertTrue(r["originalEarlyModernFrenchViaRecordedSermon"])
            self.assertTrue(r["notLatinOriginalTranslatedIntoFrench"])
            for flag in ("printPagePhotographInspected","recorderOriginalNotesInspected","hostSiteReproductionRightsCleared","appOwnerParityCertified","productionPublicationApproved"):
                self.assertFalse(r[flag])

    def test_research_only_not_app_content(self):
        self.assertEqual(self.r["counts"]["fullWordByWordWorkCollations"],0)
        self.assertEqual(self.r["counts"]["independentPrintPagePhotographsSeen"],0)
        self.assertEqual(self.r["counts"]["rightsClearances"],0)
        self.assertEqual(self.r["counts"]["appOwnerParityApprovals"],0)
        self.assertEqual(self.r["counts"]["publishedContentChanges"],0)
        self.assertFalse(self.r["publicationApproved"])
        self.assertTrue(self.r["noSourceProseCopied"])

if __name__=="__main__":
    unittest.main()
