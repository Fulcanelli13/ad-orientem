import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {latinComplineReleaseEligibility,loadPublishedLatinCompline,
 LATIN_COMPLINE_RELEASE}
 from "../src/office/latin-compline-public-release.js";
import {officeRouteState} from "../src/office/office-route-state.js";
import {getDivineOfficePrayerReadiness}
 from "../src/pray/divine-office-readiness-gate.js";

test("exact 28 November Latin Compline is prepared but never represented as published",()=>{
 assert.equal(LATIN_COMPLINE_RELEASE.date,"2026-11-28");
 assert.equal(LATIN_COMPLINE_RELEASE.language,"la");
 assert.equal(LATIN_COMPLINE_RELEASE.ordinary1961SequenceReviewed,true);
 assert.equal(LATIN_COMPLINE_RELEASE.saturdayAppointmentReviewed,true);
 assert.equal(LATIN_COMPLINE_RELEASE.psalter1961VerbatimCollated,false);
 assert.equal(LATIN_COMPLINE_RELEASE.completeHourCollated,false);
 assert.equal(LATIN_COMPLINE_RELEASE.rightsApproved,false);
 assert.equal(LATIN_COMPLINE_RELEASE.publicReleaseApproved,false);
 const r=latinComplineReleaseEligibility({
  date:"2026-11-28",hour:"COMPLINE",calendarScope:"UNIVERSAL"
 });
 assert.equal(r.status,"WITHHELD");
 assert.equal(r.published,false);
 assert.equal(r.sourceTextReleased,false);
 assert.deepEqual(r.frames,[]);
});
test("no public Office route can fetch unapproved source words",async()=>{
 for(const options of [
  {date:"2026-11-28",hour:"COMPLINE"},
  {date:"2026-11-28",hour:"VESPERS"},
  {date:"2026-11-29",hour:"COMPLINE"},
  {date:"2026-12-05",hour:"COMPLINE"},
  {date:"2026-11-28",hour:"COMPLINE",calendarScope:"LOCAL"},
  {date:"2027-11-28",hour:"COMPLINE"},
  {date:"2026-11-28",hour:"MATINS"}
 ]){
  let calls=0;
  const result=await loadPublishedLatinCompline({
   ...options,fetchSource:async()=>{
    calls++;throw Error("Network fetch was not authorized");
   }
  });
  assert.equal(result.status,"WITHHELD");
  assert.equal(result.published,false);
  assert.equal(result.frames.length,0);
  assert.equal(calls,0);
  const route=officeRouteState(options);
  assert.equal(route.readingEnabled,false);
  assert.equal(route.published,false);
 }
});
test("public Prayer readiness is exact-date publication-gated, not Mass-driven",()=>{
 const r=getDivineOfficePrayerReadiness({date:"2026-11-28"});
 assert.equal(r.publicRouteEnabled,true);
 assert.equal(r.sourceTextReleased,false);
 assert.equal(r.publishable,false);
 assert.equal(r.published,false);
 assert.equal(r.rightsApproved,false);
});
test("new public module is isolated from local-only research control",()=>{
 const page=readFileSync(new URL("../src/office/latin-compline-public-page.js",import.meta.url),"utf8");
 const route=readFileSync(new URL("../src/office/prayer-office-reader.js",import.meta.url),"utf8");
 assert.match(page,/loadPublishedLatinCompline/u);
 assert.match(page,/textContent=text/u);
 assert.doesNotMatch(page,/innerHTML\s*=/u);
 assert.match(route,/latinComplineReleaseEligibility/u);
 assert.match(route,/current.status==="RELEASED"/u);
 assert.match(route,/mountPublishedLatinCompline/u);
 assert.match(route,/officePrivateSourceReviewAllowed/u);
});