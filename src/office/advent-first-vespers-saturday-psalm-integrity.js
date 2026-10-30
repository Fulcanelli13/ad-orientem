/**
 * Source-integrity check for Advent I 2026 First Vespers Saturday psalmody.
 * One-time provenance: original pinned Git blobs Psalm143 and Psalm144.
 *
 * Independent SECONDARY 2009 Diurnale p436-438: five section labels and
 * first/last Latin incipits corroborated from images. This is NOT a full
 * printed-text line comparison, nor certification against 1961 editio typica.
 *
 * Caller supplies exactly two original Latin source leaf texts on demand.
 * No downloader, calendar expansion, all-year XHTML or Office compositor.
 */
import {createHash} from "node:crypto";
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";

export const OFFICE_SATURDAY_PSALM_CHECK_SCHEMA="ao.office.advent-i-saturday-psalm-source-integrity.v1";
const MANIFEST_SCHEMA="ao.office.advent-i-2026-saturday-psalm-printed-incpit-v1";
const SOURCE="Psalterium/Psalmorum/Psalm";
const BOOK_URL="https://media.musicasacra.com/books/breviarium5x8.pdf";
const BLOBS=Object.freeze({
 143:"a89374dcddcbba5401756999ac8038d0e1cc8391",
 144:"370212800b3c896db9307e87546107ba4ea26c50"
});
const LABELS=Object.freeze({
 143:[1,2,2,3,4,5,6,7,8,9,10,11,12,12,13,13,14,15],
 144:[1,2,3,4,5,6,7,8,9,10,11,12,"13a","13b",14,15,16,17,18,19,20,21]
});
const PARTS=Object.freeze([
 [143,"1-8",9],[143,"9-15",9],[144,"1-7",7],
 [144,"8-13a",6],[144,"13b-21",9]
]);
function reject(reason){
 return Object.freeze({
  schema:OFFICE_SATURDAY_PSALM_CHECK_SCHEMA,status:"WITHHELD",
  reason,pinnedSourceFilesVerified:0,sourceVerseRowsVerified:0,
  printedFullTextCollated:false,printed1961TypicaCertified:false,
  wholeHourLiturgicallyCertified:false,publishable:false,published:false
 });
}
function gitBlobSha(raw){
 return createHash("sha1").update("blob "+Buffer.byteLength(raw,"utf8")+"\0")
 .update(raw,"utf8").digest("hex");
}
function latin(text){
 return String(text).replaceAll("ǽ","ae").replaceAll("æ","ae")
 .replaceAll("œ","oe").normalize("NFD")
 .replace(/[\u0300-\u036f]/gu,"")
 .replace(/[jJ]/gu,"i").replace(/[^a-zA-Z ]/gu," ")
 .toLowerCase().replace(/\s+/gu," ").trim();
}
function incipit(line,text){
 const src=latin(line),print=latin(text);
 return print.length>8&&(src===print||src.startsWith(print+" "));
}
function validManifest(m){
 if(m?.schema!==MANIFEST_SCHEMA||m.civilDate!=="2026-11-28"||
  m.officeDate!=="2026-11-29"||m.officePart!=="FIRST"||
  m.language!=="la"||m.psalterTextFamily!=="GALLICAN_VULGATE"||
  m.pinnedRevision!==DIVINUM_OFFICIUM_PIN||
  m.sourceBlobs?.[SOURCE+"143"]!==BLOBS[143]||
  m.sourceBlobs?.[SOURCE+"144"]!==BLOBS[144]||
  Object.keys(m.sourceBlobs??{}).length!==2||
  m.sourceFilesCompared!==2||m.sourceVerseRowsExpected!==40||
  m.psalmPortionsExpected!==5||m.printedWitness?.url!==BOOK_URL||
  m.printedWitness.kind!=="SECONDARY_NOT_AUTHENTICATED_1961_TYPICA"||
  m.printedWitness.scope!=="FIVE_PSALM_FIRST_AND_LAST_INCIPITS_PLUS_SEGMENT_HEADERS_NOT_FULL_PRINTED_TEXT"||
  m.printedWitness.adventFirstVespersPrintedPage!==26||
  JSON.stringify(m.printedWitness.satSaturdayPsalterPrintedPages)!=="[436,437,438]"||
  !Array.isArray(m.parts)||m.parts.length!==5||
  m.independent1961PrintedFullPsalmWitness!==false||
  m.fullPrintedPsalmTextCollated!==false||
  m.typographyChantPointingCollated!==false||
  m.wholeHourLiturgicallyCertified!==false||
  m.translationAlignmentVerified!==false||
  m.rightsApproved!==false||m.publishable!==false||
  m.published!==false)return false;
 return m.parts.every((p,i)=>{
  const [n,range,count]=PARTS[i];
  return p?.number===n&&p.range===range&&p.count===count&&
   typeof p.first==="string"&&typeof p.last==="string"&&
   p.first.length>8&&p.last.length>8&&
   JSON.stringify(p.printedPages)===JSON.stringify([
    [436],[436,437],[437],[437,438],[438]
   ][i]);
 });
}
function rowsFromSource(raw,n){
 if(typeof raw!=="string"||raw.length>6000||!raw.endsWith("\n")||
    raw.includes("\r"))return null;
 const lines=raw.slice(0,-1).split("\n");
 if(lines.length!==LABELS[n].length)return null;
 const rows=[];
 for(let i=0;i<lines.length;i++){
  const parsed=lines[i].match(new RegExp("^"+n+":([0-9]+[ab]?) (.+)$","u"));
  if(!parsed||parsed[1]!==String(LABELS[n][i])||
   parsed[2].length>500||!parsed[2].includes(" * ")||
   /[<>]|\{\}|\\$[A-Za-z]|^@/u.test(parsed[2]))return null;
  rows.push(Object.freeze({label:parsed[1],text:parsed[2]}));
 }
 return rows;
}
function slice(rows,range){
 const [start,end]=range.split("-");
 let active=false;
 const kept=[];
 for(const row of rows){
  if(row.label===start)active=true;
  if(active)kept.push(row);
  if(row.label===end)active=false;
 }
 return kept;
}
export async function reviewAdventSaturdayLatinPsalmSource({
 manifest,readLatinPsalmSource
}={}){
 if(!validManifest(manifest))return reject("SATURDAY_PSALM_WITNESS_MANIFEST_INVALID");
 if(typeof readLatinPsalmSource!=="function")
  return reject("SATURDAY_PSALM_SOURCE_READER_MISSING");
 let documents;
 try{documents=await Promise.all([143,144].map(n=>
  readLatinPsalmSource(SOURCE+n,"la")))}
 catch{return reject("SATURDAY_PSALM_PINNED_SOURCE_UNAVAILABLE")}
 const byNumber={};
 for(let i=0;i<2;i++){
  const n=[143,144][i],doc=documents[i];
  if(doc?.sourceRevision!==DIVINUM_OFFICIUM_PIN||
   doc.sourcePath!==SOURCE+n||doc.language!=="la"||
   typeof doc.text!=="string"||
   gitBlobSha(doc.text)!==BLOBS[n]||
   (doc.sourceBlobSha!==undefined&&doc.sourceBlobSha!==BLOBS[n]))
   return reject("SATURDAY_PSALM_GIT_BLOB_MISMATCH:"+n);
  const rows=rowsFromSource(doc.text,n);
  if(!rows)return reject("SATURDAY_PSALM_NUMBERED_ROWS_CHANGED:"+n);
  byNumber[n]=rows;
 }
 const receipts=[];
 for(let i=0;i<5;i++){
  const part=manifest.parts[i];
  const segment=slice(byNumber[part.number],part.range);
  if(segment.length!==part.count||
   !incipit(segment[0]?.text,part.first)||
   !incipit(segment.at(-1)?.text,part.last))
   return reject("PRINTED_SATURDAY_SEGMENT_BOUNDARY_OR_INCIPIT_MISMATCH:"+String(i+1));
  receipts.push(Object.freeze({
   sourceId:SOURCE+part.number+"#"+part.range,
   sourceVerseRows:part.count,printedPages:part.printedPages,
   openingAndClosingIncipitsCorroborated:true,
   printedAllVerseTextCollated:false
  }));
 }
 return Object.freeze({
  schema:OFFICE_SATURDAY_PSALM_CHECK_SCHEMA,
  status:"FIVE_SATURDAY_SOURCE_SEGMENTS_PINNED_SECONDARY_INICIPITS_ONLY",
  sourceRevision:DIVINUM_OFFICIUM_PIN,
  psalterTextFamily:"GALLICAN_VULGATE",
  civilDate:"2026-11-28",officeDate:"2026-11-29",officePart:"FIRST",
  pinnedSourceFilesVerified:2,sourceVerseRowsVerified:40,
  fivePsalmPortionsVerified:5,receipts:Object.freeze(receipts),
  twoSourceFilesDeduplicated:true,
  secondary2009PrintedBoundaryEvidence:true,
  printedFullTextCollated:false,printed1961TypicaCertified:false,
  completeLatinProperCollated:false,
  wholeHourLiturgicallyCertified:false,
  translationAlignmentVerified:false,rightsApproved:false,
  publishable:false,published:false
 });
}
