import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateGuideRegistry} from "../src/mass/reader-guide.js";
import {validateLowGuideResearch,lowGuideForActiveCue} from "../src/mass/reader-low-guide.js";
import {createReaderDomAdapter,normalizeReaderMoment} from "../src/mass/reader-dom.js";

const legacy=JSON.parse(readFileSync(new URL("../data/learn/research/mass-low-35-guide-legacy-index-20261016.v1.json",import.meta.url)));
const current=JSON.parse(readFileSync(new URL("../data/presentation/guide-registry.v1.json",import.meta.url)));
const corpus=JSON.parse(readFileSync(new URL("../data/presentation/reader-text-low.v1.json",import.meta.url)));
assert.equal(validateGuideRegistry(current),current);
assert.equal(validateLowGuideResearch(legacy),legacy);
assert.equal(Object.keys(current.entries).length,32);
const cues=new Set(corpus.blocks.flatMap(b=>b.units.map(u=>u.cue_id)));
const all=Object.values(legacy.entries);
const eligible=all.filter(e=>e.condition!=="ORDINARY_LOW_MASS_SEQUENCE_USE_READER_ACTUAL_CUE").map(e=>e.key);
const active=(cueId)=>({id:"CUE-"+cueId,sectionTitle:"Low Mass research",cardTitle:"Low Mass",
  activeSourceCueId:cueId,
  paragraphs:[{id:cueId,primary:"Fixture text only — from actual existing cue ID",sourceCueIds:[cueId],active:true}]});

assert.equal(all.length,35);
for(const entry of all){
  if(!entry.anchorCueCandidate)continue;
  assert(cues.has(entry.anchorCueCandidate));
  const guide=lowGuideForActiveCue(legacy,{
    massForm:"LOW_1962",activeCueId:entry.anchorCueCandidate,
    allowResearchPreview:true,applicableConditionalGuideIds:eligible,
  });
  assert.equal(guide?.key,entry.key,"source cue must select the existing research Guide");
  assert.equal(guide?.text,entry.short);
  assert.equal(guide.registryAvailable,false);
  assert.equal(guide.researchPreview,true);
  assert.equal(guide.releaseApproved,false);
  assert.equal(guide.detail,null);
  assert.equal(guide.scholaClock,null);
}
assert.equal(all.filter(e=>e.anchorCueCandidate).length,33);
assert.equal(all.filter(e=>!e.anchorCueCandidate).length,2);
assert.equal(lowGuideForActiveCue(legacy,{massForm:"LOW_1962",activeCueId:"AO.SM.C0001"}),null);
assert.equal(lowGuideForActiveCue(legacy,{massForm:"SOLEMN",activeCueId:"AO.SM.C0001",allowResearchPreview:true}),null);
assert.equal(lowGuideForActiveCue(legacy,{massForm:"LOW_1962",activeCueId:"FAKE",allowResearchPreview:true}),null);
for(const id of ["LOW.003","LOW.008","LOW.014","LOW.029","LOW.030","LOW.033","LOW.034","LOW.035"]){
 const e=legacy.entries[id];
 assert.equal(lowGuideForActiveCue(legacy,{
   massForm:"LOW_1962",activeCueId:e.anchorCueCandidate,allowResearchPreview:true,
 }),null,"conditional Guide leaked without applicability: "+id);
}
for(const id of ["LOW.001","LOW.028"]){
 assert.equal(lowGuideForActiveCue(legacy,{
   massForm:"LOW_1962",allowResearchPreview:true,selectedObservationalGuideId:id,
 }),null,"observational Guide appeared without explicit state");
 assert.equal(lowGuideForActiveCue(legacy,{
   massForm:"LOW_1962",allowResearchPreview:true,selectedObservationalGuideId:id,
   applicableConditionalGuideIds:[id],
 })?.key,id);
}
const root=()=>({innerHTML:"",querySelector(){return null;},querySelectorAll(){return [];},
  addEventListener(){},removeEventListener(){}});
const prepared=form=>({
 readerPreferences:{mode:"LIVE",language:"en"},
 session:{resolvedMass:{form,presentationMode:"LIVE",actualCelebration:{title:"Mass"}}},
});
const mount=(form,opts)=>{
 const a=createReaderDomAdapter({root:root(),...(opts||{})});
 a.mount(prepared(form));return a;
};
assert.throws(()=>createReaderDomAdapter({root:root(),lowGuideResearchPreview:{index:legacy}}),
  /explicit research-only/);
let adapter=mount("LOW",{lowGuideResearchPreview:{
 index:legacy,allowResearchPreview:true,applicableConditionalGuideIds:eligible,
}});
for(const e of all.filter(e=>e.anchorCueCandidate)){
 const got=adapter.renderMoment(active(e.anchorCueCandidate));
 assert.equal(got.guide?.text,e.short,"native Guide channel dropped "+e.key);
 assert.equal(got.guide?.researchPreview,true,"unapproved classification dropped "+e.key);
 assert.equal(got.guide?.sourceStatus,"UNAPPROVED_LOW_MASS_RESEARCH");
 assert.equal(got.guide?.detail,null);
}
const initial=adapter.renderMoment(active("AO.SM.C0001"));
assert.equal(initial.guide?.text,legacy.entries["LOW.002"].short);
const before=adapter.renderMoment(active("AO.SM.C0053"));
assert.equal(before.guide?.researchPreview,true);
adapter.destroy();
adapter=mount("LOW",{lowGuideResearchPreview:{index:legacy,allowResearchPreview:true}});
assert.equal(adapter.renderMoment(active("AO.SM.C0053")).guide,null,
 "Gloria was allowed despite missing applicability");
assert.equal(adapter.renderMoment(active("AO.SM.C0089")).guide,null,
 "Credo was allowed despite missing applicability");
assert.equal(adapter.renderMoment(active("AO.SM.C0001")).guide?.researchPreview,true);
adapter.destroy();
adapter=mount("MISSA_CANTATA_INCENSE",{lowGuideResearchPreview:{
 index:legacy,allowResearchPreview:true,applicableConditionalGuideIds:eligible,
}});
assert.equal(adapter.renderMoment(active("AO.SM.C0001")).guide,null,
 "Low research entered Sung Mass");
adapter.destroy();
adapter=mount("LOW");assert.equal(adapter.renderMoment(active("AO.SM.C0001")).guide,null,
 "Default public reader unexpectedly displayed unapproved research");adapter.destroy();
assert.equal(normalizeReaderMoment({guide:{registryAvailable:false,text:"NO"}}).guide,null);
assert.equal(Object.keys(current.entries).length,32);
console.log("PASS: 33/33 anchored Low Guides use real native drawer state only in explicit LOW research preview; 2 observed stages manual; conditional and Sung fail-closed; canonical 32 unchanged.");
