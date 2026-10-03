import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolveReaderUiMode } from "../src/mass/reader-gate.js";
import { LIVE_STRUCTURE_STATUS, structureSupport } from "../src/mass/reader-structure.js";

const load=(path)=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const release=load("../data/presentation/reader-release-gate.v1.json");
const parity=load("../data/presentation/v1.83-reader-parity-gate.v1.json");
const recovery=load("../data/presentation/v1.83-reader-map-recovery.v1.json");
const regressions=load("../data/presentation/v1.83-regression-ledger.v1.json");

assert.equal(release.status,"BLOCKED_PENDING_V1_83_PARITY");
assert.equal(release.productionDefault,"LEGACY");
assert.equal(resolveReaderUiMode({}),"LEGACY","reader default changed before release certification");
assert.equal(release.certificationPolicy.greenUnitCIIsNotReleaseCertification,true);
assert.equal(release.certificationPolicy.requireLegacyDefaultUntilCertified,true);

assert.equal(parity.reference.expectedLiveCards,48);
assert.equal(parity.currentR17.status,"NOT_PARITY_COMPLETE");
assert.equal(recovery.status,"PARTIAL_EVIDENCE_ONLY_DO_NOT_RENDER");
assert.equal(recovery.lineage.v183FrozenLiveCards,48);
assert.equal(Object.hasOwn(recovery,"cards"),false,"partial recovery evidence became a render map");

assert.equal(regressions.status,"ACTIVE_REGRESSION_LOCKDOWN");
const regressionById=new Map(regressions.entries.map(entry=>[entry.id,entry]));
assert.equal(regressionById.get("V181-HOST-ELEVATION-EARLY").status,"FIXED_AND_TESTED_R17");
assert.equal(regressionById.get("V181-CHALICE-ELEVATION-EARLY").status,"FIXED_AND_TESTED_R17");
assert.equal(regressionById.get("V181-CARD-TRANSIENT-LEAK").status,"FIXED_AND_TESTED_R17");
assert.deepEqual(regressionById.get("V181-CARD-TRANSIENT-LEAK").fixedChannels,["gesture","response","bell","cinematic"]);
assert.deepEqual(regressionById.get("V181-CARD-TRANSIENT-LEAK").openChannels,[]);
assert.equal(regressionById.get("V183-GRADUAL-COMPOSITION").status,"BLOCKED_ON_FINAL_48_CARD_ARCHITECTURE");
assert.equal(regressionById.get("V181-PAX-OWNERSHIP").status,"MECHANICS_TESTED_SOURCE_CERTIFICATION_PENDING");
assert.equal(regressionById.get("V183-NATIVE-LIVE-GATE-BYPASS").status,"FIXED_AND_TESTED_R17");

assert.equal(LIVE_STRUCTURE_STATUS,"PROVISIONAL_V1_65_DONOR_ONLY");
const livePrepared={
  readerPreferences:{mode:"LIVE"},
  session:{
    resolvedMass:{form:"MISSA_CANTATA_INCENSE",presentationMode:"LIVE"},
    plan:{kind:"MASS",precedingGraphs:[],followingGraphs:[],overlayGraphs:[]},
  },
};
const support=structureSupport(livePrepared);
assert.equal(support.supported,false);
assert.equal(support.reason,"V1_83_48_CARD_LIVE_MAP_REQUIRED");

const blockers=new Set(release.openBlockers.map(x=>x.id));
for(const id of [
  "G6_48_CARD_MAP",
  "GRADUAL_LIVE_ARCHITECTURE",
  "FORM_STATE_PARITY",
  "SPECIAL_STRUCTURE_PARITY",
  "PHONE_BROWSER_ACCEPTANCE",
  "PROPER_FIXTURE_PROVENANCE",
  "SOLEMN_PAX_TRANSFER_AUTHORITY",
  "PLAN_AWARE_OBJECTIVE_RUNTIME",
]) assert.ok(blockers.has(id),"release blocker silently disappeared: "+id);

const icons=release.protectedInvariants.find(x=>x.id==="ICON_ASSET_BANK_NATIVE");
assert.equal(icons?.status,"CERTIFIED_HOST_BANK_BRIDGE","icon blocker disappeared without native bank certification");
assert.equal(icons?.failClosedOnMissingAssets,true,"icon bank stopped failing closed");

const schola=release.protectedInvariants.find(x=>x.id==="SCHOLA_NATIVE_OWNERSHIP");
assert.equal(schola?.status,"CERTIFIED_MISSA_CANTATA","Schola blocker disappeared without native ownership certification");
assert.match(String(schola?.controller??""),/reader-schola\.js/,"Schola native controller invariant lost");

const guide=release.protectedInvariants.find(x=>x.id==="GUIDE_REGISTRY_CONTINUITY");
assert.equal(guide?.status,"RECOVERED_CONTINUITY_CERTIFIED","Guide blocker disappeared without continuity certification");
assert.equal(guide?.entryCount,32,"Guide continuity invariant lost 32-entry scope");

