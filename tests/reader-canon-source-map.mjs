import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createCanonSourceResolver} from "../src/mass/reader-canon-source.js";
import {makeStructureCards} from "../src/mass/reader-structure.js";

const load=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const map=load("../data/presentation/reader-canon-source-map.v1.json");
const sung=load("../data/presentation/reader-text-sung.v1.json");
const sections=load("../data/presentation/reader-section-map.v0.13.1.json");
const release=load("../data/presentation/reader-release-gate.v1.json");
const historical=load("../data/presentation/v1.83-reader-parity-gate.v1.json");

const resolver=createCanonSourceResolver(map,{sungCorpus:sung,sectionMap:sections});
assert.equal(resolver.status,"CERTIFIED_SOURCE_FIRST");
assert.equal(resolver.segments.length,14);
assert.equal(resolver.blockCount,15);
assert.equal(resolver.eventCount,29);
assert.equal(resolver.historical48Required,false);

assert.equal(resolver.segmentForCue("AO.SM.C0150").title,"Te igitur");
assert.equal(resolver.segmentForCue("AO.SM.C0161").title,"Hanc igitur");
assert.equal(resolver.segmentForCue("AO.SM.C0163").title,"Quam oblationem");
assert.equal(resolver.segmentForCue("AO.SM.C0173").title,"Consecration of the Sacred Host");
assert.equal(resolver.segmentForCue("AO.SM.C0174").title,"Consecration of the Sacred Host");
assert.equal(resolver.segmentForCue("AO.SM.C0180").title,"Consecration of the Chalice");
assert.equal(resolver.segmentForCue("AO.SM.C0181").title,"Consecration of the Chalice");
assert.equal(resolver.segmentForCue("AO.SM.C0196").title,"Nobis quoque peccatoribus");
assert.equal(resolver.segmentForCue("AO.SM.C0199").title,"Per quem haec omnia");
assert.equal(resolver.segmentForCue("AO.SM.C0201").title,"Per ipsum · Minor Elevation");
assert.equal(resolver.segmentForCue("AO.SM.C0206")?.id,"AO.CANON.14");
assert.equal(resolver.segmentForCue("AO.SM.C0207")?.id,"AO.CANON.14");
assert.deepEqual(resolver.segments.at(-1).blockIds,["AO.SM.B060","AO.SM.B061"]);

assert.equal(resolver.segmentForEvent("MC-CAN-060").title,"Hanc igitur");
assert.equal(resolver.segmentForEvent("MC-CAN-080").title,"Quam oblationem");
assert.equal(resolver.segmentForEvent("MC-CAN-170").title,"Per quem haec omnia");
assert.equal(resolver.segmentForEvent("MC-CAN-180").title,"Per ipsum · Minor Elevation");

assert.equal(release.certificationPolicy.requireAuthoritative48CardMap,false);
assert.equal(release.certificationPolicy.requireSourceFirstCanonMap,true);
assert.ok(!release.openBlockers.some(x=>x.id==="G6_48_CARD_MAP"));
assert.ok(!release.openBlockers.some(x=>x.id==="LIVE_SOURCE_STRUCTURE_INTEGRATION"));
assert.equal(release.protectedInvariants.find(x=>x.id==="LIVE_SOURCE_STRUCTURE_INTEGRATION")?.status,"CERTIFIED");
assert.equal(historical.releaseAuthority,false);
assert.equal(historical.status,"HISTORICAL_PARITY_REFERENCE_NON_BLOCKING");
const live=makeStructureCards("LIVE",map);
assert.equal(live.length,39);
assert.equal(live.filter(x=>x.sourceFirst).length,14);
assert.equal(live[13].id,"AO.CANON.01");
assert.equal(live[26].id,"AO.CANON.14");
assert.equal(live[18].cueEnd,"AO.SM.C0174");
assert.equal(live[19].cueEnd,"AO.SM.C0181");
assert.deepEqual(live[26].blockIds,["AO.SM.B060","AO.SM.B061"]);
assert.equal(live[26].cueEnd,"AO.SM.C0207");

console.log("source-first Canon structure: PASS — 14 Canon units drive a 39-step LIVE flow; historical C01-C48 remains non-blocking.");
