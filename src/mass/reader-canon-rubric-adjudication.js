// Source-checked Canon editorial review. This is deliberately separate from
// published R17 rubrics; no French wording can enter LIVE without an explicit
// later editorial approval step. In particular, a word trigger is NOT a
// non-text action, and source cue focus is NOT the priest's live state.
import {
  validateCanonRubricReview,createCanonRubricReviewController,
} from "./reader-canon-rubric-review.js";
import {createCanonMinisterFormReviewController} from "./reader-canon-minister-branches.js";
import {resolveCanonLatinWordAnchors} from "./reader-canon-latin-anchors.js";

const EXPECTED_TYPES=Object.freeze({
  SOURCE_LATIN_WORDS:50,
  ORDERED_NON_TEXT_CEREMONY:10,
  PERSISTENT_SOURCE_STATE:1,
  OBSERVED_ANTICIPATORY_EVENT:1,
});
const ALL_TYPES=new Set(Object.keys(EXPECTED_TYPES));
const ACCEPTED_STATUS="SOURCE_RECHECKED_ORIGINAL_FRENCH_DRAFT_NOT_PUBLISHED";
const ACTION_RE=/^AO\.CANON\.R62\.\d{3}$/;
// Form-owned covering is not universally a priest gesture (Ritus VIII.8, IX.4).
const FORM_OWNED_CHALICE_STAGES=new Map([
  ["AO.CANON.R62.034.04","AO.CANON.MIN.010"],
  ["AO.CANON.R62.059.02","AO.CANON.MIN.008"],
]);

function sortedActionMap(items,label){
  const result=new Map();
  for(const item of items){
    if(!ACTION_RE.test(String(item?.id??""))||result.has(item.id))
      throw new Error(label+": duplicate or invalid source action");
    result.set(item.id,item);
  }
  return result;
}

