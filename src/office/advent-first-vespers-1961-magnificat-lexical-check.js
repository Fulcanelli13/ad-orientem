/**
 * Narrow Latin Magnificat witness against printed 1961 Vespers Ordinary p126.
 * No printed-source text is archived; the witness stores 10 normalized hashes.
 * The caller supplies a single original pinned Latin source on demand.
 *
 * IMPORTANT: lexical conformity of this ONE canticle does not certify the
 * whole Hour, punctuation, chant notation, or any of its other components.
 */
import {createHash} from "node:crypto";
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";
export const OFFICE_MAGNIFICAT_PRINT_SCHEMA=
 "ao.office.1961-magnificat-lexical-check.v1";
const WITNESS_SCHEMA="ao.office.1961-ordinary-magnificat-print-lexemes.v1";
const SOURCE="Psalterium/Psalmorum/Psalm232";
const BLOB="954dd48b23bd1a2da7c8c79dda64e4a50df57f38";
const URL="https://unavocesevilla.com/LIBROSLITURGICOS/BREVIARIUM%20ROMANUM.1961.pdf";
const deny=reason=>Object.freeze({
 schema:OFFICE_MAGNIFICAT_PRINT_SCHEMA,status:"WITHHELD",reason,
 printedVerseLexemesMatched:0,lexicalCanticleWitnessAccepted:false,
 fullTypographicCollation:false,wholeHourLiturgicallyCertified:false,
 rightsApproved:false,publishable:false,published:false
});
function normalizedLatin(text){
 if(typeof text!=="string")return "";
 return text.replace(/^[1][:](?:4[6-9]|5[0-5])\s+/u,"")
  .replace(/ǽ/gu,"ae").replace(/Ǽ/gu,"Ae")
  .replace(/æ/gu,"ae").replace(/Æ/gu,"Ae")
  .replace(/œ/gu,"oe").replace(/Œ/gu,"Oe")
  .normalize("NFD").replace(/[\u0300-\u036f]/gu,"")
  .replace(/j/gu,"i").replace(/J/gu,"I")
  .replace(/[^A-Za-z ]/gu," ").toLowerCase()
  .replace(/\s+/gu," ").trim();
}
function digest(s){return createHash("sha256").update(normalizedLatin(s),"utf8").digest("hex")}
function gitBlobSha(content){
 const bytes=Buffer.byteLength(content,"utf8");
 return createHash("sha1").update("blob "+bytes+"\0","utf8")
  .update(content,"utf8").digest("hex");
}
function validWitness(w){
 return w?.schema===WITNESS_SCHEMA&&
  w.witness?.document===URL&&w.witness?.zeroBasedPdfPage===126&&
  w.witness?.printedPage===126&&w.witness?.language==="la"&&
  w.source?.revision===DIVINUM_OFFICIUM_PIN&&
  w.source?.path===SOURCE&&w.source?.blobSha===BLOB&&
  w.source?.language==="la"&&
  w.printedVerseLexemesCompared===10&&
  w.printedVerseLexemesMatched===10&&
  w.fullTypographicCollation===false&&
  w.psalmodyVerified===false&&w.properVerified===false&&
  w.gloryDoxologyFullPrintedTextCollated===false&&
  w.fullHourTextCertified===false&&
  w.translationAlignmentVerified===false&&
  w.rightsApproved===false&&w.publishable===false&&w.published===false&&
  Array.isArray(w.verseSha256)&&w.verseSha256.length===10&&
  w.verseSha256.every(x=>typeof x==="string"&&/^[a-f0-9]{64}$/u.test(x));
}
/**
 * "readCanticleSource" must be the existing pinned source-reader callback,
 * not a new downloader, browser-generated Office, or annual capture job.
 */
export async function reviewPrinted1961LatinMagnificat({
 witness,readCanticleSource
}={}){
 if(!validWitness(witness))return deny("1961_MAGNIFICAT_WITNESS_INVALID");
 if(typeof readCanticleSource!=="function")
  return deny("PINNED_CANTICLE_READER_REQUIRED");
 let source;
 try{source=await readCanticleSource(SOURCE,"la")}
 catch{return deny("PINNED_CANTICLE_READ_FAILED")}
 if(source?.sourceRevision!==DIVINUM_OFFICIUM_PIN||
  source.sourcePath!==SOURCE||source.language!=="la"||
  typeof source.text!=="string"||
  source.sourceBlobSha!==BLOB||gitBlobSha(source.text)!==BLOB)
  return deny("PINNED_CANTICLE_PROVENANCE_MISMATCH");
 const lines=source.text.trim().replace(/\r\n?/gu,"\n").split("\n");
 if(lines.length!==11||!/^\(Canticum B\. Mariæ Virginis \* Luc\. 1:46-55\)$/u.test(lines[0]))
  return deny("PINNED_CANTICLE_SHAPE_CHANGED");
 const receipts=[];
 for(let i=0;i<10;i++){
  const line=lines[i+1];
  if(!line.startsWith("1:"+(i+46)+" ")||line.length>1600||
   /[$@&{}<>]/u.test(line))return deny("CANTICLE_VERSE_MISSING_OR_UNRESOLVED:"+String(i+46));
  const normalized=normalizedLatin(line);
  if(!normalized||normalized.split(" ").length<4||
     digest(line)!==witness.verseSha256[i])
   return deny("PRINTED_LEXICAL_DIFFERENCE_AT_LUKE_1_"+String(i+46));
  receipts.push(Object.freeze({
   verse:"Luke 1:"+(i+46),sourceId:SOURCE+"#1:"+(i+46),
   printedPdfPage:126,result:"LATIN_LEXEMES_EQUAL_AFTER_NORMALIZATION"
  }));
 }
 return Object.freeze({
  schema:OFFICE_MAGNIFICAT_PRINT_SCHEMA,
  status:"TEN_PRINTED_MAGNIFICAT_VERSES_LEXICALLY_EQUAL_LIMITED",
  printedWitnessPdfPage:126,sourceRevision:DIVINUM_OFFICIUM_PIN,
  sourceId:SOURCE+"#LUKE_1_46_55",verseReceipts:Object.freeze(receipts),
  printedVerseLexemesMatched:10,lexicalCanticleWitnessAccepted:true,
  fullTypographicCollation:false,openingGloriaPatriVerified:false,
  psalmAntiphonAndDoxologyVerified:false,
  wholeHourLiturgicallyCertified:false,
  translationAlignmentVerified:false,rightsApproved:false,
  publishable:false,published:false
 });
}
