import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=name=>JSON.parse(readFileSync(new URL("../data/customs/master/"+name,import.meta.url),"utf8"));
const identities=load("identities.v0.json"),observations=load("weiser-observations.v0.json"),editorial=load("editorial-owner-reconciliation.v0.json"),queue=load("coverage-and-review-queue.v0.json");
const rows=identities.records,obs=observations.records,edit=editorial.editorial_cards,proposals=editorial.candidate_proposals;
const triage=[load("identity-triage-ch01-12.v0.json"),load("identity-triage-ch13-19.v0.json"),load("identity-triage-ch20-28.v0.json")];
const firstPass=load("first-pass-260-reconciliation.v1.json");
const dates=load("normalized-temporal-context.v0.json");
const triaged=triage.flatMap(x=>x.rows);
const overlap=load("possible-distinct-candidate-overlap.v1.json");
const bounded=load("independent-sources-batch01.v1.json");
const bounded2=load("independent-sources-batch02.v1.json");
const bounded3=load("independent-sources-batch03.v1.json");
const bounded4=load("independent-sources-batch04.v1.json");
const holds17=load("unverified-candidate-exact-claim-holds.v1.json");
const identityRecs=load("witnessed-identity-recommendations.v1.json");
const staged14=load("proposed-identity-additions.v1.json");
const working56=load("working-master.v1.json");
const routed23=load("ritual-and-source-ownership-23.v1.json");
const readiness=load("master-readiness-audit.v1.json");
const accepted14=load("editorial-identity-acceptance-14.v1.json");
const acceptedP2=load("editorial-identity-acceptance-p2-four.v1.json");
const geo53=load("geographic-family-crosswalk-53.v1.json");
const sot63=load("sot07-original-63-crosswalk.v1.json");

const relation80=load("relation-review-80.v1.json");
const candidateBoard=load("candidate-source-decision-board.v1.json");


