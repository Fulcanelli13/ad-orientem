"""B33: validate the 39 additional grouped Salesian host panels, not 39 approved sermons."""
import json, unittest
from pathlib import Path
BASE=Path(__file__).resolve().parents[1]/"data/source-text"
def load(n):return json.loads((BASE/n).read_text(encoding="utf8"))
class B33SalesianMetadataDeltas(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.a=load("icrsp-france-b33-b32-last210-salesian-panel-drift.v1.json")
  cls.b=load("icrsp-france-b32-final210-automated-signals.v1.json")
  cls.b30=load("icrsp-france-b30-24-added-francis-de-sales-panel-labels.v1.json")
 def test_exact_source_id_match_all_39(self):
  a=self.a; b=self.b
  self.assertEqual(len(a["records"]),39)
  self.assertEqual(a["counts"]["genericSalesian"],24)
  self.assertEqual(a["counts"]["namedSermonsAndPlans"],15)
  self.assertEqual((a["counts"]["temporal"],a["counts"]["sanctoral"]),(30,9))
  scanned={r["articleId"]:r for r in b["records"]}
  self.assertEqual(set(scanned),{r["articleId"] for r in b["records"]})
  self.assertEqual({r["articleId"] for r in a["records"]},set(b["panelMetadataDriftArticleIds"]))
  for x in a["records"]:
   r=scanned[x["articleId"]]
   self.assertEqual(x["sourceUrl"],r["sourceUrl"])
   self.assertEqual(x["metadataPanelCount"],r["originalPanelCountFromMetadata"])
   self.assertEqual(x["observedPanelCount"],len(r["panels"]))
   self.assertEqual(x["observedPanelCount"],x["metadataPanelCount"]+1)
   added=next(p for p in r["panels"] if p["blockOrdinal"]==x["addedPanelOrdinal"])
   self.assertEqual(added["hostWorkLabel"],x["addedLabel"])
   self.assertEqual(added["bodySha256"],x["addedBodyHash"])
   self.assertFalse(x["authorOriginalVerified"])
   self.assertFalse(x["publicationApproved"])
 def test_previous_24_disjoint_and_all_release_closed(self):
  before={r["articleId"] for r in self.b30["records"]}
  later={r["articleId"] for r in self.a["records"]}
  self.assertFalse(before&later)
  self.assertEqual(len(before|later),63)
  self.assertFalse(self.a["sourceProseStored"])
  self.assertFalse(self.a["rightsApproved"])
  self.assertFalse(self.a["publicationApproved"])
  self.assertFalse(self.b["sourceProseCopied"])
  self.assertFalse(self.b["publicationApproved"])
if __name__=="__main__": unittest.main()
