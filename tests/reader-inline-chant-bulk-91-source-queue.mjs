import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {build91InlineReviewQueue} from
 "../scripts/schola/build-91-inline-review-queue.mjs";
const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const coverage=read("../data/research/mass-music-1962-91-source-first-coverage.v1.json");
const batches=Array.from({length:6},(_,i)=>read(
 "../data/mass/chant-corpus/gr1961-proper-"+String(i+1).padStart(3,"0")+".json"));
const staged=read("../data/research/mass-music-1962-91-inline-review-queue.v1.json");
const rebuilt=build91InlineReviewQueue(coverage,batches);
assert.deepEqual(staged,rebuilt,"Staged queue drifted from pinned 1961/1962 witness sources");
assert.equal(staged.status,"SOURCE_RESEARCH_QUEUE_NOT_PUBLICATION");
assert.deepEqual(Object.entries(staged.counts).filter(([key])=>[
 "sourceEntries","sourceCandidateOccurrences","distinctCandidateScoreIds",
 "uniqueTextOccurrences","ambiguousVariantOccurrences","otherHolds",
 "publishedScores"].includes(key)).map(([k,v])=>[k,v]),[
 ["sourceEntries",471],["sourceCandidateOccurrences",397],
 ["distinctCandidateScoreIds",342],["uniqueTextOccurrences",355],
 ["ambiguousVariantOccurrences",19],["otherHolds",97],["publishedScores",0]
]);
assert.equal(staged.scoreReviewLeads.length,342);
assert.equal(staged.competingVariantHolds.length,19);
assert.equal(staged.unresolvedSectionHolds.length,97);
assert.equal(staged.scoreReviewLeads.filter(x=>x.uniqueTextOccurrences>0).length,315);
assert.equal(staged.scoreReviewLeads.filter(x=>x.ambiguousTextOccurrences>0).length,30);
assert.equal(staged.scoreReviewLeads.every(x=>
 !x.publicScore&&!x.printedNeumesVerified&&!x.sourceSelectedForCalendarMass),true);
assert.equal(staged.competingVariantHolds.every(x=>!x.publicScore),true);
assert.equal(staged.provenance.calendarMassesSelected,false);
assert.equal(staged.scoreReviewLeads[0].scoreId,"GREGOBASE-475");
const conflict=structuredClone(batches);
const bad=conflict.flatMap(b=>b.items).find(x=>x.id==="GREGOBASE-475");
assert.ok(bad,"Expected source score absent from archive");
bad.sha256="0".repeat(64);
assert.throws(()=>build91InlineReviewQueue(coverage,conflict),
 /ARCHIVED_SCORE_HASH_ROLE_OR_FOLIO_MISMATCH|SOURCE_ARCHIVE/);
assert.throws(()=>build91InlineReviewQueue({...coverage,sourceFiles:[]},batches),
 /SOURCE_91_ROSTER_INCOMPLETE/);
console.log("PASS 91 source witness crosswalk, 342 dedup score leads, 19 ambiguous variants, 97 holds, no public score");
