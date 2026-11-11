import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = path => JSON.parse(readFileSync(new URL("../" + path, import.meta.url), "utf8"));
const registry = read("data/artwork/sacred-art-2026-definitive-closeout-20261111.v1.json");
const baseline = read("data/artwork/sacred-art-2026-coverage-first-master-20261110.v1.json");
const prayer = read("data/prayer/artwork-editorial-20261101/gallery-archive-crosswalk-267-20261103.v1.json");
const classIII = read("data/artwork/sacred-art-2026-class-iii-131-curatorial-master-20261110.v1.json");

assert.equal(registry.schema, "AO_SACRED_ART_2026_AUTHORITATIVE_CLOSEOUT_SNAPSHOT_V1");
assert.equal(registry.pinnedMainSha, "60d018ef3b97b467ca4c1cd1980be57831e83178");
assert.equal(registry.sourceSnapshot.length, 12);
assert.equal(registry.calendarDates.length, 365);
assert.equal(registry.prayerSlots.length, 267);
assert.deepEqual(new Set(registry.calendarDates.map(x=>x.date)),new Set(baseline.calendar.days.map(x=>x.date)));
assert.deepEqual(new Set(registry.prayerSlots.map(x=>x.slot)),new Set(prayer.assignments.map(x=>x.slot)));
assert.equal(new Set(registry.calendarDates.map(x=>x.date)).size,365);
assert.equal(new Set(registry.prayerSlots.map(x=>x.slot)).size,267);

const tally = (rows, field) => Object.fromEntries([...new Set(rows.map(x=>x[field]))].map(v=>[v,rows.filter(x=>x[field]===v).length]));
const ct = registry.counts;
assert.deepEqual(ct.calendarBaselineStatuses,tally(registry.calendarDates,"baselineState"));
assert.deepEqual(ct.calendarClasses,tally(registry.calendarDates,"liturgicalClass"));
assert.deepEqual(ct.calendarProductionActions,tally(registry.calendarDates,"nextProductionAction"));
assert.deepEqual(ct.prayerBaselineStates,tally(registry.prayerSlots,"historicalReleaseRegistryState"));
assert.deepEqual(ct.prayerProductionActions,tally(registry.prayerSlots,"nextProductionAction"));
assert.deepEqual(ct.calendarBaselineStatuses,baseline.calendar.counts.DATE_SELECTED_IMAGE_UNRELEASED === 23 ? {
 DATE_SELECTED_IMAGE_UNRELEASED:23,
 NEW_CONTEXTUAL_LOCAL_IMAGE_MAPPED:105,
 RESEARCH_LEADS_NO_APPROVED_DATE_IMAGE:151,
 FROZEN_EXACT_SOURCE_PREVIEW_MAPPED:4,
 NO_APPROVED_DATE_IMAGE:55,
 PRIOR_DATE_IMAGE_MAPPED:25,
 DATE_SELECTED_IMAGE_RIGHTS_HELD:2
}:null);
assert.equal(ct.classISelectedDateImages,53);
assert.equal(ct.classIICompletedResearchDossiers,75);
assert.equal(ct.classIIICompletedResearchDossiers,131);
assert.equal(ct.classIIIWithNamedProposedArt,classIII.counts.allDatesWithNamedProposal);
assert.equal(ct.classIIIWithoutNamedArt,classIII.counts.exactUnmatchedPaintingGaps);
assert.equal(ct.classIIIWithNamedProposedArt,128);
assert.equal(ct.classIIIWithoutNamedArt,3);
assert.equal(ct.classIVContextualProposals,71);
assert.equal(ct.prayerPublishedExactPhotoPositions,51);
assert.equal(ct.prayerPendingApprovedExactPhotoPositions,138);
assert.equal(ct.prayerDistinctPendingWorkSourceKeysPerSourceCrosswalk,73);
assert.equal(ct.prayerExistingReleasedPhotoReuseProposals,4);
assert.equal(ct.prayerGlobalRejectedPhotographCurrentlyUsedSlots,4);
assert.equal(ct.moduleReleasedOriginalPhotoRegistryEntries,16);
assert.equal(ct.moduleRegistryPhotoEntriesExcludingKnownRejectedOriginal,15);
assert.equal(ct.archivalOriginalFilesRecoveredInPR2267,20);
assert.equal(ct.archivalHeroOriginalsExpected,22);
assert.equal(ct.archivalOriginalsKnownMissing,2);
assert.equal(ct.archivalOriginalBytes,94811175);
assert.equal(ct.batch423PhotographsDownloadedInResearch,423);
assert.equal(ct.batch423AfterExactPixelDedupe,383);
assert.equal(ct.batch423CertifiedProductionMasters,0);
assert.equal(ct.historicalManyToManyAcceptedAlternativeRelationshipRows,507);
assert.equal(ct.historicalManyToManyRelationshipEdges,1589);
assert.equal(ct.historicalManyToManyTargets,640);
assert.equal(ct.historicalManyToManyRealPrayerSlots,267);
assert.equal(ct.historicalManyToManyAdditionalNoncanonicalPrayerTargets,8);
assert.equal(ct.approvedPaintingRecordsInSeparatePR2532,56);
assert.equal(ct.researchedVerifiedColourPhotosInPR2726,10);
assert.equal(ct.researchedVerifiedColourPhotosAlreadyPublic,0);
assert.equal(ct.changesMadeToLiveAppByThisLedger,0);

