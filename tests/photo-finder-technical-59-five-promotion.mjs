import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const rel="data/geography/research/photo-finder-20261030/releases/";
const m=read(rel+"technical-59-five-original-cover-promotion-20261102.v1.json");
const report=read(m.source_report),old=read(rel+"sacred-atlas-530-cover-closure-106-v1.json");
const next=read(rel+"sacred-atlas-530-cover-closure-101-v2.json");
const media=read("data/geography/approved-place-media.v1.json");
const gallery=read("data/geography/approved-place-gallery.v1.json");
const chosen=read("data/geography/research/photo-finder-20261030/decisions.json").decisions;
assert.equal(m.schema,"AO_PHOTO_FINDER_TECHNICAL59_FIVE_PRESERVED_COVERS_PROMOTION_V1");
assert.deepEqual([m.prior_approved,m.proposed_approved,m.images.length,m.previous_approved_keep.length],[307,312,5,307]);
assert.deepEqual([report.exact_first_choice_attempted,report.verified_research_only,report.held],[59,5,54]);
assert.ok(media.items.length>=312);
assert.ok(gallery.items.length>=35);
assert.equal(new Set(media.items.map(x=>x.place_id)).size,media.items.length);
const byId=new Map(media.items.map(x=>[x.place_id,x]));
const fp=x=>({place_id:x.place_id,asset_path:x.asset_path,source_sha1:x.source_sha1,derivative_sha256:x.derivative_sha256,credit:x.credit,license:x.license});
for(const old of m.previous_approved_keep)assert.deepEqual(fp(byId.get(old.place_id)),old,"An existing approved photo was replaced");
const source=new Map(report.staged.map(s=>[s.item.place_id,s]));
for(const entry of m.images){
  const got=byId.get(entry.place_id),staged=source.get(entry.place_id);
  assert.ok(got&&staged);
  assert.deepEqual(got,staged.item,"Release does not match source-verified original");
  assert.equal(decodeURIComponent(got.source_url.replace("https://commons.wikimedia.org/wiki/","")).replaceAll("_"," "),chosen[entry.place_id].files[0]);
  assert.ok(got.rights_verified&&got.subject_verified&&got.crop_reviewed);
  const raw=readFileSync(new URL("../"+got.asset_path,import.meta.url));
  assert.equal(raw.length,entry.bytes);
  assert.equal(createHash("sha256").update(raw).digest("hex"),entry.derivative_sha256);
}
assert.ok(!byId.has("place:CU:el-cobre-caridad-basilica"));
assert.equal(next.schema,"AO_SACRED_ATLAS_530_PLACE_COVER_CLOSEOUT_V2");
assert.deepEqual([old.items.length,next.items.length,next.chosen_pending,next.approved_cover_count],[106,101,101,312]);
assert.deepEqual(next.counts_by_disposition,{author_attribution:4,licence_verification:30,source_identity_hold:2,source_metadata_mismatch:25,source_size_format:26,unverified_public_domain_claim:13,visual_watermark_hold:1});
const remaining=new Set(next.items.map(x=>x.place_id));
for(const x of m.images)assert.ok(!remaining.has(x.place_id));
for(const row of next.items)assert.equal(chosen[row.place_id].files[0],row.selected_file);
const html=readFileSync(new URL("../docs/research/directory/p79-canonical-place-photo-review.html",import.meta.url),"utf8");
const snapshot=JSON.parse(html.match(/const SOURCE=(\{.*\});\nconst STORAGE=/)[1]);
if(media.items.length===312){
 assert.equal(snapshot.approved_photo_places,312);
 assert.equal(snapshot.unapproved_site_count,32);
 assert.equal(snapshot.sites.find(x=>x.id==="place:BE:beauraing")?.approved,true);
}
assert.ok(m.no_alt_photo_selection&&m.no_old_approved_cover_replaced&&m.no_gallery_changes&&m.no_new_external_photo_download);
console.log("PASS original five-source promotion: 307→312, 101 frozen holds, all prior media preserved");
