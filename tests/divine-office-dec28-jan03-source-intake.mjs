import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DEC28_JAN03_FINITE_DATES,DEC28_JAN03_COMPLINE_SOURCE_SCHEMA,
 DEC28_JAN03_COMPLINE_SOURCE_STATUS,
 reviewDec28Jan03ComplineResearch,researchDec28Jan03PrivateComplineAppointment}
 from "../src/office/compline-dec28-jan03-2027-source-gate.js";
import {latinComplineReleaseEligibility,loadPublishedLatinCompline,
 LATIN_COMPLINE_RELEASE,CHRISTMAS_2026_COMPLINE_RELEASE}
 from "../src/office/latin-compline-public-release.js";
import {officeRouteState} from "../src/office/office-route-state.js";
import {COMPLINE_CONTEXT,COMPLINE_MINISTER}
 from "../src/office/compline-recitation-projection.js";

const ledger=JSON.parse(readFileSync(new URL(
 "../data/office/research/compline-dec28-jan03-2027-source-intake.v1.json",
 import.meta.url),"utf8"));
const record=date=>ledger.dates.find(x=>x.date===date);
test("seven finite dated year-boundary source appointments never authorize publication",()=>{
 assert.equal(ledger.schema,DEC28_JAN03_COMPLINE_SOURCE_SCHEMA);
 assert.equal(ledger.status,"RESEARCH_ONLY_WITHHELD");
 assert.equal(ledger.completeHourCertified,false);
 assert.equal(ledger.publicReleaseApproved,false);
 assert.equal(ledger.printed1961MamePsalterLeafCollated,false);
 assert.deepEqual(ledger.dates.map(x=>x.date),DEC28_JAN03_FINITE_DATES);
 assert.equal(new Set(DEC28_JAN03_FINITE_DATES).size,7);
 for(const date of DEC28_JAN03_FINITE_DATES){
  const r=record(date);
  const reviewed=reviewDec28Jan03ComplineResearch({date,record:r});
  assert.equal(reviewed.status,DEC28_JAN03_COMPLINE_SOURCE_STATUS,
   date+" "+reviewed.reason);
  assert.equal(reviewed.appointment.officeDate,r.officeDate);
  assert.equal(reviewed.appointment.psalmDay,r.psalmDay);
  assert.deepEqual(reviewed.appointment.psalmIds,r.psalmIds);
  assert.equal(reviewed.appointment.marianSection,"Nativiti");
  assert.equal(reviewed.appointment.printedPsalmFrames,r.printedPsalmFrames);
  assert.equal(reviewed.calendarSelectionAuthorized,false);
  assert.equal(reviewed.sourceTextCertified,false);
  assert.equal(reviewed.published,false);
  const privateResearch=researchDec28Jan03PrivateComplineAppointment(date);
  assert.equal(privateResearch.status,"EXPLICIT_DEC28_JAN03_PRIVATE_SOURCE_RESEARCH");
  assert.equal(privateResearch.published,false);
  assert.equal(privateResearch.appointment.officeDate,r.officeDate);
 }
});
test("date rollover, octave and Holy Name II-class Sunday Compline are independently fixed",()=>{
 const tuesday=record("2026-12-29"),wednesday=record("2026-12-30");
 assert.equal(tuesday.psalmDay,"Dominica");assert.equal(tuesday.rule,"175(e)");
 assert.equal(wednesday.psalmDay,"Dominica");assert.equal(wednesday.rule,"175(e)");
 assert.equal(record("2026-12-28").psalmDay,"Dominica");
 const eve=record("2026-12-31");
 assert.equal(eve.officeDate,"2027-01-01");
 assert.equal(eve.firstVespers,"CIRCUMCISION_I_VESPERS");
 assert.equal(eve.psalmDay,"Dominica");
 const saturday=record("2027-01-02");
 assert.equal(saturday.firstVespers,"HOLY_NAME_I_VESPERS");
 assert.equal(saturday.officeDate,"2027-01-03");
 assert.equal(saturday.psalmDay,"Dominica");
 assert.deepEqual(saturday.psalmIds,[4,90,133]);
 assert.equal(saturday.printedPsalmFrames,30);
 assert.equal(record("2027-01-03").psalmDay,"Dominica");
 assert.equal(record("2027-01-03").officeClass,"II_FEAST_ON_SUNDAY");
});
test("all important cross-year/office/psalter/Marian mutations are rejected",()=>{
 const mutations=[
  ["2026-12-28",{officeClass:"III_FEAST"}],
  ["2026-12-29",{psalmDay:"Feria III"}],
  ["2026-12-30",{psalmDay:"Feria IV"}],
  ["2026-12-29",{psalmIds:[11,12,15]}],
  ["2026-12-31",{officeDate:"2026-12-31"}],
  ["2026-12-31",{firstVespers:"NONE"}],
  ["2027-01-01",{psalmDay:"Feria VI"}],
  ["2027-01-02",{psalmDay:"Sabbato"}],
  ["2027-01-02",{printedPsalmFrames:41}],
  ["2027-01-02",{officeDate:"2027-01-02"}],
  ["2027-01-03",{officeClass:"ORDINARY_SUNDAY"}],
  ["2027-01-03",{marianSection:"Advent"}],
  ["2026-12-29",{textVerified:true}],
  ["2027-01-02",{published:true}],
  ["2027-01-03",{specialHolds:[]}]
 ];
 for(const [date,changes] of mutations){
  const r=reviewDec28Jan03ComplineResearch({
   date,record:{...record(date),...changes}
  });
  assert.equal(r.status,"WITHHELD",date+" "+JSON.stringify(changes));
  assert.equal(r.published,false);
 }
 for(const date of ["2026-12-27","2027-01-04","2027-12-29"]){
  assert.equal(reviewDec28Jan03ComplineResearch({
   date,record:{...record("2026-12-28"),date}
  }).status,"WITHHELD");
  assert.equal(researchDec28Jan03PrivateComplineAppointment(date).status,"WITHHELD");
 }
});
test("independent dated source intake remains research-only under separate authorized Latin certificate",()=>{
 assert.equal(LATIN_COMPLINE_RELEASE.approvedDates.length,23);
 assert.equal(CHRISTMAS_2026_COMPLINE_RELEASE.approvedDates.length,7);
 for(const date of DEC28_JAN03_FINITE_DATES){
  const source=reviewDec28Jan03ComplineResearch({date,record:record(date)});
  assert.equal(source.status,DEC28_JAN03_COMPLINE_SOURCE_STATUS);
  assert.equal(source.sourceTextCertified,false);
  assert.equal(source.calendarSelectionAuthorized,false);
  assert.equal(source.published,false);
  const publicPermission=latinComplineReleaseEligibility({date});
  assert.equal(publicPermission.status,"ELIGIBLE");
  assert.equal(publicPermission.certificateFamily,"YEAR_BOUNDARY_2027_FINITE_LATIN");
  const route=officeRouteState({date,hour:"COMPLINE"});
  assert.equal(route.status,"RELEASED");
 }
});
