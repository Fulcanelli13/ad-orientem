/**
 * One reusable source-owned *research* sequence for 2026 Advent I First Vespers.
 * It is a gate/manifest, not a synthetic Vespers, a new universal Office ordo,
 * a full-hour HTML compositor, or a printed-rubrics certification.
 *
 * Pinned original source:
 *   web/www/horas/Ordinarium/Vespera.txt
 *   web/www/horas/{Latin,English,Francais}/Tempora/Adv1-0.txt
 *   web/www/horas/{Latin,English,Francais}/Psalterium/Psalmi/Psalmi major.txt
 *   web/cgi-bin/horas/specials/{psalmi,capitulis,hymni}.pl
 *
 * Source metadata reviewed at DO revision 126a07f91ed... The Latin proper
 * has [Ant Vespera] -> @:Ant Laudes, while EN/FR directly include the five
 * [Ant Laudes] translations but not that reference heading. That is
 * structurally normal; it is NOT permission to fallback between languages.
 */
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";
import {OFFICE_REVIEWED_HOUR_SCHEMA} from "./reviewed-hour-handoff.js";

export const ADVENT_FIRST_VESPERS_RESEARCH_SCHEMA="ao.office.advent-i-first-vespers-source-sequence.v1";
const PROPER="Tempora/Adv1-0";
const PSALTER="Psalterium/Psalmi/Psalmi major";
const LANGUAGES=Object.freeze(["la","en","fr"]);
const EXPECTED_PSALMS=Object.freeze([109,110,111,112,113]);
const LITURGICAL_COMPONENTS=Object.freeze([
 ["opening","OPENING","Ordinarium/Vespera#Incipit"],
 ["five-psalmody","PSALMODY",PSALTER+"#Day0 Vespera | "+PROPER+"#Ant Laudes"],
 ["chapter","CHAPTER",PROPER+"#Capitulum Laudes"],
 ["hymn","HYMN","Psalterium/Special/Major Special#Hymnus Adv Vespera"],
 ["versicle","VERSICLE",PROPER+"#Versum 1 -> Psalterium/Special/Major Special#Adv Versum 3"],
 ["magnificat-antiphon","MAGNIFICAT_ANTIPHON",PROPER+"#Ant 1"],
 ["magnificat-canticle","CANTICLE","Psalterium/Psalmorum (Magnificat, source selection pending)"],
 ["collect","COLLECT",PROPER+"#Oratio -> Psalterium/Common/Prayers#Qui vivis"],
 ["commemorations","COMMEMORATIONS","RG106-114; BR250-259"],
 ["conclusion","CONCLUSION","Ordinarium/Vespera#Conclusio"]
]);
const SLICE_SOURCE=/^[a-zA-Z0-9][a-zA-Z0-9 _.,:;*’'\-()]+$/u;
function withhold(reason,extra={}){
 return Object.freeze({
  schema:ADVENT_FIRST_VESPERS_RESEARCH_SCHEMA,
  status:"WITHHELD",reason,psalmRowsVerifiedAsSourceCandidates:0,
  appointedOfficeVerified:false,completeHourVerified:false,
  printedEditionCertified:false,translationAlignmentVerified:false,
  rightsApproved:false,publishable:false,published:false,
  ...extra
 });
}
function validHandoff(h){
 return h?.schema===OFFICE_REVIEWED_HOUR_SCHEMA&&
  h.status==="SOURCE_SELECTION_RESEARCH"&&h.canResearchParse===true&&
  h.civilDate==="2026-11-28"&&h.officeDate==="2026-11-29"&&
  h.hour==="VESPERS"&&h.officePart==="FIRST"&&
  h.officeKey==="advent-i-2026-11-29"&&
  h.selection?.date===h.officeDate&&
  h.selection?.officeKey===h.officeKey&&
  h.selection?.hour==="VESPERS"&&h.selection?.sourceRevision===DIVINUM_OFFICIUM_PIN&&
  h.officeSelectionAuthorized===false&&h.commemorationsApproved===false&&
  h.liturgicallyCertified===false&&h.publishable===false&&
  h.published===false;
}
function safeSource(doc,path,language){
 return doc?.sourceRevision===DIVINUM_OFFICIUM_PIN&&
  doc.sourcePath===path&&doc.language===language&&
  doc.map instanceof Map;
}
function normalLines(doc,section,count){
 const raw=doc.map.get(section);
 if(!Array.isArray(raw)||raw.length!==count)return null;
 const lines=[];
 for(const v of raw){
  if(typeof v!=="string")return null;
  const line=v.trim();
  if(!line||line.length>450||/[<>]/u.test(line)||
    /^(?:[$&@!#%{(]|\/[:])/u.test(line)||
    /^\s*\d{1,3}:/u.test(line))return null;
  lines.push(line);
 }
 return lines;
}
function psalmNumbers(lines){
 const numbers=[];
 for(const line of lines){
  const match=/^(.{2,360});;([0-9]{1,3})$/u.exec(line);
  if(!match||!SLICE_SOURCE.test(match[1]))return null;
  numbers.push(Number(match[2]));
 }
 if(numbers.length!==5||numbers.some((x,i)=>x!==EXPECTED_PSALMS[i]))return null;
 return numbers;
}
function sourceSlots(sourceProbed){
 return Object.freeze(LITURGICAL_COMPONENTS.map(([key,role,origin])=>
  Object.freeze({
   key,role,sourceHint:origin,
   status:key==="five-psalmody"&&sourceProbed?
    "FIVE_SOURCE_NUMBER_AND_ANTIPHON_ROWS_IDENTIFIED":
    "LITURGICAL_APPOINTMENT_AND_COMPLETENESS_UNRESOLVED",
   fullComponentVerified:false,sourceTextCompletenessVerified:false,
   rubricsVerified:false,translationVerified:false
  })
 ));
}
/**
 * Exact source identity handoff: two named source files per language, no
 * downloader. This proves the candidates are aligned by numeric psalm label
 * and source-section ordinal, NOT that five psalms belong liturgically to
 * the day or that their complete Psalm texts/doxology were assembled.
 */
export async function reviewAdventFirstVespersSourceSequence({
 handoff,readSource
}={}){
 if(!validHandoff(handoff))return withhold("OFFICE_FIRST_VESPERS_RESEARCH_HANDOFF_REQUIRED");
 if(typeof readSource!=="function")return withhold("OFFICE_FIRST_VESPERS_PINNED_READER_REQUIRED");
 const docs=await Promise.all(LANGUAGES.map(async language=>({
  language,
  proper:await readSource(PROPER,language),
  psalter:await readSource(PSALTER,language)
 })));
 const rowsByLanguage={};
 for(const {language,proper,psalter} of docs){
  if(!safeSource(proper,PROPER,language)||!safeSource(psalter,PSALTER,language))
   return withhold("OFFICE_FIRST_VESPERS_SOURCE_IDENTITY_INVALID");
  const ants=normalLines(proper,"Ant Laudes",5);
  const psalmLines=normalLines(psalter,"Day0 Vespera",5);
  if(!ants||!psalmLines)
   return withhold("OFFICE_FIRST_VESPERS_FIVE_SOURCE_ROWS_MISSING:"+language);
  const numbers=psalmNumbers(psalmLines);
  if(!numbers)
   return withhold("OFFICE_FIRST_VESPERS_PSALM_NUMBER_MISMATCH:"+language);
  if(language==="la"){
   const rubric=proper.map.get("Ant Vespera");
   if(!Array.isArray(rubric)||rubric[0]?.trim()!=="@:Ant Laudes")
    return withhold("OFFICE_FIRST_VESPERS_LATIN_ANTIPHON_OWNER_UNRESOLVED");
   // The historical conditional line must remain an exception, not a
   // silently discarded instruction. We only record a research lead.
  }else if(proper.map.has("Ant Vespera")){
   return withhold("OFFICE_FIRST_VESPERS_LOCALE_OWNER_VARIANT_REVIEW_REQUIRED:"+language);
  }
  rowsByLanguage[language]={ants,psalmLines};
 }
 const psalmCandidates=EXPECTED_PSALMS.map((number,i)=>Object.freeze({
  position:i+1,number,
  psalmSourcePath:"Psalterium/Psalmorum/Psalm"+number,
  psalmNumberEvidence:PSALTER+"#Day0 Vespera",
  antiphonSourceEvidence:PROPER+"#Ant Laudes",
  // Each language has its own exact proper and ordinary lines.
  languages:Object.freeze(Object.fromEntries(LANGUAGES.map(lang=>[
   lang,Object.freeze({
    antiphon:rowsByLanguage[lang].ants[i],
    ordinaryPsalmLine:rowsByLanguage[lang].psalmLines[i]
   })
  ]))),
  psalmVersesFetched:false,
  antiphonLiturgicalPlacementVerified:false,
  gloriaPatriVerified:false,publishable:false
 }));
 return Object.freeze({
  schema:ADVENT_FIRST_VESPERS_RESEARCH_SCHEMA,
  status:"SOURCE_SEQUENCE_COMPONENTS_MAPPED_UNVERIFIED",
  civilDate:"2026-11-28",officeDate:"2026-11-29",hour:"VESPERS",
  officePart:"FIRST",officeKey:"advent-i-2026-11-29",
  sourceRevision:DIVINUM_OFFICIUM_PIN,
  languageSectionsProbed:6,
  psalmRowsVerifiedAsSourceCandidates:psalmCandidates.length,
  psalmCandidates:Object.freeze(psalmCandidates),
  components:sourceSlots(true),
  unresolvedGates:Object.freeze([
   "ORDINARY_OPENING_CONDITIONALS",
   "PSALM_SOURCE_VERSES_AND_GLORIA_PATRI",
   "ANTIPHON_REPETITION_AND_FIRST_VESPERS_1960_RUBRICS",
   "CHAPTER_MACROS",
   "ADVENT_HYMN_AND_DOXOLOGY",
   "VERSICLE_SOURCE_CONDITIONS",
   "MAGNIFICAT_TEXT_AND_ANTIPHON_APPOINTMENT",
   "COLLECT_COMPLETENESS_AND_COMMUNION_LANGUAGE_ALIGNMENT",
   "COMMEMORATION_DECISION",
   "DISMISSAL_AND_FINAL_PRAYERS",
   "INDEPENDENT_PRINTED_BREVIARY_AND_RIGHTS_REVIEW"
  ]),
  appointedOfficeVerified:false,completeHourVerified:false,
  printedEditionCertified:false,translationAlignmentVerified:false,
  rightsApproved:false,publishable:false,published:false
 });
}
