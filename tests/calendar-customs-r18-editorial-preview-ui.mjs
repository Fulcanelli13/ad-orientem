import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CALENDAR_R18_REVIEW_CANDIDATES} from "../src/calendar/customs-r18-review-pack.js";
import {calendarCustomRecommendations,calendarCustomArticleIds,calendarR18ReviewRecommendations} from "../src/calendar/customs-read-model.js";

const source=JSON.parse(readFileSync(new URL("../src/calendar/customs-r18-first-six-staging.v1.json",import.meta.url),"utf8"));
const runtime=readFileSync(new URL("../src/calendar/calendar-runtime.js",import.meta.url),"utf8");
const fields=["review_key","working_master_id","canonical_article_id","article","sources","calendar_association","release_state","signoffs","publication_allowed"];
const trimmed=source.records.map(row=>Object.fromEntries(fields.map(key=>[key,row[key]])));
assert.deepEqual(CALENDAR_R18_REVIEW_CANDIDATES,trimmed,"Generated JS review pack must exactly match published-free staging JSON");
assert.equal(CALENDAR_R18_REVIEW_CANDIDATES.length,6);
assert.equal(calendarCustomArticleIds().length,35);
assert.ok(runtime.includes('CALENDAR_R18_REVIEW_CANDIDATES'));
assert.ok(runtime.includes('data-cal-r18-review-region'));
assert.ok(runtime.includes('R18_REVIEW_REGION_STORAGE_KEY'));
assert.ok(runtime.includes('function r18ReviewRegion()'));
assert.ok(runtime.includes('r18ReviewSelectorMarkup()'));
assert.ok(runtime.includes('r18Review:{enabled:Boolean(regionCode),regionCode,candidates:CALENDAR_R18_REVIEW_CANDIDATES}'));
assert.ok(runtime.includes('setR18ReviewRegion(picker.value)'));
assert.ok(runtime.includes('Editorial preview — not published'));
assert.ok(runtime.includes('Aperçu éditorial — non publié'));
assert.ok(!runtime.includes('customs-r18-first-six-staging.v1.json'));
assert.ok(!runtime.includes('geolocation'));
assert.ok(!runtime.includes('navigator.language'));
assert.ok(!runtime.includes('navigator.geolocation'));
const cases=[
 ["2026-03-17","IE",["CANDIDATE-STPATRICK-RIBBON"]],
 ["2026-12-24","IE",["CANDIDATE-IRISH-CHRISTMAS-CANDLE"]],
 ["2026-12-25","IE",["CANDIDATE-IRISH-CHRISTMAS-CANDLE"]],
 ["2026-12-24","PL",["CUST-XMAS-POLISH-HAY"]],
 ["2026-12-04","AT",["CUST-BARBARA-BRANCHES"]],
 ["2026-12-24","FR-PROVENCE",["CUST-XMAS-PROVENCAL-PAIN-CALENDAL"]],
 ["2026-01-05","ES",["CUST-EPIPHANY-SPANISH-MAGI-GIFTS"]],
 ["2026-01-06","ES",["CUST-EPIPHANY-SPANISH-MAGI-GIFTS"]],
 ["2026-12-04","IE",[]],
 ["2026-03-17","FR-PROVENCE",[]],
 ["2026-12-24","ES",[]],
 ["2026-12-04","",[]]
];
for(const [date,regionCode,ids] of cases){
 const canonical=calendarCustomRecommendations(date);
 const opted=calendarCustomRecommendations(date,{r18Review:{enabled:!!regionCode,regionCode,candidates:CALENDAR_R18_REVIEW_CANDIDATES}});
 assert.deepEqual(opted.slice(0,canonical.length),canonical,date);
 const appended=opted.slice(canonical.length);
 assert.deepEqual(appended.map(x=>x.id),ids.map(id=>"REVIEW:"+id),date+":"+regionCode);
 for(const row of appended){
   assert.equal(row.previewOnly,true);
   assert.equal(row.publication_state,"RESEARCH_DRAFT_NOT_PUBLISHED");
   assert.ok(row.sources.every(s=>s.url.startsWith("https://")));
 }
}
const none=calendarR18ReviewRecommendations("2026-12-24",{enabled:false,regionCode:"PL",candidates:CALENDAR_R18_REVIEW_CANDIDATES});
assert.equal(none.length,0);
for(const row of source.records){
 assert.equal(row.publication_allowed,false);
 assert.equal(row.canonical_article_id,null);
 assert.ok(Object.values(row.signoffs).every(x=>x===false));
 assert.equal(row.calendar_association.trigger_enabled,false);
 assert.equal(row.calendar_association.recurrence_enabled,false);
}
assert.equal(calendarCustomArticleIds().length,35);
console.log("PASS R18 actual Calendar regional preview: six source-exact bilingual candidates; explicit interest only; zero global defaults; 35 accepted identities unchanged");
