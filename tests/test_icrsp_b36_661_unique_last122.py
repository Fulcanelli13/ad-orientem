"""B36 source integrity: 70 direct selected passages, canonical set union and final 122."""
import json,unittest
from pathlib import Path
D=Path(__file__).resolve().parents[1]/"data/source-text"
def rd(name):return json.loads((D/name).read_text(encoding="utf8"))
class B36FinalPriority70(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.old=rd("icrsp-france-b35-591-unique-direct-topic-ledger.v1.json")
  cls.queue=rd("icrsp-france-b35-after50-priority70-and-rest122.v1.json")
  cls.source=rd("icrsp-france-b36-final70-priority-direct-source-notes.v1.json")
  cls.current=rd("icrsp-france-b36-661-unique-direct-topic-ledger.v1.json")
  cls.rest=rd("icrsp-france-b36-only122-left-owner-review.v1.json")
 def test_exact_nonoverlapping_70_and_final_122(self):
  old={x["articleId"] for x in self.old["uniqueArticles"]}
  rows=self.source["records"]
  fresh={x["articleId"] for x in rows}
  new={x["articleId"] for x in self.current["uniqueArticles"]}
  rest={x["articleId"] for x in self.rest["records"]}
  self.assertEqual((len(old),len(rows),len(fresh),len(new),len(rest)),(591,70,70,661,122))
  self.assertFalse(old&fresh)
  self.assertEqual([x["articleId"] for x in rows],[x["articleId"] for x in self.queue["priorityRemaining"]])
  self.assertEqual(new,old|fresh)
  self.assertFalse(new&rest)
  self.assertEqual(len(new|rest),783)
  self.assertEqual(rest,{x["articleId"] for x in self.queue["laterRemaining"]})
 def test_source_and_production_certifications_all_closed(self):
  self.assertFalse(self.source["sourceProseCopied"])
  self.assertFalse(self.source["publicationApproved"])
  self.assertFalse(self.current["publicationApproved"])
  for r in self.source["records"]:
   self.assertTrue(r["individualSourceTopicReviewed"])
   self.assertIn("EXACT_LIVE_SOURCE_PAGE",r["inspectionClass"])
   self.assertEqual(r["sourceUrl"].split("article=")[-1],r["articleId"])
   self.assertGreater(len(r["observedSourceTopic"]),45)
   self.assertTrue(r["editorialHold"])
   for key in ("allAuthorPanelsExhaustivelyRead","originalPrintEditionChecked",
      "exactExistingAppOwnerContentParityDone","criticalHistoricalClaimVerified",
      "sourceReproductionRightsCleared","certified1962ProperOrRubrics",
      "approvedForApp","hostedProseCopied"):
    self.assertFalse(r[key],(r["articleId"],key))
 def test_anomalies_and_liturgical_holds(self):
  by={x["articleId"]:x for x in self.source["records"]}
  self.assertIn("Clet",by["a0088_nouveau"]["displayedTitleCorrection"])
  self.assertIn("Navigation",by["a0088_nouveau"]["displayedTitleCorrection"])
  for id in ("a0829_ancien","a0830_ancien"):
   self.assertIn("WEEK_LABEL_INCONSISTENCY",by[id]["editorialHold"])
  for id in ("a0165_nouveau","a0220_ancien","a0221_ancien","a0020_nouveau","a0595_ancien"):
   self.assertTrue(by[id]["editorialHold"])
  for id in ("a0071_nouveau","a0072_nouveau","a0073_nouveau","a0074_nouveau","a0075_nouveau"):
   self.assertIn("SATURDAY_MARIAN",by[id]["editorialHold"])
  self.assertIn("1955",by["a0506_ancien"]["editorialHold"])
  self.assertIn("HISTORICAL_EXISTENCE_DISPUTED",by["a0561_ancien"]["editorialHold"])
if __name__=="__main__":unittest.main()
