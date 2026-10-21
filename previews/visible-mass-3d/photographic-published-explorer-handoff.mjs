/**
 * Visible Mass → published Mass Explorer handoff.
 *
 * Uses the EXISTING P5 candidate edge identities and the actual production
 * Mass Explorer module API, rather than copying its 32 Guide entries, 96 text
 * blocks, 84 bilingual prayer readings, or stage content into this viewer.
 *
 * Research edges are never promoted to published rubrics by this adapter.
 * This module is private to the draft photographic pilot until approvals,
 * main-branch parity and device QA are complete.
 */
import {VISIBLE_MASS_OBJECT_ACTION_CANDIDATES} from "./photographic-object-mass-bridge.mjs";
import {MASS_EXPLORER_ROUTE} from "../../src/learn/mass-explorer.js";

export const VISIBLE_MASS_PUBLISHED_HANDOFF_VERSION="visible-mass-existing-explorer-handoff-v1";
export const VISIBLE_MASS_PUBLICATION_STATE="DRAFT_CONTEXTUAL_LINKS_REVIEW_ONLY";
const PILOT_OBJECTS=Object.freeze(["AL01","AL06","AL07","AL19","SN02","SN04"]);
const ALLOWED_GUIDES=new Set(["AO.CARD.010","AO.CARD.015","AO.CARD.024","AO.CARD.025"]);

export function visibleMassResearchMomentLinks(objectId,{reviewMode=false}={}){
 if(!reviewMode||!PILOT_OBJECTS.includes(objectId))return Object.freeze([]);
 const links=VISIBLE_MASS_OBJECT_ACTION_CANDIDATES.filter(e=>e.objectId===objectId);
 if(links.some(e=>!ALLOWED_GUIDES.has(e.guideId)||
   e.ritualPublicationStatus!=="CONTEXTUAL_UNREVIEWED"||
   e.assertsPhotoIsSameMass!==false||e.confirms1962ObjectRubric!==false)){
   throw new Error("Visible Mass candidate context must remain source-scoped and unpublished");
 }
 return Object.freeze(links.map(e=>Object.freeze({
   objectId,guideId:e.guideId,label:e.label,relation:e.relation,
   publication:"RESEARCH_CANDIDATE_NOT_RITUAL_INSTRUCTION",
   destination:MASS_EXPLORER_ROUTE
 })));
}

/**
 * Opens the original app module, with its original moment IDs and focus
 * return. In a standalone photographic HTML preview the production module
 * is absent: return an unavailable verdict instead of inventing a parallel
 * Mass Explorer route or a fake deep link.
 */
export async function openVisibleMassInExistingExplorer(win,{objectId,guideId,trigger,reviewMode=false,form="SUNG"}={}){
 const candidate=visibleMassResearchMomentLinks(objectId,{reviewMode})
   .find(e=>e.guideId===guideId);
 if(!candidate)return Object.freeze({ok:false,reason:"UNPUBLISHED_OR_UNSUPPORTED_LINK"});
 if(form!=="SUNG")return Object.freeze({ok:false,reason:"EXPLORER_GUIDE_IS_SUNG_ONLY"});
 if(!win?.AO_MODULES?.open&&!win?.AO_MASS_EXPLORER_V1?.open)
   return Object.freeze({ok:false,reason:"PRODUCTION_EXPLORER_NOT_IN_STANDALONE_PREVIEW"});
 const options={momentKey:guideId,trigger};
 // Existing production implementation owns its own 32 Guide moments,
 // 84 bilingual prayer readings, canonical Latin and Formation navigation.
 try {
   const result=win.AO_MODULES?.open
     ?await win.AO_MODULES.open(MASS_EXPLORER_ROUTE,options)
     :await win.AO_MASS_EXPLORER_V1.open(options);
   const success=result===true||result?.ok===true;
   return Object.freeze(success?
     {ok:true,route:MASS_EXPLORER_ROUTE,momentKey:guideId,owner:"EXISTING_MASS_EXPLORER"}:
     {ok:false,reason:"EXISTING_MASS_EXPLORER_REJECTED"});
 }catch{
   return Object.freeze({ok:false,reason:"EXISTING_MASS_EXPLORER_UNAVAILABLE"});
 }
}
