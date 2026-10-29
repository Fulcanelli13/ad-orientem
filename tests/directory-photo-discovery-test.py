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
    def test_frozen_source_id_postal_city_hints_are_bounded_and_not_verified(self):
        cases = (
            ("FR", "ao-fssp-eglise-3-rue-f-85100-les-sables-d-olonne-france", "les sables d olonne"),
            ("DE", "ao-fssp-kirche-platz-d-30169-hannover-deutschland", "hannover"),
            ("CH", "ao-fssp-basilique-ch-1700-fribourg-suisse", "fribourg"),
            ("IT", "ao-fssp-chiesa-i-00186-roma-italia", "roma"),
            ("NL", "ao-fssp-sint-agneskerk-nl-1075-xa-amsterdam-nederland", "amsterdam"),
            ("AT", "ao-fssp-pfarrkirche-2700-wiener-neustadt-osterreich", "wiener neustadt"),
            ("PL", "ao-fssp-kosciol-59-900-jerzmanki-polska", "jerzmanki"),
            ("US", "ao-fssp-church-114-w-saratoga-st-baltimore-md-21201-usa", "baltimore"),
            ("CA", "ao-fssp-st-clement-ottawa-on-k1n-5l5-canada", "ottawa"),
            ("AU", "ao-fssp-church-parramatta-nsw-2150-australia", "parramatta"),
            ("IE", "ao-fssp-st-johns-waterford-city-irlande", "waterford"),
            ("NZ", "ao-fssp-chapel-auckland-new-zealand", "auckland"),
        )
        for cc, venue_id, expected in cases:
            with self.subTest(cc=cc, venue_id=venue_id):
                self.assertEqual(mod.frozen_id_locality_hint(venue_id, cc), expected)
        self.assertEqual(mod.frozen_id_locality_hint(
            "ao-fssp-st-joseph-unverified-location-france", "FR"), "")
        self.assertEqual(mod.frozen_id_locality_hint(
            "ao-fssp-kirche-d-30169-hannover-deutschland", "IT"), "")
        rows = mod.source_rows(mod.R49)
        by_id = {r["id"]:r for r in rows}
        exact = by_id["ao-fssp-national-shrine-of-st-alphonsus-liguori-114-w-saratoga-st-baltimore-md-21201-usa"]
        self.assertEqual(exact["locality"], "baltimore")
        self.assertEqual(exact["locality_source"],
                         "FROZEN_VENUE_ID_POSTAL_SEARCH_HINT_NOT_VERIFIED")
        self.assertEqual(len(rows), 1879)
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


    def test_visual_subject_filter(self):
        self.assertTrue(mod.unsuitable_photo_subject(
            "Engraving of the Brussels Minim convent", "Printed in 1727"))
        self.assertTrue(mod.unsuitable_photo_subject(
            "Former Minim convent during demolition", "Brussels"))
        self.assertFalse(mod.unsuitable_photo_subject(
            "Bruxelles Saints-Jean et Etienne aux Minimes.jpg", "Church exterior"))
        self.assertFalse(mod.unsuitable_photo_subject(
            "High altar of the Minimes", "Photograph of a church altar"))


    def test_exact_child_commons_categories_only(self):
        self.assertEqual(mod.commons_subcategory_role("Category:Interiors of Church of St Joseph"),"INTERIOR")
        self.assertEqual(mod.commons_subcategory_role("Category:Altars in Saint Joseph Church"),"SACRED_DETAIL")
        self.assertEqual(mod.commons_subcategory_role("Category:Exteriors of Church of St Joseph"),"EXTERIOR")
        self.assertIsNone(mod.commons_subcategory_role("Category:Churches in Brussels"))
        class Client:
            def request(self,params,endpoint=mod.API):
                self_params=params
                self_val=self_params["cmtitle"]
                assert self_val=="Category:St Joseph"
                return {"query":{"categorymembers":[
                    {"title":"Category:Interiors of Saint Joseph"},
                    {"title":"Category:Altars of Saint Joseph"},
                    {"title":"Category:Other architecture in Belgium"}]}}
        children=mod.relevant_commons_subcategories(Client(),"St Joseph")
        self.assertEqual(set(children),{"INTERIOR","SACRED_DETAIL"})
        self.assertEqual(children["INTERIOR"],"Interiors of Saint Joseph")
    def test_geo_fallback_requires_caption_site_match(self):
        venue={"name":"St Benedict Church","country":"AU","locality":"",
               "lat":-33.619096,"lng":151.0455178,"precision":"building"}
        class Client:
            def request(self,params,endpoint=mod.API):
                assert params["generator"]=="geosearch"
                assert params["ggsnamespace"]==6
                assert params["ggsradius"]==250
                return {"query":{"pages":[
                    {"title":"File:Random nearby garden.jpg","imageinfo":[{"mime":"image/jpeg",
                       "width":1600,"height":1100,"extmetadata":{
                          "LicenseShortName":{"value":"CC BY-SA 4.0"},
                          "LicenseUrl":{"value":"https://creativecommons.org/licenses/by-sa/4.0/"}}}]},
                    {"title":"File:St Benedict Church near Arcadia Australia.jpg",
                     "imageinfo":[{"mime":"image/jpeg","width":1600,"height":1100,
                        "extmetadata":{"LicenseShortName":{"value":"CC BY 4.0"},
                        "LicenseUrl":{"value":"https://creativecommons.org/licenses/by/4.0/"},
                        "ImageDescription":{"value":"Church exterior near Arcadia Australia"}}}]}
                ]}}
        results=mod.nearby_commons_discovery(Client(),venue)
        self.assertEqual(len(results["EXTERIOR"]),1)
        self.assertEqual(results["EXTERIOR"][0]["discovery_method"],"COMMONS_GEOTAG_NEAR_PIN_UNVERIFIED")
        self.assertEqual(results["EXTERIOR"][0]["publication_state"],"HOLD_IDENTITY_CATEGORY_AND_RIGHTS_REVIEW")
        self.assertEqual(results["EXTERIOR"][0]["geo_search_radius_m"],250)
        self.assertFalse(results["INTERIOR"])
        self.assertFalse(results["SACRED_DETAIL"])
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

    def test_openverse_merge_never_exceeds_limit(self):
        old=[{"source_url":f"https://example.org/{n}","discovery_method":"WIKIDATA_P18"}
             for n in range(mod.MAX_CANDIDATES_PER_CATEGORY)]
        new=[old[0], {"source_url":"https://example.org/openverse"}]
        self.assertEqual(mod.merge_photo_candidates(old,new),old)
        smaller=[old[0]]
        combined=mod.merge_photo_candidates(smaller,new)
        self.assertEqual(len(combined),2)
        self.assertEqual(combined[-1]["source_url"],"https://example.org/openverse")

    def test_openverse_name_variants_source_only(self):
        names=mod.search_name_variants("St. John the Baptist Church")
        self.assertEqual(names[0],"St. John the Baptist Church")
        self.assertIn("Saint John the Baptist Church",names)
        self.assertTrue(all("Baptist" in n for n in names))
        self.assertNotIn("church",mod.search_name_variants("Church"))

    def test_openverse_license_restrictions(self):
        def mk(license,version,link):
            return {"license":license,"license_version":version,"license_url":link}
        self.assertEqual(mod.openverse_license(mk("by-sa","4.0",
            "https://creativecommons.org/licenses/by-sa/4.0/")),"CC-BY-SA-4.0")
        self.assertEqual(mod.openverse_license(mk("cc0","1.0",
            "https://creativecommons.org/publicdomain/zero/1.0/")),"CC0")
        self.assertIsNone(mod.openverse_license(mk("by-nc","4.0",
            "https://creativecommons.org/licenses/by-nc/4.0/")))
        self.assertIsNone(mod.openverse_license(mk("by","4.0",
            "https://example.com/forged-license")))
        self.assertIsNone(mod.openverse_license(mk("by-nd","4.0",
            "https://creativecommons.org/licenses/by-nd/4.0/")))

    def test_st_mary_false_match_excluded(self):
        target={"name":"Church of St Mary","country":"US","locality":""}
        self.assertFalse(mod.strong_text_identity_evidence(
            target,"Nave of Mary Magdalene Church in 1691",""))
        self.assertFalse(mod.strong_text_identity_evidence(
            {"name":"Church of the Holy Name","country":"AU","locality":""},
            "Church of the Holy Name",""))
        self.assertTrue(mod.strong_text_identity_evidence(
            {"name":"Ss. Trinità dei Pellegrini","country":"IT","locality":""},
            "Santissima Trinità dei Pellegrini, Roma",""))
        self.assertTrue(mod.strong_text_identity_evidence(
            {"name":"Church of St Mary","country":"US","locality":"Providence"},
            "St Mary Church, Providence, United States",""))
        self.assertFalse(mod.strong_text_identity_evidence(
            {"name":"Church of St Mary","country":"US","locality":"Providence"},
            "St Mary Church, Providence",""))

    def test_openverse_metadata_only_held(self):
        target={"name":"Church of the Holy Name","country":"AU","locality":"Stepney"}
        image={"id":"f9c119f6-3d45-4d1f-82d1-2aadfc9e12f0",
               "title":"Church of the Holy Name exterior Stepney Australia",
               "foreign_landing_url":"https://photos.example.org/church-holy-name",
               "url":"https://photos.example.org/file.jpg",
               "width":1900,"height":1200,"category":"photograph",
               "license":"by-sa","license_version":"4.0",
               "license_url":"https://creativecommons.org/licenses/by-sa/4.0/",
               "creator":"A Photographer","provider":"Example","source":"example",
               "tags":[{"name":"Stepney"}]}
        item=mod.openverse_candidate(image,target)
        self.assertIsNotNone(item)
        self.assertEqual(item["category_requested"],"EXTERIOR")
        self.assertEqual(item["discovery_method"],"OPENVERSE_API_SEARCH")
        self.assertEqual(item["publication_state"],"HOLD_IDENTITY_CATEGORY_AND_RIGHTS_REVIEW")
        self.assertIsNone(mod.openverse_candidate({**image,"title":"Church of the Holy Name United States"},target))
        self.assertIsNone(mod.openverse_candidate({**image,"title":"Lithograph of Church of the Holy Name"},target))
        self.assertIsNone(mod.openverse_candidate({**image,"foreign_landing_url":"http://example.org/unlicensed"},target))
        self.assertIsNone(mod.openverse_candidate({**image,"license":"by-nc"},target))
        self.assertIsNone(mod.openverse_candidate({**image,"width":100},target))
        self.assertIsNone(mod.openverse_candidate({**image,"mature":True},target))
        class Client:
            def __init__(self): self.requests=[]
            def request(self,params,endpoint=mod.API):
                self.requests.append((endpoint,params))
                return {"results":[image, {**image,"id":"8199ca9b-5986-4c51-ac64-070b7b02f3af"}]}
        client=Client()
        result,queries=mod.openverse_discovery(client,target)
        self.assertEqual(queries,1)
        self.assertEqual(len(client.requests),1)
        self.assertEqual(client.requests[0][0],mod.OPENVERSE_API)
        self.assertEqual(client.requests[0][1]["page"],1)
        self.assertEqual(len(result["EXTERIOR"]),1)
        self.assertEqual(len(result["INTERIOR"]),0)
        self.assertEqual(len(result["SACRED_DETAIL"]),0)

    def test_openverse_fail_closed_to_empty(self):
        class Client:
            def __init__(self): self.queries=0
            def request(self,params,endpoint=mod.API):
                self.queries += 1
                return {"results":[{"title":"Unrelated mountain image"}]}
        c=Client()
        found,queries=mod.openverse_discovery(c,{"name":"Notre Dame de la Licourt","country":"BE","locality":""})
        self.assertEqual(queries,2)
        self.assertEqual(c.queries,2)
        self.assertFalse(any(found.values()))
    def test_openverse_global_run_budget(self):
        class BudgetClient:
            def __init__(self):
                self.requests=[]
            def request(self,params,endpoint=mod.API):
                self.requests.append(endpoint)
                return {"results":[]}
        inner=BudgetClient()
        bounded=mod.BoundedOpenverseClient(inner,2)
        self.assertEqual(mod.openverse_discovery(bounded,
            {"name":"Church of Saint Joseph","country":"FR","locality":""},max_queries=2)[1],2)
        self.assertEqual(bounded.used,2)
        self.assertEqual(bounded.remaining,0)
        self.assertEqual(mod.openverse_discovery(bounded,
            {"name":"Church of Saint John","country":"FR","locality":""},max_queries=0)[1],0)
        self.assertEqual(len(inner.requests),2)
        with self.assertRaises(ValueError):
            bounded.request({"q":"third"}, endpoint=mod.OPENVERSE_API)
        self.assertEqual(bounded.used,2)

    def test_representative_indices_fail_closed(self):
        class NoNetwork:
            def request(self,params,endpoint=mod.API):
                if params.get("action")=="wbsearchentities":return {"search":[]}
                return {"query":{"pages":[]}, "results":[]}
        import tempfile,json
        with tempfile.TemporaryDirectory() as td:
            out=Path(td)/"result.json"
            data=mod.run(mod.R49,out,0,2,NoNetwork(),
                         indices=[58,116,274],openverse_budget=1)
            self.assertEqual(data["processed"],3)
            self.assertEqual(data["selected_source_indices"],[58,116,274])
            self.assertEqual(data["source_countries_in_sample"],["FR","IT","MU"])
            self.assertEqual(data["pilot_metrics"]["openverse_api_queries"],1)
            self.assertEqual(data["pilot_metrics"]["venues_skipped_due_to_openverse_budget"],2)
            self.assertEqual(data["publications"],0)
            self.assertTrue(out.is_file())
            with self.assertRaises(ValueError):
                mod.run(mod.R49,out,0,2,NoNetwork(),indices=[58,58],openverse_budget=1)

    def test_wave_separation_and_legacy_compatibility(self):
        self.assertEqual(mod.WAVES["exterior"], ("EXTERIOR",))
        self.assertEqual(mod.WAVES["interior"], ("INTERIOR","SACRED_DETAIL"))
        self.assertEqual(mod.WAVES["all"], tuple(mod.CATEGORIES))
        class NoNetwork:
            def request(self,params,endpoint=mod.API):
                if params.get("action")=="wbsearchentities":
                    return {"search":[]}
                return {"query":{"pages":[]},"results":[]}
        import tempfile
        with tempfile.TemporaryDirectory() as td:
            for wave, expected in (("exterior",["EXTERIOR"]),
                                   ("interior",["INTERIOR","SACRED_DETAIL"]),
                                   ("all",list(mod.CATEGORIES))):
                output=Path(td)/(wave+".json")
                payload=mod.run(mod.R49,output,0,1,NoNetwork(),
                                openverse_budget=0,wave=wave)
                self.assertEqual(payload["wave"],wave)
                self.assertEqual(payload["categories"],expected)
                self.assertEqual(set(payload["venues"][0]["categories"]),set(expected))
                self.assertEqual(set(payload["pilot_metrics"]["candidates_by_category"]),set(expected))
                self.assertEqual(payload["image_downloads"],0)
                self.assertEqual(payload["publications"],0)
            with self.assertRaises(ValueError):
                mod.run(mod.R49,Path(td)/"bad.json",0,1,NoNetwork(),
                        openverse_budget=0,wave="invalid")
    def test_panorama_is_never_assumed_to_be_verified_360(self):
        self.assertEqual(mod.panorama_hint("Church 360 equirectangular","",4000,2000),
                         "POSSIBLE_360_EQUIRECTANGULAR_REQUIRES_REVIEW")
        self.assertEqual(mod.panorama_hint("Church 360 photograph","",900,1600),
                         "UNSPECIFIED")
        self.assertEqual(mod.panorama_hint("Church panoramic view","",4000,1600),
                         "PANORAMIC_STILL_PROJECTION_UNVERIFIED")

    def test_stageable_commons_cc_preferred_to_public_domain_scans(self):
        prior=[{"source_url":f"https://commons.wikimedia.org/wiki/File:old{n}",
                "commons_title":f"File:19{n:02d} historical facade engraving.jpg",
                "license":"PUBLIC_DOMAIN",
                "source_sha1":str(n)*40,"discovery_method":"WIKIDATA_COMMONS_CATEGORY",
                "category_evidence":"CATEGORY_UNCONFIRMED",
                "width":1500,"height":1100}
               for n in range(4)]
        cc={"source_url":"https://commons.wikimedia.org/wiki/File:verified.jpg",
            "commons_title":"File:Verified church exterior.jpg",
            "license":"CC-BY-SA-4.0","source_sha1":"a"*40,
            "discovery_method":"COUNTRY_CONSTRAINED_TEXT",
            "category_evidence":"CATEGORY_TEXT_MATCH",
            "width":1600,"height":1200}
        selected=mod.merge_photo_candidates(prior,[cc])
        self.assertEqual(len(selected),4)
        self.assertEqual(selected[0],cc)
        self.assertTrue(mod.acquisition_eligible(cc))
        self.assertFalse(mod.acquisition_eligible(prior[0]))
        self.assertEqual(len({x["source_url"] for x in selected}),4)

    def test_wave_one_per_role_fallback_when_category_is_public_domain_only(self):
        import tempfile
        from unittest.mock import patch
        venue=mod.source_rows(mod.R49)[58]
        historical={"source_url":"https://commons.wikimedia.org/wiki/File:old.jpg",
                    "license":"PUBLIC_DOMAIN","source_sha1":"b"*40,
                    "commons_title":"File:Old engraving.jpg",
                    "discovery_method":"WIKIDATA_COMMONS_CATEGORY",
                    "category_evidence":"CATEGORY_UNCONFIRMED",
                    "width":1600,"height":1200}
        cc={"source_url":"https://commons.wikimedia.org/wiki/File:new.jpg",
            "license":"CC-BY-SA-4.0","source_sha1":"a"*40,
            "commons_title":"File:Church exterior.jpg",
            "discovery_method":"COUNTRY_CONSTRAINED_TEXT",
            "category_evidence":"CATEGORY_TEXT_MATCH",
            "width":1600,"height":1200}
        calls=[]
        def search(client,v,role):
            calls.append(role)
            return [cc]
        def structured(client,v):
            return ({"state":"GEO_AND_NAME_CORROBORATED_RESEARCH_ONLY"},
                    {"EXTERIOR":[historical],"INTERIOR":[],"SACRED_DETAIL":[]})
        class NoNet:
            pass
        with tempfile.TemporaryDirectory() as td:
            with patch.object(mod,"structured_discovery",side_effect=structured), \
                 patch.object(mod,"discover",side_effect=search):
                payload=mod.run(mod.R49,Path(td)/"out.json",0,1,NoNet(),
                                indices=[58],wave="exterior",openverse_budget=0)
        self.assertEqual(calls,["EXTERIOR"])
        self.assertEqual(payload["venues"][0]["categories"]["EXTERIOR"][0]["source_sha1"],"a"*40)
        self.assertEqual(payload["pilot_metrics"]["stageable_commons_cc_candidates"],1)
        self.assertEqual(payload["pilot_metrics"]["venues_with_stageable_commons_cc"],1)
        self.assertEqual(payload["pilot_metrics"]["public_domain_rights_holds"],1)
        self.assertEqual(payload["publications"],0)

    def test_all_categories(self):
        self.assertEqual(set(mod.CATEGORIES),{"EXTERIOR","INTERIOR","SACRED_DETAIL"})
    def test_discovery_only(self):
        self.assertIn("HOLD_IDENTITY_CATEGORY_AND_RIGHTS_REVIEW",p.read_text())
        self.assertNotIn("approved-place-media.v1.json",p.read_text().split("def main():")[1])
        self.assertNotIn("upload.wikimedia.org",p.read_text())

if __name__=="__main__":
    unittest.main()
