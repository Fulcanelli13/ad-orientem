"""B27: cross-thread dedup, actual-topic reading, and publication holds."""
import unittest, json
from pathlib import Path
from collections import Counter
D=Path(__file__).resolve().parents[1]/"data/source-text"
def load(file): return json.loads((D/file).read_text(encoding="utf8"))
class IcrspB27(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.q=load("icrsp-france-b27-reconciled-109-unread-article-queue.v1.json")
  cls.r=load("icrsp-france-b27-28-direct-source-topic-readings.v1.json")
  cls.p=load("icrsp-france-b27-12-scoped-owner-parity-and-two-drafts.v1.json")
  cls.source=load("icrsp-france-b22-233-distinct-source-body-scan-queue.v1.json")
  cls.pre=load("icrsp-france-b22-cross-workstream-93-direct-read-reconciliation.v1.json")
  cls.b23=load("icrsp-france-b23-twenty-additional-direct-commentary-topics.v1.json")
  cls.b24=load("icrsp-france-b24-25-direct-commentary-topic-observations.v1.json")
  cls.b25=load("icrsp-france-b25-75-direct-webpage-topic-passages.v1.json")
  cls.b26=load("icrsp-france-b26-twenty-direct-page-content-and-two-source-errors.v1.json")
  cls.other_b27=load("icrsp-france-b27-47-source-paragraphs-and-owner-holds.v1.json")
  cls.all=load("icrsp-france-b27-seven-stream-301-unique-direct-topic-ledger.v1.json")
 @classmethod
 def old_ids(cls):
  return set(cls.pre["cohorts"][0]["directReadArticleIds"])|set().union(
    *[set(x["directReadArticleIds"]) for x in cls.pre["cohorts"]])
 def test_109_reconciled_against_every_actual_prior_topic_cohort(self):
  prev=self.old_ids()
  b23={x["articleId"] for x in self.b23["rows"]}
  b24={x["articleId"] for x in self.b24["records"]}
  b25={x["articleId"] for x in self.b25["records"]}
  b26={x["articleId"] for x in self.b26["rows"]}
  src={x["articleId"] for x in self.source["rows"]}
  qids={x["articleId"] for x in self.q["records"]}
  ex={x["articleId"] for x in self.q["excludedAlreadyTopicRead"]}
  self.assertEqual(len(src),233)
  self.assertEqual(len(qids),109)
  self.assertEqual(ex,{"a0087_nouveau","a0114_nouveau","a0640_ancien","a0923_ancien"})
  self.assertEqual(qids|ex|b23|b24|b25,src)
  self.assertFalse(qids&(prev|b23|b24|b25|b26))
  self.assertEqual(self.q["counts"]["genuinelyTopicUnreadFromB23"],109)
  self.assertEqual(self.q["counts"]["otherAlreadyDirectInB22"],4)
  self.assertEqual(self.q["counts"]["parallelB26B21Overlap"],0)
 def test_28_source_readings_really_distinct(self):
  q={x["articleId"]:x for x in self.q["records"]}
  rows=self.r["records"]
  ids=[x["articleId"] for x in rows]
  self.assertEqual(len(rows),28)
  self.assertEqual(len(set(ids)),28)
  self.assertTrue(set(ids).issubset(q))
  self.assertEqual(self.r["remainingInB27Queue"],81)
  self.assertEqual(Counter(x["section"] for x in rows),self.r["sectionCounts"])
  for x in rows:
   z=q[x["articleId"]]
   self.assertEqual(x["sourceUrl"],z["sourceUrl"])
   self.assertEqual(x["sourceTitle"],z["articleTitle"])
   self.assertGreater(len(x["observedClaim"]),70)
   self.assertGreater(len(x["publicationHold"]),24)
   self.assertIn("NOT_FULL_PANELS",x["sourceReadKind"])
   for key in ("originalPrintAuthorCertified","canonicalOwnerRecordVerified",
               "rightsCleared","rubric1962Approved","publicationApproved"):
    self.assertIs(x[key],False,(x["articleId"],key))
 def test_total_union_254_with_parallel_b26(self):
  old=self.old_ids()
  sets=[{x["articleId"] for x in self.b23["rows"]},
        {x["articleId"] for x in self.b24["records"]},
        {x["articleId"] for x in self.b25["records"]}]
  b26={x["articleId"] for x in self.b26["rows"]}
  b27={x["articleId"] for x in self.r["records"]}
  base=old|set.union(*sets)
  self.assertEqual(len(base),206)
  self.assertFalse(b26&base)
  self.assertFalse(b27&(b26|base))
  self.assertEqual(len(base|b26|b27),254)
  self.assertEqual(self.r["combinedUniqueIncludingB26"],254)
  self.assertEqual(set(self.r["release"].values()),{0})
 def test_301_unique_articles_across_seven_parallel_workstreams(self):
  old=self.old_ids()
  b23={x["articleId"] for x in self.b23["rows"]}
  b24={x["articleId"] for x in self.b24["records"]}
  b25={x["articleId"] for x in self.b25["records"]}
  b26={x["articleId"] for x in self.b26["rows"]}
  b27={x["articleId"] for x in self.r["records"]}
  other={x["articleId"] for x in self.other_b27["records"]}
  u=old|b23|b24|b25|b26|b27
  self.assertEqual(len(u),254)
  self.assertEqual(len(other),47)
  self.assertFalse(other&u)
  self.assertEqual(len(u|other),301)
  self.assertEqual(len(self.all["uniqueArticles"]),301)
  self.assertEqual({x["articleId"] for x in self.all["uniqueArticles"]},u|other)
  self.assertEqual(self.all["counts"]["articlePasses"],308)
  self.assertEqual(self.all["counts"]["repeatPasses"],7)
  self.assertEqual(self.all["counts"]["remainingDistinctTopicUnreadArticles"],482)
  self.assertEqual(self.all["counts"]["newPublicationApproved"],0)
 def test_twelve_scope_checks_and_two_unreleased_bilingual_drafts(self):
  cs=self.p["comparisons"]
  drafts=self.p["editorialDrafts"]
  ids={x["articleId"] for x in self.r["records"]}
  self.assertEqual(len(cs),12)
  self.assertEqual(len(set(x for c in cs for x in c["articleIds"])),17)
  self.assertTrue(all(set(c["articleIds"]).issubset(ids) for c in cs))
  self.assertEqual(len(drafts),2)
  for c in cs:
   self.assertTrue(c["checkedExistingFiles"])
   self.assertGreater(len(c["existingContentEvidence"]),70)
   for k in ("canonicalOwnerRecordVerified","criticalOriginalPrintVerified",
             "sourceRightsCleared","approvedForApp"):
    self.assertIs(c[k],False)
  for d in drafts:
   self.assertIn(d["sourceArticleId"],ids)
   self.assertEqual(d["status"],"RESEARCH_DRAFT_NOT_APPROVED")
   self.assertIsNone(d["canonicalOwnerRecordId"])
   self.assertFalse(d["rightsToUseSourceWording"])
   self.assertGreater(len(d["en"]),150)
   self.assertGreater(len(d["fr"]),150)
  self.assertEqual(self.p["counts"]["approvedAppAdditions"],0)
  self.assertEqual(self.p["counts"]["globalGapsCertified"],0)
 def test_no_inferred_historic_rites_or_office(self):
  by={x["articleId"]:x for x in self.r["records"]}
  for id in ("a0010_nouveau","a0220_nouveau","a0204_nouveau",
             "a1035_ancien","a0833_ancien","a0239_ancien"):
   self.assertTrue(by[id]["publicationHold"])
  self.assertNotIn("a0055_nouveau",by)
if __name__=="__main__":unittest.main()
