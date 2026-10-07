import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app=JSON.parse(readFileSync("data/presentation/app-release-gate.v1.json","utf8"));
const reader=JSON.parse(readFileSync("data/presentation/reader-release-gate.v1.json","utf8"));
const parity=JSON.parse(readFileSync("data/presentation/product-parity.v1.json","utf8"));
const presentationFx=JSON.parse(readFileSync("data/presentation/presentation-fx-parity.v1.json","utf8"));
const exactDonor=JSON.parse(readFileSync("data/presentation/exact-donor-parity.v1.json","utf8"));
const massDefinitive=JSON.parse(readFileSync("data/presentation/mass-definitive-convergence.v1.json","utf8"));
const massV180=JSON.parse(readFileSync("data/presentation/mass-v180-donor-parity.v1.json","utf8"));
const massStepReconciliation=JSON.parse(readFileSync("data/presentation/mass-v180-v183-step-reconciliation.v1.json","utf8"));

assert.equal(app.schema,"ao-app-release-gate-v1");
assert.equal(app.version,"1.25.0");
assert.equal(app.status,"PRESENTATION_PARITY_REQUIRED");
assert.deepEqual(app.topLevelContract,["home","mass","pray","learn","calendar","settings"]);

assert.equal(reader.status,"FINAL_NATIVE_READY","Mass subsystem lost FINAL_NATIVE_READY");
assert.equal(reader.productionDefault,"R17_NATIVE","Mass subsystem lost R17 native default");
assert.deepEqual(reader.openBlockers,[],"Mass subsystem has reopened blockers");
assert.equal(app.massSubsystem?.status,"CERTIFIED");
assert.equal(app.massSubsystem?.authority,"data/presentation/reader-release-gate.v1.json");
assert.equal(app.massSubsystem?.requiredReaderStatus,reader.status);
assert.equal(app.massSubsystem?.productionDefault,reader.productionDefault);
assert.equal(app.massSubsystem?.legacyPolicy,"NO_ALTERNATE_RENDERER");
assert.equal(app.massSubsystem?.presentationStatus,"CERTIFIED");
assert.equal(app.massSubsystem?.singlePresentationOwner,"R17_NATIVE_PRODUCTION");
assert.equal(app.massSubsystem?.definitiveConvergenceLedger,"data/presentation/mass-definitive-convergence.v1.json");
assert.equal(app.massSubsystem?.v180DonorParityLedger,"data/presentation/mass-v180-donor-parity.v1.json");

const allowed=new Set(["PASS","REGRESSION","STALE_SURFACE","MISSING_INTEGRATION","CRASH"]);
const findings=Array.isArray(app.findings)?app.findings:[];
assert.ok(findings.length>0,"app gate has no findings");
for(const finding of findings){
  assert.ok(finding?.id,"app finding missing id");
  assert.ok(allowed.has(finding?.classification),"unsupported app classification: "+finding?.classification);
  assert.ok(["OPEN","CLOSED"].includes(finding?.status),"unsupported app finding status: "+finding?.status);
}

const open=findings.filter(x=>x.status==="OPEN").map(x=>x.id);
assert.deepEqual(app.openBlockers,open,"app openBlockers must exactly match OPEN findings");
assert.deepEqual(app.openBlockers,["EXACT_NON_MASS_DONOR_PARITY"],
  "exact non-Mass donor parity must remain the sole app presentation blocker");
