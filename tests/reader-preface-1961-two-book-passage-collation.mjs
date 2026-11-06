import assert from "node:assert/strict";
import {PARTICIPATION_REFERENCE_SCORES} from "../src/mass/reader-participation-reference-scores.js";
import {printedPlatesForParticipationScore} from "../src/mass/reader-participation-printed-plates.js";
import {PREFACE_1961_PRINTED_PASSAGES,printedPassageForPrefaceScore,
 comparePrefaceToneFormulae,PREFACE_PRINTED_PASSAGE_SCHEMA}
 from "../src/mass/reader-preface-1961-print-passage.js";
import {buildParticipationScoreReviewCsv} from "../scripts/mass/export-24-participation-review-csv.mjs";
assert.equal(PREFACE_PRINTED_PASSAGE_SCHEMA,"ao-preface-eight-responses-two-1961-books-v1");
assert.equal(PREFACE_1961_PRINTED_PASSAGES.length,8);
assert.equal(new Set(PREFACE_1961_PRINTED_PASSAGES.map(x=>x.scoreId)).size,8);
const expectedCues=["AO.SM.C0136","AO.SM.C0138","AO.SM.C0140","AO.SM.C0143"];
const expectedIndex=[1,3,5,7];
for(const sourceId of [4449,4450]){
 const rows=PREFACE_1961_PRINTED_PASSAGES.filter(x=>x.sourceId===sourceId);
 assert.deepEqual(rows.map(x=>x.cueId),expectedCues);
 assert.deepEqual(rows.map(x=>x.originalGabcPhraseIndex),expectedIndex);
 const family=sourceId===4449?"SOLEMN":"FERIAL";
 const section=sourceId===4449?"1. Tonus solemnis":"2. Tonus ferialis";
 const witness=printedPlatesForParticipationScore(sourceId);
 for(const [index,row] of rows.entries()){
  assert.equal(row.family,family);
  assert.equal(row.sectionTitle,section);
  assert.equal(row.printedSourceSectionLocated,true);
  assert.equal(row.printNeumeByNeumeComparison,"PENDING_INDEPENDENT_EDITORIAL_COLLATION");
  assert.equal(row.reviewerDecision,"UNREVIEWED");
  assert.equal(row.publicScoreApproved,false);
  assert.equal(row.originalGabcPhraseAudit,"SOURCE_GABC_PHRASE_EXACT");
  const source=PARTICIPATION_REFERENCE_SCORES.find(x=>x.id===row.scoreId);
  assert.equal(source.sourceId,sourceId);
  assert.equal(source.sourcePhraseIndex,index*2+1);
  assert.deepEqual(source.sourceCueIds,[row.cueId]);
  assert.equal(source.publicScoreApproved,false);
  assert.equal(row.printWitnesses.length,2);
  assert.ok(row.printWitnesses.every(x=>witness.plates.some(p=>p.url===x.url)));
  assert.equal(row.printWitnesses[0].url,"https://gregobase.selapa.net/sources/3/220.png");
  const grPage=sourceId===4449&&index===0?"2/1007.png":"2/1008.png";
  assert.equal(row.printWitnesses[1].url,
    "https://gregobase.selapa.net/sources/"+grPage);
  assert.equal(row.printWitnesses[1].page,grPage==="2/1007.png"?"130*":"131*");
 }
}
const pairs=comparePrefaceToneFormulae();
assert.equal(pairs.length,4);
assert.deepEqual(pairs.map(x=>x.cueId),expectedCues);
assert.deepEqual(pairs.map(x=>x.identicalGabc),[true,false,false,false],
 "Printed Solemn/Ferial Amen coincides, but three further response formulas are different");
assert.ok(pairs.every(x=>x.printNeumeVerification==="NOT_CERTIFIED"));
assert.ok(pairs.every(x=>x.printedSourceToneSelectionDistinct));
assert.equal(printedPassageForPrefaceScore("AO.REF.ORATIONS_FESTIVE.0071"),null);
assert.equal(printedPassageForPrefaceScore("AO.REF.PREFACE_SOLEMN.0140")?.originalGabcPhraseIndex,5);
const csv=buildParticipationScoreReviewCsv();
assert.equal(csv.trim().split("\n").length,25);
assert.match(csv.split("\n")[0],/printed_preface_phrase_location/);
assert.equal((csv.match(/https:\/\/gregobase\.selapa\.net\/sources\/2\/1007\.png/g)||[]).length,1);
assert.equal((csv.match(/https:\/\/gregobase\.selapa\.net\/sources\/2\/1008\.png/g)||[]).length,7);
assert.equal((csv.match(/https:\/\/gregobase\.selapa\.net\/sources\/3\/220\.png/g)||[]).length,8);
assert.ok(!csv.includes("USER_AND_MUSICAL_SOURCE_REVIEWED"));
console.log("PASS 8 Preface response locations in LU 109 and GR 130*/131*; 4 tune-pair distinctions; no facsimile-neume/public certification");
