"""ICRSP eight-strand exact source-ID union and completed B20 160-topic sample."""
import json,unittest
from pathlib import Path
D=Path(__file__).resolve().parents[1]/"data/source-text"
def load(fn):return json.loads((D/fn).read_text(encoding="utf8"))
class IcrspB28Union(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.a=load("icrsp-france-b27-seven-stream-301-unique-direct-topic-ledger.v1.json")
  cls.b=load("icrsp-france-b28-last62-complete-selected-excerpt-review.v1.json")
  cls.c=load("icrsp-france-b28-eight-stream-363-unique-topic-ledger.v1.json")
  cls.b20=load("icrsp-france-b20-sanctoral-temporal-160-content-selection.v1.json")
  cls.b21=load("icrsp-france-b21-ten-additional-commentary-claim-leads.v1.json")
  cls.b22=load("icrsp-france-b22-relevance-exceptions-and-existing-owner-editorial-drafts.v1.json")
  cls.b26=load("icrsp-france-b26-twenty-direct-page-content-and-two-source-errors.v1.json")
  cls.b27=load("icrsp-france-b27-47-source-paragraphs-and-owner-holds.v1.json")
 def test_b28_62_are_all_new_in_the_seven_stream_301(self):
  old={r["articleId"] for r in self.a["uniqueArticles"]}
  new=[r["articleId"] for r in self.b["records"]]
  current={r["articleId"] for r in self.c["uniqueArticles"]}
  self.assertEqual(len(old),301)
  self.assertEqual(len(new),62)
  self.assertEqual(len(set(new)),62)
  self.assertFalse(old&set(new))
  self.assertEqual(len(current),363)
  self.assertEqual(current,old|set(new))
  self.assertEqual(self.c["counts"]["remainingWithoutDirectTopicRead"],420)
  self.assertEqual(self.c["counts"]["sevenOlderRepeatedPasses"],7)
  self.assertEqual(self.c["counts"]["eightCohortSourceArticlePasses"],370)
  self.assertEqual(self.c["counts"]["publicationApproved"],0)
 def test_all_160_b20_selected_have_a_specifically_read_excerpt(self):
  selection={r["articleId"] for r in self.b20["records"]}
  sources=[
   [r["articleId"] for r in self.b20["records"] if r["sourceTextStatus"]=="WEB_PAGE_DIRECTLY_READ_TOPIC_EXCERPT_ONLY"],
   [r["articleId"] for r in self.b21["reviewedRows"]],
   [r["articleId"] for r in self.b22["humanReviewRecords"]],
   [r["articleId"] for r in self.b26["rows"]],
   [r["articleId"] for r in self.b27["records"]],
   [r["articleId"] for r in self.b["records"]]
  ]
  self.assertEqual([len(s) for s in sources],[10,10,11,20,47,62])
  union=set(x for s in sources for x in s)
  self.assertEqual(len(selection),160)
  self.assertEqual(len(union),160)
  self.assertEqual(sum(map(len,sources)),160)
  self.assertEqual(union,selection)
  self.assertEqual(self.b["totals"]["selectedPagesWithoutTargetedExcerptReview"],0)
 def test_release_remains_closed(self):
  self.assertFalse(self.b["publicationApproved"])
  for x in self.b["records"]:
   self.assertEqual(x["sourceReadingLevel"],"TARGETED_SITE_PRESENTATION_OR_NAMED_COMMENTARY_EXCERPT_READ")
   for k in ("copyrightProseCopied","originalPrintedEditionSeen",
             "canonicalAppRecordIdConfirmed","approvedForProduction"):
    self.assertIs(x[k],False)
  for k in ("originalPrintCollationsCertified","publicationApproved"):
   self.assertEqual(self.c["counts"][k],0)
if __name__=="__main__":unittest.main()
