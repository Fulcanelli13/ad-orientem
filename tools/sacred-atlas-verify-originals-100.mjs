#!/usr/bin/env node
/**
 * Sacred Atlas: verify original bytes of 100 *previously selected* Wikimedia
 * Commons files. No search, substitutions, licences inferred or publication.
 * Output is a small durable JSON receipt, never transient image artifacts.
 */
import {readFile,writeFile} from "node:fs/promises";
import {createHash} from "node:crypto";

const INPUT="data/geography/research/sacred-atlas-original-integrity-100-20261031.v1.json";
const OUTPUT="data/geography/research/sacred-atlas-original-integrity-100-20261031.results.json";
const SOURCE=JSON.parse(await readFile(INPUT,"utf8"));
const items=SOURCE.items;
const SHA1=/^[a-f0-9]{40}$/;
const permittedLicenses=new Set(["CC0","CC BY 2.0","CC BY 3.0","CC BY 4.0",
  "CC BY-SA 2.0","CC BY-SA 2.5","CC BY-SA 3.0","CC BY-SA 4.0"]);
if(SOURCE.schema!=="AO_SACRED_ATLAS_ORIGINAL_INTEGRITY_100_V1"||items.length!==100)
 throw Error("The exact 100-item source manifest is required");
const seenIds=new Set(),seenSHA=new Set();
for(const [i,item] of items.entries()){
 if(item.order!==i+1||seenIds.has(item.place_id)||seenSHA.has(item.expected_original_sha1))
  throw Error("Duplicate or reordered pinned selection: "+item.place_id);
 seenIds.add(item.place_id);seenSHA.add(item.expected_original_sha1);
 if(item.commons_title!==item.original_editorial_selection||
    !/^place:[A-Z]{2}:[\w-]+$/.test(item.place_id)||
    !item.commons_title.startsWith("File:")||
    !/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(item.commons_page)||
    !/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\//.test(item.original_url)||
    item.original_url.includes("?")||item.original_url.includes("#")||
    !SHA1.test(item.expected_original_sha1)||!permittedLicenses.has(item.claimed_license)||
    !item.claimed_photographer||!/^https?:\/\/creativecommons\.org\//.test(item.claimed_license_url)||
    !item.mime.startsWith("image/")||
    Math.min(item.original_width,item.original_height)<700||
    item.site_identity_visually_verified||item.source_bytes_verified||
    item.underlying_artwork_rights_cleared||item.publication_approved||item.published)
  throw Error("Incomplete or unsafe source contract: "+item.place_id);
}
if(process.argv.includes("--selftest")){
 console.log("PASS: 100 independent pinned Commons sources, 100 SHA1 claims, no new approvals");
 process.exit(0);
}
const maxBytes=24000000;
const sleep=ms=>new Promise(done=>setTimeout(done,ms));
const agent="AdOrientem/1.0 (public-interest free Sacred Atlas, github.com/Fulcanelli13/ad-orientem; source-integrity-verification)";
function detectType(buffer){
 if(buffer.length>=3&&buffer[0]===255&&buffer[1]===216&&buffer[2]===255)return "image/jpeg";
 if(buffer.length>=8&&buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return "image/png";
 if(buffer.length>=12&&buffer.toString("ascii",0,4)==="RIFF"&&buffer.toString("ascii",8,12)==="WEBP")return "image/webp";
 if(buffer.length>=4&&(buffer.toString("hex",0,4)==="49492a00"||buffer.toString("hex",0,4)==="4d4d002a"))return "image/tiff";
 return null;
}
async function downloadAndHash(item){
 let lastError=null;
 for(let attempt=1;attempt<=3;attempt++){
  try{
   const res=await fetch(item.original_url,{
    headers:{"User-Agent":agent,"Accept":"image/jpeg,image/png,image/webp,image/tiff"},
    signal:AbortSignal.timeout(40000),redirect:"follow"
   });
   if(!res.ok){
    if([429,502,503,504].includes(res.status)&&attempt<3){
     await sleep(3000*attempt);continue;
    }
    throw Error("HTTP_"+res.status);
   }
   if(new URL(res.url).hostname!=="upload.wikimedia.org")throw Error("HOST_REDIRECT_NOT_ALLOWED");
   if(Number(res.headers.get("content-length")||0)>maxBytes)throw Error("ORIGINAL_TOO_LARGE");
   const digest=createHash("sha1");
   const reader=res.body.getReader();
   let total=0,magic=Buffer.alloc(0);
   try{
    while(true){
     const {done,value}=await reader.read();
     if(done)break;
     const buf=Buffer.from(value);
     total+=buf.length;
     if(total>maxBytes)throw Error("ORIGINAL_TOO_LARGE");
     digest.update(buf);
     if(magic.length<16)magic=Buffer.concat([magic,buf.subarray(0,16-magic.length)]);
    }
   }finally{reader.releaseLock()}
   const sha1=digest.digest("hex"),actualType=detectType(magic);
   if(!actualType||actualType!==item.mime)throw Error("FILE_MIME_MAGIC_MISMATCH");
   if(sha1!==item.expected_original_sha1)throw Error("ORIGINAL_SHA1_CHANGED");
   return {status:"SOURCE_BYTES_SHA1_VERIFIED",bytes:total,actual_sha1:sha1,detected_mime:actualType,error:null};
  }catch(err){
   lastError=String(err?.message||err).slice(0,180);
   if(/ORIGINAL_TOO_LARGE|FILE_MIME_MAGIC_MISMATCH|ORIGINAL_SHA1_CHANGED|HOST_REDIRECT_NOT_ALLOWED/.test(lastError))break;
   if(attempt<3)await sleep(1000*attempt);
  }
 }
 return {status:"INTEGRITY_HOLD",bytes:0,actual_sha1:null,detected_mime:null,error:lastError||"UNKNOWN_FETCH_ERROR"};
}
const results=[];
for(const item of items){
 const response=await downloadAndHash(item);
 results.push({
  order:item.order,place_id:item.place_id,commons_title:item.commons_title,
  commons_page:item.commons_page,source_sha1:item.expected_original_sha1,
  ...response,
  source_bytes_verified:response.status==="SOURCE_BYTES_SHA1_VERIFIED",
  source_identity_visually_verified:false,underlying_artwork_rights_cleared:false,
  licence_fully_cleared:false,composition_quality_approved:false,
  derivative_archived:false,publishable:false,published:false
 });
 if(item.order%10===0)console.log("Source integrity",item.order,"/100",
   "verified",results.filter(x=>x.source_bytes_verified).length);
 await sleep(650);
}
const summary={
 total:100,verified_original_source_bytes:results.filter(x=>x.source_bytes_verified).length,
 holds:results.filter(x=>!x.source_bytes_verified).length,
 newly_archived_image_files:0,publication_approved:0,published:0
};
await writeFile(OUTPUT,JSON.stringify({
 schema:"AO_SACRED_ATLAS_ORIGINAL_INTEGRITY_100_RESULTS_V1",
 date:new Date().toISOString(),
 source_manifest:INPUT,
 note:"A verified SHA1 proves byte identity to the Commons metadata, not artwork rights, photographic identity, site identity or publishability. Image bytes are NOT permanently archived by this job.",
 summary,results
},null,2)+"\n");
console.log("SACRED_ATLAS_ORIGINALS_100",JSON.stringify(summary));
