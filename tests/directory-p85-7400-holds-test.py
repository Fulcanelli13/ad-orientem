#!/usr/bin/env python3
"""P85 contract: full 7400-source recovery accounting, safe site/rights holds."""
import importlib.util,json,pathlib,tempfile,unittest,hashlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("p85",ROOT/"tools/directory/p85-worldwide-7400-holds-enrichment.py")
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)

def sample(i,hold=True):
    return {"physical_anchor_id":"RG-%012X"%(i%2579+1),"country":"FR",
        "place_name":"Chapelle Saint Paul","place_city_hint":"lyon",
        "file_title":"File:P85-source-%04d.jpg"%i,
        "source_url":"https://commons.wikimedia.org/wiki/File:P85-source-%04d.jpg"%i,
        "original_sha1_claim":"%040x"%(i+1),
        "commons_page_id":10000+i,
        "screening_disposition":"HOLD_NO_EXACT_SITE_GEO_OR_LOCALITY_CORROBORATION" if hold
            else "REVIEW_QUEUE_LOCALITY_AND_NAME_CORROBORATED",
        "publication":m.HOLD,
        "published":False,"exact_site_verified":False,
        "rights_independently_cleared":False,"original_bytes_verified":False}

def make_inputs(root):
    allrows=[sample(i,hold=i>=301) for i in range(7701)]
    # Unique anchor keys are important: 7701 photo assignments across 2579 sites.
    holds=allrows[301:]
    total=root/"p83-all.jsonl";held=root/"p83-holds.jsonl";summary=root/"p83-summary.json"
    for target,records in [(total,allrows),(held,holds)]:
        with target.open("w") as f:
            for r in records:f.write(json.dumps(r)+"\n")
    summary.write_text(json.dumps({"schema":m.P83,"anchors_accounted":2579,"countries":76,
        "photo_source_assignments":7701,"held_assignments":7400,
        "review_queue_assignments":301,"published_photos":0,"approved_photos":0,
        "rights_cleared":0}))
    return total,held,summary,allrows,holds

def page(title,sha="a"*40):
    return {"title":title,"pageid":101,"imageinfo":[{"sha1":sha,"width":1600,"height":1200,
       "size":300000,"url":"https://upload.wikimedia.org/wikipedia/commons/4/4f/file.jpg",
       "mime":"image/jpeg","thumburl":"https://upload.wikimedia.org/wikipedia/commons/thumb/x/thumb.jpg",
       "extmetadata":{"LicenseShortName":{"value":"CC BY-SA 4.0"},
                      "LicenseUrl":{"value":"https://creativecommons.org/licenses/by-sa/4.0/"},
                      "Artist":{"value":"Verified Commons contributor"},
                      "ImageDescription":{"value":"Chapelle Saint Paul, Lyon, France"}}}],
       "coordinates":[]}

