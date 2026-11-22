/**
 * Frozen 46 bilingual concept questions + 60 prior questions are INSPECTED
 * regressions after their first run. Never describe as an untouched holdout.
 */
import assert from "node:assert/strict";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {createSharedQuestionRouter} from "../src/learn/living-church-shared-question-router.js";
import {createHybridQuestionRouter} from "../src/learn/living-church-hybrid-question-router.js";
import {validatePiusSourceConceptRegistry} from "../src/learn/living-church-pius-x-source-concepts.js";
const load=p=>JSON.parse(readFileSync(p,"utf8"));
const catalog=load("data/learn/living-church-shared-question-routing-pilot.v1.json");
const symbols=load("data/learn/living-church-symbolic-concepts.v1.json");
const pointers=load("data/learn/living-church-pius-x-historical-passage-pointers.v1.json");
const concepts=load("data/learn/living-church-pius-x-source-concept-facets.v1.json");
const fixture=load("data/learn/living-church-pius-x-doctrinal-concept-frozen-46.v1.json");
const previouslyInspected=load("data/learn/living-church-pius-x-fresh-bilingual-60.v1.json");
const scope=load("data/learn/living-church-pius-x-liturgical-scope-26.v1.json");
const boundary=load("data/learn/living-church-personal-verdict-boundary-48.v1.json");
assert.equal(fixture.schema,"AO_SPX_BILINGUAL_DOCTRINAL_CONCEPT_PROBE_V1");
assert.equal(fixture.status,"FROZEN_BEFORE_THEOLOGICAL_CONCEPT_RETRIEVAL_IMPLEMENTATION");
assert.equal(fixture.primary.length,40);
assert.equal(fixture.followups.length,6);
assert.equal(concepts.families.length,18);
validatePiusSourceConceptRegistry(concepts,catalog);
const engineOptions={historicalPointers:pointers,sourceConceptRegistry:concepts};
const engines={
 shared:createSharedQuestionRouter(catalog,engineOptions),
 hybrid:createHybridQuestionRouter(catalog,symbols,engineOptions)
};
const isSpecific=r=>["source_navigation","offer_handoff"].includes(r.kind);
const report={schema:"AO_SPX_PIUS_X_CONCEPT_REGRESSION_RESULTS_V1",
 status:"REGRESSION_AFTER_FIRST_FROZEN_EDITORIAL_RUN_NOT_BLIND",
 fixture:"data/learn/living-church-pius-x-doctrinal-concept-frozen-46.v1.json",
 originalFirstRun:"data/learn/living-church-pius-x-concept-first-run-20261019.v1.json",
 firstRunLimitation:"Assistant-authored, NOT representative users or historically verified answers",
 engines:{}};
