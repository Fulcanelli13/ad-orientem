"""B24: directly inspected article topic paragraphs, not all panels or publication clearance."""
import json
import unittest
from collections import Counter
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1] / "data/source-text"
def load(name):
    return json.loads((ROOT/name).read_text(encoding="utf-8"))

class B24DirectTopicNotes(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.d=load("icrsp-france-b24-25-direct-commentary-topic-observations.v1.json")
        cls.queue=load("icrsp-france-b23-next100-human-editorial-priority.v1.json")
        cls.prev=load("icrsp-france-b23-twenty-additional-direct-commentary-topics.v1.json")
        cls.preprev=load("icrsp-france-b22-cross-workstream-93-direct-read-reconciliation.v1.json")

    def test_exact_source_ids_and_four_cross_cohort_repeats(self):
        rows=self.d["records"]
        ids=[r["articleId"] for r in rows]
        q={r["id"]:r for r in self.queue["records"]}
        past={r["articleId"] for r in self.prev["rows"]}
        old={id for cohort in self.preprev["cohorts"] for id in cohort["directReadArticleIds"]}
        self.assertEqual(len(rows),25)
        self.assertEqual(len(ids),len(set(ids)))
        self.assertTrue(set(ids).issubset(q))
        self.assertFalse(set(ids)&past)
        self.assertEqual(set(ids)&old,set(self.d["alreadyDirectReadBeforeB24"]))
        self.assertEqual(len(set(ids)&old),4)
        self.assertEqual(len(old|past|set(ids)),134)
        self.assertEqual(self.d["newDistinctDirectTopicReads"],21)
        self.assertEqual(self.d["sourceArticlePasses"],25)
        self.assertEqual(self.d["combinedDistinctDirectTopicReadsAfterIdReconciliation"],134)
        self.assertEqual(self.d["next100StillWithoutThisReview"],75)
        for r in rows:
            original=q[r["articleId"]]
            self.assertEqual((r["sourceUrl"],r["sourceTitle"],r["section"]),
                             (original["sourceUrl"],original["title"],original["section"]))

    def test_locations_and_individual_reading_notes(self):
        rows=self.d["records"]
        self.assertEqual(Counter(r["section"] for r in rows),
                         self.d["sectionCounts"])
        self.assertEqual(self.d["sectionCounts"],
                         {"temporal":10,"sanctoral":10,"commons":2,"local_propers":3})
        for r in rows:
            self.assertEqual(r["sourceUrl"].rsplit("=",1)[-1],r["articleId"])
            self.assertGreater(len(r["sourceSectionLocator"]),9)
            self.assertGreater(len(r["observedEditorialSubject"]),65)
            self.assertGreater(len(r["publicationGate"]),65)
            self.assertTrue(r["topicCode"])
            self.assertEqual(r["sourceReadKind"],
                             "DIRECT_ORIGINAL_WEBPAGE_TOPIC_PASSAGE_INSPECTION_NOT_FULL_ALL_PANELS")

    def test_all_original_publication_owners_fail_closed(self):
        for r in self.d["records"]:
            for k in ("originalWorkEditionCertified","sourceCopyrightCleared",
                      "canonicalTargetRecordConfirmed","humanTheologicalApproval",
                      "readyForApp"):
                self.assertIs(r[k],False,(r["articleId"],k))
        for k in ("rightsCleared","originalEditionsCollated","ownerParityVerified",
                  "publicationApproved"):
            self.assertEqual(self.d[k],0)
        self.assertIn("not all author panels",self.d["method"])

if __name__=="__main__":
    unittest.main()
