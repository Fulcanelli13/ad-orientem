import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const x=JSON.parse(readFileSync(new URL('../data/artwork/research/m2m-open-source-batch3-msk-mnk-20261110.v1.json',import.meta.url),'utf8'));
assert.equal(x.status,'SECOND_RUN_ONE_MSK_IMAGE_VERIFIED_TWO_KRAKOW_OBJECT_IMAGE_LINKS_UNRESOLVED');
assert.deepEqual(x.candidates.map(r=>r.workKey),
 ['MSKGent:S-43','MNK:II-a-448','MNK:II-a-9']);
const [msk,cantius,stanislaus]=x.candidates;
assert.equal(msk.sourceManifest,'https://imagehub.mskgent.be/iiif/3/6344/manifest.json');
assert.equal(msk.objectRightsMark,'PUBLIC_DOMAIN');
assert.match(msk.photoReuseDisposition,/HIRES_COMMERCIAL_NEEDS_OBJECT_SPECIFIC/);
assert.equal(msk.publicationRightsUnconditional,false);
assert.equal(cantius.sourceObject,'https://zbiory.mnk.pl/en/search-result/catalog/377412?phrase=jan%2520kanty');
assert.equal(stanislaus.sourceObject,'https://zbiory.mnk.pl/pl/katalog/271512');
assert.match(stanislaus.sceneHold,/visual adjudication/);
for(const r of x.candidates){
 assert.equal(r.ownerApproved,false);
 assert.equal(r.releaseReady,false);
 assert.equal(r.publicationRightsUnconditional,false);
}
assert.equal(x.counts.sourcePhotosAcquired,1);
assert.equal(x.counts.lastExaminedAttempted,3);
assert.equal(x.counts.lastExaminedVerified,1);
assert.ok(x.candidates.every(r=>r.firstAttempt?.runId===42821076217 && r.firstAttempt?.status==='NOT_ACQUIRED'));
assert.equal(msk.iiifManifestConfirmed.imageServiceId,'https://imagehub.mskgent.be/iiif/2/public%2F6344.tif');
assert.equal(msk.firstAttempt.state,'RETRY_ON_CORRECTED_SCRIPT_QUEUED');
assert.equal(msk.originalPhotoDownloaded,true);
assert.equal(msk.sourcePhotoSha256,'b4ee3e06d0ec7de6b9ade82502e80098e564d50157a0d284a2a0b563da9c134b');
assert.deepEqual(msk.verifiedOriginalPixels,[2000,3887]);
assert.equal(x.latestRun.runId,42821674233);
assert.equal(x.latestRun.originallyDownloaded,1);
assert.equal(x.latestRun.unretrievedKrakow,2);
assert.equal(x.latestRun.appRightsFinalApproval,0);
assert.equal(x.latestRun.publicReleases,0);
assert.equal(cantius.firstAttempt.code,'NO_EXACT_OBJECT_OG_IMAGE');
assert.equal(stanislaus.firstAttempt.code,'NO_EXACT_OBJECT_OG_IMAGE');
assert.equal(x.counts.newPublicReleases,0);
const policies=x.policyHolds.flatMap(r=>r.workKeys);
assert.equal(policies.length,9);
assert.equal(new Set(policies).size,9);
assert.ok(policies.includes('Louvre:INV20573'));
assert.ok(policies.includes('Cincinnati:1917.58'));
assert.ok(policies.includes('Timken:1957:002'));
assert.ok(policies.includes('KHM:GG52'));
console.log('PASS: exact MSK/MNK first-party sources and nine policy holds; no owner approvals or releases.');
