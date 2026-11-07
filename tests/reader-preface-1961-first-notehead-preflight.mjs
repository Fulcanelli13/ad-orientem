// Regression over observations made from the PRINTED plates, never from a GABC
// pseudo-print. Notehead-count agreement cannot certify pitch or rhythm.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildPreface12PrintWorklist}
 from "../scripts/mass/export-preface-12-independent-print-worklist.mjs";
import {APPROVED_MASS_INLINE_GABC} from "../src/mass/reader-inline-chant-approved.js";
const evidence=JSON.parse(readFileSync(new URL(
 "../data/mass/preface-1961-initial-notehead-preflight.v1.json",
 import.meta.url),"utf8"));
const master=buildPreface12PrintWorklist();
assert.equal(evidence.schema,"ao-1961-preface-first-12-independent-printed-notehead-preflight-v1");
assert.deepEqual(evidence.count,{responsesPreflighted:6,witnessComparisons:12,
 books:2,distinctPrintedPagePlates:5,printNoteheadCountPreflights:12,
 independentPitchCertifications:0,independentRhythmicCertifications:0,newPublicApprovals:0});
assert.equal(evidence.rows.length,12);
assert.equal(new Set(evidence.rows.map(x=>x.printedWitnessUrl)).size,5);
assert.equal(APPROVED_MASS_INLINE_GABC.length,2);
assert.ok(evidence.rows.every(x=>x.pitchParity==="NOT_CERTIFIED"&&
 x.solesmesMarkParity==="NOT_CERTIFIED"&&
 x.exactNeumeIdentity==="NOT_CERTIFIED"&&
 x.observedFromPrint==="PRELIMINARY_SQUARE_NOTEHEAD_COUNT_ONLY"));
const countNotes=s=>(s.match(/[a-m]/g)||[]).length;
for(const cueId of ["AO.SM.C0136","AO.SM.C0138"]){
 for(const [tone,sourceId] of [["SOLEMN",4449],["FERIAL",4450],["SOLEMNIOR",4451]]){
  const row=master.rows.find(x=>x.sourceId===sourceId&&x.cueId===cueId);
  assert.ok(row,"Missing source GABC melody "+tone+" "+cueId);
  const observed=evidence.rows.filter(x=>x.sourceId===sourceId&&x.cueId===cueId);
  assert.equal(observed.length,2,"Both original 1961 books must be inspected");
  const expected=row.sourceSyllableNoteGroups.map(s=>countNotes(s.gabcNoteGroup));
  assert.ok(expected.every(n=>n>0));
  for(const witness of observed){
   assert.deepEqual(witness.visibleSyllableNoteheadCounts,expected,
     "A printed notehead count visibly differs from the GABC source: "+tone+" "+cueId+" "+witness.book);
   assert.ok(row.printWitnesses.some(x=>x.url===witness.printedWitnessUrl));
   assert.equal(witness.noteheadCountAgreementWithSourceGabc,"TO_BE_RECHECKED_BY_MACHINE");
   if(witness.book.startsWith("Graduale")){
    assert.ok(witness.independentPdfWitness?.url.endsWith("/kyriale-solesmes.pdf"));
    assert.ok([132,133,134].includes(witness.independentPdfWitness.pdfPageOneBased));
   }else assert.equal(witness.independentPdfWitness,null);
  }
 }
}
const amen=evidence.rows.filter(x=>x.cueId==="AO.SM.C0136");
assert.equal(amen.length,6);
assert.ok(amen.every(x=>JSON.stringify(x.visibleSyllableNoteheadCounts)==="[1,2]"));
const reply=evidence.rows.filter(x=>x.cueId==="AO.SM.C0138");
assert.equal(reply.length,6);
const totals=Object.fromEntries(["SOLEMN","FERIAL","SOLEMNIOR"].map(t=>[
 t,reply.find(x=>x.tone===t).visibleSyllableNoteheadCounts.reduce((a,b)=>a+b,0)]));
assert.deepEqual(totals,{SOLEMN:8,FERIAL:7,SOLEMNIOR:9});
assert.ok(evidence.caveats.some(x=>x.includes("not imply")));
console.log("PASS 12 first-pass 1961 printed notehead-count comparisons (six melodies, two books); distinct 8/7/9 Et cum settings; zero certified pitch, rhythm or new public score");
