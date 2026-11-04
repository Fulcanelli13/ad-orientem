"""B41 regression: independent edition date witnesses and exact B40 source hashes."""
import datetime
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "data" / "source-text"

def load(name):
    return json.loads((ROOT / name).read_text(encoding="utf-8"))

class B41SalesianDateCrossWitness(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.base = load("icrsp-france-b40-29-named-salesian-annecy-toc-crosswalk.v1.json")
        cls.audit = load("icrsp-france-b41-two-salesian-dating-source-witness-reconciliation.v1.json")

    def test_exact_three_host_panels_two_original_items(self):
        cases = self.audit["cases"]
        self.assertEqual(len(cases), 2)
        self.assertEqual(self.audit["counts"]["hostArticlePanelOccurrences"], 3)
        source = {r["articleId"]:r for r in self.base["records"]}
        seen = []
        for case in cases:
            for aid in case["matchedArticleIds"]:
                original = source[aid]
                self.assertEqual(original["sourcePanelHash"], case["panelBodyHash"])
                self.assertEqual(original["annecyEditionCandidate"]["indexNumber"], case["number"])
                seen.append(aid)
        self.assertEqual(set(seen), {"a0220_ancien", "a0029_nouveau", "a0194_ancien"})
        self.assertEqual(len(seen), len(set(seen)))

    def test_gregorian_weekdays_distinguish_two_date_problems(self):
        by = {c["number"]:c for c in self.audit["cases"]}
        self.assertEqual(datetime.date(1612,4,20).strftime("%A"),"Friday")
        self.assertEqual(datetime.date(1612,4,30).strftime("%A"),"Monday")
        self.assertEqual(datetime.date(1617,3,2).strftime("%A"),"Thursday")
        self.assertEqual(datetime.date(1617,3,3).strftime("%A"),"Friday")
        self.assertEqual(by["LXXXVIII"]["siteDate"], "1612-04-20")
        self.assertEqual(by["LXXXVIII"]["editedWorkHeadingDate"], "1612-04-20")
        self.assertEqual(by["LXXXVIII"]["aggregatedOnlineIndexDate"], "1612-04-30")
        self.assertEqual(by["CXXXVII"]["siteDate"], "1617-03-03")
        self.assertEqual(by["CXXXVII"]["editedWorkHeadingDate"], "1617-03-03")
        self.assertEqual(by["CXXXVII"]["aggregatedOnlineIndexDate"], "1617-03-02")

    def test_no_unverified_print_or_rights_claims(self):
        self.assertFalse(self.audit["publicationApproved"])
        self.assertFalse(self.audit["sourceProseCopied"])
        self.assertEqual(self.audit["counts"]["printedFacsimilesVisuallyCollated"],0)
        self.assertEqual(self.audit["counts"]["rightsCleared"],0)
        self.assertEqual(self.audit["counts"]["appOwnerApprovals"],0)
        for case in self.audit["cases"]:
            self.assertTrue(case["witnessTranscriptionOnly"])
            for field in ("originalPrintedFacsimileReviewed","fullItemCompared",
                          "authorshipCertified","translationRightsCleared",
                          "productionPublicationApproved"):
                self.assertFalse(case[field])
            self.assertEqual(len(case["witnesses"]),3)
            self.assertTrue(all(w["url"].startswith("https://") for w in case["witnesses"]))

if __name__=="__main__":
    unittest.main()
