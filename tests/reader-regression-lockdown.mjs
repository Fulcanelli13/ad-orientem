import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolveReaderUiMode } from "../src/mass/reader-gate.js";
import { LIVE_STRUCTURE_STATUS, structureSupport } from "../src/mass/reader-structure.js";

const load=(path)=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const release=load("../data/presentation/reader-release-gate.v1.json");
const parity=load("../data/presentation/v1.83-reader-parity-gate.v1.json");
const recovery=load("../data/presentation/v1.83-reader-map-recovery.v1.json");
const regressions=load("../data/presentation/v1.83-regression-ledger.v1.json");

assert.equal(release.status,"FINAL_NATIVE_READY");
assert.equal(release.productionDefault,"R17_NATIVE");
assert.equal(resolveReaderUiMode({}),"NATIVE","native reader is no longer the certified production default");
assert.equal(release.certificationPolicy.greenUnitCIIsNotReleaseCertification,true);
assert.equal(release.certificationPolicy.requireLegacyDefaultUntilCertified,false);
assert.equal(release.certificationPolicy.requireRealAppShellAcceptance,true);
assert.equal(release.certificationPolicy.legacyRollbackExplicitOnly,true);

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
assert.equal(blockers.size,0,"final native release still contains a blocker");
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
const pilot=release.protectedInvariants.find(x=>x.id==="PILOT_VERTICAL_PATH");
assert.equal(release.pilotRelease?.status,"SUPERSEDED_BY_FINAL_MAINLINE","pilot release still claims current authority");
assert.equal(pilot?.status,"CERTIFIED_PILOT_READY","pilot vertical path certification disappeared");
assert.equal(release.pilotRelease?.reader,"R17_NATIVE");
assert.equal(release.pilotRelease?.productionDefaultUnchanged,"SUPERSEDED");
assert.ok(release.pilotRelease?.scope?.certifiedPrecedingRites?.includes("PALM"));
assert.ok(release.pilotRelease?.scope?.certifiedPrecedingRites?.includes("ASH"));

const productionCutover=release.protectedInvariants.find(x=>x.id==="PRODUCTION_NATIVE_CUTOVER");
assert.equal(productionCutover?.status,"CERTIFIED_REAL_SHELL_E2E");
assert.equal(productionCutover?.productionDefault,"R17_NATIVE");
assert.equal(productionCutover?.legacyPolicy,"EXPLICIT_ROLLBACK_OR_SHADOW_ONLY");
assert.match(String(productionCutover?.rollbackQuery??""),/aoR17Reader=legacy/);

const realShell=release.protectedInvariants.find(x=>x.id==="REAL_APP_SHELL_ACCEPTANCE");
assert.equal(realShell?.status,"CERTIFIED","real app-shell acceptance disappeared");
assert.match(String(realShell?.test??""),/app-shell-final-e2e\.mjs/);
assert.ok((realShell?.guarantees??[]).some(x=>/legacy startLive is not called/i.test(x)));
assert.ok((realShell?.guarantees??[]).some(x=>/zero uncaught page errors/i.test(x)));

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
assert.equal(ashPayload?.status,"CERTIFIED_NATIVE_PRODUCTION__REAL_SHELL_PHONE","Ash real-shell production certification disappeared");
assert.equal(ashPayload?.recoveredGraphRecords,8,"Ash source scope changed");
assert.equal(ashPayload?.readerCards,5,"Ash reader-card contract changed");
assert.match(String(ashPayload?.controller??""),/reader-ash\.js/,"Ash controller is not pinned");
assert.match(String(ashPayload?.productionTest??""),/app-shell-final-e2e\.mjs/,"Ash real-shell test is not pinned");
assert.equal(ashPayload?.productionOwner,"R17_NATIVE_PRODUCTION");

