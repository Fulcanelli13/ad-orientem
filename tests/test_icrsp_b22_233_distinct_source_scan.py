"""B22 233 nonduplicative automatic body-scan intake: strict metadata and release guards."""
import json,unittest
from pathlib import Path
from collections import Counter

D=Path(__file__).resolve().parents[1]/"data/source-text"
def read(n):return json.loads((D/n).read_text(encoding="utf8"))
class B22Coverage(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.b22=read("icrsp-france-b22-233-distinct-source-body-scan-queue.v1.json")
  cls.b10=read("icrsp-france-b10-lent-pentecost51-content-screen.v1.json")
  cls.b11=read("icrsp-france-b11-40-content-evidence-topics.v1.json")
  cls.b20=read("icrsp-france-b20-sanctoral-temporal-160-content-selection.v1.json")
  cls.b21=read("icrsp-france-b21-ten-additional-commentary-claim-leads.v1.json")
  cls.wave=read("icrsp-france-next250-metadata-reading-queue.v1.json")

 def test_233_are_new_to_every_known_topic_sample(self):
  known={r["articleId"] for r in self.b10["rows"] if r.get("sourceBodyReadInBatch")}
  known|={r["articleId"] for r in self.b11["rows"]}
  known|={r["articleId"] for r in self.b20["records"] if r["sourceTextStatus"].startswith("WEB_PAGE_DIRECTLY")}
  known|={r["articleId"] for r in self.b21["reviewedRows"]}
  self.assertEqual(len(known),71)
  rows=self.b22["rows"]
  self.assertEqual(len(rows),233)
  self.assertEqual(len({r["articleId"] for r in rows}),233)
  self.assertFalse(known&{r["articleId"] for r in rows})
  self.assertEqual(len(self.wave["rows"]),250)
  self.assertEqual({r["articleId"] for r in self.wave["rows"]}-{r["articleId"] for r in rows},set(self.b22["dedup"]["overlapArticleIds"]))
  self.assertEqual(len(self.b22["dedup"]["overlapArticleIds"]),17)
  self.assertTrue(set(self.b22["dedup"]["overlapArticleIds"]).issubset(known))
  self.assertFalse(set(r["articleId"] for r in self.b20["records"])&set(r["articleId"] for r in rows))

 def test_stratified_quota_and_status(self):
  self.assertEqual(Counter(r["section"] for r in self.b22["rows"]),
    {"sanctoral":140,"temporal":43,"commons":25,"local_propers":18,"votives_requiem":4,"office":3})
  for r in self.b22["rows"]:
   self.assertEqual(len(r["priorMetadataPanelLabels"]),r["priorMetadataPanelCount"])
   self.assertTrue(r["sourceUrl"].startswith("https://icrspfrance.fr/textes-liturgiques.php?article="))
   self.assertTrue(r["articleId"] in r["sourceUrl"])
   self.assertFalse(r["sourceTextPreviouslyReviewed"])
   self.assertFalse(r["originalAuthorWorkVerified"])
  self.assertFalse(self.b22["publicationApproved"])
  self.assertIn("No new version",self.b22["processingBoundary"])

if __name__=="__main__":unittest.main()
