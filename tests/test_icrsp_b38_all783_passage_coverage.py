"""ICRSP B38: selected-passages coverage is exact; production remains unapproved."""
import json,unittest
from pathlib import Path
P=Path(__file__).resolve().parents[1]/"data/source-text"
def load(name):return json.loads((P/name).read_text(encoding="utf-8"))
class B38All783(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.before=load("icrsp-france-b37-721-unique-source-passages.v1.json")
  cls.queue=load("icrsp-france-b37-unread62-scoped-review-queue.v1.json")
  cls.a=load("icrsp-france-b38-53-nonoffice-source-inspections.v1.json")
  cls.b=load("icrsp-france-b38-nine-office-out-of-scope-reads.v1.json")
  cls.final=load("icrsp-france-b38-783-unique-source-article-passages.v1.json")
 def test_unique_coverage_and_queue_exact(self):
  before={r["articleId"] for r in self.before["uniqueArticles"]}
  a={r["articleId"] for r in self.a["records"]}
  b={r["articleId"] for r in self.b["rows"]}
  pending={r["articleId"] for r in self.queue["remaining"]}
  final={r["articleId"] for r in self.final["uniqueArticles"]}
  self.assertEqual((len(before),len(a),len(b),len(pending),len(final)),(721,53,9,62,783))
  self.assertFalse(before&a or before&b or a&b)
  self.assertEqual(a|b,pending)
  self.assertEqual(before|a|b,final)
  self.assertEqual(self.final["counts"]["uninspectedArticleIds"],0)
 def test_office_is_research_not_product(self):
  ids={r["articleId"] for r in self.b["rows"]}
  self.assertEqual(len(ids),9)
  for row in self.b["rows"]:
   self.assertEqual(row["section"],"office")
   self.assertTrue(row["noNewOfficeModule"])
   self.assertFalse(row["publicationApproved"])
 def test_holds_and_edition_rights(self):
  c=self.final["counts"]
  self.assertTrue(c["unreviewedSourceAuthorPanelsNotClaimedComplete"])
  for key in ("sourceEditionCollationsApproved","rightsApprovals","exactExistingAppOwnerParityApprovals","productionPublications"):
   self.assertEqual(c[key],0)
  self.assertFalse(self.final["publicationApproved"])
  self.assertFalse(self.final["sourceTextReproduced"])
  for row in self.a["records"]:
   self.assertFalse(row["originalPrintedWorkCollated"])
   self.assertFalse(row["full1962RubricCert"])
   self.assertFalse(row["sourceReproductionRightsCleared"])
   self.assertFalse(row["exactCanonicalAppParagraphParity"])
   self.assertFalse(row["publicationApproved"])
if __name__=="__main__":unittest.main()
