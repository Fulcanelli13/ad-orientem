import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseThematicReference,buildThematicPilots,selectThematicChapterVerses}
 from '../src/scripture/historia-thematic-collections.js';
import {buildSegmentedResearchEpisodes,segmentedThematicResearchCollections}
 from '../src/scripture/historia-thematic-composite.js';
import {validateScriptureWitness} from '../src/scripture/witness-loader.js';
const get=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const base=get('data/research/historia-salutis-thematic-episode-reconciliation-20261021.v2.json');
const inventory=get('data/research/historia-salutis-thematic-collections-expansion-preflight-20261021.v1.json');
const sources=get('data/research/historia-salutis-thematic-composite-segments-20261021.v1.json');
const seven=buildSegmentedResearchEpisodes(sources);
const collection=segmentedThematicResearchCollections(sources,inventory,buildThematicPilots(base));
assert.deepEqual(collection.map(x=>x.episodes.length),[11,27,24,3,1,1]);
assert.equal(collection.flatMap(x=>x.episodes).length,67);
assert.equal(new Set(collection.flatMap(x=>x.episodes.map(e=>e.id))).size,67);
assert.equal(seven.reduce((n,e)=>n+e.plan.chapters.length,0),15);
assert(seven.every(e=>e.publicationStatus==='RESEARCH_SEGMENTED_NOT_APPROVED'));
assert(seven.every(e=>e.covenantalAnchor===null&&e.atlasEventId===null));
assert.equal(seven.find(x=>x.id==='hist-omitted-114').plan.chapters[1].firstVerse,51);
assert.equal(seven.find(x=>x.id==='hist-omitted-114').plan.chapters[1].lastVerse,52);
assert.deepEqual(seven.find(x=>x.id==='hist-omitted-173').plan.chapters.map(x=>x.book),['Matthew','Mark']);
assert.deepEqual(seven.find(x=>x.id==='hist-omitted-217').plan.chapters.map(x=>x.chapter),[1,2,42]);
assert.equal(seven.find(x=>x.id==='hist-omitted-217').secondaryCollectionIds.length,0);
assert.deepEqual(seven.find(x=>x.id==='hist-omitted-095').plan.supportedEditions,['dr-challoner']);
assert.throws(()=>parseThematicReference('Greek Esther additions'));

const master=new Map(base.entries.map(x=>[x.provisional_record_key,x]));
const cache=new Map();
let sourceViews=0,checkedVerses=0;
for(const entry of sources.entries){
 assert.equal(entry.originalInventoryReference,master.get(entry.id).biblical_reference_from_inventory);
 const ep=seven.find(x=>x.id===entry.id);assert(ep);
 assert(entry.parts.length>0);
 for(const edition of ep.plan.supportedEditions){
  for(const part of ep.plan.chapters){
   const key=edition+'|'+part.book;
   if(!cache.has(key)){
    cache.set(key,validateScriptureWitness(get('data/scripture/witness/'+edition+'/'+part.book+'.json'),edition,part.book));
   }
   const rows=cache.get(key),selected=selectThematicChapterVerses(rows,edition,part);
   assert(selected.verses.length>0,'Source missing: '+entry.id+' '+edition+' '+part.label);
   assert.deepEqual(selected.missingVerseNumbers,[],'Source gap: '+entry.id+' '+edition+' '+part.label);
   for(const v of selected.verses){
    const owner=rows.find(row=>row.chapter===v.chapter&&row.verseStart===v.verse);
    assert(owner);assert.equal(v.text,owner.text);
   }
   sourceViews++;checkedVerses+=selected.verses.length;
  }
 }
}
const bad=structuredClone(sources);
bad.entries.find(e=>e.id==='hist-omitted-095').readerAllowedEditions.push('cpdv-2009');
assert.throws(()=>buildSegmentedResearchEpisodes(bad));
const duplicated=structuredClone(sources);
duplicated.entries[0].parts.push({...duplicated.entries[0].parts[0],sequence:3});
assert.throws(()=>buildSegmentedResearchEpisodes(duplicated));
console.log('PASS Historia segmented seven: 67 total readings, 15 distinct biblical source chapter spans, '+
 sourceViews+' edition-chapter views, '+checkedVerses+
 ' original witness verses unchanged; Greek Esther CPDV prohibited; Job wisdom chronology excluded.');
