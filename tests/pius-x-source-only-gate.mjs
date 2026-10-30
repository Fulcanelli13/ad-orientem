import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readCorpus,selectEvidence,composeDraft} from '../tools/pius-x-generative-review.mjs';

const html=readFileSync('artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html','utf8');
const store=readCorpus(html);
assert.equal(store.data.counts.allNodes,423);
assert.equal(store.chapters.size,106);
assert.equal(store.sourceOnlyGate.size,47);
assert.equal(store.data.approvals.publishing,false);

let eligible=0, held=0;
const all=new Set(store.chapters.keys());
for(const c of store.chapters.values()){
 const input={chapterId:c.id,nodeId:c.nodes[0].id,
  language:'en',question:c.nodes[0].q.en};
 const result=selectEvidence(store,input);
 if(result.status==='eligible'){
  eligible++;
  assert(store.sourceOnlyGate.has(c.id));
  assert.equal(result.evidence.length,1);
  assert.equal(result.evidence[0].id,c.nodes[0].id);
  assert(result.evidence[0].originalLanguageWitnesses.length>0);
  assert(result.evidence[0].text.length>12);
  assert(!result.evidence[0].text.includes(c.nodes[0].a.en));
  assert(!result.evidence[0].text.includes(c.nodes[0].a.fr));
 }else{
  held++;
  assert(result.status==='held');
 }
}
assert.equal(eligible,47);
assert.equal(held,59);
assert.equal(all.size,106);
for(const id of ['SPX-PILOT-07','SPX-NEW-021','SPX-NEW-013','SPX-EXP-037',
 'SPX-NEW-003','SPX-NEW-008','SPX-NEW-007','SPX-013']){
 const c=store.chapters.get(id);
 const a=selectEvidence(store,{chapterId:id,nodeId:c.nodes[0].id,language:'fr',question:c.nodes[0].q.fr});
 assert.equal(a.status,'eligible');
 assert.equal(a.evidence[0].primaryWitnessStatus,'NARROW_SOURCE_CLAIM_CANDIDATES_UNAPPROVED');
 assert(a.evidence[0].editorialWarnings.some(w=>w.includes('complete existing editorial answer')));
 if(c.nodes.length>1){
  const next=selectEvidence(store,{chapterId:id,nodeId:c.nodes[1].id,language:'en',question:c.nodes[1].q.en});
  assert.equal(next.status,'eligible','directly attested first follow-up must now have narrow evidence');
  assert.equal(next.evidence[0].primaryWitnessStatus,'NARROW_SOURCE_FOLLOWUP_CANDIDATE_UNAPPROVED');
 }
}

const followupTriage=JSON.parse(readFileSync(
 'previews/pius-x-study/evidence/pius-x-eight-document-followup-triage-20261023.v1.json','utf8'));
assert.equal(followupTriage.schema,'AO_SPX_P2_EIGHT_DOCUMENT_FOLLOWUP_TRIAGE_V1');
assert.deepEqual(followupTriage.summary,{
 documents:8,followupNodes:22,boundedFollowupCandidates:14,heldFollowupNodes:8,
 newOriginalWitnessFragments:3,fullAnswersVerified:0,translationsCertified:0,published:0});
