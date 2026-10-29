#!/usr/bin/env python3
"""P87 offline, original-byte-safe 385-image preview and review contracts."""
import hashlib,importlib.util,io,json,pathlib,tempfile,unittest,zipfile
from PIL import Image,ImageDraw

ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("p87",ROOT/"tools/directory/p87-worldwide-385-visual-preview-qa.py")
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)

def row(i):
    return {"physical_anchor_id":"RG-%012X"%(1+i%183),
        "country":"FR" if i<180 else "US","place_name":"Church exact site "+str(i%183),
        "place_city_hint":"Lyon","file_title":"File:P87 source photo %03d.jpg"%i,
        "source_url":"https://commons.wikimedia.org/wiki/File:P87_source_photo_%03d.jpg"%i,
        "preview_url":"https://upload.wikimedia.org/some-thumb.jpg",
        "screening_disposition":"REVIEW_QUEUE_LOCALITY_AND_NAME_CORROBORATED",
        "rights_metadata_status":"SUPPORTED_LICENSE_METADATA_CLAIM_NOT_INDEPENDENTLY_CLEARED",
        "original_sha1_claim":"%040x"%(i+1),
        "commons_page_id":11000+i,
        "exact_site_verified":False,"rights_independently_cleared":False,
        "original_bytes_verified":False,"published":False,
        "publication":m.HOLD}

def inputs(root):
    src=root/"research-queue.jsonl";rows=[row(i) for i in range(385)]
    src.write_text("".join(json.dumps(v)+"\n" for v in rows),encoding="utf8")
    m.P86_QUEUE_SHA=m.sha(src)
    audit={"schema":m.P86_SCHEMA,"review_source_queue_sha256":m.sha(src),
        "one_final_reviewer_candidates":385,"original_p83_reviewer_candidates":301,
        "p85_research_candidates_recovered":84,"p85_remaining_source_holds":7316,
        "original_image_bytes_downloaded":0,"subject_verified":0,
        "rights_approved":0,"photos_published":0}
    (root/"audit.json").write_text(json.dumps(audit),encoding="utf8")
    reviewer={**audit,"schema":"AO_P83_GLOBAL_PHOTO_PREVIEW_SCREEN_V1",
        "anchors_accounted":2579,"countries":76,"approved_photos":0,
        "rights_cleared":0,"published_photos":0,"original_photos_downloaded":0,
        "review_queue_assignments":385}
    (root/"reviewer-input.json").write_text(json.dumps(reviewer),encoding="utf8")
    return src,root/"audit.json"

def page(r):
    return {"title":r["file_title"],"pageid":r["commons_page_id"],
       "imageinfo":[{"sha1":r["original_sha1_claim"],"width":2000,"height":1600,
       "size":1500000,"mime":"image/jpeg",
       "thumburl":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1/file.jpg/480px-file.jpg"}]}

def img_bytes():
    im=Image.new("RGB",(280,190),(90,110,140))
    d=ImageDraw.Draw(im)
    for i in range(0,250,13):
        d.line([(i,4),(i+15,179)],fill=(240,180,140),width=3)
    b=io.BytesIO();im.save(b,format="JPEG");return b.getvalue()

class P87Tests(unittest.TestCase):
    def test_image_quality_and_genuine_preview_bytes(self):
        preview,qa=m.make_preview(img_bytes())
        self.assertEqual(qa["preview_derivative_sha256"],hashlib.sha256(preview).hexdigest())
        self.assertTrue(preview.startswith(b"RIFF"))
        self.assertGreater(qa["preview_width"],150)
        self.assertEqual(m.hamming(qa["dhash"],qa["dhash"]),0)
        with self.assertRaises(ValueError):
            m.make_preview(b"<html>not an image</html>")
    def test_source_revision_and_host_fail_closed(self):
        r=row(5)
        metadata,hold=m.source_check(page(r),r)
        self.assertIsNone(hold)
        self.assertEqual(metadata["current_original_sha1"],r["original_sha1_claim"])
        changed=page(r);changed["imageinfo"][0]["sha1"]="a"*40
        self.assertEqual(m.source_check(changed,r)[1],"HOLD_SOURCE_SHA1_REVISION_CHANGED")
        changed=page(r);changed["imageinfo"][0]["thumburl"]="https://example.com/private.jpg"
        self.assertEqual(m.source_check(changed,r)[1],"HOLD_NO_TRUSTED_THUMBNAIL_URL")
        with self.assertRaises(ValueError):m.checked_url("http://upload.wikimedia.org/test",{"upload.wikimedia.org"})
    def test_complete_385_three_shards_one_offline_html_review(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=pathlib.Path(tmp);q,a=inputs(root)
            rows,_=m.lineage(q,a)
            self.assertEqual(len(rows),385)
            index={m.canon(r["file_title"]):r for r in rows}
            def mocked_pages(titles):
                return {m.canon(t):page(index[m.canon(t)]) for t in titles},None
            def mocked_preview(url):
                return img_bytes(),None
            original_sleep=m.time.sleep
            m.time.sleep=lambda x:None
            try:
                shards=root/"transport";shards.mkdir()
                for s in range(3):
                    result=m.run_shard(q,a,shards/f"shard-{s}",s,.2,mocked_pages,mocked_preview)
                    self.assertEqual(result["previews_captured"],len([v for i,v in enumerate(rows) if i%3==s]))
            finally:m.time.sleep=original_sleep
            result=m.consolidate(q,a,shards,root/"full")
            self.assertEqual(result["previews_captured"],385)
            self.assertEqual(result["review_site_ids"],183)
            self.assertEqual(result["photos_published"],0)
            self.assertEqual(result["rights_cleared"],0)
            self.assertEqual(result["original_image_bytes_downloaded"],0)
            self.assertEqual(len(list((root/"full/thumbs").glob("*.webp"))),385)
            self.assertEqual(len(list((root/"full/contact-sheets").glob("*.jpg"))),9)
            with zipfile.ZipFile(root/"full.zip") as z:
                names=z.namelist()
                self.assertIn("index.html",names)
                self.assertEqual(len([n for n in names if n.startswith("thumbs/")]),385)
                page_html=z.read("index.html").decode()
                self.assertIn("One worldwide photo review",page_html)
                self.assertIn("Export complete review JSON",page_html)
                self.assertIn("ao-worldwide-directory-photo-p84-review",page_html)
            with self.assertRaisesRegex(ValueError,"overwrite"):
                m.consolidate(q,a,shards,root/"full")
    def test_unsafe_synthetic_queue_blocked(self):
        with tempfile.TemporaryDirectory() as td:
            root=pathlib.Path(td);q,a=inputs(root)
            rows=[json.loads(s) for s in q.read_text().splitlines()]
            rows[0]["published"]=True
            q.write_text("".join(json.dumps(r)+"\n" for r in rows))
            m.P86_QUEUE_SHA=m.sha(q)
            meta=json.loads(a.read_text());meta["review_source_queue_sha256"]=m.sha(q)
            a.write_text(json.dumps(meta))
            with self.assertRaisesRegex(ValueError,"Previously approved"):
                m.lineage(q,a)
if __name__=="__main__":unittest.main()
