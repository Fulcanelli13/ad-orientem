import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readCorpus,selectEvidence,composeDraft,loadPrimaryWitnessAnnex} from '../tools/pius-x-generative-review.mjs';

const annex=loadPrimaryWitnessAnnex();
const authored=JSON.parse(readFileSync('previews/pius-x-study/source-stage-37.v1.json','utf8'));
const chapter=authored.chapters.find(c=>c.id==='SPX-PILOT-01');
assert(chapter,'the source owner pilot chapter is missing');
assert.equal(annex.chapterId,chapter.id);
assert.equal(annex.originalRegistryUnmodified,true);
assert.equal(annex.publicationApproved,false);
assert.equal(annex.approvedAsAuthenticQuotation,false);
assert.equal(annex.editorialApproval,false);
assert.equal(annex.sourceWitnesses.length,8);
assert.equal(annex.dialogueMappings.length,3);
assert.deepEqual(
 annex.dialogueMappings.map(x=>x.nodeId),
 chapter.nodes.map(x=>x.id),
 'source-owner node IDs must match exactly in original author order'
);
assert(annex.sourceWitnesses.every(x=>x.latin&&x.locus&&x.speaker&&x.checkedLanguages.includes('la')));
const ids=new Set(annex.sourceWitnesses.map(x=>x.id));
assert.equal(ids.size,8);
assert(annex.dialogueMappings.every(m=>m.witnessIds.every(id=>ids.has(id))));
assert.equal(annex.sourceWitnesses.find(x=>x.id==='ES-INTRO-ANSELM').speaker,'ANSELM_QUOTED_BY_PIUS_X');
const third=annex.dialogueMappings[2];
assert(third.witnessIds.includes('ES-8-CHRIST'));
assert(third.editorialFlags.some(x=>x.startsWith('REQUIRES_LOCUS_EXTENSION_TO_§8')));
assert(!third.currentlyCitedLocus.includes('§8'));
const html=readFileSync('artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html','utf8');
const store=readCorpus(html);
assert.equal(store.data.counts.allNodes,423);
assert.equal(store.chapters.size,106);
for(const [idx,n] of chapter.nodes.entries()){
 const evidence=selectEvidence(store,{chapterId:chapter.id,nodeId:n.id,language:'fr',
  question:n.q.fr});
 assert.equal(evidence.status,'eligible');
 const selected=evidence.evidence.find(e=>e.id===n.id);
 assert(selected?.originalLatinWitnesses.length>0);
 assert.equal(selected.originalLatinWitnesses.length,annex.dialogueMappings[idx].witnessIds.length);
 assert.equal(selected.primaryWitnessStatus,'BOUNDED_LATIN_SPOTCHECK_NOT_FULL_VERIFICATION');
 assert(selected.originalLatinWitnesses.every(w=>w.sourceUrl===annex.document.sites.la));
 assert.equal(evidence.evidence.some(e=>e.status.includes('ORIGINAL_QUOTATION')),true);
}
const secondary=selectEvidence(store,{chapterId:'SPX-EXP-001',language:'en',
 question:'What was your childhood like?'});
assert.equal(secondary.status,'held');
let parsedComposer=null,parsedVerifier=null;
const fake=async(purpose,messages)=>{
 const input=JSON.parse(messages[1].content);
 if(purpose==='compose'){
  parsedComposer=input;
  const e=input.evidence.at(-1);
  return {mode:'answer',
   text:'The cited editorial paragraph treats the governing purpose as restoring all things in Christ.',
   evidenceIds:[e.id],expression:'thoughtful'};
 }
 parsedVerifier=input;
 return {supported:true,allClaimsSupported:true,ids:input.candidate.ids};
};
const q=chapter.nodes.at(-1);
const result=await composeDraft(store,{chapterId:chapter.id,nodeId:q.id,language:'en',question:q.q.en},fake);
assert.equal(result.status,'draft');
assert.equal(result.publishingApproved,false);
assert.equal(result.originalTextCollated,false);
assert(parsedComposer.evidence.some(e=>e.originalLatinWitnesses.some(w=>w.id==='ES-8-CHRIST')));
assert(parsedVerifier.evidence.some(e=>e.editorialWarnings.some(w=>w.includes('LOCUS_EXTENSION_TO_§8'))));
assert.equal(result.evidence.some(e=>e.status==='UNVERIFIED_EDITORIAL_ADAPTATION_NOT_ORIGINAL_QUOTATION'),true);
console.log('PASS SPX_E_SUPREMI_WITNESS: eight bounded Latin anchors/three original node IDs; speaker & §8 boundary kept; still unapproved');
