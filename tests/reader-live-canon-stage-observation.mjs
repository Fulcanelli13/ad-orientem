import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createLiveCanonStageObservationController} from "../src/mass/reader-live-canon-stage-observation.js";

const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const reg=read("../data/presentation/reader-rubric-events.v1.json");
const mk=form=>createLiveCanonStageObservationController({registry:reg,form});
const host="AO.SM.C0174",chalice="AO.SM.C0181";
const obs=(cue,id,actor="PRIEST")=>({
 sourceCueId:cue,eventId:id,actor,observed:true,source:"EXPLICIT_OBSERVATION",
});
const ids={
 host:["AO.RUB.C0174.01","AO.RUB.C0174.02","AO.RUB.C0174.03",
   "AO.RUB.C0174.04","AO.RUB.C0174.05"],
 chalice:["AO.RUB.C0181.01","AO.RUB.C0181.02","AO.RUB.C0181.03",
   "AO.RUB.C0181.04","AO.RUB.C0181.05"],
};
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
 const c=mk(form);
 assert.deepEqual(c.expectedCueIds,[host,chalice]);
 assert.deepEqual(c.stageIds,[...ids.host,...ids.chalice]);
 assert.equal(c.snapshot().observedNow,false);
 assert.equal(c.snapshot().priestAction,null);
 assert.equal(c.snapshot().bell,null);
 assert.equal(c.observe(obs(host,ids.chalice[1])).accepted,false,
   "Chalice actions cannot leak into Host");
 assert.equal(c.observe({...obs(host,ids.host[0]),observed:false}).accepted,false,
   "Source cue/scroll never records action");
 assert.equal(c.observe({...obs(host,ids.host[0]),source:"READER_SCROLL"}).accepted,false,
   "Reader position never becomes priest event clock");
 assert.equal(c.observe({...obs(host,ids.host[0]),actor:"SERVER"}).accepted,false,
   "Stage actor must remain independently certified");
 const first=c.observe(obs(host,ids.host[0]));
 assert.equal(first.accepted,true);
 assert.equal(first.state.priestAction.label,"GENUFLECTS");
 assert.equal(first.state.priestAction.observedNow,true);
 assert.equal(first.state.bell,null);
 assert.equal(first.state.cinematic,null,
   "First genuflection is not the Host elevation");
 assert.equal(c.observe(obs(host,ids.host[0])).reason,"PRIEST_STAGES_NOT_CHRONOLOGICAL");
 const raised=c.observe(obs(host,ids.host[1]));
 assert.equal(raised.accepted,true);
 assert.equal(raised.state.priestAction.label,"ELEVATES HOST");
 assert.equal(raised.state.cinematic.kind,"ELEVATION");
 assert.equal(raised.state.cinematic.sourceRubricEventId,ids.host[1]);
 assert.equal(raised.state.cinematic.canonicalAuthority,false);
 assert.equal(raised.state.bell,null,
   "The priest's elevation never proves a bell was rung");
 const ringing=c.observe(obs(host,ids.host[2],"SERVER"));
 assert.equal(ringing.accepted,true);
 assert.equal(ringing.state.priestAction.id,ids.host[1],
   "A server bell never advances the priest stage");
 assert.equal(ringing.state.bell.actor,"SERVER");
 assert.equal(ringing.state.bell.id,ids.host[2]);
 assert.equal(ringing.state.bell.localPatternNotInferred,true);
 const replaced=c.observe(obs(host,ids.host[3]));
 assert.equal(replaced.state.priestAction.label,"REPLACES HOST");
 assert.equal(replaced.state.bell,null,"The bell cannot persist after replacing the Host");
 assert.equal(replaced.state.cinematic,null);
 assert.equal(c.observe(obs(host,ids.host[2],"SERVER")).reason,
   "BELL_OUTSIDE_ELEVATION_WINDOW");
 assert.equal(c.observe(obs(host,ids.host[1])).reason,
   "PRIEST_STAGES_NOT_CHRONOLOGICAL");
 const genuflect=c.observe(obs(host,ids.host[4]));
 assert.equal(genuflect.accepted,true);
 assert.equal(genuflect.state.priestAction.id,ids.host[4]);
 const settled=c.settleTransient();
 assert.equal(settled.priestAction,null);
 assert.equal(settled.bell,null);
 assert.equal(settled.lastPriestEventId,ids.host[4],
   "Visual expiry cannot fabricate a new stage or clear the audit index");
 assert.equal(c.observe(obs(chalice,ids.chalice[0])).reason,
   "CEREMONY_CHANGED_RESET_REQUIRED");
 c.reset();
 assert.equal(c.snapshot().lastPriestEventId,null);
 assert.equal(c.snapshot().cueId,null);
 // Bell can be witnessed independently without falsely asserting elevation.
 const bellOnly=c.observe(obs(chalice,ids.chalice[2],"SERVER"));
 assert.equal(bellOnly.accepted,true);
 assert.equal(bellOnly.state.priestAction,null);
 assert.equal(bellOnly.state.cinematic,null);
 assert.equal(bellOnly.state.bell.id,ids.chalice[2]);
 assert.equal(c.observe(obs(chalice,ids.host[2],"SERVER")).accepted,false);
 c.reset();
 const consecrated=c.observe(obs(chalice,ids.chalice[1]));
 assert.equal(consecrated.accepted,true,
   "An independently witnessed elevation need not imply first genuflection");
 assert.equal(consecrated.state.priestAction.id,ids.chalice[1]);
 assert.equal(consecrated.state.cinematic.subtitle,"PRECIOUS BLOOD");
 assert.equal(c.observe(obs(chalice,ids.chalice[0])).accepted,false,
   "Do not manufacture a prior genuflection retroactively");
 if(form==="SOLEMN"){
   assert.equal(c.observe(obs(chalice,ids.chalice[3])).reason,
     "SOLEMN_MIXED_ROLE_CHALICE_COVERING_UNRESOLVED",
     "Solemn priest must not inherit the deacon's possible pall action");
   assert.equal(c.observe(obs(chalice,ids.chalice[4])).accepted,true,
     "Second genuflection remains independently certified");
 }else{
   assert.equal(c.observe(obs(chalice,ids.chalice[3])).accepted,true);
   assert.equal(c.observe(obs(chalice,ids.chalice[4])).accepted,true);
 }
 assert.equal(c.snapshot().lastPriestEventId,ids.chalice[4]);
}
// Tampering an existing normative event or replacing it with a held R62 draft
// must not cause an automatic publication/observation.
for(const mutate of [
 row=>{row.actor="DEACON"},
 row=>{row.authorityClass="EDITORIAL_UNAPPROVED"},
 row=>{row.label="UNSOURCED ACTION"},
 row=>{row.order=7},
]){
 const bad=structuredClone(reg);
 mutate(bad.items.find(x=>x.id==="AO.RUB.C0174.02"));
 assert.throws(()=>createLiveCanonStageObservationController({registry:bad,form:"LOW"}),
   /Published Canon stage authority differs/);
}
assert.throws(()=>mk("REQUIEM"),/Unsupported Mass form/);
const native=readFileSync(new URL("../src/mass/reader-native-preview.js",import.meta.url),"utf8");
assert.match(native,/observeCanonCeremonyStage:observation=>/);
assert.match(native,/getObservedCanonCeremonyStage/);
assert.match(native,/clearObservedCanonCeremonyStage/);
assert.match(native,/observedCanon\?\.priestAction\?\?/);
assert.match(native,/observedCanon\?\.bell\?\?/);
assert.match(native,/observedCanon\?\.cinematic\?\?/);
assert.match(native,/clearCanonObservation\(\)/);
assert.match(native,/current\?\.curatedPresentationReview===true/);
assert.match(native,/form!=="LIVE"/);
assert.match(native,/correctSection/);
console.log("PASS LIVE 65: independent Host/Chalice priest-stage and server-bell observations, four Mass forms, explicit-source timing, fail-closed Solemn pall ownership, and expired transient state.");
