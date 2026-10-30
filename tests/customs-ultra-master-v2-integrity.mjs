import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root=new URL("../data/customs/master/",import.meta.url);
const get=p=>JSON.parse(readFileSync(new URL(p,root),"utf8"));
const old=get("customs-ultra-master-observation-index-3703-20261030.v1.json");
const refs=get("customs-ultra-master-v2-3703-reference-crosswalk.v1.json");
const identities=get("customs-ultra-master-v2-identity-register-465.v1.json");
const indulgences=get("customs-ultra-master-v2-indulgence-work-audit.v1.json");
const coverage=get("customs-ultra-master-v2-coverage-gates.v1.json");
const pinnedMaster=get("customs-ultra-master-integrated-20261030.v1.json");
const localSeed=JSON.parse(readFileSync(new URL("../data/customs/customs-atlas-seed.v1.json",import.meta.url),"utf8"));
const sourceOwners=get("customs-all408-consolidated-editorial-decision-ledger-20261029.v1.json");
assert.equal(old.observations.length,3703);
const eid=new Set(old.observations.map(x=>x.evidence_id));
assert.equal(eid.size,3703);
assert.equal(refs.counts.source_pointers_verified,3703);
assert.equal(refs.counts.source_pointer_errors,0);
assert.equal(refs.verified_group_links.length,408);
assert.equal(refs.unassigned_evidence_ids.length,3295);
const assigned=new Set(refs.verified_group_links.map(x=>x.id));
const unassigned=new Set(refs.unassigned_evidence_ids);
assert.equal(assigned.size,408);assert.equal(unassigned.size,3295);
for(const e of eid)assert.ok(assigned.has(e)||unassigned.has(e),"Missing retained source evidence "+e);
for(const e of assigned)assert.ok(!unassigned.has(e),"Source both assigned and unassigned");
assert.equal(refs.verified_group_links.reduce((s,x)=>s+x.group.length,0),409);
const grouplookup=new Map(sourceOwners.records.map(x=>[x.provisional_group_id,x]));
for(const row of refs.verified_group_links){
 const evidence=old.observations.find(x=>x.evidence_id===row.id);
 assert.ok(evidence);
 for(const gid of row.group){
  assert.ok(grouplookup.has(gid),"Unknown group "+gid);
  assert.ok(grouplookup.get(gid).source_observation_ids.includes(evidence.source_observation_id));
 }
}
assert.equal(identities.records.length,465);
const mids=new Set(identities.records.map(x=>x.id));assert.equal(mids.size,465);
assert.equal(identities.records.filter(x=>x.layer==="MASTER_IDENTITY").length,57);
assert.equal(identities.records.filter(x=>x.layer==="PROVISIONAL_GROUP").length,408);
assert.equal(identities.records.filter(x=>x.publication_state==="PUBLISHED").length,36);
assert.equal(identities.records.filter(x=>x.publication_state==="CONTEXT_ONLY").length,3);
assert.equal(pinnedMaster.counts.main_published,36,"Master must retain PENT-001 from current main");
assert.equal(pinnedMaster.master_identities.length,57);
assert.ok(identities.records.some(x=>x.id==="PENT-001"&&x.publication_state==="PUBLISHED"));
assert.equal(localSeed.customs.filter(x=>x.publication_state==="PUBLISHED").length<=36,true,"Never claim unmerged research branch canonical seed is current main");
assert.deepEqual(new Set(pinnedMaster.master_identities.filter(x=>["PUBLISHED","CONTEXT_ONLY"].includes(x.publication_state_current_main)).map(x=>x.id)),new Set(identities.records.filter(x=>x.layer==="MASTER_IDENTITY"&&["PUBLISHED","CONTEXT_ONLY"].includes(x.publication_state)).map(x=>x.id)));
for(const x of identities.records.filter(x=>x.layer==="PROVISIONAL_GROUP"))assert.equal(x.identity_approved_for_publication,false);
assert.equal(indulgences.screening_by_identity.length,465);
assert.equal(new Set(indulgences.screening_by_identity.map(x=>x.identity_id)).size,465);
assert.equal(indulgences.current_grant_work_seeds.length,7);
assert.equal(indulgences.current_work_exactness_exclusions.length,4);
assert.ok(indulgences.current_work_exactness_exclusions.every(x=>x.blanket_plenary_indulgence_claim_allowed===false));
assert.ok(indulgences.current_work_exactness_exclusions.find(x=>x.candidate_concession==="ENCH1999-13").source_action_ids.includes("CCEX26-NEWLAND-0911-01"));
assert.equal(indulgences.screening_by_identity.reduce((n,x)=>n+x.candidate_work_matches.length,0),8);
assert.equal(indulgences.historic_grant_cases.length,4);
assert.equal(indulgences.original_observation_indulgence_mentions.length,5);
for(const c of indulgences.historic_grant_cases)assert.equal(c.can_appear_as_current_grant,false);
for(const x of indulgences.screening_by_identity){assert.equal(x.universal_indulgence_attached_to_this_custom,false);assert.equal(x.historical_1962_raccolta_verified,false);}
assert.equal(coverage.progress.evidence_directly_linked_to_group.not_directly_linked,3295);
assert.equal(coverage.progress.historical_indulgence_original_grants_verified.done,1);
assert.equal(indulgences.counts.original_grants_verified_for_historical_cases,1);
const facsimile=get("customs-ultra-master-v2-historical-grant-source-recheck-20261030.v1.json");
assert.equal(facsimile.summary.primary_instrument_facsimiles_seen,1);
assert.equal(facsimile.cases.filter(x=>x.original_instrument_facsimile_seen).length,1);
assert.ok(facsimile.cases.find(x=>x.review_key==="HIST-IND-003").sources.some(x=>x.pdf_page_one_based===5));
assert.equal(coverage.release_freeze,"RESEARCH_ONLY");

