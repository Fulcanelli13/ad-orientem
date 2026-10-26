"""B40: finite Saints pilot identity matches and electronic Commons are not 1962 release."""
import json,unittest
from pathlib import Path
BASE=Path(__file__).resolve().parents[1]
P=BASE/"data/source-text"
def rd(p):return json.loads((BASE/p).read_text(encoding="utf-8"))
class B40ScopedIdentityAndCommons(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.r=rd("data/source-text/icrsp-france-b40-three-commons-and-six-saints-snapshot-owner-check.v1.json")
  cls.saints=rd("data/saints/holiness-first-editorial-pilot-20261015.v1.json")
  cls.calendar=rd("data/calendar/living-sanctoral-pilot.v1.json")
  cls.living=rd("data/calendar/living-sanctoral-read-model.v1.json")
  cls.census=rd("data/calendar/post1960-canonizations.official-batch1.v1.json")
  cls.commons=rd("data/calendar/traditional-1962-common-formularies.review.v1.json")
 def test_exact_found_matches_in_actual_pilots(self):
  existing={x["saint_id"] for x in self.saints["people"]}
  calendar={x["id"] for x in self.calendar["persons"]}
  snapshots={x["id"] for x in self.living["pilotPersons"]+self.living["censusPersons"]}
  canonized={x["id"] for x in self.census["persons"]}
  self.assertEqual(len(self.saints["people"]),6)
  self.assertEqual(len(calendar),6)
  self.assertEqual(len(canonized),258)
  ids=self.r["identityCrosswalk"]
  self.assertEqual(len(ids),6)
  self.assertEqual(len(set(row["articleId"] for row in ids)),6)
  cases={x["articleId"]:x for x in ids}
  self.assertEqual(cases["a0889_ancien"]["proposedId"],"saint:bernadette-soubirous")
  self.assertIn(cases["a0889_ancien"]["proposedId"],existing)
  self.assertIn(cases["a0493_ancien"]["proposedId"],existing)
  self.assertIn(cases["a0491_ancien"]["proposedId"],calendar&snapshots)
  all_ids=existing|calendar|snapshots|canonized
  for article in ("a0415_ancien","a1037_ancien","a0510_ancien"):
   self.assertIsNone(cases[article]["proposedId"])
   self.assertEqual(cases[article]["status"],"NO_EXACT_CANONICAL_PERSON_ID_IN_INSPECTED_OWNER_SUBSETS")
  self.assertFalse(any("chantal" in x.lower() or "caracciolo" in x.lower() for x in all_ids))
 def test_electronic_commons_have_slot_level_holds(self):
  self.assertEqual(len(self.r["formulaComparison"]),3)
  existingIds={x["id"] for x in self.commons["candidates"]}
  self.assertEqual(existingIds,set(self.r["advisoryCommonIndex"]["existingIds"]))
  self.assertEqual(len(existingIds),3)
  for row in self.r["formulaComparison"]:
   self.assertIsNone(row["currentAppAdvisoryCommonId"])
   self.assertTrue(row["secondElectronicWitness"].startswith("https://missale.online/proprium/"))
   self.assertTrue(len(row["directlyComparedLiturgicalElements"])>=2)
   for gate in ("criticalPrint1962PageViewed","fullyMatched1962DiplomaticLatin",
                "englishFrenchTranslationCertified","ownerSourcePathParity"):
    self.assertFalse(row[gate],(row["family"],gate))
  self.assertFalse(self.r["advisoryCommonIndex"]["proofOfRuntimeMissingFormularies"])
 def test_zero_app_edits_and_pinned_existing_files(self):
  self.assertEqual(len(self.r["mainOwnerFileBlobShas"]),9)
  for path,sha in self.r["mainOwnerFileBlobShas"].items():
   self.assertTrue((BASE/path).is_file())
   self.assertRegex(sha,r"^[a-f0-9]{40}$")
  for gate in ("publicationApproved","printedEditionFullyCollated","rightsCleared","productionChanged"):
   self.assertFalse(self.r[gate])
  for k in ("print1962FormularyPagesVisuallyCertified","sourceReproductionPermissions",
            "canonicalOwnerCorrections","appPublications"):
   self.assertEqual(self.r["counts"][k],0)
if __name__=="__main__":unittest.main()
