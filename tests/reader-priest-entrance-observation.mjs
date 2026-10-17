import assert from "node:assert/strict";
import {createObservedPriestEntranceController, projectObservedPreMassPriestAction} from "../src/mass/reader-priest-entrance-observation.js";

for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
  const controller=createObservedPriestEntranceController({form});
  assert.equal(controller.project().phase,"UNOBSERVED");
  assert.equal(controller.project().priestAction,null);
  assert.equal(controller.project().faithfulPosture,null);
  assert.equal(controller.project().cueId,null);
  assert.equal(controller.project().liturgicalRequirementCertified,false);
  assert.equal(controller.observeArrival({actor:"SCHOLA",observed:true,station:"FOOT_OF_ALTAR"}).accepted,false);
  assert.equal(controller.observeArrival({actor:"PRIEST",observed:false,station:"FOOT_OF_ALTAR"}).accepted,false);
  assert.equal(controller.observeReverence({actor:"PRIEST",observed:false,kind:"SIMPLE_GENUFLECTION"}).accepted,false);

  // The celebrant may have entered without the observer seeing the entrance.
  assert.equal(controller.observeReverence({actor:"PRIEST",observed:true,kind:"SIMPLE_GENUFLECTION"}).accepted,true);
  assert.equal(controller.project().reverence.blessedSacramentReserved,null);
  assert.equal(controller.project().priestAction,"SIMPLE_GENUFLECTION");
  const observedProjected=projectObservedPreMassPriestAction({state:controller.project(),activeCueId:null});
  assert.equal(observedProjected.label,"GENUFLECTS");
  assert.equal(observedProjected.iconKey,"genuflect");
  assert.equal(observedProjected.cueId,null);
  assert.equal(observedProjected.owner,"OBSERVED_PREMASS_PRIEST");
  assert.equal(projectObservedPreMassPriestAction({state:controller.project(),preMassVisualWindowOpen:false}),null,
    "pre-Mass action reappeared after first native cue was already seen");
  assert.equal(projectObservedPreMassPriestAction({state:controller.project(),activeCueId:"AO.SM.C0001"}),null,
    "priest entrance gesture incorrectly continued at In nomine");

  assert.equal(controller.project().arrived,false,"unobserved entrance must never be implied");
  assert.equal(controller.observeArrival({actor:"PRIEST",observed:true,station:"FOOT_OF_ALTAR"}).accepted,true);
  assert.equal(controller.project().arrived,true);
  assert.equal(controller.project().arrival.headwearRemoved,null,"do not guess about a biretta");
  assert.equal(controller.project().faithfulPosture,null);
  assert.equal(controller.observeReverence({actor:"PRIEST",observed:true,kind:"PROFOUND_BOW"}).accepted,false,
    "duplicated reverence must not create a second event");
  assert.equal(controller.beginMass().accepted,true);
  assert.equal(controller.project().phase,"MASS_STARTED");
  assert.equal(controller.project().priestAction,null,"pretext action leaked into the Mass prayer cue");
  assert.equal(projectObservedPreMassPriestAction({state:controller.project(),activeCueId:null}),null,
    "Mass-started controller leaked old genuflection");
  assert.equal(controller.project().arrival.station,"FOOT_OF_ALTAR");
  assert.equal(controller.project().reverence.kind,"SIMPLE_GENUFLECTION");
  assert.equal(controller.observeReverence({actor:"PRIEST",observed:true,kind:"PROFOUND_BOW"}).accepted,false);
  assert.equal(controller.observeArrival({actor:"PRIEST",observed:true,station:"FOOT_OF_ALTAR"}).accepted,false);
  assert.equal(controller.beginMass().alreadyStarted,true);

  // Missing ritual observations never become a gate to celebrating or reading Mass.
  controller.reset();
  assert.equal(controller.project().sourceOwner,"PREMASS_UNOBSERVED_FAIL_CLOSED");
  assert.equal(controller.beginMass().accepted,true,"unobserved priest reverence wrongly blocks Mass");
  assert.equal(controller.project().priestAction,null);
  assert.equal(controller.project().observed,false);

  controller.reset();
  const arrival=controller.observeArrival({actor:"PRIEST",observed:true,
    station:"FOOT_OF_ALTAR",headwearRemoved:false});
  assert.equal(arrival.accepted,true);
  assert.equal(controller.project().priestAction,null);
  const reverence=controller.observeReverence({actor:"PRIEST",observed:true,
    kind:"PROFOUND_BOW",blessedSacramentReserved:false});
  assert.equal(reverence.accepted,true);
  assert.equal(controller.project().reverence.blessedSacramentReserved,false);
  assert.equal(controller.project().priestAction,"PROFOUND_BOW");
  assert.equal(projectObservedPreMassPriestAction({state:controller.project()}).iconKey,"priest_profound_bow_rich");
  controller.reset();
  assert.equal(controller.project().arrival,null);
  assert.equal(controller.project().reverence,null);
}
assert.throws(()=>createObservedPriestEntranceController({form:"UNKNOWN"}),/Supported 1962/);

