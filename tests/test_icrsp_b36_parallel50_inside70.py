"""Cross-workstream dedup: B36 parallel 50 lies fully within expanded 70."""
import json,unittest
from pathlib import Path
P=Path(__file__).resolve().parents[1]/"data/source-text"
def rd(x):return json.loads((P/x).read_text(encoding="utf8"))
class B36Parallel50In70(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.a=rd("icrsp-france-b36-50-direct-source-observations.v1.json")
  cls.b=rd("icrsp-france-b36-final70-priority-direct-source-notes.v1.json")
  cls.prev=rd("icrsp-france-b35-591-unique-direct-topic-ledger.v1.json")
  cls.next=rd("icrsp-france-b36-661-unique-direct-topic-ledger.v1.json")
  cls.audit=rd("icrsp-france-b36-50-inside70-crossworkstream-dedup.v1.json")
 def test_50_inside70_and_only70_new(self):
  aa=[x["articleId"] for x in self.a["rows"]]
  bb=[x["articleId"] for x in self.b["records"]]
  prev={x["articleId"] for x in self.prev["uniqueArticles"]}
  nxt={x["articleId"] for x in self.next["uniqueArticles"]}
  self.assertEqual((len(aa),len(bb),len(prev),len(nxt)),(50,70,591,661))
  self.assertEqual(aa,bb[:50])
  self.assertFalse(prev&set(bb))
  self.assertEqual(prev|set(bb),nxt)
  self.assertEqual(self.audit["counts"]["overlap50With70"],50)
  self.assertEqual(self.audit["counts"]["extraUniqueFromParallel50"],0)
  self.assertEqual(self.audit["counts"]["remainingToRead"],122)
  self.assertEqual(set(self.audit["expandedOnlyArticleIds"]),set(bb)-set(aa))
 def test_no_output_or_provenance_promotion(self):
  for key in ("originalEditionCertified","rightsCleared","canonicalOwnerParityCertified","publicationApproved","sourceProseCopied"):
   self.assertFalse(self.audit[key])
if __name__=="__main__":unittest.main()
