import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = path => JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const rel = read('data/artwork/research/m2m-new-assignment-gate-edges-20261109.v1.json');
const dst = read('data/artwork/research/m2m-destination-release-gates-640-20261109.v1.json');
const prior = read('data/artwork/research-sacred-art-many-to-many-editorial-20261109.v1.json');
const qa = read('data/artwork/research/m2m-qa-evidence-20261109.v1.json');
const cl = read('data/artwork/research/m2m-claude-583-20261109.v1.json');

assert.equal(rel.status,'RESEARCH_ONLY_FAIL_CLOSED_NOT_FOR_RUNTIME_OR_EXPORT');
assert.equal(dst.status,'RESEARCH_ONLY_FAIL_CLOSED_NO_RUNTIME_ASSIGNMENTS');
assert.equal(rel.edges.length,1589);
assert.equal(dst.targets.length,640);
assert.equal(prior.counts.relationship_edges,1589);
assert.equal(rel.edges.filter(x=>x.relationship_type==='OWNER_ACCEPTED_OPTION').length,507);
assert.equal(rel.counts.owner_accepted_option_edges,507);
assert.equal(new Set(rel.edges.map(x=>x.relationship_id)).size,rel.edges.length);
assert.equal(new Set(dst.targets.map(x=>x.target_type+':'+x.target_id)).size,640);
assert.equal(dst.targets.filter(x=>x.target_type==='CALENDAR').length,365);
assert.equal(dst.targets.filter(x=>x.target_type==='PRAYER').length,275);
assert.equal(dst.targets.filter(x=>x.holds.includes('UNMATCHED_DO_NOT_AUTOFILL')).length,170);
assert.equal(dst.targets.filter(x=>x.original_qa_flags.includes('CANONICAL_ARTWORK_ID_MISSING')).length,46);
assert.equal(dst.targets.filter(x=>x.holds.includes('PRADO_SOURCE_HOLD')).length,5);
assert.equal(dst.targets.filter(x=>x.workflow==='PROTECT_EXISTING_NO_ASSIGNMENT').length,27);
assert.equal(dst.targets.filter(x=>x.holds.includes('HISTORICAL_SCOPE_HOLD')).length,2);
assert.equal(dst.targets.filter(x=>x.holds.includes('HISTORICAL_EDITORIAL_HOLD')).length,1);
assert.equal(rel.edges.filter(x=>x.audit_evidence).length,114);
assert.equal(cl.records.filter(x=>x.display_priority==='NEW_PROPOSAL').length,114);
assert.equal(dst.targets.reduce((n,x)=>n+x.individually_reviewed_new_proposals,0),114);
assert.equal(rel.edges.filter(x=>x.rejected_original_ids?.length).length,13);
const blocked=rel.edges.filter(x=>x.rejected_original_ids?.includes('cma-122338'));
const covered=[...new Set(blocked.map(x=>x.target_id))].sort();
assert.equal(blocked.length,13);
assert.deepEqual(covered,[
 'STG-novena.christmas-01','STG-pray.angelus-04','STG-pray.angelus-05',
 'STG-pray.angelus-06','STG-pray.rosary-02'
]);
assert.ok(blocked.some(x=>x.relationship_id==='PRAY267:STG-novena.christmas-01:ACCEPTED:6'));
assert.ok(blocked.some(x=>x.relationship_id==='PRAY267:STG-pray.angelus-04:CURRENT'&&!x.artwork_id),'object URL must block incomplete ID crosswalk');
assert.equal(qa.records.rejected_originals.find(x=>x.id==='cma-122338').score,2);
assert.deepEqual(rel.blocked_exact_original.affected_destination_ids,covered);
assert.ok(dst.targets.filter(x=>x.holds.includes('REFERENCES_EXACT_REJECTED_ORIGINAL')).every(x=>covered.includes(x.target_id)));
assert.equal(rel.counts.new_assignment_authorised,0);
assert.equal(dst.counts.new_assignments_authorised,0);
assert.deepEqual(rel.runtime_new_assignments,[]);
assert.deepEqual(dst.new_assignments,[]);
for(const e of rel.edges) {
 assert.equal(e.new_assignment_authorised,false,'Research edge must never authorize a new art assignment: '+e.relationship_id);
 assert.ok(e.holds.includes('EXACT_PHOTO_REUSE_NOT_CERTIFIED'));
 assert.ok(e.holds.includes('IMAGE_BYTES_AND_MOBILE_CROP_NOT_CERTIFIED'));
 if(e.relationship_type==='OWNER_ACCEPTED_OPTION')assert.ok(e.holds.includes('ACCEPTED_OPTION_NOT_AUTOMATIC_DISPLAY'),'accepted option cannot auto-rotate');
 if(e.rejected_original_ids?.length)assert.ok(e.holds.includes('EXPLICIT_GLOBAL_REJECTION_BLOCK'));
 if(e.target_type==='EDITORIAL_SUBJECT')assert.ok(e.holds.includes('SUBJECT_NOT_DIRECT_DATE_OR_PRAYER_PLACEMENT'));
}
for(const x of dst.targets){
 assert.equal(x.new_assignment_authorised,false);
 assert.equal(x.current_display_to_be_preserved,true);
 assert.ok(x.holds.includes('EXACT_IMAGE_REUSE_AND_CROP_QA_NOT_CERTIFIED'));
}
assert.equal(dst.targets.find(x=>x.target_id==='STG-pray.rosary-02').holds.includes('REFERENCES_EXACT_REJECTED_ORIGINAL'),true);
console.log('PASS: 1,589 edge and 640 destination gates fail closed; 114 relevance reviews; 507 alternatives and 170 unmatched dates preserved; all 13 Bouts edges across five slots blocked.');