const wave=get("customs-ultra-master-v2-wave01-200-source-scope-screen.v1.json");
assert.equal(wave.rows.length,200);
assert.equal(new Set(wave.rows.map(x=>x.evidence_id)).size,200);
assert.equal(wave.counts.pending_remaining_source_records,3095);
assert.deepEqual(wave.source_bucket_counts,{weiser_family_1956_full_scan:111,weiser_handbook_1958_original:89});
assert.equal(wave.counts.indulgence_grants_certified,0);
assert.ok(wave.rows.every(x=>x.original_source_id_verified===true&&!x.publication_allowed&&!x.calendar_rule_approved&&!x.original_indulgence_grant_verified&&x.final_work_identity_id===null));
assert.ok(wave.rows.every(x=>unassigned.has(x.evidence_id)));
const waves=get("customs-ultra-master-v2-bulk-reconciliation-waves-3295.v1.json");
assert.equal(waves.batches.length,17);
assert.equal(waves.batches.flatMap(x=>x.source_evidence_ids).length,3295);
assert.deepEqual(new Set(waves.batches.flatMap(x=>x.source_evidence_ids)),unassigned);
for(const [number,expected] of [[2,200],[3,200]]){
 const waveDoc=get("customs-ultra-master-v2-wave"+String(number).padStart(2,"0")+"-200-source-scope-screen.v1.json");
 assert.equal(waveDoc.rows.length,expected);
 assert.equal(new Set(waveDoc.rows.map(x=>x.evidence_id)).size,expected);
 assert.ok(waveDoc.rows.every(x=>unassigned.has(x.evidence_id)&&x.original_source_id_verified&&!x.app_publication_allowed&&!x.distinct_custom_identity_approved));
 assert.ok(waveDoc.rows.every(x=>x.original_source_record.repo_path&&x.original_source_record.json_pointer));
}
const wave4=get("customs-ultra-master-v2-wave04-200-source-scope-screen.v1.json");
assert.equal(wave4.rows.length,200);
assert.equal(wave4.counts.source_native_type_available,68);
assert.equal(wave4.counts.requires_actual_passage_type_screen,0);
assert.equal(wave4.counts.source_passage_type_verified_in_hosted_reproductions,132);
assert.equal(wave4.counts.source_semantic_class_available_total,200);
assert.equal(wave4.rows.filter(x=>!x.semantic_source_type_available).length,0);
assert.ok(wave4.rows.every(x=>unassigned.has(x.evidence_id)&&x.original_source_id_verified&&!x.app_publication_allowed));
const firstFour=[...wave.rows,...get("customs-ultra-master-v2-wave02-200-source-scope-screen.v1.json").rows,...get("customs-ultra-master-v2-wave03-200-source-scope-screen.v1.json").rows,...wave4.rows];
assert.equal(new Set(firstFour.map(x=>x.evidence_id)).size,800);
assert.equal(coverage.progress.evidence_only_source_scope_first_pass.done,3295);
assert.equal(coverage.progress.evidence_only_source_scope_first_pass.unprocessed,0);
assert.equal(coverage.progress.evidence_only_source_scope_first_pass.source_type_unresolved_requires_passage,0);
const allSourceScreens=[];
for(let waveNo=1;waveNo<=17;waveNo++){
 const sourceCount=waveNo===17?95:200;
 const screenName="customs-ultra-master-v2-wave"+String(waveNo).padStart(2,"0")+"-"+sourceCount+"-source-scope-screen.v1.json";
 const screen=get(screenName);
 const expected=waves.batches[waveNo-1].source_evidence_ids;
 assert.equal(screen.rows.length,expected.length,"Unexpected number of records in "+screenName);
 for(let i=0;i<screen.rows.length;i++){
  const r=screen.rows[i];
  assert.equal(r.evidence_id,expected[i],"Unstable source ID / wave position in "+screenName);
  assert.equal(r.source_id,r.evidence_id.slice(r.evidence_id.indexOf(":")+1),"Original source ID mismatch "+r.evidence_id);
  assert.ok(unassigned.has(r.evidence_id),"Not a preserved evidence-only record: "+r.evidence_id);
  assert.ok(r.original_source_id_verified===true||r.source_id_exact_match===true||r.original_source_record_id_matched===true||r.source_id_verified_in_this_wave===true,
   "Original record not matched: "+r.evidence_id);
  for(const field of ["publication_allowed","app_publication_allowed","publish_allowed","app_publication","app_published","calendar_published","indulgence_grant_certified","original_indulgence_grant_verified","distinct_custom_certified"])
   if(field in r)assert.equal(r[field],false,field+" accidentally granted to "+r.evidence_id);
 }
 allSourceScreens.push(...screen.rows);
}
assert.equal(allSourceScreens.length,3295);
assert.equal(new Set(allSourceScreens.map(x=>x.evidence_id)).size,3295);
assert.deepEqual(new Set(allSourceScreens.map(x=>x.evidence_id)),unassigned);
assert.equal(allSourceScreens.filter(x=>x.preliminary_lane==="ACTION_SCOPE_UNRESOLVED_LEXICAL_REVIEW_ONLY").length,0);
const hosted=get("customs-ultra-master-v2-132-hosted-passage-identity-review-20261030.v1.json");
assert.equal(hosted.records.length,132);
assert.equal(hosted.source_groups.length,29);
assert.equal(hosted.counts.source_action_records_pending,0);
assert.equal(new Set(hosted.records.map(x=>x.source_id)).size,132);
const wave4bySource=new Map(wave4.rows.map(x=>[x.source_id,x]));
for(const r of hosted.records){
 const mapped=wave4bySource.get(r.source_id);
 assert.ok(mapped,"Missing classified hosted source in wave04: "+r.source_id);
 assert.equal(mapped.source_type_as_recorded,r.claim_scope_route);
 assert.equal(mapped.semantic_source_type_available,true);
 assert.equal(mapped.original_source_url,r.hosted_article_url);
 assert.equal(mapped.app_publication_allowed,false);
 assert.equal(r.calendar_publication_allowed,false);
 assert.equal(r.canonical_merge_permitted,false);
 assert.equal(r.liturgical_1962_rubric_or_ministerial_authority_confirmed,false);
}
assert.equal(coverage.progress.catholicculture_132_hosted_passage_review.actual_hosted_passages_checked,132);
assert.equal(coverage.progress.catholicculture_132_hosted_passage_review.remaining,0);
assert.equal(hosted.counts.attribution_conflict_rows,9);
assert.equal(hosted.records.filter(x=>x.source_attribution_conflict).length,9);
assert.equal(coverage.progress.catholicculture_132_hosted_passage_review.attribution_conflict_rows,9);
assert.equal(coverage.progress.evidence_only_source_scope_first_pass.hosted_source_passage_reclassified,132);
assert.equal(coverage.progress.evidence_only_source_scope_first_pass.source_type_provisionally_routed,3295);
assert.equal(hosted.counts.original_printed_facsimiles_newly_checked,0);
assert.ok(hosted.records.every(x=>x.source_passage_checked&&!x.complete_book_original_facsimile_checked&&!x.canonical_merge_permitted&&!x.calendar_publication_allowed));
const stPeterBlessing=hosted.records.find(x=>x.source_id==="CCEX26-BERGER-1103-02");
const stPeterSupper=hosted.records.find(x=>x.source_id==="CCEX26-BERGER-1103-03");
assert.equal(stPeterBlessing.claim_scope_route,"PRIESTLY_BLESSING_NEW_FISHING_BOAT_MINISTERIAL");
assert.equal(stPeterBlessing.scope_family,"RITUAL_MINISTER_OR_SEPARATE_OWNER_HOLD");
assert.equal(stPeterSupper.claim_scope_route,"REPORTED_YORKSHIRE_FISHERMEN_COMMUNAL_FORK_SUPPER");
assert.equal(stPeterSupper.scope_family,"REPORTED_LOCAL_OR_REGIONAL_PRACTICE");
assert.ok(stPeterBlessing.source_id!==stPeterSupper.source_id);

