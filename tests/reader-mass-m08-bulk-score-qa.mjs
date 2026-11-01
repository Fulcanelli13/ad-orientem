import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditM08BulkSourceQA,m08PublicNotation}
 from "../src/mass/reader-m08-bulk-score-qa.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const m07=Array.from({length:6},(_,i)=>read(
 "data/research/mass-music-m07-gr1961-review-00"+(i+1)+".v1.json"));
const qa=Array.from({length:6},(_,i)=>read(
 "data/research/mass-music-m08-source-qa-00"+(i+1)+".v1.json"));
const tractLedger=read("data/research/mass-music-m08-83-tract-review.v1.json");
const sequenceLedger=read("data/research/mass-music-m08-five-sequences.v1.json");
const priority=read("data/research/mass-music-m07-priority-source-queue.v1.json");
const args={m07Batches:m07,qaBatches:qa,tractLedger,sequenceLedger,priority};
const audit=auditM08BulkSourceQA(args);
assert.equal(audit.status,"STRUCTURAL_AND_CATALOGUE_METADATA_PASSED",
 JSON.stringify(audit));
assert.equal(audit.sourceCandidatesChecked,1195);
assert.equal(audit.structuralFailures,0);
assert.equal(audit.sourceBatches,6);
assert.deepEqual({...audit.roles},{al:284,in:229,of:185,co:225,gr:189,tr:83});
assert.equal(audit.tractCandidates,83);
assert.equal(audit.tractWithTextLeads,26);
assert.equal(audit.tractWithoutTextLead,57);
assert.equal(audit.tractNeedsPositionReview,19);
assert.equal(audit.sequence1961ExactSourceIds,5);
assert.equal(audit.sequenceFullyNoteVerified,0);
assert.equal(audit.printedFacsimileNotesCompared,0);
assert.equal(audit.selectedMassAssignmentsVerified,0);
assert.equal(audit.approvedScores,0);
assert.equal(audit.publishedScores,0);
assert.equal(audit.sourceOnlyNotMusicApproval,true);
const s=sequenceLedger.sequences;
assert.deepEqual(s.map(x=>[x.key,x.sourceId]),[
 ["VICTIMAE_PASCHALI",1086],["VENI_SANCTE_SPIRITUS",68],
 ["LAUDA_SION",308],["DIES_IRAE",1198],["STABAT_MATER",681]]);
const pentecost=s.find(x=>x.key==="VENI_SANCTE_SPIRITUS");
assert.ok(pentecost.prohibitedAsEquivalents.some(x=>x.gregobaseId===181),
 "Veni Sancte Spiritus Alleluia #181 must not impersonate Sequence #68");
assert.ok(s.find(x=>x.key==="VICTIMAE_PASCHALI")
 .prohibitedAsEquivalents.some(x=>x.gregobaseId===18411),
 "Contemporary reconstruction must not replace 1961 printed score");
assert.equal(new Set(tractLedger.records.map(x=>x.id)).size,83);
assert.ok(tractLedger.records.every(x=>x.needsSyllableToNoteCollation));
for(const row of tractLedger.records){
 assert.equal(row.publicReader,false);
 assert.equal(row.editorialApproval,false);
 assert.equal(row["1962"],"NOT_CERTIFIED");
}
const copy=x=>JSON.parse(JSON.stringify(x));
{
 const mutated=copy(qa);mutated[1].records[5].diagnostics.initialClef=false;
 assert.equal(auditM08BulkSourceQA({...args,qaBatches:mutated}).status,"SOURCE_HOLD");
}
{
 const mutated=copy(qa);mutated[0].records[1].gabcSha256="0".repeat(64);
 assert.equal(auditM08BulkSourceQA({...args,qaBatches:mutated}).status,"SOURCE_HOLD");
}
{
 const mutated=copy(tractLedger);mutated.records[0].editorialApproval=true;
 assert.equal(auditM08BulkSourceQA({...args,tractLedger:mutated}).reason,
  "TRACT_SOURCE_OR_APPROVAL_MISMATCH");
}
{
 const mutated=copy(sequenceLedger);mutated.sequences[1].sourceId=181;
 assert.equal(auditM08BulkSourceQA({...args,sequenceLedger:mutated}).reason,
  "SEQUENCE_SOURCE_ROLE_OR_APPROVAL_CONFLICT");
}
{
 const mutated=copy(sequenceLedger);mutated.sequences[0].publicScore=true;
 assert.equal(auditM08BulkSourceQA({...args,sequenceLedger:mutated}).status,
  "SOURCE_HOLD");
}
assert.equal(m08PublicNotation({id:"GREGOBASE-1086"},
 {printedMusicVerified:true},{approved:true}),null);
const stage=readFileSync(new URL("../src/mass/reader-schola-event-timeline.js",import.meta.url),"utf8");
assert.doesNotMatch(stage,/reader-m08-bulk-score-qa|mass-music-m08-source-qa/);
console.log("PASS M08 1195/1195 source structure checks, 83 Tracts, 5 authentic 1961 Sequence IDs; zero musical approvals");
