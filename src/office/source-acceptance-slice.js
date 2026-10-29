/**
 * First source-owner research acceptance slice:
 * independently reviewed Office date -> original Latin source header ->
 * exact trilingual pinned section projection. One component, NOT a complete
 * Hour, printed Breviary collation, selected rubrical variant or publication.
 *
 * The caller supplies the earlier Office-calendar decision; this module
 * cannot elevate it from research to an authenticated 1960 Office ordo.
 */
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";
import {OFFICE_CONDITIONAL_META_SCHEMA} from "./conditional-metadata-parser.js";
import {OFFICE_REVIEWED_HOUR_SCHEMA,composeReviewedOfficeHourDraft}
 from "./reviewed-hour-handoff.js";

export const OFFICE_SOURCE_SLICE_SCHEMA="ao.office.source-acceptance-slice.v1";
const SOURCE=/^(?:Sancti|Tempora|Commune)\/[A-Za-z0-9._-]+$/;
const same=s=>String(s??"").normalize("NFD")
 .replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\s+/g," ").trim();
const fail=reason=>Object.freeze({
 schema:OFFICE_SOURCE_SLICE_SCHEMA,status:"WITHHELD",reason,
 sourceStructureEvidence:false,sectionTitleMatched:false,
 liturgicalSelectionVerified:false,completeHourVerified:false,
 translationCollationVerified:false,rightsApproved:false,
 publishable:false,published:false
});
function validatedHandoff(handoff){
 return handoff?.schema===OFFICE_REVIEWED_HOUR_SCHEMA&&
  handoff.status==="SOURCE_SELECTION_RESEARCH"&&
  handoff.canResearchParse===true&&
  handoff.officeSelectionAuthorized===false&&
  handoff.commemorationsApproved===false&&
  handoff.liturgicallyCertified===false&&
  handoff.publishable===false&&handoff.published===false&&
  handoff.selection?.date===handoff.officeDate&&
  handoff.selection?.hour===handoff.hour&&
  handoff.selection?.officeKey===handoff.officeKey;
}
/**
 * A complete Hour needs Psalter/Ordinary, proper/common selection, preces,
 * commemorations, macro expansion and paragraph-aligned translations.
 * This gates one deliberately incomplete source component slice and
 * refuses disputed/qualified duplicate source headings until editorial
 * condition resolution exists.
 */
