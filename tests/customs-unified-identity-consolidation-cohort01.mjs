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
const queue=load('customs-consolidation-cohort01-calendar-first-30-source-review-queue.v1.json');
assert.equal(queue.records.length,30);
assert.equal(queue.summary.priority_page_specific_existing_groups,30);
assert.equal(queue.summary.new_unique_catholic_customs_verified,0);
assert.equal(queue.summary.new_calendar_publications,0);
assert.equal(queue.summary.source_passages_fully_reviewed_in_this_pass,0);
const qids=new Set(),screened=new Map(cohort.records.map(r=>[r.provisional_group_id,r]));
for(let i=0;i<queue.records.length;i++){
 const r=queue.records[i];
 assert.equal(r.priority_rank,i+1);
 assert.ok(screened.has(r.provisional_group_id));
 assert.ok(!qids.has(r.provisional_group_id));qids.add(r.provisional_group_id);
 const source=screened.get(r.provisional_group_id);
 assert.deepEqual(r.source_observation_ids,source.original_source_observation_ids);
 assert.equal(r.source_passage_review_complete,false);
 assert.equal(r.distinct_practice_id_approved,false);
 assert.equal(r.live_1962_calendar_mapping_approved,false);
 assert.equal(r.public_card_copy_approved,false);
 assert.equal(r.publication_state,'RESEARCH_ONLY');
}
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

// First action-level dossiers: preserve distinctions and fail-closed Calendar gating.
const actionDossiers=load('customs-consolidation-cohort01-first-action-evidence-decisions.v1.json');
const rankedQueue=load('customs-consolidation-cohort01-calendar-first-30-source-review-queue.v1.json');
const publishedSeed=JSON.parse(readFileSync('data/customs/customs-atlas-seed.v1.json','utf8'));
assert.equal(actionDossiers.schema,'AO_CUSTOMS_COHORT01_ACTION_EVIDENCE_DECISIONS_V1');
assert.equal(actionDossiers.summary.records_action_reviewed,2);
assert.equal(actionDossiers.records.length,2);
assert.equal(publishedSeed.customs.length,38);
assert.equal(publishedSeed.customs.filter(r=>r.publication_state==='PUBLISHED').length,35);
assert.equal(actionDossiers.summary.new_canonical_ids,0);
assert.equal(actionDossiers.summary.new_publications,0);
assert.equal(actionDossiers.summary.existing_main_merges,0);
assert.equal(actionDossiers.page_locator_quality_hold.discrepancies.length,1);
assert.equal(actionDossiers.page_locator_quality_hold.rescinded_transcription_discrepancies.length,3);
assert.equal(actionDossiers.page_locator_quality_hold.facsimile_image_reviews_complete_for_three,3);
assert.equal(actionDossiers.summary.facsimile_reviews_complete,2);
const actualHold=actionDossiers.page_locator_quality_hold.discrepancies[0];
assert.equal(actualHold.provisional_group_id,'CAT-WEISER-A-089');
assert.equal(actualHold.queue_claimed_printed_page,150);
assert.equal(actualHold.original_facsimile_first_passage_page,149);
assert.match(actualHold.inspection_status,/FACSIMILE_CONFIRMED/);
for(const rec of actionDossiers.records){
 const inQueue=rankedQueue.records.find(r=>r.provisional_group_id===rec.provisional_group_id);
 assert.ok(inQueue,'Dossier may not introduce a new unsourced group');
 assert.deepEqual(rec.source_observation_ids,inQueue.source_observation_ids);
 assert.equal(rec.publication_state,'RESEARCH_ONLY');
 assert.equal(rec.original_page_facsimile_checked,true);
 assert.equal(rec.canonical_id_approved,false);
 assert.equal(rec.copy_approved,false);
 assert.equal(rec.calendar_mapping_approved,false);
 assert.equal(rec.calendar_target.existing_calendar_only,true);
 assert.ok(rec.sources.length>=2);
 assert.ok(rec.sources.some(s=>s.type==='WEISER_1958_ORIGINAL_FACSIMILE_IMAGE'));
 assert.ok(Number.isInteger(rec.original_facsimile_pdf_zero_based_page));
 assert.ok(rec.sources.every(s=>s.url.startsWith('https://')));
 assert.ok(rec.draft_en.length>80 && rec.draft_fr.length>80);
 for(const id of rec.main_identity_comparison.examined_main_ids){
  assert.ok(publishedSeed.customs.some(m=>m.custom_id===id),'Main identity reference missing: '+id);
 }
}
console.log('PASS customs cohort01 action evidence: 2 facsimiles checked, 3 false transcription-page claims corrected, 0 releases.');