const missingIDs = read('data/artwork/research/m2m-protected-missing-id-46-20261109.v1.json');
assert.equal(missingIDs.rows.length,46);
assert.equal(missingIDs.counts.priority_missing_primary_links,46);
assert.equal(missingIDs.counts.has_same_source_url_evidence,11);
assert.equal(missingIDs.counts.has_title_artist_candidate,17);
assert.equal(missingIDs.counts.source_url_evidence_tier,11);
assert.equal(missingIDs.counts.title_artist_only_tier,6);
assert.equal(missingIDs.counts.no_internal_candidate_tier,29);
assert.equal(missingIDs.counts.high_confidence_canonical_link_fully_verified,0);
assert.equal(new Set(missingIDs.rows.map(r=>r.target_type+':'+r.target_id)).size,46);
for(const row of missingIDs.rows){
 assert.equal(row.canonical_artwork_id,null);
 assert.equal(row.canonical_id_verified,false);
 assert.equal(row.exact_physical_object_verified,false);
 assert.equal(row.photographic_rights_verified,false);
 assert.equal(row.current_selection_preserved,true);
 assert.equal(row.assignment_change_authorised,false);
 for(const ref of row.source_candidate_references)assert.ok(['EXACT_SOURCE_URL','TITLE_AND_ARTIST_NORMALIZED_ONLY'].includes(ref.match_basis));
}
console.log('PASS: 46 source-ID reconciliation cases held; 11 shared URL leads, 6 name-only leads, 29 no internal match, zero IDs falsely certified.');

const identity11 = read('data/artwork/research/m2m-exact-url-identity-batch9-20261109.v1.json');
const metadata23 = read('data/artwork/research/m2m-prayer-metadata-23-batch10-20261109.v1.json');
assert.equal(identity11.records.length,11);
assert.equal(identity11.works.length,5);
assert.equal(new Set(identity11.records.map(x=>x.destination_id)).size,11);
assert.equal(identity11.summary.exact_app_canonical_ids_fully_reconciled,0);
assert.equal(identity11.summary.photo_release_authorisations,0);
assert.equal(identity11.summary.existing_selection_replacements,0);
for(const rec of identity11.records){
 assert.equal(rec.source_match,'EXACT_SOURCE_URL_TO_PREVIOUS_EDITORIAL_ENTRY');
 assert.ok(identity11.works.some(w=>w.work_key===rec.work_key&&w.targets.includes(rec.destination_id)));
 assert.equal(rec.app_canonical_work_id,null,'museum accession or editorial pointer must not be assigned as app ID');
 assert.equal(rec.app_canonical_id_verified,false);
 assert.equal(rec.new_assignment_authorised,false);
 assert.equal(rec.owner_selection_preserved,true);
 assert.equal(rec.photographic_release_authorised,false);
}
const groupCounts=Object.fromEntries(identity11.works.map(w=>[w.work_key,identity11.records.filter(x=>x.work_key===w.work_key).length]));
assert.deepEqual(Object.values(groupCounts).sort((a,b)=>a-b),[1,1,2,2,5]);
assert.equal(identity11.works.find(w=>w.work_key==='CEREZO_HUESCA_00029').object_id,'00029');
assert.ok(identity11.works.find(w=>w.work_key==='MAINO_PRADO_PENTECOST').photo_gate.includes('PRADO'));
assert.equal(metadata23.records.length,23);
assert.equal(new Set(metadata23.records.map(x=>x.target_id)).size,23);
assert.equal(metadata23.summary.classification_counts.STATION_NUMBER_AND_SERIES_TITLE_ALIAS,12);
assert.equal(metadata23.summary.classification_counts.PROPOSED_DIFFERENT_PHYSICAL_VISITATION_OBJECT,2);
const differentVisitation=metadata23.records.filter(x=>x.classification==='PROPOSED_DIFFERENT_PHYSICAL_VISITATION_OBJECT');
assert.deepEqual(differentVisitation.map(x=>x.target_id).sort(),['COV-weekday_magnificat','STG-pray.rosary-03']);
assert.ok(differentVisitation.every(x=>x.original_physical_object_identity.includes('Princeton')&&x.claude_proposed_physical_object_identity.includes('Geneva')));
assert.equal(metadata23.records.find(x=>x.target_id==='HERO-10').classification,'SAME_CLEVELAND_OBJECT_CORRECT_ARTIST_TO_FOLLOWER_OF_SODOMA');
assert.ok(metadata23.records.find(x=>x.target_id==='HERO-11').original_physical_object_identity.includes('MBA 235'));
assert.equal(metadata23.records.find(x=>x.target_id==='COV-prayer.hymns').classification,'RUBENS_ASSUMPTION_MULTIPLE_PHYSICAL_WORKS_UNRESOLVED');
assert.equal(metadata23.summary.physical_object_replacements_authorised,0);
for(const r of metadata23.records){
 assert.equal(r.accepted_options_preserved,true);
 assert.equal(r.owner_original_selection_preserved,true);
 assert.equal(r.photo_publication_authorised,false);
 assert.equal(r.new_assignment_authorised,false);
 assert.ok(r.source_evidence_urls.length>0);
}
assert.equal(prior.release_gate_evidence.identity_and_metadata_reconciliation_progress.metadata_disagreement_flags_adjudicated,23);
assert.equal(prior.release_gate_evidence.identity_and_metadata_reconciliation_progress.fully_assigned_verified_app_canonical_ids,0);
console.log('PASS: five underlying works for 11 URL leads; 23 metadata flags adjudicated; no photo, object swap, or canonical ID imported.');

