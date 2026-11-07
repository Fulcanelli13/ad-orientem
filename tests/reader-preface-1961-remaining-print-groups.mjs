import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildPreface12PrintWorklist} from "../scripts/mass/export-preface-12-independent-print-worklist.mjs";
import {APPROVED_MASS_INLINE_GABC} from "../src/mass/reader-inline-chant-approved.js";
const input=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const old=input("../data/mass/preface-1961-initial-notehead-preflight.v1.json");
const latest=input("../data/mass/preface-1961-remaining-printed-groups.v1.json");
const review=buildPreface12PrintWorklist();
assert.equal(latest.schema,"ao-1961-preface-remaining-six-printed-group-candidate-v1");
assert.deepEqual(latest.counts,{responseSettings:6,printedWitnessRows:12,distinctPlateURLs:4,
 combinedWithEarlierWitnessRows:24,independentlyCertifiedPitchSeries:0,
 independentlyCertifiedSolesmesMarks:0,newPublicApprovals:0});
assert.equal(old.rows.length,12);
assert.equal(latest.rows.length,12);
assert.equal(new Set([...old.rows,...latest.rows].map(x=>x.sourceId+"|"+x.cueId+"|"+(x.book??x.witnessBook))).size,24);
assert.equal(new Set(latest.rows.map(x=>x.sourceId+"|"+x.cueId)).size,6);
assert.equal(APPROVED_MASS_INLINE_GABC.length,2);
const countPitchedComponents=group=>(group.match(/[a-m]/g)||[]).length;
for(const id of [4449,4450,4451])for(const cue of ["AO.SM.C0140","AO.SM.C0143"]){
 const s=review.rows.find(r=>r.sourceId===id&&r.cueId===cue);
 assert.ok(s,"Missing source-owned 1961 phrase "+id+" "+cue);
 const printed=latest.rows.filter(r=>r.sourceId===id&&r.cueId===cue);
 assert.equal(printed.length,2);
 const sourceCounts=s.sourceSyllableNoteGroups.map(g=>countPitchedComponents(g.gabcNoteGroup));
 assert.ok(sourceCounts.length>=6&&sourceCounts.every(n=>n>0));
 for(const witness of printed){
  assert.deepEqual(witness.independentlyObservedGlyphGroupCountCandidate,sourceCounts,
   "Preliminary PRINT group observations differ from modern GABC source at "+id+" "+cue+" "+witness.witnessBook);
  assert.ok(s.printWitnesses.some(p=>p.url===witness.sourcePlate),
   "Printed page must belong to source-owned phrase "+s.scoreId);
  assert.equal(witness.secondReaderConfirmed,false);
  assert.equal(witness.pitchSequenceTranscribed,false);
  assert.equal(witness.neumeShapesCertified,false);
  assert.equal(witness.solesmesMarksCertified,false);
  assert.equal(witness.publicationApproved,false);
  assert.equal(witness.observationMethod,"PRELIMINARY_PRINT_VISUAL_GROUP_COUNT");
 }
}
const expected={
 "4449|AO.SM.C0140":[1,3,1,1,2,1,2],
 "4450|AO.SM.C0140":[1,1,1,1,1,1,2],
 "4451|AO.SM.C0140":[1,4,1,2,3,1,2],
 "4449|AO.SM.C0143":[3,1,1,2,1,2],
 "4450|AO.SM.C0143":[1,1,1,1,1,2],
 "4451|AO.SM.C0143":[3,1,2,3,1,2]
};
for(const row of latest.rows){
 assert.deepEqual(row.independentlyObservedGlyphGroupCountCandidate,expected[row.sourceId+"|"+row.cueId]);
}
assert.ok(latest.countingConvention.includes("quilisma"));
assert.ok(latest.evidenceLimit.includes("preliminary"));
assert.ok(latest.caveats.some(x=>x.includes("square notehead")));
console.log("PASS complete 24 Preface witness preliminary group-count observations (12 first batch + 12 final batch), 0 printed pitch or Solesmes rhythmic-sign certifications");
