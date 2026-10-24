import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {calendarCustomArticle,CALENDAR_CUSTOM_ARTICLE_IDS,calendarCustomArticleIds,calendarCustomRecommendations} from "../src/calendar/customs-read-model.js";
import {CUSTOMS_EDITORIAL_PREVIEW_ARTICLES,CUSTOMS_EDITORIAL_PREVIEW_DATE_HOOKS,customsEditorialPreviewForDate} from "../src/calendar/customs-editorial-preview.js";
import {calendarCustomSearchIndex,calendarCustomSearchMatches} from "../src/calendar/customs-search.js";
import {v384Dates} from "../src/calendar/traditional-year-v384.js";
const source=JSON.parse(readFileSync(new URL("../data/customs/review/calendar-five-candidate-articles.v1.json",import.meta.url),"utf8"));
const seed=JSON.parse(readFileSync(new URL("../data/customs/customs-atlas-seed.v1.json",import.meta.url),"utf8"));
const published=new Set(seed.customs.filter(x=>x.publication_state==="PUBLISHED").map(x=>x.custom_id));
assert.equal(source.schema,"AO_CUSTOMS_EXISTING_CALENDAR_FIVE_ARTICLE_RELEASE_CANDIDATES_V1");
assert.equal(source.policy.canonical_publication,"BLOCKED");
assert.equal(source.summary.approved_publications,0);
assert.equal(CALENDAR_CUSTOM_ARTICLE_IDS.length,35);
assert.deepEqual(new Set(CALENDAR_CUSTOM_ARTICLE_IDS),published);
assert.equal(calendarCustomArticleIds().length,35);
assert.equal(calendarCustomArticleIds({editorialPreview:false}).length,35);
assert.equal(calendarCustomArticleIds({editorialPreview:true}).length,40);
assert.equal(CUSTOMS_EDITORIAL_PREVIEW_ARTICLES.length,5);
assert.equal(CUSTOMS_EDITORIAL_PREVIEW_DATE_HOOKS.length,6);
const ids=new Set();
for(const record of source.records){
 const id=record.research_article_id;
 assert.ok(id.startsWith("RESEARCH-"));
 assert.ok(!published.has(id));
 assert.ok(!ids.has(id));ids.add(id);
 assert.equal(calendarCustomArticle(id),null);
 const candidate=calendarCustomArticle(id,{editorialPreview:true});
 assert.ok(candidate&&candidate.editorialPreview===true);
 assert.equal(candidate.releaseUnit,record.release_unit);
 assert.equal(candidate.id,id);
 for(const field of ["title","description","history","meaning","practice","caution","scope","occasion"])
  assert.deepEqual(candidate[field],record.article[field],id+" "+field+" copy mismatch");
 assert.deepEqual(candidate.sources,record.article.sources);
 assert.ok(candidate.sources.length>=2);
 assert.ok(candidate.sources.every(s=>/^https:\/\//.test(s.url)&&s.claim_scope));
 assert.equal(candidate.editorialCopyStatus,"PREPUBLICATION_CANDIDATE_NOT_ACCEPTED");
 const search=calendarCustomSearchIndex(candidate);
 assert.ok(calendarCustomSearchMatches(search,candidate.title.en));
 assert.ok(calendarCustomSearchMatches(search,candidate.title.fr));
 assert.ok(Object.values(record.approvals).every(v=>v===false));
}
assert.equal(ids.size,5);
for(const year of [2026,2027,2030]){
 const x=v384Dates(year);
 const checks=[
 [year+"-01-06",["RESEARCH-EPIPHANY-HOUSE-CUSTOMS"]],
 [x.holySaturday,["RESEARCH-EASTER-LIGHT-HOME"]],
 [x.corpus,["RESEARCH-SEVILLE-SEISES","RESEARCH-POLISH-CORPUS-WREATHS"]],
 [year+"-12-08",["RESEARCH-SEVILLE-SEISES"]],
 [year+"-02-02",["RESEARCH-CANDLEMAS-CRIB-REMOVAL"]]
 ];
 for(const [date,want] of checks){
   const publishedDefault=calendarCustomRecommendations(date).map(x=>x.id);
   const explicitOff=calendarCustomRecommendations(date,{editorialPreview:false}).map(x=>x.id);
   const reviewed=calendarCustomRecommendations(date,{editorialPreview:true}).map(x=>x.id);
   assert.deepEqual(publishedDefault,explicitOff,"Ordinary Calendar behavior must be unchanged");
   assert.ok(!publishedDefault.some(id=>ids.has(id)),"Candidate leaked into normal Calendar");
   for(const id of want)assert.ok(reviewed.includes(id),date+" should include "+id);
   assert.deepEqual([...new Set(reviewed)],reviewed,"Same custom must not duplicate on one date");
 }
}
for(const date of ["2026-01-07","2026-02-03","2026-12-09","bad-date"]){
 assert.equal(calendarCustomRecommendations(date,{editorialPreview:true}).filter(x=>ids.has(x.id)).length,0);
}
const runtime=readFileSync(new URL("../src/calendar/calendar-runtime.js",import.meta.url),"utf8");
assert.match(runtime,/AO_CUSTOMS_EDITORIAL_REVIEW==="five-20261024"/);
assert.match(runtime,/calendarCustomRecommendations\(selected,\{events,fr:fr\(\),editorialPreview:customsEditorialReview\(\)\}\)/);
assert.match(runtime,/data-cal-custom-editorial-review/);
assert.match(runtime,/draft, not published/);
assert.match(runtime,/calendarCustomArticleIds\(\{editorialPreview:preview\}\)/);
assert.match(runtime,/personalCustomsForDate\(selected,\{storage,canonicalIds:calendarCustomArticleIds\(\)\}\)/);
assert.equal(seed.customs.filter(x=>x.publication_state==="PUBLISHED").length,35);
console.log("PASS existing Calendar editor-only preview: 5 EN/FR candidates, 6 date hooks, 35 published unchanged; no public leak or invented event.");