const weak6 = read('data/artwork/research/m2m-title-artist-leads-6-batch11-20261109.v1.json');
assert.equal(weak6.records.length,6);
assert.equal(weak6.works.length,3);
assert.equal(new Set(weak6.records.map(r=>r.target_id)).size,6);
assert.equal(weak6.summary.museum_accessions_supported,2);
assert.equal(weak6.summary.secondary_vatican_work_accession_unconfirmed,1);
assert.equal(weak6.summary.app_canonical_ids_created,0);
assert.equal(weak6.summary.new_assignments_authorised,0);
assert.equal(weak6.summary.remaining_no_internal_candidate_destinations,29);
assert.deepEqual(Object.values(Object.fromEntries(weak6.works.map(w=>[w.work_key,weak6.records.filter(r=>r.work_key===w.work_key).length]))).sort(),[2,2,2]);
assert.ok(weak6.works.find(w=>w.work_key==='VAN_DYCK_INDIANAPOLIS_ENTRY').accession==='58.3');
assert.ok(weak6.works.find(w=>w.work_key==='JOHN_MARTIN_TATE_WRATH').accession==='N05613');
assert.equal(weak6.works.find(w=>w.work_key==='CARRACCI_VATICAN_PURGATORY').accession,null);
for(const r of weak6.records){
 assert.equal(r.canonical_app_artwork_id,null);
 assert.equal(r.canonical_app_id_resolved,false);
 assert.equal(r.current_owner_selection_preserved,true);
 assert.equal(r.new_assignment_authorised,false);
 assert.ok(r.evidence_urls.length);
}
assert.equal(prior.release_gate_evidence.identity_and_metadata_reconciliation_progress.title_artist_only_leads_researched,6);
assert.equal(prior.release_gate_evidence.identity_and_metadata_reconciliation_progress.remaining_no_internal_lead_destinations,29);
console.log('PASS: six title/artist leads grounded to three work groups; app IDs and release remain held.');