const mapped=followupTriage.followups.filter(x=>x.witnessIds.length);
const unmapped=followupTriage.followups.filter(x=>x.witnessIds.length===0);
assert.equal(mapped.length,14);
assert.equal(unmapped.length,8);
assert.equal([...store.sourceOnlyGate.values()].reduce((a,v)=>a+v.size,0),144);
for(const item of followupTriage.followups){
 const c=store.chapters.get(item.chapterId);
 const node=c?.nodes.find(n=>n.id===item.nodeId);
 assert(node,'all records must identify canonical P6 node IDs');
 assert.equal(item.questionEn,node.q.en);
 const result=selectEvidence(store,{chapterId:c.id,nodeId:node.id,language:'fr',question:node.q.fr});
 if(item.witnessIds.length){
  assert.equal(result.status,'eligible');
  assert.deepEqual(result.evidence[0].originalLanguageWitnesses.map(w=>w.id),item.witnessIds);
  assert.equal(result.evidence[0].primaryWitnessStatus,'NARROW_SOURCE_FOLLOWUP_CANDIDATE_UNAPPROVED');
  assert(result.evidence[0].editorialWarnings.some(w=>w.includes('NOT evidence')));
  assert(!JSON.stringify(result.evidence).includes(node.a.en));
  assert(!JSON.stringify(result.evidence).includes(node.a.fr));
 }else{
  const subsequentlyDocumented={
   'AO.SPX.DIALOGUE.SPX-NEW-007.FOLLOW_2':['W3-E-EXAMPLES'],
    'AO.SPX.DIALOGUE.SPX-NEW-003.FOLLOW_2':['W4-R-VARIETY','W4-R-BASIL'],
   'AO.SPX.DIALOGUE.SPX_013.F3':['W3-A-DEVOTION','W3-A-OBEY','W3-A-IMITATION']
  };
  if(subsequentlyDocumented[item.nodeId]){
   assert.equal(result.status,'eligible');
   assert(['WAVE_THREE_NARROW_ORIGINAL_TEXT_RESEARCH_ONLY',
      'WAVE_FOUR_NARROW_ORIGINAL_SOURCE_CANDIDATE_UNAPPROVED'].includes(
       result.evidence[0].primaryWitnessStatus));
   assert.deepEqual(result.evidence[0].originalLanguageWitnesses.map(w=>w.id),
    subsequentlyDocumented[item.nodeId]);
  }else{
   assert.equal(result.status,'held');
   assert.equal(result.reason,'followup_not_mapped_to_primary_source_claim');
  }
 }
}
const chant=followupTriage.additionalOriginalWitnesses;
assert.equal(chant.length,3);
const originalVaticanContext=[
 'Per tali motivi il canto gregoriano fu sempre considerato come il supremo modello della musica sacra',
 'Le anzidette qualità sono pure possedute in ottimo grado dalla classica polifonia',
 'Per conseguenza la musica più moderna è pure ammessa in chiesa'
].join(' ');
for(const excerpt of chant){
 assert(originalVaticanContext.includes(excerpt.originalText),
  'Vatican source-context spotcheck missing '+excerpt.id);
 assert.equal(excerpt.status,'VATICAN_VERBATIM_SPOTCHECK_NOT_TRANSLATION_APPROVED');
 assert.equal(excerpt.originalLanguage,'it');
}
const question38=store.chapters.get('SPX-EXP-037');
const music=selectEvidence(store,{chapterId:question38.id,nodeId:question38.nodes[2].id,
 language:'en',question:question38.nodes[2].q.en});
assert.deepEqual(music.evidence[0].originalLanguageWitnesses.map(x=>x.id),
 ['TLS-CHANT','TLS-POLYPHONY','TLS-MODERN']);


const wave2=JSON.parse(readFileSync(
 'previews/pius-x-study/evidence/pius-x-six-document-wave2-20261023.v1.json','utf8'));
assert.equal(wave2.summary.newlyMappedNodes,46);
assert.equal(wave2.summary.screenedExistingNodeIDs,51);
assert.equal(wave2.summary.originalP6PartialHolds,5);
assert.equal(wave2.summary.distinctChapters,25);
assert.equal(wave2.summary.newOriginalLanguageSnippets,35);
assert.equal(wave2.summary.completeAnswersCertified,0);
const assigned=new Set();
let waveAdmitted=0,waveHeld=0;
for(const record of wave2.records){
 assert(!assigned.has(record.nodeId));assigned.add(record.nodeId);
 const c=store.chapters.get(record.chapterId);
 assert(c&&c.nodes.some(x=>x.id===record.nodeId));
 const node=c.nodes.find(x=>x.id===record.nodeId);
 assert.equal(record.questionEn,node.q.en);
 for(const language of ['en','fr']){
  const result=selectEvidence(store,{chapterId:c.id,nodeId:record.nodeId,
   question:node.q[language],language});
  if(record.status==='HOLD_ORIGINAL_P6_PARTIAL_EVIDENCE'){
   assert.equal(c.partial,true);
   assert.equal(result.status,'held');
   assert.equal(result.reason,'not_papal_primary_document_adaptation');
   continue;
  }
  assert.equal(result.status,'eligible');
  assert.equal(result.evidence[0].primaryWitnessStatus,
   'WAVE_TWO_BOUNDED_ORIGINAL_EXCERPT_CANDIDATE_UNAPPROVED');
  assert.deepEqual(result.evidence[0].originalLanguageWitnesses.map(x=>x.id),
   record.witnessIds);
  assert(result.evidence[0].editorialWarnings.some(x=>x.includes('not a verified complete')));
  assert(!JSON.stringify(result.evidence).includes(node.a.en));
  assert(!JSON.stringify(result.evidence).includes(node.a.fr));
 }
 if(record.status==='HOLD_ORIGINAL_P6_PARTIAL_EVIDENCE')waveHeld++;
 else waveAdmitted++;
}
assert.equal(waveAdmitted,46);
assert.equal(waveHeld,5);
assert.equal(assigned.size,51);
assert.equal(new Set(wave2.witnesses.map(x=>x.id)).size,35);
assert(wave2.witnesses.every(x=>x.originalText.length>15 &&
 x.sourceUrl.startsWith('https://www.vatican.va/content/pius-x/') &&
 x.status==='VATICAN_ORIGINAL_LANGUAGE_TEXT_SPOTCHECK_NOT_FULL_CERTIFICATION'));
