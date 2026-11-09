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
