"""B22: actual human-read panel relevance, original editorial snippets and source quarantine."""
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
def load(path):
    return json.loads((ROOT/path).read_text(encoding="utf-8"))

class B22OwnerReadyResearch(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.b22=load("data/source-text/icrsp-france-b22-relevance-exceptions-and-existing-owner-editorial-drafts.v1.json")
        cls.b21=load("data/source-text/icrsp-france-b21-140-automated-commentary-signals.v1.json")

    def test_source_links_and_review_counts(self):
        rows=self.b22["humanReviewRecords"]
        prior={r["articleId"]:r for r in self.b21["records"]}
        self.assertEqual(len(rows),11)
        self.assertEqual(len({r["articleId"] for r in rows}),11)
        self.assertEqual(self.b22["count"]["bulkArticleTextScreensVerified"],140)
        self.assertEqual(self.b22["count"]["bulkPanels"],535)
        self.assertEqual(self.b22["count"]["cumulativeHumanReviewedWithin160"],31)
        self.assertEqual(self.b22["count"]["stillOnlyAutomatedTextScreened"],129)
        for row in rows:
            self.assertEqual(row["sourceUrl"],prior[row["articleId"]]["sourceUrl"])
            self.assertEqual(row["sourceTitle"],prior[row["articleId"]]["sourceTitle"])
            self.assertTrue(row["webPageCommentsInspected"])
            self.assertFalse(row["published"])
            self.assertTrue(row["needsVerification"])

    def test_new_editorial_copy_does_not_claim_fathers_or_publication(self):
        row=self.b22["humanReviewRecords"]
        written=[r["editorialDraft"] for r in row if r["editorialDraft"]]
        self.assertEqual(len(written),9)
        for draft in written:
            self.assertEqual(set(draft),{"en","fr","status"})
            self.assertGreater(len(draft["en"]),60)
            self.assertGreater(len(draft["fr"]),60)
            self.assertEqual(draft["status"],"ORIGINAL_EDITORIAL_TEXT_NOT_PUBLISHED")
        self.assertEqual(self.b22["count"]["publications"],0)
        self.assertFalse(self.b22["publicationApproved"])

    def test_misattributed_st_paul_panels_quarantined(self):
        hold=self.b22["misattributionHold"]
        self.assertEqual(hold["sourceArticleId"],"a0890_ancien")
        self.assertEqual(hold["comparisonArticleId"],"a0318_ancien")
        self.assertEqual(hold["guérangerPanelOrdinal"],2)
        self.assertEqual(hold["quarantineFromStPaulBiographyPanelOrdinals"],[2,3,4,5])
        self.assertTrue(hold["presentationPanelNeedsIndependentVerification"])
        self.assertEqual(hold["safeToExtractAsBiographyPanelOrdinals"],[])

    def test_exact_duplicate_hash_groups_are_metadata_only(self):
        bysha={}
        for rec in self.b21["records"]:
            for panel in rec["panels"]:
                bysha.setdefault(panel["bodySha256"],[]).append((rec["articleId"],panel["blockOrdinal"]))
        pairs={k:v for k,v in bysha.items() if len(v)>1}
        self.assertEqual(len(pairs),self.b22["count"]["bulkDuplicateShaGroups"])
        self.assertEqual(set(pairs),{r["sourceBodySha256"] for r in self.b22["sameBodyHashGroups"]})
        for row in self.b22["sameBodyHashGroups"]:
            self.assertEqual(
                sorted((i["id"],i["panel"]) for i in row["articlePanelOccurrences"]),
                sorted(pairs[row["sourceBodySha256"]]))
        self.assertFalse(self.b22["publicationApproved"])

if __name__=="__main__": unittest.main()
