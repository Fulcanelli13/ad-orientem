import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildThematicPilots,selectThematicChapterVerses} from '../src/scripture/historia-thematic-collections.js';
import {all217ThematicResearchCollections} from '../src/scripture/historia-thematic-remaining.js';
import {validateScriptureWitness} from '../src/scripture/witness-loader.js';
const json=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const root=json('data/research/historia-salutis-thematic-episode-reconciliation-20261021.v2.json');
const inventory=json('data/research/historia-salutis-thematic-collections-expansion-preflight-20261021.v1.json');
const segments=json('data/research/historia-salutis-thematic-composite-segments-20261021.v1.json');
const windows=json('data/research/historia-salutis-thematic-batch2-boundary-audit-20261021.v1.json');
const remainder=json('data/research/historia-salutis-thematic-remainder-research-20261021.v1.json');
const groups=all217ThematicResearchCollections(remainder,windows,segments,inventory,buildThematicPilots(root),root.collectionTitles);
assert.equal(groups.length,9);
assert.deepEqual(groups.map(g=>g.episodes.length),[86,13,26,27,24,8,17,13,3]);
assert.equal(groups.flatMap(g=>g.episodes).length,217);
assert.equal(new Set(groups.flatMap(g=>g.episodes.map(e=>e.id))).size,217);
assert(groups.every(g=>g.stage==='OPT_IN_ALL_217_RESEARCH_ONLY_NOT_PUBLISHED'));
const remainderIds=new Set(remainder.entries.map(e=>e.id));
assert.equal(remainderIds.size,150);
const all=groups.flatMap(g=>g.episodes);
for(const ep of all){
 assert(ep.plan.chapters.length>0);
 assert.equal(ep.atlasEventId??null,null);
 if(!remainderIds.has(ep.id))continue;
 assert.equal(ep.publicationStatus,'RESEARCH_STAGED_NOT_LIVE');
 assert.equal(ep.scriptureTextOwner,'EXISTING_CATHOLIC_WITNESS_LOADER_ONLY');
 assert.equal(ep.covenantalAnchor,null);
 assert.equal(ep.editorialWindowReviewedNotCertified,true);
 assert(!Object.hasOwn(ep,'scriptureText') && !Object.hasOwn(ep,'text'));
 assert.equal(ep.originalInventoryReference,
  root.entries.find(x=>x.provisional_record_key===ep.id)?.biblical_reference_from_inventory);
}
const ref=id=>all.find(e=>e.id==='hist-omitted-'+id);
assert.equal(ref('213').reference,'Revelation 13:1–10');
assert.equal(ref('214').reference,'Revelation 13:11–18');
assert.deepEqual(ref('210').plan.chapters.map(x=>[x.chapter,x.lastVerse]),[[6,null],[7,null],[8,5]]);
assert.deepEqual(ref('211').plan.chapters.map(x=>[x.chapter,x.firstVerse]),[[8,6],[9,null],[10,null],[11,null]]);
assert.equal(ref('212').chronologyStatus,'NOT_FIXED_DATED_SEQUENCE');
assert.equal(ref('026').editorialWindowReviewedNotCertified,true);
assert.equal(ref('026').plan.chapters.length,5);
assert.equal(ref('032').plan.chapters.length,6);
assert.equal(ref('097').plan.chapters.length,5);
assert.equal(ref('103').reference,'Luke 1:39–56');
assert.equal(ref('207').atlasEventId,null);

const cache=new Map(),editions=['dr-challoner','cpdv-2009','crampon-1923'];
let views=0,verses=0;
const sourceGaps=[];
for(const ep of all.filter(e=>remainderIds.has(e.id))){
 for(const edition of editions){
  for(const span of ep.plan.chapters){
   const key=edition+'|'+span.book;
   if(!cache.has(key)){
    const file='data/scripture/witness/'+edition+'/'+span.book+'.json';
    cache.set(key,validateScriptureWitness(json(file),edition,span.book));
   }
   const witness=cache.get(key);
   let selected;
   try {selected=selectThematicChapterVerses(witness,edition,span);}
   catch(err){sourceGaps.push({id:ep.id,edition,reference:span.label,error:String(err.message)});continue}
   for(const number of selected.missingVerseNumbers)
    sourceGaps.push({id:ep.id,edition,reference:span.label,verse:number});
   for(const row of selected.verses){
    const source=witness.find(x=>x.chapter===row.chapter&&x.verseStart===row.verse);
    assert(source);assert.equal(row.text,source.text);
   }
   views++;verses+=selected.verses.length;
  }
 }
}
assert.equal(cache.size,72,'24 canonical book files per pinned Catholic witness');
assert.deepEqual(sourceGaps,[],'The 150 newly linked source ranges must not conceal missing verses: '+
 JSON.stringify(sourceGaps.slice(0,15)));
const corrupted=structuredClone(remainder);
corrupted.entries.find(e=>e.id==='hist-omitted-213').sourceParts[0].reference='Revelation 13';
assert.throws(()=>all217ThematicResearchCollections(
 corrupted,windows,segments,inventory,buildThematicPilots(root),root.collectionTitles));
assert.equal(remainder.entries.reduce((n,e)=>n+e.sourceParts.length,0),152);
console.log('PASS Historia 217 research index: nine families, 150 new source-only readings, '+
 cache.size+' Catholic book/edition witnesses, '+views+' selected chapter views, '+verses+
 ' unchanged verse rows and zero unreported source gaps.');
