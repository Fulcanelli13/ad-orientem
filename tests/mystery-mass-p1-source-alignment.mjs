// Editorial-only source alignment gate; does not rewrite the Mass reader or certify an author quotation.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const get=(name)=>JSON.parse(readFileSync(new URL('../'+name,import.meta.url),'utf8'));
const d=get('data/learn/research/mystery-mass-p1-six-lookups-thirtytwo-source-alignments-20261015.v1.json');
const p=get('data/learn/research/mystery-mass-priority1-88-clause-triage-20261015.v1.json');
const live=get('data/presentation/reader-text-sung.v1.json');
const lookup=new Map(live.blocks.flatMap(b=>b.units.map(u=>[u.cue_id,u.latin])));
const norm=x=>String(x).normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
assert.equal(p.counts.reviewedOriginalP1ClauseRows,88);
assert.equal(p.counts.byDisposition.COLLATE_PARENT_EVIDENCE,32);
assert.equal(p.counts.byDisposition.TARGETED_SOURCE_LOOKUP,6);
assert.equal(d.focusedSix.length,5,'six units are five topic groups');
assert.equal(d.parentEvidenceThirtyTwo.length,32);
assert.equal(d.counts.targetedUnits,6);
assert.equal(d.counts.collationPrayerParents,17);
assert.equal(d.counts.sourceCueIdentifiersExist,22);
assert.equal(d.counts.printedBookPagesNewlyInspected,0);
assert.equal(d.counts.newPublicationApprovals,0);
const allUnits=[...d.focusedSix.flatMap(x=>x.ids),...d.parentEvidenceThirtyTwo.map(x=>x.unitId)];
assert.equal(allUnits.length,38);
assert.equal(new Set(allUnits).size,38,'do not duplicate phrase ownership');
const counts={};
for(const c of d.parentEvidenceThirtyTwo){
 assert.equal(c.parentId,c.unitId.replace(/\\.U\\d{3}$/,''));
 assert.equal(c.sourceCueId,'AO.SM.C'+c.parentId.split('.').at(-1));
 assert(lookup.has(c.sourceCueId),'missing reader cue '+c.sourceCueId);
 assert(c.sourceUrl.startsWith('https://'));
 assert.equal(c.editorialApproved,false);
 assert.equal(c.printedFacsimileChecked,false);
 assert(c.sourceLines.length===2);
 counts[c.assessment]=(counts[c.assessment]||0)+1;
}
assert.deepEqual(counts,d.counts.assessmentCounts);
for(const group of d.focusedSix){
 assert(lookup.has(group.cueId),'missing target cue '+group.cueId);
 assert(group.ids.every(id=>/^AO\\.V3\\.\\d{4}\\.U\\d{3}$/.test(id)));
 assert.equal(group.latinCueVerified,true);
 assert(group.primary.startsWith('https://'));
 assert(group.action.length>=12);
}
const specific=new Map(d.focusedSix.map(x=>[x.cueId,x]));
assert.equal(specific.get('AO.SM.C0113').ids.length,2,'one owner for both water/wine clauses');
assert.equal(specific.get('AO.SM.C0123').action,'PRAYER_EXPOSITION_WITH_SEPARATE_RUBRIC_GATE');
assert(specific.get('AO.SM.C0132').scriptureAsAuthorCited.includes('1 Peter 2:9'));
assert(specific.get('AO.SM.C0113').scriptureAsAuthorCited.includes('2 Peter 1:4'));
assert.equal(counts.CLAUSE_BOUNDARY_HOLD,2);
assert.equal(counts.SHARED_CONCLUSION_REUSE,2);
assert.equal(counts.DIRECT_AUTHOR_EXPOSITION,21);
assert.equal(counts.DIRECT_AUTHOR_EXPOSITION_WITH_SYMBOLIC_CAVEAT,1);
assert.equal(counts.PRAYER_LEVEL_CONTEXT_ONLY+counts.PRAYER_QUOTED_NO_DEEP_EXEGESIS,6);
console.log('Mystery P1 precision audit: 6 source lookups/5 topics and 32 inherited-evidence clauses/17 prayers; 22 direct or caveated author expositions, 6 broader/quoted, 2 bad clause boundaries, 2 conclusions; no publication changes.');
