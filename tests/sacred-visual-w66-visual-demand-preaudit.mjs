import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const file = 'data/research/sacred-visual-w66-cross-module-938-visual-demand-preaudit-20261015.v1.json';
const x = JSON.parse(readFileSync(file, 'utf8'));
const expected = {
  calendarDates: 365,
  atlas151: 151,
  geographyPlaces258: 258,
  prayerLibrary48: 48,
  novenas16: 16,
  rosaryMysteries20: 20,
  stations14: 14,
  appRouteSurfaces66: 66,
};
assert.equal(x.schema, 'AO_SACRED_VISUAL_W66_CROSS_MODULE_VISUAL_DEMAND_PREAUDIT_V1');
for (const [key, count] of Object.entries(expected)) {
  assert.equal(x.records[key].length, count, key + ' record count');
  assert.equal(x.counts[key], count, key + ' summary count');
}
const all = Object.values(x.records).flat();
assert.equal(all.length, 938);
assert.equal(x.counts.totalIndependentTargetRecords, 938);
assert.ok(all.every(item => item.renderedVisualState === 'NOT_INSPECTED'), 'never call research a render inspection');
assert.ok(all.every(item => item.visualPublicationCertifiedByW66 === false), 'do not auto-promote any art');
assert.ok(all.every(item => item.rightsAndCropCheckedByW66 === false), 'do not fabricate rights or crop checks');
assert.equal(new Set(x.records.calendarDates.map(item => item.date)).size, 365);
assert.ok(x.records.calendarDates.every(item => item.date.startsWith('2026-')));
assert.equal(new Set(x.records.atlas151.map(item => item.atlasIndex)).size, 151);
assert.equal(new Set(x.records.geographyPlaces258.map(item => item.placeId)).size, 258);
assert.equal(new Set(x.records.appRouteSurfaces66.map(item => item.id)).size, 66);
const linkedDates = x.records.calendarDates.filter(item =>
  item.researchUnrejectedCandidateCount > 0 || item.fiveStarWithoutKnownPhotoOrFitHoldCount > 0);
assert.equal(linkedDates.length, 50);
assert.equal(x.records.calendarDates.filter(item => item.recoveredFiveStarCandidateIds.length > 0).length, 34);
assert.equal(x.records.atlas151.filter(item => item.recoveredFiveStarCandidateIds.length > 0).length, 6);
assert.equal(x.records.geographyPlaces258.filter(item => item.sourceApprovedSiteMediaCount > 0).length, 19);
assert.equal(x.records.geographyPlaces258.reduce((n, item) => n + item.sourceApprovedSiteMediaCount, 0), 24);
assert.equal(x.separateNotSummedResearchBacklogs.recoveredFiveStarRecordKeysNotPhysicallyDeduped, 109);
assert.equal(x.separateNotSummedResearchBacklogs.historicalSaintComponentOccurrenceBaseline, 311);
assert.equal(x.separateNotSummedResearchBacklogs.unmergedCinematicBibleScenes, 183);
assert.equal(x.separateNotSummedResearchBacklogs.unpublishedStagedGeographySites, 750);
assert.ok(x.identityAndCoverageRules.includes('NO_PERMISSIONS_NO_RIGHTSHOLDER_CONTACT_NO_PAID_LICENCES'));
console.log('W66 source pre-audit guard passed: 938 rows, 365 dates, 151 Atlas, 258 places, no artwork publication asserted.');
