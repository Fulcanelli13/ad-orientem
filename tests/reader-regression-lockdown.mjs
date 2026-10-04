import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolveReaderUiMode } from "../src/mass/reader-gate.js";
import { LIVE_STRUCTURE_STATUS, structureSupport } from "../src/mass/reader-structure.js";

const load=(path)=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const release=load("../data/presentation/reader-release-gate.v1.json");
const parity=load("../data/presentation/v1.83-reader-parity-gate.v1.json");
const recovery=load("../data/presentation/v1.83-reader-map-recovery.v1.json");
const regressions=load("../data/presentation/v1.83-regression-ledger.v1.json");

assert.equal(release.status,"BLOCKED_PENDING_SPECIAL_STRUCTURE_PARITY");
assert.equal(release.productionDefault,"LEGACY");
assert.equal(resolveReaderUiMode({}),"LEGACY","reader default changed before release certification");
assert.equal(release.certificationPolicy.greenUnitCIIsNotReleaseCertification,true);
assert.equal(release.certificationPolicy.requireLegacyDefaultUntilCertified,true);

assert.equal(parity.reference.expectedLiveCards,48);
assert.equal(parity.currentR17.status,"SOURCE_FIRST_LIVE_INTEGRATED");
assert.equal(parity.currentR17.nativeReaderCards,39);
assert.equal(parity.currentR17.sourceFirstCanonSegments,14);
assert.equal(parity.status,"HISTORICAL_PARITY_REFERENCE_NON_BLOCKING");
assert.equal(parity.releaseAuthority,false);
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
assert.equal(regressionById.get("V183-GRADUAL-COMPOSITION").status,"RECOVERED_AND_CONTRACT_LOCKED");
assert.equal(regressionById.get("V181-PAX-OWNERSHIP").status,"CERTIFIED_PRIMARY_1962_RUBRIC");
assert.equal(regressionById.get("V183-NATIVE-LIVE-GATE-BYPASS").status,"FIXED_AND_TESTED_R17");

assert.equal(LIVE_STRUCTURE_STATUS,"SOURCE_FIRST_FULL_MASS_CERTIFIED");
const livePrepared={
  readerPreferences:{mode:"LIVE"},
  session:{
    resolvedMass:{form:"MISSA_CANTATA_INCENSE",presentationMode:"LIVE"},
    plan:{kind:"MASS",precedingGraphs:[],followingGraphs:[],overlayGraphs:[]},
  },
};
const support=structureSupport(livePrepared);
assert.equal(support.supported,true);
assert.equal(support.reason,null);

const blockers=new Set(release.openBlockers.map(x=>x.id));
for(const id of [
  "SPECIAL_STRUCTURE_PARITY",
]) assert.ok(blockers.has(id),"release blocker silently disappeared: "+id);
assert.equal(blockers.has("FORM_STATE_PARITY"),false,"closed form-state blocker reappeared");
for(const [id,status] of [["LOW_MASS_NATIVE_STATE","CERTIFIED"],["SOLEMN_MASS_NATIVE_STATE","CERTIFIED"],["FORM_SWITCH_NO_LEGACY_FALLBACK","CERTIFIED"],["FORM_PARITY_REGRESSION","PASS"]]){
  assert.equal(release.protectedInvariants.find(x=>x.id===id)?.status,status,id+" release gate lost certification");
}
const formSwitch=release.protectedInvariants.find(x=>x.id==="FORM_SWITCH_NO_LEGACY_FALLBACK");
assert.ok(formSwitch?.channels?.includes("priestAction"),"priest-action ownership disappeared from form-switch gate");
assert.match(String(formSwitch?.transientPolicy??""),/native-certified/i,"form transients lost native certification");

const liveStructure=release.protectedInvariants.find(x=>x.id==="LIVE_SOURCE_STRUCTURE_INTEGRATION");
assert.equal(liveStructure?.status,"CERTIFIED","LIVE blocker disappeared without source-first certification");
assert.equal(liveStructure?.totalLiveSteps,39);
assert.equal(liveStructure?.sourceFirstCanonSteps,14);
assert.equal(liveStructure?.replacedCanonMacroSteps,5);
assert.equal(liveStructure?.historical48RequiredForRelease,false);
assert.equal(liveStructure?.historicalLive20ReleaseAuthority,false);
const phoneAcceptance=release.protectedInvariants.find(x=>x.id==="PHONE_BROWSER_ACCEPTANCE");
assert.equal(phoneAcceptance?.status,"CERTIFIED_CHROMIUM_TOUCH","phone acceptance certification disappeared");
assert.match(String(phoneAcceptance?.test??""),/reader-phone-acceptance\.mjs/,"phone acceptance test is not pinned");
assert.ok((phoneAcceptance?.guarantees??[]).some(x=>/AO\.SM\.C0173/.test(x)),"pre-elevation phone focus invariant disappeared");
assert.ok((phoneAcceptance?.defectsClosed??[]).some(x=>/cue-id regex/i.test(x)),"browser cue-id regression closure disappeared");

