import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {sweepAnnualOfficeResearch}
 from "../src/office/annual-research-sweep.js";
const index=JSON.parse(readFileSync(new URL(
 "../data/office/source-index/roman-1960-pinned-latin-filenames.json",
 import.meta.url),"utf8"));
test("all-season metadata sweep is 2026-wide and cannot increase Office coverage",()=>{
 const a=sweepAnnualOfficeResearch({year:2026,filenameIndex:index,expandedTemporal:true});
 assert.equal(a.summary.days,365);
 assert.equal(a.summary.plannedLocaleSlots,8760);
 assert.equal(a.summary.pinnedDirectoryFilenamesIndexed,1185);
 assert.ok(a.summary.expandedTemporalProposedPaths>200);
 assert.equal(a.summary.expandedTemporalProposedPaths,
   a.summary.expandedTemporalListedFilenames+
   a.summary.expandedTemporalNotListedFilenames);
 assert.equal(a.summary.expandedTemporalSourceDocumentsRead,0);
 assert.equal(a.summary.researchCandidateHours,0);
 assert.equal(a.summary.completeTrilingualHours,0);
 assert.equal(a.summary.independentlyCertifiedHours,0);
 assert.equal(a.summary.publishedHours,0);
 assert.equal(a.allYearLiturgicalDiscrepanciesActuallyChecked,false);
 const ash=a.dates.find(d=>d.date==="2026-02-18");
 assert.ok(ash.expandedTemporalLeads.some(x=>x.path==="Tempora/Quadp3-3"&&
  x.filenameStatus==="PINNED_LATIN_FILENAME_LISTED"&&
  x.officeAppointed===false));
 const may=a.dates.find(d=>d.date==="2026-05-24");
 assert.ok(may.expandedTemporalLeads.some(x=>x.path==="Tempora/Pasc7-0"));
});
test("leap-year 2028 retains correct 8784 targets with no invented Offices",()=>{
 const a=sweepAnnualOfficeResearch({year:2028,filenameIndex:index,expandedTemporal:true});
 assert.equal(a.summary.days,366);
 assert.equal(a.summary.plannedLocaleSlots,8784);
 assert.ok(a.summary.expandedTemporalProposedPaths>200);
 assert.equal(a.summary.expandedTemporalProposedPaths,
   a.summary.expandedTemporalListedFilenames+
   a.summary.expandedTemporalNotListedFilenames);
 assert.equal(a.summary.publishedHours,0);
 assert.equal(a.summary.sourceFilesVerifiedByThisSweep,0);
});
test("unknown or invalid temporal mode fails without changing legacy defaults",()=>{
 const baseline=sweepAnnualOfficeResearch({year:2026});
 assert.equal(baseline.summary.expandedTemporalProposedPaths,0);
 assert.equal(baseline.dates[0].expandedTemporalLeads,null);
 assert.throws(()=>sweepAnnualOfficeResearch({year:2026,expandedTemporal:"yes"}),
  /OFFICE_SWEEP_TEMPORAL_MODE_INVALID/);
});