const fieldRuntime=findings.find(x=>x.id==="FIELD_RUNTIME_STABILIZATION");
assert.equal(fieldRuntime?.classification,"PASS");
assert.equal(fieldRuntime?.status,"CLOSED");
const massParity=findings.find(x=>x.id==="MASS_DEFINITIVE_DONOR_PARITY");
assert.equal(massParity?.classification,"PASS");
assert.equal(massParity?.status,"CLOSED");
assert.equal(massParity?.progress?.singleRenderer,"CERTIFIED_NATIVE_ONLY");
assert.equal(massParity?.progress?.donorPresentation,"CERTIFIED_V1_80");
assert.equal(massParity?.progress?.visualAcceptance,"PASS");
assert.equal(massParity?.progress?.phoneAcceptance,"PASS");
assert.equal(app.productParityLedger,"data/presentation/product-parity.v1.json");
assert.equal(app.presentationFxLedger,"data/presentation/presentation-fx-parity.v1.json");
assert.equal(app.exactDonorParityLedger,"data/presentation/exact-donor-parity.v1.json");
const exactFinding=findings.find(x=>x.id==="EXACT_NON_MASS_DONOR_PARITY");
assert.equal(exactFinding?.classification,"MISSING_INTEGRATION");
assert.equal(exactFinding?.status,"OPEN");
assert.equal(exactDonor.schema,"ao-exact-donor-presentation-parity-v1");
assert.equal(exactDonor.status,"OPEN");
assert.equal(exactDonor.version,"1.6.0");
assert.equal(exactDonor.releaseBlocker,"EXACT_NON_MASS_DONOR_PARITY");
assert.deepEqual(exactDonor.openBlockers,[
  "FINAL_NON_MASS_COMPOSITION_NOT_CERTIFIED",
  "MISSING_PRIMARY_DONOR: Ad_Orientem_v3_4_14.html",
  "MISSING_PRIMARY_DONOR: Ad_Orientem_NON_MASS_HEAD_v3_22_NOVENA_FREEZE_CALENDAR_DASHBOARD_C2.html",
]);
assert.match(exactDonor.rule,/conceptual equivalence.*do not satisfy|conceptual equivalence.*insufficient|conceptual feature/i);
const fxFinding=findings.find(x=>x.id==="PRESENTATION_FX_PARITY");
assert.equal(fxFinding?.classification,"PASS");
assert.equal(fxFinding?.status,"CLOSED");
assert.equal(presentationFx.schema,"ao-presentation-fx-parity-v1");
assert.equal(presentationFx.status,"CERTIFIED");
assert.equal(presentationFx.releaseBlocker,null);
assert.ok(Array.isArray(presentationFx.nonBlockingHygiene),"certified FX ledger must keep optional extraction work explicitly non-blocking");
assert.equal(parity.schema,"ao-product-parity-v1");
assert.deepEqual(Object.keys(parity.surfaces),["home","mass","pray","learn","calendar","settings"]);
assert.equal(parity.surfaces.calendar.status,"CERTIFIED");
assert.equal(parity.surfaces.home.status,"CERTIFIED");
assert.equal(parity.surfaces.pray.status,"CERTIFIED");
assert.equal(parity.surfaces.settings.status,"CERTIFIED");
assert.equal(parity.surfaces.learn.status,"CERTIFIED");
assert.equal(parity.surfaces.mass.status,"CERTIFIED");
assert.ok(Object.values(parity.surfaces).every(surface=>surface.status==="CERTIFIED"),
  "one or more product-parity surfaces lost certification");
