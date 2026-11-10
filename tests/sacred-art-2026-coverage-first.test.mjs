import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = p => JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const base = 'data/artwork/';
const census = read(base+'home-2026-annual-release-census.v1.json');
const prior = read(base+'2026-prior-date-artwork-evidence.v1.json');
const prayer = read('data/prayer/artwork-editorial-20261101/gallery-archive-crosswalk-267-20261103.v1.json');
const prayerMaster = read('data/prayer/artwork-editorial-20261101/curatorial-master-267-20261101.v1.json');
const category = read(base+'sacred-art-category-match-989-267.v1.json');
const decisions = read('data/calendar/sacred-art-2026-batch01-60-exact-photo-owner-decisions-20261102.v1.json');
const modules = read(base+'sacred-art-batch1-25-release-progress.v1.json');
const master = read(base+'sacred-art-2026-coverage-first-master-20261110.v1.json');
const slate = read(base+'sacred-art-2026-class-ii-existing-match-review-slate-20261110.v1.json');

const hist = (items,fn) => Object.fromEntries([...new Set(items.map(fn))].map(key =>
  [key,items.filter(item=>fn(item)===key).length]));
const sum = obj => Object.values(obj).reduce((n,v)=>n+v,0);

assert.equal(master.schema,'AO_SACRED_ART_2026_COVERAGE_FIRST_MASTER_V1');
assert.equal(slate.schema,'AO_SACRED_ART_CLASS_II_2026_BULK_EDITORIAL_MATCHING_SLATE_V1');
assert.equal(master.calendar.days.length,365);
assert.equal(master.prayer.slots.length,267);
assert.equal(new Set(master.calendar.days.map(d=>d.date)).size,365);
assert.equal(new Set(master.prayer.slots.map(d=>d.slot)).size,267);
assert.equal(master.calendar.counts.dates,365);
assert.equal(master.prayer.counts.positions,267);

assert.deepEqual(
  hist(master.calendar.days, d=>d.status),
  hist(census.days, d=>d.status)
);
assert.deepEqual(
  hist(master.calendar.days, d=>d.rank),
  hist(census.days, d=>d.rank)
);
for (const day of census.days) {
  const derived = master.calendar.days.find(d=>d.date===day.date);
  assert.ok(derived,day.date);
  assert.equal(derived.observance,day.observance);
  assert.equal(derived.rank,day.rank);
  assert.equal(derived.status,day.status);
  assert.equal(derived.principalId,day.principalId);
  assert.equal(derived.ownerDateApprovalConferredByThisReport,false);
  assert.equal(derived.publicationCertifiedByThisReport,false);
}
assert.equal(master.calendar.counts.priorImageMapped,25);
assert.equal(master.calendar.counts.newContextualLocalMapped,105);
assert.equal(master.calendar.counts.newFrozenExactSourcePreviews,4);
assert.equal(master.calendar.counts.totalProposedMapped,134);
assert.equal(master.calendar.counts.pendingOrHeld,231);
assert.deepEqual(master.calendar.counts.rankCounts.I.statuses,{
 'DATE_SELECTED_IMAGE_UNRELEASED':23,
 'FROZEN_EXACT_SOURCE_PREVIEW_MAPPED':4,
 'PRIOR_DATE_IMAGE_MAPPED':24,
 'DATE_SELECTED_IMAGE_RIGHTS_HELD':2
});
assert.equal(master.calendar.counts.releaseHoldClassI,29);
assert.equal(master.calendar.counts.unmappedClassII,75);
assert.equal(master.calendar.counts.unmappedClassIII,131);
assert.equal(master.calendar.priorityQueues.classISelectedReleaseHolds.length,29);
assert.equal(master.calendar.priorityQueues.classIISundaysUnmatched.length,37);
assert.equal(master.calendar.priorityQueues.classIIOtherUnmatched.length,38);
assert.equal(master.calendar.priorityQueues.classIIIUnmatched.length,131);
assert.equal(master.calendar.priorityQueues.classIVContextualProposed.length,71);

assert.deepEqual(hist(master.prayer.slots,x=>x.runtimeState),
  hist(prayer.assignments,x=>x.currentRuntime?.state));
