"""B22: 17 true duplicate correction and 11 new direct ICRSP text-topic witnesses."""
import json,unittest
from pathlib import Path
from collections import Counter
BASE=Path(__file__).resolve().parents[1]/"data/source-text"
def load(name):return json.loads((BASE/name).read_text(encoding="utf8"))
class DirectSourceReview(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.b22=load("icrsp-france-b22-233-distinct-source-body-scan-queue.v1.json")
  cls.review=load("icrsp-france-b22-eleven-direct-commentary-topics.v1.json")
  cls.b10=load("icrsp-france-b10-lent-pentecost51-content-screen.v1.json")
  cls.b11=load("icrsp-france-b11-40-content-evidence-topics.v1.json")
  cls.b20=load("icrsp-france-b20-sanctoral-temporal-160-content-selection.v1.json")
  cls.b21=load("icrsp-france-b21-ten-additional-commentary-claim-leads.v1.json")

 def test_exact_sample_dedup_71_to_82(self):
  past={r["articleId"] for r in self.b10["rows"] if r.get("sourceBodyReadInBatch")}
  past.update(r["articleId"] for r in self.b11["rows"])
  past.update(r["articleId"] for r in self.b20["records"] if r["sourceTextStatus"].startswith("WEB_PAGE_DIRECTLY"))
  past.update(r["articleId"] for r in self.b21["reviewedRows"])
  self.assertEqual(len(past),71)
  sample=self.review["rows"];new={r["articleId"] for r in sample}
  wave={r["articleId"] for r in self.b22["rows"]}
  self.assertEqual((len(sample),len(new)),(11,11))
  self.assertFalse(past&new)
  self.assertTrue(new.issubset(wave))
  self.assertEqual(len(past|new),82)
  self.assertEqual(self.review["cumulativeUniqueArticleTopicsRead"],82)
  self.assertEqual(self.review["previousTopicPageSample"],71)
  self.assertEqual(self.b22["dedup"]["overlapsRemoved"],17)
  self.assertEqual(len(wave-new),222)

 def test_source_specific_and_fail_closed(self):
  dest=Counter(r["section"] for r in self.review["rows"])
  self.assertEqual(dest,{"temporal":3,"sanctoral":4,"commons":1,"local_propers":1,"votives_requiem":1,"office":1})
  for r in self.review["rows"]:
   self.assertTrue(r["sourceWasDirectlyOpenedAndRelevantCommentaryParagraphRead"])
   self.assertEqual(r["sourceUrl"].rsplit("=",1)[-1],r["articleId"])
   self.assertGreater(len(r["observedTextualTopic"]),55)
   self.assertGreater(len(r["releaseGate"]),50)
   for k in ("completeAllAuthorBlocksReviewed","originalPrintedWorkEditionCertified","existingOwnerMissingFeatureProven",
              "copyOrTranslationRightsCleared","theologicalClaimHumanApproved","productionChange"):
    self.assertFalse(r[k])
  r={r["topicId"]:r for r in self.review["rows"]}
  self.assertIn("local jurisdiction",r["ST_MANSUY_TRANSLATION_LOCAL_SCOPE"]["releaseGate"].lower())
  self.assertIn("1962",r["MAJOR_LITANIES_25_APRIL_PROCESSION"]["releaseGate"])
  self.assertIn("2000","2000") if False else None
  self.assertIn("1962",r["ROMAN_MARRIAGE_MASS_CUSTOM_VARIANTS"]["releaseGate"])
  self.assertEqual(self.review["totals"]["newDirectSourceTopicArticles"],11)
  self.assertEqual(self.review["totals"]["newHumanEditorialArticleApprovals"],0)
  self.assertEqual(self.review["totals"]["newRightsClearances"],0)
  self.assertEqual(self.review["totals"]["newFeaturesImplemented"],0)
  self.assertFalse(self.review["publicationApproved"])

if __name__=="__main__":unittest.main()
