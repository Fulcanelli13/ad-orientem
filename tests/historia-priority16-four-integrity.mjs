import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateScriptureWitness} from '../src/scripture/witness-loader.js';
const txt=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const json=p=>JSON.parse(txt(p));
const common='data/research/';
const primary=json(common+'historia-salutis-thematic-priority16-economical-select-20261022.v1.json');
const alternative=json(common+'historia-salutis-priority16-economical-selections-20261022.v1.json');
const reconciliation=json(common+'historia-salutis-priority16-parallel-reconciliation-20261022.v1.json');
const evidence=json(common+'historia-priority16-four-integrity-evidence-20261022.v1.json');
const html=txt('research/historia-priority16-review.html');
assert.equal(evidence.schema,'AO_HISTORIA_PRIORITY16_FOUR_INTEGRITY_EVIDENCE_V1');
assert.equal(evidence.status,'SINGLE_WORKING_156_PREVIEW_WITH_UNAPPROVED_CONTEXT_EVIDENCE');
assert.equal(evidence.policy.oneActiveResearchPreview,true);
assert.equal(evidence.policy.activeVerseCount156Unchanged,true);
assert.equal(evidence.policy.contextPacket196RemainsComparisonOnly,true);
assert.equal(evidence.policy.noThirdVerseSelection,true);
assert.equal(evidence.policy.main54ChapterManuscriptUntouched,true);
assert.equal(evidence.entries.length,4);
assert.deepEqual(evidence.totals,{
 integrityCases:4,notSubsetCases:2,supersetCases:2,
 workingTotalVerses:61,alternativeTotalVerses:87,
 previewOnlyVerses:5,comparisonOnlyVerses:31,approvedFinalSelections:0
});
assert.equal(primary.totals.selectedVerseOccurrences,156);
assert.equal(reconciliation.totals.comparisonVerseOccurrences,196);
assert(html.includes('historia-salutis-thematic-priority16-economical-select-20261022.v1.json'));
assert(html.includes('historia-priority16-four-integrity-evidence-20261022.v1.json'));
assert(!html.includes('historia-salutis-priority16-economical-selections-20261022.v1.json'),
 'Working viewer must never load the alternative as a second preview');
assert(!html.includes('ao_historia_economy16'),'No third opt-in excerpt review');
const textStatuses=new Set();
let inspected=0;
const editionCache=new Map();
const range=/^([1-3]?\s*[A-Za-z]+)\s+(\d+):(\d+)(?:[–-](\d+))?$/;
function keys(refs){
 return refs.flatMap(ref=>{
  const m=ref.match(range);assert(m,'Source range '+ref);
  return Array.from({length:Number(m[4]||m[3])-Number(m[3])+1},(_,i)=>
   m[1].replace(/\s+/g,'')+':'+m[2]+':'+(Number(m[3])+i));
 });
}
for(const row of evidence.entries){
 const a=primary.entries.find(x=>x.episodeId===row.episodeId);
 const b=alternative.entries.find(x=>x.episodeId===row.episodeId);
 const c=reconciliation.entries.find(x=>x.episodeId===row.episodeId);
 assert(a&&b&&c);
 assert.equal(c.comparisonStatus,'CONTEXT_PROTECTION_REVIEW_HOLD');
 assert.equal(row.actualFinalSelectionApproved,false);
 assert.equal(row.newThirdSelectionCreated,false);
 assert.equal(row.preserveCurrentPreviewSelection,true);
 assert(row.editorialAssessment.length>60);
 const sa=new Set(keys(row.existingPreview.references));
 const sb=new Set(keys(row.existingContextComparison.references));
 assert.deepEqual([...sa],[...keys(a.proposedSelection.map(x=>x.reference))]);
 assert.deepEqual([...sb],[...keys(b.scripturalSelections.map(x=>x.reference))]);
 assert.equal(sa.size,row.existingPreview.verseOccurrences);
 assert.equal(sb.size,row.existingContextComparison.verseOccurrences);
 assert.equal([...sa].filter(k=>!sb.has(k)).length,row.differences.distinctWorkingVerses);
 assert.equal([...sb].filter(k=>!sa.has(k)).length,row.differences.distinctComparisonVerses);
 const previewOnly=new Set(keys(row.differences.onlyInWorkingPreview));
 const compareOnly=new Set(keys(row.differences.onlyInContextComparison));
 assert.deepEqual([...previewOnly].sort(),[...sa].filter(k=>!sb.has(k)).sort());
 assert.deepEqual([...compareOnly].sort(),[...sb].filter(k=>!sa.has(k)).sort());
 assert.equal(row.differences.comparisonIsStrictSuperset,previewOnly.size===0);
 textStatuses.add(row.integrityRequirement);
 for(const edition of ['dr-challoner','cpdv-2009','crampon-1923']){
  for(const passage of row.sourcePassagesToInspect){
   const match=passage.match(range);assert(match);
   const book=match[1].replace(/\s+/g,''),ch=Number(match[2]),lo=Number(match[3]),hi=Number(match[4]||match[3]);
   const cacheKey=edition+'/'+book;
   if(!editionCache.has(cacheKey)){
    editionCache.set(cacheKey,validateScriptureWitness(
     json('data/scripture/witness/'+cacheKey+'.json'),edition,book));
   }
   const original=editionCache.get(cacheKey);
   const chosen=original.filter(v=>v.chapter===ch&&v.verseStart>=lo&&v.verseStart<=hi);
   assert.equal(chosen.length,hi-lo+1,'Source incomplete: '+edition+' '+passage);
   for(let i=0;i<chosen.length;i++){
    assert.equal(chosen[i].verseStart,lo+i);
    assert.equal(typeof chosen[i].text,'string');
    assert(chosen[i].text.length>0);
   }
   inspected+=chosen.length;
  }
 }
}
assert.equal(textStatuses.size,4);
assert.equal(inspected,66,'22 disputed source verses checked in each of three Catholic witnesses');
assert.deepEqual(evidence.entries.map(x=>x.episodeId).sort(),
 ['hist-omitted-035','hist-omitted-044','hist-omitted-174','hist-omitted-184']);
assert.equal(evidence.entries.find(x=>x.episodeId==='hist-omitted-035').differences.comparisonIsStrictSuperset,false);
assert.equal(evidence.entries.find(x=>x.episodeId==='hist-omitted-044').differences.comparisonIsStrictSuperset,false);
assert.equal(evidence.entries.find(x=>x.episodeId==='hist-omitted-174').differences.comparisonIsStrictSuperset,true);
assert.equal(evidence.entries.find(x=>x.episodeId==='hist-omitted-184').differences.comparisonIsStrictSuperset,true);
console.log('PASS priority16 four integrity reviews: one 156-verse active preview; four evidence cases, 66 witness verse validations, no third preview, no manuscript edit.');
