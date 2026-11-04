"""B41: photographed Vatican 1962 Common structure, no implied app release."""
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
PATH=ROOT/"data/source-text/icrsp-france-b41-1962-vatican-three-commons-print-image-collation.v1.json"

class B41PrintedCommonVisualWitness(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.d=json.loads(PATH.read_text(encoding="utf-8"))
  cls.by={x["id"]:x for x in cls.d["cases"]}
 def test_1962_typica_source_page_provenance(self):
  d=self.d
  self.assertEqual(len(d["source"]["images"]),11)
  self.assertEqual(set(d["source"]["sourceIdentificationImages"]),{"I","III"})
  self.assertIn("23 June 1962",d["source"]["yearProof"])
  self.assertEqual(len(set(d["inspectedSourceImagePages"])),11)
  self.assertEqual(d["source"]["images"]["[19]"],"https://gregobase.selapa.net/sources/42/828.png")
  self.assertEqual(d["source"]["images"]["[31]"],"https://gregobase.selapa.net/sources/42/840.png")
  self.assertEqual(d["source"]["images"]["[36]"],"https://gregobase.selapa.net/sources/42/845.png")
  self.assertTrue(all(k in d["source"]["images"] for row in d["cases"] for k in row["printedPages"]))
  self.assertFalse(d["source"]["bytesCommittedToGitHub"])
  self.assertFalse(d["source"]["rightsToRedistributeScansConfirmed"])
 def test_three_separate_common_forms_and_no_wrong_full_mass_equation(self):
  self.assertEqual(len(self.by),3)
  virgin=self.by["MULTIPLE_VIRGIN_MARTYRS"]
  nonvirgin=self.by["MULTIPLE_NONVIRGIN_FEMALE_MARTYRS"]
  bishop=self.by["CONFESSOR_PONTIFF_STATUIT"]
  v={x["kind"]:x for x in virgin["printedRules"]}
  n={x["kind"]:x for x in nonvirgin["printedRules"]}
  b={x["kind"]:x for x in bishop["printedRules"]}
  self.assertEqual(v["BASE_MASS"]["name"],"Me exspectaverunt")
  self.assertEqual(v["EPISTLE_SUBSTITUTION"]["reference"],"1 Cor.7:25-34")
  self.assertEqual(v["EPISTLE_SUBSTITUTION"]["page"],"[33]")
  self.assertEqual(v["BASE_GOSPEL"]["reference"],"Mt.13:44-52")
  self.assertEqual(v["ALTERNATE_GOSPEL"]["reference"],"Mt.19:3-12")
  self.assertEqual(n["BASE_MASS"]["name"],"Me exspectaverunt")
  self.assertNotIn("EPISTLE_SUBSTITUTION",n)
  self.assertEqual(n["PLURAL_SUBSTITUTION"]["page"],"[36]")
  self.assertIn("Virginum",v["OWN_COLLECT"]["incipit"])
  self.assertNotIn("Virginum",n["OWN_COLLECT"]["incipit"])
  self.assertEqual(b["FIRST_MASS"]["name"],"Statuit ei")
  self.assertEqual(b["ALTERNATE_MASS"]["name"],"Sacerdotes tui")
  self.assertNotEqual(b["GOSPEL_FIRST"]["reference"],b["GOSPEL_SECOND"]["reference"])
  self.assertIn("Matt",self.d["correctionToB40"]["originalB40Gospel"].replace("Matthew","Matt"))
 def test_hard_scope_gates_and_real_owner_paths(self):
  for path,sha in self.d["mainOwnerFileBlobShas"].items():
   self.assertTrue((ROOT/path).exists(),path)
   self.assertRegex(sha,r"^[0-9a-f]{40}$")
  self.assertFalse(self.d["canPromoteToCanonicalProper"])
  self.assertFalse(self.d["canReleaseToMassExplorer"])
  self.assertFalse(self.d["sourceTextCopied"])
  self.assertFalse(self.d["publicationApproved"])
  self.assertFalse(self.d["productionFilesModified"])
  for key in ("completeDiplomaticFullFormulariesCertified","bilingualTextCertifications",
       "sourceImageRedistributionRights","actualAppProperSourcePathsTested","approvedProductionChanges"):
   self.assertEqual(self.d["counts"][key],0,key)
  self.assertEqual(self.d["counts"]["commonFamiliesVisualPass"],3)

if __name__=="__main__":unittest.main()
