import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const json=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const c=json('data/learn/research/mystery-mass-p2-remaining122-family-review-20261015.v1.json');
const m=json('data/learn/research/mystery-mass-source-led-narrative-drafts-20261014.v1.json');
const p1=json('data/learn/research/mystery-mass-priority1-88-clause-triage-20261015.v1.json');
const reader=json('data/presentation/reader-text-sung.v1.json');
const actions=json('data/presentation/reader-rubric-events.v1.json');
assert.equal(c.publicationApproved,false);
assert.equal(c.appSourceChanged,false);
assert.equal(c.scope.reviewedHere,122);
assert.equal(c.scope.alreadyReviewP2,58);
assert.equal(c.scope.priority2FullyTriaged,180);
assert.equal(p1.counts.reviewedOriginalP1ClauseRows,88);
const owner=new Set(m.liturgicalStudySelections.map(x=>x.owner));
for(const x of ['AO.CARD.003','AO.CARD.009','AO.CARD.010','AO.CARD.030','AO.CANON.14'])assert(owner.has(x));
const oneStudy=id=>m.liturgicalStudySelections.find(x=>x.owner===id).studyOfMassExistingDrafts.map(v=>v.id);
assert(oneStudy('AO.CARD.003').includes('MM-PRIMARY-MB05'));
assert(oneStudy('AO.CARD.009').includes('MM-PRIMARY-MB08'));
assert(oneStudy('AO.CARD.030').includes('MM-PRIMARY-MB26'));
assert(oneStudy('AO.CANON.14').includes('MM-NEW-17'));
const numberedCues=new Set(reader.blocks.flatMap(b=>b.units.map(u=>u.cue_id)).filter(x=>/^AO\\.SM\\.C\\d{4}$/.test(x)));
const families=Object.entries(c.families);
assert.equal(families.length,10);
const units=families.flatMap(([family,v])=>{
 assert(/^\\d{2}$/.test(family)&&v.microUnitIds.length>0);
 return v.microUnitIds;
});
assert.equal(units.length,122);
assert.equal(new Set(units).size,122);
for(const id of units){
 assert(/^AO\\.V3\\.\\d{4}\\.U\\d{3}$/.test(id),id);
 const cue='AO.SM.C'+id.match(/AO\\.V3\\.(\\d{4})/)[1];
 assert(numberedCues.has(cue),cue);
}
assert.equal(c.families['04'].microUnitIds.length,25);
assert.equal(c.scope.creedNeedDoctrinalCrosslink+c.scope.creedReuseIncarnationStudy,25);
assert(c.families['04'].microUnitIds.includes('AO.V3.0099.U002'));
assert.equal(c.crossPhaseMicroSpanHoldIds.length,10);
assert.equal(new Set(c.crossPhaseMicroSpanHoldIds).size,10);
assert(c.crossPhaseMicroSpanHoldIds.every(x=>/^AO\\.V3\\.\\d{4}\\.U\\d{3}$/.test(x)));
assert.equal(c.existingPublishedPriestEventIds.length,6);
for(const eventId of c.existingPublishedPriestEventIds){
 const x=actions.items.find(e=>e.id===eventId);
 assert(x&&x.actor==='PRIEST'&&x.authorityClass==='1962_NORMATIVE'&&x.sources.includes('MR62_RITUS'),eventId);
}
assert.equal(c.additionalPostureOrRoleResearchCues.length,5);
assert(c.additionalPostureOrRoleResearchCues.every(x=>numberedCues.has(x)));
assert.equal(c.scope.editorialOrPublicationApprovals,0);
console.log('Mystery Mass P2: 122 unique historical micro-units grouped in 10 families, all 1962 cue IDs valid, 25 Creed/23 doctrine links, 6 published priest gestures, 10 punctuation boundary holds. Zero publication approval.');
