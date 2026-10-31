import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const d="data/research/did-you-know/";
const load=name=>JSON.parse(readFileSync(d+name,"utf8"));
const old=load("dyk-600-effective-research-master-index.v1.json");
const master=load("dyk-640-effective-research-master-index.v1.json");
const next=load("dyk-next-601-640-pitre-inherited-folio-bilingual-drafts.v1.json");
const sample=load("dyk-600-fixed-random20-sampled-source-review-20261031.v1.json");
assert.equal(old.rows.length,600);assert.equal(master.rows.length,640);
assert.equal(next.facts.length,40);assert.equal(master.unique_source_identifier_count,668);
assert.equal(master.composed_drafts,640);
assert.equal(master.schema,"AO_DYK_640_EFFECTIVE_BILINGUAL_RESEARCH_INDEX_V1");
assert.equal(master.publication_gate.publication_authorized,false);
assert.equal(master.publication_gate.new_h7_publications,0);
assert.equal(master.review_history.new_40_601_640_editorially_approved,false);
assert.equal(master.crossbank_screen.added_40_private_612_preview_screen_complete,false);
assert.equal(master.crossbank_screen.added_40_full_semantic_uniqueness_signoff,false);
assert.equal(master.crossbank_screen.do_not_extend_prior_600_lexical_success_claims_to_640,true);
assert.equal(master.source_status.new_40_fresh_original_page_images_checked,false);
assert.deepEqual(master.rows.slice(0,600),old.rows);
const ids=new Set(),sources=new Set();
for(const row of master.rows){assert.ok(!ids.has(row.id));ids.add(row.id);assert.equal(row.publication_authorized,false);for(const sid of row.source_ids){assert.ok(!sources.has(sid));sources.add(sid);}}
assert.equal(ids.size,640);assert.equal(sources.size,668);
for(const [idx,f] of next.facts.entries()){
 assert.equal(f.sequence,idx+601);assert.equal(f.id,"DYK-G640-P-"+String(idx+1).padStart(3,"0"));
 assert.equal(f.review.publication_authorized,false);
 assert.equal(f.review.private_612_rescreen_pending,true);
 assert.equal(f.source.original_source_page_image_checked_in_previous_research,true);
 assert.equal(f.source.fresh_image_checked_in_this_tranche,false);
 assert.ok(f.source.italian_anchor.length>3);
 assert.ok(f.source.printed_page>0&&f.source.scan_pdf_page_1based>0);
 assert.ok(f.statement.en.length>40&&f.statement.fr.length>40);
 assert.deepEqual(master.rows[600+idx].source_ids,[f.source_id]);
}
assert.equal(sample.sample.length,20);
assert.equal(sample.publication_authorized,false);
console.log("PASS DYK 640: 640 unique drafts, 668 distinct source IDs, unpublished; private 612 check pending");
