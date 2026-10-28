"""B27 checks actual 47 selected-source excerpt reviews and blocks false liturgical promotion."""
import json
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def load(path):return json.loads((ROOT/path).read_text(encoding="utf8"))

class ICRSPB27(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.x=load("data/source-text/icrsp-france-b27-47-source-paragraphs-and-owner-holds.v1.json")
  cls.bulk=load("data/source-text/icrsp-france-b21-140-automated-commentary-signals.v1.json")
  cls.b22=load("data/source-text/icrsp-france-b22-relevance-exceptions-and-existing-owner-editorial-drafts.v1.json")
  cls.b26=load("data/source-text/icrsp-france-b26-twenty-direct-page-content-and-two-source-errors.v1.json")
 def test_47_are_distinct_and_exactly_from_remaining_109(self):
  x=self.x
  self.assertEqual(x["counts"]["newSourcePagesExcerptReviewed"],47)
  self.assertEqual(x["counts"]["priorHumanExcerptReviewed"],51)
  self.assertEqual(x["counts"]["cumulativeHumanExcerptReviewed"],98)
  self.assertEqual(x["counts"]["remainingOnlyAutomaticallyScreened"],62)
  self.assertEqual(len(x["records"]),47)
  ids={r["articleId"] for r in x["records"]}
  self.assertEqual(len(ids),47)
  owners={r["articleId"]:r for r in self.bulk["records"]}
  old={r["articleId"] for r in self.b22["humanReviewRecords"]}|{r["articleId"] for r in self.b26["rows"]}
  self.assertFalse(ids & old)
  self.assertTrue(ids<=owners.keys())
  observed={}
  for r in x["records"]:
   self.assertEqual(r["sourceUrl"],owners[r["articleId"]]["sourceUrl"])
   self.assertEqual(r["corpusSection"],owners[r["articleId"]]["section"])
   self.assertEqual(r["readScope"],"DIRECT_ICRSP_PAGE_TARGETED_EXCERPT_NOT_COMPLETE_AUTHOR_COLLATATION")
   self.assertFalse(r["canonicalRecordIdentityConfirmed"])
   self.assertFalse(r["originalPrintedWitnessSeen"])
   self.assertFalse(r["publicationApproved"])
   self.assertFalse(r["hostedCommentaryReproduced"])
   observed[r["corpusSection"]]=observed.get(r["corpusSection"],0)+1
  self.assertEqual(observed,x["counts"]["sourceSections"])
  self.assertEqual(observed,{"local_propers":12,"temporal":12,"ritual":3,"sanctoral":20})
 def test_high_severity_holds_and_positive_barnabas_correction(self):
  x=self.x
  holds={r["topicId"] for r in x["significantHolds"]}
  self.assertEqual(len(holds),x["counts"]["sourceErrorsAndHardHoldsNew"])
  self.assertEqual(len(holds),4)
  self.assertIn("YVES_UNCERTIFIED_MASS_FORMULARY",holds)
  self.assertIn("PIENT_AGENT_COLOMBE_MARTYR_DISPUTE",holds)
  self.assertNotIn("BARNABAS_ROMAN_CANON_NOBIS",holds)
  row=next(r for r in x["records"] if r["articleId"]=="a0185_nouveau")
  self.assertIn("NOBIS_QUOQUE_NAME_CONFIRMED",row["releaseGate"])
  self.assertIn("Barnaba",row["reportedSourceFinding"])
  self.assertEqual(len(x["independentChecks"]),1)
 def test_no_rite_calendar_or_liturgical_permissions_promoted(self):
  x=self.x
  self.assertFalse(x["publicationApproved"])
  self.assertEqual(x["counts"]["approvedFeatures"],0)
  self.assertEqual(x["counts"]["productionChanges"],0)
  for topic in ("PIED_ARGENT_VOTIVE_PERMISSION","OLD_HOLY_SATURDAY","CORPUS_CHRISTI_OLD_OCTAVE","BLAISE_CANDLES_AND_FOOD_BLESSINGS","MARRIAGE_LOCAL_CONSENT_FORM"):
   row=next(r for r in x["records"] if r["topicId"]==topic)
   self.assertTrue(row["releaseGate"])
if __name__=="__main__":unittest.main()
