import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = file => JSON.parse(readFileSync(new URL('../' + file, import.meta.url), 'utf8'));
const triage = read('data/artwork/research/m2m-calendar-prepublication-triage-198-20261110.v1.json');
const sourceAudit = read('data/artwork/research/m2m-exact-oil-source-rights-audit18-20261110.v1.json');
const photoQueue = read('data/artwork/research/m2m-open-photo-acquisition-queue6-20261110.v1.json');

assert.equal(sourceAudit.status,'RESEARCH_ONLY_SOURCE_RIGHTS_METADATA_NO_IMAGE_BYTES');
assert.equal(sourceAudit.records.length,18);
assert.equal(new Set(sourceAudit.records.map(x=>x.workKey)).size,18);
assert.equal(triage.edges.filter(x=>x.priority==='P2_EXACT_OIL_MUSEUM_SOURCE_AND_IMAGE_QA').length,79);
assert.equal(new Set(triage.edges.filter(x=>x.priority==='P2_EXACT_OIL_MUSEUM_SOURCE_AND_IMAGE_QA').map(x=>x.artworkKey)).size,68);
assert.deepEqual(sourceAudit.counts,{
 uniqueOilWorkKeysAudited:18,relatedBaselineExactOilEdgePool:79,distinctExactOilWorkKeysInPool:68,
 explicitOpenImageSourcePolicyCandidates:6,officialPhotographsNoncommercialRestricted:2,
 photoRightsNotYetEstablished:10,exactImageBytesDownloaded:0,photoHashVerified:0,
 mobileImageCropsCertified:0,dateSpecificOwnerApprovals:0,releaseReadyPhotos:0,
 confirmedOpenColourFrontSourceCandidates:4,openButWrongSideOrMonochromeRecords:2
});
const allOils = new Set(triage.edges.filter(x=>x.priority==='P2_EXACT_OIL_MUSEUM_SOURCE_AND_IMAGE_QA').map(x=>x.artworkKey));
for(const item of sourceAudit.records){
 assert.ok(allOils.has(item.workKey),'oil source audit must only include priority oil keys: '+item.workKey);
 assert.ok(item.catalogueUrl.startsWith('https://'));
 assert.equal(item.downloadedPhotoBytes,false);
 assert.equal(item.selectedImageFileSha256,null);
 assert.equal(item.photoWidthPx,null);
 assert.equal(item.photoHeightPx,null);
 assert.equal(item.mobilePhoneCrop390Verified,false);
 assert.equal(item.artworkPhotoVisualQAComplete,false);
 assert.equal(item.dateSpecificOwnerApproval,false);
 assert.equal(item.eligibleForProduction,false);
}
const cc0=sourceAudit.records.filter(x=>x.photographedImageRightsStatus.includes('CC0'));
assert.deepEqual(cc0.map(x=>x.workKey).sort(),['Met:1991.153','Met:435901','Met:469892','Met:724811','Walters:37.1146'].sort());
assert.equal(sourceAudit.records.filter(x=>x.photographedImageRightsStatus==='CC_BY_4_REVERSE_PHOTO_ONLY_FRONT_RIGHTS_UNCONFIRMED').length,1);
assert.deepEqual(sourceAudit.records.filter(x=>x.photographedImageRightsStatus.includes('NONCOMMERCIAL')).map(x=>x.workKey).sort(),['NationalGalleriesScotland:NG2238','Thyssen:31'].sort());
const restricted=sourceAudit.records.filter(x=>x.photographedImageRightsStatus.includes('NONCOMMERCIAL'));
assert.ok(restricted.every(x=>x.priority==='P0_RESTRICTED_IMAGE_SOURCE_DO_NOT_USE'));
assert.ok(sourceAudit.records.find(x=>x.workKey==='Thyssen:31').imageAccessAndQA.includes('forbid altered images'));
assert.ok(sourceAudit.records.find(x=>x.workKey==='ICCD:0300180045').photographedImageRightsStatus.startsWith('METADATA_'));
assert.ok(sourceAudit.records.find(x=>x.workKey==='Rijks:SK-A-868').imageAccessAndQA.includes('pixel/crop'));
assert.ok(sourceAudit.records.find(x=>x.workKey==='Holburne:A17').objectAndSceneNote.includes('Piazzetta'));
assert.ok(sourceAudit.records.find(x=>x.workKey==='Walters:37.1146').imageAccessAndQA.includes('monochrome'));
assert.ok(sourceAudit.records.find(x=>x.workKey==='Met:469892').objectAndSceneNote.includes('catalogue-medium conflict'));
assert.ok(sourceAudit.records.find(x=>x.workKey==='Louvre:RF1966.1').objectAndSceneNote.includes('provenance gap'));
assert.equal(photoQueue.status,'FOUR_SOURCE_JPEGS_VERIFIED_EPHEMERAL_ARTIFACT_NO_PUBLICATION_AUTHORITY');
assert.equal(photoQueue.records.length,6);
assert.deepEqual(photoQueue.counts,{
 firstPartyOpenImageWorkKeys:6,firstPartyUrlsFound:5,firstPartyMetColourUrlsStaged:4,
 readyForGithubRunnerNetworkAttempt:4,heldForWrongVersoOrUnverifiedWholeFront:1,
 heldForMonochromeOnly:1,downloadedExactFiles:4,sourceBytesHashed:4,
 preliminary390PreviewsInspected:4,selectedPhotosColorAndPixelQACertified:0,
 dateSpecificOwnerApproval:0,publicReleaseCandidatesReady:0,
 durableOriginalFilesInGithubAppRepository:0
});
for(const q of photoQueue.records){
 const src=sourceAudit.records.find(x=>x.workKey===q.key);
 assert.ok(src,'staged photo key has no source-audited object: '+q.key);
 assert.ok(src.photographedImageRightsStatus.includes('CC0')||src.photographedImageRightsStatus==='CC_BY_4_REVERSE_PHOTO_ONLY_FRONT_RIGHTS_UNCONFIRMED');
 assert.equal(q.ownerDatePlacementAuthority,false);
 assert.equal(q.productionEligible,false);
 if(q.key.startsWith('Met:')){
  assert.equal(q.originalFileAcquired,true,'four Met source JPEGs were retrieved');
  assert.match(q.sha256,/^[0-9a-f]{64}$/);
  assert.ok(Number.isInteger(q.pixelWidth)&&q.pixelWidth>1000);
  assert.ok(Number.isInteger(q.pixelHeight)&&q.pixelHeight>1000);
  assert.equal(q.acquisitionStatus,'ORIGINAL_MUSEUM_JPEG_DOWNLOADED_AND_CHECKSUM_VERIFIED_EPHEMERAL');
  assert.equal(q.acquiredEphemerallyInGithubActions,true);
  assert.equal(q.durableSourceBytesInGithubRepo,false);
  assert.equal(q.finalPhotoRightVerifiedForExactBytes,true);
  assert.equal(q.mobile390PhotoCropPass,null);
 }else{
  assert.equal(q.originalFileAcquired,false);
  assert.equal(q.sha256,null);
  assert.equal(q.pixelWidth,null);
  assert.equal(q.pixelHeight,null);
  assert.equal(q.finalPhotoRightVerifiedForExactBytes,false);
 }
}
assert.equal(photoQueue.records.filter(x=>x.firstPartyPhotoUrl).length,5);
assert.equal(photoQueue.records.find(x=>x.key==='Walters:37.1146').remoteUrlStatus,'THREE_FIRST_PARTY_CC0_DOWNLOADS_ARE_GRAYSCALE');
assert.ok(photoQueue.records.find(x=>x.key==='Wellcome:45078i').photoLicence.includes('BACK OF CANVAS'));
assert.equal(photoQueue.records.find(x=>x.key==='Wellcome:45078i').firstPartyPhotoUrl,null);
assert.equal(photoQueue.records.find(x=>x.key==='Wellcome:45078i').historicalWrongImageRecord,'https://wellcomecollection.org/works/jgxd7rrf/images?id=jvt9hwrm');
assert.ok(photoQueue.records.find(x=>x.key==='Wellcome:45078i').researchImageEvidence.some(x=>x.iiifIdentifier==='L0014632'&&x.role==='BACK_OF_CANVAS'));
assert.deepEqual(photoQueue.records.filter(x=>x.originalFileAcquired).map(x=>x.key).sort(),['Met:1991.153','Met:435901','Met:469892','Met:724811'].sort());
assert.ok(photoQueue.records.filter(x=>x.originalFileAcquired).every(x=>new URL(x.firstPartyPhotoUrl).hostname==='images.metmuseum.org'));
assert.equal(sourceAudit.records.find(x=>x.workKey==='Wellcome:45078i').priority,'P0_RESOLVE_WHOLE_FRONT_IMAGE_SOURCE_AND_LICENSE');
console.log('PASS: 18 oil works, 4 Met originals acquired and hashed in ephemeral artifact; Wellcome reverse/Walters greyscale held; zero app releases.');
