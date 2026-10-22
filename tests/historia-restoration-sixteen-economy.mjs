import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildThematicPilots,parseThematicReference,selectThematicChapterVerses}
 from '../src/scripture/historia-thematic-collections.js';
import {all217ThematicResearchCollections} from '../src/scripture/historia-thematic-remaining.js';
import {apply150EditorialTriage} from '../src/scripture/historia-thematic-editorial-triage.js';
import {overlayEconomicalRestorationResearch} from '../src/scripture/historia-restoration-economy.js';
import {validateScriptureWitness} from '../src/scripture/witness-loader.js';

const json=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const suffix='data/research/';
const source=json(suffix+'historia-salutis-thematic-episode-reconciliation-20261021.v2.json');
const preflight=json(suffix+'historia-salutis-thematic-collections-expansion-preflight-20261021.v1.json');
const segments=json(suffix+'historia-salutis-thematic-composite-segments-20261021.v1.json');
const boundary=json(suffix+'historia-salutis-thematic-batch2-boundary-audit-20261021.v1.json');
const remaining=json(suffix+'historia-salutis-thematic-remainder-research-20261021.v1.json');
const triage=json(suffix+'historia-salutis-thematic-150-editorial-queue-20261021.v1.json');
const decisions=json(suffix+'historia-salutis-core-restoration-46-adjudication-20261022.v1.json');
const draft=json(suffix+'historia-salutis-sixteen-economical-scripture-selections-20261022.v1.json');
const proof=json(suffix+'historia-salutis-v18-continuous-reading-proof.v1.json');
const base=apply150EditorialTriage(all217ThematicResearchCollections(
 remaining,boundary,segments,preflight,buildThematicPilots(source),source.collectionTitles),triage);
const overlaid=overlayEconomicalRestorationResearch(draft,decisions,base);
const everything=overlaid.flatMap(c=>c.episodes);
assert.deepEqual(overlaid.map(c=>c.episodes.length),[86,13,26,27,24,8,17,13,3]);
assert.equal(everything.length,217);
assert.equal(new Set(everything.map(e=>e.id)).size,217);
assert.equal(draft.entries.length,16);
assert.equal(draft.summary.originalSourceVerses,418);
assert.equal(draft.summary.selectedVerses,178);
assert.equal(draft.summary.excerptSegments,41);
assert.equal(draft.summary.fullSpanRetained,8);
assert.equal(draft.policy.noNarrativePublicationOrMerge,true);

const byId=new Map(everything.map(e=>[e.id,e]));
const oldById=new Map(base.flatMap(g=>g.episodes).map(e=>[e.id,e]));
const priority=decisions.entries.filter(e=>
 e.proposedEditorialDisposition==='PRIORITY_SCOPED_MAIN_READING_REVIEW');
