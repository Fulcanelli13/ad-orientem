"""Protect ICRSP source-gap triage against accidental canonical promotion.

The research branch may contain *candidate* source paths, but never change
Calendar date calculation, insert protected commentary, or assign rubrical
authority merely from French HTML index labels.
"""
from collections import Counter
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
def load(name):
    return json.loads((ROOT / "data/source-text" / name).read_text(encoding="utf-8"))

class IcRSpResearchGapTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.index = load("icrsp-france-index-discovery.v1.json")
        cls.major = load("icrsp-france-39-major-content-gap-triage.v1.json")
        cls.temp = load("icrsp-france-temporal-193-gap-register.v1.json")
        cls.dedup = load("icrsp-france-temporal-189-dedup-verified.v1.json")

    def test_metadata_index_consistency(self):
        pages=self.index["pages"]
        self.assertEqual(len(pages),855)
        self.assertEqual(len(set(p["sourceUrl"] for p in pages)),855)
        source_by_id={p["articleId"]:p for p in pages}
        self.assertEqual(len(source_by_id),855)
        self.assertEqual(len(self.temp["rows"]),193)
        self.assertEqual(len(self.major["rows"]),39)
        for record in [*self.temp["rows"], *self.major["rows"]]:
            article_id=record.get("articleId",record.get("sourceArticleId"))
            self.assertIn(article_id,source_by_id)
            url=record.get("url",record.get("sourceArticleUrl"))
            self.assertEqual(url,source_by_id[article_id]["sourceUrl"])

    def test_temporal_research_not_promoted(self):
        r=self.temp["rows"]
        self.assertEqual(sum(x["commentarySectionPresent"] for x in r),189)
        self.assertEqual(sum(bool(x["relatedExistingMajorReviewId"]) for x in r),27)
        self.assertEqual(sum(not x["relatedExistingMajorReviewId"] for x in r),166)
        self.assertEqual(sum(x["editionOrRiteFlags"] and
                             "SOURCE_EXPLICIT_HISTORICAL_OR_PRE_POST_1955_LABEL" in x["editionOrRiteFlags"]
                             for x in r),25)
        self.assertEqual(sum(bool(x["commentaryHashDuplicateGroups"]) for x in r),45)
        self.assertEqual(len(set(x["articleId"] for x in r)),193)
        self.assertTrue(all(x["canonicalMassProperId"] is None and
                            x["canonicalCalendarIdentityId"] is None and
                            x["publicationStatus"].startswith("BLOCKED") for x in r))
        self.assertTrue(all(x["sourceIndexPosition"] < 193 for x in r))

    def test_major_existing_observance_is_not_new_content(self):
        rows=self.major["rows"]
        self.assertEqual(len({x["sourceArticleId"] for x in rows}),39)
        self.assertEqual(sum(x["icrspCommentary"]["sourcePanelCount"] for x in rows),164)
        self.assertEqual(sum("sourcePath" in x["existingMassScriptureContext"]
                             for x in rows),17)
        self.assertEqual(sum(bool(x["existingCalendarCustom"].get("eventId"))
                             for x in rows),2)
        self.assertTrue(all(x["existingCalendar"]["titlePresent"] and
                            x["existingCalendar"]["stableCanonicalObservanceId"] is None and
                            x["promotionState"] == "REVIEW_ONLY_NO_CONTENT_IMPORTED"
                            and x["gapVerdict"].startswith("EDITORIAL_PARITY_UNKNOWN")
                            for x in rows))
        self.assertTrue(all(x["icrspCommentary"]["rightsCleared"] is False for x in rows))
        labels=self.temp["rows"]
        temporal_ids={x["articleId"] for x in labels}
        self.assertEqual(len(temporal_ids & {x["sourceArticleId"] for x in rows}),27)

    def test_temporal_dedup_groups_do_not_merge_rubrical_editions(self):
        d=self.dedup
        self.assertEqual(d["totals"]["substantialUniqueBodyHashes"],705)
        self.assertEqual(d["totals"]["shortPanelsExcludedFromComparison"],54)
        self.assertEqual(d["totals"]["duplicateHashGroups"],28)
        all_members=[(x["articleId"],x["panelOrdinal"]) for group in d["groups"]
                     for x in group["members"]]
        self.assertEqual(len(all_members),76)
        self.assertEqual(len(set(all_members)),76)
        self.assertTrue(all(group["liturgicalEditionEquivalenceCertified"] is False
                            and group["originalHistoricalTextIdentityCertified"] is False
                            for group in d["groups"]))
        all_titles=[m["sourceIndexLabel"] for group in d["groups"] for m in group["members"]]
        self.assertTrue(all(isinstance(t,str) and t for t in all_titles))
        self.assertEqual(d["totals"]["canonicalImports"],0)

if __name__=="__main__":
    unittest.main()