export function validateCanonRubricAdjudication({
  canonData,triggerAudit,frenchReview,
}={}){
  const baseline=validateCanonRubricReview(canonData);
  if(triggerAudit?.schema!=="ao-mass-canon-62-source-trigger-audit-v1" ||
     triggerAudit.status!=="SOURCE_CHECKED_ANCHORS_PENDING_FRENCH_AND_RUNTIME_APPROVAL" ||
     frenchReview?.schema!=="ao-canon-62-french-rubric-review-batch-v1" ||
     frenchReview.status!==ACCEPTED_STATUS ||
     frenchReview.displayPolicy?.inTextApprovalRequired!==true ||
     frenchReview.displayPolicy?.priestClockIndependent!==true ||
     frenchReview.displayPolicy?.ministerClockIndependent!==true ||
     frenchReview.displayPolicy?.faithfulPostureDerived!==false)
    throw Error("Cannot turn Canon source research into published/user-facing French rubrics");
  if(!Array.isArray(triggerAudit.rows)||triggerAudit.rows.length!==62 ||
     !Array.isArray(frenchReview.rows)||frenchReview.rows.length!==62)
    throw Error("62 action source and French review rows required");
  const source=sortedActionMap(canonData.rows.flatMap(r=>r.candidateActions.map(a=>({
    ...a,cueId:r.cueId,
  }))),"Canon review");
  const triggers=sortedActionMap(triggerAudit.rows,"Trigger audit");
  const french=sortedActionMap(frenchReview.rows,"French review");
  if(source.size!==62||triggers.size!==62||french.size!==62)
    throw Error("Canon editorial review action identity divergence");
  const kinds=Object.fromEntries(Object.keys(EXPECTED_TYPES).map(k=>[k,0]));
  let unresolved=0,changedDrafts=0,flagged=0;
  for(const [id,baselineAction] of source){
    const tr=triggers.get(id),fr=french.get(id);
    if(!tr||!fr||tr.cueId!==baselineAction.cueId ||
       fr.cueId!==baselineAction.cueId ||
       tr.actor!==baselineAction.actor||fr.actor!==baselineAction.actor ||
       tr.actionKey!==baselineAction.key ||
       tr.rubricSource!==baselineAction.ritusLocator ||
       fr.ritusLocator!==baselineAction.ritusLocator ||
       fr.sourceAnchorType!==tr.sourceAnchorType ||
       fr.reviewState!=="ORIGINAL_FRENCH_SOURCE_RECHECK_DRAFT_NOT_APPROVED_FOR_USER_DISPLAY")
      throw Error(id+": Canon French/source event identity diverges");
    if(!ALL_TYPES.has(tr.sourceAnchorType))throw Error(id+": unknown anchor type");
    kinds[tr.sourceAnchorType]++;
    if(tr.sourceAnchorType==="SOURCE_LATIN_WORDS"){
      if(tr.triggerVerifiedInCue!==true||
         !String(tr.verifiedSourceWordAnchor??"").trim()||
         fr.latinTrigger!==tr.verifiedSourceWordAnchor)
        throw Error(id+": Latin word anchor is not source-verified");
    }else if(tr.verifiedSourceWordAnchor!==null ||
             fr.latinTrigger!==null)
      throw Error(id+": event-only action must not be assigned invented Latin words");
    if(tr.sourceAnchorType==="OBSERVED_ANTICIPATORY_EVENT" &&
       !(baselineAction.actor==="SERVER"&&id==="AO.CANON.R62.062"))
      throw Error(id+": anticipated bell may not be synchronised to Hanc igitur");
    if(tr.sourceAnchorType==="PERSISTENT_SOURCE_STATE" &&
       id!=="AO.CANON.R62.026")
      throw Error(id+": finger discipline may not become a transient gesture");
    if(!Array.isArray(tr.stageSequence)||tr.stageSequence.some(
      stage=>stage.sourceCueId!==tr.cueId||stage.canonicalCue!==false ||
         !stage.id.startsWith(id+".")
    ))throw Error(id+": review micro-stages must not manufacture 1962 text cues");
    if(!String(fr.revisedFrenchRubric??"").trim() ||
       !Array.isArray(fr.sourceURLs)||fr.sourceURLs.length===0)
      throw Error(id+": French rubric or source unavailable");
    if(!Array.isArray(fr.editorialFlags))
      throw Error(id+": missing qualification ledger");
    if(fr.revisedFrenchRubric!==fr.draftFrenchOriginal)changedDrafts++;
    if(fr.editorialFlags.length)flagged++;
    if(fr.reviewState.includes("NOT_APPROVED"))unresolved++;
  }
  for(const [type,count] of Object.entries(EXPECTED_TYPES))
    if(kinds[type]!==count)throw Error("Canonical anchor-class inventory changed: "+type+" "+kinds[type]);
  if(unresolved!==62)throw Error("Unapproved French draft incorrectly published");
  return Object.freeze({
    ...baseline,reviewActions:62,anchorKinds:Object.freeze(kinds),
    frenchRedrafts:changedDrafts,withEditorialFlags:flagged,
    publicationReady:0,editorialState:"ALL_62_FRENCH_DRAFTS_NEED_PUBLICATION_APPROVAL",
  });
}

