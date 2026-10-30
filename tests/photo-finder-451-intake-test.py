#!/usr/bin/env python3
"""Offline contracts for 451 user-selected canonical Places / 972 photos."""
import copy
import csv
import hashlib
import importlib.util
import tempfile
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("photo_finder_release",ROOT/"tools/directory/release-photo-finder-decisions.py")
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class PhotoFinderTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  with mod.CREDITS.open(encoding="utf-8-sig",newline="") as f:
   cls.rows=list(csv.DictReader(f))
  cls.decisions=mod.load_json(mod.DECISIONS)
  cls.places=mod.load_json(mod.PLACES)
  cls.covers=mod.load_json(mod.COVERS)
  cls.gallery=mod.load_json(mod.GALLERY)
  cls.plan=mod.source_status(cls.rows,cls.decisions,cls.places,cls.covers,cls.gallery)
 def test_full_451_place_export_is_lossless(self):
  p=self.plan
  self.assertEqual(p["reviewed_places"],451)
  self.assertEqual(p["chosen_places"],395)
  self.assertEqual(p["none_places"],56)
  self.assertEqual(p["source_rows"],972)
  self.assertEqual(p["total_canonical_places"],530)
  self.assertEqual(len(p["tasks"])+len(p["holds"])+len(p["skips"]),972)
  self.assertEqual(set(x["place_id"] for x in p["tasks"]+p["holds"]+p["skips"]).issubset(
    set(x["place_id"] for x in self.places["places"])),True)
 def test_frozen_cover_windows_survive_successful_previous_batches(self):
  c,g=mod.frozen_original_schedule(self.covers,self.gallery)
  self.assertEqual(len(c["items"]),40)
  self.assertGreaterEqual(len(self.covers["items"])-len(c["items"]),12)
  frozen=mod.source_status(self.rows,self.decisions,self.places,c,g)
  covers=[x for x in frozen["tasks"] if x["role"]=="cover"]
  self.assertEqual(len(covers),348)
  first=covers[:20]
  second=covers[20:40]
  self.assertEqual(len(first),20)
  self.assertEqual(len(second),20)
  self.assertEqual(len(set(x["place_id"] for x in first+second)),40)
  already=[x for x in first if mod.already_released(x,self.covers,self.gallery)]
  self.assertEqual(len(already),12)
  currently_approved={row["place_id"] for row in self.covers["items"]
                      if row.get("status")=="APPROVED"}
  self.assertEqual({x["place_id"] for x in second
                    if mod.already_released(x,self.covers,self.gallery)},
                   {x["place_id"] for x in second}&currently_approved)
  # A later release may never change the original offset window.
  later=copy.deepcopy(self.covers)
  new_id=second[0]["place_id"]
  later["items"].append({"place_id":new_id,"status":"APPROVED",
    "source_place_ref":"PHOTO_FINDER_2026-10-30_R1"})
  cc,gg=mod.frozen_original_schedule(later,self.gallery)
  later_window=[x for x in mod.source_status(
    self.rows,self.decisions,self.places,cc,gg)["tasks"] if x["role"]=="cover"][20:40]
  self.assertEqual([x["place_id"] for x in second],
                   [x["place_id"] for x in later_window])
  self.assertTrue(mod.already_released(second[0],later,self.gallery))
 def test_older_licences_not_misrepresented(self):
  for c in ["CC-BY-2.0","CC-BY-2.5","CC-BY-SA-2.5"]:
   self.assertIn(c,mod.stage.LICENSES)
  self.assertNotIn("Public domain",mod.POLICY)
  self.assertNotIn("CC BY-SA 1.0",mod.POLICY)
  for short,expected in [("CC BY 2.0","CC-BY-2.0"),("CC BY-SA 2.5","CC-BY-SA-2.5")]:
   info={"extmetadata":{
    "LicenseShortName":{"value":short},"LicenseUrl":{"value":mod.stage.LICENSES[expected]},
    "Artist":{"value":"Test author"}}}
   self.assertEqual(mod.stage.license_from_metadata(info),(expected,"Test author"))
 def test_duplicate_or_dropped_credit_is_refused(self):
  with self.assertRaisesRegex(ValueError,"Duplicate"):
   mod.source_status(self.rows+[self.rows[0]],self.decisions,self.places,self.covers,self.gallery)
  bad=copy.deepcopy(self.decisions)
  bad["decisions"]["place:FR:sanctuaire-notre-dame-de-lourdes"]["files"][0]="File:Different church.jpg"
  with self.assertRaisesRegex(ValueError,"no credit"):
   mod.source_status(self.rows,bad,self.places,self.covers,self.gallery)
 def test_unknown_or_duplicated_place_rejected(self):
  j=copy.deepcopy(self.decisions)
  j["decisions"]["place:XX:invented"]={"files":[],"none":True}
  with self.assertRaisesRegex(ValueError,"451"):
   mod.source_status(self.rows,j,self.places,self.covers,self.gallery)
 def test_do_not_replace_existing_covers_or_reuse_source_for_wrong_place(self):
  p=self.plan
  skipped={x["reason"] for x in p["skips"]}
  self.assertIn("PRESERVE_EXISTING_APPROVED_COVER",skipped)
  self.assertGreater(len(p["tasks"]),200)
  self.assertGreater(len([x for x in p["tasks"] if x["role"]=="gallery"]),300)
 def test_staging_never_claims_app_visibility(self):
  task=copy.deepcopy(self.plan["tasks"][0])
  original=b"p"*2500
  task["sha1"]=hashlib.sha1(original).hexdigest()
  info={"url":"https://upload.wikimedia.org/example.jpg","size":len(original),"sha1":task["sha1"],
        "mime":"image/jpeg","width":1200,"height":900}
  saved=mod.stage.convert_original
  mod.stage.convert_original=lambda blob,i,e:(b"RIFF"+b"x"*16+b"WEBP",(1200,900),False)
  try:
   with tempfile.TemporaryDirectory() as temp:
    report=mod.verify_and_stage([task],Path(temp)/"stage",
      metadata_loader=lambda entry:(info,task["license"],"Test Photo Author"),
      downloader=lambda url,max_bytes:original)
    self.assertEqual(report["verified"],1)
    self.assertEqual(report["new_files_in_app_tree"],0)
    self.assertEqual(report["verified_visible_in_running_app"],0)
    m=report["media_records"][0]["item"]
    self.assertTrue(m["subject_verified"])
    self.assertTrue(m["rights_verified"])
    self.assertEqual(m["source_sha1"],task["sha1"])
    self.assertEqual(m["credit"],"Test Photo Author")
  finally:mod.stage.convert_original=saved
 def test_source_byte_mismatch_holds_only_bad_file(self):
  task=copy.deepcopy(self.plan["tasks"][0])
  with tempfile.TemporaryDirectory() as temp:
   report=mod.verify_and_stage([task],Path(temp)/"stage",
     metadata_loader=lambda entry:({"url":"https://upload.wikimedia.org/test.jpg",
      "size":6000,"sha1":task["sha1"],"mime":"image/jpeg"},task["license"],"Author"),
     downloader=lambda url,max_bytes:b"not an original")
   self.assertEqual(report["verified"],0)
   self.assertEqual(len(report["exceptions"]),1)
 def test_legal_commons_filename_with_double_dot(self):
  self.assertIn("Nazar%C3%A9..jpg",mod.norm_commons("File:Basílica de Nossa Senhora de Nazaré..jpg"))
  with self.assertRaisesRegex(ValueError,"Invalid Commons title"):
   mod.norm_commons("File:../elsewhere/image.jpg")

if __name__=="__main__":unittest.main()
