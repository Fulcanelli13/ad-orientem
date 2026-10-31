// Research review-only regression: corrections must never publish unapproved H7 DYK facts.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const dir="data/research/did-you-know/";
const get=(p)=>JSON.parse(readFileSync(dir+p,"utf8"));
const original=get("dyk-500-random50-editorial-source-audit-20261031.v1.json");
const originalIndex=get("dyk-500-composed-research-master-index.v1.json");
const patch=get("dyk-r50-sample-remediation-and-weiser-primary-source-checks.v1.json");
const corrected=get("dyk-r50-corrected-50-record-review-edition.v1.json");
assert.equal(original.records.length,50);
assert.equal(originalIndex.rows.length,500);
assert.equal(original.randomization.seed_uint32,20261031);
assert.equal(patch.baseline.seed_uint32,20261031);
assert.equal(corrected.seed_uint32,20261031);
assert.deepEqual(patch.baseline.original_drawn_ids,original.records.map(x=>x.id));
assert.equal(patch.retired_from_eligible_review.length,1);
assert.equal(patch.retired_from_eligible_review[0].id,"DYK-GI-G074");
assert.equal(patch.replacement.replaces_id,"DYK-GI-G074");
assert.ok(patch.replacement.statement.en.length>50&&patch.replacement.statement.fr.length>50);
assert.equal(patch.replacement.source_page_image_directly_checked,true);
assert.equal(patch.replacement.publication_authorized,false);
assert.equal(patch.replacement.full_612_semantic_uniqueness_approved,false);
assert.equal(patch.revisions.length,21);
assert.equal(patch.original_folio_direct_checks.length,27);
assert.ok(patch.original_folio_direct_checks.every(x=>x.method==="CURRENT_TURN_ORIGINAL_FACSIMILE_SCREENSHOT"&&x.historical_independence_verified===false));
assert.equal(corrected.sample.length,50);
assert.equal(corrected.sample[2].original_disqualified_id,"DYK-GI-G074");
assert.equal(corrected.sample[2].id,patch.replacement.id);
const retire=new Set(patch.retired_from_eligible_review.map(x=>x.id));
const eligible=originalIndex.rows.filter(x=>!retire.has(x.id)).map(x=>x.id);
eligible.push(patch.replacement.id);
assert.equal(eligible.length,500);
assert.equal(new Set(eligible).size,500);
const ids=new Set(eligible);
for(let i=0;i<original.records.length;i++){
 const old=original.records[i],next=corrected.sample[i];
 assert.equal(next.draw,old.draw);
 assert.equal(next.index_position,old.index_position);
 assert.ok(ids.has(next.id),next.id);
 assert.equal(next.eligible_for_automatic_publication,false);
 assert.equal(next.bilingual_copy_final_signoff,false);
 assert.equal(next.legacy_612_semantic_signoff,false);
 assert.equal(next.source_destination_browser_signoff,false);
 if(i!==2)assert.equal(next.id,old.id);
}
assert.equal(new Set(corrected.sample.map(x=>x.id)).size,50);
for(const c of patch.revisions){
 const got=corrected.sample.find(x=>x.id===c.id);
 assert.ok(got,c.id);
 if(c.revised_statement){
  assert.equal(got.statement_en,c.revised_statement.en);
  assert.equal(got.statement_fr,c.revised_statement.fr);
  assert.notEqual(got.statement_en,original.records.find(x=>x.id===c.id).statement_en);
 }
 assert.ok(c.source.printed_pages.length);
}
for(const s of patch.original_folio_direct_checks){
 const rec=corrected.sample.find(x=>x.id===s.id);
 assert.ok(rec,"Missing source check entry "+s.id);
 assert.equal(rec.source_evidence_tier,"DIRECT_FACSIMILE_PAGE_CHECKED");
}
assert.equal(patch.summary.all_50_finally_approved,false);
assert.equal(patch.summary.new_publications,0);
assert.equal(originalIndex.quality.publication_authorized,false);
assert.equal(originalIndex.quality.new_h7_publications,0);
console.log("PASS DYK R50 repaired review-only sample: original 50 retained by draw, #3 substituted transparently, 27 source checks, 0 publication");
