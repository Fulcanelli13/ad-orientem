#!/usr/bin/env node
// R5D staging contract: exact research originals and all 15 approved slots.
// The output must remain NON-PUBLISHING until separate visual + responsive QA.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const root=process.cwd();
const load=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const evidence=load('data/pray/artwork-r5d-museum-source-verification-20261104.v1.json');
const queue=load('data/pray/artwork-r5c-bulk-acquisition-73-source-groups-20261103.v1.json');
const entries=[
  ['1916.786','cleveland-1916.786.jpg',9],
  ['437542','met-437542.jpg',6]
];
let total=0;
for(const [id,file,count] of entries){
  const row=evidence.records.find(r=>r.imageSourceRetrieval?.imageUrl?.includes(id) || r.imageSourceRetrieval?.artifactId && (id==='1916.786' ? r.sourcePage.includes('cleveland') : r.sourcePage.includes('metmuseum')));
  assert.ok(row,'Missing museum provenance '+id);
  const path='assets/prayer/research/r5d-museum-originals/'+file;
  const data=readFileSync(resolve(root,path));
  assert.equal(createHash('sha256').update(data).digest('hex'),row.imageSourceRetrieval.sha256,'File hash mismatch '+file);
  assert.equal(data.length,row.imageSourceRetrieval.bytes,'Byte length mismatch '+file);
  assert.equal(row.slots.length,count,'Assignment count mismatch');
  const canonicalUrl = value => { const u=new URL(value); return (u.hostname.startsWith('www.') ? u.hostname.slice(4) : u.hostname) + (u.pathname.endsWith('/') ? u.pathname.slice(0,-1) : u.pathname); };
  const source=queue.groups.find(g=>g.sourcePage && canonicalUrl(g.sourcePage)===canonicalUrl(row.sourcePage));
  assert.ok(source,'Not in editorial acquisition queue: '+file);
  assert.deepEqual([...row.slots].sort(),[...source.slots.filter(s=>!source.rosaryDeferred.includes(s))].sort(),'Slot drift '+file);
  assert.equal(row.publicationAuthorized,false);
  assert.equal(row.framingAndResponsiveQA,false);
  assert.ok(!row.slots.some(x=>/^STG-pray\.rosary-/.test(x)),'Rosary must stay deferred');
  total+=count;
}
assert.equal(total,15);
assert.equal(evidence.summary.publicationClearedSlots,0);
const released=readFileSync(resolve(root,'src/art/released-module-paintings.v1.js'),'utf8');
assert.ok(!released.includes('cleveland-1916.786.jpg')&&!released.includes('met-437542.jpg'),'Research images unexpectedly published');
console.log('R5D research staging verified: 2 exact originals, 15 approved assignments, 0 published.');
