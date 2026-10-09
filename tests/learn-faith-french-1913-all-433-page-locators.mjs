import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(p,"utf8"));
const printed=load("data/learn/ltfaith-pius-x-fr-1913-scan-page-candidates.v1.json");
const evidence=load("data/learn/ltfaith-pius-x-1913-french-print-page-evidence.v1.json");
const cross=load("data/learn/learn-the-faith-55-proposed-reconciliation-2026-10-09.v1.json");
assert.equal(printed.questionCount,433);
assert.equal(printed.pdfPageCount,165);
assert.equal(printed.entries.length,433);
assert.equal(printed.directOcrDetectedQuestionNumbers,414);
assert.equal(printed.ocrMissingQuestionNumbers.length,19);
assert.deepEqual(printed.photoVerifiedQuestionNumbers,[202,226,228,253,400]);
assert.equal(printed.entries.filter(e=>e.status.startsWith("VISUALLY")).length,5);
assert.equal(printed.entries.filter(e=>e.status.startsWith("OCR_NUMBER")).length,410);
assert.equal(printed.entries.filter(e=>e.status.startsWith("OCR_HEADING_MISSING")).length,18);
for(const [i,e] of printed.entries.entries()){
 const q=i+1;
 assert.equal(e.q,q);
 assert.ok(e.pdfPageOneIndexedCandidates.length>=1,"no page candidate for "+q);
 assert.ok(e.pdfPageOneIndexedCandidates.every(p=>p>=19&&p<=116));
 assert.ok(e.scanUrl.startsWith(printed.sourcePdf+"#page="));
 if(printed.ocrMissingQuestionNumbers.includes(q)&&!printed.photoVerifiedQuestionNumbers.includes(q))
   assert.ok(e.status.includes("INFERRED"),"missing-OCR page falsely verified Q"+q);
}
const expected=[[202,62],[226,68],[228,69],[253,75],[400,107]];
for(const [q,page] of expected){
 const x=printed.entries[q-1];
 assert.deepEqual(x.pdfPageOneIndexedCandidates,[page]);
 const photo=evidence.verifiedPageSamples.find(e=>e.question===q);
 assert.ok(photo);
 assert.equal(photo.pdfPageOneIndexed,page);
 assert.equal(photo.fullAnswerVisuallyRead,true);
}
assert.equal(evidence.verifiedPageSamples.length,5);
assert.equal(printed.all433PrintedAnswersVisuallyVerified,false);
assert.equal(printed.original1912ItalianPrintedFacsimileCollated,false);
assert.equal(printed.nativeFrenchEditorialApproved,false);
assert.equal(printed.publicationApproved,false);
assert.equal(cross.metrics.french1913PageLevelQuestionCollation,5);
assert.equal(cross.metrics.french1913AutomatedPageHeadingDetections,414);
assert.equal(cross.metrics.french1913BoundedQuestionPageCandidates,433);
assert.equal(cross.metrics.french1913PrintedQuestionAnswersStillNeedFullIndependentReview,428);
assert.equal(cross.publicationGate.frenchOriginalCollation,false);
assert.equal(cross.publicationGate.nativeFrenchEdit,false);
assert.equal(cross.publicationGate.canonicalReview,false);
console.log(JSON.stringify({status:"PASS",questionPageCandidates:433,ocrHeadings:414,boundedInferred:18,photoQaVerified:5,fullyCertified:0}));
