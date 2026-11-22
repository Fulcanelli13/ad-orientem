import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readCorpus,composeDraft,selectEvidence} from '../tools/pius-x-generative-review.mjs';
import {routePilotQuestion} from '../tools/pius-x-pilot-question-router.mjs';

const store=readCorpus(readFileSync('artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html','utf8'));
const bank=JSON.parse(readFileSync('previews/pius-x-study/evidence/pius-x-p24-unexpected-visitor-bank-80-20261024.v1.json','utf8'));
const targets={
 ES:['AO.SPX.DIALOGUE.SPX_PILOT_01.OPEN','AO.SPX.DIALOGUE.SPX_PILOT_01.FOLLOW_1',
  'AO.SPX.DIALOGUE.SPX_PILOT_01.OPEN','AO.SPX.DIALOGUE.SPX_PILOT_01.FOLLOW_2'],
 HA:['AO.SPX.DIALOGUE.SPX_PILOT_09.OPEN','AO.SPX.DIALOGUE.SPX_PILOT_09.FOLLOW_1',
  'AO.SPX.DIALOGUE.SPX_PILOT_09.FOLLOW_2','AO.SPX.DIALOGUE.SPX_PILOT_09.FOLLOW_1'],
 IF:['SPX.DIALOGUE.SPX-029.F1','SPX.DIALOGUE.SPX-029.OPEN',
  'SPX.DIALOGUE.SPX-029.F1','SPX.DIALOGUE.SPX-029.F2'],
 TC:['AO.SPX.DIALOGUE.SPX-NEW-012.OPEN','AO.SPX.DIALOGUE.SPX-NEW-012.OPEN',
  'AO.SPX.DIALOGUE.SPX-NEW-012.OPEN','AO.SPX.DIALOGUE.SPX-NEW-012.OPEN']
};
const minimumWitnesses={
 ES:[['ES-INTRO-TEARS'],['ES-2-UNWORTHY'],['ES-4-STRENGTH'],['ES-4-MOTTO','ES-8-CHRIST']],
 HA:[['HA-DAILY'],['HA-MINISTRY'],['HA-DAILY'],['HA-REJECT']],
 IF:[['IF-MERCY'],['IF-TRUTH'],['IF-MERCY'],['IF-VIRTUE']],
 TC:[['TC-REPENT'],['TC-MERCY'],['TC-SUPPRESS'],['TC-MERCY']]
};
const eligible=bank.cases.filter(x=>x.expected==='EVIDENCE_ELIGIBLE_NOT_ANSWER_CERTIFIED');
assert.equal(eligible.length,32);
let routed=0,compose=0,verify=0;
const responseModel=async(kind,messages)=>{
 const payload=JSON.parse(messages[1].content);
 if(kind==='compose'){
  compose++;
  return {mode:'answer',
   text:payload.language==='fr'?
    'Le document choisi présente une proposition historique limitée pour cette recherche privée. Aucun souvenir personnel ni jugement contemporain ne peut être déduit.':
    'The selected document offers a bounded historical proposition for private research. No personal recollection or present-day ruling is inferred.',
   evidenceIds:[payload.evidence[0].id],
   witnessIds:[payload.evidence[0].originalLanguageWitnesses[0].id],
   expression:'explaining'};
 }
 verify++;
 return {supported:true,allClaimsSupported:true,ids:payload.candidate.ids,
  witnessIds:payload.candidate.witnessIds};
};
for(const c of eligible){
 const prefix=c.id.slice(0,2),n=Number(c.id.slice(-2))-7;
 assert(targets[prefix]&&n>=0&&n<=3);
 const expected=targets[prefix][n],original=store.chapters.get(c.chapterId).nodes[0].id;
 const input={chapterId:c.chapterId,nodeId:original,language:c.language,
  question:c.question,autoRoute:true};
 const route=routePilotQuestion(store,input);
 assert.equal(route.status,'matched',c.id+':'+route.reason);
 assert.equal(route.nodeId,expected,'Natural-language question incorrectly sourced: '+c.id);
 assert.equal(route.chapterId,c.chapterId);
 const picked=selectEvidence(store,{...input,nodeId:route.nodeId});
 assert.equal(picked.status,'eligible',c.id);
 const ids=new Set(picked.evidence[0].originalLanguageWitnesses.map(w=>w.id));
 for(const w of minimumWitnesses[prefix][n])
  assert(ids.has(w),'Wrong original-language witness for '+c.id+': '+w);
 const before=compose;
 const actual=await composeDraft(store,input,responseModel);
 assert.equal(actual.status,'draft',c.id+': '+actual.reason);
 assert.equal(actual.selectedSourceNodeId,expected);
 assert.equal(actual.sourceRoute.nodeId,expected);
 assert.equal(actual.claimWitnessStatus,'EXACT_ORIGINAL_WITNESS_IDS_MATCHED_TO_NODE_NOT_CERTIFIED');
 assert(actual.claimWitnesses.length>=1);
 assert.equal(actual.publishingApproved,false);
 assert.equal(compose,before+1);
 routed++;
}
assert.equal(routed,32);
assert.equal(compose,32);
assert.equal(verify,32);
// Exact P6 question ownership survives without keyword heuristics, even when
// natural phrasing omits an explicit topic key.
for(const chapterId of ['SPX-PILOT-01','SPX-PILOT-09','SPX-029','SPX-NEW-012']){
 const chapter=store.chapters.get(chapterId);
 for(const node of chapter.nodes){
  for(const lang of ['en','fr']){
   const x=routePilotQuestion(store,{chapterId,language:lang,question:node.q[lang]});
   assert.equal(x.status,'matched',chapterId+'/'+node.id+'/'+lang);
   assert.equal(x.nodeId,node.id);
   assert.equal(x.intentKey,'exact_canonical_dialogue_question');
  }
 }
}
// Unknown or unrelated free-form text is held rather than sent with an
// irrelevant card's plausible-looking evidence.
for(const chapterId of Object.keys({
 'SPX-PILOT-01':1,'SPX-PILOT-09':1,'SPX-029':1,'SPX-NEW-012':1
 })){
 const chapter=store.chapters.get(chapterId);
 for(const lang of ['en','fr']){
  const input={chapterId,nodeId:chapter.nodes[0].id,language:lang,
   question:lang==='en'?'How should I repair a leaking radiator?':
     'Comment réparer un radiateur qui fuit ?',autoRoute:true};
  assert.equal(routePilotQuestion(store,input).reason,'no_explicit_bounded_intent');
  const before=compose;
  const result=await composeDraft(store,input,responseModel);
  assert.equal(result.status,'held');
  assert.equal(result.reason,'no_curated_source_match_for_free_question');
  assert.equal(compose,before);
 }
}
// No model may invent a context beyond the currently selected chapter.
assert.equal(routePilotQuestion(store,{chapterId:'SPX-EXP-001',
 language:'en',question:'What did you think of your childhood?'}).status,'unmatched');
assert.equal(store.data.counts.allNodes,423);
assert.equal([...store.sourceOnlyGate.values()].reduce((n,g)=>n+g.size,0),144);
assert.equal(store.data.approvals.publishing,false);
console.log('PASS SPX_P25_ROUTING: 32 unseen EN/FR source topic matches, correct original excerpt sets, exact canonical questions, 8 unrelated holds, 144-node gate and release status unchanged');
