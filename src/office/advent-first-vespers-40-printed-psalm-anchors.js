/**
 * Advent I 2026: 40 separate Gallican Psalm 143/144 row starts and cadences
 * read from the SECONDARY 2009 Diurnale Romanum, printed pp436-438.
 *
 * The independent printed anchors check actual row coverage beyond the
 * previous ten FIRST/LAST section incipits. Verbatim full-verses,
 * accent/typography/pointing and the COMPLETE 1961 typical-edition
 * Psalm/Proper were NOT collated. No source-level publication authorization.
 *
 * Source text supplied through the already existing on-demand pinned leaf
 * reader, with only TWO cached source reads across the old and new audits.
 */
import {DIVINUM_OFFICIUM_PIN as PIN} from "../app/source-transport-compat.js";
import {reviewAdventSaturdayLatinPsalmSource}
 from "./advent-first-vespers-saturday-psalm-integrity.js";

export const OFFICE_SATURDAY_40_PRINT_ANCHORS_SCHEMA=
 "ao.office.advent-i-2026-saturday-forty-printed-row-anchors-review.v1";
const WITNESS_SCHEMA=
 "ao.office.advent-i-2026-saturday-forty-printed-row-anchors.v1";
const BASE="Psalterium/Psalmorum/Psalm";
const URL="https://media.musicasacra.com/books/breviarium5x8.pdf";
const LABELS=Object.freeze({
 143:["1","2","2","3","4","5","6","7","8","9","10","11",
  "12","12","13","13","14","15"],
 144:["1","2","3","4","5","6","7","8","9","10","11","12",
  "13a","13b","14","15","16","17","18","19","20","21"]
});
const SOURCE_BLOBS=Object.freeze({
 [BASE+"143"]:"a89374dcddcbba5401756999ac8038d0e1cc8391",
 [BASE+"144"]:"370212800b3c896db9307e87546107ba4ea26c50"
});
function hold(reason){
 return Object.freeze({
  schema:OFFICE_SATURDAY_40_PRINT_ANCHORS_SCHEMA,
  status:"WITHHELD",reason,printedRowsCorroborated:0,
  printedIncipitsCorroborated:0,printedCadencesCorroborated:0,
  fullLatinPrintedTextCollated:false,full1961TypicalPrintedCollation:false,
  translationsCertified:false,completeHourCertified:false,
  rightsApproved:false,publishable:false,published:false
 });
}
function latin(s){
 return String(s).replaceAll("ǽ","ae").replaceAll("Ǽ","Ae")
  .replaceAll("æ","ae").replaceAll("Æ","Ae")
  .replaceAll("œ","oe").replaceAll("Œ","Oe")
  .normalize("NFD").replace(/[\u0300-\u036f]/gu,"")
  .replace(/[jJ]/gu,"i").replace(/[^a-zA-Z ]/gu," ")
  .toLowerCase().replace(/\s+/gu," ").trim();
}
function anchored(src,anchor,start){
 const a=latin(anchor),s=latin(src);
 if(a.length<10||a.split(" ").length<3||a===s)return false;
 return start?s.startsWith(a+" "):s.endsWith(" "+a);
}
function witnessValid(m){
 if(m?.schema!==WITNESS_SCHEMA||m.civilDate!=="2026-11-28"||
    m.officeDate!=="2026-11-29"||m.officePart!=="FIRST"||
    m.language!=="la"||m.psalterTextFamily!=="GALLICAN_VULGATE"||
    m.sourceRevision!==PIN||m.count!==40||
    m.printedVerseStartAnchors!==40||m.printedVerseEndingAnchors!==40||
    m.printedWitness?.url!==URL||
    m.printedWitness.editionType!=="SECONDARY_2009_PROOF_NOT_1961_TYPICA"||
    JSON.stringify(m.printedWitness.printedPages)!=="[436,437,438]"||
    JSON.stringify(m.printedWitness.zeroBasedPdfPages)!=="[435,436,437]"||
    m.independentlyPrinted1961Typica!==false||
    m.fullPrintedPsalmTextCollated!==false||
    m.chantPointingCollated!==false||
    m.englishFrenchVerifiedAgainstPrint!==false||
    m.translationFidelityCertified!==false||
    m.fullHourCertified!==false||
    m.rightsApproved!==false||m.publishable!==false||m.published!==false||
    Object.keys(m.sourceBlobs??{}).length!==2||
    Object.keys(m.rows??{}).length!==2)return false;
 return [143,144].every(n=>{
  const rows=m.rows[n];
  return m.sourceBlobs[BASE+n]===SOURCE_BLOBS[BASE+n]&&
   Array.isArray(rows)&&rows.length===LABELS[n].length&&
   rows.every((row,i)=>row?.ordinal===i+1&&
    row.label===LABELS[n][i]&&
    typeof row.first==="string"&&
    typeof row.last==="string"&&
    latin(row.first).split(" ").length>=3&&
    latin(row.last).split(" ").length>=3&&
    Array.isArray(row.printedPages)&&
    row.printedPages.length>=1&&row.printedPages.length<=2&&
    row.printedPages.every(p=>[436,437,438].includes(p))&&
    row.printedPages.every((p,j)=>j===0||p===row.printedPages[j-1]+1)
   )
  );
 });
}
function numberedSourceRows(doc,n){
 const text=doc?.text;
 if(doc?.sourceRevision!==PIN||doc.sourcePath!==BASE+n||
   doc.language!=="la"||typeof text!=="string")return null;
 const lines=text.trimEnd().split("\n");
 if(lines.length!==LABELS[n].length)return null;
 const parsed=lines.map((line,i)=>{
  const match=new RegExp("^"+n+":([0-9]+[ab]?) (.+)$","u").exec(line);
  return match?.[1]===LABELS[n][i]?match[2]:null;
 });
 return parsed.every(x=>typeof x==="string")?parsed:null;
}
export async function reviewAdventSaturdayFortyPrintedAnchors({
 witness,baseWitness,readLatinPsalmSource
}={}){
 if(!witnessValid(witness))
  return hold("FORTY_PRINTED_ROWS_MANIFEST_INVALID");
 if(typeof readLatinPsalmSource!=="function")
  return hold("PINNED_LATIN_PSALM_READER_REQUIRED");
 const cache=new Map();
 const reader=(path,language)=>{
  if(!Object.hasOwn(SOURCE_BLOBS,path)||language!=="la")
   throw Error("FORTY_PRINTED_ROWS_SOURCE_NOT_ALLOWED");
  if(!cache.has(path))cache.set(path,Promise.resolve().then(()=>
   readLatinPsalmSource(path,language)));
  return cache.get(path);
 };
 const base=await reviewAdventSaturdayLatinPsalmSource({
  manifest:baseWitness,readLatinPsalmSource:reader
 });
 if(base.status!=="FIVE_SATURDAY_SOURCE_SEGMENTS_PINNED_SECONDARY_INICIPITS_ONLY"||
    base.pinnedSourceFilesVerified!==2||
    base.sourceVerseRowsVerified!==40||
    base.psalterTextFamily!=="GALLICAN_VULGATE"||
    base.printedFullTextCollated!==false||
    base.printed1961TypicaCertified!==false||
    base.wholeHourLiturgicallyCertified!==false||
    base.publishable!==false||base.published!==false)
  return hold("BASE_GIT_SOURCE_AND_BOUNDARY_PROVENANCE_UNVERIFIED");
 if(cache.size!==2)return hold("PINNED_TWO_LEAF_SOURCE_BUDGET_CHANGED");
 let audited=0;
 const portions=[];
 for(const [number,range,count] of [
  [143,"1-8",9],[143,"9-15",9],
  [144,"1-7",7],[144,"8-13a",6],[144,"13b-21",9]
 ]){
  const doc=await reader(BASE+number,"la");
  const rows=numberedSourceRows(doc,number);
  if(!rows)return hold("FORTY_PRINTED_ROWS_SOURCE_STRUCTURE_CHANGED:"+number);
  const offset=number===143?(range==="1-8"?0:9):
   (range==="1-7"?0:range==="8-13a"?7:13);
  for(let i=offset;i<offset+count;i++){
   const print=witness.rows[number][i];
   if(!anchored(rows[i],print.first,true)||
      !anchored(rows[i],print.last,false))
    return hold("PRINTED_ROW_START_OR_CADENCE_MISMATCH:"+number+":"+
     String(i+1)+"/"+print.label);
   audited++;
  }
  portions.push(Object.freeze({
   sourceId:BASE+number+"#"+range,
   printedLatinIncipitsAndCadencesCompared:count,
   fullVersePrintedTextCollated:false
  }));
 }
 if(audited!==40)return hold("PRINTED_ROW_COVERAGE_INCOMPLETE");
 return Object.freeze({
  schema:OFFICE_SATURDAY_40_PRINT_ANCHORS_SCHEMA,
  status:"FORTY_ROWS_EIGHTY_SECONDARY_PRINTED_ANCHORS_ONLY",
  civilDate:"2026-11-28",officeDate:"2026-11-29",
  psalterTextFamily:"GALLICAN_VULGATE",sourceRevision:PIN,
  exactPinnedLatinSourceLeaves:cache.size,
  printedRowsCorroborated:40,
  printedIncipitsCorroborated:40,printedCadencesCorroborated:40,
  fiveSaturdaySegments:Object.freeze(portions),
  originalSourceLinesReordered:false,
  fullLatinPrintedTextCollated:false,
  full1961TypicalPrintedCollation:false,
  1961MameProperAndSaturdayPsalterAccessible:false,
  translationsCertified:false,completeHourCertified:false,
  rightsApproved:false,publishable:false,published:false
 });
}