const palmPayload=release.protectedInvariants.find(x=>x.id==="PALM_NATIVE_PAYLOAD");
assert.equal(palmPayload?.status,"CERTIFIED_NATIVE_PRODUCTION__REAL_SHELL_PHONE","Palm real-shell production certification disappeared");
assert.equal(palmPayload?.recoveredGraphRecords,12,"Palm source scope changed");
assert.equal(palmPayload?.readerCards,7,"Palm reader-card contract changed");
assert.match(String(palmPayload?.controller??""),/reader-palm\.js/,"Palm controller is not pinned");
assert.match(String(palmPayload?.productionTest??""),/app-shell-final-e2e\.mjs/,"Palm real-shell test is not pinned");
assert.equal(palmPayload?.productionOwner,"R17_NATIVE_PRODUCTION");

const palmAshShell=release.protectedInvariants.find(x=>x.id==="PALM_ASH_REAL_APP_SHELL_ACCEPTANCE");
assert.equal(palmAshShell?.status,"CERTIFIED","Palm/Ash real-shell acceptance disappeared");
assert.deepEqual(palmAshShell?.rites,["PALM","ASH"]);
assert.equal(palmAshShell?.actualIndexHtml,true);
assert.equal(palmAshShell?.legacyStartCount,0);
assert.equal(palmAshShell?.nativeOwner,"R17_NATIVE_PRODUCTION");
assert.match(String(palmAshShell?.test??""),/app-shell-final-e2e\.mjs/);

const candlemasPayload=release.protectedInvariants.find(x=>x.id==="CANDLEMAS_NATIVE_PAYLOAD");
assert.equal(candlemasPayload?.status,"CERTIFIED_NATIVE_PRODUCTION__REAL_SHELL_PHONE",
  "Candlemas real-shell production certification disappeared");
assert.match(String(candlemasPayload?.productionTest??""),/app-shell-final-e2e\.mjs/);
assert.equal(candlemasPayload?.productionOwner,"R17_NATIVE_PRODUCTION");
assert.equal(candlemasPayload?.objectStateAcceptance?.status,"CERTIFIED_REAL_SHELL_PHONE");
assert.equal(candlemasPayload?.objectStateAcceptance?.processionCardId,"CND-R05");
assert.equal(candlemasPayload?.objectStateAcceptance?.processionState,"CANDLE_LIT");
assert.equal(candlemasPayload?.objectStateAcceptance?.gospelEventId,"MC-GSP-060");
assert.equal(candlemasPayload?.objectStateAcceptance?.paterCompletionEventId,"MC-COM-030");
assert.equal(candlemasPayload?.objectStateAcceptance?.afterPaterWitnessEventId,"MC-COM-040");
assert.equal(candlemasPayload?.objectStateAcceptance?.postureOverride,null);

const realShellScope=release.protectedInvariants.find(x=>x.id==="REAL_SHELL_SPECIAL_STRUCTURE_SCOPE");
assert.equal(realShellScope?.status,"PARTIAL_EXPLICIT_EVIDENCE");
assert.deepEqual(realShellScope?.certified,["ASPERGES","PALM","ASH","CANDLEMAS","ROGATIONS","GOOD_FRIDAY"]);
assert.equal(realShellScope?.pending?.includes("CANDLEMAS"),false);
assert.equal(realShellScope?.pending?.includes("ROGATIONS"),false);
assert.equal(realShellScope?.pending?.includes("GOOD_FRIDAY"),false);
assert.ok(realShellScope?.pending?.includes("EASTER_VIGIL"));
assert.equal(release.finalAppRelease?.fullYearSpecialStructureParity,true);
assert.equal(release.finalAppRelease?.fullYearParityEvidence,"MODULAR_RUNTIME_AND_READER_HARNESS");
assert.equal(release.finalAppRelease?.realShellSpecialStructureAcceptance?.status,"PARTIAL_EXPLICIT_EVIDENCE");

