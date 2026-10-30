import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createSharedQuestionRouter} from "../src/learn/living-church-shared-question-router.js";
import {createHybridQuestionRouter} from "../src/learn/living-church-hybrid-question-router.js";
import {historicalFocusCandidates} from "../src/learn/living-church-historical-focus.js";
const get=async path=>JSON.parse(await readFile(new URL("../"+path,import.meta.url),"utf8"));
const catalog=await get("data/learn/living-church-shared-question-routing-pilot.v1.json");
const pointer=await get("data/learn/living-church-pius-x-historical-passage-pointers.v1.json");
const concepts=await get("data/learn/living-church-symbolic-concepts.v1.json");
assert.equal(pointer.records.length,23);
assert.equal(catalog.topics.length,197);
const cases=[
 ["en","What worried him when he accepted the papacy?",1],
 ["fr","Pourquoi le pape a-t-il accepté le pontificat avec réticence ?",1],
 ["en","Is a chaplet permitted at Mass?",2],
 ["fr","Peut-on réciter le chapelet à la messe ?",2],
 ["en","Does an intrusive thought involve consent to mortal sin?",3],
 ["fr","Une tentation est-elle volontairement un péché ?",3],
 ["en","What prayers help recollection after receiving communion?",4],
 ["en","Can actual grace coexist with our freedom?",5],
 ["fr","La grâce sanctifiante diffère-t-elle de la grâce actuelle ?",5],
 ["en","Does sacred polyphony belong in liturgy?",6],
 ["en","Does Pascendi address the doctrine of Modernism?",7],
 ["en","How should adults learn the catechism?",8],
 ["en","Do the clergy still need meditation amid ministry?",9],
 ["fr","Les prêtres doivent-ils garder la méditation dans leur ministère ?",9],
 ["en","How old should a child be for communion?",10]
];
const topic=n=>"pius.historical_spx_pilot_"+String(n).padStart(2,"0");
const originalMap=new Map(pointer.records.map(r=>[r.id,r]));
const settings={historicalPointers:pointer};
for(const [engineName,engine] of Object.entries({
 shared:createSharedQuestionRouter(catalog,settings),
 hybrid:createHybridQuestionRouter(catalog,concepts,settings)
})){
 let correct=0;
 for(const [language,question,num] of cases){
  const focused=historicalFocusCandidates(question,catalog.topics,language);
  assert.ok(focused.some(t=>t.id===topic(num)),question+" is missing an authored source facet");
  const r=engine.match(question,{language,currentCharacter:"pius-x"});
  assert.equal(r.kind,"source_navigation",engineName+": "+question+" produced "+r.kind);
  assert.equal(r.topicId,topic(num),engineName+": "+question+" routed to "+r.topicId);
  assert.equal(r.navigationRoute,"historical.external_document");
  // Source-owner liturgical routing supersedes generic documentary anchors
  // for Rosary at Mass and post-reception thanksgiving; the original
  // historical URL and source identity must remain identical.
  assert.equal(r.matchEvidence.basis,
    [2,4].includes(num)?"DOCUMENTARY_LITURGICAL_SCOPE":"DOCUMENTARY_ANCHORED");
  assert.equal(r.requiresQuestionConfirmation,true);
  assert.equal(r.documentNavigation.sourceRef,"SPX-PILOT-"+String(num).padStart(2,"0"));
  const p=originalMap.get(r.documentNavigation.sourceRef);
  assert.equal(r.documentNavigation.url,p.originalDocumentUrl);
  assert.equal(r.documentNavigation.sourceLocator,p.sourceLocator);
  assert.equal(r.documentNavigation.approvedReply,false);
  assert.equal(r.answerText,null);
  correct++;
 }
 for(const [language,question,num] of [
  ["en","As a boy, were you ashamed of your poor childhood?",11],
  ["fr","Avez-vous ressenti de la honte dans votre enfance pauvre ?",11],
  ["en","My prayer is dry, does that make me guilty?",12],
  ["fr","Ma prière est sèche, suis-je coupable ?",12]
 ]){
  const r=engine.match(question,{language,currentCharacter:"pius-x"});
  assert.equal(r.kind,"no_coverage",engineName+": held case "+question);
  // The newer global safety screen intentionally takes precedence over a
  // narrower historical topic-gap lookup for individualized moral verdicts.
  if(num===12){
   // The personal-verdict safety screen or the historically held source gap
   // may safely reject this question; neither can offer a document as reply.
   assert.ok(["UNSUPPORTED_PERSONAL_SPIRITUAL_VERDICT","TOPIC_SOURCE_GAP"].includes(r.reason),
    "Unsupported personal guidance must be held, not routed");
   if(r.reason==="TOPIC_SOURCE_GAP")assert.equal(r.topicId,topic(num));
   else assert.equal(r.topicId,undefined);
   assert.equal(r.documentNavigation,undefined);
  }else{
   assert.equal(r.reason,"TOPIC_SOURCE_GAP");
   assert.equal(r.topicId,topic(num));
  }
  assert.equal(r.answerText,null);
 }
 // Construction without the historical pointer registry must never disguise
 // a document-locator result as a link to the generic Catechism screen.
 const noPointer=engineName==="shared"?createSharedQuestionRouter(catalog):
  createHybridQuestionRouter(catalog,concepts);
 const r=noPointer.match(cases[2][1],{language:"en",currentCharacter:"pius-x"});
 assert.equal(r.kind,"no_coverage");
 assert.equal(r.reason,"HISTORICAL_SOURCE_POINTER_NOT_RESOLVED");
 console.log("HISTORICAL_SOURCE_NAVIGATION "+JSON.stringify({engine:engineName,correct,
  held:4,genericCatechismMisroute:0,answersCreated:0}));
}
// A historical source link must remain canonical if another character is asked.
const router=createSharedQuestionRouter(catalog,{historicalPointers:pointer});
const offer=router.match("Can actual grace coexist with our freedom?",{currentCharacter:"canon"});
assert.equal(offer.kind,"offer_handoff");
assert.equal(offer.targetRoute,"historical.external_document");
assert.equal(offer.requiresAcceptance,true);
assert.equal(router.acceptHandoff(offer,{accept:false}).kind,"stay");
assert.equal(router.acceptHandoff(offer,{accept:true}).kind,"needs_question_confirmation");
assert.equal(router.acceptHandoff({...offer,documentNavigation:{...offer.documentNavigation,url:"https://example.net/forged"}},{accept:true,confirmQuestion:true}).kind,"invalid_handoff");
const accepted=router.acceptHandoff(offer,{accept:true,confirmQuestion:true});
assert.equal(accepted.kind,"handoff_context");
assert.equal(accepted.navigationRoute,"historical.external_document");
assert.equal(accepted.documentNavigation.url,originalMap.get("SPX-PILOT-05").originalDocumentUrl);
assert.equal(accepted.answerText,null);

