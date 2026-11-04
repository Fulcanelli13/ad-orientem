"""B35: first fifty distinct source-page topic readings without release promotion."""
import json,unittest
from pathlib import Path
P=Path(__file__).resolve().parents[1]/"data/source-text"
def rd(n): return json.loads((P/n).read_text(encoding="utf-8"))
class B35First50(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.before=rd("icrsp-france-b34-541-two-workstream-direct-topic-ledger.v1.json")
  cls.queue=rd("icrsp-france-b34-242-remaining120-priority-owner-queue.v1.json")
  cls.read=rd("icrsp-france-b35-first50-priority-direct-topic-excerpts.v1.json")
  cls.after=rd("icrsp-france-b35-591-unique-direct-topic-ledger.v1.json")
  cls.pending=rd("icrsp-france-b35-after50-priority70-and-rest122.v1.json")
 def test_fifty_exact_first_priority_and_disjoint_union(self):
  before={x["articleId"] for x in self.before["uniqueArticles"]}
  reviewed=[x["articleId"] for x in self.read["records"]]
  after={x["articleId"] for x in self.after["uniqueArticles"]}
  all_queue=[x["articleId"] for x in self.queue["prioritizedNext120"]+self.queue["later122"]]
  self.assertEqual((len(before),len(reviewed),len(set(reviewed)),len(after)),(541,50,50,591))
  self.assertFalse(before&set(reviewed))
  self.assertEqual(reviewed,[x["articleId"] for x in self.queue["prioritizedNext120"][:50]])
  self.assertEqual(after,before|set(reviewed))
  self.assertEqual(len(all_queue),len(set(all_queue)))
  self.assertEqual(len(self.pending["priorityRemaining"]),70)
  self.assertEqual(len(self.pending["laterRemaining"]),122)
  remaining={x["articleId"] for x in self.pending["priorityRemaining"]+self.pending["laterRemaining"]}
  self.assertEqual(remaining,set(all_queue)-set(reviewed))
  self.assertFalse(remaining&after)
  self.assertEqual(len(after|remaining),783)
 def test_direct_passage_not_complete_author_or_missal_certification(self):
  self.assertFalse(self.read["publicationApproved"])
  self.assertFalse(self.read["sourceProseCopied"])
  self.assertFalse(self.pending["publicationApproved"])
  for x in self.read["records"]:
   self.assertTrue(x["distinctArticleTopicReviewed"])
   self.assertIn("ONE_SELECTED_SOURCE_PASSAGE",x["observationScope"])
   self.assertEqual(x["sourceUrl"].split("article=")[-1],x["articleId"])
   self.assertGreater(len(x["sourceObservation"]),60)
   self.assertGreater(len(x["releaseHold"]),18)
   for field in ("originalPrintedEditionCollated","allSourcePanelsRead","rightsCleared",
      "exactCanonicalOwnerParityChecked","missingFeatureConfirmed","liturgical1962RubricsCertified",
      "publicationApproved","sourceProseReproduced"):
    self.assertFalse(x[field],(x["articleId"],field))
 def test_identity_calendar_and_false_author_boundaries(self):
  rows={x["articleId"]:x for x in self.read["records"]}
  for id in ("a0779_ancien","a0987_ancien","a0782_ancien","a0783_ancien",
             "a0991_ancien","a0160_nouveau","a0161_nouveau","a0162_nouveau",
             "a0612_ancien","a0989_ancien","a0780_ancien"):
   self.assertTrue(any(word in rows[id]["releaseHold"] for word in ("OCTAVE","SUPPRESSED","REMOVED")))
  for id in ("a0137_nouveau","a0091_nouveau","a0552_ancien","a0187_nouveau",
             "a0551_ancien","a0547_ancien","a0567_ancien"):
   self.assertTrue(rows[id]["releaseHold"])
  self.assertIn("ENCYCLICAL",rows["a0991_ancien"]["releaseHold"])
  self.assertIn("1920_FORMULARY",rows["a0398_ancien"]["releaseHold"])
  self.assertIn("PASSIO",rows["a0193_nouveau"]["releaseHold"])
if __name__=="__main__":unittest.main()
