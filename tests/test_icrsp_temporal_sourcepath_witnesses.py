"""Read-only ICRSP Temporal source-path mapping regression gates."""
import json
import unittest
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def load(path):
    return json.loads((ROOT/path).read_text(encoding="utf-8"))

class TemporalPathEvidence(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.audit=load("data/source-text/icrsp-france-temporal-193-sourcepath-crosswalk.v1.json")
        cls.old=load("data/source-text/icrsp-france-temporal-193-gap-register.v1.json")
        cls.exceptions=load("data/source-text/icrsp-france-temporal-93-sourcepath-exceptions.v2.json")
        cls.witnesses=set()
        for path,roots in [
          ("data/mass/scripture-temporal-sunday-source-audit.v1.json",["originalWitnesses","splitReadingWitnesses"]),
          ("data/mass/scripture-reading-witness-register.v1.json",["celebrations"]),
          ("data/mass/scripture-lent-weekday-source-audit.v1.json",["days"]),
          ("data/mass/scripture-seasonal-ember-source-matrix.v1.json",["days"]),
          ("data/mass/scripture-feast-reading-supplement.v1.json",["celebrations"]),
          ("data/mass/scripture-segmented-proper.v1.json",["readings"]),
          ("data/mass/scripture-extended-lesson.v1.json",["readings"])
        ]:
            doc=load(path)
            for root in roots:
                for record in doc[root]:
                    if "sourcePath" in record:
                        cls.witnesses.add((path,record["sourcePath"]))

    def test_actual_exact_path_witnesses_not_url_or_title_guesses(self):
        a=self.audit
        self.assertEqual(len(a["rows"]),193)
        self.assertEqual(len(set(r["articleId"] for r in a["rows"])),193)
        self.assertEqual(a["totals"]["articleRowsWithExistingPathWitness"],100)
        self.assertEqual(a["totals"]["previouslyUnlinkedTemporalWithExistingPathWitness"],78)
        self.assertEqual(a["totals"]["articleRowsWithoutAnyPathWitness"],93)
        self.assertEqual(sum(r["checkedWitnessFileCount"]>0 for r in a["rows"]),100)
        for row in a["rows"]:
            self.assertEqual(row["checkedWitnessFileCount"],len(row["existingRegistryWitnesses"]))
            for w in row["existingRegistryWitnesses"]:
                self.assertIn((w["file"],row["sourcePathCandidate"]),self.witnesses)
            self.assertIsNone(row["canonicalFeastOrProperId"])
            self.assertFalse(row["sourceTextParityChecked"])
            self.assertFalse(row["exact1962MissalEditorialCertified"])
            self.assertFalse(row["rightsCleared"])
            self.assertEqual(row["publicationStatus"],"BLOCKED")

    def test_do_not_assign_1962_mass_to_pre1955(self):
        byid={r["articleId"]:r for r in self.audit["rows"]}
        explicitly_old=[
            "a0010_nouveau","a0034_ancien","a0035_ancien","a0036_ancien",
            "a0221_ancien","a0220_ancien","a0222_ancien","a0164_nouveau",
            "a0939_ancien","a0975_ancien","a0992_ancien"
        ]
        for name in explicitly_old:
            self.assertIsNone(byid[name]["sourcePathCandidate"],name)
        resumed=[r for r in self.audit["rows"] if r["matchGrade"]=="MATCHED_RESUMED_SOURCE_PATH_CONDITIONAL"]
        self.assertEqual(len(resumed),3)
        self.assertTrue(all(r["sourcePathCandidate"].startswith("Tempora/PentEpi") for r in resumed))
        trinity=[r for r in self.audit["rows"] if r["matchGrade"]=="MATCHED_TRINITY_PROPER_BUT_PENTECOST_FIRST_SUNDAY_NOT_DISTINCT"]
        self.assertEqual(len(trinity),1)

    def test_93_unmatched_are_exception_queue_not_missing_features(self):
        e=self.exceptions
        rows=e["rows"]
        self.assertEqual(len(rows),93)
        self.assertEqual({r["articleId"] for r in rows},
                         {r["articleId"] for r in self.audit["rows"] if r["checkedWitnessFileCount"]==0})
        self.assertEqual(sum(e["categories"].values()),93)
        self.assertEqual(e["categories"]["EXISTING_OWNER_EXPLICIT_HOLD"],3)
        self.assertEqual(e["categories"]["OFFICE_O_ANTIPHON_NOT_MASS_PROPER"],7)
        self.assertEqual(e["categories"]["ADVENT_FERIA_SOURCE_PATH_SPECULATION_DO_NOT_PROMOTE"],21)
        last=next(r for r in self.audit["rows"] if r["articleId"]=="a0246_ancien")
        self.assertEqual(last["sourcePathCandidate"],"Tempora/Pent24-0")
        self.assertGreater(last["checkedWitnessFileCount"],0)
        self.assertNotIn("a0246_ancien",{r["articleId"] for r in rows})
        self.assertTrue(all(r["assertsMissingFeature"] is False and
                            r["publicationEligibility"] is False for r in rows))
        holds={r["sourcePathCandidate"]:r["alreadyKnownHold"]
               for r in rows if r["alreadyKnownHold"]}
        self.assertEqual(set(holds),{"Tempora/Quad5-5","Tempora/Quad6-5","Tempora/Quad6-6"})
        self.assertEqual(e["totals"]["probableActualAppGapsProven"],0)

if __name__=="__main__":
    unittest.main()
