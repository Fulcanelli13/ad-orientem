/**
 * Three NEW editorial questions against the existing PR #1443 router.
 * Reads the exact router commit staged by the existing source-aware CI job.
 * Strictly distinguishes document-level from passage-level relevance.
 * Not a model-quality benchmark and does not generate papal speech.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const load=p=>JSON.parse(readFileSync(p,'utf8'));
const file='data/learn/research/pius-x-document-first-unscripted-bilingual-probes-20261021.v1.json';
const fixture=load(file);
assert.equal(fixture.schema,'AO_SPX_DOCUMENT_FIRST_THREE_UNSCRIPTED_BILINGUAL_ROUTER_PROBES_V1');
assert.equal(fixture.cases.length,3);
const root=resolve('research-out/pr1443-router-source-aware');
const catalog=load(resolve(root,'data/learn/living-church-shared-question-routing-pilot.v1.json'));
const concepts=load(resolve(root,'data/learn/living-church-symbolic-concepts.v1.json'));
const pointers=load(resolve(root,'data/learn/living-church-pius-x-historical-passage-pointers.v1.json'));
const {createSharedQuestionRouter}=await import(pathToFileURL(resolve(root,'src/learn/living-church-shared-question-router.js')).href);
const {createHybridQuestionRouter}=await import(pathToFileURL(resolve(root,'src/learn/living-church-hybrid-question-router.js')).href);
const engines={
 shared:createSharedQuestionRouter(catalog,{historicalPointers:pointers}),
 hybrid:createHybridQuestionRouter(catalog,concepts,{historicalPointers:pointers})
};
const pointerById=new Map(pointers.records.map(x=>[x.id,x]));
function sections(locator){
 const match=String(locator||'').match(/§{1,2}([0-9,\s–-]+)/);
 if(!match)return [];
 const found=new Set();
 for(const raw of match[1].split(',')){
  const piece=raw.trim();
  const bounds=piece.match(/^(\d+)\s*[–-]\s*(\d+)$/);
  if(bounds){
   const start=Number(bounds[1]),end=Number(bounds[2]);
   if(end>=start&&end-start<100)for(let s=start;s<=end;s++)found.add(s);
  }else if(/^\d+$/.test(piece))found.add(Number(piece));
 }
 return [...found];
}
function inspectResponse(r,c){
 const ref=r.documentNavigation?.sourceRef||null;
 const pointer=ref?pointerById.get(ref):null;
 const actualSections=sections(pointer?.sourceLocator);
 const sameDocument=pointer?.originalDocumentUrl===c.expectedUrl;
 const allSectionsCovered=c.expectedSections.every(x=>actualSections.includes(x));
 const kind=r.kind;
 let disposition;
 if(['source_navigation','offer_handoff'].includes(kind)){
  disposition=sameDocument?(allSectionsCovered?'CORRECT_PASSAGE_NAVIGATION':'SAME_DOCUMENT_WRONG_PASSAGE'):'WRONG_DOCUMENT_NAVIGATION';
 }else if(kind==='no_coverage')disposition='SAFE_ABSTENTION';
 else if(kind==='clarify')disposition='CLARIFICATION_NOT_YET_CONFIRMED';
 else disposition='OTHER_UNSUPPORTED_ROUTING';
 return {decision:kind,reason:r.reason||null,sourceRef:ref,
  sourceLocator:pointer?.sourceLocator||null,sameDocument:!!sameDocument,
  fullPassageCoverage:allSectionsCovered,disposition,approvedReply:false};
}
const observations=[];
for(const [name,engine] of Object.entries(engines)){
 for(const c of fixture.cases)for(const language of ['en','fr']){
  const question=c.questions[language];
  const r=engine.match(question,{language,currentCharacter:'pius-x'});
  assert.equal(r.answerText,null,'Unexpected generated answer '+c.id+'/'+language);
  assert.equal(r.approvedReply||false,false,'Unapproved character speech '+c.id+'/'+language);
  assert.notEqual(r.kind,'handoff_context','Unconfirmed cross-character transfer');
  observations.push({engine:name,caseId:c.id,language,question,
    expectedDocument:c.expectedDocument,expectedSections:c.expectedSections,
    ...inspectResponse(r,c)});
 }
}
assert.equal(observations.length,12);
const byEngine=Object.fromEntries(Object.keys(engines).map(name=>{
 const rows=observations.filter(x=>x.engine===name),counts={};
 for(const r of rows)counts[r.disposition]=(counts[r.disposition]||0)+1;
 return [name,counts];
}));
const report={
 schema:'AO_SPX_DOCUMENT_FIRST_THREE_UNSCRIPTED_ROUTER_OBSERVATIONS_V1',
 status:'ACTUAL_ROUTER_EXECUTION_SOURCE_NAVIGATION_ONLY_UNAPPROVED',
 routerOwner:'PR #1443',
 routerCommit:'66a0dbd041e7f3f8c8b57f317c5c21286fa8287d',
 fixture:file,
 method:'Three pre-frozen editorial scenarios × EN/FR × existing shared/hybrid routers. An unrelated section in the correct document is counted as wrong passage, not success. Zero historical answer generation.',
 caveat:'Not independent user holdout, not translation approval, not tested against a deployed conversational answer engine.',
 observations,byEngine
};
mkdirSync('research-out',{recursive:true});
writeFileSync('research-out/pius-x-document-first-unscripted-router-6.v1.json',JSON.stringify(report,null,2)+'\n');
console.log('SPX_UNSCRIPTED_DOCUMENT_ROUTER '+JSON.stringify(byEngine));
for(const r of observations)console.log('SPX_UNSCRIPTED_DOCUMENT_ROUTE_DETAIL '+JSON.stringify({engine:r.engine,caseId:r.caseId,language:r.language,disposition:r.disposition,sourceRef:r.sourceRef,sourceLocator:r.sourceLocator}));
