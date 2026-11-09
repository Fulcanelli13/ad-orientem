import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const idx=read('data/artwork/research-sacred-art-many-to-many-editorial-20261109.v1.json');
const items=Object.fromEntries(idx.shards.map(s=>[s.kind,read(s.path).records]));
const prayer=items.PRAYER_HISTORICAL, hist=items.HISTORICAL_CALENDAR_AND_SUBJECT;
const claude=items.CLAUDE_V3_UNCERTIFIED_OVERLAY, targets=items.DESTINATIONS;
const qa=items.QA_AND_REJECTION_EVIDENCE;
assert.equal(targets.length,640);
assert.equal(new Set(targets.map(t=>t.target_type+':'+t.target_id)).size,640);
assert.equal(targets.filter(t=>t.target_type==='CALENDAR').length,365);
assert.equal(targets.filter(t=>t.target_type==='PRAYER').length,275);
assert.equal(prayer.length,852);
assert.equal(hist.length,154);
assert.equal(claude.length,583);
assert.equal(prayer.filter(r=>r.relationship_type==='OWNER_ACCEPTED_OPTION').length,507);
assert.equal(prayer.filter(r=>r.relationship_type==='HISTORICAL_CURRENT_PRIMARY').length,248);
assert.equal(prayer.filter(r=>r.relationship_type==='CONTEXTUAL_REUSE_NOT_NEW_OWNER_APPROVAL').length,84);
assert.equal(prayer.filter(r=>r.relationship_type==='ORIGINAL_USER_KEEP_INHERITED').length,11);
assert.equal(prayer.filter(r=>r.relationship_type==='MISROUTED_SCOPE_EVIDENCE_NOT_PLACEMENT_APPROVAL').length,2);
assert.equal(hist.filter(r=>r.relationship_type==='HISTORICAL_SUBJECT_SELECTED').length,101);
assert.equal(hist.filter(r=>r.relationship_type==='HISTORICAL_DATE_SELECTION_EVIDENCE').length,53);
assert.equal(claude.filter(r=>r.relationship_type==='CLAUDE_V3_DISPLAY_RECOMMENDATION').length,443);
assert.equal(claude.filter(r=>r.relationship_type==='CLAUDE_V3_ALTERNATIVE_RESEARCH_ONLY').length,140);
assert.equal(qa.rejected_originals.length,103);
assert.equal(qa.audit_flags.filter(f=>f.code==='EXPLICIT_REJECTED_ARTWORK_ID').length,4);
assert.equal(qa.audit_flags.filter(f=>f.code==='CLAUDE_NEW_MATCH_NOT_INDEPENDENTLY_VERIFIED').length,114);
assert.equal(qa.audit_flags.filter(f=>f.code==='CANONICAL_ARTWORK_ID_MISSING').length,46);
assert.equal(qa.audit_flags.filter(f=>f.code==='PRADO_REPRODUCTION_SOURCE_HOLD').length,5);
assert.equal(idx.counts.relationship_edges,prayer.length+hist.length+claude.length);
for(const [name,rows] of Object.entries({prayer,hist,claude})){
 for(const r of rows){assert.ok(r.relationship_id&&r.target_type&&r.target_id&&r.relationship_type&&r.source_ref,name+' missing provenance');assert.notEqual(r.photo_release,'NEWLY_CLEARED');}
}
const rosary=prayer.filter(r=>r.target_id==='STG-pray.rosary-02'&&r.relationship_type==='OWNER_ACCEPTED_OPTION');
assert.ok(rosary.length>=10,'accepted Rosary alternatives were lost');
assert.equal(prayer.filter(r=>r.relationship_type==='MISROUTED_SCOPE_EVIDENCE_NOT_PLACEMENT_APPROVAL'&&r.target_type==='PRAYER_SLOT').length,0,'misrouted approvals promoted to Prayer slot');
console.log('PASS: 1,589 source-scoped, nonpublishing links; 640 destinations; 507 owner-accepted options; 103 rejected originals; 114 Claude new proposals held.');


