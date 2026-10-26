"""B19: direct continuator's signed preface supports series authorship, not photo/page or runtime release."""
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
def load(path):return json.loads((ROOT/path).read_text(encoding="utf8"))

class SignedContinuationPreface(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.p=load("data/source-text/icrsp-france-b19-fromage-continuation-preface-author-witness.v1.json")
        cls.b14=load("data/source-text/icrsp-france-b14-continued-work-authorship-and-original-loci.v1.json")
        cls.b18=load("data/source-text/icrsp-france-b18-fourth-sunday-original-edition-ocr-witness.v1.json")

    def test_identified_edition_with_signed_initials(self):
        d=self.p["directAuthorialWitness"]
        self.assertEqual(d["continuationVolume"],6)
        self.assertEqual((d["edition"],d["year"]),(3,1901))
        self.assertEqual(d["exactSignedInitials"],"Fr. L. F. O.S.B.")
        self.assertEqual(d["prefaceDate"],"1900-11-22")
        self.assertEqual(d["prefacePlace"],"Solesmes")
        self.assertFalse(d["printedCoverPhotoRead"])
        self.assertFalse(d["printedPrefacePagePhotoRead"])
        self.assertFalse(d["appAuthorAttributionReady"])
        self.assertEqual({r["continuerNamed"] for r in self.p["independentAuthority"]},{"Dom Lucien Fromage"})

    def test_v6_preface_never_approves_volume2_day(self):
        x=self.p["continuationSecondVolume"]
        self.assertEqual(x["target"],self.b18["sourceArticle"]["hostUrl"])
        self.assertEqual(x["existingMassSourcePath"],self.b18["sourceArticle"]["properPath"])
        self.assertFalse(x["actualPhotographedFourthSundayParagraphRead"])
        self.assertFalse(self.p["releaseGates"]["printVolumeIIExactPageVerified"])
        self.assertEqual(self.p["releaseGates"]["primaryPrintedPhotoCollations"],0)
        self.assertEqual(self.p["releaseGates"]["productionChanges"],0)
        self.assertEqual(len(self.b14["attributionCohort"]["items"]),22)
        self.assertFalse(self.p["releaseGates"]["all492WebsitePanelsPersonallyAuthorVerified"])
        self.assertFalse(self.p["publicationApproved"])

if __name__=="__main__": unittest.main()
