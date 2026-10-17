import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createObservedChalicePreparationController} from "../src/mass/reader-priest-chalice-observation.js";

const read=name=>JSON.parse(readFileSync(new URL("../data/"+name,import.meta.url),"utf8"));
const corpus=read("presentation/reader-text-sung.v1.json");
const minister=read("mass/ritus-1962-solemn-ministers-batch02.v1.json");
const earlier=read("mass/ritus-1962-verified-ceremonial-batch01.v1.json");
const cues=new Map(corpus.blocks.flatMap(b=>(b.units||[]).filter(u=>/^AO\.SM\.C\d{4}$/.test(u.cue_id)).map(u=>[u.cue_id,{macro:b.Macro_ID,latin:u.latin,branch:b.Branch_Status}])));
const ev=minister.events;
const get=id=>ev.find(e=>e.id==="MR62.SOL.B02."+id);

assert.equal(cues.size,279);
assert.equal(ev.length,68);
assert.equal(earlier.events.length,46);
assert.equal(minister.invariants.noRuntimeImport,true);
assert.equal(minister.invariants.preserveLIVE48,true);
assert.equal(minister.invariants.faithfulPostureUnchanged,true);
assert.equal(minister.sourceIdentity.massProfile,"SOLEMN");
assert.equal(minister.sourceIdentity.notApplicableToMissaCantata,true);
assert.equal(minister.authority.originalMissalLatinReview,"PENDING");

const ids=new Set();
const actors=new Set(["PRIEST","DEACON","SUBDEACON","ACOLYTES","THURIFER"]);
const anchors=new Set(["NEAR_CUE","BEFORE_CUE","AFTER_CUE","EXACT_CUE","WITHIN_TEXT_CUE","VISIBLE_STATE","BRANCH_ONLY_RITE_EVENT"]);
for(const e of ev){
  assert(!ids.has(e.id),"duplicate event "+e.id); ids.add(e.id);
  assert(actors.has(e.actor),e.id+" has invalid actor");
  assert(anchors.has(e.anchorType),e.id+" has invalid anchor type");
  assert.equal(e.formScope,"SOLEMN");
  assert.equal(e.latinFacsimileReviewed,false);
  assert.equal(e.runtimeCertified,false);
  assert.ok(e.condition && e.ritus && e.sourceUrl && e.shortRubricFr,e.id+" missing evidence/condition");
  assert.ok(e.sourceUrl.includes("ritus-servandus-translated-english/download/#page="),e.id+" missing primary PDF page");
  if(e.cueId)assert(cues.has(e.cueId),e.id+" loses source cue");
  else{
    assert.equal(e.anchorType,"BRANCH_ONLY_RITE_EVENT","missing cue but not branch event "+e.id);
    assert(e.branchMoment,e.id+" missing explicit stage");
  }
}
assert.equal(ev.filter(e=>e.actor==="DEACON").length,32);
assert.equal(ev.filter(e=>e.actor==="SUBDEACON").length,23);
assert.equal(ev.filter(e=>e.actor==="ACOLYTES").length,5);
assert.equal(ev.filter(e=>e.actor==="PRIEST").length,4);
assert.equal(ev.filter(e=>e.actor==="THURIFER").length,4);
assert.equal(ev.filter(e=>e.condition==="REQUIEM").length,12);

assert.equal(get("049").cueId,"AO.SM.C0209");
assert.match(cues.get(get("049").cueId).latin.normalize("NFD").replace(/\p{M}/gu,""),/dimitte nobis debita nostra/i,
  "Pater movement must trigger INSIDE the Pater text, not at block opening");
assert.equal(get("049").anchorType,"WITHIN_TEXT_CUE");
assert.equal(get("024").actionKey,"HOLD_PATEN_BEHIND_CELEBRANT_UNTIL_PATERNOSTER");
assert.equal(get("024").condition,"NOT_REQUIEM");
assert.equal(get("025").condition,"REQUIEM");
assert.equal(get("050").cueId,"AO.SM.C0209");
assert.equal(get("050").anchorType,"WITHIN_TEXT_CUE");
assert.equal(minister.reviewGates[0].status,"OPEN");

for(const id of ["003","006","007","008","010","011","012","023","024","030","032","040","045","046","050","051","054","055","056"])
 assert.equal(get(id).condition==="REQUIEM",false,id+" incorrectly enabled in Requiem");
for(const id of ["025","031","033","047","048","057","063","064","065","066","067"])
 assert.equal(get(id).condition,"REQUIEM",id+" has no Requiem guard");
