import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildPreface12PrintWorklist}
 from "../scripts/mass/export-preface-12-independent-print-worklist.mjs";
import {APPROVED_MASS_INLINE_GABC} from "../src/mass/reader-inline-chant-approved.js";
const data=JSON.parse(readFileSync(new URL(
 "../data/mass/preface-1961-printed-phrase-observations.v1.json",import.meta.url),"utf8"));
const master=buildPreface12PrintWorklist();
const norm=str=>String(str??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .toLowerCase().replaceAll("j","i").replaceAll("℟","")
 .replace(/[^a-z0-9]+/g,"");
assert.equal(data.schema,"ao-preface-1961-independent-printed-phrase-visual-preflight-v1");
assert.deepEqual(data.counts,{responseTonePairs:12,originalBookWitnesses:24,
 distinctPrintedPages:5,independentPrintedPhraseReadings:24,amenMotifPreflights:6,
 independentMusicalCertifications:0,newPublicApprovals:0});
assert.equal(master.rows.length,12);
assert.equal(data.witnessReadings.length,24);
assert.equal(new Set(data.witnessReadings.map(x=>x.printedWitness.plateUrl)).size,5);
assert.equal(APPROVED_MASS_INLINE_GABC.length,2);
assert.ok(!data.witnessReadings.some(x=>x.publicScoreApproved||x.musicalParity!=="NOT_CERTIFIED"));
assert.equal(data.rubricalPrintEvidence.solemn.rubricGroups.length,6);
assert.equal(data.rubricalPrintEvidence.ferial.rubricGroups.length,5);
assert.equal(data.rubricalPrintEvidence.solemnior.automaticUseAuthorized,false);
for(const source of master.rows){
 const observed=data.witnessReadings.filter(x=>x.sourceId===source.sourceId&&x.cueId===source.cueId);
 assert.equal(observed.length,2,"Both original printed books must be inspected: "+source.scoreId);
 assert.deepEqual(observed.map(x=>x.printedWitness.plateUrl).sort(),
  source.printWitnesses.map(x=>x.url).sort(),"Actual plate references changed for "+source.scoreId);
 assert.ok(observed.every(x=>norm(x.printedReading)===norm(source.sourceLatin)),
  "Printed phrase text deviates from source Latin, allowing accent/hyphen and j/i orthography");
 assert.ok(observed.every(x=>x.independentPrintedPitchTranscription===null&&
  x.independentPrintedNeumeTranscription===null&&
  x.independentPrintedRhythmicSignTranscription===null&&
  x.musicalParity==="NOT_CERTIFIED"&&x.publicationDecision==="DO_NOT_PUBLISH"));
 const isAmen=source.cueId==="AO.SM.C0136";
 assert.ok(observed.every(x=>x.inspectionStatus===(isAmen?
  "PRINTED_AMEN_MOTIF_LOCATED":"PRINTED_PHRASE_TEXT_LOCATED")));
}
const forms=data.witnessReadings.filter(x=>x.cueId==="AO.SM.C0143");
assert.equal(forms.length,6);
assert.ok(forms.every(x=>x.printedOrthography==="PRINTED_JUSTUM__READER_IUSTUM"));
assert.ok(data.rubricalPrintEvidence.ferial.rubricGroups.some(x=>x.key==="COMMEMORATION"));
assert.ok(data.rubricalPrintEvidence.ferial.rubricGroups.some(x=>x.key==="MASSES_FOR_THE_DEAD"));
assert.ok(data.rubricalPrintEvidence.solemn.rubricGroups.some(x=>x.key==="OCTAVE"));
console.log("PASS 24 printed Preface phrase readings across 5 facsimiles, 6 preliminary Amen motif inspections, 11 independently read GR rubrical categories; 0 neume parity certifications");
