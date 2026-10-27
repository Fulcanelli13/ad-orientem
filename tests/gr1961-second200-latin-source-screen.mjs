import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {reconcileSecond200} from "../tools/mass/reconcile-gr1961-second200-latin-sources.mjs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const inputs={
 index:JSON.parse(read("data/mass/chant-corpus/gr1961-proper-index.json")),
 batch:JSON.parse(read("data/mass/chant-corpus/gr1961-proper-002.json")),
 batchText:read("data/mass/chant-corpus/gr1961-proper-002.json"),
 witness:JSON.parse(read("data/mass/chant-corpus/gr1961-second200-latin-witness-screen.v1.json")),
 previousWitness:JSON.parse(read("data/mass/chant-corpus/gr1961-first200-latin-witness-screen.v1.json")),
};
const saved=read("data/mass/chant-corpus/gr1961-second200-source-review.v1.json");
const report=reconcileSecond200(inputs);
assert.equal(saved,JSON.stringify(report,null,2)+"\n");
assert.deepEqual(report.summary,{
 stagedRecords:200,sourceFilesRead:106,sourceLineOccurrences:85,candidateRecords:56,
 sourceSectionCandidates:28,preGospelSegmentUnresolved:28,
 noOccurrenceWithinLimitedSourceSet:120,incipitNotSearchable:24,
 repeatedAcrossProperSources:12,recordsWithEmbeddedHits:10,
 recordsWithNonOpeningIntroitHits:10,canonicalRuntimeVerified:0,
 facsimileApproved:0,readerPromotions:0,
});
assert.equal(new Set(report.records.map(x=>x.id)).size,200);
assert.ok(report.records.every(x=>x.editorialApproval==="NOT_GRANTED"));
assert.throws(()=>reconcileSecond200({...inputs,
 batchText:inputs.batchText+" "}),/identity failed/);
assert.throws(()=>reconcileSecond200({...inputs,
 witness:{...inputs.witness,sourceFiles:[
  {...inputs.witness.sourceFiles[0],blobSha:"invalid"},
  ...inputs.witness.sourceFiles.slice(1)]}}),/not pinned/);
assert.throws(()=>reconcileSecond200({...inputs,
 witness:{...inputs.witness,candidateOccurrences:[
  {...inputs.witness.candidateOccurrences[0],sourceText:"Completely different words"},
  ...inputs.witness.candidateOccurrences.slice(1)]}}),/Unsupported/);
for(const path of ["src/mass/reader-dom.js","src/mass/reader-chant-score-pilot.js",
 "src/mass/reader-proper-chant-crosswalk.js"]){
 assert.doesNotMatch(read(path),/gr1961-second200-latin-witness-screen|gr1961-second200-source-review/,
  "Research candidate metadata must not be runtime imported");
}
console.log("PASS GR1961 next 200 archived chants: 106 witnessed sources, 56 candidates, no promotions");
