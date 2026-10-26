"""B36: exact 641 direct-article union, 142 still unread and source duplication holds."""
import json, unittest
from pathlib import Path
B=Path(__file__).resolve().parents[1]/"data/source-text"
def load(name): return json.loads((B/name).read_text(encoding="utf8"))
def ids(rows):
    x=[r["articleId"] for r in rows]
    if len(set(x))!=len(x): raise AssertionError("duplicate article IDs")
    return set(x)
class B36ExactDirectRead(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
    cls.old=load("icrsp-france-b35-591-unique-direct-topic-ledger.v1.json")
    cls.new=load("icrsp-france-b36-641-unique-direct-topic-ledger.v1.json")
    cls.records=load("icrsp-france-b36-50-direct-source-observations.v1.json")
    cls.queue=load("icrsp-france-b36-142-unread-priority20-and-other122.v1.json")
 def test_exact_union(self):
    a,b,c=ids(self.old["uniqueArticles"]),ids(self.records["rows"]),ids(self.new["uniqueArticles"])
    self.assertEqual((len(a),len(b),len(c)),(591,50,641))
    self.assertFalse(a&b)
    self.assertEqual(a|b,c)
    self.assertEqual(self.new["counts"]["unreadDirectTopics"],783-641)
 def test_exact_backlog(self):
    q=self.queue["next20Priority"]+self.queue["remaining122"]
    self.assertEqual((len(q),len(self.queue["next20Priority"]),len(self.queue["remaining122"])),(142,20,122))
    self.assertFalse(ids(q)&ids(self.new["uniqueArticles"]))
    self.assertEqual(len(ids(q)|ids(self.new["uniqueArticles"])),783)
 def test_provenance_holds(self):
    self.assertFalse(self.records["publicationApproved"])
    self.assertFalse(self.new["publicationApproved"])
    self.assertFalse(self.queue["publicationApproved"])
    for r in self.records["rows"]:
        self.assertTrue(r["selectedPassageRead"])
        self.assertTrue(r["selectedSourceObservation"])
        self.assertTrue(r["sourceWebReference"].startswith("turn"))
        self.assertTrue(r["sourceUrl"].endswith("article="+r["articleId"]))
        for k in ("allHostedPanelsRead","originalPrintedEditionCollated","canonicalAppParagraphParityComplete","liturgical1962ApplicabilityIndependentlyCertified","rightsCleared","publicationApproved"):
            self.assertFalse(r[k])
 def test_exact_duplicate_panels_and_one_bad_title_quarantined(self):
    d=self.records["sourceDuplicationEvidence"]
    matches={tuple(x["articleIds"]):x["matchingPanelHashes"] for x in d}
    self.assertEqual(matches[("a0184_nouveau","a0514_ancien")],5)
    self.assertEqual(matches[("a0048_nouveau","a0322_ancien")],1)
    self.assertEqual(matches[("a0050_nouveau","a0324_ancien")],1)
    self.assertEqual(matches[("a0071_nouveau","a0072_nouveau","a0073_nouveau","a0074_nouveau","a0075_nouveau")],1)
    x=next(y for y in self.records["rows"] if y["articleId"]=="a0088_nouveau")
    self.assertEqual(x["articleTitle"],"Navigation")
    self.assertIn("BROKEN_PAGE_TITLE",x["editorialHold"])
if __name__=="__main__": unittest.main()
