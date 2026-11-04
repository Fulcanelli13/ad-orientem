"""ICRSP 855/783 durable metadata archive, accurate content review and 250 wave."""
import json, unittest
from collections import Counter
from pathlib import Path

BASE=Path(__file__).resolve().parents[1]/"data/source-text"
def read(n): return json.loads((BASE/n).read_text(encoding="utf8"))

class PermanentCorpusAudit(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.idx=read("icrsp-france-855-verified-metadata.v1.json")
        cls.pan=read("icrsp-france-783-verified-commentary-labels.v1.json")
        cls.cov=read("icrsp-france-corpus-coverage-20261026.v1.json")
        cls.queue=read("icrsp-france-next250-metadata-reading-queue.v1.json")
        cls.b20=read("icrsp-france-b20-sanctoral-temporal-160-content-selection.v1.json")
        cls.b10=read("icrsp-france-b10-lent-pentecost51-content-screen.v1.json")
        cls.b11=read("icrsp-france-b11-40-content-evidence-topics.v1.json")

    def test_no_lost_records_or_source_text_import(self):
        p=self.idx["pages"]; m=self.pan["records"]
        self.assertEqual((len(p),len(m)),(855,783))
        self.assertEqual((len({x["articleId"] for x in p}),len({x["articleId"] for x in m})),(855,783))
        self.assertEqual(sum(len(x["commentaryBlocks"]) for x in m),2856)
        self.assertEqual(len([x for x in p if any(h["level"]=="h3" and h["text"]=="Commentaires" for h in x["headings"])]),783)
        self.assertTrue(self.idx["indexSignatureEquivalentAcrossSnapshots"])
        self.assertTrue(all(x["authorAttributionCertification"]=="NOT_CERTIFIED" for x in p))
        self.assertTrue(all(x["editionCertification"]=="NOT_CERTIFIED_1962" for x in m))
        self.assertTrue(all(b["rights"]=="NOT_CLEARED_LINK_AND_METADATA_ONLY"
            for x in m for b in x["commentaryBlocks"]))
        self.assertTrue(all("bodyText" not in b and "fullText" not in b and "bodyHtml" not in b
            for x in m for b in x["commentaryBlocks"]))

    def test_prior_160_nonoverlap_and_250_staged_not_read(self):
        c=self.cov["counts"]
        self.assertEqual((c["indexedArticles"],c["commentaryArticles"],c["commentaryPanels"]),(855,783,2856))
        self.assertEqual((c["alreadySelectedB20"],c["alreadyReadAtLeastOneTopicB20"],c["B20MetadataOnly"]),(160,10,150))
        self.assertEqual((c["outsideB20Commentary"],c["noCommentary"],c["newlyStagedMetadataOnly"],c["outsideB20NotStaged"]),(623,72,250,373))
        b20={x["articleId"] for x in self.b20["records"]}
        wave=self.queue["rows"]
        self.assertEqual(len(wave),250)
        self.assertEqual(len({x["articleId"] for x in wave}),250)
        self.assertFalse({x["articleId"] for x in wave}&b20)
        self.assertTrue(all(x["newSourceProseRead"] is False and x["rightsCleared"] is False
            and x["publicationApproved"] is False and x["canonicalOwnerMatchVerified"] is False for x in wave))
        self.assertEqual(Counter(x["section"] for x in wave),
            {"temporal":60,"sanctoral":140,"commons":25,"local_propers":18,"votives_requiem":4,"office":3})

    def test_distinguish_61_topic_excerpts_from_full_783_author_reviews(self):
        b10={x["articleId"] for x in self.b10["rows"] if x.get("sourceBodyReadInBatch")}
        b11={x["articleId"] for x in self.b11["rows"]}
        b20={x["articleId"] for x in self.b20["records"] if x["sourceTextStatus"].startswith("WEB_PAGE_DIRECTLY")}
        self.assertEqual((len(b10),len(b11),len(b20)),(11,40,10))
        self.assertEqual(len(b10|b11|b20),61)
        self.assertEqual(len((b10&b11)|(b11&b20)|(b10&b20)),0)
        self.assertEqual(self.cov["counts"]["fullAuthorParagraphReviews"],0)
        self.assertEqual(self.cov["counts"]["newContentApproved"],0)
        self.assertEqual(self.cov["counts"]["appChanges"],0)

if __name__=="__main__":unittest.main()
