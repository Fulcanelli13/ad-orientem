import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const text=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const json=p=>JSON.parse(text(p));
const rel=json('data/research/historia-salutis-priority16-parallel-reconciliation-20261022.v1.json');
const primary=json('data/research/historia-salutis-thematic-priority16-economical-select-20261022.v1.json');
const contextual=json('data/research/historia-salutis-priority16-economical-selections-20261022.v1.json');
const html=text('research/historia-priority16-review.html');
assert.equal(rel.schema,'AO_HISTORIA_PRIORITY16_PARALLEL_SOURCE_RECONCILIATION_V1');
assert.equal(rel.status,'RESEARCH_COMPARE_ONLY_SINGLE_WORKING_PREVIEW_NO_ACCEPTED_CANONICAL_SELECTION');
assert.equal(rel.policy.keepOneActiveResearchPreview,true);
assert.equal(rel.policy.doNotAutoMergeOrOverwriteParallelPipeline,true);
assert.equal(rel.policy.doNotCreateThirdBibleTextStore,true);
assert.equal(rel.totals.cases,16);
assert.equal(rel.totals.agree,7);
assert.equal(rel.totals.previewPreferred,5);
assert.equal(rel.totals.integrityHolds,4);
assert.equal(rel.totals.previewVerseOccurrences,156);
assert.equal(rel.totals.comparisonVerseOccurrences,196);
const aa=new Map(primary.entries.map(x=>[x.episodeId,x])),bb=new Map(contextual.entries.map(x=>[x.episodeId,x]));
assert.equal(aa.size,16);
assert.equal(bb.size,16);
assert.equal(rel.entries.length,16);
assert(html.includes(rel.sources.workingPreview.path.split('/').at(-1)),'Single active peer preview source');
assert(!html.includes(rel.sources.contextPreservingAlternative.path.split('/').at(-1)),'Context alternative must not override the preview');
const num=ref=>{
 const m=ref.match(/:(\d+)(?:[–-](\d+))?$/);
 assert(m,'Scripture verse bounds: '+ref);
 return Number(m[2]??m[1])-Number(m[1])+1;
};
let fullA=0,fullB=0,mixedVerses=0,mixedRanges=0;
const summary={agree:0,preview:0,hold:0};
for(const record of rel.entries){
 const a=aa.get(record.episodeId),b=bb.get(record.episodeId);
 assert(a&&b,'Provenance owner record missing');
 assert.equal(record.title,a.episodeTitle);
 assert.equal(record.finalSelectionAccepted,false);
 assert.equal(record.previewAcceptance,false);
 assert.equal(record.contextualAlternativeAcceptance,false);
 assert.equal(record.preferredForCurrentResearchPreview,'ORIGINAL_PREVIEW_156_VERSES');
 const aRefs=a.proposedSelection.map(x=>x.reference);
 const bRefs=b.scripturalSelections.map(x=>x.reference);
 const av=aRefs.reduce((n,r)=>n+num(r),0),bv=bRefs.reduce((n,r)=>n+num(r),0);
 assert.equal(av,a.selectedVerseOccurrences);
 assert.equal(av,record.previewMetrics.verseOccurrences);
 assert.equal(bv,record.contextualAlternativeMetrics.verseOccurrences);
 assert.equal(aRefs.length,record.previewMetrics.sourceRangeCount);
 assert.equal(bRefs.length,record.contextualAlternativeMetrics.sourceRangeCount);
 fullA+=av;fullB+=bv;
 const match=JSON.stringify(aRefs)===JSON.stringify(bRefs);
 if(record.comparisonStatus==='AGREE_IDENTICAL'){
  assert(match);summary.agree++;
 }else if(record.comparisonStatus==='PREVIEW_PROVISIONALLY_PREFERRED'){
  assert(!match);summary.preview++;
 }else if(record.comparisonStatus==='CONTEXT_PROTECTION_REVIEW_HOLD'){
  assert(!match);summary.hold++;
 }else throw Error('Unapproved comparison label '+record.comparisonStatus);
 const contextual=record.comparisonStatus==='CONTEXT_PROTECTION_REVIEW_HOLD';
 mixedVerses+=contextual?bv:av;
 mixedRanges+=contextual?bRefs.length:aRefs.length;
}
assert.deepEqual(summary,{agree:7,preview:5,hold:4});
assert.equal(fullA,156);
assert.equal(fullB,196);
assert.equal(mixedVerses,182);
assert.equal(mixedRanges,39);
assert.equal(rel.totals.indicativeMixedEconomyVerseOccurrences,182);
assert.equal(rel.totals.indicativeMixedEconomySourceRanges,39);
assert.equal(rel.totals.indicativeMixedEconomyIsNotAnApprovedOrSavedReader,true);
assert.deepEqual(rel.entries.filter(e=>e.comparisonStatus==='CONTEXT_PROTECTION_REVIEW_HOLD').map(x=>x.episodeId).sort(),
 ['hist-omitted-035','hist-omitted-044','hist-omitted-174','hist-omitted-184']);
console.log('PASS Historia priority16 parallel reconciliation: one active 156-verse research preview, one nonauthoritative 196-verse context alternative; 7 identical, 5 provisional preview, 4 integral-context holds; no third active selection owner.');
