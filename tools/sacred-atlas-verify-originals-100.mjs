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
/**
 * Explicit, bounded rerun only. A Wikimedia 429 means slow down globally:
 * do not retry it three times, and do not send another 94 requests.
 * Prior six successful SHA1 receipts remain valid and cannot be downgraded.
 */
const params=new Set(process.argv.slice(2));
if(!params.has("--run")){
 console.log("SAFE_NO_NETWORK: --run required. Use --selftest for offline validation.");
 process.exit(0);
}
const selectedSizeArg=[...params].find(x=>x.startsWith("--max-new="));
const delayArg=[...params].find(x=>x.startsWith("--delay-ms="));
const maxNew=selectedSizeArg?Number(selectedSizeArg.split("=")[1]):8;
const delayMs=delayArg?Number(delayArg.split("=")[1]):20000;
if(!Number.isInteger(maxNew)||maxNew<1||maxNew>12)throw Error("Batch size 1..12 only");
if(!Number.isInteger(delayMs)||delayMs<15000||delayMs>120000)throw Error("Respect ≥15-second source delay");

const previous=await readFile(OUTPUT,"utf8").then(JSON.parse).catch(()=>null);
const oldByPlace=new Map(
 (previous?.results||[]).filter(x=>x?.source_sha1&&x?.place_id).map(x=>[x.place_id,x])
);
function validPrevious(item){
 const prior=oldByPlace.get(item.place_id);
 return prior?.source_sha1===item.expected_original_sha1&&
   prior.commons_title===item.commons_title&&
   prior.source_bytes_verified===true&&
   prior.status==="SOURCE_BYTES_SHA1_VERIFIED"&&
   prior.actual_sha1===item.expected_original_sha1&&
   prior.bytes>0;
}
async function downloadAndHash(item){
 try{
  const res=await fetch(item.original_url,{
   headers:{"User-Agent":agent,"Accept":"image/jpeg,image/png,image/webp,image/tiff"},
   signal:AbortSignal.timeout(45000),redirect:"follow"
  });
  if(res.status===429){
   const retry=res.headers.get("retry-after");
   const seconds=retry&&/^\d+$/.test(retry)?Math.min(86400,Number(retry)):null;
   await res.body?.cancel();
   return {status:"DEFERRED_RATE_LIMIT_429",bytes:0,actual_sha1:null,detected_mime:null,
    error:"HTTP_429",retry_after_seconds:seconds,stop_all_requests:true};
  }
  if(!res.ok){
   await res.body?.cancel();
   return {status:"SOURCE_FETCH_HOLD",bytes:0,actual_sha1:null,detected_mime:null,
    error:"HTTP_"+res.status,stop_all_requests:false};
  }
  if(new URL(res.url).hostname!=="upload.wikimedia.org")throw Error("HOST_REDIRECT_NOT_ALLOWED");
  if(Number(res.headers.get("content-length")||0)>maxBytes)throw Error("ORIGINAL_TOO_LARGE");
  const digest=createHash("sha1"),reader=res.body.getReader();
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
  const sha1=digest.digest("hex"),detected=detectType(magic);
  if(!detected||detected!==item.mime)throw Error("FILE_MIME_MAGIC_MISMATCH");
  if(sha1!==item.expected_original_sha1)throw Error("ORIGINAL_SHA1_CHANGED");
  return {status:"SOURCE_BYTES_SHA1_VERIFIED",bytes:total,actual_sha1:sha1,
   detected_mime:detected,error:null,stop_all_requests:false};
 }catch(e){
  return {status:"INTEGRITY_HOLD",bytes:0,actual_sha1:null,detected_mime:null,
   error:String(e?.message||e).slice(0,180),stop_all_requests:false};
 }
}
const results=[];
let attempts=0,rateLimitSeen=false,stopReason=null;
for(const item of items){
 const earlier=oldByPlace.get(item.place_id);
 let response;
 if(validPrevious(item)){
  response={status:"SOURCE_BYTES_SHA1_VERIFIED",bytes:earlier.bytes,
   actual_sha1:earlier.actual_sha1,detected_mime:earlier.detected_mime,
   error:null,origin:"PREVIOUS_VERIFIED_SHA1_RECEIPT"};
 }else if(rateLimitSeen||attempts>=maxNew){
  response={status:"DEFERRED_NOT_REQUESTED",bytes:0,actual_sha1:null,
   detected_mime:null,error:rateLimitSeen?"WIKIMEDIA_RATE_LIMIT_COOLDOWN":"BATCH_REQUEST_CAP",
   origin:"ZERO_NEW_NETWORK_REQUESTS"};
 }else{
  if(attempts)await sleep(delayMs);
  response=await downloadAndHash(item);
  attempts++;
  if(response.stop_all_requests){
   rateLimitSeen=true;
   stopReason="WIKIMEDIA_429_STOP_ALL";
  }
 }
 results.push({
  order:item.order,place_id:item.place_id,commons_title:item.commons_title,
  commons_page:item.commons_page,source_sha1:item.expected_original_sha1,
  ...response,source_bytes_verified:response.status==="SOURCE_BYTES_SHA1_VERIFIED",
  source_identity_visually_verified:false,underlying_artwork_rights_cleared:false,
  licence_fully_cleared:false,composition_quality_approved:false,
  derivative_archived:false,publishable:false,published:false
 });
}
const verified=results.filter(x=>x.source_bytes_verified).length;
if(verified<(previous?.summary?.verified_original_source_bytes||0))
 throw Error("Previously verified SHA1 records cannot be lost");
const summary={
 total:100,verified_original_source_bytes:verified,holds:100-verified,
 newly_attempted_originals:attempts,skipped_without_network:results.filter(x=>x.status==="DEFERRED_NOT_REQUESTED").length,
 rate_limited:rateLimitSeen,stop_reason:stopReason,
 newly_archived_image_files:0,publication_approved:0,published:0
};
await writeFile(OUTPUT,JSON.stringify({
 schema:"AO_SACRED_ATLAS_ORIGINAL_INTEGRITY_100_RESULTS_V1",
 date:new Date().toISOString(),source_manifest:INPUT,
 note:"Verified SHA1 source identity only. 429 is a Wikimedia service limit, never a licence or image-quality rejection. No image bytes are archived.",
 summary,results
},null,2)+"\n");
console.log("SACRED_ATLAS_ORIGINALS_100",JSON.stringify(summary));
