"""B39 cross-cohort panel audit: metadata and provenance safety checks."""
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools" / "icrsp"))
from audit_b39_cross_cohort_panels import build, family

class B39PanelAudit(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.summary, cls.index = build(ROOT / "data" / "source-text")

    def test_complete_783_articles_and_2919_panel_occurrences(self):
        s, i = self.summary, self.index
        t = s["totals"]
        self.assertEqual(t["sourceArticleIds"], 783)
        self.assertEqual(t["panelOccurrences"], 2919)
        self.assertEqual(i["totals"], {"articles": 783, "panels": 2919})
        self.assertEqual(len({x["articleId"] for x in i["articles"]}), 783)
        self.assertEqual(len({x["panelRef"] for x in i["panels"]}), 2919)

    def test_63_new_panels_and_explicit_incomplete_release_gates(self):
        t = self.summary["totals"]
        self.assertEqual(t["legacyMetadataPanelCount"], 2856)
        self.assertEqual(t["newlyObservedPanelOccurrences"], 63)
        self.assertEqual(t["metadataDriftArticleCount"], 63)
        self.assertEqual(t["b29AddedSalesianPanels"], 24)
        self.assertEqual(t["b32AddedSalesianPanels"], 39)
        self.assertEqual(t["sourceEditionVerified"], 0)
        self.assertEqual(t["rightsCleared"], 0)
        self.assertEqual(t["appContentPublished"], 0)
        self.assertFalse(self.summary["publicationApproved"])
        self.assertFalse(self.index["publicationApproved"])

    def test_cross_article_duplicates_grounded_in_body_hashes(self):
        panels = self.index["panels"]
        self.assertEqual(self.summary["totals"]["distinctNormalizedBodyHashes"],
                         len({x["bodySha256"] for x in panels}))
        self.assertEqual(self.summary["totals"]["repeatedBodyHashGroups"],
                         len(self.summary["duplicateGroups"]))
        known = {tuple(d["articleIds"]): d["commonNormalizedBodyHashes"]
                 for d in self.summary["knownCrossSourceDuplicatePairChecks"]}
        self.assertEqual(known[("a0184_nouveau", "a0514_ancien")], 5)
        self.assertGreaterEqual(known[("a0048_nouveau", "a0322_ancien")], 1)
        self.assertGreaterEqual(known[("a0050_nouveau", "a0324_ancien")], 1)
        self.assertGreaterEqual(len(self.summary["saturdayMarianFiveArticleSharedBodyHashes"]),1)

    def test_original_label_is_not_authorship_certification(self):
        self.assertEqual(family("Dom Guéranger, l’Année Liturgique", ""),
                         "GUERANGER_HOST_ATTRIBUTION_FROMAGE_CONTINUATION_CHECK")
        self.assertEqual(family("Saint François de Sales, Sermons", ""),
                         "FRANCIS_DE_SALES_HOST_ATTRIBUTION_UNVERIFIED")
        self.assertEqual(family("Office du jour", ""), "OFFICE_OR_LITURGICAL_TEXT_SCOPE_CHECK")
        for row in self.index["panels"]:
            self.assertFalse(row["originalPrintedEditionVerified"])
            self.assertFalse(row["authorshipCertified"])
            self.assertFalse(row["rightsCleared"])
            self.assertFalse(row["appContentApproved"])
            self.assertEqual(len(row["bodySha256"]),64)
            self.assertNotIn("bodyText",row)
            self.assertNotIn("fullText",row)

if __name__=="__main__":
    unittest.main()
