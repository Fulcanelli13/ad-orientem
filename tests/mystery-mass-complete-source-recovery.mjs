import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => JSON.parse(readFileSync(resolve(root, p), 'utf8'));
const archive=read('data/research/archive/mass-compendium-20260921-evidence-ledger.snapshot.v1.json');
const inventory=read('data/learn/research/mystery-mass-canonical-39-owner-inventory-20261014.v1.json');
const sources=read('data/learn/research/mystery-mass-complete-source-recovery-20261014.v1.json');
const bridge=read('data/learn/research/mystery-mass-september422-to-canonical39-bridge-20261014.v1.json');

const ownerSet=new Set(inventory.sections.map(x=>x.sectionId));
assert.equal(ownerSet.size,39);
assert.equal(archive.rows.length,422);
assert.equal(sources.sources.length,28);
assert.equal(bridge.events.length,71);
assert.equal(bridge.evidenceLinks.length,422);
assert.equal(bridge.counts.deterministicallyAssignedEvidenceRows,402);
assert.equal(bridge.counts.needsExactCueOrExternalRouteEvidenceRows,20);
assert.equal(bridge.counts.uniqueUnresolvedSourceEvents,5);
const ids=new Set(archive.rows.map(x=>x.values[0]));
assert.equal(ids.size,422);
assert.equal(new Set(bridge.evidenceLinks.map(x=>x.evidenceId)).size,422);
const oldRows=new Map(archive.rows.map(x=>[x.values[0],x]));
const eventRows=new Map(bridge.events.map(x=>[x.eventId,x]));
const errorEvents=new Set(['E01','E02','E46','E55','E71']);
assert.deepEqual(new Set(bridge.events.filter(x=>!x.primaryOwner).map(x=>x.eventId)),errorEvents);
let assigned=0, held=0;
for(const entry of bridge.evidenceLinks){
  const old=oldRows.get(entry.evidenceId);
  assert.ok(old,entry.evidenceId);
  assert.equal(entry.sourceEventId,old.values[1]);
  assert.equal(entry.historicalSourceCode,old.values[4]);
  assert.equal(entry.researchAuthor,old.values[5]);
  const event=eventRows.get(entry.sourceEventId);
  assert.ok(event);
  assert.equal(entry.canonicalMassOwner,event.primaryOwner);
  if(entry.canonicalMassOwner){assert.ok(ownerSet.has(entry.canonicalMassOwner));assigned++;}
  else {assert.ok(errorEvents.has(entry.sourceEventId));held++;}
}
assert.equal(assigned,402);assert.equal(held,20);
const byCode=new Map();
for(const row of archive.rows)byCode.set(row.values[4],(byCode.get(row.values[4])||0)+1);
assert.equal([...byCode.values()].reduce((a,b)=>a+b,0),422);
for(const [k,n] of byCode)assert.equal(sources.preservedCollections.septemberEvidence.perSourceCounts[k],n);
assert.deepEqual(new Set(sources.sources.map(x=>x.id)).size,28);
for(const source of sources.sources)assert.equal(source.archivedEvidenceRows,byCode.get(source.id)||0);
for(const exact of ['SVF','SFS','A','DJ','G','L1897','LEB','GIHR','LANG','TORMA'])
 assert.ok(sources.sources.some(x=>x.id===exact),exact);
assert.equal(sources.productSeparation.mass,'rubrics_and_following_only');
assert.equal(sources.productSeparation.studyMass,'complete_historical_theological_biblical_and_ceremonial_reference');
assert.equal(sources.productSeparation.mysteryMass.biblicalChronology,'meditative_salvation_history');
assert.equal(sources.productSeparation.mysteryMass.liturgicalChronology,'descriptive_studyMass_driven');
assert.equal(sources.integrationStatus,'RESEARCH_INVENTORY_ONLY_NO_APP_CHANGES');
assert.ok(sources.sources.every(x=>x.publishedCopyApproved===false));
console.log('Mystery source recovery: 28 families, 422/422 preserved references, 402 owner assignments, 20 explicit holds, 71/71 events, 39 valid target owners, zero published sources.');