const sceneBatch=read('data/artwork/research/m2m-scene-adjudication-batch1-20261109.v1.json');
assert.equal(sceneBatch.records.length,10);
assert.equal(sceneBatch.summary.different_pericope,5);
assert.equal(sceneBatch.summary.correct_episode_with_caveats,2);
assert.equal(sceneBatch.summary.ambiguous_or_liturgical,3);
assert.equal(sceneBatch.summary.affected_prayer_slots,4);
for(const row of sceneBatch.records){
 assert.equal(row.override_allowed,false,'source QA must not automatically override any owner selection');
 assert.equal(row.photo_release_authorised,false,'art relevance cannot imply image rights');
 assert.ok(row.evidence.length>0&&row.artwork_id&&row.destination_id,'scene adjudication requires traceable evidence');
}
const episodeErrors=sceneBatch.records.filter(row=>row.grade.startsWith('PROVEN_DIFFERENT_EPISODE'));
assert.deepEqual(episodeErrors.map(r=>r.destination_id).sort(),['2026-02-15','2026-02-16','2026-02-17','2026-09-27','2026-10-01']);
assert.equal(sceneBatch.historical_conflicts[0].artwork_id,'cma-122338');
assert.equal(sceneBatch.historical_conflicts[0].affected_destinations.length,4);
console.log('PASS: source-scoped batch1 adjudications; 5 pericope conflicts, 2 qualified matches, 3 holds, 4 preserved historical Bouts conflicts.');


const sceneBatch2=read('data/artwork/research/m2m-scene-adjudication-batch2-20261109.v1.json');
assert.equal(sceneBatch2.records.length,15);
assert.equal(new Set(sceneBatch2.records.map(r=>r.destination_id)).size,15);
assert.equal(sceneBatch2.records.filter(r=>r.adjudication_state==='CORRECT_LITURGICAL_EVENT_NOT_DIRECT_NARRATED_GOSPEL'||r.adjudication_state==='NOT_EXACT_APPOINTED_GOSPEL_SCENE'||r.adjudication_state==='FEAST_AND_EPISTLE_DIRECT_NOT_GOSPEL_SCENE').length,3);
assert.deepEqual(sceneBatch2.records.filter(r=>['CORRECT_LITURGICAL_EVENT_NOT_DIRECT_NARRATED_GOSPEL','NOT_EXACT_APPOINTED_GOSPEL_SCENE','FEAST_AND_EPISTLE_DIRECT_NOT_GOSPEL_SCENE'].includes(r.adjudication_state)).map(r=>r.destination_id).sort(),['2026-01-13','2026-11-22','2026-12-26']);
const originalMultipleDates=['2026-03-26','2026-09-25','2026-11-03','2026-11-06'];
for(const date of originalMultipleDates)assert.ok(sceneBatch2.records.some(r=>r.destination_id===date),'Many-to-many physical re-use must be preserved');
for(const rec of sceneBatch2.records){
 assert.equal(rec.assignment_to_runtime_authorised,false);
 assert.equal(rec.exact_photo_publication_authorised,false);
 assert.equal(rec.actual_pixel_visual_review_completed,false);
 assert.ok(rec.physical_object_identity&&rec.source_urls?.length>0&&rec.calendar_gospel_reference);
}


const sceneBatch3=read('data/artwork/research/m2m-scene-adjudication-batch3-20261109.v1.json');
assert.equal(sceneBatch3.records.length,20);
assert.equal(new Set(sceneBatch3.records.map(r=>r.destination_id)).size,20);
const priorSceneDates=new Set([...sceneBatch.records,...sceneBatch2.records].map(r=>r.destination_id));
for(const item of sceneBatch3.records){
 assert.ok(!priorSceneDates.has(item.destination_id),'Overlapping batch3 record: '+item.destination_id);
 assert.equal(item.owner_selection_changed,false);
 assert.equal(item.prior_approved_alternatives_preserved,true);
 assert.equal(item.automatically_renderable,false);
 assert.equal(item.photo_license_pixel_crop_verified,false);
 assert.equal(item.visual_pixels_independently_inspected,false);
 assert.ok(item.physical_work_identity&&item.evidence_urls.length>0&&item.appointed_1962_gospel);
}
assert.equal(sceneBatch3.summary.distinct_proposed_artwork_ids,17);
assert.equal(sceneBatch3.records.filter(r=>r.artwork_id==='RECENT575::424').length,2);
assert.equal(sceneBatch3.records.filter(r=>r.artwork_id==='RECENT575::039').length,3);
const mnr=sceneBatch3.records.find(r=>r.destination_id==='2026-03-14');
assert.ok(mnr.photo_publication_gate.includes('MNR_RESTITUTION'));
const uncertain=sceneBatch3.records.find(r=>r.destination_id==='2026-01-19');
assert.ok(uncertain.adjudication_status.includes('UNRESOLVED'));
console.log('PASS: batch3 20 source checks; 45/114 total; 7 unaudited direct-scene; all release gates closed.');


