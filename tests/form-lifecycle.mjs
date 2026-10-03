import assert from "node:assert/strict";
import { makeResolvedMass, compileMassPlan } from "../src/mass/session-engine.js";
import { compileFormLifecycle, createFormLifecycleRuntime } from "../src/mass/form-lifecycle.js";

const calendar={id:"TEMP.XIX",type:"CALENDAR",title:"Sunday"};
const resolved=(form,extra={})=>makeResolvedMass({
  date:"2026-10-04",
  form,
  presentationMode:"SIMPLE",
  calendarCelebration:calendar,
  ...extra,
});

const low=resolved("LOW",{provenance:{properSource:"Tempora/Pent19-0",faithfulCommunicantsPresent:true}});
const lowPlan=compileMassPlan(low);
assert.equal(lowPlan.lifecycle.schema,"ao-form-lifecycle-v1");
assert.equal(lowPlan.lifecycle.massBoundary.anchor,"AFTER_LAST_GOSPEL");
assert.equal(lowPlan.lifecycle.leonine.eligible,true);
assert.equal(lowPlan.lifecycle.leonine.mode,"OPTIONAL_CUSTOMARY_OFFER");
assert.equal(lowPlan.lifecycle.thanksgiving.separateFromLeonine,true);
assert.equal(lowPlan.lifecycle.thanksgiving.manualEntryMayFabricateCompletion,false);

const lowRuntime=createFormLifecycleRuntime({prepared:{session:{resolvedMass:low,plan:lowPlan}}});
assert.equal(lowRuntime.snapshot().stage,"MASS_ACTIVE");
assert.equal(lowRuntime.snapshot().completionRecord,null,"early reader state fabricated Mass completion");
let state=lowRuntime.enterMassBoundary();
assert.equal(state.stage,"LEONINE_OFFER");
assert.equal(state.massComplete,true);
assert.equal(state.completionRecord.form,"LOW");
assert.equal(state.completionRecord.properSource,"Tempora/Pent19-0");
assert.equal(state.completionRecord.communionState,"FAITHFUL_COMMUNICANTS_PRESENT");
state=lowRuntime.chooseLeonine(false);
assert.equal(state.stage,"DEPARTURE");
state=lowRuntime.advance();
assert.equal(state.stage,"GIVE_THANKS_HANDOFF");
assert.equal(state.handoff,"GIVE_THANKS");

const lowAccepted=createFormLifecycleRuntime({prepared:{session:{resolvedMass:low,plan:lowPlan}}});
lowAccepted.enterMassBoundary();
state=lowAccepted.chooseLeonine(true);
assert.equal(state.stage,"LEONINE_HANDOFF");
assert.equal(state.handoff,"LEONINE_PRAYERS");
state=lowAccepted.completeLeonine();
assert.equal(state.stage,"DEPARTURE");
assert.equal(lowAccepted.advance().stage,"GIVE_THANKS_HANDOFF");

const successive=resolved("LOW",{provenance:{lifecycle:{successiveMassPosition:"NONFINAL"}}});
const successivePlan=compileMassPlan(successive);
assert.equal(successivePlan.lifecycle.leonine.eligible,false);
assert.ok(successivePlan.lifecycle.leonine.reasons.includes("SUCCESSIVE_MASS_DEFER_TO_FINAL"));
assert.equal(createFormLifecycleRuntime({prepared:{session:{resolvedMass:successive,plan:successivePlan}}}).enterMassBoundary().stage,"DEPARTURE");

const homily=resolved("LOW",{provenance:{lifecycle:{homilyImmediatelyAfter:true}}});
assert.ok(compileMassPlan(homily).lifecycle.leonine.reasons.includes("HOMILY_IMMEDIATELY_AFTER"));

const localSuppressed=resolved("LOW",{provenance:{lifecycle:{localLeoninePolicy:"SUPPRESS"}}});
assert.ok(compileMassPlan(localSuppressed).lifecycle.leonine.reasons.includes("LOCAL_REGULATION_SUPPRESSES"));

const dialogueSuppressed=resolved("LOW",{provenance:{lifecycle:{dialogueMassPolicy:"SUPPRESS"}}});
assert.ok(compileMassPlan(dialogueSuppressed).lifecycle.leonine.reasons.includes("DIALOGUE_MASS_EXCEPTION"));

const following=resolved("LOW",{followingActions:["GENERIC_PROCESSION"]});
const followingPlan=compileMassPlan(following);
assert.equal(followingPlan.lifecycle.leonine.eligible,false);
assert.ok(followingPlan.lifecycle.leonine.reasons.includes("IMMEDIATE_FOLLOWING_ACTION"));
const followingRuntime=createFormLifecycleRuntime({prepared:{session:{resolvedMass:following,plan:followingPlan}}});
assert.equal(followingRuntime.enterMassBoundary().stage,"FOLLOWING_ACTION_HANDOFF");
assert.equal(followingRuntime.snapshot().handoff,"FOLLOWING_ACTION");
assert.equal(followingRuntime.completeFollowingAction().stage,"DEPARTURE");
assert.equal(followingRuntime.advance().stage,"GIVE_THANKS_HANDOFF");

const corpus=resolved("LOW",{followingActions:["CORPUS_CHRISTI_PROCESSION"]});
const corpusPlan=compileMassPlan(corpus);
assert.equal(corpusPlan.normalLastGospel,false);
assert.equal(corpusPlan.lifecycle.massBoundary.anchor,"AFTER_PLAN_DEFINED_MASS_END__LAST_GOSPEL_SUPPRESSED");
assert.equal(corpusPlan.lifecycle.followingAction.active,true);

for(const form of ["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
  const mass=resolved(form);
  const plan=compileMassPlan(mass);
  assert.equal(plan.lifecycle.leonine.eligible,false,form+" incorrectly offered Leonine prayers");
  assert.deepEqual(plan.lifecycle.leonine.reasons,["FORM_EXCLUDES_LEONINE"]);
  const runtime=createFormLifecycleRuntime({prepared:{session:{resolvedMass:mass,plan}}});
  assert.equal(runtime.enterMassBoundary().stage,"DEPARTURE");
  assert.equal(runtime.advance().stage,"GIVE_THANKS_HANDOFF");
}

assert.throws(()=>compileFormLifecycle({form:"GOOD_FRIDAY"},{kind:"DISTINCT_RITE"}),/ordinary resolved Mass form/);

console.log("form lifecycle parity: PASS — Low Leonine resolver, following-action handoff, completion record and Solemn/Sung exclusion are native.");
