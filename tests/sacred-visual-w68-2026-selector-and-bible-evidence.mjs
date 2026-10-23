import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const file='data/research/sacred-visual-w68-2026-runtime-proper-and-151-atlas-artwork-crosswalk-20261015.v1.json';
const q=JSON.parse(readFileSync(file,'utf8'));
assert.equal(q.schema,'AO_SACRED_VISUAL_W68_CALENDAR_ATLAS_LEGACY_SELECTOR_SOURCE_CROSSWALK_V1');
assert.equal(q.calendar.length,365);
assert.equal(q.atlas.length,151);
assert.equal(new Set(q.calendar.map(x=>x.date)).size,365);
assert.equal(new Set(q.atlas.map(x=>x.atlasIndex)).size,151);
assert.equal(q.counts.historicSelectorSourcePaths,93);
assert.deepEqual(q.counts.calendarMatchMethods,{
  EXACT_OBSERVED_ID_AS_HISTORIC_PATH:70,
  NO_SANCTI_TEMPORA_SOURCE_ID:71,
  SOURCE_PATH_NOT_IN_HISTORIC_SELECTOR:216,
  TRAILING_R_VARIANT_UNCONFIRMED:8
});
assert.equal(q.counts.calendarOldGreenMatches,71);
assert.equal(q.counts.calendarDateExcludedArtistHolds,4);
assert.equal(q.counts.calendarDateKnownFiveStarResearchLeads,34);
assert.equal(q.counts.atlasEventsWithRecoveredFiveStarLeads,6);
assert.equal(q.counts.atlasEventsWithNamedSceneResearchEvidence,12);
assert.equal(q.counts.verifiedBrowserArtRenders,0);
assert.equal(q.counts.newPublicationApprovals,0);
assert.ok(q.calendar.every(x=>x.notActualResolvedProperPath && x.notVisuallyInspected && x.rightsAndCropNotRecertified && x.notPublicationApproval));
assert.ok(q.atlas.every(x=>x.visibleIllustrationInspected===false && x.actualSceneAssetIdNotEstablished && x.noImageGapNotCertified));
const four=q.calendar.filter(x=>x.currentExcludedArtistHold);
assert.deepEqual(four.map(x=>x.date),['2026-03-25','2026-05-24','2026-05-31','2026-07-26']);
assert.deepEqual(four.map(x=>x.oldSelectorArtworkId),['AO001','AO015','AO105','AO084']);
assert.ok(four.every(x=>x.currentExcludedArtistHold.mustNotPublish===true));
assert.equal(q.calendar.find(x=>x.date==='2026-05-31')?.matchingMethod,'TRAILING_R_VARIANT_UNCONFIRMED');
assert.ok(q.atlas.every(x=>x.existingFiveStarArtworks.every(a=>a.humanFivePreserved && !a.rightsMasterCropPassed && !a.currentlyRenderedInAtlas)));
assert.ok(q.boundaries.includes('NO_PERMISSIONS_NO_RIGHTSHOLDER_CORRESPONDENCE_NO_PAID_LICENSING'));
console.log('W68: 365 calendar source matches, 151 Atlas events, four excluded-artist research holds, no publication promotion.');
