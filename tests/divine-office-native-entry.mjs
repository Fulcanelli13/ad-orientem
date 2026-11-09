import test from "node:test";
import assert from "node:assert/strict";
import {ROMAN_OFFICE_HOURS,officeRouteState} from "../src/office/office-route-state.js";
test("Roman Office keeps eight separate canonical Hours",()=>{
  assert.deepEqual(ROMAN_OFFICE_HOURS.map(x=>x.id),
   ["MATINS","LAUDS","PRIME","TERCE","SEXT","NONE","VESPERS","COMPLINE"]);
});
test("all eight source-verified Advent Compline dates now release, other Hours remain gated",()=>{
  for(const date of ["2026-11-28","2026-11-29","2026-11-30","2026-12-01","2026-12-02","2026-12-03","2026-12-04","2026-12-05"]){
    const result=officeRouteState({date,hour:"COMPLINE"});
    const released=true;
    assert.equal(result.status,released?"RELEASED":"SOURCE_RESEARCH_ONLY");
    assert.equal(result.readingEnabled,released);
    assert.equal(result.published,released);
  }
});
test("Immaculate Conception first Vespers has 8 December Office date on civil 7 December",()=>{
 const r=officeRouteState({date:"2026-12-07",hour:"COMPLINE"});
 assert.equal(r.status,"RELEASED");
 assert.equal(r.officeDate,"2026-12-08");
 assert.equal(r.published,true);
 const saturday=officeRouteState({date:"2026-12-12",hour:"COMPLINE"});
 assert.equal(saturday.officeDate,"2026-12-13");
 assert.equal(saturday.published,true);
});
test("Ember Saturday first Vespers retains Advent IV Office date while praying Saturday Compline",()=>{
 const r=officeRouteState({date:"2026-12-19",hour:"COMPLINE"});
 assert.equal(r.status,"RELEASED");
 assert.equal(r.officeDate,"2026-12-20");
 assert.equal(r.published,true);
 const sunday=officeRouteState({date:"2026-12-20",hour:"COMPLINE"});
 assert.equal(sunday.officeDate,"2026-12-20");
 assert.equal(sunday.published,true);
});
test("First Vespers retains separate civil and Office dates",()=>{
  const r=officeRouteState({date:"2026-11-28",hour:"VESPERS"});
  assert.equal(r.status,"SOURCE_RESEARCH_ONLY");
  assert.match(r.label,/29 November/);
  assert.equal(r.date,"2026-11-28");
  assert.equal(r.officeDate,"2026-11-29");
  assert.equal(r.published,false);
});
test("Missing dates, variants and unresearched Hours cannot fill from Mass",()=>{
  for(const args of [
    {date:"2026-11-08",hour:"COMPLINE"},
    {date:"2027-01-09",hour:"COMPLINE"},
    {date:"2026-11-28",hour:"MATINS"},
    {date:"2026-11-28",hour:"COMPLINE",calendarScope:"LOCAL"},
    {date:"2026-02-30",hour:"VESPERS"},
    {date:"2026-11-28",hour:"UNKNOWN"}
  ]){
    const r=officeRouteState(args);
    assert.equal(r.status,"WITHHELD");
    assert.equal(r.readingEnabled,false);
    assert.equal(r.published,false);
  }
});
