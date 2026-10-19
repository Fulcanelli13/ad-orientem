/**
 * Source-pointer bridge retrieval diagnostic: re-evaluate 48 original
 * held-out editorial probes against the *existing* router from PR #1443.
 * Catalog examples were independently authored from source questions,
 * not copied from the 48-item probe fixture. No answers generated.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const load=p=>JSON.parse(readFileSync(p,'utf8'));
const fixture=load('data/learn/research/pius-x-12case-paraphrases-followups-20261019.v1.json');
const pilot=load('data/learn/research/pius-x-proof-of-answerability-12case-20261019.v1.json');
const root=resolve('research-out/pr1443-router-new');
const catalog=load(resolve(root,'data/learn/living-church-shared-question-routing-pilot.v1.json'));
const concepts=load(resolve(root,'data/learn/living-church-symbolic-concepts.v1.json'));
const pointers=load(resolve(root,'data/learn/living-church-pius-x-historical-passage-pointers.v1.json'));
const {createSharedQuestionRouter}=await import(pathToFileURL(resolve(root,'src/learn/living-church-shared-question-router.js')).href);
const {createHybridQuestionRouter}=await import(pathToFileURL(resolve(root,'src/learn/living-church-hybrid-question-router.js')).href);
assert.equal(catalog.topics.length,184);
assert.equal(pointers.records.length,10);
assert.equal(fixture.records.length,12);
const navSources=new Map(pointers.records.map(x=>[x.id,x]));
const topicId=id=>'pius.historical_spx_pilot_'+id.slice(-2);
const byTopic=new Map(catalog.topics.map(x=>[x.id,x]));
const engines={shared:createSharedQuestionRouter(catalog),hybrid:createHybridQuestionRouter(catalog,concepts)};
function disposition(response,expectedTopic,isHeld){
 const kind=response.kind;
 const correctRef=response.sourceRefs?.some(r=>r.owner==='PIUS_X_HISTORICAL_PASSAGE_POINTERS_V1'
   &&r.ref===('SPX-PILOT-'+expectedTopic.slice(-2)));
 if(kind==='source_navigation'&&response.topicId===expectedTopic
   &&(isHeld===false&&correctRef))return 'CORRECT_SPECIFIC_SOURCE_NAVIGATION';
 if(kind==='clarify'&&(response.options||[]).some(t=>t.topicId===expectedTopic))
   return 'CORRECT_TOPIC_IN_UNRESOLVED_CLARIFICATION';
 if(kind==='no_coverage')return isHeld?'SAFE_HELD_ANSWER_GAP':'SAFE_UNRESOLVED_MISSING_ROUTE';
 if(kind==='source_navigation'||kind==='offer_handoff')return 'WRONG_SPECIFIC_SOURCE_ROUTE';
 if(kind==='clarify')return 'CLARIFICATION_MISSED_INTENDED_TOPIC';
 return 'OTHER_INCORRECT_ROUTER_DECISION';
}
function stats(rows){
 const by={};for(const r of rows)by[r.disposition]=(by[r.disposition]||0)+1;
 return {total:rows.length,...by};
}
const result={schema:'AO_PIUS_X_PR1443_SOURCE_BRIDGE_HELDOUT_48_V1',
 sourceRouterPR:1443,routerCommit:'854325df75671882d378b510fcc1af33fc30ba65',
 fixture:'data/learn/research/pius-x-12case-paraphrases-followups-20261019.v1.json',
 bridgeStatus:'ACTUAL_SOURCE_NAVIGATION_EXECUTION_RESEARCH_ONLY',catalogCount:184,
 methodology:'Original held-out assistant-authored prompts (36 alternatives + 12 followups); route success requires exact intended SPX-PILOT-ID historical pointer; 11 and 12 must safely hold. General topical navigation is wrong-specific. This is not independent visitor accuracy.',
 evaluated:[],summaries:{}};
for(const [engineName,engine] of Object.entries(engines)){
 const rows=[];
 for(let i=0;i<fixture.records.length;i++){
  const group=fixture.records[i],base=pilot.records[i];
  assert.equal(group.pilot_case_id,base.case_id);
  const intended=topicId(group.pilot_case_id),topic=byTopic.get(intended);
  assert.ok(topic,'Bridge topic missing '+intended);
  const held=i>=10;
  assert.equal(topic.coverage,held?'SOURCE_GAP':'SOURCE_NAVIGATION_ONLY');
  if(!held)assert.equal(topic.sourceRefs[0].ref,group.pilot_case_id);
  const before=engine.match(base.visitor_question,{language:'en',currentCharacter:'pius-x'});
  assert.equal(before.answerText,null);
  assert.equal(before.approvedReply||false,false);
  for(const variant of group.alternatives){
   const actual=engine.match(variant.text,{language:'en',currentCharacter:'pius-x'});
   assert.equal(actual.answerText,null);
   assert.notEqual(actual.kind,'handoff_context');
   assert.equal(actual.approvedReply||false,false);
   rows.push({id:variant.utterance_id,question:variant.text,caseId:group.pilot_case_id,type:'ALTERNATIVE',
    expectedTopic:intended,expectedSourceLocator:navSources.get(group.pilot_case_id)?.sourceLocator||null,
    expectedBehavior:variant.expected_behavior,actualDecision:actual.kind,
    observedTopic:actual.topicId||null,observedChoices:(actual.options||[]).map(x=>x.topicId).slice(0,3),
    observedSourceRefs:(actual.sourceRefs||[]).map(x=>x.ref),
    requiresConfirmation:actual.requiresQuestionConfirmation===true,
    disposition:disposition(actual,intended,held)});
  }
  // Follow-up uses the actual preceding topic returned by this same router.
  const follow=group.followup;
  const actual=engine.match(follow.text,{language:'en',currentCharacter:'pius-x',
    context:{activeTopicId:before.topicId||null}});
  assert.equal(actual.answerText,null);assert.notEqual(actual.kind,'handoff_context');
  rows.push({id:follow.utterance_id,question:follow.text,caseId:group.pilot_case_id,type:'FOLLOW_UP',
   precedingTopic:before.topicId||null,precedingDecision:before.kind,
   expectedTopic:intended,expectedBehavior:follow.expected_behavior,
   expectedSourceLocator:navSources.get(group.pilot_case_id)?.sourceLocator||null,
   actualDecision:actual.kind,observedTopic:actual.topicId||null,
   observedChoices:(actual.options||[]).map(x=>x.topicId).slice(0,3),
   observedSourceRefs:(actual.sourceRefs||[]).map(x=>x.ref),
   requiresConfirmation:actual.requiresQuestionConfirmation===true,
   disposition:disposition(actual,intended,held)});
 }
 assert.equal(rows.length,48);
 const correct=rows.filter(x=>x.disposition==='CORRECT_SPECIFIC_SOURCE_NAVIGATION');
 for(const x of correct)assert.ok(x.observedSourceRefs.includes(x.caseId),
  'False-positive "correct" navigation missing original historical source pointer');
 result.evaluated.push({engine:engineName,observations:rows});
 result.summaries[engineName]={combined:stats(rows),
  alternatives:stats(rows.filter(x=>x.type==='ALTERNATIVE')),
  followups:stats(rows.filter(x=>x.type==='FOLLOW_UP'))};
 console.log('SPX_HISTORICAL_ROUTER_BRIDGE_RESULT '+JSON.stringify({engine:engineName,...result.summaries[engineName]}));
 for(const x of rows.filter(x=>x.disposition==='WRONG_SPECIFIC_SOURCE_ROUTE')){
  console.log('SPX_HISTORICAL_ROUTER_BRIDGE_MISROUTE '+JSON.stringify({engine:engineName,...x}));
 }
}
mkdirSync('research-out',{recursive:true});
const path='research-out/pius-x-pr1443-184topic-heldout-48.v1.json';
writeFileSync(path,JSON.stringify(result,null,2)+'\n');
console.log('SPX_HISTORICAL_ROUTER_BRIDGE_REPORT '+path);
