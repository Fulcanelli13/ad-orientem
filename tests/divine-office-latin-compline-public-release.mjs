import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {latinComplineReleaseEligibility,loadPublishedLatinCompline,
 LATIN_COMPLINE_RELEASE}
 from "../src/office/latin-compline-public-release.js";
import {officeRouteState} from "../src/office/office-route-state.js";
import {getDivineOfficePrayerReadiness}
 from "../src/pray/divine-office-readiness-gate.js";

test("twenty-three separately certified Latin Advent Compline dates; no Mame 1961 facsimile",()=>{
 assert.equal(LATIN_COMPLINE_RELEASE.date,"2026-11-28");
 assert.deepEqual(LATIN_COMPLINE_RELEASE.approvedDates,[
  "2026-11-28","2026-11-29","2026-11-30","2026-12-01",
  "2026-12-02","2026-12-03","2026-12-04","2026-12-05",
  "2026-12-06","2026-12-07","2026-12-08","2026-12-09",
  "2026-12-10","2026-12-11","2026-12-12","2026-12-13",
  "2026-12-14","2026-12-15","2026-12-16","2026-12-17",
  "2026-12-18","2026-12-19","2026-12-20"]);
 assert.equal(LATIN_COMPLINE_RELEASE.language,"la");
 assert.equal(LATIN_COMPLINE_RELEASE.sourcePsalterFamily,"VULGATA_BIBLIORUM");
 assert.equal(LATIN_COMPLINE_RELEASE.target1961Edition,"MAME_1961_VULGATA");
 assert.equal(LATIN_COMPLINE_RELEASE.target1961PsalterFamily,"VULGATA_BIBLIORUM");
 assert.equal(LATIN_COMPLINE_RELEASE.exact1961EditionPsalterLeafVerified,false);
 assert.equal(LATIN_COMPLINE_RELEASE.ordinary1961SequenceReviewed,true);
 assert.equal(LATIN_COMPLINE_RELEASE.saturdayAppointmentReviewed,true);
 assert.equal(LATIN_COMPLINE_RELEASE.psalter1961VerbatimCollated,false);
 assert.equal(latinComplineReleaseEligibility({date:"2026-12-05"}).status,"ELIGIBLE");
 assert.equal(latinComplineReleaseEligibility({date:"2026-11-29"}).status,"ELIGIBLE");
 assert.equal(latinComplineReleaseEligibility({date:"2026-11-30"}).status,"ELIGIBLE");
 for(const date of ["2026-12-01","2026-12-02","2026-12-03","2026-12-04"])
  assert.equal(latinComplineReleaseEligibility({date}).status,"ELIGIBLE");
 assert.equal(LATIN_COMPLINE_RELEASE.printedVulgatePatternDualWitnessCollated,true);
 assert.equal(LATIN_COMPLINE_RELEASE.sundayPrintedVulgate329WordsDualWitnessCollated,true);
 assert.equal(LATIN_COMPLINE_RELEASE.weekdayIndependentClementine1536WordsCollated,true);
 assert.equal(LATIN_COMPLINE_RELEASE.weekdayPrintedAppointmentsReviewed,true);
 assert.equal(LATIN_COMPLINE_RELEASE.adventIIIndependentOfficeOrdoDatedWitnessReviewed,true);
 assert.equal(LATIN_COMPLINE_RELEASE.adventIILatinPsalterUsesPreviouslyCertifiedNinePlusFourSources,true);
 assert.equal(LATIN_COMPLINE_RELEASE.adventIIIIndependentEmberOrdoDatedWitnessReviewed,true);
 assert.equal(LATIN_COMPLINE_RELEASE.monday337WordsIndependentClementineExact,true);
 assert.equal(LATIN_COMPLINE_RELEASE.releaseBasis,"ROMAN_1960_OFFICE_TRADITIONAL_VULGATE_LATIN");
 assert.equal(LATIN_COMPLINE_RELEASE.completeHourCollated,true);
 assert.equal(LATIN_COMPLINE_RELEASE.rightsApproved,true);
 assert.equal(LATIN_COMPLINE_RELEASE.publicReleaseApproved,true);
 for(const date of LATIN_COMPLINE_RELEASE.approvedDates){
  const r=latinComplineReleaseEligibility({
   date,hour:"COMPLINE",calendarScope:"UNIVERSAL"
  });
  assert.equal(r.status,"ELIGIBLE",date);
  assert.equal(r.date,date);
  assert.equal(r.published,true);
  assert.equal(r.sourceTextReleased,true);
  assert.equal(r.exact1961PsalterLeafVerified,false);
  assert.equal(r.language,"la");
  assert.equal(r.printedPsalmDisplayFrames,({
   "2026-11-28":41,"2026-11-29":30,"2026-11-30":30,
   "2026-12-01":26,"2026-12-02":30,"2026-12-03":33,
   "2026-12-04":36,"2026-12-05":41,"2026-12-06":30,
   "2026-12-07":30,"2026-12-08":30,"2026-12-09":30,
   "2026-12-10":33,"2026-12-11":36,"2026-12-12":41,
   "2026-12-13":30,"2026-12-14":28,"2026-12-15":26,
   "2026-12-16":30,"2026-12-17":33,"2026-12-18":36,
   "2026-12-19":41,"2026-12-20":30
  })[date]);
 }
});
test("no public Office route can fetch unapproved source words",async()=>{
 for(const options of [
  {date:"2026-11-28",hour:"VESPERS"},
  {date:"2027-01-09",hour:"COMPLINE"},
  {date:"2027-01-10",hour:"COMPLINE"},
  {date:"2027-01-11",hour:"COMPLINE"},
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
 assert.equal(r.sourceTextReleased,true);
 assert.equal(r.publishable,true);
 assert.equal(r.published,true);
 assert.equal(r.rightsApproved,true);
 assert.equal(r.translationApproved,false);
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
test("1961 Vulgata Compline cannot be certified from a 1961 Pius XII Psalter edition",()=>{
 const witness=JSON.parse(readFileSync(new URL(
  "../data/office/research/1961-psalter-edition-families.v1.json",import.meta.url),"utf8"));
 assert.equal(witness.target.targetEdition,LATIN_COMPLINE_RELEASE.target1961Edition);
 assert.equal(witness.target.sourcePsalterFamily,LATIN_COMPLINE_RELEASE.sourcePsalterFamily);
 assert.equal(witness.target.specificPrintedPsalterPagesSeen,false);
 assert.equal(witness.target.fullVerbatimCollationCertified,false);
 assert.equal(witness.editionWitnesses.length,4);
 assert.ok(witness.editionWitnesses.some(x=>x.id==="MAME_1961_VULGATA"&&
  x.targetFamilyMatch&&x.psalterFamily==="VULGATA_BIBLIORUM"));
 assert.ok(witness.editionWitnesses.some(x=>x.id==="MAME_1961_PIUS_XII"&&
  !x.targetFamilyMatch&&x.psalterFamily!=="VULGATA_BIBLIORUM"));
 assert.ok(witness.editionWitnesses.every(x=>x.verifiedSaturdayPsalmFullPages===false));
 assert.equal(witness.scannedIntro.fullPsalterEvidence,false);
 for(const [key,value] of Object.entries(witness.releaseFlags))
  assert.equal(LATIN_COMPLINE_RELEASE[key],value,key+" unapproved promotion");
 assert.equal(latinComplineReleaseEligibility({date:"2026-11-28"}).status,"ELIGIBLE");
 assert.equal(LATIN_COMPLINE_RELEASE.psalter1961VerbatimCollated,false);
});