const goodFridayShell=release.protectedInvariants.find(x=>x.id==="GOOD_FRIDAY_REAL_APP_SHELL_ACCEPTANCE");
assert.equal(goodFridayShell?.status,"CERTIFIED","Good Friday real-shell acceptance disappeared");
assert.equal(goodFridayShell?.actualIndexHtml,true);
assert.equal(goodFridayShell?.legacyStartCount,0);
assert.equal(goodFridayShell?.nativeOwner,"R17_NATIVE_PRODUCTION");
assert.match(String(goodFridayShell?.controller??""),/reader-good-friday\.js/);
assert.match(String(goodFridayShell?.productionMount??""),/reader-native-preview\.js/);
assert.match(String(goodFridayShell?.test??""),/app-shell-final-e2e\.mjs/);
assert.match(String(goodFridayShell?.unitTest??""),/reader-native-good-friday\.mjs/);

const aspergesPayload=release.protectedInvariants.find(x=>x.id==="ASPERGES_NATIVE_PAYLOAD");
assert.equal(aspergesPayload?.status,"CERTIFIED_NATIVE_PRODUCTION__REAL_SHELL_PHONE","Asperges real-shell production certification disappeared");
assert.match(String(aspergesPayload?.controller??""),/reader-asperges\.js/,"Asperges controller is not pinned");
assert.equal(aspergesPayload?.recoveredGraphRecords,6,"Asperges six-record source scope changed");
assert.equal(aspergesPayload?.readerCards,5,"Asperges reader-card contract changed");
assert.match(String(aspergesPayload?.nativePreview??""),/reader-native-preview\.js/,"Asperges native preview owner is not pinned");
assert.match(String(aspergesPayload?.phoneTest??""),/reader-phone-acceptance\.mjs/,"Asperges phone acceptance is not pinned");
assert.match(String(aspergesPayload?.productionTest??""),/app-shell-final-e2e\.mjs/,"Asperges real-shell test is not pinned");
assert.equal(aspergesPayload?.productionOwner,"R17_NATIVE_PRODUCTION");

const rogationsPayload=release.protectedInvariants.find(x=>x.id==="ROGATIONS_NATIVE_PAYLOAD");
assert.equal(rogationsPayload?.status,"CERTIFIED_NATIVE_PRODUCTION__REAL_SHELL_PHONE","Rogations real-shell production certification disappeared");
assert.match(String(rogationsPayload?.productionTest??""),/app-shell-final-e2e\.mjs/);
assert.equal(rogationsPayload?.productionOwner,"R17_NATIVE_PRODUCTION");

const preMassShell=release.protectedInvariants.find(x=>x.id==="PRE_MASS_CLUSTER_REAL_APP_SHELL_ACCEPTANCE");
assert.equal(preMassShell?.status,"CERTIFIED");
assert.deepEqual(preMassShell?.rites,["ASPERGES","PALM","ASH","CANDLEMAS","ROGATIONS"]);
assert.equal(preMassShell?.actualIndexHtml,true);
assert.equal(preMassShell?.legacyStartCount,0);

const nuptial=release.protectedInvariants.find(x=>x.id==="NUPTIAL_NATIVE_INSERTIONS");
assert.equal(nuptial?.status,"CERTIFIED_SOURCE_INSERTION_MODEL","Nuptial insertions lost certification");
assert.equal(nuptial?.recoveredInsertions,3);
assert.deepEqual(nuptial?.insertionIds,[
  "FIRST_NUPTIAL_BLESSING_AFTER_PATER",
  "DEUS_QUI_POTESTATE_NUPTIAL_BLESSING",
  "FINAL_BLESSING_OVER_SPOUSES",
]);
assert.equal(nuptial?.modelBehavior?.liveWithNuptialCards,42);
assert.match(String(nuptial?.controller??""),/reader-nuptial\.js/);

