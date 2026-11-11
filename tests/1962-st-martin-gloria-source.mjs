import assert from "node:assert/strict";
import {reconcile1962StMartinGloria} from "../src/mass/1962-st-martin-gloria-source.js";
import {prepareMassSessionFromV346} from "../src/mass/host-adapter.js";

const date="2026-11-11",id="sancti:11-11:3:w",path="Sancti/11-11";
const legacy=Object.freeze({
 date,calendarDay:{id,title:"St. Martin of Tours"},canStart:true,
 requestedCelebrationId:"mass_of_day",celebrationId:"mass_of_day",
 celebrationType:"CALENDAR",properSource:path,
 calendarRank:"III class",colour:"White",gloria:false,credo:false,
 conditions:[],insertedRites:[],sourceDiagnostics:{actualMassSelection:"CALENDAR"},
});
const data=Object.freeze({sourcePath:path,hasGloria:false,hasCredo:false,
 introit:{lat:"Státuit ei Dóminus testaméntum pacis"}});
const proper=Object.freeze({status:"READY",data});
const calendar=Object.freeze({
 date,status:"ready",
 day:{main:{id,rank:3,color:"White",title:"St. Martin of Tours"}},
 proper:{status:"ready",data:{sourcePath:path,hasGloria:false,hasCredo:false}},
});
const args=Object.freeze({legacy,proper,calendarResolution:calendar});
const matched=reconcile1962StMartinGloria(args);
assert.equal(matched.gloria,true);
assert.equal(matched.proper.data.hasGloria,true);
assert.equal(matched.proper.data.hasCredo,false);
assert.equal(matched.sourceDecision.principalId,id);
assert.equal(matched.sourceDecision.clause,"BR_237_C_AND_RGMR_431_A");
assert.equal(matched.sourceDecision.priorLegacyGloria,false);
assert.equal(matched.sourceDecision.priorProperGloria,false);
assert.equal(data.hasGloria,false,"Historic upstream witness must remain immutable");

const prepared=prepareMassSessionFromV346(legacy,{
 proper,calendarResolution:calendar,form:"MISSA_CANTATA_INCENSE",presentationMode:"LIVE"
});
assert.equal(prepared.resolvedMass.provenance.gloria,true);
assert.equal(prepared.resolvedMass.provenance.credo,false);
assert.equal(prepared.resolvedMass.proper.data.hasGloria,true);
assert.equal(prepared.resolvedMass.proper.data.hasCredo,false);
assert.equal(prepared.resolvedMass.provenance.gloriaSourceReconciliation.clause,
 "BR_237_C_AND_RGMR_431_A");
assert.equal(prepared.plan.blessingAllowed,true,"Ordinary feast is not Requiem");

const healthy=reconcile1962StMartinGloria({
 ...args,legacy:{...legacy,gloria:true},proper:{...proper,data:{...data,hasGloria:true}}
});
assert.equal(healthy.gloria,null,"Already accurate source needs no exception");
assert.equal(healthy.sourceDecision,null);

const misses=[
 ["different day",{legacy:{...legacy,date:"2026-11-12"}}],
 ["wrong calendar rank",{calendarResolution:{...calendar,day:{main:{...calendar.day.main,rank:4}}}}],
 ["wrong calendar colour",{calendarResolution:{...calendar,day:{main:{...calendar.day.main,color:"violet"}}}}],
 ["old calendar id",{legacy:{...legacy,calendarDay:{id:"sancti:11-10:3:w"}}}],
 ["unmatched proper",{proper:{...proper,data:{...data,sourcePath:"Sancti/11-10"}}}],
 ["stale calendar",{calendarResolution:{...calendar,date:"2026-11-10"}}],
 ["unverified calendar",{calendarResolution:{...calendar,status:"failed"}}],
 ["missing source",{calendarResolution:null}],
 ["votive selection",{legacy:{...legacy,celebrationId:"votive_sacred_heart",requestedCelebrationId:"votive_sacred_heart",celebrationType:"VOTIVE"}}],
 ["Requiem overlay",{overlays:["REQUIEM"]}],
 ["nuptial overlay",{overlays:["NUPTIAL"]}],
 ["different rite",{distinctRite:"GOOD_FRIDAY"}],
 ["observed external Mass",{legacy:{...legacy,sourceDiagnostics:{actualMassSelection:"OBSERVED_SOURCE_DAY"}}}],
 ["different principal",{calendarResolution:{...calendar,day:{main:{...calendar.day.main,id:"sancti:11-10:3:w"}}}}],
 ["unmatched original proper",{calendarResolution:{...calendar,proper:{status:"ready",data:{sourcePath:"Sancti/11-10"}}}}],
];
for(const [label,override] of misses){
 const r=reconcile1962StMartinGloria({...args,...override});
 assert.equal(r.gloria,null,label+": unrelated Mass must keep source flag unchanged");
 assert.equal(r.sourceDecision,null,label+": invalid source reconciliation was admitted");
}
const futureDate="2027-11-11";
const future=reconcile1962StMartinGloria({...args,legacy:{...legacy,date:futureDate},
 calendarResolution:{...calendar,date:futureDate}});
assert.equal(future.gloria,true,"Exact recurring St Martin feast must not expire after 2026");
console.log("PASS exact 1962 St Martin Gloria source reconciliation: 2026/2027, live session and 15 protected boundaries");