const remain29 = read('data/artwork/research/m2m-no-internal-lead-29-batch12-20261109.v1.json');
assert.equal(remain29.rows.length,29);
assert.equal(new Set(remain29.rows.map(r=>r.target_type+':'+r.target_id)).size,29);
assert.equal(remain29.summary.categories.AI_DERIVED_LOCAL_ASSET,4);
assert.equal(remain29.summary.categories.MULTI_IMAGE_SCENE_COMPOSITE,1);
assert.equal(remain29.summary.categories.IN_SITU_STATION_KNOWN_NO_APP_ID,2);
assert.equal(remain29.summary.categories.HISTORICAL_PHOTOGRAPH_ASSET,1);
assert.equal(remain29.summary.categories.PAINTING_WITH_CROSS_BATCH_WORK_LEAD,1);
assert.equal(remain29.summary.categories.PHYSICAL_ARTWORK_CATALOGUE_AND_ASSET_LOOKUP,20);
assert.equal(remain29.summary.app_ids_created,0);
assert.equal(remain29.summary.owner_selection_replacements,0);
assert.ok(remain29.rows.find(r=>r.target_id==='2026-04-04').identity_gate_hold.includes('TWO_WORKS'));
assert.ok(remain29.rows.find(r=>r.target_id==='2026-01-01').work_lead_reference==='TINTORETTO_SAN_ROCCO_CIRCUMCISION');
for(const n of [13,14]){
 const row=remain29.rows.find(r=>r.target_id==='STG-pray.stations-'+n);
 assert.equal(row.classification,'IN_SITU_STATION_KNOWN_NO_APP_ID');
 assert.ok(row.source_evidence_urls.length>0);
}
for(const r of remain29.rows){
 assert.equal(r.canonical_app_id,null);
 assert.equal(r.selected_photo_verified,false);
 assert.equal(r.existing_artwork_selection_preserved,true);
 assert.equal(r.new_assignment_authorised,false);
}
const protectedReviewed=new Set([...identity11.records,...weak6.records,...remain29.rows].map(r=>(r.target_type||r.destination_type)+':'+(r.destination_id||r.target_id)));
assert.equal(protectedReviewed.size,46,'All 46 missing-identity destinations should be distinct across batches 9, 11 and 12');
assert.equal(prior.release_gate_evidence.identity_and_metadata_reconciliation_progress.all_protected_missing_ids_type_triaged,46);
assert.equal(prior.release_gate_evidence.identity_and_metadata_reconciliation_progress.fully_assigned_verified_app_canonical_ids,0);
console.log('PASS: all 46 owner-preserved missing-ID cases source/asset-type triaged, no invented IDs, photo clearances or replacements.');

const recovered29 = read('data/artwork/research/m2m-protected-asset-provenance-batch13-20261109.v1.json');
assert.equal(recovered29.rows.length,29);
assert.equal(new Set(recovered29.rows.map(r=>r.target_type+':'+r.target_id)).size,29);
assert.equal(recovered29.counts.local_existing_provenance_asset,3);
assert.equal(recovered29.counts.local_station_assets,2);
assert.equal(recovered29.counts.local_historic_portrait,1);
assert.equal(recovered29.counts.remote_preview_only,2);
assert.equal(recovered29.counts.selected_ai_generated_final_file_missing,4);
assert.equal(recovered29.counts.two_work_vigil_selection,1);
assert.equal(recovered29.counts.selected_original_asset_not_yet_located,19);
assert.equal(recovered29.counts.new_publications_authorised,0);
assert.equal(recovered29.counts.new_app_ids_authorised,0);
const st13=recovered29.rows.find(r=>r.target_id==='STG-pray.stations-13');
const st14=recovered29.rows.find(r=>r.target_id==='STG-pray.stations-14');
assert.equal(st13.local_asset_path,'assets/stations/san-polo/station-13.webp');
assert.equal(st14.local_asset_path,'assets/stations/san-polo/station-14.webp');
assert.equal(st13.local_repo_blob_sha,'2f7b01404d4b75d71c4c0d085e46c3607ac93038');
assert.equal(st14.local_repo_blob_sha,'c1288aefec1e44f3df6873f3b1de4e8b51a39b8b');
assert.ok(st13.licence_basis.includes('CC BY-SA 4.0'));
assert.ok(st14.licence_basis.includes('CC BY-SA 4.0'));
assert.ok(st13.release_status.includes('MOBILE_QA_AND_SIGNOFF_PENDING'));
assert.ok(st14.release_status.includes('MOBILE_QA_AND_SIGNOFF_PENDING'));
const historic=recovered29.rows.find(r=>r.target_id==='COV-novena.st_therese');
assert.equal(historic.local_asset_path,'assets/prayer/user-approved/st-therese-lisieux-historical-portrait.webp');
assert.equal(historic.documented_sha256,'705cfd23686a8721faaf62ecaa50ccae1be7c227ceccffdde9f1ca09d73e909d');
assert.equal(historic.photo_editorial_approval,'FINAL_PHOTOGRAPH_APPROVED');
for(const date of ['2026-02-22','2026-05-01']){
 const r=recovered29.rows.find(x=>x.target_id===date);
 assert.equal(r.evidence_grade,'EXISTING_REMOTE_PREVIEW_REFERENCE_NOT_OFFLINE_MASTER');
 assert.equal(r.remote_preview.source_file,'src/home/approved-2026-other-date-previews.js');
 assert.equal(r.local_asset_path,null);
}
for(const date of ['2026-03-08','2026-03-22','2026-04-08','2026-05-29']){
 const r=recovered29.rows.find(x=>x.target_id===date);
 assert.equal(r.evidence_grade,'DERIVED_ARTWORK_SELECTED_BUT_FINAL_GENERATED_FILE_NOT_LOCATED');
 assert.equal(r.local_asset_path,null);
}
const vigil=recovered29.rows.find(r=>r.target_id==='2026-04-04');
assert.equal(vigil.required_components.length,2);
assert.deepEqual(vigil.required_components.map(x=>x.source_artist),['James Tissot','John Martin']);
assert.equal(recovered29.production_regression_alert.globally_rejected_original,'cma-122338');
assert.equal(recovered29.production_regression_alert.legacy_release_key,'bouts');
assert.equal(recovered29.production_regression_alert.legacy_release_pr,2340);
assert.equal(recovered29.production_regression_alert.blocked_by_research_manifest,true);
for(const r of recovered29.rows){
 assert.equal(r.app_canonical_id,null);
 assert.equal(r.object_replacement_authorised,false);
 assert.equal(r.photo_publication_authorised,false);
 assert.equal(r.existing_selection_preserved,true);
}
assert.equal(prior.release_gate_evidence.asset_recovery_29.new_assignments_authorised,0);
console.log('PASS: batch13 confirms 3 provenance-backed local assets and 2 remote previews; all 29 selected image gates fail closed, Bouts legacy release flagged.');

