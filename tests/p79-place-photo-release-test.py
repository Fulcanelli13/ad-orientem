#!/usr/bin/env python3
"""Offline P79 V2 selection → single editorial approval → source-gated photo tests."""
import copy
import hashlib
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("p79_release",ROOT/"tools/directory/release-p79-approved-photos.py")
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class ReviewReleaseTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.p79=mod.read(mod.P79)
        cls.seed=mod.read(mod.SEED)
        cls.media=mod.read(mod.MEDIA)
        cls.gallery=mod.read(mod.GALLERY)
        ids={p["place_id"] for p in cls.seed["places"]}
        cls.rows=[r for r in cls.p79["records"]
                  if r["owner"]=="GEOGRAPHY" and r["entity_id"] in ids]
        cls.by_place={}
        for r in cls.rows:cls.by_place.setdefault(r["entity_id"],[]).append(r)
        cls.approved={r["place_id"] for r in cls.media["items"]+cls.gallery["items"]
                      if r.get("status")=="APPROVED"}
        cls.candidate=next(r for r in cls.rows
          if (r["entity_id"] not in cls.approved and r["license_claim"] in mod.POLICY
              and r.get("prior_editorial")!="REJECT"
              and not str(r.get("prior_triage") or "").startswith("EXCLUDE_")))
    def base_review(self):
        return {"schema":mod.SCHEMA,"source_as_of":self.p79["as_of"],
                "candidate_count":len(self.rows),"canonical_site_count":len(self.by_place),
                "decisions":[{"place_id":id,"decision":"unreviewed","editorial_approved":False}
                            for id in sorted(self.by_place)]}
    def chose(self):
        review=self.base_review()
        p=self.candidate
        row=next(x for x in review["decisions"] if x["place_id"]==p["entity_id"])
        row.update({"decision":"chosen","editorial_approved":True,
                    "exact_building_editorially_confirmed":True,
                    "visual_quality_editorially_approved":True,
                    "selected_p79_id":p["id"],"source_file":p["source_file"],
                    "source_page":p["source_page"],"frozen_original_sha1":p["original_sha1"]})
        return review,row
    def select(self,review):
        return mod.load_selections(review,self.p79,self.seed,self.media,self.gallery)

    def test_source_fixture_matches_canonical_coverage(self):
        self.assertEqual(len(self.rows),430)
        self.assertEqual(len(self.by_place),109)
        self.assertGreaterEqual(len(self.approved & set(self.by_place)),30)
        self.assertGreaterEqual(len(self.approved),64)
        self.assertEqual(self.select(self.base_review()),[])
    def test_single_editorial_approval_is_sufficient_for_candidate_release(self):
        review,row=self.chose()
        selected=self.select(review)
        self.assertEqual(len(selected),1)
        self.assertEqual(selected[0]["place_id"],row["place_id"])
        self.assertEqual(selected[0]["sha1"],row["frozen_original_sha1"])
    def test_v1_or_missing_attestation_never_promoted(self):
        review,row=self.chose()
        review["schema"]="AO_P79_PLACE_PHOTO_SELECTIONS_V1"
        with self.assertRaisesRegex(ValueError,"schema"):self.select(review)
        review["schema"]=mod.SCHEMA
        row["exact_building_editorially_confirmed"]=False
        with self.assertRaisesRegex(ValueError,"attestation"):self.select(review)
    def test_wrong_site_or_changed_source_fails_closed(self):
        review,row=self.chose()
        row["frozen_original_sha1"]="0"*40
        with self.assertRaisesRegex(ValueError,"source"):self.select(review)
        row["frozen_original_sha1"]=self.candidate["original_sha1"]
        row["selected_p79_id"]=999999
        with self.assertRaisesRegex(ValueError,"different"):self.select(review)
    def test_missing_extra_and_duplicate_site_decisions_fail(self):
        review,row=self.chose()
        review["decisions"].pop()
        with self.assertRaisesRegex(ValueError,"stale"):self.select(review)
        review,row=self.chose()
        review["decisions"][0]=copy.deepcopy(review["decisions"][1])
        with self.assertRaisesRegex(ValueError,"Duplicate"):self.select(review)
    def test_unsupported_licence_and_rejected_source_not_approved(self):
        review,row=self.chose()
        old=self.candidate["license_claim"]
        self.candidate["license_claim"]="PUBLIC DOMAIN"
        with self.assertRaisesRegex(ValueError,"Unsupported"):self.select(review)
        self.candidate["license_claim"]=old
        self.candidate["prior_editorial"]="REJECT"
        with self.assertRaisesRegex(ValueError,"Previously rejected"):self.select(review)
        self.candidate["prior_editorial"]=None
    def test_no_network_metadata_and_bytes_are_verified_before_staging(self):
        review,row=self.chose()
        selected=self.select(review)
        payload=b"fake-immutable-image"*80
        digest=hashlib.sha1(payload).hexdigest()
        selected[0]["sha1"]=digest
        real_convert=mod.stager.convert_original
        mod.stager.convert_original=lambda original,info,entry:(b"RIFF"+b"x"*16+b"WEBP",(800,600),False)
        info={"sha1":digest,"mime":"image/jpeg","size":len(payload),
              "url":"https://upload.wikimedia.org/test-original.jpg"}
        def loader(entry):return info,entry["expected_license"],"Example Photographer"
        try:
            with tempfile.TemporaryDirectory() as tmp:
                out=Path(tmp)/"batch"
                report=mod.process(selected,out,metadata_loader=loader,download=lambda url,max_bytes:payload)
                self.assertEqual(report["source_checked_and_staged"],1)
                self.assertEqual(report["new_approved_entries"],0)
                self.assertEqual(report["new_photos_verified_visible_in_running_app"],0)
                rec=report["records"][0]["item"]
                self.assertTrue(rec["rights_verified"] and rec["subject_verified"] and rec["crop_reviewed"])
                self.assertEqual(rec["credit"],"Example Photographer")
                self.assertEqual(rec["license_url"],mod.stager.LICENSES[rec["license"].replace("CC0-1.0","CC0")])
                self.assertTrue(Path(report["records"][0]["local_webp"]).is_file())
        finally:
            mod.stager.convert_original=real_convert
    def test_changed_original_is_held_not_substituted(self):
        review,row=self.chose()
        selected=self.select(review)
        info={"sha1":selected[0]["sha1"],"mime":"image/jpeg","size":20,
              "url":"https://upload.wikimedia.org/image"}
        with tempfile.TemporaryDirectory() as tmp:
            report=mod.process(selected,Path(tmp)/"hold",
               metadata_loader=lambda entry:(info,entry["expected_license"],"Artist"),
               download=lambda url,max_bytes:b"different-original")
            self.assertEqual(report["source_checked_and_staged"],0)
            self.assertEqual(len(report["exceptions"]),1)
            self.assertEqual(report["new_approved_entries"],0)
    def test_one_click_no_auto_nearby_venue_promotion(self):
        review,row=self.chose()
        self.assertEqual(len(self.select(review)),1)
        self.assertEqual(mod.load_selections(review,self.p79,self.seed,self.media,self.gallery)[0]["place_id"],
                         self.candidate["entity_id"])
        # Venue joins remain unchanged; this tool only generates canonical Place media.
        self.assertNotIn("venue_id",mod.approved_item(
            {"place":next(p for p in self.seed["places"] if p["place_id"]==row["place_id"]),
             "place_id":row["place_id"],"source":self.candidate,"sha1":self.candidate["original_sha1"]},
            "CC-BY-4.0","Artist",b"RIFFtestWEBP",(800,600)))
    def test_source_license_metadata_supports_by_3(self):
        info={"extmetadata":{
            "LicenseShortName":{"value":"CC BY 3.0"},
            "LicenseUrl":{"value":"https://creativecommons.org/licenses/by/3.0/"},
            "Artist":{"value":"Test Author"}}}
        self.assertEqual(mod.stager.license_from_metadata(info),("CC-BY-3.0","Test Author"))
        info["extmetadata"]["LicenseUrl"]["value"]="https://example.net/invalid"
        with self.assertRaisesRegex(ValueError,"Unsupported|mismatch|verifiable"):
            mod.stager.license_from_metadata(info)

if __name__=="__main__":unittest.main()
