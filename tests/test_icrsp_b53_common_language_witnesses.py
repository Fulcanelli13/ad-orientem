"""B53: exact source-witness availability checks, NOT app-language release approval."""
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data/source-text"

class TestICRSPB53CommonSourceWitnesses(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.audit = json.loads((DATA / "icrsp-france-b53-three-commons-language-witness-audit.v1.json").read_text(encoding="utf-8"))
        cls.printed = json.loads((DATA / "icrsp-france-b41-1962-vatican-three-commons-print-image-collation.v1.json").read_text(encoding="utf-8"))

    def test_three_distinct_printed_common_families(self):
        self.assertEqual(self.audit["schema"], "AO_ICRSP_B53_THREE_COMMONS_MULTILINGUAL_WITNESS_AUDIT_V1")
        expected = {x["id"]: x for x in self.printed["cases"]}
        actual = {x["family"]: x for x in self.audit["cases"]}
        self.assertEqual(set(actual), set(expected))
        self.assertEqual(len(actual), 3)
        for ident, row in actual.items():
            self.assertEqual(row["printed1962Pages"], expected[ident]["printedPages"])
            self.assertEqual(len(row["orations"]), 3)
            self.assertEqual({x["slot"] for x in row["orations"]},
                             {"COLLECT", "SECRET", "POSTCOMMUNION"})
            self.assertTrue(row["icrspFrenchTextWitness"].startswith("https://icrspfrance.fr/textes-liturgiques.php?article="))
            self.assertTrue(row["missaleOnlineEnglishTextWitness"].startswith("https://missale.online/proprium/en/commune/"))
            self.assertEqual(row["sourceFamilyChoiceAuthorization"], "NOT_REVIEWED")
            self.assertTrue(all(x["productionReady"] is False for x in row["orations"]))
            self.assertTrue(all(x["canonicalAdOrientemENFRSourceAndExactFormParity"] == "NOT_TESTED" for x in row["orations"]))

    def test_precise_language_gaps_not_fake_translation_availability(self):
        cases = self.audit["cases"]
        bodies = [x for case in cases for x in case["orations"]]
        english_not_translated = sum(x["englishOnMissaleOnline"] == "UNTRANSLATED_ON_EN_WEBPAGE" for x in bodies)
        english_translated_unapproved = sum(x["englishOnMissaleOnline"] == "ENGLISH_BODY_PRESENT_NOT_CERTIFIED" for x in bodies)
        french_present_unlicensed = sum(x["frenchOnICRSP"] == "FRENCH_BODY_PRESENT_NOT_LICENSED" for x in bodies)
        self.assertEqual((english_not_translated, english_translated_unapproved, french_present_unlicensed),
                         (8, 1, 9))
        self.assertEqual(self.audit["counted"]["englishMissaleOnlineUntranslatedBodies"], english_not_translated)
        self.assertEqual(self.audit["counted"]["englishMissaleOnlineBodyPresentUncertified"], english_translated_unapproved)
        self.assertEqual(self.audit["counted"]["frenchICRSPWebBodiesObserved"], french_present_unlicensed)
        self.assertEqual(self.audit["counted"]["independentOrationBodySlots"], len(bodies))
        self.assertEqual(self.audit["counted"]["approvedEnglishBodiesForProduction"], 0)
        self.assertEqual(self.audit["counted"]["approvedFrenchBodiesForProduction"], 0)
        self.assertFalse(self.audit["sourceRightsCleared"])
        self.assertFalse(self.audit["publicationApproved"])
        self.assertFalse(self.audit["actualAppCommonAbsenceProven"])
        self.assertFalse(self.audit["changesCalendarOrMass"])

    def test_second_mass_and_gospel_alternatives_remain_distinct(self):
        by_id = {x["family"]: x for x in self.audit["cases"]}
        self.assertEqual(by_id["CONFESSOR_PONTIFF_STATUIT"]["printedVariantNotProvenOnShownWebPage"],
                         "SACERDOTES_TUI_SECOND_MASS")
        self.assertEqual(by_id["MULTIPLE_VIRGIN_MARTYRS"]["printedVariantNotProvenOnShownWebPage"],
                         "MT13_44_52_PRIMARY_GOSPEL_WHILE_SITE_DISPLAYS_MT19_3_12")
        virgin_rules = self.printed["cases"][1]["printedRules"]
        nonvirgin_rules = self.printed["cases"][2]["printedRules"]
        self.assertTrue(any(x["kind"] == "EPISTLE_SUBSTITUTION" for x in virgin_rules))
        self.assertFalse(any(x["kind"] == "EPISTLE_SUBSTITUTION" for x in nonvirgin_rules))
        self.assertEqual(by_id["MULTIPLE_NONVIRGIN_FEMALE_MARTYRS"]["sourceTranscriptionQualityWarning"]["witnessVisibleIssue"],
                         "VMartyres appears in the French sentence")
        self.assertFalse(by_id["MULTIPLE_NONVIRGIN_FEMALE_MARTYRS"]["sourceTranscriptionQualityWarning"]["automaticCorrection"])

if __name__ == "__main__":
    unittest.main()
