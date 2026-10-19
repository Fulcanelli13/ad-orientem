import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createSharedQuestionRouter} from "../src/learn/living-church-shared-question-router.js";
import {createHybridQuestionRouter} from "../src/learn/living-church-hybrid-question-router.js";
import {scopeLiturgicalQuestion} from "../src/learn/living-church-liturgical-source-scope.js";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const fixture=read("data/learn/living-church-pius-x-liturgical-scope-26.v1.json");
const catalog=read("data/learn/living-church-shared-question-routing-pilot.v1.json");
const concept=read("data/learn/living-church-symbolic-concepts.v1.json");
const pointers=read("data/learn/living-church-pius-x-historical-passage-pointers.v1.json");
const old=read("data/learn/living-church-pius-x-fresh-bilingual-60.v1.json");
assert.equal(fixture.schema,"AO_LIVING_CHURCH_LITURGICAL_SCOPE_CONTRAST_PROBES_V1");
assert.equal(fixture.cases.length,26);
const historicalId={
 PIUS_X_ROSARY_AT_MASS:"SPX-PILOT-02",
 PIUS_X_THANKSGIVING_AFTER_COMMUNION:"SPX-PILOT-04",
 PIUS_X_PRIESTLY_MEDITATION:"SPX-PILOT-09"
};
const shared=createSharedQuestionRouter(catalog,{historicalPointers:pointers});
const hybrid=createHybridQuestionRouter(catalog,concept,{historicalPointers:pointers});
const engines={shared,hybrid};
for(const [name,engine] of Object.entries(engines)){
 const categories={};
 for(const row of fixture.cases){
  categories[row.expected_scope]=(categories[row.expected_scope]||0)+1;
  const r=engine.match(row.question,{language:row.language,currentCharacter:"pius-x"});
  assert.equal(r.answerText,null,row.id);
  assert.equal(r.approvedReply||false,false,row.id);
  assert.notEqual(r.kind,"handoff_context",row.id);
  if(row.expected_scope==="PIUS_X_ROSARY_AT_MASS"||
     row.expected_scope==="PIUS_X_THANKSGIVING_AFTER_COMMUNION"){
   assert.equal(r.kind,"source_navigation",name+" incorrectly refused "+row.id);
   assert.equal(r.documentNavigation?.sourceRef,historicalId[row.expected_scope],name+" incorrect source "+row.id);
   assert.equal(r.navigationRoute,"historical.external_document");
   assert.equal(r.requiresQuestionConfirmation,true);
   const original=pointers.records.find(x=>x.id===historicalId[row.expected_scope]);
   assert.equal(r.documentNavigation.url,original.originalDocumentUrl);
  }else if(row.expected_scope==="SAFE_ABSTAIN_UNSPECIFIED_LAY_PRAYER"){
   assert.equal(r.kind,"no_coverage",name+" guessed source for "+row.id);
   assert.equal(r.reason,"LAY_MASS_PRAYER_SOURCE_NOT_IDENTIFIED",name+": "+row.id);
   assert.equal(r.documentNavigation,undefined);
  }else if(row.expected_scope==="PIUS_X_PRIESTLY_MEDITATION"){
   assert.equal(r.kind,"source_navigation",name+" stopped priestly meditation "+row.id);
   assert.equal(r.documentNavigation?.sourceRef,historicalId[row.expected_scope]);
  }else if(row.expected_scope==="NO_HISTORICAL_SOURCE_SCOPE"){
   assert.ok(!["SPX-PILOT-02","SPX-PILOT-04","SPX-PILOT-09"].includes(r.documentNavigation?.sourceRef),
    name+" misrouted unrelated topic "+row.id);
  }
 }
 // Historical-source destination missing: never navigate to generic catechism.
 const unlinked=name==="shared"?createSharedQuestionRouter(catalog):
  createHybridQuestionRouter(catalog,concept);
 const source=fixture.cases.find(x=>x.expected_scope==="PIUS_X_ROSARY_AT_MASS");
 const r=unlinked.match(source.question,{language:source.language,currentCharacter:"pius-x"});
 assert.equal(r.kind,"no_coverage");
 assert.equal(r.reason,"HISTORICAL_SOURCE_POINTER_NOT_RESOLVED");
 // Prior editorial diagnostic is no longer blind; hold its observed failures as
 // permanent *regressions*, never source-authoritative training text.
 for(const [id,expected] of [
  ["SPXFRESH-007","SPX-PILOT-02"],
  ["SPXFRESH-013","SPX-PILOT-04"],
  ["SPXFRESH-015","SPX-PILOT-04"]
 ]){
  const row=old.primary.find(x=>x.id===id);
  assert.ok(row);
  const actual=engine.match(row.question,{language:row.language,currentCharacter:"pius-x"});
  assert.equal(actual.kind,"source_navigation",name+" source scope regression "+id);
  assert.equal(actual.documentNavigation?.sourceRef,expected,name+" wrong source "+id);
 }
 // No sensitive personal-diagnosis source proposal was reintroduced.
 const verdict=old.primary.find(x=>x.id==="SPXFRESH-045");
 const held=engine.match(verdict.question,{language:verdict.language,currentCharacter:"pius-x"});
 assert.equal(held.reason,"UNSUPPORTED_PERSONAL_SPIRITUAL_VERDICT");
 console.log("LITURGICAL_SCOPE "+JSON.stringify({engine:name,total:fixture.cases.length,
  categories,priorWrongSourceRegressionsCorrected:3,answersGenerated:0}));
}
assert.equal(scopeLiturgicalQuestion("What does the tabernacle contain?",{language:"en"}),null);
console.log("PASS historic lay/priest, moment-of-reception, negative examples and strict document source");
