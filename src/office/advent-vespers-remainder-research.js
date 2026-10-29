/**
 * Source-only 2026 Advent I First Vespers research: original Ordinarium
 * skeleton, explicit common Advent versicle and Magnificat antiphon.
 *
 * These are structural and three-language SOURCE observations. They do not
 * select the 1960 Ordinary's conditional variants, psalm antiphon placement,
 * commemorations or an authenticated complete Hour. No source archive,
 * external HTTP client, generated Office or printed-edition certification.
 */
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";
import {ADVENT_FIRST_VESPERS_RESEARCH_SCHEMA}
 from "./advent-first-vespers-source-sequence.js";

export const ADVENT_VESPERS_REMAINDER_SCHEMA="ao.office.advent-first-vespers-remainder.v1";
const PROPER="Tempora/Adv1-0";
const COMMON="Psalterium/Special/Major Special";
const ORDINARY="Ordinarium/Vespera";
const LANGUAGES=["la","en","fr"];
const HEADINGS=[
 "#Incipit","#Psalmi","#Capitulum Hymnus Versus",
 "#Canticum: Magnificat","#Preces Feriales","#Oratio",
 "#Suffragium","#Conclusio"
];
const fail=(reason)=>Object.freeze({
 schema:ADVENT_VESPERS_REMAINDER_SCHEMA,status:"WITHHELD",reason,
 sourceSectionsVerified:0,firstVespersOrdinaryAuthorized:false,
 appointedOfficeVerified:false,completeHourVerified:false,
 printedEditionCertified:false,translationAlignmentVerified:false,
 publishable:false,published:false
});
function validateSequence(r){
 return r?.schema===ADVENT_FIRST_VESPERS_RESEARCH_SCHEMA&&
 r.status==="SOURCE_SEQUENCE_COMPONENTS_MAPPED_UNVERIFIED"&&
 r.sourceRevision===DIVINUM_OFFICIUM_PIN&&
 r.civilDate==="2026-11-28"&&r.officeDate==="2026-11-29"&&
 r.officePart==="FIRST"&&r.hour==="VESPERS"&&
 r.officeKey==="advent-i-2026-11-29"&&
 r.psalmRowsVerifiedAsSourceCandidates===5&&
 r.psalmCandidates?.length===5&&
 r.appointedOfficeVerified===false&&r.completeHourVerified===false&&
 r.publishable===false&&r.published===false;
}
function validDocument(doc,path,language){
 return doc?.sourceRevision===DIVINUM_OFFICIUM_PIN&&
  doc.sourcePath===path&&doc.language===language&&
  doc.map instanceof Map;
}
function cleanSection(doc,key,count){
 const value=doc.map.get(key);
 if(!Array.isArray(value)||value.length!==count)return null;
 const lines=[];
 for(const original of value){
  if(typeof original!=="string")return null;
  const line=original.trim();
  if(!line||line.length>800||/[<>\u0000-\u001f]/u.test(line)||
     /^[@$&!#%{(]/u.test(line)||
     /\b@(?:Tempora|Sancti|Psalterium)\//u.test(line))
   return null;
  lines.push(line);
 }
 return Object.freeze(lines);
}
/**
 * A structural check of a transient, supplied original
 * `web/www/horas/Ordinarium/Vespera.txt`. The source is NOT embedded.
 * Directives and conditional rubrics are deliberately not evaluated here.
 */
export function reviewAdventVespersOrdinaryStructure({
 sourcePath,sourceRevision,sourceText
}={}){
 if(sourcePath!==ORDINARY||sourceRevision!==DIVINUM_OFFICIUM_PIN||
    typeof sourceText!=="string"||sourceText.length>12000||
    !sourceText.trim())
  return fail("OFFICE_ADVENT_VESPERS_ORDINARY_SOURCE_INVALID");
 const lines=sourceText.replace(/\r\n?/g,"\n").split("\n")
  .map(line=>line.trim()).filter(Boolean);
 if(lines.length>500)return fail("OFFICE_ADVENT_VESPERS_ORDINARY_TOO_LARGE");
 const marked=lines.filter(line=>line.startsWith("#"));
 let position=-1;
 for(const expected of HEADINGS){
  const next=lines.findIndex((line,index)=>index>position&&line===expected);
  if(next<0)return fail("OFFICE_ADVENT_VESPERS_ORDINARY_SEQUENCE_MISSING:"+expected);
  position=next;
 }
 if(marked.filter(x=>x==="#Suffragium").length!==2||
    marked.filter(x=>x==="#Capitulum Responsorium Hymnus Versus").length!==1||
    marked.filter(x=>x==="#Conclusio").length!==1)
  return fail("OFFICE_ADVENT_VESPERS_ORDINARY_VARIANT_STRUCTURE_CHANGED");
 const conditional=lines.map((line,i)=>({line:i+1,text:line}))
  .filter(x=>/^\((?:sed |si |rubrica |deinde |atque )/iu.test(x.text));
 if(!conditional.length)return fail("OFFICE_ADVENT_VESPERS_ORDINARY_CONDITIONALS_NOT_PRESERVED");
 return Object.freeze({
  schema:ADVENT_VESPERS_REMAINDER_SCHEMA,
  status:"ORDINARY_ORDER_SOURCE_OBSERVED_CONDITIONAL_UNRESOLVED",
  sourceRevision:DIVINUM_OFFICIUM_PIN,sourcePath:ORDINARY,
  headings:Object.freeze([...HEADINGS]),
  alternateChapterResponsoryHeading:true,
  twoSuffragiumSourceVariants:true,
  conditionalLineCount:conditional.length,
  // Counts identify exceptions, NOT an interpretation of those rubrics.
  conditionalRubricsResolved:false,
  firstVespersOrdinaryAuthorized:false,appointedOfficeVerified:false,
  completeHourVerified:false,printedEditionCertified:false,
  translationAlignmentVerified:false,publishable:false,published:false
 });
}
/**
 * Language-aware explicit source identity:
 * Latin proper [Versum 1] -> @Major Special:Adv Versum 3.
 * English/French proper do not have [Versum 1], but their Major Special
 * has the same named [Adv Versum 3]. No cross-language substitution.
 * The proper [Ant 1] is source candidate for Magnificat antiphon, not
 * yet authorization for first/second Vespers.
 */
export async function reviewAdventVespersVersicleAndMagnificat({
 sourceSequence,readSource
}={}){
 if(!validateSequence(sourceSequence))
  return fail("OFFICE_ADVENT_VESPERS_RESEARCH_SEQUENCE_REQUIRED");
 if(typeof readSource!=="function")
  return fail("OFFICE_ADVENT_VESPERS_SOURCE_READER_REQUIRED");
 const results={};
 for(const language of LANGUAGES){
  const [proper,common]=await Promise.all([
   readSource(PROPER,language),readSource(COMMON,language)
  ]);
  if(!validDocument(proper,PROPER,language)||
     !validDocument(common,COMMON,language))
   return fail("OFFICE_ADVENT_VESPERS_PINNED_SOURCE_IDENTITY_INVALID:"+language);
  const properReference=proper.map.get("Versum 1");
  if(language==="la"){
   if(!Array.isArray(properReference)||properReference.length!==1||
     properReference[0].trim()!=="@Psalterium/Special/Major Special:Adv Versum 3")
    return fail("OFFICE_ADVENT_VESPERS_LATIN_VERSICLE_REFERENCE_CHANGED");
  }else if(properReference!==undefined){
   // A new language-local proper must be adjudicated, not ignored.
   return fail("OFFICE_ADVENT_VESPERS_LOCAL_VERSICLE_VARIANT:"+language);
  }
  const verse=cleanSection(common,"Adv Versum 3",2);
  const antiphon=cleanSection(proper,"Ant 1",1);
  if(!verse||!/^V\.\s+\S/u.test(verse[0])||
      !/^R\.\s+\S/u.test(verse[1])||!antiphon)
   return fail("OFFICE_ADVENT_VESPERS_PROPER_COMPONENTS_INCOMPLETE:"+language);
  results[language]=Object.freeze({
   versicle:Object.freeze(verse),
   magnficatAntiphon:antiphon[0],
   versicleSourceId:COMMON+"#Adv Versum 3",
   latinProperRedirectWitness:language==="la"?PROPER+"#Versum 1":null,
   antiphonSourceId:PROPER+"#Ant 1"
  });
 }
 return Object.freeze({
  schema:ADVENT_VESPERS_REMAINDER_SCHEMA,
  status:"VERSICLE_AND_MAGNIFICAT_ANTIPHON_SOURCES_IDENTIFIED",
  civilDate:"2026-11-28",officeDate:"2026-11-29",officePart:"FIRST",
  sourceRevision:DIVINUM_OFFICIUM_PIN,sourceSectionsVerified:6,
  languages:Object.freeze(results),
  versicleRubricalChoiceVerified:false,
  magnficatAntiphonAppointmentVerified:false,
  magnficatCanticleTextLocated:false,
  appointedOfficeVerified:false,completeHourVerified:false,
  printedEditionCertified:false,translationAlignmentVerified:false,
  publishable:false,published:false
 });
}
