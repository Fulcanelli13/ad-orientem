import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {PRAYER_RELEASED_IMAGE_ASSETS_V1} from '../src/pray/artwork-release-runtime.js';

const base='data/prayer/artwork-editorial-20261101/';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const pin=read(base+'prayer-rosary-b02-exact-source-acquisition-20261101.v1.json');
const report=read(base+'prayer-rosary-b02-acquisition-results.v1.json');
const queue=read(base+'photo-release-acquisition-queue-267-20261101.v1.json');
const master=read(base+'curatorial-master-267-20261101.v1.json');
const bySlot=new Map(master.assignments.map(x=>[x.slot,x]));

test('Rosary B02 pins four exact original paintings with no Prado, replacement, new approvals or publication',()=>{
 assert.equal(pin.stageOnly,true);
 assert.equal(pin.releaseManifestChangeAllowed,false);
 assert.equal(pin.noSubstitutions,true);
 assert.equal(pin.noPradoPhotos,true);
 assert.equal(pin.records.length,4);
 assert.deepEqual(pin.records.map(x=>x.slot),[
   'STG-pray.rosary-02','STG-pray.rosary-05',
   'STG-pray.rosary-06','STG-pray.rosary-11'
 ]);
 assert.equal(report.mode,'stage');
 assert.equal(report.publicationAllowed,false);
 assert.equal(report.photographsPublicationCertified,0);
 assert.equal(report.productionImageManifestChanges,0);
 assert.equal(Object.keys(PRAYER_RELEASED_IMAGE_ASSETS_V1).length,0);
 assert.equal(report.sourceFilesStaged,4);
 assert.equal(report.sourceFilesVerified,4);
 assert.equal(report.results.length,4);
 assert.equal(queue.counts.photographSourceFilesArchived,13);
 assert.equal(queue.counts.distinctArtworkGroupsWithArchivedOriginals,12);
 assert.equal(queue.counts.photoReproductionsFullyCleared,0);
 assert.equal(queue.queue.reduce((n,x)=>n+(x.photosAcquired||0),0),13);
});

test('Each staged source is an actual checksum-matched original, not an image URL or merely a preview',()=>{
 for(const pinned of pin.records){
  const source=report.results.find(x=>x.id===pinned.id);
  assert.ok(source,pinned.id);
  assert.equal(source.slot,pinned.slot);
  assert.equal(source.status,'STAGED_ORIGINAL_NOT_PUBLICATION_CERTIFIED',pinned.id);
  assert.equal(source.originalPaintingIdentityVerifiedForSelection,true,pinned.id);
  assert.equal(source.actualPhotographQualityHumanApproved,false,pinned.id);
  assert.equal(source.appImageReleaseCertified,false,pinned.id);
  assert.equal(source.photoRightsForAppCleared,false,pinned.id);
  assert.ok(source.nativeWidth>=800&&source.nativeHeight>=800,pinned.id);
  assert.match(source.sourceSha256,/^[0-9a-f]{64}$/);
  assert.ok(source.stagedPath.startsWith('assets/staged/prayer-artwork-originals-20261101/'));
  assert.ok(existsSync(source.stagedPath),source.stagedPath);
  const raw=readFileSync(source.stagedPath);
  assert.equal(raw.byteLength,source.sourceBytes,pinned.id);
  assert.equal(createHash('sha256').update(raw).digest('hex'),source.sourceSha256,pinned.id);
  assert.equal(source.sourcePage,pinned.sourcePage,pinned.id);
  assert.equal(source.fileLicence==='CC0'||source.fileLicence==='Public domain',true,pinned.id);
  const slot=bySlot.get(pinned.slot);
  assert.ok(slot?.currentAssignment?.painting,pinned.slot);
  assert.ok((slot.currentAssignment.originalArtworkIDs||[]).some(
     id=>pinned.expectedOriginalArtworkIds.includes(id)),pinned.slot);
  const group=queue.queue.find(x=>x.slots.includes(pinned.slot));
  assert.ok(group,pinned.slot);
  assert.equal(group.photosAcquired,1,pinned.slot);
  assert.equal(group.photographReleaseState,
    'SOURCE_ORIGINAL_ARCHIVED_VISUAL_AND_CROP_QA_PENDING',pinned.slot);
  assert.equal(group.archivedSourceFiles[0].sha256,source.sourceSha256,pinned.slot);
  assert.equal(group.archivedSourceFiles[0].photoRightsForApp,'NOT_CLEARED',pinned.slot);
  assert.equal(group.archivedSourceFiles[0].publicationAllowed,false,pinned.slot);
 }
});

test('11 of 15 traditional Rosary mysteries are archived; three need source and Coronation remains held',()=>{
 const archived=[];
 for(let i=2;i<=16;i++){
  const slot='STG-pray.rosary-'+String(i).padStart(2,'0');
  const group=queue.queue.find(g=>g.slots.includes(slot));
  if((group?.photosAcquired||0)>0)archived.push(slot);
 }
 assert.equal(archived.length,11);
 for(const slot of ['STG-pray.rosary-04','STG-pray.rosary-13','STG-pray.rosary-14']){
   assert.ok(!archived.includes(slot),slot);
 }
 assert.equal(bySlot.get('STG-pray.rosary-16').currentAssignment.mode,
   'HOLD_NO_ELIGIBLE_PRIMARY');
 assert.equal(bySlot.get('STG-pray.rosary-17').currentAssignment.mode,
   'HOLD_NO_ELIGIBLE_PRIMARY');
 assert.equal(queue.stateB02Rosary20261101.rosaryMysterySelectedOriginalsArchived,11);
 assert.equal(queue.stateB02Rosary20261101.rosaryCoverLottoArchived,true);
});
