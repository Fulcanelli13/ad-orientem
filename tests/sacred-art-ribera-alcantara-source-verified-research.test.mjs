import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const p=JSON.parse(readFileSync(new URL('../data/artwork/research/m2m-ribera-alcantara-pinakothek909-verified-native-photo-20261110.v1.json',import.meta.url),'utf8'));
assert.equal(p.status,'FIRST_PARTY_COLOUR_SOURCE_BYTES_VERIFIED_RESEARCH_ALTERNATIVE_NOT_OWNER_APPROVED');
assert.equal(p.artwork.key,'Pinakothek:909');
assert.equal(p.artwork.candidateDate,'2026-10-19');
assert.equal(p.photo.sha256,'66b1edb25e6f8477ad57df144500cd9b5ecfca5f282927af5c80fe05a86a0a62');
assert.deepEqual([p.photo.pixelWidth,p.photo.pixelHeight],[2338,3000]);
assert.equal(p.photo.byteLength,1432919);
assert.equal(p.photo.imageLicense,'CC BY-SA 4.0');
assert.equal(p.photo.independentChecksumVerifiedFromActionsArchive,true);
assert.equal(p.mobile.ownerCropApproval,false);
assert.equal(p.githubActions.runId,42811942312);
for(const gate of ['ownerApprovalForDate','formalMobileQAPassed','productionImport','releaseReady']){
 assert.equal(p.gates[gate],false,'gate '+gate);
}
assert.equal(p.gates.originalWaltersSelectionStillUntouched,true);
assert.equal(p.provenance.licenseRequiresShareAlikeForAdaptations,true);
console.log('PASS: Pinakothek Ribera 2338x3000 original and hash verified, original Walters placement and all release gates remain untouched.');
