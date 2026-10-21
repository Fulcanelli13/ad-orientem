import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildThematicPilots,selectThematicChapterVerses} from '../src/scripture/historia-thematic-collections.js';
import {all217ThematicResearchCollections} from '../src/scripture/historia-thematic-remaining.js';
import {apply150EditorialTriage} from '../src/scripture/historia-thematic-editorial-triage.js';
import {validateScriptureWitness} from '../src/scripture/witness-loader.js';

const json=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const master=json('data/research/historia-salutis-thematic-episode-reconciliation-20261021.v2.json');
const preflight=json('data/research/historia-salutis-thematic-collections-expansion-preflight-20261021.v1.json');
const segmented=json('data/research/historia-salutis-thematic-composite-segments-20261021.v1.json');
const batch2=json('data/research/historia-salutis-thematic-batch2-boundary-audit-20261021.v1.json');
const remainder=json('data/research/historia-salutis-thematic-remainder-research-20261021.v1.json');
const review=json('data/research/historia-salutis-thematic-150-editorial-queue-20261021.v1.json');
const base=()=>all217ThematicResearchCollections(
 remainder,batch2,segmented,preflight,buildThematicPilots(master),master.collectionTitles);
const original=base(),updated=apply150EditorialTriage(original,review);
const all=updated.flatMap(c=>c.episodes);
assert.equal(all.length,217);
assert.equal(new Set(all.map(x=>x.id)).size,217);
assert.deepEqual(updated.map(c=>c.episodes.length),[86,13,26,27,24,8,17,13,3]);
assert.equal(review.entries.length,150);
assert.equal(review.totals.proposedBoundaryCorrections,10);
assert.equal(review.totals.sharedReferencePairs,7);
assert.equal(review.totals.atlasExactReferenceCandidates,28);
assert.equal(review.totals.atlasRuntimeCandidates,9);
assert.equal(review.totals.p3SelectedSourceOverlapCandidates,4);
assert.equal(review.totals.restorationDispositionStillPending,46);
assert.equal(review.totals.canonicallyApprovedIdentities,0);
assert.equal(review.policy.allEntriesResearchOnly,true);
assert(review.entries.every(x=>x.catholicEditionCollationStatus==='UNCOLLATED'));
assert(review.entries.every(x=>x.canonicalEpisodeId===null&&x.approvedAtlasEventId===null));
const byId=new Map(all.map(x=>[x.id,x]));
const proposals={
 '009':['Genesis 19:1–29'],
 '021':['Genesis 49:1–28'],
 '022':['Genesis 49:29–32','Genesis 50:1–14','Genesis 50:22–25'],
 '049':['Judges 16:4–22'],
 '062':['1 Kings 10:1–13'],
 '063':['1 Kings 11:1–13'],
 '064':['1 Kings 17:8–16'],
 '066':['1 Kings 18:17–40'],
 '080':['Ezekiel 37:1–14'],
 '195':['Acts 12:3–19']
};
const cache=new Map();
let verseChecks=0,segmentChecks=0;
for(const [suffix,references] of Object.entries(proposals)){
 const id='hist-omitted-'+suffix,entry=byId.get(id);
 assert(entry,id);
 assert.equal(entry.originalInventoryReference,
  master.entries.find(e=>e.provisional_record_key===id).biblical_reference_from_inventory);
 assert.equal(entry.reference,references.join('; '));
 assert.deepEqual(entry.plan.chapters.filter(p=>p.partFirstChapter).map(p=>p.partReference),references);
 assert.equal(entry.publicationStatus,'RESEARCH_STAGED_NOT_LIVE');
 assert.equal(entry.atlasEventId,null);
 assert.equal(entry.covenantalAnchor,null);
 for(const edition of ['dr-challoner','cpdv-2009','crampon-1923']){
  for(const part of entry.plan.chapters){
   const key=edition+'/'+part.book;
   if(!cache.has(key)){
    const data=json('data/scripture/witness/'+key+'.json');
    cache.set(key,validateScriptureWitness(data,edition,part.book));
   }
   const witness=cache.get(key);
   const view=selectThematicChapterVerses(witness,edition,part);
   assert(view.verses.length>0);
   assert.deepEqual(view.missingVerseNumbers,[]);
   for(const v of view.verses){
    const source=witness.find(w=>w.chapter===v.chapter&&w.verseStart===v.verse);
    assert(source);assert.equal(source.text,v.text);
    verseChecks++;
   }
   segmentChecks++;
  }
 }
}
for(const episode of original.flatMap(g=>g.episodes).filter(e=>!(e.id.slice(-3) in proposals))){
 assert.strictEqual(byId.get(episode.id),episode,
  'No unrelated historical/main/Scripture episode should be overwritten');
}
const invalid=structuredClone(review);
invalid.entries.find(e=>e.id==='hist-omitted-062').originalInventoryReference='1 Kings 10:1–13';
assert.throws(()=>apply150EditorialTriage(base(),invalid));
const rejected=structuredClone(review);
rejected.entries.find(e=>e.id==='hist-omitted-062').published=true;
assert.throws(()=>apply150EditorialTriage(base(),rejected));
console.log('PASS Historia 150-entry editorial triage: 10 scoped corrections, '+
 segmentChecks+' original witness chapter views, '+verseChecks+
 ' verbatim source rows, 7 shared-verse pairs, 28 Atlas reference candidates (9 navigable), 4 P3 source intersections, and zero accidental publication approvals.');
