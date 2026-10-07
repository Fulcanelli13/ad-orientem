import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildReaderShellMarkup } from "../src/mass/reader-dom.js";

const donor=JSON.parse(readFileSync("data/presentation/mass-v180-donor-parity.v1.json","utf8"));
const stepReconciliation=JSON.parse(readFileSync("data/presentation/mass-v180-v183-step-reconciliation.v1.json","utf8"));
const dom=readFileSync("src/mass/reader-dom.js","utf8");
const gate=readFileSync("src/mass/reader-gate.js","utf8");
const entry=readFileSync("src/mass/browser-entry.js","utf8");
const transients=readFileSync("src/mass/reader-transients.js","utf8");
const rendered=buildReaderShellMarkup({
  readerPreferences:{mode:"LIVE"},
  session:{resolvedMass:{presentationMode:"LIVE",actualCelebration:{title:"Mass"}}},
});

assert.equal(donor.schema,"ao-mass-v180-donor-parity-v1");
assert.equal(donor.donor.sha256,"4e8dc4a0148590aee95d6fd36d8c915a1c1d35097c1d235e96a17791cb7d5543");
assert.equal(donor.donor.sizeBytes,13713627);
assert.equal(donor.donor.totalLines,8543);
assert.equal(donor.donor.authority,"PRIMARY_PRESENTATION_INTERACTION_DONOR");

assert.match(gate,/READER_UI_MODES\s*=\s*Object\.freeze\(\[["']NATIVE["']\]\)/);
assert.doesNotMatch(entry,/\.startLive\s*\(|runReaderShadowAudit|LEGACY_EXPLICIT_ROLLBACK|LEGACY_SHADOW_AUDIT/);

assert.match(dom,/data-reader-home/);
assert.match(dom,/data-role="section-jump"/);
assert.match(dom,/data-reader-preferences/);
assert.match(dom,/data-role="mass-preferences"/);
assert.match(rendered,/data-reader-mode="MISSAL"/);
assert.match(rendered,/data-reader-mode="SIMPLE"/);
assert.match(rendered,/data-reader-mode="LIVE"/);

assert.match(dom,/>YOU</);
assert.match(dom,/>GUIDE</);
assert.match(dom,/>PRIEST</);
assert.match(dom,/data-icon-slot="posture-top"/);
assert.match(dom,/data-icon-slot="priest-position"/);
assert.match(dom,/data-role="priest-action-badge"/);
assert.match(dom,/data-channel="priest-action"/);

assert.match(dom,/data-channel="gesture"/);
assert.match(dom,/data-channel="priest-voice"/);
assert.match(dom,/data-channel="bell"/);
assert.match(dom,/\.ao-rail-copy\{display:none!important\}/);
assert.match(dom,/border:0;border-radius:0;background:transparent;box-shadow:none/);
assert.doesNotMatch(dom,/grid-template-columns:repeat\(3,1fr\).*ao-reader-top-ribbon/);

assert.match(dom,/data-role="schola-page"/);
assert.match(dom,/data-role="schola-progress"/);
assert.match(dom,/data-role="schola-translation"/);
assert.match(dom,/data-schola-translate/);
assert.match(dom,/SCHOLA_SPEEDS=Object\.freeze\(\[0\.25,0\.35,0\.45,0\.60,0\.80,1\.00\]\)/);
assert.match(dom,/SCHOLA_SPEED_STORAGE_KEY="ao-schola-speed"/);
assert.match(dom,/data-schola-slower/);
assert.match(dom,/data-schola-faster/);
assert.match(dom,/data-schola-pause/);
assert.match(dom,/\.ao-schola-dock\{\s*position:absolute;z-index:9;/,
  "Schola dock z-layer changed without interaction review");
assert.match(dom,/\.ao-reader-nav\{position:absolute;z-index:10;/,
  "reader navigation z-layer changed without interaction review");
assert.match(dom,/data-schola-visible="true"\] \.ao-reader-nav button\[data-reader-nav="previous"\]\{left:8px\}/,
  "Schola-visible phone previous arrow no longer clears the dock footprint");
assert.match(dom,/data-schola-visible="true"\] \.ao-reader-nav button\[data-reader-nav="next"\]\{right:8px\}/,
  "Schola-visible phone next arrow no longer clears the dock footprint");
assert.match(dom,/ao-ritual-trigger-live/);
assert.match(dom,/current\.gesture\?\.anchorLat/);
assert.match(dom,/exactCueIds\.includes\(gestureCueId\)/);
assert.doesNotMatch(dom,/includes\(["'`]Iesu Christe["'`]\)|includes\(["'`]Et incarn/i,
  "ritual trigger styling must not infer cue ownership by prayer-text search");

assert.match(transients,/"AO\.SM\.C0174":Object\.freeze\(\{kind:"ELEVATION",title:"ELEVATION",subtitle:"SACRED HOST",durationMs:3450\}\)/);
assert.match(transients,/"AO\.SM\.C0181":Object\.freeze\(\{kind:"ELEVATION",title:"ELEVATION",subtitle:"PRECIOUS BLOOD",durationMs:3450\}\)/);
assert.match(transients,/presentationHoldMs:presentationSpec\?\.kind==="ELEVATION" \? 3600/);

assert.deepEqual(donor.open,[]);
assert.equal(donor.status,"IMPLEMENTATION_COMPLETE_AWAITING_CI");
assert.equal(stepReconciliation.status,"RECONCILED_FOR_PRODUCT_NONHISTORICAL");
assert.equal(stepReconciliation.authorities.presentationDonor.livePrayerCards,38);
assert.equal(stepReconciliation.authorities.canonicalSource.steps,39);
assert.equal(stepReconciliation.arithmetic.recoveredProductDecompressions,9);
assert.equal(stepReconciliation.authorities.productionPresentation.steps,48);
assert.equal(stepReconciliation.historicalGap.exactBoundaryRecovered,false);
assert.equal(stepReconciliation.historicalGap.releaseImpact,"NONE_UNLESS_HISTORICAL_V183_IDENTITY_IS_CLAIMED");
assert.equal(stepReconciliation.invariants.includes("historicalV183IdentityClaim remains false"),true);

console.log("Mass v1.80 donor parity contract: PASS — v1.80 presentation is implemented, 38→48 is explicitly non-historical, and only CI certification remains.");
