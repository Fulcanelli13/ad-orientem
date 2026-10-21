/**
 * Living Catena independent editorial handoff.
 * Decisions are LOCAL/EXPORT-ONLY. Nothing here can publish commentary.
 * AI source assessments remain unapproved regardless of reviewer disposition.
 */
export const CATENA_REVIEW_EXPORT_SCHEMA="ao.catena.editorial-human-review-export.v1";
export const CATENA_REVIEW_CHECKS=Object.freeze([
  "verbatim","fullContext","speaker","originalWork","readerQuestion","editionAndRights"
]);
export const CATENA_REVIEW_DECISIONS=Object.freeze(["pending","approve","revise","hold","reject"]);
const ROUTABLE=new Set(["direct","direct_with_caution"]);
const HASH=/^[a-f0-9]{64}$/;
export function isCatenaReviewRouteEligible(record){
 return Boolean(record&&ROUTABLE.has(record.AIContextAssessment));
}
export function validateCatenaReviewDecision(candidate,decision){
 if(!candidate||typeof candidate.sourcePointer!=="string")
  throw Error("CATENA_REVIEW_UNKNOWN_CANDIDATE");
 if(!decision||decision.sourcePointer!==candidate.sourcePointer||
    !CATENA_REVIEW_DECISIONS.includes(decision.disposition))
  throw Error("CATENA_REVIEW_DECISION_INVALID");
 if(decision.disposition==="pending")
  return {sourcePointer:candidate.sourcePointer,disposition:"pending",publicationEligibility:"blocked_research_only"};
 const reviewer=String(decision.reviewer||"").trim();
 const note=String(decision.editorialReason||"").trim();
 if(reviewer.length<3||reviewer.length>160||note.length<20||note.length>4000)
  throw Error("CATENA_REVIEW_ATTRIBUTION_OR_REASON_REQUIRED");
 const originalWorkReference=String(decision.originalWorkReference||"").trim();
 const sourceDigest=String(decision.sourceSHA256||"").toLowerCase();
 const checks=Object.fromEntries(CATENA_REVIEW_CHECKS.map(k=>[k,decision.checks?.[k]===true]));
 if(decision.disposition==="approve"){
  if(!isCatenaReviewRouteEligible(candidate))
   throw Error("CATENA_REVIEW_ESCALATED_CANDIDATE_CANNOT_BE_APPROVED");
  if(Object.values(checks).some(v=>v!==true))
   throw Error("CATENA_REVIEW_CHECKLIST_INCOMPLETE");
  if(!HASH.test(sourceDigest)||originalWorkReference.length<12||originalWorkReference.length>1500)
   throw Error("CATENA_REVIEW_SOURCE_ATTESTATION_REQUIRED");
 }
 if(sourceDigest&&!HASH.test(sourceDigest))throw Error("CATENA_REVIEW_HASH_INVALID");
 return Object.freeze({
  sourcePointer:candidate.sourcePointer,originalReaderQuestion:candidate.originalReaderQuestion,
  inheritedFatherLabel:candidate.inheritedFatherLabel,
  contextClass:candidate.AIContextAssessment,disposition:decision.disposition,
  reviewer,editorialReason:note,originalWorkReference,
  verifiedChecklist:checks,sourceSHA256:sourceDigest||null,
  recordedAt:typeof decision.recordedAt==="string"&&
   /^\d{4}-\d\d-\d\dT/.test(decision.recordedAt)?decision.recordedAt:null,
  authorLabelCriticallyVerifiedByAssistant:false,
  humanApprovalRequiresSeparateRepositoryImport:true,
  publicationEligibility:"blocked_research_only"
 });
}
export function buildCatenaReviewExport(records,decisions,{sourceResearchCommit}={}){
 if(!Array.isArray(records)||records.length!==30||
   typeof sourceResearchCommit!=="string"||!HASH.test(sourceResearchCommit.toLowerCase().padEnd(64,"0"))&&
    !/^[a-f0-9]{40}$/.test(sourceResearchCommit))
  throw Error("CATENA_REVIEW_SOURCE_REVISION_INVALID");
 const by=new Map(records.map(r=>[r.sourcePointer,r]));
 if(by.size!==30)throw Error("CATENA_REVIEW_DUPLICATE_SOURCE");
 const map=decisions instanceof Map?decisions:new Map(Object.entries(decisions||{}));
 for(const key of map.keys())if(!by.has(key))throw Error("CATENA_REVIEW_UNKNOWN_POINTER_IN_EXPORT");
 const data=records.map(r=>validateCatenaReviewDecision(r,map.get(r.sourcePointer)||
   {sourcePointer:r.sourcePointer,disposition:"pending"}));
 return Object.freeze({
  schema:CATENA_REVIEW_EXPORT_SCHEMA,
  sourceResearchCommit,
  sourceEditorRegistry:"ao.catena.matthew-first-30-app-preview-review.v1",
  status:"local_human_editor_submissions_not_automatically_trusted_or_published",
  totalCandidates:30,counts:{
   pending:data.filter(r=>r.disposition==="pending").length,
   approve:data.filter(r=>r.disposition==="approve").length,
   revise:data.filter(r=>r.disposition==="revise").length,
   hold:data.filter(r=>r.disposition==="hold").length,
   reject:data.filter(r=>r.disposition==="reject").length
  },
  releaseGate:"Independent audit, source/edition integrity, second-editor acceptance and explicit reviewed PR required before any publication",
  noVerbatimSourceTextCopied:true,
  records:data
 });
}
