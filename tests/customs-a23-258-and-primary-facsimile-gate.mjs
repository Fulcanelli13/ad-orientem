import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const root="data/customs/master/";
const queue=read(root+"customs-wave-a-bulk-review-queue-20261029.v1.json");
const groups=read(root+"customs-408-unified-relationship-gates-20261026.v1.json").records;
const page=read(root+"weiser-408-group-evidence-readiness-screen.v1.json").records;
const A1=read(root+"customs-a1-150-evidence-and-indulgence-triage-20261029.v1.json");
const A23=read(root+"customs-a2-a3-258-source-calendar-indulgence-review-20261029.v1.json");
const direct=read(root+"customs-a1-12-verified-weiser-facsimile-20261029.v1.json");
const grants=read("data/customs/indulgence-grant-research-seed-20261029.v1.json");
const byGroup=new Map(groups.map(r=>[r.id,r])),byPage=new Map(page.map(r=>[r.group_id,r]));
const b23=queue.batches.slice(1).flatMap(b=>b.group_ids);
assert.equal(A1.records.length,150);
assert.equal(A23.records.length,258);
assert.deepEqual(A23.records.map(r=>r.provisional_group_id),b23);
assert.equal(new Set([...A1.records.map(r=>r.provisional_group_id),...A23.records.map(r=>r.provisional_group_id)]).size,408);
assert.deepEqual(new Set([...A1.records.map(r=>r.provisional_group_id),...A23.records.map(r=>r.provisional_group_id)]),new Set(groups.map(r=>r.id)));
assert.deepEqual(A23.records.filter(r=>r.wave==="A2").map(r=>r.provisional_group_id),queue.batches[1].group_ids);
assert.deepEqual(A23.records.filter(r=>r.wave==="A3").map(r=>r.provisional_group_id),queue.batches[2].group_ids);
assert.equal(A23.status,"ALL_258_SOURCE_ID_AND_PAGE_PTRS_PRESERVED_NOT_ALL_VERIFIED");
for(const r of A23.records){
 const orig=byGroup.get(r.provisional_group_id),e=byPage.get(r.provisional_group_id);
 assert.ok(orig&&e);
 assert.equal(r.label,orig.title);
 assert.deepEqual(r.source.observation_ids,orig.source_observation_ids);
 assert.deepEqual(r.source.exact_printed_book_page_pointers,orig.book_page_pointers);
 assert.deepEqual(r.source.prior_page_pointer_provenance,e.source_locations);
 assert.equal(r.source.original_full_page_read_certified,false);
 assert.equal(r.identity.automatic_merge_allowed,false);
 assert.equal(r.identity.distinctness_verdict,"UNRESOLVED");
 assert.equal(r.calendar.signal_provenance,"UNVERIFIED_SOURCE_GROUP_TITLE_ONLY");
 assert.equal(r.calendar.fixed_calendar_date,null);
 assert.equal(r.calendar.calendar_rule,null);
 assert.equal(r.calendar.calendar_publication_approved,false);
 assert.deepEqual(r.indulgence.verified_grant_ids,[]);
 assert.equal(r.indulgence.no_automatic_grant,true);
 assert.equal(r.publication_authorized,false);
 for(const v of Object.values(r.actions))assert.equal(v,"PENDING");
}
assert.equal(A23.summary.groups,258);
assert.equal(A23.summary.group_A2,150);
assert.equal(A23.summary.group_A3,108);
assert.equal(A23.summary.page_index_second_pass,153);
assert.equal(A23.summary.groups_with_second_pass_page_gaps,105);
assert.equal(A23.summary.explicit_title_calendar_topic,157);
assert.equal(A23.summary.source_actions_certified,0);
const verified=new Set(A1.records.filter(r=>r.linked_intake_evidence.some(v=>v.prior_narrow_independent_witness_flag)).map(r=>r.provisional_group_id));
assert.equal(direct.cases.length,12);
assert.deepEqual(new Set(direct.cases.map(r=>r.provisional_group_id)),verified);
assert.equal(direct.status,"TWELVE_DIRECT_PRINTED_PAGE_SCANS_CHECKED; NO_FULL_FOLIO_EXHAUSTIVENESS");
assert.equal(direct.summary.start_page_corrections,2);
assert.equal(direct.summary.passage_starts_preceding_original_pointer,1);
assert.equal(direct.summary.unchanged_pointer_support,9);
assert.equal(direct.summary.source_based_historic_temporal_associations,12);
assert.equal(direct.summary.fixed_month_day_contexts,3);
for(const r of direct.cases){
 assert.ok(byGroup.has(r.provisional_group_id));
 assert.equal(r.verification_type,"SAMPLED_DIRECT_ORIGINAL_PAGE_IMAGE_REVIEW");
 assert.equal(r.pdf_page_zero_index,r.verified_printed_page_start+17);
 assert.equal(r.source_url,direct.primary_pdf_url);
 assert.equal(r.primary_source_temporal_evidence.source_firsthand_verified,true);
 assert.equal(r.primary_source_temporal_evidence.calendar_runtime_enabled,false);
 assert.equal(r.primary_source_temporal_evidence.final_current_1962_application_approved,false);
 assert.equal(r.primary_source_temporal_evidence.indulgence_grant_inferred,false);
 assert.equal(r.full_original_page_exhaustively_verified,false);
 assert.equal(r.identity_merge_approved,false);
}
assert.deepEqual(direct.original_printed_source_page_corrections.map(r=>[r.id,r.previous,r.verified_start]),[
 ["CAT-WEISER-A-029",58,57],["CAT-WEISER-A-111",185,184]
]);
assert.equal(grants.general_plenary_conditions.id,"EI99_GENERAL_NORMS_17_20");
assert.equal(grants.grants.length,23);
assert.equal(grants.canonical_customs_crosswalk.length,38);
assert.equal(grants.counts.potential_intersection_only,10);
assert.equal(grants.counts.actual_indulgence_work_links_published,0);
assert.ok(grants.grants.some(g=>g.grant_type==="PARTIAL"));
assert.ok(grants.grants.some(g=>g.grant_type==="PLENARY"));
for(const row of grants.canonical_customs_crosswalk){
 assert.equal(row.publication_authorized,false);
 assert.equal(row.conditions_verified_for_custom,false);
}
console.log("PASS: All 408 groups accounted for, A1 150 + A2 150 + A3 108, exact source pages preserved, no false approval.");
console.log("PASS: Twelve direct original facsimile actions with corrected page pointers and historically scoped Calendar contexts; no publication.");
console.log("PASS: 23 1999 Enchiridion grant cases, 38 conditional customs screens, Correct Norms 17–20, no automatic indulgence association.");
