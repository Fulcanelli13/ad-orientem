import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 CALENDAR_R18_ELEVEN_REVIEW_BLOB,
 calendarR18ElevenEditorialReviewRecords,
 calendarR18ElevenEditorialReviewMarkup
} from "../src/calendar/customs-r18-eleven-editorial-preview.js";
import {calendarCustomArticle,calendarCustomArticleIds,calendarCustomRecommendations} from "../src/calendar/customs-read-model.js";

const fs=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const runtime=fs("src/calendar/calendar-runtime.js");
const preview=fs("src/calendar/customs-r18-eleven-editorial-preview.js");
const source=JSON.parse(fs("data/customs/customs-atlas-seed.v1.json"));
const published=source.customs.filter(r=>r.publication_state==="PUBLISHED");
const canonical=calendarCustomArticleIds();
assert.equal(published.length,canonical.includes("PENT-001")?36:35);
assert.equal(canonical.length,published.length);
assert.deepEqual(new Set(canonical),new Set(published.map(x=>x.custom_id)));
const items=calendarR18ElevenEditorialReviewRecords({includePromoted:true});
const visibleItems=calendarR18ElevenEditorialReviewRecords();
const expectedVisible=canonical.includes("PENT-001")?10:11;
assert.equal(visibleItems.length,expectedVisible,"Only unpublished records remain in review");
const completeCorpus=calendarR18ElevenEditorialReviewRecords({includePromoted:true});
assert.equal(completeCorpus.length,11,"Keep eleven source records available for audit even after promotion");
const simulatedIds=[...new Set([...canonical,"PENT-001"])];
const afterPromotion=calendarR18ElevenEditorialReviewRecords({publishedIds:simulatedIds});
assert.equal(afterPromotion.length,10,"Publication must suppress only R18-14 in unpublished review");
assert.ok(!afterPromotion.some(x=>x.review_key==="CUSTOMS-R18-14"));
assert.equal(completeCorpus.filter(x=>x.review_key==="CUSTOMS-R18-14").length,1,
  "The historical review record remains for audit, not an extra card");
const promotedHtmlEn=calendarR18ElevenEditorialReviewMarkup({fr:false,publishedIds:simulatedIds});
const promotedHtmlFr=calendarR18ElevenEditorialReviewMarkup({fr:true,publishedIds:simulatedIds});
for(const html of [promotedHtmlEn,promotedHtmlFr]){
 assert.equal((html.match(/data-cal-r18-eleven-key=/g)||[]).length,10);
 assert.equal((html.match(/data-cal-r18-published-count="36"/g)||[]).length,1);
 assert.ok(!html.includes('data-cal-r18-eleven-key="CUSTOMS-R18-14"'));
 assert.equal((html.match(/class="aoCalR18ElevenLanguage"/g)||[]).length,20);
 assert.ok(!html.includes("11 UNPUBLISHED DOSSIERS"));
}
assert.ok(promotedHtmlEn.includes("EDITORIAL REVIEW · 10 UNPUBLISHED DOSSIERS"));
assert.ok(promotedHtmlFr.includes("EXAMEN ÉDITORIAL · 10 DOSSIERS NON PUBLIÉS"));
assert.equal(items.length,11);
assert.equal(CALENDAR_R18_ELEVEN_REVIEW_BLOB,"2b22181c25b6e5bc8dd8d6fd959fc0b30117a02c",
  "Reviewer text must be regenerated from QA-corrected source and not earlier copy");
