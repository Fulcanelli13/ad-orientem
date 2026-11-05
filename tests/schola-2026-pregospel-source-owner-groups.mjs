import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {group2026PregospelHolds,SCHEMA}
 from "../scripts/schola/group-2026-pregospel-source-owner-holds.mjs";
import {gitBlobSha1}
 from "../scripts/schola/pinned-1962-source-library.mjs";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const dir=join(root,".tmp/schola-1962-selected-annual");
const load=p=>JSON.parse(readFileSync(p,"utf8"));
const closeout=load(join(dir,"2026-schola-closeout-source-exceptions.json"));
const inventory=load(join(root,"data/research/mass-music-1962-pinned-full-source-universe.v1.json"));
const annual=load(join(dir,"2026-selected-gabc-coverage.json"));
const map=new Map(inventory.sourceFiles.map(x=>[x.path,x]));
const cache=new Map(),base=join(root,".cache","schola-pinned-1962",inventory.sourceRef);
async function readPinned(path){
 const entry=map.get(path);
 if(!entry)return null;
 if(!cache.has(path)){
  const buffer=readFileSync(join(base,entry.sha+".txt"));
  assert.equal(buffer.byteLength,entry.size);
  assert.equal(gitBlobSha1(buffer),entry.sha);
  cache.set(path,{sha:entry.sha,text:buffer.toString("utf8")});
 }
 return cache.get(path);
}
const output=await group2026PregospelHolds({closeout,inventory,annual,readPinned});
const stored=load(join(dir,"2026-schola-pregospel-original-owner-clusters.json"));
assert.deepEqual(stored,output,"Emission must match exact pinned source proof");
assert.equal(stored.schema,SCHEMA);
assert.equal(stored.counts.datedPreGospelHolds,128);
assert.equal(stored.counts.distinctSelectedSourcePaths,115);
assert.equal(stored.counts.exactFullSelectedLatinReviewClusters,36);
assert.equal(stored.counts.datesInRepeatedFullLatinClusters,114);
assert.equal(stored.exactFullSelectedLatinGroups.length,36);
assert.equal(stored.exactFullSelectedLatinGroups.reduce((n,x)=>n+x.dateCount,0),128);
assert.equal(stored.exactFullSelectedLatinGroups.filter(x=>x.dateCount>1)
 .reduce((n,x)=>n+x.dateCount,0),114);
assert.ok(stored.exactFullSelectedLatinGroups.every(x=>
 !x.GregorianScoreApproved&&!x.musicalIdentityCertified&&!x.sourceOwnershipCertified&&
 x.status==="EXACT_SELECTED_LATIN_REUSE_ONLY_ORIGINAL_OWNER_AND_MELODY_UNVERIFIED"));
assert.equal(stored.counts.approvedSourceAliases,0);
assert.equal(stored.counts.approvedGregorianProperScores,0);
assert.equal(stored.sourceRows.length,115);
assert.equal(new Set(stored.sourceRows.flatMap(x=>x.dates)).size,128);
assert.equal(stored.groups.reduce((n,x)=>n+x.datedHolds,0),128);
assert.equal(stored.groups.reduce((n,x)=>n+x.distinctSelectedSourcePaths,0),115);
assert.ok(stored.groups.every(x=>!x.publicScoreApproved&&x.exact1961MusicalScoreReviewRequired));
assert.ok(stored.sourceRows.every(x=>!x.automaticSourceOwnerApproved&&!x.digitalScoreApproved));
assert.equal(stored.publication.publicScore,false);
assert.equal(stored.publication.sourceAliasApproved,false);
assert.equal(stored.publication.readerRuntimeChanges,false);
assert.equal(stored.otherRoleExceptions.length,1,"Separate 27 May role exception remains distinct");
assert.equal(stored.counts.previouslyDispositionedMissingSourcePaths,5);
assert.equal(stored.counts.previouslyDispositionedMissingPathDatedHolds,15);
const missing=new Set(["Commune/C10Pasc","Commune/C10b","Commune/C10c","Commune/C10t","Tempora/Nat1-1"]);
assert.deepEqual(stored.sourceRows.filter(x=>!x.pinnedSourceExists).map(x=>x.sourcePath).sort(),
 [...missing].sort());
for(const x of stored.sourceRows){
 const matched=closeout.preGospelSourceOwnerQueue.find(y=>y.sourcePath===x.sourcePath);
 assert.deepEqual(x.dates,matched.dates);
 if(x.pinnedSourceExists){
  assert.equal(x.originalSectionEvidence.length,3);
  for(const e of x.originalSectionEvidence){
   assert.ok(["Graduale","GradualeP","Tractus"].includes(e.section));
   assert.ok(e.chain.length>=1);
   if(e.sourceSha)assert.ok(/^[0-9a-f]{40}$/.test(e.sourceSha));
  }
 }else assert.deepEqual(x.originalSectionEvidence,[]);
}
// Reject a forged research queue that invents a sixth source gap.
const invalid=structuredClone(closeout);
invalid.preGospelSourceOwnerQueue[0].sourcePath="Commune/ForgedMissing";
await assert.rejects(group2026PregospelHolds({closeout:invalid,inventory,annual,readPinned}),
 /SCHOLA_OWNER_GROUP_SOURCE_GAP_NOT_IN_CANONICAL_FIVE/);
// Any publishing mutation must invalidate the worklist.
const promoted=structuredClone(closeout);
promoted.counts.newApprovedScores=1;
await assert.rejects(group2026PregospelHolds({closeout:promoted,inventory,annual,readPinned}),
 /SCHOLA_OWNER_GROUP_UNTRUSTED_2026_CENSUS/);
console.log("PASS 128 dated pre-Gospel source-owner holds in 115 paths; 36 identical complete selected-Latin research groups (114 dates with repeats) with no inferred original melody, 15 overlaps not double-counted, 0 aliases and 0 score approvals");
