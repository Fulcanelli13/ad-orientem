import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const r=JSON.parse(readFileSync(new URL('../data/artwork/research/m2m-wellcome-v0017627-verified-native-photo-20261110.v1.json',import.meta.url),'utf8'));
assert.equal(r.status,'FIRST_PARTY_WELLCOME_IIIF_SOURCE_BYTES_RETRIEVED_SHA256_INDEPENDENTLY_CHECKED_RESEARCH_ONLY');
assert.equal(r.work.workKey,'Wellcome:45078i');
assert.equal(r.work.calendarCandidateDate,'2026-06-07');
assert.equal(r.verifiedPhoto.photoId,'V0017627');
assert.equal(r.verifiedPhoto.role,'WHOLE_FRONT_OIL_PAINTING');
assert.equal(r.verifiedPhoto.exactFirstPartySourceUrl,'https://iiif.wellcomecollection.org/image/V0017627/full/max/0/default.jpg');
assert.equal(r.verifiedPhoto.sha256,'e1bf34e04d8e05e8a6b566675d9a892c9736cbe50e387b4ead50caf5d6af54c4');
assert.equal(r.verifiedPhoto.sha1,'78d2c2407bc77b68bc9b33be900298dfa515d9e2');
assert.deepEqual([r.verifiedPhoto.pixelWidth,r.verifiedPhoto.pixelHeight],[3550,1995]);
assert.equal(r.verifiedPhoto.byteLength,1655388);
assert.equal(r.verifiedPhoto.decodedMode,'RGB');
assert.equal(r.verifiedPhoto.independentArtifactByteHashVerified,true);
assert.equal(r.comparison.commonsSelectionAutoAllowed,false);
assert.equal(r.comparison.jpegBytesDiffer,true);
assert.equal(r.licence.attributionRequired,true);
assert.equal(r.displayQA.ownerCropApproved,false);
assert.equal(r.displayQA.realAppContainerTested,false);
assert.equal(r.githubActions.originalBytesInPublicRepo,false);
for(const gate of ['currentPerImageLicenceFinalSignoff','ownerDateSpecificApproval','formalPhoneCropApproval','productionImageImport','releaseReady']){
 assert.equal(r.gates[gate],false,'release gate '+gate+' remains closed');
}
console.log('PASS: Wellcome V0017627 official IIIF JPEG hashed, with all release and date-approval gates closed');
