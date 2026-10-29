/**
 * Roman 1960 rubric-level research sequence for Advent I 2026 First Vespers.
 * Input: the existing NONPUBLISHABLE, provenance-checked 10-slot assembly.
 * Output: an ordered sequence of source IDs and explicit unresolved gates.
 *
 * Source witnesses:
 *   Breviary Rubrics §§166(a), 178-179, 188, 190-191, 198, 201, 204,
 *   246-251, 260 (1960)
 *   https://isidore.co/divinum/www/horas/Help/Rubrics/Breviary%201960.html
 *   General Rubrics §§13, 27, 103-114 (1960)
 *   https://isidore.co/divinum/www/horas/Help/Rubrics/General%20Rubrics.html
 *
 * No printed Breviary collation, no text authorisation, no rendered Office.
 */
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";
import {OFFICE_ADVENT_ASSEMBLY_SCHEMA}
 from "./advent-first-vespers-assembled-research.js";

export const OFFICE_ADVENT_RUBRIC_PLAN_SCHEMA="ao.office.advent-i-vespers-1960-rubric-plan.v1";
const PRAYERS="Psalterium/Common/Prayers#";
const PROPER="Tempora/Adv1-0#";
const LANGUAGES=["la","en","fr"];
const SATURDAY=[
 [143,"1-8"],[143,"9-15"],[144,"1-7"],
 [144,"8-13a"],[144,"13b-21"]
];
const KEYS=[
 "opening","five-psalmody","chapter","hymn","versicle",
 "magnificat-antiphon","magnificat-canticle","collect",
 "commemorations","conclusion"
];
const SOURCE_IDS=[
 PRAYERS+"Pater noster",PRAYERS+"Ave Maria",
 PRAYERS+"Deus in adjutorium",PRAYERS+"Alleluia"
];
const END_IDS=[
 PRAYERS+"Dominus",PRAYERS+"Benedicamus Domino",
 PRAYERS+"Fidelium animae"
];
const GATES=Object.freeze([
 "PRINTED_1960_61_FULL_HOUR_COLLATION",
 "1960_ANTIPHON_PSALM_INCIPIT_OVERLAP_198",
 "OPENING_ALLELUIA_SOURCE_VARIANT_COLLATION",
 "HYMN_ASSIGNED_ENDING_188_PRINTED_COLLATION",
 "1960_FIRST_VESPERS_COLLECT_AND_CONCLUSION_WITNESSES",
 "UNIVERSAL_AND_LOCAL_PRIVILEGED_COMMEMORATION_REVIEW",
 "LATIN_ENGLISH_FRENCH_TEXT_ALIGNMENT",
 "SOURCE_TEXT_RIGHTS_AND_PRODUCTION_ROUTE"
]);
const bad=reason=>Object.freeze({
 schema:OFFICE_ADVENT_RUBRIC_PLAN_SCHEMA,status:"WITHHELD",
 reason,orderedEvents:Object.freeze([]),completeHourVerified:false,
 rubricsFullyCertified:false,printedEditionCertified:false,
 translationAlignmentVerified:false,rightsApproved:false,
 publishable:false,published:false
});
function validAssembly(a){
 if(a?.schema!==OFFICE_ADVENT_ASSEMBLY_SCHEMA||
    a.status!=="ORDERED_TRILINGUAL_SOURCE_RESEARCH_NOT_A_COMPLETE_OFFICE"||
    a.sourceRevision!==DIVINUM_OFFICIUM_PIN||
    a.civilDate!=="2026-11-28"||a.officeDate!=="2026-11-29"||
    a.hour!=="VESPERS"||a.officePart!=="FIRST"||
    a.sourceComponentSlots!==10||a.sourceTextComponentSlots!==9||
    a.liturgicallyCompleteSlots!==0||
    a.appointedOfficeVerified!==false||a.completeHourVerified!==false||
    a.printedEditionCertified!==false||a.translationAlignmentVerified!==false||
    a.rightsApproved!==false||a.publishable!==false||a.published!==false||
    !Array.isArray(a.slots)||a.slots.length!==10||
    a.slots.some((s,i)=>s.key!==KEYS[i]||
      s.liturgicallyComplete!==false||
      s.visibleInLiveReader!==false||
      s.originalSourceTextIdentified!==(i!==8)))return false;
 const byKey=Object.fromEntries(a.slots.map(x=>[x.key,x]));
 if(byKey.commemorations.status!=="WITHHELD_NO_COMPOSED_TEXT"||
    byKey.commemorations.texts!==null)return false;
 if(!LANGUAGES.every(lang=>{
   const opening=byKey.opening.texts?.[lang];
   const ending=byKey.conclusion.texts?.[lang];
   const psalms=byKey["five-psalmody"].texts?.[lang];
   const canticle=byKey["magnificat-canticle"].texts?.[lang];
   const ant=byKey["magnificat-antiphon"].texts?.[lang];
   if(!Array.isArray(opening)||opening.length!==4||
      opening.some((p,i)=>p?.sourceId!==SOURCE_IDS[i]||
        !Array.isArray(p.sourceText)||!p.sourceText.length)||
      !Array.isArray(ending)||ending.length!==3||
      ending.some((p,i)=>p?.sourceId!==END_IDS[i]||
        !Array.isArray(p.sourceText)||!p.sourceText.length)||
      !Array.isArray(psalms)||psalms.length!==5||
      psalms.some(p=>typeof p.antiphon!=="string"||!p.antiphon.trim()||
        !p.verses)||!Array.isArray(canticle?.verses)||
      canticle.verses.length!==10||!Array.isArray(canticle?.gloria)||
      canticle.gloria.length!==2||typeof ant!=="string"||!ant.trim()||
      typeof byKey.collect.texts?.[lang]!=="string"||
      !byKey.collect.texts[lang].trim())return false;
   return true;
 }))return false;
 const psSources=byKey["five-psalmody"].sourceIds;
 return Array.isArray(psSources)&&
  psSources[0]==="Psalterium/Psalmi/Psalmi major#Day6 Vespera"&&
  psSources[1]===PROPER+"Ant Laudes"&&
  SATURDAY.every(([n,range],i)=>
   psSources[i+2]==="Psalterium/Psalmorum/Psalm"+n+"#"+range)&&
   psSources.length===SATURDAY.length+2)&&
  byKey["magnificat-antiphon"].sourceIds?.[0]===PROPER+"Ant 1"&&
  byKey["magnificat-canticle"].sourceIds?.[0]===
   "Psalterium/Psalmorum/Psalm232#LUKE_1_46_55"&&
  byKey["magnificat-canticle"].sourceIds?.[1]===PRAYERS+"Gloria"&&
  byKey.collect.sourceIds?.[0]===PROPER+"Oratio";
}
function event(kind,sourceId,extras={}){
 return Object.freeze({kind,sourceId,...extras});
}
/**
 * "CHOIR_OR_COMMON" here describes the context, not automatic clerical
 * qualification. Under BR247 a solo reciter ALWAYS uses Domine exaudi;
 * someone below diaconal ordination also uses Domine exaudi.
 * This only selects a research dialogue label, not translated text.
 */