const unique=items=>new Set(items).size===items.length;
const sum=obj=>Object.values(obj).reduce((n,x)=>n+x,0);
assert.equal(identities.schema,"AO_CUSTOMS_MASTER_IDENTITIES_V0");
assert.equal(observations.schema,"AO_CUSTOMS_MASTER_WEISER_OBSERVATION_INDEX_V0");
assert.equal(editorial.schema,"AO_CUSTOMS_MASTER_EDITORIAL_RECONCILIATION_V0");
assert.equal(queue.schema,"AO_CUSTOMS_MASTER_COVERAGE_AND_REVIEW_QUEUE_V0");
assert.equal(rows.length,42);assert.ok(unique(rows.map(x=>x.id)));
assert.equal(rows.filter(x=>x.identity_status==="CANONICAL_IN_MAIN").length,38);
assert.equal(rows.filter(x=>x.identity_status==="PROVISIONAL_P2_NOT_CANONICAL").length,4);
assert.equal(rows.filter(x=>x.publication_state==="PUBLISHED").length,35);
assert.equal(rows.filter(x=>x.publication_state==="CONTEXT_ONLY").length,3);
assert.ok(rows.every(x=>x.do_not_auto_publish===true&&x.name_en&&x.name_fr&&x.description_en&&x.description_fr&&x.caution_en&&x.caution_fr));
assert.ok(rows.every(x=>x.calendar.date_authority==="CALENDAR_DAY_RESOLVER_ONLY"));
assert.ok(rows.every(x=>x.source_ids.length&&x.source_ids.every(id=>x.sources.some(s=>s.id===id&&/^https:\/\//.test(s.url||"")))));
const canon=rows.filter(x=>x.identity_status==="CANONICAL_IN_MAIN");
assert.equal(canon.length,38);
assert.ok(canon.every(x=>x.history_en&&x.history_fr&&x.meaning_en&&x.meaning_fr&&x.practice_en&&x.practice_fr));
assert.ok(canon.every(x=>x.do_not_auto_publish===true));
assert.equal(identities.quality_audit.canonical_historical_en_fr,38);
assert.equal(identities.quality_audit.canonical_meaning_en_fr,38);
assert.equal(identities.quality_audit.canonical_practice_en_fr,38);
assert.deepEqual(identities.quality_audit.history_gap_ids,[]);
assert.ok(identities.quality_audit.historical_witnesses_from_closure>=26);
assert.ok(canon.filter(x=>x.historical_source_witnesses?.length).length===11);
assert.ok(canon.every(x=>(x.historical_source_witnesses||[]).every(s=>/^https:\/\//.test(s.url)&&s.issuer&&s.supports)));
assert.equal(identities.quality_audit.editorial_release_approved,false);

assert.equal(obs.length,568);assert.ok(unique(obs.map(x=>x.id)));
assert.equal(new Set(obs.map(x=>x.chapter)).size,28);
assert.deepEqual(observations.summary.triage,{COVERED:85,HISTORY_ONLY:117,CANDIDATE:131,REGIONAL:145,ENRICH:56,EXCLUDE:34});
assert.equal(sum(observations.summary.triage),568);
assert.equal(obs.filter(x=>x.linked_master_identity_ids.length).length,50);
const ids=new Set(rows.map(x=>x.id)),wid=new Set(obs.map(x=>x.id));
for(const o of obs){
 assert.ok(o.id.startsWith("WEI58-")&&o.printed_page>0);
 assert.ok(o.linked_master_identity_ids.every(id=>ids.has(id)));
 assert.ok(o.editorial_card_ids.every(id=>edit.some(x=>x.editorial_id===id)));
 assert.equal(o.publication_state,o.triage==="EXCLUDE"?"EXCLUDE_FROM_CUSTOMS_APP":o.triage==="HISTORY_ONLY"?"HISTORICAL_ARCHIVE_ONLY":"RESEARCH_NOT_PROMOTED");
}
assert.equal(obs.filter(x=>x.p1_research_status).length,144);
assert.deepEqual(observations.summary.p1_dispositions,{
 NO_EXACT_INDEPENDENT_MATCH_HOLD:38,EDITORIAL_DRAFT_REQUIRES_OWNER_PARITY:56,
 PARTIAL_OR_INDIRECT_EVIDENCE_HOLD:46,BOUNDED_CONTEXT_EXISTING_OWNER_ONLY:4
});
assert.equal(edit.length,54);assert.ok(unique(edit.map(x=>x.editorial_id)));
assert.ok(edit.every(x=>x.weiser_ids.length&&x.weiser_ids.every(id=>wid.has(id))));
assert.equal(proposals.length,15);assert.equal(proposals.filter(x=>x.identity_resolution==="ALREADY_PRESENT_IN_38_CANONICAL_IDENTITIES").length,11);
assert.equal(proposals.filter(x=>x.identity_resolution==="DISTINCT_P2_PROVISIONAL").length,4);
assert.ok(proposals.every(x=>ids.has(x.reconciled_master_id)));
assert.equal(editorial.potential_same_practice_groups.length,14);
assert.equal(editorial.related_variant_families.length,28);
assert.ok(editorial.potential_same_practice_groups.every(x=>x.observation_ids.every(id=>wid.has(id))));
assert.ok(editorial.related_variant_families.every(x=>x.observation_ids.every(id=>wid.has(id))));
assert.equal(triaged.length,260,"All 260 owner-unknown observations receive a provisional route");
assert.equal(new Set(triaged.map(x=>x.weiser_id)).size,260,"Never collapse two distinct book locators");
const old260=obs.filter(x=>!x.linked_master_identity_ids.length&&
  ["CANDIDATE","REGIONAL","ENRICH"].includes(x.triage)&&!x.editorial_card_ids.length);
assert.deepEqual(new Set(triaged.map(x=>x.weiser_id)),new Set(old260.map(x=>x.id)),"Exactly cover the previously ownerless observations");
assert.ok(triage.every(x=>x.schema==="AO_CUSTOMS_MASTER_260_OBSERVATION_DISPOSITIONS_V0"&&
  x.status==="PROVISIONAL_OWNER_TRIAGE_NOT_FINAL_SOURCE_ADJUDICATION"));
assert.ok(triaged.every(x=>x.publication_authorized===false&&x.editorial_review_complete===false));
assert.ok(triaged.every(x=>x.proposed_owner_or_identity==null||
  !x.proposed_owner_or_identity.startsWith("CANDIDATE-")||
  ids.has(x.proposed_owner_or_identity)),"Provisional candidate identities must exist in the master");
const bins={};for(const x of triaged)bins[x.provisional_disposition]=(bins[x.provisional_disposition]||0)+1;
assert.deepEqual(bins,firstPass.summary.dispositions);
assert.deepEqual(bins,{
 REGIONAL_VARIANT_OR_RELATED_PRACTICE:39,
 HISTORICAL_OR_CULTURAL_REFERENCE_ONLY:59,
 SOURCE_OR_RITUAL_HOLD:23,
 LINK_TO_KNOWN_IDENTITY_FOR_REVIEW:41,
 OTHER_MODULE_OWNER_NO_NEW_CUSTOM:56,
 POTENTIALLY_DISTINCT_CUSTOM_REQUIRES_SOURCE_GATE:42
});
assert.equal(firstPass.governance.new_canonical_ids_issued,0);
assert.equal(firstPass.governance.app_publications_authorized,0);
assert.equal(firstPass.governance.source_witnesses_added,0);
assert.equal(overlap.schema,"AO_CUSTOMS_MASTER_42_POSSIBLE_DISTINCT_DUPLICATE_REVIEW_V1");
assert.equal(overlap.groups.length,8);
assert.equal(overlap.scope.potential_distinct_observations,42);
assert.equal(overlap.scope.within_provisional_overlap_review+overlap.scope.unclustered_for_direct_source_review,42);
assert.equal(bounded.schema,"AO_CUSTOMS_INDEPENDENT_SOURCE_CLOSURE_B01_V1");
assert.equal(bounded.records.length,6);
assert.equal(bounded.scope.source_witnesses,9);
const distinctIDs=new Set(firstPass.distinct_custom_candidates.map(x=>x.weiser_id));
assert.ok(bounded.records.every(x=>distinctIDs.has(x.weiser_id)&&x.source_claim_bounded&&
  x.user_facing_status==="NOT_RELEASED"&&x.sources.every(s=>/^https:\/\//.test(s.url))));
assert.ok(bounded.records.every(x=>x.identity_status==="DISTINCT_PRACTICE_CANDIDATE_REQUIRES_CROSS_MODULE_DUPLICATE_GATE"));
assert.equal(bounded.scope.no_canonical_ids_created,true);
assert.equal(bounded2.schema,"AO_CUSTOMS_INDEPENDENT_SOURCE_CLOSURE_B02_V1");
assert.equal(bounded2.scope.candidate_records,9);
assert.equal(bounded2.scope.source_witnesses,18);
assert.equal(bounded2.scope.application_publications,0);
assert.equal(bounded2.scope.canonical_ids_created,0);
assert.ok(bounded2.records.every(x=>distinctIDs.has(x.weiser_id)));
assert.ok(bounded2.records.every(x=>x.name_en&&x.name_fr&&x.history_en&&x.history_fr&&
  x.meaning_en&&x.meaning_fr&&x.practice_en&&x.practice_fr&&x.qualification_en&&x.qualification_fr&&x.date_context));
assert.ok(bounded2.records.every(x=>x.sources.length>=2&&x.sources.every(s=>s.id&&s.issuer&&s.supports&&s.limit&&/^https:\/\//.test(s.url))));
assert.ok(bounded2.records.every(x=>x.publication_enabled===false&&x.artwork_assigned===false&&
  x.editorial_approval==="PENDING"&&x.identity_gate==="PENDING"));
assert.equal(new Set([...bounded.records,...bounded2.records].map(x=>x.weiser_id)).size,15);
assert.ok(bounded.records.every(x=>x.history_en&&x.history_fr&&x.meaning_en&&x.meaning_fr&&x.practice_en&&x.practice_fr&&x.qualification_en&&x.qualification_fr&&x.publication_enabled===false));
assert.equal(candidateBoard.schema,"AO_CUSTOMS_MASTER_42_SOURCE_DECISION_BOARD_V1");
assert.equal(candidateBoard.records.length,42);
assert.equal(candidateBoard.summary.source_bounded,25);
assert.equal(candidateBoard.summary.still_unverified,17);
assert.equal(candidateBoard.summary.bilingual_source_bounded,25);
assert.equal(candidateBoard.summary.source_witnesses,43);
assert.ok(candidateBoard.records.every(x=>x.published===false&&x.new_canonical_id===null));
assert.deepEqual(new Set(candidateBoard.records.map(x=>x.weiser_id)),distinctIDs);
assert.ok(candidateBoard.records.every(x=>x.related_master_or_review_ids.every(id=>ids.has(id)||distinctIDs.has(id))));
assert.equal(candidateBoard.summary.new_canonicals,0);
assert.equal(bounded3.schema,"AO_CUSTOMS_INDEPENDENT_SOURCE_CLOSURE_B03_V1");
assert.equal(bounded3.records.length,8);
assert.equal(bounded3.audit.witnesses,13);
assert.equal(bounded4.schema,"AO_CUSTOMS_INDEPENDENT_SOURCE_CLOSURE_B04_V1");
assert.equal(bounded4.records.length,2);
assert.equal(bounded4.audit.independent_witnesses,3);
const allBatches=[...bounded.records,...bounded2.records,...bounded3.records,...bounded4.records];
const boundedIDs=new Set(allBatches.map(x=>x.weiser_id));
assert.equal(boundedIDs.size,25);
assert.equal(allBatches.reduce((n,x)=>n+x.sources.length,0),43);
assert.ok(allBatches.every(x=>x.sources.length&&x.sources.every(s=>/^https:\/\//.test(s.url)&&s.issuer)));
assert.ok(bounded3.records.every(x=>x.history_en&&x.history_fr&&x.practice_en&&x.practice_fr&&x.meaning_en&&x.meaning_fr&&x.qualification_en&&x.qualification_fr&&x.publication_enabled===false));
assert.ok(bounded4.records.every(x=>x.history_en&&x.history_fr&&x.practice_en&&x.practice_fr&&x.publication_enabled===false));
assert.equal(holds17.schema,"AO_CUSTOMS_UNVERIFIED_CANDIDATE_EXACT_CLAIM_HOLDS_V1");
assert.equal(holds17.records.length,17);
assert.equal(holds17.scope.missing_exact_source,12);
assert.equal(holds17.scope.partial_claim_support,5);
assert.ok(holds17.records.every(x=>x.reopen_condition&&x.unverified_claim&&x.publication_enabled===false));
const holdIDs=new Set(holds17.records.map(x=>x.weiser_id));
assert.equal(holdIDs.size,17);
assert.ok([...holdIDs].every(id=>!boundedIDs.has(id)));
assert.deepEqual(new Set([...boundedIDs,...holdIDs]),distinctIDs);
assert.ok(candidateBoard.records.every(x=>(boundedIDs.has(x.weiser_id)?
  x.evidence_review==="INDEPENDENTLY_WITNESSED_NARROW_CLAIM"&&x.current_source_count>0&&x.editorial_language_status==="EN_FR_BOUNDED_DRAFT_REQUIRES_APPROVAL":
  x.current_source_count===0&&x.working_identity_decision==="SOURCE_GATE_HOLD_NO_NEW_CANONICAL_ID")));
assert.equal(identityRecs.schema,"AO_CUSTOMS_25_WITNESSED_IDENTITY_RECOMMENDATIONS_V1");
assert.equal(identityRecs.records.length,25);
assert.deepEqual(new Set(identityRecs.records.map(x=>x.weiser_id)),boundedIDs);
assert.equal(identityRecs.scope.recommendations.DISTINCT_IDENTITY_PROPOSAL,14);
assert.equal(identityRecs.scope.new_ids_allocated,0);
assert.equal(identityRecs.scope.app_publications,0);
assert.equal(staged14.schema,"AO_CUSTOMS_PROPOSED_14_DISTINCT_IDENTITIES_V1");
assert.equal(staged14.records.length,14);
assert.equal(new Set(staged14.records.map(x=>x.id)).size,14);
assert.equal(staged14.numbers.new_published,0);
assert.ok(staged14.records.every(x=>x.identity_state==="EDITORIALLY_ACCEPTED_FOR_RESEARCH_MASTER_NOT_APP"&&
  x.publication_enabled===false&&x.identity_approved===true&&x.artwork===null));
assert.ok(staged14.records.every(x=>x.independent_sources.length>0&&x.independent_sources.every(s=>/^https:\/\//.test(s.url))));
assert.deepEqual(new Set(staged14.records.flatMap(x=>x.original_observation_ids)),
  new Set(identityRecs.records.filter(x=>x.editorial_recommendation==="DISTINCT_IDENTITY_PROPOSAL").map(x=>x.weiser_id)));
assert.ok(staged14.records.every(x=>x.calendar.calendar_dayresolver_only===true&&x.calendar.infer_automatic_procession===false&&x.calendar.infer_automatic_mass_action===false));
assert.equal(working56.schema,"AO_CUSTOMS_WORKING_MASTER_56_V1");
assert.equal(working56.records.length,56);
assert.equal(new Set(working56.records.map(x=>x.id)).size,56);
assert.equal(working56.distribution.canonical_main_unchanged,38);
assert.equal(working56.distribution.older_P2_provisional,4);
assert.equal(working56.distribution.new_source_bounded_proposals,14);
assert.equal(working56.distribution.new_publications,0);
assert.ok(working56.records.every(x=>x.name_en&&x.name_fr&&x.description_en&&x.description_fr&&
  x.history_en&&x.history_fr&&x.meaning_en&&x.meaning_fr&&x.practice_en&&x.practice_fr&&
  x.caution_en&&x.caution_fr&&x.calendar&&x.do_not_auto_publish===true));
assert.deepEqual(new Set(working56.records.map(x=>x.id)),
  new Set([...rows.map(x=>x.id),...staged14.records.map(x=>x.id)]));
assert.equal(routed23.schema,"AO_CUSTOMS_MASTER_23_RITUAL_AND_SOURCE_OWNERSHIP_V1");
assert.equal(routed23.records.length,23);
assert.equal(new Set(routed23.records.map(x=>x.weiser_id)).size,23);
assert.equal(routed23.summary.app_publications,0);
assert.equal(routed23.summary.canonical_new_ids,0);
assert.ok(routed23.records.every(x=>x.research_only===true&&x.publishable_rite_text===false&&
  x.ministerial_action_inferred===false&&x.local_event_scheduled===false&&x.canonical_id_created===false));
assert.ok(routed23.records.every(x=>x.independent_refs.every(s=>/^https:\/\//.test(s.url)&&s.constraint)));
assert.equal(readiness.schema,"AO_CUSTOMS_MASTER_EDITORIAL_READINESS_V1");
assert.equal(readiness.snapshot.working_identities,56);
assert.equal(accepted14.schema,"AO_CUSTOMS_MASTER_FOURTEEN_EDITORIAL_IDENTITY_ACCEPTANCE_V1");
assert.equal(accepted14.records.length,14);
assert.deepEqual(accepted14.summary.taxonomy_counts,{
 ATTESTED_LOCAL_CATHOLIC_DEVOTION:7,
 ATTESTED_REGIONAL_CHRISTIAN_FOLK:5,
 ATTESTED_CULTURAL_FEAST_HERITAGE:2
});
assert.equal(accepted14.summary.app_publications,0);
assert.equal(accepted14.summary.pending_identity_decisions,0);
assert.equal(working56.distribution.editorially_classified_staged_research_identities,14);
assert.equal(working56.records.filter(x=>x.master_version==="V1_PROPOSED_RESEARCH_ONLY"&&
 x.identity_status==="MASTER_RESEARCH_IDENTITY_ACCEPTED_NOT_PUBLISHED"&&x.identity_approved_for_research_master).length,14);
assert.equal(readiness.snapshot.research_identities_scope_accepted,14);
assert.equal(acceptedP2.schema,"AO_CUSTOMS_MASTER_FOUR_P2_EDITORIAL_ACCEPTANCE_V1");
assert.equal(acceptedP2.records.length,4);
assert.equal(acceptedP2.summary.app_publications,0);
assert.ok(acceptedP2.records.every(x=>x.identity_approved_for_research_master&&x.app_publication===false));
assert.equal(working56.distribution.earlier_P2_research_accepted,4);
assert.equal(working56.distribution.total_research_identities_editorially_classified,18);
assert.equal(geo53.schema,"AO_CUSTOMS_SOT07G_GEOGRAPHIC_SOURCE_RECONCILIATION_V1");
assert.equal(geo53.families.length,53);
assert.equal(geo53.complexes.length,21);
assert.equal(geo53.attestations.length,135);
assert.equal(geo53.geo_area_ids.length,162);
assert.equal(geo53.original_source_ids.length,117);
assert.equal(geo53.summary.exact_same_practice_links,8);
assert.equal(geo53.summary.mapped_to_existing_working_master_identity,23);
assert.equal(geo53.summary.new_canonicals,0);
assert.equal(geo53.summary.publication_actions,0);
assert.ok(geo53.families.every(x=>!x.working_master_custom_id||working56.records.some(r=>r.id===x.working_master_custom_id)));
const geoFamilies=new Set(geo53.families.map(x=>x.family_id));
const geoAreas=new Set(geo53.geo_area_ids),geoSources=new Set(geo53.original_source_ids);
assert.ok(geo53.attestations.every(x=>geoFamilies.has(x.family_id)&&geoAreas.has(x.geo_id)&&geoSources.has(x.source_id)&&
 x.place_lookup_verified===false&&x.source_url_verified===false&&x.publication_status==="RESEARCH_ONLY"));
assert.equal(geo53.families.find(x=>x.family_id==="CF-ROSARY-PROCESSION").working_master_custom_id,null);
assert.equal(geo53.families.find(x=>x.family_id==="CF-CORPUS-CHRISTI-PROCESSION").working_master_custom_id,null);
assert.equal(geo53.families.find(x=>x.family_id==="CF-FLOWER-CARPET").working_master_custom_id,"CORP-001");
assert.equal(sot63.schema,"AO_CUSTOMS_MASTER_SOT07_ORIGINAL_63_CROSSWALK_V1");
assert.equal(sot63.records.length,63);
assert.equal(sot63.summary.canonical_in_working_master,16);
assert.equal(sot63.summary.other_module_or_editorial_owner,40);
assert.equal(sot63.summary.rejected,4);
assert.equal(sot63.summary.source_held,3);
assert.equal(sot63.summary.additional_canonicals,0);
assert.ok(sot63.records.filter(x=>x.working_master_id).every(x=>working56.records.some(y=>y.id===x.working_master_id)));

assert.equal(readiness.snapshot.source_witness_refs_within_25_bounded_dossiers,43);
assert.equal(readiness.completeness.proposed_identity_editorial_approval,
 "CLOSED_14_OF_14_ACCEPTED_AS_RESEARCH_IDENTITIES_NOT_PUBLISHED");

assert.equal(readiness.snapshot.bilingual_complete_working_profiles,56);
assert.equal(readiness.snapshot.new_source_bounded_proposed_ids,14);
assert.equal(readiness.snapshot.historic_weiser_observations,568);
assert.equal(readiness.snapshot.source_bounded_observations,25);
assert.equal(readiness.snapshot.exact_or_partial_hold_observations,17);
assert.equal(readiness.snapshot.additional_ritual_and_source_cases,23);
assert.equal(readiness.snapshot.regional_related_variants_preliminarily_routed,39);
assert.equal(readiness.snapshot.proposed_links_to_existing_id_first_pass,41);
assert.equal(readiness.snapshot.new_publications_this_branch,0);
assert.equal(readiness.release_decision.approved_final_comprehensive_master,false);
assert.equal(readiness.release_decision.approved_ui_or_module_build,false);
assert.equal(readiness.completeness.working_bilingual_core_fields,"CLOSED_56_OF_56");
assert.ok(staged14.records.every(x=>x.calendar.display_hint_fr&&
  x.provenance.source_file?.startsWith("independent-sources-batch")));
assert.ok(working56.records.filter(x=>x.master_version==="V1_PROPOSED_RESEARCH_ONLY")
  .every(x=>x.calendar.hint_fr&&x.calendar_audit.display_hint_fr));
assert.equal(relation80.schema,"AO_CUSTOMS_MASTER_RECONCILE_80_LINKS_VARIANTS_V1");
assert.equal(relation80.existing_identity_links.length,41);
assert.equal(relation80.regional_variants.length,39);
assert.equal(relation80.scope.total,80);
assert.equal(relation80.scope.identity_corrections_reject_wrong_owner,3);
assert.equal(relation80.scope.new_canonical_ids,0);
assert.equal(relation80.scope.publication_changes,0);
assert.ok(relation80.existing_identity_links.every(x=>x.weiser_id&&x.resolution&&x.new_canonical_id===null));
assert.ok(relation80.regional_variants.every(x=>x.weiser_id&&x.resolution&&x.new_canonical_id===null&&x.auto_publication===false));
const relIds=[...relation80.existing_identity_links,...relation80.regional_variants].map(x=>x.weiser_id);
assert.equal(new Set(relIds).size,80);
assert.deepEqual(new Set(relation80.existing_identity_links.map(x=>x.weiser_id)),
 new Set(triaged.filter(x=>x.provisional_disposition==="LINK_TO_KNOWN_IDENTITY_FOR_REVIEW").map(x=>x.weiser_id)));
assert.deepEqual(new Set(relation80.regional_variants.map(x=>x.weiser_id)),
 new Set(triaged.filter(x=>x.provisional_disposition==="REGIONAL_VARIANT_OR_RELATED_PRACTICE").map(x=>x.weiser_id)));
assert.equal(readiness.snapshot.existing_owner_and_regional_relations_reviewed,80);
assert.equal(readiness.snapshot.explicit_wrong_owner_relations_corrected,3);
assert.equal(readiness.completeness.relationship_owner_review,"80_OF_80_EXPLICIT_DISPOSITIONS_NOT_FINAL_PUBLICATION");


assert.ok(identityRecs.records.every(x=>x.canonical_id===null&&x.distinct_canonical_decision==="PENDING_HUMAN_APPROVAL"&&!x.published));



assert.equal(dates.schema,"AO_CUSTOMS_MASTER_NORMALIZED_TEMPORAL_42_V0");
assert.equal(dates.records.length,42);
assert.equal(dates.counts.dated_or_seasonal,30);
assert.equal(dates.counts.personal_local_undated,12);
assert.deepEqual(new Set(dates.records.map(x=>x.custom_id)),new Set(rows.map(x=>x.id)));
assert.ok(dates.records.every(x=>x.date_resolver_owns_observed_1962_day===true&&
  x.notification_or_procession_automatically_enabled===false&&
  x.feast_rank_assumed===false));
assert.equal(dates.records.find(x=>x.custom_id==="ROGA-001").temporal_type,"COMPOSITE");
assert.equal(dates.records.find(x=>x.custom_id==="CORP-001").local_event_required,true);
assert.equal(dates.records.find(x=>x.custom_id==="CANDIDATE-STJOHN-BONFIRE").normalized_rule,"06-23");


assert.equal(queue.summary.remaining_without_provisional_disposition,0);
assert.equal(queue.summary.identity_or_variant_review,286);
assert.equal(queue.summary.previously_decided_other_owner_or_context_within_286,26);
assert.equal(queue.summary.remaining_without_54_card_owner_decision,260);
const mappedTo54=new Set(obs.filter(x=>x.linked_master_identity_ids.length===0&&
  ["CANDIDATE","REGIONAL","ENRICH"].includes(x.triage)&&x.editorial_card_ids.length).map(x=>x.id));
assert.equal(mappedTo54.size,26);

assert.equal(queue.summary.unlinked,518);
assert.equal(queue.summary.historical_archive,117);
assert.equal(queue.summary.excluded_reference,34);
assert.equal(queue.summary.existing_other_owner_or_covered,81);
assert.deepEqual(queue.summary.review_priority_counts,{P2:172,P1:113,P0:1});
assert.equal(queue.chapter_coverage.length,28);
assert.equal(queue.chapter_coverage.reduce((n,x)=>n+x.total,0),568);
for(const b of queue.review_batches){
 assert.equal(b.population,b.ids.length);
 assert.ok(b.ids.every(id=>wid.has(id)));
}
assert.equal(queue.summary.publication_added,0);
console.log("Customs master phase-1 integrity passed: 42 identities (38+4), 568 observations, 54 editorial drafts, 15→11+4 reconciliation, 14 same-practice groups, 28 families, 286 identity/variant observations still to review. No app publication.");
