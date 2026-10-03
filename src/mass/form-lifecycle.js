// R18 form lifecycle parity.
// Owns the boundary after the Ordinary Mass graph. It never owns Leonine prayer
// text or personal thanksgiving content; it only routes between already-distinct
// modules and carries a Mass-completion record across that boundary.

const ORDINARY_FORMS=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);

function conditionSet(resolvedMass){
  return new Set((resolvedMass?.provenance?.conditions??[])
    .map(value=>typeof value==="string"?value:value?.id)
    .filter(Boolean)
    .map(value=>String(value).toUpperCase()));
}

function lifecycleContext(resolvedMass){
  const value=resolvedMass?.provenance?.lifecycle;
  return value && typeof value==="object" ? value : {};
}

function normalized(value){
  return value==null ? null : String(value).trim().toUpperCase();
}

function properSource(resolvedMass){
  return resolvedMass?.provenance?.properSource ??
    resolvedMass?.proper?.sourcePath ??
    resolvedMass?.proper?.data?.sourcePath ??
    null;
}

function faithfulCommunionState(resolvedMass){
  const provenance=resolvedMass?.provenance??{};
  if(typeof provenance.faithfulCommunicantsPresent==="boolean"){
    return provenance.faithfulCommunicantsPresent ? "FAITHFUL_COMMUNICANTS_PRESENT" : "NO_FAITHFUL_COMMUNICANTS";
  }
  return provenance.communionState??null;
}

function leonineDecision(resolvedMass,plan){
  const form=String(resolvedMass?.form??plan?.form??"").toUpperCase();
  if(form!=="LOW"){
    return Object.freeze({
      eligible:false,
      mode:"NOT_OFFERED",
      reasons:Object.freeze(["FORM_EXCLUDES_LEONINE"]),
      historicalDiscipline:"POST_LOW_MASS_ONLY",
    });
  }

  const ctx=lifecycleContext(resolvedMass);
  const conditions=conditionSet(resolvedMass);
  const reasons=[];

  if((plan?.followingGraphs??[]).length) reasons.push("IMMEDIATE_FOLLOWING_ACTION");
  if(ctx.otherFunctionImmediatelyAfter===true || conditions.has("LEONINE_OTHER_FUNCTION_FOLLOWS")) reasons.push("IMMEDIATE_OTHER_FUNCTION");
  if(ctx.homilyImmediatelyAfter===true || conditions.has("LEONINE_HOMILY_FOLLOWS")) reasons.push("HOMILY_IMMEDIATELY_AFTER");
  if(ctx.solemnLowMassException===true || conditions.has("LEONINE_SOLEMN_LOW_MASS_EXCEPTION")) reasons.push("SOLEMN_LOW_MASS_EXCEPTION");
  if(normalized(ctx.dialogueMassPolicy)==="SUPPRESS" || conditions.has("LEONINE_DIALOGUE_MASS_SUPPRESSED")) reasons.push("DIALOGUE_MASS_EXCEPTION");
  if(normalized(ctx.localLeoninePolicy)==="SUPPRESS" || conditions.has("LEONINE_LOCAL_SUPPRESSED")) reasons.push("LOCAL_REGULATION_SUPPRESSES");
  if(normalized(ctx.successiveMassPosition)==="NONFINAL" || conditions.has("LEONINE_SUCCESSIVE_MASS_NONFINAL")) reasons.push("SUCCESSIVE_MASS_DEFER_TO_FINAL");

  return Object.freeze({
    eligible:reasons.length===0,
    mode:reasons.length===0 ? "OPTIONAL_CUSTOMARY_OFFER" : "NOT_OFFERED",
    reasons:Object.freeze(reasons),
    historicalDiscipline:"SEPARATE_POST_LOW_MASS_DISCIPLINE",
  });
}

