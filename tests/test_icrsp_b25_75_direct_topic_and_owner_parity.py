"""ICRSP B25: source-topic reading coverage, owner scope and release guards."""
import json, unittest
from pathlib import Path
from collections import Counter
D=Path(__file__).resolve().parents[1]/"data/source-text"
def read(fn):return json.loads((D/fn).read_text(encoding="utf8"))

class IcrspB25(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.queue=read("icrsp-france-b23-next100-human-editorial-priority.v1.json")
  cls.b25=read("icrsp-france-b25-75-direct-webpage-topic-passages.v1.json")
  cls.b24=read("icrsp-france-b24-25-direct-commentary-topic-observations.v1.json")
  cls.b23=read("icrsp-france-b23-twenty-additional-direct-commentary-topics.v1.json")
  cls.pre=read("icrsp-france-b22-cross-workstream-93-direct-read-reconciliation.v1.json")
  cls.parity=read("icrsp-france-b25-scoped-owner-content-parity.v1.json")
 def test_priority100_complete_with_unique_original_source_ids(self):
  q={x["id"]:x for x in self.queue["records"]}
  reviewed=self.b24["records"]+self.b25["records"]
  ids=[x["articleId"] for x in reviewed]
  self.assertEqual(len(q),100)
  self.assertEqual(len(reviewed),100)
  self.assertEqual(set(ids),set(q))
  self.assertEqual(len(ids),len(set(ids)))
  self.assertEqual(len(self.b25["records"]),75)
  for x in self.b25["records"]:
   original=q[x["articleId"]]
   self.assertEqual((x["sourceUrl"],x["sourceTitle"],x["section"]),
                    (original["sourceUrl"],original["title"],original["section"]))
   self.assertGreater(len(x["observedEditorialSubject"]),35)
   self.assertGreater(len(x["publicationHold"]),35)
   self.assertIn("DIRECT_HOSTED_WEBPAGE_TOPIC_PASSAGE",x["sourceReadKind"])
  self.assertEqual(Counter(x["section"] for x in self.b25["records"]),
                   self.b25["sectionCounts"])
  self.assertEqual(self.b25["sectionCounts"],dict(
   temporal=10,sanctoral=50,commons=8,local_propers=5,votives_requiem=1,office=1))
 def test_reconciled_unique_206_not_keyword_screens(self):
  old={id for cohort in self.pre["cohorts"] for id in cohort["directReadArticleIds"]}
  b23={x["articleId"] for x in self.b23["rows"]}
  b24={x["articleId"] for x in self.b24["records"]}
  b25={x["articleId"] for x in self.b25["records"]}
  self.assertEqual(len(old),93)
  self.assertFalse(old&b23)
  self.assertFalse(b23&b24 or b23&b25 or b24&b25)
  self.assertEqual(old&b24,set(self.b24["alreadyDirectReadBeforeB24"]))
  self.assertEqual(old&b25,set(self.b25["alreadyDirectReadBeforeB25"]))
  self.assertEqual((old&b24)|(old&b25),set(self.b25["allSevenEarlierCohortRepeatArticleIds"]))
  self.assertEqual(len(old|b23|b24|b25),206)
  self.assertEqual(self.b25["previousDistinctDirectReadArticleCount"],134)
  self.assertEqual(self.b25["sourceArticlePasses"],75)
  self.assertEqual(self.b25["newDistinctDirectTopicReads"],72)
  self.assertEqual(self.b25["newPreviouslyUnreadAcrossB24B25"],93)
  self.assertEqual(self.b25["totalDistinctDirectReadArticleCountAfterReconciliation"],206)
  self.assertEqual(self.b25["remainingCommentaryArticlesWithoutDirectTopicRead"],577)
  self.assertEqual(self.b25["newPriority100DirectTopicReadCount"],100)
  self.assertIn("not critically collated",self.b25["method"])
 def test_no_publication_or_authorship_or_1962_promotion(self):
  self.assertEqual(set(self.b25["release"].values()),{0})
  for x in self.b25["records"]:
   for f in ("originalPrintAttributionCertified","reproductionRightsCleared",
             "independentLiturgicalAuthorityCertified",
             "canonicalOwnerParityCertified","approvedPublication"):
    self.assertIs(x[f],False,(x["articleId"],f))
  for case in self.parity["cases"]:
   for f in ("exactCanonicalOwnerIdConfirmed","substantiveOwnerParityCertified",
             "originalEditionCertified","rightsCleared","publicationApproved"):
    self.assertIs(case[f],False,(case["caseId"],f))
 def test_14_scoped_parity_decisions_and_shared_article_ids(self):
  cases=self.parity["cases"]
  ids=set(x["articleId"] for x in self.b25["records"])|set(x["articleId"] for x in self.b24["records"])
  used=[id for c in cases for id in c["articleIds"]]
  self.assertEqual(len(cases),14)
  self.assertEqual(len(set(used)),23)
  self.assertTrue(set(used).issubset(ids))
  self.assertEqual(self.parity["summary"]["scopedComparisons"],14)
  self.assertEqual(self.parity["summary"]["uniqueArticleIds"],23)
  self.assertEqual(self.parity["summary"]["globallyCertifiedGaps"],0)
  for c in cases:
   self.assertGreater(len(c["existingEvidence"]),45)
   self.assertGreater(len(c["delta"]),35)
   self.assertTrue(c["checkedFiles"])
   self.assertNotIn("CERTIFIED_GAP",c["classification"])
  self.assertEqual(self.parity["status"],"RESEARCH_ONLY_DO_NOT_PROMOTE")
 def test_specific_dangerous_rite_reintroduction_hold(self):
  by={x["articleId"]:x for x in self.b25["records"]}
  for id in ("a0604_ancien","a0972_ancien","a0587_ancien",
             "a0119_nouveau","a0121_nouveau","a0758_ancien"):
   self.assertRegex(by[id]["publicationHold"].lower(),r"1962|historical|suppressed|former")
  for id in ("a0213_nouveau","a0248_ancien","a0250_ancien"):
   self.assertIn("local_propers",by[id]["section"])
if __name__=="__main__":unittest.main()
