#!/usr/bin/env python3
"""P84 offline end-to-end synthetic 2579-identity / 8-shard review acceptance."""
import importlib.util, json, pathlib, tempfile, unittest
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("p84",ROOT/"tools/directory/p84-worldwide-preview-review.py")
p84=importlib.util.module_from_spec(spec);spec.loader.exec_module(p84)

def candidate(i):
    return {"physical_anchor_id":"RG-P84-%04d"%i,"place_name":"Chapelle Saint-Joseph %d"%i,
            "country":"FR","place_city_hint":"lyon","file_title":"File:P84 sample %d.jpg"%i,
            "original_sha1_claim":"%040x"%(i+1),"commons_page_id":100+i,
            "source_url":"https://commons.wikimedia.org/wiki/File:P84_sample_%d.jpg"%i,
            "preview_url":"https://upload.wikimedia.org/example.jpg",
            "screening_disposition":"REVIEW_QUEUE_LOCALITY_AND_NAME_CORROBORATED",
            "rights_metadata_status":"SUPPORTED_LICENSE_METADATA_CLAIM_NOT_INDEPENDENTLY_CLEARED",
            "published":False,"rights_independently_cleared":False,
            "exact_site_verified":False,"original_bytes_verified":False,
            "publication":p84.HOLD}

def source_page(r,wrong=False):
    return {"title":r["file_title"],"pageid":r["commons_page_id"],
      "imageinfo":[{"sha1":("f"*40 if wrong else r["original_sha1_claim"]),
        "mime":"image/jpeg","width":1200,"height":900,"size":120000,
        "url":"https://upload.wikimedia.org/wikipedia/commons/example.jpg",
        "thumburl":"https://thumb.wikimedia.org/ok.jpg",
        "extmetadata":{"LicenseShortName":{"value":"CC BY-SA 4.0"},
            "LicenseUrl":{"value":"https://creativecommons.org/licenses/by-sa/4.0"},
            "Artist":{"value":"Test photographer"}}}]}

def fixture(root,size):
    summary={"schema":"AO_P83_GLOBAL_PHOTO_PREVIEW_SCREEN_V1",
       "anchors_accounted":2579,"countries":76,"approved_photos":0,
       "rights_cleared":0,"original_photos_downloaded":0,
       "published_photos":0,"review_queue_assignments":size,
       "held_assignments":5231}
    queue=root/"p83-queue.jsonl"
    queue.write_text("".join(json.dumps(candidate(i))+"\n" for i in range(size)),encoding="utf8")
    path=root/"p83-summary.json"
    path.write_text(json.dumps(summary),encoding="utf8")
    return queue,path

class P84Contracts(unittest.TestCase):
    def test_current_source_and_original_sha_gate(self):
        r=candidate(0)
        item,meta=p84.verify_metadata(r,source_page(r))
        self.assertIn("ELIGIBLE",meta["source_meta_status"])
        self.assertEqual(meta["license"],"CC BY SA 4.0")
        with self.assertRaisesRegex(ValueError,"SHA1"):
            p84.verify_metadata(r,source_page(r,wrong=True))
        bad=source_page(r)
        bad["imageinfo"][0]["extmetadata"]["LicenseShortName"]["value"]="CC BY-NC 4.0"
        with self.assertRaisesRegex(ValueError,"LICENSE"):
            p84.verify_metadata(r,bad)

    def test_complete_8_shard_review_and_no_publication(self):
        with tempfile.TemporaryDirectory() as d:
            root=pathlib.Path(d);queue,summary=fixture(root,19)
            def fake_query(rows):
                return {r["source_file"]:source_page({"file_title":r["source_file"],
                     "original_sha1_claim":next(x["original_sha1_claim"] for x in records if x["file_title"]==r["source_file"]),
                     "commons_page_id":next(x["commons_page_id"] for x in records if x["file_title"]==r["source_file"])})
                     for r in rows}
            records=[candidate(i) for i in range(19)]
            for shard in range(8):
                p84.worker(queue,summary,root/("part-"+str(shard)),shard,delay=0,
                  query=fake_query,thumb_loader=lambda info:Image.new("RGB",(520,320)))
            combined=root/"combined"
            combined.mkdir()
            for part in root.glob("part-*"):
                for f in part.rglob("*"):
                    if f.is_file():
                        target=combined/f.relative_to(part);target.parent.mkdir(parents=True,exist_ok=True)
                        self.assertFalse(target.exists())
                        target.write_bytes(f.read_bytes())
            result=p84.consolidate(queue,summary,combined,root/"output")
            self.assertEqual(result["source_screened_assignments"],19)
            self.assertEqual(result["preview_verified"],19)
            self.assertEqual(result["photo_publications"],0)
            self.assertEqual(result["original_bytes_downloaded"],0)
            html=(root/"output/index.html").read_text()
            self.assertIn("Previous 250",html)
            self.assertIn("Export one decisions JSON",html)
            self.assertIn("RG-P84-0000",html)
            self.assertTrue((root/"output/previews/p84-00001.jpg").exists())
            self.assertTrue((root/"output/contact-sheets/p84-contact-000.jpg").exists())
            with self.assertRaisesRegex(ValueError,"overwrite"):
                p84.consolidate(queue,summary,combined,root/"output")

    def test_must_not_drop_or_reassign_source(self):
        with tempfile.TemporaryDirectory() as d:
            root=pathlib.Path(d);queue,summary=fixture(root,501)
            rows,data=p84.queue_rows(queue,summary)
            self.assertEqual(len(rows),501)
            self.assertEqual(sum(i%8==0 for i in range(501)),63)
            self.assertEqual(data["anchors_accounted"],2579)
            with queue.open("a") as f:f.write(json.dumps(candidate(0))+"\n")
            with self.assertRaisesRegex(ValueError,"mismatch"):
                p84.queue_rows(queue,summary)

if __name__=="__main__":unittest.main()
