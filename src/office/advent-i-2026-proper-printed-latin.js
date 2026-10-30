/**
 * Advent I 2026 First Vespers: independent 2009 printed-proper Latin lexical
 * comparison, NONPUBLICATION. Printed p26-27 + p224-225 inspected as images.
 * Six full hymn stanzas, six antiphons, chapter, collect BODY and two
 * versicle lines; 16 checked units in two on-demand source leaves.
 *
 * The 2009 proof is a SECONDARY witness, not the 1961 editio typica.
 * No translation/print typography/collect ending/chant point certified.
 */
import {createHash} from "node:crypto";
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";
export const OFFICE_ADVENT_PRINT_PROPER_SCHEMA="ao.office.advent-i-proper-latin-full-2009-check.v1";
const WITNESS_SCHEMA="ao.office.advent-i-2026-proper-full-2009-print-v1";
const PROPER="Tempora/Adv1-0";
const ORDINARY="Psalterium/Special/Major Special";
const PAGE_URL="https://media.musicasacra.com/books/breviarium5x8.pdf";
const BLOBS=Object.freeze({
 [PROPER]:"f38a896d314286c721ae94065a4cfec828550023",
 [ORDINARY]:"40c785ed7ae820cd10ba92dd47c115c5b6565312"
});
const IDS=Object.freeze([
 "ant1","ant2","ant3","ant4","ant5","chapter",
 "magnificatAnt","collectBody","hymn1","hymn2","hymn3",
 "hymn4","hymn5","hymn6","versicleV","versicleR"
]);
function withhold(reason){
 return Object.freeze({schema:OFFICE_ADVENT_PRINT_PROPER_SCHEMA,
  status:"WITHHELD",reason,completePrintedLatinTextUnitsCompared:0,
  full1961PrimaryPrintedCollation:false,completeHourCertified:false,
  rightsApproved:false,publishable:false,published:false});
}
function words(s){
 if(typeof s!=="string")return "";
 return s.replaceAll("ǽ","ae").replaceAll("Ǽ","Ae")
  .replaceAll("æ","ae").replaceAll("Æ","Ae")
  .replaceAll("œ","oe").replaceAll("Œ","Oe")
  .normalize("NFD").replace(/[\u0300-\u036f]/gu,"")
  .replace(/j/gu,"i").replace(/J/gu,"I")
  .replace(/[^a-zA-Z ]/gu," ")
  .toLowerCase().replace(/\s+/gu," ").trim();
}
function digest(s){return createHash("sha256").update(words(s),"utf8").digest("hex")}
function validWitness(w){
 if(w?.schema!==WITNESS_SCHEMA||
  w.civilDate!=="2026-11-28"||w.officeDate!=="2026-11-29"||
  w.officePart!=="FIRST"||w.language!=="la"||
  w.pinnedRevision!==DIVINUM_OFFICIUM_PIN||
  w.pinnedLatinSourceBlobs?.[PROPER]!==BLOBS[PROPER]||
  w.pinnedLatinSourceBlobs?.[ORDINARY]!==BLOBS[ORDINARY]||
  Object.keys(w.pinnedLatinSourceBlobs??{}).length!==2||
  w.witness?.url!==PAGE_URL||
  w.witness.type!=="SECONDARY_2009_PROOF_NOT_1961_TYPICA"||
  JSON.stringify(w.witness.printedPages)!=="[26,27,224,225]"||
  JSON.stringify(w.witness.pdfZeroPages)!=="[25,26,223,224]"||
  w.witness.independentlyPrinted1961Typica!==false||
  w.comparedCompleteLatinTextUnits!==16||
  w.printedHymnStanzas!==6||w.printedAntiphonTexts!==6||
  w.printedVersicleLines!==2||w.printedChapterTexts!==1||
  w.printedCollectBodies!==1||w.collectEndingCertified!==false||
  w.antiphonChantPointingCertified!==false||
  w.full1961PrimaryPrintedCollation!==false||
  w.localCalendarCertified!==false||w.englishFrenchCertified!==false||
  w.rightsApproved!==false||w.publishable!==false||w.published!==false||
  Object.keys(w.lexicalSha256??{}).length!==16)return false;
 return IDS.every(id=>typeof w.lexicalSha256[id]==="string"&&
  /^[a-f0-9]{64}$/u.test(w.lexicalSha256[id]));
}
function exactSource(doc,path){
 return doc?.sourceRevision===DIVINUM_OFFICIUM_PIN&&
  doc.sourcePath===path&&doc.language==="la"&&doc.map instanceof Map&&
  (doc.sourceBlobSha===undefined||doc.sourceBlobSha===BLOBS[path]);
}
function safeLine(s){
 return typeof s==="string"&&!!s.trim()&&s.length<700&&
  !/[<>]/u.test(s)&&!/^[$@!{]/u.test(s)&&!!words(s);
}
function readComponents(proper,ordinary){
 const ant=proper.map.get("Ant Laudes");
 const firstVespers=proper.map.get("Ant Vespera");
 const chapter=proper.map.get("Capitulum Laudes");
 const mag=proper.map.get("Ant 1");
 const collect=proper.map.get("Oratio");
 const vv=proper.map.get("Versum 1");
 const verse=ordinary.map.get("Adv Versum 3");
 const hymn=ordinary.map.get("Hymnus Adv Vespera");
 if(!Array.isArray(ant)||ant.length!==5||!ant.every(safeLine)||
  !Array.isArray(firstVespers)||firstVespers[0]!=="@:Ant Laudes"||
  !Array.isArray(chapter)||chapter.length!==3||
  chapter[0]!=="!Rom 13:11"||
  !/^v\. Fratres:/u.test(chapter[1])||
  chapter[2]!=="$Deo gratias."||
  !Array.isArray(mag)||mag.length!==1||!safeLine(mag[0])||
  !Array.isArray(collect)||collect.length!==2||
  !safeLine(collect[0])||collect[1]!=="$Qui vivis"||
  !Array.isArray(vv)||vv.length!==1||
  vv[0]!=="@Psalterium/Special/Major Special:Adv Versum 3"||
  !Array.isArray(verse)||verse.length!==2||
  !/^V\. /u.test(verse[0])||!/^R\. /u.test(verse[1])||
  !Array.isArray(hymn)||hymn.length<30)return null;
 const hymnLines=[...hymn];
 if(!/^\{:H-VespAdv:\}v\. /u.test(hymnLines[0]))
  return null;
 hymnLines[0]=hymnLines[0].replace(/^\{:H-VespAdv:\}v\. /u,"");
 const stanzas=[[]];
 for(const line of hymnLines){
  if(line==="_"){stanzas.push([]);continue}
  if(!safeLine(line))return null;
  stanzas.at(-1).push(line);
 }
 if(stanzas.length!==6||stanzas.some((v,i)=>v.length!==(i===5?5:4))||
  stanzas[5][4]!=="Amen.")return null;
 const components={
  ant1:ant[0],ant2:ant[1],ant3:ant[2],ant4:ant[3],
  ant5:ant[4],chapter:chapter[1].replace(/^v\. /u,""),
  magnificatAnt:mag[0],collectBody:collect[0],
  versicleV:verse[0].replace(/^V\. /u,""),
  versicleR:verse[1].replace(/^R\. /u,"")
 };
 for(let i=0;i<6;i++)components["hymn"+(i+1)]=stanzas[i].join(" ");
 return components;
}
export async function reviewAdventIPrintedLatinProper({witness,readSource}={}){
 if(!validWitness(witness))return withhold("ADVENT_I_FULL_PRINTED_PROPER_WITNESS_INVALID");
 if(typeof readSource!=="function")return withhold("PINNED_PROPER_SOURCE_READER_REQUIRED");
 let proper,ordinary;
 try{[proper,ordinary]=await Promise.all([
  readSource(PROPER,"la"),readSource(ORDINARY,"la")
 ])}catch{return withhold("PINNED_PROPER_SOURCE_UNAVAILABLE")}
 if(!exactSource(proper,PROPER)||!exactSource(ordinary,ORDINARY))
  return withhold("PINNED_PROPER_SOURCE_IDENTITY_CHANGED");
 const components=readComponents(proper,ordinary);
 if(components===null)return withhold("PROPER_SECTION_SHAPE_OR_MACRO_CHANGED");
 for(const id of IDS){
  if(!safeLine(components[id])||digest(components[id])!==witness.lexicalSha256[id])
   return withhold("SECONDARY_2009_PRINTED_LATIN_LEXICAL_MISMATCH:"+id);
 }
 return Object.freeze({
  schema:OFFICE_ADVENT_PRINT_PROPER_SCHEMA,
  status:"SIXTEEN_LATIN_UNITS_MATCH_SECONDARY_PRINT_NOT_1961_TYPICA",
  civilDate:"2026-11-28",officeDate:"2026-11-29",officePart:"FIRST",
  sourceRevision:DIVINUM_OFFICIUM_PIN,
  sourceDocumentsRead:2,completePrintedLatinTextUnitsCompared:16,
  completeLatinPsalmAntiphonTexts:5,
  completeMagnificatAntiphonTexts:1,fullHymnStanzas:6,
  completeChapterTexts:1,completeVersicleLines:2,
  collectBodyTextsWithoutConclusion:1,
  printedWitnessType:"SECONDARY_2009_PROOF_NOT_1961_TYPICA",
  full1961PrimaryPrintedCollation:false,
  fullCollectEndingCollated:false,chantAndTypographyCollated:false,
  englishFrenchAlignmentCertified:false,localCalendarCertified:false,
  completeHourCertified:false,rightsApproved:false,
  publishable:false,published:false
 });
}
