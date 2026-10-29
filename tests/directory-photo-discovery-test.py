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
    def test_country_evidence(self):
        self.assertEqual(mod.country_signal("AU","St Benedict Church","Nebraska City, United States"),
                         "FOREIGN_COUNTRY_MENTIONED")
        self.assertEqual(mod.country_signal("AU","Church of St Benedict","Exterior of a Catholic church in Sydney, Australia"),
                         "TARGET_COUNTRY_MENTIONED")
        self.assertEqual(mod.country_signal("BE","Église Saint Jean","Photographie prise en Belgique"),
                         "TARGET_COUNTRY_MENTIONED")
        self.assertEqual(mod.country_signal("AU","Church of St Benedict","Exterior church"),
                         "COUNTRY_NOT_ESTABLISHED")
        self.assertEqual(mod.country_signal("ZZ","Church","in Rome"),
                         "COUNTRY_NOT_EVALUATED")

    def test_coordinates_and_wikidata_identity(self):
        venue={"name":"St Benedict Church","locality":"","country":"AU",
               "lat":-33.619096,"lng":151.0455178,"precision":"building"}
        def entity(qid,latitude,longitude,label):
            return {"id":qid,"labels":{"en":{"value":label}},
                    "claims":{"P625":[{"rank":"normal","mainsnak":{"snaktype":"value",
                        "datavalue":{"type":"globecoordinate","value":{"latitude":latitude,
                        "longitude":longitude,"globe":"http://www.wikidata.org/entity/Q2"}}}}],
                        "P18":[{"rank":"normal","mainsnak":{"snaktype":"value",
                        "datavalue":{"type":"string","value":"St Benedict exterior.jpg"}}}],
                        "P373":[{"rank":"normal","mainsnak":{"snaktype":"value",
                        "datavalue":{"type":"string","value":"St Benedict's Church, Arcadia"}}}]}}
        good=entity("Q12345",-33.619095,151.04552,"St Benedict Church")
        wrong=entity("Q99999",40.0,-100.0,"St Benedict Church")
        class Client:
            def __init__(self,entries):
                self.entries=entries
            def request(self,params,endpoint=mod.API):
                if params["action"]=="wbsearchentities":
                    return {"search":[{"id":x} for x in self.entries]}
                return {"entities":self.entries}
        meta, match=mod.wikidata_photo_identity(Client({"Q12345":good,"Q99999":wrong}),venue)
        self.assertEqual(meta["state"],"GEO_AND_NAME_CORROBORATED_RESEARCH_ONLY")
        self.assertEqual(meta["wikidata_id"],"Q12345")
        self.assertEqual(match["image"],"St Benedict exterior.jpg")
        self.assertEqual(match["category"],"St Benedict's Church, Arcadia")
        self.assertLess(meta["distance_m"],10)
        ambiguous=entity("Q11111",-33.619095,151.04552,"St Benedict Church")
        state, chosen=mod.wikidata_photo_identity(Client({"Q12345":good,"Q11111":ambiguous}),venue)
        self.assertEqual(state["state"],"AMBIGUOUS_WIKIDATA_IDENTITY")
        self.assertIsNone(chosen)
        state,chosen=mod.wikidata_photo_identity(Client({"Q99999":wrong}),venue)
        self.assertEqual(state["state"],"NO_GEO_NAME_CORROBORATED_IDENTITY")
        self.assertIsNone(chosen)
        state,chosen=mod.wikidata_photo_identity(Client({"Q12345":good}),{**venue,"lat":None})
        self.assertEqual(state["state"],"NO_SOURCE_COORDINATES")
        self.assertIsNone(chosen)
        self.assertGreater(mod.geo_distance_m((0,0),(0,1)),100000)

    def test_structured_categorization_and_hold(self):
        v={"name":"St Benedict Church","locality":"","country":"AU",
           "lat":-33.619096,"lng":151.0455178,"precision":"building"}
        class Client:
            def request(self,params,endpoint=mod.API):
                if params["action"]=="wbsearchentities":
                    return {"search":[{"id":"Q12345"}]}
                if params["action"]=="wbgetentities":
                    return {"entities":{"Q12345":{"labels":{"en":{"value":"St Benedict Church"}},
                    "claims":{"P625":[{"mainsnak":{"snaktype":"value","datavalue":
                    {"type":"globecoordinate","value":{"latitude":v["lat"],"longitude":v["lng"]}}}}],
                    "P18":[{"mainsnak":{"snaktype":"value","datavalue":{"type":"string","value":"St Benedict exterior.jpg"}}}]}}}}
                assert params["action"]=="query"
                return {"query":{"pages":[{"title":"File:St Benedict exterior Australia.jpg",
                    "imageinfo":[{"mime":"image/jpeg","width":1280,"height":900,"sha1":"a"*40,
                     "extmetadata":{"LicenseShortName":{"value":"CC BY-SA 4.0"},
                     "LicenseUrl":{"value":"https://creativecommons.org/licenses/by-sa/4.0/"},
                     "ImageDescription":{"value":"Exterior view of St Benedict church Australia"}}}]}]}}
        info, found=mod.structured_discovery(Client(),v)
        self.assertEqual(info["state"],"GEO_AND_NAME_CORROBORATED_RESEARCH_ONLY")
        self.assertEqual(len(found["EXTERIOR"]),1)
        self.assertFalse(found["INTERIOR"])
        self.assertFalse(found["SACRED_DETAIL"])
        self.assertEqual(found["EXTERIOR"][0]["publication_state"],"HOLD_IDENTITY_CATEGORY_AND_RIGHTS_REVIEW")
    def test_all_categories(self):
        self.assertEqual(set(mod.CATEGORIES),{"EXTERIOR","INTERIOR","SACRED_DETAIL"})
    def test_discovery_only(self):
        self.assertIn("HOLD_IDENTITY_CATEGORY_AND_RIGHTS_REVIEW",p.read_text())
        self.assertNotIn("approved-place-media.v1.json",p.read_text().split("def main():")[1])
        self.assertNotIn("upload.wikimedia.org",p.read_text())

if __name__=="__main__":
    unittest.main()
