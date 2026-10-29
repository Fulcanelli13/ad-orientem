import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {NOVENA_CORPUS_V4} from '../src/pray/novena-corpus-v4.js';

const get=(f)=>JSON.parse(readFileSync(new URL('../data/pray/'+f,import.meta.url),'utf8'));
const proof=get('original-print-72-body-visual-proof-20261029.v1.json');
const source=get('original-print-witness-locators-20261029.v1.json');
const scan=get('original-pdf-72-day-text-layer-screen-20261029.v1.json');
const bulk=get('original-print-62-bulk-review-20261029.v1.json');
const decision=get('original-print-ten-exception-resolution-20261029.v1.json');

assert.equal(proof.schema,'ao.pray.original-print-body-visual-proof.v1');
assert.equal(proof.counts.dayBodies,72);
assert.equal(proof.counts.fullPrintedBodyWordSequenceChecked,26);
assert.equal(proof.counts.awaitingFullVisualWordSequenceCheck,46);
assert.equal(proof.counts.firstEditionWordForWordCertificate,0);
assert.equal(proof.counts.completeProgrammeDevotionalPrintCertificates,0);
assert.equal(proof.counts.sourcePrintBookCohorts,4);
assert.equal(proof.dispositionCounts.PRINT_BODY_WORD_SEQUENCE_CHECKED,26);
assert.equal(proof.dispositionCounts.AWAITING_COMPLETE_PAGE_WORD_PROOF,36);
assert.equal(proof.dispositionCounts.OCR_EXCEPTION_PAGES_REVIEWED_NOT_FULL_WORD_SEQUENCE_CERTIFIED,5);
assert.equal(proof.dispositionCounts.PRINT_WORDING_VARIANT_CORRECTED_PARTIAL_PAGE_REVIEW,5);
assert.equal(proof.records.length,72);
assert.equal(new Set(proof.records.map(r=>r.id+':'+r.day)).size,72);
const scanRows=new Map(scan.records.map(r=>[r.id+':'+r.day,r]));
const originalRows=new Map(source.days.map(r=>[r.id+':'+r.day,r]));
const bookSHA=new Map(scan.books.map(x=>[x.id,x.sha256]));
const vetted=proof.records.filter(r=>r.wordSequenceCheckedAgainstFullPageImage);
const held=proof.records.filter(r=>!r.wordSequenceCheckedAgainstFullPageImage);
assert.equal(vetted.length,26);
assert.equal(held.length,46);
assert.equal(proof.sourceBooks.reduce((n,x)=>n+x.visuallyVerified,0),26);
assert.deepEqual(Object.fromEntries(proof.sourceBooks.map(x=>[x.bookId,x.visuallyVerified])),{
 callan_1925_copyright_later_scan:18,
 moran_1883:0,hammer_1909:6,purgatorian_manual_1894_1907:2
});
const expectedVetted=new Set([
 ...Array.from({length:9},(_,i)=>'christmas:'+(i+1)),
 ...Array.from({length:9},(_,i)=>'holy_ghost:'+(i+1)),
 'holy_souls:3','holy_souls:7',
 'annunciation:8','seven_sorrows:6','seven_sorrows:7',
 'assumption:1','assumption:5','assumption:8'
]);
assert.equal(expectedVetted.size,26);
assert.deepEqual(new Set(vetted.map(x=>x.id+':'+x.day)),expectedVetted);
const proofPDFSeen=new Set();
for(const r of proof.records){
 const k=r.id+':'+r.day, prior=scanRows.get(k), src=originalRows.get(k);
 assert.ok(prior&&src,'Missing historical source '+k);
 assert.equal(r.cohort,src.sourceCohort);
 assert.equal(r.sourcePdfSha256,bookSHA.get(r.cohort));
 assert.equal(r.scope,'ENGLISH_PROPER_PRAYER_BODY_ONLY');
 assert.equal(r.originalFirstEditionVerified,false);
 assert.equal(r.originalFrenchWitnessVerified,false);
 assert.equal(r.currentIndulgenceCertified,false);
 assert.equal(r.fullDevotionalProgrammeVerified,false);
 assert.equal(r.initialPdfTextLayerOverlapBasisPoints,prior.overlapBasisPoints);
 assert.ok(NOVENA_CORPUS_V4[r.id]?.days?.[r.day-1]?.text?.en?.length>20);
 if(r.wordSequenceCheckedAgainstFullPageImage){
  assert.equal(r.disposition,'PRINT_BODY_WORD_SEQUENCE_CHECKED');
  assert.ok(r.printedPageLabels.every(Number.isInteger));
  assert.ok(r.visualPdfPageIndexesZeroBased.every(Number.isInteger));
  assert.equal(r.visualPdfPageIndexesZeroBased.length,r.sourceImageFiles.length);
  assert.ok(r.sourceImageFiles.length<=2 && r.sourceImageFiles.length>0);
  for(const idx of r.visualPdfPageIndexesZeroBased){
   assert.ok(idx>=prior.pdfPageStart && idx<=prior.pdfPageEnd,'Claim outside scanned book page window '+k);
   proofPDFSeen.add(r.cohort+':'+idx);
  }
  assert.match(r.comparisonStandard,/ALL_WORDS_IN_PROPER_DAY_PRAYER_VISUALLY_CHECKED/);
 }else{
  assert.equal(r.comparisonStandard,'PENDING');
  assert.deepEqual(r.sourceImageFiles,[]);
 }
}
assert.equal(proofPDFSeen.size,14,'Expected 3 Christmas + 3 Pentecost + 2 Holy Souls + 6 Hammer unique source pages');
for(const id of ['christmas','holy_ghost'])assert.ok(vetted.filter(x=>x.id===id).every(x=>x.editionCaveat.includes('NOT_AUTHENTICATED_1925_FIRST_EDITION')));
const d4=proof.records.find(x=>x.id==='holy_souls'&&x.day===4);
assert.deepEqual(d4.correctedSourceWindowZeroBased,[203,204]);
assert.equal(d4.wordSequenceCheckedAgainstFullPageImage,false);
assert.equal(decision.outcomes.actualEnglishHistoricalVariantsCorrected,5);
assert.equal(bulk.counts.newHistoricallyVerifiedBodyCorrections,2);
assert.equal(proof.counts.firstEditionWordForWordCertificate,0);
console.log('PASS: 26/72 English proper prayer body word sequences visually checked from real scanned pages (18 Callan later scan, 6 Hammer, 2 Holy Souls); 46 held; no first edition, full programme, French original or indulgence certifications.');
