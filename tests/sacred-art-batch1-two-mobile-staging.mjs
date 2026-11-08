import assert from "node:assert/strict";
import {existsSync,readFileSync,statSync} from "node:fs";
const path=p=>new URL("../"+p,import.meta.url);
const read=p=>JSON.parse(readFileSync(path(p),"utf8"));
const m=read("data/artwork/batch1-two-mobile-staging.v1.json");
const locked=read("data/artwork/batch1-two-firstparty-verified-source-photos.v1.json");
assert.equal(m.no_publication,true);
assert.equal(m.explicit_owner_photo_approval,false);
assert.equal(m.actual_app_assignments_changed,0);
assert.equal(m.derivative_rule,"PRESERVE_FULL_PAINTED_FRAME_WITH_NO_CROP");
assert.equal(m.output_folder,"assets/staged/sacred-art-batch1");
assert.equal(m.items.length,2);
assert.equal(locked.counts.source_jpegs_sha256_verified,2);
assert.equal(locked.counts.newly_published_paintings,0);
const original=new Map(locked.original_files.map(x=>[x.queue_id,x]));
for(const x of m.items){
 const q=original.get(x.id);
 assert.ok(q);
 assert.equal(q.sha256,x.source_sha256);
 assert.deepEqual([q.width,q.height],x.original_dimensions_px);
 assert.equal(x.user_selected_this_photographic_version,false);
 assert.equal(x.publication_approved,false);
}
const resultPath="data/artwork/batch1-two-mobile-staging-output.v1.json";
if(existsSync(path(resultPath))){
 const staged=read(resultPath);
 assert.equal(staged.release_count,0);
 assert.equal(staged.publication_approved,false);
 assert.equal(staged.paintings.length,2);
 for(const a of staged.paintings){
  assert.ok(a.image_path.startsWith("assets/staged/sacred-art-batch1/"));
  assert.equal(a.crop_applied,false);
  assert.equal(a.full_frame_preserved,true);
  assert.equal(a.release_approved,false);
  assert.equal(a.owner_photo_selected,false);
  assert.ok(existsSync(path(a.image_path)));
  assert.ok(statSync(path(a.image_path)).size>5000);
 }
}
console.log("PASS: two hash-pinned open-access originals, full-scene WebP staging only; zero newly released photos.");
