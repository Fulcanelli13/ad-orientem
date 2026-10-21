import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const j=p=>JSON.parse(readFileSync(p,'utf8'));
const d=j('artifacts/pius-x-complete-corpus/SPX_Three_Document_Full_34_Turn_Claim_Map.json');
assert.deepEqual([d.counts.documents,d.counts.exchanges,d.counts.core,d.counts.optional,d.counts.bilingualLocalizedAnswers],[3,34,30,4,68]);
assert.equal(d.counts.canonicalOwnerMutations,0);
assert.equal(d.counts.published,0);
assert.equal(d.exceptions.length,2);
assert(Object.values(d.reviewGates).every(x=>x===false));
const expects={ACERBO:[10,1],ESUPREMI:[9,1],HAERENT:[11,2]};
let segments=0;const ids=new Set();let attributed=0;
for(const scene of d.scenes){
 const expected=expects[scene.sourceId];assert(expected);
 assert.deepEqual([scene.coreTurnIds.length,scene.optionalTurnIds.length],expected);
 for(const turn of scene.turns){
  assert(!ids.has(turn.id));ids.add(turn.id);
  assert.equal(turn.originalAddressee,d.sources[scene.sourceId].originalAudience);
  assert.equal(turn.speaker,'PIUS_X_CONVERSATIONAL_SOURCE_ADAPTATION');
  assert.equal(turn.speechMode,'ADAPTED_PAPAL_VOICE_NOT_HISTORICAL_QUOTE');
  const loc=new Set();
  for(const segment of turn.segments){
   segments++;
   assert(segment.en.length>24&&segment.fr.length>24);
   assert(segment.claimIds.length>0);
   if(segment.secondaryAuthority)attributed++;
   for(const id of segment.claimIds){
    const claim=d.claims[id];assert(claim,id);
    assert.equal(claim.doc,scene.sourceId);
    loc.add(claim.locus);
   }
  }
  assert.deepEqual(new Set(turn.sourceLoci),loc);
  assert(Object.values(turn.review).filter(x=>x===false).length>=5);
 }
}
assert.equal(segments,d.counts.segments);
assert.equal(segments,68);
assert(attributed>=7);
const acerbo=d.scenes.find(x=>x.sourceId==='ACERBO');
const haerent=d.scenes.find(x=>x.sourceId==='HAERENT');
assert.deepEqual(acerbo.turns.find(x=>x.id.endsWith('.T4')).sourceLoci,['§13']);
assert.deepEqual(haerent.turns.find(x=>x.id.endsWith('.T4')).sourceLoci,['§13','§14']);
console.log('PASS SPX: 34 exchanges, 68 aligned EN/FR segments, 30 core and 4 optional; source context and pending approvals preserved');
