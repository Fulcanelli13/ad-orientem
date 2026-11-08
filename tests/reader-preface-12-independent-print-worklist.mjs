import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildPreface12PrintWorklist,buildPreface12PrintWorklistCsv,
 PREFACE_PRINT_NEUME_WORKLIST_SCHEMA}
 from "../scripts/mass/export-preface-12-independent-print-worklist.mjs";
import {PARTICIPATION_REFERENCE_SCORES} from "../src/mass/reader-participation-reference-scores.js";
import {PREFACE_SOLEMNIOR_RESEARCH_SCORES} from "../src/mass/reader-preface-solemnior-reference-scores.js";
const report=buildPreface12PrintWorklist();
assert.equal(report.schema,PREFACE_PRINT_NEUME_WORKLIST_SCHEMA);
assert.deepEqual(report.counts,{responseExcerpts:12,toneFamilies:3,liturgicalCues:4,
 witnessComparisons:24,distinctPrintedPages:5,independentlyCertifiedResponses:0,
 newPublicApprovals:0});
assert.equal(PARTICIPATION_REFERENCE_SCORES.length,24);
assert.equal(PREFACE_SOLEMNIOR_RESEARCH_SCORES.length,4);
assert.deepEqual(report.rows.map(x=>x.family),[
 ...Array(4).fill("SOLEMN"),...Array(4).fill("FERIAL"),...Array(4).fill("SOLEMNIOR")]);
assert.equal(new Set(report.rows.map(x=>x.sourceId)).size,3);
assert.deepEqual(new Set(report.rows.map(x=>x.cueId)),
 new Set(["AO.SM.C0136","AO.SM.C0138","AO.SM.C0140","AO.SM.C0143"]));
assert.equal(new Set(report.rows.flatMap(r=>r.printWitnesses.map(w=>w.url))).size,5);
assert.ok(report.rows.every(r=>r.printWitnesses.length===2&&
 r.sourceSyllableNoteGroups.length===r.sourceSyllableGroups&&r.sourceSyllableGroups>1&&
 r.independentPrintedNeumeCertification==="PENDING"&&
 r.publicScoreApproved===false&&r.reviewerDecision==="DO_NOT_PUBLISH"));
for(const row of report.rows){
 const ref=[...PARTICIPATION_REFERENCE_SCORES,...PREFACE_SOLEMNIOR_RESEARCH_SCORES]
  .find(x=>x.id===row.scoreId);
 assert.ok(ref);
 assert.equal(row.originalGabcPhrase,ref.gabc.slice(ref.gabc.indexOf("%%")+2).trim());
 assert.ok(row.printWitnesses.every(x=>x.staffLocated===true&&
  x.printedSyllablesIndependentlyTranscribed===null&&
  x.printedNoteGroupsIndependentlyTranscribed===null&&
  x.printedSolesmesMarksIndependentlyTranscribed===null&&
  x.neumeParity==="NOT_CERTIFIED"&&x.rhythmicMarkParity==="NOT_CERTIFIED"));
}
const byCue=report.rows.filter(x=>x.cueId==="AO.SM.C0136");
assert.equal(byCue.length,3);
assert.equal(new Set(byCue.map(x=>x.originalGabcPhrase)).size,1,
 "All 3 1961 Preface Amen sources use the same GABC phrase; no additional approval inferred");
for(const cue of ["AO.SM.C0138","AO.SM.C0140","AO.SM.C0143"]){
 const rows=report.rows.filter(x=>x.cueId===cue);
 assert.equal(rows.length,3);
 assert.equal(new Set(rows.map(x=>x.originalGabcPhrase)).size,3,
 "Non-Amen 1961 Preface tones remain musically distinct");
}
const csv=buildPreface12PrintWorklistCsv();
assert.equal(csv.trimEnd().split("\n").length,25);
assert.equal((csv.match(/"NOT_CERTIFIED"/g)||[]).length,48);
const publicScores=readFileSync(new URL("../src/mass/reader-inline-chant-approved.js",import.meta.url),"utf8");
assert.ok(!publicScores.includes("preface-12-independent-print-worklist"));
console.log("PASS 12 Preface responses, 24 original printed-witness transcription slots, 5 unique 1961 pages, 0 claims of independent neume parity");
