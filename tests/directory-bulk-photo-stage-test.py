#!/usr/bin/env python3
"""Offline safeguards for bounded two-wave Commons bulk-image staging."""
import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT=Path(__file__).resolve().parents[1]
p=ROOT/"tools/directory/stage-bulk-place-photos.py"
spec=importlib.util.spec_from_file_location("stage_bulk_place_photos",p)
mod=importlib.util.module_from_spec(spec)
sys.modules[spec.name]=mod
spec.loader.exec_module(mod)

class BulkPhotoStageTests(unittest.TestCase):
    def fake(self, wave="exterior"):
        venue=next(iter(sorted(mod.frozen_venues())))
        name="File:A real church in example city.jpg"
        candidate={
            "category_requested":"EXTERIOR",
            "commons_title":name,
            "source_sha1":"a"*40,
            "source_url":mod.source_url(name),
            "license":"CC-BY-SA-4.0",
            "discovery_method":"COUNTRY_CONSTRAINED_TEXT",
            "panorama_hint":"UNSPECIFIED",
        }
        return {"schema":"AO_DIRECTORY_OPEN_PHOTO_CANDIDATES_V1",
                "publication":"RESEARCH_ONLY_NEVER_APP_VISIBLE",
                "wave":wave, "processed":1, "venues":[{
                    "source_id":venue,"categories":{"EXTERIOR":[candidate],
                                                    "INTERIOR":[],"SACRED_DETAIL":[]}
                }]}

    def test_roster_is_frozen_not_external_random_venue(self):
        self.assertEqual(len(mod.frozen_venues()),1879)
        self.assertEqual(len(mod.ROLES),2)
        x=self.fake()
        x["venues"][0]["source_id"]="not-in-frozen-source"
        with self.assertRaisesRegex(ValueError,"not in frozen"):
            mod.candidate_selection(x,"exterior")

    def test_wave_role_filter_and_no_publishing(self):
        x=self.fake()
        result=mod.candidate_selection(x,"exterior")
        self.assertEqual(len(result),1)
        self.assertEqual(result[0]["role"],"EXTERIOR")
        self.assertEqual(result[0]["subject_identity"],"UNVERIFIED_DISCOVERY_MATCH")
        self.assertIn(result[0]["site_verification"],
                      {"VENUE_ONLY_RESEARCH_HOLD","CONFIRMED_DIRECTORY_PLACE_LINK"})
        self.assertEqual(mod.candidate_selection(x,"interior"),[])
        x["wave"]="interior"
        interior=dict(x["venues"][0]["categories"]["EXTERIOR"][0],
                      category_requested="INTERIOR")
        x["venues"][0]["categories"]["INTERIOR"]=[interior]
        self.assertEqual(len(mod.candidate_selection(x,"interior")),1)
        with self.assertRaisesRegex(ValueError,"Wrong source wave"):
            mod.candidate_selection(x,"exterior")
        with tempfile.TemporaryDirectory() as td:
            report=mod.stage(self.fake(),"exterior",0,1,Path(td)/"out",
                             Path(td)/"report.json",validate_only=True)
            self.assertEqual(report["selected"],1)
            self.assertEqual(report["publication"],False)
            self.assertFalse((Path(td)/"out").exists())

    def test_original_sha1_and_commons_url_required(self):
        for key, replacement in (
            ("source_sha1",""),("source_sha1","f"*41),
            ("source_url","https://evil.example.org/not-commons.jpg"),
            ("license","CC-BY-NC-4.0"),
            ("commons_title","File:../../random.jpg\n")
        ):
            with self.subTest(key=key):
                x=self.fake()
                x["venues"][0]["categories"]["EXTERIOR"][0][key]=replacement
                self.assertEqual(mod.candidate_selection(x,"exterior"),[])

    def test_openverse_is_not_reinterpreted_as_commons(self):
        x=self.fake()
        x["venues"][0]["categories"]["EXTERIOR"][0]["discovery_method"]="OPENVERSE_API_SEARCH"
        self.assertEqual(mod.candidate_selection(x,"exterior"),[])

    def test_rights_are_exact_and_credit_is_required(self):
        meta={"extmetadata":{
            "LicenseShortName":{"value":"CC BY-SA 4.0"},
            "LicenseUrl":{"value":"https://creativecommons.org/licenses/by-sa/4.0/"},
            "Artist":{"value":"Photographer"}}
        }
        self.assertEqual(mod.license_from_metadata(meta)[0],"CC-BY-SA-4.0")
        for bad in [
            {"LicenseShortName":{"value":"CC BY-NC 4.0"}},
            {"LicenseUrl":{"value":"https://example.org/licenses/by-sa/4.0/"}},
            {"LicenseUrl":{"value":"https://creativecommons.org/licenses/by-sa/3.0/"}},
            {"Artist":{"value":""}}
        ]:
            with self.subTest(bad=bad):
                broken=json.loads(json.dumps(meta))
                broken["extmetadata"].update(bad)
                with self.assertRaises(ValueError):
                    mod.license_from_metadata(broken)

    def test_network_hosts_restricted_and_bounded(self):
        for url in ("https://evil.example.org/picture.jpg",
                    "http://upload.wikimedia.org/a.jpg",
                    "https://commons.wikimedia.org@evil.example.org/w/api.php"):
            with self.assertRaises(ValueError):
                mod.checked_https(url,mod.ALLOWED_HOSTS)
        self.assertEqual(mod.checked_https("https://upload.wikimedia.org/a.jpg",
                                            mod.ALLOWED_HOSTS),
                         "https://upload.wikimedia.org/a.jpg")
        x=self.fake()
        with tempfile.TemporaryDirectory() as td:
            with self.assertRaises(ValueError):
                mod.stage(x,"exterior",0,51,Path(td)/"out",Path(td)/"result.json",
                          validate_only=True)

    def test_metadata_rejects_changed_sha_and_wrong_licence(self):
        x=self.fake()
        entry=mod.candidate_selection(x,"exterior")[0]
        info={"mime":"image/jpeg","width":1600,"height":1200,
              "size":123456,"sha1":"b"*40,
              "url":"https://upload.wikimedia.org/wikipedia/commons/sample.jpg",
              "extmetadata":{
                  "Artist":{"value":"Real photographer"},
                  "LicenseShortName":{"value":"CC BY-SA 4.0"},
                  "LicenseUrl":{"value":"https://creativecommons.org/licenses/by-sa/4.0/"}}}
        def response(image):
            return json.dumps({"query":{"pages":[{"title":entry["title"],
                "imageinfo":[image]}]}}).encode()
        with patch.object(mod,"fetch",return_value=response(info)):
            with self.assertRaisesRegex(ValueError,"SHA1 changed"):
                mod.api_metadata(entry)
        info["sha1"]=entry["expected_sha1"]
        with patch.object(mod,"fetch",return_value=response(info)):
            metadata,licence,author=mod.api_metadata(entry)
            self.assertEqual(licence,"CC-BY-SA-4.0")
            self.assertEqual(author,"Real photographer")
        info["extmetadata"]["LicenseShortName"]["value"]="CC BY-NC 4.0"
        with patch.object(mod,"fetch",return_value=response(info)):
            with self.assertRaises(ValueError):
                mod.api_metadata(entry)

    def test_staging_requires_bytes_no_publication(self):
        x=self.fake()
        with tempfile.TemporaryDirectory() as td:
            output=Path(td)/"out"
            report=Path(td)/"report.json"
            entry=mod.candidate_selection(x,"exterior")[0]
            info={"mime":"image/jpeg","width":1600,"height":1200,
                  "size":10000,"sha1":entry["expected_sha1"],
                  "url":"https://upload.wikimedia.org/wikipedia/commons/fake.jpg"}
            def metadata(_):return info,"CC-BY-SA-4.0","Author"
            with self.assertRaisesRegex(ValueError,"No image files passed"):
                mod.stage(x,"exterior",0,1,output,report,
                          metadata_loader=metadata,downloader=lambda _url,_cap:b"WRONG")
            self.assertFalse(report.exists())
            self.assertFalse(output.exists())

    @unittest.skipUnless(importlib.util.find_spec("PIL"),"Pillow only in image-contract runner")
    def test_real_webp_conversion_keeps_complete_frame(self):
        import io
        from PIL import Image
        buf=io.BytesIO()
        Image.effect_noise((1600,1000),100).convert("RGB").save(buf,"JPEG")
        binary,size,_=mod.convert_original(buf.getvalue(),
            {"mime":"image/jpeg","width":1600,"height":1000},
            {"panorama_hint":"UNSPECIFIED"})
        self.assertEqual(size,(1280,800))
        self.assertEqual(binary[0:4],b"RIFF")
        self.assertEqual(binary[8:12],b"WEBP")

if __name__=="__main__":
    unittest.main()
