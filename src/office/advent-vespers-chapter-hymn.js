/**
 * Advent I Vespers source chapter and hymn:
 * - pinned Tempora/Adv1-0#Capitulum Laudes (3 source lines: reference,
 *   verse, and source-owned $Deo gratias response)
 * - pinned Major Special#Hymnus Adv Vespera, source hymn notation removed
 *   only if the exact, inspected H-VespAdv marker occurs.
 * No source transport, invented response, hymn edits or 1960 appointment.
 */
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";
import {ADVENT_FIRST_VESPERS_RESEARCH_SCHEMA}
 from "./advent-first-vespers-source-sequence.js";
export const OFFICE_ADVENT_CHAPTER_HYMN_SCHEMA="ao.office.advent-chapter-hymn-source.v1";
const PIN=DIVINUM_OFFICIUM_PIN,PROPER="Tempora/Adv1-0",
 COMMON="Psalterium/Special/Major Special",PRAYERS="Psalterium/Common/Prayers";
const LANGUAGES=["la","en","fr"];
const fail=reason=>Object.freeze({
 schema:OFFICE_ADVENT_CHAPTER_HYMN_SCHEMA,status:"WITHHELD",reason,
 completeHourVerified:false,sourceTextCollated:false,
 liturgicalRubricsAdjudicated:false,printedEditionCertified:false,
 translationAlignmentVerified:false,rightsApproved:false,
 publishable:false,published:false
});
function sourceOkay(doc,path,language){
 return doc?.sourceRevision===PIN&&doc.sourcePath===path&&
   doc.language===language&&doc.map instanceof Map;
}
function validateResearchSequence(s){
 return s?.schema===ADVENT_FIRST_VESPERS_RESEARCH_SCHEMA&&
 s.status==="SOURCE_SEQUENCE_COMPONENTS_MAPPED_UNVERIFIED"&&
 s.civilDate==="2026-11-28"&&s.officeDate==="2026-11-29"&&
 s.officePart==="FIRST"&&s.sourceRevision===PIN&&
 s.psalmRowsVerifiedAsSourceCandidates===5&&
 s.appointedOfficeVerified===false&&s.completeHourVerified===false&&
 s.publishable===false&&s.published===false;
}
function cleanChapter(proper,prayers,language){
 const text=proper.map.get("Capitulum Laudes");
 const thanksgiving=prayers.map.get("Deo gratias");
 if(!Array.isArray(text)||text.length!==3||!Array.isArray(thanksgiving)||
   thanksgiving.length!==1)return null;
 const [reference,chapter,macro]=text.map(x=>typeof x==="string"?x.trim():"");
 const citation=language==="fr"?"!Rm 13:11":"!Rom 13:11";
 if(reference!==citation||!/^v\.\s+\S/u.test(chapter)||
    macro!=="$Deo gratias."||
    !/^R\.\s+\S/u.test(thanksgiving[0])||
    chapter.length>900||thanksgiving[0].length>200||
    /[$@&{}<>]|\{:/u.test(chapter+thanksgiving[0]))
  return null;
 return Object.freeze({
  citation:"Romans 13:11",sourceCitation:reference,
  chapterText:chapter,response:thanksgiving[0].trim(),
  sourceTrace:Object.freeze([
   Object.freeze({sourceId:PROPER+"#Capitulum Laudes",language}),
   Object.freeze({sourceId:PRAYERS+"#Deo gratias",language})
  ]),
  chapterRubricallyAppointed:false,translationCollated:false
 });
}
function cleanHymn(common,language){
 const lines=common.map.get("Hymnus Adv Vespera");
 if(!Array.isArray(lines)||lines.length<16||lines.length>80)return null;
 const out=[];let marker=false,separators=0,first=false;
 for(let i=0;i<lines.length;i++){
  let line=lines[i];
  if(typeof line!=="string"||line.length>500)return null;
  line=line.trim();
  if(i===0){
   if(line.startsWith("{:H-VespAdv:}")){
    marker=true;
    line=line.slice("{:H-VespAdv:}".length);
   }
   if(!/^v\.\s+\S/u.test(line))return null;
   first=true;
  }else if(line==="_"){
   separators++;
   out.push(Object.freeze({kind:"STANZA_SEPARATOR"}));continue;
  }
  if(!line||/[$@&!#<>]|\{[^}]*\}/u.test(line)||
     /\((?:rubrica|nisi|sed)\b/iu.test(line))
   return null;
  out.push(Object.freeze({kind:"HYMN_LINE",text:line}));
 }
 if(!first||out.filter(x=>x.kind==="HYMN_LINE").length<16)return null;
 const last=out.filter(x=>x.kind==="HYMN_LINE").at(-1).text;
 if(!(language==="fr"?/^Ainsi soit-il\.$/iu.test(last):/^Amen\.$/iu.test(last)))
  return null;
 // This is source stanza punctuation, not proof of hymn doxology selection.
 return Object.freeze({
  sourceId:COMMON+"#Hymnus Adv Vespera",
  language,sourceHymnNotationObserved:marker,
  sourceStanzaSeparators:separators,
  lines:Object.freeze(out),
  traditionalDoxologyRuleVerified:false,
  printedHymnCollated:false
 });
}
export async function assembleAdventVespersChapterAndHymnResearch({
 sourceSequence,readSource
}={}){
 if(!validateResearchSequence(sourceSequence))
  return fail("OFFICE_ADVENT_CHAPTER_HYMN_RESEARCH_HANDOFF_REQUIRED");
 if(typeof readSource!=="function")
  return fail("OFFICE_ADVENT_CHAPTER_HYMN_READER_REQUIRED");
 const result={};
 for(const language of LANGUAGES){
  const [proper,common,prayers]=await Promise.all([
   readSource(PROPER,language),
   readSource(COMMON,language),
   readSource(PRAYERS,language)
  ]);
  if(!sourceOkay(proper,PROPER,language)||
     !sourceOkay(common,COMMON,language)||
     !sourceOkay(prayers,PRAYERS,language))
   return fail("OFFICE_ADVENT_CHAPTER_HYMN_SOURCE_IDENTITY_INVALID:"+language);
  const chapter=cleanChapter(proper,prayers,language);
  const hymn=cleanHymn(common,language);
  if(!chapter||!hymn)
   return fail("OFFICE_ADVENT_CHAPTER_OR_HYMN_MISSING:"+language);
  result[language]=Object.freeze({chapter,hymn});
 }
 return Object.freeze({
  schema:OFFICE_ADVENT_CHAPTER_HYMN_SCHEMA,
  status:"THREE_LANGUAGE_CHAPTER_HYMN_SOURCE_UNVERIFIED",
  civilDate:"2026-11-28",officeDate:"2026-11-29",
  officePart:"FIRST",hour:"VESPERS",sourceRevision:PIN,
  chapterSourceId:PROPER+"#Capitulum Laudes",
  chapterResponseSourceId:PRAYERS+"#Deo gratias",
  hymnSourceId:COMMON+"#Hymnus Adv Vespera",
  languages:Object.freeze(result),
  chapterAndHymnSourceSectionsLocated:6,
  appointedOfficeVerified:false,
  chapterVespersAppointmentVerified:false,
  hymnAndDoxologyRubricsVerified:false,
  completeHourVerified:false,sourceTextCollated:false,
  liturgicalRubricsAdjudicated:false,printedEditionCertified:false,
  translationAlignmentVerified:false,rightsApproved:false,
  publishable:false,published:false
 });
}
