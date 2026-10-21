/**
 * Visible Mass P4.2 — read-only projection of existing certified Sung Guide
 * and Formation source owners into the photographic visitor.
 *
 * This code does NOT create a new Mass event, a new Guide entry, a new
 * historical claim, or a correspondence with the 48-card LIVE presentation.
 * It does not claim the three independently photographed Mass scenes occurred
 * at Brompton Oratory or Newman University Church.
 */
import {validateGuideRegistry} from "../../src/mass/reader-guide.js";
import {massMomentStudyLinks} from "../../src/learn/mass-moments-study.js";
import {MASS_MAP_PHASES,massMapPhaseIndex} from "../../src/learn/mass-map.js";

export const VISIBLE_MASS_EXPLORER_BRIDGE_VERSION="visible-mass-explorer-photo-bridge-v1";
export const VISIBLE_MASS_GUIDE_OWNER="data/presentation/guide-registry.v1.json";
export const VISIBLE_MASS_FORMATION_OWNER="data/learn/mass-formation-campion.v1.json";
export const VISIBLE_MASS_PRESENTATION_OWNER="src/learn/mass-explorer.js";

// The photographs are educational examples from separately named churches.
// One Elevation image is related to both Consecration moments; it cannot
// certify the exact species/action without the photograph-level QA.
export const VISIBLE_MASS_PHOTO_STUDY_LINKS=Object.freeze([
 Object.freeze({photoIndex:0,guideIds:Object.freeze(["AO.CARD.001"]),relation:"BROADER_MASS_MOMENT_CONTEXT"}),
 Object.freeze({photoIndex:1,guideIds:Object.freeze(["AO.CARD.015","AO.CARD.016"]),relation:"BROADER_ELEVATION_CONTEXT_REQUIRES_VISUAL_QA"}),
 Object.freeze({photoIndex:2,guideIds:Object.freeze(["AO.CARD.024"]),relation:"CANDIDATE_EVENT_CONTEXT_REQUIRES_VISUAL_QA"})
]);

/**
 * Accept only source-owner registries and return a non-authoritative, stable
 * pointer-based view for a photographic interface. Unsupported Mass profiles
 * must not receive the Sung Guide's ritual instructions.
 */
export function projectVisibleMassExplorer(guideRegistry,formation,{massForm="SUNG"}={}){
 if(massForm!=="SUNG")throw new Error("Only published Sung Guide may be projected into this pilot");
 validateGuideRegistry(guideRegistry);
 if(formation?.schema!=="ao-mass-formation-campion-v1"||
    formation?.status!=="SOURCE_BACKED_FORMATION"||
    !Array.isArray(formation.stages)||formation.stages.length!==8){
   throw new Error("Existing eight-stage Formation source required");
 }
 const ordered=["PRE.ASPERGES",...Array.from({length:30},(_,i)=>
   "AO.CARD."+String(i+1).padStart(3,"0")),"POST.MASS"];
 const stops=ordered.map((id,index)=>{
   const guide=guideRegistry.entries[id],links=massMomentStudyLinks(id);
   if(!guide||!guide.moment||!guide.short||massMapPhaseIndex(index)<0){
     throw new Error("Missing original Guide metadata: "+id);
   }
   if(links.stageId&&!formation.stages.some(s=>s.id===links.stageId)){
     throw new Error("Unresolved existing Formation identity: "+links.stageId);
   }
   const photoContext=VISIBLE_MASS_PHOTO_STUDY_LINKS
     .filter(record=>record.guideIds.includes(id))
     .map(record=>Object.freeze({photoIndex:record.photoIndex,relation:record.relation}));
   return Object.freeze({
     id,title:guide.moment,short:guide.short,index,
     phaseId:MASS_MAP_PHASES[massMapPhaseIndex(index)].id,
     formationStageId:links.stageId,
     photoContext:Object.freeze(photoContext),
     sourceOwner:VISIBLE_MASS_GUIDE_OWNER,
     publication:"EXISTING_CERTIFIED_SUNG_GUIDE_SNAPSHOT",
     readerPresentation48Equivalence:false
   });
 });
 if(stops.length!==32||new Set(stops.map(s=>s.id)).size!==32||
    MASS_MAP_PHASES.reduce((n,p)=>n+p.range[1]-p.range[0]+1,0)!==32){
   throw new Error("Original Mass Map / Guide parity failure");
 }
 const phases=MASS_MAP_PHASES.map(phase=>Object.freeze({
   id:phase.id,title:phase.title,
   stops:Object.freeze(stops.filter(s=>s.phaseId===phase.id))
 }));
 for(const photo of VISIBLE_MASS_PHOTO_STUDY_LINKS){
   for(const id of photo.guideIds)if(!ordered.includes(id))
     throw new Error("Unowned photographic witness link: "+id);
 }
 return Object.freeze({
   schema:"AO_VISIBLE_MASS_MASS_EXPLORER_READ_ONLY_BRIDGE_V1",
   sourceOwner:VISIBLE_MASS_PRESENTATION_OWNER,
   guideOwner:VISIBLE_MASS_GUIDE_OWNER,
   formationOwner:VISIBLE_MASS_FORMATION_OWNER,
   massForm:"SUNG",
   phases:Object.freeze(phases),
   stops:Object.freeze(stops),
   photoStudies:VISIBLE_MASS_PHOTO_STUDY_LINKS,
   publishedGuideCount:32,
   sourceFormationCount:8,
   photographicEvidenceCount:3,
   isPublishedMassReader:false,
   independentAnswersPublished:false
 });
}
