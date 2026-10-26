import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { calendarCustomRecommendations,calendarCustomSeasonalMonthEntries,calendarCustomArticle,CALENDAR_CUSTOM_ARTICLE_IDS } from "../src/calendar/customs-read-model.js";
import {calendarPracticeEvents} from "../src/calendar/intelligence.js";
import {v384Dates} from "../src/calendar/traditional-year-v384.js";
const seed=JSON.parse(readFileSync(new URL("../data/customs/customs-atlas-seed.v1.json",import.meta.url),"utf8"));
const licensed=new Set(seed.customs.filter(c=>c.publication_state==="PUBLISHED").map(c=>c.custom_id));
assert.equal(CALENDAR_CUSTOM_ARTICLE_IDS.length,37);
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
assert.deepEqual(calendarCustomSeasonalMonthEntries("2026-05").map(x=>x.id),["DEV-001","MARI-002"]);
assert.deepEqual(calendarCustomSeasonalMonthEntries("2026-12").map(x=>x.id),["ADVT-001","ADVT-002"]);
assert.deepEqual(calendarCustomSeasonalMonthEntries("2026-06").map(x=>x.id),["DOM-006"]);
assert.deepEqual(calendarCustomSeasonalMonthEntries("2026-11").map(x=>x.id),["DEAD-001","ADVT-001","ADVT-002"]);
assert.deepEqual(calendarCustomSeasonalMonthEntries("2026-08"),[]);
assert.deepEqual(calendarCustomRecommendations("invalid"),[]);
const runtime=readFileSync(new URL("../src/calendar/calendar-runtime.js",import.meta.url),"utf8");
assert.match(runtime,/calendarCustomRecommendations\(selected/);
assert.match(runtime,/calendarCustomArticleMarkup/);
assert.match(runtime,/calendarCustomSeasonalMonthEntries\(monthId/);
assert.match(runtime,/\.filter\(\(\[route\]\)=>!route\.startsWith\("find:traditions:"\)\)/);
console.log("PASS: canonical Calendar customs day, season and month contextual folios, source links, bilingual copy and unpublished holds");

const pinnedDates={
  "2026-01-06":["EPIP-003"],"2026-02-02":["DOM-011","CRIB-001"],"2026-02-03":["BLSS-001"],
  "2026-03-19":["SJOS-001"],"2026-06-13":["SANT-001"],
  "2026-07-25":["SCHR-001"],"2026-08-15":["MARI-001","BLSS-002"],
  "2026-11-02":["DEAD-001","DEAD-003"],"2026-12-06":["SNIC-001"],
  "2026-12-27":["BLSS-003"]
};
for(const [date,ids] of Object.entries(pinnedDates)){
  const found=on(date);
  for(const id of ids)assert.ok(found.includes(id),date+" missing "+id);
  assert.deepEqual(found,on(date,true),"English/French timing drift on "+date);
}
for(const year of [2026,2027,2030]){
  const x=v384Dates(year);
  assert.ok(on(x.palm).includes("DOM-013"));
  assert.ok(on(x.holySaturday).includes("BLSS-004"));
  assert.equal(on(x.easter).includes("BLSS-004"),false);
}
for(const id of ["DEV-006","DOM-002","NDAY-001"]){
  assert.ok(calendarCustomArticle(id),"undated published identity not browsable");
  assert.ok(!on("2026-10-21").includes(id),"undated custom given invented date");
}
assert.match(runtime,/calendarCustomCatalogueMarkup/);
assert.match(runtime,/data-cal-custom-search/);
const extraFile=readFileSync(new URL("../src/calendar/customs-extra-articles.js",import.meta.url),"utf8");
assert.match(extraFile,/CALENDAR_ARTICLE_SCOPE_ACCEPTED/);
const copyDecisions=JSON.parse(readFileSync(new URL("../data/customs/calendar-copy-acceptance.v1.json",import.meta.url),"utf8"));
assert.equal(copyDecisions.accepted_copy_count,24);
assert.equal(copyDecisions.scope_decisions.length,24);
const evidence=JSON.parse(readFileSync(new URL("../data/customs/source-registry.v1.json",import.meta.url),"utf8"));
const sourceIds=new Set(evidence.sources.map(row=>row.id));
for(const row of copyDecisions.scope_decisions){
  assert.ok(licensed.has(row.custom_id),"Copy approval on non-published ID");
  assert.equal(row.decision,"CALENDAR_BILINGUAL_ARTICLE_ACCEPTED");
  assert.ok(row.source_ids.length&&row.source_ids.every(id=>sourceIds.has(id)));
  assert.ok(calendarCustomArticle(row.custom_id),"Copy approval without visible article");
}
assert.match(runtime,/seasonalCustoms\.map\(item=>calendarCustomArticle\(item.id\)\)/,"Month suggestion should directly expand the article");
assert.doesNotMatch(runtime,/seasonalCustoms\.map\(item=>\`<button[^>]+data-cal-month-index-date/,"Month seasonal customs cannot navigate to arbitrary dates");

assert.ok(!CALENDAR_CUSTOM_ARTICLE_IDS.some(id=>id.startsWith("CUST-")),"unpublished research identities leaked");
