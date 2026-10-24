/**
 * PR #1458 canonical 34-turn derivative + pinned PR #1443 source-only router.
 * This is a guarded retrieval acceptance test, not a historical speech release.
 */
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createPiusDocumentFirstReviewSelector} from '../tools/formation/pius-x-document-first-answer-selector.mjs';
const load=p=>JSON.parse(readFileSync(p,'utf8'));
const root='research-out/pr1443-pius-x-document-first-router/';
const benchmark=load('artifacts/pius-x-complete-corpus/SPX_Three_Document_Full_34_Turn_Claim_Map.json');
const registry=load('data/learn/research/pius-x-document-first-router-to-claims-20261021.v1.json');
const catalog=load(root+'data/learn/living-church-shared-question-routing-pilot.v1.json');
const pointers=load(root+'data/learn/living-church-pius-x-historical-passage-pointers.v1.json');
const symbols=load(root+'data/learn/living-church-symbolic-concepts.v1.json');
const concepts=load(root+'data/learn/living-church-pius-x-source-concept-facets.v1.json');
const {createSharedQuestionRouter}=await import(pathToFileURL(resolve(root+'src/learn/living-church-shared-question-router.js')).href);
const {createHybridQuestionRouter}=await import(pathToFileURL(resolve(root+'src/learn/living-church-hybrid-question-router.js')).href);
assert.equal(catalog.topics.length,197);
assert.equal(pointers.records.length,23);
assert.equal(registry.expectedRouterCommit,'433e0b515b4800593a18b1d8594efec3f9936eaa');
const engines={
 shared:createSharedQuestionRouter(catalog,{historicalPointers:pointers,sourceConceptRegistry:concepts}),
 hybrid:createHybridQuestionRouter(catalog,symbols,{historicalPointers:pointers,sourceConceptRegistry:concepts})
};
const primary=[
 {doc:'ACERBO',en:'Can an excellent preacher neglect the catechism?',fr:'Un excellent prédicateur peut-il négliger le catéchisme ?',source:'SPX-PILOT-13',plan:'ACERBO_PREACHING_FOUNDATION',claims:['A15','A16']},
 {doc:'ESUPREMI',en:'Should I be charitable even when someone mocks the Church?',fr:'Dois-je rester charitable même lorsqu’on se moque de l’Église ?',source:'SPX-PILOT-14',plan:'ESUPREMI_CHARITY_OPPONENTS',claims:['E03','E13']},
 {doc:'HAERENT',en:'Does a busy parish priest really need daily meditation?',fr:'Un curé débordé doit-il vraiment méditer chaque jour ?',source:'SPX-PILOT-09',plan:'HAERENT_BUSY_PRIEST_MEDITATION',claims:['H17','H18','H20']}
];
const alternates=[
 {doc:'ACERBO',en:'What is the difference between a sermon and catechism?',fr:'Quelle différence entre le sermon et le catéchisme ?',source:'SPX-PILOT-13',plan:'ACERBO_HOMILY_CATECHESIS',claims:['A05','A06']},
 {doc:'ESUPREMI',en:'Why should charity avoid harsh reproach?',fr:'Pourquoi la charité évite-t-elle les reproches sévères ?',source:'SPX-PILOT-14',plan:'ESUPREMI_SEVERE_REPROOF',claims:['E03']},
 {doc:'HAERENT',en:'Can habit weaken meditation for priests?',fr:'L’habitude affaiblit-elle la méditation d’un curé ?',source:'SPX-PILOT-09',plan:'HAERENT_HABIT_FERVOUR',claims:['H19','H18']}
];
const contextualFollowups=[
 {source:'SPX-PILOT-13',topic:'pius.historical_spx_pilot_13',
  en:'And how did you compare the homily?',fr:'Et pourquoi cette différence pour l’homélie ?',
  plan:'ACERBO_HOMILY_CATECHESIS',claims:['A05','A06']},
 {source:'SPX-PILOT-14',topic:'pius.historical_spx_pilot_14',
  en:'And what of reproof?',fr:'Et les reproches ?',
  plan:'ESUPREMI_SEVERE_REPROOF',claims:['E03']},
 {source:'SPX-PILOT-09',topic:'pius.historical_spx_pilot_09',
  en:'And can habit weaken meditation?',fr:'Et si l’habitude remplaçait la méditation ?',
  plan:'HAERENT_HABIT_FERVOUR',claims:['H19','H18']}
];
const negative=[
 ['en','May I pray privately during Mass while the priest celebrates?'],
 ['en','Was my last sin mortal?'],
 ['en','Is the law of 1905 binding on my parish today?'],
 ['fr','Est-ce que ma distraction à la messe est un péché mortel ?'],
 ['fr','Faut-il que mon curé me dise comment prier pendant la messe ?'],
 ['en','How much is the catechism textbook?']
];
const rows=[],report={schema:'AO_SPX_DOCUMENT_FIRST_SOURCE_BOUND_12_BILINGUAL_CANDIDATES_V1',
 status:'EXECUTED_EDITORIAL_REVIEW_ONLY_NOT_PUBLICATION_APPROVED',
 owner:'PR #1458',routerOwner:'PR #1443',pinnedRouterCommit:registry.expectedRouterCommit,
 methodology:'18 EN/FR questions (six independent intents and three explicitly confirmed elliptical followups in each language) using exact source navigation, both routing engines, plus six negative challenges. No generated papal speech and no independently fresh user sample.',
 observations:[]};
