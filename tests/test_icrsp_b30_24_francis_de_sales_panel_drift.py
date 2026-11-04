"""ICRSP B30 200-source scan: 24 observed extra Salesian panel labels, no printed authentication."""
import json
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]/"data/source-text"
def read(name):return json.loads((ROOT/name).read_text(encoding="utf8"))

class B30FrancisDeSalesSourceDrift(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.audit=read("icrsp-france-b30-24-added-francis-de-sales-panel-labels.v1.json")
  cls.new=read("icrsp-france-b29-200-automated-commentary-signals.v1.json")
  cls.old=read("icrsp-france-b29-200-new-source-metadata.v1.json")
 def test_every_drift_exactly_one_new_sermon_related_panel(self):
  count=self.audit["counts"]
  self.assertEqual(count["articlePanelCountDrift"],24)
  self.assertEqual(count["sourcePanelsAutoScreened"],551)
  self.assertEqual(count["addedExplicitlyNamedSermonOrPlanLabels"],14)
  self.assertEqual(count["addedGenericFrancisDeSalesSermonsLabels"],10)
  self.assertEqual(len(self.audit["records"]),24)
  old={r["articleId"]:r for r in self.old["records"]}
  current={r["articleId"]:r for r in self.new["records"]}
  self.assertEqual({r["articleId"] for r in self.audit["records"]},set(self.new["metadataDriftIds"]))
  for r in self.audit["records"]:
   self.assertEqual(r["sourceUrl"],old[r["articleId"]]["sourceUrl"])
   now=current[r["articleId"]]
   self.assertEqual(r["oldPanelCount"],len(old[r["articleId"]]["commentaryPanelLabels"]))
   self.assertEqual(r["newPanelCount"],len(now["panels"]))
   self.assertEqual(r["newPanelCount"],r["oldPanelCount"]+1)
   panel=next(p for p in now["panels"] if p["blockOrdinal"]==r["extraPanelOrdinal"])
   self.assertEqual(panel["hostWorkLabel"],r["extraPanelHostLabel"])
   self.assertEqual(panel["bodySha256"],r["extraPanelBodySha256"])
   self.assertFalse(r["originalAuthorshipCertified"])
   self.assertFalse(r["sourceRightsCleared"])
   self.assertFalse(r["publicContentApproved"])
 def test_metadata_not_public_copyrighted_sermons(self):
  self.assertFalse(self.audit["publicationApproved"])
  self.assertEqual(self.audit["counts"]["editoriallyVerifiedOriginalPrintedSermons"],0)
  self.assertEqual(self.audit["counts"]["newAppContentReleased"],0)
  self.assertFalse(self.new["publicationApproved"])
if __name__=="__main__": unittest.main()