const dedup=get("customs-ultra-master-v2-79-dedup-reconciliation-caseboard-20261030.v1.json");
assert.equal(dedup.family_action_groups.length,26);
assert.equal(dedup.description_pair_edges.length,41);
assert.equal(dedup.counts.description_pairs_with_new_hosted_passage_anchor,3);
assert.equal(dedup.regional_or_institutional_cluster_cases.length,12);
assert.equal(dedup.counts.merge_operations_approved,0);
assert.equal(dedup.counts.original_family_observations_accounted_for,70);
assert.equal(coverage.progress.dedup_action_review_caseboard.total_review_units,79);
const actionEdges=get("customs-ultra-master-v2-42-action-identity-edges-20261030.v1.json");
assert.equal(actionEdges.rows.length,42);
assert.equal(actionEdges.counts.source_action_edges,42);
assert.equal(actionEdges.counts.existing_owner_ids_examined,14);
assert.equal(new Set(actionEdges.rows.map(x=>x.source_id)).size,42);
assert.equal(actionEdges.counts.negative_or_separate_actor_edges,11);
assert.equal(actionEdges.counts.positive_core_description_matches,6);
assert.equal(actionEdges.counts.human_approved_mergers,0);
const reviewedHosteds=new Map(hosted.records.map(x=>[x.source_id,x]));
for(const edge of actionEdges.rows){
 const src=reviewedHosteds.get(edge.source_id);
 assert.ok(src,"Identity review references missing hosted source "+edge.source_id);
 assert.equal(edge.source_action,src.source_label);
 assert.equal(edge.source_url,src.hosted_article_url);
 assert.ok(mids.has(edge.claimed_owner_id),"Unknown master owner "+edge.claimed_owner_id);
 assert.equal(edge.actual_owner_relationship_human_approved,false);
 assert.equal(edge.indulgence_grant_confirmed,false);
 assert.equal(edge.publication_allowed,false);
 assert.equal(edge.original_printed_folio_pair_checked,false);
}
assert.equal(actionEdges.rows.find(x=>x.source_id==="CCEX26-NEWLAND-0272-01").claimed_owner_id,"ADVT-001");
assert.equal(actionEdges.rows.find(x=>x.source_id==="CCEX26-NEWLAND-1234-02").action_relationship,"VETO_MINISTERIAL_DISTINCT_ACTOR");
assert.equal(actionEdges.rows.find(x=>x.source_id==="CCEX26-BERGER-0463-07").action_relationship,"VETO_AUTHOR_RECIPE_NOT_SAME_CUSTOM");
assert.equal(actionEdges.rows.find(x=>x.source_id==="CCEX26-TRAPP-0075-01").action_relationship,"VETO_DIFFERENT_DATE_AND_PLANT_OBJECT");

