import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {calendarR18ReviewRecommendations,calendarCustomArticleIds,calendarCustomRecommendations} from "../src/calendar/customs-read-model.js";

const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const stage=load("src/calendar/customs-r18-first-six-staging.v1.json");
const decision=load("src/calendar/customs-r18-first-six-release-decision.v1.json");
const model=readFileSync(new URL("../src/calendar/customs-read-model.js",import.meta.url),"utf8");
const runtime=readFileSync(new URL("../src/calendar/calendar-runtime.js",import.meta.url),"utf8");
const extras=readFileSync(new URL("../src/calendar/customs-extra-articles.js",import.meta.url),"utf8");
assert.equal(stage.records.length,6);
assert.equal(decision.records.length,6);
assert.equal(stage.approved_count,0);
assert.equal(stage.new_canonical_id_count,0);
assert.equal(stage.runtime_import,false);
assert.equal(decision.current_published_baseline,35);
assert.equal(decision.editorially_accepted,0);
assert.equal(decision.new_live_articles,0);
assert.equal(decision.policy.no_geolocation_inference,true);
assert.equal(decision.policy.default_region_interest,null);
assert.equal(decision.policy.leave_1962_feast_solver_unchanged,true);
assert.equal(decision.policy.no_new_calendar_or_atlas,true);
assert.equal(calendarCustomArticleIds().length,35);
const byKey=new Map(stage.records.map(x=>[x.working_master_id,x]));
assert.equal(new Set(byKey.keys()).size,6);
assert.equal(new Set(decision.records.map(x=>x.working_master_id)).size,6);
const expected={
 "CANDIDATE-STPATRICK-RIBBON":["IE","03-17"],
 "CANDIDATE-IRISH-CHRISTMAS-CANDLE":["IE","12-24","12-25"],
 "CUST-XMAS-POLISH-HAY":["PL","12-24"],
 "CUST-BARBARA-BRANCHES":["AT","12-04"],
 "CUST-XMAS-PROVENCAL-PAIN-CALENDAL":["FR-PROVENCE","12-24"],
 "CUST-EPIPHANY-SPANISH-MAGI-GIFTS":["ES","01-05","01-06"]
};
for(const row of decision.records){
 const origin=byKey.get(row.working_master_id);
 assert.ok(origin,row.working_master_id);
 assert.deepEqual([row.region_interest_code,...row.calendar_day_hints],expected[row.working_master_id]);
 assert.equal(row.en_fr_release_copy_complete,true);
 assert.equal(row.source_claim_check,"NARROW_PRIMARY_OR_INSTITUTIONAL_PASSAGE_CONFIRMED");
 assert.equal(row.catalogue_visibility_on_publication,"BROWSE_ALL_WITH_LOCALITY_LABEL");
 assert.equal(row.requested_production_visibility,"EXPLICIT_REGIONAL_INTEREST_ONLY");
 assert.equal(row.primary_source,origin.source_review.principal_source);
 assert.equal(row.translation_human_signed_off,false);
 assert.equal(row.identity_human_signed_off,false);
 assert.equal(row.calendar_scope_human_signed_off,false);
 assert.equal(row["1962_ritual_human_signed_off"],false);
 assert.equal(row.source_independence_certified,false);
 assert.equal(row.canonical_article_id,null);
 assert.equal(row.publication_allowed,false);
 assert.equal(row.active_calendar,false);
 assert.equal(origin.publication_allowed,false);
 assert.equal(origin.canonical_article_id,null);
 assert.equal(origin.calendar_association.trigger_enabled,false);
 assert.equal(origin.calendar_association.recurrence_enabled,false);
 assert.deepEqual(Object.values(origin.signoffs),Array(8).fill(false));
 for(const field of row.copy_fields)for(const lang of ["en","fr"])assert.ok(origin.article[field][lang].trim().length>(field==="occasion"?3:12),row.working_master_id+" "+field+" "+lang);
 for(const mmdd of row.calendar_day_hints){
  const onDate="2026-"+mmdd;
  const normal=calendarCustomRecommendations(onDate);
  const preview=calendarR18ReviewRecommendations(onDate,{enabled:true,regionCode:row.region_interest_code,candidates:stage.records});
  assert.equal(preview.filter(x=>x.id==="REVIEW:"+row.working_master_id).length,1);
  assert.equal(normal.some(x=>x.id==="REVIEW:"+row.working_master_id),false);
 }
}
assert.ok(runtime.includes('article.previewOnly?'));
assert.ok(runtime.includes('Editorial preview — not published'));
assert.ok(runtime.includes('Aperçu éditorial — non publié'));
for(const src of [model,runtime,extras])assert.ok(!src.includes('customs-r18-first-six-staging.v1.json'));
const polish=byKey.get("CUST-XMAS-POLISH-HAY");
assert.match(polish.article.meaning.en,/Christ.s Nativity/);
assert.match(polish.article.meaning.fr,/Nativité du Christ/);
const spain=byKey.get("CUST-EPIPHANY-SPANISH-MAGI-GIFTS");
assert.match(spain.article.practice.en,/5 January/);
assert.match(spain.article.practice.fr,/5 janvier/);
const patrick=byKey.get("CANDIDATE-STPATRICK-RIBBON");
assert.match(patrick.article.description.en,/Historically/);
assert.match(patrick.article.description.fr,/Autrefois/);
const irish=byKey.get("CANDIDATE-IRISH-CHRISTMAS-CANDLE");
assert.match(irish.article.description.en,/folklore/);
const austria=byKey.get("CUST-BARBARA-BRANCHES");
assert.match(austria.article.occasion.fr,/domestique/);
console.log("PASS R18 six release decision: 6 institutionally attested bilingual proposals, scoped exact dates/regions, explicit review labels, 35 canonical baseline and all publication gates locked");
