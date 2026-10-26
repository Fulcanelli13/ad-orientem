"""B35: source-opened 35 records, exact 576 union, and no publication bypass."""
import json, unittest
from pathlib import Path
P=Path(__file__).resolve().parents[1]/"data/source-text"
def load(name):return json.loads((P/name).read_text(encoding="utf8"))
def ids(rows):
    values=[r["articleId"] for r in rows]
    assert len(values)==len(set(values))
    return set(values)
class B35DirectRead(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.prev=load("icrsp-france-b34-541-two-workstream-direct-topic-ledger.v1.json")
        cls.obs=load("icrsp-france-b35-35-direct-source-passages.v1.json")
        cls.new=load("icrsp-france-b35-576-unique-direct-topic-ledger.v1.json")
        cls.oldqueue=load("icrsp-france-b34-242-remaining120-priority-owner-queue.v1.json")
        cls.queue=load("icrsp-france-b35-207-unreviewed-owner-priority-queue.v1.json")
    def test_35_are_true_new_exact_ids(self):
        b,a,t=ids(self.prev["uniqueArticles"]),ids(self.obs["records"]),ids(self.new["uniqueArticles"])
        self.assertEqual((len(b),len(a),len(t)),(541,35,576))
        self.assertFalse(b&a)
        self.assertEqual(b|a,t)
        self.assertEqual(len(a&ids(self.oldqueue["prioritizedNext120"])),35)
        self.assertEqual(self.new["totals"]["remainingWithoutDirect"],783-576)
    def test_full_remaining_queue_stays_exact(self):
        remaining=self.queue["next85Priority"]+self.queue["other122"]
        self.assertEqual(len(remaining),207)
        self.assertEqual(len(self.queue["next85Priority"]),85)
        self.assertEqual(len(self.queue["other122"]),122)
        self.assertEqual(len(ids(remaining)),207)
        self.assertFalse(ids(remaining)&ids(self.new["uniqueArticles"]))
        self.assertEqual(self.queue["totals"]["remaining"],207)
        self.assertEqual(len(ids(remaining)|ids(self.new["uniqueArticles"])),783)
    def test_source_claims_not_promoted(self):
        self.assertFalse(self.obs["publicationApproved"])
        self.assertFalse(self.obs["sourceProseCopied"])
        self.assertFalse(self.new["publicationApproved"])
        self.assertFalse(self.queue["publicationApproved"])
        for r in self.obs["records"]:
            self.assertTrue(r["sourcePageWasDirectlyOpened"])
            self.assertTrue(r["observedContentTopic"])
            self.assertTrue(r["editorialReleaseHold"])
            self.assertTrue(r["sourceUrl"].endswith("article="+r["articleId"]))
            for field in ("allAuthorPanelsCollated","originalEditionVerified",
                "exactCanonicalAppOwnerRecordMatched","historicalClaimsFullyCertified",
                "rightsCleared","publicationApproved"):
                self.assertFalse(r[field])
    def test_two_checked_source_errors_remain_quarantined(self):
        corrections={r["articleId"]:r for r in self.obs["independentlyCheckedCorrections"]}
        self.assertEqual(set(corrections),{"a0316_ancien","a0559_ancien","a0137_nouveau"})
        self.assertIn("CHRONOLOGICAL_ANACHRONISM",corrections["a0316_ancien"]["disposition"])
        self.assertIn("LANDGRAVE",corrections["a0559_ancien"]["disposition"])
        self.assertIn("CONFLICT",corrections["a0137_nouveau"]["disposition"])
if __name__=="__main__":unittest.main()
