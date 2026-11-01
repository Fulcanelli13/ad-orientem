import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 PRAYER_RELEASED_IMAGE_ASSETS_V1,PRAYER_ARTWORK_RELEASE_SCHEMA_V1,
 releaseClearedPrayerArtwork,renderReleasedPrayerArtwork,prayerArtworkSlotForView,prayerArtworkRosarySlotForChapter
} from '../src/pray/artwork-release-runtime.js';
import {
 PRAYER_ARTWORK_SLOT_AUTHORITY,PRAYER_ARTWORK_REQUIRED_HOLDS
} from '../src/pray/artwork-slot-authority.v1.js';
import {existsSync} from 'node:fs';


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
    const historical = (record.reviewCollection || []).filter(x => x.sourceIDs?.includes(id));
    assert.equal(historical.length, 1, 'historical source must not disappear: ' + slot);
    assert.equal(historical[0].eligibleForReview, false, 'historical source must not be selectable: ' + slot);
    assert.equal(historical[0].notForReview, true, slot);
    assert.equal(historical[0].retainedAsSourceEvidenceOnly, true, slot);
    assert.equal(historical[0].productionEnabled, false, slot);
    assert.ok((record.excludedFromSuggestions || []).some(x => x.id === id && x.notForReview === true), slot);
  }
  assert.equal(master.count.activeCandidateRelationshipsAfterConfirmedRejections, 1501);
  assert.equal(master.count.excludedHistoricalCandidateRelationshipsAfterConfirmedRejections, 105);
});


test('B04 Coronation scope is applied in every original candidate shard', () => {
  const exactIds = new Set(['REVIEW::cma:143761', 'REVIEW::met:435853']);
  let authorised = 0, researchOnly = 0;
  let candidates = 0, selectable = 0, excluded = 0;
  for (const family of ['home','1','2','3','4','5','6','7','8','9','other']) {
    const shard = read('data/prayer/artwork-editorial-20261031/collection-family-' + family + '.v1.json');
    for (const slot of shard.slots) {
      candidates += (slot.reviewCollection || []).length;
      selectable += (slot.reviewCollection || []).filter(x => x.eligibleForReview !== false && x.notForReview !== true).length;
      excluded += (slot.excludedFromSuggestions || []).length;
      for (const candidate of slot.reviewCollection || []) {
        if (!candidate.sourceIDs?.some(id => exactIds.has(id))) continue;
        assert.equal(candidate.eligibleForProduction, false, slot.slot);
        assert.equal(candidate.reconciliation20261101.publicationAllowed, false, slot.slot);
        if (slot.slot === 'STG-pray.rosary-16') {
          authorised++;
          assert.equal(candidate.approvedForThisExactSlot, true);
        } else {
          researchOnly++;
          assert.equal(candidate.approvedForThisExactSlot, false, slot.slot);
        }
      }
    }
  }
  assert.equal(authorised, 2);
  assert.equal(researchOnly, 27);
  assert.equal(candidates, 1504);
  assert.equal(selectable, 1501);
  assert.equal(excluded, 105);
});

test('Prayer UI authority contains all 267 corrected selections and preserves every hold', () => {
 const entries=Object.entries(PRAYER_ARTWORK_SLOT_AUTHORITY);
 assert.equal(entries.length,267);
 assert.equal(PRAYER_ARTWORK_REQUIRED_HOLDS.length,14);
 for(const [id,v] of entries){
  const row=bySlot.get(id);
  assert.ok(row,id);
  assert.equal(v.title,row.currentAssignment.painting?.title??null,id);
  assert.equal(v.artist,row.currentAssignment.painting?.artist??null,id);
  assert.equal(v.held,row.currentAssignment.mode==='HOLD_NO_ELIGIBLE_PRIMARY',id);
  assert.equal(v.door,id.startsWith('DOOR-'),id);
  assert.equal(v.productionApproved,false,id);
 }
});

test('uncleared paintings cannot render on any prayer screen, including held primaries', () => {
 assert.equal(PRAYER_ARTWORK_RELEASE_SCHEMA_V1,'ao-prayer-artwork-release-gate-v1');
 assert.equal(Object.keys(PRAYER_RELEASED_IMAGE_ASSETS_V1).length,0);
 for(const [slot] of Object.entries(PRAYER_ARTWORK_SLOT_AUTHORITY)){
  assert.equal(releaseClearedPrayerArtwork(slot),null,slot);
  assert.equal(renderReleasedPrayerArtwork(slot),'',slot);
 }
 assert.equal(releaseClearedPrayerArtwork('__proto__'),null);
 assert.equal(renderReleasedPrayerArtwork('COV-pray.rosary'),'');
});

