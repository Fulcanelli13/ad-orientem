import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readCorpus,composeDraft,selectEvidence} from '../tools/pius-x-generative-review.mjs';
import {evaluateBilingualConversationSequences} from '../tools/pius-x-live-eval.mjs';
const json=JSON.parse(readFileSync('previews/pius-x-study/evidence/pius-x-p22-bilingual-claim-acceptance-pilot-20261024.v1.json','utf8'));
const html=readFileSync('artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html','utf8');
const store=readCorpus(html);
assert.equal(json.schema,'AO_SPX_P2_P22_BILINGUAL_CLAIM_ACCEPTANCE_PILOT_V1');
assert.equal(json.status,'PRIVATE_EDITORIAL_TEST_ONLY_NO_PUBLICATION_OR_HISTORIC_VOICE_CERTIFICATION');
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
  const known=new Set(choice.evidence.map(e=>e.id));
  for(const evidenceId of r.evidenceIds)assert(known.has(evidenceId),'Witness not in source-only gate: '+r.nodeId+' '+evidenceId);
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
  return {mode:'answer',text:r.replySpecimen[data.language],evidenceIds:r.evidenceIds,expression:'explaining'};
 }
 return {supported:true,allClaimsSupported:true,ids:data.candidate.ids};
};
for(const r of json.cases)for(const lang of ['en','fr']){
 const input={chapterId:r.chapterId,nodeId:r.nodeId,language:lang,question:r.question[lang]};
 const response=await composeDraft(store,input,mockModel);
 assert.equal(response.status,'draft',r.nodeId+'/'+lang+' '+response.reason);
 assert.equal(response.reply,r.replySpecimen[lang]);
 assert.equal(response.publishingApproved,false);
 assert.equal(response.originalTextCollated,false);
 assert.deepEqual(response.evidence.map(e=>e.id),r.evidenceIds);
 assert(response.label.includes('NOT AN AUTHENTIC ST PIUS X QUOTATION'));
}
assert.equal(callCount.compose,22);
assert.equal(callCount.verify,22);
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
assert.equal(store.data.counts.allNodes,423);
assert.equal(store.data.approvals.publishing,false);
assert.equal([...store.sourceOnlyGate.values()].reduce((n,g)=>n+g.size,0),144);
console.log('PASS SPX_P22_BILINGUAL_CONTENT_ACCEPTANCE: 11 exact original-source nodes/22 draft specimens, 2 canonical holds in EN/FR, 12 two-language three-turn mock dialogues, no source ID mismatch, live inference or publication');
