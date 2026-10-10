import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  gregorianEasterDate,majorLitanyDate,isMajorLitanyDay,
  isLesserRogationDay,litanyObservanceOn
} from "../src/mass/litany-dates.js";
import {projectRogationPreflight,resolvedRogationCandidate,
  rogationPublicChoiceReady,majorRogationPublicChoiceReady} from "../src/mass/rogation-preflight.js";
import {prepareMassSessionFromV346} from "../src/mass/host-adapter.js";
import {contextualRogationCard} from "../src/mass/reader-rogations.js";
const json=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const library={
 sourceGate:json("../data/mass/rogation-proper-source-gate.v1.json"),
 sourceProper:json("../data/mass/rogation-proper-trilingual.v1.json"),
 preface:json("../data/mass/rogation-easter-preface.v1.json"),
 majorGate:json("../data/mass/major-litany-release-gate.v1.json")
};
const release=json("../data/mass/major-litany-release-gate.v1.json");
assert.equal(release.publicationAllowed,true);
assert.equal(release.availableNow.majorVotive,true);
assert.equal(release.sourceReuse.reuseNineCommonSections,true);
assert.equal(rogationPublicChoiceReady(library),true,
 "Minor publication cannot authorize Major seasonal variants");
const years=[2011,2025,2026,2027,2038,2040,2099];
for(const year of years){
 const date=majorLitanyDate(year);
 assert.equal(isMajorLitanyDay(date),true,date);
 assert.equal(litanyObservanceOn(date),"MAJOR",date);
}
assert.equal(gregorianEasterDate(2011).toISOString().slice(0,10),"2011-04-24");
assert.equal(majorLitanyDate(2011),"2011-04-26");
assert.equal(isMajorLitanyDay("2011-04-25"),false);
assert.equal(gregorianEasterDate(2038).toISOString().slice(0,10),"2038-04-25");
assert.equal(majorLitanyDate(2038),"2038-04-27");
assert.equal(isMajorLitanyDay("2038-04-25"),false);
assert.equal(majorLitanyDate(2025),"2025-04-25");
assert.equal(majorLitanyDate(2026),"2026-04-25");
assert.equal(isMajorLitanyDay("2026-04-26"),false);
assert.equal(isMajorLitanyDay("2026-04-31"),false);
assert.equal(isMajorLitanyDay("2025-02-25"),false);
assert.equal(isLesserRogationDay("2027-05-03"),true);
assert.equal(litanyObservanceOn("2027-05-03"),"MINOR");