for(const [engineName,router] of Object.entries(engines)){
 const selector=createPiusDocumentFirstReviewSelector({router,benchmark,registry,pointers});
 assert.equal(selector.linkedSources.length,16);
 assert.deepEqual(selector.linkedSources.slice(0,3),['SPX-PILOT-13','SPX-PILOT-14','SPX-PILOT-09']);
 for(const entry of [...primary,...alternates]){
  const twins=[];
  for(const lang of ['en','fr']){
   const q=entry[lang];
   const before=selector.evaluate(q,{language:lang});
   assert.equal(before.kind,'confirm_source',engineName+' unconfirmed '+q+': '+JSON.stringify(before));
   assert.equal(before.answerText,null);
   assert.equal(before.sourceRef,entry.source);
   const result=selector.evaluate(q,{language:lang,confirmed:true});
   assert.equal(result.kind,'editorial_candidate',engineName+' '+q+': '+JSON.stringify(result));
   assert.equal(result.sourceRef,entry.source);
   assert.equal(result.selectionPlan,entry.plan);
   assert.deepEqual(result.claimIds,entry.claims);
   assert.equal(result.originalAudience,entry.doc==='HAERENT'?'Catholic clergy':'bishops');
   assert.equal(result.approvedReply,false);
   assert.equal(result.answerText,null);
   assert.equal(result.publicationEligible,false);
   assert.equal(result.speechMode,'ADAPTED_PAPAL_VOICE_NOT_HISTORICAL_QUOTE');
   assert(result.segments.length>=1&&result.segments.length<=3);
   for(const seg of result.segments)assert(seg.text.length>20);
   twins.push(result);
   rows.push({engine:engineName,language:lang,question:q,document:entry.doc,
    sourceRef:result.sourceRef,sourceLocator:result.sourceLocator,
    selectionPlan:result.selectionPlan,claimIds:result.claimIds,
    segmentIds:result.segments.map(s=>s.segmentId),
    adaptation:result.displayAdaptation,approvedReply:false});
  }
  assert.deepEqual(twins[0].segments.map(s=>s.segmentId),twins[1].segments.map(s=>s.segmentId),
    'English/French must use the same canonical source segments');
  assert.deepEqual(twins[0].claimIds,twins[1].claimIds);
 }
 for(const entry of contextualFollowups){
  const pair=[];
  for(const language of ['en','fr']){
   const q=entry[language],context={activeTopicId:entry.topic,confirmedActiveTopicId:entry.topic};
   const result=selector.evaluate(q,{language,confirmed:true,context});
   assert.equal(result.kind,'editorial_candidate',engineName+': follow-up '+q+': '+JSON.stringify(result));
   assert.equal(result.sourceRef,entry.source);
   assert.equal(result.selectionPlan,entry.plan);
   assert.deepEqual(result.claimIds,entry.claims);
   assert.equal(result.contextualSelection,true);
   assert.equal(result.answerText,null);
   assert.equal(result.approvedReply,false);
   pair.push(result);
   rows.push({engine:engineName,language,question:q,
    sourceRef:result.sourceRef,sourceLocator:result.sourceLocator,
    selectionPlan:result.selectionPlan,claimIds:result.claimIds,
    segmentIds:result.segments.map(s=>s.segmentId),
    adaptation:result.displayAdaptation,contextualFollowup:true,approvedReply:false});
   // Without an explicitly confirmed prior topic, the same elliptical phrase
   // is not allowed to bootstrap source ownership.
   const unconfirmed=selector.evaluate(q,{language,confirmed:true,
    context:{activeTopicId:entry.topic}});
   assert.notEqual(unconfirmed.kind,'editorial_candidate',
     'unconfirmed previous guess falsely licensed a documentary followup: '+q);
  }
  assert.deepEqual(pair[0].segments.map(s=>s.segmentId),pair[1].segments.map(s=>s.segmentId));
 }
 const exactAuthored='can an eloquent sermon take the place of the catechism';
 const exactResult=router.match(exactAuthored,{language:'en',currentCharacter:'pius-x'});
 assert.equal(exactResult.kind,'source_navigation');
 // The historical documentary-focus gate may still ask for confirmation
 // even on a catalog variant; emulate the strongest exact-variant allowance.
 const exactVariantRouter={match:()=>({...exactResult,requiresQuestionConfirmation:false})};
 const exactVariantSelector=createPiusDocumentFirstReviewSelector({
  router:exactVariantRouter,benchmark,registry,pointers
 });
 const stillNeedsConfirmation=exactVariantSelector.evaluate(exactAuthored,{language:'en'});
 assert.equal(stillNeedsConfirmation.kind,'confirm_source',
  'matching an authored catalog phrase is not consent to unapproved papal speech');
 assert.equal(stillNeedsConfirmation.answerText,null);
 for(const [lang,q] of negative){
  const r=selector.evaluate(q,{language:lang,confirmed:true});
  assert.notEqual(r.kind,'editorial_candidate','Negative question falsely selected papal speech: '+q);
  assert.equal(r.answerText,null);
  assert.equal(r.approvedReply,false);
 }
 const original=primary[0];
 const noPointer=createPiusDocumentFirstReviewSelector({
  router:createSharedQuestionRouter(catalog),benchmark,registry,pointers
 });
 assert.equal(noPointer.evaluate(original.en,{language:'en',confirmed:true}).kind,'no_review_answer');
}
const expected=Object.keys(engines).length*(primary.length+alternates.length+contextualFollowups.length)*2;
assert.equal(rows.length,expected);
const registryClone=structuredClone(registry);
registryClone.entries[0].selectionPlans[0].claimIds=['A01'];
assert.throws(()=>createPiusDocumentFirstReviewSelector({router:engines.shared,benchmark,registry:registryClone,pointers}),
 /claim sequence must be complete and exact/);
