import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { calendarCustomRecommendations,calendarCustomSeasonalMonthEntries,calendarCustomArticle,CALENDAR_CUSTOM_ARTICLE_IDS } from "../src/calendar/customs-read-model.js";
import {calendarPracticeEvents} from "../src/calendar/intelligence.js";
import {v384Dates} from "../src/calendar/traditional-year-v384.js";
const seed=JSON.parse(readFileSync(new URL("../data/customs/customs-atlas-seed.v1.json",import.meta.url),"utf8"));
const licensed=new Set(seed.customs.filter(c=>c.publication_state==="PUBLISHED").map(c=>c.custom_id));
assert.equal(CALENDAR_CUSTOM_ARTICLE_IDS.length,11);
for(const id of CALENDAR_CUSTOM_ARTICLE_IDS){
  assert.ok(licensed.has(id),"An unpublished custom cannot appear: "+id);
  const a=calendarCustomArticle(id);
  for(const field of ["title","description","history","meaning","practice","caution"]){
    assert.ok(a[field]?.en&&a[field]?.fr, id+" missing bilingual "+field);
  }
  assert.ok(a.occasion.en&&a.occasion.fr&&a.scope.en&&a.scope.fr);
  assert.ok(a.sources.length&&a.sources.every(x=>/^https:\/\//.test(x.url)&&x.title));
}
const on=(date,fr=false)=>calendarCustomRecommendations(date,{events:calendarPracticeEvents(date,{fr}),fr}).map(x=>x.id);
for(const year of [2026,2027,2030]){
  const first=(()=>{let d=new Date(year,10,27,12);while(d.getDay()!==0)d.setDate(d.getDate()+1);return d.toISOString().slice(0,10);})();
  assert.ok(on(first).includes("ADVT-001"),first);
  assert.ok(on(first).includes("ADVT-002"),first);
  assert.ok(on(year+"-12-20").includes("ADVT-003"),"December 16-24 seasonal tradition");
  assert.equal(on(year+"-12-25").includes("ADVT-001"),false,"Advent ended");
  assert.ok(on(year+"-05-20").includes("MARI-002"));
  assert.equal(on(year+"-06-20").includes("MARI-002"),false);
  for(const [date,id] of [[year+"-01-06","EPIP-001"],[v384Dates(year).corpus,"CORP-001"],[v384Dates(year).holyThursday,"HTHU-001"]]){
    assert.ok(on(date).includes(id),date+" "+id);
    assert.deepEqual(on(date,true),on(date,false),"Language cannot change selected IDs");
  }
}
assert.deepEqual(calendarCustomSeasonalMonthEntries("2026-05").map(x=>x.id),["MARI-002"]);
assert.deepEqual(calendarCustomSeasonalMonthEntries("2026-12").map(x=>x.id),["ADVT-001","ADVT-002"]);
assert.deepEqual(calendarCustomSeasonalMonthEntries("2026-08"),[]);
assert.deepEqual(calendarCustomRecommendations("invalid"),[]);
const runtime=readFileSync(new URL("../src/calendar/calendar-runtime.js",import.meta.url),"utf8");
assert.match(runtime,/calendarCustomRecommendations\(selected/);
assert.match(runtime,/calendarCustomArticleMarkup/);
assert.match(runtime,/calendarCustomSeasonalMonthEntries\(monthId/);
assert.match(runtime,/\.filter\(\(\[route\]\)=>!route\.startsWith\("find:traditions:"\)\)/);
console.log("PASS: canonical Calendar customs day, season and month contextual folios, source links, bilingual copy and unpublished holds");
