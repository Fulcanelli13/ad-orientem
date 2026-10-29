#!/usr/bin/env python3
"""Contract tests: one worldwide bulk review; no original downloads/publication."""
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

path=Path(__file__).resolve().parents[1]/"tools/directory/build-p84-worldwide-bulk-photo-review.py"
spec=importlib.util.spec_from_file_location("directory_p84_review",path)
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

def row(n):
    return {
        "physical_anchor_id":"RG-"+format(n,"012X"),
        "country":"FR" if n%2 else "US",
        "place_name":"Église "+str(n),
        "place_city_hint":"Paris" if n%2 else "New York",
        "file_title":"File:Church "+str(n)+".jpg",
        "source_url":"https://commons.wikimedia.org/wiki/File:Church_"+str(n)+".jpg",
        "preview_url":"https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Church.jpg/640px-Church.jpg",
        "screening_disposition":"REVIEW_QUEUE_LOCALITY_AND_NAME_RESEARCH_ONLY",
        "rights_metadata_status":"SOURCE_CLAIM_CC_BY_SA_4_REQUIRES_VERIFICATION",
        "same_original_multiple_site_ids":False,
        "original_sha1_claim":"a"*40,
        "publication":mod.HOLD,
        "published":False,
        "exact_site_verified":False,
        "rights_independently_cleared":False,
        "original_bytes_verified":False,
    }
def summary(count):
    return {"schema":mod.SCHEMA,"anchors_accounted":2579,"countries":76,
            "approved_photos":0,"rights_cleared":0,"published_photos":0,
            "original_photos_downloaded":0,"review_queue_assignments":count}
class ReviewTests(unittest.TestCase):
    def save(self,dir,rows,meta=None):
        q=dir/"input.jsonl";s=dir/"summary.json"
        q.write_text("".join(json.dumps(r,ensure_ascii=False)+"\n" for r in rows))
        s.write_text(json.dumps(meta if meta is not None else summary(len(rows))))
        return q,s
    def test_501_candidates_one_interface_and_paged_at_250_500(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);q,s=self.save(root,[row(n) for n in range(501)])
            output=root/"review.html"
            rows=mod.build(q,s,output)
            self.assertEqual(len(rows),501)
            html=output.read_text()
            self.assertIn('value="250"',html)
            self.assertIn('value="500"',html)
            self.assertIn("source_leads",html)
            self.assertIn("photos_approved:0",html)
            self.assertIn("Keep for verification",html)
            self.assertIn('p84-'+mod.hashlib.sha256(("RG-000000000000\0File:Church 0.jpg").encode()).hexdigest()[:20],html)
            self.assertNotIn("__DATA__",html)
            self.assertNotIn("__SOURCE_SHA__",html)
            with self.assertRaisesRegex(ValueError,"overwrite"):
                mod.build(q,s,output)
    def test_unsafe_markup_escaped_not_executable(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);r=row(0);r["place_name"]="</script><script>alert(1)</script>"
            q,s=self.save(root,[r])
            output=root/"review.html";mod.build(q,s,output)
            content=output.read_text()
            self.assertNotIn("</script><script>alert(1)</script>",content)
            self.assertIn(r"\u003c/script",content)
    def test_fail_closed_on_approved_image_or_schema_or_duplicate(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);r=row(0);r["rights_independently_cleared"]=True
            q,s=self.save(root,[r])
            with self.assertRaisesRegex(ValueError,"Unsafe"):mod.build(q,s,root/"wrong.html")
            r["rights_independently_cleared"]=False
            q,s=self.save(root,[r,r])
            with self.assertRaisesRegex(ValueError,"Duplicate"):mod.build(q,s,root/"wrong2.html")
            q,s=self.save(root,[row(0)],{**summary(1),"approved_photos":1})
            with self.assertRaisesRegex(ValueError,"Incorrect"):mod.build(q,s,root/"wrong3.html")
    def test_commons_url_allowlist_and_non_url_fallback(self):
        title="File:Notre Dame.jpg"
        safe=mod.url("https://commons.wikimedia.org/wiki/File:Notre_Dame.jpg",title)
        self.assertEqual(safe,"https://commons.wikimedia.org/wiki/File:Notre_Dame.jpg")
        self.assertTrue(mod.url("https://evil.example/evil",title).startswith("https://commons.wikimedia.org/"))
        self.assertTrue(mod.thumb("javascript:alert(1)",title).startswith("https://commons.wikimedia.org/"))
if __name__=="__main__":unittest.main()
