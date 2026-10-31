// Production throughput gate: 121 bilingual research facts, not a release gate.
// Counts reflect staged drafts, and never authorize the public H7 rotation.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const file=path=>JSON.parse(readFileSync(path,"utf8"));
const batch=file("data/research/did-you-know/dyk-production-growth-190-310-bilingual-drafts.v1.json");
const selected=file("data/research/did-you-know/dyk-r34-high-signal-24-editorial-selection.v1.json");
assert.equal(batch.schema,"AO_DYK_BILINGUAL_PRODUCTION_GROWTH_001_V1");
assert.equal(batch.state,"BILINGUAL_RESEARCH_PRODUCTION_PENDING_USER_REVIEW_AT_500");
assert.equal(batch.previous_review_drafts,189);
assert.equal(batch.new_drafts,121);
assert.equal(batch.working_total,310);
assert.equal(batch.target,500);
assert.equal(batch.milestone_status.remaining,190);
assert.equal(batch.policy.publication_authorized,false);
assert.equal(batch.policy.no_user_editorial_review_before_500,true);
assert.equal(batch.crossbank_screen.screened_new_bilingual_drafts,121);
for(const k of ["exact_normalized_english_collision_count",
"exact_normalized_french_collision_count","exact_source_record_id_collision_count"]){
  assert.equal(batch.crossbank_screen[k],0);
}
assert.equal(batch.crossbank_screen.public_private_previews_copied,false);
assert.equal(batch.crossbank_screen.manual_semantic_review_deferred_until_milestone_500,true);
assert.equal(batch.facts.length,121);
assert.deepEqual(batch.count_by_lane,{"weiser-seasonal-customs":76,
 "pitre-sicilian-customs":33,"mass-1962":12});
const ids=new Set(),sources=new Set(),copyEn=new Set(),copyFr=new Set();
const protected24=new Set(selected.records.map(x=>x.id));
const selectedSources=new Set(selected.records.map(x=>x.source_id));
let originalPage=0,ritus=0,claimWarnings=0;
function norm(s){return String(s).normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
.toLowerCase().replace(/[^a-z0-9]+/g," ").trim()}
for(const x of batch.facts){
 assert.match(x.id,/^DYK-[A-Z0-9-]+$/);
 assert.ok(!ids.has(x.id)&&!protected24.has(x.id),"Repeated featured ID: "+x.id);
 ids.add(x.id);
 assert.ok(!sources.has(x.source.source_id),"Repeated primary source action: "+x.id);
 sources.add(x.source.source_id);
 assert.ok(!selectedSources.has(x.source.source_id),"Reused priority source "+x.id);
 assert.ok(x.statement.en.trim().length>35&&x.statement.fr.trim().length>35);
 assert.ok(!copyEn.has(norm(x.statement.en))&&!copyFr.has(norm(x.statement.fr)),
  "Repeated bilingual fact text "+x.id);
 copyEn.add(norm(x.statement.en));copyFr.add(norm(x.statement.fr));
 assert.ok(["RESERVE_FOR_BALANCE","R22_RESERVE_DISTINCT_RESEARCH"].includes(x.original_disposition));
 assert.match(x.source.source_record_file,/^data\/research\/did-you-know\//);
 assert.match(x.source.primary_witness,/^https:\/\//);
 assert.ok(x.source.original_printed_pages.length||x.source.ritus_locator);
 if(x.source.original_printed_pages.length)originalPage++;
 if(x.source.ritus_locator)ritus++;
 if(x.source.prior_evidence_caveat)claimWarnings++;
 assert.equal(x.review.publication_authorized,false);
 assert.equal(x.review.manual_review_deferred_until_500,true);
 assert.equal(x.review.en_final,false);
 assert.equal(x.review.fr_final,false);
 assert.equal(x.review.app_destination_browser_verified,false);
 assert.equal(x.source.browser_deep_link_verified,false);
}
assert.equal(ids.size,121);
assert.equal(sources.size,121);
assert.ok(originalPage>=109);
assert.ok(ritus>=12);
assert.ok(claimWarnings>0,"Do not strip original source caveats");
console.log("PASS DYK growth 310/500: 121 genuinely source-distinct EN/FR drafts; 0 approved, 0 published");
