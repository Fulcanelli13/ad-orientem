#!/usr/bin/env python3
"""P83 offline regression: keep wrong-city, duplicate and unsupported-rights images held."""
import importlib.util, pathlib, tempfile, unittest, json
SCRIPT=pathlib.Path(__file__).resolve().parents[1]/"tools/directory/screen-worldwide-p83-photo-candidates.py"
spec=importlib.util.spec_from_file_location("p83",SCRIPT)
p83=importlib.util.module_from_spec(spec)
spec.loader.exec_module(p83)
CODES=[chr(a)+chr(b) for a in range(65,91) for b in range(65,91)][:76]

def photo(title,sha,city,license="CC BY-SA 4.0"):
    return {"file_title":title,"description_claim":"Chapelle "+city,
      "license_claim":license,"license_url":"https://creativecommons.org/licenses/by-sa/4.0/",
      "artist_claim":"Test photographer","original_bytes_claim":160000,
      "width":1600,"height":1200,"original_sha1_claim":sha,"commons_page_id":123,
      "preview_url":"https://thumb.wikimedia.org/example.jpg",
      "source_url":"https://commons.wikimedia.org/wiki/File:example.jpg",
      "name_similarity_hint":0.96,
      "review_status":"UNVERIFIED_MEDIA_DISCOVERY_LEAD",
      "exact_building_subject_verified":False,"license_independently_cleared":False,
      "published":False}

def corpus():
    p80={"schema":p83.P80_SCHEMA,"records":[]}
    p81=[]
    c={cc:{"records":[]} for cc in CODES}
    for i in range(2579):
        country=CODES[i%len(CODES)]
        aid=f"RG-TEST-{i:05d}"
        p80["records"].append({"physical_anchor_id":aid,"country":country,
          "source_country_status":"SUCCESS","source_country_truncated":False,
          "candidate_image_leads":[],"approved_exterior":False,"published":False})
        p81.append({"schema":"AO_P81_ONE_SITE_COMMONS_DISCOVERY_V1","physical_anchor_id":aid,
          "country":country,"place_name":"Chapelle Saint-Jean-Marie-Vianney",
          "source_ids":[aid],"source_description_hint":"2 Rue Test, 77210 Samoreau, France",
          "search_status":"SEARCH_SUCCESS_EMPTY",
          "source_media_candidates":[],"candidate_count":0,
          "subject_verified":False,"rights_cleared":False,"published":False})
    return p80,c,p81

