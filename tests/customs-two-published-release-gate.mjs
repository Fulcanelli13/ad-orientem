import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {calendarCustomArticle,CALENDAR_CUSTOM_ARTICLE_IDS,calendarCustomRecommendations} from "../src/calendar/customs-read-model.js";
import {calendarCustomSearchIndex,calendarCustomSearchMatches} from "../src/calendar/customs-search.js";
import {groupCalendarCustomsByYear} from "../src/customs/year-led-library.js";
import {SEASONAL_CUSTOMS_PILOT,homeSeasonalCustomForDate} from "../src/customs/seasonal-home-spotlight.js";

const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const seed=read("data/customs/customs-atlas-seed.v1.json");
const sources=read("data/customs/source-registry.v1.json");
const legacy=read("data/customs/research/customs-published-35-editorial-first-pass.20261023.v1.json");
const sot07=read("data/customs/sot07-full-recovery.review.v1.json");
const canonical=seed.customs, published=canonical.filter(x=>x.publication_state==="PUBLISHED");
const registered=new Map(sources.sources.map(x=>[x.id,x]));
const newIds=["EPIP-003","CRIB-001"], oldIds=new Set(legacy.records.map(x=>x.custom_id));
assert.equal(seed.schema,"CUSTOMS_ATLAS_SEED_V1");
assert.equal(canonical.length,40);
assert.equal(published.length,37);
assert.equal(seed.attestations.length,99);
assert.equal(sources.sources.length,112);
assert.equal(new Set(canonical.map(x=>x.custom_id)).size,40);
assert.equal(new Set(seed.attestations.map(x=>x.attestation_id)).size,99);
assert.equal(registered.size,112);
assert.equal(CALENDAR_CUSTOM_ARTICLE_IDS.length,37);
assert.deepEqual(new Set(CALENDAR_CUSTOM_ARTICLE_IDS),new Set(published.map(x=>x.custom_id)));
assert.equal(oldIds.size,35);
assert.ok([...oldIds].every(id=>published.some(x=>x.custom_id===id)),"Frozen 35 publication baseline was replaced");
assert.equal(canonical.filter(x=>x.publication_state==="CONTEXT_ONLY").length,3);
assert.deepEqual(new Set(CALENDAR_CUSTOM_ARTICLE_IDS.filter(id=>!oldIds.has(id))),new Set(newIds));
assert.deepEqual(seed.releaseExtension?.addedIds,newIds);
const frozenOriginalIds=new Set(sot07.rows.map(x=>x.original_custom_id));
for(const id of newIds)assert.ok(!frozenOriginalIds.has(id),"New canonical identity collides with historical SOT07 row: "+id);
assert.ok(frozenOriginalIds.has("DOM-014"),"Original SOT07 DOM-014 must not be reassigned");
assert.equal(seed.releaseExtension?.releaseApproval,"BRANCH_CANDIDATE_NOT_MERGED",
 "A draft/research approval flag must not be confused with final publisher signature");
assert.equal(seed.releaseExtension?.priorPublishedCount,35);
assert.equal(seed.releaseExtension?.historicalSOT,"SOT-07");
assert.equal(seed.releaseExtension?.geography,"EVIDENCE_ONLY_NO_MAP_PINS");
for(const id of newIds){
 const article=calendarCustomArticle(id);
 const c=canonical.find(x=>x.custom_id===id);
 assert.equal(c?.publication_state,"PUBLISHED");
 assert.ok(article,"Published entry omitted from existing Calendar: "+id);
 assert.equal(article.id,id);
 assert.equal(article.editorialCopyStatus,"COHORT1_SOURCE_BOUNDED_RELEASE_CANDIDATE_NO_HUMAN_SIGNOFF",
  "Do not manufacture human editorial signoff");
 for(const field of ["title","description","history","meaning","practice","caution","scope","occasion"]){
  for(const lang of ["en","fr"])assert.ok((article[field]?.[lang]||"").length>=8,
   "Incomplete "+lang+" "+field+" for "+id);
 }
 assert.notEqual(article.history.en,article.description.en);
 assert.ok(article.sources.length>=3);
 for(const src of article.sources){
  const ref=registered.get(src.id);
  assert.ok(ref,"Unregistered source "+src.id);
  assert.equal(ref.url,src.url,id+" source link mutated from canonical registry "+src.id);
  assert.match(ref.url,/^https:\/\//);
  assert.ok(src.claim_scope.length>=20,"Missing bounded evidence claim "+src.id);
 }
 const attest=seed.attestations.filter(a=>a.custom_id===id);
 assert.equal(attest.length,1,"Must add exactly one evidence-only attestation "+id);
 assert.equal(attest[0].place_id,null);
 assert.equal(attest[0].map_policy,"NOT_MAPPED");
 assert.equal(attest[0].geo_area_id,"geo:world");
 assert.ok(attest[0].source_ids.every(key=>registered.has(key)));
 assert.equal(calendarCustomSearchMatches(calendarCustomSearchIndex(article),article.title.fr),true,
  "French complete-article catalogue search excludes "+id);
}
const dates=["2026","2027","2030"];
for(const y of dates){
 const ep=calendarCustomRecommendations(y+"-01-06").map(x=>x.id);
 const candle=calendarCustomRecommendations(y+"-02-02").map(x=>x.id);
 assert.ok(ep.includes("EPIP-003"));
 assert.ok(candle.includes("CRIB-001")&&candle.includes("DOM-011"));
 assert.equal(calendarCustomRecommendations(y+"-01-08").some(x=>x.id==="EPIP-003"),false);
 assert.equal(calendarCustomRecommendations(y+"-02-04").some(x=>x.id==="CRIB-001"),false);
 assert.equal(homeSeasonalCustomForDate(y+"-01-03")?.id,"EPIP-003",
  "Epiphany household preparation spotlight must not be displaced by regional custom");
 assert.equal(homeSeasonalCustomForDate(y+"-02-02")?.id,"DOM-011",
  "Retaining crib is not a second Candlemas Home spotlight");
}
const homeAdded=SEASONAL_CUSTOMS_PILOT.filter(x=>newIds.includes(x.id));
assert.deepEqual(homeAdded.map(x=>x.id),["EPIP-003"],
 "Crib is only Calendar/library, never a duplicate Home card");
const groups=groupCalendarCustomsByYear(CALENDAR_CUSTOM_ARTICLE_IDS.map(calendarCustomArticle));
const grouped=groups.flatMap(x=>x.articles.map(a=>a.id));
assert.equal(grouped.length,37);
assert.equal(new Set(grouped).size,37);
assert.ok(groups.find(g=>g.key==="christmas_epiphany").articles.some(a=>a.id==="EPIP-003"));
assert.ok(groups.find(g=>g.key==="candlemas_lent").articles.some(a=>a.id==="CRIB-001"));
assert.match(calendarCustomArticle("EPIP-003").caution.en,/priest|Roman Ritual/i);
assert.match(calendarCustomArticle("CRIB-001").caution.en,/1962/);
// Fr McNamara's 2015 answer concerns church Nativity scenes. Do not cite
// that pastoral commentary as direct proof of a universal family practice.
assert.match(calendarCustomArticle("CRIB-001").history.en,/in churches/);
assert.match(calendarCustomArticle("CRIB-001").history.fr,/dans les églises/);
assert.doesNotMatch(calendarCustomArticle("CRIB-001").history.en,/some families remove the crib/);
console.log("PASS +2 customs: frozen 35 preserved, 37 bilingual published, 112 registered sources, 99 evidence-only attestations, 1962 feast links, one Home spotlight, no invented map pins or editor signatures.");
