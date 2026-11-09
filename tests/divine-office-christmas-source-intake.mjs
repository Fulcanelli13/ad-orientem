import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CHRISTMAS_COMPLINE_RESEARCH_SCHEMA,
 CHRISTMAS_COMPLINE_RESEARCH_STATUS,CHRISTMAS_2026_FINITE_RESEARCH_DATES,
 reviewChristmas2026ComplineResearch}
 from "../src/office/compline-christmas-2026-research-gate.js";
import {LATIN_COMPLINE_RELEASE,latinComplineReleaseEligibility,
 loadPublishedLatinCompline}
 from "../src/office/latin-compline-public-release.js";
import {reviewAdventIComplineAppointment}
 from "../src/office/compline-advent-2026-appointments.js";
import {officeRouteState}
 from "../src/office/office-route-state.js";
import {COMPLINE_CONTEXT,COMPLINE_MINISTER}
 from "../src/office/compline-recitation-projection.js";

const ledger=JSON.parse(readFileSync(new URL(
 "../data/office/research/compline-christmas-21-27-dec-2026-source-intake.v1.json",
 import.meta.url),"utf8"));
const records=ledger.dates;
const byDate=date=>records.find(x=>x.date===date);
const mutate=(date,changes)=>({...byDate(date),...changes});

test("finite dated independent Christmas source review is research-only, never a release certificate",()=>{
 assert.equal(ledger.schema,CHRISTMAS_COMPLINE_RESEARCH_SCHEMA);
 assert.equal(ledger.status,"RESEARCH_ONLY_WITHHELD");
 assert.equal(ledger.publicReleaseApproved,false);
 assert.equal(ledger.completeHourCertified,false);
 assert.equal(ledger.newLatinTextCollated,false);
 assert.equal(ledger.sourceFacsimileMame1961Certified,false);
 assert.equal(records.length,7);
 assert.equal(new Set(records.map(r=>r.date)).size,7);
 assert.deepEqual(records.map(r=>r.date),CHRISTMAS_2026_FINITE_RESEARCH_DATES);
 for(const record of records){
  const review=reviewChristmas2026ComplineResearch({date:record.date,record});
  assert.equal(review.status,CHRISTMAS_COMPLINE_RESEARCH_STATUS,record.date+" "+review.reason);
  assert.equal(review.psalmDayResearchOnly,record.psalterHypothesis);
  assert.equal(review.officeDateResearchOnly,record.officeDateHypothesis);
  assert.equal(review.calendarSelectionAuthorized,false);
  assert.equal(review.completeHourCertified,false);
  assert.equal(review.sourceTextCertified,false);
  assert.equal(review.published,false);
  assert.equal(review.publishable,false);
  assert.equal(record.textVerified,false);
  assert.equal(record.published,false);
 }
});

test("21 December St Thomas is II-class festive with Advent feria commemoration",()=>{
 const r=byDate("2026-12-21");
 assert.equal(r.class,"II_FEAST");
 assert.equal(r.rubricHypothesis,"168(d)");
 assert.equal(r.psalterHypothesis,"Dominica");
 assert.equal(r.marianSectionHypothesis,"Advent");
 assert.equal(r.commemorationHypothesis,"Advent feria");
});

test("22–23 December privileged Advent ferias retain weekday Compline, not Sunday or Christmas",()=>{
 for(const [date,psalter] of [
  ["2026-12-22","Feria III"],["2026-12-23","Feria IV"]
 ]){
  const r=byDate(date);
  assert.equal(r.class,"II_FERIA");
  assert.equal(r.rubricHypothesis,"171(e)");
  assert.equal(r.psalterHypothesis,psalter);
  assert.equal(r.marianVerseHypothesis,"Angelus Domini");
  assert.equal(r.marianCollectHypothesis,undefined);
 }
});

test("24 December evening is Christmas I Compline on liturgical 25 December, with Post partum",()=>{
 const r=byDate("2026-12-24");
 assert.equal(r.civilDayOffice,"Vigil of the Nativity I class");
 assert.equal(r.class,"I_FEAST_FIRST_VESPERS");
 assert.equal(r.firstVespersHypothesis,"NATIVITY_I_VESPERS");
 assert.equal(r.officeDateHypothesis,"2026-12-25");
 assert.equal(r.psalterHypothesis,"Dominica");
 assert.equal(r.marianSectionHypothesis,"Nativiti");
 assert.equal(r.marianVerseHypothesis,"Post partum");
 assert.equal(r.marianCollectHypothesis,"Deus qui salutis");
 assert.ok(r.specialHold.includes("CHRISTMAS_VIGIL_SPECIAL_ORDER_173"));
 assert.ok(r.specialHold.includes("FULL_LATIN_FIRST_COMPLINE_REVIEW"));
});