export async function reviewOfficeSourceAcceptanceSlice({
 handoff,metadataReader,sourcePath,expectedLatinTitle
}={}){
 if(!validatedHandoff(handoff))
  return fail("OFFICE_PRECEDENCE_RESEARCH_HANDOFF_REQUIRED");
 if(typeof sourcePath!=="string"||!SOURCE.test(sourcePath)||
    sourcePath.includes("..")||
    typeof expectedLatinTitle!=="string"||expectedLatinTitle.length>160||
    !expectedLatinTitle.trim()||
    typeof metadataReader?.readDateLead!=="function")
  return fail("OFFICE_SOURCE_SLICE_CONTRACT_INVALID");
 const refs=handoff.selection.orderedSections;
 if(!Array.isArray(refs)||refs.length<1||refs.length>24||
    refs.some(ref=>ref?.path!==sourcePath||
      typeof ref.section!=="string"||!ref.section.trim()||
      typeof ref.key!=="string"||!ref.key.trim()))
  return fail("OFFICE_SOURCE_SLICE_EXPLICIT_SINGLE_OWNER_REQUIRED");
 // For FIRST Vespers the source's appointment date is Sunday, not the
 // prior Saturday's civil evening. The lead reader checks this association.
 const source=await metadataReader.readDateLead({
  date:handoff.officeDate,path:sourcePath
 });
 if(source?.schema!==OFFICE_CONDITIONAL_META_SCHEMA||
    source.sourceRevision!==DIVINUM_OFFICIUM_PIN||
    source.sourcePath!==sourcePath||source.language!=="la"||
    source.class!==null||source.appointedOffice!==null||
    source.publishable!==false||source.conditionalRulesResolved!==false||
    !Array.isArray(source.sourceSectionHeaders))
  return fail("OFFICE_SOURCE_SLICE_ORIGINAL_METADATA_UNTRUSTED");
 const titles=source.byKind?.Officium?.flatMap(x=>x.titleHints??[])
   .map(x=>same(x.literal))??[];
 if(!titles.includes(same(expectedLatinTitle)))
  return fail("OFFICE_SOURCE_SLICE_LATIN_TITLE_NOT_MATCHED");
 const matched=[];
 for(const ref of refs){
  const hits=source.sourceSectionHeaders.filter(h=>h.name===ref.section);
  if(hits.length!==1||hits[0].qualifier!==null)
   return fail("OFFICE_SOURCE_SLICE_SECTION_VARIANT_UNRESOLVED:"+ref.section);
  matched.push(Object.freeze({
   key:ref.key,section:ref.section,
   sourceSectionLine:hits[0].line,sourcePath
  }));
 }
 return Object.freeze({
  schema:OFFICE_SOURCE_SLICE_SCHEMA,status:"SOURCE_HEADERS_MATCHED_RESEARCH",
  date:handoff.officeDate,civilDate:handoff.civilDate,
  officeKey:handoff.officeKey,officePart:handoff.officePart,
  hour:handoff.hour,sourceRevision:DIVINUM_OFFICIUM_PIN,
  sourcePath,observedLatinTitle:expectedLatinTitle,
  sourceSections:Object.freeze(matched),
  sourceStructureEvidence:true,sectionTitleMatched:true,
  liturgicalSelectionVerified:false,completeHourVerified:false,
  translationCollationVerified:false,rightsApproved:false,
  publishable:false,published:false
 });
}
export async function composeOfficeSourceAcceptanceSlice({
 handoff,metadataReader,resolver,sourcePath,expectedLatinTitle
}={}){
 const checked=await reviewOfficeSourceAcceptanceSlice({
  handoff,metadataReader,sourcePath,expectedLatinTitle
 });
 if(checked.status!=="SOURCE_HEADERS_MATCHED_RESEARCH")
  return checked;
 if(typeof resolver?.resolveParallel!=="function")
  return fail("OFFICE_SOURCE_SLICE_PARALLEL_RESOLVER_REQUIRED");
 let draft;
 try{
  draft=await composeReviewedOfficeHourDraft({resolver,handoff});
 }catch(error){
  // Known missing sections or unresolved source macros are research holds.
  // A programmer error or unexpected host failure is not silently swallowed.
  const code=String(error?.message??"");
  if(!/^(?:OFFICE_SOURCE_(?:SECTION_EMPTY|DIRECTIVE_UNRESOLVED|TEXT_INVALID|SECTION_EXCESSIVE|LINE_INVALID)|OFFICE_AT_(?:SOURCE_|REFERENCE_|OTHER_MACRO_OR_CONDITIONAL_UNRESOLVED)|OFFICE_DRAFT_PARSED_SECTION_UNTRUSTED|OFFICE_PINNED_SOURCE_PROVENANCE_MISMATCH)/u.test(code))
   throw error;
  return fail("OFFICE_SOURCE_SLICE_COMPOSITION_BLOCKED:"+code);
 }
 if(draft?.sourceRevision!==DIVINUM_OFFICIUM_PIN||
    draft.officeKey!==handoff.officeKey||
    draft.date!==handoff.officeDate||
    draft.sections.length!==checked.sourceSections.length||
    draft.publishable!==false||draft.published!==false)
  return fail("OFFICE_SOURCE_SLICE_COMPOSED_DRAFT_UNTRUSTED");
 return Object.freeze({
  ...checked,status:"TRILINGUAL_SOURCE_COMPONENT_SLICE_UNVERIFIED",
  sectionCount:draft.sectionCount,sections:draft.sections,
  // Tri-locale source content existing does not certify translation
  // alignment, the appointed Office, or a full Hour.
  trilingualSectionsLocated:true,translationCollationVerified:false,
  completeHourVerified:false,liturgicalSelectionVerified:false,
  publishable:false,published:false
 });
}
