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
assert.equal(proof.counts.fullPrintedBodyWordSequenceChecked,72);
assert.equal(proof.counts.awaitingFullVisualWordSequenceCheck,0);
assert.equal(proof.counts.firstEditionWordForWordCertificate,0);
assert.equal(proof.counts.completeProgrammeDevotionalPrintCertificates,0);
assert.equal(proof.counts.sourcePrintBookCohorts,4);
assert.equal(proof.dispositionCounts.PRINT_BODY_WORD_SEQUENCE_CHECKED,72);
assert.equal(proof.dispositionCounts.AWAITING_COMPLETE_PAGE_WORD_PROOF,0);
assert.equal(proof.dispositionCounts.OCR_EXCEPTION_PAGES_REVIEWED_NOT_FULL_WORD_SEQUENCE_CERTIFIED,0);
assert.equal(proof.dispositionCounts.PRINT_WORDING_VARIANT_CORRECTED_PARTIAL_PAGE_REVIEW,0);
assert.equal(proof.records.length,72);
assert.equal(new Set(proof.records.map(r=>r.id+':'+r.day)).size,72);
const scanRows=new Map(scan.records.map(r=>[r.id+':'+r.day,r]));
const originalRows=new Map(source.days.map(r=>[r.id+':'+r.day,r]));
const bookSHA=new Map(scan.books.map(x=>[x.id,x.sha256]));
const vetted=proof.records.filter(r=>r.wordSequenceCheckedAgainstFullPageImage);
const held=proof.records.filter(r=>!r.wordSequenceCheckedAgainstFullPageImage);
assert.equal(vetted.length,72);
assert.equal(held.length,0);
assert.equal(proof.sourceBooks.reduce((n,x)=>n+x.visuallyVerified,0),72);
assert.deepEqual(Object.fromEntries(proof.sourceBooks.map(x=>[x.bookId,x.visuallyVerified])),{
 callan_1925_copyright_later_scan:18,
 moran_1883:18,hammer_1909:27,purgatorian_manual_1894_1907:9
});
const expectedVetted=new Set([
 ...Array.from({length:9},(_,i)=>'christmas:'+(i+1)),
 ...Array.from({length:9},(_,i)=>'holy_ghost:'+(i+1)),
 ...Array.from({length:9},(_,i)=>'immaculate_conception:'+(i+1)),
 ...Array.from({length:9},(_,i)=>'st_joseph:'+(i+1)),
 ...Array.from({length:9},(_,i)=>'holy_souls:'+(i+1)), 
 ...['annunciation','seven_sorrows','assumption'].flatMap(id=>Array.from({length:9},(_,i)=>id+':'+(i+1)))
]);
assert.equal(expectedVetted.size,72);
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
   const allowed=r.correctedSourceWindowZeroBased||[prior.pdfPageStart,prior.pdfPageEnd];
   assert.ok(idx>=allowed[0] && idx<=allowed[1],'Claim outside corrected historical printed page window '+k);
   proofPDFSeen.add(r.cohort+':'+idx);
  }
  assert.match(r.comparisonStandard,/ALL_WORDS_IN_PROPER_DAY_PRAYER_VISUALLY_CHECKED/);
 }else{
  assert.equal(r.comparisonStandard,'PENDING');
  assert.deepEqual(r.sourceImageFiles,[]);
 }
}
assert.equal(proofPDFSeen.size,60,'51 previously checked unique source pages plus nine new original Holy Souls printed pages');
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
assert.deepEqual(held.map(x=>x.id).sort(),[]);
assert.deepEqual(held.map(x=>x.day).sort((a,b)=>a-b),[]);


// Last seven Redemptorist printed-page visual proofs have individual word-sequence
// sign-offs. Day four's historic auto-window is demonstrably wrong; use its
// corrected full printed-page extent, leaving the pre-review research artifact.
const holy=proof.records.filter(r=>r.id==='holy_souls');
assert.equal(holy.length,9);
assert.ok(holy.every(r=>r.wordSequenceCheckedAgainstFullPageImage&&r.disposition==='PRINT_BODY_WORD_SEQUENCE_CHECKED'));
const seven={
  1:{printed:[199,200],indices:[198,199],workflow:'40872727022'},
  2:{printed:[202,203],indices:[201,202],workflow:'40872727022'},
  4:{printed:[204,205],indices:[203,204],workflow:'40872727022'},
  5:{printed:[205],indices:[204],workflow:'40881455788'},
  6:{printed:[206,207],indices:[205,206],workflow:'40872727022'},
  8:{printed:[208],indices:[207],workflow:'40881455788'},
  9:{printed:[209,210],indices:[208,209],workflow:'40872727022'}
};
for(const [key,expected] of Object.entries(seven)){
 const row=holy.find(r=>r.day===Number(key));
 assert.deepEqual(row.printedPageLabels,expected.printed);
 assert.deepEqual(row.visualPdfPageIndexesZeroBased,expected.indices);
 assert.match(row.originalPrintedReviewWorkflowRun,new RegExp(expected.workflow));
 assert.equal(row.sourceImageFiles.length,expected.printed.length);
 assert.ok(row.sourceImageFiles.every(n=>n.endsWith('.png')));
 assert.equal(row.priorPartialCorrectionState,['5','8'].includes(key)?'AWAITING_COMPLETE_PAGE_WORD_PROOF':'PRINT_WORDING_VARIANT_CORRECTED_PARTIAL_PAGE_REVIEW');
 assert.equal(row.originalFirstEditionVerified,false);
 assert.equal(row.originalFrenchWitnessVerified,false);
 assert.equal(row.currentIndulgenceCertified,false);
 assert.equal(row.fullDevotionalProgrammeVerified,false);
}
assert.deepEqual(holy.map(x=>x.day),[1,2,3,4,5,6,7,8,9]);
assert.equal(holy.filter(x=>x.wordSequenceCheckedAgainstFullPageImage).length,9);

const d4=proof.records.find(x=>x.id==='holy_souls'&&x.day===4);
assert.deepEqual(d4.correctedSourceWindowZeroBased,[203,204]);
assert.equal(d4.wordSequenceCheckedAgainstFullPageImage,true);
assert.deepEqual(d4.actualSourceWindowZeroBased,[203,204]);
assert.equal(decision.outcomes.actualEnglishHistoricalVariantsCorrected,5);
assert.equal(bulk.counts.newHistoricallyVerifiedBodyCorrections,2);
assert.equal(proof.counts.firstEditionWordForWordCertificate,0);
console.log('PASS: 72/72 English proper day prayers visually checked from actual historical book pages (18 Callan later scan, 18 Moran, 27 Hammer, 9 Redemptorist), with 0 body holds; first-edition, whole-devotion, original-French, and modern-indulgence claims remain unverified.');
