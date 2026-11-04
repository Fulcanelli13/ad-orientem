import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const get=p=>JSON.parse(readFileSync(p,"utf8"));
const ledger=get("data/geography/research/sacred-atlas-r32-33place-source-closure-20261105.v1.json");
const source=get("data/geography/research/sacred-atlas-r26-43remaining-source-lead-triage-20261104.v1.json");
const current=get("data/geography/research/sacred-atlas-r31-undecided43-bulk-image-review-20261105.v1.json");
const old19=get("data/geography/research/sacred-atlas-r28-owner-approved19-source-lock-20261104.v1.json");
const media=get("data/geography/approved-place-media.v1.json");
assert.equal(ledger.schema,"AO_SACRED_ATLAS_R32_REMAINING33_SOURCE_PAGE_RECOVERY_V1");
assert.equal(ledger.date,"2026-11-05");
assert.equal(ledger.original33_ids.length,33);
assert.equal(new Set(ledger.original33_ids).size,33);
assert.equal(source.rows.length,43);
assert.equal(current.places.length,43);
const originalNoPhotoIds=source.rows.filter(x=>x.work_group==="PRIMARY_CUSTODIAN_SOURCE_RIGHTS_UNKNOWN"||x.work_group==="ARCHITECTURAL_FREEDOM_OF_PANORAMA_HOLD"||x.work_group==="NEARBY_GEOTAGGED_IMAGES_NOT_SITE_VERIFIED"||x.work_group==="NO_VETTED_EXACT_FILE_LEAD").map(x=>x.place_id);
assert.deepEqual([...ledger.original33_ids].sort(),originalNoPhotoIds.sort());
assert.equal(ledger.new_file_records.length,10);
assert.equal(ledger.counts.new_cover_candidates,2);
assert.equal(ledger.counts.new_context_images,8);
assert.equal(ledger.counts.new_cover_choice_sites,2);
assert.equal(ledger.counts.new_context_only_sites,4);
assert.equal(ledger.counts.remaining_without_any_image,27);
assert.equal(ledger.counts.downloaded_original_files,0);
assert.equal(ledger.counts.published_images,0);
assert.equal(media.items.length,379);
const selected=new Set(old19.decisions.map(x=>x.place_id));
let selectable=0,context=0;
const found=new Set();
for(const r of ledger.new_file_records){
 assert.ok(!selected.has(r.place_id),"Cannot use previously owner-approved Place");
 assert.ok(ledger.original33_ids.includes(r.place_id));
 assert.ok(r.source_file.startsWith("File:"));
 assert.ok(r.page_url.startsWith("https://commons.wikimedia.org/wiki/File:"));
 assert.equal(r.original_source_bytes_retrieved,false);
 assert.equal(r.source_revision_sha1_verified,false);
 assert.equal(r.owner_photo_selected,false);
 assert.equal(r.publication_authorized,false);
 const c=current.places.find(x=>x.place_id===r.place_id);
 assert.ok(c);
 const matches=c.photo_sources.filter(x=>x.title===r.source_file&&x.source_page===r.page_url&&x.role===r.review_role);
 assert.equal(matches.length,1,"R31 updated reviewer must include exact R32 file");
 assert.ok(matches[0].source_sha1_byte_verified===false);
 assert.ok(matches[0].publication_authorized===false);
 if(r.review_role==="COVER_REVIEW_CANDIDATE")selectable++;else context++;
 found.add(r.place_id);
}
assert.equal(found.size,6);
assert.equal(selectable,2);
assert.equal(context,8);
assert.equal(current.counts.sites_with_cover_review,7);
assert.equal(current.counts.sites_with_context_only,9);
assert.equal(current.counts.sites_without_any_photo,27);
assert.equal(current.counts.photo_cards,35);
assert.equal(current.counts.review_candidates,17);
assert.equal(current.counts.context_technical_holds,18);
assert.ok(!current.places.some(x=>x.photo_sources.some(y=>/Capilla de la Divina Providencia, vista de frente|Holy Family Cathedral.jpg|Saint Mary of the Assumption Church combined church and school building/i.test(y.title))),"Wrong-identity files excluded");
for(const id of ["place:JP:our-lady-akita-convent","place:SV:capilla-divina-providencia-san-salvador","place:PA:basilica-menor-jesus-nazareno-atalaya","place:SL:sacred-heart-cathedral-freetown"]){
 const site=current.places.find(x=>x.place_id===id);
 assert.ok(site.photo_sources.every(x=>x.role!=="COVER_REVIEW_CANDIDATE"));
}
for(const id of ["place:TO:st-anthony-padua-basilica-nukualofa","place:AS:holy-family-cathedral-tafuna","place:BZ:belmopan-our-lady-guadalupe-co-cathedral","place:GL:christ-the-king-catholic-church-nuuk"]){
 assert.equal(current.places.find(x=>x.place_id===id).photo_sources.length,0);
}
console.log("R32 PASS: 33 source-research queues, 10 Commons file-page leads, 2 small provisional covers, 8 ineligible contexts, 27 still image-free, 19 owner choices untouched, no source download or publication.");
