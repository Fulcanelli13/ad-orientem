"""Cross-owner ICRSP source-topic sample accounting: no double counting across six batches."""
import json,unittest
from pathlib import Path
BASE=Path(__file__).resolve().parents[1]/"data/source-text"
def read(path):return json.loads((BASE/path).read_text(encoding="utf8"))
class SourceTopicSampleLedger(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.x=read("icrsp-france-b22-cross-workstream-93-direct-read-reconciliation.v1.json")
 def test_nonoverlapping_read_article_ids(self):
  a=self.x["cohorts"]
  self.assertEqual(len(a),6)
  self.assertEqual([x["count"] for x in a],[11,40,10,10,11,11])
  ids=[y for x in a for y in x["directReadArticleIds"]]
  self.assertEqual(len(ids),93)
  self.assertEqual(len(set(ids)),93)
  for x in a:self.assertEqual(x["count"],len(x["directReadArticleIds"]))
 def test_source_of_truth_parity(self):
  l=self.x["cohorts"]
  from_batch={}
  b10=read("icrsp-france-b10-lent-pentecost51-content-screen.v1.json")
  from_batch[l[0]["id"]]={r["articleId"] for r in b10["rows"] if r.get("sourceBodyReadInBatch")}
  from_batch[l[1]["id"]]={r["articleId"] for r in read("icrsp-france-b11-40-content-evidence-topics.v1.json")["rows"]}
  from_batch[l[2]["id"]]={r["articleId"] for r in read("icrsp-france-b20-sanctoral-temporal-160-content-selection.v1.json")["records"] if r["sourceTextStatus"].startswith("WEB_PAGE_DIRECTLY")}
  from_batch[l[3]["id"]]={r["articleId"] for r in read("icrsp-france-b21-ten-additional-commentary-claim-leads.v1.json")["reviewedRows"]}
  from_batch[l[4]["id"]]={r["articleId"] for r in read("icrsp-france-b22-relevance-exceptions-and-existing-owner-editorial-drafts.v1.json")["humanReviewRecords"]}
  from_batch[l[5]["id"]]={r["articleId"] for r in read("icrsp-france-b22-eleven-direct-commentary-topics.v1.json")["rows"]}
  for y in l:self.assertEqual(set(y["directReadArticleIds"]),from_batch[y["id"]])
 def test_unreviewed_does_not_mean_unindexed_and_release_is_zero(self):
  s=self.x["stats"]
  self.assertEqual((s["totalIndexed"],s["eligibleCommentaryArticles"],s["structuralPanels"]),(855,783,2856))
  self.assertEqual(s["eligiblePagesNotYetDirectlyTopicExamined"],783-93)
  self.assertEqual(s["distinctB20SelectedDirectReadTotal"],31)
  self.assertEqual(s["B22SelectedOutside160MetaCandidates"],233)
  self.assertEqual(s["B22SelectedOutside160DirectRead"],11)
  self.assertEqual(s["B22SelectedOutside160NotYetDirectlyRead"],222)
  self.assertEqual(s["directlyApprovedNewExplanations"],0)
  self.assertEqual(s["rightsClearedNewTranslations"],0)
  self.assertEqual(s["productionChanges"],0)
  self.assertFalse(self.x["publicationApproved"])
if __name__=="__main__":unittest.main()
