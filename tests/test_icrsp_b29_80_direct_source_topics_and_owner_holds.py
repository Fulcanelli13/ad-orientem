"""B29: 80 directly inspected original pages, one search-only alias, never published."""
import json,unittest
from pathlib import Path
D=Path(__file__).resolve().parents[1]/"data/source-text"
def get(name):return json.loads((D/name).read_text(encoding="utf8"))
class IcrspB29(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.q=get("icrsp-france-b27-reconciled-109-unread-article-queue.v1.json")
  cls.b27=get("icrsp-france-b27-28-direct-source-topic-readings.v1.json")
  cls.prev=get("icrsp-france-b28-eight-stream-363-unique-topic-ledger.v1.json")
  cls.parts=[
    get("icrsp-france-b29-first30-direct-excerpts.v1.json"),
    get("icrsp-france-b29-second30-direct-excerpts.v1.json"),
    get("icrsp-france-b29-last21-20-direct-one-search.v1.json")
  ]
  cls.all=get("icrsp-france-b29-nine-stream-443-unique-topic-ledger.v1.json")
  cls.owner=get("icrsp-france-b29-18-owner-comparisons-and-one-confirmed-chronology-error.v1.json")
 def test_remaining_81_80_direct_one_search_only(self):
  prior={x["articleId"] for x in self.b27["records"]}
  q={x["articleId"]:x for x in self.q["records"]}
  rows=[x for part in self.parts for x in part["records"]]
  ids=[x["articleId"] for x in rows]
  direct={x["articleId"] for x in rows if x["sourceReviewLevel"]=="DIRECT_WEBPAGE_EXCERPT"}
  indexed={x["articleId"] for x in rows if x["sourceReviewLevel"]=="SEARCH_INDEX_EXCERPT_ONLY"}
  self.assertEqual([len(x["records"]) for x in self.parts],[30,30,21])
  self.assertEqual(len(ids),len(set(ids)))
  self.assertEqual(set(ids)|prior,set(q))
  self.assertEqual(len(direct),80)
  self.assertEqual(indexed,{"a0055_nouveau"})
  self.assertEqual(set(ids)&prior,set())
  for x in rows:
   y=q[x["articleId"]]
   self.assertEqual((x["sourceUrl"],x["sourceTitle"],x["section"]),
                    (y["sourceUrl"],y["articleTitle"],y["section"]))
   self.assertGreater(len(x["observedSubject"]),40)
   for field in ("originalWitnessCertified","canonicalOwnerConfirmed",
                 "rightsCleared","publicationApproved"):
    self.assertIs(x[field],False,(x["articleId"],field))
 def test_443_correct_unique_not_444(self):
  prior={x["articleId"] for x in self.prev["uniqueArticles"]}
  now={x["articleId"] for x in self.all["uniqueArticles"]}
  readings={x["articleId"] for d in self.parts for x in d["records"]
            if x["sourceReviewLevel"]=="DIRECT_WEBPAGE_EXCERPT"}
  self.assertEqual(len(prior),363)
  self.assertEqual(len(readings),80)
  self.assertFalse(readings&prior)
  self.assertEqual(now,prior|readings)
  self.assertEqual(len(now),443)
  self.assertNotIn("a0055_nouveau",now)
  self.assertEqual(self.all["counts"]["withoutFirstDirectReading"],340)
  self.assertEqual(self.all["counts"]["b23Reconciled109StillDirectPending"],1)
  self.assertEqual(self.all["counts"]["approvedExplanationCount"],0)
 def test_owner_decisions_fail_closed_and_chronology(self):
  cases=self.owner["cases"]
  self.assertEqual(len(cases),18)
  ids={x["articleId"] for p in self.parts for x in p["records"]}
  self.assertTrue(all(set(c["articleIds"])<=ids for c in cases))
  for c in cases:
   self.assertTrue(c["checkedExistingFiles"])
   self.assertGreater(len(c["observedDifferential"]),65)
   for field in ("exactCanonicalRecordIdConfirmed",
                 "criticalOriginalPrintCollation","translationRightsCleared",
                 "ownerPublicationApproval"):
    self.assertIs(c[field],False)
  fact=self.owner["independentlyCorroboratedError"]
  self.assertEqual(fact["articleId"],"a0085_nouveau")
  self.assertEqual(fact["incorrectHostedValue"],"Martyr en 622")
  self.assertIn("1622",fact["correctedValue"])
  self.assertEqual(len(fact["independentSources"]),3)
  self.assertFalse(fact["importedToLiveApp"])
  self.assertEqual(self.owner["counts"]["approvedContentAdds"],0)
if __name__=="__main__":unittest.main()