class Screening(unittest.TestCase):
    def test_location_extraction(self):
        self.assertEqual(p83.locality_from_address("31 rue Holtzer, 42240 Unieux, France"),"unieux")
        self.assertEqual(p83.locality_from_address("Estrada Matapaca 333, Pendotiba, 24320-520 Niterói, RJ, Brasil"),"niteroi")
        self.assertEqual(p83.locality_from_address("Dublin"),"")

    def test_source_rights_claim_never_approval(self):
        self.assertEqual(p83.rights_metadata(photo("Saint-Jean-Marie-Vianney Samoreau", "a"*40,"Samoreau")),
            "SUPPORTED_LICENSE_METADATA_CLAIM_NOT_INDEPENDENTLY_CLEARED")
        self.assertEqual(p83.rights_metadata(photo("Saint-Jean-Marie-Vianney Samoreau", "a"*40,"Samoreau","CC BY-NC")),
            "HOLD_UNSUPPORTED_LICENSE_CLAIM")
        self.assertIsNone(p83.title_from_pointer("https://other.example/pic.jpg"))

    def test_full_population_and_wrong_city_and_sha_conflict(self):
        older,countries,rows=corpus()
        rows[0]["source_media_candidates"]=[photo("File:Chapelle Saint-Jean-Marie-Vianney Lyon.jpg","a"*40,"Lyon")]
        rows[1]["source_media_candidates"]=[photo("File:Chapelle Saint-Jean-Marie-Vianney Samoreau.jpg","b"*40,"Samoreau")]
        rows[2]["source_media_candidates"]=[photo("File:Chapelle Saint-Jean-Marie-Vianney Samoreau.jpg","b"*40,"Samoreau")]
        rows[3]["source_media_candidates"]=[photo("File:Chapelle Saint-Jean-Marie-Vianney Samoreau.jpg","c"*40,"Samoreau","CC BY-NC")]
        for i in range(4):
            rows[i]["candidate_count"]=1
            rows[i]["search_status"]="SEARCH_SUCCESS_WITH_CANDIDATES"
        anchors,index,queue,counts=p83.screen(older,countries,rows)
        self.assertEqual(len(anchors),2579)
        self.assertEqual(len(index),4)
        self.assertEqual(len(queue),0)
        self.assertEqual(counts["HOLD_NO_EXACT_SITE_GEO_OR_LOCALITY_CORROBORATION"],1)
        self.assertEqual(counts["HOLD_SHARED_IMAGE_ACROSS_DIFFERENT_SITES"],2)
        self.assertEqual(counts["HOLD_UNSUPPORTED_LICENSE_CLAIM"],1)
        self.assertTrue(all(not x["published"] and not x["exact_site_verified"] for x in index))

    def test_same_anchor_duplicate_commons_title_is_not_two_images(self):
        older,countries,rows=corpus()
        x=photo("File:Chapelle Saint-Jean-Marie-Vianney Samoreau.jpg","a"*40,"Samoreau")
        rows[0]["source_media_candidates"]=[x,{**x}]
        rows[0]["candidate_count"]=2
        rows[0]["search_status"]="SEARCH_SUCCESS_WITH_CANDIDATES"
        anchors,index,queue,counts=p83.screen(older,countries,rows)
        self.assertEqual(len(anchors),2579)
        self.assertEqual(len(index),1)
        self.assertEqual(index[0]["repeated_identical_source_results"],1)
        self.assertFalse(index[0].get("unresolved_same_title_source_conflict",False))
        self.assertEqual(index[0]["publication"],p83.HOLD)
        self.assertFalse(index[0]["published"])

    def test_same_title_different_commons_sha_is_explicit_rights_hold(self):
        older,countries,rows=corpus()
        title="File:Chapelle Saint-Jean-Marie-Vianney Samoreau.jpg"
        rows[0]["source_media_candidates"]=[
            photo(title,"a"*40,"Samoreau"),
            photo(title,"b"*40,"Samoreau")]
        rows[0]["candidate_count"]=2
        rows[0]["search_status"]="SEARCH_SUCCESS_WITH_CANDIDATES"
        anchors,index,queue,counts=p83.screen(older,countries,rows)
        self.assertEqual(len(index),1)
        self.assertEqual(len(queue),0)
        self.assertEqual(index[0]["screening_disposition"],
                         "HOLD_CONFLICTING_COMMONS_SOURCE_REVISIONS")
        self.assertEqual(index[0]["conflicting_source_claims"][0]["original_sha1_claim"],"b"*40)
        self.assertFalse(index[0]["rights_independently_cleared"])
        self.assertEqual(counts["HOLD_CONFLICTING_COMMONS_SOURCE_REVISIONS"],1)

    def test_valid_locality_gives_research_preview_not_approval(self):
        older,countries,rows=corpus()
        rows[0]["source_media_candidates"]=[photo("File:Chapelle Saint-Jean-Marie-Vianney Samoreau.jpg","a"*40,"Samoreau")]
        rows[0]["candidate_count"]=1
        rows[0]["search_status"]="SEARCH_SUCCESS_WITH_CANDIDATES"
        anchors,index,queue,counts=p83.screen(older,countries,rows)
        self.assertEqual(len(queue),1)
        self.assertEqual(queue[0]["screening_disposition"],"REVIEW_QUEUE_LOCALITY_AND_NAME_CORROBORATED")
        self.assertFalse(queue[0]["exact_site_verified"])
        self.assertFalse(queue[0]["rights_independently_cleared"])
        with tempfile.TemporaryDirectory() as d:
            out=pathlib.Path(d)/"screen"
            report=p83.write_output(out,anchors,index,queue,counts,"p80","p81")
            self.assertEqual(report["review_queue_assignments"],1)
            self.assertEqual(report["published_photos"],0)
            with self.assertRaisesRegex(ValueError,"overwrite"):
                p83.write_output(out,anchors,index,queue,counts,"p80","p81")

if __name__=="__main__": unittest.main()
