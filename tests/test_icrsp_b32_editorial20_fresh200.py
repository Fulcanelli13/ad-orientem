"""B32 editorial tranche: direct-excerpt reading is not scan or release approval."""
import json,unittest
from pathlib import Path
R=Path(__file__).resolve().parents[1]/"data/source-text"
def rd(x):return json.loads((R/x).read_text(encoding="utf8"))
class Review20(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.old=rd("icrsp-france-b32-449-unique-direct-topic-ledger.v1.json")
  cls.fresh=rd("icrsp-france-b29-200-new-source-metadata.v1.json")
  cls.new=rd("icrsp-france-b32-editorial20-fresh200.v1.json")
  cls.ledger=rd("icrsp-france-b32-464-unique-topical-ledger.v1.json")
 def test_20_unique_unreviewed_from_200(self):
  old={r["articleId"] for r in self.old["uniqueArticles"]}
  fresh={r["articleId"] for r in self.fresh["records"]}
  new={r["articleId"] for r in self.new["records"]}
  self.assertEqual((len(old),len(fresh),len(new)),(449,200,20))
  self.assertEqual(len(old&new),5)
  self.assertEqual(len(new-old),15)
  self.assertTrue(new<=fresh)
  self.assertEqual({r["articleId"] for r in self.ledger["uniqueArticles"]},old|new)
  self.assertEqual(self.ledger["counts"]["reviewedUnique"],464)
  self.assertEqual(self.new["counts"]["overlapWithParallelB32Five"],5)
  self.assertEqual(self.ledger["counts"]["notYetDirectTopicReviewed"],319)
 def test_rights_identity_and_owner_holds(self):
  byid={r["articleId"]:r for r in self.new["records"]}
  self.assertIn("CONTAMINATION",byid["a0438_ancien"]["reviewHold"])
  for k in ("a0192_nouveau","a0521_ancien"):
   self.assertIn("DUPLICATE",byid[k]["reviewHold"])
  for row in self.new["records"]:
   for field in ("originalPrintedEditionCompared","originalAuthorAttributionCertified","exactExistingOwnerParagraphParityCompleted","rightsCleared","mass1962RubricCertified","publicationApproved","hostedProseReproduced"):
    self.assertFalse(row[field])
  self.assertFalse(self.ledger["publicationApproved"])
if __name__=="__main__":unittest.main()
