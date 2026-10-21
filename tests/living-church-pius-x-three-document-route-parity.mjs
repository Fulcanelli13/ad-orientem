/**
 * Three previously disclosed document-first questions from Pius X source owner
 * PR #1458 (EN/FR). Regression on the original shared/hybrid source-only router,
 * NOT a blind holdout or evaluation of character answer quality.
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createSharedQuestionRouter} from "../src/learn/living-church-shared-question-router.js";
import {createHybridQuestionRouter} from "../src/learn/living-church-hybrid-question-router.js";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const catalog=read("data/learn/living-church-shared-question-routing-pilot.v1.json");
const symbols=read("data/learn/living-church-symbolic-concepts.v1.json");
const pointers=read("data/learn/living-church-pius-x-historical-passage-pointers.v1.json");
const pointerMap=new Map(pointers.records.map(x=>[x.id,x]));
assert.equal(catalog.topics.length,197);
assert.equal(pointers.records.length,23);
for(const [id,locator,urlTail] of [
 ["SPX-PILOT-13","Acerbo nimis §§12–14","acerbo-nimis.html"],
 ["SPX-PILOT-14","E supremi §13","e-supremi.html"],
 ["SPX-PILOT-09","Haerent animo §§15–20","haerent-animo.html"]
]){
 const source=pointerMap.get(id);
 assert.equal(source.sourceLocator,locator);
 assert(source.originalDocumentUrl.endsWith(urlTail));
 assert.equal(source.approvedReply,false);
}
const cases=[
 ["ACERBO","en","Can an excellent preacher neglect the catechism?","SPX-PILOT-13"],
 ["ACERBO","fr","Un excellent prédicateur peut-il négliger le catéchisme ?","SPX-PILOT-13"],
 ["ESUPREMI","en","Should I be charitable even when someone mocks the Church?","SPX-PILOT-14"],
 ["ESUPREMI","fr","Dois-je rester charitable même lorsqu’on se moque de l’Église ?","SPX-PILOT-14"],
 ["HAERENT","en","Does a busy parish priest really need daily meditation?","SPX-PILOT-09"],
 ["HAERENT","fr","Un curé débordé doit-il vraiment méditer chaque jour ?","SPX-PILOT-09"]
];
const engines={
 shared:createSharedQuestionRouter(catalog,{historicalPointers:pointers}),
 hybrid:createHybridQuestionRouter(catalog,symbols,{historicalPointers:pointers})
};
for(const [engineName,engine] of Object.entries(engines)){
 for(const [doc,language,q,sourceId] of cases){
  const r=engine.match(q,{language,currentCharacter:"pius-x"});
  assert.equal(r.kind,"source_navigation",engineName+": "+q+": "+JSON.stringify(r));
  assert.equal(r.documentNavigation?.sourceRef,sourceId,engineName+": "+q);
  assert.equal(r.documentNavigation?.sourceLocator,pointerMap.get(sourceId).sourceLocator);
  assert.equal(r.documentNavigation?.url,pointerMap.get(sourceId).originalDocumentUrl);
  assert.equal(r.navigationRoute,"historical.external_document");
  assert.equal(r.requiresQuestionConfirmation,true);
  assert.equal(r.answerText,null);
  assert.equal(r.approvedReply,false);
  assert.equal(r.documentNavigation.approvedReply,false);
  console.log("SPX_DOCUMENT_FIRST_NAVIGATION "+JSON.stringify({engine:engineName,doc,language,sourceId,outcome:"CORRECT_EXACT_SOURCE_LOCATOR"}));
 }
 // Separate original locators must survive without being silently widened.
 for(const [q,sourceId] of [
  ["What worried him when he accepted the papacy?","SPX-PILOT-01"],
  ["How should adults learn the catechism?","SPX-PILOT-08"]
 ]){
  const r=engine.match(q,{language:"en",currentCharacter:"pius-x"});
  assert.equal(r.documentNavigation?.sourceRef,sourceId,"Original source owner regressed: "+q);
 }
 for(const q of [
  "May I say private prayers while a priest says Mass?",
  "What is Christian charity?",
  "How can I preach the Gospel without knowing the catechism?",
  "My prayer is dry; am I in mortal sin?"
 ]){
  const r=engine.match(q,{language:"en",currentCharacter:"pius-x"});
  assert(!["SPX-PILOT-13","SPX-PILOT-14","SPX-PILOT-09"].includes(r.documentNavigation?.sourceRef),
    "Overbroad historical-passage match: "+q);
  assert.equal(r.answerText,null);
 }
}
const noPointers=createSharedQuestionRouter(catalog);
for(const [,,q] of cases.filter(x=>x[1]==="en")){
 const r=noPointers.match(q,{language:"en",currentCharacter:"pius-x"});
 assert.equal(r.kind,"no_coverage");
 assert.equal(r.reason,"HISTORICAL_SOURCE_POINTER_NOT_RESOLVED");
}
console.log("PASS SPX 6/6 bilingual documentary passage routes in each router; original owners, no-answer safety and unrelated questions retained");
