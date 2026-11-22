/**
 * 11 historical-source topics; two preauthored catalog questions plus one
 * pre-evaluation off-catalog paraphrase per language. NOT a visitor holdout.
 * Existing router only. No generated Pius X speech.
 */
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {createSharedQuestionRouter} from '../src/learn/living-church-shared-question-router.js';
import {createHybridQuestionRouter} from '../src/learn/living-church-hybrid-question-router.js';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const owner='research-out/pr1458-next11-question-probes/';
const frozen=read(owner+'data/learn/research/pius-x-next11-frozen-english-french-question-probes-20261021.v1.json');
const novel=read(owner+'data/learn/research/pius-x-next11-pre-evaluation-paraphrase-pairs-20261021.v1.json');
const catalog=read('data/learn/living-church-shared-question-routing-pilot.v1.json');
const pointers=read('data/learn/living-church-pius-x-historical-passage-pointers.v1.json');
const symbols=read('data/learn/living-church-symbolic-concepts.v1.json');
const concepts=read('data/learn/living-church-pius-x-source-concept-facets.v1.json');
assert.equal(catalog.topics.length,197);
assert.equal(pointers.records.length,23);
assert.equal(frozen.records.length,11);
assert.equal(novel.records.length,11);
const pointerMap=new Map(pointers.records.map(p=>[p.id,p]));
const byNovel=new Map(novel.records.map(p=>[p.sourceRef,p]));
const engineOptions={historicalPointers:pointers,sourceConceptRegistry:concepts};
const engines={shared:createSharedQuestionRouter(catalog,engineOptions),
 hybrid:createHybridQuestionRouter(catalog,symbols,engineOptions)};
const candidates=r=>['source_navigation','offer_handoff'].includes(r.kind);
const report={schema:'AO_SPX_NEXT11_SOURCE_ROUTER_EXPANSION_OBSERVED_V1',
 status:'EXECUTED_EDITORIAL_REGRESSION_NO_HISTORICAL_ANSWER_APPROVAL',
 sourceOwner:'PR #1458',routerOwner:'PR #1443',
 notIndependent:'Previously committed question variants and editor-authored paraphrases are an inspected regression set, not blind visitor data. New concept coverage is evaluated post inspection and MUST NOT be reported as fresh.',
 results:{},observations:[]};
for(const [name,engine] of Object.entries(engines)){
 const counts={catalogCorrect:0,catalogMiss:0,novelCorrect:0,novelMiss:0,wrongSource:0,
 negativeSafe:0,negativeUnsafe:0};
 for(const c of frozen.records){
  const pointer=pointerMap.get(c.sourceId);
  assert(pointer&&pointer.sourceLocator===c.locator);
  const n=byNovel.get(c.sourceId);
  assert(n);
  for(const language of ['en','fr']){
   const questions=[...c.questions.map(q=>({text:q[language],kind:'CATALOG'})),
    {text:n[language],kind:'PRE_EVALUATION_PARAPHRASE'}];
   for(const q of questions){
    const r=engine.match(q.text,{language,currentCharacter:'pius-x'});
    assert.equal(r.answerText,null);
    assert.equal(r.approvedReply||false,false);
    const ok=candidates(r)&&r.documentNavigation?.sourceRef===c.sourceId
      &&r.documentNavigation?.sourceLocator===pointer.sourceLocator
      &&r.documentNavigation?.url===pointer.originalDocumentUrl;
    if(ok)counts[q.kind==='CATALOG'?'catalogCorrect':'novelCorrect']++;
    else if(candidates(r))counts.wrongSource++;
    else counts[q.kind==='CATALOG'?'catalogMiss':'novelMiss']++;
    report.observations.push({engine:name,language,sourceRef:c.sourceId,
      kind:q.kind,question:q.text,decision:r.kind,reason:r.reason||null,
      observedRef:r.documentNavigation?.sourceRef||null,correct:ok});
   }
  }
 }
 for(const negative of frozen.negativeContrasts)for(const language of ['en','fr']){
  const r=engine.match(negative[language],{language,currentCharacter:'pius-x'});
  assert.equal(r.answerText,null);
  if(candidates(r)&&r.documentNavigation&&Number(r.documentNavigation.sourceRef.slice(-2))>=15)
   counts.negativeUnsafe++;
  else counts.negativeSafe++;
 }
 report.results[name]=counts;
 for(const x of report.observations.filter(x=>x.engine===name&&x.observedRef&&x.observedRef!==x.sourceRef))
  console.log('PIUS_NEXT11_WRONG_SOURCE_DETAIL '+JSON.stringify(x));
 console.log('PIUS_NEXT11_NAVIGATION '+JSON.stringify({engine:name,...counts}));
 assert.equal(counts.wrongSource,0,'incorrect documentary owner must be fixed');
 assert.equal(counts.negativeUnsafe,0,'misleading negative question mapped to new document');
}
mkdirSync('research-out',{recursive:true});
writeFileSync('research-out/living-church-pius-x-next11-probe-observations.v1.json',JSON.stringify(report,null,2)+'\n');
