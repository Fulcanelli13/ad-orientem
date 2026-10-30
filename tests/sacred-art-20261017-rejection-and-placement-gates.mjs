import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const root = new URL("../", import.meta.url);
const freeze = JSON.parse(readFileSync(new URL("data/research/sacred-art-user-frozen-decisions-20261017.v1.json",root)));
const bridge = JSON.parse(readFileSync(new URL("data/research/sacred-art-curated-placement-handoff-20261017.v1.json",root)));
const approvals = new Set(freeze.approved.map(x=>x.artworkId));
const rejects = new Set(freeze.rejected.map(x=>x.artworkId));
assert.equal(approvals.size,107);assert.equal(rejects.size,68);
assert.equal(freeze.counts.explicitlyLockedArtworkIDs,90);
assert.equal(bridge.counts.dateWitnessRows,365);
assert.equal(bridge.relations.length,152);
for(const p of bridge.relations){
 assert(approvals.has(p.artworkId), "unapproved art entered bridge");
 assert(!rejects.has(p.artworkId), "rejected art entered bridge");
 assert.equal(p.visibleInProduction,false);
 assert.equal(p.imageExactOriginalRightsCropVerified,false);
 assert.equal(p.calendarProperPassageVerified,false);
 if(p.target.type==="LITURGICAL_DATE")assert(p.evidence.observedPrincipalId);
 if(p.relationClass.startsWith("SECONDARY"))assert.equal(p.primaryEligibleForEditorialReview,false);
}
assert.equal(bridge.releaseGate.authorisedForProduction,false);
assert(bridge.exactnessCorrections.some(x=>x.paintingSubject==="The Finding of Moses"));
console.log("Sacred Art 2026-10-17 freeze and placements: PASS");