test('artwork release proof must include exact work, actual photo rights, SHA-256, frame and responsive crops', () => {
 const slot='COV-daily.morning';
 const selection=PRAYER_ARTWORK_SLOT_AUTHORITY[slot];
 const release={
  slotId:slot,title:selection.title,artist:selection.artist,
  path:'assets/pray/released/song-of-the-lark.webp',
  publicationState:'READY_FOR_PUBLICATION',productionEnabled:true,editorialApproved:true,
  sourceCredit:'Art Institute of Chicago',sourceCollectionUrl:'https://www.artic.edu/artworks/94841/the-song-of-the-lark',
  photographerCredit:'Art Institute of Chicago image service',
  licenseName:'Public Domain Mark',licenseUrl:'https://creativecommons.org/publicdomain/mark/1.0/',
  modificationsDescription:'Displayed in a responsive painting-only crop',
  releaseEvidence:{
   selectedOriginalArtworkId:selection.ids[0],
   exactOriginalObjectVerified:true,approvedForThisExactPrayerSlot:true,
   actualFileReuseRightsCleared:true,originalSourceFileArchived:true,
   sourceOriginalSha256:'a'.repeat(64),releaseImageSha256:'b'.repeat(64),
   nativeResolutionVerified:true,nativeWidth:1400,nativeHeight:1800,
   visualQualityHumanPassed:true,physicalFrameAbsent:true,
   gallerySurroundAbsent:true,noSyntheticFill:true,
   mobileCropApproved:true,desktopCropApproved:true,appRenderVerified:true
  }
 };
 const manifest={ [slot]:release };
 assert.equal(releaseClearedPrayerArtwork(slot,{manifest})?.path,release.path);
 const markup=renderReleasedPrayerArtwork(slot,{manifest,language:'fr'});
 assert.match(markup,/aoPrayReleasedArtFrame/);
 assert.match(markup,/Informations sur l’œuvre/);
 assert.match(markup,/Art Institute of Chicago/);
 assert.match(markup,/Public Domain Mark/);
 assert.match(markup,/responsive painting-only crop/);
 assert.match(markup,/Photograph:/);

 assert.match(markup,/details/);
 const ensureDenied=(patch,key)=>{
  const copy=structuredClone(release);
  if(['path','editorialApproved','licenseName','licenseUrl',
      'photographerCredit','modificationsDescription'].includes(key))
    copy[key]=patch;
  else copy.releaseEvidence[key]=patch;
  assert.equal(releaseClearedPrayerArtwork(slot,{manifest:{[slot]:copy}}),null,key);
 };
 ensureDenied(false,'actualFileReuseRightsCleared');
 ensureDenied(false,'mobileCropApproved');
 ensureDenied(false,'physicalFrameAbsent');
 ensureDenied(false,'approvedForThisExactPrayerSlot');
 ensureDenied('assets/../pray/bad.webp','path');
 ensureDenied('https://remote.example/painting.jpg','path');
 ensureDenied('invalid','sourceOriginalSha256');
 ensureDenied(false,'editorialApproved');
 ensureDenied('', 'licenseUrl');
 ensureDenied('http://invalid.example/license','licenseUrl');
 ensureDenied('', 'photographerCredit');
 ensureDenied('', 'modificationsDescription');
 const held='COV-prayer.communion';
 const attempt={...release,slotId:held,title:'La Petite Cène',artist:'Philippe de Champaigne'};
 assert.equal(releaseClearedPrayerArtwork(held,{manifest:{[held]:attempt}}),null);
});

test('a nonempty public release manifest must have a real repository image file, never a remote candidate link',()=>{
 for(const [slot,asset] of Object.entries(PRAYER_RELEASED_IMAGE_ASSETS_V1)){
  assert.ok(PRAYER_ARTWORK_SLOT_AUTHORITY[slot],slot);
  assert.ok(asset.path.startsWith('assets/pray/released/'),'Not a local Prayer release asset');
  assert.ok(existsSync(asset.path),'Missing release image file: '+asset.path);
  assert.ok(releaseClearedPrayerArtwork(slot),slot+' was not release certified');
 }
});

