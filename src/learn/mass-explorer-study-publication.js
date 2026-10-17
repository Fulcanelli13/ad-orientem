/**
 * Release gate for original bilingual explanatory prose in Mass Explorer.
 * This is neither historical-source certification nor a ritual reader.
 * No draft P0/P2 research JSON may be consumed by this module.
 */
export const MASS_EXPLORER_STUDY_PUBLICATION_VERSION="ao-mass-explorer-study-publication-v1";

const CANON_RELEASE_BINDINGS=Object.freeze([
 ["AO.FORM.CANON.DEEP.01","MF04",[47,48,49,50]],
 ["AO.FORM.CANON.DEEP.02","MF05",[51]],
 ["AO.FORM.CANON.DEEP.03","MF05",[52,53]],
 ["AO.FORM.CANON.DEEP.04","MF06",[54]],
 ["AO.FORM.CANON.DEEP.05","MF06",[55]],
 ["AO.FORM.CANON.DEEP.06","MF06",[56]],
 ["AO.FORM.CANON.DEEP.07","MF04",[57,58,59]],
 ["AO.FORM.CANON.DEEP.08","MF06",[60,61]]
].map(([id,stage,blocks])=>Object.freeze({id,stageId:stage,blockIds:Object.freeze(
 blocks.map(n=>"AO.SM.B"+String(n).padStart(3,"0")))})));
const bindingById=new Map(CANON_RELEASE_BINDINGS.map(x=>[x.id,x]));
const goodString=(s,min,max)=>typeof s==="string"&&s.trim()===s&&s.length>=min&&s.length<=max;
const validDate=s=>typeof s==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&
 !Number.isNaN(Date.parse(s+"T00:00:00Z"));
const localized=(o,min,max)=>o&&typeof o==="object"&&
 goodString(o.en,min,max)&&goodString(o.fr,min,max);
const same=(a,b)=>Array.isArray(a)&&a.length===b.length&&a.every((x,i)=>x===b[i]);
const empty=()=>Object.freeze(new Map());

/**
 * Fail-closed, all-or-nothing. Identity and claim references are checked
 * against already-published P1 stages, not unapproved research source edges.
 * A documented human review is required for any new original commentary.
 */
export function approvedMassExplorerStudies(manifest,catalog,formation){
 if(manifest?.schema!==MASS_EXPLORER_STUDY_PUBLICATION_VERSION||
    manifest?.scope!=="FORMATION_ONLY"||
    manifest?.status!=="RELEASED_FOR_MASS_EXPLORER"||
    !/^AO-MX-STUDY-\d{4}-\d{2}-\d{2}-[A-Z0-9]{3,24}$/.test(manifest.release_id||"")||
    !goodString(manifest.reviewed_by,3,120)||!validDate(manifest.approved_on)||
    !Array.isArray(manifest.entries)||manifest.entries.length===0||manifest.entries.length>8||
    formation?.schema!=="ao-mass-formation-campion-v1"||
    formation?.status!=="SOURCE_BACKED_FORMATION"||
    catalog?.byBlock?.size!==96||catalog?.sequence?.length!==32)return empty();
 const result=new Map(),seenStudy=new Set();
 for(const entry of manifest.entries){
  const binding=bindingById.get(entry?.id);
  const stage=formation.stages.find(x=>x.id===binding?.stageId);
  if(!binding||seenStudy.has(entry.id)||entry.stage_id!==binding.stageId||
     !same(entry.block_ids,binding.blockIds)||!stage||
     entry.profile!=="ORDINARY_SUNG"||
     entry.use!=="FORMATION_ONLY"||
     entry.review_status!=="APPROVED_FOR_MASS_EXPLORER"||
     entry.content_type!=="ORIGINAL_EDITORIAL_PARAPHRASE"||
     entry.rights_basis!=="APP_OWNED_ORIGINAL_PROSE"||
     !goodString(entry.reviewed_by,3,120)||
     !validDate(entry.reviewed_on)||
     !goodString(entry.rights_reviewed_by,3,120)||
     !validDate(entry.rights_reviewed_on)||
     !localized(entry.title,12,150)||
     !localized(entry.lead,35,1200)||
     !Array.isArray(entry.sections)||entry.sections.length<1||entry.sections.length>12||
     !Array.isArray(entry.claim_ids)||entry.claim_ids.length<1||
     new Set(entry.claim_ids).size!==entry.claim_ids.length)return empty();
  const claims=new Map((stage.claims||[]).map(c=>[c.id,c]));
  if(entry.claim_ids.some(id=>!claims.has(id)))return empty();
  if(entry.sections.some(s=>!localized(s.heading,8,130)||
     !localized(s.body,75,4000)||
     !Array.isArray(s.claim_ids)||s.claim_ids.length<1||
     s.claim_ids.some(id=>!entry.claim_ids.includes(id))||
     new Set(s.claim_ids).size!==s.claim_ids.length))return empty();
  const blocks=entry.block_ids.map(id=>catalog.byBlock.get(id));
  if(blocks.some((owner,i)=>!owner||owner.source.Proper_Slot||
      owner.source.Block_ID!==entry.block_ids[i]||
      owner.source.Branch_Status!=="NORMATIVE_1962"||
      owner.source.Macro_ID!==("AO.SM.M"+owner.key.slice(-2))))return empty();
  seenStudy.add(entry.id);
  const released=Object.freeze({
   id:entry.id,stageId:entry.stage_id,title:Object.freeze({...entry.title}),
   lead:Object.freeze({...entry.lead}),
   claimIds:Object.freeze([...entry.claim_ids]),
   sections:Object.freeze(entry.sections.map(section=>Object.freeze({
    heading:Object.freeze({...section.heading}),body:Object.freeze({...section.body}),
    claimIds:Object.freeze([...section.claim_ids])
   }))),
   publication:"RELEASED_ORIGINAL_FORMATION_PROSE"
  });
  for(const id of binding.blockIds){
   if(result.has(id))return empty();
   result.set(id,released);
  }
 }
 return Object.freeze(result);
}
export function massExplorerStudyForBlock(approved,blockId){
 return approved instanceof Map?approved.get(blockId)||null:null;
}
export function massExplorerApprovedStudyHtml(study,{french=false,sourceTitle=""}={}){
 if(study?.publication!=="RELEASED_ORIGINAL_FORMATION_PROSE")return "";
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const lg=french?"fr":"en",t=obj=>esc(obj[lg]);
 return '<section class="aoMXDeepStudy" id="ao-mx-deep-study" data-ao-mx-anchor="deep-study" data-ao-mx-study-owner="'+esc(study.id)+'">'+
  '<small>'+esc(french?"FORMATION · ÉTUDE APPROUVÉE":"FORMATION · APPROVED STUDY")+'</small>'+
  '<h2>'+t(study.title)+'</h2>'+
  '<p class="aoMXQuiet">'+esc(french?
   "Étude thématique associée au passage sélectionné. Le texte de la Messe ci-dessus reste la source liturgique.":"Thematic study linked to the selected prayer. The Mass text above remains the liturgical source.")+'</p>'+
  '<p>'+t(study.lead)+'</p>'+
  study.sections.map(s=>'<details class="aoMXDeepSection"><summary>'+t(s.heading)+'</summary><p>'+t(s.body)+'</p></details>').join("")+
  '<p class="aoMXQuiet">'+esc(french?"Source de formation : ":"Formation source: ")+esc(sourceTitle)+
  ' · '+esc(study.stageId)+'</p></section>';
}
