import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const j=p=>JSON.parse(readFileSync(p,'utf8'));
const d=j('artifacts/pius-x-complete-corpus/SPX_Three_Document_Full_34_Turn_Claim_Map.json');
assert.deepEqual([d.counts.documents,d.counts.exchanges,d.counts.core,d.counts.optional,d.counts.bilingualLocalizedAnswers],[3,34,30,4,68]);
assert.equal(d.counts.canonicalOwnerMutations,0);
assert.equal(d.counts.published,0);
assert.equal(d.exceptions.length,2);
assert.equal(d.editorialCorrections.length,4);
assert.deepEqual(d.editorialCorrections.map(x=>x.segmentId),[
 'SPX.BENCH.ACERBO.T3.S2',
 'SPX.BENCH.ACERBO.T7.S2',
 'SPX.BENCH.ACERBO.T8.S2',
 'SPX.BENCH.HAERENT.T11.S2'
]);
const claimOverrides={
 A18:['Catechism of the Council of Trent','Lord\'s Prayer','four-to-five-year'],
 H31:['offered themselves to God','joined Pius X\'s prayers']
};
for(const [id,tokens] of Object.entries(claimOverrides))
 for(const token of tokens)assert(d.claims[id].meaning.includes(token),id+' lacks '+token);

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
const byTurn=new Map(d.scenes.flatMap(x=>x.turns).map(x=>[x.id,x]));
const segment=(turnId,segmentEnd)=>byTurn.get(turnId).segments.find(x=>x.id.endsWith(segmentEnd));
const attribution=segment('SPX.BENCH.ACERBO.T3','.S2');
assert(attribution.en.includes('We illustrated this'));
assert(attribution.fr.includes('Nous l’illustrions'));
const sermon=segment('SPX.BENCH.ACERBO.T7','.S2');
assert(sermon.en.includes('hearers’ hearts'));
assert(sermon.fr.includes('cœur de ses auditeurs'));
const catechesis=segment('SPX.BENCH.ACERBO.T8','.S2');
assert(catechesis.en.includes('Catechism of the Council of Trent'));
assert(catechesis.en.includes('Lord’s Prayer'));
assert(catechesis.fr.includes('Catéchisme du concile de Trente'));
assert(catechesis.fr.includes('Oraison dominicale'));
const offering=segment('SPX.BENCH.HAERENT.T11','.S2');
assert(offering.en.includes('offered themselves to God'));
assert(offering.fr.includes('s’offrent elles-mêmes à Dieu'));
assert.equal(segments,d.counts.segments);
assert.equal(segments,68);
assert(attributed>=7);
const acerbo=d.scenes.find(x=>x.sourceId==='ACERBO');
const haerent=d.scenes.find(x=>x.sourceId==='HAERENT');
assert.deepEqual(acerbo.turns.find(x=>x.id.endsWith('.T4')).sourceLoci,['§13']);
assert.deepEqual(haerent.turns.find(x=>x.id.endsWith('.T4')).sourceLoci,['§13','§14']);
console.log('PASS SPX: 34 exchanges, 68 aligned EN/FR segments, 30 core and 4 optional; source context and pending approvals preserved');
