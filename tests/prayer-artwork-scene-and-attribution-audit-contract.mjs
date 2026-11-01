import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  PRAYER_ARTWORK_SLOT_AUTHORITY,
  PRAYER_ARTWORK_REQUIRED_HOLDS
} from '../src/pray/artwork-slot-authority.v1.js';
import {
  PRAYER_RELEASED_IMAGE_ASSETS_V1,
  releaseClearedPrayerArtwork
} from '../src/pray/artwork-release-runtime.js';

const read = name => JSON.parse(readFileSync(name, 'utf8'));
const base = 'data/prayer/artwork-editorial-20261101/';
const master = read(base + 'curatorial-master-267-20261101.v1.json');
const crosswalk = read(base + 'selected-work-source-crosswalk-reconciled-267-20261101.v2.json');
const baseline = read('data/prayer/artwork-editorial-20261031/provisional-one-choice-per-267-art-position.v1.json');
const bySlot = new Map(master.assignments.map(row => [row.slot,row]));
const byCrosswalk = new Map(crosswalk.rows.map(row => [row.slot,row]));
const byBaseline = new Map(baseline.placements.map(row => [row.slot,row]));

test('verified painter is separate from legacy uploader; all 267 selections remain held for photo certification', () => {
  assert.equal(master.assignments.length, 267);
  assert.equal(bySlot.size, 267);
  assert.equal(crosswalk.rows.length, 267);
  assert.equal(Object.keys(PRAYER_ARTWORK_SLOT_AUTHORITY).length, 267);
  assert.equal(PRAYER_ARTWORK_REQUIRED_HOLDS.length, 14);
  assert.equal(Object.keys(PRAYER_RELEASED_IMAGE_ASSETS_V1).length, 0);
  assert.equal(master.publicationAllowed, false);
  assert.equal(master.count.userArtApprovalsGranted, 0);
  assert.equal(master.count.productionAssetsEnabled, 0);
  assert.equal(master.count.activeCandidateRelationshipsAfterConfirmedRejections, 1501);
  assert.equal(master.count.excludedHistoricalCandidateRelationshipsAfterConfirmedRejections, 105);

  const slots = [
    'HERO-11','STG-pray.confession-01','COV-prayer.lection',
    'STG-prayer.seven_sorrows_chaplet-04','STG-pray.rosary-15','COV-novena.assumption',
    'COV-weekday_benedictus','STG-pray.litany_saints-02',
    'STG-pray.angelus_regina-03','STG-pray.five_wounds-04',
    'COV-daily.personal_rule','STG-pray.st_joseph_seven_sorrows-08'
  ];
  assert.equal(master.curatorialAuditAddendum20261101.verifiedAttributionAndPresentationSlots,slots.length);
  for (const slot of slots) {
    const row = bySlot.get(slot);
    const verified = row.verifiedWorkMetadata;
    assert.ok(verified, slot);
    assert.equal(verified.historicalArtistPreserved,row.currentAssignment.painting.artist,slot);
    assert.equal(verified.historicalTitlePreserved,row.currentAssignment.painting.title,slot);
    assert.deepEqual(verified.originalArtworkIDs,row.currentAssignment.originalArtworkIDs||[],slot);
    assert.equal(byCrosswalk.get(slot).verifiedWorkMetadata.verifiedTitle,verified.verifiedTitle,slot);
    assert.equal(PRAYER_ARTWORK_SLOT_AUTHORITY[slot].displayTitle,verified.verifiedTitle,slot);
    assert.equal(PRAYER_ARTWORK_SLOT_AUTHORITY[slot].displayArtist,verified.verifiedPainter,slot);
    assert.equal(PRAYER_ARTWORK_SLOT_AUTHORITY[slot].productionApproved,false,slot);
    assert.equal(releaseClearedPrayerArtwork(slot),null,slot);
  }
  for(const slot of ['STG-pray.confession-01','COV-prayer.lection']) {
    assert.equal(PRAYER_ARTWORK_SLOT_AUTHORITY[slot].artist,'Jvillafruela');
    assert.equal(PRAYER_ARTWORK_SLOT_AUTHORITY[slot].displayArtist,'Jacques Blanchard');
    assert.equal(PRAYER_ARTWORK_SLOT_AUTHORITY[slot].photoRightsApprovalRequired,true);
    assert.equal(bySlot.get(slot).verifiedWorkMetadata.photographLicence,'CC BY-SA 4.0');
  }
  assert.equal(PRAYER_ARTWORK_SLOT_AUTHORITY['HERO-11'].artist,'DCHNwam');
  assert.equal(PRAYER_ARTWORK_SLOT_AUTHORITY['HERO-11'].displayArtist,'Peter Paul Rubens');
  assert.match(bySlot.get('HERO-11').verifiedWorkMetadata.attributionNote,/Joconde/);
  assert.equal(PRAYER_ARTWORK_SLOT_AUTHORITY['STG-prayer.seven_sorrows_chaplet-04'].displayArtist,null);
  assert.equal(PRAYER_ARTWORK_SLOT_AUTHORITY['STG-pray.st_joseph_seven_sorrows-08'].displayArtist,'Guido Reni and studio');
  assert.equal(PRAYER_ARTWORK_SLOT_AUTHORITY['STG-pray.st_joseph_seven_sorrows-08'].photoRightsApprovalRequired,true);
  assert.equal(PRAYER_ARTWORK_SLOT_AUTHORITY['STG-pray.five_wounds-04'].displayTitle,'The Incredulity of Saint Thomas');
  assert.equal(PRAYER_ARTWORK_SLOT_AUTHORITY['COV-daily.personal_rule'].displayTitle,'The Virgin in Prayer');
});

