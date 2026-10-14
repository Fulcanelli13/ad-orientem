import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const ledger=load("../data/presentation/mass-icon-historical-reference-ledger-20261014.v1.json");
const matrix=load("../data/mass/gesture-matrix.v1.json");
const positions=load("../data/presentation/reader-priest-positions.v1.json");
const approved=load("../data/presentation/mass-icon-extension-approvals-20261011.v1.json");
const minister=load("../data/research/mass-canon-minister-form-branches-20261013.json");
const ids=new Set(ledger.sources.map(x=>x.id));
assert.equal(ledger.schema,"ao-mass-icon-historical-reference-ledger-v1");
assert.equal(ledger.status,"RESEARCH_ONLY_IMAGE_RIGHTS_AND_CEREMONIAL_REVIEW_PENDING");
assert.equal(ledger.authority.automaticAssetActivation,false);
assert.equal(ledger.authority.banGeneratedSubstitutes,true);
assert.equal(ledger.sources.length,9);
assert.equal(ledger.gestureMatrixPending.length,17);
assert.equal(new Set(ledger.gestureMatrixPending.map(x=>x.matrixId)).size,17);
const pending=matrix.items.filter(x=>x.iconStatus==="PENDING_EXACT_MASTER");
assert.deepEqual(ledger.gestureMatrixPending.map(x=>x.matrixId).sort(),pending.map(x=>x.id).sort());
assert.equal(ledger.stationVariants.length,3);
for(const station of ledger.stationVariants){
 assert.ok(positions.items.some(x=>x.station===station.station));
 assert.deepEqual(station.cueIds,positions.items.filter(x=>x.station===station.station).map(x=>x.cueId));
}
assert.equal(ledger.conditionalMinisterCandidates.length,11);
assert.deepEqual(ledger.conditionalMinisterCandidates.map(x=>x.id).sort(),minister.branches.map(x=>x.id).sort());
assert.equal(ledger.approvedUnboundArtwork.length,2);
assert.deepEqual(ledger.approvedUnboundArtwork.map(x=>x.existingApprovedAsset).sort(),approved.entries.map(x=>x.asset).sort());
assert.ok(ledger.approvedUnboundArtwork.every(x=>x.runtimeBound===false));
for(const row of [...ledger.gestureMatrixPending,...ledger.stationVariants,...ledger.conditionalMinisterCandidates]){
 assert.ok(row.referenceSourceIds.every(id=>ids.has(id)));
 assert.ok(/ONLY|PENDING|ACTIVATION|REVIEW/i.test(row.publication));
}
for(const s of ledger.sources){
 assert.ok(/^https:\/\//.test(s.url));
 assert.ok(s.rights);
 assert.ok(s.visualEvidence);
 if(!s.rights.startsWith("PUBLIC_DOMAIN"))assert.notEqual(s.rights,"CLEARED_TO_PUBLISH");
}
assert.ok(ledger.sources.find(x=>x.id==="BENZIGER_1945_HANC").rights.includes("UNVERIFIED"));
assert.ok(ledger.sources.find(x=>x.id==="MARIAN_1958_HANC").rights.includes("UNVERIFIED"));
assert.ok(ledger.gestureMatrixPending.find(x=>x.matrixId==="GM.P.C0204.01").decision.includes("HOST_ABOVE"));
console.log("PASS: icon reference research links all 17 exact gesture gaps, 3 station identities, 11 minister cues, and 2 approved but unbound assets; no artwork activated.");
