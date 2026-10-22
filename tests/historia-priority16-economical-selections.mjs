import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseThematicReference,selectThematicChapterVerses} from '../src/scripture/historia-thematic-collections.js';
import {buildPriority16ScriptureSelections} from '../src/scripture/historia-priority16-selections.js';
import {validateScriptureWitness} from '../src/scripture/witness-loader.js';

const get=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const proposed=get('data/research/historia-salutis-priority16-economical-selections-20261022.v1.json');
const decisions=get('data/research/historia-salutis-core-restoration-46-adjudication-20261022.v1.json');
const selected=buildPriority16ScriptureSelections(proposed,decisions);
const manuscript=get('data/research/historia-salutis-v18-continuous-reading-proof.v1.json');
const editions=['dr-challoner','cpdv-2009','crampon-1923'];
assert.equal(selected.length,16);
assert.equal(new Set(selected.map(e=>e.episodeId)).size,16);
assert.equal(selected.reduce((n,e)=>n+e.pageSpans.length,0),34);
assert.equal(selected.filter(e=>e.pageSpans.length>1).length,6);
assert.equal(selected.filter(e=>e.pageSpans.length===1).length,10);
assert.equal(manuscript.movements.length,37);
assert(selected.every(e=>e.proposalStatus==='RESEARCH_CURATED_NOT_ACCEPTED' &&
 !e.printedEditionCollationApproved &&
 e.insertion.status==='UNAPPROVED_EDITORIAL_SLOT_NO_MANUSCRIPT_CHANGE'));
const witness=new Map(),summaries=[];
let selectedViews=0,selectedRows=0,sourceRows=0,wordCount=0,missing=[];
const getWitness=(edition,book)=>{
 const key=edition+'|'+book;
 if(!witness.has(key)){
  const data=get('data/scripture/witness/'+edition+'/'+book+'.json');
  assert.equal(data.sourceStatus,'UNCOLLATED_SOURCE_WITNESS');
  witness.set(key,validateScriptureWitness(data,edition,book));
 }
 return witness.get(key);
};
const normalized=row=>row.book+':'+row.chapter+':'+row.verseStart;
const selectedSourceIds=new Set();
for(const e of selected){
 const allOriginal=e.originalReadingRefs.flatMap(ref=>parseThematicReference(ref).chapters);
 let canonicalSelected=0,canonicalOriginal=0,canonicalWords=0;
 for(const edition of editions){
  let within=0,full=0;
  const rows=[];
  for(const span of e.pageSpans){
   const source=getWitness(edition,span.book);
   const got=selectThematicChapterVerses(source,edition,span);
   assert.equal(got.sourceStatus,'UNCOLLATED_SOURCE_WITNESS');
   assert(got.verses.length>0,e.episodeId+' '+span.reference);
   assert.deepEqual(got.missingVerseNumbers,[],'Source witness gap '+e.episodeId+' '+edition+' '+span.reference);
   assert.equal(got.verses.length,span.lastVerse-span.firstVerse+1,
     'Source verse sequence incomplete '+e.episodeId+' '+edition+' '+span.reference);
   for(const v of got.verses){
    const backing=source.find(x=>x.chapter===v.chapter&&x.verseStart===v.verse);
    assert(backing);
    assert.equal(backing.text,v.text,'Source words changed '+e.episodeId+' '+edition);
    if(edition==='dr-challoner')selectedSourceIds.add(edition+'|'+normalized({
     book:span.book,chapter:v.chapter,verseStart:v.verse
    }));
    if(edition==='dr-challoner')canonicalWords+=v.text.trim().split(/\s+/).length;
   }
   rows.push(...got.verses);
   selectedViews++;
   within+=got.verses.length;
  }
  for(const span of allOriginal){
   const source=getWitness(edition,span.book);
   const got=selectThematicChapterVerses(source,edition,span);
   assert(got.verses.length>0,'Original inventory source disappeared');
   if(got.missingVerseNumbers.length)
    missing.push({edition,id:e.episodeId,span:span.label,missing:got.missingVerseNumbers});
   full+=got.verses.length;
  }
  if(edition==='dr-challoner'){
   canonicalSelected=within;canonicalOriginal=full;
  }
  selectedRows+=within;sourceRows+=full;
 }
 assert(canonicalSelected<=canonicalOriginal);
 if(e.pageSpans.length===1 && e.originalReadingRefs.length===1){
  assert(canonicalSelected===canonicalOriginal,'Short coherent story should not be truncated '+e.episodeId);
 }
 wordCount+=canonicalWords;
 summaries.push({episodeId:e.episodeId,sourceVerses:canonicalOriginal,
  proposedVerses:canonicalSelected,omittedVerses:canonicalOriginal-canonicalSelected,
  reductionPercent:Math.round(100*(canonicalOriginal-canonicalSelected)/canonicalOriginal),
  englishWitnessWordCount:canonicalWords});
}
assert.deepEqual(missing,[],'No unreported gaps in three edition comparison');
assert.equal(witness.size,33,'Eleven Catholic book witnesses in each of three editions');
assert(selectedRows<sourceRows);
const manuscriptSelections=manuscript.movements.flatMap(m=>m.beats.filter(b=>b.kind==='SCRIPTURE')
 .flatMap(b=>b.refs.flatMap(ref=>parseThematicReference(ref).chapters
  .flatMap(range=>{
   const source=getWitness('dr-challoner',range.book);
   return selectThematicChapterVerses(source,'dr-challoner',range).verses.map(v=>
    'dr-challoner|'+range.book+':'+v.chapter+':'+v.verse);
  }))));
const oldSet=new Set(manuscriptSelections);
const overlap=[...selectedSourceIds].filter(id=>oldSet.has(id));
assert.deepEqual(overlap,[],'Priority candidates may not silently duplicate already selected main-reader verses');
const daniel=selected.find(e=>e.episodeId==='hist-omitted-084');
assert.deepEqual(daniel.pageSpans.map(p=>p.reference),['Daniel 3:12–23','Daniel 3:49–50','Daniel 3:91–95']);
assert.equal(daniel.integrityNote,'CATHOLIC_GREEK_ADDITIONS_IN_OMITTED_SECTION');
const emmaus=selected.find(e=>e.episodeId==='hist-omitted-184');
assert.equal(emmaus.selectionVerseCount,23);
const joshua=selected.find(e=>e.episodeId==='hist-omitted-044');
assert.equal(joshua.insertion.proposedSlot,'WITHIN_ANCHOR_AFTER_JOSHUA_CROSSING_BEFORE_JUDGES_TRANSITION');
const bad=structuredClone(proposed);
bad.entries[0].scripturalSelections[0].reference='Genesis 7:1–5';
assert.throws(()=>buildPriority16ScriptureSelections(bad,decisions));
const leaked=structuredClone(proposed);
leaked.entries[0].selectionApproved=true;
assert.throws(()=>buildPriority16ScriptureSelections(leaked,decisions));
console.log('PASS Historia 16 priority economical Scripture selections; '+
 selected.reduce((n,x)=>n+x.pageSpans.length,0)+' source spans; '+
 witness.size+' pinned witnesses; '+selectedViews+' excerpt chapter views; '+
 selectedRows+' selected source verse rows / '+sourceRows+' original reading verse rows across three editions; '+
 wordCount+' English witness words; zero pre-existing P3 duplicate verses; none approved for publication.');
console.log('ECONOMY '+JSON.stringify(summaries));
