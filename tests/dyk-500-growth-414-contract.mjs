import assert from "node:assert/strict";
import{readFileSync}from"node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const previous=read("data/research/did-you-know/dyk-production-growth-311-364-bilingual-drafts.v1.json");
const base=read("data/research/did-you-know/dyk-production-growth-190-310-bilingual-drafts.v1.json");
const newBatch=read("data/research/did-you-know/dyk-production-growth-365-414-bilingual-drafts.v1.json");
assert.equal(previous.working_total,364);assert.equal(base.working_total,310);
assert.equal(newBatch.prior_working_total,364);assert.equal(newBatch.new_drafts,50);
assert.equal(newBatch.working_total,414);assert.equal(newBatch.remaining,86);
assert.equal(newBatch.facts.length,50);
assert.equal(newBatch.policy.publication_authorized,false);
assert.equal(newBatch.policy.not_released_to_h7,true);
assert.equal(newBatch.policy.private_612_semantic_recheck_pending,true);
const oldIDs=new Set([...previous.facts.map(x=>x.id),...base.facts.map(x=>x.id)]);
const oldSources=new Set([...previous.facts.flatMap(x=>x.source.source_ids),...base.facts.map(x=>x.source.source_id)]);
const idSeen=new Set(),sourceSeen=new Set(),enSeen=new Set(),frSeen=new Set();
const norm=s=>s.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
for(const x of newBatch.facts){
 assert.ok(!oldIDs.has(x.id)&&!idSeen.has(x.id));idSeen.add(x.id);
 assert.equal(x.source.source_pointer_only_not_original_page_certified,true);
 assert.equal(x.source.original_folio_action_checked,false);
 assert.ok(x.source.original_printed_page_pointers.length>0);
 assert.ok(x.source.primary_witness.startsWith("https://"));
 assert.ok(x.statement.en.length>54&&x.statement.fr.length>54);
 for(const sid of x.source.source_ids){assert.ok(!sourceSeen.has(sid)&&!oldSources.has(sid),"duplicate source "+sid);sourceSeen.add(sid)}
 const en=norm(x.statement.en),fr=norm(x.statement.fr);
 assert.ok(!enSeen.has(en)&&!frSeen.has(fr));enSeen.add(en);frSeen.add(fr);
 assert.equal(x.review.publication_authorized,false);
 assert.equal(x.review.en_final,false);assert.equal(x.review.fr_final,false);
 assert.equal(x.review.primary_page_claim_recheck_pending,true);
 assert.equal(x.review.manual_review_deferred_until_500,true);
}
assert.equal(idSeen.size,50);
console.log("PASS DYK 414/500: +50 EN/FR historic page-pointer drafts; explicitly unverified, unpublished");
