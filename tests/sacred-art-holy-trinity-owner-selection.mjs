import assert from "node:assert/strict";
import {
  SACRED_ART_CURATED_WORKS_V1,
  sacredArtWorkById,
  sacredArtWorksInCategory,
  sacredArtMatchesForPrayerSlot,
} from "../src/art/sacred-art-taxonomy-v1.js";
import { SACRED_ART_HOLY_TRINITY_OWNER_SELECTED_V1 as selected } from "../src/art/sacred-art-holy-trinity-owner-selected.v1.js";

assert.equal(selected.length, 6, "Exactly six owner-selected Holy Trinity works");
assert.equal(SACRED_ART_CURATED_WORKS_V1.length, 31, "Preserve 25 original curated works plus six selections");
assert.deepEqual(selected.map(w => w.ownerSelectionNumber), [1, 2, 3, 4, 8, 9]);
const ids = new Set(selected.map(w => w.id));
assert.equal(ids.size, 6, "Selection IDs must be unique");
const categoryWorks = sacredArtWorksInCategory("TRINITY");
assert.equal(categoryWorks.length, 7, "Preexisting released Girardin plus six new owner selections");
for (const work of selected) {
  assert.equal(work.ownerApproval, "APPROVED_FOR_CURATED_GALLERY");
  assert.equal(work.ownerSelectionDate, "2026-11-13");
  assert.ok(work.categoryIds.includes("TRINITY"), "Every selected work is classified as Trinity");
  assert.equal(sacredArtWorkById(work.id), work, "All selections accessible through gallery registry");
  assert.equal(work.photoModuleId, null, "No newly released module photo");
  assert.equal(work.image, null, "No invented local image bytes");
  assert.equal(work.original, null, "No invented local original");
  assert.equal(work.originalFileAcquired, false);
  assert.equal(work.productionEligible, false);
  assert.equal(work.newPhotoPublication, false);
  assert.equal(work.photoReleaseState, "PHOTOGRAPH_NOT_RELEASED");
  assert.deepEqual(work.existingMatching.existingPrayerSlots, [], "No automatic Prayer assignment");
  assert.ok(work.primaryCatalogueUrl.startsWith("https://"));
  assert.ok(work.candidateImageFilePageUrl.startsWith("https://"));
  assert.ok(work.rightsEvidenceUrl.startsWith("https://"));
}
const durer = selected.find(w => w.artist === "Albrecht Dürer");
assert.equal(durer.preexisting989GroupId, "HERO::khm:GG-838", "Dürer links to preexisting research identity");
assert.ok(selected.some(w => w.artist === "Guido Reni" && w.reproductionQualityState.includes("HOLD")));
assert.ok(selected.some(w => w.artist === "Giovanni Battista Tiepolo" && w.photographRightsState.includes("REVIEW")));
assert.deepEqual(sacredArtMatchesForPrayerSlot("STG-pray.rosary-02").filter(w => ids.has(w.id)), []);
console.log("Holy Trinity owner selection: six gallery records, zero photo releases or placement changes.");