assert.equal(items.filter(x=>x.editorial_lane==="STANDALONE_REGIONAL_HISTORICAL_ARTICLE_AFTER_SIGNOFF").length,7);
assert.equal(items.filter(x=>x.editorial_lane==="LOCAL_FEAST_CONTEXT_ONLY_NOT_GLOBAL_CUSTOM_ID").length,4);
assert.ok(items.every(x=>x.editorial_lane_status==="ANALYST_RECOMMENDATION_NOT_HUMAN_EDITORIAL_SIGNOFF"));
assert.equal(items.find(x=>x.review_key==="CUSTOMS-R18-13").article.title.en,"L-Irxoxt — Maltese Easter Resurrection processions");
assert.equal(items.find(x=>x.review_key==="CUSTOMS-R18-17").article.title.en,"Frauendreißiger — Bavarian Marian pilgrimage period");
assert.ok(!items.find(x=>x.review_key==="CUSTOMS-R18-14").article.history.en.includes("archival photograph"));
assert.ok(!items.find(x=>x.review_key==="CUSTOMS-R18-09").article.history.en.includes("canonical Customs"));
assert.ok(items.find(x=>x.review_key==="CUSTOMS-R18-04").article.caution.en.includes("Some communities separately bless eggs"));
assert.match(CALENDAR_R18_ELEVEN_REVIEW_BLOB,/^[0-9a-f]{40}$/);
assert.equal(new Set(items.map(x=>x.review_key)).size,11);
assert.deepEqual(items.map(x=>x.review_key),["03","04","05","07","08","09","13","14","15","16","17"].map(n=>"CUSTOMS-R18-"+n));
const fields=["title","description","history","meaning","practice","caution","occasion","scope"];
const signoffs=["identity","source","english","french","geography","liturgical","calendar","activation"];
let childCount=0;
for(const row of items){
 assert.equal(row.release_status,"PROPOSED_READY_FOR_HUMAN_EDITORIAL_REVIEW_NOT_AUTHORIZED");
 assert.deepEqual(Object.keys(row.signoffs).sort(),signoffs.sort());
 assert.ok(Object.values(row.signoffs).every(x=>x===false));
 assert.ok(!canonical.includes(row.review_key));
 assert.equal(calendarCustomArticle(row.review_key),null);
 assert.ok(row.source_claim_en.length>30);
 assert.ok(row.urls.length>=1);
 assert.ok(row.urls.every(url=>/^https:\/\//.test(url)));
 assert.ok(row.subtypes.every(c=>c.key.startsWith(row.review_key+":")));
 childCount+=row.subtypes.length;
 for(const f of fields){
   for(const lang of ["en","fr"])assert.ok(row.article[f]?.[lang]?.trim().length>4,row.review_key+" "+f+"."+lang);
 }
 assert.notEqual(row.article.description.en,row.article.history.en);
 assert.notEqual(row.article.description.fr,row.article.history.fr);
}
assert.equal(childCount,15);
for(const date of ["2026-04-05","2026-06-20","2026-06-24","2026-08-14","2026-08-15","2026-12-24"]){
 const recs=calendarCustomRecommendations(date,{events:[]}).map(x=>x.id);
 assert.ok(recs.every(id=>canonical.includes(id)));
 assert.ok(recs.every(id=>!id.startsWith("CUSTOMS-R18-")));
}
const htmlEn=calendarR18ElevenEditorialReviewMarkup({fr:false});
const htmlFr=calendarR18ElevenEditorialReviewMarkup({fr:true});
for(const html of [htmlEn,htmlFr]){
 assert.equal((html.match(/data-cal-r18-eleven-key=/g)||[]).length,expectedVisible);
 assert.equal((html.match(/class="aoCalR18ElevenLanguage"/g)||[]).length,2*expectedVisible);
 assert.equal((html.match(new RegExp('data-cal-r18-published-count="'+canonical.length+'"','g'))||[]).length,1);
 assert.equal((html.match(/class="aoCalR18ElevenCandidate"/g)||[]).length,0); // wrapped with canonical card class but isolated selector
 assert.equal((html.match(/<a href=/g)||[]).length,visibleItems.reduce((n,item)=>n+item.urls.length,0));
 assert.ok(!html.includes("publication_allowed=true"));
 assert.ok(!html.includes("data-cal-custom-id="),"Do not accidentally register candidate as published article");
 assert.ok(!html.includes("data-cal-custom-item"),"Don't mix reviewer items with public search");
 assert.ok(!html.includes("data-cal-month-index-date"),"Don't create dated Calendar links");
 assert.ok(!html.includes("data-cal-my-customs-open"),"Don't make research adoptable");
 assert.ok(!html.includes("<script"));
 assert.ok(html.includes("lang=\"en\"")&&html.includes("lang=\"fr\""));
}
assert.ok(htmlEn.includes("Proposed article · not published"));
assert.ok(htmlEn.includes("Regional candidate · approval required"));
assert.ok(htmlEn.includes("Local historical context only"));
assert.ok(htmlFr.includes("Candidat régional · validation requise"));
assert.ok(htmlFr.includes("Contexte historique local uniquement"));
assert.ok(htmlFr.includes("Article proposé · non publié"));
assert.ok(htmlEn.includes("St John Baptist&#39;s community bonfire"));
assert.ok(htmlFr.includes("Le feu communautaire de la Saint-Jean-Baptiste"));
assert.ok(htmlEn.includes("Plenary indulgence")===false);
assert.ok(!preview.includes("calendarCustomRecommendations("));
assert.ok(preview.includes('import { calendarCustomArticleIds } from "./customs-read-model.js";'));
assert.ok(preview.includes('"CUSTOMS-R18-14":"PENT-001"'),
  "Promotion must use the exact one-to-one canonical ID, not matching titles");
assert.ok(!preview.includes("calendarCustomRecommendations("),
 "Reviewer must never influence date recommendations");
assert.ok(runtime.includes('get("customsR18Eleven")==="review"'));
assert.ok(runtime.includes('r18ElevenEditorialReviewEnabled()?calendarR18ElevenEditorialReviewMarkup({fr:isFr}):""'));
assert.ok(runtime.includes('calendarCustomHistoricalVariantPreview(article.id'));
assert.ok(runtime.includes('const CUSTOMS_HISTORICAL_PARENT_CONTEXT_RELEASE = true;'));
assert.ok(!runtime.includes("r18ElevenEditorialReviewEnabled()?calendarCustomRecommendations"));
assert.ok(!runtime.includes("r18ElevenEditorialReviewEnabled()?calendarCustomArticleIds"));
console.log("PASS Calendar reviewer: 11 original bilingual dossiers, "+expectedVisible+" remaining unpublished in "+canonical.length+"-item canonical state, 15 original subtypes, source URLs, no recommendation/event/adoption leakage");
