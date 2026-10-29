/**
 * First Vespers single research assembly ledger, one calendar event.
 * Sources are composed here from previously validated research witnesses;
 * unresolved Ordinaries/1960 rubrics remain explicit slots, not generated.
 *
 * This is an end-to-end SOURCE RESEARCH assembly, never a publication engine.
 */
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";
import {ADVENT_FIRST_VESPERS_RESEARCH_SCHEMA}
 from "./advent-first-vespers-source-sequence.js";
import {ADVENT_VESPERS_REMAINDER_SCHEMA}
 from "./advent-vespers-remainder-research.js";
import {OFFICE_MAGNIFICAT_SOURCE_SCHEMA}
 from "./advent-magnificat-source.js";
import {OFFICE_ADVENT_CHAPTER_HYMN_SCHEMA}
 from "./advent-vespers-chapter-hymn.js";
import {OFFICE_SOURCE_SLICE_SCHEMA}
 from "./source-acceptance-slice.js";

export const OFFICE_ADVENT_ASSEMBLY_SCHEMA="ao.office.advent-i-first-vespers-assembly.v1";
const PIN=DIVINUM_OFFICIUM_PIN,DAY="2026-11-29",EVE="2026-11-28";
const LANGUAGES=["la","en","fr"];
const ORDER=Object.freeze([
 ["opening","OPENING"],
 ["five-psalmody","PSALMODY"],
 ["chapter","CHAPTER"],
 ["hymn","HYMN"],
 ["versicle","VERSICLE"],
 ["magnificat-antiphon","MAGNIFICAT_ANTIPHON"],
 ["magnificat-canticle","CANTICLE"],
 ["collect","COLLECT"],
 ["commemorations","COMMEMORATIONS"],
 ["conclusion","CONCLUSION"]
]);
function fail(reason){
 return Object.freeze({
  schema:OFFICE_ADVENT_ASSEMBLY_SCHEMA,status:"WITHHELD",reason,
  sourceTextComponentSlots:0,liturgicallyCompleteSlots:0,
  completeHourVerified:false,printedEditionCertified:false,
  translationAlignmentVerified:false,rightsApproved:false,
  publishable:false,published:false
 });
}
function common(x){return x?.sourceRevision===PIN&&
 x.officeDate===DAY&&x.civilDate===EVE&&
 x.officePart==="FIRST"&&x.publishable===false&&
 x.published===false&&x.appointedOfficeVerified===false&&
 x.completeHourVerified===false}
