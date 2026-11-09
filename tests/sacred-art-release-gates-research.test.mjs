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
