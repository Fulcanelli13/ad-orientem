import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const m=read("data/artwork/batch1-ghent-three-exact-panel-candidate-photos.v1.json");
const batch=read("data/artwork/sacred-art-batch1-25-release-progress.v1.json");
const ghent=batch.nextNineSourcePhotographWorkQueue.find(x=>x.id==="artwork-pending:07");
assert.equal(ghent.sourcePage,null);
assert.equal(ghent.knownSelectedSlotCount,3);
assert.equal(m.canonical_artwork.existing_prayer_positions,3);
assert.equal(m.canonical_artwork.prior_selected_photo,null);
assert.equal(m.publish,false);
assert.equal(m.owner_selected_specific_photo,false);
assert.equal(m.exact_photo_legal_review_pending,true);
assert.equal(m.counts.candidate_photographs,3);
assert.equal(m.counts.newly_approved_photographs,0);
assert.equal(m.counts.new_app_photo_assets,0);
assert.equal(m.candidates.length,3);
for(const photo of m.candidates) {
 assert.ok(photo.expected_dimensions.every(x=>Number.isInteger(x)&&x>1200));
 assert.ok(photo.source_page.startsWith("https://commons.wikimedia.org/wiki/File:"));
 assert.ok(photo.eligibility.includes("CANDIDATE_REQUIRES_"));
 assert.ok(photo.restoration_period.includes("HISTORICAL_"));
}
assert.equal(m.cerezo_remaining_hold.exact_museum,"Museo de Huesca");
assert.equal(m.cerezo_remaining_hold.inventory,"00029");
assert.deepEqual(m.cerezo_remaining_hold.only_exact_source_dimensions,[567,479]);
assert.equal(m.cerezo_remaining_hold.source_photo_release_approved,false);
assert.equal(m.cerezo_remaining_hold.status,"HOLD_NO_INDEPENDENT_HIRES_EXACT_PHOTOGRAPH");
console.log("PASS: three exact Ghent panel source-photo candidates, zero photo approval, separate Huesca low-resolution hold.");
