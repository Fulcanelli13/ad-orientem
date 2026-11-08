#!/usr/bin/env node
/**
 * Validate owner-exported photo-specific decisions against the source-hash
 * registry. This script NEVER modifies live assets, authorizes publication,
 * or merges a PR. It only returns a checked reviewer decision summary.
 *
 * Usage: node scripts/art/validate-batch1-photo-decisions.mjs decisions.json
 */
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";

const catalog=JSON.parse(readFileSync(new URL("../../data/artwork/batch1-photo-release-decision-contract.v1.json",import.meta.url),"utf8"));
const known=new Map(catalog.work_items.map(w=>[w.artwork_id,w]));
const expectedFields=["schema","no_automatic_app_publication","decisions"];

function fail(msg){throw new Error("PHOTO_REVIEW_CONTRACT_ERROR: "+msg);}
export function validateBatch1PhotoDecisions(decisionRecord){
 if(!decisionRecord||typeof decisionRecord!=="object"||Array.isArray(decisionRecord))fail("record must be an object");
 for(const key of expectedFields){if(!Object.hasOwn(decisionRecord,key))fail("missing field "+key);}
 if(decisionRecord.schema!==catalog.input_schema)fail("unexpected schema "+decisionRecord.schema);
 if(decisionRecord.no_automatic_app_publication!==true)fail("no_automatic_app_publication must be true");
 if(!Array.isArray(decisionRecord.decisions))fail("decisions must be an array");
 if(decisionRecord.decisions.length>known.size)fail("too many decisions");
 const seen=new Set(), requests=[], holds=[], photoPreferences=[];
 for(const d of decisionRecord.decisions){
  if(!d||typeof d!=="object"||Array.isArray(d))fail("each decision must be an object");
  if(typeof d.artwork_id!=="string"||!known.has(d.artwork_id))fail("unknown artwork_id "+d.artwork_id);
  if(seen.has(d.artwork_id))fail("duplicate artwork decision "+d.artwork_id);
  seen.add(d.artwork_id);
  const w=known.get(d.artwork_id);
  if(d.prayer_placements!==w.prayer_placements)fail("Prayer position count mismatch for "+d.artwork_id);
  if(!["hold","select","approve"].includes(d.decision))fail("invalid decision for "+d.artwork_id);
  if(d.actual_publication_authorized!==false)fail("online publication cannot be authorized in an exported review");
  if(typeof d.credit_and_license_acknowledged!=="boolean"||typeof d.display_edition_acknowledged!=="boolean")fail("required explicit acknowledgement booleans missing");
  if(typeof d.publication_qa_requested!=="boolean")fail("publication QA request boolean missing");
  if(d.photo_id==null){
   if(d.decision!=="hold"||d.photo_source_sha256!=null||d.publication_qa_requested)fail("cannot select/approve a missing photo");
   holds.push({artwork_id:d.artwork_id,reason:"No photo selected"});
   continue;
  }
  const p=w.options.find(p=>p.photo_id===d.photo_id);
  if(!p)fail("unknown exact photo ID "+d.photo_id+" for "+d.artwork_id);
  if(d.photo_source_sha256!==p.source_sha256)fail("source SHA-256 mismatch for "+d.photo_id);
  if(d.technical_rights_gate!==p.rights_state)fail("photo rights-state mismatch for "+d.photo_id);
  if(d.decision==="approve"){
   if(!p.eligible_for_publication_qa_request)fail("rights/quality-held photo cannot be approved: "+d.photo_id);
   if(!d.credit_and_license_acknowledged||!d.display_edition_acknowledged)fail("credit and full-scene edition must be explicitly acknowledged for "+d.photo_id);
   if(!d.publication_qa_requested)fail("approval must request separate publication QA");
   requests.push({artwork_id:d.artwork_id,photo_id:p.photo_id,source_sha256:p.source_sha256,prayer_placements:w.prayer_placements,release_authorized:false});
  }else{
   if(d.publication_qa_requested)fail("non-approved photo cannot request publication QA");
   if(d.decision==="hold")holds.push({artwork_id:d.artwork_id,reason:"Owner held photo / existing assignment unchanged"});
   else photoPreferences.push({artwork_id:d.artwork_id,photo_id:p.photo_id,requires_rights_review:!p.eligible_for_publication_qa_request});
  }
 }
 return {
  schema:"AO_SACRED_ART_BATCH1_VALIDATED_OWNER_PHOTO_DECISIONS_V1",
  checked_photo_versions:seen.size,
  eligible_qa_requests:requests,
  selections_not_release_ready:photoPreferences,
  held:holds,
  public_gallery_modifications:0,
  publication_authorized:false,
  review_credits_and_licences_again_before_PR:true
 };
}
const invoked=process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href;
if(invoked){
 if(process.argv.length!==3)fail("usage: node scripts/art/validate-batch1-photo-decisions.mjs owner-decisions.json");
 const raw=JSON.parse(readFileSync(resolve(process.argv[2]),"utf8"));
 const report=validateBatch1PhotoDecisions(raw);
 console.log(JSON.stringify(report,null,2));
}