const negative=store.chapters.get('SPX-NEW-011');
assert.equal(selectEvidence(store,{chapterId:negative.id,nodeId:negative.nodes[3].id,
 question:negative.nodes[3].q.en,language:'en'}).reason,'followup_not_mapped_to_primary_source_claim');


const wave3=JSON.parse(readFileSync(
 'previews/pius-x-study/evidence/pius-x-six-document-wave3-20261023.v1.json','utf8'));
assert.equal(wave3.schema,'AO_SPX_P2_SIX_DOCUMENT_WAVE3_EVIDENCE_TRIAGE_V1');
assert.equal(wave3.summary.sourceNodesInSixDocuments,84);
assert.equal(wave3.summary.previouslySourceMappedNodes,31);
assert.equal(wave3.summary.previouslyUnmappedNodesScreened,53);
assert.equal(wave3.summary.newBoundedResearchCandidates,38);
assert.equal(wave3.summary.newResearchHolds,15);
assert.equal(wave3.summary.newOriginalVaticanSnippets,40);
assert.equal(wave3.summary.approvedCompleteAnswers,0);
assert.equal(wave3.summary.approvedTranslations,0);
assert.equal(wave3.summary.publishedReplies,0);
const all3=new Set();let thirdMapped=0,thirdHeld=0;
for(const row of wave3.records){
 assert(!all3.has(row.nodeId));all3.add(row.nodeId);
 const chapter=store.chapters.get(row.chapterId);
 assert(chapter,'all 53 are original P6 nodes');
 const node=chapter.nodes.find(x=>x.id===row.nodeId);
 assert(node&&node.q.en===row.questionEn);
 assert.equal(row.publishingApproved,false);
 assert.equal(row.historicalSpeakerApproval,false);
 assert.equal(row.completeAnswerApproved,false);
 assert.equal(row.translationCertified,false);
 for(const language of ['en','fr']){
  const check=selectEvidence(store,{chapterId:row.chapterId,
   nodeId:row.nodeId,question:node.q[language],language});
  if(row.witnessIds.length){
   assert.equal(check.status,'eligible');
   assert.equal(check.evidence[0].primaryWitnessStatus,
    'WAVE_THREE_NARROW_ORIGINAL_TEXT_RESEARCH_ONLY');
   assert.deepEqual(check.evidence[0].originalLanguageWitnesses.map(x=>x.id),row.witnessIds);
   assert(check.evidence[0].editorialWarnings.some(x=>
     x.includes('Neither the original P6 English nor French answer is authenticated')));
   assert(!JSON.stringify(check.evidence).includes(node.a.en));
   assert(!JSON.stringify(check.evidence).includes(node.a.fr));
  }else{
   assert.equal(check.status,'held');
   assert(['no_original_language_witness_for_selected_subject',
    'followup_not_mapped_to_primary_source_claim',
    'not_papal_primary_document_adaptation'].includes(check.reason));
  }
 }
 if(row.witnessIds.length)thirdMapped++;else thirdHeld++;
}
assert.equal(all3.size,53);
assert.equal(thirdMapped,38);
assert.equal(thirdHeld,15);
const witness3=new Set(wave3.witnesses.map(x=>x.id));
assert.equal(witness3.size,40);
assert(wave3.witnesses.every(x=>x.sourceUrl.startsWith('https://www.vatican.va/')&&
 x.originalText.length>15&&x.translationApproved===false&&x.publishingApproved===false));