test('artwork surfaces follow current prayer/station and leave Rosary bead architecture alone',()=>{
 assert.equal(prayerArtworkSlotForView({view:'angelus',angelusForm:'regina'}),'COV-pray.angelus_regina');
 assert.equal(prayerArtworkSlotForView({view:'angelus',angelusForm:'angelus'}),'COV-pray.angelus');
 assert.equal(prayerArtworkSlotForView({view:'stations',stationIndex:0}),'STG-pray.stations-01');
 assert.equal(prayerArtworkSlotForView({view:'stations',stationIndex:13}),'STG-pray.stations-14');
 assert.equal(prayerArtworkSlotForView({view:'stations',stationIndex:14}),null);
 assert.equal(prayerArtworkSlotForView({view:'penitential',penitentialIndex:0}),'STG-pray.penitential_psalms-01');
 assert.equal(prayerArtworkSlotForView({view:'sevenWords',sevenWordsIndex:5}),'STG-pray.seven_words-06');
 assert.equal(prayerArtworkSlotForView({view:'prayerOnly',prayerId:'daily.morning'}),'COV-daily.morning');
 assert.equal(prayerArtworkSlotForView({view:'family',familyId:'daily'}),'DOOR-D1');
 assert.equal(prayerArtworkSlotForView({view:'family',familyId:'saints'}),'DOOR-D8');
 assert.equal(prayerArtworkSlotForView({view:'family',familyId:'unknown'}),null);
 assert.equal(prayerArtworkSlotForView({view:'rosary'}),null);
 assert.equal(prayerArtworkSlotForView({view:'home'}),null);
 const presentation=readFileSync('src/pray/presentation-runtime.js','utf8');
 assert.match(presentation,/renderReleasedPrayerArtwork\(artSlot/);
 assert.match(presentation,/import "\.\/artwork-release-styles\.js"/);
});

test('Rosary painting stays fixed by mystery group, never by bead; 15 traditional mysteries only',()=>{
 const cases=[['joyful',2],['sorrowful',7],['glorious',12]];
 for(const [set,first] of cases){
  for(let mi=0;mi<5;mi++){
   const chapter={id:'mystery-'+(mi+1),mi,start:mi*11};
   const expected='STG-pray.rosary-'+String(first+mi).padStart(2,'0');
   assert.equal(prayerArtworkRosarySlotForChapter(chapter,{set}),expected);
   // The chapter artwork identity does not depend on the Hail Mary bead.
   for(let bead=0;bead<10;bead++)
    assert.equal(prayerArtworkRosarySlotForChapter({...chapter,bead},{set}),expected);
  }
 }
 assert.equal(prayerArtworkRosarySlotForChapter({id:'opening'},{set:'joyful'}),'STG-pray.rosary-01');
 assert.equal(prayerArtworkRosarySlotForChapter({id:'conclusion'},{set:'glorious'}),'STG-pray.rosary-17');
 assert.equal(prayerArtworkRosarySlotForChapter({id:'mystery-1',mi:0},{set:'luminous'}),null);
 assert.equal(prayerArtworkRosarySlotForChapter({id:'mystery-6',mi:5},{set:'joyful'}),null);
 const rosary=readFileSync('src/pray/rosary-active-card.js','utf8');
 assert.match(rosary,/prayerArtworkRosarySlotForChapter/);
 assert.match(rosary,/renderReleasedPrayerArtwork/);
 const presentation=readFileSync('src/pray/presentation-runtime.js','utf8');
 assert.match(presentation,/chapters,set:info.set,language:lang\(\)/);
});

test('Prayer image acquisition queue deduplicates current choices but does not grant release',()=>{
 const ledger=read('data/prayer/artwork-editorial-20261101/photo-release-acquisition-queue-267-20261101.v1.json');
 assert.equal(ledger.productionAllowed,false);
 assert.equal(ledger.counts.allMasterPositions,267);
 assert.equal(ledger.counts.positionsWithCurrentSelectedPainting,248);
 assert.equal(ledger.counts.uniqueCandidateArtworkGroups,124);
 assert.equal(ledger.counts.conflictedPrimaryPositionsHeld,14);
 assert.equal(ledger.counts.unassignedNonIndividualDoors,5);
 assert.equal(ledger.counts.photoReproductionsFullyCleared,0);
 assert.equal(ledger.queue.reduce((n,x)=>n+x.slots.length,0),248);
 assert.equal(ledger.queue.some(x=>x.title==='Madonna del Rosario'&&x.priority==='P0_FINAL_LOCK'),true);
 assert.equal(ledger.queue.every(x=>x.photosAcquired===0&&x.photographReleaseState==='UNVERIFIED'),true);
});

test('all five derived Prayer category doors remain unavailable even with spoofed release proof',()=>{
 const blocks=['DOOR-D1','DOOR-D4','DOOR-D6','DOOR-D7','DOOR-D9'];
 for(const slot of blocks){
  const row=PRAYER_ARTWORK_SLOT_AUTHORITY[slot];
  assert.equal(row.door,true);
  assert.equal(row.title,null);
  assert.equal(releaseClearedPrayerArtwork(slot,{manifest:{[slot]:{
   slotId:slot,title:'Invented Painting',artist:'Invented',
   publicationState:'READY_FOR_PUBLICATION',productionEnabled:true,editorialApproved:true,
   path:'assets/pray/released/invented.webp',releaseEvidence:{categoryDoorExactArtworkApproved:true}
  }}}),null,slot);
 }
});


test('bulk source-acquisition manifests retain fourteen exact San Polo originals and twelve initial Commons leads',()=>{
 const stations=read('data/prayer/artwork-editorial-20261101/tiepolo-san-polo-stations-14-source-photos-20261101.v1.json');
 const batch=read('data/prayer/artwork-editorial-20261101/commons-originals-batch01-20261101.v1.json');
 const routing=read('data/prayer/artwork-editorial-20261101/photo-provider-routing-124-20261101.v1.json');
 assert.equal(stations.uniqueStations,14);
 assert.equal(stations.records.length,14);
 assert.equal(stations.stageOnly,true);
 assert.equal(stations.releaseManifestChangeAllowed,false);
 assert.equal(stations.productionRightsApprovedCount,0);
 const stationIDs=new Set();
 for(let i=0;i<14;i++){
  const row=stations.records[i];
  assert.equal(row.slot,'STG-pray.stations-'+String(i+1).padStart(2,'0'));
  assert.ok(row.sourcePage.startsWith('https://commons.wikimedia.org/wiki/File:Chiesa_di_San_Polo_'));
  assert.ok(!stationIDs.has(row.sourcePage));
  stationIDs.add(row.sourcePage);
  assert.equal(row.publicationAllowed,false);
  assert.equal(row.photoRightsForAppCleared,false);
  assert.equal(row.displayPhotoApproved,false);
 }
 assert.equal(batch.records.length,12);
 assert.equal(batch.stageOnly,true);
 assert.equal(batch.releaseManifestChangeAllowed,false);
 assert.equal(batch.records.filter(x=>x.originalArtworkTitle==='Madonna del Rosario').length,2);
 assert.equal(batch.records.filter(x=>x.expectedLicenseShortName==='CC BY 3.0').length,2);
 assert.equal(batch.records.filter(x=>/prado/i.test(x.sourcePage)).length,0);
 assert.ok(batch.blockedWithoutSubstitution.some(x=>x.slot==='COV-novena.st_therese'));
 assert.ok(batch.blockedWithoutSubstitution.some(x=>x.slot==='COV-prayer.seven_sorrows_chaplet'));
 assert.equal(routing.counts.originalArtworkCandidateGroups,124);
 assert.equal(routing.counts.COMMONS_EXACT_FILE_METADATA,68);
 assert.equal(routing.counts.MISSING_EXACT_IMAGE_SOURCE,20);
 assert.equal(routing.counts.PRADO_PHOTO_HOLD,2);
 for(const station of stations.records){
  const row=routing.groups.find(x=>x.slots.includes(station.slot));
  assert.equal(row.catalogueUrl,station.sourcePage);
  assert.equal(row.providerLane,'COMMONS_EXACT_FILE_METADATA');
  assert.equal(row.displayPhotoCertified,false);
 }
});

test('the photo acquisition jobs only stage verified source originals, never mutate Prayer UI release manifest',()=>{
 const script=readFileSync('scripts/art/acquire-prayer-originals-batch01.py','utf8');
 const workflow=readFileSync('.github/workflows/prayer-artwork-originals-acquisition.yml','utf8');
 const stationsWorkflow=readFileSync('.github/workflows/prayer-artwork-san-polo-acquisition.yml','utf8');
 assert.match(script,/sha1\.hexdigest\(\)\.lower\(\)/);
 assert.match(script,/upload\.wikimedia\.org/);
 assert.match(script,/stageOnly/);
 assert.match(script,/releaseManifestChangeAllowed/);
 assert.match(workflow,/stage|Archive exact Wikimedia source originals/);
 assert.match(stationsWorkflow,/source-rights metadata/);
 assert.match(workflow,/PRAYER_RELEASED_IMAGE_ASSETS_V1/);
 assert.match(stationsWorkflow,/PRAYER_RELEASED_IMAGE_ASSETS_V1/);
 assert.doesNotMatch(workflow,/assets\/pray\/released/);
 assert.doesNotMatch(stationsWorkflow,/assets\/pray\/released/);
});
