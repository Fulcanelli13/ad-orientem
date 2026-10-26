"""B26: 20 actually inspected source pages, no duplicate owner claims or erroneous biography imports."""
import json
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def read(path):return json.loads((ROOT/path).read_text(encoding="utf8"))
class IcrspBatch26(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.x=read("data/source-text/icrsp-france-b26-twenty-direct-page-content-and-two-source-errors.v1.json")
  cls.b=read("data/source-text/icrsp-france-b21-140-automated-commentary-signals.v1.json")
  cls.p=read("data/source-text/icrsp-france-b22-relevance-exceptions-and-existing-owner-editorial-drafts.v1.json")
 def test_source_page_subset_and_counts(self):
  src={r["articleId"]:r for r in self.b["records"]}
  prior={r["articleId"] for r in self.p["humanReviewRecords"]}
  rows=self.x["rows"]; ids=[r["articleId"] for r in rows]
  self.assertEqual(len(rows),20)
  self.assertEqual(len(set(ids)),20)
  self.assertEqual(set(ids)&prior,set())
  self.assertTrue(set(ids).issubset(src))
  self.assertEqual(self.x["totals"]["cumulativeActuallyReadSelectedPages"],51)
  self.assertEqual(self.x["totals"]["onlyAutomatedLexicalScreenedRemaining"],109)
  for r in rows:
   self.assertEqual(r["sourceUrl"],src[r["articleId"]]["sourceUrl"])
   self.assertEqual(r["sourceReviewScope"],"SELECTED_RELEVANT_WEB_PAGE_EXCERPTS_INSPECTED_NOT_ALL_AUTHOR_PANELS")
   self.assertEqual(r["ownerRecordID"],"NOT_YET_VERIFIED")
   self.assertFalse(r["publicationApproved"])
 def test_known_authoritative_contradictions_blocked(self):
  byid={r["topicId"]:r for r in self.x["rows"]}
  self.assertEqual(self.x["totals"]["clearSourceDataErrors"],2)
  for topic in ("FRANCIS_CARACCIOLO_IMPOSSIBLE_FOUNDATION","TRINITY_FEAST_ALEXANDER_MISIDENTIFIED"):
   self.assertIn(topic,byid)
   self.assertIn("BLOCK",byid[topic]["releaseGate"])
   self.assertTrue(any(e["topicId"]==topic for e in self.x["externalCorroboration"]))
  self.assertIn("OVERLAPS",byid["EASTER_FRIDAY_NOAH_MOSES_BAPTISM"]["releaseGate"])
  self.assertIn("DUPLICATE",byid["LEO_II_LEO_I_TRANSLATION_CONFUSION"]["releaseGate"])
 def test_three_original_bilingual_drafts_with_review_holds(self):
  drafts=self.x["editorialPilots"]
  self.assertEqual(len(drafts),3)
  self.assertEqual(self.x["totals"]["originalBilingualContextDraftsPendingReview"],3)
  ids={r["articleId"] for r in self.x["rows"]}
  self.assertEqual(len({x["id"] for x in drafts}),3)
  for d in drafts:
   self.assertIn(d["sourceArticleId"],ids)
   self.assertIn("NEEDS",d["status"])
   self.assertGreater(len(d["en"]),170)
   self.assertGreater(len(d["fr"]),170)
   self.assertIn("EXISTING_",d["owner"])
  self.assertFalse(self.x["publicationApproved"])
 def test_never_promote_historic_rubrics_without_verification(self):
  self.assertEqual(self.x["totals"]["publishedFeatures"],0)
  self.assertEqual(self.x["totals"]["newProductionChanges"],0)
  self.assertFalse(self.x["publicationApproved"])
  for k in ("HOLY_INNOCENTS_COLOR_REFORM","EPIPHANY_VIGIL_1955","SAINT_JOSEPH_OLD_MOVABLE_FEAST"):
   self.assertTrue(by_id(k,self.x["rows"])["releaseGate"])
def by_id(topic,rows):return next(r for r in rows if r["topicId"]==topic)
if __name__=="__main__": unittest.main()
