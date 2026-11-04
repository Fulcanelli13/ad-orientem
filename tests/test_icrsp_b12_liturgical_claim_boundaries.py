"""B12 guards against mistaking ICRSP typology commentary for a 1962 lection or release."""
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]

def load(rel):
    return json.loads((ROOT / rel).read_text(encoding="utf-8"))

class IcrspB12Boundaries(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pack=load("data/source-text/icrsp-france-b12-atomic-claim-and-lection-boundaries.v1.json")
        cls.mass=load("data/mass/scripture-lent-weekday-source-audit.v1.json")
        cls.b11=load("data/source-text/icrsp-france-b11-40-commentary-theme-review.v1.json")
        cls.groups=load("data/source-text/icrsp-france-b11-51-topic-clusters.v1.json")
        cls.studies=load("data/learn/mass-explorer-approved-studies.v1.json")

    def test_all_claims_match_actual_selected_sourcepath_and_reading_boundaries(self):
        entries={d["sourcePath"]: d for d in self.mass["days"]}
        reviewed={x["articleId"]:x for x in self.b11["rows"]}
        sample={aid for g in self.groups["groups"] for aid in g["sourceIds"]}
        claims=self.pack["readings"]
        self.assertEqual(len(claims),7)
        self.assertEqual(len({r["id"] for r in claims}),7)
        self.assertEqual(len({r["sourcePath"] for r in claims}),5)
        for c in claims:
            self.assertIn(c["articleId"],sample)
            self.assertIn(c["articleId"],reviewed)
            self.assertEqual(reviewed[c["articleId"]]["existingScriptureSourcePath"],c["sourcePath"])
            self.assertEqual(c["icrspUrl"],reviewed[c["articleId"]]["sourceUrl"])
            entry=entries[c["sourcePath"]]
            lesson=next((x["reference"] for x in entry["properOrdinaryReadings"]
                         if x["slot"]=="EPISTLE_OR_LESSON"),None)
            if lesson is None:
                lesson=next(x["reference"] for x in entry["segmentedReadings"]
                            if x["slot"]=="EPISTLE_OR_LESSON")
            gospel=next(x["reference"] for x in entry["properOrdinaryReadings"]
                        if x["slot"]=="GOSPEL")
            self.assertEqual(lesson,c["currentReadingPair"]["lesson"],c["id"])
            self.assertEqual(gospel,c["currentReadingPair"]["gospel"],c["id"])
            self.assertEqual(c["boundaryCheck"],"EXACT_EXISTING_LATIN_PROPER_READING_REFERENCE_MATCH")

    def test_proper_context_not_invented(self):
        by={x["topicCode"]:x for x in self.pack["readings"]}
        joseph=by["JOSEPH_TENANTS_PASSION_FIGURE"]
        self.assertEqual(joseph["currentReadingPair"]["lesson"],"Genesis 37:6–22")
        self.assertEqual(self.pack["excludedLiturgicalClaims"][0]["narrativeEventOutsideLesson"],"Genesis 37:28")
        self.assertEqual(self.pack["excludedLiturgicalClaims"][0]["disposition"],
                         "DO_NOT_CLAIM_SALE_EPISODE_READ_AT_THIS_MASS")
        susanna=by["SUSANNA_JOHN8_JUSTICE_MERCY"]
        self.assertIn("; 13:15–17;",susanna["currentReadingPair"]["lesson"])
        self.assertEqual(self.pack["totals"]["readingSourcePathsValidated"],5)
        self.assertNotEqual(by["ELIJAH_LAZARUS_LIFE_RESTORED"]["currentReadingPair"]["lesson"],
                            by["ELISHA_NAIN_LIFE_RESTORED"]["currentReadingPair"]["lesson"])
        self.assertEqual(by["NAAMAN_GOSPEL_PERSON_REFERENCE"]["relationshipClass"],"EXPLICIT_GOSPEL_REFERENCE")
        self.assertEqual(by["NAAMAN_BAPTISMAL_PREFIGURATION"]["relationshipClass"],"ICRSP_COMMENTARY_TYPOLOGY")

    def test_no_assumed_patristic_original_rights_absence_or_publication(self):
        for c in self.pack["readings"]:
            for k in ("originalAuthorEditionVerified","originalPatristicPassageVerified",
                      "commentaryTranslationRightsCleared","existingAppFeatureAbsentProven","publish"):
                self.assertIs(c[k],False,(c["id"],k))
            self.assertIn("NOT_FULLY_CHECKED",c["paragraphClaimParity"])
        for key in ("originalPrintedAuthorEditionsCriticallyCollated","patristicOriginalLociVerified",
                    "fullyCertifiedParagraphLevelContentParity","copyrightPermissionApprovals",
                    "newCanonicalPlaceIds","publishedFeatures"):
            self.assertEqual(self.pack["totals"][key],0,key)
        self.assertEqual(self.studies["status"],"NO_APPROVED_STUDIES")

    def test_conflicting_station_not_resolved_by_name_similarity(self):
        d=self.pack["stationDisputes"]
        self.assertEqual(len(d),1)
        item=d[0]
        self.assertEqual(item["articleId"],"a0207_ancien")
        self.assertNotEqual(item["siteIntro"],item["siteGueranger"])
        self.assertEqual(item["status"],"CONFLICT_DOCUMENTED_NO_ARBITRATION")
        self.assertIsNone(item["stablePlaceId"])
        self.assertTrue(item["publicationBlocked"])
        self.assertFalse(item["siteIdentityAndHistoricalChronologyIndependentlyVerified"])

if __name__=="__main__":
    unittest.main()
