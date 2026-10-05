import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app=JSON.parse(readFileSync("data/presentation/app-release-gate.v1.json","utf8"));
const reader=JSON.parse(readFileSync("data/presentation/reader-release-gate.v1.json","utf8"));

assert.equal(app.schema,"ao-app-release-gate-v1");
assert.equal(app.version,"1.14.0");
assert.equal(app.status,"FINAL_APP_READY");
assert.deepEqual(app.topLevelContract,["home","mass","pray","learn","calendar","settings"]);

assert.equal(reader.status,"FINAL_NATIVE_READY","Mass subsystem lost FINAL_NATIVE_READY");
assert.equal(reader.productionDefault,"R17_NATIVE","Mass subsystem lost R17 native default");
assert.deepEqual(reader.openBlockers,[],"Mass subsystem has reopened blockers");
assert.equal(app.massSubsystem?.status,"CERTIFIED");
assert.equal(app.massSubsystem?.authority,"data/presentation/reader-release-gate.v1.json");
assert.equal(app.massSubsystem?.requiredReaderStatus,reader.status);
assert.equal(app.massSubsystem?.productionDefault,reader.productionDefault);
assert.equal(app.massSubsystem?.legacyPolicy,"EXPLICIT_ROLLBACK_ONLY");

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
assert.deepEqual(app.openBlockers,[],"FINAL_APP_READY must have zero open blockers");
assert.ok(findings.every(x=>x.status==="CLOSED"),"FINAL_APP_READY contains an open finding");
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

console.log("PASS app release gate: FINAL_APP_READY with certified R17 and zero app blockers.");
