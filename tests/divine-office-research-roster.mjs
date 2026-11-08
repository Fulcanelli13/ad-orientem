import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {sweepAnnualOfficeResearch} from "../src/office/annual-research-sweep.js";
import {OFFICE_PRECEDENCE_SOURCE}
 from "../src/office/precedence-review.js";

const roster=JSON.parse(readFileSync(
 new URL("../data/office/research/2026-office-pilot-ordo-roster.json",import.meta.url),"utf8"
));
test("six research days carry exact-source references but no Office-text certification",()=>{
 assert.deepEqual(roster.map(d=>d.date),[
  "2026-10-31","2026-11-01","2026-11-02",
  "2026-11-03","2026-11-28","2026-11-29"
 ]);
 assert.ok(roster.every(day=>
  day.researchProvenance.sourceRevision===DIVINUM_OFFICIUM_PIN&&
  day.researchProvenance.rubricReference===OFFICE_PRECEDENCE_SOURCE&&
  day.researchProvenance.pinnedOfficeResearchPR.endsWith("/1860")&&
  day.researchProvenance.corroboratingCalendarUrl.includes(day.date)&&
  day.researchProvenance.wholeOfficeVerified===false&&
  day.researchProvenance.translationVerified===false&&
  day.researchProvenance.sourceRightsApproved===false
 ));
 assert.ok(roster.every(day=>day.candidates.every(c=>c.sourceTextApproved===false&&
  c.printedOfficeCertified===false)));
});
test("consolidated 2026 roster yields exact scoped evidence counts, not 48 complete Hours",()=>{
 const r=sweepAnnualOfficeResearch({year:2026,officeDays:roster});
 assert.equal(r.summary.days,365);
 assert.equal(r.summary.plannedLocaleSlots,8760);
 assert.equal(r.summary.submittedOfficeResearchDays,6);
 assert.equal(r.summary.sourceWitnessDays,6);
 assert.equal(r.summary.sourceHeadingsObserved,34);
 assert.equal(r.summary.researchCandidateDates,4);
 assert.equal(r.summary.researchCandidateHours,15);
 assert.equal(r.summary.withheldHours,2905);
 assert.equal(r.summary.parsedSourceSections,0);
 assert.equal(r.summary.completeTrilingualHours,0);
 assert.equal(r.summary.independentlyCertifiedHours,0);
 assert.equal(r.summary.publishedHours,0);
 assert.equal(r.published,0);
});
test("All Saints Sunday retains rival Sunday disposition as an explicit blocker",()=>{
 const r=sweepAnnualOfficeResearch({year:2026,officeDays:roster});
 const saints=r.dates.find(d=>d.date==="2026-11-01");
 assert.equal(saints.officeCalendarResearchCandidate,false);
 assert.ok(saints.hours.every(h=>h.state==="WITHHELD"));
 assert.ok(saints.hours.every(h=>
  h.reason==="OCCURRENCE_IMPEDED_OFFICE_DISPOSITION_UNRESOLVED"));
 const eve=r.dates.find(d=>d.date==="2026-10-31");
 assert.equal(eve.hours.find(h=>h.hour==="VESPERS").reason,
  "FOLLOWING_OCCURRENCE_UNRESOLVED");
});
test("All Souls stays special, and pinned EN Prime and FR commemoration flags survive",()=>{
 const r=sweepAnnualOfficeResearch({year:2026,officeDays:roster});
 const souls=r.dates.find(d=>d.date==="2026-11-02");
 assert.equal(souls.hours.find(h=>h.hour==="PRIME").reason,
  "OCCURRENCE_SPECIAL_OFFICE_REQUIRES_OWN_RUBRICS");
 assert.ok(r.knownSourceBlockers.some(x=>x.key==="2026-11-02|PRIME|en"));
 assert.ok(r.knownSourceBlockers.some(x=>x.key==="2026-11-01|VESPERS|fr"));
});
test("Advent Sunday First Vespers is a research candidate only; unobserved Hours withheld",()=>{
 const r=sweepAnnualOfficeResearch({year:2026,officeDays:roster});
 const sat=r.dates.find(d=>d.date==="2026-11-28");
 const vs=sat.hours.find(h=>h.hour==="VESPERS");
 assert.equal(vs.state,"RESEARCH_PRECEDENCE_CANDIDATE");
 assert.equal(vs.officeDate,"2026-11-29");
 assert.equal(vs.officePart,"FIRST");
 assert.equal(vs.officeKey,"advent-one-2026-11-29");
 assert.equal(vs.sourceSectionsParsed,0);
 assert.ok(sat.hours.filter(h=>h.hour!=="VESPERS").every(h=>
  h.reason==="PINNED_OFFICE_RESEARCH_HOUR_HEADLINE_NOT_OBSERVED"));
});
test("wrong source pin or fabricated observed-Hour list fails before annual sweep",()=>{
 const modified=structuredClone(roster);
 modified[0].researchProvenance.sourceRevision="0".repeat(40);
 assert.throws(()=>sweepAnnualOfficeResearch({year:2026,officeDays:modified}),
  /OFFICE_SWEEP_SOURCE_WITNESS_METADATA_INVALID/);
 const modified2=structuredClone(roster);
 modified2[4].researchProvenance.observedHourHeadings.push("MATINS");
 assert.throws(()=>sweepAnnualOfficeResearch({year:2026,officeDays:modified2}),
  /OFFICE_SWEEP_SOURCE_WITNESS_METADATA_INVALID/);
});
test("Mass-only calendar evidence cannot replace pinned Office pilot provenance",()=>{
 const modified=structuredClone(roster);
 modified[3].researchProvenance.pinnedOfficeResearchPR="https://ordo.fsspx.org/day/2026-11-03?lang=en";
 assert.throws(()=>sweepAnnualOfficeResearch({year:2026,officeDays:modified}),
  /OFFICE_SWEEP_SOURCE_WITNESS_METADATA_INVALID/);
});