// Source-page action review is a superset of the 30 prioritized QUEUE IDs, not new customs.
const original30=load('customs-consolidation-cohort01-original-facsimile-30-action-decisions.v1.json');
assert.equal(original30.schema,'AO_CUSTOMS_COHORT01_30_ORIGINAL_FACSIMILE_ACTION_DECISIONS_V1');
assert.equal(original30.summary.queue_size,30);
assert.equal(original30.summary.original_facsimile_action_passages_checked,30);
assert.equal(original30.records.length,rankedQueue.records.length);
assert.equal(new Set(original30.records.map(r=>r.provisional_group_id)).size,30);
assert.equal(original30.summary.distinct_new_customs_canonically_approved,0);
assert.equal(original30.summary.existing_customs_merges_approved,0);
assert.equal(original30.summary.existing_calendar_card_publications,0);
assert.equal(original30.summary.secondary_locality_witness_records,2);
const routeCounts={};
for(let i=0;i<30;i++){
 const original=original30.records[i],queue=rankedQueue.records[i];
 assert.equal(original.provisional_group_id,queue.provisional_group_id);
 assert.equal(original.priority_rank,queue.priority_rank);
 assert.deepEqual(original.source_observation_ids,queue.source_observation_ids);
 assert.equal(original.previous_queue_page_pointer,queue.source_page);
 assert.ok(original.original_folio_image_checked);
 assert.ok(/^\d+(?:–\d+)?$/.test(original.verified_original_1958_printed_pages));
 assert.ok(Number.isInteger(original.original_scan_pdf_page_zero_based_first));
 assert.ok(original.action_identity_what_happens.length>25);
 assert.ok(original.scope_and_release_guardrail.length>25);
 assert.equal(original.evidence_status,'WEISER_1958_FACSIMILE_PASSAGE_CONFIRMED_SINGLE_AUTHOR');
 assert.equal(original.canonical_identity_approved,false);
 assert.equal(original.merge_approved,false);
 assert.equal(original.calendar_card_approved,false);
 assert.equal(original.calendar_publication_state,'RESEARCH_ONLY');
 for(const owner of original.candidate_existing_or_research_owners_for_manual_comparison){
  assert.ok(owner.startsWith('CUST-')||publishedSeed.customs.some(c=>c.custom_id===owner)||owner.startsWith('CANDIDATE-'),'Unknown master or working owner: '+owner);
 }
 routeCounts[original.suggested_identity_route]=(routeCounts[original.suggested_identity_route]||0)+1;
}
assert.deepEqual(routeCounts,original30.summary.action_level_preliminary_routes);
assert.equal(original30.records.find(r=>r.provisional_group_id==='CAT-WEISER-A-089').verified_original_1958_printed_pages,'149');
assert.equal(original30.records.find(r=>r.provisional_group_id==='CAT-WEISER-B-025').verified_original_1958_printed_pages,'217');
assert.equal(original30.records.find(r=>r.provisional_group_id==='CAT-WEISER-A-024').verified_original_1958_printed_pages,'55–56');
const pilot=load('customs-consolidation-cohort01-calendar-pilot-5-bilingual-drafts.v1.json');
assert.equal(pilot.schema,'AO_CUSTOMS_COHORT01_CALENDAR_PILOT_BILINGUAL_DRAFTS_V1');
assert.equal(pilot.summary.drafts,5);
assert.equal(pilot.records.length,5);
assert.equal(new Set(pilot.records.map(r=>r.group_id)).size,5);
assert.equal(pilot.summary.calendar_publications,0);
assert.equal(pilot.summary.approved_new_ids,0);
for(const card of pilot.records){
 assert.ok(original30.records.some(r=>r.provisional_group_id===card.group_id));
 assert.ok(card.description_en.length>100&&card.description_fr.length>100);
 assert.equal(card.canonical_id,null);
 assert.equal(card.record_status,'EDITORIAL_DRAFT_UNAPPROVED');
 assert.equal(card.calendar_link_approved,false);
 assert.equal(card.public_article_approved,false);
}
console.log('PASS customs cohort01 30 original source-page identity routes and 5 bilingual Calendar-only draft profiles; 0 approved ids, 0 publications.');


