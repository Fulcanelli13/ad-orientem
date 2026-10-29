/**
 * Reusable UI-facing projection for any independently selected Roman Office
 * Hour produced by the existing source-first structured-hour composer.
 *
 * This module DOES NOT appoint an Office, select the date's feast,
 * synthesize psalmody, translate, fetch, generate XHTML or publish. The
 * independent reviewed-Hour/explicit-ordo gate must run before this.
 *
 * Future Hours can reuse this projection without a different renderer.
 * A paragraph is only split at original source newlines; chant marks and
 * rubrics are not interpreted or silently deleted.
 */
import {DIVINUM_OFFICIUM_PIN as PIN} from "../app/source-transport-compat.js";
import {OFFICE_HOUR_DRAFT_SCHEMA}
 from "./structured-hour-draft.js";
import {OFFICE_REVIEWED_HOUR_SCHEMA}
 from "./reviewed-hour-handoff.js";
import {OFFICE_BETA_HOURS}
 from "./reader-beta-catalog.js";

export const OFFICE_BETA_PARALLEL_MODEL_SCHEMA="ao.office.beta-parallel-reader.v1";
const LANGS=Object.freeze(["la","en","fr"]);
function hold(reason){
 return Object.freeze({
  schema:OFFICE_BETA_PARALLEL_MODEL_SCHEMA,status:"WITHHELD",reason,
  blocks:Object.freeze([]),canPreview:false,publicReaderEnabled:false,
  sourceTextAltered:false,officeCertified:false,rightsApproved:false,
  publishable:false,published:false
 });
}
function originalLines(s){
 if(typeof s!=="string"||s.length>180000||!s.trim()||
    /[\u0000]/u.test(s))return null;
 const lines=s.split("\n");
 if(lines.some(x=>!x.trim()||x.length>12000))return null;
 return lines;
}
export function projectOfficeBetaParallelHour({draft,handoff}={}){
 if(handoff?.schema!==OFFICE_REVIEWED_HOUR_SCHEMA||
  handoff.status!=="SOURCE_SELECTION_RESEARCH"||
  handoff.canResearchParse!==true||
  handoff.officeSelectionAuthorized!==false||
  handoff.liturgicallyCertified!==false||
  handoff.publishable!==false||handoff.published!==false||
  !OFFICE_BETA_HOURS.includes(handoff.hour))
  return hold("EXPLICIT_OFFICE_RESEARCH_APPOINTMENT_REQUIRED");
 if(draft?.schema!==OFFICE_HOUR_DRAFT_SCHEMA||
  draft.status!=="STRUCTURED_UNVERIFIED"||
  draft.sourceRevision!==PIN||draft.edition!=="ROMAN_1960"||
  draft.date!==handoff.officeDate||
  draft.civilDate!==handoff.civilDate||
  draft.hour!==handoff.hour||
  draft.officeKey!==handoff.officeKey||
  draft.officePart!==handoff.officePart||
  draft.officePrecedenceVerified!==false||
  draft.officeCompletenessVerified!==false||
  draft.languagesAligned!==false||
  draft.rightsApproved!==false||
  draft.publishable!==false||draft.published!==false||
  !Array.isArray(draft.sections)||
  draft.sections.length<1||draft.sections.length>150||
  draft.sections.length!==draft.sectionCount)
  return hold("PINNED_REVIEWED_SOURCE_HOUR_REQUIRED");
 const blocks=[],seen=new Set();
 for(const source of draft.sections){
  if(typeof source?.key!=="string"||!source.key||
   seen.has(source.key)||typeof source.sourceId!=="string"||
   !source.sourceId.includes("#")||
   typeof source.role!=="string"||
   source.alignmentVerified!==false||
   source.psalmDoxologyAndAntiphonVerified!==false)
   return hold("SOURCE_ROLE_OR_IDENTITY_CHANGED");
  const lines={};
  for(const lang of LANGS){
   const parts=originalLines(source.texts?.[lang]);
   if(!parts)return hold("MISSING_UNTRANSLATED_SOURCE_SECTION:"+source.key+":"+lang);
   lines[lang]=Object.freeze([...parts]);
  }
  seen.add(source.key);
  blocks.push(Object.freeze({
   key:source.key,kind:source.role,
   sourceId:source.sourceId,slot:source.key,
   texts:Object.freeze(lines),
   originalSourceOnly:true,
   translationCertified:false,printedEditionCertified:false,
   rightsApproved:false
  }));
 }
 return Object.freeze({
  schema:OFFICE_BETA_PARALLEL_MODEL_SCHEMA,
  status:"REUSABLE_SOURCE_HOUR_RESEARCH_ONLY",
  civilDate:handoff.civilDate,officeDate:handoff.officeDate,
  hour:handoff.hour,officePart:handoff.officePart,
  officeKey:handoff.officeKey,
  sourceRevision:PIN,
  availableLanguages:LANGS,
  blocks:Object.freeze(blocks),blockCount:blocks.length,
  canPreview:true,sourceTextAltered:false,
  originalSourceTextOwnedByPinnedProvider:true,
  officePrecedenceCertified:false,officeCompletenessCertified:false,
  languageAlignmentCertified:false,printedEditionCertified:false,
  rightsApproved:false,publicReaderEnabled:false,
  publishable:false,published:false
 });
}
