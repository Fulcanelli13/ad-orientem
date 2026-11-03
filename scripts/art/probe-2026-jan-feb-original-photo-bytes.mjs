/**
 * January-February 2026: inspect already-indexed original photo URLs.
 * Uses ONLY 59-date prior-source matrix (no discovery, no acquisitions
 * stored in the repository). Exact original bytes are SHA-256 hashed in
 * runner memory and immediately discarded. No image is published.
 */
import assert from "node:assert/strict";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {createHash} from "node:crypto";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const input=resolve(root,"artifacts/sacred-art-2026/jan-feb-59-photo-readiness.json");
const offline=process.argv.includes("--offline");
const data=JSON.parse(await readFile(input,"utf8"));
assert.equal(data.dates.length,59);
assert.equal(data.totals.leadingCandidatesWithSourcePage,43);
assert.equal(data.totals.datesNewlyPublishedToHomepage,0);
const maxBytes=20*1024*1024;
const sourcePages=new Map();
for(const d of data.dates){
 const a=d.firstPhotoAuditCandidate;
 assert.ok(a&&a.certifiedForThisHomepageDate===false);
 const u=a.sourceUrl;
 if(!u)continue;
 const url=new URL(u);
 assert.equal(url.protocol,"https:","Non-HTTPS source must not be fetched");
 if(!sourcePages.has(url.href))
  sourcePages.set(url.href,{url:url.href,dates:[],title:a.title,
   artist:a.artist,rightsCategory:a.photo.rightsCategory});
 sourcePages.get(url.href).dates.push(d.date);
}
assert.equal(sourcePages.size,28);
const trusted=new Set([
 "commons.wikimedia.org","www.metmuseum.org","www.museodelprado.es",
 "clevelandart.org","www.nationalgallery.org.uk","www.mskgent.be",
 "art.thewalters.org","purl.thewalters.org","catalogo.beniculturali.it",
 "www.catalogo.beniculturali.it","www.nga.gov","pop.culture.gouv.fr",
 "open.smk.dk"
]);
const imageHosts=new Set(["upload.wikimedia.org","images.metmuseum.org"]);
const apiHosts=new Set(["commons.wikimedia.org","collectionapi.metmuseum.org"]);
function bytesDimensions(buf){
 if(buf.length>=24&&buf.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))
  return {width:buf.readUInt32BE(16),height:buf.readUInt32BE(20),format:"PNG"};
 if(buf.length>10&&buf[0]===255&&buf[1]===216){
  let i=2;
  const sof=new Set([0xC0,0xC1,0xC2,0xC3,0xC5,0xC6,0xC7,0xC9,0xCA,0xCB,0xCD,0xCE,0xCF]);
  while(i+9<=buf.length){
   while(buf[i]===255)i++;
   const marker=buf[i++];
   if(marker===0xD9||marker===0xDA)break;
   if(marker===0xD8||marker===0x01||marker>=0xD0&&marker<=0xD7)continue;
   if(i+2>buf.length)break;
   const size=buf.readUInt16BE(i);
   if(size<2||i+size>buf.length)break;
   if(sof.has(marker)&&size>=7)
    return {width:buf.readUInt16BE(i+5),height:buf.readUInt16BE(i+3),format:"JPEG"};
   i+=size;
  }
 }
 if(buf.length>=30&&buf.toString("ascii",0,4)==="RIFF"&&buf.toString("ascii",8,12)==="WEBP"){
  const kind=buf.toString("ascii",12,16);
  if(kind==="VP8X")
   return {width:1+buf.readUIntLE(24,3),height:1+buf.readUIntLE(27,3),format:"WEBP"};
  if(kind==="VP8L"){
   const b=buf.readUInt32LE(21);
   return {width:(b&16383)+1,height:((b>>>14)&16383)+1,format:"WEBP"};
  }
 }
 return null;
}
async function json(url){
 const u=new URL(url);assert.ok(apiHosts.has(u.hostname),"Untrusted JSON API host");
 const r=await fetch(url,{headers:{"User-Agent":"AdOrientemSacredArtResearch/1.0 (read-only photographic audit)","Accept":"application/json"},
  signal:AbortSignal.timeout(18000)});
 if(!r.ok)throw Error("SOURCE_API_HTTP_"+r.status);
 return r.json();
}
async function originalBytes(url){
 let u=new URL(url);
 assert.equal(u.protocol,"https:");
 assert.ok(imageHosts.has(u.hostname),"Disallowed original image host "+u.hostname);
 const r=await fetch(u.href,{headers:{"User-Agent":"AdOrientemSacredArtResearch/1.0","Accept":"image/*"},
  signal:AbortSignal.timeout(30000)});
 if(!r.ok)throw Error("IMAGE_HTTP_"+r.status);
 u=new URL(r.url);
 assert.ok(imageHosts.has(u.hostname),"Image redirected off safe host");
 const type=(r.headers.get("content-type")??"").toLowerCase();
 if(!type.startsWith("image/"))throw Error("NON_IMAGE_MIME_"+type);
 if(Number(r.headers.get("content-length")??0)>maxBytes)
  throw Error("IMAGE_EXCEEDS_20MB_CAP");
 const parts=[];let total=0;
 try{
  for await(const part of r.body){
   total+=part.length;
   if(total>maxBytes)throw Error("IMAGE_EXCEEDS_20MB_CAP");
   parts.push(part);
  }
 }catch(e){throw e}
 const b=Buffer.concat(parts,total);
 const pixels=bytesDimensions(b);
 if(!pixels||pixels.width<1||pixels.height<1)throw Error("UNREADABLE_NATIVE_IMAGE_DIMENSIONS");
 return {sha256:createHash("sha256").update(b).digest("hex"),
  nativeWidth:pixels.width,nativeHeight:pixels.height,
  nativeFormat:pixels.format,bytes:total,actualMime:type,
  imageOrigin:u.hostname,originalUrl:u.href};
}
function commonsFilename(pageUrl){
 const u=new URL(pageUrl);assert.equal(u.hostname,"commons.wikimedia.org");
 assert.ok(u.pathname.startsWith("/wiki/File:"));
 let name=u.pathname.slice("/wiki/".length);
 try{name=decodeURIComponent(name)}catch{throw Error("INVALID_COMMONS_FILE_ENCODING")}
 return name.replaceAll("_"," ");
}
async function probeCommons(record){
 const file=commonsFilename(record.url);
 const params=new URLSearchParams({action:"query",format:"json",formatversion:"2",
  prop:"imageinfo",titles:file,iiprop:"url|size|mime|sha1|extmetadata"});
 const j=await json("https://commons.wikimedia.org/w/api.php?"+params);
 const p=j.query?.pages?.[0];
 if(!p||p.missing||!p.imageinfo?.[0])throw Error("COMMONS_FILE_NOT_RESOLVED");
 const info=p.imageinfo[0],e=info.extmetadata??{};
 const license=e.LicenseShortName?.value??e.License?.value??null;
 const credit=e.AttributionRequired?.value??null;
 const rightsAllowed=/^(Public domain|PD-Art|CC0)(?:\b|$)/i.test(String(license??""));
 const result={sourceMetadata:"COMMONS_IMAGEINFO",mediaId:p.pageid,
  originalSha1FromRepository:info.sha1??null,reportedWidth:info.width,
  reportedHeight:info.height,reportedBytes:info.size,
  licenseText:license,attributionRequired:credit,
  commonsRightsScope:rightsAllowed?"PUBLIC_DOMAIN_OR_CC0_METADATA_ONLY":
   "LICENSE_REQUIRES_SEPARATE_REVIEW",
  selectedImageRightsLegallyCertified:false};
 if(!rightsAllowed){
  result.state="METADATA_RETURNED_RIGHTS_HELD";
  return result;
 }
 if(!info.url)throw Error("COMMONS_NO_ORIGINAL_URL");
 const b=await originalBytes(info.url);
 assert.equal(b.nativeWidth,info.width,"Commons native pixel mismatch");
 assert.equal(b.nativeHeight,info.height,"Commons native pixel mismatch");
 result.state="ORIGINAL_BYTES_VERIFIED_TECHNICAL_ONLY";
 result.original=b;
 return result;
}
async function probeMet(record){
 const match=/\/art\/collection\/search\/(\d+)(?:\b|$)/.exec(new URL(record.url).pathname);
 if(!match)throw Error("INVALID_MET_OBJECT_URL");
 const id=Number(match[1]);
 const obj=await json("https://collectionapi.metmuseum.org/public/collection/v1/objects/"+id);
 assert.equal(obj.objectID,id);
 const result={sourceMetadata:"MET_COLLECTION_API",objectID:id,
  accession:obj.accessionNumber??null,
  museumTitle:obj.title??null,museumArtist:obj.artistDisplayName??null,
  museumOpenAccessPublicDomain:obj.isPublicDomain===true,
  sourcePhotoURL:obj.primaryImage??null,
  selectedImageRightsLegallyCertified:false};
 if(!obj.isPublicDomain||!obj.primaryImage){
  result.state="MET_METADATA_IMAGE_NOT_OPEN_ACCESS";
  return result;
 }
 const b=await originalBytes(obj.primaryImage);
 result.state="ORIGINAL_BYTES_VERIFIED_TECHNICAL_ONLY";
 result.original=b;
 return result;
}
async function probeSource(record){
 const host=new URL(record.url).hostname;
 assert.ok(trusted.has(host),"Untrusted historical source host "+host);
 const basic={
  sourcePage:record.url,originalDateReferences:record.dates,
  observedTitle:record.title,artist:record.artist,
  referencedDatesCount:record.dates.length,sourceHost:host,
  exactNativePhotoRightsApprovedForHomeDate:false,
  manualFramelessCropPassed:false,homeDatePublished:false
 };
 if(host==="www.museodelprado.es")
  return {...basic,state:"HISTORICAL_PRADO_SOURCE_HELD",reason:
   "Do not fetch Prado photograph; preserve date selection and seek previously approved independent photo"};
 if(!["commons.wikimedia.org","www.metmuseum.org"].includes(host))
  return {...basic,state:"OFFICIAL_PAGE_PRESENT_IMAGE_ENDPOINT_NOT_RECONCILED",
   reason:"Source page is historically indexed, but original image URL and rights evidence are not yet independently verified"};
 if(offline)return {...basic,state:"NETWORK_NOT_ATTEMPTED_IN_OFFLINE_TEST"};
 try{
  const meta=host==="commons.wikimedia.org"?
   await probeCommons(record):await probeMet(record);
  return {...basic,...meta};
 }catch(e){return {...basic,state:"SOURCE_OR_IMAGE_FETCH_BLOCKED",
  failure:String(e?.message??e).slice(0,300)};
 }
}
const originalSources=[...sourcePages.values()];
const inspections=new Array(originalSources.length);
let next=0;
await Promise.all(Array.from({length:2},async()=>{
 while(next<originalSources.length){
  const index=next++;
  inspections[index]=await probeSource(originalSources[index]);
 }
}));
const byUrl=new Map(inspections.map(x=>[x.sourcePage,x]));
const dates=data.dates.map(row=>{
 const candidate=row.firstPhotoAuditCandidate,source=candidate.sourceUrl;
 const inspection=source?byUrl.get(source):null;
 assert.equal(candidate.certifiedForThisHomepageDate,false);
 return {date:row.date,observedTitle:row.observedTitle,
  originalDateArtworkApprovalPreserved:candidate.preservedDateApproval,
  firstCandidateTitle:candidate.title,sourcePage:source??null,
  evidenceStatus:inspection?.state??"HISTORICAL_DATE_SOURCE_PAGE_NOT_LINKED",
  sourceOriginalSHA256VerifiedHere:inspection?.original?.sha256??null,
  nativePixelWidthVerifiedHere:inspection?.original?.nativeWidth??null,
  nativePixelHeightVerifiedHere:inspection?.original?.nativeHeight??null,
  imageRightsCertifiedForThisDate:false,
  imageVisualCropCertified:false,publicationAuthorized:false};
});
const count=k=>inspections.filter(x=>x.state===k).length;
const report={
 schema:"AO_2026_JAN_FEB_28_UNIQUE_SOURCES_ORIGINAL_BYTES_PROBE_V1",
 generatedAt:new Date().toISOString(),runMode:offline?"OFFLINE_SOURCE_SCOPE_TEST":"NETWORK_ORIGINAL_TECHNICAL_PROBE",
 policies:["PREEXISTING_SOURCE_URLS_ONLY","SOURCE_HOST_ALLOWLIST",
  "NO_PRADO_IMAGE_FETCH_OR_PUBLICATION","NO_PUBLISHING_OR_DATE_APPROVAL_TRANSFER",
  "ORIGINAL_BYTES_HASHED_IN_MEMORY_AND_DISCARDED",
  "LEGAL_REUSE_RIGHTS_STILL_REQUIRE_SELECTED_IMAGE_CERTIFICATION",
  "NATIVE_PIXELS_DO_NOT_CERTIFY_AESTHETIC_CROP",
  "REMOTE_FAILURES_REMAIN_FAILED_NOT_SILENTLY_APPROVED"],
 counts:{dates:dates.length,originalSourcePages:originalSources.length,
  datesWithSourcePage:dates.filter(x=>x.sourcePage).length,
  datesMissingSourcePage:dates.filter(x=>!x.sourcePage).length,
  originalBytesTechnicallyVerified:count("ORIGINAL_BYTES_VERIFIED_TECHNICAL_ONLY"),
  rightsHeldMetadata:count("METADATA_RETURNED_RIGHTS_HELD")+count("MET_METADATA_IMAGE_NOT_OPEN_ACCESS"),
  fetchBlocked:count("SOURCE_OR_IMAGE_FETCH_BLOCKED"),
  officialImageEndpointUnreconciled:count("OFFICIAL_PAGE_PRESENT_IMAGE_ENDPOINT_NOT_RECONCILED"),
  heldPrado:count("HISTORICAL_PRADO_SOURCE_HELD"),
  datesPublicationAuthorized:0,photosManualCropApprovedInThisPass:0},
 sources:inspections,dates
};
assert.equal(report.counts.dates,59);
assert.equal(report.counts.originalSourcePages,28);
assert.equal(report.counts.datesWithSourcePage,43);
assert.equal(report.counts.datesMissingSourcePage,16);
const dest=resolve(root,"artifacts/sacred-art-2026");
await mkdir(dest,{recursive:true});
await writeFile(resolve(dest,"jan-feb-28-original-source-byte-probe.json"),JSON.stringify(report,null,2)+"\n");
const lines=[
 "# January–February Sacred Art — original photograph byte audit",
 "",
 "This technical probe hashes original image bytes in runner memory. It does **not** clear reproduction rights, authorise a new date artwork, judge crops or publish images.",
 "",
 "| Status | Source objects |",
 "|---|---:|",
 ...Object.entries(report.counts).map(([k,v])=>"| "+k+" | "+v+" |"),
 "",
 "## Unique existing source pages",
 "",
 "| Source | Dates | Evidence status | Native pixels | Original SHA-256 |",
 "|---|---|---|---|---|"
];
for(const x of inspections){
 const clean=t=>String(t??"").replace(/\|/g," / ").replace(/\r?\n/g," ");
 lines.push("| "+clean(x.sourcePage)+" | "+x.originalDateReferences.join(", ")+" | "+
  clean(x.state)+" | "+(x.original?x.original.nativeWidth+" × "+x.original.nativeHeight:"—")+
  " | "+(x.original?.sha256??"—")+" |");
}
lines.push("","## Date-level photographic gates",
 "","All 59 dates retain publicationAuthorized=false and imageRightsCertifiedForThisDate=false.",
 "","Image endpoints missing or returning errors require follow-up. No image bytes are stored in this audit artifact.");
await writeFile(resolve(dest,"jan-feb-28-original-source-byte-probe.md"),lines.join("\n")+"\n");
console.log(JSON.stringify(report.counts,null,2));
