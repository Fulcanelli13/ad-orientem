import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readCorpus} from '../tools/pius-x-generative-review.mjs';
import {makeEvaluationCases,evaluateDialogue} from '../tools/pius-x-live-eval.mjs';

const html=readFileSync('artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html','utf8');
const store=readCorpus(html);
const cases=makeEvaluationCases(store);
assert.equal(cases.length,7);
assert.equal(new Set(cases.map(c=>c.id)).size,7);
assert(cases.some(c=>c.kind==='contextual-follow-up'&&c.input.language==='fr'));
assert(cases.some(c=>c.kind==='unseen-formulation'));
assert(cases.every(c=>c.input.question.length<=240));
let composeCalls=0,verifyCalls=0;
const fake=async(purpose,messages)=>{
 const data=JSON.parse(messages[1].content);
 if(purpose==='compose'){
  composeCalls++;
  return {mode:'answer',text:'The supplied editorial teaching emphasizes careful explanation, encouragement, and pastoral responsibility in Christian instruction.',
   evidenceIds:[data.evidence[0].id],expression:'explaining'};
 }
 verifyCalls++;
 return {supported:true,allClaimsSupported:true,ids:data.candidate.ids};
};
const result=await evaluateDialogue(store,fake);
assert.equal(result.summary.scenarioCount,7);
assert.equal(result.summary.modelEligibleScenarios,4);
assert.equal(result.summary.generatedDrafts,4);
assert.equal(result.summary.rejectedOrHeld,3);
assert.equal(result.summary.violatedPreflightHolds,0);
assert.equal(result.summary.structuralReferenceFailures,0);
assert.equal(result.summary.publicationFlagFailures,0);
assert.equal(result.summary.manuallyApprovedDrafts,0);
assert.equal(result.summary.originalPassagesIndependentlyCollated,0);
assert.equal(result.summary.semanticRetrievalTested,false);
assert.equal(composeCalls,4);
assert.equal(verifyCalls,4);
assert(result.records.every(r=>r.manualRubric.originalWitnessAccuracy==='UNASSESSABLE UNTIL PRIMARY TEXT COLLATED'));
assert(result.records.every(r=>r.manualVerdict==='NOT_REVIEWED'));
const holds=result.records.filter(r=>r.expected==='MUST_HOLD_BEFORE_MODEL');
assert.deepEqual(holds.map(x=>x.status),['held','held','held']);
assert(holds.some(x=>x.reason==='unknown_source_node'));
const noModel=await evaluateDialogue(store,null,{maxModelCases:0});
assert.equal(noModel.records.length,3);
assert.equal(noModel.summary.generatedDrafts,0);
assert.equal(noModel.summary.rejectedOrHeld,3);
console.log('PASS SPX_LIVE_EVAL_HARNESS: 7 reviewer scenarios, 4 mock drafts, 3 pre-model holds; no external calls or historical approval');
