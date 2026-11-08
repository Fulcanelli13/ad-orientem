import assert from "node:assert/strict";
import {NOV09_THEODORE_SOURCE,verify1962Nov09TheodoreSource}
 from "../src/mass/1962-nov09-theodore-commemoration.js";
import {properToReaderSlots} from "../src/mass/proper-reader-slots.js";
// Pure isolated witness: the resolver owns the real oration text.
// This fixture tests the independently pinned source identities, Latin
// incipits, reader group boundaries and mutation failures. It does NOT
// replace or synthesize any real 1962 Mass text.
const DATE="2026-11-09",PATH="Sancti/11-09";
const GROUPS=[["collects","COLLECT_SET"],["secrets","SECRET_SET"],
 ["postcommunions","POSTCOMMUNION_SET"]];
const day={status:"ready",date:DATE,
 day:{main:{id:"sancti:11-09:2:w",path:PATH,rank:2},
 commemorations:[{id:"sancti:11-09cc:4:r",path:"Sancti/11-09cc",rank:4}]}};
const full=(value)=>Object.freeze({
 lat:value,en:"The prayer of blessed Theodore and the altar of the Lord, by whose intercession we are helped.",
 fr:"La prière du bienheureux Théodore et l'autel du Seigneur, par l'intercession duquel nous sommes soutenus."
});
const principal=(key)=>full("Principal "+key+
 ": genuine Latin text must come from the original 1962 Proper resolver.");
const comm=(key)=>full(NOV09_THEODORE_SOURCE.expectedIncipits[key]+
 ": source witness for test only, not intended for the actual reader.");
const data={sourcePath:PATH,
 commemorationFormDecision:Object.freeze({
  status:"CERTIFIED",scope:"NON_SUNDAY_II_III_CLASS_SINGLE_IV_CLASS_SANCTORAL_COMMEMORATION",
  mainId:"sancti:11-09:2:w",commemorationId:"sancti:11-09cc:4:r",
  calendarCount:1,appliedCount:1,form:"LOW"
 })};
for(const [field] of GROUPS)data[field]=Object.freeze([
 principal(field),comm(field)
]);
const proper=Object.freeze({data:Object.freeze(data)});
const run=(opts={})=>verify1962Nov09TheodoreSource({
 proper,date:DATE,form:"LOW",calendarResolution:day,...opts
});
const verified=run();
assert.equal(verified.status,"CERTIFIED");
assert.equal(verified.proper,proper,
 "Original canonical source must remain physically unchanged");
assert.equal(verified.decision.originalSourceUnchanged,true);
assert.equal(verified.decision.instituteProPapaNotIncluded,true);
assert.deepEqual(verified.decision.groups,
 {collects:2,secrets:2,postcommunions:2});
assert.match(NOV09_THEODORE_SOURCE.expectedIncipits.collects,
 /^Deus, qui nos beáti Theodóri/);
assert.match(NOV09_THEODORE_SOURCE.expectedIncipits.secrets,
 /^Súscipe, Dómine, fidélium preces/);
assert.match(NOV09_THEODORE_SOURCE.expectedIncipits.postcommunions,
 /^Præsta nobis, quǽsumus, Dómine/);
assert.doesNotMatch(NOV09_THEODORE_SOURCE.expectedIncipits.postcommunions,
 /^Súscipe, Dómine/,"Reject ICRSP article's duplicated Latin Secret");
for(const lng of ["en","fr"]){
 const slots=properToReaderSlots(proper.data,{language:lng});
 assert.equal(slots.ready,false,"This is a partial fixture, not a full Mass");
 for(const [,slot] of GROUPS){
  assert.equal(slots.slots[slot].status,"READY",lng+" "+slot);
  assert.deepEqual([...new Set(slots.slots[slot].data.paragraphs.map(x=>
   x.orationGroupIndex).filter(Number.isInteger))],[1,2]);
 }
}
for(const field of GROUPS.map(x=>x[0])){
 const bad={...data,[field]:[data[field][0]]};
 assert.equal(run({proper:{data:bad}}).reason,
  "THEODORE_TWO_COMPLETE_ORATIONS_REQUIRED_"+field);
 const latin={...data[field][1],lat:"Súscipe, Dómine, incorrect borrowed prayer."};
 assert.equal(run({proper:{data:{...data,
  [field]:[data[field][0],latin]}}}).reason,
  "THEODORE_LATIN_SOURCE_CHANGED_"+field);
 const noFrench={...data[field][1],fr:""};
 assert.equal(run({proper:{data:{...data,
  [field]:[data[field][0],noFrench]}}}).reason,
  "THEODORE_TWO_COMPLETE_ORATIONS_REQUIRED_"+field);
}
const sungData={...data,
 commemorationFormDecision:{...data.commemorationFormDecision,
  appliedCount:0,form:"MISSA_CANTATA_SIMPLE"}};
for(const key of GROUPS.map(x=>x[0]))
 sungData[key]=[data[key][0]];
const sung={data:sungData};
assert.deepEqual([run({proper:sung,form:"MISSA_CANTATA_SIMPLE"}).status,
 run({proper:sung,form:"MISSA_CANTATA_SIMPLE"}).proper===sung],
 ["OMITTED_BY_1962_RUBRIC",true]);
for(const overrides of [
 {date:"2026-11-10"},{celebrationId:"votive"},{observedSource:true},
 {isConventual:true}
])assert.deepEqual([run(overrides).status,run(overrides).proper===proper],
 ["NOT_APPLICABLE",true]);
assert.equal(run({calendarResolution:{...day,day:{
 ...day.day,main:{...day.day.main,path:"Sancti/11-09x"}}}}).status,
 "UNVERIFIED");
assert.equal(run({proper:{data:{...data,
 commemorationFormDecision:{...data.commemorationFormDecision,
  status:"UNVERIFIED"}}}}).reason,
 "SOURCE_1962_THEODORE_FORM_DECISION_UNVERIFIED");
console.log("PASS 1962 Nov 9 original source VERIFIED not duplicated: "+
 "St Theodore Low has two complete Collects, Secrets and Postcommunions; "+
 "nonconventual Sung has one; corrupt/missing Latin/FR/universal identities rejected.");
