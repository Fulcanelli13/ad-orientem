import assert from "node:assert/strict";
import {findObservedMassSource,composeObservedMassSelection} from "../src/mass/observed-mass-source.js";
import {adaptV346ResolvedMass} from "../src/mass/host-adapter.js";
import {properToReaderSlots} from "../src/mass/proper-reader-slots.js";

const tr=(label)=>({lat:label+" Latin",en:label+" English",fr:label+" Français"});
const proper=(path,label,commem=false)=>({
 status:"ready",sourcePath:path,data:{
  sourcePath:path,name:label,
  introit:tr(label+" Introit"),
  collects:[tr(label+" Collect"),...(commem?[tr("wrong source-day commemoration")]:[])],
  epistle:tr(label+" Epistle"),gradual:tr(label+" Gradual"),gospel:tr(label+" Gospel"),
  offertory:tr(label+" Offertory"),secrets:[tr(label+" Secret"),...(commem?[tr("wrong source-day secret")]:[])],
  preface:tr(label+" Preface"),communion:tr(label+" Communion"),
  postcommunions:[tr(label+" Postcommunion"),...(commem?[tr("wrong source-day post")]:[])],
  calendarCommemorations:commem?[{sourcePath:"Sancti/Wrong"}]:[],
  hasGloria:true,hasCredo:true,
 }});
const sources=new Map([
 ["2026-10-04",{status:"ready",date:"2026-10-04",day:{main:{title:"XIX Sunday",rank:2}},proper:proper("Tempora/Pent19-0","XIX Sunday")}],
 ["2026-10-07",{status:"ready",date:"2026-10-07",day:{main:{title:"Our Lady of the Rosary",rank:2}},proper:proper("Sancti/10-07","Rosary",true)}],
 ["2027-10-03",{status:"ready",date:"2027-10-03",day:{main:{title:"Sunday",rank:2}},proper:proper("Tempora/Pent16-0","Sunday")}],
 ["2027-10-07",{status:"ready",date:"2027-10-07",day:{main:{title:"Our Lady of the Rosary",rank:2}},proper:proper("Sancti/10-07","Rosary",true)}],
 ["2026-11-05",{status:"ready",date:"2026-11-05",day:{main:{title:"Ordinary feria",rank:4}},proper:proper("Tempora/Pent23-4","Feria")}],
 ["2026-11-12",{status:"ready",date:"2026-11-12",day:{main:{title:"Saint",rank:3}},proper:proper("Sancti/11-12","Saint")}],
 ["2026-11-13",{status:"failed",date:"2026-11-13",proper:null}],
]);
const resolveDay=async date=>sources.get(date)??{status:"unavailable"};
const base=date=>({
 date,canStart:true,calendarDay:{id:"tempora",title:"Mass of the day",rank:2},
 celebrationId:"mass_of_day",requestedCelebrationId:"mass_of_day",
 celebrationType:"CALENDAR",properSource:sources.get(date)?.proper?.sourcePath??null,
 insertedRites:["ASPERGES"],gloria:false,credo:false,
});
const first=await findObservedMassSource({
 massDate:"2026-10-04",sourceDate:"2026-10-07",resolveDay,language:"fr",
});
assert.equal(first.sourcePath,"Sancti/10-07");
assert.equal(first.title,"Our Lady of the Rosary");
assert.equal(first.proper.data.collects.length,1,"Source-date commemoration must not leak");
assert.equal(first.properLanguage,"fr");
assert.equal(first.permissionStatus,"NOT_INDEPENDENTLY_VERIFIED");
await assert.rejects(()=>findObservedMassSource({
 massDate:"2026-10-04",sourceDate:"2026-10-04",resolveDay,
}),/USE_DAY_MASS_INSTEAD/);
await assert.rejects(()=>findObservedMassSource({
 massDate:"2026-11-05",sourceDate:"2026-11-13",resolveDay,
}),/SOURCE_DAY_NOT_READY/);

