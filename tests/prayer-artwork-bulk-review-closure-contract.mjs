import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const dir='data/prayer/artwork-editorial-20261101/';
const master=read(dir+'curatorial-master-267-20261101.v1.json');
const donor=read(dir+'donor-original-identity-triage-71-20261101.v1.json');
const held=read(dir+'held-primary-exact-scope-review-14-20261101.v1.json');
const queue=read(dir+'one-time-final-editorial-review-queue-37-20261101.v1.json');
const bySlot=new Map(master.assignments.map(x=>[x.slot,x]));

test('fourteen disputed primaries remain held; accepted exact alternatives are scoped not selected',()=>{
 assert.equal(held.rows.length,14);
 assert.equal(held.counts.needsNewPrimaryChoice,14);
 assert.equal(held.counts.unambiguousPreviousSelectionRestorable,0);
 assert.equal(held.counts.exactlyScopedPreapprovedAlternativePairs,2);
 assert.equal(held.counts.unrestrictedAcceptedAlternativePairs,3);
 assert.equal(held.counts.ambiguousOrContradictoryAlternativePairs,4);
 assert.equal(held.primariesChanged,0);
 assert.equal(held.releasesAuthorized,0);
 for(const x of held.rows){
  assert.equal(x.needsManualPrimaryChoice,true,x.slot);
  assert.equal(x.primaryRestored,false,x.slot);
  assert.equal(x.productionEnabled,false,x.slot);
  assert.equal(x.photoCertificationComplete,false,x.slot);
  assert.equal(bySlot.get(x.slot).currentAssignment.mode,'HOLD_NO_ELIGIBLE_PRIMARY',x.slot);
  assert.deepEqual(x.heldHistoricalPrimary,bySlot.get(x.slot).heldPreviousAssignment?.painting||null,x.slot);
  for(const v of x.viablePreviouslyAcceptedAlternatives){
    assert.equal(v.notAnAutomaticPrimary,true,x.slot);
    assert.ok(['EXPLICIT_APPROVAL_EXACT_CORONATION_MYSTERY',
      'ACCEPTED_FOR_THIS_DISPLAYED_SLOT_NO_NARROWING_NOTE'].includes(v.eligibility),x.slot);
  }
 }
});
test('scope-specific Coronation alternatives remain in their exact Rosary mystery, not Montfort or Loreto',()=>{
 const cor=held.rows.find(x=>x.slot==='STG-pray.rosary-16');
 assert.equal(cor.viablePreviouslyAcceptedAlternatives.length,2);
 assert.ok(cor.viablePreviouslyAcceptedAlternatives.every(x=>x.scope.includes('rosary_coronation_of_virgin')));
 for(const slot of ['COV-pray.montfort_consecration','STG-litany_loreto_1962-05',
                    'STG-pray.litany_saints-01']){
  const row=held.rows.find(x=>x.slot===slot);
  assert.ok(row,slot);
  assert.ok(!row.viablePreviouslyAcceptedAlternatives.some(x=>x.scope.includes('rosary_coronation_of_virgin')),slot);
 }
 assert.equal(held.rows.find(x=>x.slot==='STG-pray.litany_saints-01')
   .viablePreviouslyAcceptedAlternatives.length,2);
 assert.equal(held.rows.find(x=>x.slot==='COV-prayer.good_death')
   .viablePreviouslyAcceptedAlternatives.length,1);
});
test('a single future editorial review contains 22 provisional, 1 scoped Epiphany and 14 held positions',()=>{
 assert.equal(queue.count,37);
 assert.equal(queue.rows.length,37);
 assert.equal(new Set(queue.rows.map(x=>x.slot)).size,37);
 assert.deepEqual(queue.byType,{PROVISIONAL:22,APPROVAL_SCOPE_CONFLICT:1,HELD_PRIMARY:14});
 assert.equal(queue.notReadyForUserReview,true);
 assert.equal(queue.productionEnabled,false);
 assert.equal(queue.paintingsChanged,0);
 assert.equal(master.publicationAllowed,false);
 for(const r of queue.rows){
  assert.equal(r.photoReadyForEditorialDisplay,false,r.slot);
  assert.equal(r.photoApprovedForPublication,false,r.slot);
  assert.equal(r.needsOneFutureCollectiveReview,true,r.slot);
  assert.equal(r.noIndividualApprovalRequestNow,true,r.slot);
  assert.equal(r.sourceEvidencePaths.length,3,r.slot);
  const current=bySlot.get(r.slot);
  assert.deepEqual(r.primaryOrProvisionalWork?.title??null,
    current.currentAssignment.painting?.title??null,r.slot);
  if(r.reason==='HELD_PRIMARY')assert.equal(current.currentAssignment.mode,'HOLD_NO_ELIGIBLE_PRIMARY',r.slot);
 }
 assert.equal(queue.rows.filter(x=>x.slot==='HERO-03').length,1);
 assert.equal(donor.positions.length,71);
});
