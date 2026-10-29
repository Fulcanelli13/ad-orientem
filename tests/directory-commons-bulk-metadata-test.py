#!/usr/bin/env python3
"""No-network contracts for bulk Commons metadata preflight."""
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

script=Path(__file__).resolve().parents[1]/"tools/directory/verify-worldwide-commons-source-metadata.py"
spec=importlib.util.spec_from_file_location("bulk_commons_meta",script)
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

SHA="e"*40
def meta(licence="CC BY-SA 4.0",url="https://creativecommons.org/licenses/by-sa/4.0/",author="Example Photographer"):
    return {"sha1":SHA,"size":256000,"width":1400,"height":900,
            "mime":"image/jpeg","url":"https://upload.wikimedia.org/wikipedia/commons/d/dd/Church.jpg",
            "extmetadata":{"LicenseShortName":{"value":licence},
                           "LicenseUrl":{"value":url},"Artist":{"value":author}}}
def page(title,**kwargs):
    return {"title":title,"imageinfo":[{**meta(),**kwargs}]}
def candidate(aid,title):
    return {"physical_anchor_id":aid,"source_url":"https://commons.wikimedia.org/wiki/"+title.replace(" ","_"),
            "file_title":title,"publication":mod.HOLD,
            "rights_approved":False,"subject_approved":False}
def index(photos):
    records=[{"physical_anchor_id":f"RG-{i:012X}","publication":mod.HOLD,
              "approved_exterior":False,"photographic_candidates":[]} for i in range(2579)]
    for idx,items in photos.items():records[idx]["photographic_candidates"]=items
    return {"schema":mod.INPUT,"publication":mod.HOLD,"records":records,
            "counts":{"physical_anchors_indexed":2579,"published_images":0}}
class BulkCommonsPreflightTests(unittest.TestCase):
    def test_multi_title_source_dedup_and_safe_holds(self):
        first="File:St Stanislaus Church.jpg"
        second="File:Holy Trinity Church.jpg"
        d=index({0:[candidate("RG-000000000000",first),
                    candidate("RG-000000000000",second)],
                 1:[candidate("RG-000000000001",first)]})
        with tempfile.TemporaryDirectory() as td:
            root=Path(td);src=root/"index.json";out=root/"scan.json"
            src.write_text(json.dumps(d))
            def fake(titles):
                self.assertEqual(len(titles),2)
                return {"query":{"pages":[page(first),page(second,extmetadata={
                    "LicenseShortName":{"value":"Public domain"},
                    "Artist":{"value":"Archive"}})]}}
            with patch.object(mod.time,"sleep",side_effect=AssertionError("No sleeps expected")):
                result=mod.scan(src,out,limit=50,loader=fake)
            c=result["counts"]
            self.assertEqual(c["unique_commons_titles_in_whole_index"],2)
            self.assertEqual(c["selected_unique_titles"],2)
            self.assertEqual(c["distinct_anchors_referenced"],2)
            self.assertEqual(c["commons_metadata_batch_calls"],1)
            self.assertEqual(c["metadata_eligible_source_files"],1)
            self.assertEqual(c["images_published"],0)
            file=next(x for x in result["records"] if x["file_title"]==first)
            self.assertEqual(len(file["anchor_ids"]),2)
            self.assertEqual(file["source_sha1"],SHA)
            self.assertFalse(file["subject_approved"])
            self.assertFalse(file["rights_approved"])
            with self.assertRaisesRegex(ValueError,"overwrite"):
                mod.scan(src,out,limit=2,loader=fake)
    def test_licence_gate_not_merely_claimed(self):
        for label,url,author,reason in [
            ("CC BY-SA 4.0","http://creativecommons.org/licenses/by-sa/4.0/","Artist","LICENSE_URL_INCONSISTENT_WITH_SHORT_NAME"),
            ("CC BY-SA 4.0","https://example.org/licenses/by-sa/4.0/","Artist","LICENSE_URL_INCONSISTENT_WITH_SHORT_NAME"),
            ("CC BY-SA 4.0","https://creativecommons.org/licenses/by/4.0/","Artist","LICENSE_URL_INCONSISTENT_WITH_SHORT_NAME"),
            ("CC BY-SA 4.0","https://creativecommons.org/licenses/by-sa/4.0/","","AUTHOR_NOT_CLEAR"),
            ("Public domain","https://creativecommons.org/publicdomain/mark/1.0/","Artist","LICENSE_NOT_SUPPORTED_OR_PD_LEGAL_REVIEW")
        ]:
            with self.subTest(label=label,url=url,author=author):
                info=meta(label,url,author)
                self.assertEqual(mod.license_info(info)[1],reason)
        lic,reason=mod.license_info(meta())
        self.assertEqual(lic["label"],"CC-BY-SA-4.0")
        self.assertIsNone(reason)
    def test_subject_and_file_title_defenses(self):
        t="File:Church.jpg"
        self.assertEqual(mod.verify_metadata(page(t),t)["status"],
                         "METADATA_ELIGIBLE_SUBJECT_NOT_VERIFIED")
        self.assertEqual(mod.verify_metadata({"title":"File:Redirect.jpg","imageinfo":[meta()]},t)["status"],
                         "HOLD_MISSING_OR_REDIRECTED_SOURCE_FILE")
        self.assertEqual(mod.verify_metadata(page(t,sha1="a"*40),t)["source_sha1"],"a"*40)
        self.assertEqual(mod.verify_metadata(page(t,sha1="NOT_A_SHA"),t)["status"],
                         "HOLD_MISSING_COMMONS_SOURCE_SHA1")
        self.assertEqual(mod.verify_metadata(page(t,mime="image/svg+xml"),t)["status"],
                         "HOLD_ORIGINAL_SIZE_OR_FORMAT")
        self.assertEqual(mod.verify_metadata(page(t,url="https://example.com/picture.jpg"),t)["status"],
                         "HOLD_ORIGINAL_URL_HOST")
        self.assertFalse(mod.title_ok("File:../evil.jpg"))
        self.assertFalse(mod.title_ok("File:wrong|injection.jpg"))
        with self.assertRaises(ValueError):mod.metadata_query([])
        with self.assertRaises(ValueError):mod.metadata_query([t]*26)
    def test_api_errors_not_zero_candidates(self):
        d=index({0:[candidate("RG-000000000000","File:Church.jpg")]})
        with tempfile.TemporaryDirectory() as td:
            root=Path(td);src=root/"index.json";src.write_text(json.dumps(d))
            result=mod.scan(src,root/"out.json",limit=10,
                            loader=lambda xs:{"error":"METADATA_API_FAILED","reason":"HTTP_429"})
            self.assertEqual(result["counts"]["rights_or_other_holds"],1)
            self.assertEqual(result["records"][0]["status"],"HOLD_METADATA_REQUEST_FAILED")
            self.assertEqual(result["counts"]["metadata_eligible_source_files"],0)
            self.assertEqual(result["counts"]["original_images_downloaded"],0)
if __name__=="__main__":unittest.main()