await assert.rejects(()=>composeObservedMassSelection(first,{
 baseLegacy:base("2026-10-04"),resolveDay,language:"fr",
}),/SUNDAY_COMMEMORATION_UNDECIDED/);
const rosary=await composeObservedMassSelection(first,{
 baseLegacy:base("2026-10-04"),resolveDay,
 sundayChoice:"COMMEMORATE_SUNDAY",language:"fr",
});
assert.equal(rosary.massDate,"2026-10-04");
assert.equal(rosary.sourceDate,"2026-10-07");
assert.equal(rosary.legacy.date,"2026-10-04","Real Mass date was replaced by feast date");
assert.equal(rosary.legacy.calendarDay.title,"Mass of the day","Calendar identity was mutated");
assert.equal(rosary.legacy.celebrationType,"VOTIVE");
assert.equal(rosary.legacy.celebrationTitle,"Our Lady of the Rosary");
assert.equal(rosary.legacy.properSource,"Sancti/10-07");
assert.equal(rosary.legacy.sourceDiagnostics.independentRubricPermission,"NOT_VERIFIED");
assert.equal(rosary.proper.data.collects.length,2,"Sunday Collect not composed");
assert.equal(rosary.proper.data.secrets.length,2,"Sunday Secret not composed");
assert.equal(rosary.proper.data.postcommunions.length,2,"Sunday Postcommunion not composed");
assert.equal(rosary.proper.data.collects[0].lat,"Rosary Collect Latin");
assert.equal(rosary.proper.data.collects[1].lat,"XIX Sunday Collect Latin");
assert.equal(rosary.proper.data.calendarCommemorations.length,1);
assert.equal(rosary.proper.data.calendarCommemorations[0].sourcePath,"Tempora/Pent19-0");
assert.ok(!JSON.stringify(rosary.proper).includes("wrong source-day"),"Foreign feast-date commemoration leaked");
assert.equal(properToReaderSlots(rosary.proper.data,{language:"fr"}).ready,true);
const r17=adaptV346ResolvedMass(rosary.legacy,{proper:rosary.proper,form:"SOLEMN"});
assert.equal(r17.date,"2026-10-04");
assert.equal(r17.actualCelebration.id,"source_date_2026_10_07");
assert.equal(r17.proper.data.collects.length,2);
assert.equal(r17.provenance.properSource,"Sancti/10-07");
assert.deepEqual(r17.provenance.insertedRites,[],"Old calendar ceremonies leaked");
assert.equal(r17.provenance.votiveClass,null,"Unverified class must not be invented");
const noCommem=await composeObservedMassSelection(first,{
 baseLegacy:base("2026-10-04"),resolveDay,
 sundayChoice:"NO_SUNDAY_COMMEMORATION",language:"fr",
});
assert.equal(noCommem.proper.data.collects.length,1);
const followingYear=await findObservedMassSource({
 massDate:"2027-10-03",sourceDate:"2027-10-07",resolveDay,language:"en",
});
const later=await composeObservedMassSelection(followingYear,{
 baseLegacy:base("2027-10-03"),resolveDay,
 sundayChoice:"COMMEMORATE_SUNDAY",language:"en",
});
assert.equal(later.proper.data.collects[1].lat,"Sunday Collect Latin",
 "General-source selector was hardwired to October 2026");
const ordinary=await findObservedMassSource({
 massDate:"2026-11-05",sourceDate:"2026-11-12",resolveDay,language:"fr",
});
const observed=await composeObservedMassSelection(ordinary,{
 baseLegacy:base("2026-11-05"),resolveDay,language:"fr",
});
assert.equal(observed.proper.data.collects.length,1);
assert.equal(observed.legacy.date,"2026-11-05");
assert.equal(observed.proper.data.introit.lat,"Saint Introit Latin");
await assert.rejects(()=>composeObservedMassSelection(ordinary,{
 baseLegacy:base("2026-11-12"),resolveDay,language:"fr",
}),/DATE_CHANGED/);
await assert.rejects(()=>composeObservedMassSelection(ordinary,{
 baseLegacy:{...base("2026-11-05"),canStart:false},resolveDay,language:"fr",
}),/HOST_PREFLIGHT_NOT_READY/);
const bad={...sources.get("2026-11-12"),
 proper:proper("Sancti/11-12","Saint")};
bad.proper.data.gospel.fr="";
sources.set("2026-11-12",bad);
await assert.rejects(()=>findObservedMassSource({
 massDate:"2026-11-05",sourceDate:"2026-11-12",resolveDay,language:"fr",
}),/TRANSLATION_MISSING:GOSPEL/);
assert.equal(properToReaderSlots(bad.proper.data,{language:"en"}).ready,true,
 "Language refusal should be specific to the chosen reader language");
console.log("Observed Mass source: PASS — date-independent Proper, Oct 2026/27 Rosary, explicit Sunday orations, 1962 calendar untouched, source/language/host gates.");
