"""B28 end-to-end sample gate: 160 exact selected pages, all with targeted excerpts; no claims published."""
import json,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def read(p):return json.loads((ROOT/p).read_text(encoding="utf8"))

class B28CompletedTargetedExcerptScreen(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.sample=read("data/source-text/icrsp-france-b20-sanctoral-temporal-160-content-selection.v1.json")
  cls.b21=read("data/source-text/icrsp-france-b21-ten-additional-commentary-claim-leads.v1.json")
  cls.b22=read("data/source-text/icrsp-france-b22-relevance-exceptions-and-existing-owner-editorial-drafts.v1.json")
  cls.b26=read("data/source-text/icrsp-france-b26-twenty-direct-page-content-and-two-source-errors.v1.json")
  cls.b27=read("data/source-text/icrsp-france-b27-47-source-paragraphs-and-owner-holds.v1.json")
  cls.b28=read("data/source-text/icrsp-france-b28-last62-complete-selected-excerpt-review.v1.json")
  cls.bulk=read("data/source-text/icrsp-france-b21-140-automated-commentary-signals.v1.json")
 def test_five_disjoint_human_excerpt_stages_equal_160_selected_articles(self):
  b20={r["articleId"] for r in self.sample["records"] if r["sourceTextStatus"].startswith("WEB_PAGE_DIRECTLY_READ")}
  b21={r["articleId"] for r in self.b21["reviewedRows"]}
  b22={r["articleId"] for r in self.b22["humanReviewRecords"]}
  b26={r["articleId"] for r in self.b26["rows"]}
  b27={r["articleId"] for r in self.b27["records"]}
  b28={r["articleId"] for r in self.b28["records"]}
  groups=[b20,b21,b22,b26,b27,b28]
  self.assertEqual([len(s) for s in groups],[10,10,11,20,47,62])
  self.assertEqual(sum(map(len,groups)),160)
  self.assertEqual(len(set.union(*groups)),160)
  self.assertEqual(set.union(*groups),{r["articleId"] for r in self.sample["records"]})
  self.assertEqual(self.b28["totals"]["selectedPagesWithoutTargetedExcerptReview"],0)
  self.assertEqual(self.b28["totals"]["selectedPagesWithAtLeastOneTargetedExcerptReviewed"],160)
 def test_b28_source_identity_is_real_and_no_misleading_promotion(self):
  metadata={r["articleId"]:r for r in self.bulk["records"]}
  self.assertEqual(len(metadata),140)
  self.assertEqual(len(self.b28["records"]),62)
  for r in self.b28["records"]:
   self.assertIn(r["articleId"],metadata)
   self.assertEqual(r["sourceUrl"],metadata[r["articleId"]]["sourceUrl"])
   self.assertEqual(r["sourceTitle"],metadata[r["articleId"]]["sourceTitle"])
   self.assertEqual(r["sourcePanelCount"],len(metadata[r["articleId"]]["panels"]))
   self.assertEqual(r["sourceReadingLevel"],"TARGETED_SITE_PRESENTATION_OR_NAMED_COMMENTARY_EXCERPT_READ")
   self.assertFalse(r["copyrightProseCopied"])
   self.assertFalse(r["originalPrintedEditionSeen"])
   self.assertFalse(r["canonicalAppRecordIdConfirmed"])
   self.assertFalse(r["approvedForProduction"])
  self.assertFalse(self.b28["publicationApproved"])
  self.assertEqual(self.b28["totals"]["productionContentApprovals"],0)
  self.assertEqual(self.b28["totals"]["fullAuthorOriginalPrintCollations"],0)
  self.assertEqual(self.b28["totals"]["canonicalAppChanges"],0)
 def test_three_page_errors_blocked_with_external_sources(self):
  c={r["articleId"]:r for r in self.b28["independentlyCorroboratedCorrections"]}
  self.assertEqual(set(c),{"a0429_ancien","a0555_ancien","a0560_ancien"})
  for id in c:
   self.assertTrue(c[id]["url"].startswith("https://"))
   r=next(r for r in self.b28["records"] if r["articleId"]==id)
   self.assertIn("BLOCK",r["reviewGate"])
  self.assertIn("Alexander VII",c["a0429_ancien"]["correction"])
  self.assertIn("230",c["a0560_ancien"]["correction"])
 def test_st_yves_version_conflict_preserved(self):
  hold=next(r for r in self.b27["significantHolds"] if r["topicId"]=="YVES_UNCERTIFIED_MASS_FORMULARY")
  r=next(r for r in self.b27["records"] if r["articleId"]=="a0150_nouveau")
  self.assertIn("1913",hold["requirement"])
  self.assertIn("a0993_ancien",hold["reason"])
  self.assertIn("NOT_YET_EXAMINED",r["releaseGate"])
  self.assertTrue(any(x["articleId"]=="a0993_ancien" for x in self.b28["records"]))

if __name__=="__main__":unittest.main()
