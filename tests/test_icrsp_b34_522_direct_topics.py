"""B34: exact unique page union and source-criticism publication holds."""
import json,unittest
from pathlib import Path
D=Path(__file__).resolve().parents[1]/"data/source-text"
def rd(n): return json.loads((D/n).read_text(encoding="utf-8"))
class IcrspB34(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.prior=rd("icrsp-france-b33-486-unique-topical-ledger.v1.json")
  cls.fresh=rd("icrsp-france-b29-200-new-source-metadata.v1.json")
  cls.review=rd("icrsp-france-b34-thirty-six-direct-commentary-observations.v1.json")
  cls.new=rd("icrsp-france-b34-522-unique-direct-topic-ledger.v1.json")
 def test_new36_disjoint_and_522_union(self):
  old={r["articleId"] for r in self.prior["uniqueArticles"]}
  fresh={r["articleId"] for r in self.fresh["records"]}
  rows=self.review["records"]
  new={r["articleId"] for r in rows}
  union={r["articleId"] for r in self.new["uniqueArticles"]}
  self.assertEqual((len(old),len(fresh),len(rows),len(new),len(union)),(486,200,36,36,522))
  self.assertFalse(old&new)
  self.assertTrue(new<=fresh)
  self.assertEqual(union,old|new)
  self.assertEqual(self.new["counts"]["stillToReview"],783-522)
  self.assertEqual(len(fresh-union),122)
 def test_hard_gates_and_reproduction(self):
  self.assertFalse(self.review["sourceProseCopied"])
  self.assertFalse(self.review["publicationApproved"])
  self.assertFalse(self.new["publicationApproved"])
  for x in self.review["records"]:
   self.assertTrue(x["selectedWebPassageRead"])
   self.assertEqual(x["sourceUrl"].split("article=")[-1],x["articleId"])
   self.assertGreater(len(x["observedSourceTopic"]),50)
   self.assertGreater(len(x["editorialHold"]),15)
   for k in ("allAuthorPanelsRead","originalWorkEditionCollated","exactExistingOwnerParagraphCompared","rightsCleared","certified1962Proper","productionPublicationApproved","sourceTextReproduced"):
    self.assertFalse(x[k],(x["articleId"],k))
 def test_critical_source_exceptions(self):
  by={r["articleId"]:r for r in self.review["records"]}
  self.assertIn("1643_VS_1641",by["a0415_ancien"]["editorialHold"])
  self.assertIn("CLEMENT_XII_VS_XIII",by["a0415_ancien"]["editorialHold"])
  self.assertIn("498",by["a0303_ancien"]["editorialHold"])
  self.assertIn("TELESPHORUS_HOMONYM",by["a0315_ancien"]["editorialHold"])
  self.assertIn("TIMOTHY_ROMAN_MARTYR",by["a0417_ancien"]["editorialHold"])
  self.assertIn("VOTIVE",by["a0791_ancien"]["editorialHold"])
  self.assertIn("POST_1969_POLEMIC",by["a0056_ancien"]["editorialHold"])
  for i in ("a0658_ancien","a0661_ancien","a0663_ancien","a0660_ancien","a0662_ancien","a0659_ancien"):
   self.assertIn("OCTAVE",by[i]["editorialHold"])
if __name__=="__main__":unittest.main()
