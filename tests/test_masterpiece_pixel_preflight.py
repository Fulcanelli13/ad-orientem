import io
import pathlib
import sys
import tempfile
import unittest
from unittest.mock import patch
from PIL import Image

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "tools" / "artwork"))
import masterpiece_pixel_preflight as qa

class ArtworkOriginalQATest(unittest.TestCase):
    def test_forbid_untrusted_sources(self):
        for url in ("http://commons.wikimedia.org/wiki/File:art.jpg",
                    "https://other.org/wiki/File:art.jpg",
                    "https://commons.wikimedia.org/wiki/Category:Paintings"):
            with self.assertRaises(ValueError):
                qa.commons_title(url)

    def test_full_canvas_is_not_cropped(self):
        artwork = Image.new("RGB", (900, 700), (38, 33, 40))
        for x in range(70, 800):
            for y in range(70, 620):
                artwork.putpixel((x, y), (min(255, 35+x//5), 40+y//5, 65))
        buf = io.BytesIO()
        artwork.save(buf, "JPEG", quality=94)
        with tempfile.TemporaryDirectory() as folder:
            out = pathlib.Path(folder)
            r = qa.make_previews(buf.getvalue(), out, "DEMO")
            self.assertEqual((r["width"], r["height"]), (900,700))
            self.assertFalse(r["crop_applied"])
            self.assertFalse(r["publication_approved"])
            with Image.open(out / r["preview"]) as im:
                self.assertEqual(im.size, (900,700))
            self.assertEqual(len(r["edge_tiles"]), 4)

    def test_exact_direct_original_matches_approved_file(self):
        page = "https://commons.wikimedia.org/wiki/File:Ecce_Homo,_PDUT1439.jpg"
        r = qa.exact_original_info(qa.commons_title(page))
        self.assertEqual(r["url"], "https://upload.wikimedia.org/wikipedia/commons/3/38/Ecce_Homo,_PDUT1439.jpg")
        self.assertEqual(r["size"], 0)

    def test_encoded_file_colon_is_supported(self):
        page = "https://commons.wikimedia.org/wiki/File%3AAnnibale_Carracci_Adorazione_dei_Pastori_Orleans.png"
        r = qa.exact_original_info(qa.commons_title(page))
        self.assertIn("/5/5a/Annibale_Carracci_Adorazione_dei_Pastori_Orleans.png", r["url"])

    def test_direct_recovery_fails_closed(self):
        manifest = {"candidates": [{"approved_record_index": 264, "title": "Test",
                                    "artist": "Test", "commons_file":
                                    "https://commons.wikimedia.org/wiki/File:Ecce_Homo,_PDUT1439.jpg"}]}
        with tempfile.TemporaryDirectory() as folder:
            with patch.object(qa, "get_bytes", side_effect=ValueError("HTTP 429")):
                report = qa.process(manifest, pathlib.Path(folder), 1, direct_recovery=True)
            self.assertEqual(report["items"][0]["status"], "HELD")
            self.assertEqual(report["items"][0]["source_mode"], "DIRECT_APPROVED_TITLE_NO_LICENSE_METADATA")
            self.assertFalse(report["rights_cleared_by_qa"])

    def test_unavailable_original_is_held(self):
        manifest = {"candidates": [{"approved_record_index": 1, "title": "Test",
                                    "artist": "Known", "commons_file":
                                    "https://commons.wikimedia.org/wiki/File:Test.jpg"}]}
        with tempfile.TemporaryDirectory() as folder:
            with patch.object(qa, "fetch_info", side_effect=OSError("blocked")):
                report = qa.process(manifest, pathlib.Path(folder), 1)
            self.assertEqual(report["items"][0]["status"], "HELD")
            self.assertFalse(report["publication"])
            self.assertTrue((pathlib.Path(folder) / "review.html").exists())

if __name__ == "__main__":
    unittest.main()
