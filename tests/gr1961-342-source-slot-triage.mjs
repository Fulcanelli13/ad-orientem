import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {generate342} from "../tools/mass/build-gr1961-342-source-slot-triage.mjs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const report=JSON.parse(read("data/mass/chant-corpus/gr1961-342-source-slot-triage.v1.json"));
assert.equal(report.schema,"ao-gr1961-342-source-slot-triage-v1");
assert.equal(JSON.stringify(generate342(read),null,2)+"\n",
 read("data/mass/chant-corpus/gr1961-342-source-slot-triage.v1.json"),
 "Every row must be independently reconstructable from nine frozen archival research witnesses");
assert.equal(report.researchOnly,true);
assert.deepEqual([report.summary.archiveRecords,report.summary.candidates,report.summary.sourceOccurrences],
 [1195,342,506]);
assert.deepEqual([report.summary.strong,report.summary.partial,report.summary.divergent],[275,39,28]);
assert.deepEqual([report.summary.simple,report.summary.preGospel],[157,185]);
assert.deepEqual([report.summary.strongSimple,report.summary.strongPreGospel],[130,145]);
assert.equal(report.summary.sourcePaths,91);
assert.equal(report.summary.contestedSourceSections,report.contestedSourceSections.length);
assert.equal(report.summary.selected1962,0);
assert.equal(report.summary.facsimileApproved,0);
assert.equal(report.summary.promoted,0);
assert.equal(report.records.filter(x=>x.promoted).length,0);
assert.equal(new Set(report.records.map(x=>x.id)).size,342);
assert.equal(report.records.every(x=>x.gabcSha256.length===64 && x.editorialApproval==="NOT_GRANTED"),true);
assert.equal(report.records.every(x=>x.selected1962==="NOT_VERIFIED"),true);
assert.equal(report.records.filter(x=>x.threeLanguageBoundary==="UNVERIFIED").length,185);
assert.equal(report.records.filter(x=>x.threeLanguageBoundary==="NOT_APPLICABLE").length,157);
for(const r of report.records){
 assert.ok(r.evidence.length);
 for(const e of r.evidence){
  assert.match(e.sourceBlobSha,/^[a-f0-9]{40}$/);
  assert.ok(e.sourcePath===undefined,"Do not accidentally create independent source-owner aliases");
  assert.ok(e.path.startsWith("Tempora/")||e.path.startsWith("Sancti/"));
  assert.equal(typeof e.text,"string");
 }
}
const corrupted=(path)=>path==="data/mass/chant-corpus/gr1961-first400-other-proper-text-review.v1.json"
 ?read(path).replace('"gregobaseId": 2','"gregobaseId": 999999'):read(path);
assert.throws(()=>generate342(corrupted),/GR1961_342_/,
 "Corrupted GABC identity must block complete research report");
const changedSource=(path)=>path==="data/mass/chant-corpus/gr1961-first200-latin-witness-screen.v1.json"
 ?read(path).replace('"75b533254548cf9f93636ea3d44dca059c6896d1"','"0000000000000000000000000000000000000000"'):read(path);
assert.throws(()=>generate342(changedSource),/GR1961_342_/,
 "Drifting frozen source manifests must not silently pass");
console.log("PASS 342 archived chant candidates / 506 occurrences; 91 source paths; no canonical, facsimile or local performance promotions");
