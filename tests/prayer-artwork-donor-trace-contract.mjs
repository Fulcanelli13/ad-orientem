import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const root='data/prayer/artwork-editorial-20261101/';
const donor=read(root+'donor-original-identity-triage-71-20261101.v1.json');
const master=read(root+'curatorial-master-267-20261101.v1.json');
const audit=read(root+'cross-module-exact-slot-approval-evidence-267-20261101.v1.json');
const slots=new Map(master.assignments.map(x=>[x.slot,x]));

test('all inherited art donor traces are unique, source-led and no-approval',()=>{
 assert.equal(donor.count,71);
 assert.equal(donor.positions.length,71);
 assert.equal(new Set(donor.positions.map(x=>x.slot)).size,71);
 assert.deepEqual(donor.classCounts,{
  CURRENT_DONOR_EXACT_ARTWORK_ID:20,
  CURRENT_DONOR_DIFFERENT_SELECTED_ORIGINAL:23,
  CURRENT_DONOR_TITLE_ARTIST_ONLY:2,
  NON_SLOT_HISTORICAL_AUTHORITY_LABEL:17,
  LEGACY_MODULE_NOT_CURRENT_SLOT:8,
  CURRENT_DONOR_SOURCE_URL_MATCH:1
 });
 assert.equal(Object.values(donor.classCounts).reduce((a,b)=>a+b,0),71);
 const c=donor.mismatchedDonorConsolidation20261101;
 assert.equal(c.numberOfPlacements,23);
 assert.equal(c.distinctOriginalIdentityGroups,12);
 assert.equal(c.placementsWithIndependentHistoricAcceptedArtworkRecord,22);
 assert.equal(c.groupsWithIndependentHistoricAcceptedArtworkRecord,11);
 assert.equal(c.groups.length,12);
 assert.equal(c.groups.reduce((n,x)=>n+x.affectedSlotIds.length,0),23);
 assert.equal(c.groupsRequiringIdentityRecovery.length,1);
 assert.equal(c.groupsRequiringIdentityRecovery[0],'The Crucifixion');
 assert.ok(c.groups.every(x=>x.exactTargetSlotApprovalNotEstablished===true));
 assert.equal(audit.counts.INHERITED_REUSE_REQUIRES_SCOPE_TRACE,71);
 assert.equal(audit.counts.EXPLICIT_FINAL_COVER_LOCK,5);
 assert.equal(donor.newApprovals,0);
 assert.equal(donor.publishedPhotos,0);
 assert.equal(donor.noChangesToSelections,true);
 for(const row of donor.positions){
  const entry=slots.get(row.slot);
  assert.ok(entry,row.slot);
  assert.deepEqual(row.selectedOriginal?.title??null,entry.currentAssignment.painting?.title??null,row.slot);
  assert.equal(row.productionEnabled,false,row.slot);
  assert.equal(row.approvedForExactTargetSlotByThisTrace,false,row.slot);
  assert.ok(row.traces.length>0,row.slot);
  for(const trace of row.traces) {
   if(trace.traceState==='CURRENT_DONOR_EXACT_ARTWORK_ID'){
    assert.ok(trace.donorSnapshot.currentOriginalIDs.includes(trace.sourceArtworkId),row.slot);
   }
   if(trace.traceState==='CURRENT_DONOR_DIFFERENT_SELECTED_ORIGINAL'){
    assert.equal(trace.donorSnapshot.existsInCurrentMaster,true,row.slot);
    assert.ok(!trace.donorSnapshot.currentOriginalIDs.includes(trace.sourceArtworkId),row.slot);
   }
  }
 }
});

test('protect the Therese user-supplied photo as explicit lock; no donor proof is allowed to undo this',()=>{
 const q=audit.rows.find(x=>x.slot==='COV-novena.st_therese');
 assert.equal(q.authorityTier,'EXPLICIT_FINAL_COVER_LOCK');
 assert.equal(q.selectedOriginal.title,'Therese_lisieux_portrait.jpg');
 assert.equal(q.finalLockEvidence.doNotSubstitute,true);
 assert.ok(!donor.positions.some(x=>x.slot===q.slot));
 assert.ok(master.finalProtectedCovers.some(([slot,title])=>slot===q.slot&&title===q.selectedOriginal.title));
});

test('misleading current donor references for the 23 selected different originals are retained only as research evidence',()=>{
 const diff=donor.positions.filter(x=>x.traceClass==='CURRENT_DONOR_DIFFERENT_SELECTED_ORIGINAL');
 assert.equal(diff.length,23);
 assert.ok(diff.some(x=>x.slot==='COV-pray.angelus'));
 assert.ok(diff.some(x=>x.slot==='COV-pray.stations'));
 assert.ok(diff.some(x=>x.slot==='COV-devotion_memorare_st_joseph'));
 assert.ok(diff.every(x=>x.traces.some(t=>t.traceState==='CURRENT_DONOR_DIFFERENT_SELECTED_ORIGINAL')));
 assert.ok(diff.every(x=>x.editorialDisposition==='PRESERVE_SELECTED_ORIGINAL_RESEARCH_ONLY'));
});

test('all fourteen Giandomenico Tiepolo Stations remain numbered research-only, not missing slots',()=>{
 const special=donor.positions.filter(x=>x.slot.startsWith('STG-pray.stations-'));
 assert.equal(special.length,14);
 for(let i=1;i<=14;i++){
   const slot='STG-pray.stations-'+String(i).padStart(2,'0');
   const row=special.find(x=>x.slot===slot);
   assert.ok(row,slot);
   assert.equal(row.traceClass,'NON_SLOT_HISTORICAL_AUTHORITY_LABEL');
   assert.ok(row.selectedOriginal.title.includes('Via Crucis '+i+','));
   assert.equal(row.productionEnabled,false);
 }
});
