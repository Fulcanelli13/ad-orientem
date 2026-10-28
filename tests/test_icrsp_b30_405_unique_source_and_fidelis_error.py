"""B30: exact nonoverlap, source truth, independent-evidence and 1962 holds."""
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]/"data/source-text"
def load(path):return json.loads((ROOT/path).read_text(encoding="utf-8"))

class B30SourceReview(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.previous=load("icrsp-france-b29-nine-stream-375-unique-topic-ledger.v1.json")
  cls.reviews=load("icrsp-france-b30-30-direct-page-claims-and-source-duplication.v1.json")
  cls.queue=load("icrsp-france-b29-unread81-and-fresh200-handoff.v1.json")
  cls.current=load("icrsp-france-b30-ten-stream-405-unique-topic-ledger.v1.json")

 def test_30_actual_source_topic_reads_from_exact_69_remaining(self):
  previously={r["articleId"] for r in self.previous["uniqueArticles"]}
  source={r["articleId"]:r for r in self.queue["remainingInExistingWave"]}
  new=self.reviews["records"]
  ids=[r["articleId"] for r in new]
  self.assertEqual(len(previously),375)
  self.assertEqual(len(ids),30)
  self.assertEqual(len(set(ids)),30)
  self.assertTrue(set(ids)<=source.keys())
  self.assertFalse(set(ids)&previously)
  self.assertEqual(len(source.keys() - ({r["articleId"] for r in self.current["uniqueArticles"]})),39)
  for r in new:
   self.assertEqual(r["sourceUrl"],source[r["articleId"]]["sourceUrl"])
   self.assertEqual(r["sourceTitle"],source[r["articleId"]]["sourceTitle"])
   self.assertEqual(r["readingScope"],"SELECTED_ACTUAL_ICRSP_PRESENTATION_OR_COMMENTARY_PASSAGE_WEB_OPEN")
   self.assertTrue(r["sourceInterpretationNotProof"])
   self.assertFalse(r["printedAuthorEditionValidated"])
   self.assertFalse(r["canonicalOwnerIdConfirmed"])
   self.assertFalse(r["publicContentApproved"])

 def test_two_duplicate_pairs_not_four_independent_witnesses(self):
  dup=self.reviews["duplicateSourcePageFamilies"]
  self.assertEqual(len(dup),2)
  self.assertEqual({frozenset(x["articleIds"]) for x in dup},
   {frozenset(("a0810_ancien","a0144_nouveau")),
    frozenset(("a0765_ancien","a0116_nouveau"))})
  self.assertTrue(all(x["independentEvidenceCount"]==1 for x in dup))
  self.assertEqual(self.current["counts"]["sourceDuplicateArticlePairs"],2)

 def test_fidelis_622_typo_blocked_and_rubrics_not_promoted(self):
  fixes=self.reviews["noteworthyCorrections"]
  self.assertEqual(len(fixes),1)
  x=fixes[0]
  self.assertEqual(x["articleId"],"a0085_nouveau")
  self.assertEqual(x["blockedValue"],"Martyr en 622")
  self.assertIn("1622",x["correctValue"])
  self.assertGreaterEqual(len(x["externalSources"]),2)
  byid={r["articleId"]:r for r in self.reviews["records"]}
  self.assertIn("BLOCK_622",byid["a0085_nouveau"]["editorialGate"])
  self.assertIn("NO_JUL13_FEAST",byid["a0362_ancien"]["editorialGate"])
  for id in ("a0970_ancien","a0971_ancien","a0973_ancien","a0974_ancien"):
   self.assertIn("NOT_",byid[id]["editorialGate"])
  self.assertFalse(self.reviews["publicationApproved"])

 def test_ten_stream_unique_reviewed_total_405_and_378_held(self):
  old={r["articleId"] for r in self.previous["uniqueArticles"]}
  fresh={r["articleId"] for r in self.reviews["records"]}
  now={r["articleId"] for r in self.current["uniqueArticles"]}
  self.assertEqual(now,old|fresh)
  self.assertEqual(len(now),405)
  self.assertEqual(self.current["counts"]["remainingWithoutDirectTopicReview"],378)
  self.assertEqual(self.current["counts"]["originalWaveRemaining"],39)
  self.assertEqual(self.current["counts"]["canonicalAppPublication"],0)
  self.assertFalse(self.current["publicationApproved"])

if __name__=="__main__":unittest.main()
