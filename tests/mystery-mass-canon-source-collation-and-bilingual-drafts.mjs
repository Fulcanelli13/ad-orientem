// Research-only integration gate for the real Canon 39→65/67 source handoff.
// Never promotes text or infers priest action from an adjacent prayer cue.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
assert.equal(col.summary.printedPageImageVerified,0);
assert.equal(col.summary.publicationApprovals,0);
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
 assert(!a.matchingPrintedPageImageIndependentlyInspected);
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
const alphonsus=col.originalEditionWarnings.find(x=>x.includes('unnamed'));
assert(alphonsus.includes('St Alphonsus')&&alphonsus.includes('Dom Prosper Guéranger'));
console.log('Mystery Canon research gate: 6 aligned pairs, 5 issues, 11 original EN/FR drafts; Latin cue/card IDs valid, no publication approval.');
