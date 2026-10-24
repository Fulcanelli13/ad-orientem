import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const base='data/customs/master/';
const load=n=>JSON.parse(readFileSync(base+n,'utf8'));
const cohort=load('customs-unified-identity-consolidation-cohort01-150.v1.json');
const audit=load('customs-master56-publication-and-calendar-readiness-audit.v1.json');
const original=[
...load('full-registry-working-groups-ch01-14.v1.json').groups.map(r=>r.proposal_id),
...load('full-registry-working-groups-ch15-28.v1.json').groups.map(r=>r.proposal_id),
...load('full-registry-working-groups-supplement.v1.json').groups.map(r=>r.proposal_id),
...load('historical-practice-recovery-ch01-28.v1.json').records.map(r=>r.research_group_id),
...load('weiser-ch01-09-unindexed-leads-adjudication.v1.json').working_research_groups.map(r=>r.provisional_id),
...load('53-no-owner-customs-action-review.v1.json').new_provisional_groups.map(r=>r.provisional_group_id)
];
assert.equal(original.length,408);
assert.equal(new Set(original).size,408);
const allIds=new Set(original), prior=load('371-group-family-geographic-reconciliation.v1.json');
const priorOwners=new Set(prior.provisional_groups.filter(r=>r.owner_identity_candidates.length>0).map(r=>r.provisional_group_id));
assert.equal(priorOwners.size,47);
assert.equal(cohort.summary.all_provisional_groups,408);
assert.equal(cohort.summary.prior_groups_with_owner_candidate,47);
assert.equal(cohort.summary.owner_unresolved_before_cohort,361);
assert.equal(cohort.summary.cohort_groups_processed,150);
assert.equal(cohort.summary.owner_unresolved_not_yet_processed,211);
assert.equal(cohort.records.length,150);
assert.equal(new Set(cohort.records.map(r=>r.audit_id)).size,150);
assert.equal(new Set(cohort.records.map(r=>r.provisional_group_id)).size,150);
const counts={};
let calendarLabelCount=0,mastersWithLexicalHints=0;
for(let i=0;i<cohort.records.length;i++){
 const r=cohort.records[i];
 assert.equal(r.audit_id,'AO-CONSOL-01-'+String(i+1).padStart(3,'0'));
 assert.ok(allIds.has(r.provisional_group_id));
 assert.ok(!priorOwners.has(r.provisional_group_id));
 assert.ok(r.original_source_observation_ids.length>0);
 assert.ok(r.provisional_action_label.length>5);
 assert.ok(r.earlier_owner_resolution==='NO_EXPLICIT_OWNER_RELATION'||r.earlier_owner_resolution==='NO_PRIOR_CANONICAL_OWNER_PROPOSAL');
 assert.equal(r.source_exact_passage_checked_in_this_cohort,false);
 assert.equal(r.distinct_practice_approved,false);
 assert.equal(r.merge_authorized,false);
 assert.equal(r.independently_attested,false);
 assert.equal(r.calendar_date_rule_verified,false);
 assert.equal(r.calendar_publication_eligible,false);
 assert.equal(r.contemporary_local_continuity_verified,false);
 assert.ok(!r.prior_candidate_owner_ids.length);
 counts[r.preliminary_routing]=(counts[r.preliminary_routing]||0)+1;
 if(r.date_or_season_label_signal_only.length)calendarLabelCount++;
 if(r.potential_existing_master_lexical_hints.length)mastersWithLexicalHints++;
 for(const v of r.potential_existing_master_lexical_hints)assert.ok(audit.records.some(m=>m.custom_id===v.id),'Invalid lexical master reference');
}
assert.deepEqual(counts,cohort.summary.preliminary_routing_counts);
assert.equal(calendarLabelCount,cohort.summary.groups_with_calendar_label_signal);
assert.equal(mastersWithLexicalHints,cohort.summary.groups_with_potential_master_lexical_hints);
assert.equal(cohort.summary.verified_distinct_new_customs,0);
assert.equal(cohort.summary.verified_existing_master_merges,0);
assert.equal(cohort.summary.new_calendar_publications,0);
const master=load('working-master.v1.json');
assert.equal(master.records.length,56);
assert.equal(audit.records.length,56);
assert.equal(audit.summary.existing_master_identities,56);
assert.equal(audit.summary.existing_master_metadata_published,35);
assert.equal(audit.summary.existing_master_metadata_context_only,3);
assert.equal(audit.summary.existing_master_metadata_not_approved,18);
assert.equal(audit.summary.actual_live_calendar_deployment_verified_in_this_pass,0);
assert.equal(audit.summary.existing_master_auto_publish_prohibited,56);
for(let i=0;i<56;i++){
 const r=master.records[i],a=audit.records[i];
 assert.equal(r.id,a.custom_id);
 assert.equal(r.name_en,a.title);
 assert.equal(r.publication_state,a.existing_publication_state);
 assert.equal(r.identity_status,a.existing_identity_status);
 assert.equal(r.do_not_auto_publish,true);
 assert.equal(a.new_calendar_release_authorization,false);
 assert.equal(a.previous_publication_state_is_not_calendar_runtime_verified,true);
}
const cat=load('comprehensive-customs-working-catalogue.v1.json');
assert.equal(cat.summary.source_observations.total_source_detail_rows_including_external,3703);
assert.equal(cat.summary.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(cat.summary.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(cat.summary.no_new_app_publications,true);
console.log('PASS customs consolidation cohort01: 150/361 ownerless research groups triaged, 56 master statuses audited (35 existing published metadata), 0 merges or Calendar releases.');
