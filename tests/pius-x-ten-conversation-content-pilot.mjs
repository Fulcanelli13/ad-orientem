import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(p,"utf8"));
const evidence=load("data/learn/research/pius-x-proof-of-answerability-12case-20261019.v1.json");
const pilot=load("data/learn/research/pius-x-ten-conversation-content-pilot-20261019.v1.json");
assert.equal(pilot.schema,"AO_PIUS_X_CONTENT_OWNED_TEN_CONVERSATION_PILOT_V1");
assert.equal(pilot.status,"COMPLETE_BILINGUAL_EDITORIAL_DRAFT_NOT_INDEPENDENTLY_CERTIFIED");
assert.equal(pilot.totals.topics,10);
assert.equal(pilot.totals.localizedResponseDrafts,60);
assert.equal(pilot.totals.approvedAnswers,0);
assert.equal(pilot.totals.reviewedInApp,0);
assert.equal(pilot.episodes.length,10);
assert.deepEqual(Object.values(pilot.globalReleaseGates).every(x=>x===false),true);
const sourceIndex=new Map(evidence.records.map(x=>[x.case_id,x])),ids=new Set();
const approvedSprites=new Set(["neutral","welcoming","explaining","thoughtful","grave"]);
const permittedSources=new Set(evidence.records.filter(x=>x.screen_disposition==="PASS_CONSTRAINED").map(x=>x.case_id));
for(const e of pilot.episodes){
 assert.ok(permittedSources.has(e.caseId),"Unsafe source disposition "+e.caseId);
 assert.ok(!ids.has(e.id),"Duplicate episode");
 ids.add(e.id);
 const original=sourceIndex.get(e.caseId),ref=original.source_evidence[0];
 assert.equal(e.caseId,e.id);
 assert.equal(e.sourceUrl,ref.url);
 assert.equal(e.sourceScope,ref.section_or_question);
 assert.equal(e.sourceAttribution,ref.witness_type);
 assert.equal(e.prohibitedInference,original.prohibited_inference_or_discipline);
 assert.equal(e.historicalWitnessVerifiedInLinkedOnlineCopy,true);
 assert.ok(approvedSprites.has(e.spriteSuggestion));
 assert.equal(e.theologicalReview,"PENDING_INDEPENDENT_HUMAN");
 assert.equal(e.voiceOwnerReview,"PR_1419_STYLE_ONLY_UNREVIEWED");
 assert.equal(e.publishable,false);
 assert.equal(e.renderedByApp,false);
 assert.equal(e.turns.length,3);
 assert.deepEqual(e.turns.map(x=>x.intent),["opening","source_followup","misconception_correction"]);
 for(let i=0;i<e.turns.length;i++){
  const t=e.turns[i];
  assert.equal(t.id,e.id+"-T"+(i+1));
  assert.equal(t.sourceRef,e.id);
  assert.equal(t.citationLabel,e.sourceScope);
  assert.equal(t.editorialApproval,false);
  assert.equal(t.visitorRelease,false);
  assert.equal(t.sourceCheckedForSubstantiveClaims,false);
  assert.equal(t.unsupportedNewPastoralAdviceAllowed,false);
  assert.equal(t.quotationLevel,"B_SOURCE_BOUNDED_PARAPHRASE_WITH_C_CONNECTIVE_NOT_AUTHENTIC_SPEECH");
  assert.equal(t.continuationOf,i===0?null:e.id+"-T1");
  for(const lang of ["en","fr"]){
   assert.ok(t.language[lang].visitor.length>=20,"Question too short "+t.id);
   assert.ok(t.language[lang].response.length>=55,"Reply lacks substantive content "+t.id);
   assert.ok(!/[”“]/.test(t.language[lang].response),"Possible unattributed historical quotation "+t.id);
  }
 }
}
for(const gap of ["SPX-PILOT-11","SPX-PILOT-12"]){
 assert.equal(pilot.episodes.some(x=>x.caseId===gap),false,"Unsourced first-person or individualized diagnosis");
 assert.notEqual(sourceIndex.get(gap).screen_disposition,"PASS_CONSTRAINED");
}
const firstPersonOnly=pilot.episodes.filter(e=>e.turns.some(t=>/\bI\b/.test(t.language.en.response))).map(x=>x.id);
assert.deepEqual(firstPersonOnly,["SPX-PILOT-01"],"First-person biographical claims must be limited to documented E supremi context");
const decree=pilot.episodes.find(e=>e.id==="SPX-PILOT-10");
assert.match(decree.turns[0].language.en.response,/Congregation.*approved by Pius X/);
assert.match(decree.turns[0].language.fr.response,/Congrégation.*approuvé par Pie X/);
console.log("PASS ten Pius X content-owned bilingual conversation drafts, 30 turns/60 localised replies, exact source pointers and zero publication approvals");
