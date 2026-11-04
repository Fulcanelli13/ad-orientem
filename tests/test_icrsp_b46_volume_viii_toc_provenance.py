"""Keep Annecy VIII independent OCR witness distinct from verified print/manuscript."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "data" / "source-text"
def load(name):
    return json.loads((ROOT / name).read_text(encoding="utf-8"))

class TestSalesianB46(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.current = load("icrsp-france-b46-vol8-14-independent-toc-provenance.v1.json")
        cls.b40 = load("icrsp-france-b40-29-named-salesian-annecy-toc-crosswalk.v1.json")
        cls.b45 = load("icrsp-france-b45-independent-1897-scan-ocr-salesian-date-reconciliation.v1.json")

    def test_all_volume_8_work_identifiers_exact(self):
        old = {r["articleId"]: r for r in self.b40["records"] if r["annecyEditionCandidate"]["volume"] == 8}
        rows = self.current["rows"]
        self.assertEqual(len(old), 17)
        self.assertEqual(len(rows), 14)
        self.assertEqual(len({r["editedEntry"] for r in rows}), 14)
        prior = {r["entryNumber"] for r in self.b45["witnesses"]}
        self.assertEqual(prior, {"LXXXVIII", "CXXXVII"})
        self.assertFalse(prior & {r["editedEntry"] for r in rows})
        self.assertEqual(len(prior | {r["editedEntry"] for r in rows}), 16)
        for r in rows:
            origin = old[r["hostArticleId"]]
            self.assertEqual(r["sourcePanelSHA256"], origin["sourcePanelHash"])
            self.assertEqual(r["editedEntry"], origin["annecyEditionCandidate"]["indexNumber"])
            self.assertEqual(r["editedWorkKind"], origin["annecyEditionCandidate"]["indexEntryKind"])

    def test_printed_table_pagination_and_1897_custody(self):
        pagination = dict(zip(
            ["LXVI", "LXVII", "LXVIII", "LXIX", "LXXIII", "LXXXI", "LXXXVI", "XCI", "CIV", "CV", "CXVI", "CXXIX", "CXXXI", "CXL"],
            [1, 4, 6, 9, 26, 64, 89, 112, 163, 166, 211, 284, 296, 339]
        ))
        rows = self.current["rows"]
        self.assertEqual({r["editedEntry"]: r["tocPrintPage"] for r in rows}, pagination)
        self.assertEqual({r["historicManuscriptLocationFrom1897Table"] for r in rows}, {"ANNECY", "TURIN", "LUNEVILLE"})
        self.assertTrue(all(r["printed1897TocCrosschecked"] for r in rows))

    def test_inference_ocr_errors_and_historical_overlap(self):
        risks = {r["id"]: r["risk"] for r in self.current["editorialRiskNotes"]}
        self.assertEqual(risks["LXXIII"], "EDITOR_ASSIGNED_DATE_FROM_MS_SEQUENCE")
        self.assertEqual(risks["LXXXI"], "EDITOR_ASSIGNED_DATE_FROM_MS_PAGINATION")
        self.assertEqual(risks["LXVI"], "EDITOR_SUPPLIED_MISSING_LATIN_TITLE")
        self.assertEqual(risks["LXIX"], "DISTINCT_1617_ENTRY_CXXX_HAS_SAME_OPENING")
        self.assertEqual(risks["CXXXI"], "SCAN_OCR_NUMERAL_ERROR_NOT_PRINT_CONFLICT")

    def test_no_false_authentication_or_release(self):
        for k in ("originalPrintImagesVisuallyInspected", "autographsExamined", "fullHistoricalWorksCollated", "rightsCleared", "appContentPublished"):
            self.assertEqual(self.current["counts"][k], 0)
        self.assertFalse(self.current["rightsApproved"])
        self.assertFalse(self.current["productionModified"])
        for r in self.current["rows"]:
            for f in ("printedPhotographCompared", "manuscriptPhysicallyVerified", "historicalDeliveryDateCertified", "fullWorkCollated", "modernTranslationRightsCleared", "appContentReleased"):
                self.assertFalse(r[f])

if __name__ == "__main__":
    unittest.main()
