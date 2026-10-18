import { observedCycle, cycleFromCanonicalIdentity } from "../src/calendar/observed-cycle.js";
import { calendarRubricalClaimsForDay, calendarColourRubricalClaimsForDay, calendarTransferRubricalClaimsForDay, calendarObservedCommemorationClaimsForDay, calendarInseparableApostlesClaimForDay, calendarOmittedFeastClaimForDay, GENERAL_RUBRICS_NORMATIVE_URL } from "../src/calendar/rubrical-claim-citations.js";
import { romanClassTier } from "../src/calendar/roman-class-tier.js";
import { calendarObservanceAlias } from "../src/calendar/observance-title.js";
import assert from "node:assert/strict";
import "./calendar-scripture-handoff.mjs";
import {readFileSync} from "node:fs";
import {buildMajorCelebrations,annunciationObservanceDate} from "../src/calendar/liturgical-year.js";
const runtime=readFileSync("src/calendar/calendar-runtime.js","utf8");
// Calendar Day editorial hierarchy is presentation only. Commemorations are
// actual observed source names, not supplementary modern saint projections.
// The precise Scripture context continues to come from the published Proper.
const dayStart=runtime.indexOf("function daySurface(selected,r){");
const dayEnd=runtime.indexOf("function requestYearDailyColours(year){",dayStart);
assert.ok(dayStart>=0&&dayEnd>dayStart,"Source-owned Calendar Day renderer missing");
const dayUi=runtime.slice(dayStart,dayEnd);
const dayPositions=[
  'class="aoCalIdentityMeta"',
  'cm.length?',
  'calendarScriptureControls(selected,r)',
  'data-cal-mass',
  'class="aoCalV2Documentation"',
  'daySourceDetails(r)',
  'data-cal-print-proper',
  'supplementaryDayMarkup(selected,r)'
].map(k=>dayUi.indexOf(k));
assert.ok(dayPositions.every(p=>p>=0),"Calendar Day missing one hierarchy layer: "+JSON.stringify(dayPositions));
assert.ok(dayPositions.every((p,i)=>i===0||p>dayPositions[i-1]),
  "Calendar Day must present 1962 identity → observed commemorations → readings → Mass → secondary sources/printing → additional saints");
assert.equal((dayUi.match(/class="aoCalV2Commemorations"/g)||[]).length,1,
  "Observed 1962 commemorations must have exactly one surface");
