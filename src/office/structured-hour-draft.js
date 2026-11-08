/**
 * Assemble a RESEARCH-ONLY source-first Office hour from an explicit section
 * selection. The liturgical ordo must supply that selection independently;
 * this function NEVER derives precedence from the Mass calendar, guesses
 * substitute Commons, or calls the upstream CGI Office composer.
 */
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";
import {OFFICE_PARSED_PARALLEL_SCHEMA} from "./source-section-resolver.js";
import {ANNUAL_OFFICE_HOURS} from "./annual-readiness-register.js";

export const OFFICE_HOUR_DRAFT_SCHEMA="ao.office.structured-hour-draft.v1";
const DAY=/^\d{4}-\d{2}-\d{2}$/;
const KEY=/^[a-zA-Z][a-zA-Z0-9._:-]{0,95}$/;
function exactDay(date){
  return typeof date==="string"&&DAY.test(date)&&
    !Number.isNaN(Date.parse(date+"T12:00:00Z"))&&
    new Date(date+"T12:00:00Z").toISOString().slice(0,10)===date;
}
/**
 * Selection is editorial research input, not proof of liturgical correctness.
 * All returned content stays unapproved even if the caller has a manuscript
 * reference; complete-hour and legal clearance gates are separate.
 */
export async function composeOfficeHourDraft({resolver,selection}={}){
  if(typeof resolver?.resolveParallel!=="function")
    throw Error("OFFICE_DRAFT_SOURCE_RESOLVER_REQUIRED");
  if(!exactDay(selection?.date)||!ANNUAL_OFFICE_HOURS.includes(selection?.hour)||
     selection?.edition!=="ROMAN_1960"||
     selection?.sourceRevision!==DIVINUM_OFFICIUM_PIN||
     typeof selection?.officeKey!=="string"||!KEY.test(selection.officeKey)||
     selection?.status!=="RESEARCH_SELECTION"||
     !Array.isArray(selection?.orderedSections)||
     selection.orderedSections.length===0||selection.orderedSections.length>150)
    throw Error("OFFICE_DRAFT_SELECTION_INVALID");

  // No skip-if-missing or fallback: each selected source component must exist
  // in ALL three languages, and each sequence slot is uniquely named.
  const ids=new Set();
  const refs=[];
  for(const entry of selection.orderedSections){
    if(!entry||!KEY.test(entry.key??"")||ids.has(entry.key)||
       typeof entry.path!=="string"||typeof entry.section!=="string"||
       typeof entry.role!=="string")
      throw Error("OFFICE_DRAFT_SECTION_ID_INVALID");
    ids.add(entry.key);
    refs.push(Object.freeze({key:entry.key,path:entry.path,
      section:entry.section,role:entry.role}));
  }

  const sourceSections=await Promise.all(refs.map(ref=>
    resolver.resolveParallel({path:ref.path,section:ref.section,role:ref.role})));
  const sections=sourceSections.map((source,i)=>{
    const ref=refs[i];
    if(source?.schema!==OFFICE_PARSED_PARALLEL_SCHEMA||
       source?.sourceRevision!==DIVINUM_OFFICIUM_PIN||
       source?.sourceId!==ref.path+"#"+ref.section||
       source?.status!=="PARSED_UNVERIFIED"||source.publishable!==false||
       source.alignmentVerified!==false||
       !source.texts||!["la","en","fr"].every(lang=>
         typeof source.texts[lang]==="string"&&source.texts[lang].trim()))
      throw Error("OFFICE_DRAFT_PARSED_SECTION_UNTRUSTED");
    const traces=source.referenceTraces??null;
    if(traces!==null&&(!["la","en","fr"].every(lang=>
       Array.isArray(traces[lang])&&traces[lang].length>0&&
       traces[lang].every(item=>
         typeof item.sourceId==="string"&&
         item.language===lang))))
      throw Error("OFFICE_DRAFT_REFERENCE_TRACE_UNTRUSTED");
    const psalmVersesOnly=source.psalmVersesExpandedWithoutDoxology===true;
    if(psalmVersesOnly&&source.psalmDoxologyAndAntiphonVerified!==false)
      throw Error("OFFICE_DRAFT_PSALM_LITURGICAL_METADATA_UNTRUSTED");
    return Object.freeze({key:ref.key,role:ref.role,sourceId:source.sourceId,
      texts:source.texts,
      ...(traces===null?{}:{referenceTraces:traces}),
      psalmVersesExpandedWithoutDoxology:psalmVersesOnly,
      psalmDoxologyAndAntiphonVerified:false,
      alignmentVerified:false});
  });
  return Object.freeze({
    schema:OFFICE_HOUR_DRAFT_SCHEMA,edition:"ROMAN_1960",
    date:selection.date,hour:selection.hour,officeKey:selection.officeKey,
    sourceRevision:DIVINUM_OFFICIUM_PIN,status:"STRUCTURED_UNVERIFIED",
    sections:Object.freeze(sections),sectionCount:sections.length,
    psalmVerseOnlyComponentCount:sections.filter(s=>s.psalmVersesExpandedWithoutDoxology).length,
    psalmDoxologyAndAntiphonVerified:false,
    // These are independent release gates, not proven by parsing.
    officePrecedenceVerified:false,officeCompletenessVerified:false,
    languagesAligned:false,printedEditionCertified:false,
    rightsApproved:false,publishable:false,published:false
  });
}
