"""B23 20 directly read ICRSP topics: dedup against six strands and fail-closed."""
import unittest,json
from pathlib import Path
from collections import Counter
D=Path(__file__).resolve().parents[1]/"data/source-text"
def load(name):return json.loads((D/name).read_text(encoding="utf8"))
class B23DirectSourceTopics(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.twenty=load("icrsp-france-b23-twenty-additional-direct-commentary-topics.v1.json")
  cls.prev=load("icrsp-france-b22-cross-workstream-93-direct-read-reconciliation.v1.json")
  cls.queue=load("icrsp-france-b22-233-distinct-source-body-scan-queue.v1.json")
 def test_all_twenty_exact_source_article_ids_new(self):
  rows=self.twenty["rows"]
  ids={x["articleId"] for x in rows}
  past={a for cohort in self.prev["cohorts"] for a in cohort["directReadArticleIds"]}
  available={r["articleId"] for r in self.queue["rows"]}
  self.assertEqual(len(past),93)
  self.assertEqual(len(rows),len(ids))
  self.assertEqual(len(rows),20)
  self.assertTrue(ids.issubset(available))
  self.assertFalse(ids&past)
  self.assertEqual(len(past|ids),113)
  self.assertEqual(self.twenty["combinedUniqueTopicArticleSample"],113)
  self.assertEqual(self.twenty["previousUniqueTopicArticleSample"],93)
 def test_every_record_has_credible_exact_source_location_and_blockers(self):
  self.assertEqual(Counter(r["section"] for r in self.twenty["rows"]),
     {"temporal":5,"sanctoral":5,"commons":6,"local_propers":4})
  for r in self.twenty["rows"]:
   self.assertEqual(r["sourceUrl"].rsplit("=",1)[-1],r["articleId"])
   self.assertGreater(len(r["observedEditorialSubject"]),50)
   self.assertGreater(len(r["publicationGate"]),45)
   self.assertIn("DIRECT_WEB_COMMENTARY_PASSAGE_INSPECTION",r["sourceReadKind"])
   for key in ("originalWorkEditionCertified","sourceCopyrightCleared",
               "canonicalTargetRecordConfirmed","humanTheologicalApproval","readyForApp"):
    self.assertFalse(r[key])
 def test_abandoned_vigil_and_duplication_exception(self):
  by={r["articleId"]:r for r in self.twenty["rows"]}
  old=by["a0045_nouveau"];other=by["a0304_ancien"]
  self.assertIn("1955",old["observedEditorialSubject"])
  self.assertIn("1955",other["publicationGate"])
  self.assertIn("duplicate",other["topicCode"].lower())
  self.assertFalse(self.twenty["publicationApproved"])
  self.assertEqual(self.twenty["release"]["theologicalEditorialApprovals"],0)
  self.assertEqual(self.twenty["release"]["productionArticlesApproved"],0)
  self.assertEqual(self.twenty["release"]["productionCodeChanges"],0)
if __name__=="__main__":unittest.main()
