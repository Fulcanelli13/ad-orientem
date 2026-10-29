import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const root="data/customs/master/";
const a1=load(root+"customs-a1-150-evidence-and-indulgence-triage-20261029.v1.json");
const queue=load(root+"customs-wave-a-bulk-review-queue-20261029.v1.json");
const groups=load(root+"customs-408-unified-relationship-gates-20261026.v1.json").records;
const source=load(root+"weiser-408-group-evidence-readiness-screen.v1.json").records;
const intake=load(root+"customs-multibook-bulk150-20261026.v1.json").rows;
const grants=load("data/customs/indulgence-grant-research-seed-20261029.v1.json");
const canonical=load("data/customs/customs-atlas-seed.v1.json").customs;
const byGroup=new Map(groups.map(x=>[x.id,x]));
const byEvidence=new Map(source.map(x=>[x.group_id,x]));
const byIntake=new Map(intake.filter(x=>x.origin==="WEISER_1958").map(x=>[x.source_group_ids[0],x]));
assert.equal(a1.records.length,150);
assert.equal(a1.status,"COMPLETE_150_SOURCE_POINTER_AND_READINESS_AUDIT_NOT_150_SOURCE_FACSIMILE_VERIFICATIONS");
assert.deepEqual(a1.records.map(x=>x.provisional_group_id),queue.batches[0].group_ids);
assert.equal(new Set(a1.records.map(x=>x.review_id)).size,150);
assert.equal(new Set(a1.records.map(x=>x.provisional_group_id)).size,150);
for(const r of a1.records) {
 const g=byGroup.get(r.provisional_group_id),e=byEvidence.get(r.provisional_group_id),b=byIntake.get(r.provisional_group_id);
 assert.ok(g&&e);
 assert.equal(r.working_label,g.title);
 assert.deepEqual(r.source_trace.observation_ids,g.source_observation_ids);
 assert.deepEqual(r.source_trace.printed_pages,g.book_page_pointers);
 assert.deepEqual(r.source_trace.exact_book_source_locations,e.source_locations);
 assert.equal(r.source_trace.full_original_page_read_certified,false);
 assert.equal(r.source_trace.first_hand_source_passage_verified_in_this_wave,false);
 assert.equal(r.source_trace.specific_previous_action_folio_review_reported,g.original_folio_action_checked);
 assert.equal(r.source_trace.previous_spot_check_reported,e.existing_source_page_spot_check_flag);
 assert.equal(r.linked_intake_evidence.length,b?1:0);
 if(b){
   assert.equal(r.linked_intake_evidence[0].intake_id,b.intake_id);
   assert.equal(r.linked_intake_evidence[0].prior_narrow_independent_witness_flag,b.independently_witnessed_narrow_claim);
   assert.equal(r.linked_intake_evidence[0].source_bounded_bilingual_draft_exists,!!b.source_bounded_bilingual_draft);
 }
 assert.equal(r.existing_owner_proposal.status,"PROVISIONAL_NOT_IDENTITY_VERIFIED");
 assert.deepEqual(r.existing_owner_proposal.canonical_owner_ids,g.proposed_owners);
 assert.equal(r.date_and_season.status,"NOT_APPROVED");
 assert.equal(r.date_and_season.proposed_fixed_date,null);
 assert.equal(r.date_and_season.proposed_movable_feast,null);
 assert.equal(r.indulgence.status,"NO_GRANT_LINK_ASSERTED_PENDING_EXACT_WORK_REVIEW");
 assert.deepEqual(r.indulgence.grant_ids,[]);
 assert.equal(r.indulgence.current_law_screened_for_this_practice,false);
 assert.ok(Object.values(r.gate).every(x=>x===false));
}
const summary=a1.summary;
assert.deepEqual(summary,{
 group_count:150,linked_intake_groups:50,prior_source_action_folio_checks:30,
 source_page_spot_checks:15,full_page_reads_certified:0,
 second_pass_detail_page_indexed:106,with_second_pass_page_gaps:44,
 groups_with_prior_narrow_independent_witness:12,groups_with_reusable_bilingual_draft:12,
 date_approvals:0,indulgence_matches_approved:0,identity_approvals:0,new_publications:0
});
assert.equal(grants.schema,"AO_CUSTOMS_INDULGENCE_AUTHORITY_AND_CROSSWALK_RESEARCH_V1");
assert.equal(grants.status,"RESEARCH_ONLY_NOT_IN_CALENDAR_RUNTIME");
assert.equal(grants.grants.length,9);
assert.equal(new Set(grants.grants.map(x=>x.grant_id)).size,9);
assert.equal(grants.canonical_customs_crosswalk.length,38);
assert.deepEqual(grants.canonical_customs_crosswalk.map(x=>x.custom_id),canonical.map(x=>x.custom_id));
assert.equal(grants.canonical_customs_crosswalk.filter(x=>x.candidate_grants.length).length,7);
const grantIds=new Set(grants.grants.map(x=>x.grant_id));
for(const item of grants.canonical_customs_crosswalk) {
 assert.equal(item.conditions_verified_for_custom,false);
 assert.equal(item.publication_authorized,false);
 for(const id of item.candidate_grants)assert.ok(grantIds.has(id));
}
const src=grants.source_scope.primary_url;
assert.match(src,/^https:\/\/www\.vatican\.va\//);
assert.equal(grants.source_scope.current_special_decrees_screen,"NOT_COMPLETE");
assert.equal(grants.general_plenary_conditions.conditions_en.length,6);
assert.equal(grants.general_plenary_conditions.id,"EI99_GENERAL_NORMS_17_20");
assert.deepEqual(grants.general_plenary_conditions.refs,["Normae N. 17 §§1–2","Normae N. 18 §§1–2","Normae N. 19","Normae N. 20 §§1–5"]);
assert.equal(grants.source_scope.authority_checks.later_decrees_complete,false);
for(const g of grants.grants) {
 assert.equal(g.source_url,src);
 assert.equal(g.grant_type,"PLENARY");
 assert.ok(g.exact_concession && g.prescribed_work_en && g.special_conditions.length>0);
 assert.equal(g.usual_conditions_ref,grants.general_plenary_conditions.id);
 assert.equal(g.custom_association_status,"NO_AUTOMATIC_CUSTOM_LINK");
 assert.equal(g.publication_authorized,false);
 assert.equal(g.any_history_from_raccolta,"NOT_REVIEWED_SEPARATE_EDITION");
}
assert.equal(grants.counts.actual_indulgence_work_links_published,0);
console.log("PASS Customs A1: 150 exact source-readiness dossiers, 50 intake joins, 30 prior folio checks, 15 spot-check flags, 12 narrowly witnessed leads; no source/page/identity/date/grant approval invented.");
console.log("PASS Indulgence seed: 9 original 1999 Enchiridion grants and full general plenary conditions, 38 canonical identity crosswalk rows, 7 explicitly nonautomatic intersections; zero published matches.");
