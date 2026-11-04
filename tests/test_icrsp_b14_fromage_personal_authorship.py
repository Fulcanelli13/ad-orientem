"""Research-only author/work label provenance: website labels are not personal attributions."""
import json
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
def load(path):
    return json.loads((ROOT/path).read_text(encoding="utf-8"))

class ContinuedWorkAuthorProvenance(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.census=load("data/source-text/icrsp-france-commentary-783-verified-summary.v1.json")
        cls.correction=load("data/source-text/icrsp-france-b14-continued-work-authorship-and-original-loci.v1.json")
        cls.b10=load("data/source-text/icrsp-france-b10-lent-pentecost51-content-screen.v1.json")
        cls.preexisting=load("data/source-text/icrsp-france-b14-gueranger-aphrahat-source-claims.v1.json")

    def test_host_site_work_family_counts_unchanged(self):
        c=self.census
        self.assertEqual(c["totals"]["distinctSourcePanels"],2856)
        self.assertEqual(c["workLabels"]["GUERANGER_ANNEE_LITURGIQUE"],492)
        self.assertEqual(c["workLabels"]["SCHUSTER_LIBER_SACRAMENTORUM"],472)
        self.assertEqual(c["workLabels"]["PARSCH_GUIDE_ANNEE_LITURGIQUE"],542)
        self.assertEqual(c["authorWorkAttributionCorrection"]["websiteGuérangerLAnnéeLiturgiqueWorkLabelOccurrences"],492)
        self.assertTrue(c["authorWorkAttributionCorrection"]["websiteLabelStatisticUnchanged"])

    def test_22_flagged_post_pentecost_records_are_actual_b10_source_pages(self):
        cohort=self.correction["attributionCohort"]
        records=cohort["items"]
        prior=[r for r in self.b10["rows"] if r["cohort"]=="POST_PENTECOST_SUNDAY"]
        self.assertEqual(len(records),22)
        self.assertEqual(len(prior),22)
        self.assertEqual({r["articleId"] for r in records},{r["articleId"] for r in prior})
        owners={r["articleId"]:r for r in prior}
        for item in records:
            r=owners[item["articleId"]]
            self.assertEqual(item["sourceUrl"],r["sourceUrl"])
            self.assertEqual(item["existingMassSourcePath"],r["existingSourcePath"])
            self.assertIn("GUERANGER_ANNEE_LITURGIQUE",r["namedWebsiteWorkPanelFamilies"])
            self.assertEqual(item["workContinuationAuthorCandidate"],"Dom Lucien Fromage")
            self.assertFalse(item["publisherTitlePageForSpecificDayRead"])
            self.assertFalse(item["appAttributionApproved"])

    def test_no_original_attribution_claim_or_publication(self):
        c=self.correction
        self.assertEqual(c["totals"]["originalIndividualVolumeDayLociCriticallyVerified"],0)
        self.assertEqual(c["totals"]["canonicalAuthorAttributionsChangedInProduction"],0)
        self.assertEqual(c["totals"]["publicationApprovals"],0)
        self.assertEqual(c["totals"]["guérangerLentHostedPassageConcordances"],0)
        self.assertEqual(c["totals"]["existingLentConcordancesOwnedInParallelB14"],2)
        self.assertEqual(c["preexistingLentCollationOwner"],"data/source-text/icrsp-france-b14-gueranger-aphrahat-source-claims.v1.json")
        self.assertEqual(self.preexisting["counts"]["distinctGuerangerCrossHostedDaySections"],2)
        correction=self.census["authorWorkAttributionCorrection"]
        self.assertEqual(correction["confirmedIndividualPageSpecificPrintedAttributions"],0)
        self.assertEqual(correction["publicationCorrectionsApplied"],0)

    def test_ambrose_latin_locator_does_not_pretend_critical_edition(self):
        latin=self.correction["patristicSourceUpgrade"]["ambroseDeMysteriis"]
        self.assertEqual(latin["locus"],"III.16-18")
        self.assertTrue(latin["latinPassageLocated"])
        self.assertFalse(latin["philologicalCriticalEditionApproved"])
        self.assertFalse(latin["originalScanCollated"])
        self.assertFalse(latin["quoteRightsCleared"])
        self.assertEqual(self.correction["totals"]["hippolytusGreekCriticalLociVerified"],0)

if __name__=="__main__":
    unittest.main()
