"""B38: all 783 source-article passage evidence, one explicit indexed-source exception.

This test does not certify every panel, original author, historical rite, copyright
or existing-product owner parity. No research finding is a publication approval.
"""
import json, unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]/"data/source-text"
def load(name): return json.loads((ROOT/name).read_text(encoding="utf-8"))
def articles(rows):
    seq=[r["articleId"] for r in rows]
    assert len(seq)==len(set(seq)), "duplicate source article ID"
    return set(seq)

class B38AllArticlePassages(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.prior=load("icrsp-france-b37-721-unique-source-passages.v1.json")
        cls.outstanding=load("icrsp-france-b37-unread62-scoped-review-queue.v1.json")
        cls.normal=load("icrsp-france-b38-53-nonoffice-source-inspections.v1.json")
        cls.office=load("icrsp-france-b38-nine-office-out-of-scope-reads.v1.json")
        cls.complete=load("icrsp-france-b38-783-all-selected-source-passages-ledger.v1.json")
    def test_exact_721_plus_53_plus_9(self):
        p=articles(self.prior["uniqueArticles"])
        n=articles(self.normal["records"])
        o=articles(self.office["rows"])
        all_ids=articles(self.complete["uniqueArticles"])
        self.assertEqual((len(p),len(n),len(o),len(all_ids)),(721,53,9,783))
        self.assertFalse(p&n or p&o or n&o)
        self.assertEqual(p|n|o, all_ids)
        self.assertEqual(n|o,articles(self.outstanding["remaining"]))
    def test_live_source_coverage_and_exception(self):
        counts=self.complete["counts"]
        self.assertEqual(counts["distinctArticleIdsWithPassageEvidence"],783)
        self.assertEqual(counts["directLivePageReadArticleIds"],782)
        self.assertEqual(counts["retrievableIndexedPassageOnlyException"],1)
        self.assertEqual(self.complete["indexedException"]["articleId"],"a0686_ancien")
        self.assertEqual(counts["uniqueStillWithoutAnyPassageEvidence"],0)
        for r in self.normal["records"]:
            self.assertTrue(r["sourceArticlePageRead"])
            self.assertTrue(r["selectedSourceObservation"])
            self.assertTrue(r["editorialHold"])
            self.assertTrue(r["sourceUrl"].endswith("article="+r["articleId"]))
    def test_no_unauthorized_product_expansion_or_text_promotion(self):
        self.assertFalse(self.normal["publicationApproved"])
        self.assertFalse(self.office["publicationApproved"])
        self.assertFalse(self.complete["publicationApproved"])
        self.assertEqual(self.complete["counts"]["publicationsApproved"],0)
        self.assertEqual(self.complete["counts"]["rightsCleared"],0)
        self.assertEqual(self.complete["counts"]["canonicalOwnerContentParitiesSigned"],0)
        self.assertEqual(self.complete["counts"]["fullCriticalEditionCertifiedArticles"],0)
        self.assertEqual(self.complete["counts"]["officeArticleIdsOutsideProductScope"],9)
        for r in self.office["rows"]:
            self.assertTrue(r["noNewOfficeModule"])
            self.assertEqual(r["scopeStatus"],"OUTSIDE_AD_ORIENTEM_PLANNED_PRODUCT_MODULES")
            self.assertFalse(r["publicationApproved"])
        for r in self.normal["records"]:
            for key in ("allAuthorPanelsRead","originalPrintedWorkCollated",
                        "full1962RubricCert","sourceReproductionRightsCleared",
                        "exactCanonicalAppParagraphParity","publicationApproved"):
                self.assertFalse(r[key])
    def test_release_gates_are_distinct(self):
        gates=self.complete["releaseGates"]
        self.assertEqual(gates["bodyScreening"],"COMPLETE_783_OF_783")
        self.assertIn("ONE_INDEXED_EXCEPTION",gates["sourceArticleSelectedPassageEvidence"])
        for gate in ("allAuthorPanelsOriginalPrintedEdition",
                     "actual1962RiteOwnerAndCalendarParity"):
            self.assertEqual(gates[gate],"NOT_COMPLETE")
        for gate in ("copyrightAndLicensing","productionPublishing"):
            self.assertEqual(gates[gate],"NOT_APPROVED")

if __name__=="__main__":
    unittest.main()