export function createCanonRubricAdjudicationController({
  canonData,triggerAudit,frenchReview,ministerData=null,
}={}){
  if(!canonData||!triggerAudit||!frenchReview)
    return Object.freeze({supported:false,status:"COMPLETE_SOURCE_TRIAD_REQUIRED",
      project:()=>Object.freeze({previewEnabled:false,canPublish:false,
        priestActions:Object.freeze([]),ministerActions:Object.freeze([])})});
  const audit=validateCanonRubricAdjudication({canonData,triggerAudit,frenchReview});
  const original=createCanonRubricReviewController({data:canonData});
  const byFrench=sortedActionMap(frenchReview.rows,"French review");
  const byTrigger=sortedActionMap(triggerAudit.rows,"Trigger audit");
  const ministerController=createCanonMinisterFormReviewController({data:ministerData});
  function project(cueId,options={}){
    const base=original.project(cueId,options);
    if(base.previewEnabled!==true)return base;
    const ministry=ministerController.project(cueId,options);
    const observedStages=new Set(options.observedStageIds??[]);
    const solemn=String(options.form??"LOW").toUpperCase()==="SOLEMN";
    const augment=action=>{
      const fr=byFrench.get(action.id),tr=byTrigger.get(action.id);
      const anchor=resolveCanonLatinWordAnchors({
        sourceLatin:tr.sourceLatin,anchorKind:tr.sourceAnchorType,
        anchorLatin:tr.verifiedSourceWordAnchor,
      });
      if(tr.sourceAnchorType==="SOURCE_LATIN_WORDS"&&anchor.status!=="WORD_MATCH_EXACT")
        throw new Error(action.id+": cannot place a French rubric at an unverified Latin word span");
      if(tr.sourceAnchorType!=="SOURCE_LATIN_WORDS"&&anchor.status!=="NON_TEXT_SOURCE_EVENT")
        throw new Error(action.id+": event-only rubric cannot borrow a word span");
      return Object.freeze({
        ...action,
        frenchDraft:fr.revisedFrenchRubric,
        priorFrenchDraft:fr.draftFrenchOriginal,
        anchorKind:tr.sourceAnchorType,
        checkedLatinWords:tr.verifiedSourceWordAnchor,
        exactLatinSpans:anchor.spans,anchorResolution:anchor.status,
        // Observing an action group is not observation of all its ordered
        // steps: host/chalice genuflections, elevation and covering have
        // separate independent minister/priest clocks.
        actionGroupObserved:action.isObservedNow,
        isObservedNow:tr.stageSequence.length===0&&action.isObservedNow,
        stages:Object.freeze(tr.stageSequence
          .filter(s=>!(solemn&&FORM_OWNED_CHALICE_STAGES.has(s.id)))
          .map(s=>Object.freeze({
            ...s,actor:action.actor,isObservedNow:observedStages.has(s.id),
            observedBy:"INDEPENDENT_MICRO_STAGE_EVENT_ONLY",
            publishable:false,
          }))),
        editorialFlags:Object.freeze([...fr.editorialFlags]),
        sourceRitusLocator:tr.rubricSource,
        reviewedAgainst:fr.checkedAgainst,
        canPublish:false,publishable:false,
      });
    };
    return Object.freeze({
      ...base,
      priestActions:Object.freeze(base.priestActions.map(augment)),
      ministerActions:Object.freeze(base.ministerActions.map(augment)),
      conditionalMinisterActions:ministry.ministerActions,
      // In Solemn Mass, covering cannot be assigned to the priest without
      // independent actor evidence; a priest's cue or stage clock is not it.
      formDependentChaliceEvents:Object.freeze(solemn?base.priestActions.flatMap(a=>
        byTrigger.get(a.id).stageSequence
          .filter(st=>FORM_OWNED_CHALICE_STAGES.has(st.id))
          .map(st=>Object.freeze({
            ...st,actor:"UNRESOLVED_PRIEST_OR_DEACON",
            possibleActors:Object.freeze(["PRIEST","DEACON"]),
            conditionalDeaconActionId:FORM_OWNED_CHALICE_STAGES.get(st.id),
            isObservedNow:false,
            observedBy:"INDEPENDENT_ROLE_ATTESTATION_REQUIRED",
            publishable:false,
          }))):[]),
      respondentRole:ministry.respondentRole,
      ministerFormSourceSupported:ministerController.supported,
      canPublish:false,publicationState:"FRENCH_EDITORIAL_SIGNOFF_REQUIRED",
    });
  }
  return Object.freeze({supported:true,audit,project});
}
