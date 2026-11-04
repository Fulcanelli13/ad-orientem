"""B23 permanent 233 source-body lexical archive: metadata truth and release barriers."""
import json, unittest
from pathlib import Path
from collections import Counter

BASE=Path(__file__).resolve().parents[1]/"data/source-text"
def read(n):return json.loads((BASE/n).read_text(encoding="utf8"))
class B23ArchivedLexicalMetadata(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.o=read("icrsp-france-b23-233-automated-commentary-signals.v1.json")
  cls.m=read("icrsp-france-b22-233-distinct-source-body-scan-queue.v1.json")
  cls.d=read("icrsp-france-b23-twenty-additional-direct-commentary-topics.v1.json")
  cls.prev=read("icrsp-france-b22-cross-workstream-93-direct-read-reconciliation.v1.json")
 def test_archive_has_no_missing_articles_panels_or_rights(self):
  d=self.o; t=d["totals"]
  self.assertEqual(len(d["records"]),233)
  self.assertEqual(len({r["articleId"] for r in d["records"]}),233)
  self.assertEqual({r["articleId"] for r in d["records"]},
                   {r["articleId"] for r in self.m["rows"]})
  self.assertEqual(sum(len(r["panels"]) for r in d["records"]),1072)
  self.assertEqual((t["articlesSourceBodiesMachineRead"],t["fullSourceBodyPanelsMachineRead"]),(233,1072))
  self.assertEqual((t["articleErrors"],t["panelCountMismatches"]), (0,0))
  self.assertEqual(t["humanEditorialReviewsInThisAutomatedRun"],0)
  self.assertEqual(t["publicationApprovals"],0)
  self.assertFalse(d["rawCommentaryCopied"])
  self.assertFalse(d["licenceCleared"])
  self.assertFalse(d["publicationApproved"])
  self.assertEqual(len(d["shards"]),5)
  self.assertTrue(all(len(sh["sha256"])==64 for sh in d["shards"]))
 def test_no_promotion_from_lexical_to_historical_verification(self):
  expected={r["articleId"]:r for r in self.m["rows"]}
  hashes=Counter();categories=Counter()
  for r in self.o["records"]:
   m=expected[r["articleId"]]
   self.assertEqual(r["sourceUrl"],m["sourceUrl"])
   self.assertEqual(r["section"],m["section"])
   self.assertEqual(len(r["panels"]),m["priorMetadataPanelCount"])
   self.assertTrue(r["sourceMetadataPanelCountMatches"])
   self.assertEqual(r["sourceTextScanStatus"],"AUTOMATED_FULL_BODY_LEXICAL_SCREEN__NO_CLAIM_VERIFICATION")
   for key in ("originalEditionCertified","sourceReproductionLicensed","published","editoriallyReviewed"):
    self.assertFalse(r[key])
   for p in r["panels"]:
    self.assertFalse(p["editoriallyReviewed"])
    self.assertFalse(p["claimApproved"])
    self.assertTrue(len(p["bodySha256"])==64)
    self.assertNotIn("bodyText",p)
    self.assertNotIn("fullText",p)
    hashes[p["bodySha256"]]+=1
    categories.update(p["topicSignals"].keys())
  self.assertEqual(sum(v-1 for v in hashes.values() if v>1),65)
  self.assertEqual(self.o["totals"]["sameNormalizedBodyHashExcessOccurrences"],65)
  self.assertEqual(dict(categories),self.o["totals"]["panelsWithLexicalSignal"])
 def test_20_actual_direct_articles_are_a_separate_subset_not_233_editorial_approvals(self):
  baseline={i for cohort in self.prev["cohorts"] for i in cohort["directReadArticleIds"]}
  twenty={r["articleId"] for r in self.d["rows"]}
  auto={r["articleId"] for r in self.o["records"]}
  self.assertEqual((len(baseline),len(twenty)),(93,20))
  self.assertFalse(baseline&twenty)
  self.assertTrue(twenty.issubset(auto))
  self.assertEqual(len(baseline|twenty),113)
  self.assertEqual(len(auto-twenty),213)
  self.assertEqual(self.d["release"]["productionArticlesApproved"],0)
if __name__=="__main__":unittest.main()
