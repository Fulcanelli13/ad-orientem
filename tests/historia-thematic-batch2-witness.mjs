import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildThematicPilots,selectThematicChapterVerses} from '../src/scripture/historia-thematic-collections.js';
import {expandedThematicResearchCollections} from '../src/scripture/historia-thematic-expansion.js';
import {validateScriptureWitness} from '../src/scripture/witness-loader.js';

const source=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const pilot=buildThematicPilots(source('data/research/historia-salutis-thematic-episode-reconciliation-20261021.v2.json'));
const expanded=expandedThematicResearchCollections(
 source('data/research/historia-salutis-thematic-collections-expansion-preflight-20261021.v1.json'),pilot);
const staged=expanded.flatMap(g=>g.episodes).filter(e=>e.publicationStatus==='RESEARCH_STAGED_NOT_LIVE');
assert.equal(staged.length,41);
const editions=['dr-challoner','cpdv-2009','crampon-1923'];
const cache=new Map();
let views=0,rowsChecked=0;
for(const episode of staged){
 assert(episode.scriptureTextOwner==='EXISTING_CATHOLIC_WITNESS_LOADER_ONLY');
 for(const edition of editions){
  const key=edition+'|'+episode.plan.book;
  if(!cache.has(key)){
   const data=source('data/scripture/witness/'+edition+'/'+episode.plan.book+'.json');
   cache.set(key,validateScriptureWitness(data,edition,episode.plan.book));
  }
  const witness=cache.get(key);
  for(const span of episode.plan.chapters){
   const selected=selectThematicChapterVerses(witness,edition,span);
   assert(selected.verses.length>0,'Empty Scripture chapter in '+episode.id+' '+edition);
   assert.deepEqual(selected.missingVerseNumbers,[],
    'Uncollated source has a missing requested verse in '+episode.id+' '+edition);
   assert.equal(selected.sourceStatus,'UNCOLLATED_SOURCE_WITNESS');
   for(const verse of selected.verses){
    const original=witness.find(v=>v.chapter===verse.chapter&&v.verseStart===verse.verse);
    assert(original,'Original source verse missing from '+edition);
    assert.equal(verse.text,original.text,'Scripture wording must not be changed');
   }
   views++;rowsChecked+=selected.verses.length;
  }
 }
}
assert.equal(cache.size,12,'Exact four canonical source books in all three Catholic witnesses');
assert.equal(views,129);
assert.equal(rowsChecked,1608);
console.log('PASS Historia batch two: 41 source-coordinate readings, 12 pinned Catholic book witnesses, 129 chapter views, 1608 verbatim source rows, no verse gaps; not publication approved.');
