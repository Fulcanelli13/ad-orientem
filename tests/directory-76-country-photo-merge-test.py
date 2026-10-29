#!/usr/bin/env python3
"""Synthetic 76-country immutable Wikimedia source merge checks."""
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
p=Path(__file__).resolve().parents[1]/"tools/directory/merge-country-photo-sources.py"
spec=importlib.util.spec_from_file_location("country_source_merge",p)
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)

class CountryMergeContract(unittest.TestCase):
    def build_fixture(self,root):
        codes=set(m.EXISTING)
        codes.update(chr(65+i//26)+chr(65+i%26) for i in range(68))
        codes=set(sorted(codes)[:76])
        codes.update(m.EXISTING)
        # Ensure all 76 and exactly one overlapping retry country.
        other=sorted(codes-m.EXISTING)
        self.assertEqual(len(other),68)
        paths={}
        (root/"intake.json").write_text(json.dumps({"country_counts":{c:1 for c in codes}}))
        for label in ["eight","C1","C2","C3","C4","C5"]:
            paths[label]=root/label;paths[label].mkdir()
        for cc in sorted(codes):
            label="eight" if cc in m.EXISTING else ["C1","C2","C3","C4","C5"][other.index(cc)%5]
            record={"schema":m.SCHEMA,"publication":m.HOLD,"country":cc,
                    "status":"SUCCESS","query_limit":2000,"truncated":False,
                    "records":[{"qid":"Q1","country":cc}],"errors":[]}
            if cc=="AU":record["status"]="SOURCE_ERROR_NOT_ZERO_RESULTS";record["records"]=[]
            (paths[label]/f"country-{cc}.json").write_text(json.dumps(record))
            if cc=="AU":
                recovered={**record,"status":"SUCCESS","records":[{"qid":"Q2","country":cc}]}
                (paths["C1"]/f"country-{cc}.json").write_text(json.dumps(recovered))
        return root/"intake.json",[(label,p) for label,p in paths.items()]
    def test_completed_archives_and_au_success_overrides_failed_source(self):
        with tempfile.TemporaryDirectory() as td:
            root=Path(td)
            audit,sources=self.build_fixture(root)
            report=m.merge(audit,sources,root/"merged")
            self.assertEqual(report["counts"]["countries_archived"],76)
            self.assertEqual(report["counts"]["countries_successful"],76)
            self.assertEqual(report["country_sources"]["AU"]["source_label"],"C1")
            self.assertEqual(report["country_sources"]["AU"]["alternate_candidates"][0]["status"],
                             "SOURCE_ERROR_NOT_ZERO_RESULTS")
            self.assertEqual(len(list((root/"merged").glob("country-*.json"))),76)
            with self.assertRaisesRegex(ValueError,"overwrite"):
                m.merge(audit,sources,root/"merged")
    def test_absent_cohort_fails_closed(self):
        with tempfile.TemporaryDirectory() as td:
            root=Path(td);audit,sources=self.build_fixture(root)
            missing=next((p for label,p in sources if label=="C5"))
            (missing/next(missing.glob("country-*.json")).name).unlink()
            with self.assertRaisesRegex(ValueError,"Incomplete|Country coverage"):
                m.merge(audit,sources,root/"merged")
    def test_duplicate_outside_au_fails_closed(self):
        with tempfile.TemporaryDirectory() as td:
            root=Path(td);audit,sources=self.build_fixture(root)
            source=next(p for label,p in sources if label=="C2")
            dest=next(p for label,p in sources if label=="C3")
            f=next(source.glob("country-*.json"))
            (dest/f.name).write_bytes(f.read_bytes())
            with self.assertRaisesRegex(ValueError,"duplicate|duplicated|Incomplete"):
                m.merge(audit,sources,root/"merged")

if __name__=="__main__":unittest.main()
