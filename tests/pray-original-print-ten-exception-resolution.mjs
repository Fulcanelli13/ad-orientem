import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {NOVENA_CORPUS_V3} from '../src/pray/novena-corpus.js';
import {NOVENA_CORPUS_V4} from '../src/pray/novena-corpus-v4.js';
import {HOLY_SOULS_PRINT_ALIGNED_V1,HOLY_SOULS_PRINT_ALIGNED_DAY_IDS} from '../src/pray/novena-holy-souls-print-corrections.v1.js';
const r=JSON.parse(readFileSync(new URL('../data/pray/original-print-ten-exception-resolution-20261029.v1.json',import.meta.url),'utf8'));
assert.equal(r.schema,'ao.pray.original-print-ten-exception-resolution.v1');
assert.equal(r.exceptions.length,10);
assert.deepEqual([...HOLY_SOULS_PRINT_ALIGNED_DAY_IDS].sort((a,b)=>a-b),[1,2,4,6,9]);
assert.equal(r.outcomes.ocrLayoutOnlyNoTextChange,5);
assert.equal(r.outcomes.actualEnglishHistoricalVariantsCorrected,5);
assert.equal(r.outcomes.fullPrintedBookEditionCertified,0);
assert.equal(r.outcomes.independentOriginalFrenchEditionCertified,0);
assert.equal(r.outcomes.currentIndulgenceGrantCertified,0);
assert.match(r.sourcePdfSHA256.hammer_1909,/^[a-f0-9]{64}$/);
assert.match(r.sourcePdfSHA256.purgatorian_manual_1894_1907,/^[a-f0-9]{64}$/);
let changed=0,ocrOnly=0;
for(const [id,source] of Object.entries(NOVENA_CORPUS_V3)){
 const app=NOVENA_CORPUS_V4[id];
 for(let i=0;i<source.days.length;i++){
  const old=source.days[i].text||'',now=app.days[i].text?.en||'';
  if(id==='holy_souls'&&HOLY_SOULS_PRINT_ALIGNED_V1[i+1]){
   const proof=HOLY_SOULS_PRINT_ALIGNED_V1[i+1];
   assert.equal(now,proof.en);
   assert.notEqual(now,old);
   if(proof.fr)assert.equal(app.days[i].text.fr,proof.fr);
   changed++;
  }else assert.equal(now,old,'Unexpected donor-source difference '+id+' day '+(i+1));
 }
}
assert.equal(changed,5);
for(const row of r.exceptions){
 const live=NOVENA_CORPUS_V4[row.id]?.days[row.day-1];
 assert.ok(live);
 assert.ok(row.sourcePdfPageIndexes.every(Number.isInteger));
 if(row.id==='holy_souls'){
  assert.equal(row.englishBodyEdited,true);
  assert.deepEqual(row.printedPages,HOLY_SOULS_PRINT_ALIGNED_V1[row.day].printedPages);
 }else{
  ocrOnly++;
  assert.equal(row.englishBodyEdited,false);
  assert.equal(row.classification,'OCR_LAYOUT_ONLY');
 }
}
assert.equal(ocrOnly,5);
const day4=r.exceptions.find(x=>x.id==='holy_souls'&&x.day===4);
assert.deepEqual(day4.sourcePdfPageIndexes,[203,204]);
assert.match(NOVENA_CORPUS_V4.holy_souls.source.status,/PRINT_EDITION_NOT_COLLATED/);
assert.match(NOVENA_CORPUS_V4.holy_souls.source.adaptation,/Five day-prayer bodies/);
console.log('PASS print ten-exception result: 5 Hammer OCR-only + 5 visually justified Holy Souls source variants; N3 untouched, other 67 day bodies frozen, no false print certification.');
