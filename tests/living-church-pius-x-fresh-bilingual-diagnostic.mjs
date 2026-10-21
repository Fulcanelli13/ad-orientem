/**
 * One-time fresh editorial measurement. Data fixture was committed before
 * this evaluator executed; DO NOT tune the router to the observed misses and
 * subsequently describe this sample as untouched or representative.
 */
import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {createSharedQuestionRouter} from "../src/learn/living-church-shared-question-router.js";
import {createHybridQuestionRouter} from "../src/learn/living-church-hybrid-question-router.js";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const corpus=read("data/learn/living-church-pius-x-fresh-bilingual-60.v1.json");
const catalog=read("data/learn/living-church-shared-question-routing-pilot.v1.json");
const symbols=read("data/learn/living-church-symbolic-concepts.v1.json");
const pointers=read("data/learn/living-church-pius-x-historical-passage-pointers.v1.json");
assert.equal(corpus.schema,"AO_LIVING_CHURCH_PIUS_X_BLIND_BILINGUAL_FRESH_PROBES_V1");
assert.equal(corpus.status,"FROZEN_EDITORIAL_FRESH_UNTUNED_NOT_INDEPENDENT_VISITOR_SAMPLE");
assert.equal(corpus.primary.length,60);
assert.equal(corpus.confirmedContextContinuations.length,8);
assert.equal(catalog.topics.length,197);
const pointerById=new Map(pointers.records.map(x=>[x.id,x]));
const engines={shared:createSharedQuestionRouter(catalog,{historicalPointers:pointers}),
 hybrid:createHybridQuestionRouter(catalog,symbols,{historicalPointers:pointers})};
const isSpecific=r=>["source_navigation","offer_handoff"].includes(r.kind);
function classify(r,caseInfo){
 const exact=r.topicId===caseInfo.expected_topic_id&&r.documentNavigation?.sourceRef===caseInfo.expected_source_id
  &&r.documentNavigation?.url===pointerById.get(caseInfo.expected_source_id)?.originalDocumentUrl
  &&r.navigationRoute==="historical.external_document";
 if(caseInfo.kind==="DOCUMENTED_HISTORICAL"){
  if(isSpecific(r))return exact?"CORRECT_EXACT_DOCUMENT":"WRONG_SPECIFIC_OR_SCOPE";
  if(r.kind==="clarify"){
   return (r.options||[]).some(o=>o.topicId===caseInfo.expected_topic_id)?
    "INTENDED_TOPIC_IN_CLARIFICATION":"UNRESOLVED_OTHER_CLARIFICATION";
  }
  if(r.kind==="no_coverage")return "SAFE_UNRESOLVED";
  return "OTHER";
 }
 if(caseInfo.kind==="PERSONAL_SOURCE_HOLD"){
  if(r.kind==="no_coverage")return "SAFE_HELD";
  if(r.kind==="clarify")return "SAFE_UNRESOLVED_HELD";
  if(isSpecific(r))return "UNSAFE_HELD_PROPOSAL";
  return "OTHER";
 }
 if(r.kind==="no_coverage")return "SAFE_OUTSIDE";
 if(r.kind==="clarify")return "UNRESOLVED_OUTSIDE";
 if(isSpecific(r))return "UNSUPPORTED_OUTSIDE_PROPOSAL";
 return "OTHER";
}
function group(rows){const sums={total:rows.length};
 for(const {classification} of rows)sums[classification]=(sums[classification]||0)+1;
 return sums;
}
const observations={schema:"AO_LIVING_CHURCH_PIUS_X_FRESH_60_OBSERVATIONS_V1",
 fixtureStatus:corpus.status,
 authoredBy:"Assistant editor; no independent user test sample",
 runKind:"REPEAT_REGRESSION_ON_PREVIOUSLY_INSPECTED_60_PLUS_8_PROMPTS",
 firstFrozenFixtureCommit:"2077725c6dcd44f4de73601f6816504c2ee18caa",
 meaning:"These were new in the original run 39272885295, but are now previously inspected regression prompts. Do not call current measurements fresh or independent visitor data.",
 results:{},records:{}};
