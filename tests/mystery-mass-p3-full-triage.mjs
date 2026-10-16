// Editorial-only gap triage: source and rubric ownership tests; no app mutation.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const get=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const data=get('data/learn/research/mystery-mass-p3-57-full-gap-triage-20261015.v1.json');
const p1=get('data/learn/research/mystery-mass-priority1-88-clause-triage-20261015.v1.json');
const master=get('data/learn/research/mystery-mass-master-reference-matrix-handoff-20261015.v1.json');
const corpus=get('data/presentation/reader-text-sung.v1.json');
const canon=get('data/presentation/reader-canon-source-map.v1.json');
const rubrics=get('data/presentation/reader-rubric-events.v1.json');
assert.deepEqual(data.originalGapCounts,{P1:88,P2:180,P3:57,total:325});
assert.equal(p1.counts.reviewedOriginalP1ClauseRows,88);
assert.equal(master.counts.sourceOnlyEditorialQueue.priorityTwo,180);
assert.equal(master.counts.sourceOnlyEditorialQueue.priorityThree,57);
assert.equal(data.rows.length,57);
assert.equal(data.rows.filter(r=>r.publicationApproved).length,0);
const sums={};
const cues=new Map(corpus.blocks.flatMap(b=>b.units.map(u=>[u.cue_id,{unit:u,block:b}])));
const allEvents=new Map(rubrics.items.map(r=>[r.id,r]));
const seen=new Set();
for(const r of data.rows){
 assert.match(r.unitId,/^AO\.V3\.\d{4}\.U\d{3}$/);
 assert.equal(r.parentId,r.unitId.replace(/\.U\d{3}$/,''));
 assert.equal(r.sourceCueId,r.parentId.replace('AO.V3.','AO.SM.C'));
 assert(!seen.has(r.unitId),'unique priority 3 micro ID '+r.unitId);
 seen.add(r.unitId);
 const unit=cues.get(r.sourceCueId);
 assert(unit,'Current R17 text cue missing: '+r.sourceCueId);
 const n=Number(r.sourceCueId.slice(-4));
 const withinCanon=canon.segments.find(s=>Number(s.cueStart.slice(-4))<=n&&n<=Number(s.cueEnd.slice(-4)));
 const owner=withinCanon?.id??('AO.CARD.'+String(Number(unit.block.Macro_ID.slice(-2))).padStart(3,'0'));
 assert.equal(r.existingSourceOwner,owner);
 assert.equal(r.publicationApproved,false);
 if(r.existingPublishedPriestEvent){
    const event=allEvents.get(r.existingPublishedPriestEvent);
    assert(event&&event.cueId===r.sourceCueId&&event.actor==='PRIEST');
    assert.equal(event.label,'BOWS HEAD');
    assert.equal(r.disposition,'EXISTING_PRIEST_BOW_AT_WORD');
 }
 sums[r.disposition]=(sums[r.disposition]??0)+1;
}
assert.deepEqual(sums,data.p3ClassCounts);
assert.equal(data.existingPriestEventCount,3);
assert.equal(data.exceptionCount,8);
assert.deepEqual(data.exceptionPolicy.threeExistingBowEvents.sort(),["AO.RUB.C0061.01","AO.RUB.C0067.01","AO.RUB.C0101.01"]);
const optional=data.rows.filter(r=>r.disposition==='OPTIONAL_COMMUNION_RESPONSE');
assert.deepEqual(optional.map(r=>r.sourceCueId).sort(),['AO.SM.C0239','AO.SM.C0241']);
for(const r of optional)assert.match(cues.get(r.sourceCueId).block.Title,/optional Communion Confiteor branch/i);
assert.deepEqual(data.rows.filter(r=>r.disposition==='PUNCTUATION_AND_CLAUSE_SEGMENT_REVIEW').map(r=>r.sourceCueId).sort(),['AO.SM.C0248','AO.SM.C0261']);
assert.deepEqual(data.rows.filter(r=>r.disposition==='PRIEST_ACTION_TIMING_REVIEW').map(r=>r.sourceCueId),['AO.SM.C0196']);
assert.equal(data.status,"INITIAL_GAP_TRIAGE_COMPLETE_325_OF_325_SOURCE_CERTIFICATION_NOT_IMPLIED");
console.log('Mystery P3: 57/57 exact cue-owner alignments, three published priest bows, eight exception holds; complete P1+P2+P3 = 325/325 triaged, zero editorial approvals.');
