"""B14 checks source editions, typology types and strict 1962 lection boundaries."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
def get(path):
    return json.loads((ROOT/path).read_text(encoding="utf-8"))

class IcrspB14SourceClaims(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pack=get("data/source-text/icrsp-france-b14-gueranger-aphrahat-source-claims.v1.json")
        cls.b12=get("data/source-text/icrsp-france-b12-atomic-claim-and-lection-boundaries.v1.json")
        cls.mass=get("data/mass/scripture-lent-weekday-source-audit.v1.json")

    def test_four_real_source_paths_and_six_b12_claims(self):
        rows=self.pack["rows"]
        self.assertEqual(len(rows),4)
        self.assertEqual(len({r["article"] for r in rows}),4)
        self.assertEqual(len({r["path"] for r in rows}),4)
        prev={r["id"]:r for r in self.b12["readings"]}
        days={r["sourcePath"] for r in self.mass["days"]}
        links=[]
        for r in rows:
            self.assertIn(r["path"],days)
            self.assertEqual(r["icrspUrl"],"https://icrspfrance.fr/textes-liturgiques.php?article="+r["article"])
            self.assertTrue(r["b12"])
            for i in r["b12"]:
                self.assertEqual(prev[i]["sourcePath"],r["path"])
                self.assertEqual(prev[i]["articleId"],r["article"])
                links.append(i)
            self.assertIs(r["approvedPublication"],False)
            self.assertIs(r["original1903PrintedParagraphCollated"],False)
            self.assertIs(r["rightsCleared"],False)
            self.assertIs(r["fullyReconciledToExistingCompendium"],False)
        self.assertEqual(len(links),6)
        self.assertEqual(len(set(links)),6)
        self.assertEqual(self.pack["counts"]["affectedB12AtomicClaims"],6)

    def test_1903_bibliography_not_equated_with_later_pdf_scan(self):
        w=self.pack["witnessedGuerangerEdition"]
        self.assertIn("1903",w["edition"])
        self.assertFalse(w["printedOriginalImagesInspected"])
        self.assertTrue(w["sharedTranscriptionDonorCannotBeExcluded"])
        self.assertTrue(self.pack["scannedEditionCaution"]["not1903"])
        self.assertEqual(self.pack["scannedEditionCaution"]["listedYear"],1911)
        self.assertFalse(self.pack["scannedEditionCaution"]["originalPdfPageInspectSucceeded"])

    def test_susanna_historical_fabricius_citation_not_confused_with_schmidt(self):
        note=self.pack["historicalHippolytusFootnote"]
        self.assertEqual(note["literalBibliographicLocator"],"In Danielem, pag. 27. Edit. Fabricii.")
        self.assertFalse(note["page27FacsimileInspected"])
        self.assertTrue(note["distinctFromSchmidt2010PrintedPage25"])
        self.assertIn("1716",note["editionIdentity"])

    def test_distinguish_elijah_elisha_new_testament_analogies(self):
        p={x["id"]:x for x in self.pack["patristicLoci"]}
        self.assertEqual(set(p),{"APHRAHAT_DEM8_11","APHRAHAT_DEM21_14","APHRAHAT_DEM21_15"})
        for x in p.values():
            self.assertIn("Albert Edward Johnston",x["translation"])
            self.assertIn("John Gwynn",x["translation"])
            self.assertFalse(x["originalSyriacTextCollated"])
            self.assertTrue(x["englishSectionObserved"])
            self.assertFalse(x["sourceCopyrightPermissionReviewed"])
        self.assertTrue(p["APHRAHAT_DEM21_14"]["directJohn11Quotation"] is False)
        self.assertTrue(p["APHRAHAT_DEM21_15"]["shunammiteNainPairAttestedInThisLocus"] is False)
        self.assertIn("2 Kings 13:20",p["APHRAHAT_DEM21_15"]["meaning"])
        self.assertFalse(p["APHRAHAT_DEM8_11"]["selectedLessonOnlyPairVerified"])

    def test_nonpublication(self):
        self.assertIs(self.pack["productionChanged"],False)
        self.assertFalse(self.pack["handoff"]["remoteBranchUpdated"])
        self.assertEqual(self.pack["handoff"]["ownerPr"],1553)
        self.assertEqual(self.pack["counts"]["actualOriginalPrintOrSyriacPassagesCollated"],0)
        self.assertEqual(self.pack["counts"]["publicationApprovals"],0)

if __name__ == "__main__":
    unittest.main()
