/**
 * Extended unapproved selection from completed 34-turn Pius X document corpus.
 * Uses EXACT pinned owner PR #1443 router, never a local answer classifier.
 * Claims no independent visitor evaluation.
 */
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createPiusDocumentFirstReviewSelector} from '../tools/formation/pius-x-document-first-answer-selector.mjs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const owner='research-out/pr1443-pius-x-document-first-router/';
const catalog=read(owner+'data/learn/living-church-shared-question-routing-pilot.v1.json');
const pointers=read(owner+'data/learn/living-church-pius-x-historical-passage-pointers.v1.json');
const symbols=read(owner+'data/learn/living-church-symbolic-concepts.v1.json');
const concepts=read(owner+'data/learn/living-church-pius-x-source-concept-facets.v1.json');
const benchmark=read('artifacts/pius-x-complete-corpus/SPX_Three_Document_Full_34_Turn_Claim_Map.json');
const bridge=read('data/learn/research/pius-x-document-first-router-to-claims-20261021.v1.json');
const fixture=read('data/learn/research/pius-x-next11-frozen-english-french-question-probes-20261021.v1.json');
const novel=read('data/learn/research/pius-x-next11-pre-evaluation-paraphrase-pairs-20261021.v1.json');
assert.equal(catalog.topics.length,197);
assert.equal(pointers.records.length,23);
assert.equal(bridge.entries.length,16);
assert.equal(fixture.records.length,11);
const novelByRef=new Map(novel.records.map(x=>[x.sourceRef,x]));
const {createSharedQuestionRouter}=await import(pathToFileURL(resolve(owner+'src/learn/living-church-shared-question-router.js')).href);
const {createHybridQuestionRouter}=await import(pathToFileURL(resolve(owner+'src/learn/living-church-hybrid-question-router.js')).href);
const routers={
 shared:createSharedQuestionRouter(catalog,{historicalPointers:pointers,sourceConceptRegistry:concepts}),
 hybrid:createHybridQuestionRouter(catalog,symbols,{historicalPointers:pointers,sourceConceptRegistry:concepts})
};
const report={schema:'AO_SPX_NEXT11_SOURCE_TO_CLAIM_ANSWERS_V1',
 status:'SOURCE_FIRST_RESEARCH_ONLY_17_OCTOBER_CONTEXT_NO_PUBLICATION',
 methodology:'Eleven additional topics, 44 exact editorial catalog phrases and 22 earlier-frozen off-catalog rephrasings per router; not a real-user holdout. Exact-source matches select only owned existing bilingual segments.',
 routerOwner:'PR #1443',contentOwner:'PR #1458',
 results:{},observations:[]};
for(const [engineName,router] of Object.entries(routers)){
 const selector=createPiusDocumentFirstReviewSelector({router,benchmark,registry:bridge,pointers});
 assert.equal(selector.linkedSources.length,16);
 const stats={catalogCandidates:0,catalogSafeRefusals:0,novelCandidates:0,novelSafeRefusals:0,
   wrongSourceClaims:0,unsafeNegatives:0,negativeRefusals:0,languageConsistentPairs:0,
   unapprovedLinesPublished:0};
 for(const c of fixture.records){
  const novelRecord=novelByRef.get(c.sourceId);
  assert(novelRecord);
  for(const language of ['en','fr']){
   const prompts=[...c.questions.map(q=>({text:q[language],kind:'CATALOG'})),
    {text:novelRecord[language],kind:'NOVEL'}];
   for(const p of prompts){
    const unconfirmed=selector.evaluate(p.text,{language});
    assert.notEqual(unconfirmed.kind,'editorial_candidate','explicit confirmation is required');
    assert.equal(unconfirmed.answerText,null);
    const result=selector.evaluate(p.text,{language,confirmed:true});
    const key=p.kind==='CATALOG'?'catalog':'novel';
    if(result.kind==='editorial_candidate'){
     if(result.sourceRef!==c.sourceId){stats.wrongSourceClaims++;throw Error('Incorrect reference selected: '+p.text);}
     assert.equal(result.publicationEligible,false);
     assert.equal(result.approvedReply,false);
     assert.equal(result.answerText,null);
     assert(result.segments.length<=3);
     assert(result.segments.every(s=>s.claimIds.length>=1&&s.sourceLoci.length>=1));
     stats[key+'Candidates']++;
    }else stats[key+'SafeRefusals']++;
    report.observations.push({engine:engineName,language,question:p.text,
      questionKind:p.kind,expectedRef:c.sourceId,decision:result.kind,
      actualRef:result.sourceRef||null,claims:result.claimIds||[],plan:result.selectionPlan||null});
   }
  }
  // Verify both bilingual variants choose the same owned segments when both route.
  for(const question of c.questions){
   const en=selector.evaluate(question.en,{language:'en',confirmed:true});
   const fr=selector.evaluate(question.fr,{language:'fr',confirmed:true});
   if(en.kind==='editorial_candidate'&&fr.kind==='editorial_candidate'){
    assert.deepEqual(en.segments.map(s=>s.segmentId),fr.segments.map(s=>s.segmentId),
      'English/French semantic ownership diverged for '+c.sourceId);
    stats.languageConsistentPairs++;
   }
  }
 }
 for(const neg of fixture.negativeContrasts)for(const language of ['en','fr']){
  const r=selector.evaluate(neg[language],{language,confirmed:true});
  if(r.kind==='editorial_candidate')stats.unsafeNegatives++;
  else stats.negativeRefusals++;
  assert.equal(r.answerText,null);
 }
 assert.equal(stats.wrongSourceClaims,0);
 assert.equal(stats.unsafeNegatives,0,'unsupported lay/current-law or individual sin question selected Pius X text');
 assert.equal(stats.unapprovedLinesPublished,0);
 report.results[engineName]=stats;
 console.log('SPX_NEXT11_CLAIM_SELECTION '+JSON.stringify({engine:engineName,...stats}));
}
mkdirSync('research-out',{recursive:true});
writeFileSync('research-out/pius-x-document-first-next11-claim-selection.v1.json',JSON.stringify(report,null,2)+'\n');
