import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = path => JSON.parse(readFileSync(path, 'utf8'));
const root = 'data/prayer/artwork-editorial-20261101/';
const master = read(root + 'curatorial-master-267-20261101.v1.json');
const baseline = read('data/prayer/artwork-editorial-20261031/provisional-one-choice-per-267-art-position.v1.json');
const originalCrosswalk = read(root + 'selected-work-source-crosswalk-267-20261101.v1.json');
const activeCrosswalk = read(master.sourceIdentityCrosswalk);
const bySlot = new Map(master.assignments.map(x => [x.slot, x]));

const restorations = new Map([
  ['COV-daily.morning', ['Jules Breton', 'The Song of the Lark']],
  ['COV-daily.evening', ['Pierre-Édouard Frère', 'The Prayer']],
  ['COV-prayer.hymns', ['Peter Paul Rubens', 'The Assumption of the Virgin']],
  ['COV-pray.angelus_regina', ['Peter Paul Rubens', 'Resurrection of Christ']],
  ['STG-pray.rosary-12', ['Peter Paul Rubens', 'Resurrection of Christ']]
]);
const holds = new Set([
  'COV-pray.penitential_psalms', 'STG-pray.penitential_psalms-02',
  'COV-pray.montfort_consecration', 'STG-litany_loreto_1962-05',
  'STG-pray.litany_saints-01', 'STG-pray.rosary-17',
  'STG-pray.montfort_consecration-05', 'COV-marian_hail_holy_queen',
  'COV-adoration_lord_i_am_not_worthy', 'COV-prayer.communion',
  'COV-pray.for_priests', 'COV-prayer.good_death',
  'STG-prayer.good_death-01', 'STG-pray.rosary-16'
]);

test('267 positions: only 5 explicit restores and 14 recorded holds change primaries', () => {
  assert.equal(master.assignments.length, 267);
  assert.equal(bySlot.size, 267);
  assert.equal(restorations.size, 5);
  assert.equal(holds.size, 14);
  for (const item of baseline.placements) {
    const actual = bySlot.get(item.slot);
    assert.ok(actual, item.slot);
    if (restorations.has(item.slot)) {
      const [artist, title] = restorations.get(item.slot);
      assert.equal(actual.currentAssignment.painting.artist, artist, item.slot);
      assert.equal(actual.currentAssignment.painting.title, title, item.slot);
      assert.deepEqual(actual.supersededAssignment, item.assignment, item.slot + ' lost historical evidence');
      assert.equal(actual.currentAssignment.productionEnabled, false);
    } else if (holds.has(item.slot)) {
      assert.equal(actual.currentAssignment.mode, 'HOLD_NO_ELIGIBLE_PRIMARY', item.slot);
      assert.equal(actual.currentAssignment.painting, null);
      assert.deepEqual(actual.heldPreviousAssignment, item.assignment, item.slot + ' lost historical evidence');
      assert.equal(actual.currentAssignment.productionEnabled, false);
    } else {
      assert.deepEqual(actual.currentAssignment, item.assignment, item.slot + ' unauthorized changed assignment');
    }
    assert.equal(actual.productionEnabled, false, item.slot);
  }
  assert.equal(master.publicationAllowed, false);
  assert.equal(master.count.userArtApprovalsGranted, 0);
  assert.equal(master.count.productionAssetsEnabled, 0);
  assert.equal(master.count.reconciledDeterministicPrimaries, 5);
  assert.equal(master.count.blockedPendingOriginalUserScope, 14);
  assert.equal(master.verbatimUserInstructions.length, 28);
});

test('final fixed covers are unchanged; mystery/Station image policies are preserved', () => {
  assert.equal(master.policy.fixedPrayerCovers, true);
  assert.equal(master.policy.rosaryMysteryImageFixedAcrossDecade, true);
  assert.equal(master.policy.acceptedAlternativesNeverImplyRotation, true);
  assert.equal(master.policy.categoryDoorResearchRotationNotEnabled, true);
  assert.equal(master.finalProtectedCovers.length, 3);
  for (const [slot, name] of master.finalProtectedCovers) {
    assert.ok(JSON.stringify(bySlot.get(slot).currentAssignment).includes(name), slot);
  }
  for (let i = 1; i <= 14; i++) {
    const slot = 'STG-pray.stations-' + String(i).padStart(2, '0');
    assert.ok(bySlot.get(slot)?.currentAssignment?.painting?.title?.includes('Via Crucis'), slot);
  }
});

