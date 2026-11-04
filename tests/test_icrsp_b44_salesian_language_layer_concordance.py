"""B44 retains Latin/French editorial layers and source/work separation."""
import json,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]/"data"/"source-text"
def read(f): return json.loads((ROOT/f).read_text(encoding="utf-8"))
class B44LanguageLayers(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.a=read("icrsp-france-b44-salesian-latin-french-source-layer-concordance.v1.json")
  cls.b=read("icrsp-france-b43-salesian-contextual-date-witnesses.v1.json")
 def test_two_cases_no_new_works(self):
  self.assertEqual({x["caseId"] for x in self.a["auditedWorkItems"]},{x["caseId"] for x in self.b["findings"]})
  self.assertEqual(self.a["counts"]["distinctOriginalWorksBoundaryChecked"],2)
  self.assertEqual(self.a["counts"]["hostPanelOccurrences"],3)
 def test_each_has_distinct_edited_language_layers(self):
  for x in self.a["auditedWorkItems"]:
   self.assertEqual(x["editionOriginalLanguage"],"LATIN_WITH_PERIOD_FRENCH_EDITORIAL_TRANSLATION")
   self.assertLess(x["editionLatinTranscription"]["startLine"],x["editionLatinTranscription"]["endLine"])
   self.assertLess(x["editionFrenchTranscription"]["startLine"],x["editionFrenchTranscription"]["endLine"])
   self.assertLess(x["hostFrench"]["selectedSectionEndLine"],x["hostFrench"]["subsequentSeparateWorkStartsAtLine"])
   self.assertEqual(len(x["comparisonAnchors"]),3)
 def test_1617_explicit_host_edition_difference(self):
  x=next(x for x in self.a["auditedWorkItems"] if x["annecyItem"]=="VIII.CXXXVII")
  self.assertEqual(x["hostFrench"]["subsequentSeparateWorkStartsAtLine"],205)
  self.assertEqual(len(x["editorialVariationExamples"]),1)
  self.assertEqual(x["editorialVariationExamples"][0]["latinEditionLine"],4234)
 def test_no_fabricated_print_rights_or_full_transcript(self):
  self.assertEqual(self.a["counts"]["printedPageImageVisualVerifications"],0)
  self.assertEqual(self.a["counts"]["fullWordByWordCollations"],0)
  self.assertEqual(self.a["counts"]["rightsApproved"],0)
  self.assertEqual(self.a["counts"]["productionApprovals"],0)
  for x in self.a["auditedWorkItems"]:
   for k in ("printFacsimileImagesInspected","latinAutographManuscriptInspected","fullFrenchVerbatimDiffCompleted","originalLatinToFrenchTranslationExhaustivelyVerified","sourceRightsCleared","appOwnerParityApproved","published"):
    self.assertFalse(x[k])
  self.assertTrue(self.a["restrictions"]["doNotDescribeFrenchEditorialTranslationAsAutograph"])
if __name__=="__main__":unittest.main()
