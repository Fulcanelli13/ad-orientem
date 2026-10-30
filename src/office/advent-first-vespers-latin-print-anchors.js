/**
 * Authenticated-Latin source-to-print-preview incipit review.
 * This is deliberately NOT full-text critical collation: a 2009 proof-copy
 * printed witness may corroborate named sections but cannot certify 1961.
 * The caller injects the existing pinned Office source reader.
 */
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";
export const OFFICE_PRINT_ANCHOR_SCHEMA="ao.office.advent-i-latin-print-incpit-review.v1";
const WITNESS_SCHEMA="ao.office.advent-i-2026-latin-print-incpit-witness.v1";
const PROPER="Tempora/Adv1-0", PSALTER="Psalterium/Psalmi/Psalmi major";
const AUTHORIZED=["ant1","ant2","ant3","ant4","ant5",
 "chapter","magnificat_antiphon","collect"];
const SEGMENTS=[[143,"1-8"],[143,"9-15"],[144,"1-7"],
 [144,"8-13a"],[144,"13b-21"]];
const deny=reason=>Object.freeze({
 schema:OFFICE_PRINT_ANCHOR_SCHEMA,status:"WITHHELD",
 reason,matchedPrintedIncipits:0,printedTypicaCertified:false,
 fullHourTextCertified:false,liturgicallyCertified:false,
 rightsApproved:false,publishable:false,published:false
});
function fold(text){
 return String(text).normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .replace(/æ/g,"ae").replace(/Æ/g,"Ae").replace(/œ/g,"oe").replace(/Œ/g,"Oe")
 .replace(/[jJ]/g,"i")
 .replace(/^[vVrR]\.\s*/,"")
 .replace(/[^\p{L} ]/gu," ").toLowerCase()
 .replace(/\s+/g," ").trim();
}
function incipitMatches(line,incipit){
 const needle=fold(incipit),actual=fold(line);
 return !!needle&&actual.startsWith(needle+" ");
}
function exactSource(x,path){
 return x?.sourceRevision===DIVINUM_OFFICIUM_PIN&&
  x.sourcePath===path&&x.language==="la"&&x.map instanceof Map;
}
function validManifest(m){
 if(m?.schema!==WITNESS_SCHEMA||
  m.witnessType!=="SECONDARY_2009_PROOF_COPY_NOT_1961_TYPICA"||
  m.witnessUrl!=="https://www.latinmassschedule.com/Resources/Diurnale_Romanum__Latin_English.pdf"||
  m.original1961RubricUrl!=="https://unavocesevilla.com/LIBROSLITURGICOS/BREVIARIUM%20ROMANUM.1961.pdf"||
  m.pinnedOfficeRevision!==DIVINUM_OFFICIUM_PIN||
  m.pinnedLatinSourceBlobs?.[PROPER]!=="f38a896d314286c721ae94065a4cfec828550023"||
  m.pinnedLatinSourceBlobs?.[PSALTER]!=="3a9b0e235450fc60c07a790baeba3fc6ac795bb7"||
  m.date!=="2026-11-29"||m.civilEvening!=="2026-11-28"||
  m.officePart!=="FIRST"||
  m.acceptedScope!=="EIGHT_PRINTED_INCIPIT_ANCHORS_AND_SATURDAY_PSALTER_REFERENCE_ONLY"||
  m.typicaWitnessCertified!==false||m.fullHourTextCertified!==false||
  m.rightsApproved!==false||m.publishable!==false||m.published!==false||
  !Array.isArray(m.anchors)||m.anchors.length!==8||
  m.anchors.some((x,i)=>x.id!==AUTHORIZED[i]||
   typeof x.latinIncipit!=="string"||
   !/^[\p{L} ]{7,80}$/u.test(x.latinIncipit)||
   !Number.isInteger(x.printedPage)||
   x.printedPage<30||x.printedPage>31||
   x.section!==(i<5?"Ant Laudes":
    i===5?"Capitulum Laudes":i===6?"Ant 1":"Oratio")||
   x.row!==(i<5?i+1:i===5?2:1)))return false;
 return true;
}
function psalmSegments(rows){
 if(!Array.isArray(rows)||rows.length!==5)return false;
 return rows.every((text,i)=>{
  if(typeof text!=="string")return false;
  const m=text.match(/;;(\d+)\(([^()]+)\)$/u);
  if(!m)return false;
  return Number(m[1])===SEGMENTS[i][0]&&
    m[2].replace(/[‘’']/gu,"")===SEGMENTS[i][1];
 });
}
export async function reviewAdventLatinPrintedIncipits({
 witness,readSource
}={}){
 if(!validManifest(witness))return deny("PRINT_WITNESS_MANIFEST_INVALID");
 if(typeof readSource!=="function")return deny("PINNED_OFFICE_SOURCE_READER_REQUIRED");
 let proper,psalter;
 try{
  [proper,psalter]=await Promise.all([
   readSource(PROPER,"la"),readSource(PSALTER,"la")
  ]);
 }catch{return deny("PINNED_OFFICE_SOURCE_UNAVAILABLE")}
 if(!exactSource(proper,PROPER)||!exactSource(psalter,PSALTER))
  return deny("PINNED_SOURCE_IDENTITY_MISMATCH");
 if(!psalmSegments(psalter.map.get("Day6 Vespera")))
  return deny("PRINT_SATURDAY_PSALTER_SEGMENTS_DIFFER");
 const redirect=proper.map.get("Ant Vespera");
 if(!Array.isArray(redirect)||redirect[0]?.trim()!=="@:Ant Laudes")
  return deny("LATIN_FIRST_VESPERS_ANTIPHON_ALIAS_CHANGED");
 const receipts=[];
 for(const anchor of witness.anchors){
  const lines=proper.map.get(anchor.section);
  const candidate=Array.isArray(lines)?lines[anchor.row-1]:null;
  if(typeof candidate!=="string"||
    !incipitMatches(candidate,anchor.latinIncipit))
   return deny("PRINTED_INCIPIT_MISMATCH:"+anchor.id);
  receipts.push(Object.freeze({
   id:anchor.id,sourceSection:PROPER+"#"+anchor.section,
   sourceRow:anchor.row,printedPage:anchor.printedPage,
   result:"PRINTED_INCIPIT_AGREES_WITH_PINNED_LATIN"
  }));
 }
 return Object.freeze({
  schema:OFFICE_PRINT_ANCHOR_SCHEMA,
  status:"EIGHT_PRINTED_INCIPIT_ANCHORS_MATCH_NOT_FULL_COLLATION",
  sourceRevision:DIVINUM_OFFICIUM_PIN,
  civilDate:"2026-11-28",officeDate:"2026-11-29",
  selectedPsalmPortions:Object.freeze(SEGMENTS.map(x=>Object.freeze([...x]))),
  matchedPrintedIncipits:receipts.length,
  receipts:Object.freeze(receipts),
  witnessUrl:witness.witnessUrl,
  witnessStatus:witness.witnessType,
  unresolved:Object.freeze([
   "AUTHENTICATED_1961_TYPICA_PROPER_PAGE_WITNESS",
   "FULL_PSALM_AND_CANTICLE_TEXT_LINE_COLLATION",
   "FULL_ANTIPHON_AND_COLLECT_TEXT_LINE_COLLATION",
   "PRINTED_HYMN_VERSICLE_GLORIA_AND_ORDINARY",
   "COMMEMORATIONS_RECITATION_BRANCH_AND_LOCAL_CALENDAR",
   "LATIN_ENGLISH_FRENCH_ALIGNMENT",
   "RIGHTS_AND_PUBLICATION"
  ]),
  printedTypicaCertified:false,fullHourTextCertified:false,
  liturgicallyCertified:false,rightsApproved:false,
  publishable:false,published:false
 });
}
