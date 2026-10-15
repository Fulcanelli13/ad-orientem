// Research-only integration gate for the real Canon 39→65/67 source handoff.
// Never promotes text or infers priest action from an adjacent prayer cue.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MYSTERY_CANON_PRECISION_REVIEW as review } from '../src/learn/mystery-mass-canon-precision-review.js';
const get=(path)=>JSON.parse(readFileSync(new URL('../'+path, import.meta.url),'utf8'));
const root='data/learn/research/';
const col=get(root+'mystery-mass-six-pair-five-issue-text-collation-20261015.v1.json');
const draft=get(root+'mystery-mass-canon-six-pair-five-issue-bilingual-drafts-20261015.v1.json');
const adjudication=get(root+'mystery-mass-canon-32-comparison-adjudication-20261015.v1.json');
const map=get(root+'mystery-mass-39-to-curated65-67-source-author-handoff-20261015.v1.json');
const source=get('data/presentation/reader-text-sung.v1.json');
const canon=get('data/presentation/reader-canon-source-map.v1.json');

assert.equal(col.sixPairTranscriptionCollations.length,6);
assert.equal(col.fiveInterpretativeIssueReconciliations.length,5);
assert.equal(col.summary.printedPageImageVerified,1);
const verifiedAlphonsus=col.sixPairTranscriptionCollations.find(x=>x.ids[0]==="VER-032");
assert.equal(verifiedAlphonsus.printImage.printedPage,46);
assert.equal(verifiedAlphonsus.printImage.djvuImagePage,48);
assert.equal(verifiedAlphonsus.matchingPrintedPageImageIndependentlyInspected,true);
assert(verifiedAlphonsus.printImage.scanPageUrl.endsWith(".djvu/48"));
assert(col.sixPairTranscriptionCollations.filter(x=>x.matchingPrintedPageImageIndependentlyInspected).length===1);
assert(col.printedWitnessProcurement.filter(x=>x.imageChecked).length===1);
assert(col.summary.printPageLocatorCorrections.some(x=>x.old==="printed pp.56–57" && x.correct.includes("p.46")));
assert.equal(col.summary.publicationApprovals,0);
assert.equal(col.ritus1962HancIgitur.currentMainReaderSources.publishedEventId,"AO.RUB.C0161.01");
assert.equal(col.ritus1962HancIgitur.primaryRule,"Ritus servandus in celebratione Missae VIII.4");
assert.equal(col.ritus1962HancIgitur.currentMainReaderSources.actor,"PRIEST");
assert.equal(col.ritus1962HancIgitur.previousNeedForDuplicateEvent,false);
assert.equal(col.ritus1962HancIgitur.sourceWitnesses.filter(x=>x.visualPageInspected).length,1);
assert.equal(col.printedWitnessProcurement.length,3);
assert.ok(col.printedWitnessProcurement.filter(x=>x.work!=="St Alphonsus").every(x=>x.imageChecked===false));
const rubrics=get('data/presentation/reader-rubric-events.v1.json');
const event=rubrics.items.find(x=>x.id==="AO.RUB.C0161.01");
assert.equal(event.cueId,"AO.SM.C0161");
assert.equal(event.actor,"PRIEST");
assert.equal(event.label,"HANDS OVER OBLATIONS");
assert.ok(event.sources.includes("MR62_RITUS"));
const published=readFileSync(new URL('../src/mass/reader-canon-published-rubrics.js',import.meta.url),'utf8');
assert(published.includes('"AO.RUB.C0161.01"'),"Already published source-backed Canon gesture; no new action");

assert.equal(adjudication.cases.length,32);
assert.equal(draft.entryCount,11);
assert.equal(draft.entries.length,11);
assert.equal(map.owners.length,39);
assert.equal(map.verifiedCounts.curatedOrdinaryBaseModelCards,65);
assert.equal(col.publicationStatus,'HELD_NO_PRODUCTION_APP_CHANGES');

const knownPairs=new Set(adjudication.cases.map(x=>x.verifiedClaimId+'|'+x.historicalClaimId));
for(const a of col.sixPairTranscriptionCollations){
 assert(knownPairs.has(a.ids.join('|')),'Existing comparison not found: '+a.ids);
 assert(a.retainedBothEvidenceIDs && !a.publicationApproved);
 assert(a.url.startsWith('https://'));
 if(a.ids[0]==="VER-032"){
   assert.equal(a.matchingPrintedPageImageIndependentlyInspected,true);
   assert.equal(a.printImage?.printedPage,46);
 }else{
   assert.equal(a.matchingPrintedPageImageIndependentlyInspected,false);
 }
}
const knownIssues=new Set(adjudication.interpretativeIssueDossiers.map(x=>x.id));
for(const issue of col.fiveInterpretativeIssueReconciliations){
 assert(knownIssues.has(issue.id));
 assert(issue.sourceWitnesses.length>=1);
}
assert(col.originalEditionWarnings.some(x=>x.includes('CANNOT be Dom Prosper Guéranger')));
const cueMap=new Map();
for(const block of source.blocks){
 for(const u of block.units)cueMap.set(u.cue_id,{latin:u.latin,block:block.Block_ID});
}
const byOwner=new Map(canon.segments.map(x=>[x.id,x]));
const liveIds=new Set(map.owners.flatMap(x=>x.base65Cards.map(y=>y.liveCardId)));
const uniqueEntryIds=new Set();
for(const e of draft.entries){
 assert(!uniqueEntryIds.has(e.id),'duplicate explanation: '+e.id);uniqueEntryIds.add(e.id);
 const u=cueMap.get(e.latinCueId);
 assert(u&&u.latin.includes(e.latinPhrase),'unmatched Latin: '+e.id);
 assert(byOwner.get(e.sourceOwnerId)?.blockIds.includes(u.block),'wrong Canon owner: '+e.id);
 assert(e.presentationCardCandidates.every(x=>liveIds.has(x)),'unsupported LIVE ID: '+e.id);
 assert(e.reading.en.length>=100&&e.reading.fr.length>=100,'missing meaningful bilingual explanation: '+e.id);
 assert(!e.editorialChecks.readyForPublication && !e.editorialChecks.sourceRightsApproved);
 assert(e.priorEvidenceIds.length>=2 && e.workLocators.length>=1);
}
assert.equal(review.length,draft.entries.length);
for(let i=0;i<draft.entries.length;i++){
 const stored=draft.entries[i],display=review[i];
 assert.equal(display.id,stored.id);
 assert.equal(display.owner,stored.sourceOwnerId);
 assert.equal(display.cueId,stored.latinCueId);
 assert.equal(display.latin,stored.latinPhrase);
 assert.equal(display.displayTier,stored.displayTier);
 assert.deepEqual(display.reading,stored.reading);
 assert.deepEqual(display.workLocators,stored.workLocators);
 assert.deepEqual(display.evidenceIds,stored.priorEvidenceIds);
 assert.equal(display.approved,false);
}
const alphonsus=col.originalEditionWarnings.find(x=>x.includes('unnamed'));
assert(alphonsus.includes('St Alphonsus')&&alphonsus.includes('Dom Prosper Guéranger'));
console.log('Mystery Canon research gate: 6 aligned pairs, 5 issues, 11 original EN/FR drafts; Latin cue/card IDs valid, no publication approval.');