for(const [name,engine] of Object.entries(engines)){
 const counts={exactDocument:0,safeDocumentAbstention:0,wrongDocument:0,
  safeNegatives:0,unsafeNegatives:0,confirmedFollowupsCorrect:0,
  confirmedFollowupsAbstained:0,confirmedFollowupsWrong:0,
  oldCorrect:0,oldUnresolved:0,oldWrong:0,oldPersonalHeld:0,oldPersonalUnsafe:0,
  oldOutsideSafe:0,oldOutsideUnsafe:0,
  liturgicalContrastsSafe:0,verdictControlsPassed:0};
 const errors=[];
 for(const c of fixture.primary){
  const r=engine.match(c.question,{language:c.language,currentCharacter:"pius-x"});
  assert.equal(r.answerText,null);
  assert.equal(r.approvedReply||false,false);
  assert.notEqual(r.kind,"handoff_context");
  if(c.kind==="DOCUMENTED"){
   if(isSpecific(r)&&r.documentNavigation?.sourceRef===c.expected_source_id
     &&r.navigationRoute==="historical.external_document")counts.exactDocument++;
   else if(isSpecific(r)){counts.wrongDocument++;errors.push({id:c.id,reason:"WRONG_DOCUMENT",topicId:r.topicId});}
   else counts.safeDocumentAbstention++;
  }else if(isSpecific(r)){counts.unsafeNegatives++;errors.push({id:c.id,reason:"UNSAFE_NEGATIVE_PROPOSAL",topicId:r.topicId});}
  else counts.safeNegatives++;
 }
 for(const c of fixture.followups){
  const topic="pius.historical_spx_pilot_"+c.source_id.slice(-2);
  const r=engine.match(c.question,{language:c.language,currentCharacter:"pius-x",
   context:{activeTopicId:topic,confirmedActiveTopicId:topic}});
  assert.equal(r.answerText,null);
  if(isSpecific(r)){
   if(r.documentNavigation?.sourceRef===c.source_id)counts.confirmedFollowupsCorrect++;
   else{counts.confirmedFollowupsWrong++;errors.push({id:c.id,reason:"WRONG_FOLLOWUP",topicId:r.topicId});}
  }else counts.confirmedFollowupsAbstained++;
  const without=engine.match(c.question,{language:c.language,currentCharacter:"pius-x",
   context:{activeTopicId:topic}});
  assert.notEqual(without.matchEvidence?.basis,"DOCUMENTARY_CONFIRMED_FOLLOWUP");
 }
 for(const c of previouslyInspected.primary){
  const r=engine.match(c.question,{language:c.language,currentCharacter:"pius-x"});
  assert.equal(r.answerText,null);
  if(c.kind==="DOCUMENTED_HISTORICAL"){
   if(isSpecific(r)&&r.documentNavigation?.sourceRef===c.expected_source_id)counts.oldCorrect++;
   else if(isSpecific(r)){counts.oldWrong++;errors.push({id:c.id,reason:"OLD_WRONG",topicId:r.topicId});}
   else counts.oldUnresolved++;
  }else if(c.kind==="PERSONAL_SOURCE_HOLD"){
   if(isSpecific(r)){counts.oldPersonalUnsafe++;errors.push({id:c.id,reason:"OLD_HELD_UNSAFE"});}
   else counts.oldPersonalHeld++;
  }else if(isSpecific(r)){counts.oldOutsideUnsafe++;errors.push({id:c.id,reason:"OLD_OUTSIDE_UNSAFE",topicId:r.topicId});}
  else counts.oldOutsideSafe++;
 }
 for(const c of boundary.records){
  const r=engine.match(c.question,{language:c.language,currentCharacter:"pius-x"});
  const mustHold=c.expected_policy==="HOLD_PERSONAL_VERDICT";
  assert.equal(r.reason==="UNSUPPORTED_PERSONAL_SPIRITUAL_VERDICT",mustHold,name+": "+c.id);
  counts.verdictControlsPassed++;
 }
 for(const c of scope.cases){
  const r=engine.match(c.question,{language:c.language,currentCharacter:"pius-x"});
  if(c.expected_scope==="PIUS_X_ROSARY_AT_MASS")assert.equal(r.documentNavigation?.sourceRef,"SPX-PILOT-02");
  if(c.expected_scope==="PIUS_X_THANKSGIVING_AFTER_COMMUNION")assert.equal(r.documentNavigation?.sourceRef,"SPX-PILOT-04");
  if(c.expected_scope==="PIUS_X_PRIESTLY_MEDITATION")assert.equal(r.documentNavigation?.sourceRef,"SPX-PILOT-09");
  if(c.expected_scope==="SAFE_ABSTAIN_UNSPECIFIED_LAY_PRAYER")assert.equal(r.reason,"LAY_MASS_PRAYER_SOURCE_NOT_IDENTIFIED");
  counts.liturgicalContrastsSafe++;
 }
 // Source registry must never be allowed to claim a different document.
 const modified=structuredClone(concepts);
 modified.families[0].sourceRef="SPX-PILOT-09";
 assert.throws(()=>validatePiusSourceConceptRegistry(modified,catalog),/unowned historical passage/);
 assert.equal(counts.exactDocument+counts.safeDocumentAbstention+counts.wrongDocument,28);
 assert.equal(counts.safeNegatives+counts.unsafeNegatives,12);
 assert.equal(counts.confirmedFollowupsCorrect+counts.confirmedFollowupsAbstained+counts.confirmedFollowupsWrong,6);
 assert.equal(counts.oldCorrect+counts.oldUnresolved+counts.oldWrong,40);
 assert.equal(counts.oldOutsideSafe+counts.oldOutsideUnsafe,12);
 assert.equal(counts.verdictControlsPassed,48);
 assert.equal(counts.liturgicalContrastsSafe,26);
 assert.equal(counts.wrongDocument,0);
 assert.equal(counts.unsafeNegatives,0);
 assert.equal(counts.confirmedFollowupsWrong,0);
 assert.equal(counts.oldWrong,0);
 assert.equal(counts.oldPersonalUnsafe,0);
 assert.equal(counts.oldOutsideUnsafe,0);
 assert.ok(counts.exactDocument>=20,"Source concept navigation insufficient on inspected corpus");
 assert.ok(counts.oldCorrect>=17,"Regression versus earlier Pius X routing");
 report.engines[name]={counts,errors};
 console.log("PIUS_CONCEPT_GUARDED_REGRESSION "+JSON.stringify({engine:name,...counts}));
}
mkdirSync("research-out",{recursive:true});
writeFileSync("research-out/living-church-pius-x-doctrinal-concept-regression.v1.json",JSON.stringify(report,null,2)+"\n");