const userDrafts14 = read('data/artwork/research/m2m-recovered-user-library-derivatives-batch14-20261109.v1.json');
assert.equal(userDrafts14.recovered_drafts.length,2);
assert.equal(userDrafts14.still_unlocated.length,2);
assert.equal(userDrafts14.updated_counts_across_29.repo_local_with_provenance,3);
assert.equal(userDrafts14.updated_counts_across_29.user_library_original_accepted_ai_visual_draft,2);
assert.equal(userDrafts14.updated_counts_across_29.remote_only_previews,2);
assert.equal(userDrafts14.updated_counts_across_29.remaining_unlocated_approved_ai_generated_files,2);
assert.equal(userDrafts14.updated_counts_across_29.composite_easter_vigil,1);
assert.equal(userDrafts14.updated_counts_across_29.other_unlocated_current_selected_assets,19);
assert.equal(userDrafts14.updated_counts_across_29.total,29);
assert.equal(userDrafts14.import_manifest.length,0);
assert.equal(userDrafts14.new_publications_authorised,0);
const tissot=userDrafts14.recovered_drafts.find(x=>x.date==='2026-04-08');
const wierix=userDrafts14.recovered_drafts.find(x=>x.date==='2026-05-29');
assert.equal(tissot.filename,'AO_Easter_Wednesday_John21_Tissot_AI_Visual_Approved_Draft_2026-10-20.png');
assert.deepEqual([tissot.width,tissot.height,tissot.size_bytes],[1586,992,2484404]);
assert.equal(tissot.sha256,'69eba31523b5fb15c781475e186f02bba193cab15e2d596e17b724cde128e3b2');
assert.equal(wierix.filename,'AO_Pentecost_Ember_Friday_Luke5_Wierix_AI_Visual_Approved_Draft_2026-10-20.png');
assert.deepEqual([wierix.width,wierix.height,wierix.size_bytes],[1402,1122,2289365]);
assert.equal(wierix.sha256,'b116bcac8883b6d4559d1dc54fad7336f4365940d8996cc2eb22c075a20cad5a');
for(const r of userDrafts14.recovered_drafts){
 assert.equal(r.status,'USER_ACCEPTED_AI_DERIVATIVE_VISUAL_DRAFT');
 assert.equal(r.original_master_faithful_recolour,false);
 assert.equal(r.original_file_in_repo,false);
 assert.equal(r.final_publication_ready,false);
 assert.equal(r.new_runtime_assignment_authorised,false);
}
assert.deepEqual(userDrafts14.still_unlocated.map(x=>x.date).sort(),['2026-03-08','2026-03-22']);
assert.ok(!JSON.stringify(userDrafts14).includes('file_00000000'),'Private Library handles must not be committed to a public research branch');
assert.equal(prior.release_gate_evidence.asset_recovery_29.user_library_ai_visual_draft_files_recovered,2);
assert.equal(prior.release_gate_evidence.asset_recovery_29.approved_ai_derived_originals_remaining_unlocated_across_searched_sources,2);
const legacyAudit=recovered29.production_regression_alert.static_source_reachability;
assert.equal(legacyAudit.static_code_path_exists,true);
assert.equal(legacyAudit.deployed_pages_browser_test_performed,false);
assert.equal(legacyAudit.released_photo_id,'released-photo:bouts');
assert.equal(legacyAudit.tracking_issue,'https://github.com/Fulcanelli13/ad-orientem/issues/2761');
console.log('PASS: two approved AI visual drafts recovered from user Library with manifest hashes; no repo uploads, final release, or rejected Bouts reintroduction.');