test('new scene relationship and scoped permissions are observational, not a change to approved paintings', () => {
  const affected=master.assignments.filter(row=>row.sceneAndScopeAudit);
  assert.equal(affected.length,14);
  for (const row of affected) {
    const audit=row.sceneAndScopeAudit;
    assert.equal(audit.currentSelectionRetained,true,row.slot);
    assert.equal(audit.productionEnabled,false,row.slot);
    assert.equal(byCrosswalk.get(row.slot).sceneAndScopeAudit.kind,audit.kind,row.slot);
    assert.equal(PRAYER_ARTWORK_SLOT_AUTHORITY[row.slot].sceneRelationship,audit.kind,row.slot);
    assert.equal(row.productionEnabled,false,row.slot);
  }
  assert.equal(bySlot.get('HERO-03').currentAssignment.painting.title,'Adoration of the Magi');
  assert.equal(PRAYER_ARTWORK_SLOT_AUTHORITY['HERO-03'].exactSlotPublicationHold,true);
  assert.equal(bySlot.get('HERO-03').sceneAndScopeAudit.kind,'APPROVAL_SCOPE_RECHECK');
  assert.equal(PRAYER_ARTWORK_SLOT_AUTHORITY['STG-pray.rosary-04'].photoSourceHold,true);
  assert.equal(bySlot.get('STG-pray.precious_blood-07').sceneAndScopeAudit.kind,
    'EXPLICIT_USER_AUTHORIZED_CONTEXTUAL');
  assert.equal(bySlot.get('STG-pray.five_wounds-05').sceneAndScopeAudit.kind,
    'EXPLICIT_USER_AUTHORIZED_CONTEXTUAL');
  assert.equal(bySlot.get('STG-pray.st_joseph_seven_sorrows-06')
    .sceneAndScopeAudit.exactSceneAcceptedAlternativeId,'CANONICAL::cma-130392');
  assert.ok(bySlot.get('STG-pray.st_joseph_seven_sorrows-06').explicitlyAcceptedOptions
    .some(option=>option.artworkId==='CANONICAL::cma-130392' &&
      /Return of the Holy Family to Nazareth/.test(option.title)));
  assert.equal(bySlot.get('STG-pray.precious_blood-06')
    .sceneAndScopeAudit.exactSceneAcceptedAlternativeId,'CANONICAL::cma-97147');

  // New QA fields must not silently rewrite primary selections.
  const fiveRestores=new Set([
    'COV-daily.morning','COV-daily.evening','COV-prayer.hymns',
    'COV-pray.angelus_regina','STG-pray.rosary-12'
  ]);
  for (const row of master.assignments) {
    const orig=byBaseline.get(row.slot).assignment;
    if(fiveRestores.has(row.slot))
      assert.deepEqual(row.supersededAssignment,orig,row.slot);
    else if(row.currentAssignment.mode==='HOLD_NO_ELIGIBLE_PRIMARY')
      assert.deepEqual(row.heldPreviousAssignment,orig,row.slot);
    else
      assert.deepEqual(row.currentAssignment,orig,row.slot);
  }
});

