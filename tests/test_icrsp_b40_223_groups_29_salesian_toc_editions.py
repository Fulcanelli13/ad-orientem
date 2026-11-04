"""B40: 223 SHA groups, 29 Salesian TOC links, and four printed-edition gates."""
import json
import unittest
from collections import Counter
from pathlib import Path

DATA = Path(__file__).resolve().parents[1] / "data" / "source-text"
def read(name):
    return json.loads((DATA/name).read_text(encoding="utf-8"))

class B40EditionTriage(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.hashes=read("icrsp-france-b40-all223-duplicate-groups-edition-triage.v1.json")
        cls.sales=read("icrsp-france-b40-29-named-salesian-annecy-toc-crosswalk.v1.json")
        cls.families=read("icrsp-france-b40-four-author-edition-and-language-gates.v1.json")
        cls.concordances=read("icrsp-france-b40-three-salesian-opening-text-concordances.v1.json")
        cls.old=read("icrsp-france-b39-2919-panel-duplicates-and-edition-intake.v1.json")

    def test_all_duplicate_sha_groups_exactly_once(self):
        groups=self.hashes["duplicateGroups"]
        self.assertEqual((len(groups),len({g["bodySha256"] for g in groups})),(223,223))
        self.assertEqual({g["bodySha256"] for g in groups},
                         {g["bodySha256"] for g in self.old["duplicateGroups"]})
        self.assertEqual(sum(g["occurrences"]-1 for g in groups),303)
        self.assertEqual(sum(g["occurrences"] for g in groups),526)
        self.assertEqual(sum(self.hashes["counts"]["sourceReviewClasses"].values()),223)
        self.assertEqual(self.hashes["counts"]["substantialNonOfficeGroupsForPrintedEditionReview"],175)
        for g in groups:
            self.assertEqual(len(g["articleIds"]),g["distinctArticleIds"])
            self.assertEqual(len(g["sourceRefs"]),g["occurrences"])
            self.assertEqual(len(g["bodySha256"]),64)
            for key in ("isIndependentHistoricalWitness","printedEditionCollated",
                        "rightToReproduceCleared","approvedCalendarMassOrSaintsContent"):
                self.assertFalse(g[key])

    def test_all_named_salesian_panels_map_only_to_candidate_toc(self):
        s=self.sales
        rows=s["records"]
        self.assertEqual((len(rows),len({r["articleId"] for r in rows})),(29,29))
        self.assertEqual(len({r["sourcePanelHash"] for r in rows}),27)
        self.assertEqual(s["counts"]["newlyObservedSalesianPanels"],63)
        self.assertEqual(s["counts"]["unnamedGenericPanelsAwaitingTOCResolution"],34)
        self.assertEqual(s["counts"]["duplicateNamedSourceHashGroups"],2)
        self.assertEqual(s["counts"]["explicitDateConflicts"],3)
        self.assertEqual(s["counts"]["uniqueDateConflictIssues"],2)
        self.assertEqual(s["counts"]["hostTrailingPlanSuffixDisagreesWithEditedType"],11)
        self.assertEqual(s["counts"]["hostedDateUnverifiedByTOC"],4)
        for r in rows:
            self.assertIn(r["annecyEditionCandidate"]["volume"],(7,8,9))
            self.assertEqual(r["reviewStatus"],
                             "BIBLIOGRAPHIC_INDEX_ENTRY_CORROBORATED__CONTENT_NOT_COLLATED")
            for flag in ("originalPrintedPageAndTextCompared","authorOriginalOrAutographCertified",
                         "modernHostProseCopyrightCleared","publicationApproved"):
                self.assertFalse(r[flag])
        self.assertEqual({r["articleId"] for r in rows if any(
                         x.startswith("DATE_CONFLICT") for x in r["reviewHolds"])},
                         {"a0220_ancien","a0029_nouveau","a0194_ancien"})

    def test_author_family_language_and_rights_gates(self):
        works=self.families["works"]
        self.assertEqual(len(works),4)
        self.assertEqual(sum(x["hostPanelOccurrencesForBibliographicRouting"] for x in works),1572)
        for work in works:
            self.assertTrue(work["sources"])
            for witness in work["sources"]:
                self.assertTrue(witness["url"].startswith("https://"))
            self.assertFalse(work["originalWorkAttributionCertified"])
            self.assertFalse(work["hostRightsCleared"])
            self.assertEqual(work["printedPageCrosschecksDone"],0)
        for doc in (self.sales,self.hashes,self.families):
            self.assertFalse(doc["publicationApproved"])
        self.assertTrue(self.families["releaseRestrictions"]["noProductionMassCalendarModification"])
        self.assertTrue(self.families["releaseRestrictions"]["noOfficeModule"])

    def test_three_opening_concordances_are_not_full_print_or_rights_certification(self):
        c=self.concordances
        self.assertEqual(c["counts"]["distinctICRSPArticlePagesCompared"],3)
        self.assertEqual(c["counts"]["totalIndividualHistoricalPiecesSignalled"],7)
        self.assertEqual({r["articleId"] for r in c["cases"]},
                         {"a0389_ancien","a0130_ancien","a0562_ancien"})
        for r in c["cases"]:
            self.assertTrue(r["openingMatch"].endswith("EDITORIAL_PAGE_MARKERS") or
                            r["openingMatch"].endswith("EDITORIAL_MARKERS"))
            self.assertFalse(r["entireSourceItemChecked"])
            self.assertFalse(r["fullTextMachineDiffPerformed"])
            self.assertFalse(r["originalPrintedFacsimileVisualCertification"])
            self.assertFalse(r["sourceTranslationOrModernEditorialRightsCleared"])
            self.assertFalse(r["appContentOwnerParityDone"])
            self.assertFalse(r["appPublicationApproved"])
        self.assertFalse(c["publicationApproved"])
        self.assertFalse(c["rightsCleared"])
if __name__=="__main__":
    unittest.main()
