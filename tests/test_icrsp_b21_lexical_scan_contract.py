"""ICRSP B21: no source prose is stored and 140 queued pages exclude earlier 20."""
import json
from pathlib import Path
import sys
import unittest

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"tools"/"icrsp"))
from scan_commentary_topic_signals import scan_html

class TopicSignalContract(unittest.TestCase):
    def test_scanned_body_has_signals_but_not_text(self):
        doc='''<h2>Saint Exemple</h2><h3>Commentaires</h3>
          <details class="pf-cate-cadre"><summary>Présentation</summary>
          <div class="corps"><p class="mx-comm-titre">Présentation</p>
          <p>Une station à la basilique, une procession de litanies,
          un martyre et les reliques. Saint Ambroise cite une prophétie.</p></div></details>'''
        source={"articleId":"a0000_ancien","sourceUrl":"https://icrspfrance.fr/textes-liturgiques.php?article=a0000_ancien",
                "articleTitle":"Saint Exemple","section":"sanctoral"}
        result=scan_html(doc,source)
        self.assertEqual(len(result["panels"]),1)
        p=result["panels"][0]
        self.assertIn("ROMAN_STATION_OR_CHURCH",p["topicSignals"])
        self.assertIn("CUSTOM_PROCESSION_BLESSING",p["topicSignals"])
        self.assertIn("SAINTS_CULT_AND_HISTORY",p["topicSignals"])
        self.assertIn("PATRISTIC_REFERENCE",p["topicSignals"])
        self.assertEqual(len(p["bodySha256"]),64)
        self.assertNotIn("Une station",json.dumps(result,ensure_ascii=False))
        self.assertFalse(p["claimApproved"])
        self.assertFalse(result["published"])

    def test_exact_140_without_prior_20(self):
        cohort=json.loads((ROOT/"data/source-text/icrsp-france-b20-sanctoral-temporal-160-content-selection.v1.json").read_text(encoding="utf8"))
        reviewed=json.loads((ROOT/"data/source-text/icrsp-france-b21-ten-additional-commentary-claim-leads.v1.json").read_text(encoding="utf8"))
        b20={r["articleId"] for r in cohort["records"] if r["sourceTextStatus"].startswith("WEB_PAGE_DIRECTLY_READ")}
        b21={r["articleId"] for r in reviewed["reviewedRows"]}
        self.assertEqual(len(b20),10)
        self.assertEqual(len(b21),10)
        self.assertFalse(b20 & b21)
        queue=[r for r in cohort["records"] if r["sourceTextStatus"].startswith("METADATA_TRIAGED")
               and r["articleId"] not in b21]
        self.assertEqual(len(queue),140)
        self.assertEqual(len({r["articleId"] for r in queue}),140)

if __name__=="__main__":
    unittest.main()
