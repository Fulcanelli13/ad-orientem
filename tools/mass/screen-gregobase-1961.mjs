#!/usr/bin/env node
// Screening never promotes a chant into the liturgical source registry.
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {join,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {SCHEMA as DISCOVERY_SCHEMA} from "./ingest-gregobase-1961.mjs";
export const SCREEN_SCHEMA="ao-gregobase-1961-screening-v1";
export function screenCatalogue(manifest,shards){
 if(manifest?.schema!==DISCOVERY_SCHEMA||!manifest.sha256)
  throw Error("Unknown or unaudited discovery manifest");
 if(!Array.isArray(shards)||shards.length!==manifest.shards.length)
  throw Error("Missing expected discovery shard(s)");
 const byId=new Set(),review=[],exceptions=[],counts={rows:0,screenable:0,exceptions:0,approved:0,
  byTrack:{},reasonCounts:{}};
 for(const shard of shards){
  if(shard.schema!==DISCOVERY_SCHEMA||shard.sourceSha256!==manifest.sha256||
    shard.index!==shards.indexOf(shard)+1||shard.total!==shards.length)
    throw Error("Source checksum or shard sequence mismatch");
  for(const entry of shard.records??[]){
   if(!Number.isInteger(entry.gregobaseId)||entry.gregobaseId<=0||
     entry.id!=="GREGOBASE-"+entry.gregobaseId||
     entry.sourceUrl!=="https://gregobase.selapa.net/chant.php?id="+entry.gregobaseId)
     throw Error("Invalid source identity "+entry.id);
   if(byId.has(entry.id))throw Error("Duplicate source record across shards "+entry.id);
   byId.add(entry.id);counts.rows++;
   const reasons=[
     ...(!entry.trackHint?["UNCLASSIFIED_OR_NON_MASS"]:[]),
     ...(!entry.hasGabcPayload?["MISSING_GABC"]:[]),
     ...(entry.copyright?["COPYRIGHT_REVIEW"]:[]),
     ...(entry.duplicateOf?["DUPLICATE_CANDIDATE"]:[]),
     ...(!Array.isArray(entry.pages)||!entry.pages.length?["NO_1961_PAGE"]:[]),
   ];
   const status=reasons.length?"EXCEPTION_METADATA":"READY_FOR_GABC_SOURCE_REVIEW";
   const screened=Object.freeze({
    id:entry.id,sourceUrl:entry.sourceUrl,trackHint:entry.trackHint??null,
    incipit:entry.incipit,editionPages:entry.pages,
    status,reasonCodes:Object.freeze(reasons),
    releaseGates:Object.freeze([
     "DOWNLOAD_CURRENT_GABC_AND_HASH","CHECK_TRANSCRIPTION_AND_COPYRIGHT",
     "VERIFY_1961_FACSIMILE","MATCH_CANONICAL_RESOLVED_PROPER",
     "HUMAN_EDITORIAL_APPROVAL",
    ]),
   });
   if(reasons.length){exceptions.push(screened);counts.exceptions++}
   else{review.push(screened);counts.screenable++;
    counts.byTrack[entry.trackHint]=(counts.byTrack[entry.trackHint]??0)+1}
   for(const reason of reasons)counts.reasonCounts[reason]=(counts.reasonCounts[reason]??0)+1;
  }
 }
 if(counts.rows!==manifest.summary.total)throw Error("Manifest count mismatch");
 return Object.freeze({schema:SCREEN_SCHEMA,sourceSha256:manifest.sha256,
  counts:Object.freeze(counts),ready:Object.freeze(review),
  exceptions:Object.freeze(exceptions)});
}
export function batchForEditorialReview(rows,size=200){
 if(!Number.isInteger(size)||size<1||size>500)throw Error("Invalid review size");
 return Array.from({length:Math.ceil(rows.length/size)},(_,i)=>
  Object.freeze({batch:i+1,of:Math.ceil(rows.length/size),
   candidates:Object.freeze(rows.slice(i*size,(i+1)*size))}));
}
function main(){
 const args=process.argv.slice(2),arg=name=>{const i=args.indexOf(name);return i<0?null:args[i+1]};
 if(!arg("--index")||!arg("--out"))throw Error("Usage: --index directory --out directory");
 const dir=resolve(arg("--index")),out=resolve(arg("--out"));
 const manifest=JSON.parse(readFileSync(join(dir,"manifest.json"),"utf8"));
 const shards=manifest.shards.map(row=>JSON.parse(readFileSync(join(dir,row.file),"utf8")));
 const screened=screenCatalogue(manifest,shards);
 mkdirSync(out,{recursive:true});
 writeFileSync(join(out,"screening-summary.json"),JSON.stringify({
  schema:screened.schema,sourceSha256:screened.sourceSha256,
  counts:screened.counts,approvedCount:0,
  caveat:"Historical metadata screening does not approve Gregorian melodies or liturgical use",
 },null,2)+"\n");
 for(const [name,items] of [["screened",screened.ready],["exceptions",screened.exceptions]]){
  for(const batch of batchForEditorialReview(items)){
   const filename=name+"-"+String(batch.batch).padStart(3,"0")+".json";
   writeFileSync(join(out,filename),JSON.stringify({
    schema:SCREEN_SCHEMA,sourceSha256:screened.sourceSha256,queue:name,
    ...batch,
   })+"\n");
  }
 }
 console.log("AO_GREGORIAN_SCREENING="+JSON.stringify(screened.counts));
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1]))main();
