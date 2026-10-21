// Original 1897 full-text parenthetical citation adjudication, no runtime promotion.
// Run: node tests/mass-lanslots-parenthetical-adjudication.mjs
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const load=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const orig=readFileSync(new URL('../data/research/archive/lanslots-1897-original-ocr.txt',import.meta.url));
const originalText=orig.toString('utf8');
const sha=createHash('sha256').update(orig).digest('hex');
const screened=load('data/research/mass-lanslots-1897-whole-ocr-parenthetical-screen.v1.json');
const resolved=load('data/research/mass-lanslots-1897-82-parenthetical-adjudication.v1.json');
const last=load('data/research/mass-lanslots-1897-fulltext-five-extra-parenthetical.v1.json');
const sourceBatch=[
  ...load('data/research/mass-lanslots-1897-ocr-scripture-batch01.v1.json').records,
  ...load('data/research/mass-lanslots-1897-ocr-scripture-batch02.v1.json').records,
  ...load('data/research/mass-lanslots-1897-fulltext-17-new-citations.v1.json').records,
  ...last.records
];
const originalById=new Map(sourceBatch.map(x=>[x.id,x]));
assert.equal(sourceBatch.length,91);
assert.equal(originalById.size,91,'all 91 source IDs distinct');
assert.equal(last.resultingSourceOccurrences,91);
assert.equal(last.newSourceOccurrences,5);
assert.equal(screened.sourceSha256,sha);
assert.equal(resolved.originalOcrSha256,sha);
assert.equal(resolved.entries.length,82);
assert.equal(resolved.census.total,82);
assert.equal(resolved.census.scripture,77);
assert.equal(resolved.census.nonScripture,5);
assert.equal(resolved.census.verseLocators,78);
assert.equal(resolved.census.visuallyChecked,5);
const sourcePositions=new Map(screened.records.map(x=>[x.id,x]));
const nonBibleLines=new Set([1685,4806,5297,6016,8380]);
const checkedPdfPage=new Map([[248,16],[328,19],[3795,150],[4362,173],[4552,179]]);
let bible=0,other=0,refLocators=0;
for(const rec of resolved.entries){
 const position=sourcePositions.get(rec.candidateId);
 assert(position,'classification missing original candidate: '+rec.candidateId);
 assert.equal(rec.exactCharacterOffset,position.rawCharacterOffset);
 assert.equal(rec.originalOcrRawLine,position.rawLineStart);
 assert.equal(originalText[rec.exactCharacterOffset],'(');
 const end=originalText.indexOf(')',rec.exactCharacterOffset+1);
 assert(end>rec.exactCharacterOffset);
 assert.equal(originalText.slice(rec.exactCharacterOffset+1,end).replace(/\s+/g,' ').trim(),rec.asPrinted,'literal original OCR citation mismatch: '+rec.candidateId);
 assert.equal(rec.runtimePromotion,'BLOCKED');
 if(rec.originalPdfImageVerified){
  assert(checkedPdfPage.has(rec.originalOcrRawLine));
  assert.equal(rec.visuallyCheckedPdfPage,checkedPdfPage.get(rec.originalOcrRawLine));
 } else assert(!checkedPdfPage.has(rec.originalOcrRawLine),'a source-level checked page must be marked checked');
 const isOther=nonBibleLines.has(rec.originalOcrRawLine);
 assert.equal(rec.classification==='NOT_SCRIPTURE_OTHER_AUTHOR_OR_COUNCIL',isOther);
 if(isOther){
  other++;
  assert.equal(rec.normalizedScriptureRefs.length,0);
  assert.equal(rec.existingSourceRecordIds.length,0);
  assert(rec.nonBiblicalSource.length>10);
 }else{
  bible++;
  assert(rec.normalizedScriptureRefs.length>=1);
  assert.equal(rec.existingSourceRecordIds.length,rec.normalizedScriptureRefs.length);
  refLocators+=rec.normalizedScriptureRefs.length;
  for(let i=0;i<rec.normalizedScriptureRefs.length;i++){
    const owned=originalById.get(rec.existingSourceRecordIds[i]);
    assert(owned,'scripture citation lacks source record: '+rec.candidateId);
    assert.equal(owned.normalizedScriptureRef,rec.normalizedScriptureRefs[i]);
  }
 }
}
assert.equal(bible,77);assert.equal(other,5);assert.equal(refLocators,78);
const atLine=n=>resolved.entries.find(x=>x.originalOcrRawLine===n);
assert.deepEqual(atLine(470).existingSourceRecordIds,['L1897-OCR-006']);
assert.deepEqual(atLine(670).existingSourceRecordIds,['L1897-OCR4-001']);
assert.deepEqual(atLine(2501).existingSourceRecordIds,['L1897-OCR4-003']);
assert.equal(atLine(2501).asPrinted,'1, v. 27');
assert.deepEqual(atLine(8918).normalizedScriptureRefs,['Song of Songs 2:16','Song of Songs 3:4']);
assert.deepEqual(atLine(6906).normalizedScriptureRefs,['Hebrews 11:4']);
for(const row of last.records){
 assert.equal(row.originalPdfPageImageVerified,false);
 assert.equal(row.catholicEditionVerseTextChecked,true);
 assert.equal(row.runtimePromotion,'BLOCKED');
 assert(row.independentBibleWitness?.url.startsWith('https://'));
 const cite=resolved.entries.find(x=>x.candidateId===row.sourceCandidateId);
 assert(cite);
 assert(cite.existingSourceRecordIds.includes(row.id));
}
console.log('PASS: 82/82 adjudicated original-OCR parenthetical candidates; 77 biblical parentheses (78 verse locators), 5 nonbiblical; 91 research occurrences, 5 new; full source SHA and promotion holds.');
