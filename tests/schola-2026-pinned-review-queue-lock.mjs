import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
const root=new URL("../",import.meta.url);
const load=(name)=>JSON.parse(readFileSync(new URL(name,root),"utf8"));
const out=".tmp/schola-1962-selected-annual/";
const lock=load("data/research/schola-2026-pinned-selected-mass-review-lock.v1.json");
const annual=load(out+"2026-proper-source-identity-manifest.json");
const repeat=load(out+"2026-proper-17date-independent-repeatability.json");
const review=load(out+"2026-selected-proper-first60-print-review.json");
const textAudit=load(out+"2026-first60-complete-antiphon-text-audit.json");
const print=load(out+"2026-first60-1961-printed-music-proof-gate.json");
const sha=(value)=>createHash("sha256").update(JSON.stringify(value),"utf8").digest("hex");
assert.equal(lock.schema,"ao-schola-2026-pinned-selected-mass-review-lock-v1");
assert.equal(lock.sourceIdentity.calendarDays,365);
assert.equal(annual.counters.civilDays,365);
assert.equal(annual.counters.ready,365,
 "No failed English 1962 Proper may silently enter a ranked source queue");
assert.equal(annual.counters.blocked,0);
assert.equal(repeat.summary.stable,true,
 "Two independent 17-day DayResolvers must agree on original source identity");
assert.equal(repeat.summary.reproduced,17);
assert.equal(annual.calendar.length,365);
// Diagnostics (e.g. optional 404 fallbacks) may differ between requests.
// Hash only liturgically authoritative selected-Mass identity, not transport
// traces or whether an already-loaded file is described as ready/cached.
const canonical365=annual.calendar.map(({date,principalId,sourcePath,
 selectedProperSha256})=>({date,principalId,sourcePath,selectedProperSha256}));
assert.ok(annual.calendar.every(r=>r.resolverStatus==="ready"&&
 ["ready","cached"].includes(String(r.properStatus).toLowerCase())));
assert.equal(sha(canonical365),
 lock.sourceIdentity.sha256OfCanonical365SourceIdentities,
 "The original 365-day selected Proper identity lock has changed; re-audit the source and calendar, never update expected counts silently");
assert.equal(review.candidates.length,60);
assert.deepEqual(review.batch.quotaByPart,lock.first60Review.perFamily);
const scores=review.candidates.map(c=>({
 scoreId:c.scoreId,part:c.part,sourceGabcSha256:c.scoreGabcSha256,
 date:c.representative.date,sourcePath:c.representative.sourcePath,
 selectedParagraphId:c.representative.sourceParagraphId
}));
assert.equal(sha(scores),lock.first60Review.sha256OfCanonical60SelectedScoreIdentities,
 "Original first60 source-owner/score-GABC identity drifted; no automatic rank or song replacement");
assert.equal(textAudit.counts.fullAntiphonLexicalEqual,lock.first60Review.exactAntiphonText);
assert.equal(textAudit.counts.literalDifferenceHolds,lock.first60Review.explicitTextVariantHolds);
assert.deepEqual(textAudit.textDifferenceHolds.map(x=>x.scoreId),
 lock.first60Review.heldScoreIds,
 "The original textual variant holds must not silently become approved exact chants");
assert.deepEqual(print.firstTwelveForPrintComparison,
 lock.first60Review.priorityFirst12);
assert.ok(review.candidates.every(x=>
 x.publication==="EDITORIAL_HOLD_NOT_PUBLIC"&&
 x.approvedForMassReader===false));
assert.equal(print.counts.newlyPublicScores,0);
assert.equal(textAudit.publication.publicReaderScores,0);
assert.equal(print.publication.publicScores,0);
assert.equal(lock.musicalPublication.approvedScores,0);
// The source-identity gate must also detect a fake one-character change.
const corrupted=structuredClone(canonical365);
corrupted[0].selectedProperSha256="0".repeat(64);
assert.notEqual(sha(corrupted),lock.sourceIdentity.sha256OfCanonical365SourceIdentities);
console.log("PASS 365/365 selected 1962 Proper source-lock + 17/17 independent reproducibility, "+
 "60 authentic GABC candidate identities, 50 exact Latin/10 variants held, first12 original 1961 sources, 0 musical approvals");