assert.deepEqual(master.prayer.counts.states,prayer.counts.states);
assert.equal(sum(master.prayer.counts.states),267);
assert.equal(master.prayer.counts.publishedExactPhotoSlots,51);
assert.equal(master.prayer.counts.protectedExistingCoverSlots,5);
assert.equal(master.prayer.counts.alreadyApprovedExactPhotoPendingSlots,138);
assert.equal(master.prayer.counts.sourceIdentityUnverifiedSlots,31);
assert.equal(master.prayer.counts.editorialHoldSlots,14);
assert.equal(master.prayer.counts.provisionalSlots,22);
assert.equal(master.prayer.counts.editorialMaster.positions,prayerMaster.count.positions);
for(const x of master.prayer.slots) {
  const source=prayer.assignments.find(y=>y.slot===x.slot);
  assert.ok(source,x.slot);
  assert.equal(x.runtimeState,source.currentRuntime.state);
  assert.equal(x.approvedOrInherited,!!source.editorial.approvedOrInherited);
  assert.equal(x.ownerApprovalConferredByThisReport,false);
  assert.equal(x.appImagePublicationConferredByThisReport,false);
  if(x.runtimeState==='PROTECTED_EXISTING_COVER')assert.equal(x.protectedCover,true);
}
assert.equal(master.gallery.researchArtworkGroups,989);
assert.equal(master.gallery.researchGroupsStillWithoutTitleCategory,332);
assert.equal(master.gallery.researchGroupsWithTitleBasedCategoryCandidates,657);
assert.equal(master.gallery.canonicalPrayerPositions,267);
assert.equal(master.gallery.canonicalPrayerSlotDisagreements,0);
assert.equal(category.counts.newPrayerOverrides,0);
assert.equal(master.sourcePhotoOnlyDecisions.reviewed,60);
assert.equal(master.sourcePhotoOnlyDecisions.approve,25);
assert.equal(master.sourcePhotoOnlyDecisions.reject,35);
assert.deepEqual({approve:decisions.counts.approve,reject:decisions.counts.reject},{approve:25,reject:35});
assert.equal(master.sourcePhotoOnlyDecisions.feastDateAutoApproved,false);
assert.equal(master.previouslyReleasedModulePhotoEntries,modules.counts.previouslyReleasedPhotoEntries);
assert.equal(master.previouslyReleasedModulePhotoEntries,16);

assert.equal(slate.counts.classIIDates,75);
assert.equal(slate.all75ClassIIDateMatchingCandidates.length,75);
assert.equal(slate.counts.calendarResearchLeadsNoApproval,45);
assert.equal(slate.counts.noApprovedImageAndNoResearchStatus,30);
assert.equal(slate.counts.withAtLeastOneExistingCandidate,45);
assert.equal(slate.counts.withNoEligibleExistingCandidate,30);
assert.equal(slate.counts.sundayDates,37);
assert.equal(slate.counts.sundayWithEligibleExistingCandidate,18);
assert.equal(slate.counts.exactPrayerTitleArtistOverlapPairs,15);
assert.equal(slate.batch01First25ExistingMatchReview.length,25);
const classIIDates = new Set(master.calendar.days.filter(x=>x.rank==='II'&&x.status!=='PRIOR_DATE_IMAGE_MAPPED').map(x=>x.date));
assert.deepEqual(new Set(slate.all75ClassIIDateMatchingCandidates.map(x=>x.date)),classIIDates);
assert.equal(new Set(slate.batch01First25ExistingMatchReview.map(x=>x.date)).size,25);
const priorDates=new Map(prior.days.map(x=>[x.date,x]));
for(const r of slate.all75ClassIIDateMatchingCandidates){
  const previous=priorDates.get(r.date);
  assert.ok(previous);
  assert.equal(r.existingCandidateCount,(previous.catalogue?.length||0)+(previous.externalExistingResearch?.length||0)+(previous.study?.length||0),r.date);
  assert.ok(r.candidates.every(x=>x.canonicalDateOwnerApproval===false&&x.photoSourceCertifiedForThisDate===false));
  assert.equal(r.ownerApprovedCalendarDatePainting,false);
  assert.equal(r.appReleaseCertified,false);
}
assert.equal(slate.counts.approvedNewDateBindings,0);
assert.equal(slate.counts.newProductionAssets,0);
assert.ok(master.boundaries.some(x=>x.includes('not proof')));
assert.ok(master.boundaries.some(x=>x.includes('not automatic Calendar feast/date approvals')));
console.log('PASS: 365 Calendar dates, 267 Prayer slots, 989 research groups, 75 Class II worklist, 25 review slate; no new approvals or releases.');
