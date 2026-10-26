"""B45: independent 1897 scanned-edition OCR supersedes prior web transcription date but not photo inspection."""
import json,unittest,datetime
from pathlib import Path
D=Path(__file__).resolve().parents[1]/"data"/"source-text"
def load(n):return json.loads((D/n).read_text(encoding="utf-8"))
class B45PrintedOcrWitness(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.b41=load("icrsp-france-b41-two-salesian-dating-source-witness-reconciliation.v1.json")
  cls.b45=load("icrsp-france-b45-independent-1897-scan-ocr-salesian-date-reconciliation.v1.json")
 def test_same_two_items_and_exact_three_host_occurrences(self):
  self.assertEqual({x["caseId"] for x in self.b45["witnesses"]},{x["caseId"] for x in self.b41["cases"]})
  self.assertEqual(self.b45["counts"]["hostOccurrences"],3)
  self.assertEqual(self.b45["counts"]["distinctEditionItems"],2)
  old={c["caseId"]:c for c in self.b41["cases"]}
  for w in self.b45["witnesses"]:self.assertEqual(w["hostIDs"],old[w["caseId"]]["matchedArticleIds"])
 def test_independent_1897_ocr_1617_date_and_edition_conflict(self):
  a=next(x for x in self.b45["witnesses"] if x["entryNumber"]=="CXXXVII")
  self.assertEqual(a["originalEditedPrintedEditionOCRHeadingDate"],"1617-03-02")
  self.assertEqual(a["originalEditedPrintedEditionOCRContentsDate"],"1617-03-02")
  self.assertEqual(a["donBoscoWebTranscriptionHeadingDate"],"1617-03-03")
  self.assertEqual(a["newPrintedTableOfContentsStartingPage"],325)
  self.assertEqual(a["priorDonBoscoEmbeddedPageCandidate"],324)
  self.assertEqual(datetime.date.fromisoformat(a["bestSupportedEditionBibliographicDate"]).strftime("%A"),"Thursday")
 def test_1612_date_and_delivery_distinct(self):
  a=next(x for x in self.b45["witnesses"] if x["entryNumber"]=="LXXXVIII")
  self.assertEqual(a["kind"],"SOMMAIRE")
  self.assertEqual(a["bestSupportedEditionBibliographicDate"],"1612-04-20")
  self.assertEqual(a["newPrintedTableOfContentsStartingPage"],100)
  self.assertEqual(a["priorDonBoscoEmbeddedPageCandidate"],99)
  self.assertFalse(a["historicalSermonDeliveredOnDateProved"])
  self.assertEqual(datetime.date.fromisoformat(a["bestSupportedEditionBibliographicDate"]).strftime("%A"),"Friday")
 def test_no_original_print_photo_rights_or_publication_false_promotions(self):
  self.assertEqual(self.b45["counts"]["printPagePhotographsVisuallyInspected"],0)
  self.assertEqual(self.b45["counts"]["licensingClearances"],0)
  self.assertEqual(self.b45["counts"]["productionApprovals"],0)
  self.assertTrue(self.b45["correctiveDecision"]["B41_B44RemainHistoricalEvidence"])
  self.assertFalse(self.b45["independentWitness"]["OCRIsVisualCertification"])
  for w in self.b45["witnesses"]:
   for field in ("historicalSermonDeliveredOnDateProved","scannedPagePhotographVisuallyInspected","manuscriptDatingReviewed","fullWorkTextCollated","rightsCleared","productionApproved"):
    self.assertFalse(w[field])
if __name__=="__main__":unittest.main()
