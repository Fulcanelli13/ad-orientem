#!/usr/bin/env python3
"""Offline contract test: photo discovery must not publish anything."""
import importlib.util
from pathlib import Path
import unittest
p=Path(__file__).resolve().parents[1] / "tools/directory/discover-open-place-media.py"
spec=importlib.util.spec_from_file_location("discover_open_place_media",p)
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class PhotoDiscoveryTests(unittest.TestCase):
    def test_source_frozen(self):
        rows=mod.source_rows(mod.R49)
        self.assertEqual(len(rows),1879)
        self.assertEqual(len({r["id"] for r in rows}),1879)
    def test_normalize_license(self):
        def info(label,url=""):
            return {"extmetadata":{"LicenseShortName":{"value":label},"LicenseUrl":{"value":url}}}
        self.assertEqual(mod.license_name(info("CC BY-SA 4.0","https://creativecommons.org/licenses/by-sa/4.0/")),"CC-BY-SA-4.0")
        self.assertEqual(mod.license_name(info("CC BY 4.0","https://creativecommons.org/licenses/by/4.0/")),"CC-BY-4.0")
        self.assertEqual(mod.license_name(info("CC0","https://creativecommons.org/publicdomain/zero/1.0/")),"CC0")
        self.assertIsNone(mod.license_name(info("Copyright protected")))
        self.assertIsNone(mod.license_name(info("CC BY-SA 4.0","https://example.org/not-licensed")))
    def test_no_identity_inference(self):
        self.assertLess(mod.match_score("St Joseph's Church","Paris","St Joseph's Church",""),0.8)
        self.assertGreater(mod.match_score("St John Cantius Church","Chicago","St John Cantius Church, Chicago","Interior nave"),0.8)
        self.assertEqual(mod.classify_evidence("INTERIOR","Inside the nave",""),"CATEGORY_TEXT_MATCH")
        self.assertEqual(mod.classify_evidence("SACRED_DETAIL","Unrelated picture",""),"CATEGORY_UNCONFIRMED")
    def test_all_categories(self):
        self.assertEqual(set(mod.CATEGORIES),{"EXTERIOR","INTERIOR","SACRED_DETAIL"})
    def test_discovery_only(self):
        self.assertIn("HOLD_IDENTITY_CATEGORY_AND_RIGHTS_REVIEW",p.read_text())
        self.assertNotIn("approved-place-media.v1.json",p.read_text().split("def main():")[1])
        self.assertNotIn("upload.wikimedia.org",p.read_text())

if __name__=="__main__":
    unittest.main()
