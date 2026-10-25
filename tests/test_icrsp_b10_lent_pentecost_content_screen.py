"""ICRSP B10 evidence register: verify scope, actual source owners, zero publication."""
import json
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
def read(path):
    return json.loads((ROOT/path).read_text(encoding="utf-8"))

class Batch10(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.d=read("data/source-text/icrsp-france-b10-lent-pentecost51-content-screen.v1.json")
        cls.paths=read("data/source-text/icrsp-france-temporal-193-sourcepath-crosswalk.v1.json")
        cls.byid={r["articleId"]:r for r in cls.paths["rows"]}
        cls.material=read("data/learn/mass-explorer-prayer-readings.v1.json")
        cls.studies=read("data/learn/mass-explorer-approved-studies.v1.json")

    def test_counts_and_cohorts(self):
        d=self.d
        self.assertEqual(len(d["rows"]),51)
        self.assertEqual(len({r["articleId"] for r in d["rows"]}),51)
        self.assertEqual(d["totals"]["lentFeriaAndEmber"],29)
        self.assertEqual(d["totals"]["postPentecostSundays"],22)
        self.assertEqual(d["totals"]["sourcePanelOccurrences"],227)
        self.assertEqual(sum(r["commentaryPanelInstances"] for r in d["rows"]),227)
        self.assertEqual(d["totals"]["namedHistoricWorkPanelOccurrences"],153)
        self.assertEqual(sum(r["anonymousOrOtherPanels"] for r in d["rows"]),74)
        self.assertEqual(d["totals"]["directlyReviewedPageTopics"],11)
        self.assertEqual(d["totals"]["sourcePagesOnlyPanelMetadata"],40)
        self.assertEqual(len([r for r in d["rows"] if r["sourceBodyReadInBatch"]]),11)

    def test_every_staged_link_is_an_actual_owner_witness(self):
        for r in self.d["rows"]:
            self.assertIn(r["articleId"],self.byid)
            source=self.byid[r["articleId"]]
            self.assertEqual(r["sourceUrl"],source["sourceUrl"])
            self.assertEqual(r["existingSourcePath"],source["sourcePathCandidate"])
            self.assertGreater(source["checkedWitnessFileCount"],0)
            self.assertEqual(len(r["existingSourcePathWitnesses"]),
                             source["checkedWitnessFileCount"])
            self.assertTrue(all(w["sourcePath"]==source["sourcePathCandidate"]
                                and any(e["file"]==w["file"]
                                        for e in source["existingRegistryWitnesses"])
                                for w in r["existingSourcePathWitnesses"]))

    def test_existing_studies_preserved_and_rubrical_authority_closed(self):
        self.assertEqual(len(self.material["entries"]),84)
        self.assertEqual(self.studies["entries"],[])
        self.assertEqual(self.d["totals"]["contentGapsCertified"],0)
        self.assertEqual(self.d["totals"]["rightsCleared"],0)
        self.assertEqual(self.d["totals"]["publicationPromotions"],0)
        self.assertTrue(all(r["canonicalCalendarOrMassID"] is None and
                            r["userFacingContentPromoted"] is False and
                            r["missingUserFacingFeatureProven"] is False and
                            r["rightsToRepublish"]=="NOT_CLEARED"
                            for r in self.d["rows"]))
        for r in self.d["rows"]:
            if r["sourceBodyReadInBatch"]:
                self.assertTrue(r["candidate"] and
                                r["candidate"]["sourceStatus"].startswith("LIVE_PAGE_REVIEWED"))
            else:
                self.assertIsNone(r["candidate"])
                self.assertEqual(r["contentTriage"],
                                 "PANEL_METADATA_ONLY_NO_SUBSTANTIVE_CLAIM")

    def test_last_pentecost_sunday_and_original_site_work_labels_not_edition_proof(self):
        r=next(r for r in self.d["rows"] if r["articleId"]=="a0246_ancien")
        self.assertEqual(r["existingSourcePath"],"Tempora/Pent24-0")
        self.assertEqual(r["sourceBodyReadInBatch"],True)
        self.assertTrue(all(len(x["namedWebsiteWorkPanelFamilies"])==3
                            and x["originalWorkEdition"]=="PENDING" for x in self.d["rows"]))

if __name__=="__main__":
    unittest.main()
