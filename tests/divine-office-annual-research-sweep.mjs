import test from "node:test";
import assert from "node:assert/strict";
import {sweepAnnualOfficeResearch}
 from "../src/office/annual-research-sweep.js";
import {OFFICE_PRECEDENCE_RULESET,OFFICE_PRECEDENCE_SOURCE}
 from "../src/office/precedence-review.js";

function day(date,id,kind,pos,{first=false,second=true}={}){
 return {
  date,officeCalendarEvidence:"INDEPENDENT_OFFICE_CANDIDATES_RESEARCH",
  localCalendarStatus:"UNIVERSAL_ONLY",
  candidates:[{
   id,date,kind,tablePosition:pos,
   class:pos<=13?1:pos<=21?2:pos<=27?3:4,
   ruleset:OFFICE_PRECEDENCE_RULESET,calendarScope:"UNIVERSAL",
   witness:{rubricSource:OFFICE_PRECEDENCE_SOURCE,sourceId:"synthetic:"+id},
   hasFirstVespers:first,hasSecondVespers:second,
   printedOfficeCertified:false,sourceTextApproved:false
  }]
 };
}
test("no Office day evidence yields zero fabricated coverage and a complete 2026 sweep",()=>{
 const r=sweepAnnualOfficeResearch({year:2026});
 assert.equal(r.summary.days,365);
 assert.equal(r.summary.plannedHours,2920);
 assert.equal(r.summary.plannedLocaleSlots,8760);
 assert.equal(r.summary.submittedOfficeResearchDays,0);
 assert.equal(r.summary.researchCandidateHours,0);
 assert.equal(r.summary.withheldHours,2920);
 assert.equal(r.summary.parsedSourceSections,0);
 assert.equal(r.summary.independentlyCertifiedHours,0);
 assert.equal(r.summary.publishedHours,0);
 assert.equal(r.dates.length,365);
 assert.equal(r.dates[0].hours.length,8);
 assert.equal(r.dates.at(-1).date,"2026-12-31");
 assert.equal(r.reasons.INDEPENDENT_OFFICE_CALENDAR_DAY_NOT_SUPPLIED,2920);
 assert.equal(r.published,0);
 assert.equal(r.allYearLiturgicalDiscrepanciesActuallyChecked,false);
 assert.ok(r.knownSourceBlockers.some(x=>x.key==="2026-11-02|PRIME|en"));
 assert.ok(r.knownSourceBlockers.some(x=>x.key==="2026-11-01|VESPERS|fr"));
});
test("one evidence-backed research day does not create the missing following Vespers",()=>{
 const d=day("2026-11-05","feria","FERIA",28);
 const r=sweepAnnualOfficeResearch({year:2026,officeDays:[d]});
 assert.equal(r.summary.submittedOfficeResearchDays,1);
 assert.equal(r.summary.researchCandidateDates,1);
 assert.equal(r.summary.researchCandidateHours,7);
 assert.equal(r.summary.withheldHours,2913);
 const m=r.dates.find(x=>x.date===d.date);
 assert.equal(m.hours.find(h=>h.hour==="LAUDS").state,
  "RESEARCH_PRECEDENCE_CANDIDATE");
 assert.equal(m.hours.find(h=>h.hour==="VESPERS").reason,
  "FOLLOWING_OFFICE_CALENDAR_DAY_NOT_SUPPLIED");
 assert.equal(r.summary.completeTrilingualHours,0);
});
test("two adjacent research days allow a *candidate* First Vespers, not certification",()=>{
 const a=day("2026-10-31","saturday-feria","FERIA",28,{second:false});
 const b=day("2026-11-01","all-saints","FEAST",11,{first:true});
 const r=sweepAnnualOfficeResearch({year:2026,officeDays:[a,b]});
 assert.equal(r.summary.researchCandidateHours,15);
 assert.equal(r.summary.withheldHours,2905);
 const v=r.dates.find(d=>d.date===a.date).hours.find(h=>h.hour==="VESPERS");
 assert.equal(v.officeDate,"2026-11-01");
 assert.equal(v.officePart,"FIRST");
 assert.equal(v.officeKey,"all-saints");
 assert.equal(v.trilingualTextVerified,false);
 assert.equal(v.publishable,false);
 assert.equal(r.summary.publishedHours,0);
});
test("leap-year 2028 slot count is 366 x eight x three, with no publication",()=>{
 const r=sweepAnnualOfficeResearch({year:2028});
 assert.equal(r.summary.days,366);
 assert.equal(r.summary.plannedHours,2928);
 assert.equal(r.summary.plannedLocaleSlots,8784);
 assert.equal(r.summary.researchCandidateHours,0);
 assert.equal(r.knownSourceBlockers.length,0);
});
test("duplicate source-calendar entries and date ranges are rejected",()=>{
 const a=day("2026-10-31","sat","FERIA",28,{second:false});
 assert.throws(()=>sweepAnnualOfficeResearch({year:2026,officeDays:[a,a]}),
  /OFFICE_SWEEP_ROSTER_ENTRY_INVALID/);
 assert.throws(()=>sweepAnnualOfficeResearch({
  year:2026,officeDays:[day("2025-12-31","prev","FERIA",28)]
 }),/OFFICE_SWEEP_ROSTER_ENTRY_INVALID/);
 assert.throws(()=>sweepAnnualOfficeResearch({year:2026,officeDays:"invalid"}),
  /OFFICE_SWEEP_ROSTER_INVALID/);
});
test("a next-year Office candidate can inform Dec 31 Vespers only",()=>{
 const a=day("2026-12-31","feria","FERIA",28,{second:true});
 const b=day("2027-01-01","octave","FEAST",11,{first:true});
 const r=sweepAnnualOfficeResearch({year:2026,officeDays:[a,b]});
 assert.equal(r.summary.submittedOfficeResearchDays,2);
 assert.equal(r.summary.researchCandidateDates,1);
 const v=r.dates.at(-1).hours.find(h=>h.hour==="VESPERS");
 assert.equal(v.officeDate,"2027-01-01");
 assert.equal(v.officePart,"FIRST");
 assert.equal(r.summary.plannedHours,2920);
});
test("invalid or non-independent Office witness yields no candidate coverage",()=>{
 const a=day("2026-11-05","feria","FERIA",28);
 a.candidates[0].witness.rubricSource="MASS_CALENDAR";
 const r=sweepAnnualOfficeResearch({year:2026,officeDays:[a]});
 assert.equal(r.summary.researchCandidateHours,0);
 assert.equal(r.summary.submittedOfficeResearchDays,1);
 assert.equal(r.summary.publishedHours,0);
});
