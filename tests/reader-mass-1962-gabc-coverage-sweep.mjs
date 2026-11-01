import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {index1961GradualeGabc} from "../src/mass/reader-proper-gabc-bulk-join.js";
import {SCHOLA_1962_BULK_COVERAGE_SCHEMA,sweepPinned1962MassSourceFiles}
 from "../src/mass/reader-mass-1962-gabc-coverage-sweep.js";
const load=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const archive=index1961GradualeGabc(Array.from({length:6},(_,i)=>load(
 "../data/mass/chant-corpus/gr1961-proper-"+String(i+1).padStart(3,"0")+".json")));
const source=Array.from({length:8},(_,i)=>load("../data/research/mass-music-1962-chant-witness-91-b"+
 String(i+1).padStart(2,"0")+".v1.json"));
const inherited=Array.from({length:2},(_,i)=>load("../data/research/mass-music-1962-inherited-witness-91-b"+
 String(i+1).padStart(2,"0")+".v1.json"));
const roster=load("../data/research/mass-music-1962-source-roster-91.v1.json");
const material=load("../data/research/mass-music-1962-91-source-first-coverage.v1.json");
assert.equal(roster.sourceCount,91);
assert.equal(roster.sourceOccurrences,506);
assert.equal(source.flatMap(x=>x.sources).length,91);
assert.deepEqual(source.map(x=>x.sources.length),[12,12,12,12,12,12,12,7]);
assert.equal(inherited.flatMap(x=>x.sources).length,25);
for(const [i,b] of source.entries()){
 assert.equal(b.batch,i+1);
 assert.equal(b.sourceRef,roster.sourceRef);
}
const sources=[...source,...inherited].flatMap(x=>x.sources);
const audited=sweepPinned1962MassSourceFiles({sources,archive});
assert.equal(audited.schema,SCHOLA_1962_BULK_COVERAGE_SCHEMA);
assert.equal(audited.pinnedSourceCount,91);
assert.equal(audited.catalogueSourceCount,1195);
assert.equal(audited.extraInheritanceWitnessCount,25);
assert.equal(audited.publication.approvedScores,0);
assert.equal(audited.publication.approvedRecordings,0);
assert.equal(audited.publication.dateOrFeastInferred,false);
assert.equal(audited.publication.actualSelectedMassConfirmed,false);
assert.equal(audited.sourceFiles.reduce((n,f)=>n+f.tracks.length,0),471);
assert.deepEqual(audited.candidateStatuses,{
 NO_SAME_ROLE_TEXT_CANDIDATE:44,UNIQUE_TEXT_CANDIDATE:355,
 AMBIGUOUS_TEXT_VARIANTS:19,INHERITED_SOURCE_UNAVAILABLE_AT_MISSA_PATH:31,
 PASCHAL_SOURCE_SELECTION_REQUIRED:14,SEQUENCE_OUTSIDE_1195_ARCHIVE:2,
 SECTION_ABSENT:6
});
assert.deepEqual(material.statusCounts,audited.candidateStatuses);
assert.deepEqual(material.sourceFiles,audited.sourceFiles,"Stored 471-entry evidence must be reproducible");
const all=new Set(roster.sourceFiles.map(x=>x.path));
assert.equal(all.size,91);
for(const entry of audited.sourceFiles){
 const original=roster.sourceFiles.find(s=>s.path===entry.sourcePath);
 assert.ok(original,"an invented source path entered the sweep");
 assert.equal(entry.sourceBlobSha,original.sha);
 assert.equal(entry.sourceAuthenticated,true);
 assert.equal(entry.actualSelectedMass1962,false);
 for(const t of entry.tracks)for(const c of t.candidates??[]){
   assert.match(c.id,/^GREGOBASE-\d+$/);
   assert.match(c.sha256,/^[a-f0-9]{64}$/);
   assert.equal(archive.byRole[t.part]?.find(x=>x.id===c.id)?.sha256,c.sha256);
   assert.ok(c.matchedOpeningWords>=4);
   assert.ok(["in","gr","al","tr","of","co"].includes(t.part));
   assert.notEqual(t.status,"PUBLIC_SCORE_APPROVED");
 }
}
const caseOf=path=>audited.sourceFiles.find(x=>x.sourcePath===path);
const cross=caseOf("Sancti/09-14");
assert.ok(cross);
const intro=cross.tracks.find(x=>x.section==="Introitus");
assert.equal(intro.status,"AMBIGUOUS_TEXT_VARIANTS");
assert.deepEqual(intro.candidates.map(x=>x.id),["GREGOBASE-359","GREGOBASE-374"]);
const paschal=caseOf("Tempora/Pasc3-0");
assert.equal(paschal.tracks.filter(x=>x.kind==="ALLELUIA").length,2);
assert.equal(paschal.tracks.filter(x=>x.kind==="GRADUAL").length,0);
const saint=caseOf("Sancti/06-24");
assert.equal(saint.tracks.find(x=>x.section==="Offertorium").status,
 "INHERITED_SOURCE_UNAVAILABLE_AT_MISSA_PATH");
const sourceCross=caseOf("Tempora/Epi6-0");
assert.ok(sourceCross.tracks.some(x=>x.sourceOwner==="Tempora/Epi3-0"),
 "Known inherited Temporal section should resolve within pinned 91");
assert.ok(audited.sourceFiles.every(x=>x.tracks.every(t=>!Object.hasOwn(t,"gabc"))),
 "Never copy live GABC strings into historical match inventory");
// Fail closed if one staged source no longer matches its verified pinned blob.
const fake=structuredClone(sources);
fake[0].actualSha="f".repeat(40);
assert.throws(()=>sweepPinned1962MassSourceFiles({sources:fake,archive}),/SOURCE_SHA_DRIFT/);
const duplicate=structuredClone(sources);
duplicate.push(duplicate[0]);
assert.throws(()=>sweepPinned1962MassSourceFiles({sources:duplicate,archive}),/SOURCE_IDENTITY_DUPLICATED/);
console.log("PASS bulk 1962 source files: 91 pinned SHA witnesses, 25 inheritance references, 471 chant rows, 355 unique text candidates, 0 approved musical scores");
