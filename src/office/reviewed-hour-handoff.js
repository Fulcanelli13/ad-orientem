/**
 * Research-only handoff from an independently supplied Office precedence
 * review to the source-first structured-Hour assembler. No new ordo, fetcher,
 * Mass Proper inference, auto-generated section list, or public route.
 *
 * A Vespers evening can belong to tomorrow's office (I Vespers), so the
 * civil evening date and the appointed Office date are separate identities.
 */
import {OFFICE_PRECEDENCE_REVIEW_SCHEMA,reviewOfficeVespersConcurrence}
  from "./precedence-review.js";
import {composeOfficeHourDraft} from "./structured-hour-draft.js";
import {ANNUAL_OFFICE_HOURS} from "./annual-readiness-register.js";

export const OFFICE_REVIEWED_HOUR_SCHEMA="ao.office.reviewed-hour-draft.v1";
function dateOK(d){
 return typeof d==="string"&&/^\d{4}-\d\d-\d\d$/.test(d)&&
  !Number.isNaN(Date.parse(d+"T12:00:00Z"))&&
  new Date(d+"T12:00:00Z").toISOString().slice(0,10)===d;
}
function blocked(reason){
 return Object.freeze({
  schema:OFFICE_REVIEWED_HOUR_SCHEMA,
  status:"WITHHELD",reason,canResearchParse:false,
  officeSelectionAuthorized:false,publishable:false,published:false
 });
}
function safeOccurrence(value,day){
 return value?.schema===OFFICE_PRECEDENCE_REVIEW_SCHEMA&&
  value.stage==="OCCURRENCE"&&value.status==="RUBRIC_CANDIDATE"&&
  value.candidate?.date===day&&
  value.officeSelectionAuthorized===false&&
  value.liturgicallyCertified===false&&value.published===0;
}
/**
 * Even a matching research selection can only be parsed to a draft. A
 * nonempty impeded-feast queue is held rather than silently dropping a
 * commemoration. The same is true for all Vespers commemorations.
 */
export function reviewOfficeHourHandoff({
 civilDate,hour,occurrence,followingOccurrence,selection
}={}){
 if(!dateOK(civilDate)||!ANNUAL_OFFICE_HOURS.includes(hour))
  return blocked("OFFICE_HOUR_OR_CIVIL_DATE_INVALID");
 if(!safeOccurrence(occurrence,civilDate))
  return blocked("OFFICE_OCCURRENCE_UNRESOLVED");
 if((occurrence.outstanding??[]).length)
  return blocked("OFFICE_IMPEDED_CELEBRATION_DISPOSITION_UNRESOLVED");
 let selected=occurrence.candidate,part=null,concurrence=null;
 if(hour==="VESPERS"){
  concurrence=reviewOfficeVespersConcurrence({
   date:civilDate,today:occurrence,tomorrow:followingOccurrence
  });
  if(concurrence.status!=="RUBRIC_CANDIDATE")
   return blocked("OFFICE_VESPERS_CONCURRENCE_UNRESOLVED:"+concurrence.reason);
  if((followingOccurrence?.outstanding??[]).length)
   return blocked("OFFICE_FOLLOWING_IMPEDED_CELEBRATION_UNRESOLVED");
  selected=concurrence.candidate;
  part=selected.part;
 }
 if(selection?.status!=="RESEARCH_SELECTION"||
    selection.hour!==hour||selection.officeKey!==selected.principalId||
    selection.date!==selected.date||
    (hour==="VESPERS"?selection.officePart!==part:selection.officePart!=null))
  return blocked("OFFICE_SOURCE_SELECTION_NOT_MATCHING_REVIEW");
 // Section identities and translations remain independently unverified.
 return Object.freeze({
  schema:OFFICE_REVIEWED_HOUR_SCHEMA,status:"SOURCE_SELECTION_RESEARCH",
  civilDate,hour,officeDate:selected.date,officeKey:selected.principalId,
  officePart:part,precedenceReason:concurrence?.reason??occurrence.reason,
  selection,canResearchParse:true,
  officeSelectionAuthorized:false,commemorationsApproved:false,
  liturgicallyCertified:false,publishable:false,published:false
 });
}
export async function composeReviewedOfficeHourDraft({resolver,handoff}={}){
 if(handoff?.schema!==OFFICE_REVIEWED_HOUR_SCHEMA||
    handoff.status!=="SOURCE_SELECTION_RESEARCH"||
    handoff.canResearchParse!==true||
    handoff.officeSelectionAuthorized!==false||
    handoff.publishable!==false||handoff.published!==false||
    handoff.selection?.date!==handoff.officeDate||
    handoff.selection?.hour!==handoff.hour||
    handoff.selection?.officeKey!==handoff.officeKey)
  throw Error("OFFICE_RESEARCH_HANDOFF_NOT_ELIGIBLE");
 const draft=await composeOfficeHourDraft({resolver,selection:handoff.selection});
 if(draft.date!==handoff.officeDate||draft.officeKey!==handoff.officeKey||
    draft.hour!==handoff.hour||draft.publishable!==false)
  throw Error("OFFICE_RESEARCH_DRAFT_IDENTITY_CHANGED");
 return Object.freeze({
  ...draft,civilDate:handoff.civilDate,officePart:handoff.officePart,
  sourceSelectionEvidence:"RESEARCH_PRECEDENCE_CANDIDATE_ONLY",
  // Still no proof of commemoration, printed words, translations, or rights.
  officePrecedenceVerified:false,officeCompletenessVerified:false,
  languagesAligned:false,commemorationsApproved:false,
  printedEditionCertified:false,rightsApproved:false,
  publishable:false,published:false
 });
}
