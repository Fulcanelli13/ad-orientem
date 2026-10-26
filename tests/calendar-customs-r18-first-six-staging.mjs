import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const root=new URL("../",import.meta.url);
const read=path=>readFileSync(new URL(path,root),"utf8");
const proposed=JSON.parse(read("src/calendar/customs-r18-first-six-staging.v1.json"));
const current=read("src/calendar/customs-read-model.js");
const extras=read("src/calendar/customs-extra-articles.js");
const published=[...current.matchAll(/^\s{4}"id":\s*"([A-Z][A-Z0-9-]+)"/gm),...extras.matchAll(/^\s{4}"id":\s*"([A-Z][A-Z0-9-]+)"/gm)].map(m=>m[1]);

assert.equal(proposed.schema,"AO_CUSTOMS_FIRST_SIX_MAIN_BASED_STAGING_V1");
assert.equal(proposed.candidate_count,6);
assert.equal(proposed.records.length,6);
assert.equal(proposed.prior_published_article_count,35);
assert.equal(proposed.approved_count,0);
assert.equal(proposed.new_canonical_id_count,0);
assert.equal(proposed.runtime_import,false);
assert.equal(published.length,35);
assert.equal(new Set(published).size,35);
assert.match(current,/CANONICAL_EXTRA_CUSTOM_ARTICLES/);
assert.ok(!current.includes("customs-r18-first-six-staging"));
assert.ok(!extras.includes("customs-r18-first-six-staging"));
assert.ok(!read("src/calendar/customs-profile-links.js").includes("customs-r18-first-six-staging"));
assert.deepEqual(proposed.records.map(r=>r.working_master_id),[
 "CANDIDATE-STPATRICK-RIBBON","CANDIDATE-IRISH-CHRISTMAS-CANDLE","CUST-XMAS-POLISH-HAY",
 "CUST-BARBARA-BRANCHES","CUST-XMAS-PROVENCAL-PAIN-CALENDAL","CUST-EPIPHANY-SPANISH-MAGI-GIFTS"
]);
const expectedHints=new Map([
 ["CANDIDATE-STPATRICK-RIBBON","03-17"],
 ["CANDIDATE-IRISH-CHRISTMAS-CANDLE","12-24/12-25"],
 ["CUST-XMAS-POLISH-HAY","12-24"],
 ["CUST-BARBARA-BRANCHES","12-04"],
 ["CUST-XMAS-PROVENCAL-PAIN-CALENDAL","12-24"],
 ["CUST-EPIPHANY-SPANISH-MAGI-GIFTS","01-05/01-06"]
]);
const fields=["title","description","history","meaning","practice","caution","occasion","scope"];
const refs=new Set;
for(const row of proposed.records){
 assert.ok(!refs.has(row.review_key));refs.add(row.review_key);
 assert.equal(row.review_key,"MASTER:"+row.working_master_id);
 assert.equal(row.canonical_article_id,null);
 assert.equal(row.release_state,"EDITORIAL_REVIEW_ONLY");
 assert.equal(row.publication_allowed,false);
 assert.equal(row.calendar_association.date_authority,"EXISTING_1962_CALENDAR");
 assert.equal(row.calendar_association.month_day_hint,expectedHints.get(row.working_master_id));
 assert.equal(row.calendar_association.trigger_enabled,false);
 assert.equal(row.calendar_association.recurrence_enabled,false);
 assert.equal(row.source_review.source_independence_fully_certified,false);
 for(const val of Object.values(row.signoffs))assert.equal(val,false);
 for(const f of fields)for(const lang of ["en","fr"]){
  assert.equal(typeof row.article[f][lang],"string");
  assert.ok(row.article[f][lang].trim().length>4,row.working_master_id+" "+f+" "+lang);
 }
 assert.notEqual(row.article.description.en,row.article.history.en);
 assert.notEqual(row.article.description.fr,row.article.history.fr);
 assert.ok(Array.isArray(row.sources)&&row.sources.length>0);
 assert.ok(row.sources.every(x=>x.url.startsWith("https://")&&x.id&&x.title));
 assert.ok(row.sources.some(x=>x.url===row.source_review.principal_source));
}
const candle=proposed.records.find(r=>r.working_master_id==="CANDIDATE-IRISH-CHRISTMAS-CANDLE");
assert.equal(candle.source_review.recheck,"NATIONAL_MUSEUM_DIRECT_WITH_ARCHIVAL_DUCHAS_REOPEN_BLOCKED");
assert.ok(candle.sources.some(x=>x.url.includes("duchas.ie")));
assert.ok(candle.sources.some(x=>x.url.includes("source.museum.ie")));
assert.ok(candle.article.history.en.includes("1941"));
assert.ok(candle.article.caution.en.includes("electric candle"));
const patrick=proposed.records.find(r=>r.working_master_id==="CANDIDATE-STPATRICK-RIBBON");
assert.ok(patrick.article.history.en.includes("1680s"));
assert.ok(patrick.article.history.en.includes("1930s"));
const spain=proposed.records.find(r=>r.working_master_id==="CUST-EPIPHANY-SPANISH-MAGI-GIFTS");
assert.ok(spain.article.history.en.includes("2023 for 2024"));
assert.ok(spain.article.history.fr.includes("2023 pour 2024"));
console.log("PASS six staged EN/FR Calendar customs: original 35 unchanged; no candidate IDs, runtime import, calendar trigger, event recurrence or editorial approval");