const host=release.protectedInvariants.find(x=>x.id==="HOST_ELEVATION_GATE");
const chalice=release.protectedInvariants.find(x=>x.id==="CHALICE_ELEVATION_GATE");
assert.deepEqual(
  {words:host.wordsCue,action:host.actionCue},
  {words:"AO.SM.C0173",action:"AO.SM.C0174"}
);
assert.deepEqual(
  {wordsThrough:chalice.wordsThroughCue,action:chalice.actionCue},
  {wordsThrough:"AO.SM.C0180",action:"AO.SM.C0181"}
);

const communionEvents=JSON.parse(readFileSync(new URL("../data/mass/mc-events-05.v1.json",import.meta.url),"utf8")).events;
const byId=new Map(communionEvents.map(event=>[event.id,event]));
assert.deepEqual(byId.get("MC-COM-150").conditions,[],
  "frozen canonical peace-prayer event was mutated instead of plan-projected");
assert.deepEqual(byId.get("MC-COM-160").conditions,["FORM_IS_SOLEMN"],
  "frozen canonical ministerial Pax event was mutated instead of plan-projected");
assert.deepEqual(byId.get("MC-COM-100").conditions,[],
  "Pax Domini was conflated with a plan-specific Pax suppression");
const objectiveSource=readFileSync(new URL("../src/mass/objective-engine.js",import.meta.url),"utf8");
assert.match(objectiveSource,/applyMassPlanTraversalDelta/);
assert.match(objectiveSource,/MC-COM-150/);
assert.match(objectiveSource,/MC-COM-160/);

const nativeSource=readFileSync(new URL("../src/mass/reader-native-preview.js",import.meta.url),"utf8");
assert.match(nativeSource,/allowPresentationModeSwitch:false/);
assert.match(nativeSource,/const structuralSupport=structureSupport\(prepared\)/);
assert.match(nativeSource,/V1_83_48_CARD_LIVE_MAP_REQUIRED|structuralSupport\.reason/);
assert.match(nativeSource,/V1_83_CARD_TRANSITION_CLEARED/);
assert.match(nativeSource,/isGloriaCredoGestureSourceCue/);
assert.match(nativeSource,/guideForSequence/,"native reader lost recovered Guide registry binding");
assert.match(nativeSource,/createNativeScholaController/,"native reader lost native Schola controller");
assert.match(nativeSource,/createReaderTransientController/,"native reader lost native bell\/cinematic controller");
assert.match(nativeSource,/r17OwnerBell/,"native reader lost bell ownership diagnostics");
assert.match(nativeSource,/r17OwnerCinematic/,"native reader lost cinematic ownership diagnostics");
assert.doesNotMatch(nativeSource,/#scholaDock|#scholaStreamLine/,"native reader reintroduced legacy Schola DOM donor");
assert.match(nativeSource,/iconKeysForReaderState/,"native reader lost approved icon-key projection");
const browserEntrySource=readFileSync(new URL("../src/mass/browser-entry.js",import.meta.url),"utf8");
assert.match(browserEntrySource,/createHostIconResolver/,"browser entry lost host icon resolver");
assert.match(browserEntrySource,/R17_ICON_BANK_INCOMPLETE/,"browser entry stopped failing closed on incomplete icon bank");

const cueSource=readFileSync(new URL("../src/mass/reader-cue-state.js",import.meta.url),"utf8");
assert.match(cueSource,/V183_GESTURE_SUPPRESS/);
assert.match(cueSource,/"AO\.SM\.C0181":"AO\.SM\.C0179"/);

const convergenceWorkflow=readFileSync(new URL("../.github/workflows/r17-mass-convergence.yml",import.meta.url),"utf8");
assert.match(convergenceWorkflow,/data\/presentation\/\*\*/);
assert.match(convergenceWorkflow,/index\.html/);

const baselineWorkflow=readFileSync(new URL("../.github/workflows/baseline-integrity.yml",import.meta.url),"utf8");
assert.match(baselineWorkflow,/data-ao-r17-browser-entry/);
assert.match(baselineWorkflow,/refusing to overwrite migrated index\.html/);

const { readdirSync } = await import("node:fs");
const massSourceDir=new URL("../src/mass/",import.meta.url);
for(const name of readdirSync(massSourceDir)){
  if(!name.endsWith(".js")) continue;
  const source=readFileSync(new URL(name,massSourceDir),"utf8");
  assert.doesNotMatch(source,/document\.title\s*=/,
    name+" reintroduced historical document.title mutation");
  assert.doesNotMatch(source,/data:image\//,
    name+" embedded an oversized image payload into modular Mass source");
}

console.log("reader regression lockdown: PASS — known v1.83 invariants are protected and release remains explicitly blocked.");

const transientSource=readFileSync(new URL("../src/mass/reader-transients.js",import.meta.url),"utf8");
assert.match(transientSource,/AO\.SM\.C0145/);
assert.match(transientSource,/AO\.SM\.C0161/);
assert.match(transientSource,/AO\.SM\.C0174/);
assert.match(transientSource,/AO\.SM\.C0181/);
assert.match(transientSource,/AO\.SM\.C0225/);
assert.match(transientSource,/canonicalAuthority:false/,"cinematic presentation acquired canonical authority");

assert.match(transientSource,/AO\.SM\.C0204/,"minor elevation cinematic anchor lost");
assert.match(transientSource,/AO\.SM\.C0242/,"Ecce Agnus Dei cinematic anchor lost");
assert.match(transientSource,/AO\.SM\.C0265/,"final blessing cinematic anchor lost");