assert(wave3.witnesses.some(x=>x.speaker==='ST_CHARLES_BORROMEO_QUOTED_BY_PIUS_X'));
assert(wave3.witnesses.some(x=>x.speaker==='LEO_XIII_1902_QUOTED_BY_PIUS_X'));
const priestAssociation=wave3.records.find(x=>x.chapterId==='SPX-NEW-019'&&
 x.witnessIds.some(id=>id.endsWith('H-EXPERIENCE')));
assert(priestAssociation,'actual biographical firsthand passage must be mapped, not invented');
const unsupportedModern=store.chapters.get('SPX-NEW-002');
assert.equal(selectEvidence(store,{chapterId:unsupportedModern.id,
 nodeId:unsupportedModern.nodes[3].id,question:unsupportedModern.nodes[3].q.en,language:'en'}).status,'held');


const fourth=JSON.parse(readFileSync(
 'previews/pius-x-study/evidence/pius-x-six-document-wave4-remaining60-20261023.v1.json','utf8'));
assert.equal(fourth.schema,'AO_SPX_P2_SIX_DOCUMENT_WAVE4_REMAINING60_V1');
assert.equal(fourth.status,'PRIVATE_BOUNDED_SNIPPET_RESEARCH_WITH_EXPLICIT_HOLDS');
assert.deepEqual({
 prior:fourth.summary.previouslyMappedNodesInSixDocuments,
 screened:fourth.summary.remainingNodesScreened,
 included:fourth.summary.newBoundedResearchCandidates,
 held:fourth.summary.newHeldNodes,
 snippets:fourth.summary.newOriginalVaticanExcerpts
},{prior:51,screened:60,included:24,held:36,snippets:23});
assert.equal(fourth.summary.fullAnswerCertifications,0);
assert.equal(fourth.summary.publishingApprovals,0);
assert.equal(fourth.summary.bilingualTranslationCertifications,0);
const p6Ids=new Set();let mapped4=0,held4=0,partial4=0;
for(const x of fourth.records){
 const c=store.chapters.get(x.chapterId),node=c?.nodes.find(y=>y.id===x.nodeId);
 assert(c&&node&&node.q.en===x.questionEn);
 assert(!p6Ids.has(x.nodeId));p6Ids.add(x.nodeId);
 assert.equal(x.completeAnswerApproved,false);
 assert.equal(x.publishingApproved,false);
 assert.equal(x.translationApproved,false);
 for(const language of ['en','fr']){
  const result=selectEvidence(store,{chapterId:x.chapterId,nodeId:x.nodeId,
   language,question:node.q[language]});
  if(x.witnessIds.length){
   assert.equal(result.status,'eligible');
   assert.equal(result.evidence[0].primaryWitnessStatus,
    'WAVE_FOUR_NARROW_ORIGINAL_SOURCE_CANDIDATE_UNAPPROVED');
   assert.deepEqual(result.evidence[0].originalLanguageWitnesses.map(w=>w.id),x.witnessIds);
   assert(result.evidence[0].editorialWarnings.some(w=>w.includes('do not authenticate')));
   assert(!JSON.stringify(result.evidence).includes(node.a.en));
   assert(!JSON.stringify(result.evidence).includes(node.a.fr));
   for(const witness of result.evidence[0].originalLanguageWitnesses)
    assert(witness.sourceUrl.startsWith('https://www.vatican.va/'));
  }else{
   assert.equal(result.status,'held');
   assert(['no_original_language_witness_for_selected_subject',
    'followup_not_mapped_to_primary_source_claim',
    'not_papal_primary_document_adaptation'].includes(result.reason));
  }
 }
 if(x.witnessIds.length)mapped4++;
 else{held4++;if(x.ownerPartial)partial4++;}
}
assert.equal(p6Ids.size,60);
assert.equal(mapped4,24);
assert.equal(held4,36);
assert.equal(partial4,18);
assert.equal(new Set(fourth.witnesses.map(x=>x.id)).size,23);
assert(fourth.witnesses.every(x=>x.verification==='OFFICIAL_VATICAN_EXACT_SHORT_TEXT_NOT_COMPLETE_SOURCE_CERTIFICATION'));
assert(fourth.witnesses.some(x=>x.speaker==='VATICAN_I_QUOTED_BY_PIUS_X'));
assert(fourth.witnesses.some(x=>x.speaker==='ST_BASIL_QUOTED_BY_PIUS_X'));
// A bounded witness is evidence of its own proposition, never of adjacent claims.
assert.equal(selectEvidence(store,{chapterId:'SPX-EXP-021',
 nodeId:store.chapters.get('SPX-EXP-021').nodes[2].id,
 question:store.chapters.get('SPX-EXP-021').nodes[2].q.en,language:'en'}).status,'held');
