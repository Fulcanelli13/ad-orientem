"""B34: exact 19 new directly opened source articles, zero runtime promotion."""
import json, unittest
from pathlib import Path
BASE=Path(__file__).resolve().parents[1]/"data/source-text"
def read(name):return json.loads((BASE/name).read_text(encoding="utf8"))
class B34DirectSourceIntegrity(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.old=read("icrsp-france-b33-486-unique-topical-ledger.v1.json")
  cls.obs=read("icrsp-france-b34-nineteen-direct-source-article-excerpts.v1.json")
  cls.new=read("icrsp-france-b34-505-unique-topical-ledger.v1.json")
 def test_unique_count_and_nonoverlap(self):
  old={x["articleId"] for x in self.old["uniqueArticles"]}
  new={x["articleId"] for x in self.obs["rows"]}
  union={x["articleId"] for x in self.new["uniqueArticles"]}
  self.assertEqual((len(old),len(new),len(union)),(486,19,505))
  self.assertFalse(old&new)
  self.assertEqual(old|new,union)
  self.assertEqual(self.new["counts"]["remainingWithoutDirectReading"],783-505)
 def test_original_edition_and_rights_holds(self):
  self.assertFalse(self.obs["sourceTextCopied"])
  self.assertFalse(self.obs["publicationApproved"])
  self.assertFalse(self.new["publicationApproved"])
  for x in self.obs["rows"]:
   self.assertTrue(x["sourceArticleIndividuallyOpened"])
   for flag in ("criticalEditionCollated","originalAuthorPersonallyVerified",
     "exactExistingOwnerParagraphParityComplete","translationRightsCleared",
     "productionPublicationApproved","sourceProseReproduced"):
    self.assertFalse(x[flag])
   self.assertTrue(x["sourceUrl"].endswith("article="+x["articleId"]))
 def test_gertrude_host_error_held_not_published(self):
  errors=self.obs["criticalSourceCorrections"]
  self.assertEqual(len(errors),1)
  self.assertEqual(errors[0]["articleId"],"a0556_ancien")
  self.assertEqual(errors[0]["disposition"],"DO_NOT_IMPORT_UNCORRECTED")
if __name__=="__main__":unittest.main()