export function compileFormLifecycle(resolvedMass,plan){
  if(!resolvedMass || !ORDINARY_FORMS.has(String(resolvedMass.form??"").toUpperCase())){
    throw new TypeError("compileFormLifecycle requires an ordinary resolved Mass form");
  }
  if(!plan || plan.kind!=="MASS")throw new TypeError("compileFormLifecycle requires a MASS plan");

  const form=String(resolvedMass.form).toUpperCase();
  const leonine=leonineDecision(resolvedMass,plan);
  const followingGraphs=Object.freeze([...(plan.followingGraphs??[])]);
  const hasFollowingAction=followingGraphs.length>0;
  const boundaryAnchor=plan.normalLastGospel===false
    ? "AFTER_PLAN_DEFINED_MASS_END__LAST_GOSPEL_SUPPRESSED"
    : "AFTER_LAST_GOSPEL";

  return Object.freeze({
    schema:"ao-form-lifecycle-v1",
    status:"CERTIFIED_FORM_BOUNDARY",
    form,
    massBoundary:Object.freeze({
      anchor:boundaryAnchor,
      createsCompletionRecord:true,
      massGraphComplete:true,
    }),
    leonine,
    followingAction:Object.freeze({
      active:hasFollowingAction,
      graphs:followingGraphs,
      owner:hasFollowingAction ? "EXPLICIT_FOLLOWING_ACTION_GRAPH" : null,
    }),
    departure:Object.freeze({
      owner:"POST_MASS_LIFECYCLE",
      after:hasFollowingAction
        ? "FOLLOWING_ACTION_COMPLETE"
        : leonine.eligible ? "LEONINE_RESOLVED" : "MASS_BOUNDARY",
    }),
    thanksgiving:Object.freeze({
      route:"GIVE_THANKS",
      separateFromLeonine:true,
      requiresMassCompletionRecord:true,
      manualEntryMayFabricateCompletion:false,
    }),
    invariants:Object.freeze([
      "LEONINE_NOT_INSIDE_CANONICAL_MASS_GRAPH",
      "LEONINE_NOT_PERSONAL_THANKSGIVING",
      "SOLEMN_AND_SUNG_NEVER_ROUTE_TO_LEONINE",
      "FOLLOWING_ACTIONS_PREEMPT_LEONINE_OFFER",
      "EARLY_READER_EXIT_DOES_NOT_CREATE_MASS_COMPLETION",
    ]),
  });
}

export function buildMassCompletionRecord(prepared){
  const resolvedMass=prepared?.session?.resolvedMass;
  const plan=prepared?.session?.plan;
  if(!resolvedMass || !plan || plan.kind!=="MASS")throw new TypeError("Prepared MASS session required");

  return Object.freeze({
    schema:"ao-mass-completion-v1",
    complete:true,
    date:resolvedMass.date,
    form:resolvedMass.form,
    presentationMode:resolvedMass.presentationMode,
    actualCelebration:Object.freeze({
      id:resolvedMass.actualCelebration?.id??null,
      type:resolvedMass.actualCelebration?.type??null,
      title:resolvedMass.actualCelebration?.title??null,
    }),
    properSource:properSource(resolvedMass),
    communionState:faithfulCommunionState(resolvedMass),
    intentionRef:resolvedMass?.provenance?.intentionRef??null,
    ending:Object.freeze({
      dismissal:plan.dismissal,
      blessingAllowed:plan.blessingAllowed!==false,
      normalLastGospel:plan.normalLastGospel!==false,
      followingGraphs:Object.freeze([...(plan.followingGraphs??[])]),
    }),
  });
}

export function createFormLifecycleRuntime({prepared}={}){
  const resolvedMass=prepared?.session?.resolvedMass;
  const plan=prepared?.session?.plan;
  const contract=plan?.lifecycle ?? compileFormLifecycle(resolvedMass,plan);

  let stage="MASS_ACTIVE";
  let completionRecord=null;
  let leonineAccepted=null;

  function snapshot(){
    return Object.freeze({
      schema:"ao-form-lifecycle-runtime-v1",
      stage,
      form:contract.form,
      contract,
      completionRecord,
      leonineAccepted,
      massComplete:completionRecord?.complete===true,
      handoff:stage==="LEONINE_HANDOFF" ? "LEONINE_PRAYERS"
        : stage==="FOLLOWING_ACTION_HANDOFF" ? "FOLLOWING_ACTION"
        : stage==="GIVE_THANKS_HANDOFF" ? "GIVE_THANKS"
        : null,
    });
  }

  function enterMassBoundary(){
    if(stage!=="MASS_ACTIVE")return snapshot();
    completionRecord=buildMassCompletionRecord(prepared);
    if(contract.followingAction.active) stage="FOLLOWING_ACTION_HANDOFF";
    else if(contract.leonine.eligible) stage="LEONINE_OFFER";
    else stage="DEPARTURE";
    return snapshot();
  }

  function chooseLeonine(accept){
    if(stage!=="LEONINE_OFFER")throw new Error("Leonine decision is not currently available");
    leonineAccepted=accept===true;
    stage=leonineAccepted ? "LEONINE_HANDOFF" : "DEPARTURE";
    return snapshot();
  }

  function completeLeonine(){
    if(stage!=="LEONINE_HANDOFF")throw new Error("Leonine handoff is not active");
    stage="DEPARTURE";
    return snapshot();
  }

  function completeFollowingAction(){
    if(stage!=="FOLLOWING_ACTION_HANDOFF")throw new Error("Following-action handoff is not active");
    stage="DEPARTURE";
    return snapshot();
  }

  function advance(){
    if(stage==="MASS_ACTIVE")return enterMassBoundary();
    if(stage==="DEPARTURE"){
      stage="GIVE_THANKS_HANDOFF";
      return snapshot();
    }
    return snapshot();
  }

  return Object.freeze({
    schema:"ao-form-lifecycle-runtime-v1",
    contract,
    snapshot,
    enterMassBoundary,
    chooseLeonine,
    completeLeonine,
    completeFollowingAction,
    advance,
  });
}