const sceneBatch4=read('data/artwork/research/m2m-scene-adjudication-batch4-20261109.v1.json');
assert.equal(sceneBatch4.records.length,7);
const alreadySeen=new Set([...sceneBatch.records,...sceneBatch2.records,...sceneBatch3.records].map(x=>x.destination_id));
for(const x of sceneBatch4.records){
 assert.ok(!alreadySeen.has(x.destination_id),'Batch4 overlaps previous batches');
 assert.equal(x.owner_approvals_untouched,true);
 assert.equal(x.display_change_authorised,false);
 assert.equal(x.photograph_publication_authorised,false);
 assert.equal(x.pixel_visual_qa_complete,false);
 assert.ok(x.source_urls.length>0&&x.appointed_gospel&&x.object_identity);
}
assert.equal(sceneBatch4.records.find(x=>x.destination_id==='2026-04-18').adjudication_status,'EXACT_SUBJECT_BUT_ATTRIBUTION_UNRESOLVED');
assert.equal(sceneBatch4.records.find(x=>x.destination_id==='2026-12-30').adjudication_status,'KNOWN_COLLECTION_OBJECT_NO_INDEPENDENT_CURRENT_MUSEUM_CONFIRMATION');
assert.equal(idx.review_evidence.remaining_new_Claude_direct_scene_proposals_needing_individual_source_adjudication,0);
console.log('PASS: all 52 source-adjudicated new direct-scene associations recorded, 62 other association types remain; no publication rights implied.');


const thematicBatch5=read('data/artwork/research/m2m-liturgical-thematic-batch5-20261109.v1.json');
assert.equal(thematicBatch5.records.length,14);
assert.equal(thematicBatch5.summary.artwork_ids,10);
const priorDates5=new Set([...sceneBatch.records,...sceneBatch2.records,...sceneBatch3.records,...sceneBatch4.records].map(x=>x.destination_id));
assert.equal(new Set(thematicBatch5.records.map(x=>x.destination_id)).size,14);
for(const x of thematicBatch5.records) {
 assert.ok(!priorDates5.has(x.destination_id),'Audited date twice');
 assert.equal(x.owner_selection_changed,false);
 assert.equal(x.owner_many_to_many_choices_preserved,true);
 assert.equal(x.exact_photo_release_verified,false);
 assert.equal(x.independent_pixels_checked,false);
 assert.equal(x.runtime_selection_authorised,false);
 assert.ok(x.evidence_urls.length>0&&x.relationship_after_review&&x.object_identity);
}
const papal5=thematicBatch5.records.filter(x=>x.artwork_id==='PRAYER20261105::PP-5');
assert.equal(papal5.length,5);
assert.equal(papal5.filter(x=>x.relationship_after_review==='EXACT_APPOINTED_GOSPEL_SCENE_NOT_FEAST_SAINT_PORTRAIT').length,1);
assert.ok(papal5.find(x=>x.destination_id==='2026-12-11').verified_or_disputed_gospel.includes('CONFLICT'));
const photographerErrors=thematicBatch5.records.filter(x=>/Didier Descouens|Edelseider/.test(x.claude_original_artist_credit));
assert.equal(photographerErrors.length,3);
const jonah=thematicBatch5.records.find(x=>x.destination_id==='2026-02-25');
assert.ok(jonah.photo_release_gate.includes('OBJECT_IDENTITY'));
assert.ok(thematicBatch5.records.some(x=>x.destination_id==='2026-11-09'&&x.relationship_after_review.includes('DIFFERENT_BUILDING')));
console.log('PASS: batch5 14 thematic/saint links; 66/114 adjudicated; original many-to-many approvals and all photo gates retained.');

