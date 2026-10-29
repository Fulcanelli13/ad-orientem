#!/usr/bin/env python3
"""P86: 301+recovered world review stays one P84 renderer and zero approvals."""
import importlib.util,hashlib,json,pathlib,tempfile,unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("p86",ROOT/"tools/directory/p86-consolidate-one-worldwide-photo-review.py")
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)

def candidate(n,held=False):
    return {"physical_anchor_id":"RG-%012X"%(1+n%2579),
      "country":"FR" if n%2 else "US","place_name":"Chapelle Saint Pierre "+str(n),
      "place_city_hint":"Paris","file_title":"File:P86 photography %d.jpg"%n,
      "source_url":"https://commons.wikimedia.org/wiki/File:P86_photography_%d.jpg"%n,
      "preview_url":"https://upload.wikimedia.org/wikipedia/commons/thumb/x/ok.jpg",
      "original_sha1_claim":"%040x"%(n+1),
      "rights_metadata_status":"SUPPORTED_LICENSE_METADATA_CLAIM_NOT_INDEPENDENTLY_CLEARED",
      "screening_disposition":"HOLD_NO_EXACT_SITE_GEO_OR_LOCALITY_CORROBORATION" if held
          else "REVIEW_QUEUE_LOCALITY_AND_NAME_CORROBORATED",
      "rights_independently_cleared":False,"original_bytes_verified":False,
      "exact_site_verified":False,"published":False,"publication":m.HOLD}

def dump(path,rows):
    with path.open("w") as f:
        for r in rows:f.write(json.dumps(r)+"\n")
def setup(root,recovered=2):
    p83=root/"p83";p85=root/"p85";p83.mkdir();p85.mkdir()
    old=[candidate(i) for i in range(301)]
    held=[candidate(i,True) for i in range(301,7701)]
    dump(p83/"p83-source-screened-preview-queue.jsonl",old)
    dump(p83/"p83-holds-for-later-source-work.jsonl",held)
    original={"schema":m.P83_SCHEMA,"anchors_accounted":2579,"countries":76,
      "photo_source_assignments":7701,"held_assignments":7400,"review_queue_assignments":301,
      "published_photos":0,"approved_photos":0,"rights_cleared":0,
      "original_photos_downloaded":0}
    (p83/"p83-worldwide-summary.json").write_text(json.dumps(original))
    recovered_rows=[]
    for r in held[:recovered]:
        rec={**r,"p85_disposition":"RECOVERED_FOR_RESEARCH_REVIEW_GEO_UNIQUE_NOT_APPROVED",
            "rights_approved":False,
            "source_check":{"source_status":"CURRENT_COMMONS_METADATA_RETRIEVED",
              "current_original_sha1":r["original_sha1_claim"],
              "thumbnail_url":"https://upload.wikimedia.org/wikipedia/commons/thumb/x/ok.jpg",
              "current_rights_metadata_claim":{"label":"CC BY-SA 4.0"}}}
        recovered_rows.append(rec)
    remaining=[{**r,"p85_disposition":"HOLD_EXACT_BUILDING_IDENTITY_STILL_UNCORROBORATED",
       "rights_approved":False} for r in held[recovered:]]
    dump(p85/"p85-new-research-review-candidates.jsonl",recovered_rows)
    dump(p85/"p85-holds-still-open.jsonl",remaining)
    summary={"schema":m.P85_SCHEMA,"p83_original_anchors":2579,
      "p83_original_assignments":7701,"p83_existing_research_review":301,
      "p85_original_held_assignments":7400,"all_holds_accounted":7400,
      "p85_new_research_review_candidates":recovered,
      "p85_assignments_still_held":7400-recovered,
      "p83_source_summary_sha256":m.digest(p83/"p83-worldwide-summary.json"),
      "images_approved":0,"photos_published":0,"rights_cleared":0,
      "original_bytes_downloaded":0}
    (p85/"p85-global-audit.json").write_text(json.dumps(summary))
    return p83,p85

class P86Tests(unittest.TestCase):
    def test_whole_7701_link_one_303_candidate_review_and_no_publication(self):
        with tempfile.TemporaryDirectory() as td:
            root=pathlib.Path(td);p83,p85=setup(root)
            result=m.build(p83,p85,root/"final")
            self.assertEqual(result["one_final_reviewer_candidates"],303)
            self.assertEqual(result["p85_held_rechecked"],7400)
            self.assertEqual(result["p85_remaining_source_holds"],7398)
            self.assertEqual(result["photos_published"],0)
            self.assertEqual(result["subject_verified"],0)
            html=(root/"final/index.html").read_text()
            self.assertIn("One final worldwide photo review",html)
            self.assertIn('value="250"',html)
            self.assertIn('value="500"',html)
            self.assertIn("Export complete review JSON",html)
            self.assertEqual(html.count("<script>"),1)
            self.assertTrue((root/"final/p86-one-worldwide-editorial-queue.jsonl").is_file())
            self.assertEqual(len(m.records(root/"final/p86-one-worldwide-editorial-queue.jsonl")),303)
            with self.assertRaisesRegex(ValueError,"already archived"):
                m.build(p83,p85,root/"final")
    def test_fails_if_p85_candidate_is_published(self):
        with tempfile.TemporaryDirectory() as td:
            root=pathlib.Path(td);p83,p85=setup(root)
            rows=m.records(p85/"p85-new-research-review-candidates.jsonl")
            rows[0]["published"]=True
            dump(p85/"p85-new-research-review-candidates.jsonl",rows)
            with self.assertRaisesRegex(ValueError,"Unsafe P85"):
                m.build(p83,p85,root/"wrong")
    def test_fails_if_any_source_hold_missing(self):
        with tempfile.TemporaryDirectory() as td:
            root=pathlib.Path(td);p83,p85=setup(root)
            rows=m.records(p85/"p85-holds-still-open.jsonl")
            dump(p85/"p85-holds-still-open.jsonl",rows[:-1])
            with self.assertRaisesRegex(ValueError,"populations"):
                m.build(p83,p85,root/"wrong")
if __name__=="__main__":unittest.main()
