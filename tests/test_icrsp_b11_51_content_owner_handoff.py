"""ICRSP B11: independent checks on 51 source-theme leads and editorial holds.

No source text reproduction, canonical source/mass data change or rights bypass.
"""
import json
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
def read(s):
    return json.loads((ROOT/s).read_text(encoding="utf-8"))

class ThemeHandoff(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.b10=read("data/source-text/icrsp-france-b10-lent-pentecost51-content-screen.v1.json")
        cls.b11=read("data/source-text/icrsp-france-b11-40-content-evidence-topics.v1.json")
        cls.handoff=read("data/source-text/icrsp-france-b11-51-crossdomain-content-handoff.v1.json")
        cls.duplicate=read("data/source-text/icrsp-france-temporal-189-dedup-verified.v1.json")
        cls.paths=read("data/source-text/icrsp-france-temporal-193-sourcepath-crosswalk.v1.json")

    def test_all_remaining_sources_have_grounded_theme_not_full_panel_review(self):
        b10=self.b10["rows"]
        b11=self.b11["rows"]
        self.assertEqual(len(b10),51)
        self.assertEqual(len(b11),40)
        old={r["articleId"] for r in b10 if r["sourceBodyReadInBatch"]}
        new={r["articleId"] for r in b11}
        self.assertEqual(len(old),11)
        self.assertFalse(old&new)
        self.assertEqual(old|new,{r["articleId"] for r in b10})
        self.assertTrue(all(len(r["observedTopic"])>=25 and
                            r["readingCoverage"].startswith("AT_LEAST_ONE_SUBSTANTIVE")
                            and r["rightsToRepublish"]=="NOT_CLEARED"
                            and r["publicationApproved"] is False
                            for r in b11))

    def test_51_linked_owners_and_text_are_not_prematurely_published(self):
        src={r["articleId"]:r for r in self.paths["rows"]}
        d=self.handoff
        self.assertEqual(len(d["rows"]),51)
        self.assertEqual(d["totals"]["panelsRepresented"],227)
        self.assertEqual(d["totals"]["priorityClusters"],10)
        for r in d["rows"]:
            self.assertEqual(r["url"],src[r["articleId"]]["sourceUrl"])
            self.assertEqual(r["sourcePath"],src[r["articleId"]]["sourcePathCandidate"])
            self.assertGreater(src[r["articleId"]]["checkedWitnessFileCount"],0)
            self.assertFalse(r["rightsCleared"])
            self.assertFalse(r["contentsNotAlreadyInAppCertified"])
            self.assertFalse(r["wholePageCommentaryCriticallyRead"])
            self.assertEqual(r["publicationStatus"],"CLOSED_RESEARCH_ONLY")
        self.assertEqual(d["totals"]["criticallyCollatedEntireCommentaryPanels"],0)
        self.assertEqual(d["totals"]["verifiedNewAppFeatureGaps"],0)
        self.assertEqual(d["totals"]["productionSourceChanges"],0)

    def test_shared_text_panel_dedup_only_and_anti_jewish_hold_preserved(self):
        duplicate_groups={g["groupId"]:{m["articleId"] for m in g["members"]}
                          for g in self.duplicate["groups"]}
        subset=[x for x in self.handoff["rows"] if x["sameTextBodySourcePanelGroups"]]
        self.assertEqual({x["articleId"] for x in subset},
                         {"a0222_nouveau","a0223_nouveau"})
        for row in subset:
            for g in row["sameTextBodySourcePanelGroups"]:
                self.assertIn(row["articleId"],duplicate_groups[g["groupId"]])
        hold=next(c for c in self.handoff["clusters"]
                  if c["id"]=="ICRSP_B11_ANTI_JEWISH_POLEMIC_EDITORIAL_HOLD")
        self.assertIn("a0243_ancien",hold["articleIds"])
        self.assertFalse(hold["rightsCleared"])
        self.assertFalse(hold["contentParityCertified"])
        self.assertTrue(all(c["originalAuthorPrintedEditionVerified"] is False
                            for c in self.handoff["clusters"]))

    def test_checked_file_string_absence_not_claimed_as_corpus_wide(self):
        n=self.handoff["negativeStringEvidence"]
        self.assertIn("NOT_PROOF_OF_MISSING_APP_CONTENT",n["scope"])
        self.assertGreater(len(n["notFound"]),0)
        self.assertEqual(len(self.handoff["existingFilesStringChecked"]),8)

if __name__=="__main__":
    unittest.main()
