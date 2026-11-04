"""ICRSP B31 audit: exact closure of old 250 research wave and 444 distinct topic reads."""
import json
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]/"data/source-text"
def load(p):return json.loads((ROOT/p).read_text(encoding="utf8"))
class B31SourceClosure(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.old=load("icrsp-france-b30-ten-stream-405-unique-topic-ledger.v1.json")
  cls.review=load("icrsp-france-b31-39-final-existing-queue-topical-review.v1.json")
  cls.new=load("icrsp-france-b31-eleven-stream-444-unique-topic-ledger.v1.json")
  cls.queue=load("icrsp-france-next250-metadata-reading-queue.v1.json")
  cls.handoff=load("icrsp-france-b29-unread81-and-fresh200-handoff.v1.json")
  cls.fresh=load("icrsp-france-b29-200-new-source-metadata.v1.json")
 def test_exact_39_sources_and_cache_exception(self):
  old={r["articleId"] for r in self.old["uniqueArticles"]}
  selected={r["articleId"] for r in self.handoff["remainingInExistingWave"]}
  rows=self.review["records"]
  ids=[r["articleId"] for r in rows]
  self.assertEqual(len(rows),39)
  self.assertEqual(len(set(ids)),39)
  self.assertFalse(set(ids)&old)
  self.assertTrue(set(ids)<=selected)
  cache=[r for r in rows if r["inspectionClass"]=="CACHED_WEB_SEARCH_RESULT_DIRECT_PASSAGE_NOT_LIVE_OPEN"]
  self.assertEqual(len(cache),1)
  self.assertEqual(cache[0]["articleId"],"a0055_nouveau")
  self.assertEqual(self.review["totals"]["viaLivePageOpen"],38)
  for r in rows:
   self.assertFalse(r["hostedProseReproduced"])
   self.assertFalse(r["printedOriginalAuthorWitnessChecked"])
   self.assertFalse(r["canonicalProperOrPersonIdCertified"])
   self.assertFalse(r["editoriallyApproved"])
 def test_unique_444_and_old_250_closed_with_no_new_shard_confusion(self):
  old={r["articleId"] for r in self.old["uniqueArticles"]}
  new={r["articleId"] for r in self.review["records"]}
  merged={r["articleId"] for r in self.new["uniqueArticles"]}
  original={r["articleId"] for r in self.queue["rows"]}
  fresh={r["articleId"] for r in self.fresh["records"]}
  self.assertEqual(len(old),405)
  self.assertEqual(len(merged),444)
  self.assertEqual(merged,old|new)
  self.assertEqual(len(original),250)
  self.assertTrue(original<=merged)
  self.assertEqual(len(fresh),200)
  self.assertFalse(merged&fresh)
  self.assertEqual(self.new["counts"]["notYetDirectTopicReviewed"],339)
  self.assertEqual(self.new["counts"]["old250Remaining"],0)
  self.assertEqual(self.new["counts"]["neverScreenedFreshRemaining"],139)
  self.assertFalse(self.new["publicationApproved"])
 def test_common_formularies_and_old_office_have_explicit_guards(self):
  byid={r["articleId"]:r for r in self.review["records"]}
  for id in ["a0329_ancien","a0326_ancien","a0055_nouveau","a0334_ancien",
             "a0341_ancien","a0336_ancien","a0335_ancien","a0339_ancien"]:
   self.assertIn("MASS_EXPLORER_COMMONS",byid[id]["proposedExistingOwner"])
  self.assertIn("DISTINCT_COLLECT",byid["a0336_ancien"]["reviewHold"])
  self.assertIn("DEDUP",byid["a0055_nouveau"]["reviewHold"])
  for id in ["a0171_ancien","a0170_ancien"]:
   self.assertIn("OFFICE_OUT_OF_SCOPE",byid[id]["proposedExistingOwner"])
  self.assertFalse(self.review["publicationApproved"])
if __name__=="__main__":unittest.main()
