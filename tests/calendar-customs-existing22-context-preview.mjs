import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 CUSTOMS_EXISTING_VARIANT_TOTAL,
 CUSTOMS_EXISTING_VARIANT_OWNER_TOTAL,
 calendarCustomHistoricalVariantPreview
} from "../src/calendar/customs-existing-variant-preview.js";
import {
 calendarCustomArticle, calendarCustomArticleIds, calendarCustomRecommendations
} from "../src/calendar/customs-read-model.js";

const runtime=readFileSync(new URL("../src/calendar/calendar-runtime.js",import.meta.url),"utf8");
const sourceIds=calendarCustomArticleIds();
assert.equal(sourceIds.length,35,"No new canonical published Customs articles");
assert.equal(CUSTOMS_EXISTING_VARIANT_TOTAL,22);
assert.equal(CUSTOMS_EXISTING_VARIANT_OWNER_TOTAL,12);

const en=sourceIds.flatMap(id=>calendarCustomHistoricalVariantPreview(id,{fr:false}));
const fr=sourceIds.flatMap(id=>calendarCustomHistoricalVariantPreview(id,{fr:true}));
assert.equal(en.length,22);
assert.equal(fr.length,22);
assert.equal(new Set(en.map(x=>x.id)).size,22);
assert.equal(new Set(en.map(x=>x.parent_id)).size,12);
assert.deepEqual(en.map(x=>x.id),fr.map(x=>x.id));
assert.deepEqual(en.map(x=>x.parent_id),fr.map(x=>x.parent_id));

for(let i=0;i<en.length;i++){
 const english=en[i],french=fr[i];
 assert.ok(calendarCustomArticle(english.parent_id),"Every variant belongs to a real published article");
 assert.ok(english.id.startsWith("AO-CUST-VAR-"));
 assert.ok(english.title&&french.title&&english.history&&french.history);
 assert.ok(english.optional_practice&&french.optional_practice);
 assert.ok(english.caution&&french.caution);
 assert.ok(english.historical_region&&french.historical_region);
 assert.ok(/^https:\/\//.test(english.source.url));
 assert.ok(Number.isInteger(english.source.printed_page)&&english.source.printed_page>0);
 assert.ok(english.source.observation_ids.length>0);
 assert.deepEqual(english.source,french.source,"Source references must be language-independent");
 assert.equal(english.editorial_preview_only,true);
 assert.equal(english.no_calendar_event,true);
 assert.equal(english.no_new_canonical_card,true);
 assert.equal(english.current_local_event_confirmed,false);
 assert.equal(english.current_regional_practice_verified,false);
 assert.deepEqual(english.indulgence_grants,[]);
 assert.equal(english.parent_id,french.parent_id);
}
assert.equal(calendarCustomHistoricalVariantPreview("NONEXISTENT").length,0);
assert.equal(calendarCustomHistoricalVariantPreview(null).length,0);

// Calendar day selections remain canonical (no 22 additional recommendation cards).
for(const date of ["2026-03-29","2026-04-04","2026-06-04","2026-08-15","2026-11-02","2026-11-29"]){
 const rows=calendarCustomRecommendations(date);
 assert.ok(rows.every(r=>sourceIds.includes(r.id)),"No review-only ID can enter Calendar recommendations");
 assert.ok(rows.every(r=>!r.id.startsWith("AO-CUST-VAR-")));
}

// Review-only switch: no default, no region/geolocation inference,
// and preview content stays nested within the existing article renderer.
assert.match(runtime,/new URLSearchParams\(globalThis\.location\?\.search\|\|""\)\.get\("customsVariantsReview"\)==="1"/);
assert.match(runtime,/customsHistoricalVariantPreviewEnabled\(\)\?calendarCustomHistoricalVariantPreview\(article\.id,\{fr:isFr\}\):\[\]/);
assert.match(runtime,/data-cal-customs-variants-preview/);
assert.match(runtime,/data-cal-custom-variant/);
assert.ok(!runtime.includes("geolocation.getCurrentPosition"));
console.log("PASS: 22 bilingual review-only historical details under 12 existing Calendar Customs, 35 published, no new dates, obligations, blessing, or indulgence");