// Identity-cohort release lock: St Joseph regional source descriptions remain one Pitrè author,
// not independent attestations or independently approved calendar customs.
const josephTowns=get("customs-ultra-master-v2-pitre-st-joseph-cross-town-identity-20261030.v1.json");
assert.equal(josephTowns.counts.unique_pitre_observations_screened,43);
assert.equal(josephTowns.counts.regional_action_review_families,7);
assert.equal(josephTowns.review_groups.length,7);
const expectedJosephIds=new Set(josephTowns.review_groups.flatMap(g=>g.source_observation_ids));
assert.equal(expectedJosephIds.size,43);
const pitreWave13=get("customs-ultra-master-v2-wave13-200-source-scope-screen.v1.json");
const pitreById=new Map(pitreWave13.rows.map(r=>[r.source_id,r]));
for(const group of josephTowns.review_groups){
 assert.equal(group.custom_identity_merge_approved,false);
 assert.equal(group.indulgence_grant_confirmed,false);
 assert.equal(group.calendar_publication_allowed,false);
 assert.equal(group.cross_book_source_independence_established,false);
 assert.equal(group.observations.length,group.source_observation_ids.length);
 if(group.provisional_existing_master_owner)assert.ok(mids.has(group.provisional_existing_master_owner));
 for(const o of group.observations){
  const source=pitreById.get(o.original_source_id);
  assert.ok(source,"Unresolvable Pitrè original source "+o.original_source_id);
  assert.equal(o.evidence_id,source.evidence_id);
  assert.equal(o.reported_action,source.action_or_component);
  assert.equal(o.reported_locality,source.source_scope);
  assert.equal(o.original_ocr_line_anchor,source.source_line);
  assert.equal(o.original_record_pointer.json_pointer,source.original_record.json_pointer);
  assert.equal(o.source_record_id_matched,true);
  assert.equal(source.original_source_page_newly_verified_this_pass,false);
 }
}
for(const r of josephTowns.owner_comparisons){
 assert.ok(mids.has(r.owner_id),"Unresolved Joseph owner "+r.owner_id);
 assert.equal(r.approval,false);
}
assert.equal(josephTowns.counts.new_distinct_customs,0);
assert.equal(josephTowns.counts.new_identity_mergers,0);
assert.equal(josephTowns.counts.new_indulgence_grants,0);
assert.equal(josephTowns.counts.calendar_publications,0);
assert.equal(josephTowns.release_freeze,"RESEARCH_ONLY_NO_MERGE_NO_CALENDAR_OR_PUBLICATION_UPDATE");
// Named historical collector under Pitrè is a dependency attribution, not a new published witness.
const cannizzaroLineage=get("customs-ultra-master-v2-pitre-cannizzaro-witness-lineage-20261030.v1.json");
assert.equal(cannizzaroLineage.counts.previously_existing_pitre_source_observations_with_new_lineage_metadata,15);
assert.equal(cannizzaroLineage.reclassified_exact_existing_source_ids.length,15);
assert.equal(new Set(cannizzaroLineage.reclassified_exact_existing_source_ids.map(x=>x.id)).size,15);
assert.equal(josephTowns.source_lineage_followup,"customs-ultra-master-v2-pitre-cannizzaro-witness-lineage-20261030.v1.json");
assert.equal(josephTowns.counts.named_local_collector_attributions_linked,1);
assert.equal(josephTowns.counts.source_observations_with_new_collector_lineage,15);
const santaCroceRows=pitreWave13.rows.filter(x=>x.source_scope==="Santa Croce Camerina, Ragusa, Sicily"&&x.source_id.startsWith("PIT1900-IT-"));
assert.equal(santaCroceRows.length,15);
for(const row of cannizzaroLineage.reclassified_exact_existing_source_ids){
 const original=pitreById.get(row.id);
 assert.ok(original,"Cannizzaro pointer unresolved "+row.id);
 assert.equal(original.source_scope,"Santa Croce Camerina, Ragusa, Sicily");
 assert.equal(row.evidence_id,original.evidence_id);
 assert.equal(row.action,original.action_or_component);
 assert.equal(row.original_ocr_line,original.source_line);
 assert.equal(row.existing_original_source_json_pointer,original.original_record.json_pointer);
 assert.equal(row.source_passage_approval_for_current_practice,false);
 assert.equal(row.ritual_ministerial_authority_approved,false);
 assert.equal(row.indulgence_claim_verified,false);
}
assert.equal(cannizzaroLineage.source_lineage.historical_society_report.pdf_page_index_zero_based,128);
assert.equal(cannizzaroLineage.source_lineage.historical_society_report.inspected_page_image,true);
assert.equal(cannizzaroLineage.source_lineage.published_compilation.individual_original_publication_checked,false);
assert.equal(cannizzaroLineage.counts.original_1900_folio_pages_freshly_verified,0);
assert.equal(cannizzaroLineage.counts.independent_publications_proven_for_original_custom,0);
assert.equal(cannizzaroLineage.counts.new_source_observations_created,0);
assert.equal(cannizzaroLineage.counts.new_identity_merges,0);
assert.equal(cannizzaroLineage.counts.new_current_indulgence_claims,0);
assert.equal(cannizzaroLineage.counts.new_calendar_publications,0);
assert.equal(cannizzaroLineage.publication_allowed,false);
assert.equal(cannizzaroLineage.secondary_scholarship_leads.length,3);
assert.equal(cannizzaroLineage.secondary_scholarship_leads[0].publication_year,1876);
assert.equal(cannizzaroLineage.secondary_scholarship_leads[0].same_custom_independent_attestation_certified,false);
assert.equal(cannizzaroLineage.secondary_scholarship_leads[0].pdf_page_image_checked,false);
assert.equal(cannizzaroLineage.secondary_scholarship_leads[1].original_book_directly_read,false);
assert.equal(cannizzaroLineage.counts.new_verified_independent_historical_action_matches,0);

