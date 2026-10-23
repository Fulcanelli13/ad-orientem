import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readCorpus,selectEvidence,composeDraft} from '../tools/pius-x-generative-review.mjs';

const html=readFileSync('artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html','utf8');
const store=readCorpus(html);
assert.equal(store.data.counts.allNodes,423);
assert.equal(store.chapters.size,106);
assert.equal(store.sourceOnlyGate.size,12);
assert.equal(store.data.approvals.publishing,false);

let eligible=0, held=0;
const all=new Set(store.chapters.keys());
for(const c of store.chapters.values()){
 const input={chapterId:c.id,nodeId:c.nodes[0].id,
  language:'en',question:c.nodes[0].q.en};
 const result=selectEvidence(store,input);
 if(result.status==='eligible'){
  eligible++;
  assert(store.sourceOnlyGate.has(c.id));
  assert.equal(result.evidence.length,1);
  assert.equal(result.evidence[0].id,c.nodes[0].id);
  assert(result.evidence[0].originalLanguageWitnesses.length>0);
  assert(result.evidence[0].text.length>12);
  assert(!result.evidence[0].text.includes(c.nodes[0].a.en));
  assert(!result.evidence[0].text.includes(c.nodes[0].a.fr));
 }else{
  held++;
  assert(result.status==='held');
 }
}
assert.equal(eligible,12);
assert.equal(held,94);
assert.equal(all.size,106);
for(const id of ['SPX-PILOT-07','SPX-NEW-021','SPX-NEW-013','SPX-EXP-037',
 'SPX-NEW-003','SPX-NEW-008','SPX-NEW-007','SPX-013']){
 const c=store.chapters.get(id);
 const a=selectEvidence(store,{chapterId:id,nodeId:c.nodes[0].id,language:'fr',question:c.nodes[0].q.fr});
 assert.equal(a.status,'eligible');
 assert.equal(a.evidence[0].primaryWitnessStatus,'NARROW_SOURCE_CLAIM_CANDIDATES_UNAPPROVED');
 assert(a.evidence[0].editorialWarnings.some(w=>w.includes('complete existing editorial answer')));
 if(c.nodes.length>1){
  const next=selectEvidence(store,{chapterId:id,nodeId:c.nodes[1].id,language:'en',question:c.nodes[1].q.en});
  assert.equal(next.status,'held');
  assert.equal(next.reason,'followup_not_mapped_to_primary_source_claim');
 }
}
const legacy=store.chapters.get('SPX-PILOT-01');
const short=selectEvidence(store,{chapterId:legacy.id,nodeId:legacy.nodes[0].id,
 language:'en',question:legacy.nodes[0].q.en});
assert.equal(short.status,'eligible');
assert.equal(short.evidence[0].primaryWitnessStatus,'BOUNDED_ORIGINAL_EXCERPTS_UNAPPROVED');
const unresolved=store.chapters.get('SPX-EXP-014');
const unresolvedInput={chapterId:unresolved.id,nodeId:unresolved.nodes[0].id,
 language:'en',question:unresolved.nodes[0].q.en};
assert.equal(selectEvidence(store,unresolvedInput).reason,'no_original_language_witness_for_selected_subject');
let calls=0,seen;
const fake=async (purpose,messages)=>{
 calls++;
 const data=JSON.parse(messages[1].content);
 if(purpose==='compose'){
  seen=data;
  return {mode:'answer',text:'Only the bounded, original-language-source-supported claims may be considered in this private editorial study.',
   evidenceIds:[data.evidence[0].id],expression:'thoughtful'};
 }
 return {supported:true,allClaimsSupported:true,ids:data.candidate.ids};
};
assert.equal((await composeDraft(store,unresolvedInput,fake)).reason,'no_original_language_witness_for_selected_subject');
assert.equal(calls,0,'Uncollated topic invoked inference');
const c=store.chapters.get('SPX-EXP-037');
const input={chapterId:c.id,nodeId:c.nodes[0].id,language:'en',question:c.nodes[0].q.en};
const result=await composeDraft(store,input,fake);
assert.equal(result.status,'draft');
assert.equal(result.publishingApproved,false);
assert.equal(calls,2);
assert.equal(seen.evidence.length,1);
assert.equal(seen.evidence[0].originalLanguageWitnesses.length,5);
assert(!JSON.stringify(seen).includes(c.nodes[0].a.en));
assert(!JSON.stringify(seen).includes(c.nodes[0].a.fr));
assert(seen.evidence[0].text.includes('Universality'));
assert(!seen.evidence[0].text.includes('Gregorian chant offers the clearest model'));
const before=calls;
const next=await composeDraft(store,{...input,nodeId:c.nodes[1].id,question:c.nodes[1].q.en},fake);
assert.equal(next.reason,'followup_not_mapped_to_primary_source_claim');
assert.equal(calls,before);
console.log('PASS SPX_SOURCE_ONLY_GATE: 12 bounded opening subjects; 94 other subjects held; 8 expanded claim sets isolated; no full 106/423 draft sent to inference; hard preflight on unmapped followups; 0 release approval');
