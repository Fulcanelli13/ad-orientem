"""B35 parallel review coverage: 35 rows are a strict subset of 50, not +35."""
import json,unittest
from pathlib import Path
D=Path(__file__).resolve().parents[1]/"data/source-text"
def rd(n):return json.loads((D/n).read_text(encoding="utf-8"))
class Parallel35And50(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.a=rd("icrsp-france-b35-35-direct-source-passages.v1.json")
  cls.b=rd("icrsp-france-b35-first50-priority-direct-topic-excerpts.v1.json")
  cls.before=rd("icrsp-france-b34-541-two-workstream-direct-topic-ledger.v1.json")
  cls.after=rd("icrsp-france-b35-591-unique-direct-topic-ledger.v1.json")
  cls.audit=rd("icrsp-france-b35-parallel-35-50-dedup-and-holds.v1.json")
 def test_35_fully_inside_50_and_no_626(self):
  a={x["articleId"] for x in self.a["records"]}
  b={x["articleId"] for x in self.b["records"]}
  o={x["articleId"] for x in self.before["uniqueArticles"]}
  n={x["articleId"] for x in self.after["uniqueArticles"]}
  self.assertEqual((len(a),len(b),len(o),len(n)),(35,50,541,591))
  self.assertTrue(a<b)
  self.assertFalse(o&b)
  self.assertEqual(o|a|b,n)
  self.assertEqual(len(a&b),35)
  self.assertEqual(self.audit["counts"]["parallelAExclusive"],0)
  self.assertEqual(self.audit["counts"]["parallelBExclusive"],15)
  self.assertEqual(self.audit["counts"]["canonicalUnique"],591)
  self.assertEqual(set(self.audit["overlapArticleIds"]),a)
  self.assertEqual(set(self.audit["exclusive50"]),b-a)
 def test_no_published_text_or_merging_owners(self):
  self.assertFalse(self.audit["publicationApproved"])
  self.assertFalse(self.audit["sourceProseCopied"])
  self.assertEqual(self.audit["counts"]["publicationApprovals"],0)
  self.assertEqual(self.audit["counts"]["remainingForFirstDirectTopicRead"],192)
  cases={x["articleId"]:x for x in self.audit["sourceFindingsNotAdditionalArticleReads"]}
  self.assertIn("a0316_ancien",cases)
  self.assertIn("a0559_ancien",cases)
  self.assertIn("a0137_nouveau",cases)
if __name__=="__main__":unittest.main()
