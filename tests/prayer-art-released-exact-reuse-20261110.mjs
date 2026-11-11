import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { prayerEditorialSlot } from "../src/pray/editorial-artwork-assignments.v1.js";
import { resolvePrayerEditorialArtwork, prayerEditorialArtworkMarkup, prayerEditorialPublicationSummary } from "../src/pray/art-slot-map.v1.js";
import { RELEASED_MODULE_PAINTINGS } from "../src/art/released-module-paintings.v1.js";

const expected = new Map([
  ["HERO-22", "king"],
  ["STG-programme.first_saturday-01", "heart-mary"],
  ["COV-pray.adoration", "adoration"],
  ["COV-pray.forty_hours", "adoration"]
]);
for (const [slotId, artId] of expected) {
  const original=prayerEditorialSlot(slotId);
  const result=resolvePrayerEditorialArtwork(slotId);
  assert.equal(original.approvedOrInherited,true,slotId);
  assert.equal(original.sourceIdentityVerified,true,slotId);
  assert.equal(original.hold,false,slotId);
  assert.equal(original.protectedCover,false,slotId);
  assert.equal(result.state,"PUBLISHED_EXACT_PHOTO",slotId);
  assert.equal(result.artId,artId,slotId);
  assert.equal(result.photo,RELEASED_MODULE_PAINTINGS[artId],slotId);
  assert.ok(existsSync(new URL("../"+result.photo.image,import.meta.url)),slotId);
  assert.ok(existsSync(new URL("../"+result.photo.original,import.meta.url)),slotId);
  assert.match(prayerEditorialArtworkMarkup(slotId),/data-ao-released-module-photo/,slotId);
}
const counts=prayerEditorialPublicationSummary();
assert.equal(counts.total,267);
assert.equal(counts.states.PUBLISHED_EXACT_PHOTO,51,"Historical 51 minus Bouts four plus independent reuse four");
assert.equal(counts.states.APPROVED_EXACT_PHOTO_PENDING,138,"Historical 138 plus Bouts four minus reuse four");
assert.equal(resolvePrayerEditorialArtwork("HERO-03").state,"SCOPE_HOLD");
assert.equal(resolvePrayerEditorialArtwork("COV-pray.confession").state,"PROTECTED_EXISTING_COVER");
assert.equal(resolvePrayerEditorialArtwork("COV-dead_de_profundis").state,"APPROVED_EXACT_PHOTO_PENDING");
console.log("PASS four existing exact Prayer photographs reused (51/267 published, 138 approved exact pending; rejected Bouts source absent); all holds remain protected");
