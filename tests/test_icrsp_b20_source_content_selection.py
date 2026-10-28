"""B20 guarantees that 160 metadata selections are not miscounted as textual reviews."""
import json
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def load(p):return json.loads((ROOT/p).read_text(encoding="utf-8"))

class SanctoralSourceScreenB20(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.m=load("data/source-text/icrsp-france-b20-sanctoral-temporal-160-content-selection.v1.json")
        cls.c=load("data/source-text/icrsp-france-b20-ten-web-reviewed-claim-leads-and-owner-parity.v1.json")
        cls.b10=load("data/source-text/icrsp-france-b10-lent-pentecost51-content-screen.v1.json")

    def test_selection_is_exact_distinct_and_no_prior_b10_pages(self):
        m=self.m
        self.assertEqual(m["totals"]["selectedSourceArticles"],160)
        self.assertEqual(m["totals"]["sectionDistribution"],{"sanctoral":115,"temporal":30,"local_propers":12,"ritual":3})
        self.assertEqual(m["totals"]["directlyWebReadTopicArticlesInThisBatch"],10)
        self.assertEqual(m["totals"]["metadataOnlyUntilSourceRead"],150)
        self.assertEqual(len(m["records"]),160)
        ids={r["articleId"] for r in m["records"]}
        self.assertEqual(len(ids),160)
        self.assertFalse(ids & {r["articleId"] for r in self.b10["rows"]})
        for r in m["records"]:
            self.assertTrue(r["sourceUrl"].endswith("article="+r["articleId"]))
            self.assertFalse(r["publicPromotionApproved"])

    def test_webpage_claims_have_distinct_known_owners_and_holds(self):
        c=self.c
        lookup={r["articleId"]:r for r in self.m["records"]}
        self.assertEqual(c["count"]["directlyReadSpecificPageThemes"],10)
        self.assertEqual(c["count"]["claimLeadsRecorded"],10)
        self.assertEqual(len(c["claims"]),10)
        self.assertEqual({r["article"] for r in c["claims"]},
                         {r["articleId"] for r in self.m["records"] if r["sourceTextStatus"].startswith("WEB_PAGE_DIRECTLY_READ")})
        for claim in c["claims"]:
            self.assertEqual(claim["sourceUrl"],lookup[claim["article"]]["sourceUrl"])
            self.assertTrue(claim["hold"])
            self.assertEqual(claim["editorialState"],"EVIDENCE_LEAD_NOT_CLEARED_FOR_PUBLICATION")
        self.assertEqual(c["count"]["provenNewUserVisibleFeatureGaps"],0)
        self.assertEqual(c["count"]["approvedProductionAdditions"],0)
        self.assertFalse(c["publicationApproved"])

if __name__=="__main__":unittest.main()
