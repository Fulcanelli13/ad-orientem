"""Research regression: B43 contextual dates, no invented print or autograph authentication."""
import datetime
import json
import unittest
from pathlib import Path
D=Path(__file__).resolve().parents[1]/"data"/"source-text"
def rd(n): return json.loads((D/n).read_text(encoding="utf-8"))
class SalesianB43(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.r=rd("icrsp-france-b43-salesian-contextual-date-witnesses.v1.json")
  cls.prev=rd("icrsp-france-b41-two-salesian-dating-source-witness-reconciliation.v1.json")
 def test_exact_two_preexisting_cases(self):
  self.assertEqual({x["caseId"] for x in self.r["findings"]},{x["caseId"] for x in self.prev["cases"]})
  self.assertEqual(self.r["counts"]["dateConflictItems"],2)
 def test_chronological_adjacent_work(self):
  s=next(x for x in self.r["findings"] if x["caseId"].endswith("LENT_THURSDAY"))
  a,b=s["relatedOriginalEntry"],s["subjectOriginalEntry"]
  self.assertEqual((a["number"],b["number"]),("CXXXVI","CXXXVII"))
  self.assertEqual((a["displayedHeadingDate"],b["displayedHeadingDate"]),("1617-03-01","1617-03-03"))
  self.assertEqual(datetime.date(1617,3,1).strftime("%A"),"Wednesday")
  self.assertEqual(datetime.date(1617,3,2).strftime("%A"),"Thursday")
  self.assertEqual(datetime.date(1617,3,3).strftime("%A"),"Friday")
  self.assertEqual(s["provisionalLiturgicalDay"],"1617-03-02")
  self.assertEqual(s["editionDisplayDateStillPreserved"],"1617-03-03")
  self.assertTrue(s["dateNotPublishedAsCertified"])
 def test_1612_probable_not_delivery(self):
  s=next(x for x in self.r["findings"] if x["caseId"].endswith("CROSS_INDEX_DATE"))
  self.assertEqual(s["entry"]["kind"],"SOMMAIRE")
  self.assertEqual(s["provisionalBibliographicDate"],"1612-04-20")
  self.assertFalse(s["historicalDeliveryDateCertified"])
  self.assertFalse(s["editorialPrintedFootnoteVisuallyChecked"])
 def test_original_edition_remains_uninspected(self):
  self.assertFalse(self.r["printCatalogue"]["actuallyOpenedPrintedPageImage"])
  self.assertFalse(self.r["rights"]["hostDigitalMaterialsLicensedForApp"])
  self.assertTrue(self.r["restrictions"]["doNotOverwriteEditionDisplayDates"])
  self.assertTrue(self.r["restrictions"]["doNotPromoteAppContent"])
  self.assertEqual(self.r["counts"]["independentOriginalPageImagesInspected"],0)
  self.assertEqual(self.r["counts"]["appPublicationApprovals"],0)
if __name__=="__main__":
 unittest.main()
