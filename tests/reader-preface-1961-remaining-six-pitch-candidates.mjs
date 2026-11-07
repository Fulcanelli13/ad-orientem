import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildPreface12PrintWorklist}
 from "../scripts/mass/export-preface-12-independent-print-worklist.mjs";
import {APPROVED_MASS_INLINE_GABC}
 from "../src/mass/reader-inline-chant-approved.js";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const first=read("../data/mass/preface-1961-first-six-print-pitch-candidates.v1.json");
const long=read("../data/mass/preface-1961-remaining-six-print-pitch-candidates.v1.json");
const source=buildPreface12PrintWorklist();
assert.equal(long.schema,"ao-1961-preface-six-long-response-printed-pitch-candidates-v1");
assert.deepEqual(long.counts,{additionalResponseSettings:6,additionalBookWitnessPointers:12,
 combinedResponseSettings:12,combinedBookWitnessPointers:24,
 distinctPlateURLsInThisBatch:4,sourceCandidatePitchConcordances:6,
 independentlyCertifiedNeumeShapes:0,independentlyCertifiedSolesmesMarks:0,
 newPublicApprovals:0});
assert.equal(first.rows.length,6);
assert.equal(long.rows.length,6);
assert.equal(APPROVED_MASS_INLINE_GABC.length,2);
const keys=new Set(first.rows.map(x=>x.sourceId+"|"+x.cueId));
for(const row of long.rows){
 const key=row.sourceId+"|"+row.cueId;
 assert.ok(!keys.has(key),"Repeated a previously inspected Preface response "+key);
 keys.add(key);
 const original=source.rows.find(s=>s.sourceId===row.sourceId&&s.cueId===row.cueId);
 assert.ok(original,"Printed-pitch candidate does not belong to a real source-exact response");
 const printed=row.firstVisualPrintPitchCandidates.map(x=>x.diatonicPitches);
 const sourced=original.sourceSyllableNoteGroups.map(x=>
  [...x.gabcNoteGroup.matchAll(/[a-m]/gu)].map(m=>m[0]));
 assert.deepEqual(printed,sourced,
  "First visual printed diatonic note reading conflicts with exact source GABC at "+key+
  " — investigate source print instead of automatically rewriting the evidence");
 assert.equal(row.printedClefReading,"C_CLEF_LINE_3__PROVISIONAL");
 assert.equal(row.originalPrintWitnesses.length,2);
 assert.deepEqual(row.originalPrintWitnesses.map(x=>x.plateUrl).sort(),
  original.printWitnesses.map(x=>x.url).sort());
 assert.ok(row.originalPrintWitnesses.every(x=>x.observation.includes("SECOND_REVIEW_PENDING")));
 assert.equal(row.secondReaderConfirmed,false);
 assert.equal(row.neumeGroupShapesCertified,false);
 assert.equal(row.printedRhythmicMarksCertified,false);
 assert.equal(row.publicScoreApproved,false);
 assert.equal(row.publicationDecision,"DO_NOT_PUBLISH");
 for(const witness of row.originalPrintWitnesses.filter(x=>x.book.startsWith("Graduale"))){
  assert.equal(witness.largerCopy,
   "https://media.churchmusicassociation.org/pdf/kyriale-solesmes.pdf");
  assert.ok([133,134].includes(witness.largerCopyPdfPageOneBased));
 }
}
assert.equal(keys.size,12,"All 12 original Preface response settings should have provisional pitch reviews");
for(const cue of ["AO.SM.C0140","AO.SM.C0143"]){
 const melodicVariants=long.rows.filter(x=>x.cueId===cue);
 assert.equal(melodicVariants.length,3);
 assert.equal(new Set(melodicVariants.map(x=>
  x.firstVisualPrintPitchCandidates.map(g=>g.diatonicPitches.join("")).join("|"))).size,3,
  "All three settings differ musically, even though the printed Latin is identical");
}
assert.ok(long.clarification.includes("not square-head counts"));
console.log("PASS 12/12 provisional 1961 Preface printed pitch readings, 24 witness pointers, three distinct non-Amen tone families, 0 public score approvals");
