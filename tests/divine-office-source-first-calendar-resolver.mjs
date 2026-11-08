/**
 * 1960 independent Office calendar -> Compline research contract.
 * This test MUST NEVER promote independently submitted calendar evidence
 * into a public Office reading or infer an Office from Mass/day of week.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
 OFFICE_COMPLINE_ORDO_EVIDENCE_SCHEMA,
 OFFICE_COMPLINE_ORDO_RUBRICS,
 OFFICE_COMPLINE_PSALTER_SECTION,
 resolveSourceFirstComplineOrdo,researchWitnessForReviewedAdventCompline,
 summarizeSourceFirstComplineCoverage
} from "../src/office/office-ordo-compline-resolver.js";
import {
 ADVENT_I_COMPLINE_APPOINTMENTS,reviewAdventIComplineAppointment
} from "../src/office/compline-advent-2026-appointments.js";
import {latinComplineReleaseEligibility,LATIN_COMPLINE_RELEASE}
 from "../src/office/latin-compline-public-release.js";
import {officeRouteState} from "../src/office/office-route-state.js";

const reviewed=ADVENT_I_COMPLINE_APPOINTMENTS.map(
 appointment=>researchWitnessForReviewedAdventCompline(appointment)
);
const clone=x=>structuredClone(x);
const restricted=(r,reason=null)=>{
 assert.equal(r.status,"WITHHELD");
 if(reason)assert.equal(r.reason,reason);
 assert.equal(r.calendarSelectionAuthorized,false);
 assert.equal(r.completeHourCertified,false);
 assert.equal(r.publishable,false);
 assert.equal(r.published,false);
};
function synthetic(base,overrides={}){
 const row=clone(base);
 return Object.assign(row,overrides);
}

test("all eight existing certified dates agree with the independent 1960 source-first resolver",()=>{
 assert.equal(reviewed.length,8);
 for(let i=0;i<reviewed.length;i++){
  const r=resolveSourceFirstComplineOrdo({
   date:ADVENT_I_COMPLINE_APPOINTMENTS[i].date,record:reviewed[i]
  });
  assert.equal(r.status,"OFFICE_PSALTER_APPOINTMENT_RESEARCH_ONLY");
  assert.equal(r.appointment.psalmDay,
   ADVENT_I_COMPLINE_APPOINTMENTS[i].psalmDay);
  assert.equal(r.appointment.marianSection,"Advent");
  assert.equal(r.appointment.sourceUrl,OFFICE_COMPLINE_ORDO_RUBRICS);
  assert.equal(r.appointment.psalterSourceRevision,
   LATIN_COMPLINE_RELEASE.sourceRevision);
  assert.equal(r.completeHourCertified,false);
  assert.equal(r.textCollated,false);
  assert.equal(r.publishable,false);
  assert.equal(r.published,false);
  const legacy=reviewAdventIComplineAppointment(r.date);
  assert.equal(legacy.status,"EXPLICIT_ROMAN_1960_APPOINTMENT_RESEARCH");
  assert.equal(legacy.officeOrdoResearch.appointment.psalmDay,
   ADVENT_I_COMPLINE_APPOINTMENTS[i].psalmDay);
  assert.equal(latinComplineReleaseEligibility({date:r.date}).status,
   "ELIGIBLE");
 }
});
test("a structurally coherent NEW dated Office source is research-only, never an automatic public release",()=>{
 const additional=clone(reviewed[5]); // Thursday III-class source profile
 additional.date="2027-02-04"; // Thursday
 additional.weekday="Feria V";
 additional.firstVespers.officeDate=additional.date;
 additional.source.sourceId="ao.office.synthetic-2027-02-04";
 const r=resolveSourceFirstComplineOrdo({date:additional.date,record:additional});
 assert.equal(r.status,"OFFICE_PSALTER_APPOINTMENT_RESEARCH_ONLY");
 assert.equal(r.appointment.psalmDay,"Feria V");
 assert.equal(r.appointment.rubricSection,"169(e)");
 assert.equal(r.calendarSelectionAuthorized,false);
 assert.equal(r.published,false);
 assert.equal(latinComplineReleaseEligibility({date:additional.date}).status,"WITHHELD");
 assert.equal(officeRouteState({date:additional.date,hour:"COMPLINE"}).published,false);
});
test("1960 Roman Compline family differences: Sundays, I-class first Vespers, II/III-class feasts",()=>{
 const sunday=synthetic(reviewed[1],{
  date:"2027-01-03",weekday:"Dominica",marianSection:"Nativiti"
 });
 sunday.firstVespers.officeDate="2027-01-03";
 sunday.marianSource.section="Nativiti";
 sunday.marianSource.sourceId="Psalterium/Mariaant#Nativiti";
 sunday.source.sourceId="ao.office.synthetic-2027-sunday";
 const sun=resolveSourceFirstComplineOrdo({date:sunday.date,record:sunday});
 assert.equal(sun.appointment.psalmDay,"Dominica");
 assert.equal(sun.appointment.rubricSection,"166(h)");
 const saturday=clone(reviewed[0]);
 saturday.date="2027-01-02";saturday.weekday="Sabbato";
 saturday.firstVespers.officeDate="2027-01-03";
 saturday.source.sourceId="ao.office.synthetic-2027-sat-before-sunday";
 const saturdayResolved=resolveSourceFirstComplineOrdo({
  date:saturday.date,record:saturday
 });
 assert.equal(saturdayResolved.appointment.psalmDay,"Sabbato");
 assert.equal(saturdayResolved.officeDate,"2027-01-03");
 assert.equal(saturdayResolved.appointment.rubricSection,"166(b)");
 const feast=clone(reviewed[1]);
 feast.date="2027-01-05";feast.weekday="Feria III";
 feast.officeKind="I_FEAST";
 feast.firstVespers={
  kind:"I_FEAST_FIRST_VESPERS",officeDate:"2027-01-06",
  independentConcurrenceReviewed:true,
  sourceId:"ao.office.synthetic-2027-01-06-i-vespers"
 };
 feast.assertedPsalmDay="Dominica";
 feast.rubricSection="167(b)";
 feast.source.sourceId="ao.office.synthetic-2027-feast-vigil";
 assert.equal(resolveSourceFirstComplineOrdo({
  date:feast.date,record:feast
 }).appointment.psalmDay,"Dominica");
 const regular=clone(reviewed[2]); // II-class St Andrew originally Monday
 assert.equal(resolveSourceFirstComplineOrdo({
  date:regular.date,record:regular
 }).appointment.rubricSection,"168(d)");
 const third=clone(reviewed[5]);
 assert.equal(resolveSourceFirstComplineOrdo({
  date:third.date,record:third
 }).appointment.rubricSection,"169(e)");
});
test("unknown provenance, mass-calendar substitutions, missing occurrence/seasonal evidence and source drift fail closed",()=>{
 const record=reviewed[1];
 restricted(resolveSourceFirstComplineOrdo({
  date:record.date,record:synthetic(record,{reviewStage:"RAW_CAPTURED_UNVERIFIED"})
 }),"INDEPENDENT_DATED_OFFICE_ORDO_RECORD_REQUIRED");
 const mass=clone(record);
 mass.source.sourceKind="MASS_PROPER_CALENDAR";
 restricted(resolveSourceFirstComplineOrdo({date:mass.date,record:mass}),
  "OFFICE_SOURCE_PROVENANCE_OR_PIN_REQUIRED");
 const badPsalm=synthetic(record,{assertedPsalmDay:"Feria V"});
 restricted(resolveSourceFirstComplineOrdo({
  date:badPsalm.date,record:badPsalm
 }),"DATED_OFFICE_PSALTER_APPOINTMENT_CONFLICT");
 const badRank=synthetic(record,{officeKind:"III_FEAST"});
 restricted(resolveSourceFirstComplineOrdo({
  date:badRank.date,record:badRank
 }),"1960_OFFICE_RUBRIC_SECTION_DISAGREEMENT");
 const unresolved=synthetic(record,{occurrenceDisposition:"MASS_RANK_GUESSED"});
 restricted(resolveSourceFirstComplineOrdo({
  date:unresolved.date,record:unresolved
 }),"OFFICE_OCCURRENCE_OR_COMMEMORATION_UNRESOLVED");
 const marian=clone(record);marian.marianSource.reviewedInOfficeOrdo=false;
 restricted(resolveSourceFirstComplineOrdo({date:marian.date,record:marian}),
  "OFFICE_WEEKDAY_OR_SEASONAL_MARIAN_EVIDENCE_INCOMPLETE");
 const noFirst=clone(reviewed[0]);
 noFirst.firstVespers.independentConcurrenceReviewed=false;
 restricted(resolveSourceFirstComplineOrdo({date:noFirst.date,record:noFirst}),
  "FIRST_VESPERS_OF_SUNDAY_NEEDS_INDEPENDENT_PROOF");
 const altered=clone(record);altered.source.psalterRevision="unverified-main";
 restricted(resolveSourceFirstComplineOrdo({date:altered.date,record:altered}),
  "OFFICE_SOURCE_PROVENANCE_OR_PIN_REQUIRED");
});
test("special Offices are withheld even when a common weekday or II-class rule superficially matches",()=>{
 const src=reviewed[1];
 for(const exception of [
  "TRIDUUM","OFFICE_OF_DEAD","EASTER_PENTECOST",
  "CHRISTMAS_VIGIL","PRIVILEGED_EXCEPTION","UNKNOWN"
 ]){
  restricted(resolveSourceFirstComplineOrdo({
   date:src.date,record:synthetic(src,{exception})
  }),"SPECIAL_OFFICE_OR_PROPER_COMPLINE_NEEDS_OWN_CERTIFICATE");
 }
 restricted(resolveSourceFirstComplineOrdo({
  date:src.date,record:synthetic(src,{properCompline:"PROPER_ANTIPHON"})
 }),"SPECIAL_OFFICE_OR_PROPER_COMPLINE_NEEDS_OWN_CERTIFICATE");
});
test("Sunday on Monday, invalid Gregorian dates, local overlays and missing Christmas octave proof never fall back",()=>{
 const record=reviewed[1];
 restricted(resolveSourceFirstComplineOrdo({
  date:"2026-02-30",record
 }),"CIVIL_DATE_INVALID");
 const monday=clone(record);
 monday.date="2026-11-30";monday.weekday="Feria II";
 monday.firstVespers.officeDate=monday.date;
 restricted(resolveSourceFirstComplineOrdo({date:monday.date,record:monday}),
  "SUNDAY_OFFICE_ON_NON_SUNDAY");
 restricted(resolveSourceFirstComplineOrdo({
  date:record.date,record,calendarScope:"LOCAL"
 }),"LOCAL_OFFICE_OR_APPROVED_COMMUNITY_ORDO_REQUIRED");
 const oct=clone(record);oct.date="2026-12-28";oct.weekday="Feria II";
 oct.officeKind="CHRISTMAS_OCTAVE";
 oct.firstVespers.officeDate=oct.date;
 oct.rubricSection="175(e)";oct.marianSection="Nativiti";
 oct.marianSource.section="Nativiti";
 oct.marianSource.sourceId="Psalterium/Mariaant#Nativiti";
 oct.source.sourceId="ao.office.synthetic-2026-octave";
 const octResearch=resolveSourceFirstComplineOrdo({date:oct.date,record:oct});
 assert.equal(octResearch.appointment.psalmDay,"Dominica");
 assert.equal(octResearch.appointment.rubricSection,"175(e)");
 assert.equal(octResearch.published,false);
});
test("2026 full-year audit remains 8 research witnesses and 357 withheld dates, not annual auto-publication",()=>{
 const all=summarizeSourceFirstComplineCoverage({year:2026,records:reviewed});
 assert.equal(all.days,365);
 assert.equal(all.sourceReviewed,8);
 assert.equal(all.withheld,357);
 assert.equal(all.published,0);
 assert.equal(all.rows.length,365);
 assert.equal(all.releaseStatus,"RESEARCH_ONLY_NOT_PUBLIC_COVERAGE");
 assert.ok(all.rows.every(row=>row.publicReleaseApproved===false));
 assert.ok(all.rows.some(row=>row.date==="2026-12-25"&&
  row.researchPsalmDay===null));
 const leap=summarizeSourceFirstComplineCoverage({year:2028,records:[]});
 assert.equal(leap.days,366);
 assert.equal(leap.withheld,366);
 assert.equal(leap.published,0);
 assert.throws(()=>summarizeSourceFirstComplineCoverage({
  year:2026,records:[reviewed[0],reviewed[0]]
 }),/DUPLICATE/);
 assert.throws(()=>summarizeSourceFirstComplineCoverage({
  year:2027,records:reviewed
 }),/OUT_OF_YEAR/);
 assert.equal(OFFICE_COMPLINE_ORDO_EVIDENCE_SCHEMA,
  "ao.office.independent-1960-compline-ordo-record.v1");
 assert.equal(OFFICE_COMPLINE_PSALTER_SECTION,
  "Psalterium/Psalmi/Psalmi minor#Completorium");
});
