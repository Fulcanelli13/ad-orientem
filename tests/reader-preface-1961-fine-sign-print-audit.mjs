import assert from "node:assert/strict";
import {buildPreface12PrintWorklist} from "../scripts/mass/export-preface-12-independent-print-worklist.mjs";
import {buildPreface12FineSignAudit,preface12FineSignCsv,PREFACE_SIGN_REVIEW_SCHEMA}
 from "../scripts/mass/export-preface-12-fine-sign-print-audit.mjs";
import {APPROVED_MASS_INLINE_GABC}
 from "../src/mass/reader-inline-chant-approved.js";
const d=buildPreface12FineSignAudit();
const original=buildPreface12PrintWorklist();
assert.equal(d.schema,PREFACE_SIGN_REVIEW_SCHEMA);
assert.equal(d.rows.length,12);
assert.equal(d.counts.responseSettings,12);
assert.equal(d.counts.printedBookWitnesses,24);
assert.equal(d.counts.independentlyVerifiedSignChecks,0);
assert.equal(d.counts.independentlyCertifiedResponses,0);
assert.equal(d.counts.newPublicApprovals,0);
assert.equal(APPROVED_MASS_INLINE_GABC.length,2);
assert.equal(d.counts.alternativeSignConflicts,1);
assert.equal(d.counts.alternativeConflictPrintChecks,2);
assert.ok(d.counts.sourceSignOccurrences>=20,"Solesmes marks must not be silently lost");
assert.equal(d.counts.sourceSignPrintChecks,d.counts.sourceSignOccurrences*2);
for(const kind of ["DOUBLE_PUNCTUM_MORA","PUNCTUM_MORA","QUILISMA",
 "ZERO_WIDTH_NEUME_BOUNDARY","DIMINUTIVE_LIQUESCENCE"])
 assert.ok(d.counts.sourceMarkTypes.includes(kind),"Missing mark category: "+kind);
const sourceIds=new Set();
let signCount=0;
for(const row of d.rows){
 const originalRow=original.rows.find(x=>x.scoreId===row.scoreId);
 assert.ok(originalRow,"Every sign must belong to an existing canonical source score");
 assert.equal(row.published,false);
 assert.equal(row.publicScoreApproved,false);
 assert.equal(row.editorialDecision,"RESEARCH_HOLD");
 assert.equal(row.independentPrintedSignCertification,"NONE");
 assert.equal(row.syllables.length,originalRow.sourceSyllableNoteGroups.length);
 assert.equal(row.cadenceBar.printedBarShape,"NOT_CERTIFIED");
 sourceIds.add(row.sourceId);
 for(const [i,syllable] of row.syllables.entries()){
  assert.equal(syllable.syllableIndex,i);
  assert.equal(syllable.sourceGabcNoteGroup,originalRow.sourceSyllableNoteGroups[i].gabcNoteGroup);
  assert.ok(syllable.pitchedLetters.length>0);
  for(const sign of syllable.signs){
   signCount++;
   assert.ok(sign.signId.startsWith(row.scoreId+".S"+i+".M"));
   assert.equal(sign.printChecks.length,2);
   assert.deepEqual(sign.printChecks.map(x=>x.imageUrl).sort(),
    originalRow.printWitnesses.map(x=>x.url).sort());
   assert.ok(sign.printChecks.every(x=>x.printGlyphObserved===null&&
    x.signShapeConfirmed===false&&x.reviewer===null&&x.visualEvidenceCrop===null&&
    x.comparisonStatus==="PENDING_INDEPENDENT_VISUAL_SIGN_TRANSCRIPTION"));
   assert.ok(["RHYTHMIC_SIGN","NEUME_SHAPE","GROUPING"].includes(sign.domain));
   if(sign.symbol==="!")assert.equal(sign.kind,"ZERO_WIDTH_NEUME_BOUNDARY");
   if(sign.symbol==="..")assert.equal(sign.kind,"DOUBLE_PUNCTUM_MORA");
  }
 }
 if(row.alternateSignConflict){
  const c=row.alternateSignConflict;
  assert.equal(row.sourceId,4451);
  assert.equal(row.cueId,"AO.SM.C0138");
  assert.equal(c.phraseSyllable,"spí");
  assert.equal(c.sourceNoteGroup,"g");
  assert.equal(c.alternativeNoteGroup,"g'");
  assert.equal(c.currentVisualReading,"INDETERMINATE_AT_AVAILABLE_SCAN_RESOLUTION");
  assert.equal(c.sourceSignPresent,false);
  assert.equal(c.alternativeSignPresent,true);
  assert.equal(c.printChecks.length,2);
  assert.ok(c.printChecks.every(x=>x.comparisonStatus==="PRINTED_ICTUS_NOT_YET_RESOLVED"));
 }
}
assert.deepEqual([...sourceIds].sort(),[4449,4450,4451]);
assert.equal(signCount,d.counts.sourceSignOccurrences);
assert.equal(d.visualJudgment.includes("No print sign has been independently certified"),true);
const csv=preface12FineSignCsv().trimEnd().split("\n");
assert.equal(csv.length,1+d.counts.sourceSignPrintChecks+d.counts.alternativeConflictPrintChecks);
assert.ok(csv.at(-1).includes("SOURCE_ABSENT_ALT_PRESENT")||csv.some(x=>x.includes("SOURCE_ABSENT_ALT_PRESENT")));
console.log("PASS "+d.counts.sourceSignOccurrences+" original GABC sign positions, "+
 d.counts.sourceSignPrintChecks+" print-sign review slots + 2 unresolved ictus inspection slots; "+
 "no sign or melody certified and 0 public promotions");
