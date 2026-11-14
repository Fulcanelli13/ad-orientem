import io, pathlib, sys, tempfile, unittest
from unittest.mock import patch
from PIL import Image
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "tools" / "artwork"))
import lyon_stage_two_museum_originals as q

class SourceTests(unittest.TestCase):
    def test_reject_non_museum_origins(self):
        self.assertTrue(q.exact_allowed(q.SOURCES[0]["url"]))
        for url in ("http://www.mba-lyon.fr/sites/mba/files/content/medias/images/a.jpg",
                    "https://evil.test/sites/mba/files/content/medias/images/a.jpg",
                    "https://www.mba-lyon.fr/admin/private.jpg"):
            self.assertFalse(q.exact_allowed(url))
    
    def test_whole_image_preserved_and_unpublished(self):
        canvas = Image.new("RGB", (1080, 720), (88, 58, 39))
        data = io.BytesIO()
        canvas.save(data, format="JPEG")
        with tempfile.TemporaryDirectory() as folder:
            out = pathlib.Path(folder)
            r = q.inspect(data.getvalue(), 372, out)
            self.assertEqual((r["width"],r["height"]), (1080,720))
            self.assertFalse(r["automatic_crop"])
            self.assertFalse(r["publication"])
            with Image.open(out / r["preview_file"]) as i:
                self.assertEqual(i.size, (1080,720))
            self.assertEqual(len(r["edge_detail_files"]), 4)

    def test_failed_download_is_held(self):
        with tempfile.TemporaryDirectory() as folder:
            with patch.object(q,"fetch_exact", side_effect=OSError("blocked")):
                report = q.run(pathlib.Path(folder))
            self.assertEqual(len(report["items"]),2)
            self.assertTrue(all(x["status"]=="HELD" for x in report["items"]))
            self.assertFalse(report["publication"])
            self.assertFalse(report["app_license_final"])

if __name__ == "__main__":
    unittest.main()
