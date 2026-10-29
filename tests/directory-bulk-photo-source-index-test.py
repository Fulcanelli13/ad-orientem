#!/usr/bin/env python3
"""Offline tests of P18 bulk index; never fetches network or modifies app."""
import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import urllib.error

root=Path(__file__).resolve().parents[1]
def load(file,name):
    spec=importlib.util.spec_from_file_location(name,root/"tools/directory"/file)
    mod=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod
idx=load("build-worldwide-photo-source-index.py","bulk_photo_source_index")
har=load("harvest-wikidata-country-photo-index.py","wikidata_country_photo")

class BulkMediaIndexTests(unittest.TestCase):
    def test_distance_and_ambiguity_hold(self):
        self.assertLess(idx.km((1,1),(1.001,1.001)),.2)
        self.assertGreater(idx.km((1,1),(2,2)),100)
        self.assertEqual(idx.point("Point(2.45 -20.12)"),(-20.12,2.45))
        self.assertIsNone(idx.point("Point(181 5)"))
        self.assertIsNone(idx.point("Point(foo bar)"))
        a={"name":"St Stanislaus Church","source_name_search_hints":[],
           "physical_description_search_hint":"Franklin Street, Nashua New Hampshire"}
        near={"name":"St Stanislaus Church","admin":"Nashua",
              "coord":"Point(-71.467 42.760)"}
        geo={"status":"SOURCE_COORDINATE_SEARCH_HINT_NOT_CERTIFIED",
             "lat":42.760,"lon":-71.467,"precision":"building"}
        match=idx.score_match(near,a,geo)
        self.assertEqual(match["match_grade"],"NEAR_SOURCE_PIN_NAME_CORROBORATED_RESEARCH_ONLY")
        self.assertIsNone(idx.score_match({**near,"coord":"Point(-71.0 42.0)"},a,geo))
        self.assertIsNone(idx.score_match({**near,"name":"Church of St Peter"},a,geo))
        self.assertEqual(idx.score_match({**near,"coord":None},a,None)["match_grade"],
                         "NAME_AND_LOCALITY_TEXT_RESEARCH_ONLY")
        self.assertIsNone(idx.score_match({**near,"admin":"Manchester","coord":None},a,None))
        # Another St Stanislaus same-city name is still research-only.
        self.assertIsNone(idx.score_match({**near,"name":"Church"},a,None))
    def test_coordinate_conflicts_do_not_auto_merge(self):
        self.assertEqual(idx.coordinates([""]*16+["-20.1","57.4","building"])[2],"building")
        self.assertIsNone(idx.coordinates([""]*16+["0","0","building"]))
        self.assertIsNone(idx.coordinates([""]*16+["-20.1","57.4","country"]))
    def test_image_url_and_rights_not_inferred(self):
        self.assertEqual(idx.url_file(
            "http://commons.wikimedia.org/wiki/Special:FilePath/St%20Peter.jpg"),
            "St Peter.jpg")
        self.assertIsNone(idx.url_file("https://some-flickr.com/image.jpg"))
        self.assertIsNone(idx.url_file("https://commons.wikimedia.org/wiki/File:painting.svg"))
        self.assertIsNone(idx.url_file("https://commons.wikimedia.org/wiki/File:../oops.jpg"))
    def test_bounded_query_uses_real_wikidata_fields(self):
        q=har.query_for_country("MU",1000)
        self.assertIn('wdt:P297 "MU"',q)
        self.assertIn('wd:Q16970 wd:Q2977',q)
        self.assertIn("wdt:P18",q)
        self.assertIn("LIMIT 1000",q)
        with self.assertRaises(ValueError):har.query_for_country("MU; DROP")
        with self.assertRaises(ValueError):har.query_for_country("FR",4000)
    def test_country_harvester_holds_network_failure(self):
        with patch.object(har.urllib.request,"urlopen",side_effect=urllib.error.URLError("offline")):
            result=har.call_country("IE",100,retries=0,delay=lambda n:None)
        self.assertEqual(result["status"],"SOURCE_ERROR_NOT_ZERO_RESULTS")
        self.assertEqual(result["records"],[])
        self.assertFalse(result["truncated"])
        self.assertEqual(result["publication"],"RESEARCH_ONLY_NEVER_APP_VISIBLE")
    def test_partial_http_response_becomes_retriable_source_error(self):
        import http.client
        with patch.object(har.urllib.request,"urlopen",
                          side_effect=http.client.IncompleteRead(b"partial")):
            result=har.call_country("CA",100,retries=1,delay=lambda n:None)
        self.assertEqual(result["status"],"SOURCE_ERROR_NOT_ZERO_RESULTS")
        self.assertEqual(result["records"],[])
        self.assertEqual(len(result["errors"]),2)
        self.assertTrue(all("IncompleteRead" in e for e in result["errors"]))
    def test_source_country_file_not_mislabeled(self):
        with tempfile.TemporaryDirectory() as td:
            folder=Path(td)
            (folder/"country-FR.json").write_text('{"schema":"AO_WIKIDATA_CHURCH_IMAGES_BY_COUNTRY_V1","country":"BE","status":"SUCCESS","records":[]}')
            with self.assertRaises(ValueError):
                idx.normalized_geo_list(folder,{"FR"})
            (folder/"country-FR.json").write_text('{"schema":"AO_WIKIDATA_CHURCH_IMAGES_BY_COUNTRY_V1","country":"FR","status":"SOURCE_ERROR_NOT_ZERO_RESULTS","records":[]}')
            rows,stats=idx.normalized_geo_list(folder,{"FR","IE"})
            self.assertEqual(rows,[])
            self.assertEqual(stats["countries_with_source_error"],1)
            self.assertEqual(stats["countries_without_export"],1)

if __name__=="__main__":unittest.main()