const ai15 = read('data/artwork/research/m2m-ai-original-files-batch15-20261109.v1.json');
assert.equal(ai15.records.length,2);
assert.equal(ai15.summary.remaining_ai_original_files_unlocated,0);
assert.equal(ai15.summary.user_library_original_generated_files,4);
assert.equal(ai15.summary.passion_originals_with_unreconciled_later_editorial_preference,1);
assert.equal(ai15.summary.repo_local_existing_provenance+ai15.summary.user_library_original_generated_files+
 ai15.summary.remote_home_preview_only+ai15.summary.dual_scene_easter_vigil+
 ai15.summary.other_original_assets_unlocated,29);
const cave=ai15.records.find(x=>x.target_id==='2026-03-08');
const passion=ai15.records.find(x=>x.target_id==='2026-03-22');
assert.equal(cave.saved_filename,'Christ Commands the Shadows.png');
assert.equal(cave.sha256,'a7a7a1972f7e7954576cc7580c8f42bfc68b6628be2b51df36de032031db6016');
assert.deepEqual(cave.pixel_size,[1086,1448]);
assert.equal(cave.file_size_bytes,2287238);
assert.equal(cave.editorial_evidence.prior_approval_status,'EDITORIAL_APPROVED');
assert.equal(cave.historical_source.accession,'1981.142');
assert.equal(passion.saved_filename,'Christ Retreats from the Angry Crowd.png');
assert.equal(passion.sha256,'6f25e25484a78737e87cb4ef007e083b8598938d8ed014163404f6194e768c6b');
assert.deepEqual(passion.pixel_size,[1536,1024]);
assert.equal(passion.file_size_bytes,2517813);
assert.equal(passion.editorial_evidence.approval_conflict,'AI_IMAGE_SELECTED_AS_DATE_PROGRAMME_VS_LATER_UNRESOLVED_PHOTOGRAPH_AND_ORIGINAL_ENGRAVING_PREFERENCE');
for(const r of ai15.records){
 assert.equal(r.raw_image_bytes_committed_to_repo,false);
 assert.equal(r.runtime_new_image_authorised,false);
 assert.equal(r.photo_publication_authorised,false);
 assert.equal(r.owner_other_choices_unchanged,true);
 assert.equal(r.canonical_app_id,null);
 assert.equal(r.generated_work_must_not_be_misattributed_as_historical_original,true);
}
assert.deepEqual(ai15.public_repo_image_uploads,[]);
assert.equal(ai15.new_assignments_authorised,0);
assert.ok(!JSON.stringify(ai15).includes('file_00000000'),'Never commit private user-library identifiers');
console.log('PASS: all 4 Calendar-linked AI generated originals located; approval/release gates remain separate across batches 14–15, two new hashes checked, Passion approval held, zero releases.');

const museum16 = read('data/artwork/research/m2m-original19-institutional-batch16-20261109.v1.json');
assert.equal(museum16.records.length,10);
assert.equal(new Set(museum16.records.map(r=>r.target_type+':'+r.target_id)).size,10);
assert.equal(museum16.counts.destinations_in_this_primary_source_review,10);
assert.equal(museum16.counts.destinations_not_yet_primary_source_reviewed,9);
assert.equal(museum16.counts.new_canonical_app_ids_assigned,0);
assert.equal(museum16.counts.exact_selected_photo_masters_validated,0);
const emmaus=museum16.records.find(x=>x.target_id==='2026-04-06');
assert.equal(emmaus.identity_state,'PHYSICAL_VERSION_SELECTION_CONFLICT_TWO_AUTOGRAPH_WORKS');
assert.deepEqual(emmaus.physical_objects.map(x=>x.museum_id),['NG172','2296']);
const tanner=museum16.records.find(x=>x.target_id==='2026-05-25');
assert.equal(tanner.physical_objects[0].museum_id,'1900.1');
const rembrandt=museum16.records.find(x=>x.target_id==='2026-04-09');
assert.equal(rembrandt.physical_objects[0].museum_id,'RCIN 404816');
const burnand=museum16.records.find(x=>x.target_id==='2026-04-11');
assert.equal(burnand.physical_objects[0].museum_id,'RF 1153');
const figge=museum16.records.find(x=>x.target_id==='2026-05-26');
assert.ok(figge.source_finding.includes('copyist'));
const minardi=museum16.records.find(x=>x.target_id==='2026-04-10');
assert.ok(minardi.source_finding.includes('mural fresco'));
const twoCastillo=museum16.records.filter(x=>x.physical_objects.some(o=>o.museum_id==='DJ0033P'));
assert.equal(twoCastillo.length,2);
assert.deepEqual(twoCastillo.map(x=>x.target_id).sort(),['COV-devotion_st_anthony_lost_items','COV-novena.st_anthony_nine_tuesdays']);
for(const r of museum16.records){
 assert.equal(r.app_canonical_id,null);
 assert.equal(r.exact_selected_photo_identified,false);
 assert.equal(r.selected_photo_rights_certified,false);
 assert.equal(r.new_assignment_authorised,false);
 assert.equal(r.owner_selection_preserved,true);
 assert.equal(r.reviewer_does_not_assert_exact_owner_photo_match,true);
 assert.ok(r.physical_objects.every(x=>x.artwork_url.startsWith('https://')));
}
assert.deepEqual(museum16.production_imports,[]);
assert.equal(prior.release_gate_evidence.asset_recovery_29.institutional_source_object_destinations_reviewed_from_other19,10);
console.log('PASS: ten selected-source destinations assigned institutional artwork leads; exact prior photo identities and releases remain blocked.');

