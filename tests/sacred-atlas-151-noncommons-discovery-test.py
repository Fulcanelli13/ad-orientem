#!/usr/bin/env python3
"""No-network safety and source-provenance checks for 151-site multi-library sweep."""
import importlib.util
import json
import pathlib
import unittest
from unittest.mock import patch

ROOT=pathlib.Path(__file__).resolve().parents[1]
SCRIPT=ROOT/"tools/atlas/discover-sacred-atlas-151-noncommons-openverse.py"
SCOPE=ROOT/"data/geography/research/sacred-atlas-151-noncommons-coverage-scope-20261105.v1.json"
spec=importlib.util.spec_from_file_location("atlas151_discovery", SCRIPT)
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class CoverageFirstDiscovery(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.scope=json.loads(SCOPE.read_text(encoding="utf8"))

    def test_all_151_missing_pins_and_country_count(self):
        rows=self.scope["places"]
        self.assertEqual(len(rows),151)
        self.assertEqual(len({r["place_id"] for r in rows}),151)
        self.assertEqual(len({r["country"] for r in rows}),79)
        self.assertEqual(len([r for r in rows if r["prior_photo_choice"]=="NONE_SELECTED"]),51)
        self.assertIn("place:IT:scala-santa-rome",{r["place_id"] for r in rows})
        self.assertIn("place:FR:abbaye-mont-saint-michel",{r["place_id"] for r in rows})
        self.assertIn("place:MU:pere-laval-sainte-croix",{r["place_id"] for r in rows})

    def test_options_not_a_rejection_of_future_photography(self):
        rows=self.scope["places"]
        for r in rows:
            self.assertTrue(r["queries"])
            self.assertTrue(r["sources"]["openverse"].startswith("https://"))
            self.assertTrue(r["sources"]["flickr"].startswith("https://"))
            self.assertFalse(r["provider_image_approved"])
            self.assertEqual(r["source_discovery_state"],"NOT_YET_SEARCHED")
        self.assertIn("previously shown pictures",self.scope["prior_decision_handling"].lower())

    def test_only_usable_licenses_and_non_wikimedia_urls_are_preserved(self):
        row=self.scope["places"][0]
        sample={"results":[
            {"license":"by-sa","license_version":"4.0","source":"flickr",
             "foreign_landing_url":"https://www.flickr.com/photos/123/456/",
             "thumbnail":"https://live.staticflickr.com/some.jpg","title":"Our shrine",
             "creator":"Example","width":1800,"height":1200},
            {"license":"by-sa","source":"wikimedia",
             "foreign_landing_url":"https://commons.wikimedia.org/wiki/File:Something.jpg","title":"Do not import"},
            {"license":"by-nc","source":"flickr",
             "foreign_landing_url":"https://www.flickr.com/photos/111/222/","title":"Noncommercial"},
            {"license":"by","source":"flickr",
             "foreign_landing_url":"https://www.flickr.com/photos/333/444/","title":"Another CC"},
        ]}
        selected=mod.select_results(sample,row,"Sample query")
        self.assertEqual(len(selected),2)
        self.assertTrue(all(r["source_page"].startswith("https://www.flickr.com/") for r in selected))
        self.assertTrue(all(not r["publication_authorized"] and not r["exact_site_verified"] for r in selected))
        self.assertEqual(selected[0]["license_claim"],"BY-SA")

    def test_anonymous_api_query_excludes_wikimedia_and_no_mirror(self):
        class Response:
            status=200
            def __enter__(self):return self
            def __exit__(self,*args):return False
            def read(self,n):return b'{"results":[]}'
        with patch.object(mod.urllib.request,"urlopen",return_value=Response()) as called:
            got=mod.request("Scala Santa Rome")
            self.assertEqual(got["results"],[])
            request=called.call_args.args[0]
            self.assertIn("excluded_source=wikimedia",request.full_url)
            self.assertIn("commercial%2Cmodification",request.full_url)
            self.assertIn("by%2Cby-sa%2Ccc0%2Cpdm",request.full_url)
            called.assert_called_once()

if __name__=="__main__":
    unittest.main()
