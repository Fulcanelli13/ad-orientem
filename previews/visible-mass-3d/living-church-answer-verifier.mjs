/**
 * Living Church response boundary. A source URL is not proof that novel prose is
 * supported. In the current pilot, only verbatim canonical answer bodies pass.
 * A later inference backend needs a separately reviewed entailment/citation gate.
 */
export const LIVING_CHURCH_VERIFIED_ANSWER_VERSION="AO_LC_VERBATIM_ANSWER_GATE_V1";
const safeUrl=input=>{try{const u=new URL(input);return u.protocol==="https:"?u.href:null;}catch{return null;}};
const deny=reason=>Object.freeze({ok:false,reason});
export function verifyCanonAnswer(candidate,originalEvidence){
 if(candidate?.ok!==true||originalEvidence?.ok!==true)return deny("MISSING_APPROVED_EVIDENCE");
 if(!["VERBATIM_APPROVED_SOURCE","EXACT_PUBLISHED_FORMATION_P1_CLAIM"].includes(originalEvidence.mode))
  return deny("UNRELEASED_ANSWER_MODE");
 if(candidate.mode!==originalEvidence.mode||candidate.id!==originalEvidence.id||
    candidate.owner!==originalEvidence.owner||candidate.text!==originalEvidence.text||
    candidate.title!==originalEvidence.title)
  return deny("NOVEL_OR_MISATTRIBUTED_PROSE");
 if(typeof candidate.text!=="string"||candidate.text.length<15||candidate.text.length>2500)
  return deny("INVALID_SOURCE_TEXT");
 const evidenceCitations=originalEvidence.citations;
 if(!Array.isArray(evidenceCitations)||evidenceCitations.length===0||
    !Array.isArray(candidate.citations)||candidate.citations.length!==evidenceCitations.length)
  return deny("MISSING_OR_INVENTED_CITATIONS");
 for(let i=0;i<evidenceCitations.length;i++){
  const a=candidate.citations[i],b=evidenceCitations[i];
  if(!safeUrl(a?.url)||safeUrl(a.url)!==safeUrl(b.url)||
     a?.label!==b.label||a?.locator!==b.locator)
   return deny("MUTATED_OR_ADDED_CITATION");
 }
 if(candidate.mode==="EXACT_PUBLISHED_FORMATION_P1_CLAIM"&&
    candidate.citationPrecision!=="DOCUMENT_LEVEL_NOT_QUOTATION_WITNESS")
  return deny("CITATION_PRECISION_MISREPRESENTED");
 return Object.freeze({ok:true,mode:candidate.mode,claimId:candidate.id,
   evidenceOwner:candidate.owner,citationCount:candidate.citations.length,
   inferenceUsed:false,certainty:"VERBATIM_SOURCE_MATCH_ONLY"});
}
