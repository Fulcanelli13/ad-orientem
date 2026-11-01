import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditM10ReassignmentEvidence,promoteM10CandidateToMass}
 from "../src/mass/reader-m10-reassignment-evidence.js";

const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const batches=Array.from({length:6},(_,i)=>
 read("data/research/mass-music-m10-weak-reassignment-00"+(i+1)+".v1.json"));
const m09Batches=Array.from({length:6},(_,i)=>
 read("data/research/mass-music-m09-1962-line-qa-00"+(i+1)+".v1.json"));
const m07Batches=Array.from({length:6},(_,i)=>
 read("data/research/mass-music-m07-gr1961-review-00"+(i+1)+".v1.json"));
const args={batches,m09Batches,m07Batches};
const audit=auditM10ReassignmentEvidence(args);
assert.equal(audit.status,"EVIDENCE_CLASSIFIED_REASSIGNMENT_RESEARCH_ONLY",
 JSON.stringify(audit));
assert.equal(audit.originalWeakOccurrences,99);
assert.equal(audit.originalDistinctScoreIds,54);
assert.equal(audit.weakWithExistingSameRoleAlternatives,54);
assert.equal(audit.weakWithNoSameRoleAlternative,45);
assert.equal(audit.alternativeTextRelationships,114);
assert.equal(audit.sourceCasesWithMultipleAlternatives,17);
assert.deepEqual({...audit.evidenceClasses},{
 SAME_INITIAL_WORD_BUT_DIFFERENT_CONTINUATION:8,
 DIFFERENT_OPENING_WITHOUT_SECURE_OVERLAP:65,
 NONINITIAL_OR_DISCONTINUOUS_OVERLAP:26
});
assert.deepEqual({...audit.roles},{gr:14,tr:21,in:25,al:27,of:4,co:8});
assert.equal(audit.automaticReassignments,0);
assert.equal(audit.publicScores,0);
assert.equal(audit.printed1961NoteByNoteVerified,0);
assert.equal(audit.full1962MassRoleVerified,0);
const residual=read("data/research/mass-music-m10-residual45-priority.v1.json");
assert.equal(residual.schema,"ao-mass-music-m10-remaining45-research-queue-v1");
assert.equal(residual.count,45);
assert.equal(residual.distinctOriginalScoreIds,28);
assert.equal(residual.preGospelOccurrences,43);
assert.deepEqual(residual.byRole,{tr:17,al:16,gr:10,of:1,co:1});
assert.equal(residual.editorialApproval,false);
assert.equal(residual.automaticScoreReassignment,false);
assert.equal(residual.records.length,45);
assert.equal(new Set(residual.records.map(x=>x.id)).size,28);
assert.ok(residual.records.every(x=>x.declaredMissingInPrintedBook===false));
assert.ok(residual.records.every(x=>x.scoreRejected===false));
assert.ok(residual.records.every(x=>x.readyForPublicReader===false));
const unresolved=batches.flatMap(b=>b.records).filter(x=>x.alternativeCount===0);
assert.deepEqual(
 residual.records.map(x=>[x.id,x.sourcePath,x.sourceBlobSha,x.originalScoreSha256])
 .sort((a,b)=>a.join(":").localeCompare(b.join(":"))),
 unresolved.map(x=>[x.id,x.sourcePath,x.sourceBlobSha,x.originalScoreSha256])
 .sort((a,b)=>a.join(":").localeCompare(b.join(":"))),
 "45 unresolved source records must remain complete and source-identical"
);
const all=batches.flatMap(b=>b.records);
assert.equal(all.length,99);
const alternativeFor=(sourceId,path)=>all.find(e=>e.id===sourceId&&e.sourcePath===path);
const first=alternativeFor("GREGOBASE-38","Tempora/Pent05-0");
assert.ok(first,"Known Gradual source gap missing");
assert.ok(first.alternatives.some(x=>x.scoreId==="GREGOBASE-1226"&&
 x.matchClass==="COMPLETE_DONOR_LINE_CONTIGUOUS"));
const other=alternativeFor("GREGOBASE-230","Tempora/Pent14-0");
assert.ok(other?.alternatives.some(x=>x.scoreId==="GREGOBASE-868"&&
 x.matchClass==="COMPLETE_DONOR_LINE_CONTIGUOUS"));
assert.ok(all.every(x=>x.scorePublished===false&&x.scoreUserApproved===false));
assert.ok(all.every(x=>x.selected1962MassMatch==="UNVERIFIED"));
assert.ok(all.every(x=>x.alternatives.every(y=>y.role===x.sourceRole)));
assert.ok(all.some(x=>x.sourceRole==="tr"&&x.alternatives.length===0));
assert.ok(all.some(x=>x.alternatives.length>1));
const clone=x=>JSON.parse(JSON.stringify(x));
{
 const tampered=clone(batches);tampered[0].records[0].sourceBlobSha="0".repeat(40);
 assert.equal(auditM10ReassignmentEvidence({...args,batches:tampered}).status,
 "SOURCE_OR_EDITORIAL_HOLD");
}
{
 const tampered=clone(batches);const row=tampered.flatMap(b=>b.records)
  .find(x=>x.alternatives.length);
 row.alternatives[0].sourceSha256="0".repeat(64);
 assert.equal(auditM10ReassignmentEvidence({...args,batches:tampered}).reason,
 "ALTERNATIVE_SCORE_ROLE_HASH_OR_LATIN_EVIDENCE_INVALID");
}
{
 const tampered=clone(batches);const row=tampered.flatMap(b=>b.records)
  .find(x=>x.alternatives.length);
 row.alternatives[0].role=row.sourceRole==="gr"?"co":"gr";
 assert.equal(auditM10ReassignmentEvidence({...args,batches:tampered}).reason,
 "ALTERNATIVE_SCORE_ROLE_HASH_OR_LATIN_EVIDENCE_INVALID");
}
{
 const tampered=clone(batches);const row=tampered.flatMap(b=>b.records)
  .find(x=>x.alternatives.length);
 row.alternatives[0].matchedNormalizedLatin="fake chant";
 assert.equal(auditM10ReassignmentEvidence({...args,batches:tampered}).status,
 "SOURCE_OR_EDITORIAL_HOLD");
}
{
 const tampered=clone(batches);const row=tampered.flatMap(b=>b.records)
  .find(x=>x.alternatives.length);
 row.scoreUserApproved=true;
 assert.equal(auditM10ReassignmentEvidence({...args,batches:tampered}).status,
 "SOURCE_OR_EDITORIAL_HOLD");
}
assert.equal(promoteM10CandidateToMass({
 originalId:"GREGOBASE-38",alternateId:"GREGOBASE-1226",verified:true},
 {printedMusicVerified:true,selectedMass:true},
 {userEditorialDecision:"APPROVED"}),null);
const reader=readFileSync(new URL("../src/mass/reader-schola-event-timeline.js",import.meta.url),"utf8");
assert.doesNotMatch(reader,/reader-m10-reassignment-evidence/);
console.log("PASS M10 99 weak donor occurrences / 54 text-reassignment leads / 114 candidate relations; no auto-publication");
