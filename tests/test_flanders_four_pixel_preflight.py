import io, json, pathlib, sys, tempfile, unittest
from unittest.mock import patch
from PIL import Image
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parents[1]/"tools"/"artwork"))
import flanders_four_pixel_preflight as q

class FlandersPreflightTest(unittest.TestCase):
    def test_only_exact_commons_file_pages(self):
        u="https://commons.wikimedia.org/wiki/File:Twee_meisjes_als_de_heiligen_Agnes_en_Dorothea_Michaelina_Wautier_KMSKA_599.jpg"
        self.assertIn("upload.wikimedia.org/wikipedia/commons/",q.exact_commons_original(u))
        for bad in ("https://evil.test/wiki/File:Bad.jpg","http://commons.wikimedia.org/wiki/File:Bad.jpg",
                    "https://commons.wikimedia.org/wiki/Category:Paintings"):
            with self.assertRaises(ValueError):
                q.exact_commons_original(bad)

    def test_iiif_requires_official_exact_service(self):
        manifest={"items":[{"items":[{"items":[{"body":{"id":"https://imagehub.mskgent.be/iiif/3/6361/full/max/0/default.jpg",
            "service":[{"id":"https://imagehub.mskgent.be/iiif/3/6361"}]}}]}]}]}
        with patch.object(q,"network_get",return_value=json.dumps(manifest).encode()):
            img=q.iiif_image_source("https://imagehub.mskgent.be/iiif/3/6361/manifest.json")
        self.assertEqual(img,"https://imagehub.mskgent.be/iiif/3/6361/full/!4400,4400/0/default.jpg")
        with self.assertRaises(ValueError):
            q.iiif_image_source("https://other.test/iiif/3/6361/manifest.json")

    def test_whole_canvas_preserved_no_publication(self):
        im=Image.new("RGB",(950,720),(39,52,67))
        bio=io.BytesIO(); im.save(bio,format="JPEG")
        with tempfile.TemporaryDirectory() as td:
            d=pathlib.Path(td)
            proof=q.image_proof(bio.getvalue(),d,"test")
            self.assertEqual(proof["pixels"],[950,720])
            self.assertFalse(proof["crop_applied"])
            self.assertFalse(proof["publication"])
            self.assertFalse(proof["best_image_certified"])
            self.assertEqual(len(proof["edge_details"]),4)
            with Image.open(d/proof["preview"]) as preview:
                self.assertEqual(preview.size,(950,720))

    def test_fail_closed_on_network_error(self):
        m={"works":[{"approvedRecordIndex":248,"title":"St Francis","artist":"Rubens",
            "accession":"S-9","museum":"MSK","rightsEvidence":"public domain",
            "sources":[{"kind":"IIIF3_MANIFEST",
              "url":"https://imagehub.mskgent.be/iiif/3/6361/manifest.json","label":"Official"}]}]}
        with tempfile.TemporaryDirectory() as td:
            with patch.object(q,"iiif_image_source",side_effect=ValueError("not reachable")):
                r=q.run(m,pathlib.Path(td))
            self.assertEqual(r["sources"][0]["status"],"HELD")
            self.assertFalse(r["publication"])
            self.assertFalse(r["rights_verified_by_download"])
            self.assertTrue((pathlib.Path(td)/"report.json").exists())

if __name__=="__main__": unittest.main()