for(const row of cannizzaroLineage.research_decisions){
 assert.ok(row.source_ids.every(x=>pitreById.has(x)));
 assert.ok(row.source_ids.every(x=>x.startsWith("PIT1900-IT-")));
 if(row.owner_candidate)assert.ok(mids.has(row.owner_candidate));
}
const erroneousEasterPair=dedup.description_pair_edges.find(r=>r.review_id==="CC3WORK-REL-041");
assert.equal(erroneousEasterPair.action_core_relation_as_reviewed,"FALSE_LEXICAL_MATCH_UNRELATED_CAKE_AND_EASTER_FIRE");
assert.equal(erroneousEasterPair.canonical_merge_authorized,false);
assert.equal(dedup.counts.source_action_pair_decisions.FALSE_LEXICAL_MATCH_UNRELATED_CAKE_AND_EASTER_FIRE,1);
assert.equal(Object.values(dedup.counts.source_action_pair_decisions).reduce((a,b)=>a+b,0),41);


// Single working reconciliation: all unlinked evidence has an exact original wave position,
// while suggested owners and 79 caseboard comparisons cannot silently become publications.
const singleWorkingIndex=get("customs-ultra-master-v2-single-working-relationship-index-20261030.v1.json");
assert.equal(singleWorkingIndex.counts.evidence_only_routed,3295);
assert.equal(singleWorkingIndex.evidence_identity_routing.length,3295);
assert.equal(singleWorkingIndex.counts.registry_rows,465);
assert.equal(singleWorkingIndex.owner_registry_snapshot.length,465);
assert.equal(singleWorkingIndex.counts.dedup_case_count,79);
assert.equal(singleWorkingIndex.dedup_case_decisions.length,79);
assert.deepEqual(new Set(singleWorkingIndex.dedup_case_decisions.map(x=>x.id)),
 new Set([...dedup.family_action_groups.map(x=>x.review_id),...dedup.description_pair_edges.map(x=>x.review_id),...dedup.regional_or_institutional_cluster_cases.map(x=>x.review_id)]));
