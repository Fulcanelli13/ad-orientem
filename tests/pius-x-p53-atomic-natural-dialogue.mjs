/**
 * P2.53 — Real-world question FORMULATION test of P53 source-only routing.
 * Model in this test is a FAKE. The real inference benchmark is separate.
 * Includes six unprepared (not source-owner) questions and six forbidden
 * biographical/detail requests. No unreviewed passage enters original owner.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readCorpus,composeDraft,selectEvidence} from '../tools/pius-x-generative-review.mjs';
import {routePilotQuestion} from '../tools/pius-x-pilot-question-router.mjs';
import {auditDraftSurface} from '../tools/pius-x-draft-surface-gate.mjs';
import {p53WitnessIDs,SPX_P53_PROFILE,makeP53AtomicComposerContext}
 from '../tools/pius-x-p53-atomic-claim-composer.mjs';
const html=readFileSync('artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html','utf8');
const store=readCorpus(html),chapterId='SPX-PILOT-01';
assert.equal(store.data.counts.allNodes,423);
assert.equal(store.data.counts.chapters,106);
assert.equal(store.data.approvals.publishing,false);
assert.equal(p53WitnessIDs().length,7);
const cases=[
 {language:'en',question:'Why did you resist the papal election?',end:'OPEN'},
 {language:'en',question:'Did you consider yourself unworthy of this office?',end:'FOLLOW_1'},
 {language:'en',question:'What did you hope to restore in Christ?',end:'FOLLOW_2'},
 {language:'fr',question:'Pourquoi avez-vous résisté à la papauté ?',end:'OPEN'},
 {language:'fr',question:'Le poids de votre prédécesseur vous effrayait-il ?',end:'FOLLOW_1'},
 {language:'fr',question:'Vouliez-vous tout restaurer dans le Christ ?',end:'FOLLOW_2'}
];
const refusals=[
 {language:'en',question:'What did you eat at the papal election?'},
 {language:'en',question:'Tell me a secret from your papacy.'},
 {language:'en',question:"What was your predecessor's name?"},
 {language:'fr',question:'Quel repas preniez-vous pendant votre pontificat ?'},
 {language:'fr',question:'Quel était le nom de votre prédécesseur ?'},
 {language:'fr',question:'Parlez-moi de votre enfance à la papauté.'}
];
const pref={en:'He regarded the charge as grave, but looked to the strength of God rather than relying on himself.',
 fr:'Il voyait dans cette charge un grave devoir et cherchait en Dieu la force nécessaire, plutôt que de compter sur lui-même.'};
let composeCalls=0,verifyCalls=0,held=0,drafts=0;
for(const c of cases){
 const chapter=store.chapters.get(chapterId);
 assert(!chapter.nodes.some(n=>n.q[c.language]===c.question),
  'Question unexpectedly identical to scripted source-owner question');
 const currentId=chapter.nodes[0].id;
 const input={chapterId,nodeId:currentId,language:c.language,
  question:c.question,voiceMode:'documentary',autoRoute:true,
  experimentalComposerProfile:SPX_P53_PROFILE};
 const matched=routePilotQuestion(store,input);
 assert.equal(matched.status,'matched',c.question);
 assert(matched.nodeId.endsWith(c.end),c.question+' -> '+matched.nodeId);
 const original=selectEvidence(store,{...input,nodeId:matched.nodeId});
 assert.equal(original.status,'eligible');
 const originalFingerprint=JSON.stringify(original.evidence);
 const structured=makeP53AtomicComposerContext(original,'documentary');
 assert.equal(structured.outputLanguage,c.language);
 assert.equal(structured.evidence[0].id,matched.nodeId);
 assert(!JSON.stringify(structured).includes('"readingNote"'));
 assert(!JSON.stringify(structured).includes('"originalResearchNotesStatus"'));
 assert(!JSON.stringify(structured).includes('this statement belongs to paragraph'));
 const originalWitnesses=original.evidence[0].originalLanguageWitnesses;
 assert.deepEqual(structured.evidence[0].originalLanguageWitnesses.map(w=>w.id),
  originalWitnesses.map(w=>w.id));
 assert.deepEqual(structured.evidence[0].originalLanguageWitnesses.map(w=>w.originalText),
  originalWitnesses.map(w=>w.text));
 let called=0;
 const fake=async(stage,messages)=>{
  const d=JSON.parse(messages[1].content);called++;
  if(stage==='compose'){
   composeCalls++;
   assert.equal(d.task,'ANSWER_ONE_VISITOR_QUESTION_IN_NATURAL_CONVERSATION');
   assert.equal(d.question,c.question);
   assert.equal(d.outputLanguage,c.language);
   assert.equal(d.editorialCuesNotPrimaryEvidence,true);
   assert(!JSON.stringify(d).includes('"readingNote"'));
   return {mode:'answer',text:pref[c.language],evidenceIds:[matched.nodeId],
    witnessIds:[d.evidence[0].originalLanguageWitnesses[0].id],
    expression:'thoughtful'};
  }
  verifyCalls++;
  // Verifier never sees the noncanonical atomic bilingual cue list.
  assert.equal(JSON.stringify(d.evidence),originalFingerprint);
  assert.equal(JSON.stringify(d).includes('draftClaimCue'),false);
  return {supported:true,allClaimsSupported:true,
   ids:d.candidate.ids,witnessIds:d.candidate.witnessIds};
 };
 const result=await composeDraft(store,input,fake);
 assert.equal(result.status,'draft',JSON.stringify(result));
 assert.equal(result.composerEvidenceProfile,SPX_P53_PROFILE);
 assert.equal(result.selectedSourceNodeId,matched.nodeId);
 assert.equal(result.publishingApproved,false);
 assert.equal(called,2);
 drafts++;
}
for(const c of refusals){
 const chapter=store.chapters.get(chapterId);
 const input={chapterId,nodeId:chapter.nodes[0].id,language:c.language,
  question:c.question,autoRoute:true,
  experimentalComposerProfile:SPX_P53_PROFILE};
 const route=routePilotQuestion(store,input);
 assert.equal(route.status,'unmatched',c.question);
 assert.equal(route.reason,'no_explicit_bounded_intent',c.question);
 let calls=0;
 const result=await composeDraft(store,input,async()=>{calls++;throw Error('Model must not be called');});
 assert.equal(result.status,'held');
 assert.equal(result.reason,'no_curated_source_match_for_free_question');
 assert.equal(calls,0);held++;
}
const leak="Il veut conduire les hommes au Christ et, par Lui, à Dieu; cette affirmation appartient au paragraphe 8.";
assert.equal(auditDraftSurface({language:'fr',text:leak,
 question:'Vouliez-vous tout restaurer dans le Christ ?'}).reason,
 'editorial_source_metadata_in_reply');
assert.equal(auditDraftSurface({language:'fr',text:leak,
 question:'Dans quel paragraphe de votre encyclique ?'}).reason,null);
assert.equal(store.data.counts.allNodes,423);
assert.equal(composeCalls,6);
assert.equal(verifyCalls,6);
assert.equal(drafts,6);
assert.equal(held,6);
console.log('PASS SPX_P53_UNPREPARED_ROUTE_AND_ATOMIC_COMPOSER '+JSON.stringify({
 unseenQuestionRoutes:6,outsideSourceRefusalsWithoutModel:6,
 fakeCompose:composeCalls,fakeVerify:verifyCalls,realInference:false,
 noGlossInComposer:true,verifierOriginalEvidenceUnchanged:true,
 editorialMetaHeld:true,sourceQuestionsCanCiteLocations:true,
 originalOwnerNodes:423,approvedReplies:0}));
