import test from "node:test";
import assert from "node:assert/strict";
import {OFFICE_BETA_HOURS,OFFICE_BETA_CATALOG_SCHEMA,
 reviewOfficeBetaSelection,officeBetaImplementedHours}
 from "../src/office/reader-beta-catalog.js";
import {ANNUAL_OFFICE_HOURS} from "../src/office/annual-readiness-register.js";
import {DIVINUM_OFFICIUM_PIN as PIN}
 from "../src/app/source-transport-compat.js";

test("all eight canonical Hours have a reusable date/Hour selection, without a year-scale capture",()=>{
 assert.deepEqual(OFFICE_BETA_HOURS,ANNUAL_OFFICE_HOURS);
 assert.equal(OFFICE_BETA_HOURS.length,8);
 const available=officeBetaImplementedHours();
 assert.equal(available.length,9);
 assert.deepEqual(available.map(x=>x.key).slice(0,3),[
  "advent-i-2026-first-vespers",
  "advent-i-2026-saturday-compline",
  "advent-i-2026-ferial-tuesday-compline"]);
 assert.deepEqual(available.slice(3).map(x=>x.civilDate),
  ["2026-11-29","2026-11-30","2026-12-02","2026-12-03",
   "2026-12-04","2026-12-05"]);
 assert.ok(Object.isFrozen(available));
 assert.ok(Object.isFrozen(available[0]));
});
test("the one source-first First Vespers research pilot retains its distinct civil/Office dates",()=>{
 const r=reviewOfficeBetaSelection({date:"2026-11-28",hour:"VESPERS"});
 assert.equal(r.schema,OFFICE_BETA_CATALOG_SCHEMA);
 assert.equal(r.status,"SOURCE_FIRST_RESEARCH_PREVIEW_AVAILABLE");
 assert.equal(r.entry.civilDate,"2026-11-28");
 assert.equal(r.entry.officeDate,"2026-11-29");
 assert.equal(r.entry.hour,"VESPERS");
 assert.equal(r.entry.officePart,"FIRST");
 assert.equal(r.entry.sourceRevision,PIN);
 assert.deepEqual(r.entry.languages,["la","en","fr"]);
 assert.equal(r.canPreview,true);
 assert.equal(r.publicReaderEnabled,false);
 assert.equal(r.completeHourCertified,false);
 assert.equal(r.publishable,false);
 assert.equal(r.published,false);
 assert.equal(r.entry.translationsApproved,false);
 assert.equal(r.entry.rightsApproved,false);
});
test("Saturday Compline is separately appointed for November 28, not automatically assigned Sunday psalms",()=>{
 const r=reviewOfficeBetaSelection({date:"2026-11-28",hour:"COMPLINE"});
 assert.equal(r.status,"SOURCE_FIRST_RESEARCH_PREVIEW_AVAILABLE");
 assert.equal(r.entry.officeDate,"2026-11-28");
 assert.equal(r.entry.hour,"COMPLINE");
 assert.equal(r.entry.assembly,"SATURDAY_COMPLINE_2026_SOURCE_FIRST");
 assert.equal(r.entry.publishable,false);
 assert.equal(r.entry.rightsApproved,false);
 assert.equal(r.entry.completeHourCertified,false);
});
test("Tuesday Advent I ferial Compline is explicitly appointed, not guessed for an arbitrary weekday",()=>{
 const r=reviewOfficeBetaSelection({date:"2026-12-01",hour:"COMPLINE"});
 assert.equal(r.status,"SOURCE_FIRST_RESEARCH_PREVIEW_AVAILABLE");
 assert.equal(r.entry.officeDate,"2026-12-01");
 assert.equal(r.entry.assembly,"FERIAL_TUESDAY_COMPLINE_2026_SOURCE_FIRST");
 assert.equal(r.entry.rightsApproved,false);
 assert.equal(r.entry.publishable,false);
 assert.equal(r.published,false);
});
test("reviewed week has eight distinct Compline dates, while II-class St Andrew uses Sunday Psalms",()=>{
 for(const date of ["2026-11-28","2026-11-29","2026-11-30",
  "2026-12-01","2026-12-02","2026-12-03","2026-12-04",
  "2026-12-05"]){
  const r=reviewOfficeBetaSelection({date,hour:"COMPLINE"});
  assert.equal(r.status,"SOURCE_FIRST_RESEARCH_PREVIEW_AVAILABLE");
  assert.equal(r.entry.publishable,false);
 }
 const andrew=reviewOfficeBetaSelection({date:"2026-11-30",hour:"COMPLINE"});
 assert.equal(andrew.entry.appointedPsalmDay,"Dominica");
 assert.equal(andrew.entry.officeClass,"II_FEAST");
});
test("date/Hour combinations not implemented do not silently render any Office",()=>{
 for(const args of [
  {date:"2026-11-28",hour:"LAUDS"},
  {date:"2026-11-29",hour:"VESPERS"},
  {date:"2026-12-06",hour:"COMPLINE"},
  {date:"2026-12-08",hour:"COMPLINE"},
  {date:"2026-10-30",hour:"VESPERS"},
  {date:"2027-11-27",hour:"VESPERS"}
 ]){
  const r=reviewOfficeBetaSelection(args);
  assert.equal(r.status,"NOT_AVAILABLE");
  assert.equal(r.reason,"DATE_HOUR_NOT_YET_IMPLEMENTED");
  assert.equal(r.entry,null);
  assert.equal(r.canPreview,false);
  assert.equal(r.publishable,false);
  assert.equal(r.published,false);
 }
});
test("malformed dates, nonexistent dates, noncanonical Hours and absent selections are blocked",()=>{
 for(const args of [
  {},{date:"2026-02-30",hour:"VESPERS"},
  {date:"2026-13-01",hour:"VESPERS"},
  {date:"2026-11-28",hour:"MASS"},
  {date:"2026-11-28",hour:""},
  {date:"tomorrow",hour:"VESPERS"},
  {date:"2026-11-28",hour:"vespers"},
  {date:"2026-11-28",hour:null}
 ]){
  const r=reviewOfficeBetaSelection(args);
  assert.equal(r.status,"NOT_AVAILABLE");
  assert.equal(r.reason,"INVALID_DATE_OR_CANONICAL_HOUR");
  assert.equal(r.canPreview,false);
 }
});