assert.equal(parity.status,"CERTIFIED");
assert.equal(parity.releaseBlocker,null);
assert.equal(massDefinitive.schema,"ao-mass-definitive-convergence-v1");
assert.equal(massDefinitive.singleOwnerContract.legacyStartLiveAllowed,false);
assert.equal(massDefinitive.singleOwnerContract.shadowRendererAllowed,false);
assert.equal(massV180.status,"CERTIFIED");
assert.deepEqual(massV180.open,[]);
assert.equal(massStepReconciliation.status,"RECONCILED_FOR_PRODUCT_NONHISTORICAL");
assert.equal(massStepReconciliation.authorities.productionPresentation.steps,48);
assert.equal(massStepReconciliation.historicalGap.exactBoundaryRecovered,false);
assert.equal(findings.find(x=>x.id==="MASS_SUBSYSTEM_CERTIFIED")?.classification,"PASS");
assert.equal(findings.find(x=>x.id==="SPECIAL_STRUCTURES_REAL_SHELL")?.classification,"PASS");
assert.equal(findings.find(x=>x.id==="ARIA_FOCUS_GUARD")?.classification,"PASS");
const d3d6=findings.find(x=>x.id==="NON_MASS_D3_D6_CONVERGENCE");
assert.equal(d3d6?.classification,"PASS");
assert.equal(d3d6?.status,"CLOSED");
assert.equal(findings.find(x=>x.id==="VISIBLE_SHELL_OWNERSHIP")?.classification,"PASS");
assert.equal(findings.find(x=>x.id==="VISIBLE_SHELL_OWNERSHIP")?.status,"CLOSED");
assert.equal(findings.find(x=>x.id==="CROSS_DOMAIN_PHONE_JOURNEY")?.classification,"PASS");
assert.equal(findings.find(x=>x.id==="CROSS_DOMAIN_PHONE_JOURNEY")?.status,"CLOSED");
assert.equal(findings.find(x=>x.id==="PERSISTENCE_STATE_CONTAMINATION")?.classification,"PASS");
assert.equal(findings.find(x=>x.id==="PERSISTENCE_STATE_CONTAMINATION")?.status,"CLOSED");
assert.equal(findings.find(x=>x.id==="LIVE_SESSION_GUARDS_MODULARIZED")?.classification,"PASS");
assert.equal(findings.find(x=>x.id==="LIVE_SESSION_GUARDS_MODULARIZED")?.status,"CLOSED");
assert.equal(findings.find(x=>x.id==="EMERGENCY_RUNTIME_RETIREMENT")?.classification,"PASS");
assert.equal(findings.find(x=>x.id==="EMERGENCY_RUNTIME_RETIREMENT")?.status,"CLOSED");
const nonMass=findings.find(x=>x.id==="NON_MASS_DONOR_EXTRACTION");
assert.equal(nonMass?.classification,"PASS");
assert.equal(nonMass?.status,"CLOSED");
assert.equal(nonMass?.progress?.calendar,"MODULAR_PHONE_CERTIFIED");
assert.equal(nonMass?.progress?.home,"MODULAR_PHONE_CERTIFIED");
assert.equal(nonMass?.progress?.pray,"MODULAR_PHONE_CERTIFIED");
assert.equal(nonMass?.progress?.learn,"MODULAR_PHONE_CERTIFIED");
assert.equal(nonMass?.progress?.settings,"MODULAR_PHONE_CERTIFIED");
assert.equal(findings.find(x=>x.id==="DUPLICATE_BROWSER_ENTRY_HYGIENE")?.classification,"PASS");
assert.equal(findings.find(x=>x.id==="DUPLICATE_BROWSER_ENTRY_HYGIENE")?.status,"CLOSED");
assert.match(app.requiredPhoneJourney,/Home.*Calendar.*Mass.*LIVE.*Settings overlay\/restore.*leave\/resume.*PRAY.*Home.*Settings/i);

assert.ok(app.regressionGates?.static?.includes("tests/app-release-gate.mjs"));
assert.ok(app.regressionGates?.static?.includes("tests/app-shell-contract.mjs"));
assert.ok(app.regressionGates?.static?.includes("tests/production-tree-hygiene.mjs"));
assert.ok(app.regressionGates?.static?.includes("tests/app-live-session-guards.mjs"));
assert.ok(app.regressionGates?.static?.includes("tests/presentation-fx.mjs"));
assert.ok(app.regressionGates?.static?.includes("tests/home-owner.mjs"));
assert.ok(app.regressionGates?.static?.includes("tests/home-presentation.mjs"));
assert.ok(app.regressionGates?.static?.includes("tests/home-enrichers.mjs"));
assert.ok(app.regressionGates?.static?.includes("tests/nonmass-d3-d6-convergence.mjs"));
assert.ok(app.regressionGates?.static?.includes("tests/pray-owner.mjs"));
assert.ok(app.regressionGates?.static?.includes("tests/pray-presentation.mjs"));
assert.ok(app.regressionGates?.static?.includes("tests/learn-owner.mjs"));
assert.ok(app.regressionGates?.static?.includes("tests/settings-owner.mjs"));
assert.ok(app.regressionGates?.phone?.includes("tests/app-shell-final-e2e.mjs"));
assert.ok(app.regressionGates?.phone?.includes("tests/app-shell-journey-e2e.mjs"));
assert.ok(app.regressionGates?.phone?.includes("tests/nonmass-d3-d6-e2e.mjs"));
assert.ok(app.regressionGates?.phone?.includes("tests/learn-owner-e2e.mjs"));
assert.ok(app.regressionGates?.phone?.includes("tests/settings-e2e.mjs"));
assert.ok(app.regressionGates?.static?.includes("tests/source-transport-compat.mjs"));
assert.ok(app.regressionGates?.static?.includes("tests/reader-mode-switch.mjs"));
assert.ok(app.regressionGates?.phone?.includes("tests/field-current-week-e2e.mjs"));
assert.ok(app.regressionGates?.phone?.includes("tests/nonmass-donor-reference-e2e.mjs"));

console.log("PASS app release gate: Mass runtime and v1.80-native presentation are certified; exact non-Mass donor parity remains the sole app blocker.");
