import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildThematicPilots,selectThematicChapterVerses} from '../src/scripture/historia-thematic-collections.js';
import {expandedThematicResearchCollections} from '../src/scripture/historia-thematic-expansion.js';
import {segmentedThematicResearchCollections} from '../src/scripture/historia-thematic-composite.js';
import {applyThematicBoundaryAudit} from '../src/scripture/historia-thematic-boundaries.js';
import {validateScriptureWitness} from '../src/scripture/witness-loader.js';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const a=read('data/research/historia-salutis-thematic-batch2-boundary-audit-20261021.v1.json');
const r=read('data/research/historia-salutis-thematic-episode-reconciliation-20261021.v2.json');
const p=read('data/research/historia-salutis-thematic-collections-expansion-preflight-20261021.v1.json');
const c=read('data/research/historia-salutis-thematic-composite-segments-20261021.v1.json');
const pilot=buildThematicPilots(r),sixty=applyThematicBoundaryAudit(expandedThematicResearchCollections(p,pilot),a);
const sixtySeven=applyThematicBoundaryAudit(segmentedThematicResearchCollections(c,p,pilot),a);
assert.deepEqual(sixty.map(g=>g.episodes.length),[7,27,23,3]);
assert.deepEqual(sixtySeven.map(g=>g.episodes.length),[11,27,24,3,1,1]);
const rows=sixty.flatMap(g=>g.episodes),byId=new Map(rows.map(x=>[x.id,x]));
assert.equal(rows.length,60);
const get=id=>{const item=byId.get('hist-omitted-'+id);assert(item);return item;};
assert.equal(get('142').reference,'Mark 9:14–28');
assert.equal(get('142').plan.chapters[0].lastVerse,28);
assert.deepEqual(get('150').plan.chapters.map(p=>p.firstVerse),[24,36]);
assert.deepEqual(get('171').plan.chapters.map(p=>p.firstVerse),[12,20]);
assert.deepEqual(get('172').plan.chapters.map(p=>p.book+':'+p.chapter),['Matthew:21','Matthew:22','Matthew:23']);
assert.equal(get('172').plan.chapters[0].firstVerse,23);
assert.equal(get('172').plan.chapters[1].firstVerse,15);
assert.equal(get('172').title,'Debates and denunciations involving the authorities');
assert.equal(get('160').sourceReviewWarnings[0],'LITERARY_FORM_NOT_HISTORICAL_IDENTITY');
assert.equal(get('166').sourceReviewWarnings[0],'ESCHATOLOGICAL_TEACHING_NOT_ORDINARY_PLOT_PARABLE');
assert.equal(get('177').sourceReviewWarnings[0],'MULTI_THEME_DISCOURSE');
assert.equal(get('172').originalInventoryReference,'Matthew 21–23');
assert.equal(sixtySeven.flatMap(g=>g.episodes).length,67);
const witnessCache=new Map();
let checked=0,wordRecords=0;
for(const entry of rows.filter(x=>x.publicationStatus==='RESEARCH_STAGED_NOT_LIVE')){
 for(const edition of ['dr-challoner','cpdv-2009','crampon-1923']){
  for(const span of entry.plan.chapters){
   const key=edition+'|'+span.book;
   if(!witnessCache.has(key)){
    witnessCache.set(key,validateScriptureWitness(read('data/scripture/witness/'+edition+'/'+span.book+'.json'),edition,span.book));
   }
   const witness=witnessCache.get(key);
   const result=selectThematicChapterVerses(witness,edition,span);
   assert(result.verses.length>0);
   assert.deepEqual(result.missingVerseNumbers,[],
    'Gap in '+entry.id+' '+span.reference+' '+edition);
   for(const verse of result.verses){
    const original=witness.find(v=>v.chapter===verse.chapter&&v.verseStart===verse.verse);
    assert(original);assert.equal(original.text,verse.text);
   }
   checked++;wordRecords+=result.verses.length;
  }
 }
}
const bad=structuredClone(a);
bad.entries.find(x=>x.id==='hist-omitted-142').originalInventoryReference='Mark 9:14–28';
assert.throws(()=>applyThematicBoundaryAudit(expandedThematicResearchCollections(p,pilot),bad));
const dup=structuredClone(a);dup.entries[0].id=dup.entries[1].id;
assert.throws(()=>applyThematicBoundaryAudit(expandedThematicResearchCollections(p,pilot),dup));
console.log('PASS 41 audited research windows: four exact verse refinements, three genre cautions; '+
 checked+' edition-chapter views and '+wordRecords+
 ' original Scripture source rows preserved; 19/60/67 contracts intact.');
