/**
 * P2.26 PRIVATE OFFLINE SOURCE DIALOGUE
 * Builds one HTML file from the existing P6 visual novel, its approved five
 * sprite assets, 11 source-witnessed research questions and 22 EN/FR editorial
 * specimens. No model, external resources, new claims or source-owner edits.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {readCorpus,selectEvidence,makeReviewHTML} from './pius-x-generative-review.mjs';

const out='artifacts/pius-x-study-expanded/';
const evidenceRoot='previews/pius-x-study/evidence/';
const html=readFileSync(out+'SPX_Study_Expanded_106_P6.html','utf8');
const store=readCorpus(html);
const specimens=JSON.parse(readFileSync(evidenceRoot+
 'pius-x-p22-bilingual-claim-acceptance-pilot-20261024.v1.json','utf8'));
assert.equal(store.data.counts.allNodes,423);
assert.equal(store.chapters.size,106);
assert.equal([...store.sourceOnlyGate.values()].reduce((n,g)=>n+g.size,0),144);
assert.equal(store.data.approvals.publishing,false);
assert.equal(specimens.cases.length,11);
assert.equal(specimens.summary.bilingualSpecimens,22);
assert.equal(specimens.summary.newModelSourceGateAdmissions,0);
assert.equal(specimens.summary.publicationApprovals,0);
const annexNames=[
 'pilot01-e-supremi-primary-witness.v1.json',
 'pilot09-haerent-animo-primary-witness.v2.json',
 'spx029-il-fermo-proposito-primary-witness.v2.json',
 'spx-new012-tribus-circiter-primary-witness.v2.json'
];
const sources=annexNames.map(name=>JSON.parse(readFileSync(evidenceRoot+name,'utf8')));
const originals=new Map();
for(const annex of sources){
 assert(['la','it'].includes(annex.document.languageOfOriginal));
 for(const w of annex.sourceWitnesses){
  // The original E supremi annex also holds St Anselm quoted by Pius X.
  // Quoted authorities remain research evidence but never become papal speech.
  if(w.speaker!=='PIUS_X_AUTHOR')continue;
  const text=w.text||w.latin;
  assert(typeof text==='string'&&text.length>=12);
  assert(!originals.has(w.id));
  originals.set(w.id,{
   id:w.id,text,locus:w.locus,originalLanguage:annex.document.languageOfOriginal,
   speaker:w.speaker,sourceUrl:annex.document.sites.original||annex.document.sites.la
  });
 }
}
const cases=[];
const allowedChapterIds=new Set(['SPX-PILOT-01','SPX-PILOT-09','SPX-029','SPX-NEW-012']);
const used=new Set(),distinctWitnesses=new Set();
const expressions=['thoughtful','grave','explaining','welcoming','explaining'];
for(const c of specimens.cases){
 assert(allowedChapterIds.has(c.chapterId));
 assert(!used.has(c.nodeId),'Original owned node repeated');used.add(c.nodeId);
 const chapter=store.chapters.get(c.chapterId);
 const node=chapter?.nodes.find(n=>n.id===c.nodeId);
 assert(chapter?.sourceClass==='PAPAL_DOCUMENT_ADAPTATION'&&!chapter.partial&&node);
 assert.deepEqual(c.question,node.q);
 assert.equal(c.publishingApproved,false);
 assert.equal(c.completeAnswerCertified,false);
 assert.equal(c.translationCertified,false);
 assert.equal(c.historicalVoiceCertified,false);
 for(const language of ['en','fr']){
  assert.equal(selectEvidence(store,{chapterId:c.chapterId,nodeId:c.nodeId,
   language,question:c.question[language]}).status,'eligible');
  assert(c.replySpecimen[language].length>=85);
 }
 const scoped=selectEvidence(store,{chapterId:c.chapterId,nodeId:c.nodeId,
  language:'en',question:c.question.en});
 const allowedIds=new Set(scoped.evidence.flatMap(e=>e.originalLanguageWitnesses.map(w=>w.id)));
 assert(c.evidenceIds.length>0);
 const witnesses=c.evidenceIds.map(id=>{
  assert(allowedIds.has(id),'Off-node Latin/Italian evidence '+id);
  const w=originals.get(id);assert(w&&w.sourceUrl.startsWith('https://www.vatican.va/'));
  distinctWitnesses.add(id);
  return w;
 });
 cases.push({chapterId:c.chapterId,nodeId:c.nodeId,
  question:c.question,reply:c.replySpecimen,witnesses,
  expression:expressions[cases.length%expressions.length],
  editorialStatus:'PRIVATE_UNAPPROVED_HISTORICAL_SOURCE_PARAPHRASE',
  bilingualTranslationsCertified:false,fullClaimReviewCertified:false,publishingApproved:false});
}
assert.equal(cases.length,11);
assert.equal(distinctWitnesses.size,18);
const offline={
 schema:'AO_SPX_P26_OFFLINE_REVIEW_CASES_V1',status:'PRIVATE_STATIC_NO_MODEL_INFERENCE',
 modelProviderEnabled:false,publishingApproved:false,sourceOnlyGateAdmissions:0,
 canonicalChapters:4,canonicalNodes:11,bilingualEditorialPairs:22,
 originalWitnessFragments:distinctWitnesses.size,originalCorpusNodes:423,cases
};
const client=readFileSync('previews/pius-x-study/spx-p26-offline-replay-client.js','utf8');
const css=readFileSync('previews/pius-x-study/spx-model-review-style.css','utf8')+'\n'+
 readFileSync('previews/pius-x-study/spx-p26-offline-replay-style.css','utf8');
assert(!/<\/script/i.test(client)&&!/<\/style/i.test(css));
const safe=JSON.stringify(offline).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
const sourceHTML=html.replace('</body>',
 '<script type="application/json" id="spxOfflineReplayData">'+safe+'</script></body>');
const final=makeReviewHTML(sourceHTML,client,css);
assert(!/<script[^>]+src=/.test(final));
assert(!/<link[^>]+https?:\/\//.test(final));
assert.equal(final.match(/id="spxOfflineReplayData"/g)?.length,1);
assert.equal(final.match(/id="spxExpandedCorpus"/g)?.length,1);
assert.equal(final.match(/id="spxData"/g)?.length,1);
mkdirSync(out,{recursive:true});
const dest=out+'SPX_P26_Offline_Source_Dialogue_Demo.html';
writeFileSync(dest,final);
console.log('PASS SPX_P26_OFFLINE_BUILD '+JSON.stringify({
 path:dest,bytes:Buffer.byteLength(final),chapterCount:4,sourceOwnedQuestions:11,
 bilingualEditorialDrafts:22,originalFragments:18,networkCalls:0,
 sourceOwnerNodes:423,generativeGateNodes:144,published:false
}));
