// M03: 1962 Roman Missal §§515–516, common sung-Mass tone-family resolver.
// Resolve only the RUBRICAL family of the celebrant's prayers/Preface/Pater
// noster; this does not approve any melody, GABC encoding, audio or heard music.
// SOURCE: 1962 General Rubrics, Pars III, nn. 513–516.
// https://maternalheart.org/library/1962rubrics.pdf (pp. 94–95).
import {isExplicitRequiemMass} from "./reader-requiem-conditions.js";

const freeze=Object.freeze;
export const MASS_TONE_CONTEXT_SCHEMA="ao-1962-sourced-tone-context-v1";
export const MASS_TONE_CONTEXT_OWNER="1962_PROPER_RESOLVER";
export const MASS_TONE_RUBRICS=freeze({
 source:"MISSAL_ROMANUM_1962_GENERAL_RUBRICS",paragraphs:freeze(["513","514","515","516"]),
 sourceUrl:"https://maternalheart.org/library/1962rubrics.pdf"
});
const SOLEMN=new Set(["SUNDAY","FESTIVE_MASS","SATURDAY_BVM_OFFICE",
 "HOLY_THURSDAY_MASS","EASTER_VIGIL_MASS","WITHIN_APPROVED_OCTAVE"]);
const FERIAL=new Set(["FERIA"]);
const COMMON=new Set(["COLLECT","PREFACE_DIALOGUE","PATERNOSTER","POSTCOMMUNION"]);
function output(status,family,reason,context=null){
 return freeze({schema:"ao-mass-common-tone-family-v1",status,family,reason,
  source:MASS_TONE_RUBRICS,
  sourceContext:context?freeze({kind:context.kind,liturgicalClass:context.liturgicalClass??null,
   owner:context.sourceOwner}):null,
  musicEncoded:false,musicalScoreApproved:false,actuallySung:"UNKNOWN",
  seasonalInference:false});
}
function verifiedContext(input){
 if(!input||input.schema!==MASS_TONE_CONTEXT_SCHEMA||
    input.sourceOwner!==MASS_TONE_CONTEXT_OWNER||input.verified!==true)return null;
 const kind=String(input.celebrationKind??"").toUpperCase();
 const ordinal=input.liturgicalClass;
 if(!kind || (ordinal!=null&&![1,2,3,4].includes(ordinal)))return null;
 return {kind,liturgicalClass:ordinal??null,sourceOwner:input.sourceOwner};
}
/** A calendar date, liturgical colour, season label, or saint name alone
 * cannot certify whether THIS selected Mass is festive, ferial or votive.
 * Only a verified actual-Mass context from the 1962 Proper resolver can do so.
 */
export function resolve1962CommonMassTone({
 resolvedMass=null,toneContext=null
}={}){
 const req=isExplicitRequiemMass({session:{resolvedMass}});
 const candidate=toneContext??resolvedMass?.provenance?.musicToneContext??null;
 const ctx=verifiedContext(candidate);
 if(req){
  if(ctx&&ctx.kind!=="REQUIEM"&&ctx.kind!=="MASS_FOR_DEAD")
   return output("CONFLICT","UNRESOLVED","REQUIEM_CONTEXT_CONTRADICTION",ctx);
  return output("RUBRICAL_FAMILY_RESOLVED","FERIAL","1962_516_D_REQUIEM",ctx);
 }
 if(!ctx)return output("REQUIRES_VERIFIED_CELEBRATION","UNRESOLVED",
   "NO_SOURCE_CERTIFIED_ACTUAL_MASS_CLASS");
 const type=String(resolvedMass?.actualCelebration?.type??"").toUpperCase();
 if(["REQUIEM","MASS_FOR_THE_DEAD"].includes(ctx.kind))
  return output("CONFLICT","UNRESOLVED","REQUIEM_CONTEXT_WITHOUT_EXPLICIT_REQUIEM_MASS",ctx);
 if(type==="VOTIVE"&&ctx.kind!=="VOTIVE")
  return output("CONFLICT","UNRESOLVED","ACTUAL_VOTIVE_CLASS_CONFLICT",ctx);
 if(ctx.kind==="VOTIVE"&&type&&type!=="VOTIVE")
  return output("CONFLICT","UNRESOLVED","SOURCE_OWNER_NOT_A_VOTIVE_MASS",ctx);
 if(SOLEMN.has(ctx.kind))
  return output("RUBRICAL_FAMILY_RESOLVED","SOLEMN","1962_515_"+ctx.kind,ctx);
 if(FERIAL.has(ctx.kind))
  return output("RUBRICAL_FAMILY_RESOLVED","FERIAL","1962_516_A_FERIA",ctx);
 if(["VIGIL","VOTIVE"].includes(ctx.kind)){
  if(ctx.liturgicalClass===1&&ctx.kind==="VIGIL")
   return output("RUBRICAL_FAMILY_RESOLVED","SOLEMN","1962_515_C_VIGIL_I",ctx);
  if([2,3].includes(ctx.liturgicalClass)&&ctx.kind==="VIGIL")
   return output("RUBRICAL_FAMILY_RESOLVED","FERIAL","1962_516_B_VIGIL_II_III",ctx);
  if([1,2,3].includes(ctx.liturgicalClass)&&ctx.kind==="VOTIVE")
   return output("RUBRICAL_FAMILY_RESOLVED","SOLEMN","1962_515_F_VOTIVE_I_III",ctx);
  if(ctx.liturgicalClass===4&&ctx.kind==="VOTIVE")
   return output("RUBRICAL_FAMILY_RESOLVED","FERIAL","1962_516_C_VOTIVE_IV",ctx);
  return output("REQUIRES_VERIFIED_CELEBRATION","UNRESOLVED",
   "UNSUPPORTED_CLASS_FOR_VERIFIED_"+ctx.kind,ctx);
 }
 return output("REQUIRES_VERIFIED_CELEBRATION","UNRESOLVED",
   "UNHANDLED_ACTUAL_MASS_KIND",ctx);
}
/** Common tones govern orations, Preface and Pater noster only.
 * Gospel tones, Gloria/Credo intonations and dismissal chant have their
 * OWN printed melodic sources and may not inherit this seasonal melody.
 */
export function resolve1962DialogueToneFamily(eventId,args={}){
 const id=String(eventId??"");
 if(!COMMON.has(id))return null;
 const classification=resolve1962CommonMassTone(args);
 return freeze({
  ...classification,eventId:id,
  celebrantAndResponseMustMatch:id==="PREFACE_DIALOGUE",
  matchedResponseFamily:id==="PREFACE_DIALOGUE" &&
    classification.status==="RUBRICAL_FAMILY_RESOLVED"?classification.family:null,
  scoreStatus:"PENDING_SOURCE_NOTATION_AND_EDITORIAL_APPROVAL",
  // A solemnior Preface is a separate, manually validated optional source;
  // it must not be selected automatically for a first-class feast.
  optionalSolemnior:"REQUIRES_EXPLICIT_SOURCE_AND_EDITORIAL_SELECTION"
 });
}