export function reviewAdventFirstVespers1960RubricPlan({
 assembly,calendarScope="UNIVERSAL",
 recitation="SOLO",minister="BELOW_DEACON"
}={}){
 if(!validAssembly(assembly))
  return bad("OFFICE_ADVENT_RUBRIC_PLAN_NINE_SOURCE_SLOTS_REQUIRED");
 if(calendarScope!=="UNIVERSAL")
  return bad("OFFICE_ADVENT_RUBRIC_PLAN_LOCAL_CALENDAR_NOT_ADJUDICATED");
 if(!["SOLO","CHOIR_OR_COMMON"].includes(recitation)||
    !["BELOW_DEACON","DEACON_OR_HIGHER"].includes(minister))
  return bad("OFFICE_ADVENT_RUBRIC_PLAN_RECITATION_VARIANT_INVALID");
 const dialogue=(recitation==="CHOIR_OR_COMMON"&&
  minister==="DEACON_OR_HIGHER")?
  "DOMINUS_VOBISCUM":"DOMINE_EXAUDI";
 const events=[];
 // BR178(b) begins directly with Deus in adiutorium: source Pater/Ave
 // are retained in inventory but EXCLUDED from this Office sequence.
 events.push(event("OPENING",PRAYERS+"Deus in adjutorium",{
  slot:"opening",includesOpeningDoxologySourceCandidate:true}));
 events.push(event("SEASONAL_OPENING_RESPONSE",PRAYERS+"Alleluia",{
  slot:"opening",selectedSourceVariantUncollated:true}));
 for(let i=0;i<SATURDAY.length;i++){
  const [n,range]=SATURDAY[i];
  const psalmId="Psalterium/Psalmorum/Psalm"+n+"#"+range;
  const antId=PROPER+"Ant Laudes";
  events.push(event("ANTIPHON_BEFORE",antId,{
   slot:"five-psalmody",position:i+1,sourceRow:i+1,fullText:true}));
  events.push(event("PSALM_PORTION",psalmId,{
   slot:"five-psalmody",position:i+1,
   incipitOverlap198Collated:false}));
  events.push(event("GLORIA_PATRI",PRAYERS+"Gloria",{
   slot:"five-psalmody",position:i+1}));
  events.push(event("ANTIPHON_AFTER",antId,{
   slot:"five-psalmody",position:i+1,sourceRow:i+1,fullText:true}));
 }
 events.push(event("CHAPTER",PROPER+"Capitulum Laudes",{slot:"chapter"}));
 events.push(event("CHAPTER_RESPONSE",PRAYERS+"Deo gratias",{
  slot:"chapter"}));
 events.push(event("HYMN","Psalterium/Special/Major Special#Hymnus Adv Vespera",{
  slot:"hymn",assignedEnding188Collated:false}));
 events.push(event("VERSICLE",
  "Psalterium/Special/Major Special#Adv Versum 3",{slot:"versicle"}));
 const magnAnt=PROPER+"Ant 1";
 events.push(event("ANTIPHON_BEFORE",magnAnt,{
  slot:"magnificat-antiphon",fullText:true}));
 events.push(event("MAGNIFICAT",
  "Psalterium/Psalmorum/Psalm232#LUKE_1_46_55",{
   slot:"magnificat-canticle",incipitOverlap198Collated:false}));
 events.push(event("GLORIA_PATRI",PRAYERS+"Gloria",{
  slot:"magnificat-canticle"}));
 events.push(event("ANTIPHON_AFTER",magnAnt,{
  slot:"magnificat-antiphon",fullText:true}));
 events.push(event("BEFORE_COLLECT_DIALOGUE",null,{
  slot:"collect",variant:dialogue,sourceTextCollated:false}));
 events.push(event("OREMUS",null,{
  slot:"collect",sourceTextCollated:false}));
 events.push(event("COLLECT",PROPER+"Oratio",{slot:"collect"}));
 // RG111 and BR250-259 require explicit privilege/local-calendar decisions.
 // NO "no commemoration" assertion is derived from an empty research slot.
 events.push(event("COMMEMORATIONS_UNADJUDICATED",null,{
  slot:"commemorations",selectionAuthorized:false}));
 events.push(event("DISMISSAL_DIALOGUE_UNCOLLATED",null,{
  slot:"conclusion",variant:dialogue,sourceTextCollated:false}));
 events.push(event("BENEDICAMUS",PRAYERS+"Benedicamus Domino",{
  slot:"conclusion",sourceTextCollated:false}));
 events.push(event("FIDELIUM_ANIMAE",PRAYERS+"Fidelium animae",{
  slot:"conclusion",sourceTextCollated:false}));
 const sourceAudit=Object.freeze({
  psalmPortions:5,psalmNumbers:Object.freeze(SATURDAY.map(([n])=>n)),
  gloriaPatriPositions:6,fullAntiphonUsages:12,
  preces:0,paterAveAtOpening:0,
  rubricRefs:Object.freeze([
   "BR166a","BR178b","BR179a","BR188","BR190-191",
   "BR198","BR201","BR204","BR246-251","BR260","RG111"
  ])
 });
 return Object.freeze({
  schema:OFFICE_ADVENT_RUBRIC_PLAN_SCHEMA,
  status:"RUBRIC_ORDER_RESEARCH_WITH_HELD_COLLATION",
  sourceRevision:DIVINUM_OFFICIUM_PIN,
  civilDate:"2026-11-28",officeDate:"2026-11-29",
  hour:"VESPERS",officePart:"FIRST",
  calendarScope,recitation,minister,dialogue,
  orderedEvents:Object.freeze(events),sourceAudit,
  unresolvedGates:GATES,
  appointedOfficeVerified:false,completeHourVerified:false,
  rubricsFullyCertified:false,printedEditionCertified:false,
  translationAlignmentVerified:false,rightsApproved:false,
  publishable:false,published:false
 });
}