const liturgicalBatch6=read('data/artwork/research/m2m-liturgical-batch6-20261109.v1.json');
assert.equal(liturgicalBatch6.records.length,12);
assert.equal(liturgicalBatch6.summary.cumulative_new_proposals_reviewed,78);
assert.equal(liturgicalBatch6.summary.remaining_new_proposals,36);
const liturgicalBatch7=read('data/artwork/research/m2m-liturgical-batch7-20261109.v1.json');
assert.equal(liturgicalBatch7.records.length,15);
assert.equal(liturgicalBatch7.summary.cumulative_new_proposals_reviewed,93);
assert.equal(liturgicalBatch7.summary.remaining_new_proposals,21);
const thematicScripturalBatch8=read('data/artwork/research/m2m-thematic-scriptural-batch8-20261109.v1.json');
assert.equal(thematicScripturalBatch8.records.length,21);
assert.equal(thematicScripturalBatch8.summary.unique_proposed_artwork_ids,9);
assert.equal(thematicScripturalBatch8.summary.cumulative_new_proposals_reviewed,114);
assert.equal(thematicScripturalBatch8.summary.remaining_new_proposals,0);
const batches=[sceneBatch.records,sceneBatch2.records,sceneBatch3.records,sceneBatch4.records,thematicBatch5.records,liturgicalBatch6.records,liturgicalBatch7.records,thematicScripturalBatch8.records];
const audited=batches.flat();
assert.equal(audited.length,114,'A cumulative count should come from reviewed records, not a stale intermediate index');
assert.equal(new Set(audited.map(r=>r.destination_id+'|'+r.artwork_id)).size,audited.length,'No proposed relationship can be counted twice');
const newProposals=claude.filter(r=>r.display_priority==='NEW_PROPOSAL');
assert.equal(newProposals.length,114);
for (const r of audited) assert.ok(newProposals.some(c=>c.target_id===r.destination_id&&c.artwork_id===r.artwork_id),'Adjudication is not connected to an actual Claude proposal '+r.destination_id);
for (const r of liturgicalBatch6.records) {
 assert.equal(r.owner_selection_changed,false);
 assert.equal(r.owner_many_to_many_choices_preserved,true);
 assert.equal(r.exact_photo_release_verified,false);
 assert.equal(r.independent_pixels_checked,false);
 assert.equal(r.runtime_selection_authorised,false);
 assert.ok(r.evidence_urls.length&&r.physical_work_identity&&r.relationship_after_review);
}
assert.ok(liturgicalBatch6.records.find(r=>r.destination_id==='2026-01-21').relationship_after_review.includes('PORTRAIT_HISTORIE'));
assert.ok(liturgicalBatch6.records.find(r=>r.destination_id==='2026-01-30').physical_work_identity.includes('INV 107'));
assert.ok(liturgicalBatch6.records.find(r=>r.destination_id==='2026-06-13').physical_work_identity.includes('862397'));
assert.ok(liturgicalBatch6.records.find(r=>r.destination_id==='2026-11-23').photo_publication_gate.includes('453A_453B'));
assert.equal(idx.review_evidence.cumulative_new_Claude_proposals_source_adjudicated,audited.length);
assert.equal(idx.review_evidence.remaining_new_Claude_proposals_needing_individual_source_adjudication,newProposals.length-audited.length);
assert.equal(idx.counts.relationship_edges,1589);
console.log('PASS: batch6 12 liturgical records; 78/114 cumulative, 36 unresolved; owner approvals and publication holds preserved.');

