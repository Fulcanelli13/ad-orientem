"""ICRSP B29: exact 363 reviewed / 81 already staged / 200 fresh, no double-work."""
import json
from pathlib import Path
import sys
import unittest

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"tools"/"icrsp"))
from plan_b29_fresh_200 import plan

def load(path):return json.loads((ROOT/path).read_text(encoding="utf8"))

class B29NoRedundantDiscovery(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.corpus=load("data/source-text/icrsp-france-783-verified-commentary-labels.v1.json")
  cls.ledger=load("data/source-text/icrsp-france-b28-eight-stream-363-unique-topic-ledger.v1.json")
  cls.old=load("data/source-text/icrsp-france-next250-metadata-reading-queue.v1.json")
  cls.handoff=load("data/source-text/icrsp-france-b29-unread81-and-fresh200-handoff.v1.json")

 def test_exact_existing_remaining_81(self):
  ids={r["articleId"] for r in self.ledger["uniqueArticles"]}
  old={r["articleId"] for r in self.old["rows"]}
  pending={r["articleId"] for r in self.handoff["remainingInExistingWave"]}
  self.assertEqual(len(ids),363)
  self.assertEqual(len(old),250)
  self.assertEqual(len(pending),81)
  self.assertEqual(len(ids&old),169)
  self.assertEqual(pending,old-ids)
  self.assertEqual(self.handoff["totals"]["notDirectlyTopicRead"],420)
  self.assertEqual(self.handoff["totals"]["remainingOutsideNext250AndTopicLedger"],339)

 def test_next_200_from_exact_canonical_783_not_previous_wave(self):
  data=plan(self.corpus,self.ledger,self.old,self.handoff)
  ids={r["articleId"] for r in data["records"]}
  read={r["articleId"] for r in self.ledger["uniqueArticles"]}
  old={r["articleId"] for r in self.old["rows"]}
  universe={r["articleId"] for r in self.corpus["records"]}
  self.assertEqual(len(universe),783)
  self.assertEqual(len(ids),200)
  self.assertTrue(ids<=universe)
  self.assertFalse(ids&read or ids&old)
  self.assertEqual(data["totals"]["remainingUnstagedAfterThisSelection"],139)
  self.assertEqual(data["totals"]["directTopicReviewsAdded"],0)
  self.assertFalse(data["publicationApproved"])
  for r in data["records"]:
   self.assertTrue(r["sourceUrl"].endswith("article="+r["articleId"]))
   self.assertGreater(r["priorCommentaryPanelCount"],0)
   self.assertFalse(r["sourceProseAlreadyInspectedForThisWave"])
   self.assertFalse(r["humanDirectTopicReadingComplete"])
   self.assertFalse(r["existingOwnerMatchCertified"])
   self.assertFalse(r["rightsCleared"])

if __name__=="__main__":unittest.main()
