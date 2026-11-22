/**
 * P2.51: Replay the observed ACTUAL Qwen2.5 3B P2.50 outputs, not invented
 * success counts. Real model inference happened in Actions run 40095180443.
 * This deterministic regression specifically checks false positives the prior
 * engine mistakenly accepted: English as FR, clipped notes, gloss collages.
 *
 * Test models here are ordinary stubs only to assert the pre-verifier hold.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditDraftSurface} from '../tools/pius-x-draft-surface-gate.mjs';
import {readCorpus,selectEvidence,composeDraft}
 from '../tools/pius-x-generative-review.mjs';

const raw=readFileSync('artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html','utf8');
const store=readCorpus(raw);
assert.equal(store.data.counts.allNodes,423);
assert.equal(store.chapters.size,106);
assert.equal(store.data.approvals.publishing,false);
const chapterId='SPX-PILOT-01';
const nodes=store.chapters.get(chapterId).nodes;
const scoped=(nodeId,language)=>{
 const node=nodes.find(x=>x.id===nodeId);
 assert(node);
 const v=selectEvidence(store,{chapterId,nodeId,language,question:node.q[language]});
 assert.equal(v.status,'eligible');
 return v;
};
const evidenceFor=(index,lang)=>scoped(nodes[index].id,lang).evidence;
// Actual P2.50 JSON-proposed replies which passed the old verifier/pipeline.
const observed=[
 {idx:1,language:'en',expect:'source_glosses_spliced_as_reply',
  text:"His own sense of unworthiness; The burden of succession to a long-serving and admired predecessor; Consciousness of his weakness while considering society's condition; Finding courage in the divine strength on accepting the office."},
 {idx:0,language:'fr',expect:'fragmentary_editorial_reply',
  text:"... He tried with tears and prayers to avert the pontificate; His own sense of unworthiness; The burden of succession to a long-serving and admired predecessor; predecessor is not named in this sentence; Finding courage in the divine strength on accepting the office; The declared governing purpose of his pontificate..."},
 {idx:1,language:'fr',expect:'fragmentary_editorial_reply',
  text:"... His own sense of unworthiness; The burden of succession to a long-serving and admired predecessor; predecessor is not named in this sentence; Finding courage in the divine strength on accepting the office; The declared governing purpose of his pontificate..."}
];
for(const row of observed){
 const result=auditDraftSurface({text:row.text,language:row.language,
  evidence:evidenceFor(row.idx,row.language)});
 assert.equal(result.ok,false);
 assert.equal(result.reason,row.expect);
}
// A sanity guard must also preserve the existing, manually drafted P22 EN/FR
// evidence cases. Passing here is a surface check, NOT a certified translation.
const specimens=JSON.parse(readFileSync(
 'previews/pius-x-study/evidence/pius-x-p22-bilingual-claim-acceptance-pilot-20261024.v1.json','utf8'));
assert.equal(specimens.cases.length,11);
let existingSpecimensNotBlocked=0;
for(const c of specimens.cases)for(const language of ['en','fr']){
 const v=selectEvidence(store,{chapterId:c.chapterId,nodeId:c.nodeId,
  language,question:c.question[language]});
 assert.equal(v.status,'eligible');
 const surface=auditDraftSurface({text:c.replySpecimen[language],language,evidence:v.evidence});
 assert.equal(surface.ok,true,
  'Previously drafted source-limited '+language+' specimen '+c.nodeId+' held: '+surface.reason);
 existingSpecimensNotBlocked++;
}
assert.equal(existingSpecimensNotBlocked,22);

const englishInFrench="The office was not received lightly. The letter speaks of tears and prayers before a heavy charge, and of help sought from God.";
assert.equal(auditDraftSurface({text:englishInFrench,language:'fr',
 evidence:evidenceFor(0,'fr')}).reason,'reply_not_in_selected_language');
const validEnglish="The pontifical office was a grave duty, and he sought strength from God rather than from confidence in himself.";
const validFrench="Cette charge fut reçue comme un grave devoir. L’encyclique évoque la prière et la confiance placée en Dieu plutôt qu’en la force humaine.";
assert.equal(auditDraftSurface({text:validEnglish,language:'en',
 evidence:evidenceFor(0,'en')}).ok,true);
assert.equal(auditDraftSurface({text:validFrench,language:'fr',
 evidence:evidenceFor(0,'fr')}).ok,true);
let modelCalls=0,verifyCalls=0;
const makeFake=text=>async(stage,messages)=>{
 if(stage==='compose'){
  modelCalls++;
  const j=JSON.parse(messages[1].content);
  return {mode:'answer',text,evidenceIds:[j.evidence[0].id],
   witnessIds:[j.evidence[0].originalLanguageWitnesses[0].id],
   expression:'thoughtful'};
 }
 verifyCalls++;
 const j=JSON.parse(messages[1].content);
 return {supported:true,allClaimsSupported:true,ids:j.candidate.ids,
  witnessIds:j.candidate.witnessIds};
};
for(const row of observed){
 const inp={chapterId,nodeId:nodes[row.idx].id,language:row.language,
  question:nodes[row.idx].q[row.language]};
 const before=verifyCalls;
 const result=await composeDraft(store,inp,makeFake(row.text));
 assert.equal(result.status,'held');
 assert.equal(result.reason,row.expect);
 assert.equal(result.publishingApproved,false);
 assert.equal(verifyCalls,before,
  'Bad surface was held BEFORE the model self-verifier');
}
const frInput={chapterId,nodeId:nodes[0].id,language:'fr',
 question:nodes[0].q.fr};
const before=verifyCalls;
const wrong=await composeDraft(store,frInput,makeFake(englishInFrench));
assert.equal(wrong.reason,'reply_not_in_selected_language');
assert.equal(verifyCalls,before);
const good=await composeDraft(store,frInput,makeFake(validFrench));
assert.equal(good.status,'draft');
assert.equal(good.reply,validFrench);
assert.equal(good.publishingApproved,false);
assert.equal(verifyCalls,before+1);
assert.equal(store.data.counts.allNodes,423);
console.log('PASS SPX_P51_REAL_3B_OUTPUT_REGRESSION '+JSON.stringify({
 observedP50FalseAcceptsReclassified:3,existingP22BilingualSpecimensNotBlocked:22,wrongFrenchLanguageHeld:true,
 actualModelInferenceInThisTest:false,
 goodFrenchControlPasses:true,
 verificationCallsForRejectedOutputs:0,
 sourceOwners:423,publicationApproved:false
}));