assert.match(dayUi,/cm\.map\(x=>/,"Principal commemoration must use existing source-verified names");
assert.match(dayUi,/esc\(x\)/,"Commemoration labels must be escaped");
assert.match(dayUi,/aoCalV2PrintOptions/,"Printing should be secondary and collapsible");
assert.match(runtime,/Appointed readings/);
assert.match(runtime,/Lectures de la messe/);
assert.match(runtime,/calendarScriptureContexts\(r\)/,"Never invent an Epistle or Gospel to fill missing sources");




const claimLedger=JSON.parse(readFileSync("data/calendar/1962-privileged-commemorations.v1.json","utf8"));

const adjudicated2027=JSON.parse(readFileSync("data/calendar/1962-ordo-corrections.v1.json","utf8"));

const francisOmitted={
 date:"2026-10-04",status:"ready",
 day:{main:{id:"tempora:Pent19-0:2:g",path:"Tempora/Pent19-0",rank:2},
      commemorations:[]},
 proper:{status:"ready",data:{sourcePath:"Tempora/Pent19-0"}}
};

const omissionBatch2027_2028=[
 ["2027-03-07","tempora:Quad4-0:1:pv","Sancti/03-07","LENT4_THOMAS_AQUINAS_2027_OMITTED","RG 111(a)","I_CLASS_LENT_SUNDAY"],
 ["2027-06-13","tempora:Pent04-0:2:g","Sancti/06-13","PENT4_ANTHONY_PADUA_2027_OMITTED","RG 111(b)","II_CLASS_SUNDAY"],
 ["2027-08-08","tempora:Pent12-0:2:g","Sancti/08-08","PENT12_JOHN_VIANNEY_2027_OMITTED","RG 111(b)","II_CLASS_SUNDAY"],
 ["2028-06-11","tempora:Pent01-0r:1:w","Sancti/06-11","TRINITY_BARNABAS_2028_OMITTED","RG 111(a)","I_CLASS_TRINITY_SUNDAY"],
 ["2028-08-20","tempora:Pent11-0:2:g","Sancti/08-20","PENT11_BERNARD_2028_OMITTED","RG 111(b)","II_CLASS_SUNDAY"],
 ["2028-12-03","tempora:Adv1-0:1:v","Sancti/12-03","ADVENT1_FRANCIS_XAVIER_2028_OMITTED","RG 111(a)","I_CLASS_ADVENT_SUNDAY"],
];
for(const [date,principal,saintPath,id,cap,kind] of omissionBatch2027_2028){
 const sourcePath="Tempora/"+principal.split(":")[1];
 const selected={date,status:"ready",day:{main:{id:principal,path:sourcePath},commemorations:[]},
    proper:{status:"ready",data:{sourcePath}}};
 const claims=calendarOmittedFeastClaimForDay(selected,adjudicated2027);
 assert.equal(claims.length,1,"2027–2028 source-reconciled omission absent "+date);
 const c=claims[0];
 assert.equal(c.claimId,id);
 assert.equal(c.observedPrincipalId,principal);
 assert.equal(c.impededFeastPath,saintPath);
 assert.deepEqual(c.clauses,["RG 91","RG 93",cap]);
 assert.equal(c.witnessUrl,"https://ordo.fsspx.org/calendar/"+date.slice(0,4)+"/"+Number(date.slice(5,7)));
 assert.equal(c.feastClassWitnessUrl,"https://1962missal.com/feast");
 assert.equal(c.comparisonUrl,"https://gcatholic.org/calendar/"+date.slice(0,4)+"/Extraordinary-en");
 assert.equal(c.generalRomanCalendarOnly,true);
 assert.equal(c.automaticMassChange,false);
 assert.ok(c.explanation.en&&c.explanation.fr);
 assert.ok(Object.isFrozen(claims)&&Object.isFrozen(c));
 const ledgerRow=adjudicated2027.nonCommemorationWitnesses.find(w=>w.date===date);
 assert.equal(ledgerRow.principal.kind,kind);
 for(const invalid of [
   {...selected,status:"failed"},
   {...selected,date:"2026"+date.slice(4)},
   {...selected,day:{main:{id:"sancti:"+date.slice(5)+":3:w",path:saintPath},commemorations:[]}},
   {...selected,day:{main:{id:principal.replace(/:[12]:/,":4:"),path:sourcePath},commemorations:[]}},
   {...selected,day:{main:selected.day.main,commemorations:[{id:"sancti:"+date.slice(5)+":3:w"}]}},
   {...selected,proper:{status:"ready",data:{sourcePath:saintPath}}},
 ])assert.deepEqual(calendarOmittedFeastClaimForDay(invalid,adjudicated2027),[],
    "Cannot assert unreviewed date, principal or omitted saint "+date);
 for(const poison of [
  w=>{w.impeded.saint="SAINT_OTHER"},
  w=>{w.sourceReview="UNVERIFIED"},
  w=>{w.observedWitness="javascript:alert(1)"},
  w=>{w.principal.kind=kind==="II_CLASS_SUNDAY"?"I_CLASS_ADVENT_SUNDAY":"II_CLASS_SUNDAY"},
 ]){
  const edited=structuredClone(adjudicated2027);
  poison(edited.nonCommemorationWitnesses.find(w=>w.date===date));
  assert.deepEqual(calendarOmittedFeastClaimForDay(selected,edited),[],
     "Wrong type/provenance must suppress 2027–2028 omitted saint "+date);
 }
}

const omissionBatch2026=[
  ["2026-07-05","tempora:Pent06-0:2:g","Sancti/07-05","SAINT_ANTHONY_MARY_ZACCARIA","RG 111(b)"],
  ["2026-07-12","tempora:Pent07-0:2:g","Sancti/07-12","SAINT_JOHN_GUALBERT","RG 111(b)"],
  ["2026-08-30","tempora:Pent14-0:2:g","Sancti/08-30","SAINT_ROSE_OF_LIMA","RG 111(b)"],
  ["2026-11-22","tempora:Pent24-0:2:g","Sancti/11-22","SAINT_CECILIA","RG 111(b)"],
  ["2026-12-06","tempora:Adv2-0:1:v","Sancti/12-06","SAINT_NICHOLAS_MYRA","RG 111(a)"]
];
for(const [date,principal,impeded,saint,cap] of omissionBatch2026){
  const principalPath="Tempora/"+principal.split(":")[1];
  const resolved={
    date,status:"ready",
    day:{main:{id:principal,path:principalPath},commemorations:[]},
    proper:{status:"ready",data:{sourcePath:principalPath}}
  };
  const claims=calendarOmittedFeastClaimForDay(resolved,adjudicated2027);
  assert.equal(claims.length,1,"Independent 1962 sources required for omitted feast "+date);
  assert.equal(claims[0].observedPrincipalId,principal);
  assert.equal(claims[0].impededFeastPath,impeded);
  assert.deepEqual(claims[0].clauses,["RG 91","RG 93",cap]);
  assert.equal(claims[0].witnessUrl,"https://ordo.fsspx.org/day/"+date+"?lang=en");
  assert.equal(claims[0].feastClassWitnessUrl,"https://www.1962ordo.com/feast/");
  assert.equal(claims[0].comparisonUrl,"https://gcatholic.org/calendar/2026/Extraordinary-en");
  assert.equal(claims[0].generalRomanCalendarOnly,true);
  assert.equal(claims[0].automaticMassChange,false);
  assert.ok(Object.isFrozen(claims)&&Object.isFrozen(claims[0]));
  assert.ok(claims[0].explanation.en&&claims[0].explanation.fr);
  for(const bad of [
    {...resolved,date:"2027"+date.slice(4)},
    {...resolved,status:"failed"},
    {...resolved,day:{main:{id:"sancti:"+date.slice(5)+":3:w",path:impeded},commemorations:[]}},
    {...resolved,day:{main:{id:principal.replace(/:[12]:/,":4:"),path:principalPath},commemorations:[]}},
    {...resolved,day:{main:{id:principal,path:principalPath},commemorations:[{id:"sancti:"+date.slice(5)+":3:w"}]}},
    {...resolved,proper:{status:"ready",data:{sourcePath:impeded}}},
  ])assert.deepEqual(calendarOmittedFeastClaimForDay(bad,adjudicated2027),[],
     "Cannot imply a transferred/commemorated feast or wrong 1962 observance: "+date);
  const alteration=structuredClone(adjudicated2027);
  alteration.nonCommemorationWitnesses.find(w=>w.date===date).impeded.saint="SAINT_OTHER";
  assert.deepEqual(calendarOmittedFeastClaimForDay(resolved,alteration),[],
     "Source-reviewed impeded saint identity cannot drift: "+date);
}
assert.deepEqual(calendarOmittedFeastClaimForDay({
  date:"2026-12-13",status:"ready",
  day:{main:{id:"tempora:Adv3-0:1:v",path:"Tempora/Adv3-0"},commemorations:[]},
  proper:{status:"ready",data:{sourcePath:"Tempora/Adv3-0"}}
},adjudicated2027),[],"Disputed St Lucy/Advent III source must remain uncertified");

const omitted=calendarOmittedFeastClaimForDay(francisOmitted,adjudicated2027);
assert.equal(omitted.length,1,"Source-certified 2026 Sunday/St Francis omission missing");
assert.deepEqual(omitted[0].clauses,["RG 91","RG 93","RG 111(b)"]);
assert.equal(omitted[0].impededFeastPath,"Sancti/10-04");
assert.equal(omitted[0].disposition,"OMITTED_NOT_TRANSFERRED_NOT_COMMEMORATED");
assert.equal(omitted[0].generalRomanCalendarOnly,true);
assert.equal(omitted[0].automaticMassChange,false);
assert.equal(omitted[0].normativeUrl,GENERAL_RUBRICS_NORMATIVE_URL);
assert.equal(omitted[0].witnessUrl,"https://ordo.fsspx.org/day/2026-10-04?lang=en");
assert.equal(omitted[0].feastClassWitnessUrl,"https://ordo.fsspx.org/day/2027-10-04");
assert.ok(omitted[0].explanation.en&&omitted[0].explanation.fr);
assert.ok(Object.isFrozen(omitted)&&Object.isFrozen(omitted[0]));
for(const other of [
 {...francisOmitted,date:"2027-10-04"},
 {...francisOmitted,date:"2026-10-11"},
 {...francisOmitted,status:"failed"},
 {...francisOmitted,proper:{status:"failed",data:{sourcePath:"Tempora/Pent19-0"}}},
 {...francisOmitted,proper:{status:"ready",data:{sourcePath:"Sancti/10-04"}}},
 {...francisOmitted,day:{...francisOmitted.day,main:{id:"sancti:10-04:3:w",path:"Sancti/10-04"}}},
 {...francisOmitted,day:{...francisOmitted.day,main:{id:"tempora:Pent19-0:1:g",path:"Tempora/Pent19-0"}}},
 {...francisOmitted,day:{...francisOmitted.day,commemorations:[{id:"sancti:10-04:3:w"}]}},
 {...francisOmitted,day:{...francisOmitted.day,commemorations:null}},
])assert.deepEqual(calendarOmittedFeastClaimForDay(other,adjudicated2027),[],
  "No omitted-feast citation without the exact source-resolved Sunday and missing commemoration");
for(const change of [
 ledger=>ledger.nonCommemorationWitnesses[0].observedWitness="javascript:alert(1)",
 ledger=>ledger.nonCommemorationWitnesses[0].impeded.class=2,
 ledger=>ledger.nonCommemorationWitnesses[0].clauses=["RG 111(d)"],
 ledger=>ledger.nonCommemorationWitnesses[0].doesNotDetermineParticularCalendar=false,
]){const poison=structuredClone(adjudicated2027);change(poison);
 assert.deepEqual(calendarOmittedFeastClaimForDay(francisOmitted,poison),[],
  "Do not manufacture omitted-feast explanations from incomplete or unsafe evidence");}


const inseparableFixture=(date="2027-06-30")=>({
 date,status:"ready",
 day:{main:{id:"sancti:06-30:3:r",path:"Sancti/06-30",rank:3},
  commemorations:[{id:"inseparable:sancti:06-29-petrus",inseparable:true}]},
 proper:{status:"ready",data:{sourcePath:"Sancti/06-30"}}
});
const june30=inseparableFixture();
const apostles=calendarInseparableApostlesClaimForDay(june30,adjudicated2027);
assert.equal(apostles.length,1,"June 30 source-resolved apostolic inseparability missing");
assert.deepEqual(apostles[0].clauses,["RG 110","RG 110(b)"]);
assert.equal(apostles[0].commemorationId,"inseparable:sancti:06-29-petrus");
assert.equal(apostles[0].massOrationsOwner,"src/mass/1962-inseparable-apostles-source.js");
assert.equal(apostles[0].orationCertification,"EXISTING_MASS_OWNER_ONLY");
assert.equal(apostles[0].automaticMassChange,false);
assert.equal(apostles[0].normativeUrl,GENERAL_RUBRICS_NORMATIVE_URL);
assert.equal(apostles[0].witnessUrl,"https://gcatholic.org/calendar/2027/Extraordinary-en");
assert.ok(apostles[0].explanation.en&&apostles[0].explanation.fr);
assert.ok(Object.isFrozen(apostles)&&Object.isFrozen(apostles[0])&&Object.isFrozen(apostles[0].clauses));
for(const broken of [
 {...june30,date:"2026-06-30"},
 {...june30,date:"2027-06-29"},
 {...june30,status:"failed"},
 {...june30,proper:{status:"failed",data:{sourcePath:"Sancti/06-30"}}},
 {...june30,proper:{status:"ready",data:{sourcePath:"Sancti/06-29"}}},
 {...june30,day:{...june30.day,main:{id:"sancti:06-29:1:r",path:"Sancti/06-29"}}},
 {...june30,day:{...june30.day,main:{id:"sancti:06-30:2:r",path:"Sancti/06-30"}}},
 {...june30,day:{...june30.day,commemorations:[]}},
 {...june30,day:{...june30.day,commemorations:[{id:"sancti:06-29:1:r"}]}},
 {...june30,day:{...june30.day,commemorations:[{id:"inseparable:sancti:06-29-petrus",inseparable:false}]}},
 {...june30,day:{...june30.day,commemorations:[...june30.day.commemorations,{id:"saint:other"}]}},
])assert.deepEqual(calendarInseparableApostlesClaimForDay(broken,adjudicated2027),[],
 "Never attribute Peter/Paul §110 to an unverified 1962 principal, date or oration");
for(const mutation of [
 ledger=>{ledger.outstandingSecondaryCases.find(x=>x.dates?.[0]==="2027-06-30").source="javascript:alert(1)"},
 ledger=>{ledger.outstandingSecondaryCases.find(x=>x.dates?.[0]==="2027-06-30").rubricalClaim.orationCertification="CERTIFIED_BY_CALENDAR"},
 ledger=>{ledger.outstandingSecondaryCases.find(x=>x.dates?.[0]==="2027-06-30").rubricalClaim.clauses=["RG 111(c)"]},
]){const poisoned=structuredClone(adjudicated2027);mutation(poisoned);
 assert.deepEqual(calendarInseparableApostlesClaimForDay(june30,poisoned),[],
   "No unsafe source or invented Calendar oration certificate");}

const observedFixture=(date,principalPath,principalRank,commPath,commRank=3)=>({
  date,status:"ready",
  day:{main:{id:principalPath.replace("/",":").toLowerCase()+":"+principalRank+":w"},
    commemorations:commPath?[{id:commPath.replace("/",":").replace(/^(tempora|sancti):/i,x=>x.toLowerCase())+":"+commRank+":v"}]:[]},
  proper:{status:"ready",data:{sourcePath:principalPath}}
});
for(const [date,principal,classNo,comm,commClass,clauses] of [
 ["2027-08-15","Sancti/08-15",1,"Tempora/Pent13-0",2,["RG 108(a)","RG 111(a)"]],
 ["2027-11-30","Sancti/11-30",2,"Tempora/Adv1-2",3,["RG 25(b)","RG 108(e)","RG 111(c)"]],
 ["2027-12-08","Sancti/12-08",1,"Tempora/Adv2-3",3,["RG 25(b)","RG 108(e)","RG 111(a)"]],
]){
 const verified=observedFixture(date,principal,classNo,comm,commClass);
 const claims=calendarObservedCommemorationClaimsForDay(verified,adjudicated2027);
 assert.equal(claims.length,1,"Source-matched 2027 commemoration lost "+date);
 assert.deepEqual(claims[0].clauses,clauses);
 assert.equal(claims[0].classes.principal,classNo);
 assert.equal(claims[0].classes.commemoration,commClass);
 assert.equal(claims[0].commemorationId,comm.replace("/",":").toLowerCase());
 assert.equal(claims[0].properSourcePath,principal);
 assert.equal(claims[0].formSpecificOrationDecision,"EXISTING_MASS_OWNER_ONLY");
 assert.equal(claims[0].automaticMassChange,false);
 assert.equal(claims[0].normativeUrl,GENERAL_RUBRICS_NORMATIVE_URL);
 assert.equal(claims[0].witnessUrl,"https://gcatholic.org/calendar/2027/Extraordinary-en");
 assert.ok(claims[0].explanation.en&&claims[0].explanation.fr);
 assert.ok(Object.isFrozen(claims)&&Object.isFrozen(claims[0]));
 for(const broken of [
  {...verified,date:"2026"+date.slice(4)},
  {...verified,status:"failed"},
  {...verified,proper:{status:"failed",data:{sourcePath:principal}}},
  {...verified,proper:{status:"ready",data:{sourcePath:"Sancti/01-01"}}},
  {...verified,day:{...verified.day,main:{id:"sancti:01-01:1:w"}}},
  {...verified,day:{...verified.day,main:{id:verified.day.main.id.replace(/:[1-4]:/,":4:")}}},
  {...verified,day:{...verified.day,commemorations:[]}},
  {...verified,day:{...verified.day,commemorations:[{id:"tempora:Other:3:v"}]}},
  {...verified,day:{...verified.day,commemorations:[
    ...verified.day.commemorations,{id:"tempora:Other:3:v"}]}},
 ])assert.deepEqual(calendarObservedCommemorationClaimsForDay(broken,adjudicated2027),[],
    "A stale/non-observed 2027 commemoration must not be presented "+date);
 const forged=structuredClone(adjudicated2027);
 forged.outstandingSecondaryCases.find(x=>x.dates?.[0]===date).source="javascript:bad()";
 assert.deepEqual(calendarObservedCommemorationClaimsForDay(verified,forged),[],
    "Unverified witness URL must never be an original clause link");
}
for(const [date,principal,classNo,comm,rank] of [
 ["2027-06-30","Sancti/06-30",3,"Sancti/06-29",1], // St Peter/Paul §110 is a separate inseparable oration owner.
 ["2026-11-01","Sancti/11-01",1,"Tempora/Pent23-0",2], // Covered by the existing 2026 source registry.
 ["2027-08-22","Tempora/Pent14-0",2,null,3], // No identity-verified extra Sunday claim.
])assert.deepEqual(calendarObservedCommemorationClaimsForDay(
 observedFixture(date,principal,classNo,comm,rank),adjudicated2027),[],
 "Uncertified 2027 or existing-2026 case cannot be duplicated");


const transferOracle=JSON.parse(readFileSync("data/calendar/1962-transfer-oracle.v1.json","utf8"));
const transferredDay=(date,sourcePath,colour="w")=>({
  date,status:"ready",
  day:{main:{id:sourcePath.replace("/",":").toLowerCase()+":1:"+colour}},
  proper:{status:"ready",data:{sourcePath,color:colour==="b"?"Black":"White"}}
});
for(const [date,path,colour,original,clauses] of [
  ["2024-04-08","Sancti/03-25","w","2024-03-25",["RG 95","RG 96(a)","RG 99"]],
  ["2025-11-03","Sancti/11-02","b","2025-11-02",["RG 16(b)","RG 96(b)"]],
  ["2027-04-05","Sancti/03-25","w","2027-03-25",["RG 95","RG 96(a)","RG 99"]],
  ["2028-03-20","Sancti/03-19","w","2028-03-19",["RG 15","RG 95","RG 96","RG 99"]],
]){
  const r=transferredDay(date,path,colour);
  const claims=calendarTransferRubricalClaimsForDay(r,transferOracle);
  assert.equal(claims.length,1,"Missing exact transferred feast: "+date);
  const c=claims[0];
  assert.equal(c.originalDate,original);
  assert.equal(c.observedDate,date);
  assert.equal(c.properSourcePath,path);
  assert.deepEqual(c.clauses,clauses);
  assert.equal(c.authorityKind,"NORMATIVE_1960_RUBRICS");
  assert.equal(c.normativeUrl,GENERAL_RUBRICS_NORMATIVE_URL);
  assert.equal(c.changesMassResolver,false);
  assert.ok(c.title.en&&c.title.fr&&c.explanation.en&&c.explanation.fr);
  assert.match(c.witnessUrl,/^https:\/\/(?:gcatholic\.org\/calendar|missale\.online\/festkalender)/);
  assert.ok(Object.isFrozen(claims)&&Object.isFrozen(c)&&Object.isFrozen(c.clauses));
  for(const variant of [
    {...r,date:original}, // no fictitious transfer attribution at the old date
    {...r,status:"failed"},
    {...r,proper:{status:"failed",data:{sourcePath:path}}},
    {...r,proper:{status:"ready",data:{sourcePath:"Sancti/12-08"}}},
    {...r,day:{main:{id:"sancti:12-08:1:w"}}},
    {...r,day:{main:{id:r.day.main.id.replace(":1:",":2:")}}},
    {...r,day:{main:{id:r.day.main.id.replace(/:[wb]$/,":v")}}},
  ])assert.deepEqual(calendarTransferRubricalClaimsForDay(variant,transferOracle),[],
      "Unverified transfer attribution must fail closed: "+date);
  const forged=structuredClone(transferOracle);
  const w=forged.witnesses.find(x=>x.observed===date);
  w.source="javascript:alert(1)";
  assert.deepEqual(calendarTransferRubricalClaimsForDay(r,forged),[],
    "Unsafe witness must not produce source attribution");
  const badDate=structuredClone(transferOracle);
  badDate.witnesses.find(x=>x.observed===date).rubricalClaim.original="2020-03-25";
  assert.deepEqual(calendarTransferRubricalClaimsForDay(r,badDate),[],
    "Changed original assignment must not produce a rubrical claim");
}
for(const [date,path] of [
  ["2026-03-25","Sancti/03-25"],   // Annunciation legitimately not transferred
  ["2026-11-02","Sancti/11-02"],   // All Souls ordinarily stays on 2 November
  ["2027-03-25","Tempora/Quad6-4"],// Holy Thursday cannot be attributed to Annunciation
  ["2027-04-04","Tempora/Pasc0-0"],// Low Sunday has its own 1962 identity
  ["2028-03-19","Tempora/Quad3-0"] // Lenten Sunday takes precedence over St Joseph
])assert.deepEqual(calendarTransferRubricalClaimsForDay(transferredDay(date,path),transferOracle),[],
  "Original date/principal must not receive invented transfer evidence");
assert.deepEqual(calendarTransferRubricalClaimsForDay(
  transferredDay("2027-04-05","Sancti/03-25"),{}),[]);

const colourAudit=JSON.parse(readFileSync("data/calendar/1962-ordo-corrections.v1.json","utf8"));
const colourFixture=(date,sourcePath,colour,classNo=4)=>({
 date,status:"ready",day:{main:{id:sourcePath.replace("/",":").toLowerCase()+":"+classNo+":"+(colour==="White"?"w":"v"),color:colour}},
 proper:{status:"ready",data:{sourcePath,color:colour}}
});
for(const [date,path,colour,clauses] of [
 ["2024-01-08","Tempora/Epi1-1","White",["RG 119(a)","RG 127(a)"]],
 ["2027-01-11","Tempora/Epi1-1","White",["RG 119(a)","RG 127(a)"]],
 ["2024-12-24","Sancti/12-24","Violet",["RG 128(a)"]],
 ["2027-12-24","Sancti/12-24","Violet",["RG 128(a)"]],
]){
 const observed=colourFixture(date,path,colour);
 const claims=calendarColourRubricalClaimsForDay(observed,colourAudit);
 assert.equal(claims.length,1,"Date-specific source colour decision absent for "+date);
 assert.deepEqual(claims[0].clauses,clauses);
 assert.equal(claims[0].expectedColour,colour);
 assert.equal(claims[0].principalId,path.replace("/",":").toLowerCase());
 assert.equal(claims[0].properSourcePath,path);
 assert.equal(claims[0].automaticMassChange,false);
 assert.equal(claims[0].authorityKind,"NORMATIVE_1960_RUBRICS");
 assert.match(claims[0].historicalExplanationUrl,/^https:\/\/propria\.org\/.*\.pdf#page=20$/);
 assert.equal(claims[0].normativeUrl,GENERAL_RUBRICS_NORMATIVE_URL);
 assert.ok(claims[0].explanation.en&&claims[0].explanation.fr);
 assert.ok(Object.isFrozen(claims)&&Object.isFrozen(claims[0]));
 for(const modified of [
   {...observed,date:"2026"+date.slice(4)},
   {...observed,status:"failed"},
   {...observed,proper:{status:"failed",data:{sourcePath:path,color:colour}}},
   {...observed,proper:{status:"ready",data:{sourcePath:"Tempora/Adv1-1",color:colour}}},
   {...observed,day:{main:{id:"tempora:unrelated:4:v",color:colour}}},
   {...observed,day:{main:{id:observed.day.main.id.replace(/:[wv]$/i,":r"),color:colour}}},
   {...observed,proper:{status:"ready",data:{sourcePath:path,color:colour==="White"?"Green":"White"}}},
   {...observed,colourPlan:{massColor:colour,sequence:[["rite","Violet"],["Mass",colour]]}},
 ])assert.deepEqual(calendarColourRubricalClaimsForDay(modified,colourAudit),[],
   "Date/Proper/Mass colour change must fail closed for "+date);
 const altered=structuredClone(colourAudit);
 const row=altered.disputes.find(x=>x.date===date)??altered.secondaryAdjudications[0];
 row.authority.url="https://example.com/forged-rubrics.pdf";
 assert.deepEqual(calendarColourRubricalClaimsForDay(observed,altered),[],
   "Untrusted external witness cannot certify the colour clause");
}
assert.deepEqual(calendarColourRubricalClaimsForDay(
  colourFixture("2026-12-24","Sancti/12-24","Violet"),colourAudit),[],
  "A dated archival witness may not be back-projected to every Christmas Eve");
assert.deepEqual(calendarColourRubricalClaimsForDay(
  colourFixture("2027-12-24","Sancti/12-24","Violet"),{}),[]);

const rubricFixture=(date,sourcePath,rank,commem)=>({
  date,status:"ready",
  day:{main:{id:sourcePath.replace("/",":").toLowerCase()+":"+rank+":w",title:"Source text only"},
       commemorations:commem?[{id:commem,title:"Observed commemoration"}]:[]},
  proper:{status:"ready",data:{sourcePath}},
});
for(const [date,path,rank,commem,clauses] of [
  ["2026-11-01","Sancti/11-01",1,"tempora:Pent23-0:2:g",["RG 108(a)","RG 111(a)"]],
  ["2026-11-30","Sancti/11-30",2,"tempora:Adv1-1:3:v",["RG 25(b)","RG 108(e)","RG 111(c)"]],
  ["2026-12-08","Sancti/12-08",1,"tempora:Adv2-2:3:v",["RG 25(b)","RG 108(e)","RG 111(a)"]],
]){
  const resolved=rubricFixture(date,path,rank,commem);
  const claims=calendarRubricalClaimsForDay(resolved,claimLedger);
  assert.equal(claims.length,1,date+" exact observed case must have one source claim");
  assert.deepEqual(claims[0].clauses,clauses);
  assert.equal(claims[0].authorityKind,"NORMATIVE_1960_RUBRICS");
  assert.equal(claims[0].witnessKind,"DATE_SCOPED_HISTORICAL_ORDO");
  assert.match(claims[0].witnessUrl,/^https:\/\/(?:ordo\.fsspx\.org|missale\.online)\//);
  assert.equal(claims[0].normativeUrl,GENERAL_RUBRICS_NORMATIVE_URL);
  assert.ok(claims[0].explanation.en&&claims[0].explanation.fr);
  assert.equal(claims[0].automaticMassChange,false);
  assert.ok(Object.isFrozen(claims)&&Object.isFrozen(claims[0]));
  for(const variant of [
    {...resolved,date:"2027"+date.slice(4)},  // Same feast in another year is NOT certified by this witness.
    {...resolved,status:"failed"},
    {...resolved,proper:{status:"failed",data:{sourcePath:path}}},
    {...resolved,proper:{status:"ready",data:{sourcePath:"Sancti/08-15"}}},
    {...resolved,day:{...resolved.day,main:{id:"sancti:08-15:1:w"}}},
    {...resolved,day:{...resolved.day,main:{id:resolved.day.main.id.replace(/:[1-4]:/,":3:")}}},
    {...resolved,day:{...resolved.day,commemorations:[]}},
    {...resolved,day:{...resolved.day,commemorations:[{id:"tempora:Adv4-1:3:v"}]}},
    {...resolved,day:{...resolved.day,commemorations:[{id:commem},{id:"tempora:Adv4-1:3:v"}]}},
  ])assert.deepEqual(calendarRubricalClaimsForDay(variant,claimLedger),[],
    date+" must fail closed on a stale or unverified principal/commemoration");
  const poisoned=structuredClone(claimLedger);
  poisoned.witnesses.find(w=>w.date===date).source="javascript:alert(1)";
  assert.deepEqual(calendarRubricalClaimsForDay(resolved,poisoned),[],
    "Untrusted ordo URL cannot become a citation");
}
for(const fixture of [
  rubricFixture("2026-04-03","Tempora/Quad6-5r",1,null), // Good Friday
  rubricFixture("2026-04-04","Tempora/Quad6-6",1,null), // Easter Vigil
  rubricFixture("2026-09-23","Tempora/093-3",2,null), // September Ember day
  rubricFixture("2026-10-11","Tempora/Pent20-0",2,null), // Ordinary Sunday
])assert.deepEqual(calendarRubricalClaimsForDay(fixture,claimLedger),[],
  "No original clause assertion without an exact date-specific witness");
assert.deepEqual(calendarRubricalClaimsForDay(rubricFixture("2026-11-01","Sancti/11-01",1,"tempora:Pent23-0:2:g"),{}),[]);
for(const marker of [
  "calendarRubricalClaimsForDay(r,rubricClaimLedger)",
  "loadCalendarRubricalClaims();",
  "data-cal-rubric-claim",
  "Why this commemoration is shown",
  "Pourquoi cette commémoraison figure ici",
  "previousRubricSourcesOpen",
  "calendarColourRubricalClaimsForDay(r,colourClaimLedger)",
  "Why this Mass colour is shown",
  "data-cal-colour-claim",
  "loadCalendarColourClaims();",
  "calendarTransferRubricalClaimsForDay(r,transferLedger)",
  "data-cal-transfer-claim",
  "Why this observance was transferred",
  "Pourquoi cette célébration a été reportée",
  "loadCalendarTransferClaims();",
  "calendarObservedCommemorationClaimsForDay(r,colourClaimLedger)",
  "calendarInseparableApostlesClaimForDay(r,colourClaimLedger)",
  "calendarOmittedFeastClaimForDay(r,colourClaimLedger)",
  "data-cal-omitted-feast",
  "Why St Francis is not commemorated",
  "Pourquoi saint François n’est pas commémoré",
  "data-cal-apostles-inseparable",
  "Why St Peter is remembered with St Paul",
  "Pourquoi saint Pierre est uni à saint Paul",
  "data-cal-observed-commemoration",
  "Why this observance is commemorated",
  "Pourquoi cette célébration est commémorée",
])assert.ok(runtime.includes(marker),
  "Calendar lost a required rubrical source-bound UI contract: "+marker);

// Calendar Day is liturgical information, not a progress/achievement dashboard.
// Assert against the actual rendered Day template while keeping the 1962 source
// and Mass/saint/print actions intact.
const dayTemplate=runtime.split("function daySurface(selected,r){")[1]?.split("function ringGradient(year)")[0];
assert.ok(dayTemplate,"Calendar Day renderer was not found");
assert.doesNotMatch(dayTemplate,/periodPercent|aoCalV2Progress|aoCalV2SeasonMeta|periodDayIndex/);
assert.doesNotMatch(dayTemplate,/Biography, artwork and sources for the principal observance/);
for(const action of [/data-cal-mass/,/data-cal-saint-date/,/data-cal-print-proper/,/daySourceDetails\(r\)/,/nextResolvedMajorCelebration/])
  assert.match(dayTemplate,action,"Calendar Day lost a principal user action or source detail");
assert.match(runtime,/\.aoCalV2Hero\{text-align:center;padding:26px 10px 22px/);
assert.match(runtime,/\.aoCalV2Hero \[data-cal-print-feedback\]:empty\{display:none\}/);

assert.match(runtime,/function monthIndexResolutionState\(monthId,view\)/);
assert.match(runtime,/if\(view==="practices"\)return "independent"/);
assert.match(runtime,/monthDateIds\(monthId\)/);
assert.match(runtime,/if\(missing\.length\)return "loading"/);
assert.match(runtime,/return failed\?"partial":"complete"/);
assert.match(runtime,/status==="loading"\?L\("Resolving this month/);
assert.match(runtime,/status==="partial"\?L\("Some days could not be resolved/);
assert.match(runtime,/rows\.length&&status==="partial"/);
assert.match(runtime,/data-cal-month-index-date/);
assert.match(runtime,/data-cal-saint-date/);
assert.match(runtime,/void select\(monthIndexDate\.dataset\.calMonthIndexDate\)/);
assert.match(runtime,/void openSaintDetail\(saintDetail\.dataset\.calSaintDate\)/);
assert.equal(annunciationObservanceDate(2027),"2027-04-05");
const mar=buildMajorCelebrations("2027-03-25");
assert.ok(mar.some(x=>x.date==="2027-04-05"&&/Annunciation/.test(x.en)));
assert.ok(!mar.some(x=>x.date==="2027-03-25"&&/Annunciation/.test(x.en)));
// Fetched calendar data are not an independently certified 1962 ordo.
assert.doesNotMatch(runtime,/liturgical month verified|mois liturgique vérifié/);
assert.match(runtime,/Calendar grid loaded · 42 dates/);
assert.match(runtime,/Grille du calendrier chargée · 42 dates/);
for(const pattern of [/function retryFailedMonth\(\)/,/data-cal-day-retry/,/data-cal-month-retry/,/data-cal-next-major-retry/,/nextMajorResults\.get\(selected\)\?\.unavailable===true/,/Open the Good Friday liturgy/,/AAS-52-1960-ocr\.pdf#page=597/,/Sources & scope/,/input\.setSelectionRange\(start,end\)/,/for="ao-cal-exact-date"/])assert.match(runtime,pattern);
// Next major day is an actual resolved I/II-class observance; curated dates cannot skip nearer Sundays.
assert.match(runtime,/return Array\.from\(\{length:21\}/);
assert.doesNotMatch(runtime,/buildMajorCelebrations/);
assert.match(runtime,/romanClassTier\(rankOf\(r\)\)/,"Display-only index uses shared source rank parser");
assert.match(runtime,/r\.date!==id/,"Month rank must not infer from a stale date");
assert.equal(romanClassTier("1ère classe"),1);
assert.equal(romanClassTier("IIe classe"),2);
assert.equal(romanClassTier("unresolved"),0);
assert.match(runtime,/Cannot claim "next" across an unresolved earlier day/);
const {execFileSync}=await import("node:child_process");
execFileSync(process.execPath,["--check","src/calendar/calendar-runtime.js"],{stdio:"pipe"});
console.log("PASS calendar source truthfulness, retries, Good Friday, accessibility and JS syntax");

// Stable *observed* identity; bilingual display labels and Sundays cannot
// reassign an impeded saint or an unknown source to another cycle.
const principal=(id, title="Translated alias",extra={})=>({status:"ready",day:{main:{id,title,...extra}}});
for(const [id,expected] of [
  ["sancti:10-DU:1:w","temporale"], // Christ the King
  ["tempora:Epi1-0:2:w","temporale"], // Holy Family
  ["sancti:12-25m1:1:w","temporale"], // Christmas midnight
  ["sancti:12-25m2:1:w","temporale"],
  ["sancti:12-25m3:1:w","temporale"],
  ["sancti:01-06:1:w","temporale"], // Epiphany
  ["sancti:01-01:1:w","temporale"], // Octave Nativity
  ["sancti:01-13:2:w","temporale"], // Baptism of Our Lord
  ["tempora:Quad6-4:1:v","temporale"], // Holy Week
  ["tempora:Quadp3-4:3:v","temporale"], // Ember Day
  ["sancti:08-15:1:w","sanctorale"], // Assumption even on Sunday
  ["sancti:12-08:1:w","sanctorale"], // Immaculate Conception
  ["sancti:11-30:2:r","sanctorale"], // St Andrew during Advent
]){
  assert.equal(observedCycle(principal(id)),expected,id);
  for(const title of ["Our Lord's Sunday", "Dimanche de la fête", "Feria", "Saint le Christ-Roi", "Unrelated alias"]){
    assert.equal(observedCycle(principal(id,title)),expected,id+" must ignore "+title);
  }
}
for(const year of [2024,2025,2026,2027,2028,2029]){
  assert.equal(observedCycle(principal("sancti:08-15:1:w","Sunday "+year)),"sanctorale");
  assert.equal(observedCycle(principal("sancti:10-DU:1:w","Sunday "+year)),"temporale");
}
assert.equal(observedCycle(principal("","Christ the King")),"unknown");
assert.equal(observedCycle(principal("","Dimanche")),"unknown");
assert.equal(observedCycle({status:"failed",day:{main:{id:"sancti:08-15:1:w"}}}),"unknown");
assert.equal(observedCycle({day:{main:{id:"sancti:08-15:1:w",principalCycle:"temporale"}}}),"temporale","Explicit resolver ownership wins");
assert.equal(cycleFromCanonicalIdentity("Sancti/10-DU"),"temporale");
assert.equal(cycleFromCanonicalIdentity("Sancti/12-08"),"sanctorale");
assert.equal(cycleFromCanonicalIdentity("some-unsupported-id"),"unknown");
assert.match(runtime,/import \{ observedCycle \} from "\.\/observed-cycle\.js";/);
assert.doesNotMatch(runtime,/const temporal=\//,"Title-based cycle regex must not recur");
assert.match(runtime,/data-cal-unclassified/,"Unknown resolved days need a visible fail-closed explanation");
const monthListSource=runtime.split("function monthIndexList(monthId,selected,view){")[1]
  ?.split("function updateMonthStatusDom(monthId)")[0]||"";
assert.ok(monthListSource,"Month category presenter must retain one source-owned list");
assert.match(monthListSource,/aoCalMonthIndexCompact/,"Category rows should use the compact source-owned Month index");
assert.match(monthListSource,/role="listitem"/,"Compact observances must remain semantic list entries");
assert.match(monthListSource,/datetime=/,"Compact dates must retain machine-readable ISO values");
assert.match(monthListSource,/dateOf\(x.date\)\.toLocaleDateString/,"Row dates should be concise inside a month");
assert.match(monthListSource,/aoCalMonthSaintDetail/,"Saint biography action must remain separate from opening the observed Mass");
assert.match(monthListSource,/data-cal-saint-date/,"Saint biography must route through the existing detail owner");
assert.match(monthListSource,/aria-label=.*Life & sources/s,"Compact saint action must retain an accessible text label");
assert.match(monthListSource,/<details class="aoCalMonthUnclassified"/,
  "Unclassified source identities must remain accessible, but no longer dominate the observance list");
assert.match(monthListSource,/unknownRows\.map\(/,"No unresolved source identity may disappear from the inspection note");
assert.match(runtime,/<details class="aoCalMonthUtilities"/,"Export and direct-date actions must stay discoverable from category indexes");
assert.match(runtime,/calendarMonthView==="calendar"\?"":"<\/details>"/,
  "Month grid must retain its existing immediately available export and exact-date actions");
assert.match(runtime,/\.aoCalMonthIndexCompact \.aoCalMonthIndexDay/,"Compact observance layout must be scoped to month indexes");
assert.match(runtime,/\.aoCalMonthIndexCompact \.aoCalMonthIndexDay\{[^}]*min-height:61px!important/,
  "Month register row must remain compact without falling below the 44px touch minimum");
assert.match(runtime,/\.aoCalMonthIndexCompact \.aoCalMonthSaintDetail\{[^}]*min-width:48px!important/,
  "Saint biography control must remain a 48px separately tappable target on desktop");
assert.match(runtime,/@media\(max-width:700px\)[\s\S]*?\.aoCalMonthIndexCompact \.aoCalMonthSaintDetail\{[^}]*min-width:46px!important/,
  "Mobile biography control must retain at least a 44px touch target");


console.log("PASS language-neutral observed cycle and unclassified-day disclosure");


// The archival title mismatch set is an editorial worklist, not 132 liturgical
// rank/colour errors, not a new calendar ordo, and not a certification claim.
const titleLedger=JSON.parse(readFileSync("data/calendar/1962-editorial-reconciliation-2024-2027.v1.json","utf8"));
const titleGroups=Object.fromEntries(titleLedger.groups.map(g=>[g.key,g]));
const titleDates=titleLedger.groups.flatMap(g=>g.dates);
assert.equal(titleLedger.status,"TRIAGE_NOT_LITURGICAL_CERTIFICATION");
assert.equal(titleDates.length,132);
assert.equal(new Set(titleDates).size,132,"Every 2024/2027 editorial flag has one canonical owner");
assert.equal(titleDates.filter(x=>x.startsWith("2024-")).length,66);
assert.equal(titleDates.filter(x=>x.startsWith("2027-")).length,66);
for(const [key,total] of Object.entries({
  generic_feria:55,saturday_bvm_mass_title:24,saint_variants:32,
  major_title_variants:6,commemoration_count:9,
  pentecost_vigil_mislabel:2,bibiana_mislabel:2,paul_latin_only:1,
  advent_saturday_wording:1
})){
  assert.equal(titleGroups[key]?.dates.length,total,key+" archival count changed");
  assert.equal(titleGroups[key].count,total);
}
for(const group of titleLedger.groups){
  assert.ok(group.dates.every(d=>/^202[47]-\d{2}-\d{2}$/.test(d)),group.key+" malformed source date");
  assert.ok(group.reason.length>60,group.key+" lacks source-specific disposition");
}
for(const [id,en,fr] of [
  ["tempora:Pasc6-6:1:r","Vigil of Pentecost","Vigile de la Pentecôte"],
  ["sancti:12-02:3:r","St Bibiana, Virgin and Martyr","Sainte Bibiane, vierge et martyre"],
  ["sancti:06-30:3:r","Commemoration of St Paul, Apostle","Commémoraison de saint Paul, apôtre"]
]){
  assert.equal(calendarObservanceAlias(principal(id), "en"),en,id);
  assert.equal(calendarObservanceAlias(principal(id), "fr"),fr,id);
  assert.equal(calendarObservanceAlias(principal(id,"Unaffiliated translation"),"en"),en,id+" is not title-dependent");
}
assert.equal(calendarObservanceAlias(principal("sancti:12-020:3:r"),"en"),null);
assert.equal(calendarObservanceAlias(principal("tempora:Pasc6-6"),"en"),null);
assert.equal(calendarObservanceAlias(principal(":feria:4:w"),"en"),null,
  "Generic feria has no verified source week: never fabricate contextual titles");
assert.equal(calendarObservanceAlias({status:"failed",day:{main:{id:"sancti:12-02:3:r"}}},"fr"),null);
assert.match(runtime,/calendarObservanceAlias\(r,fr\(\)\?"fr":"en"\)/,
  "Calendar must show the source-identity corrected name before the donor alias");
console.log("PASS 132 archived editorial cases categorized, three source-ID alias families protected");