assert.equal(priority.length,16);
const approved=new Map(priority.map(e=>[e.episodeId,e]));
const cache=new Map();
const editions=['dr-challoner','cpdv-2009','crampon-1923'];
const originalP3=new Set();
for(const movement of proof.movements){
 for(const beat of movement.beats.filter(b=>b.kind==='SCRIPTURE')){
  for(const ref of beat.refs){
   const p=parseThematicReference(ref);
   for(const part of p.chapters){
    const id='dr-challoner|'+part.book;
    if(!cache.has(id))cache.set(id,validateScriptureWitness(
     json('data/scripture/witness/dr-challoner/'+part.book+'.json'),'dr-challoner',part.book));
    const v=selectThematicChapterVerses(cache.get(id),'dr-challoner',part);
    for(const verse of v.verses) originalP3.add(part.book+':'+verse.chapter+':'+verse.verse);
   }
  }
 }
}
let sourceRowsChecked=0,originalRowsChecked=0,views=0,omissions=0;
for(const item of draft.entries){
 const before=oldById.get(item.episodeId);
 const ep=byId.get(item.episodeId);
 assert(before&&ep&&ep!==before);
 assert.equal(approved.get(ep.id)?.mainReaderUpdateApproved,false);
 assert.equal(approved.get(ep.id)?.nearestProposedResearchMovement.id,item.proposedResearchMovement);
 assert.equal(before.reference,item.inventoryScriptureReference);
 assert.equal(ep.originalInventoryReference,item.inventoryScriptureReference);
 assert.equal(ep.publicationStatus,'RESEARCH_RESTORATION_DRAFT_NOT_LIVE');
 assert.equal(ep.editorialEconomyProposal.status,'NOT_EDITORIALLY_APPROVED');
 assert.equal(ep.editorialEconomyProposal.proposedVerseCount,item.expectedSelectedVerseCount);
 assert.equal(ep.editorialEconomyProposal.originalVerseCount,item.expectedSourceVerseCount);
 assert.equal(ep.scriptureTextOwner,'EXISTING_CATHOLIC_WITNESS_LOADER_ONLY');
 assert.equal(ep.plan.chapters.length,item.proposedExcerptParts.length);
 assert(!Object.hasOwn(ep,'scriptureText')&&!Object.hasOwn(ep,'text'));
 if(item.expectedSelectedVerseCount<item.expectedSourceVerseCount){
  omissions++;
  assert.notEqual(item.materialOmissionDisclosure,'NO_GAP');
 }
 for(const edition of editions){
  const originalParts=parseThematicReference(item.inventoryScriptureReference).chapters;
  const keys=new Set();
  let sourceTotal=0;
  for(const span of originalParts){
   const id=edition+'|'+span.book;
   if(!cache.has(id))cache.set(id,validateScriptureWitness(
    json('data/scripture/witness/'+edition+'/'+span.book+'.json'),edition,span.book));
   const result=selectThematicChapterVerses(cache.get(id),edition,span);
   assert.deepEqual(result.missingVerseNumbers,[],'Missing original '+item.episodeId+' '+edition);
   for(const verse of result.verses)keys.add(span.book+':'+verse.chapter+':'+verse.verse);
   sourceTotal+=result.verses.length;
  }
  assert.equal(sourceTotal,item.expectedSourceVerseCount,
   'All editions must cover original source range: '+item.episodeId+' '+edition);
  originalRowsChecked+=sourceTotal;
  let excerpts=0;
  for(const span of ep.plan.chapters){
   const id=edition+'|'+span.book;
   if(!cache.has(id))cache.set(id,validateScriptureWitness(
    json('data/scripture/witness/'+edition+'/'+span.book+'.json'),edition,span.book));
   const witness=cache.get(id);
   const result=selectThematicChapterVerses(witness,edition,span);
   assert(result.verses.length,'Empty proposed excerpt '+span.partReference);
   assert.deepEqual(result.missingVerseNumbers,[],'Source gap '+item.episodeId+' '+edition);
   for(const verse of result.verses){
    const k=span.book+':'+verse.chapter+':'+verse.verse;
    assert(keys.has(k),'Proposed verse outside existing episode: '+k);
    assert(!originalP3.has(k),'Proposed verse already selected in main manuscript: '+k);
    const row=witness.find(w=>w.chapter===verse.chapter&&w.verseStart===verse.verse);
    assert(row);assert.equal(verse.text,row.text);
   }
   excerpts+=result.verses.length;
   sourceRowsChecked+=result.verses.length;
   views++;
  }
  assert.equal(excerpts,item.expectedSelectedVerseCount,
   'All three pinned Catholic witnesses must have identical selected coordinates: '+item.episodeId+' '+edition);
 }
}
assert.equal(omissions,8);
assert.equal(originalRowsChecked,418*3);
assert.equal(sourceRowsChecked,178*3);
assert.equal(views,41*3);
assert.equal(cache.size>=33,true);
assert.equal(byId.get('hist-omitted-184').plan.chapters.length,1);
assert.equal(byId.get('hist-omitted-084').plan.chapters.length,7);
assert.equal(byId.get('hist-omitted-099').plan.chapters.length,6);
for(const [id,original] of oldById){
 if(!draft.entries.some(p=>p.episodeId===id))assert.strictEqual(byId.get(id),original);
}
const poisoned=structuredClone(draft);
poisoned.entries[0].publicationApproved=true;
assert.throws(()=>overlayEconomicalRestorationResearch(poisoned,decisions,base));
const changedDecision=structuredClone(decisions);
changedDecision.entries.find(e=>e.episodeId==='hist-omitted-003').mainReaderUpdateApproved=true;
assert.throws(()=>overlayEconomicalRestorationResearch(draft,changedDecision,base));
console.log('PASS Historia sixteen direct-Scripture proposals: 418 -> 178 source verses, 41 excerpt pages, '+
 views+' three-edition chapter views, '+sourceRowsChecked+' verbatim excerpt rows, no P3 collisions; all 217 source IDs intact.');
