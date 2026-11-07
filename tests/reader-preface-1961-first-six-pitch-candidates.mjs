import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildPreface12PrintWorklist}
 from "../scripts/mass/export-preface-12-independent-print-worklist.mjs";
import {APPROVED_MASS_INLINE_GABC} from "../src/mass/reader-inline-chant-approved.js";
const evidence=JSON.parse(readFileSync(new URL(
 "../data/mass/preface-1961-first-six-print-pitch-candidates.v1.json",
 import.meta.url),"utf8"));
const source=buildPreface12PrintWorklist();
assert.equal(evidence.schema,"ao-1961-preface-six-short-response-printed-pitch-candidates-v1");
assert.deepEqual(evidence.counts,{
 shortResponseMelodies:6,printedWitnessPointers:12,printedBooks:2,
 uniqueSourcePlates:5,sourceCandidatePitchConcordances:6,
 secondReviewerConfirmed:0,rhythmicSignCertifications:0,
 fullNeumeCertifications:0,newPublicApprovals:0
});
assert.equal(evidence.rows.length,6);
assert.equal(APPROVED_MASS_INLINE_GABC.length,2);
const uniquePages=new Set(),sourceIds=new Set();
for(const row of evidence.rows){
 sourceIds.add(row.sourceId);
 const original=source.rows.find(x=>x.sourceId===row.sourceId&&x.cueId===row.cueId);
 assert.ok(original,"Independent printed candidate does not have a canonically sourced original phrase");
 assert.equal(row.witnessChecks.length,2);
 const fromPrint=row.independentlyReadPrintedPitchCandidates.map(x=>x.diatonicPitches);
 const sourcePitches=original.sourceSyllableNoteGroups.map(x=>
  [...x.gabcNoteGroup.matchAll(/[a-m]/gu)].map(m=>m[0]));
 assert.deepEqual(fromPrint,sourcePitches,
  "Independently READ 1961 print pitch candidate differs from the ORIGINAL GABC; investigate, do not auto-repair");
 assert.equal(row.printedClefReading,"C_CLEF_LINE_3__PROVISIONAL");
 assert.equal(row.secondIndependentReview,false);
 assert.equal(row.noteShapeParity,"UNVERIFIED");
 assert.equal(row.rhythmicSignParity,"UNVERIFIED");
 assert.equal(row.publicScoreApproved,false);
 assert.equal(row.decision,"HOLD_FOR_SECOND_VISUAL_REVIEW");
 for(const w of row.witnessChecks){
  uniquePages.add(w.plateUrl);
  assert.ok(original.printWitnesses.some(s=>s.url===w.plateUrl));
  assert.equal(w.observerStatus,"FIRST_VISUAL_PITCH_CANDIDATE");
  assert.ok(w.printLegibility.includes("MARKS_NOT_CERTIFIED"));
  if(w.book.startsWith("Graduale")){
   assert.equal(w.higherResolutionPdfUrl,
    "https://media.churchmusicassociation.org/pdf/kyriale-solesmes.pdf");
   assert.ok([132,133,134].includes(w.higherResolutionPdfPageOneBased));
  }else assert.equal(w.higherResolutionPdfUrl,undefined);
 }
}
assert.equal(uniquePages.size,5);
assert.deepEqual([...sourceIds].sort(),[4449,4450,4451]);
for(const cue of ["AO.SM.C0136","AO.SM.C0138"]){
 const families=evidence.rows.filter(x=>x.cueId===cue);
 assert.equal(families.length,3);
 const melodies=new Set(families.map(x=>JSON.stringify(
  x.independentlyReadPrintedPitchCandidates.map(g=>g.diatonicPitches))));
 assert.equal(melodies.size,cue==="AO.SM.C0136"?1:3,
  "The 1961 texts share Amen pitches but Et cum has three independent melodies");
}
assert.equal(evidence.rows.filter(x=>x.cueId==="AO.SM.C0136").length,3);
assert.ok(evidence.auditMethod.includes("Direct visual reading"));
assert.ok(evidence.criticalLimit.includes("not independent certification"));
console.log("PASS first six 1961 Preface printed diatonic pitch-candidate sequences across 12 book witness pointers; 0 fully certified scores, 2 existing public Ite VIII only");
