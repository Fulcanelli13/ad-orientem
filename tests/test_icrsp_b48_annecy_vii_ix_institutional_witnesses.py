"""B48 provenance: partial openings and secondary monastery references are not print authentication."""
import json
import unittest
from pathlib import Path

D=Path(__file__).resolve().parents[1]/"data"/"source-text"
def load(file):
    return json.loads((D/file).read_text(encoding="utf-8"))

class B48InstitutionalCrosscheck(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.r=load("icrsp-france-b48-annecy-vii-ix-institutional-opening-date-gates.v1.json")
        cls.b47=load("icrsp-france-b47-annecy-vol7-vol9-eleven-workitem-crosswalk.v1.json")
        cls.b40=load("icrsp-france-b40-29-named-salesian-annecy-toc-crosswalk.v1.json")

    def test_three_edition_openings_are_preexisting_and_hash_exact(self):
        original={row["articleId"]:row for row in self.b40["records"]}
        rows=self.r["volumeIXOpeningConcordances"]
        self.assertEqual({r["entry"] for r in rows},{"IV","XVI","XIX"})
        self.assertEqual(len(rows),3)
        self.assertEqual(sum(not r["priorB40OpeningCompared"] for r in rows),2)
        for row in rows:
            item=original[row["articleId"]]
            self.assertEqual(row["sourcePanelSha256"],item["sourcePanelHash"])
            self.assertEqual(item["annecyEditionCandidate"]["volume"],9)
            self.assertEqual(row["entry"],item["annecyEditionCandidate"]["indexNumber"])
            self.assertLess(row["hostStart"],row["hostNextHistoricalPiece"])
            self.assertFalse(row["wholeSermonCollated"])
            self.assertFalse(row["printImageInspected"])

    def test_exact_two_secondary_monastic_book_page_pointers(self):
        links=self.r["independentInstitutionalEditionPageCitations"]
        self.assertEqual([(r["volume"],r["entry"],r["monasteryPage"]) for r in links],[(9,"IV",27),(7,"LI",373)])
        self.assertTrue(all(not x["directScannedPageChecked"] for x in links))
        self.assertTrue(self.r["volumeVII1601LazarusMonasteryWitness"]["cannotAssignAllMonasteryAdaptedWordingTo1601"])

    def test_conjectural_date_must_not_be_promoted(self):
        x=self.r["volumeVIILXDateException"]
        self.assertEqual(x["editionEntry"],"VII.LX")
        self.assertEqual(x["dateStatus"],"CONJECTURED_FROM_HANDWRITING_BY_ANNECY_EDITORS")
        self.assertEqual(x["separateSubworkIDs"],["ANNECY_VII_LX_I","ANNECY_VII_LX_II"])
        self.assertEqual(x["editedDates"],["1602-06-23","1602-06-24"])
        self.assertFalse(x["eitherSermonDeliveredOnSpecificDateCertified"])

    def test_no_new_print_or_publication_claim(self):
        c=self.r["counts"]
        self.assertEqual(c["existingCrosswalkNamedWorks"],27)
        self.assertEqual(c["namedWorksWithIndependentHistoricalPrintedBookScanOCRStill"],16)
        self.assertEqual(c["remainingWithoutIndependentScanOCR"],11)
        self.assertEqual(c["printPagesPhotographicallyCertifiedThisPass"],0)
        self.assertEqual(c["rightsCleared"],0)
        self.assertEqual(c["appPublicationApproved"],0)
        self.assertTrue(self.r["boundaries"]["noProductionCodeChanged"])
        self.assertTrue(self.r["boundaries"]["noSourceProseStored"])

if __name__=="__main__":
    unittest.main()
