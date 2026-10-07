import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildReaderShellMarkup, rubricIsStateDuplicate } from "../src/mass/reader-dom.js";

const donor=JSON.parse(readFileSync("data/presentation/mass-v180-donor-parity.v1.json","utf8"));
const stepReconciliation=JSON.parse(readFileSync("data/presentation/mass-v180-v183-step-reconciliation.v1.json","utf8"));
const dom=readFileSync("src/mass/reader-dom.js","utf8");
const gate=readFileSync("src/mass/reader-gate.js","utf8");
const entry=readFileSync("src/mass/browser-entry.js","utf8");
const transients=readFileSync("src/mass/reader-transients.js","utf8");
const nativePreview=readFileSync("src/mass/reader-native-preview.js","utf8");
const iconBank=readFileSync("src/mass/reader-icon-bank.js","utf8");
const iconMap=readFileSync("src/mass/reader-icons.js","utf8");
const masterIcons=JSON.parse(readFileSync("assets/active/mass-v46/manifest.v1.json","utf8"));
const sungText=JSON.parse(readFileSync("data/presentation/reader-text-sung.v1.json","utf8"));
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
assert.match(dom,/data-ao-donor-icon="home"/);
assert.match(dom,/M3\.5 10\.7 12 3\.8l8\.5 6\.9v9\.1h-5\.4v-5\.7H8\.9v5\.7H3\.5z/);
assert.match(dom,/data-ao-donor-icon="preferences"/);
assert.match(dom,/M4 7h10M18 7h2M4 17h2M10 17h10M4 12h5M13 12h7/);
assert.match(dom,/data-role="mass-preferences"/);
assert.match(dom,/\.ao-reader-top-ribbon\{[\s\S]*?height:56px;min-height:56px/,"v1.75 primary ribbon height drifted");
assert.match(dom,/\.ao-state-ribbon\{[\s\S]*?height:64px;min-height:64px/,"v1.76 final-cascade YOU\/GUIDE\/PRIEST ribbon height drifted");
assert.match(dom,/\.ao-progress-track\{[\s\S]*?top:120px;height:2px/,"v1.76 progress line no longer sits at the 120px shell boundary");
assert.match(dom,/\.ao-state-cell>\.ao-icon-mask\{width:52px;height:52px;flex:0 0 52px/,"v1.77 final top posture\/priest icon geometry drifted");
assert.match(dom,/\.ao-rail-item\{[\s\S]*?width:52px;height:52px;min-height:52px/,"desktop rail cards drifted from the v1.77 FINAL authority");
assert.match(dom,/@media\(max-width:760px\)[\s\S]*?\.ao-state-cell>\.ao-icon-mask\{width:52px;height:52px;flex-basis:52px/,"mobile top state icons no longer reflect v1.77 final authority");
assert.match(dom,/@media\(max-width:760px\)[\s\S]*?\.ao-rail-item\{width:48px;height:48px;min-height:48px/,"mobile rail cards drifted from v1.77 FINAL authority");
assert.match(dom,/@media\(max-width:760px\)[\s\S]*?\.ao-card-viewport\{width:100%;padding:0 56px\}/,"mobile centre-reader gutter drifted from v1.65\/v1.76 final family");
assert.match(dom,/@media\(max-width:760px\)[\s\S]*?\.ao-prayer-card\{padding:22px 8px/,"mobile prayer text inset drifted from definitive family geometry");
assert.match(dom,/@media\(max-width:760px\)[\s\S]*?\.ao-schola-dock\{width:calc\(100% - 32px\)/,"mobile Schola dock no longer preserves the v1.64 width retained by v1.80");

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
assert.match(dom,/data-channel="schola-shared"/,
  "v1.76 shared priest/Schola text lost its right-rail state owner");
assert.match(dom,/current\?\.scholaShared!==true/,
  "shared Schola text still reserves duplicate dock territory");

assert.match(dom,/data-channel="gesture"/);
assert.match(dom,/data-channel="priest-voice"/);
assert.match(dom,/data-channel="bell"/);
assert.match(dom,/data-icon-slot="bell"/);
assert.match(dom,/class="ao-icon-mask ao-bell-icon"/);
assert.doesNotMatch(dom,/data-channel="bell"[^>]*><span class="ao-rail-copy"/,
  "active bell rail can render as an empty visual square");
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
assert.match(dom,/\.ao-reader-progress\{[\s\S]*?bottom:calc\(13px \+ var\(--ao-schola-reserve\)\)[\s\S]*?opacity:\.34/,
  "subtle donor card counter disappeared or regained footer chrome");
assert.match(dom,/\.ao-reader-nav button\[data-reader-nav="previous"\]\{left:51px\}/,
  "phone previous arrow drifted from the recovered donor geometry");
assert.match(dom,/\.ao-reader-nav button\[data-reader-nav="next"\]\{right:51px\}/,
  "phone next arrow drifted from the recovered donor geometry");
assert.match(dom,/\.ao-schola-resize\{left:25%;right:45%\}/,
  "mobile Schola resize handle no longer owns an isolated touch lane");
assert.match(dom,/\.ao-schola-meta\{display:grid;grid-template-columns:1fr;gap:8px;margin-top:8px/,
  "v1.76 Schola two-row meta composition regressed");
assert.match(dom,/\.ao-schola-controls\{grid-row:2;width:100%;display:grid;grid-template-columns:38px 58px 38px minmax\(72px,1fr\);gap:6px/,
  "desktop Schola controls no longer match v1.76\/v1.77 definitive grid");
assert.match(dom,/@media\(max-width:760px\)[\s\S]*?\.ao-schola-controls\{grid-template-columns:36px 54px 36px minmax\(66px,1fr\);gap:5px\}/,
  "mobile Schola controls no longer match v1.77 FINAL authority");
assert.match(dom,/\.ao-schola-toggle\{position:absolute;top:3px;left:70%;transform:translateX\(-50%\);right:auto\}/,
  "mobile Schola toggle no longer owns the isolated non-overlapping touch lane");
assert.match(dom,/touch-action:pan-y/,"vertical text scrolling must remain native");
assert.match(dom,/Math\.abs\(dx\)>70&&Math\.abs\(dx\)>Math\.abs\(dy\)\*1\.25/,"horizontal swipe/card threshold missing");
assert.match(dom,/wheelIntent\.amount>=105/,"vertical edge-to-card handoff threshold missing");
assert.match(dom,/data-card-arrival="next"/);
assert.match(dom,/ArrowRight/);
assert.match(dom,/ArrowLeft/);

assert.match(dom,/Guide · 1962 Sung Mass/);
assert.match(dom,/GUIDE_HEADINGS/);
assert.match(dom,/ao-guide-section/);
assert.match(dom,/ao-guide-sources/);
assert.match(dom,/sourceLinks/);
assert.match(dom,/data-rubric-expandable/);
assert.match(dom,/data-state-duplicate/);
assert.equal(rubricIsStateDuplicate("[Kneel.]"),true,"posture-only rubric is not suppressed as a state duplicate");
assert.equal(rubricIsStateDuplicate("[Stand]"),true,"standing-only rubric is not suppressed as a state duplicate");
assert.equal(rubricIsStateDuplicate("[Genuflects — elevates the Sacred Host — replaces It — genuflects]"),false,
  "meaningful ceremonial rubric was incorrectly suppressed");
const sourceRubrics=[];
for(const block of sungText.blocks??[])for(const unit of block.units??[]){
  const value=String(unit.english??unit.latin??"").trim();
  if(/^\[[\s\S]+\]$/.test(value))sourceRubrics.push(value);
}
assert.equal(sourceRubrics.length,15,"Sung source rubric inventory changed without parity review");
assert.ok(Math.max(...sourceRubrics.map(x=>x.length))<=90,
  "reader source regained a verbose in-card rubric that belongs in the Guide");
assert.ok(sourceRubrics.every(x=>!rubricIsStateDuplicate(x)),
  "source corpus contains a posture-only rubric that duplicates the rail owner");

assert.match(dom,/data-schola-translate title="Tap to translate"/);
assert.doesNotMatch(rendered,/ao-schola-translate-hint|tap text · translate/,
  "v1.26 declutter forbids a permanent Schola translation hint");
assert.match(dom,/setScholaPaused\(true\)/,"translation must pause live Schola motion");
assert.match(dom,/scholaPausedBeforeTranslation/);

assert.match(iconMap,/ALTAR_GOSPEL_MISSAL:"priest_centre"/,
  "v1.77 top PRIEST summary regressed to rich Gospel action art");
assert.match(iconMap,/FOOT_CENTER:"priest_foot"/,
  "v1.77 top PRIEST summary lost the plain foot-of-altar pictogram");
assert.match(iconMap,/priestActionIconKey:priestActionKey/,
  "rich v4.6 action art is no longer separately owned by the action channel");
assert.match(nativePreview,/priestAction,bell,schola:scholaProjection\.schola/,
  "native projected state stopped forwarding priest-action or bell semantics into icon resolution");
assert.match(nativePreview,/const cueProjection=activeCueId \? ready\.cueState\.project\(activeCueId\) : null/,
  "exact native cue projection is still subordinated to a legacy/event compatibility gate");
assert.doesNotMatch(nativePreview,/activeCueId && eventAllowed \? ready\.cueState\.project/,
  "legacy event allowance can still suppress an exact native cue");

assert.equal(masterIcons.schema,"ao-mass-v46-master-icon-bank-v1");
assert.equal(masterIcons.count,67);
assert.equal(masterIcons.assets.length,67);
for(const key of ["priest_elevate_host_rich","priest_elevate_chalice_rich","priest_incense_altar_rich","priest_blessing_rich","lavabo","bells","cross","gospel_crosses"]){
  assert.ok(masterIcons.assets.some(x=>x.key===key),"master v4.6 icon missing: "+key);
  assert.ok(iconBank.includes(JSON.stringify(key)),"native icon bank does not expose: "+key);
}

assert.match(dom,/ao-ritual-trigger-live/);
assert.match(dom,/current\.gesture\?\.anchorLat/);
assert.match(dom,/exactCueIds\.includes\(gestureCueId\)/);
assert.doesNotMatch(dom,/includes\(["'`]Iesu Christe["'`]\)|includes\(["'`]Et incarn/i,
  "ritual trigger styling must not infer cue ownership by prayer-text search");

assert.match(transients,/"AO\.SM\.C0174":Object\.freeze\(\{kind:"ELEVATION",title:"ELEVATION",subtitle:"SACRED HOST",durationMs:3450\}\)/);
assert.match(transients,/"AO\.SM\.C0181":Object\.freeze\(\{kind:"ELEVATION",title:"ELEVATION",subtitle:"PRECIOUS BLOOD",durationMs:3450\}\)/);
assert.match(transients,/presentationHoldMs:presentationSpec\?\.kind==="ELEVATION" \? 3600/);
assert.match(dom,/data-icon-slot="cinematic"/,"v1.80 elevation cinema lost canonical action artwork slot");
assert.match(dom,/ao-icon-direct/,"rich v4.6 master direct-render path is missing");
assert.match(dom,/const direct=\/_rich\$\//,"rich master resolver no longer distinguishes the v4.6 PNG-silhouette family");
assert.match(dom,/el\.style\.backgroundImage=css/,"rich master direct rendering is not wired");
assert.match(dom,/kind==="ELEVATION" \? current\.priestActionIconKey : null/,
  "elevation cinema no longer consumes the exact current priest-action art");
assert.match(dom,/@keyframes aoBellHold\{/,"v1.80 held-bell animation is missing");
assert.match(dom,/animation:aoBellHold 3\.4s ease-out both/,"v1.80 held-bell salience duration drifted");

assert.deepEqual(donor.open,[]);
assert.equal(donor.status,"CERTIFIED");
assert.equal(donor.releaseBlocker,null);
assert.deepEqual(donor.certified.map(x=>x.id),[
  "V180_TWO_AXIS_NAVIGATION",
  "V180_SCHOLA_INTERACTION_PARITY",
  "V179_GUIDE_CURATED_PRESENTATION",
  "V180_RUBRIC_EFFICIENCY",
  "V46_MASTER_ICON_PARITY",
]);
assert.ok(donor.certified.every(x=>x.status==="CERTIFIED"),"a closed v1.80 donor-parity gate lost certification");
assert.equal(stepReconciliation.status,"RECONCILED_FOR_PRODUCT_NONHISTORICAL");
assert.equal(stepReconciliation.authorities.presentationDonor.livePrayerCards,38);
assert.equal(stepReconciliation.authorities.canonicalSource.steps,39);
assert.equal(stepReconciliation.arithmetic.recoveredProductDecompressions,9);
assert.equal(stepReconciliation.authorities.productionPresentation.steps,48);
assert.equal(stepReconciliation.historicalGap.exactBoundaryRecovered,false);
assert.equal(stepReconciliation.historicalGap.releaseImpact,"NONE_UNLESS_HISTORICAL_V183_IDENTITY_IS_CLAIMED");
assert.equal(stepReconciliation.invariants.includes("historicalV183IdentityClaim remains false"),true);

assert.equal(donor.certification.r17MassConvergenceRun,37591506346);
assert.equal(donor.certification.appConvergenceRun,37591506503);
assert.equal(donor.certification.visualAcceptanceRun,37591506362);
console.log("Mass v1.80 donor parity contract: CERTIFIED — two-axis navigation, Schola, Guide, rubric efficiency and exact v4.6 master-bank parity are regression-locked.");
