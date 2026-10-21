import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const path='data/learn/research/pius-x-document-first-three-benchmark-source-map-20261021.v1.json';
const d=JSON.parse(readFileSync(path,'utf8'));
assert.equal(d.schema,'AO_SPX_DOCUMENT_FIRST_CONVERSATION_BENCHMARKS_V1');
assert.equal(d.status,'UNAPPROVED_BILINGUAL_CONVERSATIONAL_ADAPTATIONS');
assert.equal(d.scenes.length,3);
assert.equal(d.counts.scenes,3);
assert.equal(d.counts.turns,12);
assert.equal(d.counts.bilingualSegments,26);
assert.equal(d.counts.canonicalOwnersChanged,0);
assert.equal(d.counts.newPublishedTurns,0);
for(const [key,value] of Object.entries(d.approvals))assert.equal(value,false,'approval cannot be set implicitly: '+key);
const ids=new Set(),secondary=[];
for(const scene of d.scenes){
 assert(d.sources[scene.sourceId]);
 assert.equal(scene.turns.length,4);
 for(const [i,turn] of scene.turns.entries()){
  assert(!ids.has(turn.id));ids.add(turn.id);
  assert.equal(turn.sourceId,scene.sourceId);
  assert.equal(turn.speaker,'PIUS_X_CONVERSATIONAL_SOURCE_ADAPTATION');
  assert.equal(turn.speechMode,'ADAPTED_PAPAL_VOICE_NOT_HISTORICAL_QUOTE');
  assert.equal(turn.documentNamedInSpeech,i===0);
  assert.equal(turn.originalAddressee,d.sources[scene.sourceId].originalAudience);
  assert.equal(turn.visitorAddressee,'lay reader');
  assert.equal(turn.grammaticalShift,'HISTORICAL_RETROSPECTIVE');
  for(const loc of ['en','fr']) assert(turn.visitor[loc].length>20);
  assert(turn.segments.length>=2);
  const pointed=new Set();
  for(const segment of turn.segments){
   assert(!ids.has(segment.id));ids.add(segment.id);
   assert(segment.claimIds.length>0);
   assert.equal(segment.kind,'SOURCE_BOUNDED_ADAPTATION');
   assert.equal(segment.en.trim(),segment.en);
   assert.equal(segment.fr.trim(),segment.fr);
   assert(/[.!?]$/.test(segment.en));
   assert(/[.!?]$/.test(segment.fr));
   assert(segment.en.length>25 && segment.fr.length>25);
   assert(!/\b(?:I|me|my|mine)\b/i.test(segment.en),'no English singular self-reference '+segment.id);
   assert(!/(?:^|[\s([{«])(?:je|moi|mon|ma|mes)(?=$|[\s.,!?;:)\]}»])/i.test(segment.fr),'no French singular self-reference '+segment.id);
   for(const c of segment.claimIds){
    const claim=d.primaryClaimCatalogue[c];
    assert(claim,segment.id+' missing claim '+c);
    assert.equal(claim.doc,scene.sourceId);
    pointed.add(claim.locus);
   }
   if(segment.secondaryAuthority){
    secondary.push(segment.secondaryAuthority);
    assert(/Benedict XIV|St Paul|Isaiah|Leo XIII|St Bernard|St Charles/.test(segment.secondaryAuthority));
   }
  }
  assert.deepEqual(new Set(turn.sourceLoci),pointed);
  assert(Object.keys(turn.sourceUrls).includes('la'));
  assert(Object.keys(turn.sourceUrls).includes(scene.sourceId==='HAERENT'?'it':'en'));
  assert.equal(Object.values(turn.review).filter(v=>v===false).length,5);
  assert.equal(turn.review.claimToLocus,'INTERNAL_PRELIMINARY_PASS');
  if(i===0){
   const title=d.sources[scene.sourceId].title;
   assert(turn.segments.some(s=>s.en.includes(title)&&s.fr.includes(title)),'opening must name the document');
  }
 }
}
assert.equal(secondary.length,6);
assert.equal(readFileSync('docs/research/PIUS-X-DOCUMENT-FIRST-CONVERSATION-EDITORIAL-STANDARD-20261021.md','utf8').includes('No interpretive conclusions'),true);
assert(!d.scenes.some(s=>s.turns.some(t=>t.review.final===true)));
console.log('PASS SPX source-first: 3 documents, 12 turns, 26 EN/FR aligned segments, 6 attributed secondary authorities, historic audience, explicit source loci, 0 release approvals.');
