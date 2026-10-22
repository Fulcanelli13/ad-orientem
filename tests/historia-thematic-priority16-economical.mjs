import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseThematicReference,selectThematicChapterVerses} from '../src/scripture/historia-thematic-collections.js';
import {validateScriptureWitness} from '../src/scripture/witness-loader.js';
const json=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const plan=json('data/research/historia-salutis-thematic-priority16-economical-select-20261022.v1.json');
const restoration=json('data/research/historia-salutis-core-restoration-46-adjudication-20261022.v1.json');
const manuscript=json('data/research/historia-salutis-v18-continuous-reading-proof.v1.json');
assert.equal(plan.schema,'AO_HISTORIA_PRIORITY_16_ECONOMICAL_SCRIPTURE_SELECTIONS_V1');
assert.equal(plan.status,'COMPLETE_SOURCE_COORDINATE_DRAFT_AWAITING_ED_APPROVAL');
assert.equal(plan.rules.exactBiblicalVersesOnly,true);
assert.equal(plan.rules.noAITextParaphrase,true);
assert.equal(plan.rules.noSilentlyStitchedOmissions,true);
assert.equal(plan.rules.noAutoPublishOrAutoInsert,true);
assert.equal(plan.rules.mainManuscriptUnchanged,true);
assert.equal(plan.entries.length,16);
const ordered=new Map(plan.entries.map(e=>[e.episodeId,e]));
assert.equal(ordered.size,16);
const priority=restoration.entries.filter(e=>e.proposedEditorialDisposition==='PRIORITY_SCOPED_MAIN_READING_REVIEW');
assert.equal(priority.length,16);
assert.deepEqual([...ordered.keys()].sort(),priority.map(e=>e.episodeId).sort());
const original=new Map(priority.map(e=>[e.episodeId,e]));
const editions=['dr-challoner','cpdv-2009','crampon-1923'];
const witnesses=new Map();
const scriptureBounds=/^([1-3]?\s*[A-Za-z]+)\s+(\d+):(\d+)(?:[–-](\d+))?$/;
const occupied=new Set();
let manuscriptVerses=0;
for(const movement of manuscript.movements){
 for(const beat of movement.beats.filter(b=>b.kind==='SCRIPTURE')){
  for(const label of beat.refs){
   const parsed=label.match(scriptureBounds);
   assert(parsed,'Unknown main Scripture source range '+label);
   const [,name,chapter,first,last]=parsed;
   const book=name.replace(/\s+/g,'');
   for(let v=Number(first);v<=Number(last||first);v++){
    occupied.add(book+':'+chapter+':'+v);
    manuscriptVerses++;
   }
  }
 }
}
assert.equal(manuscriptVerses,1129);
let spans=0,verses=0,totalPerEdition=Object.fromEntries(editions.map(ed=>[ed,0]));
const allSelected=new Set();
const rangeIds=new Set();
const flagged=[];
for(const item of plan.entries){
 const evidence=original.get(item.episodeId);
 assert(evidence,'This 16-item excerpt was not in the curated 46-case register');
 assert.equal(item.sourceInventoryReference,evidence.originalInventoryReference);
 assert.equal(item.comparedCurrentMovement,evidence.nearestProposedResearchMovement.id);
 assert.deepEqual(item.candidate54ChapterIDs,evidence.nearestProposedResearchMovement.candidate54ChapterIds);
 assert.equal(item.requiresManualApproval,true);
 assert.equal(item.approvedMainNarrativeChange,false);
 assert.equal(item.insertedIntoMainReader,false);
 assert.equal(item.acceptanceStatus,'VERSE_SET_PROPOSED_NOT_ACCEPTED');
 assert(item.reasonForEconomicalSelection.length>30&&item.criticalOmissionDisclosure.length>30);
 assert(item.proposedSelection.length>=1);
 if(item.sequenceGuard==='MULTI_GOSPEL_ORDER_REVIEW_REQUIRED')flagged.push(item.episodeId);
 let localTotal=0,last={book:'',ch:0,verse:0};
 for(const [index,span] of item.proposedSelection.entries()){
  assert.equal(span.order,index+1);
  assert.equal(span.textCopied,false);
  assert.equal(span.sourceOwner,'EXISTING_PINNED_CATHOLIC_WITNESS_VERSES_ONLY');
  assert.equal(span.editorialBoundaryStatus,'PROPOSED_NOT_ACCEPTED');
  assert.equal(span.ellipsisBefore,index>0);
  const parsed=parseThematicReference(span.reference);
  assert.equal(parsed.book,span.book);
  assert.equal(parsed.chapters.length,1);
  assert.equal(parsed.firstChapter,span.chapter);
  assert.equal(parsed.firstVerse,span.firstVerse);
  assert.equal(parsed.lastVerse,span.lastVerse);
  assert.equal(span.verseCount,span.lastVerse-span.firstVerse+1);
  assert(!rangeIds.has(item.episodeId+'|'+span.reference),'Duplicate excerpt range');
  rangeIds.add(item.episodeId+'|'+span.reference);
  assert(last.book===''||last.book===span.book);
  assert(span.chapter>last.ch || (span.chapter===last.ch&&span.firstVerse>last.verse),
   'Editorial excerpts must keep original source order');
  last={book:span.book,ch:span.chapter,verse:span.lastVerse};
  for(const edition of editions){
   const key=edition+'|'+span.book;
   if(!witnesses.has(key)){
    const data=json('data/scripture/witness/'+edition+'/'+span.book+'.json');
    witnesses.set(key,validateScriptureWitness(data,edition,span.book));
   }
   const originalWitness=witnesses.get(key);
   const selected=selectThematicChapterVerses(originalWitness,edition,{
    book:span.book,chapter:span.chapter,firstVerse:span.firstVerse,lastVerse:span.lastVerse
   });
   assert.deepEqual(selected.missingVerseNumbers,[],
    'Missing requested source verse in '+item.episodeId+' '+span.reference+' '+edition);
   assert.equal(selected.verses.length,span.verseCount);
   for(const v of selected.verses){
    const source=originalWitness.find(x=>x.chapter===v.chapter&&x.verseStart===v.verse);
    assert(source);assert.equal(source.text,v.text,'No Bible source paraphrase allowed');
    totalPerEdition[edition]++;
   }
  }
  for(let v=span.firstVerse;v<=span.lastVerse;v++){
   const key=span.book+':'+span.chapter+':'+v;
   assert(!occupied.has(key),'Already in primary narrator: '+key+' for '+item.episodeId);
   assert(!allSelected.has(key),'Duplicate priority proposed verse: '+key);
   allSelected.add(key);
  }
  localTotal+=span.verseCount;
  spans++;
 }
 assert.equal(item.selectedVerseOccurrences,localTotal);
 verses+=localTotal;
}
assert.equal(spans,45);
assert.equal(verses,156);
assert.equal(witnesses.size,33);
assert.equal(allSelected.size,156);
assert.deepEqual(totalPerEdition,{'dr-challoner':156,'cpdv-2009':156,'crampon-1923':156});
assert.equal(plan.totals.currentMainVerseOccurrences,manuscriptVerses);
assert.equal(plan.totals.selectionRanges,spans);
assert.equal(plan.totals.selectedVerseOccurrences,verses);
assert.equal(plan.totals.addedIfAllSelectedPercentage,13.8);
assert.equal(plan.totals.approvedIntegrations,0);
assert.equal(flagged.length,4);
assert.equal(ordered.get('hist-omitted-181').proposedLocation,'WITHIN_HS_M28_BEFORE_SELECTED_CHRISTS_DEATH');
assert.equal(ordered.get('hist-omitted-207').sequenceGuard,'VISION_LITERARY_FRAME_NOT_EARTHLY_CHRONOLOGY');
// Daniel is kept source-level and the Crampon editorial insert in 3:23 is not spliced in.
const dan=ordered.get('hist-omitted-084').proposedSelection;
assert(!dan.some(r=>r.chapter===3&&r.firstVerse<=23&&r.lastVerse>=23));
assert(!dan.some(r=>r.chapter===3&&r.firstVerse<=90&&r.lastVerse>=90));
const erroneous=structuredClone(plan);
erroneous.entries.find(x=>x.episodeId==='hist-omitted-039').proposedSelection[0].reference='Numbers 21:4–10';
assert.notEqual(erroneous.entries.find(x=>x.episodeId==='hist-omitted-039').proposedSelection[0].reference,
 plan.entries.find(x=>x.episodeId==='hist-omitted-039').proposedSelection[0].reference);
console.log('PASS Historia compact sixteen: 45 excerpt ranges, 156 distinct verse occurrences, 33 witness books across three editions, 468 exact source rows, no main-text or cross-candidate duplication; four multi-Gospel ordering holds.');
