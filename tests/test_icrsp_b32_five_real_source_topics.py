"""B32 source-review distinction: 5 genuine new webpage topic readings, zero releases."""
import json,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]/"data/source-text"
def read(name): return json.loads((ROOT/name).read_text(encoding="utf8"))
class FiveRealB29Readings(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.parent=read("icrsp-france-b31-eleven-stream-444-unique-topic-ledger.v1.json")
        cls.five=read("icrsp-france-b32-five-selected-b29-direct-source-topics.v1.json")
        cls.new=read("icrsp-france-b32-449-unique-direct-topic-ledger.v1.json")
        cls.fresh=read("icrsp-france-b29-200-new-source-metadata.v1.json")
    def test_exact_nonoverlapping_reviewed_articles(self):
        old={x["articleId"] for x in self.parent["uniqueArticles"]}
        observed={x["articleId"] for x in self.five["rows"]}
        m={x["articleId"] for x in self.fresh["records"]}
        union={x["articleId"] for x in self.new["uniqueArticles"]}
        self.assertEqual((len(old),len(observed),len(union)),(444,5,449))
        self.assertFalse(old&observed)
        self.assertTrue(observed<=m)
        self.assertEqual(union,old|observed)
        self.assertEqual(self.new["counts"]["stillNoDirectPassageReading"],783-449)
    def test_no_false_original_source_or_app_approval(self):
        self.assertFalse(self.five["sourceTextCopied"])
        self.assertFalse(self.five["publicationApproved"])
        self.assertFalse(self.new["publicationApproved"])
        for r in self.five["rows"]:
            self.assertTrue(r["firstArticleSourcePassageDirectlyExamined"])
            self.assertFalse(r["allAuthorPanelsCompletelyReviewed"])
            self.assertFalse(r["appOwnerParagraphParityComplete"])
            self.assertFalse(r["criticalEditionVerified"])
            self.assertFalse(r["rightsCleared"])
            self.assertFalse(r["publicationApproved"])
            self.assertTrue(r["sourceUrl"].endswith("article="+r["articleId"]))
if __name__=="__main__": unittest.main()
