import assert from "node:assert/strict";
import {
  SACRED_ART_CURATED_WORKS_V1,
  sacredArtWorkById,
  sacredArtWorksInCategory,
  sacredArtMatchesForPrayerSlot,
} from "../src/art/sacred-art-taxonomy-v1.js";
import { SACRED_ART_HOLY_TRINITY_OWNER_SELECTED_V1 as selected } from "../src/art/sacred-art-holy-trinity-owner-selected.v1.js";

assert.equal(selected.length, 6, "Exactly six owner-selected Holy Trinity works");
assert.equal(SACRED_ART_CURATED_WORKS_V1.length, 30, "Preserve 24 eligible historic curated works plus six selections");
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
  assert.equal(work.researchOriginalAcquired, true, "All six original JPEGs were acquired outside the app repository");
  assert.equal(work.researchImageArchive, "Ad_Orientem_Holy_Trinity_6_Actual_Images_Final_Review_2026-11-14.zip");
  assert.match(work.sourceOriginalSha256, /^[a-f0-9]{64}$/, "A verified SHA-256 exists for each research original");
  assert.ok(Number.isInteger(work.sourcePixels.width) && work.sourcePixels.width > 0);
  assert.ok(Number.isInteger(work.sourcePixels.height) && work.sourcePixels.height > 0);
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
const campeche = selected.find(w => w.artist === "José Campeche");
assert.equal(campeche.preferredOriginalFileUrl, "https://images.metmuseum.org/CRDImages/ad/original/DP-44679-003.jpg");
assert.deepEqual(campeche.sourcePixels, { width: 2700, height: 4000 });
console.log("Holy Trinity owner selection: six gallery records, zero photo releases or placement changes.");
