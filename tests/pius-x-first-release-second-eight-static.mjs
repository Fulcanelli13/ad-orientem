import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const json=p=>JSON.parse(readFileSync(p,'utf8'));
const dir='data/learn/research/';
const batch=json(dir+'pius-x-first-release-second-eight-source-locked-20261021.v1.json');
const all=json('artifacts/pius-x-complete-corpus/SPX_Balanced_130_Release_Candidates.json');
const authors=json(dir+'pius-x-82chapter-dialogue-authoring-index-20261021.v1.json');
const roots=new Set([...authors.priorChapters,...authors.newChapters.map(x=>x.id)]);
const selected=new Map(all.candidates.map((x,i)=>[x.id,{...x,rank:i+1}]));
const ownerPaths=[
dir+'pius-x-batch2-a1-20261019.v1.json',
dir+'pius-x-batch2-a2-20261019.v1.json',
dir+'pius-x-batch2-a3-20261019.v1.json',
dir+'pius-x-ten-conversation-content-pilot-20261019.v1.json'
];
const ownerMap=new Map(ownerPaths.flatMap(p=>{
 const v=json(p),r=v.records||v.episodes;
 return r.map(x=>[x.id,{file:p,record:x}]);
}));
assert.equal(batch.schema,'AO_SPX_FIRST_RELEASE_SECOND_EIGHT_SOURCE_LOCKED_SCENES_V1');
assert.equal(batch.release.sourceReviewerApproved,false);
assert.equal(batch.release.theology,false);
assert.equal(batch.release.translationEN,false);
assert.equal(batch.release.translationFR,false);
assert.equal(batch.release.periodVoice,false);
assert.equal(batch.release.production,false);
assert.equal(batch.counts.existingChapters,8);
assert.equal(batch.counts.ENFRPairs,24);
assert.equal(batch.counts.localizedAnswers,48);
assert.equal(batch.counts.newChapterIDs,0);
assert.equal(batch.counts.allOriginalSourceOwnersUnchanged,true);
assert.equal(all.actual,130);
const expect=['SPX-022','SPX-028','SPX-059','SPX-013','SPX-026','SPX-001','SPX-PILOT-07','SPX-PILOT-08'];
assert.deepEqual(batch.records.map(x=>x.id),expect);
let editorial=0;
for(const row of batch.records){
 assert(roots.has(row.id),'not an existing authoring root '+row.id);
 const selectedItem=selected.get(row.id),owner=ownerMap.get(row.id);
 assert(selectedItem&&owner,'not in 130 selector or original owner '+row.id);
 assert.equal(row.releaseCandidateRank,selectedItem.rank);
 assert.equal(row.category,selectedItem.category);
 assert.equal(row.owner.file,owner.file);
 assert.equal(row.originalSource.url,selectedItem.source.url);
 assert.equal(row.turns.length,3);
 for(let i=0;i<3;i++){
  const t=row.turns[i];
  for(const loc of ['en','fr']){
   assert(t.q[loc].length>=15,t.id+loc+' question');
   assert(t.a[loc].length>=50,t.id+loc+' answer');
  }
  assert(t.loci.length>=1&&t.loci.every(l=>/^(?:Q\d+|§\d+)$/.test(l)));
  assert.equal(t.historicalQuotation,false);
  assert.equal(t.approved,false);
  assert(t.id.includes(row.id));
  if(t.speaker==='OUT_OF_CHARACTER_EDITORIAL_BOUNDARY'){
   assert(i===2);
   assert(['SPX-026','SPX-PILOT-07'].includes(row.id));
   editorial++;
  }else assert.equal(t.speaker,'SOURCE_BOUNDED_EDUCATIONAL_CHARACTER_RECONSTRUCTION');
 }
 assert(row.originalSource.sourceNumbering==='LATER_EDITORIAL_NUMBERING' || row.originalSource.sourceNumbering==='PUBLISHED_SECTION_NUMBERS');
}
assert.equal(editorial,2);
const html=readFileSync('previews/pius-x-second-eight-first-release-source-locked-20261021.html','utf8');
const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
assert.equal(scripts.length,2);
const embedded=JSON.parse(scripts[0]);
assert.equal(embedded.records.length,8);
for(let i=0;i<8;i++){
 assert.equal(embedded.records[i].id,batch.records[i].id);
 assert.deepEqual(embedded.records[i].turns.map(x=>x.visitor),batch.records[i].turns.map(x=>x.q));
 assert.deepEqual(embedded.records[i].turns.map(x=>x.reply),batch.records[i].turns.map(x=>x.a));
}
new Function(scripts[1]);
assert(html.includes('editorial-boundary'));
assert(html.includes("OUT_OF_CHARACTER_EDITORIAL_BOUNDARY"));
assert(html.includes('id="exportTop"'));
const doc=readFileSync('docs/research/PIUS-X-SECOND-EIGHT-FIRST-RELEASE-TRANSCRIPTS-20261021.md','utf8');
assert(doc.includes('## 8. SPX-PILOT-08'));
console.log('PASS SPX second eight: 8 original 130/82-overlap ids, 24 bilingual passages, 48 translations, 2 editorial boundaries, original owners preserved, standalone preview parsed.');
