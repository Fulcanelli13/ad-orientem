import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 CALENDAR_R18_REVIEW_REGION_CODES,
 calendarR18ReviewRecommendations,
 calendarCustomRecommendations,
 calendarCustomArticleIds,
 calendarCustomArticle,
 calendarCustomSeasonalMonthEntries
} from "../src/calendar/customs-read-model.js";

const corpus=JSON.parse(readFileSync(new URL("../src/calendar/customs-r18-first-six-staging.v1.json",import.meta.url),"utf8"));
const candidates=corpus.records;
const regions=["IE","PL","AT","FR-PROVENCE","ES"];
assert.deepEqual(CALENDAR_R18_REVIEW_REGION_CODES,regions);
assert.equal(calendarCustomArticleIds().length,35);
assert.equal(candidates.length,6);
assert.equal(candidates.every(r=>r.publication_allowed===false),true);
for(const code of regions){
 const result=calendarR18ReviewRecommendations("2026-12-24",{enabled:false,regionCode:code,candidates});
 assert.equal(result.length,0);
}
const expected=[
 ["2026-03-17","IE",["CANDIDATE-STPATRICK-RIBBON"]],
 ["2026-12-24","IE",["CANDIDATE-IRISH-CHRISTMAS-CANDLE"]],
 ["2026-12-25","IE",["CANDIDATE-IRISH-CHRISTMAS-CANDLE"]],
 ["2026-12-24","PL",["CUST-XMAS-POLISH-HAY"]],
 ["2026-12-04","AT",["CUST-BARBARA-BRANCHES"]],
 ["2026-12-24","FR-PROVENCE",["CUST-XMAS-PROVENCAL-PAIN-CALENDAL"]],
 ["2026-01-05","ES",["CUST-EPIPHANY-SPANISH-MAGI-GIFTS"]],
 ["2026-01-06","ES",["CUST-EPIPHANY-SPANISH-MAGI-GIFTS"]],
 ["2026-06-24","IE",[]],
 ["2026-12-24","ES",[]],
 ["2026-03-17","PL",[]],
 ["2026-12-04","IE",[]]
];
for(const [date,regionCode,ids] of expected){
 const opts={enabled:true,regionCode,candidates};
 const raw=calendarR18ReviewRecommendations(date,opts);
 assert.deepEqual(raw.map(x=>x.id),ids.map(x=>"REVIEW:"+x),date+" "+regionCode);
 assert.equal(Object.isFrozen(raw),true);
 for(const x of raw){
  assert.equal(x.previewOnly,true);
  assert.equal(x.publication_state,"RESEARCH_DRAFT_NOT_PUBLISHED");
  assert.equal(x.regionCode,regionCode);
  assert.equal(calendarCustomArticle(x.id),null);
  assert.equal(calendarCustomArticleIds().includes(x.id),false);
  assert.ok(x.description.en&&x.description.fr&&x.history.en&&x.history.fr);
  assert.ok(x.sources.some(s=>s.url.startsWith("https://")));
 }
 const canonical=calendarCustomRecommendations(date);
 const combined=calendarCustomRecommendations(date,{r18Review:opts});
 assert.deepEqual(combined.slice(0,canonical.length),canonical);
 assert.deepEqual(combined.slice(canonical.length).map(x=>x.id),raw.map(x=>x.id));
 assert.equal(calendarCustomRecommendations(date).some(x=>x.previewOnly),false);
}
assert.equal(calendarR18ReviewRecommendations("2026-12-24",{enabled:true,regionCode:"",candidates}).length,0);
assert.equal(calendarR18ReviewRecommendations("2026-12-24",{enabled:true,regionCode:"WORLD",candidates}).length,0);
assert.equal(calendarR18ReviewRecommendations("nonsense",{enabled:true,regionCode:"IE",candidates}).length,0);
assert.equal(calendarR18ReviewRecommendations("2026-12-24",{enabled:true,regionCode:"IE",candidates:null}).length,0);
assert.equal(calendarR18ReviewRecommendations("2026-12-24",{enabled:true,regionCode:"ie",candidates}).length,1);
assert.equal(calendarR18ReviewRecommendations("2026-12-24",{enabled:true,regionCode:"IE",candidates:[...candidates,...candidates]}).length,1);
const polluted=JSON.parse(JSON.stringify(candidates.find(r=>r.working_master_id==="CANDIDATE-IRISH-CHRISTMAS-CANDLE")));
for(const mutate of [
 r=>r.publication_allowed=true,
 r=>r.release_state="PUBLISHED",
 r=>r.canonical_article_id="REAL-ID",
 r=>r.signoffs.identity=true,
 r=>r.calendar_association.trigger_enabled=true,
 r=>r.calendar_association.recurrence_enabled=true,
 r=>r.article.title.fr="",
 r=>r.review_key="INVALID"
]){
 const r=JSON.parse(JSON.stringify(polluted));mutate(r);
 assert.equal(calendarR18ReviewRecommendations("2026-12-24",{enabled:true,regionCode:"IE",candidates:[r]}).length,0);
}
assert.equal(calendarCustomArticleIds().length,35);
assert.ok(calendarCustomArticle("ADVT-001"));
const month=calendarCustomSeasonalMonthEntries("2026-12");
assert.ok(month.every(row=>!String(row.id).startsWith("REVIEW:")));
console.log("PASS Calendar R18 opt-in preview: six exact date and region associations; no global exposure, auto-recurrence, canonical IDs, published changes or signoffs");