const modeSwitch=release.protectedInvariants.find(x=>x.id==="NATIVE_MODE_SWITCH");
assert.equal(modeSwitch?.status,"INITIAL_MODE_PHONE_CERTIFIED__IN_READER_SWITCH_DEFERRED_NON_BLOCKING");
assert.match(String(modeSwitch?.reason??""),/selected before Mass/i);
assert.match(String(modeSwitch?.reason??""),/locked/i);

const plannedRuntime=release.protectedInvariants.find(x=>x.id==="PLAN_AWARE_OBJECTIVE_RUNTIME");
assert.equal(plannedRuntime?.status,"CERTIFIED_LOW_SOLEMN_RUNTIME_OWNERSHIP",
  "planned objective runtime blocker disappeared without runtime certification");
assert.equal(plannedRuntime?.engine,"buildPlannedObjectiveTraversal");
assert.equal(plannedRuntime?.sourceGraphMutation,false);
assert.deepEqual(plannedRuntime?.forms,["LOW","SOLEMN"]);

const formTransient=release.protectedInvariants.find(x=>x.id==="FORM_TRANSIENT_PARITY");
assert.equal(formTransient?.status,"CERTIFIED","form transient parity blocker disappeared without certification");
assert.deepEqual(formTransient?.forms,["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const bellNative=release.protectedInvariants.find(x=>x.id==="BELL_CINEMATIC_NATIVE_OWNERSHIP");
assert.equal(bellNative?.formParity?.low?.bellCueCount,4,"Low bell parity count changed");
assert.deepEqual(bellNative?.formParity?.low?.certifiedAbsentCueIds,["AO.SM.C0225"]);
assert.equal(bellNative?.formParity?.solemn?.bellCueCount,5,"Solemn bell parity count changed");

const formLifecycle=release.protectedInvariants.find(x=>x.id==="FORM_LIFECYCLE_PARITY");
assert.equal(formLifecycle?.status,"CERTIFIED","form lifecycle blocker disappeared without certification");
assert.match(String(formLifecycle?.controller??""),/form-lifecycle\.js/);
assert.deepEqual(formLifecycle?.forms,["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);

const solemnPax=release.protectedInvariants.find(x=>x.id==="SOLEMN_PAX_TRANSFER_AUTHORITY");
assert.equal(solemnPax?.status,"CERTIFIED","Solemn Pax blocker disappeared without primary-source certification");
assert.equal(solemnPax?.canonicalEventId,"MC-COM-160");
assert.equal(solemnPax?.readerCueId,"AO.SM.C0225");
assert.equal(solemnPax?.authorityTier,"A");
assert.equal(solemnPax?.readerOwner,"R18_SOLEMN_PAX_PRIMARY_SOURCE");
const solemnPaxSeparation=release.protectedInvariants.find(x=>x.id==="SOLEMN_PAX_SEPARATION");
assert.equal(solemnPaxSeparation?.status,"CERTIFIED_PRIMARY_1962_RUBRIC");
assert.equal(solemnPaxSeparation?.paxDominiEvent,"MC-COM-100");
assert.equal(solemnPaxSeparation?.peacePrayerEvent,"MC-COM-150");
assert.equal(solemnPaxSeparation?.ministerialPaxEvent,"MC-COM-160");

const gradualArchitecture=release.protectedInvariants.find(x=>x.id==="GRADUAL_LIVE_ARCHITECTURE");
assert.equal(gradualArchitecture?.status,"RECOVERED_CONTRACT_LOCKED__SOURCE_FIRST_LIVE_INTEGRATED",
  "Gradual architecture blocker disappeared without recovered contract lock");
assert.equal(gradualArchitecture?.gradualBlock,"AO.SM.B021");
assert.equal(gradualArchitecture?.alleluiaTractBlock,"AO.SM.B022");
assert.equal(gradualArchitecture?.mundaStartBlock,"AO.SM.B023");
assert.equal(gradualArchitecture?.mergeB021B022Allowed,false);

const ashPayload=release.protectedInvariants.find(x=>x.id==="ASH_NATIVE_PAYLOAD");
assert.equal(ashPayload?.status,"CERTIFIED_MODULAR_RUNTIME__PRODUCTION_PREVIEW_PENDING","Ash runtime certification disappeared");
assert.equal(ashPayload?.recoveredGraphRecords,8,"Ash source scope changed");
assert.equal(ashPayload?.readerCards,5,"Ash reader-card contract changed");
assert.match(String(ashPayload?.controller??""),/reader-ash\.js/,"Ash controller is not pinned");

const palmPayload=release.protectedInvariants.find(x=>x.id==="PALM_NATIVE_PAYLOAD");
assert.equal(palmPayload?.status,"CERTIFIED_MODULAR_RUNTIME__PRODUCTION_PREVIEW_PENDING","Palm runtime certification disappeared");
assert.equal(palmPayload?.recoveredGraphRecords,12,"Palm source scope changed");
assert.equal(palmPayload?.readerCards,7,"Palm reader-card contract changed");
assert.match(String(palmPayload?.controller??""),/reader-palm\.js/,"Palm controller is not pinned");

const aspergesPayload=release.protectedInvariants.find(x=>x.id==="ASPERGES_NATIVE_PAYLOAD");
assert.equal(aspergesPayload?.status,"CERTIFIED_NATIVE_PREVIEW__PHONE_TOUCH","Asperges native-preview certification disappeared");
assert.match(String(aspergesPayload?.controller??""),/reader-asperges\.js/,"Asperges controller is not pinned");
assert.equal(aspergesPayload?.recoveredGraphRecords,6,"Asperges six-record source scope changed");
assert.equal(aspergesPayload?.readerCards,5,"Asperges reader-card contract changed");
assert.match(String(aspergesPayload?.nativePreview??""),/reader-native-preview\.js/,"Asperges native preview owner is not pinned");
assert.match(String(aspergesPayload?.phoneTest??""),/reader-phone-acceptance\.mjs/,"Asperges phone acceptance is not pinned");

const rogationsPayload=release.protectedInvariants.find(x=>x.id==="ROGATIONS_NATIVE_PAYLOAD");
assert.equal(rogationsPayload?.status,"CERTIFIED_MODULAR_RUNTIME","Rogations runtime certification disappeared");
assert.equal(rogationsPayload?.recoveredGraphRecords,6,"Rogations source scope changed");
assert.equal(rogationsPayload?.readerCards,8,"Rogations reader-card contract changed");
assert.equal(rogationsPayload?.textRows,171,"Rogations full Litany row denominator changed");
assert.match(String(rogationsPayload?.controller??""),/reader-rogations\.js/,"Rogations controller is not pinned");
assert.equal(rogationsPayload?.sourceCorpus?.precesBlobSha,"aa8197cca3cbca14e7da11004a2111d58d49cf82");
assert.equal(rogationsPayload?.sourceCorpus?.psalm69BlobSha,"0b2b3c64b1ccb8637107f3c71100d583e111df24");

const specialStructure=release.protectedInvariants.find(x=>x.id==="SPECIAL_STRUCTURE_PLAN_PROJECTION");
assert.equal(specialStructure?.status,"CERTIFIED_COMPILED_PLAN_STRUCTURE","special-structure plan certification disappeared");
assert.match(String(specialStructure?.controller??""),/reader-special-structure\.js/,"special-structure projection controller is not pinned");
assert.ok(release.openBlockers.some(x=>x.id==="SPECIAL_STRUCTURE_PARITY"),"special-structure payload blocker disappeared before native rite payload exists");

const properProvenance=release.protectedInvariants.find(x=>x.id==="PROPER_FIXTURE_PROVENANCE");
assert.equal(properProvenance?.status,"CERTIFIED_REPLACEMENT_WITNESS",
  "Proper fixture provenance blocker disappeared without certified replacement witness");
assert.match(String(properProvenance?.witnessFile??""),/golden-proper-witnesses\.v1\.json/,
  "Proper fixture replacement witness file is not pinned");

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
const readerObjectiveSource=readFileSync(new URL("../src/mass/reader-objective-runtime.js",import.meta.url),"utf8");
const browserRuntimeSource=readFileSync(new URL("../src/mass/browser-runtime.js",import.meta.url),"utf8");
const lifecycleSource=readFileSync(new URL("../src/mass/form-lifecycle.js",import.meta.url),"utf8");
assert.match(objectiveSource,/applyMassPlanTraversalDelta/);
assert.match(readerObjectiveSource,/buildPlannedObjectiveTraversal/);
assert.match(browserRuntimeSource,/createPlanAwareObjectiveRuntime/);
assert.match(browserRuntimeSource,/objectiveRuntime\.allows/);
assert.match(browserRuntimeSource,/createPalmReaderController/,"browser runtime lost Palm controller");
assert.match(browserRuntimeSource,/setPalmRecipientState/,"browser runtime lost personal Palm recipient-state control");
assert.match(browserRuntimeSource,/createAshReaderController/,"browser runtime lost Ash controller");
assert.match(browserRuntimeSource,/createRogationsReaderController/,"browser runtime lost Rogations controller");
assert.match(browserRuntimeSource,/setRogationsProcessionActive/,"browser runtime lost explicit Rogations procession-state control");
assert.match(browserRuntimeSource,/setRogationsProcessionParticipant/,"browser runtime lost participant-scoped Rogations state");
assert.match(browserRuntimeSource,/setAshRecipientState/,"browser runtime lost personal Ash recipient-state control");
assert.match(browserRuntimeSource,/AO\.SM\.B014/,"Palm Introit-only handoff lost B014 boundary");
assert.match(browserRuntimeSource,/createFormLifecycleRuntime/,"browser runtime lost native form lifecycle");
assert.match(browserRuntimeSource,/enterLifecycleBoundary/,"browser runtime stopped entering Mass completion boundary");
assert.match(browserRuntimeSource,/chooseLeonine/,"browser runtime lost explicit Leonine decision handoff");
assert.match(lifecycleSource,/LEONINE_NOT_INSIDE_CANONICAL_MASS_GRAPH/);
assert.match(lifecycleSource,/manualEntryMayFabricateCompletion:false/);
assert.match(lifecycleSource,/SUCCESSIVE_MASS_DEFER_TO_FINAL/);
assert.match(lifecycleSource,/FORM_EXCLUDES_LEONINE/);
assert.match(objectiveSource,/MC-COM-150/);
assert.match(objectiveSource,/MC-COM-160/);

const nativeSource=readFileSync(new URL("../src/mass/reader-native-preview.js",import.meta.url),"utf8");
assert.match(nativeSource,/allowPresentationModeSwitch:false/);
assert.match(nativeSource,/const structuralSupport=structureSupport\(prepared\)/);
assert.match(nativeSource,/structuralSupport\.reason/);
assert.match(nativeSource,/canonSourceMap:data\?\.canonSourceMap/,"native reader lost certified Canon source-map input");
assert.match(nativeSource,/V1_83_CARD_TRANSITION_CLEARED/);
assert.match(nativeSource,/isGloriaCredoGestureSourceCue/);
assert.match(nativeSource,/guideForSequence/,"native reader lost recovered Guide registry binding");
assert.match(nativeSource,/createNativeScholaController/,"native reader lost native Schola controller");
assert.match(nativeSource,/createReaderFormCueStateController/,"native reader lost form-aware cue-state controller");
assert.match(nativeSource,/createPlanAwareObjectiveRuntime/,"native reader lost plan-aware objective runtime");
assert.match(nativeSource,/objectiveRuntime\.allows/,"native reader stopped enforcing planned objective traversal");
assert.match(nativeSource,/postureOnly:ready\.cueState\.supported/,"native reader resumed reading legacy non-posture rails");
assert.match(nativeSource,/r17OwnerPriestAction/,"native reader lost priest-action ownership diagnostics");
assert.match(nativeSource,/r17OwnerSacredMinister/,"native reader lost sacred-minister ownership diagnostics");
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

console.log("reader regression lockdown: PASS — source-first LIVE is certified; historical v1.83 evidence remains non-authoritative.");

const transientSource=readFileSync(new URL("../src/mass/reader-transients.js",import.meta.url),"utf8");
assert.match(transientSource,/AO\.SM\.C0145/);
assert.match(transientSource,/AO\.SM\.C0161/);
assert.match(transientSource,/AO\.SM\.C0174/);
assert.match(transientSource,/AO\.SM\.C0181/);
assert.match(transientSource,/AO\.SM\.C0225/);
assert.match(transientSource,/canonicalAuthority:false/,"cinematic presentation acquired canonical authority");
assert.match(transientSource,/R18_FORM_CERTIFIED_ABSENCE/,"form-specific certified transient absence disappeared");
assert.match(transientSource,/MISSA_CANTATA_SIMPLE.*MISSA_CANTATA_INCENSE.*LOW.*SOLEMN/,"ordinary-form transient support set regressed");

assert.match(transientSource,/AO\.SM\.C0204/,"minor elevation cinematic anchor lost");
assert.match(transientSource,/AO\.SM\.C0242/,"Ecce Agnus Dei cinematic anchor lost");
assert.match(transientSource,/AO\.SM\.C0265/,"final blessing cinematic anchor lost");
