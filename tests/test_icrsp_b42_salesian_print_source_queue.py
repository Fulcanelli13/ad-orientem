"""Research-only B42: scan catalogue leads are not print verification."""
import json
import unittest
from pathlib import Path

D=Path(__file__).resolve().parents[1]/"data"/"source-text"
def read(name): return json.loads((D/name).read_text(encoding="utf-8"))
class TestB42SourceQueue(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.base=read("icrsp-france-b40-29-named-salesian-annecy-toc-crosswalk.v1.json")
  cls.b41=read("icrsp-france-b41-two-salesian-dating-source-witness-reconciliation.v1.json")
  cls.b42=read("icrsp-france-b42-salesian-print-source-authentication-queue.v1.json")
 def test_exact_source_cardinality(self):
  rows={r["articleId"]:r for r in self.base["records"]}
  q=self.b42["workQueue"]
  self.assertEqual(len(q),29)
  self.assertEqual(len({r["sourceArticleId"] for r in q}),29)
  self.assertEqual(len({r["sourcePanelSha256"] for r in q}),27)
  for r in q:
   original=rows[r["sourceArticleId"]]
   self.assertEqual(r["sourcePanelSha256"],original["sourcePanelHash"])
   self.assertEqual(r["annecyEntry"],original["annecyEditionCandidate"]["indexNumber"])
   self.assertEqual(r["annecyVolume"],original["annecyEditionCandidate"]["volume"])
 def test_scan_catalogue_and_dating_discrepancies(self):
  self.assertEqual({v["v"]:v["ref"] for v in self.b42["authoritativeScanCatalogue"]["volumes"]},
                   {7:"NUMM-9736319",8:"NUMM-9736310",9:"NUMM-9734805"})
  self.assertFalse(self.b42["authoritativeScanCatalogue"]["visualInspectionCompleted"])
  d={c["annecyEntry"]:c for c in self.b42["dateDiscrepanciesToCheckInPrint"]}
  self.assertEqual(d["LXXXVIII"]["printedPageCandidate"],99)
  self.assertEqual(d["CXXXVII"]["printedPageCandidate"],324)
  for case in self.b41["cases"]:
   self.assertEqual(d[case["number"]]["hostArticleIds"],case["matchedArticleIds"])
   self.assertFalse(d[case["number"]]["printHeadingAndCriticalNotesVisuallyChecked"])
 def test_research_not_publication(self):
  self.assertEqual(self.b42["counts"]["physicalPrintedPagesVisuallyCompared"],0)
  self.assertEqual(self.b42["counts"]["earlierDigitalOpeningConcordances"],3)
  self.assertEqual(self.b42["counts"]["fullWorkOriginalCollations"],0)
  self.assertFalse(self.b42["rightsConstraint"]["cleared"])
  self.assertFalse(self.b42["appPublicationApproved"])
  self.assertTrue(self.b42["noSourceProseCopied"])
  self.assertTrue(self.b42["noProductionContentChanged"])
  for r in self.b42["workQueue"]:
   for k in ("printImageInspected","completeHistoricalItemCompared","authorshipCertified","hostTextRightsCleared","appParityApproved","publicationApproved"): self.assertFalse(r[k])

if __name__=="__main__": unittest.main()
