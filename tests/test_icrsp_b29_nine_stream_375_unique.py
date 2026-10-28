"""B29 direct reading reconciliation: 12 newly read + 363 unique older = 375."""
import json
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]/"data/source-text"
def load(f):return json.loads((ROOT/f).read_text(encoding="utf8"))

class B29NineStreams(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.old=load("icrsp-france-b28-eight-stream-363-unique-topic-ledger.v1.json")
  cls.read=load("icrsp-france-b29-12-new-direct-topic-excerpts.v1.json")
  cls.queue=load("icrsp-france-b29-unread81-and-fresh200-handoff.v1.json")
  cls.new=load("icrsp-france-b29-nine-stream-375-unique-topic-ledger.v1.json")
 def test_twelve_new_articles_in_existing_queue_only(self):
  previous={r["articleId"] for r in self.old["uniqueArticles"]}
  queue={r["articleId"]:r for r in self.queue["remainingInExistingWave"]}
  reviewed={r["articleId"] for r in self.read["records"]}
  self.assertEqual(len(previous),363)
  self.assertEqual(len(queue),81)
  self.assertEqual(len(reviewed),12)
  self.assertFalse(previous&reviewed)
  self.assertTrue(reviewed<=queue.keys())
  for r in self.read["records"]:
   self.assertEqual(r["sourceUrl"],queue[r["articleId"]]["sourceUrl"])
   self.assertEqual(r["actualWebPageRead"],"ACTUAL_TARGETED_COMMENTARY_PARAGRAPHS_ON_LIVE_SOURCE")
   self.assertFalse(r["independentlyCertifiedHistoricalClaim"])
   self.assertFalse(r["publicationApproved"])
  self.assertEqual(len(queue.keys()-reviewed),69)
 def test_375_distinct_unique_and_no_claims_promoted(self):
  older={r["articleId"] for r in self.old["uniqueArticles"]}
  reviewed={r["articleId"] for r in self.read["records"]}
  combined={r["articleId"] for r in self.new["uniqueArticles"]}
  self.assertEqual(combined,older|reviewed)
  self.assertEqual(len(combined),375)
  self.assertEqual(self.new["counts"]["nowDirectTopicReviewedDistinct"],375)
  self.assertEqual(self.new["counts"]["withoutDirectTopicReview"],408)
  self.assertEqual(self.new["counts"]["remainingOldWaveDirectTopicsUnread"],69)
  self.assertEqual(self.new["counts"]["neverStagedOutsideOldWave"],339)
  self.assertFalse(self.new["publicationApproved"])
  self.assertFalse(self.read["publicationApproved"])
if __name__=="__main__":unittest.main()
