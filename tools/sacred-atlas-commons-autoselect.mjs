#!/usr/bin/env node
/**
 * Sacred Atlas: deterministic automated editorial *candidate* selection.
 * User delegated selecting the best photo, NOT copyright/identity certification.
 * No licence-bypass, no auto-publishing, no changing Place IDs or previous votes.
 */
import {readFileSync,writeFileSync} from "node:fs";
const dir="data/geography/research";
const ids=["001","002","003"];
const existing=JSON.parse(readFileSync(dir+"/approved-sacred-object-acquisition-p68.v1.json","utf8"));
const previouslyReviewed=new Map(existing.photos.map(p=>[p.place_id+"\u0000"+p.commons_title,p]));
const selection=[];
const seen=new Set();
const allowed=["CC0","CC BY","CC BY-SA"];
function score(c){
 let value=(c.textual_relevance_score||0)*100;
 if(c.dimensions_sufficient)value+=20;
 if(c.claimed_photographer)value+=10;
 if(c.original_width>=2000)value+=10;
 if(c.commons_sha1)value+=3;
 return value;
}
for(const batch_id of ids){
 const src=JSON.parse(readFileSync(dir+"/sacred-atlas-commons-batch-"+batch_id+".results.json","utf8"));
 const manifest=JSON.parse(readFileSync(dir+"/sacred-atlas-commons-batch-"+batch_id+".manifest.json","utf8"));
 if(src.batch_id!==batch_id||manifest.batch_id!==batch_id||src.results.length!==manifest.total_targets)throw Error("Batch source mismatch "+batch_id);
 for(const r of src.results){
  const manifestTarget=manifest.targets[r.ordinal-1];
  if(!manifestTarget||manifestTarget.subject_id!==r.subject_id||manifestTarget.place_id!==r.place_id)throw Error("Invalid target join "+batch_id+" "+r.ordinal);
  if(seen.has(r.subject_id))throw Error("Duplicate sacred subject "+r.subject_id);
  seen.add(r.subject_id);
  const viable=r.candidates.filter(c=>c.preliminary_free_photo_candidate&&c.photo_license_compatible&&c.dimensions_sufficient&&c.claimed_photographer&&c.commons_title&&c.commons_page&&c.original_url&&c.license_url);
  for(const c of viable)if(!allowed.some(x=>c.claimed_license.toUpperCase().startsWith(x)))throw Error("Unexpected licence "+c.claimed_license);
  const historicHold=["WRONG_PHYSICAL_SITE_DO_NOT_PUBLISH","ARCHIVAL_POSTCARD_PUBLIC_DOMAIN_EVIDENCE_INCOMPLETE"].includes(manifestTarget.known_candidate_hold);
  const permitted=viable.filter(c=>!historicHold||c.commons_title!==r.unchanged_original_candidate);
  const preferred=permitted.filter(c=>c.textual_relevance_score>=0.18).sort((a,b)=>score(b)-score(a));
  const pick=preferred[0]||null;
  const p68=pick?previouslyReviewed.get(r.place_id+"\u0000"+pick.commons_title):null;
  const pending=[];
  if(!pick)pending.push("NO_PLAUSIBLE_FREE_PHOTO_CANDIDATE");
  else {
   pending.push("PHYSICAL_SUBJECT_VISUAL_CHECK");
   pending.push("UNDERLYING_ARTWORK_RIGHTS_REVIEW");
   pending.push("ORIGINAL_IMAGE_BYTES_SHA256_AND_WEBP_QA");
   pending.push("FULL_LICENSE_ATTRIBUTION_IN_READER");
   if(r.subject_class==="SOURCE_ATTESTED_RELIC_IDENTITY")pending.push("DO_NOT_EQUATE_RELIC_WITH_CONTAINER");
   if(r.subject_class==="SOURCE_DESCRIBED_PILGRIMAGE_STOP")pending.push("PHYSICAL_SUBSITE_CONTAINMENT_CHECK");
   if(pick.textual_relevance_score<0.35)pending.push("WEAK_TEXT_MATCH");
  }
  selection.push({
   batch_id,ordinal:r.ordinal,place_id:r.place_id,subject_id:r.subject_id,
   subject_title:r.subject_title,source_url:r.source_url,
   prior_user_keep:r.user_keep_vote,original_file_retained_in_history:r.unchanged_original_candidate,
   original_historical_hold:manifestTarget.known_candidate_hold||null,
   choice_method:"AUTOMATED_SELECTION_WITHOUT_INDIVIDUAL_USER_VOTE",
   candidate_status:pick?(p68?"PREVIOUSLY_REVIEWED_EXACT_SOURCE_REUSE_ACQUISITION_PENDING":"SOURCED_PHOTO_CANDIDATE_PENDING_VERIFICATION"):"NO_SUITABLE_FREE_PHOTO_IDENTIFIED",
   selected_file:pick?{
    title:pick.commons_title,file_page:pick.commons_page,original_url:pick.original_url,
    photographer:pick.claimed_photographer,licence:pick.claimed_license,licence_url:pick.license_url,
    source_sha1:pick.commons_sha1,width:pick.original_width,height:pick.original_height,
    mime:pick.mime,textual_relevance_score:pick.textual_relevance_score,
    asset_kind:"PROPOSED_ORIGINAL_NOT_DOWNLOADED",alt_text_en:r.subject_title,
    requires_full_frame_and_attribution:true,
    existing_p68_media_id:p68?.media_id||null,
    existing_p68_relic_id:p68?.relic_id||null
   }:null,
   candidate_count:r.candidates.length,
   unresolved:pending,
   gates:{physical_subject_verified:false,artwork_rights_verified:false,original_file_integrity_verified:false,publication_approved:false,published:false}
  });
 }
}
if(selection.length!==247)throw Error("Expected exactly 247 targets");
if(selection.filter(x=>x.prior_user_keep).length!==20)throw Error("Previous editorial votes must survive");
if(selection.some(x=>x.gates.publication_approved||x.gates.published))throw Error("Unverified photograph promoted");
const counts={
 subjects:selection.length,round1_keep_decisions_preserved:selection.filter(x=>x.prior_user_keep).length,
 chosen_free_photo_candidates:selection.filter(x=>x.selected_file).length,
 existing_p68_source_reviews_reused:selection.filter(x=>x.selected_file?.existing_p68_media_id).length,
 unresolved_without_candidate:selection.filter(x=>!x.selected_file).length,
 identity_rights_ready_to_publish:0,
 by_batch:Object.fromEntries(ids.map(id=>[id,{targets:selection.filter(x=>x.batch_id===id).length,selected:selection.filter(x=>x.batch_id===id&&x.selected_file).length}]))
};
const out={schema:"AO_SACRED_ATLAS_AUTOSELECT_247_V1",created_at:new Date().toISOString(),
 method:"Rank freely licensed original photos; do NOT promote text match into physical identity or copyright verification. User delegated editorial replacement, not legal clearance.",
 counts,items:selection};
const outpath=dir+"/sacred-atlas-batches-001-003-autoselected.json";
writeFileSync(outpath,JSON.stringify(out,null,2)+"\n");
console.log("Auto-selection (NOT publication):",JSON.stringify(counts));
