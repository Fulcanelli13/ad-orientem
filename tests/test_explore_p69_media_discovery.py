"""P69 bulk media discovery contracts. Offline tests: no Commons calls or costs."""
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("bulkmedia",ROOT/"tools/discover-sacred-media-p69.py")
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class BulkMediaDiscoveryTests(unittest.TestCase):
    def test_exact_complete_registry_coverage_and_batch_limits(self):
        all_places=[];all_relics=[]
        for batch in range(4):
            tasks,approved,total=mod.planned_rows(batch,150)
            place=[x for x in tasks if x["owner"]=="GEOGRAPHY"]
            relic=[x for x in tasks if x["owner"]=="SACRED_PHENOMENA"]
            self.assertLessEqual(len(place),150)
            self.assertLessEqual(len(tasks),mod.MAX_REQUESTS)
            self.assertEqual(len(relic),122 if batch==0 else 0)
            self.assertEqual(total,516)
            for row in place+relic:
                self.assertEqual(row["publication"],"RESEARCH_ONLY_QUERY")
                self.assertTrue(row["entity_id"])
                self.assertTrue(row["place_id"])
                self.assertLessEqual(len(row["search_query"]),115)
                self.assertNotIn('"',row["search_query"])
            all_places.extend(x["entity_id"] for x in place)
            all_relics.extend(x["entity_id"] for x in relic)
        self.assertEqual(len(all_places),516)
        self.assertEqual(len(set(all_places)),516)
        self.assertEqual(len(all_relics),122)
        self.assertEqual(len(set(all_relics)),122)
        self.assertTrue(approved)
        self.assertTrue(all_places==sorted(all_places),"Place sharding must be stable by canonical ID")

    def test_100_to_200_batch_limits(self):
        for n in (100,150,200):
            rows,_,_=mod.planned_rows(0,n)
            self.assertEqual(sum(r["owner"]=="GEOGRAPHY" for r in rows),n)
        for n in (1,99,201,999):
            with self.assertRaises(ValueError):mod.planned_rows(0,n)

    def _fake(self,license_name="CC BY SA 4.0",rights_url="https://creativecommons.org/licenses/by-sa/4.0/",
              artist="<a>A photograph by Someone</a>"):
        return {"query":{"pages":[
          {"ns":6,"pageid":731,"title":"File:Sanctuary A.jpg","imageinfo":[{
            "mime":"image/jpeg","width":1400,"height":2100,
            "sha1":"a"*40,
            "descriptionurl":"https://commons.wikimedia.org/wiki/File:Sanctuary_A.jpg",
            "extmetadata":{"LicenseShortName":{"value":license_name},
              "LicenseUrl":{"value":rights_url},
              "Artist":{"value":artist}}
           }]},
          {"ns":6,"pageid":732,"title":"File:Unlicensed statue.jpg","imageinfo":[{
            "mime":"image/jpeg","width":1400,"height":2200,
            "sha1":"b"*40,
            "descriptionurl":"https://commons.wikimedia.org/wiki/File:Unlicensed_statue.jpg",
            "extmetadata":{"Artist":{"value":"Unattributed"}}}]},
          {"ns":6,"pageid":733,"title":"File:Tiny.jpg","imageinfo":[{
            "mime":"image/jpeg","width":320,"height":280,
            "sha1":"c"*40,
            "descriptionurl":"https://commons.wikimedia.org/wiki/File:Tiny.jpg",
            "extmetadata":{}}]},
          {"ns":6,"pageid":734,"title":"File:Offsite.jpg","imageinfo":[{
            "mime":"image/jpeg","width":1300,"height":900,
            "sha1":"d"*40,
            "descriptionurl":"https://invalid.example/File:Offsite.jpg",
            "extmetadata":{}}]},
          {"ns":0,"pageid":735,"title":"File:Wrong namespace.jpg","imageinfo":[{
            "mime":"image/jpeg","width":1300,"height":900,
            "sha1":"e"*40,
            "descriptionurl":"https://commons.wikimedia.org/wiki/File:Wrong_namespace.jpg",
            "extmetadata":{}}]},
        ]}}

    def test_live_search_results_are_never_automatically_approved(self):
        task=mod.planned_rows(0,150)[0][0]
        rows=mod.candidates_from_response(task,self._fake(),set())
        self.assertEqual(len(rows),2)
        eligible=[x for x in rows if x["screen"].startswith("POSSIBLE")]
        held=[x for x in rows if x["screen"]=="RIGHTS_METADATA_HOLD"]
        self.assertEqual(len(eligible),1)
        self.assertEqual(len(held),1)
        for x in rows:
            self.assertEqual(x["publication"],"RESEARCH_ONLY_NOT_APPROVED")
            self.assertEqual(x["subject_identity"],"UNVERIFIED_SEARCH_MATCH")
            self.assertFalse(x["source_bytes_hash_verified"])
            self.assertFalse(x["image_binary_archived"])
            self.assertEqual(x["rights_for_depicted_artwork"],"NOT_ASSESSED")
            self.assertEqual(x["place_id"],task["place_id"])
            self.assertNotIn("asset_path",x)
            self.assertNotIn("approved",x)

    def test_duplicate_approved_photos_are_filtered(self):
        task=mod.planned_rows(0,150)[0][0]
        rows=mod.candidates_from_response(task,self._fake(),
                  {"https://commons.wikimedia.org/wiki/File:Sanctuary_A.jpg"})
        self.assertEqual(len(rows),1)
        self.assertEqual(rows[0]["commons_file_title"],"File:Unlicensed statue.jpg")

    def test_rights_are_screened_not_approved(self):
        task=mod.planned_rows(0,150)[0][0]
        for name,url in [
           ("CC BY SA 4.0","https://creativecommons.org/licenses/by-sa/4.0/"),
           ("CC0 1.0","https://creativecommons.org/publicdomain/zero/1.0/"),
           ("PUBLIC DOMAIN",""),
        ]:
           out=mod.candidates_from_response(task,self._fake(name,url),set())
           self.assertEqual(out[0]["screen"],"POSSIBLE_FREE_REUSE_REQUIRES_RIGHTS_AND_SUBJECT_REVIEW")
        for name,url in [("Copyrighted","https://invalid.example"),
                         ("CC BY NC SA 4.0","https://creativecommons.org/licenses/by-nc-sa/4.0/")]:
           out=mod.candidates_from_response(task,self._fake(name,url),set())
           self.assertTrue(all(x["screen"]=="RIGHTS_METADATA_HOLD" for x in out))

    def test_readonly_plan_cannot_call_network(self):
        with patch.object(mod,"commons_query",side_effect=AssertionError("No network in plan")):
            rows,_,total=mod.planned_rows(batch=0,batch_size=150)
            self.assertEqual(total,516)
            self.assertEqual(len(rows),272)
        with self.assertRaises(ValueError):mod.planned_rows(-1,150)

    def test_output_guard_must_use_research_directory_and_new_file(self):
        first=mod.planned_rows(0,150)[0][0]
        with self.assertRaises(ValueError):
            mod.output_jsonl(str(ROOT/"data/geography/approved-place-gallery.v1.json"),[first])
        with self.assertRaises(ValueError):
            mod.output_jsonl("/tmp/gallery.jsonl",[first])
        # No arbitrary research directory write in this test; the pure
        # serialization and read-only planning are checked independently.
        self.assertEqual(json.loads(json.dumps(first))["owner"],"GEOGRAPHY")

if __name__=="__main__":
    unittest.main()
