import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {calendarCustomArticleIds,calendarCustomArticle,calendarCustomRecommendations} from "../src/calendar/customs-read-model.js";
import {calendarR18ElevenEditorialReviewRecords,calendarR18ElevenEditorialReviewMarkup} from "../src/calendar/customs-r18-eleven-editorial-preview.js";
import {
 R18_SIX_SOURCE_BLOB,
 calendarR18SixReviewRecords,
 calendarR18SixEditorialSupplementMarkup
} from "../src/calendar/customs-r18-six-editorial-supplement.js";

const runtime=readFileSync(new URL("../src/calendar/calendar-runtime.js",import.meta.url),"utf8");
const main=calendarCustomArticleIds();
assert.ok([35,36].includes(main.length),"Only the reviewed PENT-001 individual release may extend 35 public Customs");
assert.equal(main.includes("PENT-001"),main.length===36,"PENT-001 is the only permitted additional publication");
assert.equal(new Set(main).size,main.length);
assert.equal(calendarR18ElevenEditorialReviewRecords().length,main.includes("PENT-001")?10:11);
assert.match(R18_SIX_SOURCE_BLOB,/^[0-9a-f]{40}$/);
assert.equal(R18_SIX_SOURCE_BLOB,"743308a8ba76c9251d7303143c95ef6a43a5c7f4",
  "Historic six source pack is pinned by the reviewed exact blob");
const six=calendarR18SixReviewRecords();
assert.equal(six.length,6);
const ids=["PATR-002","XMAS-002","XMAS-003","SBAR-001","XMAS-004","EPIP-004"];
assert.deepEqual(six.map(x=>x.id),ids);
assert.equal(six.reduce((n,x)=>n+x.sources.length,0),12);
for(const item of six){
 assert.equal(item.source_pack_review_status,"UNPUBLISHED_SIGNOFF_PENDING");
 assert.equal(item.signoff_status,undefined,"Human signoffs are not manufactured in this read-only module");
 assert.equal(item.dates.length>0,true);
 assert.equal(item.sources.length>0,true);
 assert.ok(item.sources.every(s=>s.url.startsWith("https://")&&s.title&&s.id));
 assert.equal(calendarCustomArticle(item.id),null,"Unapproved article must not be public");
 assert.equal(main.includes(item.id),false);
 assert.equal(new Set(item.sources.map(s=>s.id)).size,item.sources.length);
 for(const field of ["title","description","history","meaning","practice","caution","scope","occasion"]){
  for(const lang of ["en","fr"])assert.ok(item[field]?.[lang]?.trim().length>(field==="occasion"?3:8),
    item.id+" "+field+"."+lang+" must be complete");
 }
}
assert.deepEqual(six.map(r=>r.region),["IE","IE","PL","AT","FR-PROVENCE","ES"]);
for(const date of ["2026-03-17","2026-12-04","2026-12-24","2027-01-06"]){
 const recommendations=calendarCustomRecommendations(date,{events:[]}).map(x=>x.id);
 assert.ok(recommendations.every(x=>main.includes(x)));
 assert.ok(recommendations.every(x=>!ids.includes(x)),"No source-dated event automatically published");
}
const en=calendarR18SixEditorialSupplementMarkup({fr:false});
const fr=calendarR18SixEditorialSupplementMarkup({fr:true});
for(const html of [en,fr]){
 assert.equal((html.match(/data-cal-r18-six-review-key=/g)||[]).length,6);
 assert.equal((html.match(/class="aoCalR18ElevenLanguage"/g)||[]).length,12);
 assert.equal((html.match(/<a href=/g)||[]).length,12);
 assert.ok(html.includes('data-cal-r18-six-count="6"'));
 assert.ok(!html.includes("data-cal-custom-id="),"Do not add unapproved articles to public Calendar list");
 assert.ok(!html.includes("data-cal-custom-item"));
 assert.ok(!html.includes("data-cal-my-customs-open"));
 assert.ok(!html.includes("data-cal-month-index-date"));
 assert.ok(!html.includes("<script"));
 assert.ok(html.includes('lang="en"')&&html.includes('lang="fr"'));
}
assert.ok(en.includes("EDITORIAL REVIEW · FIRST COHORT"));
assert.ok(fr.includes("EXAMEN ÉDITORIAL · PREMIER GROUPE"));
const mock=[...main,"PATR-002","XMAS-002"];
const pending=calendarR18SixReviewRecords({publishedIds:mock});
assert.deepEqual(pending.map(x=>x.id),ids.slice(2),"After exact canonical publication, hide only those two drafts");
const mockHtml=calendarR18SixEditorialSupplementMarkup({publishedIds:mock});
assert.equal((mockHtml.match(/data-cal-r18-six-review-key=/g)||[]).length,4);
assert.ok(mockHtml.includes('data-cal-r18-six-count="4"'));
assert.equal(calendarR18SixReviewRecords({publishedIds:mock,includePromoted:true}).length,6);
assert.equal(calendarR18ElevenEditorialReviewRecords().length,main.includes("PENT-001")?10:11);
assert.equal((calendarR18ElevenEditorialReviewMarkup().match(/data-cal-r18-eleven-key=/g)||[]).length,main.includes("PENT-001")?10:11);
assert.ok(runtime.includes('get("customsR18Eleven")==="review"'));
assert.ok(runtime.includes('r18ElevenEditorialReviewEnabled()?calendarR18SixEditorialSupplementMarkup({fr:isFr}):""'));
assert.ok(!runtime.includes("calendarR18SixEditorialSupplementMarkup({fr:isFr}):''"));
console.log("PASS opt-in Calendar R18 review: "+main.length+" public, "+calendarR18ElevenEditorialReviewRecords().length+" later pending, six original pending; 12 source links and no event/rite/adoption leakage");
