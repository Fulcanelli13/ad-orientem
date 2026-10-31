import assert from "node:assert/strict";
import{readFileSync}from"node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const next=read("data/research/did-you-know/dyk-production-growth-311-364-bilingual-drafts.v1.json");
const prev=read("data/research/did-you-know/dyk-production-growth-190-310-bilingual-drafts.v1.json");
const priority=read("data/research/did-you-know/dyk-r34-high-signal-24-editorial-selection.v1.json");
assert.equal(prev.working_total,310);assert.equal(next.previous_review_drafts,310);
assert.equal(next.new_drafts,54);assert.equal(next.facts.length,54);
assert.equal(next.working_total,364);assert.equal(next.remaining,136);
assert.equal(next.target,500);assert.equal(next.policy.publication_authorized,false);
assert.equal(next.policy.not_released_to_h7,true);
assert.equal(next.policy.legacy_private_612_semantic_recheck_pending,true);
assert.equal(next.screen.legacy_612_private_bank_semantic_check_completed_in_this_batch,false);
assert.equal(next.count_by_lane.calendar_research_21,21);
assert.equal(next.count_by_lane.weiser_direct_folio_13,13);
assert.equal(next.count_by_lane.customs_master_historical_20,20);
const oldIds=new Set([...prev.facts.map(x=>x.id),...priority.records.map(x=>x.id)]);
const oldSources=new Set([...prev.facts.map(x=>x.source.source_id),...priority.records.map(x=>x.source_id)]);
const ids=new Set(),sources=new Set(),en=new Set(),fr=new Set();
const norm=s=>s.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
for(const x of next.facts){
 assert.ok(!oldIds.has(x.id)&&!ids.has(x.id),"repeated ID: "+x.id);ids.add(x.id);
 assert.ok(!sources.has(x.source.source_id)&&!oldSources.has(x.source.source_id),"repeated source "+x.id);sources.add(x.source.source_id);
 assert.ok(x.source.primary_witness.startsWith('https://'));
 assert.equal(x.source.source_owner_commit,next.research_source_commit);
 assert.ok(x.source.source_record_id&&x.source.source_record_file);
 assert.ok(x.statement.en.length>=45&&x.statement.fr.length>=45);
 for(const [key,set] of [["en",en],["fr",fr]]){const n=norm(x.statement[key]);assert.ok(!set.has(n),"duplicated "+key+" fact");set.add(n)}
 assert.equal(x.review.publication_authorized,false);
 assert.equal(x.review.en_final,false);assert.equal(x.review.fr_final,false);
 assert.equal(x.review.manual_review_deferred_until_500,true);
 assert.equal(x.review.source_browser_deep_link_verified,false);
 assert.equal(x.review.app_destination_browser_verified,false);
 assert.equal(x.scope.never_universal_1962_rubric,true);
}
assert.equal(ids.size,54);assert.equal(sources.size,54);
console.log("PASS DYK research growth 364/500: +54 new source-distinct bilingual drafts; 0 new approvals and 0 H7 publications");
