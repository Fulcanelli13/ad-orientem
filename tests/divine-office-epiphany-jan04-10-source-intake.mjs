import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {JAN04_10_DATES,JAN04_10_SOURCE_SCHEMA,
 JAN04_10_RESEARCH_STATUS,
 reviewJan04_10ComplineSource,researchJan04_10PrivateComplineAppointment}
 from "../src/office/compline-epiphany-jan04-10-2027-source-gate.js";
import {latinComplineReleaseEligibility,
 LATIN_COMPLINE_RELEASE,CHRISTMAS_2026_COMPLINE_RELEASE,
 DEC28_JAN03_LATIN_COMPLINE_RELEASE,loadPublishedLatinCompline}
 from "../src/office/latin-compline-public-release.js";
import {officeRouteState} from "../src/office/office-route-state.js";
import {COMPLINE_CONTEXT,COMPLINE_MINISTER}
 from "../src/office/compline-recitation-projection.js";
const ledger=JSON.parse(readFileSync(new URL(
 "../data/office/research/compline-epiphany-jan04-10-2027-source-intake.v1.json",
 import.meta.url),"utf8"));
const record=date=>ledger.dates.find(x=>x.date===date);
test("Jan4–10 exact dated Office source hypotheses are auditable but NEVER authorize public fetch",()=>{
 assert.equal(ledger.schema,JAN04_10_SOURCE_SCHEMA);
 assert.equal(ledger.status,"RESEARCH_ONLY_WITHHELD");
 assert.equal(ledger.publicReleaseApproved,false);
 assert.equal(ledger.completeHourCertified,false);
 assert.deepEqual(ledger.dates.map(x=>x.date),JAN04_10_DATES);
 assert.equal(new Set(JAN04_10_DATES).size,7);
 assert.equal(LATIN_COMPLINE_RELEASE.approvedDates.length,23);
 assert.equal(CHRISTMAS_2026_COMPLINE_RELEASE.approvedDates.length,7);
 assert.equal(DEC28_JAN03_LATIN_COMPLINE_RELEASE.approvedDates.length,7);
 for(const date of JAN04_10_DATES){
  const r=record(date);
  const q=reviewJan04_10ComplineSource({date,record:r});
  assert.equal(q.status,JAN04_10_RESEARCH_STATUS,date+" "+q.reason);
  assert.equal(q.appointment.officeDate,r.officeDate);
  assert.equal(q.appointment.psalmDay,r.psalmDay);
  assert.deepEqual(q.appointment.psalmIds,r.psalmIds);
  assert.equal(q.appointment.marianSection,"Nativiti");
  assert.equal(q.completeHourTextCertified,false);
  assert.equal(q.publicReleaseApproved,false);
  assert.equal(q.published,false);
  const p=researchJan04_10PrivateComplineAppointment(date);
  assert.equal(p.status,"EXPLICIT_EPIPHANY_2027_PRIVATE_SOURCE_RESEARCH");
  assert.equal(p.rightsApproved,false);
  assert.equal(p.calendarSelectionAuthorized,false);
 }
});
test("Epiphany and Holy Family precedence use Sunday psalms, including both First Vespers dates",()=>{
 const epiphanyEve=record("2027-01-05");
 assert.equal(epiphanyEve.weekday,"Feria III");
 assert.equal(epiphanyEve.firstVespers,"EPIPHANY_I_VESPERS");
 assert.equal(epiphanyEve.officeDate,"2027-01-06");
 assert.equal(epiphanyEve.psalmDay,"Dominica");
 assert.equal(epiphanyEve.rubric,"167(b)");
 assert.deepEqual(epiphanyEve.psalmIds,[4,90,133]);
 assert.equal(record("2027-01-06").rubric,"167(h)");
 const familyEve=record("2027-01-09");
 assert.equal(familyEve.weekday,"Sabbato");
 assert.equal(familyEve.officeClass,"II_FEAST_FIRST_VESPERS");
 assert.equal(familyEve.firstVespers,"HOLY_FAMILY_I_VESPERS");
 assert.equal(familyEve.officeDate,"2027-01-10");
 assert.equal(familyEve.psalmDay,"Dominica");
 assert.equal(familyEve.rubric,"168(d)");
 assert.deepEqual(familyEve.psalmIds,[4,90,133]);
 assert.equal(record("2027-01-10").rubric,"168(d)");
 for(const date of ["2027-01-05","2027-01-06","2027-01-09","2027-01-10"])
  assert.equal(record(date).printedPsalmFrames,30);
 assert.equal(record("2027-01-04").printedPsalmFrames,28);
 assert.equal(record("2027-01-07").printedPsalmFrames,33);
 assert.equal(record("2027-01-08").printedPsalmFrames,36);
});
test("doxology and chant under review remain explicit, not fabricated approved Latin",()=>{
 for(const date of ["2027-01-09","2027-01-10"]){
  const r=record(date);
  assert.ok(r.specialHolds.includes(
   "HOLY_FAMILY_DOXOLOGY_SOURCE_CONFLICT_1960_BR_188_VS_ICRSP"));
  const q=reviewJan04_10ComplineSource({date,record:r});
  assert.equal(q.chantToneCertified,false);
  assert.equal(q.completeHourTextCertified,false);
 }
});
test("mutating Sunday/ferial Compline, Epiphany or Holy Family rollover fails closed",()=>{
 const modifications=[
  ["2027-01-04",{psalmDay:"Dominica"}],
  ["2027-01-05",{psalmDay:"Feria III"}],
  ["2027-01-05",{officeDate:"2027-01-05"}],
  ["2027-01-05",{firstVespers:"NONE"}],
  ["2027-01-06",{psalmDay:"Feria IV"}],
  ["2027-01-07",{psalmDay:"Dominica"}],
  ["2027-01-08",{psalmDay:"Dominica"}],
  ["2027-01-09",{psalmDay:"Sabbato"}],
  ["2027-01-09",{officeDate:"2027-01-09"}],
  ["2027-01-10",{psalmDay:"Sabbato"}],
  ["2027-01-10",{marianSection:"Advent"}],
  ["2027-01-09",{specialHolds:[]}],
  ["2027-01-09",{published:true}],
  ["2027-01-08",{textVerified:true}],
  ["2027-01-05",{rightsApproved:true}]
 ];
 for(const [date,change] of modifications){
  const q=reviewJan04_10ComplineSource({
   date,record:{...record(date),...change}
  });
  assert.equal(q.status,"WITHHELD",date+" "+JSON.stringify(change));
 }
 for(const date of ["2027-01-03","2027-01-11","2028-01-05"]){
  assert.equal(reviewJan04_10ComplineSource({
   date,record:{...record("2027-01-05"),date}
  }).status,"WITHHELD");
  assert.equal(researchJan04_10PrivateComplineAppointment(date).status,"WITHHELD");
 }
});
test("dated Holy Family intake remains private research; independent public certificate authorizes its dates",()=>{
 for(const date of ["2027-01-09","2027-01-10"]){
  const research=reviewJan04_10ComplineSource({date,record:record(date)});
  assert.equal(research.status,JAN04_10_RESEARCH_STATUS);
  assert.equal(research.completeHourTextCertified,false);
  assert.equal(research.published,false);
  const permission=latinComplineReleaseEligibility({date});
  assert.equal(permission.status,"ELIGIBLE");
  assert.equal(permission.certificateFamily,"HOLY_FAMILY_JAN09_10_FINITE_LATIN");
  const route=officeRouteState({date,hour:"COMPLINE"});
  assert.equal(route.status,"RELEASED");
  assert.equal(route.officeDate,"2027-01-10");
 }
});
