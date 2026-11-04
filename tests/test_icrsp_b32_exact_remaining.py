"""ICRSP B32 exact complement: no repeated 573-source screening."""
import json,sys,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"tools/icrsp"))
from plan_b32_final210 import plan
def load(n):return json.loads((ROOT/"data/source-text"/n).read_text(encoding="utf8"))
class Last210ScanContract(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.corpus=load("icrsp-france-783-verified-commentary-labels.v1.json")
        cls.b21=load("icrsp-france-b21-140-automated-commentary-signals.v1.json")
        cls.b23=load("icrsp-france-b23-233-automated-commentary-signals.v1.json")
        cls.b22=load("icrsp-france-b22-233-distinct-source-body-scan-queue.v1.json")
        cls.b29=load("icrsp-france-b29-200-automated-commentary-signals.v1.json")
        cls.planned=plan(cls.corpus,cls.b21,cls.b23,cls.b22,cls.b29)
    def test_id_complement_exact(self):
        m=self.planned
        old={r["articleId"] for b in (self.b21,self.b23,self.b29) for r in b["records"]}
        new={r["articleId"] for r in m["records"]}
        all_ids={r["articleId"] for r in self.corpus["records"]}
        self.assertEqual((len(old),len(new),len(all_ids)),(573,210,783))
        self.assertFalse(old&new)
        self.assertEqual(old|new,all_ids)
    def test_no_copy_or_editorial_approval(self):
        self.assertFalse(self.planned["sourceProseCopied"])
        self.assertFalse(self.planned["publicationApproved"])
        for r in self.planned["records"]:
            self.assertFalse(r["humanDirectTopicReadingComplete"])
            self.assertFalse(r["rightsCleared"])
            self.assertFalse(r["publicationApproved"])
            self.assertGreater(r["priorCommentaryPanelCount"],0)
if __name__=="__main__":unittest.main()