assert.equal(selectEvidence(store,{chapterId:'SPX-032',
 nodeId:store.chapters.get('SPX-032').nodes[5].id,
 question:store.chapters.get('SPX-032').nodes[5].q.en,language:'en'}).status,'held');

const legacy=store.chapters.get('SPX-PILOT-01');
const short=selectEvidence(store,{chapterId:legacy.id,nodeId:legacy.nodes[0].id,
 language:'en',question:legacy.nodes[0].q.en});
assert.equal(short.status,'eligible');
assert.equal(short.evidence[0].primaryWitnessStatus,'BOUNDED_LATIN_SPOTCHECK_NOT_FULL_VERIFICATION');
const unresolved=[...store.chapters.values()].find(c=>c.sourceClass==='PAPAL_DOCUMENT_ADAPTATION'&& !c.partial&&!store.sourceOnlyGate.has(c.id));
assert(unresolved,'need at least one papal-document subject with no source-backed passage');
const unresolvedInput={chapterId:unresolved.id,nodeId:unresolved.nodes[0].id,
 language:'en',question:unresolved.nodes[0].q.en};
assert.equal(selectEvidence(store,unresolvedInput).reason,'no_original_language_witness_for_selected_subject');
let calls=0,seen;
const fake=async (purpose,messages)=>{
 calls++;
 const data=JSON.parse(messages[1].content);
 if(purpose==='compose'){
  seen=data;
  return {mode:'answer',text:'Only the bounded, original-language-source-supported claims may be considered in this private editorial study.',
   evidenceIds:[data.evidence[0].id],expression:'thoughtful'};
 }
 return {supported:true,allClaimsSupported:true,ids:data.candidate.ids};
};
assert.equal((await composeDraft(store,unresolvedInput,fake)).reason,'no_original_language_witness_for_selected_subject');
assert.equal(calls,0,'Uncollated topic invoked inference');
const c=store.chapters.get('SPX-EXP-037');
const input={chapterId:c.id,nodeId:c.nodes[0].id,language:'en',question:c.nodes[0].q.en};
const result=await composeDraft(store,input,fake);
assert.equal(result.status,'draft');
assert.equal(result.publishingApproved,false);
assert.equal(calls,2);
assert.equal(seen.evidence.length,1);
assert.equal(seen.evidence[0].originalLanguageWitnesses.length,5);
assert(!JSON.stringify(seen).includes(c.nodes[0].a.en));
assert(!JSON.stringify(seen).includes(c.nodes[0].a.fr));
assert(seen.evidence[0].text.includes('Universality'));
assert(!seen.evidence[0].text.includes('Gregorian chant offers the clearest model'));
const before=calls;
const next=await composeDraft(store,{...input,nodeId:c.nodes[1].id,question:c.nodes[1].q.en},fake);
assert.equal(next.status,'draft','liturgical music first follow-up is now independently witness-mapped');
assert.equal(calls,before+2);
const second=await composeDraft(store,{...input,nodeId:c.nodes[2].id,question:c.nodes[2].q.en},fake);
assert.equal(second.status,'draft');
assert.equal(calls,before+4);
assert(seen.evidence[0].originalLanguageWitnesses.some(x=>x.id==='TLS-POLYPHONY'));
console.log('PASS SPX_SOURCE_ONLY_GATE: 47 source-backed subjects, 144 bounded original-text nodes; wave4 24 added and 36 held, no reply certifications; eight unsupported followups held, no P6 whole answers supplied, zero release approvals');
