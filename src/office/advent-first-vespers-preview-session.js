/**
 * One bounded, browser-optional research-session pipeline for Advent I
 * FIRST Vespers 2026-11-28. No public route, no annual capture, no Office CGI.
 * A caller supplies an existing source-reading transport + one adjudicated
 * universal-calendar witness. A failed component withholds the WHOLE preview.
 */
import {DIVINUM_OFFICIUM_PIN as PIN} from "../app/source-transport-compat.js";
import {OFFICE_PRECEDENCE_RULESET,OFFICE_PRECEDENCE_SOURCE,
 reviewOfficeOccurrence} from "./precedence-review.js";
import {reviewOfficeHourHandoff} from "./reviewed-hour-handoff.js";
import {reviewAdventFirstVespersSourceSequence,
 assembleAdventFirstVespersPsalmodyResearch}
 from "./advent-first-vespers-source-sequence.js";
import {createOfficeAtReferenceResolver} from "./at-reference-resolver.js";
import {reviewAdventVespersOrdinaryStructure,
 reviewAdventVespersVersicleAndMagnificat}
 from "./advent-vespers-remainder-research.js";
import {assembleAdventMagnificatSourceResearch}
 from "./advent-magnificat-source.js";
import {assembleAdventVespersChapterAndHymnResearch}
 from "./advent-vespers-chapter-hymn.js";
import {reviewAdventVespersOrdinaryPrayerSources}
 from "./advent-vespers-ordinary-prayers.js";
import {assembleAdventFirstVespersResearch}
 from "./advent-first-vespers-assembled-research.js";
import {OFFICE_SOURCE_SLICE_SCHEMA} from "./source-acceptance-slice.js";
import {reviewAdventI2026UniversalCommemoration}
 from "./advent-first-vespers-universal-commemoration.js";
import {reviewAdventI2026CollectConclusion}
 from "./advent-i-collect-ending-1960-research.js";
import {reviewAdventFirstVespers1960RubricPlan}
 from "./advent-first-vespers-rubric-plan.js";
import {projectAdventI2026ResearchPreview}
 from "./advent-first-vespers-preview-model.js";

export const ADVENT_FIRST_VESPERS_PREVIEW_SESSION_SCHEMA=
 "ao.office.advent-i-2026-private-preview-session.v1";