const ids=new Set();
for(const [name,engine] of Object.entries(engines)){
 const rows=[],followups=[];
 for(const c of corpus.primary){
  if(name==="shared"){assert.ok(!ids.has(c.id),"duplicate gold id");ids.add(c.id);}
  const response=engine.match(c.question,{language:c.language,currentCharacter:"pius-x"});
  assert.equal(response.answerText,null,c.id+" generated historical answer");
  assert.equal(response.approvedReply||false,false,c.id+" asserted approved reply");
  assert.notEqual(response.kind,"handoff_context",c.id+" silently transferred user");
  if(response.kind==="offer_handoff")assert.equal(response.requiresAcceptance,true);
  const classification=classify(response,c);
  rows.push({caseId:c.id,language:c.language,kind:c.kind,question:c.question,
   editorialCategory:c.editorial_category,expectedTopic:c.expected_topic_id,
   decision:response.kind,reason:response.reason||null,chosenTopic:response.topicId||null,
   options:(response.options||[]).map(o=>o.topicId),
   sourceRef:response.documentNavigation?.sourceRef||null,
   sourceUrl:response.documentNavigation?.url||null,
   requiresQuestionConfirmation:response.requiresQuestionConfirmation===true,
   classification});
 }
 for(const c of corpus.confirmedContextContinuations){
  const options={language:c.language,currentCharacter:"pius-x",
    context:{confirmedActiveTopicId:c.confirmed_source_topic_id,activeTopicId:c.confirmed_source_topic_id}};
  const response=engine.match(c.question,options);
  assert.equal(response.answerText,null,c.id+" authored reply");
  assert.equal(response.approvedReply||false,false);
  assert.notEqual(response.kind,"handoff_context");
  const correct=isSpecific(response)&&response.topicId===c.confirmed_source_topic_id
    &&response.documentNavigation?.sourceRef===c.expected_source_id
    &&response.documentNavigation?.url===pointerById.get(c.expected_source_id)?.originalDocumentUrl;
  const classification=correct?"CORRECT_CONFIRMED_CONTINUATION":
   response.kind==="no_coverage"?"SAFE_UNRESOLVED_CONTINUATION":
   response.kind==="clarify"?"CLARIFY_CONTINUATION":"WRONG_OR_UNSUPPORTED_CONTINUATION";
  const without=engine.match(c.question,{language:c.language,currentCharacter:"pius-x",
   context:{activeTopicId:c.confirmed_source_topic_id}});
  assert.notEqual(without.matchEvidence?.basis,"DOCUMENTARY_CONFIRMED_FOLLOWUP",
   "Unconfirmed context was elevated to documentary confirmation");
  followups.push({caseId:c.id,language:c.language,question:c.question,
    expectedTopic:c.confirmed_source_topic_id,decision:response.kind,
    chosenTopic:response.topicId||null,sourceRef:response.documentNavigation?.sourceRef||null,
    classification,withoutExplicitConfirmation:{decision:without.kind,chosenTopic:without.topicId||null,
     basis:without.matchEvidence?.basis||null}});
 }
 assert.equal(rows.length,60);
 assert.equal(followups.length,8);
 const perLang={en:group(rows.filter(x=>x.language==="en")),fr:group(rows.filter(x=>x.language==="fr"))};
 const perKind={
  documented:group(rows.filter(x=>x.kind==="DOCUMENTED_HISTORICAL")),
  held:group(rows.filter(x=>x.kind==="PERSONAL_SOURCE_HOLD")),
  outside:group(rows.filter(x=>x.kind==="OUTSIDE_SCOPED_HISTORICAL_SOURCE"))};
 observations.results[name]={allPrimary:group(rows),perLang,perKind,confirmedFollowups:group(followups),
   noGeneratedAnswers:true};
 observations.records[name]={primary:rows,followups};
 console.log("SPX_BILINGUAL_REPEATED_REGRESSION "+JSON.stringify({engine:name,...observations.results[name]}));
 for(const r of rows.filter(x=>["WRONG_SPECIFIC_OR_SCOPE","UNSAFE_HELD_PROPOSAL","UNSUPPORTED_OUTSIDE_PROPOSAL"].includes(x.classification)))
  console.log("SPX_BILINGUAL_REPEATED_REGRESSION_ERROR "+JSON.stringify({engine:name,...r}));
}
mkdirSync("research-out",{recursive:true});
const path="research-out/living-church-pius-x-fresh-60-plus-8-results.v1.json";
writeFileSync(path,JSON.stringify(observations,null,2)+"\n");
console.log("SPX_BILINGUAL_REPEATED_REGRESSION_REPORT "+path);
