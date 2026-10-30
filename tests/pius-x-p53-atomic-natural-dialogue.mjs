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
// Replay all four ACTUAL 3B P53 answers that the earlier weak mechanical
// verifier allowed. None was suitable documentary dialogue. This is not
// rerunning a real model: it is a deterministic safety regression using the
// exact machine-generated outputs from Actions run 40099689091.
const observedFalseAccepts=[
 {c:cases[0],why:'first_person_roleplay_in_documentary_mode',
  text:'I resisted the papal election due to the weight of succeeding a greatly esteemed predecessor and the sense of personal unworthiness, but I was consoled by the strength granted by God and the purpose of restoring all things in Christ.'},
 {c:cases[1],why:'first_person_roleplay_in_documentary_mode',
  text:'Honored pontificate, by my own weakness, I cannot be worthy of this office.'},
 {c:cases[3],why:'first_person_roleplay_in_documentary_mode',
  text:'Nous avons résisté à la papauté en raison des larmes et des prières que nous avons adressées, ainsi que par le poids de succéder à un prédécesseur estimé et la force reçue de Dieu pour assumer la charge, en espérant restaurer toutes choses dans le Christ.'},
 {c:cases[5],why:'visitor_question_echoed_as_answer',
  text:"Vouliez-vous tout restaurer dans le Christ ? Je voulais conduire les hommes au Christ et, par le Christ, à Dieu, comme l'encyclopédie de Pius X l'indique."}
];
for(const {c,why,text} of observedFalseAccepts){
 let modelCompose=0,modelVerify=0;
 const input={chapterId,nodeId:store.chapters.get(chapterId).nodes[0].id,
  language:c.language,question:c.question,autoRoute:true,voiceMode:'documentary',
  experimentalComposerProfile:SPX_P53_PROFILE};
 const result=await composeDraft(store,input,async(stage,messages)=>{
  const d=JSON.parse(messages[1].content);
  if(stage==='compose'){
   modelCompose++;
   return {mode:'answer',text,evidenceIds:[d.evidence[0].id],
    witnessIds:[d.evidence[0].originalLanguageWitnesses[0].id],
    expression:'thoughtful'};
  }
  modelVerify++;
  throw new Error('Broken output must not reach AI verifier');
 });
 assert.equal(result.status,'held');
 assert.equal(result.reason,why);
 assert.equal(modelCompose,1);
 assert.equal(modelVerify,0);
 assert.equal(result.publishingApproved,false);
}
const fakeLocator='L’encyclopédie de Pius X indique une orientation vers le Christ et Dieu.';
assert.equal(auditDraftSurface({text:fakeLocator,language:'fr',
 question:cases[5].question,voiceMode:'documentary',
 experimentalComposerProfile:SPX_P53_PROFILE}).reason,
 'invented_secondary_source_reference');
const legitimateSourceCite='Le paragraphe 8 mentionne expressément la conduite des hommes vers le Christ.';
assert.equal(auditDraftSurface({text:legitimateSourceCite,language:'fr',
 question:'Dans quel paragraphe cette intention apparaît-elle ?',voiceMode:'documentary',
 experimentalComposerProfile:SPX_P53_PROFILE}).ok,true);

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
 realP53FalseAcceptsNowHeldBeforeVerifier:4,
 fabricatedEncyclopediaCiteHeld:true,
 originalOwnerNodes:423,approvedReplies:0}));
