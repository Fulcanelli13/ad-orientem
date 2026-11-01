// Pinned DivinumOfficium source authentication and exact chant-section extraction.
// Node-only research pipeline; do not import this module into the public reader.
import {createHash} from "node:crypto";

export const SOURCE_KEYS=Object.freeze([
 "Introitus","Graduale","GradualeP","Tractus","Offertorium","Communio","Sequentia"
]);
const keySet=new Set(SOURCE_KEYS);
const validSource=/^(?:Tempora|Sancti|Commune)\/[A-Za-z0-9_-]+$/;
export function gitBlobSha1(bytes){
 const buffer=Buffer.isBuffer(bytes)?bytes:Buffer.from(bytes);
 return createHash("sha1").update(Buffer.from("blob "+buffer.length+"\0")).update(buffer).digest("hex");
}
export function parsePinnedLatinChantSections(source){
 if(typeof source!=="string")throw new TypeError("Latin Missal UTF-8 text required");
 const sections={},duplicateSections=[],conditionalSections=[];
 let current=null,lines=[];
 const flush=()=>{
  if(current===null)return;
  if(Object.hasOwn(sections,current)){duplicateSections.push(current);current=null;lines=[];return;}
  sections[current]=lines.join("\n").trim();current=null;lines=[];
 };
 for(const line of source.replace(/\r\n/g,"\n").split("\n")){
  const trimmed=line.trim();
  if(trimmed.startsWith("[")){
   flush();
   const match=/^\[([A-Za-z0-9]+)\]$/.exec(trimmed);
   current=match&&keySet.has(match[1])?match[1]:null;
   // Rubric-conditional and unknown headings are not silently selected.
   if(!match){
    const conditional=/^\[([A-Za-z0-9]+)\]/.exec(trimmed);
    if(conditional&&keySet.has(conditional[1]))conditionalSections.push(conditional[1]);
   }
  }else if(current!==null)lines.push(line);
 }
 flush();
 for(const key of duplicateSections)delete sections[key];
 return {sections,duplicateSections:[...new Set(duplicateSections)],
  conditionalSections:[...new Set(conditionalSections)]};
}
export function validatePinnedLatinFile({entry,bytes}){
 if(!validSource.test(entry?.path??"")||!/^[0-9a-f]{40}$/.test(entry?.sha??""))
  throw new Error("UNTRUSTED_MISSA_TREE_ENTRY");
 const buffer=Buffer.isBuffer(bytes)?bytes:Buffer.from(bytes);
 if(buffer.length!==entry.size)throw new Error("PINNED_SOURCE_SIZE_MISMATCH:"+entry.path);
 const digest=gitBlobSha1(buffer);
 if(digest!==entry.sha)throw new Error("PINNED_SOURCE_SHA_DRIFT:"+entry.path);
 const latin=new TextDecoder("utf-8",{fatal:true}).decode(buffer);
 const extracted=parsePinnedLatinChantSections(latin);
 return {path:entry.path,expectedSha:entry.sha,actualSha:digest,status:"SHA_MATCH",
  sections:extracted.sections,sourceSectionHolds:{
   duplicate:extracted.duplicateSections,conditional:extracted.conditionalSections}};
}
export function validatePinnedSourceInventory(inventory,subset){
 if(inventory?.schema!=="ao-mass-music-1962-pinned-source-universe-v1"||
    inventory?.sourceRepository!=="DivinumOfficium/divinum-officium"||
    inventory?.sourceRef!=="ad8783641455bae38a8eb5782b34241a7b3ff2ef"||
    inventory?.fullLatinSourceTreeCount!==1049||
    inventory?.legacyVerifiedSubsetCount!==91||
    !Array.isArray(inventory?.sourceFiles)||inventory.sourceFiles.length!==1049)
  throw new Error("PINNED_SOURCE_UNIVERSE_INVALID");
 const index=new Map();
 for(const row of inventory.sourceFiles){
  if(!validSource.test(row.path)||!Number.isSafeInteger(row.size)||row.size<1||
     !/^[0-9a-f]{40}$/.test(row.sha)||index.has(row.path))
    throw new Error("PINNED_SOURCE_ENTRY_INVALID:"+row.path);
  index.set(row.path,row);
 }
 if(subset?.sourceCount!==91||subset.sourceRef!==inventory.sourceRef||
   subset.sourceFiles?.length!==91)throw new Error("ORIGINAL_91_WITNESS_MISSING");
 for(const prior of subset.sourceFiles){
  if(index.get(prior.path)?.sha!==prior.sha)
   throw new Error("ORIGINAL_91_WITNESS_CHANGED:"+prior.path);
 }
 return Object.freeze({fileCount:index.size,preservedPriorWitnesses:subset.sourceFiles.length,
  sourceRef:inventory.sourceRef});
}
