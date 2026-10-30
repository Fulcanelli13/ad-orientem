import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readCorpus,selectEvidence} from '../tools/pius-x-generative-review.mjs';
import {makeConversationSequence,evaluateConversationSequence} from '../tools/pius-x-live-eval.mjs';

const folder='previews/pius-x-study/evidence/';
const specimen=JSON.parse(readFileSync(folder+'pius-x-e-supremi-gpt6-inchat-bilingual-dialogue-20261023.v1.json','utf8'));
const annex=JSON.parse(readFileSync(folder+'pilot01-e-supremi-primary-witness.v1.json','utf8'));
const html=readFileSync('artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html','utf8');
const store=readCorpus(html);
assert.equal(specimen.schema,'AO_SPX_P2_INCHAT_BILINGUAL_CONVERSATION_RESEARCH_EXAMPLE_V1');
assert.equal(specimen.provenance.modelFamily,'GPT-6');
assert.equal(specimen.provenance.externalProviderEndpointCalled,false);
assert.equal(specimen.provenance.independentVerifierCalled,false);
assert.equal(specimen.provenance.multiturnStatefulnessTested,false);
assert.equal(specimen.scopeOfResult.realEndpointSequences,0);
assert.equal(specimen.scopeOfResult.approvedReplies,0);
assert.equal(specimen.scopeOfResult.publicationAllowed,false);
assert.equal(store.chapters.size,106);
assert.equal(store.data.counts.allNodes,423);
assert.equal(specimen.sequences.length,2);
assert.deepEqual(specimen.sequences.map(s=>s.language),['en','fr']);
assert.deepEqual(specimen.scopeOfResult,{languages:2,turnsPerLanguage:3,turns:6,distinctSourceNodes:3,distinctWitnessIds:7,realEndpointSequences:0,approvedReplies:0,publicationAllowed:false});
const allWitnesses=new Set(annex.sourceWitnesses.map(w=>w.id));
const allUsedWitnesses=new Set();
const expectedNodes=annex.dialogueMappings.map(m=>m.nodeId);
for(const seq of specimen.sequences){
 const original=makeConversationSequence(store,{chapterId:'SPX-PILOT-01',language:seq.language});
 assert.equal(seq.chapterId,original.chapterId);
 assert.equal(seq.turns.length,3);
 assert.deepEqual(seq.turns.map(t=>t.nodeId),expectedNodes);
 let calls=0,verifyCalls=0;
 const replay=async (purpose,messages)=>{
  const data=JSON.parse(messages[1].content);
  if(purpose==='compose'){
   const next=seq.turns[calls++];
   assert(next,'not allowed to ask for a fourth authored sample');
   assert.equal(data.chapterId,'SPX-PILOT-01');
   assert.equal(data.language,seq.language);
   assert.equal(data.question,next.question);
   assert.equal(data.history.length,calls-1);
   assert(data.history.every(h=>h.contextOnly===true));
   assert.equal(data.evidence.length,1);
   assert.equal(data.evidence[0].id,next.nodeId);
   const available=new Set(data.evidence[0].originalLanguageWitnesses.map(w=>w.id));
   assert(next.evidenceIds.every(id=>available.has(id)),'the script cites only a subset of the original-node witnesses');
   // Critical boundary: full unverified P6 authored answers are not used as evidence.
   for(const answer of store.chapters.get('SPX-PILOT-01').nodes.map(n=>n.a)){
    assert(!JSON.stringify(data).includes(answer.en));
    assert(!JSON.stringify(data).includes(answer.fr));
   }
   return {mode:'answer',text:next.reply,evidenceIds:[next.nodeId],expression:next.expression};
  }
  assert.equal(purpose,'verify');
  verifyCalls++;
  assert.equal(data.candidate.ids.length,1);
  assert(expectedNodes.includes(data.candidate.ids[0]));
  return {supported:true,allClaimsSupported:true,ids:data.candidate.ids}; // a mock, NOT independent source certification
 };
 for(const step of seq.turns){
  assert(step.status==='UNAPPROVED_IN_CHAT_EDITORIAL_EXAMPLE');
  assert.equal(step.publishingApproved,false);
  assert.equal(step.originalTextCollated,false);
  assert.equal(step.question,store.chapters.get('SPX-PILOT-01').nodes[step.turn-1].q[seq.language]);
  assert.equal(step.nodeId,original.steps[step.turn-1].nodeId);
  assert(step.reply.split(/\s+/).length<=55,'Short conversational turns; not encyclical-length essays');
  assert(!/[“”«»"]/.test(step.reply),'No apparent invented authentic quotation');
  assert(!/\b(Anselm|Leo XIII)\b/.test(step.reply),'No transfer of quoted Anselm speech or unsupported predecessor name');
  assert(step.evidenceIds.every(id=>allWitnesses.has(id)));
  const mapping=annex.dialogueMappings.find(m=>m.nodeId===step.nodeId);
  assert.deepEqual(step.evidenceIds,mapping.witnessIds.filter(id=>step.evidenceIds.includes(id)));
  const gate=selectEvidence(store,{chapterId:seq.chapterId,language:seq.language,nodeId:step.nodeId,question:step.question});
  assert.equal(gate.status,'eligible');
  assert.equal(gate.evidence[0].originalLanguageWitnesses.length,mapping.witnessIds.length);
  for(const id of step.evidenceIds)allUsedWitnesses.add(id);
 }
 const evaluated=await evaluateConversationSequence(store,replay,{chapterId:seq.chapterId,language:seq.language});
 assert.equal(evaluated.summary.totalTurns,3);
 assert.equal(evaluated.summary.acceptedEditorialDrafts,3);
 assert.equal(evaluated.summary.heldTurns,0);
 assert.equal(evaluated.summary.acceptedDraftsRepeatedVerbatim,0);
 assert.equal(evaluated.summary.likelyRepeatedSentences,0);
 assert.equal(evaluated.summary.longMonologueSignals,0);
 assert.equal(evaluated.summary.crossSourceFailures,0);
 assert.equal(evaluated.summary.publicationFailures,0);
 assert.equal(evaluated.summary.humanReviewedTurns,0);
 assert.deepEqual(evaluated.records.map(r=>r.suppliedHistoryLength),[0,1,2]);
 assert.deepEqual(evaluated.records.map(r=>r.draftText),seq.turns.map(t=>t.reply));
 assert(evaluated.records.every(r=>r.manualRatings.originalTextVerified===false));
 assert.equal(calls,3);
 assert.equal(verifyCalls,3);
}
assert.equal(allUsedWitnesses.size,7);
assert(specimen.sourceBoundaries.some(s=>s.includes('St Anselm')));
assert(specimen.sourceBoundaries.some(s=>s.includes('§8')));
console.log('PASS SPX_INCHAT_BILINGUAL_SPECIMEN: 6 GPT-6-authored scripted reply specimens; source-only replay adapter, 3 turns per language, 7 original witness IDs; no external inference or independent verification');
