"""B33: independently grounded 22 source passages and 486-article dedup contract."""
import json,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]/"data/source-text"
def read(name): return json.loads((ROOT/name).read_text(encoding="utf-8"))
class B33ExactReview(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.old=read("icrsp-france-b32-464-unique-topical-ledger.v1.json")
  cls.fresh=read("icrsp-france-b29-200-new-source-metadata.v1.json")
  cls.review=read("icrsp-france-b33-twenty-two-direct-source-topics.v1.json")
  cls.ledger=read("icrsp-france-b33-486-unique-topical-ledger.v1.json")
 def test_exact_disjoint_22_and_486(self):
  old={r["articleId"] for r in self.old["uniqueArticles"]}
  fresh={r["articleId"] for r in self.fresh["records"]}
  new={r["articleId"] for r in self.review["records"]}
  total={r["articleId"] for r in self.ledger["uniqueArticles"]}
  self.assertEqual((len(old),len(fresh),len(new),len(total)),(464,200,22,486))
  self.assertFalse(old&new)
  self.assertTrue(new<=fresh)
  self.assertEqual(total,old|new)
  self.assertEqual(self.ledger["counts"]["notYetDirectTopicReviewed"],783-486)
  self.assertEqual(len(fresh-total),158)
 def test_edition_rights_and_release_gates_are_closed(self):
  self.assertFalse(self.review["publicationApproved"])
  self.assertFalse(self.review["sourceProseCopied"])
  self.assertFalse(self.ledger["publicationApproved"])
  for r in self.review["records"]:
   self.assertEqual(r["sourceUrl"].split("article=")[-1],r["articleId"])
   self.assertTrue(r["reviewHold"])
   for key in ("historicalSourceEditionChecked","allAuthorPanelsRead","existingOwnerExactParagraphParity","signedRightsPermission","productionPublicationApproved","normative1962RiteCertified","hostedFrenchTextReproduced"):
    self.assertFalse(r[key],(r["articleId"],key))
 def test_specific_chronology_homonym_and_duplicates(self):
  by={r["articleId"]:r for r in self.review["records"]}
  self.assertIn("1558_VS_1588",by["a0510_ancien"]["reviewHold"])
  self.assertIn("DUPLICATED_TEXT",by["a0035_ancien"]["reviewHold"])
  self.assertIn("TIBURTIUS_HOMONYM",by["a0405_ancien"]["reviewHold"])
  self.assertIn("MATINS_GENESIS",by["a0133_ancien"]["reviewHold"])
  assert len(self.review["independentCorroboration"])==1
  c=self.review["independentCorroboration"][0]
  self.assertEqual((c["badWebsiteYear"],c["confirmedBirthYear"],c["confirmedFoundationYear"]),(1558,1563,1588))
if __name__=="__main__":unittest.main()
