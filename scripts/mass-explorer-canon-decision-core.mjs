/**
 * Review-only reconciliation of Mass Explorer Canon wording decisions.
 * No code in the public browser or ritual reader imports this module.
 * Approval of wording never asserts source, rights or publication clearance.
 */
import {createHash} from "node:crypto";

const SCHEMA="ao-mass-explorer-canon-owner-decisions-v1";
const RELEASE_SCHEMA="ao-mass-explorer-canon-release-proposal-v1";
const text=v=>typeof v==="string"?v:"";
const canonical=study=>({
 id:study.id,stage_id:study.stage_id,block_ids:study.block_ids,
 profile:study.profile,use:study.use,content_type:study.content_type,
 claim_ids:study.claim_ids,title:study.title,lead:study.lead,sections:study.sections
});
export function canonStudyDigest(study){
 return createHash("sha256").update(JSON.stringify(canonical(study))).digest("hex");
}
export function canonReviewTemplate(studies){
 return {
  schema:SCHEMA,scope:"EDITORIAL_WORDING_ONLY_NOT_PUBLICATION",
  reviewer:null,
  decisions:studies.map(s=>({
   study_id:s.id,block_ids:[...s.block_ids],content_sha256:canonStudyDigest(s),
   decision:"pending",note:""
  })),
  human_review_required:true,formal_rights_check_outstanding:true
 };
}
function fail(message){throw new Error("Mass Explorer Canon decision import refused: "+message)}
function exact(a,b){return Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((v,i)=>v===b[i])}
function candidateList(candidates){
 if(!Array.isArray(candidates)||candidates.length!==8)fail("expected exactly eight source-owned candidate studies");
 const known=new Map();
 for(const s of candidates){
  if(!/^AO\.FORM\.CANON\.DEEP\.0[1-8]$/.test(s?.id||"")||
     known.has(s.id)||s.review_status!=="DRAFT_AWAITING_EDITORIAL_APPROVAL"||
     s.content_type!=="ORIGINAL_EDITORIAL_PARAPHRASE"||
     !Array.isArray(s.block_ids)||s.block_ids.length===0)fail("unknown, repeated or nondraft study");
  known.set(s.id,s);
 }
 if(known.size!==8)fail("eight unique Canon study IDs required");
 const blocks=candidates.flatMap(x=>x.block_ids).sort();
 const canon=Array.from({length:15},(_,i)=>"AO.SM.B"+String(i+47).padStart(3,"0"));
 if(!exact(blocks,canon))fail("B047–B061 original source blocks are not in one-to-one coverage");
 return known;
}
/**
 * Proposals are not public manifests. Even a genuine "approve wording"
 * decision is only one prerequisite for the later rights/publication signoff.
 */
export function reconcileCanonReviewDecisions({decisions,candidates,formation,publicManifest}){
 const known=candidateList(candidates);
 if(publicManifest?.status!=="NO_APPROVED_STUDIES"||
    !Array.isArray(publicManifest.entries)||publicManifest.entries.length!==0)
   fail("original zero-release manifest was unexpectedly changed");
 if(formation?.schema!=="ao-mass-formation-campion-v1"||
    formation?.status!=="SOURCE_BACKED_FORMATION")fail("published Formation source unavailable");
 if(decisions?.schema!==SCHEMA||
    decisions?.scope!=="EDITORIAL_WORDING_ONLY_NOT_PUBLICATION"||
    decisions?.human_review_required!==true||
    decisions?.formal_rights_check_outstanding!==true||
    !Array.isArray(decisions.decisions)||decisions.decisions.length!==8)
   fail("invalid or incomplete owner-decision export");
 if(decisions.reviewer!==null&&decisions.reviewer!==undefined&&
    (typeof decisions.reviewer!=="string"||
     decisions.reviewer.length<3||decisions.reviewer.length>120||
     decisions.reviewer.trim()!==decisions.reviewer))
   fail("invalid editorial reviewer name");
 const owner=decisions.reviewer||null;
 const used=new Set(),results=[],proposed=[];
 for(const row of decisions.decisions){
  const study=known.get(row?.study_id);
  if(!study||used.has(row.study_id))fail("unknown or duplicate study decision");
  used.add(row.study_id);
  if(!exact(row.block_ids,study.block_ids))fail("study-to-block ownership mismatch: "+row.study_id);
  if(row.content_sha256!==canonStudyDigest(study))fail("stale or missing exact-content fingerprint: "+row.study_id);
  if(!["approve","revise","pending"].includes(row.decision))fail("unknown decision: "+row.study_id);
  if(typeof row.note!=="string"||row.note.length>4000)fail("invalid decision notes");
  const stage=formation.stages.find(x=>x.id===study.stage_id);
  if(!stage||study.claim_ids.some(id=>!stage.claims.some(c=>c.id===id))||
     study.sections.some(s=>s.claim_ids.some(id=>!study.claim_ids.includes(id))))
   fail("unapproved P1 claim attribution in "+row.study_id);
  const missingReviewer=row.decision==="approve"&&!owner;
  const effective=missingReviewer?"AWAITING_REVIEWER_ID":
                  row.decision==="approve"?"WORDING_APPROVED_RIGHTS_AND_RELEASE_HELD":
                  row.decision==="revise"?"REVISION_REQUIRED":"NOT_REVIEWED";
  const result={study_id:study.id,block_ids:[...study.block_ids],
   content_sha256:canonStudyDigest(study),decision:row.decision,
   gate_status:effective,note:row.note};
  results.push(result);
  if(row.decision==="approve"&&owner){
   proposed.push({...canonical(study),
    editor_decision:"WORDING_APPROVED_ONLY",
    wording_reviewer:owner,
    release_status:"NOT_AUTHORIZED_FOR_PUBLICATION",
    formal_rights_review:"OUTSTANDING",
    final_source_certification:"OUTSTANDING"
   });
  }
 }
 const sorted=results.sort((a,b)=>a.study_id.localeCompare(b.study_id));
 const proposedSorted=proposed.sort((a,b)=>a.id.localeCompare(b.id));
 return {
  schema:RELEASE_SCHEMA,
  status:"REVIEW_PROPOSAL_ONLY_DO_NOT_PUBLISH",
  scope:"FORMATION_ONLY",
  public_release_permitted:false,
  original_public_manifest_unchanged:true,
  human_editor:owner,
  certification:{human_wording_decisions_imported:sorted.filter(x=>x.decision==="approve").length,
   reviewer_identified:Boolean(owner),formal_rights_reviewed:false,
   source_claims_released:0,public_release_authorized:false},
  totals:{studies:8,approved_wording:sorted.filter(x=>x.decision==="approve").length,
   blocked_missing_reviewer:sorted.filter(x=>x.gate_status==="AWAITING_REVIEWER_ID").length,
   needs_revision:sorted.filter(x=>x.decision==="revise").length,
   unreviewed:sorted.filter(x=>x.decision==="pending").length,
   potentially_eligible_after_rights:proposedSorted.length,
   public_studies:0},
  decisions:sorted,proposed_wording_only:proposedSorted,
  release_gate:["Independent formal rights review for each included item",
   "Review final source citations and claims before public teaching",
   "Document human signoff date and reviewer identity",
   "Create a separate release commit with explicit reviewed manifest entries",
   "Re-run required App, Mass Explorer mobile and R17 convergence tests"],
  unchanged:["LIVE","SIMPLE","MISSAL","R17","PROPER_SELECTION","1962_RUBRICS"]
 };
}
