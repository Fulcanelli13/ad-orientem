"""ICRSP B39 owner comparison: 18 real owner files, no speculative release."""
import json,unittest
from pathlib import Path
P=Path(__file__).resolve().parents[1]
R=P/"data/source-text"
def read(p):return json.loads((R/p).read_text(encoding="utf-8"))
class B39ExistingOwnerComparison(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.doc=read("icrsp-france-b39-eighteen-existing-owner-scoped-parity.v1.json")
  cls.baseline=read("icrsp-france-b38-783-all-selected-source-passages-ledger.v1.json")
 def test_corpus_owner_pins_and_18_scoped_cases(self):
  d=self.doc
  self.assertEqual(d["counts"]["scopedComparisons"],18)
  self.assertEqual(len(d["cases"]),18)
  self.assertEqual(len(d["mainOwnerFileBlobShas"]),14)
  ids=[id for case in d["cases"] for id in case["sourceArticleIds"]]
  self.assertEqual(len(set(ids)),49)
  self.assertEqual(d["counts"]["uniqueICRSPArticleIds"],49)
  corpus={r["articleId"] for r in self.baseline["uniqueArticles"]}
  self.assertTrue(set(ids)<=corpus)
  self.assertEqual(len(corpus),783)
  self.assertEqual(len(set(c["caseId"] for c in d["cases"])),18)
  for case in d["cases"]:
   self.assertTrue(case["checkedOwnerFiles"])
   for source in case["checkedOwnerFiles"]:
    self.assertEqual(source["blobSha"],d["mainOwnerFileBlobShas"][source["path"]])
    self.assertTrue((P/source["path"]).is_file())
   self.assertTrue(case["requiredNextGate"])
   self.assertTrue(case["sourceClaim"])
   self.assertTrue(case["existingOwnerEvidence"])
   for k in ("originalSourceEditionCollated","canonicalOwnerExactRecordIdConfirmed",
             "full1962FormularyTextParityCertified","reproductionRightsCleared",
             "productionPublicationApproved"):
    self.assertFalse(case[k],(case["caseId"],k))
 def test_critical_case_dispositions(self):
  rows={r["caseId"]:r for r in self.doc["cases"]}
  self.assertIn("RESEARCH_INDEX_MISSING",rows["COMMUNE_CONFESSOR_BISHOP_STATUIT"]["disposition"])
  self.assertIn("EXISTING_IDENTITY",rows["SATURDAY_BVM_FIVE_SEASONAL_FORMS"]["disposition"])
  self.assertIn("CONFIRMED_SOURCE_ERROR",rows["CARACCIOLO_SOURCE_FOUNDATION_YEAR"]["disposition"])
  self.assertIn("CONFIRMED_SOURCE_ERROR",rows["CHANTAL_SOURCE_DATE_AND_POPE"]["disposition"])
  self.assertIn("LOCAL_1962",rows["ST_REMI_GENERAL_VS_FRENCH_PROPER"]["disposition"])
  self.assertIn("EXISTING_RITE",rows["RESTORED_HOLY_THURSDAY"]["disposition"])
  self.assertIn("OUT_OF_SCOPE",rows["DIVINE_OFFICE_NINE_SOURCES"]["disposition"])
  self.assertIn("EMPTY",rows["EXPLANATORY_STUDIES_PUBLICATION"]["disposition"])
 def test_independent_historical_corrections_are_evidence_only(self):
  checks={x["id"]:x for x in self.doc["externalIndependentSourceChecks"]}
  self.assertEqual(len(checks),2)
  self.assertEqual(self.doc["counts"]["independentlyVerifiedIncorrectFields"],3)
  ch=checks["CHANTAL_YEAR_AND_PONTIFF"]
  self.assertEqual(ch["hostClaims"]["death"],"1643-12-13")
  self.assertEqual(ch["corroborated"]["death"],"1641-12-13")
  self.assertEqual(ch["corroborated"]["canonizer"],"Clement XIII")
  car=checks["CARACCIOLO_FOUNDATION_YEAR"]
  self.assertEqual(car["hostClaims"]["orderFoundationYear"],1558)
  self.assertEqual(car["corroborated"]["orderFoundationYear"],1588)
  for row in checks.values():
   self.assertTrue(row["independentAuthority"].startswith("https://www.vaticanstate.va/"))
   self.assertFalse(row["applicationUpdated"])
 def test_no_rights_release_or_app_migration(self):
  self.assertEqual({self.doc["counts"][k] for k in (
    "newProductionFeaturesApproved","certifiedMissingProductionClaims","rightsCleared",
    "originalPrinted1962FormularyCertifications","exactSaintOwnerIdMatchesConfirmed")},{0})
  r=self.doc["release"]
  self.assertEqual(r["status"],"RESEARCH_OWNER_COMPARISON_ONLY")
  for k in ("publicationApproved","calendarUpdated","saintsUpdated",
            "massExplorerUpdated","riteReaderUpdated","originalSourceTextCopied"):
   self.assertFalse(r[k])
if __name__=="__main__":unittest.main()
