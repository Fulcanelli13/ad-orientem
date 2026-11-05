#!/usr/bin/env python3
"""Offline R29 byte-stage smoke tests for true JPEG and JPEG-based MPO originals.

No network, repo assets, gate mutation or publication. Synthetic JPEG bytes only.
"""
import hashlib
import importlib.util
import io
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
SCRIPT=ROOT/"tools/atlas/stage-sacred-atlas-r29-owner-selected-originals.py"
spec=importlib.util.spec_from_file_location("r29_mpo_stage",SCRIPT)
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class FrozenSourceMPOStaging(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        data=io.BytesIO()
        Image.new("RGB",(900,720),(70,95,130)).save(data,format="JPEG",quality=91)
        cls.raw=data.getvalue()
        cls.row={
          "original_sha1":hashlib.sha1(cls.raw).hexdigest(),
          "original_bytes":len(cls.raw),
          "pixel_dimensions":[900,720]
        }

    def test_standard_jpeg_outputs_review_webp(self):
        b,d=mod.converted(self.row,self.raw,[900,720])
        self.assertEqual(d,[900,720])
        self.assertEqual(b[:4],b"RIFF")
        with Image.open(io.BytesIO(b)) as preview:
            self.assertEqual(preview.format,"WEBP")
            self.assertEqual(preview.size,(900,720))

    def test_mpo_decoder_classification_accepts_first_jpeg_frame(self):
        original=Image.open
        def mpo_open(*args,**kwargs):
            result=original(*args,**kwargs)
            result.format="MPO"
            return result
        with patch.object(Image,"open",side_effect=mpo_open):
            b,d=mod.converted(self.row,self.raw,[900,720])
        self.assertEqual(d,[900,720])
        self.assertEqual(b[:4],b"RIFF")

    def test_wrong_source_sha1_still_rejected(self):
        bad={**self.row,"original_sha1":"0"*40}
        with self.assertRaisesRegex(ValueError,"ORIGINAL_SHA1_MISMATCH"):
            mod.converted(bad,self.raw,[900,720])

    def test_non_jpeg_container_rejected_before_decoding(self):
        fake=bytearray(self.raw);fake[:3]=b"GIF"
        row={**self.row,"original_sha1":hashlib.sha1(fake).hexdigest()}
        with self.assertRaisesRegex(ValueError,"ORIGINAL_JPEG_SIZE_OR_SIGNATURE_UNSAFE"):
            mod.converted(row,bytes(fake),[900,720])

    def test_uncleared_photo_cannot_be_published(self):
        lock=mod.read(mod.LOCK);gates=mod.read(mod.REVIEW)
        row=next(x for x in lock["decisions"] if x["place_id"]=="place:PL:lichen-marian-basilica")
        gate=next(x for x in gates["rows"] if x["place_id"]==row["place_id"])
        self.assertFalse(mod.policy_ready(row,gate))

if __name__=="__main__":
    unittest.main()
