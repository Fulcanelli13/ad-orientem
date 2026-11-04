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
