import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {reconcileGradualeFirst200,FIRST200_RECONCILIATION_SCHEMA} from "../tools/mass/reconcile-gr1961-first200-latin-sources.mjs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const index=JSON.parse(read("data/mass/chant-corpus/gr1961-proper-index.json"));
const batchText=read("data/mass/chant-corpus/gr1961-proper-001.json");
const batch=JSON.parse(batchText);
const witness=JSON.parse(read("data/mass/chant-corpus/gr1961-first200-latin-witness-screen.v1.json"));
const saved=read("data/mass/chant-corpus/gr1961-first200-source-review.v1.json");
const inputs={index,batch,batchText,witness};
const report=reconcileGradualeFirst200(inputs);
assert.equal(saved,JSON.stringify(report,null,2)+"\n","The 200-row review report must be reproducible byte for byte");
assert.equal(report.schema,FIRST200_RECONCILIATION_SCHEMA);
assert.deepEqual(report.summary,{
  candidateRecords:46,sourceSectionCandidates:27,
  preGospelSegmentUnresolved:19,
  repeatedAcrossDifferentProperSources:8,
  noOccurrenceWithinLimitedSourceSet:154,
  sourceFilesRead:106,latinSourceOccurrences:61,
  stagedRecords:200,canonicalRuntimeVerified:0,facsimileApproved:0,readerPromotions:0,
});
assert.equal(report.records.length,200);
assert.equal(new Set(report.records.map(x=>x.gregobaseId)).size,200);
assert.equal(new Set(witness.sourceFiles.map(x=>x.path)).size,106);
assert.ok(witness.sourceFiles.every(x=>x.status==="READ"&&/^[a-f0-9]{40}$/.test(x.blobSha)));
assert.ok(report.records.every(x=>
 x.editorialApproval==="NOT_GRANTED"&&
 x.canonicalReaderProperMatch==="NOT_YET_VERIFIED"&&
 x.editionFacsimileReview==="NOT_YET_VERIFIED"));
assert.equal(report.records.find(x=>x.gregobaseId===132).status,"LATIN_SOURCE_SECTION_CANDIDATE");
assert.equal(report.records.find(x=>x.gregobaseId===1).status,"PRE_GOSPEL_SEGMENT_UNRESOLVED");
assert.equal(report.records.find(x=>x.gregobaseId===210).multiplePossibleProperSources,true);
assert.ok(report.records.find(x=>x.gregobaseId===210).evidenceFiles.includes("Sancti/12-08"));
assert.equal(report.records.find(x=>x.gregobaseId===3).status,"NO_OCCURRENCE_WITHIN_LIMITED_WITNESS_SET");
assert.match(report.warning,/not absent from the Missal/);
assert.throws(()=>reconcileGradualeFirst200({...inputs,
 witness:{...witness,latinWitnessCommit:"untrusted"}}),/Pinned Latin/);
assert.throws(()=>reconcileGradualeFirst200({...inputs,
 witness:{...witness,sourceFiles:[
  {...witness.sourceFiles[0],blobSha:"notsha"},...witness.sourceFiles.slice(1)
 ]}}),/unsigned Latin source/);
assert.throws(()=>reconcileGradualeFirst200({...inputs,
 witness:{...witness,candidateOccurrences:[
  {...witness.candidateOccurrences[0],officePart:"co"},...witness.candidateOccurrences.slice(1)
 ]}}),/source-misaligned/);
assert.throws(()=>reconcileGradualeFirst200({...inputs,
 witness:{...witness,candidateOccurrences:[
  {...witness.candidateOccurrences[0],latinExcerpt:"Completely unrelated fabricated passage"},
  ...witness.candidateOccurrences.slice(1)
 ]}}),/source-misaligned/);
assert.throws(()=>reconcileGradualeFirst200({...inputs,
 batch:{...batch,items:[{...batch.items[0],gabc:"tampered"},...batch.items.slice(1)]}}),
 /Unverified historical GABC/);
assert.throws(()=>reconcileGradualeFirst200({...inputs,batchText:batchText+" "}),
 /digest mismatch/);
for(const path of ["src/mass/reader-dom.js","src/mass/reader-chant-score-pilot.js",
 "src/mass/reader-proper-chant-crosswalk.js","src/mass/mass-chant-programme.js"]){
 assert.doesNotMatch(read(path),/gr1961-first200-source-review|first200-latin-witness-screen/,
  "Source-screen candidates must not be imported into the live Mass reader");
}
console.log("PASS 200 staged GABCs vs 106 pinned Latin witnesses; 46 candidates, 19 segmented pending, 0 releases");
