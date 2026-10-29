import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const root="data/customs/master/";
const source=load(root+"customs-a1-150-evidence-and-indulgence-triage-20261029.v1.json");
const prior12=load(root+"customs-a1-12-verified-weiser-facsimile-20261029.v1.json");
const prior72=load(root+"customs-weiser-direct-primary-page-sweep-20261029.v1.json");
const last66=load(root+"customs-a1-final66-direct-primary-source-verification-20261029.v1.json");
const board=load(root+"customs-a1-150-primary-source-identity-adjudication-board-20261029.v1.json");
const canon=load("data/customs/customs-atlas-seed.v1.json").customs;
const canonical=new Set(canon.map(x=>x.custom_id));
const original=new Set(source.records.map(x=>x.provisional_group_id));
const id12=new Set(prior12.cases.map(x=>x.provisional_group_id));
const id72=new Set(prior72.records.map(x=>x.group_id));
const id66=new Set(last66.records.map(x=>x.provisional_group_id));
assert.equal(canon.length,38);
assert.equal(canon.filter(x=>x.publication_state==="PUBLISHED").length,35);
assert.equal(canon.filter(x=>x.publication_state==="CONTEXT_ONLY").length,3);
assert.deepEqual([id12.size,id72.size,id66.size],[12,72,66]);
assert.equal(new Set([...id12,...id72,...id66]).size,150);
assert.deepEqual(new Set([...id12,...id72,...id66]),original);
assert.deepEqual(last66.records.map(x=>x.provisional_group_id),source.records.filter(x=>!id12.has(x.provisional_group_id)&&!id72.has(x.provisional_group_id)).map(x=>x.provisional_group_id));
assert.equal(last66.summary.remaining_A1_source_action_screens,66);
assert.equal(last66.summary.cumulative_A1_source_action_screens,150);
assert.equal(last66.summary.documented_index_or_start_page_discrepancies,12);
assert.equal(last66.corrections.length,12);
const bySource=new Map(source.records.map(x=>[x.provisional_group_id,x]));
const corrections=last66.records.filter(x=>x.source_locator_correction);
assert.deepEqual(corrections.map(x=>({id:x.provisional_group_id,old:x.original_indexed_printed_pages,passage_page:x.direct_primary_pdf_page_printed})),last66.corrections);
assert.equal(new Set(last66.records.map(x=>x.review_id)).size,66);
assert.equal(last66.records.filter(r=>r.claim_evaluation!=="PRIMARY_SOURCE_PASSAGE_SUPPORTS_NARROW_HISTORIC_CLAIM").length,1);
const portug=last66.records.find(r=>r.provisional_group_id==="CAT-WEISER-A-092");
assert.ok(portug);
assert.equal(portug.claim_evaluation,"SOURCE_SUPPORTS_CAROL_NOT_SPECIFIC_PORTUGUESE_HOUSE_VISIT");
for(const x of last66.records){
 const src=bySource.get(x.provisional_group_id);
 assert.ok(src);
 assert.deepEqual(x.original_indexed_printed_pages,src.source_trace.printed_pages);
 assert.deepEqual(x.inherited_1958_source_observation_ids,src.source_trace.observation_ids);
 assert.equal(x.direct_primary_pdf_page_zero_index,x.direct_primary_pdf_page_printed+17);
 assert.equal(x.source_verification,"ORIGINAL_WEISER_1958_PRINTED_PAGE_IMAGE_CHECKED");
 assert.ok(x.narrowed_action_description_en.length>40);
 assert.equal(x.original_full_page_exhaustiveness_certified,false);
 assert.equal(x.distinct_identity_signed_off,false);
 assert.equal(x.independent_nonWeiser_witness_rechecked_in_this_pass,false);
 assert.equal(x.exact_1962_calendar_context_editorially_approved,false);
 assert.equal(x.exact_indulgenced_work_approved,false);
 assert.deepEqual(x.indulgence_grant_ids,[]);
 assert.equal(x.publication_authorized,false);
}
assert.equal(board.schema,"AO_CUSTOMS_A1_150_PRIMARY_SOURCE_TO_EXISTING_IDENTITY_REVIEW_V1");
assert.equal(board.records.length,150);
assert.deepEqual(board.records.map(x=>x.provisional_group_id),source.records.map(x=>x.provisional_group_id));
assert.equal(new Set(board.records.map(x=>x.review_id)).size,150);
assert.deepEqual(board.disposition_counts,{
 DISTINCTNESS_EDITORIAL_REVIEW_REQUIRED:106,
 EXISTING_RITE_OR_PRAY_OWNER_REVIEW:10,
 HISTORICAL_FOLKLORE_CONTEXT_REVIEW:15,
 STAGED_UNPUBLISHED_CUSTOM_RELATIONSHIP_REVIEW:2,
 EXISTING_CANONICAL_CUSTOM_RELATIONSHIP_REVIEW:14,
 SOURCE_LABEL_CORRECTION_REQUIRED:3
});
assert.equal(board.stats.explicit_published_canonical_comparators,14);
assert.deepEqual([board.stats.from_prior_12,board.stats.from_prior_72,board.stats.from_last_66],[12,72,66]);
for(const x of board.records){
 assert.equal(x.identity_certification,"PENDING");
 assert.equal(x.safe_to_merge_now,false);
 assert.equal(x.approved_new_distinct_custom_id,null);
 assert.equal(x.historical_current_continuity_verified,false);
 assert.equal(x.no_universal_1962_calendar_inference,true);
 assert.equal(x.indulgence_grant_match_certified,false);
 assert.equal(x.final_EN_FR_approved,false);
 assert.equal(x.calendar_publication_authorized,false);
 if(x.canonical_comparator_id)assert.ok(canonical.has(x.canonical_comparator_id));
 if(x.proposed_staged_release_id)assert.ok(["EPIP-003","CRIB-001"].includes(x.proposed_staged_release_id));
}
assert.equal(board.stats.distinct_new_customs_approved,0);
assert.equal(board.stats.automatic_merges,0);
assert.equal(board.stats.new_published,0);
console.log("PASS A1 complete: 66 new original Weiser source action checks + 84 prior = all 150; 12 adjacent claim-page corrections and one source-label overclaim.");
console.log("PASS A1 identity board: 150 exact source-to-identity dossiers, 14 canonical comparators and two staged PR comparisons; zero unapproved identity mergers or Calendar/indulgence publication.");
