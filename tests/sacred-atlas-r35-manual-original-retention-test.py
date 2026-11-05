#!/usr/bin/env python3
"""Offline synthetic-original tests: no Commons network, no production mutations."""
from __future__ import annotations
import hashlib
import importlib.util
import io
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT=Path(__file__).resolve().parents[1]
SCRIPT=ROOT/"tools/atlas/verify-sacred-atlas-r28-approved19-source-originals.py"
SPEC=importlib.util.spec_from_file_location("r35_verifier",SCRIPT)
mod=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(mod)

class R35OriginalRetention(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        from PIL import Image
        b=io.BytesIO()
        Image.new("RGB",(720,690),(25,40,65)).save(b,format="JPEG",quality=89)
        cls.raw=b.getvalue()
        cls.sha1=hashlib.sha1(cls.raw).hexdigest()
        cls.row=dict(mod.load(mod.MANIFEST)["decisions"][0])
        cls.row.update(original_sha1=cls.sha1,original_bytes=len(cls.raw),pixel_dimensions=[720,690])
        cls.info={
            "sha1":cls.sha1,"size":len(cls.raw),"mime":"image/jpeg","width":720,"height":690,
            "url":"https://upload.wikimedia.org/wikipedia/commons/synthetic/test.jpg",
            "extmetadata":{"LicenseUrl":{"value":cls.row["license_url"]},"Artist":{"value":cls.row["source_author"]}}
        }

    def run_verified(self,folder,retain=False,info=None,raw=None):
        with patch.object(mod,"DEST",Path(folder)),\
             patch.object(mod,"source_lookup",return_value=info or self.info),\
             patch.object(mod,"fetch",return_value=raw if raw is not None else self.raw):
            return mod.verify(self.row,retain_verified_original=retain)

    def test_default_never_retains_original_jpeg(self):
        with tempfile.TemporaryDirectory() as d:
            report=self.run_verified(d,retain=False)
            self.assertEqual(report["result"],"ORIGINAL_BYTES_VERIFIED_TEMP_PREVIEW_ONLY")
            self.assertIsNone(report["retained_original_path"])
            self.assertFalse((Path(d)/"originals").exists())
            self.assertEqual(len(list((Path(d)/"previews").glob("*.webp"))),1)

    def test_opt_in_retains_only_checksum_verified_exact_original(self):
        with tempfile.TemporaryDirectory() as d:
            report=self.run_verified(d,retain=True)
            p=Path(d)/report["retained_original_path"]
            self.assertEqual(p.name,self.sha1+".jpg")
            self.assertEqual(p.read_bytes(),self.raw)
            self.assertEqual(hashlib.sha1(p.read_bytes()).hexdigest(),self.sha1)
            self.assertFalse((ROOT/"assets/approved/place-media"/p.name).exists())

    def test_mismatched_source_sha1_is_never_retained(self):
        with tempfile.TemporaryDirectory() as d:
            bad={**self.info,"sha1":"0"*40}
            with self.assertRaisesRegex(ValueError,"ORIGINAL_SOURCE_SHA1_DRIFT"):
                self.run_verified(d,retain=True,info=bad)
            self.assertFalse((Path(d)/"originals").exists())

    def test_tampered_download_bytes_are_never_retained(self):
        with tempfile.TemporaryDirectory() as d:
            with self.assertRaisesRegex(ValueError,"DOWNLOAD_BYTES_DO_NOT_MATCH_FROZEN_SHA1"):
                self.run_verified(d,retain=True,raw=self.raw[:-1]+b"X")
            self.assertFalse((Path(d)/"originals").exists())

    def test_only_jpeg_based_magic_and_decoder_family_accepted(self):
        self.assertEqual(mod.validate_jpeg_stream(self.raw,"JPEG"),"JPEG")
        self.assertEqual(mod.validate_jpeg_stream(self.raw,"MPO"),"MPO")
        with self.assertRaisesRegex(ValueError,"JPEG_DECODER_FORMAT_MISMATCH:PNG"):
            mod.validate_jpeg_stream(self.raw,"PNG")
        with self.assertRaisesRegex(ValueError,"JPEG_CONTAINER_MAGIC_MISMATCH"):
            mod.validate_jpeg_stream(b"not a JPEG image", "JPEG")

    def test_source_identified_as_mpo_decodes_to_correct_webp(self):
        from PIL import Image
        original_open=Image.open
        def camera_mpo_open(*args,**kwargs):
            photo=original_open(*args,**kwargs)
            photo.format="MPO"
            return photo
        with tempfile.TemporaryDirectory() as d,patch.object(Image,"open",side_effect=camera_mpo_open):
            result=self.run_verified(d,retain=True)
            self.assertEqual(result["source_decoder_format"],"MPO")
            self.assertEqual(result["source_frame_index"],0)
            self.assertEqual(result["result"],"ORIGINAL_BYTES_VERIFIED_TEMP_PREVIEW_ONLY")
            self.assertEqual(len(list((Path(d)/"previews").glob("*.webp"))),1)
            self.assertEqual(hashlib.sha1((Path(d)/result["retained_original_path"]).read_bytes()).hexdigest(),self.sha1)

    def test_a_failed_source_is_a_failed_job_not_a_green_report(self):
        with tempfile.TemporaryDirectory() as d,patch.object(mod,"DEST",Path(d)),\
             patch.object(mod,"verify",side_effect=ValueError("JPEG_DECODER_FORMAT_MISMATCH:PNG")),\
             patch.object(sys,"argv",[str(SCRIPT),"--verify-originals","--max-files","1"]):
            rc=mod.main()
            report=json.loads((Path(d)/"report.json").read_text())
            self.assertEqual(rc,2)
            self.assertEqual(report["originals_verified"],0)
            self.assertEqual(report["results"][0]["result"],"HOLD_VERIFICATION_FAILURE")
            self.assertEqual(report["results"][0]["reason"],"JPEG_DECODER_FORMAT_MISMATCH:PNG")

    def test_http429_stops_and_fails_without_retries(self):
        import urllib.error
        err=urllib.error.HTTPError("https://commons.wikimedia.org/w/api.php",429,"Too Many Requests",None,None)
        with tempfile.TemporaryDirectory() as d,patch.object(mod,"DEST",Path(d)),\
             patch.object(mod,"verify",side_effect=err) as mocked,\
             patch.object(sys,"argv",[str(SCRIPT),"--verify-originals","--max-files","2"]):
            rc=mod.main()
            report=json.loads((Path(d)/"report.json").read_text())
            self.assertEqual(rc,2)
            self.assertTrue(report["stopped_due_to_wikimedia_429"])
            self.assertEqual(report["source_attempts"],1)
            mocked.assert_called_once()

    def test_offline_default_and_unsafe_cli_rejected(self):
        p=subprocess.run([sys.executable,str(SCRIPT)],capture_output=True,text=True,check=True)
        self.assertIn("R28 OFFLINE CONTRACT",p.stdout)
        invalid=subprocess.run([sys.executable,str(SCRIPT),"--retain-verified-originals"],
                               capture_output=True,text=True)
        self.assertNotEqual(invalid.returncode,0)
        self.assertIn("requires --verify-originals",invalid.stderr)
        badrange=subprocess.run([sys.executable,str(SCRIPT),"--start-index","18","--max-files","2"],
                                capture_output=True,text=True)
        self.assertNotEqual(badrange.returncode,0)

if __name__=="__main__":
    unittest.main()