assert.deepEqual(new Set(singleWorkingIndex.owner_registry_snapshot.map(x=>x.id)),mids);
for(const o of singleWorkingIndex.owner_registry_snapshot){
 const original=identities.records.find(x=>x.id===o.id);
 assert.ok(original);
 assert.equal(o.layer,original.layer);
 assert.equal(o.title,original.name.en);
 assert.equal(o.status,original.publication_state);
 assert.equal(o.identity_approved,original.identity_approved_for_publication);
}
const expectedRoutingLabel=r=>r.description||r.action_label||r.action_or_component||r.source_label||r.action||"";
const routeTotals={};let explicitlyReviewed=0,withCaseboard=0;
assert.equal(singleWorkingIndex.evidence_identity_routing.length,allSourceScreens.length);
for(let i=0;i<allSourceScreens.length;i++){
 const original=allSourceScreens[i],work=singleWorkingIndex.evidence_identity_routing[i];
 assert.equal(work.e,original.evidence_id,"Working index evidence pointer shifted "+i);
 assert.equal(work.s,original.source_id);
 assert.equal(work.a,expectedRoutingLabel(original));
 assert.ok(work.w>=1&&work.w<=17);
 const waveStart=work.w<=16?(work.w-1)*200:3200;
 assert.equal(work.n,i-waveStart,"Unstable original wave index "+i);
 assert.ok(typeof work.q==="string"&&work.q.length>0);
 routeTotals[work.q]=(routeTotals[work.q]||0)+1;
 if(work.refs?.length){
  explicitlyReviewed++;
  if(work.refs.some(x=>!String(x.case).startsWith("HOSTED42:")&&!String(x.case).startsWith("PITRE43:")&&!String(x.case).startsWith("PITRE_OWNER:")))withCaseboard++;
  for(const e of work.refs){
   if(e.owners)for(const id of e.owners)assert.ok(mids.has(id),"Unregistered owner review lead "+id);
   assert.ok(e.side!=="APPROVED","Review link illicitly certified");
  }
 }
}
assert.deepEqual(routeTotals,singleWorkingIndex.routing_counts);
assert.equal(Object.values(singleWorkingIndex.routing_counts).reduce((a,b)=>a+b,0),3295);
assert.equal(explicitlyReviewed,222);
assert.equal(withCaseboard,138);
assert.equal(singleWorkingIndex.counts.evidence_with_any_explicit_prior_review,222);
assert.equal(singleWorkingIndex.counts.evidence_without_explicit_prior_review,3073);
assert.equal(singleWorkingIndex.counts.hosted_action_edges_retained,42);
assert.equal(singleWorkingIndex.counts.pitre_regional_source_actions_retained,43);
assert.equal(singleWorkingIndex.counts.machine_generated_lexical_search_hints,50);
assert.equal(singleWorkingIndex.machine_generated_search_hints.suggestions.length,50);
for(const suggestion of singleWorkingIndex.machine_generated_search_hints.suggestions){
 assert.ok(mids.has(suggestion.owner_id));
 assert.ok(singleWorkingIndex.evidence_identity_routing.some(x=>x.s===suggestion.source_id));
 assert.ok(suggestion.lexical_score>=0.75);
 assert.equal(suggestion.relationship,"SEARCH_HINT_ONLY_NOT_OWNER_LINK");
}
const erroneousPairInIndex=singleWorkingIndex.dedup_case_decisions.find(x=>x.id==="CC3WORK-REL-041");
assert.equal(erroneousPairInIndex.status,"EXPLICIT_NO_SAME_IDENTITY");
assert.equal(singleWorkingIndex.guard.published_customs_unchanged,36);
assert.equal(singleWorkingIndex.guard.merges_approved,0);
assert.equal(singleWorkingIndex.guard.distinct_new_customs_approved,0);
assert.equal(singleWorkingIndex.guard.grants_approved,0);
assert.equal(singleWorkingIndex.guard.calendar_publications,0);
assert.equal(singleWorkingIndex.guard.source_independence_newly_certified,0);

console.log("PASS Customs Ultra-Master v2: all 3,703 retained, 408 direct group links, 3295/3295 evidence-only source ID screens, 465 identities, one Caravaca 1998 signed grant facsimile, zero public indulgence or canonical writes");
