import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CALENDAR_HISTORICAL_CUSTOM_VARIANT_COUNT,CALENDAR_HISTORICAL_CUSTOM_PARENT_COUNT,calendarHistoricalCustomVariantIds,calendarCustomHistoricalVariants} from "../src/calendar/customs-22-regional-variants.js";
import {calendarCustomArticleIds,calendarCustomArticle,calendarCustomRecommendations} from "../src/calendar/customs-read-model.js";
import {calendarCustomSearchIndex,calendarCustomSearchMatches} from "../src/calendar/customs-search.js";
import {selectCustoms} from "../src/customs/customs-library.js";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const canonical=JSON.parse(read("data/customs/customs-atlas-seed.v1.json")).customs;
const runtime=read("src/calendar/calendar-runtime.js");
const browser=read("src/customs/customs-browser.js");
assert.equal(CALENDAR_HISTORICAL_CUSTOM_VARIANT_COUNT,22);
assert.equal(CALENDAR_HISTORICAL_CUSTOM_PARENT_COUNT,12);
assert.equal(new Set(calendarHistoricalCustomVariantIds()).size,22);
assert.equal(canonical.filter(c=>c.publication_state==="PUBLISHED").length,35);
assert.equal(canonical.filter(c=>c.publication_state==="CONTEXT_ONLY").length,3);
assert.equal(calendarCustomArticleIds().length,35);
const ids=new Set(calendarCustomArticleIds());
const parents=new Set();
const all=[];
for(const id of ids){
 const en=calendarCustomHistoricalVariants(id);
 const fr=calendarCustomHistoricalVariants(id,{fr:true});
 assert.equal(en.length,fr.length);
 if(en.length)parents.add(id);
 for(let i=0;i<en.length;i++){
  const a=en[i],b=fr[i];
  assert.ok(a.title.length>8&&b.title.length>8);
  assert.ok(a.history.length>25&&b.history.length>25);
  assert.ok(a.context_or_practice.length>25&&b.context_or_practice.length>25);
  assert.equal(a.parent_custom_id,id);
  assert.equal(b.parent_custom_id,id);
  assert.equal(a.id,b.id);
  assert.deepEqual(a.geography,b.geography);
  assert.ok(a.geography.length>=1);
  assert.ok(/^https:\/\//.test(a.source.url));
  assert.ok(a.source.printed_page>0);
  assert.ok(a.source.observation_ids.length>0);
  assert.equal(a.is_historical_source_observation,true);
  assert.equal(a.current_local_practice_not_verified,true);
  assert.equal(a.is_1962_liturgical_rubric,false);
  assert.equal(a.is_current_parish_announcement,false);
  assert.equal(a.associated_indulgence,false);
  assert.equal(a.is_extra_custom_card,false);
  assert.ok(calendarCustomArticle(id));
  all.push(a);
 }
}
assert.equal(all.length,22);
assert.equal(parents.size,12);
assert.equal(new Set(all.map(x=>x.id)).size,22);
assert.deepEqual(new Set(all.map(x=>x.id)),new Set(calendarHistoricalCustomVariantIds()));
// A variation is discoverable by title in both languages, but its result
// always opens the existing canonical Customs article, never a new card.
const searchLibrary={items:canonical.filter(x=>x.publication_state==="PUBLISHED").map(x=>({
 ...x,id:x.custom_id,name:x.name,
 temporal:{group:"advent"},
 title_en:x.name,title_fr:x.name,
 description_en:x.canonical_statement,description_fr:x.canonical_statement
}))};
for(const variant of all){
 const parent=calendarCustomArticle(variant.parent_custom_id);
 assert.ok(parent);
 const idx=calendarCustomSearchIndex(parent);
 for(const fr of [false,true]){
  const label=calendarCustomHistoricalVariants(variant.parent_custom_id,{fr})
    .find(x=>x.id===variant.id).title;
  assert.equal(calendarCustomSearchMatches(idx,label),true,"Calendar search missed "+variant.id);
  assert.ok(selectCustoms(searchLibrary,{view:"all",query:label})
    .some(x=>x.id===variant.parent_custom_id),"Customs collection missed "+variant.id);
 }
}
assert.equal(selectCustoms(searchLibrary,{view:"all"}).length,35);
assert.equal(calendarCustomHistoricalVariants("NOT_A_CUSTOM").length,0);
assert.equal(calendarCustomHistoricalVariants("CUST-XMAS-POLISH-HAY").length,0);
assert.equal(calendarCustomHistoricalVariants("CORP-001").length,3);
assert.equal(calendarCustomHistoricalVariants("DEAD-001").length,6);
assert.equal(calendarCustomHistoricalVariants("BLSS-004").length,2);
assert.ok(all.every(x=>!x.id.startsWith("CANDIDATE-")));
for(const date of ["2026-01-06","2026-02-02","2026-04-05","2026-11-02","2026-12-24"]){
 const recs=calendarCustomRecommendations(date);
 assert.ok(recs.every(r=>ids.has(r.id)));
 assert.ok(recs.every(r=>!r.id.startsWith("AO-CUST-VAR-")));
}
assert.match(runtime,/calendarCustomHistoricalVariants\(article\.id,\{fr:isFr\}\)/);
assert.match(runtime,/Historical regional variations/);
assert.match(runtime,/These are historical local reports/);
assert.match(runtime,/Original historical source/);
assert.match(runtime,/aoCalCustomRegionalVariant/);
assert.match(browser,/calendarCustomHistoricalVariants\(c\.id,\{fr:FR\(\)\}\)/);
assert.match(browser,/Historical regional variations/);
assert.match(browser,/Historical testimony only/);
assert.match(browser,/Read historical source/);
assert.ok(!runtime.includes("new Date(variant.source")&&!browser.includes("new Date(variant.source"));
console.log("PASS 22 historical bilingual variants within 12 existing published Customs: no extra cards, dates, parish announcements, indulgences, or 1962 rite claims.");
console.log("PASS both existing Calendar and Customs readers include accessible collapsed historical variants and direct source links; 35 published and 3 context-only canonical records unchanged.");
