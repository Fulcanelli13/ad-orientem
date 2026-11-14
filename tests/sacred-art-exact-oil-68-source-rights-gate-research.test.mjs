import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = file => JSON.parse(readFileSync(new URL('../' + file, import.meta.url), 'utf8'));
const triage = read('data/artwork/research/m2m-calendar-prepublication-triage-198-20261110.v1.json');
const batches = [
  ['data/artwork/research/m2m-exact-oil-source-rights-audit18-20261110.v1.json',18],
  ['data/artwork/research/m2m-exact-oil-source-rights-followup10-20261110.v1.json',10],
  ['data/artwork/research/m2m-exact-oil-source-rights-followup10b-20261110.v1.json',10],
  ['data/artwork/research/m2m-exact-oil-source-rights-followup15-20261110.v1.json',15],
  ['data/artwork/research/m2m-exact-oil-source-rights-final15-20261110.v1.json',15],
];
const oilEdges=triage.edges.filter(e=>e.priority==='P2_EXACT_OIL_MUSEUM_SOURCE_AND_IMAGE_QA');
const expected = new Set(oilEdges.map(e=>e.artworkKey));
assert.equal(oilEdges.length,79);
assert.equal(expected.size,68);
const audited = new Map();
for(const [path,count] of batches) {
  const batch=read(path);
  assert.equal(batch.records.length,count,path);
  for(const r of batch.records) {
    assert.ok(expected.has(r.workKey),'out-of-pool art key '+r.workKey);
    assert.ok(!audited.has(r.workKey),'duplicate oil art key '+r.workKey);
    assert.ok(r.catalogueUrl.startsWith('https://'),r.workKey);
    for (const flag of ['eligibleForProduction','releaseReady','ownerPlacementApproved','dateSpecificOwnerApproval','artworkPhotoVisualQAComplete','selectedImagePhotoQACertified','mobile390CropCertified','mobilePhoneCrop390Verified']) {
      if (flag in r) assert.equal(r[flag],false,r.workKey+': '+flag);
    }
    for (const hash of ['selectedImageFileSha256','selectedFileSHA256','selectedImagePhotoSHA256','exactPhotoSha256','selectedPhotoSha256']) {
      if(hash in r) assert.equal(r[hash],null,r.workKey+': '+hash);
    }
    audited.set(r.workKey,{path,record:r});
  }
}
assert.equal(audited.size,68);
assert.deepEqual([...audited.keys()].sort(),[...expected].sort());
const leonardi=audited.get('ICCD:0900053335').record;
assert.match(leonardi.sourceAccess,/NOT_CORROBORATED/);
assert.equal(leonardi.imageRightsStatus,'OBJECT_IDENTITY_AND_MEDIUM_HOLD');
assert.match(leonardi.sourceNotes,/1200232012/);
const pegrassi=audited.get('ICCD:0500404703').record;
assert.match(pegrassi.imageRightsStatus,/COPYRIGHT_REVIEW/);
assert.match(pegrassi.sourceNotes,/1957/);
const margaret=audited.get('NationalTrust:998409').record;
assert.match(margaret.imageRightsStatus,/NO_OPEN_PERMISSION/);
const claret=audited.get('IAPH:67609').record;
assert.match(claret.sourceNotes,/No hay ficheros asociados/);
console.log('Sacred Art exact-oil research gate: 68/68 distinct keys triaged; 79 date edges protected; all photo release holds intact.');
