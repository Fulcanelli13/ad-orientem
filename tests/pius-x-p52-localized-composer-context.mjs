import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readCorpus,selectEvidence,composeDraft} from '../tools/pius-x-generative-review.mjs';
import {makeP52ComposerContext,assertP52PilotSourceCoverage,
 SPX_P52_PROFILE} from '../tools/pius-x-p52-bilingual-composer-context.mjs';
const store=readCorpus(readFileSync(
 'artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html','utf8'));
assert.equal(store.data.counts.allNodes,423);
assert.equal(store.data.counts.chapters,106);
assert.equal(store.data.approvals.publishing,false);
assert.equal(assertP52PilotSourceCoverage(store),true);
const chapter=store.chapters.get('SPX-PILOT-01');
assert.equal(chapter.nodes.length,3);
let reviewed=0,composed=0;
const fixtures={
 en:'The encyclical recalls the burden of the pontificate, his personal weakness, and the need for strength from God.',
 fr:'L’encyclique évoque le poids du pontificat, la conscience de sa propre faiblesse et la nécessité de chercher en Dieu sa force.'
};
for(const lang of ['en','fr'])for(const node of chapter.nodes){
 const input={chapterId:chapter.id,nodeId:node.id,language:lang,
  question:node.q[lang],voiceMode:'documentary',
  experimentalComposerProfile:SPX_P52_PROFILE};
 const original=selectEvidence(store,input);
 assert.equal(original.status,'eligible');
 const frozen=JSON.stringify(original);
 const adapted=makeP52ComposerContext(original,'documentary');
 assert.equal(adapted.editorialLanguageAidUsed,lang==='fr');
 assert.equal(adapted.requiredOutputLanguage,lang);
 assert.equal(adapted.evidence.length,1);
 assert.equal(adapted.evidence[0].id,original.evidence[0].id);
 for(let i=0;i<original.evidence[0].originalLanguageWitnesses.length;i++){
  const a=original.evidence[0].originalLanguageWitnesses[i];
  const b=adapted.evidence[0].originalLanguageWitnesses[i];
  assert.equal(a.id,b.id);
  assert.equal(a.text,b.text);
  assert.equal(a.sourceUrl,b.sourceUrl);
  assert.equal(a.locus,b.locus);
  assert.equal(a.speaker,b.speaker);
  assert.equal(a.originalLanguage,b.originalLanguage);
  if(lang==='fr'){
   assert.notEqual(a.readingNote,b.readingNote);
   assert.match(b.readingNote,/[\p{L}]{2,}/u);
  }else assert.equal(a.readingNote,b.readingNote);
 }
 assert.equal(JSON.stringify(original),frozen);
 const fake=async(stage,messages)=>{
  const data=JSON.parse(messages[1].content);
  if(stage==='compose'){
   composed++;
   assert.equal(data.editorialLanguageAidUsed,lang==='fr');
   assert.equal(data.language,lang);
   assert.equal(data.evidence[0].id,node.id);
   if(lang==='fr')
    assert.equal(data.evidence[0].originalResearchNotesStatus,
     'UNAPPROVED_FR_EDITORIAL_LANGUAGE_AID_NOT_PRIMARY_EVIDENCE');
   return {mode:'answer',text:fixtures[lang],
    evidenceIds:[node.id],
    witnessIds:[data.evidence[0].originalLanguageWitnesses[0].id],
    expression:'thoughtful'};
  }
  reviewed++;
  // Verifier must see the raw ORIGINAL evidence, never translated glosses.
  assert.equal(JSON.stringify(data.evidence),JSON.stringify(original.evidence));
  assert.equal(data.voiceMode,'documentary');
  assert.equal(data.candidate.ids[0],node.id);
  return {supported:true,allClaimsSupported:true,
   ids:data.candidate.ids,witnessIds:data.candidate.witnessIds};
 };
 const out=await composeDraft(store,input,fake);
 assert.equal(out.status,'draft');
 assert.equal(out.reply,fixtures[lang]);
 assert.equal(out.composerEvidenceProfile,SPX_P52_PROFILE);
 assert.equal(out.editorialLanguageAidApproved,false);
 assert.equal(out.publishingApproved,false);
 assert.equal(JSON.stringify(selectEvidence(store,input)),frozen);
}
assert.equal(composed,6);
assert.equal(reviewed,6);
// Fail closed when pilot-only language aid is requested on another subject.
let foreignCalls=0;
const foreign=store.chapters.get('SPX-PILOT-09');
const block=await composeDraft(store,{chapterId:foreign.id,nodeId:foreign.nodes[0].id,
 language:'en',question:foreign.nodes[0].q.en,
 experimentalComposerProfile:SPX_P52_PROFILE},async()=>{foreignCalls++;});
assert.equal(block.reason,'experimental_language_aid_unavailable_for_subject');
assert.equal(foreignCalls,0);
// Baseline remains identical unless research profile is explicitly chosen.
const baseline=await composeDraft(store,{chapterId:chapter.id,nodeId:chapter.nodes[0].id,
 language:'en',question:chapter.nodes[0].q.en},async(stage,messages)=>{
 const data=JSON.parse(messages[1].content);
 if(stage==='compose'){
  assert.equal(data.editorialLanguageAidUsed,undefined);
  return {mode:'abstain'};
 }
 throw Error('Unexpected verifier');
});
assert.equal(baseline.reason,'out_of_covered_sources');
assert.equal(store.data.counts.allNodes,423);
console.log('PASS SPX_P52_UNAPPROVED_FR_GLOSS_ISOLATED '+JSON.stringify({
 mockCompose:composed,mockVerify:reviewed,realInference:false,
 originalLatinWitnessesPreserved:true,
 originalVerifierEvidenceUnchanged:true,
 notesNotApproved:true,owners:423,
 outputLanguageBilingual:true,publishable:false
}));