const museum17 = read('data/artwork/research/m2m-original19-institutional-batch17-20261109.v1.json');
assert.equal(museum17.records.length,9);
assert.equal(museum17.counts.source_object_research_rows_total_across_batches16_17,19);
assert.equal(museum17.counts.primary_or_institutional_object_confidence_rows,6);
assert.equal(museum17.counts.secondary_or_unfetched_museum_photo_record_rows,3);
const museumReviewed=[...museum16.records,...museum17.records];
assert.equal(museumReviewed.length,19);
assert.equal(new Set(museumReviewed.map(x=>x.target_type+':'+x.target_id)).size,19);
const batch13Unlocated=new Set(recovered29.rows.filter(x=>x.evidence_grade==='ORIGINAL_SELECTED_IMAGE_FILE_NOT_ESTABLISHED_IN_AUDITED_ASSET_RECORDS').map(x=>x.target_type+':'+x.target_id));
assert.equal(batch13Unlocated.size,19);
assert.deepEqual(new Set(museumReviewed.map(x=>x.target_type+':'+x.target_id)),batch13Unlocated);
const bridges=museum17.records.find(x=>x.target_id==='2026-05-30');
assert.equal(bridges.object_id,'1978.29');
assert.ok(bridges.finding.includes('1833'));
assert.ok(bridges.finding.includes('1839'));
const strozzi=museum17.records.find(x=>x.target_id==='2026-12-13');
assert.equal(strozzi.object_id,'NT 108873');
assert.ok(strozzi.finding.includes('Incredulity'));
const gaulli=museum17.records.find(x=>x.target_id==='2026-12-20');
assert.equal(gaulli.object_id,'INV 20298');
const sacchi=museum17.records.find(x=>x.target_id==='2026-06-24');
assert.equal(sacchi.object_id,'P000003');
assert.equal(sacchi.photo_hold,'NO_PRADO_SOURCE_REPRODUCTION_EVEN_VIA_COMMONS_REUPLOAD');
assert.ok(museum17.records.find(x=>x.target_id==='2026-03-30').physical_identity.includes('SECONDARY'));
assert.ok(museum17.records.find(x=>x.target_id==='2026-04-07').physical_identity.includes('SECONDARY'));
for(const r of museum17.records){
 assert.equal(r.canonical_app_artwork_id,null);
 assert.equal(r.selected_exact_image_file_sha256,null);
 assert.equal(r.selected_photo_reuse_licensed,false);
 assert.equal(r.photograph_mobile_QA_passed,false);
 assert.equal(r.new_assignment_authorised,false);
 assert.equal(r.owner_selection_preserved,true);
 assert.ok(r.sources.length>0);
}
assert.deepEqual(museum17.production_assignments,[]);
assert.equal(prior.release_gate_evidence.asset_recovery_29.institutional_source_object_destinations_reviewed_from_other19,19);
assert.equal(prior.release_gate_evidence.asset_recovery_29.other_original_exact_user_selected_photographs_still_unverified,19);
console.log('PASS: all 19 previously unlinked artwork destinations now have primary/secondary physical-object source research; 19 exact selected photos remain unverified.');

