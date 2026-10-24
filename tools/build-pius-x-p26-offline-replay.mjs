/**
 * P2.26 PRIVATE OFFLINE SOURCE DIALOGUE
 * Builds one HTML file from the existing P6 visual novel, its approved five
 * sprite assets, 11 source-witnessed research questions and 22 EN/FR editorial
 * specimens. No model, external resources, new claims or source-owner edits.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {readCorpus,selectEvidence,makeReviewHTML} from './pius-x-generative-review.mjs';
import {routePilotQuestion} from './pius-x-pilot-question-router.mjs';

const out='artifacts/pius-x-study-expanded/';
const evidenceRoot='previews/pius-x-study/evidence/';
const html=readFileSync(out+'SPX_Study_Expanded_106_P6.html','utf8');
const store=readCorpus(html);
const specimens=JSON.parse(readFileSync(evidenceRoot+
 'pius-x-p22-bilingual-claim-acceptance-pilot-20261024.v1.json','utf8'));
assert.equal(store.data.counts.allNodes,423);
assert.equal(store.chapters.size,106);
assert.equal([...store.sourceOnlyGate.values()].reduce((n,g)=>n+g.size,0),144);
assert.equal(store.data.approvals.publishing,false);
assert.equal(specimens.cases.length,11);
assert.equal(specimens.summary.bilingualSpecimens,22);
assert.equal(specimens.summary.newModelSourceGateAdmissions,0);
assert.equal(specimens.summary.publicationApprovals,0);
const audit=JSON.parse(readFileSync(evidenceRoot+
 'pius-x-p23-bilingual-claim-fidelity-audit-20261024.v1.json','utf8'));
assert.equal(audit.schema,'AO_SPX_P23_BILINGUAL_CLAIM_SOURCE_FIDELITY_AUDIT_V1');
assert.equal(audit.summary.sentenceLevelClaimUnits,23);
assert.equal(audit.claimUnits.length,23);
assert.equal(audit.manualReviewRequired,true);
const claimGroups=new Map();
for(const unit of audit.claimUnits){
 assert.equal(unit.qualifiedHumanReviewed,false);
 assert.equal(unit.bilingualTranslationCertified,false);
 assert.equal(unit.publishingApproved,false);
 assert.equal(unit.originalSpeechVerbatim,false);
 if(!claimGroups.has(unit.nodeId))claimGroups.set(unit.nodeId,[]);
 claimGroups.get(unit.nodeId).push(unit);
}
assert.equal(claimGroups.size,11);
const splitSentences=text=>text.trim().split(/(?<=[.!?])\s+/u).filter(Boolean);
const annexNames=[
 'pilot01-e-supremi-primary-witness.v1.json',
 'pilot09-haerent-animo-primary-witness.v2.json',
 'spx029-il-fermo-proposito-primary-witness.v2.json',
 'spx-new012-tribus-circiter-primary-witness.v2.json'
];
const sources=annexNames.map(name=>JSON.parse(readFileSync(evidenceRoot+name,'utf8')));
const originals=new Map();
for(const annex of sources){
 assert(['la','it'].includes(annex.document.languageOfOriginal));
 for(const w of annex.sourceWitnesses){
  // The original E supremi annex also holds St Anselm quoted by Pius X.
  // Quoted authorities remain research evidence but never become papal speech.
  if(w.speaker!=='PIUS_X_AUTHOR')continue;
  const text=w.text||w.latin;
  assert(typeof text==='string'&&text.length>=12);
  assert(!originals.has(w.id));
  originals.set(w.id,{
   id:w.id,text,locus:w.locus,originalLanguage:annex.document.languageOfOriginal,
   speaker:w.speaker,sourceUrl:annex.document.sites.original||annex.document.sites.la
  });
 }
}
const cases=[];
const allowedChapterIds=new Set(['SPX-PILOT-01','SPX-PILOT-09','SPX-029','SPX-NEW-012']);
const used=new Set(),distinctWitnesses=new Set();
const expressions=['thoughtful','grave','explaining','welcoming','explaining'];
for(const c of specimens.cases){
 assert(allowedChapterIds.has(c.chapterId));
 assert(!used.has(c.nodeId),'Original owned node repeated');used.add(c.nodeId);
 const chapter=store.chapters.get(c.chapterId);
 const node=chapter?.nodes.find(n=>n.id===c.nodeId);
 assert(chapter?.sourceClass==='PAPAL_DOCUMENT_ADAPTATION'&&!chapter.partial&&node);
 assert.deepEqual(c.question,node.q);
 assert.equal(c.publishingApproved,false);
 assert.equal(c.completeAnswerCertified,false);
 assert.equal(c.translationCertified,false);
 assert.equal(c.historicalVoiceCertified,false);
 for(const language of ['en','fr']){
  assert.equal(selectEvidence(store,{chapterId:c.chapterId,nodeId:c.nodeId,
   language,question:c.question[language]}).status,'eligible');
  assert(c.replySpecimen[language].length>=85);
 }
 const scoped=selectEvidence(store,{chapterId:c.chapterId,nodeId:c.nodeId,
  language:'en',question:c.question.en});
 const allowedIds=new Set(scoped.evidence.flatMap(e=>e.originalLanguageWitnesses.map(w=>w.id)));
 assert(c.evidenceIds.length>0);
 const claimUnits=claimGroups.get(c.nodeId);
 assert(claimUnits&&claimUnits.length>0,'Missing sentence-level audit for '+c.nodeId);
 const sentences={en:splitSentences(c.replySpecimen.en),fr:splitSentences(c.replySpecimen.fr)};
 assert.equal(sentences.en.length,sentences.fr.length);
 assert.equal(sentences.en.length,claimUnits.length);
 const allowedClaimWitnessIds=new Set(c.evidenceIds);
 const claimTrace=[...claimUnits].sort((a,b)=>a.ordinal-b.ordinal).map((unit,i)=>{
  assert.equal(unit.chapterId,c.chapterId);
  assert.equal(unit.ordinal,i+1);
  assert.equal(unit.englishClaim,sentences.en[i]);
  assert.equal(unit.frenchClaim,sentences.fr[i]);
  assert(unit.witnessIds.length>0);
  assert.equal(unit.witnessIds.length,unit.officialVaticanLineRanges.length);
  const fragments=unit.witnessIds.map((id,n)=>{
   assert(allowedClaimWitnessIds.has(id),'Claim uses unlicensed witness: '+id);
   const fragment=originals.get(id);
   assert(fragment,'Claim cites missing original fragment: '+id);
   const locator=unit.officialVaticanLineRanges[n];
   assert.equal(locator.witnessId,id);
   assert(Number.isInteger(locator.start)&&Number.isInteger(locator.end));
   return {...fragment,sourceWebTextLines:[locator.start,locator.end]};
  });
  assert.equal(unit.claimSupportAssessment,
   'SUPPORTED_OR_NARROWLY_PARAPHRASED_BY_REVIEWED_PRIMARY_TEXT_NOT_HUMAN_CERTIFIED');
  return {id:unit.id,ordinal:unit.ordinal,
   claim:{en:unit.englishClaim,fr:unit.frenchClaim},fragments,
   supportStatus:'EDITORIAL_SOURCE_MAPPING_PROVISIONAL_NOT_HUMAN_APPROVED',
   humanReviewApproved:false,translationApproved:false,verbatimPapalSpeech:false};
 });
 const witnesses=c.evidenceIds.map(id=>{
  assert(allowedIds.has(id),'Off-node Latin/Italian evidence '+id);
  const w=originals.get(id);assert(w&&w.sourceUrl.startsWith('https://www.vatican.va/'));
  distinctWitnesses.add(id);
  return w;
 });
 cases.push({chapterId:c.chapterId,nodeId:c.nodeId,
  question:c.question,reply:c.replySpecimen,witnesses,claimTrace,
  expression:expressions[cases.length%expressions.length],
  editorialStatus:'PRIVATE_UNAPPROVED_HISTORICAL_SOURCE_PARAPHRASE',
  bilingualTranslationsCertified:false,fullClaimReviewCertified:false,publishingApproved:false});
}
assert.equal(cases.length,11);
assert.equal(distinctWitnesses.size,18);
assert.equal(cases.reduce((n,c)=>n+c.claimTrace.length,0),23);
assert(cases.every(c=>c.claimTrace.every(u=>
 u.fragments.every(w=>c.witnesses.some(x=>x.id===w.id)))));
// Navigation-only aliases are never user-facing replies. They are allowed only
// when the restricted router points to one of the 11 already reviewed nodes.
const visitorBank=JSON.parse(readFileSync(evidenceRoot+
 'pius-x-p24-unexpected-visitor-bank-80-20261024.v1.json','utf8'));
assert.equal(visitorBank.schema,'AO_SPX_P24_80_UNEXPECTED_BILINGUAL_VISITOR_PROMPTS_V1');
const eligible=visitorBank.cases.filter(item=>
 item.expected==='EVIDENCE_ELIGIBLE_NOT_ANSWER_CERTIFIED');
assert.equal(eligible.length,32);
const navigationAliases=[],aliasKeys=new Set();
for(const item of eligible){
 assert(allowedChapterIds.has(item.chapterId));
 assert(['en','fr'].includes(item.language));
 const match=routePilotQuestion(store,{chapterId:item.chapterId,
  language:item.language,question:item.question});
 assert.equal(match.status,'matched',item.id+' expected original source match');
 assert(used.has(match.nodeId),'Alias must point to one of the 11 edited specimens');
 const target=cases.find(x=>x.nodeId===match.nodeId);
 assert(target&&target.chapterId===item.chapterId);
 const key=item.chapterId+'|'+item.language+'|'+item.question.trim().toLocaleLowerCase();
 assert(!aliasKeys.has(key));aliasKeys.add(key);
 assert(!cases.some(x=>x.chapterId===item.chapterId&&
  x.question[item.language].trim().toLocaleLowerCase()===item.question.trim().toLocaleLowerCase()));
 navigationAliases.push({id:item.id,chapterId:item.chapterId,
  language:item.language,question:item.question,matchedNodeId:match.nodeId,
  intentKey:match.intentKey,status:'NAVIGATION_SUGGESTION_ONLY_NOT_SOURCE_ANSWER_CERTIFIED'});
}
assert.equal(navigationAliases.length,32);
assert.equal(navigationAliases.filter(x=>x.language==='en').length,16);
assert.equal(navigationAliases.filter(x=>x.language==='fr').length,16);
// P2.29: cover the existing source gate at high volume WITHOUT inventing
// Pius X answers. The 11 provisional editorial specimens above stay distinct.
// The new dossiers reveal only original-language fragments and pre-existing
// narrow English research notes; no unpublished P6 reply is copied into them.
const sourceDossiers=[],sourceDossierHeld=[],sourceDossierWitnessIds=new Set();
const reviewedNodeIds=new Set(cases.map(x=>x.nodeId));
const gateSize=[...store.sourceOnlyGate.values()].reduce((n,entry)=>n+entry.size,0);
assert.equal(gateSize,144);
for(const chapter of store.data.chapters){
 const gate=store.sourceOnlyGate.get(chapter.id);
 if(!gate)continue;
 assert.equal(chapter.sourceClass,'PAPAL_DOCUMENT_ADAPTATION');
 assert.equal(!!chapter.partial,false); // eligible gate subjects are nonpartial
 for(const node of chapter.nodes){
  if(!gate.has(node.id))continue;
  if(reviewedNodeIds.has(node.id))continue;
  const check=selectEvidence(store,{chapterId:chapter.id,nodeId:node.id,
   language:'en',question:node.q.en});
  if(check.status!=='eligible'){
   sourceDossierHeld.push({chapterId:chapter.id,nodeId:node.id,reason:check.reason});
   continue;
  }
  assert.equal(check.evidence.length,1);
  assert.equal(check.evidence[0].id,node.id);
  const entry=check.evidence[0];
  const parts=entry.originalLanguageWitnesses.map(w=>{
   assert(typeof w.id==='string'&&typeof w.text==='string'&&w.text.length>=8);
   assert(typeof w.readingNote==='string'&&w.readingNote.length>=4);
   assert(['la','it'].includes(w.originalLanguage));
   assert(w.sourceUrl.startsWith('https://www.vatican.va/'));
   sourceDossierWitnessIds.add(w.id);
   return {id:w.id,originalText:w.text,originalLanguage:w.originalLanguage,
    sourceUrl:w.sourceUrl,locus:w.locus,speaker:w.speaker,
    editorialResearchNoteEnglish:w.readingNote,
    answerCertified:false,translationCertified:false};
  });
  assert(parts.length>0);
  sourceDossiers.push({chapterId:chapter.id,nodeId:node.id,
   question:{...node.q},sourceStatus:entry.primaryWitnessStatus,
   originalWitnesses:parts,
   researchCautions:entry.editorialWarnings,
   status:'ORIGINAL_EXCERPT_RESEARCH_ONLY_NO_EDITORIAL_ANSWER',
   answerApproved:false,publicationApproved:false});
 }
}
// P2.47: connect an EXISTING GPT-6 in-chat, one-pass voice specimen to the
// offline P2.46 dialogue. This is an OPTIONAL historical-style editorial comparison,
// never an authenticated first-person papal utterance or actual live model inference.
const voiceDocument=JSON.parse(readFileSync(evidenceRoot+
 'pius-x-e-supremi-gpt6-inchat-bilingual-dialogue-20261023.v1.json','utf8'));
assert.equal(voiceDocument.schema,'AO_SPX_P2_INCHAT_BILINGUAL_CONVERSATION_RESEARCH_EXAMPLE_V1');
assert.equal(voiceDocument.chapterId,'SPX-PILOT-01');
assert.equal(voiceDocument.provenance.modelFamily,'GPT-6');
assert.equal(voiceDocument.provenance.externalProviderEndpointCalled,false);
assert.equal(voiceDocument.provenance.independentVerifierCalled,false);
assert.equal(voiceDocument.provenance.multiturnStatefulnessTested,false);
assert.equal(voiceDocument.provenance.openEndedUserInteractionTested,false);
for(const k of ['papalTextQuotedVerbatim','translationCertified','historicalCharacterSpeechAuthenticated','publicationApproved'])
 assert.equal(voiceDocument[k],false);
assert.deepEqual(voiceDocument.sequences.map(x=>x.language),['en','fr']);
const pilotRows=cases.filter(x=>x.chapterId==='SPX-PILOT-01');
assert.equal(pilotRows.length,3);
const originalPilotAnnex=store.primaryWitnessAnnexes.get('SPX-PILOT-01');
const originalPilotWitnesses=new Map(originalPilotAnnex.sourceWitnesses.map(w=>[w.id,w]));
for(const sequence of voiceDocument.sequences){
 assert.equal(sequence.turns.length,3);
 assert.equal(sequence.generationProcess,'GPT6_IN_CHAT_SINGLE_PASS_NOT_ENDPOINT_SEQUENCE');
 for(const [i,v] of sequence.turns.entries()){
  const row=pilotRows[i],mapping=originalPilotAnnex.dialogueMappings[i];
  assert.equal(v.nodeId,row.nodeId);
  assert.equal(mapping.nodeId,row.nodeId);
  assert.equal(v.question,row.question[sequence.language]);
  assert.equal(v.status,'UNAPPROVED_IN_CHAT_EDITORIAL_EXAMPLE');
  assert.equal(v.publishingApproved,false);
  assert.equal(v.originalTextCollated,false);
  assert(typeof v.reply==='string'&&v.reply.length>=65&&v.reply.length<=850);
  assert(!/[“”«»]/u.test(v.reply));
  const ids=new Set(v.evidenceIds);
  assert.equal(ids.size,v.evidenceIds.length);
  assert(ids.size>=2);
  const licensed=new Set(mapping.witnessIds);
  const refs=v.evidenceIds.map(id=>{
   const w=originalPilotWitnesses.get(id);
   assert(licensed.has(id)&&w&&w.speaker==='PIUS_X_AUTHOR',
     'Voice comparison borrowed an unlicensed or non-papal witness '+id);
   assert(w.locus&&(w.latin||w.text)?.length>10);
   return {id,text:w.latin||w.text,locus:w.locus,originalLanguage:'la',speaker:w.speaker,
     sourceUrl:originalPilotAnnex.document.sites.la||originalPilotAnnex.document.sites.original};
  });
  row.voicePreview??={};
  row.voicePreview[sequence.language]={
   text:v.reply,expression:v.expression,witnesses:refs,
   status:'GPT6_IN_CHAT_EDITORIAL_FIRST_PERSON_STYLE_NOT_PAPAL_SPEECH',
   publicationApproved:false,independentVerification:false,
   liveConversationTested:false
  };
 }
}
assert(pilotRows.every(row=>row.voicePreview?.en&&row.voicePreview?.fr));

// P2.55: actual 7B inference, NOT a new source owner, certified translation,
// or a live chat. These are optional compare-only extracts in the existing
// offline visual novel; they must not replace the documentary/GPT-6 research
// specimens or accidentally attribute St Anselm's quote to Pius X.
const p54=JSON.parse(readFileSync(evidenceRoot+
 'pius-x-p54-real-7b-four-turn-research-20261024.v1.json','utf8'));
assert.equal(p54.schema,'AO_SPX_P54_REAL_7B_BILINGUAL_HISTORICAL_VOICE_RESEARCH_V1');
assert.equal(p54.chapterId,'SPX-PILOT-01');
assert.equal(p54.execution,'ACTUAL_LLAMA_CPP_CPU_LOCAL_INFERENCE_NOT_MOCK');
assert.equal(p54.model,'Qwen2.5-7B-Instruct-Q4_K_M');
assert.equal(p54.counts.attempts,4);
assert.equal(p54.counts.structurallyAccepted,4);
assert.equal(p54.counts.independentlyApproved,0);
assert.equal(p54.approvals.publication,false);
assert.equal(p54.approvals.verbatimPapalSpeech,false);
assert.equal(p54.approvals.independentSourceReview,false);
assert.equal(p54.approvals.translationCertified,false);
assert.equal(p54.turns.length,4);
const p54Seen=new Set();
for(const sample of p54.turns){
 assert(['en','fr'].includes(sample.language));
 assert([1,2].includes(sample.turn),'7B source comparison covers only two turns');
 assert.equal(sample.nodeId,sample.selectedOriginalEvidenceNodeId);
 assert.equal(sample.status,'DRAFT_STRUCTURALLY_ACCEPTED_NOT_PUBLISHED');
 assert.equal(sample.independentHumanApproval,false);
 const row=pilotRows[sample.turn-1];
 assert.equal(sample.nodeId,row.nodeId);
 assert(typeof sample.text==='string'&&sample.text.length>45);
 const id=sample.language+'|'+sample.nodeId;
 assert(!p54Seen.has(id));p54Seen.add(id);
 const licensed=new Set(originalPilotAnnex.dialogueMappings[sample.turn-1].witnessIds);
 const ids=new Set(sample.sourceWitnessIds);
 assert(ids.size>0&&ids.size===sample.sourceWitnessIds.length);
 const witnesses=sample.sourceWitnessIds.map(witnessId=>{
  const source=originalPilotWitnesses.get(witnessId);
  assert(source&&source.speaker==='PIUS_X_AUTHOR'&&licensed.has(witnessId));
  assert((source.latin||source.text)?.length>10);
  return {id:witnessId,text:source.latin||source.text,
   speaker:'PIUS_X_AUTHOR',originalLanguage:'la',locus:source.locus,
   sourceUrl:originalPilotAnnex.document.sites.la};
 });
 row.real7bPreview??={};
 row.real7bPreview[sample.language]={
  text:sample.text,witnesses,
  status:'ACTUAL_7B_MACHINE_GENERATION_EDITORIAL_UNAPPROVED',
  editorialConcern:sample.editorialConcern,
  sourceRun:p54.runUrl,
  publishingApproved:false,
  firstPersonAuthenticated:false,
  translationCertified:false,
  currentModelInference:false
 };
}
assert.equal(p54Seen.size,4);
assert(pilotRows.slice(0,2).every(row=>
 row.real7bPreview?.en&&row.real7bPreview?.fr));
assert(!pilotRows[2].real7bPreview);


assert.equal(sourceDossiers.length+sourceDossierHeld.length+cases.length,144);
assert(sourceDossiers.length>75,'Corpus-level original source browsing should reach far beyond 11');
assert(sourceDossiers.every(x=>!reviewedNodeIds.has(x.nodeId)));
const sourceDossierChapterIds=new Set(sourceDossiers.map(x=>x.chapterId));
const offline={
 schema:'AO_SPX_P26_OFFLINE_REVIEW_CASES_V1',status:'PRIVATE_STATIC_NO_MODEL_INFERENCE',
 modelProviderEnabled:false,publishingApproved:false,sourceOnlyGateAdmissions:0,
 canonicalChapters:4,canonicalNodes:11,bilingualEditorialPairs:22,
 originalWitnessFragments:distinctWitnesses.size,originalCorpusNodes:423,
 claimTraceUnits:23,humanClaimCertifications:0,
 navigationAliasCount:32,navigationAliases,cases,
 voicePreviewCaseCount:3,voicePreviewLanguageCount:2,
 voicePreviewApproved:false,voicePreviewLiveInference:false,
 real7bComparisonCount:4,real7bComparisonApproved:false,real7bComparisonLive:false,
 sourceGateSize:144,sourceDossierCount:sourceDossiers.length,
 sourceDossierHeldCount:sourceDossierHeld.length,
 sourceDossierDistinctFragments:sourceDossierWitnessIds.size,
 sourceDossierChapterCount:sourceDossierChapterIds.size,
 sourceDossiers,sourceDossierHeld
};
const client=readFileSync('previews/pius-x-study/spx-p26-offline-replay-client.js','utf8')+'\n'+
 readFileSync('previews/pius-x-study/spx-p29-source-dossier-client.js','utf8');
const css=readFileSync('previews/pius-x-study/spx-model-review-style.css','utf8')+'\n'+
 readFileSync('previews/pius-x-study/spx-p26-offline-replay-style.css','utf8')+'\n'+
 readFileSync('previews/pius-x-study/spx-p29-source-dossier-style.css','utf8');
assert(!/<\/script/i.test(client)&&!/<\/style/i.test(css));
const safe=JSON.stringify(offline).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
const sourceHTML=html.replace('</body>',
 '<script type="application/json" id="spxOfflineReplayData">'+safe+'</script></body>');
const final=makeReviewHTML(sourceHTML,client,css);
assert(!/<script[^>]+src=/.test(final));
assert(!/<link[^>]+https?:\/\//.test(final));
assert.equal(final.match(/id="spxOfflineReplayData"/g)?.length,1);
assert.equal(final.match(/id="spxExpandedCorpus"/g)?.length,1);
assert.equal(final.match(/id="spxData"/g)?.length,1);
mkdirSync(out,{recursive:true});
const dest=out+'SPX_P26_Offline_Source_Dialogue_Demo.html';
writeFileSync(dest,final);
console.log('PASS SPX_P26_OFFLINE_BUILD '+JSON.stringify({
 path:dest,bytes:Buffer.byteLength(final),chapterCount:4,sourceOwnedQuestions:11,
 bilingualEditorialDrafts:22,originalFragments:18,claimTraceUnits:23,
 navigationAliases:32,voicePreviewCases:3,voicePreviewLanguages:2,
 real7bComparisons:4,real7bApproved:false,
 sourceDossierCount:sourceDossiers.length,
 sourceDossierChapterCount:sourceDossierChapterIds.size,
 sourceDossierHeldCount:sourceDossierHeld.length,
 sourceDossierDistinctFragments:sourceDossierWitnessIds.size,
 networkCalls:0,
 sourceOwnerNodes:423,generativeGateNodes:144,published:false
}));
