"""B18: print-derived OCR is not photographed original-edition collation."""
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
def load(path): return json.loads((ROOT/path).read_text(encoding="utf8"))

class FourthSundayScanOCRWitness(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.p=load("data/source-text/icrsp-france-b18-fourth-sunday-original-edition-ocr-witness.v1.json")
        cls.b17=load("data/source-text/icrsp-france-b17-fromage-edition-ledger-and-two-more-text-matches.v1.json")

    def test_exact_owner_and_first_source_witness(self):
        p=self.p
        self.assertEqual(p["sourceArticle"]["articleId"],self.b17["centuryVariant"]["articleId"])
        self.assertEqual(p["sourceArticle"]["properPath"],"Tempora/Pent04-0")
        w={r["id"]:r for r in p["witnesses"]}
        self.assertEqual(len(w),4)
        self.assertEqual(w["OBLATURESM_SCAN_OCR"]["centuryReading"],"XVI")
        self.assertIn("FACSIMILE_PDF",w["OBLATURESM_SCAN_OCR"]["sourceType"])
        self.assertTrue(w["OBLATURESM_SCAN_OCR"]["sourceSnippetMayContainOcrErrors"])
        self.assertFalse(w["OBLATURESM_SCAN_OCR"]["pdfOpenedForPageView"])
        self.assertEqual(w["ICRSP_LIVE_WEB"]["centuryReading"],"XVI")
        self.assertEqual(w["ABBE_PIVERT_TRANSCRIPTION"]["centuryReading"],"XVI")
        self.assertTrue(w["ABBE_PIVERT_TRANSCRIPTION"]["independenceFromICRSPNotEstablished"])
        self.assertEqual(w["CELIER_SEL_DE_LA_TERRE_STUDY"]["centuryReading"],"XV")

    def test_attribution_original_and_production_holds(self):
        p=self.p
        self.assertEqual(p["conclusion"]["variantEvidenceStatus"],"PRINT_DERIVED_OCR_SUPPORTS_XVI_BUT_PHOTOGRAPHIC_CONFIRMATION_PENDING")
        for k in ("originalPhotographicPageVerified","centuryVariantTextualResolutionApproved","originalExactPrintCitationApproved"):
            self.assertFalse(p["conclusion"][k])
        self.assertFalse(p["attribution"]["individualParagraphAuthorPrintedWitnessRead"])
        self.assertFalse(p["attribution"]["websiteLabelsRemapped"])
        self.assertFalse(p["attribution"]["publicAttributionApproved"])
        for k in ("originalPagePhotosVisuallyVerified","additionalICRSPArticlesScreened","additionalIndependentCrossHostedArticleCounts","originalCriticalEditionCollations","productionChanges"):
            self.assertEqual(p["count"][k],0)
        self.assertFalse(p["publicationApproved"])

if __name__=="__main__": unittest.main()