// Full 408-group coverage at screening level: 47 older owner candidates + 150 cohort01 + 211 cohort02.
const cohort02=load('customs-unified-identity-consolidation-cohort02-211.v1.json');
assert.equal(cohort02.schema,'AO_CUSTOMS_COHORT02_211_OWNER_UNRESOLVED_SOURCE_LABEL_ACTION_SCREEN_V1');
assert.equal(cohort02.records.length,211);
assert.equal(cohort02.summary.newly_screened_groups,211);
assert.equal(cohort02.summary.screening_covering_all_408_groups,408);
assert.equal(cohort02.summary.original_source_passages_inspected_in_this_second_cohort,0);
assert.equal(cohort02.summary.new_approved_canonical_identities,0);
assert.equal(cohort02.summary.new_calendar_publications,0);
const screened=new Set(cohort.records.map(r=>r.provisional_group_id));
let relationCount=0,calendarSignalCount=0;
const countByBin={};
for(let i=0;i<cohort02.records.length;i++){
 const rec=cohort02.records[i];
 assert.equal(rec.audit_id,'AO-CONSOL-02-'+String(i+1).padStart(3,'0'));
 assert.ok(allIds.has(rec.provisional_group_id));
 assert.ok(!priorOwners.has(rec.provisional_group_id));
 assert.ok(!screened.has(rec.provisional_group_id));
 assert.ok(rec.working_action_label.length>=8);
 assert.ok(rec.source_observation_ids.length>=1);
 assert.equal(rec.first_witness_exact_passage_verified_this_batch,false);
 assert.equal(rec.independent_secondary_witness_verified_this_batch,false);
 assert.equal(rec.existing_owner_confirmed,false);
 assert.equal(rec.distinct_identity_approved,false);
 assert.equal(rec.calendar_date_rule_approved,false);
 assert.equal(rec.calendar_publication_approved,false);
 assert.equal(rec.publication_state,'RESEARCH_ONLY');
 for(const cmp of rec.action_level_manual_comparators){
   assert.ok(typeof cmp.explanation==='string'&&cmp.explanation.length>35);
   assert.ok(allIds.has(cmp.compare_to)||audit.records.some(m=>m.custom_id===cmp.compare_to)||cmp.compare_to.startsWith('OTHER_MODULE_'),'Unknown candidate comparator: '+cmp.compare_to);
   relationCount++;
 }
 calendarSignalCount+=Number(rec.calendar_topic_label_signals_only.length>0);
 countByBin[rec.preliminary_scope_bin]=(countByBin[rec.preliminary_scope_bin]||0)+1;
 screened.add(rec.provisional_group_id);
}
assert.equal(screened.size,361);
assert.equal(new Set([...screened,...priorOwners]).size,408);
assert.equal(relationCount,cohort02.summary.action_level_comparison_hypotheses);
assert.equal(calendarSignalCount,cohort02.summary.groups_with_calendar_topic_label_signal);
assert.deepEqual(countByBin,cohort02.summary.bin_counts);
assert.equal(cohort02.records.find(x=>x.provisional_group_id==='CAT-WEISER-B-109').action_level_manual_comparators[0].compare_to,'CAT-WEISER-B-083');
assert.equal(cohort02.records.find(x=>x.provisional_group_id==='CAT-WEISER-A-090').action_level_manual_comparators[0].compare_to,'CAT-WEISER-A-089');
// Verified outside sources may upgrade a narrowly defined practice but cannot approve its publication.
const pilotSeises=pilot.records.find(x=>x.group_id==='CAT-WEISER-B-083');
assert.equal(pilotSeises.recommended_identity_disposition,'SINGLE_LOCAL_IDENTITY_MULTI_OCCASION');
assert.equal(pilotSeises.multi_feast_same_identity_research_lead,'CAT-WEISER-B-109');
assert.ok(pilotSeises.additional_sources.some(s=>s.url.includes('catedraldesevilla.es')));
const pilotCandlemasCrib=pilot.records.find(x=>x.group_id==='CAT-WEISER-B-116');
assert.ok(pilotCandlemasCrib.additional_sources.some(s=>s.url.includes('dioceseofprovidence.org')));
const pilotJoseph=pilot.records.find(x=>x.group_id==='CAT-WEISER-A-028');
assert.equal(pilotJoseph.current_approval,'FIRST_SOURCE_ONLY');
assert.equal(pilotJoseph.calendar_link_approved,false);
assert.equal(pilot.records.every(x=>x.record_status==='EDITORIAL_DRAFT_UNAPPROVED'),true);
console.log('PASS customs cohort02: 408/408 research groups now screened or owner-linked (47+150+211); 56 comparison hypotheses; zero newly confirmed customs or Calendar releases.');