test('all five original uploader-labelled source proposals have verified artist metadata and no release authority', () => {
  let found=0;
  for(const family of ['3','8','9','home']){
    const shard=read('data/prayer/artwork-editorial-20261031/collection-family-'+family+'.v1.json');
    for(const slot of shard.slots)for(const cand of slot.reviewCollection||[]){
      const ids=cand.sourceIDs||[];
      if(!ids.includes('REVIEW::commons:85666930') &&
         !ids.includes('REVIEW::commons:163856843'))continue;
      found++;
      assert.ok(cand.verifiedWorkMetadata,slot.slot);
      assert.equal(cand.verifiedWorkMetadata.paintingChoiceUnchanged,true,slot.slot);
      assert.equal(cand.verifiedWorkMetadata.publicationAllowed,false,slot.slot);
      assert.equal(cand.productionEnabled,false,slot.slot);
      assert.ok(['Jacques Blanchard','Peter Paul Rubens'].includes(
        cand.verifiedWorkMetadata.verifiedPainter),slot.slot);
      if(ids.includes('REVIEW::commons:85666930'))
        assert.equal(cand.verifiedWorkMetadata.currentPrayerLicenceExceptionApplies,false,slot.slot);
    }
  }
  assert.equal(found,5);
});

test('scope hold cannot be bypassed even by a complete synthetic photo release proof',()=>{
  const slot='HERO-03';
  const authority=PRAYER_ARTWORK_SLOT_AUTHORITY[slot];
  const image={
    slotId:slot,title:authority.title,artist:authority.artist,
    path:'assets/pray/released/epiphany.webp',
    publicationState:'READY_FOR_PUBLICATION',productionEnabled:true,editorialApproved:true,
    sourceCredit:'Research',sourceCollectionUrl:'https://commons.wikimedia.org/wiki/File:Example.jpg',
    photographerCredit:'Verified photo credit',licenseName:'Public Domain Mark',
    licenseUrl:'https://creativecommons.org/publicdomain/mark/1.0/',
    modificationsDescription:'None',
    releaseEvidence:{
      selectedOriginalArtworkId:authority.ids[0],
      exactOriginalObjectVerified:true,approvedForThisExactPrayerSlot:true,
      actualFileReuseRightsCleared:true,originalSourceFileArchived:true,
      sourceOriginalSha256:'a'.repeat(64),releaseImageSha256:'b'.repeat(64),
      nativeResolutionVerified:true,nativeWidth:1600,nativeHeight:1900,
      visualQualityHumanPassed:true,physicalFrameAbsent:true,
      gallerySurroundAbsent:true,noSyntheticFill:true,
      mobileCropApproved:true,desktopCropApproved:true,appRenderVerified:true
    }
  };
  assert.equal(releaseClearedPrayerArtwork(slot,{manifest:{[slot]:image}}),null);
  const unrestricted={...authority,exactSlotPublicationHold:false};
  assert.ok(releaseClearedPrayerArtwork(slot,{
    manifest:{[slot]:image},authority:{[slot]:unrestricted}
  }));
});
