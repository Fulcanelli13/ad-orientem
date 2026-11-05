// Research-only editorial integrity contract. Run: node tests/prayer-art-b01-b05-consolidation-contract.mjs
// Does not import production artwork or modify the Prayer reader.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = path => JSON.parse(readFileSync(new URL("../" + path, import.meta.url), "utf8"));
const master = read("data/prayer/artwork-editorial-20261105/consolidated-approved-prayer-art-b01-b05.v1.json");
const plan = read("data/prayer/artwork-editorial-20261105/approved-art-slot-triage-and-release-gates.v1.json");
const old = read("data/prayer/artwork-editorial-20261101/gallery-archive-crosswalk-267-20261103.v1.json");
const ids = master.approvedPaintings.map(x => x.optionId);
const known = new Set(ids);
assert.equal(ids.length, 56, "exactly 56 explicit painting approvals");
assert.equal(known.size, 56, "no duplicate approval identifiers");
assert.equal(new Set(master.approvedPaintings.map(x => x.work.identityKey)).size, 56, "no duplicate artist/title identity key");
assert.equal(master.approvedShroudSubject.optionId, "HF-6");
assert.equal(master.approvedShroudSubject.exactPhotoApproved, false);
assert.equal(master.approvedShroudSubject.reproductionRightsAndPixelsVerified, false);
assert.equal(master.inputs.userApprovalPullRequests.length, 5);
const batches = Object.fromEntries([1,2,3,4,5].map(n => [n, ids.filter((id, i) => master.approvedPaintings[i].batch === n).length]));
assert.deepEqual(batches, {1:12, 2:16, 3:5, 4:13, 5:10});
assert.ok(master.approvedPaintings.every(x =>
  x.editorial.decision === "USER_APPROVED_WORK" &&
  !x.source.rightsVerifiedForSpecificPhotograph &&
  !x.source.actualImagePixelsVerified &&
  !x.publication.ready && !x.publication.assignedToLiveCover
), "artwork choice must never bypass photograph and publication QA");
const oldLocks = old.assignments.filter(x => x.currentRuntime.state === "PROTECTED_EXISTING_COVER");
assert.equal(oldLocks.length, 5, "lock count changed; re-audit required");
assert.deepEqual(new Set(master.protectedCovers.map(x => x.slot)), new Set(oldLocks.map(x => x.slot)), "protected cover slots retained");
for (const lock of oldLocks) {
  const unchanged = master.protectedCovers.find(x => x.slot === lock.slot);
  assert.equal(unchanged.title, lock.painting.title);
  assert.equal(unchanged.artist, lock.painting.artist);
}
const slotNames = new Set(old.assignments.map(x => x.slot));
const heldNames = new Set(old.assignments.filter(x => x.currentRuntime.state === "EDITORIAL_HOLD").map(x => x.slot));
assert.equal(heldNames.size, 14, "historical held-slot baseline changed");
assert.equal(plan.coverageAudit.heldPositionCount, 14);
assert.equal(plan.editorialHoldCandidatePlan.length, 14);
assert.deepEqual(new Set(plan.editorialHoldCandidatePlan.map(x => x.slot)), heldNames, "every held slot requires an exact triage record");
for (const row of plan.editorialHoldCandidatePlan) {
  assert.ok(known.has(row.recommendedCandidateId), "recommended candidate must be approved");
  assert.ok(row.otherEligibleCandidateIds.every(x => known.has(x)), "alternatives must be approved");
  assert.equal(row.publishable, false);
  assert.ok(!master.protectedCovers.some(x => x.slot === row.slot), "never recommend replacing a locked cover");
}
assert.equal(plan.categories.length, 21);
const categoryIds = [];
for (const category of plan.categories) {
  assert.ok(category.approvedOptionIds.length, "category requires selections");
  assert.ok(category.potentialPlacementSlots.every(x => slotNames.has(x)), "all proposed slot keys must exist in baseline");
  assert.equal(category.defaultDisposition, "CANDIDATE_ONLY_NO_AUTOMATIC_ASSIGNMENT");
  categoryIds.push(...category.approvedOptionIds);
}
assert.deepEqual(new Set(categoryIds), known, "every approval must appear in exactly one selected theme");
assert.equal(categoryIds.length, ids.length);
assert.equal(master.approvedPaintings.find(x => x.optionId === "SO-5").source.exactObjectUrl, false, "category page cannot verify work");
assert.ok(master.approvedPaintings.find(x => x.optionId === "PS-2").existingCrosswalk.matchedExactArtistAndTitleSlots.length === 5, "existing King David stage matches retained");
assert.equal(master.counts.photoReleaseReady, 0);
assert.equal(plan.automaticReleaseAllowed, false);
console.log("PASS: 56 work approvals, 1 Shroud subject, 21 thematic groups, all 14 holds triaged, 5 cover locks preserved; zero release authority");