class P85Tests(unittest.TestCase):
    def test_metadata_rights_and_identity(self):
        p=m.check_page(page("File:Paul Lyon.jpg"),"File:Paul Lyon.jpg")
        self.assertEqual(p["source_status"],"CURRENT_COMMONS_METADATA_RETRIEVED")
        self.assertIn("current_rights_metadata_claim",p)
        self.assertFalse(p["geotag_source_coordinates"])
        bad=page("File:Paul Lyon.jpg")
        bad["imageinfo"][0]["extmetadata"]["LicenseShortName"]["value"]="CC BY-NC 4.0"
        self.assertEqual(m.check_page(bad,bad["title"])["current_rights_hold_reason"],
                         "HOLD_CURRENT_RIGHTS_UNSUPPORTED")
        self.assertEqual(m.check_page(page("File:Other.jpg"),"File:Paul Lyon.jpg")["source_status"],"HOLD_COMMONS_TITLE_CHANGED")

    def test_name_and_city_yield_only_review_not_approval(self):
        r=sample(3)
        source=m.check_page(page(r["file_title"],r["original_sha1_claim"]),r["file_title"])
        source["current_page_id"]=r["commons_page_id"]
        evidence=m.with_current_source(r,source,{m.canonical(r["file_title"]):{r["physical_anchor_id"]}}, {})
        self.assertEqual(evidence["p85_disposition"],"RECOVERED_FOR_RESEARCH_REVIEW_CITY_TEXT_NOT_APPROVED")
        self.assertFalse(evidence["rights_approved"])
        self.assertFalse(evidence["exact_site_verified"])
        other={m.canonical(r["file_title"]):{r["physical_anchor_id"],"RG-OTHER"}}
        evidence=m.with_current_source(r,source,other,{})
        self.assertEqual(evidence["p85_disposition"],"HOLD_EXACT_BUILDING_IDENTITY_STILL_UNCORROBORATED")

    def test_real_p83_unqueryable_file_title_remains_hold_without_api(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=pathlib.Path(tmp)
            allf,holdsf,summary,allrows,holds=make_inputs(root)
            bad=allrows[301]
            bad["file_title"]="File:unsafe..name#query.jpg"
            # P83 stores this source assignment unapproved. P85 cannot drop it.
            with allf.open("w") as stream:
                for r in allrows:stream.write(json.dumps(r)+"\n")
            with holdsf.open("w") as stream:
                for r in holds:stream.write(json.dumps(r)+"\\n")
            report,original,held=m.source_lineage(allf,holdsf,summary)
            self.assertEqual(len(original),7701)
            self.assertEqual(len(held),7400)
            self.assertFalse(m.filename_ok(bad["file_title"]))
            output=m.with_current_source(bad,{}, {m.canonical(bad["file_title"]):{bad["physical_anchor_id"]}}, {})
            self.assertEqual(output["p85_disposition"],"HOLD_UNSAFE_OR_UNQUERYABLE_COMMONS_TITLE")
            self.assertFalse(output["exact_site_verified"])
            self.assertFalse(output["rights_approved"])

    def test_geotag_shared_needs_all_other_source_pins_far_away(self):
        r=sample(5)
        source=m.check_page(page(r["file_title"],r["original_sha1_claim"]),r["file_title"])
        source["current_page_id"]=r["commons_page_id"]
        source["geotag_source_coordinates"]=[{"lat":48.85,"lon":2.34}]
        peers={m.canonical(r["file_title"]):{r["physical_anchor_id"],"RG-OTHER"}}
        pins={r["physical_anchor_id"]:{"status":"SOURCE_COORDINATE_SEARCH_HINT_NOT_CERTIFIED",
               "precision":"building","lat":48.85,"lon":2.34}}
        x=m.with_current_source(r,source,peers,pins)
        self.assertTrue(x["p85_disposition"].startswith("HOLD_"))
        pins["RG-OTHER"]={"status":"SOURCE_COORDINATE_SEARCH_HINT_NOT_CERTIFIED",
               "precision":"building","lat":49.85,"lon":2.34}
        x=m.with_current_source(r,source,peers,pins)
        self.assertEqual(x["p85_disposition"],"RECOVERED_FOR_RESEARCH_REVIEW_GEO_UNIQUE_NOT_APPROVED")
        self.assertFalse(x["exact_site_verified"])

    def test_7400_global_reconciles_all_six_machine_only_shards(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=pathlib.Path(tmp);allf,holdsf,summary,allrows,holds=make_inputs(root)
            report,original,held=m.source_lineage(allf,holdsf,summary)
            self.assertEqual(len(held),7400)
            transport=root/"transport";transport.mkdir()
            recs=[[] for _ in range(6)]
            for r in holds:
                s=int(hashlib.sha256(m.canonical(r["file_title"]).encode()).hexdigest()[:8],16)%6
                recs[s].append({"physical_anchor_id":r["physical_anchor_id"],"country":r["country"],
                  "place_name":r["place_name"],"file_title":r["file_title"],"source_url":r["source_url"],
                  "original_sha1_claim":r["original_sha1_claim"],"publication":m.HOLD,
                  "p85_disposition":"HOLD_EXACT_BUILDING_IDENTITY_STILL_UNCORROBORATED",
                  "published":False,"exact_site_verified":False,"rights_approved":False,
                  "original_bytes_verified":False})
            for i in range(6):
                audit={"schema":m.SCHEMA,"technical_shard":i,"technical_shard_count":6,
                  "source_p83_summary_sha256":m.digest(summary),
                  "source_p83_all_assignments_sha256":m.digest(allf),
                  "source_p83_holds_sha256":m.digest(holdsf),
                  "assignments_accounted":len(recs[i]),"commons_metadata_requests":0,
                  "file_metadata_query_failures":0,"original_bytes_downloaded":0,
                  "site_approvals":0,"rights_approvals":0,"publications":0}
                (transport/f"p85-shard-{i:02d}.json").write_text(json.dumps({"summary":audit,"records":recs[i]}))
            output=root/"consolidated"
            done=m.consolidate(allf,holdsf,summary,transport,output)
            self.assertEqual(done["all_holds_accounted"],7400)
            self.assertEqual(done["p85_assignments_still_held"],7400)
            self.assertEqual(done["p83_existing_research_review"],301)
            self.assertEqual(done["photos_published"],0)
            with self.assertRaisesRegex(ValueError,"overwrite"):
                m.consolidate(allf,holdsf,summary,transport,output)
            path=transport/"p85-shard-04.json";raw=json.loads(path.read_text())
            raw["records"]=raw["records"][:-1]
            path.write_text(json.dumps(raw))
            with self.assertRaisesRegex(ValueError,"Inconsistent global"):
                m.consolidate(allf,holdsf,summary,transport,root/"bad")

if __name__=="__main__":unittest.main()
