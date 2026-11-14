import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const d=JSON.parse(readFileSync(new URL('../data/artwork/research/m2m-nationalmuseum-mnk-download-link-discovery-20261110.v1.json',import.meta.url),'utf8'));
assert.equal(d.status,'OFFICIAL_PORTAL_SEARCH_PENDING_NO_IMAGE_BYTES_OR_APPROVAL');
assert.deepEqual(d.records.map(x=>x.key),[
 'Nationalmuseum:NM420','Nationalmuseum:NM1134','MNK:II-a-448','MNK:II-a-9']);
assert.deepEqual(d.records.map(x=>x.accession),[
 'NM 420','NM 1134','MNK II-a-448','MNK II-a-9']);
assert.ok(d.records.slice(0,2).every(x=>x.firstPartyPortal==='https://media.nationalmuseum.se/search/all'));
assert.ok(d.records.slice(2).every(x=>x.firstPartyPortal==='https://zbiory.mnk.pl'));
assert.equal(d.runtimeConstraints.queryLimitPerArtwork,2);
assert.equal(d.runtimeConstraints.assetPageReviewLimitPerArtwork,12);
assert.equal(d.runtimeConstraints.noCommonsAutomaticAdmission,true);
assert.equal(d.runtimeConstraints.noPaidPermissionContact,true);
assert.equal(d.runtimeConstraints.noProductionWrites,true);
assert.equal(d.runtimeConstraints.noOwnerDateApprovals,true);
assert.equal(d.counts.previouslyVerifiedColourJpegs,9);
assert.equal(d.counts.newPhotoFilesAcquired,0);
assert.equal(d.counts.ownerPlacementApprovals,0);
assert.equal(d.counts.publicReleases,0);
for(const r of d.records) {
 assert.equal(r.mediaPortalAssetId,null);
 assert.equal(r.firstPartyOriginalImageUrl,null);
 assert.equal(r.sourceBytesRetrieved,false);
}
console.log('PASS: four strict first-party media investigations, nine preexisting sources and zero new photo/approval claims.');
