"""ICRSP Mass Explorer source-ownership verification; publication never implied."""
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
def read(path):
    return json.loads((ROOT/path).read_text(encoding="utf-8"))

class ICRSPMassExplorerParity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.matrix=read("data/source-text/icrsp-france-mass-explorer-39-owner-parity.v1.json")
        cls.overlap=read("data/source-text/icrsp-france-mass-moment-author-overlap.v1.json")
        cls.major=read("data/source-text/icrsp-france-39-major-content-gap-triage.v1.json")
        cls.guide=read("data/presentation/guide-registry.v1.json")
        cls.prayers=read("data/learn/mass-explorer-prayer-readings.v1.json")
        cls.formation=read("data/learn/mass-formation-campion.v1.json")
        cls.deep=read("data/learn/mass-explorer-approved-studies.v1.json")
        cls.passages=read("data/learn/mass-formation-approved-passages.v1.json")
        cls.research=read("data/learn/research/mass-moment-author-evidence-review-20261016.v1.json")

    def test_reuses_published_ordinary_teaching_without_reimport(self):
        self.assertEqual(len(self.matrix["rows"]),39)
        self.assertEqual(set(r["sourceArticleId"] for r in self.matrix["rows"]),
                         set(r["sourceArticleId"] for r in self.major["rows"]))
        self.assertEqual(self.guide["entryCount"],32)
        self.assertEqual(len(self.prayers["entries"]),84)
        self.assertEqual(sum(self.prayers["counts"].values()),84)
        self.assertEqual(len(self.formation["stages"]),8)
        self.assertEqual(sum(len(s.get("claims",[])) for s in self.formation["stages"]),24)
        self.assertEqual(self.matrix["totals"]["existingOrdinaryPrayerExplanations"],84)
        self.assertEqual(self.matrix["totals"]["existingFormationStages"],8)
        self.assertTrue(all("DO_NOT_DUPLICATE" in r["editorialDecision"] for r in self.matrix["rows"]))

    def test_review_studies_and_source_text_remain_unpublished(self):
        self.assertEqual(self.deep["status"],"NO_APPROVED_STUDIES")
        self.assertEqual(self.passages["status"],"NO_APPROVED_PASSAGES")
        self.assertEqual(self.deep["entries"],[])
        self.assertEqual(self.passages["entries"],[])
        self.assertEqual(self.matrix["totals"]["existingDeepStudyReleases"],0)
        self.assertEqual(self.matrix["totals"]["existingApprovedOriginalPassages"],0)
        self.assertTrue(all(r["missingFeatureCertified"] is False and
                            r["rightToRepublishSourceText"] is False
                            for r in self.matrix["rows"]))
        self.assertEqual(self.matrix["totals"]["newICRSPContentPromoted"],0)

    def test_prior_139_research_candidates_not_source_clearances(self):
        self.assertEqual(len(self.research["records"]),139)
        self.assertEqual(sum(r["researchGrade"]=="PASSAGE VERIFIED"
                             for r in self.research["records"]),69)
        self.assertEqual(self.research["census"]["publicationApproved"],0)
        self.assertEqual(self.overlap["counts"]["priorResearchClaims"],139)
        self.assertEqual(self.overlap["counts"]["sameAuthorPriorCandidates"],13)
        gu=list(x for x in self.overlap["mainWorkFamilies"] if
                x["sourceWorkFamily"]=="GUERANGER_ANNEE_LITURGIQUE")
        self.assertEqual(len(gu),1)
        self.assertEqual(len(gu[0]["existingMassMomentResearchRecordPointers"]),13)
        self.assertTrue(all(r["publicationApproved"] is False and
                            r["workEditionCollated"] is False and
                            r["quotationReproductionCleared"] is False
                            for r in gu[0]["existingMassMomentResearchRecordPointers"]))

    def test_bilingual_selected_proper_is_not_assumed_ready(self):
        matches=sum(bool(r["existingFeatureEvidence"]["scriptureContextInSampledFeastSupplement"].get("sourcePath"))
                    for r in self.matrix["rows"])
        self.assertEqual(matches,17)
        self.assertEqual(self.matrix["totals"]["sourceInstancesRepresented"],164)
        self.assertTrue(all(
            r["existingFeatureEvidence"]["selectedDateProperProjection"]["status"]
            =="IMPLEMENTED_WITH_BILINGUAL_AND_SOURCE_PATH_GATES_NOT_PER_DATE_RUN_VERIFIED"
            for r in self.matrix["rows"]))

if __name__=="__main__":
    unittest.main()