import {createObservedChalicePreparationController} from "../src/mass/reader-priest-chalice-observation.js";

// Source-backed Missal guidance is NOT proof of a performed movement.
// Human reports must explicitly identify actor, object, action and whether
// the action occurred before/during Deus, qui humanae (Ritus VII.4, VII.9).
const standard={actualCelebration:{id:"selected",type:"CALENDAR"},overlays:[]};
const reported=(action,actor,object,phase)=>({
  action,actor,object,phase,observed:true,source:"EXPLICIT_OBSERVATION"
});
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
  for(const requiem of [false,true]){
    const selection={...standard,form,
      ...(requiem?{overlays:["REQUIEM"]}:{})};
    const controller=createObservedChalicePreparationController({resolvedMass:selection});
    assert.equal(controller.project().supported,true);
    assert.equal(controller.project().observations.length,0);
    assert.equal(controller.project().latest,null);
    assert.equal(controller.project().sourceOwner,"CHALICE_UNOBSERVED_FAIL_CLOSED");
    assert.equal(controller.project().cueId,null);
    assert.equal(controller.project().priestAction,null);
    assert.equal(controller.project().faithfulPosture,null);
    const solemn=form==="SOLEMN";
    const wine=reported("WINE_POURED",solemn?"DEACON":"PRIEST","WINE","BEFORE_PRAYER");
    assert.equal(controller.observe({...wine,observed:false}).accepted,false,
      "Text/cursor must not impersonate a reported observation");
    assert.equal(controller.observe({...wine,source:"SCROLL"}).accepted,false);
    assert.equal(controller.observe({...wine,actor:"SCHOLA"}).accepted,false);
    assert.equal(controller.observe({...wine,object:"WATER"}).accepted,false);
    assert.equal(controller.observe({...wine,phase:"DURING_PRAYER"}).accepted,false);
    assert.equal(controller.project().latest,null);
    assert.equal(controller.observe(wine).accepted,true);
    assert.equal(controller.observe(wine).reason,"ACTION_ALREADY_REPORTED");
    const water=reported("WATER_ADDED",solemn?"SUBDEACON":"PRIEST",
      "WATER","DURING_PRAYER");
    if(solemn){
      assert.equal(controller.observe(reported("WATER_PRESENTED","SUBDEACON",
        "WATER","DURING_PRAYER")).accepted,true);
      assert.equal(controller.observe(reported("WATER_PRESENTED","PRIEST",
        "WATER","DURING_PRAYER")).accepted,false);
    }else{
      assert.equal(controller.observe(reported("WATER_PRESENTED","SUBDEACON",
        "WATER","DURING_PRAYER")).accepted,false);
    }
    assert.equal(controller.observe(reported("WATER_BLESSED","DEACON",
      "WATER","DURING_PRAYER")).accepted,false);
    const blessing=reported("WATER_BLESSED","PRIEST","WATER","DURING_PRAYER");
    assert.equal(controller.observe(blessing).accepted,!requiem,
      "Requiem must not assert a water blessing");
    assert.equal(controller.observe(water).accepted,true);
    const state=controller.project();
    assert.equal(state.latest.action,"WATER_ADDED");
    assert.equal(state.priestAction,null,"Observation must not assert ongoing priest gesture");
    assert.equal(state.cinematic,null,"No timed or scroll-derived cinematic");
    assert.equal(state.automatedIconAllowed,false);
    assert.ok(state.observations.every(x=>x.canonicalCueId===null&&
      x.observationStatus==="REPORTED_NOT_PHYSICALLY_VERIFIED"));
    assert.equal(state.observations.length,solemn?(requiem?3:4):(requiem?2:3));
    const priorState=state;
    controller.reset();
    assert.equal(controller.project().observations.length,0);
    assert.equal(priorState.observations.length,solemn?(requiem?3:4):(requiem?2:3),
      "Older immutable observer snapshot changed on reset");
    assert.equal(controller.observe(water).accepted,true,
      "A late first witness is valid even if wine was not witnessed");
    controller.close();
    assert.equal(controller.project().observations.length,0);
    assert.equal(controller.observe(wine).reason,"CLOSED");
  }
}
assert.equal(createObservedChalicePreparationController().observe(
  reported("WINE_POURED","PRIEST","WINE","BEFORE_PRAYER")
).reason,"MASS_SELECTION_UNRESOLVED");
assert.equal(createObservedChalicePreparationController({resolvedMass:{
  form:"UNKNOWN",actualCelebration:{id:"unknown"}
}}).project().supported,false);

console.log("PASS observed entrance controller: four forms, optional events, no forced posture or C0001 cue, and mass always starts");
