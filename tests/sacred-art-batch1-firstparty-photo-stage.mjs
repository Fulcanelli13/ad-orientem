import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read = (path) => JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const m=read("data/artwork/batch1-two-firstparty-photo-stage.v1.json");
const base=read("data/artwork/sacred-art-batch1-25-release-progress.v1.json");
assert.equal(m.counted.candidate_physical_paintings,2);
assert.equal(m.counted.existing_prayer_positions_total,15);
assert.equal(m.counted.paintings_newly_released,0);
assert.equal(m.counted.photographs_approved,0);
assert.equal(m.rules.auto_release,false);
assert.equal(m.rules.auto_owner_photo_selection,false);
assert.equal(m.rules.asset_commit,false);
assert.equal(m.rules.pages_deploy,false);
assert.equal(m.rules.require_exact_inventory,true);
assert.equal(m.rules.require_cc0_on_specific_photo,true);
assert.equal(m.rules.requires_explicit_editorial_decision,true);
assert.equal(base.counts.previouslyReleasedPhotoEntries,16);
assert.equal(base.counts.unreleasedNewWorks,9);
assert.equal(m.items.length,2);
const known=new Map(base.nextNineSourcePhotographWorkQueue.map(x=>[x.id,x]));
const slots=new Set();
for(const p of m.items) {
 const first=known.get(p.id);
 assert.ok(first,"Work is not from existing editorial queue: "+p.id);
 assert.equal(first.sourcePage,p.sourcePage);
 assert.equal(first.knownSelectedSlotCount,p.expected_existing_prayer_position_count);
 assert.deepEqual(first.selectedSlotIds,p.existing_prayer_positions);
 assert.equal(p.editorial_placement_unchanged,true);
 assert.equal(p.image_release_approved,false);
 assert.equal(p.original_selected_photo_replaced,false);
 assert.equal(p.source_photo_status,"NOT_YET_ACQUIRED");
 assert.equal(p.attribution_requires_editorial_reconciliation,true);
 assert.ok(p.institutional_artist!==p.original_editorial_artist);
 assert.ok(p.api_url.startsWith("https://"));
 assert.equal(p.image_url_from_api_only,true);
 for(const slot of p.existing_prayer_positions) {
  assert.ok(!slots.has(slot),"Duplicate assigned slot "+slot);
  slots.add(slot);
 }
}
assert.equal(slots.size,15);
console.log("PASS: two museum-sourced works / 15 existing Prayer positions; no automatic editorial/photo/publication promotion.");