for(const id of ["057","063"]){
 assert.equal(get(id).cueId,null,id+" attached to suppressed text");
 assert.equal(get(id).anchorType,"BRANCH_ONLY_RITE_EVENT");
}
assert.equal(get("065").actor,"ACOLYTES","Requiem Gospel book is supported by two acolytes (Ritus XIII.2)");
assert.equal(get("017").actor,"DEACON");
assert.equal(get("017").anchorType,"BEFORE_CUE","Wine pouring occurs before Deus qui humanae");
assert.equal(get("018").condition,"NOT_REQUIEM","Requiem Benedicite remains unresolved");
assert.equal(get("019").actor,"PRIEST");
assert.equal(get("019").condition,"NOT_REQUIEM","Water blessing excluded in Requiem");
assert.equal(get("020").actor,"PRIEST","Omission of blessing belongs to the priest, not the water-pour actor");
assert.match(get("020").shortRubricFr,/sous-diacre la verse/,"Requiem description must preserve the subdeacon's water role");
assert.equal(get("021").actor,"DEACON","Latin VII.9 assigns chalice/arm support to the deacon");
assert.equal(get("068").actor,"SUBDEACON","Latin VII.9 assigns actual water-pour to the subdeacon");
assert.equal(get("068").actionKey,"POUR_WATER_INTO_CHALICE");
assert.equal(get("068").condition,"ALL","Subdeacon still adds water at Solemn Requiem");
assert.equal(get("068").cueId,"AO.SM.C0112");
assert.equal(get("068").anchorType,"WITHIN_TEXT_CUE");
assert.equal(minister.authority.originalMissalLatinReview,"PENDING","Text crosscheck cannot imply printed 1962 facsimile certification");
assert.equal(get("068").runtimeCertified,false,"Reading C0112 cannot clock the actual physical water-pour");
assert.equal(minister.reviewGates.at(-1).status,"OPEN");
assert.equal(get("062").cueId,null,"Oratio super populum branch cannot fabricate an ordinary source cue");
assert.equal(get("061").condition,"ITE_MISSA_EST");
assert.equal(get("061").actor,"DEACON");
assert.equal(get("020").condition,"REQUIEM");
assert.equal(get("019").condition,"NOT_REQUIEM");

// Batch A ownership bridge. 22 Offertory research records do not become
// 22 new R18 rail tiles: SMIN-009 already covers broad C0120–C0124.
const formState=read("presentation/reader-form-state.v1.json");
assert.equal(formState.solemn.ministerEvents.length,19,"R18 released minister-state denominator must not drift");
const off=ev.filter(x=>/^MR62\.SOL\.B02\.(?:0(?:1[4-9]|2[0-9]|3[0-4])|068)$/.test(x.id));
assert.equal(off.length,22,"Offertory research crosswalk 014–034 plus 068");
assert(off.every(x=>x.runtimeCertified===false),"Do not auto-promote Offertory research");
assert(off.every(x=>x.latinFacsimileReviewed===false),"Latin transcription crosscheck is not 1962 printed facsimile approval");
assert.equal(formState.solemn.ministerEvents.some(x=>x.cue==="AO.SM.C0112"),false,
  "The prayer cue is not an independently observed minister clock");
const incense=formState.solemn.ministerEvents.find(x=>x.id==="SMIN-009");
assert.deepEqual(incense.cueRange,["AO.SM.C0120","AO.SM.C0124"],
  "Retain broad certified incensation instead of duplicate microtiles");
const solemnRequiemObservation=createObservedChalicePreparationController({
  resolvedMass:{form:"SOLEMN",actualCelebration:{type:"REQUIEM"},overlays:["REQUIEM"]}
});
const reported=(action,actor,object,phase)=>({action,actor,object,phase,observed:true,source:"EXPLICIT_OBSERVATION"});
assert.equal(solemnRequiemObservation.observe(
  reported("WINE_POURED","DEACON","WINE","BEFORE_PRAYER")).accepted,true);
assert.equal(solemnRequiemObservation.observe(
  reported("WATER_PRESENTED","SUBDEACON","WATER","DURING_PRAYER")).accepted,true);
assert.equal(solemnRequiemObservation.observe(
  reported("WATER_ADDED","SUBDEACON","WATER","DURING_PRAYER")).accepted,true);
assert.equal(solemnRequiemObservation.observe(
  reported("WATER_BLESSED","PRIEST","WATER","DURING_PRAYER")).accepted,false,
  "No water blessing in Solemn Requiem");
const observed=solemnRequiemObservation.project();
assert.equal(observed.observationAuthority,"EXPLICIT_HUMAN_REPORT_NOT_SENSOR_VERIFIED");
assert.equal(observed.priestAction,null);
assert.equal(observed.sacredMinister,null);
assert.equal(observed.cueId,null);
assert.equal(observed.cinematic,null);
assert.equal(observed.automatedIconAllowed,false);

console.log("PASS 1962 Solemn-minister research QA: 68 research actions, actor and water-pour correction, 12 Requiem exceptions, no live event promotion.");