const hashSupplement15 = read('data/artwork/research/m2m-ai-derivative-four-file-hash-audit-batch15-20261109.v1.json');
assert.equal(hashSupplement15.records.length,4);
assert.equal(hashSupplement15.counts.actual_files_located,4);
assert.equal(hashSupplement15.counts.sha256_independently_recomputed,4);
assert.equal(hashSupplement15.counts.prior_manifest_sha_matches,3);
assert.equal(hashSupplement15.counts.exact_file_editorial_approval_pending,1);
assert.equal(hashSupplement15.counts.repository_files_imported,0);
assert.equal(hashSupplement15.counts.release_certified,0);
const expectedHashes={
 '2026-03-08':'a7a7a1972f7e7954576cc7580c8f42bfc68b6628be2b51df36de032031db6016',
 '2026-03-22':'6f25e25484a78737e87cb4ef007e083b8598938d8ed014163404f6194e768c6b',
 '2026-04-08':'69eba31523b5fb15c781475e186f02bba193cab15e2d596e17b724cde128e3b2',
 '2026-05-29':'b116bcac8883b6d4559d1dc54fad7336f4365940d8996cc2eb22c075a20cad5a'
};
assert.deepEqual(new Set(hashSupplement15.records.map(r=>r.date)),new Set(Object.keys(expectedHashes)));
for(const r of hashSupplement15.records){
 assert.equal(r.sha256_calculated,expectedHashes[r.date]);
 assert.equal(r.exact_file_in_public_repo,false);
 assert.equal(r.new_runtime_assignment_authorised,false);
 assert.equal(r.owner_prior_selection_preserved,true);
 assert.equal(r.publication_authorised,false);
 assert.ok(r.bytes_verified>0&&r.pixels_verified.width>0&&r.pixels_verified.height>0);
}
for(const r of ai15.records){
 const match=hashSupplement15.records.find(x=>x.date===r.target_id);
 assert.ok(match,'Earlier two-image batch15 must map to supplemental four-image record');
 assert.equal(match.sha256_calculated,r.sha256);
 assert.equal(match.bytes_verified,r.file_size_bytes);
 assert.deepEqual([match.pixels_verified.width,match.pixels_verified.height],r.pixel_size);
}
assert.equal(hashSupplement15.records.find(x=>x.date==='2026-03-22').prior_sha256,null);
const nineSourceCrossCheck = read('data/artwork/research/m2m-nine-institutional-object-leads-batch16-20261109.v1.json');
assert.equal(nineSourceCrossCheck.records.length,9);
const canonical19=new Set([...museum16.records,...museum17.records].map(x=>x.target_id));
assert.equal(canonical19.size,19);
for(const r of nineSourceCrossCheck.records){
 assert.ok(canonical19.has(r.target_id),'Supplemental research must remain subset of earlier 19/19 physical-work review');
 assert.equal(r.selected_exact_image_file_found,false);
 assert.equal(r.canonical_app_id_resolved,false);
 assert.equal(r.existing_selection_replaced,false);
 assert.equal(r.publication_authorised,false);
}
assert.equal(prior.release_gate_evidence.asset_recovery_29.institutional_object_leads_for_other_nineteen.total_distinct_destination_records_with_object_leads_or_explicit_source_holds,19);
assert.equal(prior.release_gate_evidence.asset_recovery_29.institutional_object_leads_for_other_nineteen.supplemental_corroboration_rows,9);
assert.equal(prior.release_gate_evidence.asset_recovery_29.latest_selected_ai_asset_file_recovery.verified_sha256,4);
console.log('PASS: supplemental four-AI-file SHA256 ledger matches original two-image work and nine candidate object records are a subset of 19/19, with no publication.');

const commons18 = read('data/artwork/research/m2m-exact-commons-source-metadata-batch18-20261109.v1.json');
assert.equal(commons18.records.length,3);
assert.equal(Object.keys(commons18.works).length,2);
assert.equal(commons18.summary.historical_current_destination_edges,3);
assert.equal(commons18.summary.distinct_work_groups,2);
assert.equal(commons18.summary.actual_selected_image_bytes_downloaded,0);
assert.equal(commons18.summary.rights_photo_qa_certified,0);
assert.equal(commons18.summary.public_image_imports,0);
assert.deepEqual(commons18.records.filter(r=>r.work_key==='castillo-cordoba-dj0033p').map(r=>r.destination_id).sort(),['COV-devotion_st_anthony_lost_items','COV-novena.st_anthony_nine_tuesdays']);
const cordoba=commons18.works['castillo-cordoba-dj0033p'];
assert.equal(cordoba.physical_inventory,'DJ0033P');
assert.deepEqual(cordoba.commons_current_dimensions,{width:3400,height:4477});
assert.equal(cordoba.commons_reported_sha1,'7f8376ce631594a53ffc918185a9c47ebcd2ae50');
const cariplo=commons18.works['molteni-cariplo-confessione'];
assert.deepEqual(cariplo.commons_current_dimensions,{width:1295,height:1600});
assert.equal(cariplo.commons_reported_sha1,'45965d76426de27b6a810eadd92c23bcf8e0ac7b');
for(const rec of commons18.records){
 assert.equal(rec.source_url_identical_to_frozen_current_record,true);
 assert.equal(rec.original_current_binary_independently_fetched,false);
 assert.equal(rec.image_binary_sha256,null);
 assert.equal(rec.photograph_mobile_320_390_QA_passed,false);
 assert.equal(rec.canonical_app_work_id,null);
 assert.equal(rec.owner_current_selection_preserved,true);
 assert.equal(rec.existing_accepted_alternatives_preserved,true);
 assert.equal(rec.new_assignment_authorised,false);
}
assert.equal(prior.release_gate_evidence.asset_recovery_29.exact_historical_prayer_commons_links.source_confirmed_current_prayer_edges,3);
console.log('PASS: three frozen Prayer source-page edges verified across two separate exact Commons filenames; neither photo certified or newly imported.');
