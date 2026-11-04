"""The Mass Explorer's canonical Proper owner must not be bypassed by ICRSP Commons."""
import json
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def load(p):return json.loads((ROOT/p).read_text(encoding="utf8"))
class B31CommonsOwner(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.x=load("data/source-text/icrsp-france-b31-eight-commons-owner-parity-hold.v1.json")
  cls.review=load("data/source-text/icrsp-france-b31-39-final-existing-queue-topical-review.v1.json")
 def test_exactly_eight_and_no_1962_approval(self):
  rows=self.x["rows"]
  reviews={r["articleId"]:r for r in self.review["records"]}
  self.assertEqual(len(rows),8)
  self.assertEqual(len({r["sourceArticleId"] for r in rows}),8)
  self.assertEqual(len({r["sourceFamily"] for r in rows}),7)
  self.assertEqual(self.x["counts"]["eligibleAppPublication"],0)
  for r in rows:
   self.assertEqual(r["sourceUrl"],reviews[r["sourceArticleId"]]["sourceUrl"])
   self.assertEqual(r["existingOwnerCandidate"],self.x["actualOwnerFile"])
   self.assertIsNone(r["canonical1962CommonFormularyId"])
   self.assertFalse(r["directImportAllowed"])
   self.assertFalse(r["publicationApproved"])
  self.assertFalse(self.x["publicationApproved"])
 def test_two_me_exspectaverunt_are_distinct_in_liturgical_class(self):
  a={r["sourceArticleId"]:r for r in self.x["rows"]}
  self.assertEqual(a["a0341_ancien"]["introit"],a["a0336_ancien"]["introit"])
  self.assertNotEqual(a["a0341_ancien"]["liturgicalClass"],a["a0336_ancien"]["liturgicalClass"])
  self.assertEqual(a["a0341_ancien"]["relatedSourceArticleId"],"a0336_ancien")
  self.assertEqual(a["a0336_ancien"]["relatedSourceArticleId"],"a0341_ancien")
  self.assertEqual(a["a0329_ancien"]["sourceFamily"],a["a0055_nouveau"]["sourceFamily"])
 def test_mass_explorer_remains_read_only_and_ordinary_registry_untouched(self):
  src=(ROOT/"src/learn/mass-explorer-selected-calendar-proper.js").read_text(encoding="utf8")
  self.assertIn("assessPrintableProper",src)
  self.assertIn("selectedCalendarProperProjection",src)
  self.assertNotIn("Sancti tui",src)
  data=load("data/learn/mass-explorer-prayer-readings.v1.json")
  self.assertEqual(data["scope"],"EXPLORER_ONLY")
  self.assertNotIn("Sancti tui",json.dumps(data,ensure_ascii=False))
if __name__=="__main__":unittest.main()
