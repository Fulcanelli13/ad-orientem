import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {reviewAdventI2026UniversalCommemoration as review}
 from "../src/office/advent-first-vespers-universal-commemoration.js";
const doc=JSON.parse(readFileSync(new URL(
 "../data/office/research/advent-i-2026-universal-commemoration.json",
 import.meta.url),"utf8"));
test("Advent I class I Vespers: zero UNIVERSAL commemorations under RG111, local withheld",()=>{
 const r=review({witness:doc});
 assert.equal(r.status,"UNIVERSAL_NO_COMMEMORATION_RESEARCH_REVIEWED");
 assert.equal(r.universalCommemorationCount,0);
 assert.equal(r.universalCommemorationsAuthorized,true);
 assert.equal(r.localCalendarReviewed,false);
 assert.equal(r.completeHourCertified,false);
 assert.equal(r.sourceTextCertified,false);
 assert.equal(r.publishable,false);
 assert.equal(r.published,false);
 assert.deepEqual(r.evidenceRefs,["RG13","RG11a","RG108-111",
 "2026-11-28-ordo","2026-11-29-ordo"]);
});
test("cannot make St Saturninus or Saturday BVM a privileged commemoration",()=>{
 for(const edit of [
  d=>{d.encountered[0].privileged=true},
  d=>{d.encountered[1].commemorationPermitted=true},
  d=>{d.encountered[1].class=1},
  d=>{d.principal.class=2},
  d=>{d.principal.kind="FEAST"},
  d=>{d.officePart="SECOND"},
  d=>{d.officeDate="2026-11-28"},
  d=>{d.ruleset="MASS_CALENDAR"}
 ]){
  const d=structuredClone(doc);edit(d);
  const r=review({witness:d});
  assert.equal(r.status,"WITHHELD");
  assert.equal(r.universalCommemorationsAuthorized,false);
 }
});
test("never silently decide local calendar or grant completed/published Hour",()=>{
 for(const edit of [
  d=>{d.calendarScope="LOCAL"},
  d=>{d.localCalendar="REVIEWED"},
  d=>{d.localExceptionsResolved=true},
  d=>{d.completeHourCertified=true},
  d=>{d.liturgicalTextPublished=true},
  d=>{d.evidence[2].url="https://example.com"},
  d=>{d.encountered.push({id:"another"})}
 ]){
  const d=structuredClone(doc);edit(d);
  assert.equal(review({witness:d}).status,"WITHHELD");
 }
});
