"""B47 exact 11 Annecy VII/IX work entries, site duplicates, and nested LX plans."""
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]/"data"/"source-text"
def read(name):
    return json.loads((ROOT/name).read_text(encoding="utf-8"))

class B47SalesianVolume7And9(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.b47=read("icrsp-france-b47-annecy-vol7-vol9-eleven-workitem-crosswalk.v1.json")
        cls.b40=read("icrsp-france-b40-29-named-salesian-annecy-toc-crosswalk.v1.json")
        cls.b46=read("icrsp-france-b46-vol8-14-independent-toc-provenance.v1.json")

    def test_exact_12_host_occurrences_for_11_edition_entries(self):
        rows=self.b47["rows"]
        self.assertEqual(len(rows),12)
        self.assertEqual(sum(x["annecyVolume"]==7 for x in rows),9)
        self.assertEqual(sum(x["annecyVolume"]==9 for x in rows),3)
        self.assertEqual(len({(x["annecyVolume"],x["annecyEntryNumber"]) for x in rows}),11)
        baseline={x["articleId"]:x for x in self.b40["records"]}
        for x in rows:
            b=baseline[x["sourceArticleId"]]
            self.assertEqual(x["sourcePanelSHA256"],b["sourcePanelHash"])
            self.assertEqual(x["annecyEntryNumber"],b["annecyEditionCandidate"]["indexNumber"])
            self.assertEqual(x["editedWorkKind"],b["annecyEditionCandidate"]["indexEntryKind"])

    def test_distinct_subworks_and_repeated_host_hash(self):
        rows=self.b47["rows"]
        lx=next(x for x in rows if x["annecyEntryNumber"]=="LX")
        self.assertEqual([y["workSubID"] for y in lx["nestedHistoricalPieces"]],["ANNECY_VII_LX_I","ANNECY_VII_LX_II"])
        self.assertEqual([y["editorialDate"] for y in lx["nestedHistoricalPieces"]],["1602-06-23","1602-06-24"])
        self.assertEqual(len({x["sourcePanelSHA256"] for x in rows if x["annecyEntryNumber"]=="LXII"}),1)
        self.assertEqual(len([x for x in rows if x["annecyEntryNumber"]=="LXII"]),2)

    def test_two_different_documentary_series(self):
        for x in self.b47["rows"]:
            self.assertTrue(x["editionHeadingAndEntryKindVerifiedInDigitizedTranscription"])
            self.assertTrue(x["navigationNumberIsNotPrintPagination"])
            if x["annecyVolume"]==7:
                self.assertEqual(x["historicalTransmissionSeries"],"ANNECY_FIRST_SERIES_AUTOGRAPH_DERIVED")
            else:
                self.assertEqual(x["historicalTransmissionSeries"],"ANNECY_SECOND_SERIES_VISITATION_RECORDED")

    def test_scope_and_publication_holds(self):
        counts=self.b47["counts"]
        self.assertEqual(counts["allThreeVolumesNamedDistinctWorkEntries"],27)
        self.assertEqual(counts["independentlyCorroborated1897Volume8TOCEntries"],16)
        self.assertEqual(counts["independentlyCorroborated1896Volume7Or1897Volume9TOCEntries"],0)
        for flag in ("noIndependentOriginalPrintClaim","noFullWorkCollationClaim","noTranslationRightsClaim","noProductionContentChanged"):
            self.assertTrue(self.b47["releaseGates"][flag])
        for x in self.b47["rows"]:
            for flag in ("printPhotographChecked","independent1896Or1897ScanOCRCompared","originalAuthorAutographOrRecorderNotesChecked","completeArticleToOriginalWorkVerbatimCollation","rightsApproved","appContentOwnerParityDone","productionApproved"):
                self.assertFalse(x[flag])

if __name__=="__main__":
    unittest.main()
