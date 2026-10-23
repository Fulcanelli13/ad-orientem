import json, pathlib, sys, unittest
ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT/'scripts'/'research'))
from sacred_art_acquire import license_ok, safe_url

class AcquisitionContract(unittest.TestCase):
    def test_manifest_identity(self):
        m = json.loads((ROOT/'data'/'research'/'sacred-art-b20-wave150.manifest.json').read_text())
        rows = m['records']
        self.assertEqual(len(rows),150)
        self.assertEqual(len({r['asset_source_id'] for r in rows}),150)
        self.assertEqual(sum(r['api_type']=='commons' for r in rows),107)
        self.assertEqual(sum(r['download_gate']=='MANUAL_HOLD' for r in rows),3)
        self.assertEqual(sum(r['download_gate']=='SKIP_PREVIOUSLY_ACQUIRED' for r in rows),9)
        self.assertTrue(all(r['source_url'].startswith('https://') for r in rows))
    def test_restrictive_licences_not_auto_acquired(self):
        for name in ['CC0', 'CC BY 4.0', 'CC BY-SA 4.0', 'Public domain']:
            self.assertTrue(license_ok(name),name)
        for name in ['CC BY-NC 4.0', 'CC BY-ND 4.0', 'CC BY-NC-SA 4.0', 'Copyrighted', 'All rights reserved']:
            self.assertFalse(license_ok(name),name)
    def test_source_image_hosts(self):
        self.assertEqual(safe_url('https://upload.wikimedia.org/wikipedia/commons/a/a1/image.jpg'),'https://upload.wikimedia.org/wikipedia/commons/a/a1/image.jpg')
        for u in ['http://upload.wikimedia.org/x.jpg', 'https://example.com/x.jpg']:
            with self.assertRaises(ValueError): safe_url(u)
if __name__=='__main__':unittest.main()
