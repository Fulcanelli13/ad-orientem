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
assert.equal(idx.review_evidence.remaining_new_Claude_proposals_needing_individual_source_adjudication,89);


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
assert.equal(idx.review_evidence.cumulative_new_Claude_proposals_source_adjudicated,45);
assert.equal(idx.review_evidence.remaining_new_Claude_proposals_needing_individual_source_adjudication,69);
console.log('PASS: batch3 20 source checks; 45/114 total; 7 unaudited direct-scene; all release gates closed.');
