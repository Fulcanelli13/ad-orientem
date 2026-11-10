import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const manifest=JSON.parse(readFileSync(new URL('../data/artwork/research/m2m-open-colour-photo-batch2-nationalmuseum-rijks-20261110.v1.json',import.meta.url),'utf8'));
assert.equal(manifest.status,'SOURCE_ACQUISITION_CANDIDATES_NOT_YET_HASH_VERIFIED');
assert.equal(manifest.candidates.length,3);
assert.deepEqual(manifest.candidates.map(x=>x.workKey).sort(),
 ['Nationalmuseum:NM1134','Nationalmuseum:NM420','Rijks:SK-A-868']);
const a=manifest.candidates.find(x=>x.workKey==='Nationalmuseum:NM420');
const b=manifest.candidates.find(x=>x.workKey==='Nationalmuseum:NM1134');
const c=manifest.candidates.find(x=>x.workKey==='Rijks:SK-A-868');
assert.equal(a.museumImageUrl,'https://collection.nationalmuseum.se/multimedia/5/multimedia-958995.large.jpg');
assert.equal(b.museumImageUrl,'https://collection.nationalmuseum.se/multimedia/3/multimedia-7493.large.jpg');
assert.equal(c.museumLinkedArtUrl,'https://data.rijksmuseum.nl/20026170?_profile=la-framed');
assert.equal(c.museumObjectId,'20026170');
assert.ok(a.pericopeNote.includes('Matthew 20'));
assert.ok(a.pericopeNote.includes('Matthew 21'));
for(const p of manifest.candidates){
 assert.equal(p.rightsVerifiedOnObject,true,p.workKey);
 assert.equal(p.originalPhotoDownloaded,false,p.workKey);
 assert.equal(p.sha256,null,p.workKey);
 assert.equal(p.formalMobileQA,false,p.workKey);
 assert.equal(p.ownerApproved,false,p.workKey);
 assert.equal(p.releaseReady,false,p.workKey);
}
assert.equal(manifest.specialHolds.length,2);
assert.ok(manifest.specialHolds.some(x=>x.workKey==='UMMA:1960/2.93'));
assert.equal(manifest.counts.sourcePhotosDownloadedAtManifestCreation,0);
assert.equal(manifest.counts.newReleases,0);
console.log('PASS: 3 exactly sourced Nationalmuseum/Rijks photo candidates remain research-only; UMMA and Walters holds intact.');
