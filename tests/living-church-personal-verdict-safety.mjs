import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createSharedQuestionRouter} from "../src/learn/living-church-shared-question-router.js";
import {createHybridQuestionRouter} from "../src/learn/living-church-hybrid-question-router.js";
import {screenPersonalSpiritualVerdict} from "../src/learn/living-church-personal-verdict-gate.js";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const samples=read("data/learn/living-church-personal-verdict-boundary-48.v1.json");
const catalog=read("data/learn/living-church-shared-question-routing-pilot.v1.json");
const concepts=read("data/learn/living-church-symbolic-concepts.v1.json");
const pointers=read("data/learn/living-church-pius-x-historical-passage-pointers.v1.json");
assert.equal(samples.schema,"AO_LIVING_CHURCH_PERSONAL_VERDICT_BOUNDARY_FIXTURE_V1");
assert.equal(samples.status,"FROZEN_PRE_IMPLEMENTATION_AUTHOR_EDITORIAL_FIXTURE");
assert.equal(samples.records.length,48);
assert.equal(samples.records.filter(x=>x.expected_policy==="HOLD_PERSONAL_VERDICT").length,24);
assert.equal(samples.records.filter(x=>x.expected_policy==="ALLOW_GENERAL_TOPIC").length,24);
let classifiedHold=0,classifedAllowed=0;
const inspected=new Set();
for(const row of samples.records){
 assert.ok(!inspected.has(row.id),"Duplicate case ID "+row.id);inspected.add(row.id);
 const screen=screenPersonalSpiritualVerdict(row.question,{language:row.language});
 if(row.expected_policy==="HOLD_PERSONAL_VERDICT"){
  assert.equal(screen?.reason,"UNSUPPORTED_PERSONAL_SPIRITUAL_VERDICT",
   row.id+": missed individual verdict: "+row.question);classifiedHold++;
 }else{
  assert.equal(screen,null,row.id+": ordinary doctrinal question blocked: "+row.question);
  classifedAllowed++;
 }
}
assert.equal(classifiedHold,24);
assert.equal(classifedAllowed,24);
for(const [name,router] of Object.entries({
 shared:createSharedQuestionRouter(catalog,{historicalPointers:pointers}),
 hybrid:createHybridQuestionRouter(catalog,concepts,{historicalPointers:pointers})
})){
 let blocked=0,permitted=0;
 for(const row of samples.records){
  const options={language:row.language,currentCharacter:"pius-x"};
  const result=router.match(row.question,options);
  assert.equal(result.answerText,null,name+" created a visitor answer");
  assert.equal(result.approvedReply||false,false);
  assert.notEqual(result.kind,"handoff_context","Silent handoff forbidden");
  if(row.expected_policy==="HOLD_PERSONAL_VERDICT"){
   assert.equal(result.kind,"no_coverage",name+" failed personal-verdict abstention "+row.id);
   assert.equal(result.reason,"UNSUPPORTED_PERSONAL_SPIRITUAL_VERDICT",name+": "+row.question);
   assert.equal(result.documentNavigation,undefined);
   assert.equal(result.sourceRefs,undefined);
   blocked++;
   // The user cannot bypass safety by explicitly choosing a catechism topic.
   for(const opts of [
    {...options,chosenTopicId:"pius.historical_spx_pilot_05"},
    {...options,context:{activeTopicId:"pius.historical_spx_pilot_05",
      confirmedActiveTopicId:"pius.historical_spx_pilot_05"}},
    {...options,currentCharacter:"canon",chosenTopicId:"pius.historical_spx_pilot_05"}
   ]){
    const forced=router.match(row.question,opts);
    assert.equal(forced.kind,"no_coverage",name+" bypassed verdict gate "+row.id);
    assert.equal(forced.reason,"UNSUPPORTED_PERSONAL_SPIRITUAL_VERDICT");
    assert.equal(forced.answerText,null);
    assert.equal(forced.documentNavigation,undefined);
   }
  }else{
   assert.notEqual(result.reason,"UNSUPPORTED_PERSONAL_SPIRITUAL_VERDICT",
    name+" incorrectly blocked general catechism topic "+row.id);
   permitted++;
  }
 }
 assert.equal(blocked,24);
 assert.equal(permitted,24);
 console.log("PERSONAL_VERDICT_BOUNDARY "+JSON.stringify({engine:name,held:blocked,
  allowed:permitted,contextBypasses:0,chosenTopicBypasses:0,generatedAnswers:0}));
}
// Previously observed safety failure is now a permanent *regression* case,
// not reclassified as fresh evidence. Preserve the original frozen input.
const frozenFresh=read("data/learn/living-church-pius-x-fresh-bilingual-60.v1.json");
const knownFailure=frozenFresh.primary.find(x=>x.id==="SPXFRESH-045");
assert.ok(knownFailure&&knownFailure.kind==="PERSONAL_SOURCE_HOLD");
for(const [name,router] of Object.entries({
 shared:createSharedQuestionRouter(catalog,{historicalPointers:pointers}),
 hybrid:createHybridQuestionRouter(catalog,concepts,{historicalPointers:pointers})
})){
 const result=router.match(knownFailure.question,{language:"en",currentCharacter:"pius-x"});
 assert.equal(result.kind,"no_coverage",name+" regressed prior unsafe spiritual diagnosis");
 assert.equal(result.reason,"UNSUPPORTED_PERSONAL_SPIRITUAL_VERDICT");
 assert.equal(result.documentNavigation,undefined);
 assert.equal(result.answerText,null);
}
console.log("PASS prior-frozen 48 EN/FR personal-verdict negative and doctrinal positive controls");
