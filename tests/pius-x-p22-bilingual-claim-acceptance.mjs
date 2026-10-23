import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readCorpus,composeDraft,selectEvidence} from '../tools/pius-x-generative-review.mjs';
import {evaluateBilingualConversationSequences} from '../tools/pius-x-live-eval.mjs';
const json=JSON.parse(readFileSync('previews/pius-x-study/evidence/pius-x-p22-bilingual-claim-acceptance-pilot-20261024.v1.json','utf8'));
const html=readFileSync('artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html','utf8');
const store=readCorpus(html);
assert.equal(json.schema,'AO_SPX_P2_P22_BILINGUAL_CLAIM_ACCEPTANCE_PILOT_V1');
assert.equal(json.status,'PRIVATE_EDITORIAL_TEST_REVISED_AFTER_DIRECT_VATICAN_CLAIM_READING_NO_PUBLICATION');
assert.equal(json.summary.specimensRevisedForSourcePrecision,5);
assert.equal(json.summary.newModelSourceGateAdmissions,0);
assert.equal(json.summary.chapterCount,4);
assert.equal(json.summary.sourceSelectedNodes,11);
assert.equal(json.summary.bilingualSpecimens,22);
assert.equal(json.summary.preflightHolds,2);
for(const field of ['sourceOnlyGateAdmissionsChange','modelProviderCalls','certifiedHistoricalQuotes','certifiedWholeAnswers','certifiedTranslations','publicationApprovals'])assert.equal(json.summary[field],0);
assert.equal(json.cases.length,11);
assert.equal(json.preflightHoldCases.length,2);
const ids=new Set(),questions=new Map();
const allowedByQuestion=new Map();
let checkedLanguages=0;
for(const r of json.cases){
 assert(!ids.has(r.nodeId),'Duplicate original owner '+r.nodeId);ids.add(r.nodeId);
 const chapter=store.chapters.get(r.chapterId),node=chapter?.nodes.find(n=>n.id===r.nodeId);
 assert(chapter&&node,'Unknown original owner '+r.nodeId);
 assert.equal(chapter.sourceClass,'PAPAL_DOCUMENT_ADAPTATION');
 assert.equal(chapter.partial,false);
 assert.equal(node.q.en,r.question.en);
 assert.equal(node.q.fr,r.question.fr);
 assert(r.originalSourceUrl.startsWith('https://www.vatican.va/content/pius-x/'));
 assert(['la','it'].includes(r.sourceLanguage));
 assert.equal(r.originalTextIndependentlyCheckedAtSourceUrl,true);
 for(const field of ['completeAnswerCertified','translationCertified','historicalVoiceCertified','liveModelTested','publishingApproved'])assert.equal(r[field],false,r.nodeId+'/'+field);
 assert(r.evidenceIds.length>=1);
 assert(new Set(r.evidenceIds).size===r.evidenceIds.length);
 assert.equal(r.claimUnits.length>=1,true);
 assert(r.unlicensedExtensions.length>=1);
 for(const lang of ['en','fr']){
  checkedLanguages++;
  const reply=r.replySpecimen[lang];
  assert.equal(typeof reply,'string');
  assert(reply.length>=85&&reply.length<=1000,'Unusable specimen '+r.nodeId+'/'+lang);
  assert(!/["“”«»]|<[^>]+>/g.test(reply),'No invented first-person quotation or HTML '+r.nodeId+'/'+lang);
  assert(!/\b(?:I remember|I witnessed|my mother said|I personally)\b/i.test(reply));
  const choice=selectEvidence(store,{chapterId:r.chapterId,nodeId:r.nodeId,language:lang,question:r.question[lang]});
  assert.equal(choice.status,'eligible','Not source-gated '+r.nodeId+'/'+lang+': '+choice.reason);
  assert.equal(choice.evidence.length,1,'Existing composer binds one source-evidence object to its original node');
  assert.equal(choice.evidence[0].id,r.nodeId);
  const known=new Set(choice.evidence.flatMap(e=>e.originalLanguageWitnesses.map(w=>w.id)));
  for(const evidenceId of r.evidenceIds)assert(known.has(evidenceId),'Witness not in source-only gate: '+r.nodeId+' '+evidenceId);
  assert(choice.evidence[0].originalLanguageWitnesses.every(w=>w.speaker&&w.text&&w.locus),'Unattributed original witness');
  const k=lang+'|'+r.question[lang];
  assert(!questions.has(k),'Duplicated question '+k);questions.set(k,r);
  allowedByQuestion.set(k,r.evidenceIds);
 }
}
assert.equal(checkedLanguages,22);
const callCount={compose:0,verify:0};
const mockModel=async(purpose,messages)=>{
 const data=JSON.parse(messages[1].content);
 callCount[purpose]++;
 if(purpose==='compose'){
  const r=questions.get(data.language+'|'+data.question);
  if(!r)throw new Error('A source-only mock has no approved review question');
  return {mode:'answer',text:r.replySpecimen[data.language],evidenceIds:[data.evidence[0].id],witnessIds:r.evidenceIds,expression:'explaining'};
 }
 return {supported:true,allClaimsSupported:true,ids:data.candidate.ids,witnessIds:data.candidate.witnessIds};
};
for(const r of json.cases)for(const lang of ['en','fr']){
 const input={chapterId:r.chapterId,nodeId:r.nodeId,language:lang,question:r.question[lang]};
 const response=await composeDraft(store,input,mockModel);
 assert.equal(response.status,'draft',r.nodeId+'/'+lang+' '+response.reason);
 assert.equal(response.reply,r.replySpecimen[lang]);
 assert.equal(response.publishingApproved,false);
 assert.equal(response.originalTextCollated,false);
 assert.deepEqual(response.evidence.map(e=>e.id),[r.nodeId]);
 assert.deepEqual(response.claimWitnesses.map(w=>w.id),r.evidenceIds);
 assert.equal(response.claimWitnessStatus,'EXACT_ORIGINAL_WITNESS_IDS_MATCHED_TO_NODE_NOT_CERTIFIED');
 assert(response.claimWitnesses.every(w=>w.sourceUrl.startsWith('https://www.vatican.va/')&&w.speaker&&w.locus));
 // Source-node and exact excerpt IDs are separately linked here; neither is
 // a translation, period-voice or complete doctrinal-answer certification.
 assert(response.label.includes('NOT AN AUTHENTIC ST PIUS X QUOTATION'));
}
assert.equal(callCount.compose,22);
assert.equal(callCount.verify,22);
// The composer must reject an invented original-language witness ID before
// any verifier call and reject a verifier that refuses to affirm a real ID.
const first=json.cases[0],request={
 chapterId:first.chapterId,nodeId:first.nodeId,language:'en',
 question:first.question.en
};
let invalidVerifyCalls=0;
const forge=async(purpose,messages)=>{
 if(purpose==='verify'){invalidVerifyCalls++;return {supported:true,allClaimsSupported:true,ids:[],witnessIds:[]};}
 const selected=JSON.parse(messages[1].content);
 return {mode:'answer',text:first.replySpecimen.en,
  evidenceIds:[selected.evidence[0].id],
  witnessIds:['WITNESS_ID_NOT_IN_ORIGINAL_SOURCE'],expression:'thoughtful'};
};
const forged=await composeDraft(store,request,forge);
assert.equal(forged.status,'held');
assert.equal(forged.reason,'invalid_generated_witness_reference');
assert.equal(invalidVerifyCalls,0);
let refusedVerification=0;
const disavow=async(purpose,messages)=>{
 const selected=JSON.parse(messages[1].content);
 if(purpose==='compose')return {mode:'answer',text:first.replySpecimen.en,
  evidenceIds:[selected.evidence[0].id],witnessIds:first.evidenceIds,expression:'thoughtful'};
 refusedVerification++;return {supported:true,allClaimsSupported:true,
  ids:selected.candidate.ids,witnessIds:[]};
};
const unverified=await composeDraft(store,request,disavow);
assert.equal(unverified.status,'held');
assert.equal(unverified.reason,'unsupported_or_unverified_generated_claim');
assert.equal(refusedVerification,1);
// Older providers that cite only a canonical dialogue node continue to work,
// but their returned evidence is explicitly weaker and never release-ready.
const legacy=async(purpose,messages)=>{
 const obj=JSON.parse(messages[1].content);
 if(purpose==='compose')return {mode:'answer',text:first.replySpecimen.en,
  evidenceIds:[obj.evidence[0].id],expression:'neutral'};
 return {supported:true,allClaimsSupported:true,ids:obj.candidate.ids};
};
const legacyResult=await composeDraft(store,request,legacy);
assert.equal(legacyResult.status,'draft');
assert.equal(legacyResult.claimWitnessStatus,'LEGACY_CANONICAL_NODE_REFERENCE_ONLY');
assert.deepEqual(legacyResult.claimWitnesses,[]);
assert.equal(legacyResult.publishingApproved,false);

for(const blocked of json.preflightHoldCases)for(const lang of ['en','fr']){
 const before=callCount.compose;
 const res=await composeDraft(store,{chapterId:blocked.chapterId,nodeId:blocked.nodeId,language:lang,question:blocked.question[lang]},mockModel);
 assert.equal(res.status,'held','Held canonical question escaped gate '+blocked.nodeId);
 assert.equal(res.publishingApproved,false);
 assert.equal(callCount.compose,before,'Cannot call model on selected historical hold');
}
for(const chapterId of ['SPX-PILOT-01','SPX-PILOT-09']){
 const session=await evaluateBilingualConversationSequences(store,mockModel,{chapterId});
 assert.equal(session.summary.languagesAttempted,2);
 assert.equal(session.summary.turnsAttempted,6);
 assert.equal(session.summary.acceptedEditorialDrafts,6);
 assert.equal(session.summary.heldTurns,0);
 assert.equal(session.summary.sourceReferenceFailures,0);
 assert.equal(session.summary.publicationFlagFailures,0);
 assert.equal(session.summary.exactRepeatSignals,0);
 assert.equal(session.summary.repeatedSentenceSignals,0);
 assert.equal(session.summary.independentHumanSourceAudits,0);
 assert.equal(session.summary.translationsCertified,0);
 assert.equal(session.summary.publicationApproved,false);
 assert.equal(session.modelProviderConfirmed,false);
 for(const x of session.sessions)for(const record of x.records){
  assert.equal(record.safeguards.sourceIdsValid,true);
  assert.equal(record.safeguards.publicationBlocked,true);
  assert.equal(record.exactDuplicateOfPreviousAcceptedTurn,false);
 }
}
// A selected historical source node is not a licence to determine current law.
// These prompts are outside the nineteenth/twentieth-century evidence even when
// a visitor intentionally supplies an otherwise eligible original node ID.
for(const [language,question] of [
 ['en','Does this mean my excommunication no longer applies today?'],
 ['en','Is that canonical penalty still in force now?'],
 ['en','Are the Communion fasting rules legally binding today?'],
 ['fr','Cette peine canonique est-elle toujours valable actuellement ?'],
 ['fr','Cette absolution est-elle valide aujourd’hui ?'],
 ['fr','La règle de communion est-elle encore en vigueur ?']
]){
 const previous=callCount.compose;
 const selected={chapterId:'SPX-NEW-012',nodeId:'AO.SPX.DIALOGUE.SPX-NEW-012.OPEN',language,question};
 const result=await composeDraft(store,selected,mockModel);
 assert.equal(result.status,'held','Contemporary canonical query must be held: '+question);
 assert.equal(result.reason,'present_day_canonical_case_requires_current_authority');
 assert.equal(callCount.compose,previous,'Blocked modern legal case called mock provider');
}
// A historical or general spiritual follow-up must not be blocked merely
// because it uses the word today without a modern canonical determination.
for(const [language,question] of [
 ['en','Why do priests still need to meditate today?'],
 ['fr','Pourquoi la méditation est-elle encore importante aujourd’hui ?']
])assert.equal(selectEvidence(store,{chapterId:'SPX-PILOT-09',language,question}).status,'eligible');
assert.equal(store.data.counts.allNodes,423);
assert.equal(store.data.approvals.publishing,false);
assert.equal([...store.sourceOnlyGate.values()].reduce((n,g)=>n+g.size,0),144);
console.log('PASS SPX_P22_BILINGUAL_CONTENT_ACCEPTANCE: 11 exact original-source nodes/22 draft specimens, 2 canonical holds in EN/FR, 12 two-language three-turn mock dialogues, no source ID mismatch, live inference or publication');
