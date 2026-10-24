/**
 * Prospective editorial question fixture frozen on PR #1458 before 11-concept
 * expansion. Evaluated once and NOT an independent sample of actual visitors.
 * No answer authoring, certainty claims or modern pastoral judgments.
 */
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {createSharedQuestionRouter} from '../src/learn/living-church-shared-question-router.js';
import {createHybridQuestionRouter} from '../src/learn/living-church-hybrid-question-router.js';
import {validatePiusSourceConceptRegistry} from '../src/learn/living-church-pius-x-source-concepts.js';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const fixture=read('research-out/pr1458-prospective-concept-fixture/data/learn/research/pius-x-prospective-bilingual-concept-probes-20261021.v1.json');
const catalog=read('data/learn/living-church-shared-question-routing-pilot.v1.json');
const pointers=read('data/learn/living-church-pius-x-historical-passage-pointers.v1.json');
const symbols=read('data/learn/living-church-symbolic-concepts.v1.json');
const concepts=read('data/learn/living-church-pius-x-source-concept-facets.v1.json');
assert.equal(fixture.schema,'AO_SPX_DOCUMENT_FIRST_FRESH_CONCEPT_EVALUATION_20261021_V1');
assert.equal(fixture.status,'FROZEN_BEFORE_SOURCE_CONCEPT_EXPANSION_EDITORIAL_NOT_USER_SAMPLE');
assert.equal(fixture.primary.length,11);
assert.equal(fixture.negative.length,6);
validatePiusSourceConceptRegistry(concepts,catalog);
const options={historicalPointers:pointers,sourceConceptRegistry:concepts};
const engines={shared:createSharedQuestionRouter(catalog,options),
 hybrid:createHybridQuestionRouter(catalog,symbols,options)};
const byPointer=new Map(pointers.records.map(p=>[p.id,p]));
const isSource=r=>['source_navigation','offer_handoff'].includes(r.kind);
const result={schema:'AO_SPX_PROSPECTIVE_SOURCE_CONCEPT_22_PLUS_12_V1',
 status:'FIRST_RUN_PRE_FROZEN_EDITORIAL_NOT_INDEPENDENT_VISITORS',
 fixture:'pius-x-prospective-bilingual-concept-probes-20261021.v1.json',
 description:'22 new editorial EN/FR source questions plus 12 negative contrasts, frozen before concept expansion, run without tuning beforehand.',
 results:{},observations:[]};
for(const [engineName,engine] of Object.entries(engines)){
 const stats={primaryCorrect:0,primarySafeAbstention:0,primaryWrongSource:0,
  negativeSafe:0,negativeUnsafe:0,englishCorrect:0,frenchCorrect:0};
 for(const record of fixture.primary)for(const language of ['en','fr']){
  const question=record[language];
  const r=engine.match(question,{language,currentCharacter:'pius-x'});
  assert.equal(r.answerText,null);
  assert.equal(r.approvedReply||false,false);
  const src=byPointer.get(record.sourceRef);
  const correct=isSource(r)&&r.documentNavigation?.sourceRef===record.sourceRef
   &&r.documentNavigation?.url===src.originalDocumentUrl
   &&r.documentNavigation?.sourceLocator===src.sourceLocator;
  if(correct){stats.primaryCorrect++;stats[language==='en'?'englishCorrect':'frenchCorrect']++;}
  else if(isSource(r)){stats.primaryWrongSource++;}
  else stats.primarySafeAbstention++;
  result.observations.push({engine:engineName,language,question,
   expectedRef:record.sourceRef,decision:r.kind,reason:r.reason||null,
   actualRef:r.documentNavigation?.sourceRef||null,correct});
 }
 for(const record of fixture.negative)for(const language of ['en','fr']){
  const question=record[language],r=engine.match(question,{language,currentCharacter:'pius-x'});
  assert.equal(r.answerText,null);
  const unsafe=isSource(r)&&r.documentNavigation?.sourceRef?.startsWith('SPX-PILOT-');
  if(unsafe){
   stats.negativeUnsafe++;
   console.log('PIUS_CONCEPT_PROSPECTIVE_NEGATIVE_UNSAFE '+JSON.stringify({
    engine:engineName,caseId:record.id,language,question,
    decision:r.kind,sourceRef:r.documentNavigation?.sourceRef,
    basis:r.matchEvidence?.basis||null}));
  }else stats.negativeSafe++;
  result.observations.push({engine:engineName,language,question,
   caseId:record.id,negative:true,decision:r.kind,reason:r.reason||null,
   actualRef:r.documentNavigation?.sourceRef||null,safe:!unsafe});
 }
 result.results[engineName]=stats;
 console.log('PIUS_CONCEPT_PROSPECTIVE_FIRST_RUN '+JSON.stringify({engine:engineName,...stats}));
 assert.equal(stats.primaryWrongSource,0,'False attribution to an unsupported Pius X historical section');
 assert.equal(stats.negativeUnsafe,0,'Negative scope question incorrectly assigned original Pius X text');
}
mkdirSync('research-out',{recursive:true});
writeFileSync('research-out/pius-x-prospective-bilingual-concept-first-run.v1.json',JSON.stringify(result,null,2)+'\n');
