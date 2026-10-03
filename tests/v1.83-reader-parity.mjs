import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createReaderSectionResolver } from "../src/mass/reader-sections.js";

const gate=JSON.parse(readFileSync(new URL("../data/presentation/v1.83-reader-parity-gate.v1.json",import.meta.url),"utf8"));
const recovery=JSON.parse(readFileSync(new URL("../data/presentation/v1.83-reader-map-recovery.v1.json",import.meta.url),"utf8"));
const map=JSON.parse(readFileSync(new URL("../data/presentation/reader-section-map.v0.13.1.json",import.meta.url),"utf8"));
const resolver=createReaderSectionResolver(map);

assert.equal(gate.reference.expectedLiveCards,48);
assert.equal(gate.reference.expectedCanonicalMacros,30);
assert.equal(resolver.total,30);
assert.equal(gate.currentR17.nativeReaderCards,30);
assert.equal(gate.currentR17.status,"NOT_PARITY_COMPLETE");
assert.equal(gate.recoveredV181Splits.length,9);
assert.deepEqual(gate.unresolvedV181SplitAreas.map(x=>x.area).sort(),["CANON"]);
assert.equal(Object.hasOwn(gate,"knownV181Splits"),false,
  "Parity gate must not retain the stale six-split ledger after 9/10 recovery");
assert.notEqual(resolver.total,gate.reference.expectedLiveCards,
  "Reader parity gate should not silently pass until authoritative 48-card map is recovered");
assert.ok(gate.acceptance.some(x=>/48 LIVE cards/.test(x)), "Parity acceptance must require exact recovery of all 48 LIVE cards");

assert.equal(recovery.status,"PARTIAL_EVIDENCE_ONLY_DO_NOT_RENDER");
assert.equal(recovery.lineage.v180LiveCards,38);
assert.equal(recovery.lineage.v181LiveCards,48);
assert.equal(recovery.lineage.v183FrozenLiveCards,48);
assert.equal(recovery.recoveredSemanticSplits.length,9);
assert.equal(recovery.unresolvedSplitAreas.length,1);
assert.equal(
  recovery.recoveredSemanticSplits.length+recovery.unresolvedSplitAreas.length,
  recovery.lineage.v181LiveCards-recovery.lineage.v180LiveCards,
  "Recovery ledger must account for the ten historical decompression splits without pretending unresolved boundaries are known"
);
const communionPrep=recovery.recoveredSemanticSplits.find(x=>x.label==="Panem caelestem / Domine, non sum dignus — Priest");
assert.deepEqual(communionPrep?.anchorBlocks,["AO.SM.B072","AO.SM.B073"]);
assert.deepEqual(communionPrep?.evidenceLiveCardIds,["LC-COM-190","LC-COM-200-A","LC-COM-200-B","LC-COM-200-C"]);

const conclusionSplit=recovery.recoveredSemanticSplits.find(x=>x.label==="Placeat tibi / Final Blessing sequence");
assert.deepEqual(conclusionSplit?.anchorBlocks,["AO.SM.B091","AO.SM.B092"]);
assert.deepEqual(conclusionSplit?.evidenceLiveCardIds,["LC-END-110","LC-END-120","LC-END-130","LC-END-140"]);

const offertorySplit=recovery.recoveredSemanticSplits.find(x=>x.label==="Suscipe sancta Trinitas / Orate fratres");
assert.deepEqual(offertorySplit?.anchorBlocks,["AO.SM.B038","AO.SM.B039"]);
assert.equal(offertorySplit?.confidence,"TRIANGULATED_UNIQUE_FROM_V1_80_GROUPING_AND_V1_81_SPLIT_ACCOUNTING");
assert.equal(offertorySplit?.evidence?.v180PreservedGrouping,"Suscipe/Orate");
assert.equal(offertorySplit?.evidence?.remainingOffertorySplitCountBeforeThisRecovery,1);

assert.deepEqual(
  recovery.unresolvedSplitAreas.map(x=>x.area).sort(),
  ["CANON"],
  "Only the still-unrecovered Canon v1.81 decompression boundary may remain area-only"
);

assert.equal(recovery.remainingCanonRecovery?.status,"UNRESOLVED_DO_NOT_INFER");
assert.equal(recovery.remainingCanonRecovery?.requiredSplitCount,1);
assert.equal(recovery.remainingCanonRecovery?.directV181OrV183DonorBytesRecovered,false);
assert.equal(recovery.remainingCanonRecovery?.exactV180CanonCombinedCardMapRecovered,false);
assert.equal(recovery.remainingCanonRecovery?.exactV184ToV187CardDeltaRecovered,false);
assert.equal(
  recovery.remainingCanonRecovery?.librarySearchAudit?.result,
  "NO_CONTEMPORANEOUS_V1_80_V1_81_V1_83_CANON_BOUNDARY_RECOVERED"
);
assert.ok((recovery.remainingCanonRecovery?.librarySearchAudit?.checked??[]).length>=3);
assert.match(
  recovery.remainingCanonRecovery?.librarySearchAudit?.candidatePolicy??"",
  /candidate-only|candidate/i
);
assert.ok(recovery.remainingCanonRecovery?.rejectedRecoveryMethods.some(x=>/v1\.87 51-card/.test(x)),
  "Later 51-card subtraction must remain rejected without an exact lineage delta");
for(const candidate of recovery.remainingCanonRecovery?.laterObservedBoundariesNotCertifiedAsV181??[]){
  assert.ok(Array.isArray(candidate.blocks) && candidate.blocks.length===2);
}
assert.equal(recovery.recoveredSemanticSplits.length,9,
  "Unproven later Canon granularity was accidentally promoted to the tenth v1.81 split");

assert.equal(Object.hasOwn(recovery,"cards"),false,
  "Partial recovery evidence must not masquerade as an authoritative reader card map");

assert.equal(recovery.recoveredRuntimeRepairs.v183MergeGate.liveCards,48);
assert.equal(recovery.recoveredRuntimeRepairs.v183MergeGate.canonicalMacros,30);
assert.equal(recovery.recoveredRuntimeRepairs.v183MergeGate.hostElevationGate,"AO.SM.C0173 -> AO.SM.C0174");
assert.equal(recovery.recoveredRuntimeRepairs.v183MergeGate.chaliceElevationGate,"AO.SM.C0180 -> AO.SM.C0181");
assert.equal(recovery.recoveredRuntimeRepairs.v183MergeGate.gradualBlock,"AO.SM.B021");
assert.equal(recovery.recoveredRuntimeRepairs.v183MergeGate.alleluiaTractBlock,"AO.SM.B022");
assert.equal(recovery.recoveredRuntimeRepairs.v183MergeGate.mundaBlock,"AO.SM.B023");
assert.equal(recovery.recoveredRuntimeRepairs.v183MergeGate.transientStateClearsAcrossCards,true);
assert.deepEqual(recovery.recoveredRuntimeRepairs.v183MergeGate.parseQA,{
  executableJsBlocks:23,
  jsonBlocks:21,
  errors:0
});

console.log("v1.83 reader parity gate: PASS — 30-card R17 surface remains blocked; 9/10 decompression splits are semantically recovered, one Canon split remains unresolved, and exact v1.83 elevation/pre-Gospel repairs are frozen.");