for(const engine of [
 createSharedQuestionRouter(catalog,{historicalPointers:pointer}),
 createHybridQuestionRouter(catalog,concepts,{historicalPointers:pointer})
]){
 for(const [question,num] of [
  ["What was your mission after accepting the office?",1],
  ["How can I unite myself to the sacrifice?",2],
  ["Is Palestrina's polyphony suitable?",6]
 ]){
  const intended=topic(num);
  const result=engine.match(question,{currentCharacter:"pius-x",
    context:{confirmedActiveTopicId:intended}});
  assert.equal(result.kind,"source_navigation");
  assert.equal(result.topicId,intended);
  assert.equal(result.matchEvidence.basis,"DOCUMENTARY_CONFIRMED_FOLLOWUP");
  assert.equal(result.requiresQuestionConfirmation,true);
  assert.equal(result.documentNavigation.url,originalMap.get("SPX-PILOT-"+String(num).padStart(2,"0")).originalDocumentUrl);
  assert.equal(result.answerText,null);
  const unconfirmed=engine.match(question,{currentCharacter:"pius-x",
    context:{activeTopicId:intended}});
  assert.notEqual(unconfirmed.matchEvidence?.basis,"DOCUMENTARY_CONFIRMED_FOLLOWUP",
    "A merely proposed historical route must not become confirmed context");
 }
}
// A layperson's private prayer at Mass is not a question about a priest's
// mental prayer. Do not infer Haerent animo merely from "priest" + "prayer".
for(const engine of [
 createSharedQuestionRouter(catalog,{historicalPointers:pointer}),
 createHybridQuestionRouter(catalog,concepts,{historicalPointers:pointer})
]){
 const out=engine.match("May I say private prayers while the priest celebrates Mass?",
   {language:"en",currentCharacter:"pius-x"});
 assert.notEqual(out.topicId,topic(9),"Lay assistance at Mass must never be sent to priestly meditation");
 assert.equal(out.answerText,null);
}
// Reject unsigned, tampered, or non-original source metadata.
assert.throws(()=>createSharedQuestionRouter(catalog,{historicalPointers:{
 ...pointer,records:pointer.records.map((x,i)=>i===0?{...x,originalDocumentUrl:"javascript:alert(1)"}:x)
}}),/Invalid original historical source pointer/);

// Explicitly demonstrate unrelated common-doctrine questions do not impersonate a
// historical papal document solely because a generic term appeared.
for(const question of ["what is ordinary sin","where should i pray","can i see the eucharist"]){
 assert.deepEqual(historicalFocusCandidates(question,catalog.topics,"en"),[]);
}
console.log("PASS original source destination, EN/FR intent facets, held personal cases, tamper guards");
