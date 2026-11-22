import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readCorpus,selectEvidence,composeDraft,loadPrimaryWitnessAnnexes} from '../tools/pius-x-generative-review.mjs';

const annexes=loadPrimaryWitnessAnnexes();
assert.equal(annexes.size,4);
const targets=[
 ['SPX-029','previews/pius-x-study/source-stage-20.v1.json','it',4,4],
 ['SPX-NEW-012','previews/pius-x-study/spx-p3-new-chapters-justice-pastoral-4.v1.json','la',7,4],
 ['SPX-PILOT-09','previews/pius-x-study/source-stage-37.v1.json','la',4,3]
];
const html=readFileSync('artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html','utf8');
const store=readCorpus(html);
assert.equal(store.data.counts.allNodes,423);
assert.equal(store.chapters.size,106);
for(const [chapterId,file,language,witnessCount,nodeCount] of targets){
 const annex=annexes.get(chapterId);
 const source=JSON.parse(readFileSync(file,'utf8')).chapters.find(c=>c.id===chapterId);
 const built=store.chapters.get(chapterId);
 assert(source&&built);
 assert.equal(annex.schema,'AO_SPX_P2_PRIMARY_WITNESS_ANNEX_V2');
 assert.equal(annex.document.languageOfOriginal,language);
 assert.equal(annex.sourceWitnesses.length,witnessCount);
 assert.equal(annex.dialogueMappings.length,nodeCount);
 assert.equal(annex.originalRegistryUnmodified,true);
 assert.equal(annex.publicationApproved,false);
 assert.equal(annex.approvedAsAuthenticQuotation,false);
 assert.equal(annex.editorialApproval,false);
 assert.deepEqual(annex.dialogueMappings.map(m=>m.nodeId),source.nodes.map(n=>n.id));
 assert.deepEqual(annex.dialogueMappings.map(m=>m.nodeId),built.nodes.map(n=>n.id));
 assert.equal(new Set(annex.sourceWitnesses.map(w=>w.id)).size,witnessCount);
 const IDs=new Set(annex.sourceWitnesses.map(w=>w.id));
 assert(annex.dialogueMappings.every(m=>m.witnessIds.every(id=>IDs.has(id))));
 for(const m of annex.dialogueMappings){
  assert(m.editorialWarnings instanceof Array);
  assert(m.witnessIds.length>0);
 }
 for(const w of annex.sourceWitnesses){
  assert(w.text.length>5&&w.locus&&w.meaning);
  assert.equal(w.speaker,'PIUS_X_AUTHOR');
  assert(!/<[^>]+>/.test(w.text));
 }
 const allowedNodes=source.nodes.filter(n=>!annex.dialogueMappings.find(m=>m.nodeId===n.id).editorialWarnings.some(w=>
  w.startsWith('NEGATIVE_CLAIM_NOT_DIRECTLY_ATTESTED')||
  w.startsWith('PRESENT_LAW_NOT_IN_SOURCE')));
 for(const node of allowedNodes){
  const q={chapterId,nodeId:node.id,language:'fr',question:node.q.fr};
  const selection=selectEvidence(store,q);
  assert.equal(selection.status,'eligible',chapterId+':'+node.id);
  const matching=selection.evidence.find(e=>e.id===node.id);
  assert(matching?.originalLanguageWitnesses.length>0);
  assert(matching.originalLanguageWitnesses.every(w=>w.originalLanguage===language&&
   w.sourceUrl===annex.document.sites.original));
  assert(matching.editorialWarnings instanceof Array);
  assert.equal(matching.primaryWitnessStatus,
   'BOUNDED_'+(language==='it'?'ITALIAN':'LATIN')+'_SPOTCHECK_NOT_FULL_VERIFICATION');
  if(language==='it')assert.equal(matching.originalLatinWitnesses.length,0);
 }
}
const ilFermo=annexes.get('SPX-029');
assert(ilFermo.findings.some(s=>s.includes('Italian')));
assert(ilFermo.dialogueMappings.at(-1).editorialWarnings.some(w=>w.startsWith('NEGATIVE_CLAIM_NOT_DIRECTLY_ATTESTED')));
const tribus=annexes.get('SPX-NEW-012');
assert(tribus.dialogueMappings.at(-1).editorialWarnings.some(w=>w.startsWith('PRESENT_LAW_NOT_IN_SOURCE')));
const haerent=annexes.get('SPX-PILOT-09');
assert(haerent.dialogueMappings.at(-1).editorialWarnings.some(w=>w.includes('AUDIENCE_SPECIFIC')));
let calls=0;
const model=async (purpose,messages)=>{
 calls++;
 const data=JSON.parse(messages[1].content);
 if(purpose==='compose'){
  return {mode:'answer',
   text:'The source-bounded pastoral argument requires charity that respects the duties of the Christian state.',
   evidenceIds:[data.evidence.at(-1).id],expression:'explaining'};
 }
 return {supported:true,allClaimsSupported:true,ids:data.candidate.ids};
};
const blocked=[
 {chapterId:'SPX-029',nodeId:'SPX.DIALOGUE.SPX-029.F3',language:'en',
  question:'Do all acts of mercy require association membership?'},
 {chapterId:'SPX-NEW-012',nodeId:'AO.SPX.DIALOGUE.SPX-NEW-012.FOLLOW_3',language:'en',
  question:'Does my modern penalty no longer apply?'}
];
for(const input of blocked){
 assert.equal(selectEvidence(store,input).reason,'selected_question_outside_attested_historical_passage');
 assert.equal((await composeDraft(store,input,model)).status,'held');
}
assert.equal(calls,0,'unattested modern-status questions must not invoke the provider');
for(const [chapterId] of targets){
 const ch=store.chapters.get(chapterId);
 const response=await composeDraft(store,{
  chapterId,nodeId:ch.nodes[0].id,language:'en',question:ch.nodes[0].q.en},model);
 assert.equal(response.status,'draft');
 assert.equal(response.publishingApproved,false);
 assert.equal(response.originalTextCollated,false);
 assert(response.evidence[0].status.includes('UNVERIFIED_EDITORIAL'));
}
assert.equal(calls,6,'three mocked generations and three mock verifications');
console.log('PASS SPX_4_PILOT_WITNESSES: original 106/423 source corpus, 3 extra Latin/Italian chapters, 11 mapped new nodes, 15 short witnesses, 2 preflight holds, zero publication');
