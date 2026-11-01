import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = p => JSON.parse(readFileSync(p,'utf8'));
const dir = 'data/prayer/artwork-editorial-20261101/';
const master = read(dir+'curatorial-master-267-20261101.v1.json');
const audit = read(dir+'cross-module-exact-slot-approval-evidence-267-20261101.v1.json');
const baseline = read('data/prayer/artwork-editorial-20261031/provisional-one-choice-per-267-art-position.v1.json');
const original28 = read('data/calendar/prayer-art-reviewed117-user-decisions-20261028.v1.json');
const originalB01 = read('data/prayer/artwork-editorial-20261030/decision-ledger-b01-b05.v1.json');
const originalB06 = read('data/prayer/artwork-editorial-20261030/approved-unified-b06-b11-from-user-message.v1.json');
const map = new Map(audit.rows.map(x=>[x.slot,x]));
test('267 unique approval evidence rows preserve selected work, hold and no-publication gates',()=>{
 assert.equal(audit.rowCount,267);
 assert.equal(audit.rows.length,267);
 assert.equal(map.size,267);
 assert.equal(audit.publicationAllowed,false);
 assert.equal(audit.changedPrimarySelections,0);
 assert.equal(audit.userApprovalsGranted,0);
 assert.equal(master.publicationAllowed,false);
 assert.equal(original28.decisions.length,117);
 assert.equal(originalB01.records.length,250);
 assert.equal(originalB06.decisions.length,107);
 const bmap = new Map(baseline.placements.map(x=>[x.slot,x]));
 for(const m of master.assignments){
  const a = map.get(m.slot);
  assert.ok(a,m.slot);
  assert.equal(a.productionEnabled,false,m.slot);
  assert.equal(a.photoQAComplete,false,m.slot);
  assert.equal(a.primaryMode,m.currentAssignment.mode,m.slot);
  assert.equal(a.family,m.family,m.slot);
  assert.equal(a.label,m.label,m.slot);
  assert.equal(a.kind,m.kind,m.slot);
  assert.equal(a.selectedOriginal?.title??null,m.currentAssignment.painting?.title??null,m.slot);
  assert.equal(a.selectedOriginal?.artist??null,m.currentAssignment.painting?.artist??null,m.slot);
  assert.deepEqual(a.selectedOriginal?.originalArtworkIds??[],m.currentAssignment.originalArtworkIDs??[],m.slot);
  assert.deepEqual(a.sceneScopeReview,m.sceneAndScopeAudit??null,m.slot);
  const b=bmap.get(m.slot);
  assert.ok(b,m.slot);
  if(a.authorityTier==='HELD_PRIMARY'){
    assert.equal(m.currentAssignment.painting,null,m.slot);
    assert.deepEqual(m.heldPreviousAssignment,b.assignment,m.slot);
  }
  assert.ok(!a.directProposalEvidence.some(x=>x.eligibleForThisSlot===false),m.slot);
 }
});
test('evidence classifications are complete, disjoint and not falsified as universal exact-slot approval',()=>{
 const observed={};
 for(const row of audit.rows)observed[row.authorityTier]=(observed[row.authorityTier]||0)+1;
 assert.deepEqual(observed,audit.counts);
 assert.deepEqual(audit.counts,{
  PROVISIONAL:22,
  UNRESOLVED_HISTORIC_PROVENANCE:38,
  APPROVAL_SCOPE_CONFLICT:1,
  ACCEPTED_AT_PROPOSED_SLOT:97,
  NONINDIVIDUAL_CATEGORY_POOL:5,
  INHERITED_REUSE_REQUIRES_SCOPE_TRACE:72,
  HISTORIC_KEEP_ORIGINAL_MODULE:3,
  DETERMINISTIC_RESTORATION:5,
  ACCEPTED_WITH_SCOPE_NOTE:6,
  EXPLICIT_FINAL_COVER_LOCK:4,
  HELD_PRIMARY:14
 });
 assert.equal(Object.values(audit.counts).reduce((n,x)=>n+x,0),267);
 assert.equal(audit.sourceReconciliation20261101.rowsWithExactHistoricB01ToB05ID,107);
 assert.equal(audit.sourceReconciliation20261101.rowsWithExactHistoricB06ToB11ID,23);
 assert.equal(audit.sourceReconciliation20261101.rowsWithB01VerbatimInstructions,26);
 assert.equal(audit.sourceReconciliation20261101.historicallyUnresolvedRowsWithWrittenScopeEvidence,17);
 assert.equal(audit.sourceReconciliation20261101.tiersUnchanged,true);
 for(const r of audit.rows){
   assert.ok(Array.isArray(r.originalExactIDB01ToB05),r.slot);
   assert.ok(Array.isArray(r.originalExactIDB06ToB11),r.slot);
   for(const e of r.originalExactIDB01ToB05)
     assert.ok((r.selectedOriginal?.originalArtworkIds||[]).includes(e.artworkId),r.slot);
   for(const e of r.originalExactIDB06ToB11)
     assert.ok((r.selectedOriginal?.originalArtworkIds||[]).includes(e.artworkId),r.slot);
 }
 assert.equal(audit.counts.INHERITED_REUSE_REQUIRES_SCOPE_TRACE+
   audit.counts.UNRESOLVED_HISTORIC_PROVENANCE,110);
 assert.equal(audit.counts.ACCEPTED_AT_PROPOSED_SLOT+
   audit.counts.ACCEPTED_WITH_SCOPE_NOTE,103);
});
test('protect original final covers, all fourteen held primaries and the additional Epiphany approval-scope issue',()=>{
 for(const slot of ['COV-pray.rosary','COV-prayer.seven_sorrows_chaplet',
                   'COV-novena.st_therese','COV-pray.benediction']){
   assert.equal(map.get(slot).authorityTier,'EXPLICIT_FINAL_COVER_LOCK',slot);
 }
 assert.equal(audit.rows.filter(x=>x.authorityTier==='HELD_PRIMARY').length,14);
 assert.equal(map.get('HERO-03').authorityTier,'APPROVAL_SCOPE_CONFLICT');
 assert.equal(map.get('HERO-03').selectedOriginal.title,'Adoration of the Magi');
 assert.match(map.get('HERO-03').verbatimSelectedPrimaryInstructions[0].note,/visit to the blessed sacrament/i);
 assert.equal(map.get('STG-pray.rosary-16').selectedOriginal,null);
 assert.ok(map.get('STG-pray.rosary-16').approvedAlternativesNotAutomaticRotation.some(
  o=>o.id==='REVIEW::cma:143761'));
 assert.ok(map.get('STG-pray.rosary-16').approvedAlternativesNotAutomaticRotation.some(
  o=>o.id==='REVIEW::met:435853'));
 assert.equal(map.get('STG-pray.precious_blood-07').sceneScopeReview.kind,
              'EXPLICIT_USER_AUTHORIZED_CONTEXTUAL');
 assert.equal(map.get('STG-pray.st_joseph_seven_sorrows-06')
   .sceneScopeReview.exactSceneAcceptedAlternativeId,'CANONICAL::cma-130392');
});