const DAY="2026-11-29",EVE="2026-11-28",PROPER="Tempora/Adv1-0";
function hold(reason){
 return Object.freeze({schema:ADVENT_FIRST_VESPERS_PREVIEW_SESSION_SCHEMA,
  status:"WITHHELD",reason,preview:null,
  completeHourCertified:false,publishable:false,published:false});
}
function candidate(date,id,kind,tablePosition,{first=false,second=true}={}){
 return {id,date,kind,tablePosition,
  class:tablePosition<=13?1:tablePosition<=21?2:tablePosition<=27?3:4,
  ruleset:OFFICE_PRECEDENCE_RULESET,calendarScope:"UNIVERSAL",
  witness:{rubricSource:OFFICE_PRECEDENCE_SOURCE,sourceId:"research:"+id},
  printedOfficeCertified:false,sourceTextApproved:false,
  hasFirstVespers:first,hasSecondVespers:second};
}
function occurrence(date,items){
 return reviewOfficeOccurrence({
  date,candidates:items,
  officeCalendarEvidence:"INDEPENDENT_OFFICE_CANDIDATES_RESEARCH",
  localCalendarStatus:"UNIVERSAL_ONLY"
 });
}
function validSource(x,status){
 return x?.status===status&&x.publishable===false&&x.published===false;
}
export async function assembleAdventI2026PrivatePreviewSession({
 readSource,readPsalmSource,readCanticleSource,readOrdinaryText,
 universalWitness,recitation,minister
}={}){
 if(typeof readSource!=="function"||
    typeof readPsalmSource!=="function"||
    typeof readCanticleSource!=="function"||
    typeof readOrdinaryText!=="function"||
    !["SOLO","CHOIR_OR_COMMON"].includes(recitation)||
    !["BELOW_DEACON","DEACON_OR_HIGHER"].includes(minister))
  return hold("PRIVATE_PREVIEW_SOURCE_AND_ROLE_INPUTS_REQUIRED");
 const universal=reviewAdventI2026UniversalCommemoration({
  witness:universalWitness
 });
 if(!validSource(universal,"UNIVERSAL_NO_COMMEMORATION_RESEARCH_REVIEWED"))
  return hold("UNIVERSAL_1960_CALENDAR_REVIEW_NOT_VALID");
 const previous=occurrence(EVE,[
  candidate(EVE,"saturday-bvm","SATURDAY_BVM",27,{second:false})
 ]);
 const following=occurrence(DAY,[
  candidate(DAY,"advent-i-2026-11-29","SUNDAY",6,{first:true})
 ]);
 const handoff=reviewOfficeHourHandoff({
  civilDate:EVE,hour:"VESPERS",occurrence:previous,
  followingOccurrence:following,
  selection:{status:"RESEARCH_SELECTION",edition:"ROMAN_1960",
   date:DAY,hour:"VESPERS",officeKey:"advent-i-2026-11-29",
   officePart:"FIRST",sourceRevision:PIN,orderedSections:[
    {key:"collect",path:PROPER,section:"Oratio",role:"COLLECT"}
   ]}
 });
 if(handoff?.status!=="SOURCE_SELECTION_RESEARCH"||
    handoff.canResearchParse!==true)
  return hold("1960_OFFICE_HANDOFF_NOT_ESTABLISHED");
 let sourceSequence,psalmody,properWitness,ordinary,chapterHymn;
 let magnificat,openingClosing,collectSection,collectEnding;
 try{
  sourceSequence=await reviewAdventFirstVespersSourceSequence({
   handoff,readSource
  });
  if(!validSource(sourceSequence,"SOURCE_SEQUENCE_COMPONENTS_MAPPED_UNVERIFIED"))
   return hold("SOURCE_SEQUENCE:"+sourceSequence?.reason);
  const resolver=createOfficeAtReferenceResolver({
   readSource,readPsalmSource,enablePsalmVerses:true,
   enableStandardPrayers:true,maxDocuments:64
  });
  const originalOrdinary=await readOrdinaryText("Ordinarium/Vespera");
  ordinary=reviewAdventVespersOrdinaryStructure({
   sourcePath:"Ordinarium/Vespera",sourceRevision:PIN,
   sourceText:originalOrdinary
  });
  if(!validSource(ordinary,"ORDINARY_ORDER_SOURCE_OBSERVED_CONDITIONAL_UNRESOLVED"))
   return hold("ORDINARY_SOURCE:"+ordinary?.reason);
  [psalmody,properWitness,openingClosing,collectEnding]=await Promise.all([
   assembleAdventFirstVespersPsalmodyResearch({
    sourceSequence,psalmVerseResolver:resolver
   }),
   reviewAdventVespersVersicleAndMagnificat({sourceSequence,readSource}),
   reviewAdventVespersOrdinaryPrayerSources({
    ordinaryWitness:ordinary,readSource
   }),
   reviewAdventI2026CollectConclusion({
    readSource,recitation,minister
   })
  ]);
  if(!validSource(psalmody,"FIVE_SATURDAY_PSALM_SEGMENTS_TRILINGUAL_UNVERIFIED"))
   return hold("SATURDAY_PSALMODY:"+psalmody?.reason);
  if(!validSource(properWitness,"VERSICLE_AND_MAGNIFICAT_ANTIPHON_SOURCES_IDENTIFIED"))
   return hold("PROPER_VERSICLE:"+properWitness?.reason);
  if(!validSource(openingClosing,"OPENING_AND_CONCLUSION_SOURCE_CANDIDATES_UNVERIFIED"))
   return hold("ORDINARY_COMPONENTS:"+openingClosing?.reason);
  if(!validSource(collectEnding,"THREE_LANGUAGE_SOURCE_COLLECT_AND_DISMISSAL_VARIANTS_NOT_PRINT_CERTIFIED"))
   return hold("COLLECT_ENDING:"+collectEnding?.reason);
  [magnificat,chapterHymn,collectSection]=await Promise.all([
   assembleAdventMagnificatSourceResearch({
    sourceObservation:properWitness,readCanticleSource,readSource
   }),
   assembleAdventVespersChapterAndHymnResearch({
    sourceSequence,readSource
   }),
   resolver.resolveParallel({path:PROPER,section:"Oratio",role:"COLLECT"})
  ]);
 }catch(err){
  return hold("PINNED_SOURCE_READ_OR_PARSER_FAILED:"+String(err?.message??err));
 }
 if(!validSource(magnificat,"MAGNIFICAT_THREE_LANGUAGE_SOURCE_COMPONENT_UNVERIFIED")||
    !validSource(chapterHymn,"THREE_LANGUAGE_CHAPTER_HYMN_SOURCE_UNVERIFIED")||
    collectSection?.status!=="PARSED_UNVERIFIED"||
    collectSection?.sourceId!=="Tempora/Adv1-0#Oratio"||
    collectSection.sourceRevision!==PIN)
  return hold("MAGNIFICAT_CHAPTER_HYMN_OR_COLLECT_SOURCE_WITHHELD");
 const collect={
  schema:OFFICE_SOURCE_SLICE_SCHEMA,
  status:"TRILINGUAL_SOURCE_COMPONENT_SLICE_UNVERIFIED",
  civilDate:EVE,date:DAY,officePart:"FIRST",sourceRevision:PIN,
  sections:[{
   role:"COLLECT",sourceId:collectSection.sourceId,
   texts:collectSection.texts,referenceTraces:collectSection.referenceTraces
  }],
  completeHourVerified:false,publishable:false,published:false
 };
 const assembly=assembleAdventFirstVespersResearch({
  sourceSequence,psalmody,properWitness,magnificat,
  chapterHymn,collect,openingClosing
 });
 if(!validSource(assembly,"ORDERED_TRILINGUAL_SOURCE_RESEARCH_NOT_A_COMPLETE_OFFICE")||
    assembly.sourceTextComponentSlots!==9)
  return hold("TEN_SLOT_ASSEMBLY_WITHHELD:"+assembly?.reason);
 const rubricPlan=reviewAdventFirstVespers1960RubricPlan({
  assembly,calendarScope:"UNIVERSAL",recitation,minister,
  universalCommemoration:universal,collectEndingReview:collectEnding
 });
 if(!validSource(rubricPlan,"RUBRIC_ORDER_RESEARCH_WITH_HELD_COLLATION"))
  return hold("1960_RUBRIC_SEQUENCE_WITHHELD:"+rubricPlan?.reason);
 const preview=projectAdventI2026ResearchPreview({
  assembly,rubricPlan,collectEndingReview:collectEnding
 });
 if(!validSource(preview,"PRIVATE_RESEARCH_PREVIEW_SOURCE_SEQUENCE_ONLY"))
  return hold("PREVIEW_PROJECTION_WITHHELD:"+preview?.reason);
 return Object.freeze({
  schema:ADVENT_FIRST_VESPERS_PREVIEW_SESSION_SCHEMA,
  status:"RESEARCH_PREVIEW_ASSEMBLED_NOT_RELEASED",preview,
  sourceRevision:PIN,civilDate:EVE,officeDate:DAY,
  languageCount:3,sourceComponentSlots:9,
  completeHourCertified:false,rightsApproved:false,
  publishable:false,published:false
 });
}