const specialStructure=release.protectedInvariants.find(x=>x.id==="SPECIAL_STRUCTURE_PLAN_PROJECTION");
assert.equal(specialStructure?.status,"CERTIFIED_COMPILED_PLAN_STRUCTURE","special-structure plan certification disappeared");
assert.match(String(specialStructure?.controller??""),/reader-special-structure\.js/,"special-structure projection controller is not pinned");
const easterVigil=release.protectedInvariants.find(x=>x.id==="EASTER_VIGIL_NATIVE_COMPOSITE");
assert.equal(easterVigil?.status,"CERTIFIED_COMPOSITE_RUNTIME__PHONE_SUITE_GREEN","Easter Vigil certification disappeared");
assert.equal(easterVigil?.recoveredGraphRecords,38);
assert.equal(easterVigil?.massProjection?.entry,"KYRIE");
assert.deepEqual(easterVigil?.massProjection?.omittedSourceSequences,[1,21,30]);
assert.deepEqual(easterVigil?.massProjection?.suppressedCanonicalEvents,["MC-COM-150","MC-COM-160","MC-END-010"]);
assert.equal(easterVigil?.massProjection?.laudsSectionId,"SP.EASTER_VIGIL.15");
assert.match(String(easterVigil?.controller??""),/reader-easter-vigil\.js/);
assert.equal(easterVigil?.sourceText?.prophecies,"RECOVERED_PRESENTATION_OVERVIEW__CHOREOGRAPHY_EXACT__FULL_TEXT_ENRICHMENT_NON_BLOCKING");
assert.equal(release.productionDefault,"R17_NATIVE","full-year release lost the native production default");

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
assert.match(nativeSource,/getCandlemasMassState/,"native reader lost Candlemas Mass object-state API");
assert.match(nativeSource,/r17ObjectState/,"native reader lost Candlemas object-state observability");
assert.match(nativeSource,/createReaderFormCueStateController/,"native reader lost form-aware cue-state controller");
assert.match(nativeSource,/createPlanAwareObjectiveRuntime/,"native reader lost plan-aware objective runtime");
assert.match(nativeSource,/objectiveRuntime\.allows/,"native reader stopped enforcing planned objective traversal");
assert.match(nativeSource,/typeof readLegacyActive==="function"/,"native reader no longer gates legacy observation explicitly");
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
assert.doesNotMatch(browserEntrySource,/installFieldCelebrationOverrides|installFieldShellRecovery|resolveFieldReaderUiMode/,"field rescue logic leaked into final browser entry");
assert.match(browserEntrySource,/R17_NATIVE_PRODUCTION/,"browser entry lost native production ownership");
assert.match(browserEntrySource,/stampMassReaderUi/,"browser entry lost reader UI ownership stamping");
assert.match(browserEntrySource,/aoMassReaderUi/,"browser entry lost data-ao-mass-reader-ui observability");
assert.doesNotMatch(browserEntrySource,/mirrorMount|R17_MIRROR_FALLBACK/,"final browser entry restored silent mirror fallback");

const cueSource=readFileSync(new URL("../src/mass/reader-cue-state.js",import.meta.url),"utf8");
assert.match(cueSource,/V183_GESTURE_SUPPRESS/);
assert.match(cueSource,/"AO\.SM\.C0181":"AO\.SM\.C0179"/);

const convergenceWorkflow=readFileSync(new URL("../.github/workflows/r17-mass-convergence.yml",import.meta.url),"utf8");
assert.match(convergenceWorkflow,/data\/presentation\/\*\*/);
assert.match(convergenceWorkflow,/index\.html/);

const baselineWorkflow=readFileSync(new URL("../.github/workflows/baseline-integrity.yml",import.meta.url),"utf8");
assert.match(baselineWorkflow,/data-ao-r17-browser-entry/);
assert.match(baselineWorkflow,/contents:\s*read/,"frozen baseline workflow regained write permission");
assert.doesNotMatch(baselineWorkflow,/contents:\s*write/,"frozen baseline workflow regained contents: write");
assert.doesNotMatch(baselineWorkflow,/git\s+push|cp\s+legacy\/.*index\.html/i,
  "frozen baseline workflow can mutate production again");
assert.match(baselineWorkflow,/historical baseline only/,"frozen baseline lost historical-only policy");

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