function languageMap(x){return LANGUAGES.every(lang=>x?.[lang]!==undefined)}
function sourceOnlySlot(key,role,sourceIds,texts,unresolved){
 return Object.freeze({key,role,status:"SOURCE_TEXT_ONLY_NOT_LITURGICALLY_APPOINTED",
  sourceIds:Object.freeze([...sourceIds]),
  texts:Object.freeze(texts),
  originalSourceTextIdentified:true,
  unresolvedLiturgicalGates:Object.freeze([...unresolved]),
  liturgicallyComplete:false,printedEditionCertified:false,
  translationsCollated:false,visibleInLiveReader:false
 });
}
function blockedSlot(key,role,gates){
 return Object.freeze({key,role,status:"WITHHELD_NO_COMPOSED_TEXT",
  sourceIds:Object.freeze([]),texts:null,originalSourceTextIdentified:false,
  unresolvedLiturgicalGates:Object.freeze([...gates]),
  liturgicallyComplete:false,printedEditionCertified:false,
  translationsCollated:false,visibleInLiveReader:false
 });
}
export function assembleAdventFirstVespersResearch({
 sourceSequence,psalmody,properWitness,magnificat,chapterHymn,collect
}={}){
 if(sourceSequence?.schema!==ADVENT_FIRST_VESPERS_RESEARCH_SCHEMA||
    sourceSequence.status!=="SOURCE_SEQUENCE_COMPONENTS_MAPPED_UNVERIFIED"||
    !common(sourceSequence)||sourceSequence.psalmRowsVerifiedAsSourceCandidates!==5)
  return fail("OFFICE_ADVENT_ASSEMBLY_SOURCE_SEQUENCE_REQUIRED");
 if(psalmody?.schema!==ADVENT_FIRST_VESPERS_RESEARCH_SCHEMA||
    psalmody.status!=="FIVE_TRILINGUAL_PSALM_VERSE_COMPONENTS_UNVERIFIED"||
    !common(psalmody)||psalmody.psalmVerseComponents?.length!==5||
    psalmody.gloriaPatriVerified!==false||
    psalmody.requiredAntiphonPlacementVerified!==false)
  return fail("OFFICE_ADVENT_ASSEMBLY_PSALMODY_REQUIRED");
 if(properWitness?.schema!==ADVENT_VESPERS_REMAINDER_SCHEMA||
    properWitness.status!=="VERSICLE_AND_MAGNIFICAT_ANTIPHON_SOURCES_IDENTIFIED"||
    !common(properWitness)||!languageMap(properWitness.languages))
  return fail("OFFICE_ADVENT_ASSEMBLY_PROPER_REQUIRED");
 if(magnificat?.schema!==OFFICE_MAGNIFICAT_SOURCE_SCHEMA||
    magnificat.status!=="MAGNIFICAT_THREE_LANGUAGE_SOURCE_COMPONENT_UNVERIFIED"||
    !common(magnificat)||!languageMap(magnificat.languages)||
    magnificat.rubricAntiphonPlacementVerified!==false)
  return fail("OFFICE_ADVENT_ASSEMBLY_MAGNIFICAT_REQUIRED");
 if(chapterHymn?.schema!==OFFICE_ADVENT_CHAPTER_HYMN_SCHEMA||
    chapterHymn.status!=="THREE_LANGUAGE_CHAPTER_HYMN_SOURCE_UNVERIFIED"||
    !common(chapterHymn)||!languageMap(chapterHymn.languages))
  return fail("OFFICE_ADVENT_ASSEMBLY_CHAPTER_HYMN_REQUIRED");
 if(collect?.schema!==OFFICE_SOURCE_SLICE_SCHEMA||
    collect.status!=="TRILINGUAL_SOURCE_COMPONENT_SLICE_UNVERIFIED"||
    collect.civilDate!==EVE||collect.date!==DAY||
    collect.officePart!=="FIRST"||collect.sourceRevision!==PIN||
    collect.publishable!==false||collect.published!==false||
    collect.completeHourVerified!==false||
    !Array.isArray(collect.sections))
  return fail("OFFICE_ADVENT_ASSEMBLY_COLLECT_REQUIRED");
 const collectSection=collect.sections.find(x=>
  x.role==="COLLECT"&&x.sourceId==="Tempora/Adv1-0#Oratio");
 if(!collectSection||!languageMap(collectSection.texts)||
    !LANGUAGES.every(lang=>collectSection.texts[lang].trim()&&
      collectSection.referenceTraces?.[lang]?.some(t=>
       t.sourceId==="Psalterium/Common/Prayers#Qui vivis")))
  return fail("OFFICE_ADVENT_ASSEMBLY_COLLECT_SOURCE_TRACE_MISSING");
 const linesByLanguage={},slots=[];
 for(const lang of LANGUAGES){
  const chap=chapterHymn.languages[lang],mag=magnificat.languages[lang],
   verse=properWitness.languages[lang];
  const ps=psalmody.psalmVerseComponents;
  if(ps.some((item,i)=>item.psalmNumber!==109+i||
     item.languages?.[lang]?.sourceTrace?.[0]?.sourceId!==
      "Psalterium/Psalmorum/Psalm"+(109+i)+"#VERSES"||
     typeof item.languages?.[lang]?.antiphon!=="string"))
   return fail("OFFICE_ADVENT_ASSEMBLY_PSALM_TRACE_INCOMPLETE:"+lang);
  if(mag.canticle?.verses?.length!==10||
     mag.sourceTrace?.[1]?.sourceId!==
      "Psalterium/Psalmorum/Psalm232#LUKE_1_46_55"||
     chap.chapter?.sourceTrace?.[1]?.sourceId!==
      "Psalterium/Common/Prayers#Deo gratias"||
     verse.versicleSourceId!=="Psalterium/Special/Major Special#Adv Versum 3"||
     !Array.isArray(chap.hymn?.lines))
   return fail("OFFICE_ADVENT_ASSEMBLY_SOURCE_TRACE_INCOMPLETE:"+lang);
  linesByLanguage[lang]=Object.freeze({
   psalmody:ps.map(item=>Object.freeze({
    antiphon:item.languages[lang].antiphon,
    verses:item.languages[lang].psalmVerses
   })),
   chapter:Object.freeze({
    text:chap.chapter.chapterText,response:chap.chapter.response
   }),
   hymn:chap.hymn.lines,
   versicle:verse.versicle,
   magnificatAntiphon:verse.magnficatAntiphon,
   magnificat:Object.freeze({
    verses:mag.canticle.verses,gloria:mag.gloria
   }),
   collect:collectSection.texts[lang]
  });
 }
 const project=field=>Object.fromEntries(LANGUAGES.map(lang=>
  [lang,linesByLanguage[lang][field]]));
 slots.push(blockedSlot("opening","OPENING",[
  "1960_INITIAL_PATER_AVE_AND_DEUS_IN_ADJUTORIUM_APPOINTMENT"]));
 slots.push(sourceOnlySlot("five-psalmody","PSALMODY",
  ["Psalterium/Psalmi/Psalmi major#Day0 Vespera","Tempora/Adv1-0#Ant Laudes",
   ...[109,110,111,112,113].map(n=>"Psalterium/Psalmorum/Psalm"+n+"#VERSES")],
  project("psalmody"),[
   "PSALM_ANTIPHON_REPETITION_AND_GLORIA_PATRI_1960"]));
 slots.push(sourceOnlySlot("chapter","CHAPTER",[
  "Tempora/Adv1-0#Capitulum Laudes","Psalterium/Common/Prayers#Deo gratias"
 ],project("chapter"),["CHAPTER_FIRST_VESPERS_RUBRIC_APPOINTMENT"]));
 slots.push(sourceOnlySlot("hymn","HYMN",[
  "Psalterium/Special/Major Special#Hymnus Adv Vespera"
 ],project("hymn"),["1960_HYMN_AND_D0XOLOGY_PRINTED_COLLATION"]));
 slots.push(sourceOnlySlot("versicle","VERSICLE",[
  "Tempora/Adv1-0#Versum 1","Psalterium/Special/Major Special#Adv Versum 3"
 ],project("versicle"),["VERSICLE_FIRST_VESPERS_RUBRIC_APPOINTMENT"]));
 slots.push(sourceOnlySlot("magnificat-antiphon","MAGNIFICAT_ANTIPHON",[
  "Tempora/Adv1-0#Ant 1"
 ],project("magnificatAntiphon"),["FIRST_VESPERS_MAGNIFICAT_ANTIPHON_APPOINTMENT"]));
 slots.push(sourceOnlySlot("magnificat-canticle","CANTICLE",[
  "Psalterium/Psalmorum/Psalm232#LUKE_1_46_55",
  "Psalterium/Common/Prayers#Gloria"
 ],project("magnificat"),["GLORIA_AND_ANTIPHON_LITURGICAL_PLACEMENT"]));
 slots.push(sourceOnlySlot("collect","COLLECT",[
  "Tempora/Adv1-0#Oratio","Psalterium/Common/Prayers#Qui vivis"
 ],project("collect"),["1960_COLLECT_AND_CONCURRENCE_APPOINTMENT"]));
 slots.push(blockedSlot("commemorations","COMMEMORATIONS",[
  "1960_OCCURRENCE_AND_CONCURRENCE_COMMDECISION"]));
 slots.push(blockedSlot("conclusion","CONCLUSION",[
  "1960_BENEDICAMUS_FIDELIUM_ANIMAE_AND_LOCAL_VARIANTS"]));
 if(slots.length!==10||slots.some((x,i)=>x.key!==ORDER[i][0]||x.role!==ORDER[i][1]))
  return fail("OFFICE_ADVENT_ASSEMBLY_ORDER_MISMATCH");
 return Object.freeze({
  schema:OFFICE_ADVENT_ASSEMBLY_SCHEMA,
  status:"ORDERED_TRILINGUAL_SOURCE_RESEARCH_NOT_A_COMPLETE_OFFICE",
  sourceRevision:PIN,civilDate:EVE,officeDate:DAY,
  hour:"VESPERS",officePart:"FIRST",
  sourceComponentSlots:slots.length,
  sourceTextComponentSlots:slots.filter(x=>x.originalSourceTextIdentified).length,
  liturgicallyCompleteSlots:0,
  slots:Object.freeze(slots),
  unresolvedSlots:Object.freeze(slots.filter(x=>!x.originalSourceTextIdentified).map(x=>x.key)),
  appointedOfficeVerified:false,completeHourVerified:false,
  printedEditionCertified:false,translationAlignmentVerified:false,
  rightsApproved:false,publishable:false,published:false
 });
}
