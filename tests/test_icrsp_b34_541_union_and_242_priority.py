"""Cross-workstream B34 exact article union and nonpublication regression."""
import json,unittest
from pathlib import Path
R=Path(__file__).resolve().parents[1]/"data/source-text"
def load(n):return json.loads((R/n).read_text(encoding="utf8"))
def ids(rows):return {x["articleId"] for x in rows}
class B34CrossWorkstream(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.base=load("icrsp-france-b33-486-unique-topical-ledger.v1.json")
  cls.a=load("icrsp-france-b34-nineteen-direct-source-article-excerpts.v1.json")
  cls.b=load("icrsp-france-b34-thirty-six-direct-commentary-observations.v1.json")
  cls.u=load("icrsp-france-b34-541-two-workstream-direct-topic-ledger.v1.json")
  cls.q=load("icrsp-france-b34-242-remaining120-priority-owner-queue.v1.json")
 def test_exact_486_plus_19_plus_36(self):
  base,a,b=ids(self.base["uniqueArticles"]),ids(self.a["rows"]),ids(self.b["records"])
  self.assertEqual((len(base),len(a),len(b)),(486,19,36))
  self.assertFalse(base&a or base&b or a&b)
  self.assertEqual(len(base|a|b),541)
  self.assertEqual(ids(self.u["uniqueArticles"]),base|a|b)
  self.assertEqual(self.u["totals"]["remainingNeverDirectReviewed"],242)
 def test_priority_queue_is_complement_not_editorial_approval(self):
  rows=self.q["prioritizedNext120"]+self.q["later122"]
  known=ids(self.u["uniqueArticles"])
  items=ids(rows)
  self.assertEqual((len(rows),len(items),len(known)),(242,242,541))
  self.assertFalse(items&known)
  self.assertEqual(self.q["totals"]["priorityForNextDirectArticleReview"],120)
  self.assertEqual(self.q["totals"]["restAfterPriority"],122)
  self.assertFalse(self.q["publicationApproved"])
  for r in rows:
   for flag in ("directArticleTopicReviewed","verifiedMissingAppContent",
                "sourceTextReproductionRightsCleared","publicationApproved"):
    self.assertFalse(r[flag])
 def test_publication_remains_closed(self):
  for src in (self.a,self.b,self.u,self.q):
   self.assertFalse(src["publicationApproved"])
  self.assertEqual(self.u["totals"]["publishedExplanationsAdded"],0)
if __name__=="__main__":unittest.main()