const mutatedPointers=structuredClone(pointers);
mutatedPointers.records.find(p=>p.id==='SPX-PILOT-14').sourceLocator='E supremi §14';
assert.throws(()=>createPiusDocumentFirstReviewSelector({router:engines.shared,benchmark,registry,pointers:mutatedPointers}));
const forgedRouter={match:()=>({
 kind:'source_navigation',topicId:'pius.historical_spx_pilot_14',
 navigationRoute:'historical.external_document',approvedReply:false,answerText:null,
 requiresQuestionConfirmation:true,documentNavigation:{sourceRef:'SPX-PILOT-14',
 url:'https://example.org/forged',sourceLocator:'E supremi §13',approvedReply:false}
})};
const forgedSelector=createPiusDocumentFirstReviewSelector({router:forgedRouter,benchmark,registry,pointers});
assert.equal(forgedSelector.evaluate('Charity towards opponents',{confirmed:true}).kind,'source_mismatch');
report.observations=rows;
report.counts={correctSourceBoundCandidates:rows.length,incorrectSourceOrClaim:0,
 refusedNegativePrompts:negative.length*Object.keys(engines).length,
 preservedLanguagePairings:(primary.length+alternates.length+contextualFollowups.length)*Object.keys(engines).length,
 publicationApprovals:0};
mkdirSync('research-out',{recursive:true});
writeFileSync('research-out/pius-x-document-first-answer-selection.v1.json',JSON.stringify(report,null,2)+'\n');
console.log('SPX_DOCUMENT_FIRST_ANSWER_SELECTION '+JSON.stringify(report.counts));