for(const r of liturgicalBatch7.records){
 assert.equal(r.claude_scope,'LITURGICAL');
 assert.equal(r.owner_selection_changed,false);
 assert.equal(r.owner_many_to_many_choices_preserved,true);
 assert.equal(r.exact_photo_release_verified,false);
 assert.equal(r.independent_pixels_checked,false);
 assert.equal(r.runtime_selection_authorised,false);
 assert.ok(r.source_urls.length&&r.physical_work_identity&&r.relationship_after_review);
}
assert.ok(liturgicalBatch7.records.find(r=>r.destination_id==='2026-09-14').relationship_after_review.includes('COPY_AFTER_EDELINCK_AFTER_LE_BRUN'));
assert.ok(liturgicalBatch7.records.find(r=>r.destination_id==='2026-11-11').relationship_after_review.includes('REPLICA'));
assert.ok(liturgicalBatch7.records.find(r=>r.destination_id==='2026-08-04').photo_publication_gate.includes('PRADO'));
assert.ok(liturgicalBatch7.records.find(r=>r.destination_id==='2026-11-19').photo_publication_gate.includes('ATTRIBUTION'));
assert.equal(liturgicalBatch7.summary.remaining_qualifying_categories.LITURGICAL,0);
assert.equal(liturgicalBatch7.summary.remaining_qualifying_categories.THEMATIC,15);
assert.equal(liturgicalBatch7.summary.remaining_qualifying_categories.SCRIPTURAL,6);
assert.equal(idx.counts.historical_accepted_option_rows,507);
console.log('PASS: all 27 outstanding liturgical assessments completed across batches6/7; 93/114 source-reviewed with 21 thematic/scriptural still held.');

assert.equal(thematicScripturalBatch8.records.filter(r=>r.claude_scope==='THEMATIC').length,15);
assert.equal(thematicScripturalBatch8.records.filter(r=>r.claude_scope==='SCRIPTURAL').length,6);
assert.equal(new Set(thematicScripturalBatch8.records.map(r=>r.artwork_id)).size,9);
for(const r of thematicScripturalBatch8.records){
 assert.equal(r.owner_selection_changed,false);
 assert.equal(r.owner_many_to_many_choices_preserved,true);
 assert.equal(r.exact_photo_release_verified,false);
 assert.equal(r.independent_pixels_checked,false);
 assert.equal(r.runtime_selection_authorised,false);
 assert.ok(r.source_urls.length&&r.physical_work_identity&&r.relationship_after_review);
}
const brueghelBatch8=thematicScripturalBatch8.records.filter(r=>r.artwork_id==='RECENT575::273');
assert.equal(brueghelBatch8.length,5);
assert.ok(brueghelBatch8.every(r=>r.physical_work_identity.includes('0000.GRO1561.I')),'five relationships to same Bruges workshop copy must not invent new paintings');
assert.ok(brueghelBatch8.filter(r=>r.destination_id==='2026-12-09'||r.destination_id==='2026-12-12').every(r=>r.relationship_after_review.includes('NOT_MATTHEW11')));
assert.ok(brueghelBatch8.find(r=>r.destination_id==='2026-12-15').relationship_after_review.includes('NOT_JOHN1'));
assert.ok(thematicScripturalBatch8.records.find(r=>r.destination_id==='2026-03-03').findings.includes('Matt. 5.20'));
assert.ok(thematicScripturalBatch8.records.find(r=>r.destination_id==='2026-03-28').relationship_after_review.includes('EXACT_GOSPEL_SUBSCENE'));
assert.ok(thematicScripturalBatch8.records.find(r=>r.destination_id==='2026-07-04').photo_publication_gate.includes('ATTRIBUTION_CONFLICT'));
assert.equal(idx.review_evidence.remaining_new_Claude_proposals_needing_individual_source_adjudication,0);
assert.equal(idx.review_evidence.remaining_new_Claude_liturgical_proposals_needing_individual_source_adjudication,0);
assert.equal(idx.review_evidence.remaining_new_Claude_thematic_proposals_needing_individual_source_adjudication,0);
assert.equal(idx.review_evidence.remaining_new_Claude_scriptural_proposals_needing_individual_source_adjudication,0);
console.log('PASS: 114/114 Claude NEW_PROPOSAL editorial edges source-reviewed; no artwork publication or owner overrides.');
