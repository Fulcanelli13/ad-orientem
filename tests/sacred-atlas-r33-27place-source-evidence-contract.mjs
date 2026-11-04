import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const get = path => JSON.parse(readFileSync(path,"utf8"));
const ledger = get("data/geography/research/sacred-atlas-r33-27place-source-evidence-20261105.v1.json");
const review = get("data/geography/research/sacred-atlas-r31-undecided43-bulk-image-review-20261105.v1.json");
const old = get("data/geography/research/sacred-atlas-r28-owner-approved19-source-lock-20261104.v1.json");
const media = get("data/geography/approved-place-media.v1.json");
const imageFree = review.places.filter(p=>p.photo_sources.length===0).map(p=>p.place_id);
assert.equal(ledger.schema,"AO_SACRED_ATLAS_R33_27PLACE_WEB_SOURCE_EVIDENCE_V1");
assert.equal(ledger.places.length,27);
assert.deepEqual(ledger.places.map(x=>x.place_id).sort(),imageFree.sort());
assert.equal(new Set(ledger.places.map(x=>x.place_id)).size,27);
assert.equal(media.items.length,379);
assert.equal(review.counts.review_candidates,17);
assert.equal(review.counts.photo_cards,35);
assert.equal(old.decisions.length,19);
assert.equal(ledger.counts.newly_selectable_cover_photos,0);
assert.equal(ledger.counts.newly_published_covers,0);
assert.equal(ledger.counts.no_image_places_after,27);
assert.equal(ledger.counts.source_evidence_places,ledger.places.filter(x=>x.new_source_evidence.length>0).length);
assert.equal(ledger.counts.source_evidence_records,ledger.places.reduce((n,x)=>n+x.new_source_evidence.length,0));
for (const p of ledger.places) {
 assert.equal(p.new_eligible_cover_candidates,0);
 assert.equal(p.publication_authorized,false);
 for (const e of p.new_source_evidence) {
  assert.ok(e.url.startsWith("https://"));
  assert.ok(e.classification);
  assert.ok(e.editorial_note.length>20);
  assert.equal(e.cover_candidate,false);
  assert.equal(e.license_confirmed_for_reuse,false);
 }
}
console.log("R33 PASS: 27 image-free Places tracked, source/rights holds documented, 19 owner selections unchanged, 17 reviewer candidates, 379 public covers.");
