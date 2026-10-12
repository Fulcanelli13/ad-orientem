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
console.log("PASS observed entrance controller: four forms, optional events, no forced posture or C0001 cue, and mass always starts");