test('original source crosswalk is preserved as forensic evidence; active crosswalk reflects corrections', () => {
  assert.equal(originalCrosswalk.rows.length, 267);
  assert.deepEqual(originalCrosswalk.counts, {
    EXACT_URL: 190, EXACT_TITLE_ARTIST: 38,
    UNMATCHED_PRESERVE_SELECTED: 37, UNIQUE_TITLE_ONLY_UNCONFIRMED: 2
  });
  assert.equal(activeCrosswalk.rows.length, 267);
  assert.equal(activeCrosswalk.meta.primaryHolds, 14);
  assert.equal(activeCrosswalk.meta.changedPrimaries, 19);
  assert.equal(activeCrosswalk.meta.nonIndividualDoorPools, 5);
  assert.equal(activeCrosswalk.meta.photosCleared, 0);
  assert.equal(activeCrosswalk.meta.publicationAllowed, false);
  for (const row of activeCrosswalk.rows) {
    const assignment = bySlot.get(row.slot).currentAssignment;
    assert.equal(row.selectedTitle, assignment.painting?.title ?? null, row.slot);
    assert.equal(row.primaryHeld, holds.has(row.slot), row.slot);
    assert.equal(row.publicationVerified, false);
    assert.equal(row.photoRightsAndPixelQAPassed, false);
    assert.equal(row.productionEnabled, false);
  }
});

test('explicit Ugolino veto, Lochner scope and same-slot exclusions make 22 ineligible alternatives', () => {
  const overrides = master.decisionReconciliation20261101.alternativeExclusions;
  assert.equal(overrides.length, 22);
  const seen = new Set(overrides.map(x => x.slot + '::' + x.id));
  assert.equal(seen.size, 22);
  const ugolino = [], lochner = [], contradictions = [];
  for (const assignment of master.assignments) for (const opt of assignment.explicitlyAcceptedOptions || []) {
    const key = assignment.slot + '::' + opt.artworkId;
    if (seen.has(key)) assert.equal(opt.eligibleForThisSlot, false, key);
    if (/Ugolino da Siena/i.test(opt.artist || '')) {
      ugolino.push(key);
      assert.equal(opt.eligibleForThisSlot, false, key);
    }
    if (opt.artworkId === 'REVIEW::cma:143761') {
      lochner.push(key);
      assert.equal(opt.eligibleForThisSlot, assignment.slot === 'STG-pray.rosary-16', key);
    }
    if (opt.editorialDisposition === 'EXCLUDED_SAME_ORIGINAL_SLOT_HISTORIC_EXCLUSION') contradictions.push(key);
  }
  assert.equal(ugolino.length, 6);
  assert.equal(lochner.length, 6); // five conflicting placements and one authorised Rosary mystery
  assert.equal(contradictions.length, 11);
  const angelus = bySlot.get('HERO-03');
  assert.equal(angelus.misroutedHistoricalOptions.length, 2);
  assert.ok(!angelus.explicitlyAcceptedOptions.some(x => ['CANONICAL::met-440393', 'CANONICAL::cma-127746'].includes(x.artworkId)));
  const visit = bySlot.get('STG-pray.rosary-03');
  assert.ok(visit.explicitlyAcceptedOptions.some(x => x.artworkId === 'CANONICAL::ART-aphael-and-iulio-omano-he-isitation'));
});

test('rejected exact-original candidates are excluded from active research without deleting provenance', () => {
  const cases = [
    ['4', 'COV-novena.st_anthony_nine_tuesdays', 'ART-eter-aul-ubens-aint-nthony-of-adua-with-the-hrist-hild'],
    ['8', 'COV-devotion_st_anthony_lost_items', 'ART-eter-aul-ubens-aint-nthony-of-adua-with-the-hrist-hild'],
    ['9', 'COV-pray.for_priests', 'CURATED-COV-pray.for_priests-0']
  ];
  for (const [family, slot, id] of cases) {
    const shard = read('data/prayer/artwork-editorial-20261031/collection-family-' + family + '.v1.json');
    const record = shard.slots.find(x => x.slot === slot);
    assert.ok(record, slot);
    assert.ok(!(record.reviewCollection || []).some(x => x.sourceIDs?.includes(id)), 'active rejected ' + slot);
    assert.ok((record.excludedFromSuggestions || []).some(x => x.id === id && x.notForReview === true), slot);
  }
  assert.equal(master.count.activeCandidateRelationshipsAfterConfirmedRejections, 1501);
  assert.equal(master.count.excludedHistoricalCandidateRelationshipsAfterConfirmedRejections, 105);
});
