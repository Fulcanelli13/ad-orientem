// Fail closed on provenance drift or an attempt to promote obsolete Latin
// sources as authenticated 1962 ownership/notation.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {buildFive2026PinnedSourceGapDispositions,
 SCHOLA_FIVE_PATH_EVIDENCE_SCHEMA}
 from "../scripts/schola/build-2026-five-pinned-source-gap-dispositions.mjs";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const load=path=>JSON.parse(readFileSync(resolve(root,path),"utf8"));
const source={
 evidence:load("data/research/schola-2026-five-pinned-source-gap-evidence.v1.json"),
 inventory:load("data/research/mass-music-1962-pinned-full-source-universe.v1.json"),
 closeout:load(".tmp/schola-1962-selected-annual/2026-schola-closeout-source-exceptions.json")
};
const expected=buildFive2026PinnedSourceGapDispositions(source);
const emitted=load(".tmp/schola-1962-selected-annual/2026-schola-five-pinned-source-gap-dispositions.json");
assert.deepEqual(emitted,expected);
assert.equal(expected.schema,SCHOLA_FIVE_PATH_EVIDENCE_SCHEMA);
assert.equal(expected.authority.pinnedInventoryCommit,source.inventory.sourceRef);
assert.deepEqual(expected.counters,{
 selectedSourcePathGaps:5,affectedActualDates:15,
 obsoleteOnlyHistoricalSourcePaths:4,withoutExactHistoricalSourcePath:1,
 selected1962SourceOwnersCertified:0,newPublicScores:0,newSourceFilesAdded:0
});
const targets=[["Commune/C10Pasc",1],["Commune/C10b",2],
 ["Commune/C10c",1],["Commune/C10t",8],["Tempora/Nat1-1",3]];
assert.deepEqual(expected.gaps.map(x=>[x.selectedSourcePath,x.affectedDates]).sort(
 (a,b)=>a[0].localeCompare(b[0])),targets.sort((a,b)=>a[0].localeCompare(b[0])));
assert.equal(expected.gaps.reduce((n,x)=>n+x.actual2026Dates.length,0),15);
assert.equal(new Set(expected.gaps.flatMap(x=>
 x.actual2026Dates.map(y=>y.date))).size,15);
for(const row of expected.gaps){
 assert.equal(row.pinned1049SourceExists,false);
 assert.equal(row.original1962SectionCertified,false);
 assert.equal(row.selected1962OwnerCertified,false);
 assert.equal(row.aliasAuthorized,false);
 assert.equal(row.digitalScoreAuthorized,false);
 assert.ok(row.pendingDecision.startsWith(
  row.selectedSourcePath==="Tempora/Nat1-1"?"TRACE":"VERIFY")||
   row.pendingDecision.startsWith("RESOLVE"));
 for(const date of row.actual2026Dates){
  assert.equal(date.digitalScoreAuthorized,false);
  assert.equal(date.selectedSourcePath,row.selectedSourcePath);
  assert.match(date.date,/^2026-\d{2}-\d{2}$/);
  assert.match(date.principalId,/^[A-Za-z0-9:_-]{4,}$/);
 }
}
const marian=expected.gaps.filter(x=>x.selectedSourcePath.startsWith("Commune/C10"));
assert.equal(marian.length,4);
assert.ok(marian.every(x=>
 x.historicalWitness?.path.startsWith("obsolete/missa/Latin/Commune/")&&
 x.historicalWitness.provenance==="EXACT_UPSTREAM_GIT_TREE_ONLY_NOT_PINNED_1049"));
assert.equal(expected.gaps.find(x=>x.selectedSourcePath==="Commune/C10t")
 .historicalWitness.size,194,"Generic C10t is a tiny inheritance stub, not a complete chant owner");
const nat=expected.gaps.find(x=>x.selectedSourcePath==="Tempora/Nat1-1");
assert.equal(nat.historicalWitness,null);
assert.match(nat.structuralFinding,/not admissible substitutes/);
assert.equal(expected.publication.publicGregorianScores,0);
assert.equal(expected.publication.aliasesApproved,0);
assert.equal(expected.publication.sourceOwnerOrMelodyInferred,false);
const tamper=mutate=>{
 const altered=structuredClone(source);mutate(altered);
 return ()=>buildFive2026PinnedSourceGapDispositions(altered);
};
assert.throws(tamper(s=>{s.evidence.selectedSourceGaps[0].historicalSource.blobSha="f".repeat(40)}),
 /SCHOLA_FIVE_SOURCE_GAP_LEGACY_BLOB_IDENTITY_CHANGED/);
assert.throws(tamper(s=>{s.evidence.selectedSourceGaps[4].historicalSource={
 path:"obsolete/missa/Latin/Tempora/Nat1-1.txt",blobSha:"f".repeat(40),size:123}}),
 /SCHOLA_FIVE_SOURCE_GAP_FALSE_NATIVITY_LEGACY_SOURCE/);
assert.throws(tamper(s=>{s.evidence.selectedSourceGaps[3].aliasOf="Commune/C10"}),
 /SCHOLA_FIVE_SOURCE_GAP_SOURCE_FAMILY_AUTHORITY_OR_OCCURRENCE_DRIFT/);
assert.throws(tamper(s=>{s.inventory.sourceFiles.push({
 path:"Commune/C10t",sha:"a".repeat(40),size:194})}),
 /SCHOLA_FIVE_SOURCE_GAP_PINNED_1049_INVENTORY_CHANGED/);
assert.throws(tamper(s=>{s.closeout.selectedSourceTreeGaps[0].dates[0]="2026-13-42"}),
 /SCHOLA_FIVE_SOURCE_GAP_DATE_OR_SELECTED_PRINCIPAL_ID_INVALID/);
assert.throws(tamper(s=>{s.closeout.counts.newApprovedScores=1}),
 /SCHOLA_FIVE_SOURCE_GAP_SELECTED_2026_CLOSEOUT_CHANGED/);
assert.throws(tamper(s=>{s.evidence.publication.approvedSourceAliases=1}),
 /SCHOLA_FIVE_SOURCE_GAP_EVIDENCE_NOT_AUTHENTICATED/);
console.log("PASS five pinned 1962 source gaps: 15 original selected dates, four obsolete-only Latin witnesses, one wholly absent Nat1-1; zero source aliases, scores or musical approvals");
