import assert from "node:assert/strict";
import {createObservedPriestEntranceController} from "../src/mass/reader-priest-entrance-observation.js";
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
 const ctl=createObservedPriestEntranceController({form});
 assert.equal(ctl.project().priestAction,null);
 assert.equal(ctl.project().cueId,null);
 assert.equal(ctl.project().faithfulPosture,null);
 assert.equal(ctl.beginMass().accepted,false);
 assert.equal(ctl.observeReverence({actor:"PRIEST",observed:true,kind:"SIMPLE_GENUFLECTION",blessedSacramentReserved:true}).accepted,false);
 assert.equal(ctl.observeArrival({actor:"PRIEST",observed:false,station:"FOOT_OF_ALTAR",headwearRemoved:true}).accepted,false);
 assert.equal(ctl.observeArrival({actor:"PRIEST",observed:true,station:"FOOT_OF_ALTAR",headwearRemoved:false}).accepted,true);
 assert.equal(ctl.project().priestAction,null,"arrival is not a genuflection");
 assert.equal(ctl.observeReverence({actor:"PRIEST",observed:true,kind:"SIMPLE_GENUFLECTION"}).accepted,false,"reservation flag must be observed");
 const kind=form==="LOW"?"PROFOUND_BOW":"SIMPLE_GENUFLECTION";
 const reserved=kind==="SIMPLE_GENUFLECTION";
 assert.equal(ctl.observeReverence({actor:"PRIEST",observed:true,kind,blessedSacramentReserved:reserved}).accepted,true);
 assert.equal(ctl.project().priestAction,kind);
 assert.equal(ctl.project().cueId,null);
 assert.equal(ctl.project().liturgicalRequirementCertified,false);
 assert.equal(ctl.beginMass().accepted,true);
 assert.equal(ctl.project().phase,"MASS_STARTED");
 assert.equal(ctl.observeArrival({actor:"PRIEST",observed:true,station:"FOOT_OF_ALTAR",headwearRemoved:false}).accepted,false);
 ctl.reset();
 assert.equal(ctl.project().sourceOwner,"PREMASS_UNOBSERVED_FAIL_CLOSED");
 assert.equal(ctl.project().priestAction,null);
}
assert.throws(()=>createObservedPriestEntranceController({form:"UNKNOWN"}));
console.log("PASS explicit pre-Mass reverence: 4 forms, no C0001 auto-trigger or inferred faithful posture");