test("26 Dec St Stephen keeps II Vespers and Sunday Compline; 27 Dec Sunday governs St John",()=>{
 const stephen=byDate("2026-12-26");
 const sunday=byDate("2026-12-27");
 assert.equal(stephen.firstVespersHypothesis,"NONE_ST_STEPHEN_II_VESPERS_SUNDAY_COMM");
 assert.equal(stephen.commemorationHypothesis,"Sunday within Christmas Octave");
 assert.equal(stephen.psalterHypothesis,"Dominica");
 assert.equal(stephen.rubricHypothesis,"168(d)");
 assert.equal(sunday.class,"CHRISTMAS_OCTAVE_SUNDAY");
 assert.equal(sunday.psalterHypothesis,"Dominica");
 assert.equal(sunday.commemorationHypothesis,"Saint John Apostle and Evangelist");
 assert.equal(sunday.rubricHypothesis,"175(e); 176");
});

test("mutated officeDate, psalms, feast, Marian terminus or concurrence can never pass research review",()=>{
 const mutations=[
  ["2026-12-21",{class:"FERIA"}],
  ["2026-12-22",{psalterHypothesis:"Dominica"}],
  ["2026-12-23",{marianSectionHypothesis:"Nativiti"}],
  ["2026-12-24",{officeDateHypothesis:"2026-12-24"}],
  ["2026-12-24",{psalterHypothesis:"Feria V"}],
  ["2026-12-24",{firstVespersHypothesis:"NONE"}],
  ["2026-12-24",{marianVerseHypothesis:"Angelus Domini"}],
  ["2026-12-24",{marianCollectHypothesis:"Collecta Adventus"}],
  ["2026-12-25",{marianVerseHypothesis:"Angelus Domini"}],
  ["2026-12-26",{firstVespersHypothesis:"SUNDAY_FIRST_VESPERS"}],
  ["2026-12-26",{psalterHypothesis:"Sabbato"}],
  ["2026-12-27",{principalOffice:"Saint John Apostle and Evangelist"}],
  ["2026-12-27",{commemorationHypothesis:null}],
  ["2026-12-27",{rubricHypothesis:"169(e)"}],
  ["2026-12-24",{textVerified:true}],
  ["2026-12-25",{publishable:true}],
  ["2026-12-26",{published:true}],
  ["2026-12-26",{specialHold:[]}],
  ["2026-12-24",{reviewStage:"AUTOMATIC_MASS_CALENDAR_MATCH"}]
 ];
 for(const [date,change] of mutations){
  const review=reviewChristmas2026ComplineResearch({
   date,record:mutate(date,change)
  });
  assert.equal(review.status,"WITHHELD",date+" "+JSON.stringify(change));
  assert.equal(review.published,false);
  assert.equal(review.calendarSelectionAuthorized,false);
 }
 for(const date of ["2026-12-20","2026-12-28","2027-12-24"]){
  assert.equal(reviewChristmas2026ComplineResearch({
   date,record:mutate("2026-12-24",{date})
  }).status,"WITHHELD");
 }
});

test("Christmas intake remains research-only; public release uses a separate pinned certificate",()=>{
 assert.equal(LATIN_COMPLINE_RELEASE.approvedDates.length,23);
 assert.equal(LATIN_COMPLINE_RELEASE.approvedDates.at(-1),"2026-12-20");
 for(const {date} of records){
  const source=reviewChristmas2026ComplineResearch({date,record:byDate(date)});
  assert.equal(source.status,"DATED_ORDO_RESEARCH_ONLY_COMPLETE_HOUR_WITHHELD");
  assert.equal(source.published,false);
  assert.equal(source.calendarSelectionAuthorized,false);
  assert.equal(reviewAdventIComplineAppointment(date).status,"WITHHELD");
  assert.equal(latinComplineReleaseEligibility({date}).status,"ELIGIBLE");
  const route=officeRouteState({date,hour:"COMPLINE"});
  assert.equal(route.status,"RELEASED");
  assert.equal(route.published,true);
 }
});
