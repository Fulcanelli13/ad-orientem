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
assert.equal(proof.counts.fullPrintedBodyWordSequenceChecked,65);
assert.equal(proof.counts.awaitingFullVisualWordSequenceCheck,7);
assert.equal(proof.counts.firstEditionWordForWordCertificate,0);
assert.equal(proof.counts.completeProgrammeDevotionalPrintCertificates,0);
assert.equal(proof.counts.sourcePrintBookCohorts,4);
assert.equal(proof.dispositionCounts.PRINT_BODY_WORD_SEQUENCE_CHECKED,65);
assert.equal(proof.dispositionCounts.AWAITING_COMPLETE_PAGE_WORD_PROOF,2);
assert.equal(proof.dispositionCounts.OCR_EXCEPTION_PAGES_REVIEWED_NOT_FULL_WORD_SEQUENCE_CERTIFIED,0);
assert.equal(proof.dispositionCounts.PRINT_WORDING_VARIANT_CORRECTED_PARTIAL_PAGE_REVIEW,5);
assert.equal(proof.records.length,72);
assert.equal(new Set(proof.records.map(r=>r.id+':'+r.day)).size,72);
const scanRows=new Map(scan.records.map(r=>[r.id+':'+r.day,r]));
const originalRows=new Map(source.days.map(r=>[r.id+':'+r.day,r]));
const bookSHA=new Map(scan.books.map(x=>[x.id,x.sha256]));
const vetted=proof.records.filter(r=>r.wordSequenceCheckedAgainstFullPageImage);
const held=proof.records.filter(r=>!r.wordSequenceCheckedAgainstFullPageImage);
assert.equal(vetted.length,65);
assert.equal(held.length,7);
assert.equal(proof.sourceBooks.reduce((n,x)=>n+x.visuallyVerified,0),65);
assert.deepEqual(Object.fromEntries(proof.sourceBooks.map(x=>[x.bookId,x.visuallyVerified])),{
 callan_1925_copyright_later_scan:18,
 moran_1883:18,hammer_1909:27,purgatorian_manual_1894_1907:2
});
const expectedVetted=new Set([
 ...Array.from({length:9},(_,i)=>'christmas:'+(i+1)),
 ...Array.from({length:9},(_,i)=>'holy_ghost:'+(i+1)),
 ...Array.from({length:9},(_,i)=>'immaculate_conception:'+(i+1)),
 ...Array.from({length:9},(_,i)=>'st_joseph:'+(i+1)),
 'holy_souls:3','holy_souls:7',
 ...['annunciation','seven_sorrows','assumption'].flatMap(id=>Array.from({length:9},(_,i)=>id+':'+(i+1)))
]);
assert.equal(expectedVetted.size,65);
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
assert.equal(proofPDFSeen.size,51,'29 source pages already checked + 22 newly inspected Hammer pages');
for(const id of ['christmas','holy_ghost'])assert.ok(vetted.filter(x=>x.id===id).every(x=>x.editionCaveat.includes('NOT_AUTHENTICATED_1925_FIRST_EDITION')));

const moranProof=proof.records.filter(x=>x.cohort==='moran_1883');
assert.equal(moranProof.length,18);
assert.ok(moranProof.every(x=>x.wordSequenceCheckedAgainstFullPageImage && x.disposition==='PRINT_BODY_WORD_SEQUENCE_CHECKED'));
assert.deepEqual(new Set(moranProof.map(x=>x.id)),new Set(['immaculate_conception','st_joseph']));
assert.deepEqual(new Set(moranProof.map(x=>x.printedPageLabels).flat()),new Set([567,569,570,571,572,603,604,605,606,607,608]));
assert.ok(moranProof.every(x=>x.visualPdfPageIndexesZeroBased.every(p=>p>=x.sourceCandidateWindowZeroBased[0] && p<=x.sourceCandidateWindowZeroBased[1])));
assert.ok(moranProof.every(x=>x.originalFirstEditionVerified===false && x.fullDevotionalProgrammeVerified===false));


// The Hammer source verification now covers all 27 daily proper prayer bodies,
// including five whose earlier lower scores were decorative-letter OCR errors.
const hammer=proof.records.filter(x=>x.cohort==='hammer_1909');
assert.equal(hammer.length,27);
assert.ok(hammer.every(x=>x.wordSequenceCheckedAgainstFullPageImage));
assert.deepEqual(new Set(hammer.map(x=>x.id)),new Set(['annunciation','seven_sorrows','assumption']));
for(const id of ['annunciation','seven_sorrows','assumption']){
 assert.deepEqual(hammer.filter(x=>x.id===id).map(x=>x.day).sort((a,b)=>a-b),[1,2,3,4,5,6,7,8,9]);
}
for(const [id,day,printed,pdf] of [
 ['annunciation',1,[97],[101]],['annunciation',2,[99],[103]],['annunciation',3,[101],[105]],
 ['annunciation',4,[103],[107]],['annunciation',5,[105],[109]],['annunciation',6,[107,108],[111,112]],
 ['annunciation',7,[109],[113]],['annunciation',9,[114],[119]],
 ['seven_sorrows',1,[117],[122]],['seven_sorrows',2,[120],[125]],['seven_sorrows',3,[121],[126]],
 ['seven_sorrows',4,[123],[128]],['seven_sorrows',5,[125],[130]],['seven_sorrows',8,[130],[136]],['seven_sorrows',9,[132],[138]],
 ['assumption',2,[137],[143]],['assumption',3,[139],[145]],['assumption',4,[141],[147]],
 ['assumption',6,[145],[152]],['assumption',7,[147],[154]],['assumption',9,[150],[157]]
]){
 const item=hammer.find(x=>x.id===id&&x.day===day);
 assert.deepEqual(item.printedPageLabels,printed,id+' '+day+' print page labels changed');
 assert.deepEqual(item.visualPdfPageIndexesZeroBased,pdf,id+' '+day+' original page proof changed');
 assert.ok(item.visualObservation.includes('Entire English proper day-prayer'));
}
const oldOcr=[
 ['annunciation',1],['annunciation',3],['annunciation',4],['annunciation',6],['seven_sorrows',3]
];
for(const [id,day] of oldOcr)assert.equal(hammer.find(x=>x.id===id&&x.day===day).priorOcrExceptionDisposition,'OCR_LAYOUT_ONLY_VISUALLY_RESOLVED');
assert.deepEqual(held.map(x=>x.id).sort(),Array(7).fill('holy_souls'));
assert.deepEqual(held.map(x=>x.day).sort((a,b)=>a-b),[1,2,4,5,6,8,9]);

const d4=proof.records.find(x=>x.id==='holy_souls'&&x.day===4);
assert.deepEqual(d4.correctedSourceWindowZeroBased,[203,204]);
assert.equal(d4.wordSequenceCheckedAgainstFullPageImage,false);
assert.equal(decision.outcomes.actualEnglishHistoricalVariantsCorrected,5);
assert.equal(bulk.counts.newHistoricallyVerifiedBodyCorrections,2);
assert.equal(proof.counts.firstEditionWordForWordCertificate,0);
console.log('PASS: 65/72 English proper prayers image-word-checked (18 Callan, 18 Moran, 27 Hammer, 2 Holy Souls), with seven Holy Souls held; no first-edition, full-programme, French-original or current-indulgence certifications.');
