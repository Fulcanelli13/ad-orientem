/**
 * Research-only cross-branch diagnostic. The source of truth for the 48 utterances
 * is PR #1458; the only interpreter is pinned PR #1443, staged by the workflow.
 * Never mint a new catechism/papal answer or alter source ownership.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const load=p=>JSON.parse(readFileSync(p,'utf8'));
const fixture=load('data/learn/research/pius-x-12case-paraphrases-followups-20261019.v1.json');
const prior=load('data/learn/research/pius-x-proof-of-answerability-12case-20261019.v1.json');
const routerRoot=resolve('research-out/pr1443-router');
const catalog=load(resolve(routerRoot,'data/learn/living-church-shared-question-routing-pilot.v1.json'));
const concepts=load(resolve(routerRoot,'data/learn/living-church-symbolic-concepts.v1.json'));
const {createSharedQuestionRouter}=await import(pathToFileURL(resolve(routerRoot,'src/learn/living-church-shared-question-router.js')).href);
const {createHybridQuestionRouter}=await import(pathToFileURL(resolve(routerRoot,'src/learn/living-church-hybrid-question-router.js')).href);
assert.equal(fixture.records.length,12);
assert.equal(catalog.schema,'AO_LIVING_CHURCH_SHARED_QUESTION_ROUTING_PILOT_V1');
assert.equal(catalog.topics.length,172,'Router catalog changed since pinned audit; reconcile before comparisons.');
assert.equal(concepts.status,'RESEARCH_ONLY_NO_EMBEDDINGS');

const engines={shared:createSharedQuestionRouter(catalog),hybrid:createHybridQuestionRouter(catalog,concepts)};
const known=new Set(catalog.topics.map(x=>x.id));
const expected={
  'SPX-PILOT-01':null, 'SPX-PILOT-02':null, 'SPX-PILOT-03':null,
  'SPX-PILOT-04':null, 'SPX-PILOT-05':null, 'SPX-PILOT-06':null,
  'SPX-PILOT-07':null, 'SPX-PILOT-08':null, 'SPX-PILOT-09':null,
  'SPX-PILOT-10':null, 'SPX-PILOT-11':null, 'SPX-PILOT-12':null
};
// None of these 12 *specific historical question owners* is present as a
// source-navigable item in PR #1443's 172-topic catalog. An apparent generic
// sin, prayer, Communion or other topical match is NOT an answer to the case.
assert.ok(fixture.records.every(x=>Object.hasOwn(expected,x.pilot_case_id)));
assert.ok(fixture.records.every(x=>!known.has(x.seed_id)));
const classify=r=>{
  if(r.kind==='no_coverage')return 'SAFE_ABSTENTION';
  if(r.kind==='clarify')return 'UNRESOLVED_CLARIFICATION';
  if(r.kind==='source_navigation')return 'UNSUPPORTED_SPECIFIC_NAVIGATION';
  if(r.kind==='offer_handoff')return 'UNSUPPORTED_SPECIFIC_HANDOFF';
  return 'OTHER_UNEXPECTED_DECISION';
};
const summarize=rows=>{
 const categories={};
 for(const row of rows)categories[row.classification]=(categories[row.classification]||0)+1;
 return {count:rows.length,...categories};
};
const output={schema:'AO_PIUS_X_PR1443_PINNED_ROUTER_RUNTIME_DIAGNOSTIC_V1',
  sourceFixture:'data/learn/research/pius-x-12case-paraphrases-followups-20261019.v1.json',
  routerOwner:'PR #1443',routerPinnedHead:'b4dd46743d641bfaa6076c6bb2fd8641c47077b6',
  routerTopicCount:catalog.topics.length,
  status:'ACTUAL_ROUTER_EXECUTION_48_PROBES_RESEARCH_ONLY',
  interpretation:'Because none of the twelve precise historical cases has an authoritative navigable topic in pinned #1443, specific routes are false-positive coverage for this evaluation. Safe abstention or clarification are not complete answerability.',
  expectedCaseOwnersAbsent:true,
  evaluated:[],summary:{}};
for(const [engineName,engine] of Object.entries(engines)){
 const rows=[];
 for(let i=0;i<fixture.records.length;i++){
  const group=fixture.records[i],pilot=prior.records[i];
  assert.equal(group.pilot_case_id,pilot.case_id);
  const starter=engine.match(pilot.visitor_question,{language:'en',currentCharacter:'pius-x'});
  assert.equal(starter.answerText,null);
  assert.equal(starter.approvedReply||false,false);
  for(const [j,item] of group.alternatives.entries()){
   const res=engine.match(item.text,{language:'en',currentCharacter:'pius-x'});
   assert.equal(res.answerText,null,'Router created an unowned answer');
   assert.equal(res.approvedReply||false,false);
   assert.notEqual(res.kind,'handoff_context','Silent character switching forbidden');
   if(res.kind==='offer_handoff')assert.equal(res.requiresAcceptance,true);
   const row={id:item.utterance_id,caseId:group.pilot_case_id,utteranceType:'ALTERNATIVE',
    question:item.text,intendedResearchOwner:group.seed_id,expectedBehavior:item.expected_behavior,
    decisionKind:res.kind,reason:res.reason||null,selectedTopic:res.topicId||null,
    choices:(res.options||[]).map(x=>x.topicId).slice(0,3),
    sourceRefs:(res.sourceRefs||[]).map(x=>x.ref),
    unconfirmedInferredRoute:res.requiresQuestionConfirmation===true,
    classification:classify(res)};
   rows.push(row);
  }
  const follow=group.followup;
  // A follow-up is assessed after the original source-limited topic prompt;
  // if that initial prompt false-routes, this context intentionally captures it.
  const context={activeTopicId:starter.topicId||null};
  const res=engine.match(follow.text,{language:'en',currentCharacter:'pius-x',context});
  assert.equal(res.answerText,null);
  assert.equal(res.approvedReply||false,false);
  assert.notEqual(res.kind,'handoff_context');
  if(res.kind==='offer_handoff')assert.equal(res.requiresAcceptance,true);
  rows.push({id:follow.utterance_id,caseId:group.pilot_case_id,utteranceType:'FOLLOW_UP',
   question:follow.text,intendedResearchOwner:group.seed_id,expectedBehavior:follow.expected_behavior,
   precedingRouterDecision:starter.kind,precedingSelectedTopic:starter.topicId||null,
   decisionKind:res.kind,reason:res.reason||null,selectedTopic:res.topicId||null,
   choices:(res.options||[]).map(x=>x.topicId).slice(0,3),
   sourceRefs:(res.sourceRefs||[]).map(x=>x.ref),
   unconfirmedInferredRoute:res.requiresQuestionConfirmation===true,
   classification:classify(res)});
 }
 assert.equal(rows.length,48);
 output.evaluated.push({engine:engineName,observations:rows});
 output.summary[engineName]={
  total:48,
  alternatives:summarize(rows.filter(x=>x.utteranceType==='ALTERNATIVE')),
  followups:summarize(rows.filter(x=>x.utteranceType==='FOLLOW_UP')),
  combined:summarize(rows)
 };
}
mkdirSync('research-out',{recursive:true});
const file='research-out/pius-x-pr1443-48-router-diagnostic.v1.json';
writeFileSync(file,JSON.stringify(output,null,2)+'\n');
for(const [engine,summary] of Object.entries(output.summary)) {
 console.log('PIUS_X_PR1443_ROUTER_DIAGNOSTIC '+JSON.stringify({engine,...summary}));
 for(const x of output.evaluated.find(y=>y.engine===engine).observations)
   if(x.classification==='UNSUPPORTED_SPECIFIC_NAVIGATION'||x.classification==='UNSUPPORTED_SPECIFIC_HANDOFF')
     console.log('PIUS_X_PR1443_FALSE_ROUTE '+JSON.stringify({engine,...x}));
}
console.log('PIUS_X_PR1443_REPORT '+file);
