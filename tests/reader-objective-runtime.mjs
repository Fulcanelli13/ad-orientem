import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { makeResolvedMass, compileMassPlan } from "../src/mass/session-engine.js";
import { createPlanAwareObjectiveRuntime } from "../src/mass/reader-objective-runtime.js";

const graph=JSON.parse(readFileSync(new URL("../data/mass/mc-event-graph.v1.json",import.meta.url),"utf8"));
const events=graph.storage.eventFiles.flatMap(ref=>
  JSON.parse(readFileSync(new URL("../"+ref.path,import.meta.url),"utf8")).events
);

const text=(lat,en)=>({lat,en});
const proper=Object.freeze({
  hasGloria:true,
  hasCredo:true,
  sequence:text("Sequentia","Sequence"),
});

const lowResolved=makeResolvedMass({
  date:"2026-10-04",
  form:"LOW",
  presentationMode:"SIMPLE",
  calendarCelebration:{id:"TEMP.XIX",type:"CALENDAR"},
  proper,
  followingActions:["CORPUS_CHRISTI_PROCESSION"],
  provenance:{
    gloria:true,
    credo:true,
    faithfulCommunicantsPresent:true,
    chantSetting:"GREGORIAN",
    conditions:[],
  },
});
const lowPlan=compileMassPlan(lowResolved);
assert.equal(lowPlan.objectiveContext.form,"LOW");
assert.equal(lowPlan.objectiveContext.gloriaPresent,true);
assert.equal(lowPlan.objectiveContext.credoPresent,true);
assert.equal(lowPlan.objectiveContext.sequencePresent,true);
assert.equal(lowPlan.objectiveContext.blessingAllowed,false);
assert.equal(lowPlan.objectiveContext.normalLastGospel,false);

const lowRuntime=createPlanAwareObjectiveRuntime({
  events,
  prepared:{session:{resolvedMass:lowResolved,plan:lowPlan}},
});
assert.equal(lowRuntime.supported,true);
assert.equal(lowRuntime.owner,"R18_PLANNED_OBJECTIVE_TRAVERSAL");
assert.equal(lowRuntime.allows("MC-END-130"),false,"plan-disabled final blessing survived runtime traversal");
assert.equal(lowRuntime.allows("MC-END-150"),false,"plan-disabled Last Gospel preparation survived runtime traversal");
assert.equal(lowRuntime.allows("MC-COM-100"),true,"Pax Domini disappeared from Low plan unexpectedly");
assert.equal(lowRuntime.allows("MC-OFF-110"),false,"Solemn offertory incensation leaked into Low runtime");

const requiemProper={status:"READY",data:{
  hasGloria:false,hasCredo:false,sequence:{lat:"",en:""},
}};
const solemnResolved=makeResolvedMass({
  date:"2026-11-02",
  form:"SOLEMN",
  presentationMode:"SIMPLE",
  calendarCelebration:{id:"ALL_SOULS",type:"CALENDAR"},
  proper:requiemProper,
  overlays:["REQUIEM"],
  provenance:{
    gloria:false,
    credo:false,
    faithfulCommunicantsPresent:true,
    chantSetting:"GREGORIAN",
    conditions:[],
  },
});
const solemnPlan=compileMassPlan(solemnResolved);
assert.equal(solemnPlan.ordinaryPeacePrayerAllowed,false);
assert.equal(solemnPlan.formalSolemnPaxAllowed,false);
const solemnRuntime=createPlanAwareObjectiveRuntime({
  events,
  prepared:{session:{resolvedMass:solemnResolved,plan:solemnPlan}},
});
assert.equal(solemnRuntime.allows("MC-COM-100"),true,"Pax Domini was conflated with Requiem Pax suppression");
assert.equal(solemnRuntime.allows("MC-COM-150"),false,"private peace prayer survived plan suppression");
assert.equal(solemnRuntime.allows("MC-COM-160"),false,"ministerial Pax survived plan suppression");

const mcResolved=makeResolvedMass({
  date:"2026-10-04",
  form:"MISSA_CANTATA_INCENSE",
  presentationMode:"SIMPLE",
  calendarCelebration:{id:"TEMP.XIX",type:"CALENDAR"},
  proper,
});
const mcPlan=compileMassPlan(mcResolved);
const mcRuntime=createPlanAwareObjectiveRuntime({
  events,
  prepared:{session:{resolvedMass:mcResolved,plan:mcPlan}},
});
assert.equal(mcRuntime.supported,false);
assert.match(mcRuntime.reason,/NOT_APPLICABLE/);
assert.equal(mcRuntime.allows("MC-COM-100"),true,"non-objective Missa Cantata path was incorrectly filtered");

const frozenPax=events.find(x=>x.id==="MC-COM-160");
assert.deepEqual(frozenPax.conditions,["FORM_IS_SOLEMN"],"runtime plan mutated frozen canonical Pax event");

console.log("plan-aware objective runtime: PASS — Low/Solemn consume compiled Mass plan; source graph remains immutable.");
