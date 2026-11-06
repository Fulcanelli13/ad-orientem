import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {PARTICIPATION_NEUME_POLICY,participationNeumeOpportunity}
 from "../src/mass/reader-participation-neume-policy.js";
import {PARTICIPATION_REFERENCE_SCORES,participationReferenceScoresForParagraph}
 from "../src/mass/reader-participation-reference-scores.js";
import {APPROVED_MASS_INLINE_GABC} from "../src/mass/reader-inline-chant-approved.js";
import {selectApprovedInlineScore} from "../src/mass/reader-inline-chant-selector.js";
import {buildParticipationCoverage,PARTICIPATION_COVERAGE_SCHEMA}
 from "../src/mass/reader-participation-coverage.js";

const file=async path=>JSON.parse(await readFile(new URL("../"+path,import.meta.url),"utf8"));
const snapshot=await file("data/mass/participation-20-event-coverage.v1.json");
const model=buildParticipationCoverage();
assert.deepEqual(snapshot,model,"Coverage master must be reproducible from canonical source modules");
assert.equal(model.schema,PARTICIPATION_COVERAGE_SCHEMA);
assert.deepEqual(model.counts,{
 events:20,uniqueCueIds:23,exactPublicFragments:2,
 fixedResearchExcerpts:24,eventsLimitedPublic:1,
 eventsFixedResearchOnly:14,eventsDynamicSourceBound:2,
 eventsSourceUnmapped:2,eventsExcludedNonSung:1,
 sungEligibleEvents:19,sungEligibleCueIds:22,eventsWithAnyFixedResearch:15
});
assert.equal(PARTICIPATION_NEUME_POLICY.length,20);
assert.equal(PARTICIPATION_REFERENCE_SCORES.length,24);
assert.equal(APPROVED_MASS_INLINE_GABC.length,2);
assert.equal(new Set(PARTICIPATION_REFERENCE_SCORES.map(s=>s.id)).size,24);
assert.deepEqual(model.events.map(e=>e.id),PARTICIPATION_NEUME_POLICY.map(p=>p.id));
const corpus=await file("data/presentation/reader-text-sung.v1.json");
const speakers=await file("data/mass/ordinary-sung-speaker-audit.v1.json");
const sourceMap=new Map(corpus.blocks.flatMap(b=>b.units.map(u=>[u.cue_id,u])));
const speakerMap=new Map(speakers.records.map(u=>[u.cueId,u]));
const handled=new Set();
for(const event of model.events){
 assert.notEqual(event.reviewAction,"SOURCE_OWNER_NOT_DEFINED");
 assert.ok(event.reviewAction.length>=40);
 assert.ok(event.cueIds.length>=1);
 for(const cue of event.cueIds){
  assert.equal(handled.has(cue),false,"Duplicate participation cue "+cue);
  handled.add(cue);
  assert.ok(sourceMap.has(cue),"Canonical source text missing "+cue);
  const role=speakerMap.get(cue)?.role;
  assert.ok(event.kind==="CELEBRANT_INTONATION"?role==="PRIEST":
   event.kind==="DISMISSAL_PAIR"?["DISMISSAL_MINISTER","RESPONDERS"].includes(role):
   role==="RESPONDERS",event.id+" role unexpectedly changed");
  const original=sourceMap.get(cue);
  const p={kind:"TEXT",sourceCueIds:[cue],primary:original.latin??""};
  const opportunity=participationNeumeOpportunity({cueId:cue,form:"SOLEMN",paragraph:p});
  assert.equal(Boolean(opportunity),Boolean(original.latin),"Unresolved cue can't acquire note authority");
  assert.equal(participationNeumeOpportunity({cueId:cue,form:"LOW",paragraph:p}),null);
 }
 const researched=PARTICIPATION_REFERENCE_SCORES.filter(s=>
   s.sourceCueIds.every(c=>event.cueIds.includes(c)));
 assert.deepEqual(event.fixedResearchIds,researched.map(s=>s.id));
 assert.deepEqual(event.fixedResearchSourceIds,[...new Set(researched.map(s=>s.sourceId))]);
 assert.deepEqual(event.fixedResearchWitnesses,[...new Set(researched.map(s=>s.sourceUrl))]);
 const approved=APPROVED_MASS_INLINE_GABC.filter(s=>event.cueIds.includes(s.sourceCueId));
 assert.deepEqual(event.publicScoreIds,approved.map(s=>s.scoreId));
 for(const source of researched){
  assert.equal(source.publicScoreApproved,false,"Research excerpt unexpectedly approved: "+source.id);
  assert.ok(source.sourceUrl.startsWith("https://"));
 }
 if(event.state==="EXCLUDED_NON_SUNG_RESPONSE"){
  assert.equal(event.id,"GOSPEL_CONCLUSION");
  assert.equal(event.sungExclusion,"GOSPEL_END_LAUS_TIBI_CHRISTE_RESPONDED_NOT_SUNG");
  assert.equal(researched.length,0);
  assert.equal(approved.length,0);
  assert.equal(event.conditionalSources,null);
  const spoken={kind:"TEXT",sourceCueIds:["AO.SM.C0087"],primary:"℟. Laus tibi, Christe."};
  assert.equal(participationNeumeOpportunity({
   cueId:"AO.SM.C0087",form:"SOLEMN",paragraph:spoken
  }),null,"Spoken Gospel response must never be treated as a sung cue");
 }
 if(event.state!=="LIMITED_PUBLIC_EXACT_SETTING"){
  assert.equal(approved.length,0,"No silent public promotion");
 }
 if(event.state==="SOURCE_CUE_UNMAPPED"){
  assert.equal(researched.length,0);
  assert.equal(event.conditionalSources,null);
 }
 if(event.state==="DYNAMIC_SOURCE_BOUND_RESEARCH_ONLY"){
  assert.equal(researched.length,0,"Dynamic Amen is NOT a fixed score catalogue record");
  assert.equal(approved.length,0);
  assert.equal(event.conditionalSources.publicScoreApproved,false);
  assert.deepEqual(event.conditionalSources.variants,[
   "DEFAULT_FESTIVE","FERIAL_RECTO_TONO_TEXT_ONLY","EXPLICIT_OLD_SOLEMN"
  ]);
 }
}
assert.equal(handled.size,23);
assert.deepEqual(model.events.filter(x=>x.state==="SOURCE_CUE_UNMAPPED").map(x=>x.id),[
 "OFFERTORY_GREETING","DISMISSAL_GREETING"
]);
assert.deepEqual(model.events.filter(x=>x.state==="EXCLUDED_NON_SUNG_RESPONSE").map(x=>x.id),[
 "GOSPEL_CONCLUSION"
]);
assert.deepEqual(model.events.filter(x=>x.state==="DYNAMIC_SOURCE_BOUND_RESEARCH_ONLY").map(x=>x.id),[
 "COLLECT_AMEN","POSTCOMMUNION_AMEN"
]);
const dismissal=model.events.find(x=>x.id==="DISMISSAL_EXCHANGE");
assert.deepEqual(dismissal.publicScoreIds,["GREGOBASE-832-LEAD","GREGOBASE-832-RESPONSE"]);
assert.deepEqual(dismissal.fixedResearchSourceIds,[2901,823]);
for(const item of APPROVED_MASS_INLINE_GABC){
 assert.equal(item.approval,"USER_AND_MUSICAL_SOURCE_REVIEWED");
 assert.equal(item.publication,"PUBLIC_APPROVED");
 assert.equal(item.settingId,"ITE_VIII");
}
for(const id of ["AO.SM.C0087","AO.SM.C0107","AO.SM.C0258"]){
 const latin=sourceMap.get(id)?.latin;
 const paragraph={id,kind:"TEXT",sourceCueIds:[id],primary:latin??"℟. Laus tibi Christe."};
 const preview=participationReferenceScoresForParagraph({
  paragraph,paragraphs:[paragraph],form:"SOLEMN",
  resolvedMass:{schema:"ao-resolved-mass-v2"},
  selectedSettings:{GOSPEL_TONE:"GOSPEL_STANDARD",DISMISSAL:"ITE_VIII"}
 });
 assert.deepEqual(preview,[],"Unmapped cue must not borrow notes from neighboring dialogue "+id);
 const published=selectApprovedInlineScore({cueId:id,paragraph,form:"SOLEMN",settingId:"ITE_VIII"});
 assert.equal(published,null,"Unmapped cue must not become public by matching words");
}
const lowForm=buildParticipationCoverage();
assert.equal(lowForm.counts.exactPublicFragments,2,"Inventory is metadata, never a Low Mass score attachment");
console.log("PASS 20 audited events / 19 sung-eligible / 23 cues, 24 research excerpts, 2 Ite VIII public, 2 Proper-dynamic, 2 score gaps, Gospel conclusion spoken-only");