for(const {date,rank,source} of [
 {date:"2025-04-25",rank:1,source:"Tempora/Pasc0-5"},
 {date:"2026-04-25",rank:2,source:"Sancti/04-25"},
 {date:"2027-04-25",rank:2,source:"Tempora/Pasc3-0"},
 {date:"2011-04-26",rank:1,source:"Tempora/Pasc0-2"},
 {date:"2038-04-27",rank:1,source:"Tempora/Pasc0-2"}
]){
 const host={canStart:true,date,calendarRank:rank,properSource:source,
  calendarDay:{id:"appointed-day",rank},requestedCelebrationId:"mass_of_day",celebrationId:"mass_of_day"};
 const proper={sourcePath:source,introit:{lat:"Textus diei",en:"Day's proper",fr:"Propre du jour"}};
 const resolved={date,status:"ready",day:{main:{rank}},
  proper:{status:"ready",data:{sourcePath:source}}};
 assert.equal(resolvedRogationCandidate(host).eligible,false,
  "Major day must not inherit legacy IV-class Minor fallback");
 const candidate=resolvedRogationCandidate(host,resolved,{requireResolver:true});
 assert.equal(candidate.eligible,true,date);
 assert.equal(candidate.observance,"MAJOR");
 assert.equal(candidate.votiveAllowed,rank!==1,"Votive impeded exactly on I-class Major Litany day");
 assert.equal(majorRogationPublicChoiceReady(library,candidate),rank!==1,
  "Major votive requires its independent Eastertide release gate and non-I-class day");
 assert.equal(projectRogationPreflight({legacy:host,resolvedDay:resolved,
  requireResolver:true,library}).selection,null,"Date never starts a procession");
 const selection=projectRogationPreflight({
  legacy:host,resolvedDay:resolved,requireResolver:true,library,
  choice:"DAY_MASS",service:"PUBLIC_PROCESSION"
 }).selection;
 assert.equal(selection.observance,"MAJOR");
 assert.equal(selection.dayClass,rank);
 const compiled=prepareMassSessionFromV346(host,{proper,rogationSelection:selection});
 assert.equal(compiled.plan.massEntry,"INTROIT");
 assert.deepEqual([...compiled.plan.precedingGraphs],["ROGATIONS"]);
 assert.equal(compiled.resolvedMass.proper.data.sourcePath,source,"Day Proper was overwritten");
 assert.notEqual(compiled.resolvedMass.actualCelebration.id,"rogation-mass-1962");
 assert.equal(compiled.resolvedMass.provenance.rogationSelection.observance,"MAJOR");
 assert.equal(prepareMassSessionFromV346(host,{proper}).plan.massEntry,"FOOT_CLUSTER");
 const selected=projectRogationPreflight({
  legacy:host,resolvedDay:resolved,requireResolver:true,library,
  choice:"ROGATION_MASS",service:"PUBLIC_PROCESSION"
 });
 if(rank===1){
  assert.equal(selected.selection,null);
  assert.equal(selected.reason,"VOTIVE_II_CLASS_IMPEDED");
 }else{
  assert.equal(selected.available,true);
  assert.equal(selected.selection.choice,"ROGATION_MASS");
  const mass=prepareMassSessionFromV346(host,{proper,rogationSelection:selected.selection});
  assert.equal(mass.plan.massEntry,"INTROIT");
  assert.equal(mass.resolvedMass.actualCelebration.id,"rogation-mass-1962");
  assert.equal(mass.resolvedMass.provenance.gloria,false);
  const sunday=new Date(date+"T00:00:00Z").getUTCDay()===0;
  assert.equal(mass.resolvedMass.provenance.credo,sunday,
   "1960 §343(a) retains the Creed of an occurring Sunday");
  assert.equal(mass.resolvedMass.proper.data.hasCredo,sunday);
  assert.match(mass.resolvedMass.proper.data.preface.lat,/in hoc potissimum/);
  for(const key of ["majorGate","sourceGate","sourceProper","sourcePreface"]){
   const revoked={...selected.selection,[key]:
    {...selected.selection[key],publicationAllowed:false}};
   assert.throws(()=>prepareMassSessionFromV346(host,{proper,rogationSelection:revoked}),
    /ROGATION_SELECTION_MAJOR_LITANY_VOTIVE_NOT_SOURCE_CERTIFIED/,
    "Source gate "+key+" must independently fail closed");
  }
  const mistaken={...selected.selection,observance:"MINOR"};
  assert.throws(()=>prepareMassSessionFromV346(host,{proper,rogationSelection:mistaken}),
   /ROGATION_SELECTION_ROGATION_OBSERVANCE_DATE_MISMATCH/,"Major date cannot masquerade as a Minor observance");
 }

 const supplications=projectRogationPreflight({
  legacy:host,resolvedDay:resolved,requireResolver:true,library,
  choice:"DAY_MASS",service:"ORDINARY_AUTHORIZED_SUPPLICATIONS"
 });
 assert.equal(supplications.selection.observance,"MAJOR");
 assert.equal(supplications.selection.service,"ORDINARY_AUTHORIZED_SUPPLICATIONS");
 assert.equal(prepareMassSessionFromV346(host,{proper,rogationSelection:supplications.selection})
  .plan.massEntry,"INTROIT");
 const notSameDay=resolvedRogationCandidate(host,{...resolved,date:"2026-04-25"},{requireResolver:true});
 if(date!=="2026-04-25")assert.equal(notSameDay.eligible,false);
}
for(const date of ["2026-04-24","2026-04-26","2038-04-25","2011-04-25"]){
 const host={canStart:true,date,requestedCelebrationId:"mass_of_day"};
 const resolved={date,status:"ready",day:{main:{rank:2}},
  proper:{status:"ready",data:{sourcePath:"Sancti/04-25"}}};
 assert.equal(resolvedRogationCandidate(host,resolved,{requireResolver:true}).eligible,false,date);
}
const r03={id:"ROG-R03",title:"Procession · Litany of the Saints",
 posture:"PROCESSIONAL",guide:"Rise and walk at Sancta Maria",
 paragraphs:[{latin:"Sancta Maria"}]};
const stand=contextualRogationCard(r03,{observance:"MAJOR",selectedService:"ORDINARY_AUTHORIZED_SUPPLICATIONS"});
assert.equal(stand.posture,"LOCAL_OR_STAND");
assert.match(stand.title,/Public Supplications/);
assert.match(stand.guide,/do not walk/);
const walk=contextualRogationCard(r03,{observance:"MAJOR",selectedService:"PUBLIC_PROCESSION"});
assert.equal(walk.posture,"PROCESSIONAL");
assert.match(walk.title,/Greater Litanies/);
assert.equal(walk.paragraphs,r03.paragraphs,"Canonical Litany source was copied/changed");
console.log("1960 Greater Litanies: independently certified Eastertide votive, Sunday Credo, I-class block, public litany/day Mass and stationary choreography: PASS");