// A selected work and an acquired image do not by themselves certify production.
assert.ok(registry.calendarDates.every(x=>x.photoPublicationProvenByThisLedger===false&&x.ownerDateApprovalCreatedByThisLedger===false));
assert.ok(registry.prayerSlots.every(x=>x.newOwnerPaintingDecisionMadeByThisLedger===false));
assert.ok(registry.researchedColourSourcePhotographsNonpublic.every(x=>x.sourceImageInPublicAssets===false));
assert.ok(registry.separatelyUserApprovedPrayerPaintingsOnPR2532.every(x=>x.ownerApprovedWorkOnly===true&&x.noPlacementApprovalDerivedFromThisLedger===true));

// Distinguish title-only leads from approved exact originals; preserve true historical scope.
assert.equal(registry.calendarDates.filter(x=>x.draftResearchOnly).length,306);
assert.equal(registry.calendarDates.filter(x=>x.nextProductionAction==="RELEASE_EXISTING_FROZEN_CLASS_I_SELECTION").length,29);
assert.equal(registry.calendarDates.filter(x=>x.nextProductionAction==="VERIFY_EXISTING_SEASONAL_CONTEXTUAL_RENDER").length,105);
assert.equal(registry.calendarDates.filter(x=>x.nextProductionAction==="CLASS_II_DRAFT_SELECTION_VALIDATE_AND_RELEASE").length,75);
assert.equal(registry.calendarDates.filter(x=>x.nextProductionAction==="CLASS_III_DRAFT_SELECTION_VALIDATE_AND_RELEASE").length,128);
assert.equal(registry.calendarDates.filter(x=>x.nextProductionAction==="CLASS_III_3_GENUINE_SUBJECT_GAP_OR_CONTEXTUAL_FALLBACK").length,3);

// The exact Bouts Cleveland 1942.635 photograph is a P0 bug in the pinned November 11 main.
const rejected = registry.actualRuntimePhotoRegistry.filter(x=>x.exactOwnerRejected);
assert.equal(rejected.length,1);
assert.equal(rejected[0].photoId,"bouts");
assert.match(rejected[0].catalogueOrImageSource,/1942\.635/);
const affected=registry.prayerSlots.filter(x=>x.exactOwnerRejectedPublishedPhoto);
assert.equal(affected.length,4);
assert.deepEqual(new Set(affected.map(x=>x.slot)),new Set([
 "STG-pray.angelus-04","STG-pray.angelus-05",
 "STG-pray.angelus-06","STG-pray.rosary-02"
]));
assert.ok(affected.every(x=>x.publishedPhotoId==="bouts"&&x.nextProductionAction==="P0_REMOVE_REJECTED_ORIGINAL_KEEP_PLACEMENT_PROTECTED"));

// Only four already-approved slots are exact-work reused on PR2830, with no new photograph.
const reused=registry.exactPhotographReuseAlreadyImplementedInDraftPR2830;
assert.deepEqual(new Set(reused.map(x=>x.slot)),new Set([
 "HERO-22","STG-programme.first_saturday-01","COV-pray.adoration","COV-pray.forty_hours"
]));
assert.ok(reused.every(x=>x.releaseStatus==="PREPARED_IN_DRAFT_PR_2830_NOT_MERGED"&&x.autolinkProhibitedWithoutPinnedSlotIdentityGuard));
assert.ok(registry.prayerSlots.filter(x=>x.exactAvailablePublishedPhotoReusePR2830).length===4);
assert.equal(affected.filter(x=>reused.some(y=>y.slot===x.slot)).length,0);
assert.equal(registry.noncanonicalM2MPrayerTargets.length,8);
assert.equal(registry.separatelyUserApprovedPrayerPaintingsOnPR2532.length,56);
assert.equal(registry.archivedOriginalHeroSourcesOnDraftPR2267.filter(x=>x.sourcePresent).length,20);
assert.equal(registry.archivedOriginalHeroSourcesOnDraftPR2267.filter(x=>!x.sourcePresent).length,2);
console.log("PASS 2026 Sacred Art: 365 Calendar dates, 267 Prayer positions, 507 accepted relationships, 423 research downloads, 20 staged originals, 16 released photos, P0 Bouts and four exact reused artworks tracked without false approval/release.");
