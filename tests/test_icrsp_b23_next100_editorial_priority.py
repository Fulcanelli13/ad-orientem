"""B23 prioritized 100 remains derivative of 233 automated source panels, not accepted content."""
import unittest, json
from collections import Counter
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]/"data/source-text"
def r(path):return json.loads((ROOT/path).read_text(encoding="utf-8"))
class B23Priority(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.s=r("icrsp-france-b23-233-automated-commentary-signals.v1.json")
  cls.d=r("icrsp-france-b23-twenty-additional-direct-commentary-topics.v1.json")
  cls.p=r("icrsp-france-b23-next100-human-editorial-priority.v1.json")
 def test_100_new_nonduplicated_exact_sources(self):
  rows=self.p["records"]; ids={r["id"] for r in rows}
  original={r["articleId"] for r in self.s["records"]}
  reviewed={r["articleId"] for r in self.d["rows"]}
  self.assertEqual(len(rows),len(ids))
  self.assertEqual(len(rows),100)
  self.assertTrue(ids.issubset(original))
  self.assertFalse(ids&reviewed)
  self.assertEqual(len(original-reviewed),213)
  self.assertEqual(self.p["scope"]["stillWithoutDirectHumanTopicRead"],213)
  self.assertEqual(Counter(r["section"] for r in rows), self.p["scope"]["quotas"])
 def test_all_100_require_human_review_and_rights_check(self):
  for z in self.p["records"]:
   self.assertTrue(z["humanClaimReviewPending"])
   self.assertEqual(z["metadataStatus"],"AUTOMATED_SOURCE_BODY_SCREEN_ONLY")
   self.assertEqual(z["sourceUrl"].rsplit("=",1)[1],z["id"])
   self.assertFalse(z["originalWorkAttributionCertified"])
   self.assertFalse(z["existingAppGapConfirmed"])
   self.assertFalse(z["reproductionRightsCleared"])
   self.assertFalse(z["releaseApproved"])
  self.assertFalse(self.p["publicationApproved"])
  self.assertEqual(self.p["scope"]["claimsApprovedForPublication"],0)
 def test_not_misstate_panels_or_archival_corpus(self):
  self.assertEqual(self.p["scope"]["automatedArticleBodiesScreened"],233)
  self.assertEqual(self.p["scope"]["uniqueSourcePanelsScreened"],1072)
  self.assertTrue(self.p["scope"]["allOriginalTextRightsUncleared"])
  self.assertEqual(len(self.p["derivesFrom"]),3)
if __name__=="__main__": unittest.main()
