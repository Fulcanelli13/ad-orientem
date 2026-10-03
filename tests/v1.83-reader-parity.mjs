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
assert.notEqual(resolver.total,gate.reference.expectedLiveCards,
  "Reader parity gate should not silently pass until authoritative 48-card map is recovered");
assert.ok(gate.acceptance.some(x=>/48-card map/.test(x)));

assert.equal(recovery.status,"PARTIAL_EVIDENCE_ONLY_DO_NOT_RENDER");
assert.equal(recovery.lineage.v180LiveCards,38);
assert.equal(recovery.lineage.v181LiveCards,48);
assert.equal(recovery.lineage.v183FrozenLiveCards,48);
assert.equal(recovery.recoveredSemanticSplits.length,6);
assert.equal(recovery.unresolvedSplitAreas.length,4);
assert.equal(
  recovery.recoveredSemanticSplits.length+recovery.unresolvedSplitAreas.length,
  recovery.lineage.v181LiveCards-recovery.lineage.v180LiveCards,
  "Recovery ledger must account for the ten historical decompression splits without pretending unresolved boundaries are known"
);
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

console.log("v1.83 reader parity gate: PASS — 30-card R17 surface remains blocked; 6/10 decompression splits are semantically recovered, 4/10 remain unresolved, and exact v1.83 elevation/pre-Gospel repairs are frozen.");
