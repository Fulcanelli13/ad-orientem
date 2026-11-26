#!/usr/bin/env node
/** Source-only image acquisition in 50-record shards. Never publishes media. */
import assert from "node:assert/strict";
import {hasPradoProvenance,commonsMetadataHasPradoProvenance,PRADO_SOURCE_HOLD} from "./sacred-art-source-policy.mjs";
import {readFileSync} from "node:fs";
import {mkdir,writeFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {join} from "node:path";

const ROOT=new URL("../../",import.meta.url);
const load=p=>JSON.parse(readFileSync(new URL(p,ROOT),"utf8"));
const INTAKE=load("data/research/sacred-art-bulk-source-intake-451-20261020.v1.json");
const FREEZE=load("data/research/sacred-art-user-frozen-decisions-20261017.v1.json");
const RELEASED=load("data/calendar/sacred-art-certified-media.v1.json");
const approved=new Set(FREEZE.approved.map(x=>x.artworkId));
const retainedFives=new Set(FREEZE.historicallyFiveIDsPreservedSeparately);
const rejected=new Set(FREEZE.rejected.map(x=>x.artworkId));
const sha256=bytes=>createHash("sha256").update(bytes).digest("hex");
const escaped=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const untag=x=>String(x??"").replace(/<[^>]+>/g,"").trim();
const tidy=x=>String(x??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const titleKey=title=>title.replace(/_/g," ");
export function commonsLicenseUsable(name,copyrightedFlag){
 const lic=untag(name).toLowerCase().replace(/\s+/g," ");
 const copyright=untag(copyrightedFlag).toLowerCase();
 if(/^cc0(?:\s*1\.0)?$/.test(lic))return true;
 if(/^cc by(?:-sa)?\s*[234]\.0$/.test(lic))return true;
 if(/^(?:public domain|pd)$/.test(lic))return copyright!=="true";
 return false;
}

export const BATCH_SIZE=50;
export function makeBatches(rows=INTAKE.works){return Array.from({length:Math.ceil(rows.length/BATCH_SIZE)},(_,i)=>rows.slice(i*BATCH_SIZE,(i+1)*BATCH_SIZE));}
export function sourceGate(row){
 if(row.sourcePolicy?.status===PRADO_SOURCE_HOLD||hasPradoProvenance(row))return PRADO_SOURCE_HOLD;
 if(rejected.has(row.id)||row.reviewGate==="EXCLUDED")return "HOLD_REJECTED";
 const newApproval=approved.has(row.id)&&row.reviewGate==="APPROVED";
 const retainedFive=retainedFives.has(row.id)&&row.reviewGate==="LEGACY_FIVE_PRESERVED";
 if(!newApproval&&!retainedFive)return "HOLD_NOT_APPROVED";
 if(row.provider==="MET_OPEN_ACCESS_CANDIDATE"&&/^https:\/\/www\.metmuseum\.org\/art\/collection\/search\/\d+(?:[/?#]|$)/.test(row.sourceUrl))return "MET";
 if(row.provider==="COMMONS_EXACT_FILE_CANDIDATE"&&/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/i.test(row.sourceUrl))return "COMMONS";
 if(row.provider==="CLEVELAND_CC0_CANDIDATE"&&/^https:\/\/(?:www\.)?clevelandart\.org\/art\/\d{4}\.\d+(?:[/?#]|$)/.test(row.sourceUrl))return "CLEVELAND";
 if(row.provider==="CANONICAL_SOURCE_REUSE_ALIAS")return "HOLD_CANONICAL_ALIAS_REUSE";
 if(row.provider==="NGA_OFFICIAL_OPEN_ACCESS_CANDIDATE")return "HOLD_NGA_DEDICATED_BATCH";
 return "HOLD_NO_AUTHORIZED_SOURCE";
}
export function parseImageDimensions(bytes,mime){
 if(mime==="image/png"){
   assert(bytes.length>=24&&bytes.subarray(0,8).equals(Buffer.from("89504e470d0a1a0a","hex")),"Not PNG");
   return {width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)};
 }
 assert(mime==="image/jpeg"&&bytes.length>20&&bytes[0]===255&&bytes[1]===216,"Not JPEG");
 let pos=2;
 while(pos+9<bytes.length){
   if(bytes[pos++]!==255)continue;
   while(bytes[pos]===255)pos++;
   const m=bytes[pos++];
   if(m===0xd9||m===0xda)break;
   if(m===0x01||(m>=0xd0&&m<=0xd7))continue;
   if(pos+2>bytes.length)break;
   const len=bytes.readUInt16BE(pos);
   if(len<2||pos+len>bytes.length)throw Error("Malformed JPEG");
   if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(m))
     return {height:bytes.readUInt16BE(pos+3),width:bytes.readUInt16BE(pos+5)};
   pos+=len;
 }
 throw Error("JPEG dimensions unavailable");
}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function request(url,kind="json"){
 const host=new URL(url).hostname;
 if(kind==="json")assert(["collectionapi.metmuseum.org","commons.wikimedia.org","openaccess-api.clevelandart.org"].includes(host),"Untrusted metadata endpoint");
 else assert(["images.metmuseum.org","upload.wikimedia.org","openaccess-cdn.clevelandart.org"].includes(host),"Untrusted image endpoint");
 for(let attempt=0;attempt<4;attempt++){
   const res=await fetch(url,{signal:AbortSignal.timeout(25000),headers:{"user-agent":"AdOrientemSacredArtResearch/1.0 (https://github.com/Fulcanelli13/ad-orientem)"}});
   if([429,502,503,504].includes(res.status)&&attempt<3){await wait([1500,4500,9000][attempt]);continue;}
   if(!res.ok)throw Error("HTTP "+res.status);
   if(new URL(res.url).hostname!==host)throw Error("Cross-host redirect prohibited");
   return res;
 }
 throw Error("Source unavailable");
}
export function metadataAgreement(row,title,artist){
 const subject=tidy(row.title),other=tidy(title),x=tidy(row.artist),y=tidy(artist);
 const sourceCorrection=row.sourceIdentityCorrection;
 // Official title variants do not alter the user's artwork selection.
 // A manually recorded alias applies ONLY if both museum object ID and accession
 // are locked to the corrected Met original; it cannot bless an arbitrary copy.
 const documentedTitle=tidy(sourceCorrection?.actualMetTitle);
 const documentedAliasMatch=Boolean(documentedTitle&&other===documentedTitle&&
  row.verifiedMuseumAccession===sourceCorrection.correctMuseumAccession&&
  Number(new URL(row.sourceUrl).pathname.match(/\/search\/(\d+)/)?.[1])===sourceCorrection.correctObjectId);
 const exactOrPartial=Boolean(subject&&other&&(subject===other||subject.includes(other)||other.includes(subject)));
 return {titleComparable:!!other,titleAgreement:exactOrPartial||documentedAliasMatch,
  documentaryTitleAliasMatch:documentedAliasMatch,
  artistComparable:!!y,artistAgreement:Boolean(x&&y&&(x.includes(y)||y.includes(x)))};
}
async function metSource(row){
 const id=Number(new URL(row.sourceUrl).pathname.match(/\/search\/(\d+)/)?.[1]);
 assert(Number.isSafeInteger(id)&&id>0,"Invalid Met object ID");
 const metadataUrl="https://collectionapi.metmuseum.org/public/collection/v1/objects/"+id;
 const meta=await (await request(metadataUrl)).json();
 assert.equal(meta.objectID,id,"Museum object mismatch");
 if(row.verifiedMuseumAccession)assert.equal(meta.accessionNumber,row.verifiedMuseumAccession,"Exact museum accession mismatch");
 assert.equal(meta.isPublicDomain,true,"Met not marked Open Access");
 assert(typeof meta.primaryImage==="string"&&new URL(meta.primaryImage).hostname==="images.metmuseum.org","Missing original image");
 const agreement=metadataAgreement(row,meta.title,meta.artistDisplayName);
 assert(agreement.titleAgreement||agreement.artistAgreement,"MET_SOURCE_WRONG_PHYSICAL_WORK: catalogue title AND artist conflict with museum object");
 const r=await request(meta.primaryImage,"image");
 assert((r.headers.get("content-type")||"").toLowerCase().includes("image/jpeg"),"Not original JPEG");
 const bytes=Buffer.from(await r.arrayBuffer());
 return {bytes,mime:"image/jpeg",source:{provider:"MET_OPEN_ACCESS",objectID:id,accession:meta.accessionNumber||null,
    originalTitle:meta.title,originalArtist:meta.artistDisplayName,objectUrl:row.sourceUrl,metadataUrl,imageUrl:meta.primaryImage,
    rights:"MET_OPEN_ACCESS_CC0",rightsUrl:"https://www.metmuseum.org/policies/frequently-asked-questions-image-and-data-resources",
    rightsObjectFlag:true,metadataAgreement:metadataAgreement(row,meta.title,meta.artistDisplayName)}};
}
async function clevelandSource(row){
 const accession=new URL(row.sourceUrl).pathname.match(/^\/art\/(\d{4}\.\d+)\/?$/)?.[1];
 assert(accession,"Invalid Cleveland exact accession number");
 const metadataUrl="https://openaccess-api.clevelandart.org/api/artworks/"+accession;
 const data=await (await request(metadataUrl)).json();
 const meta=data?.data;
 assert(meta&&meta.accession_number===accession,"Museum accession mismatch");
 assert(meta.share_license_status==="CC0","Cleveland image not designated CC0");
 assert(typeof meta.images?.print?.url==="string"&&new URL(meta.images.print.url).hostname==="openaccess-cdn.clevelandart.org",
   "Missing official print-resolution image");
 const imgResponse=await request(meta.images.print.url,"image");
 assert((imgResponse.headers.get("content-type")||"").toLowerCase().includes("image/jpeg"),"Print reproduction not JPEG");
 const bytes=Buffer.from(await imgResponse.arrayBuffer());
 return {bytes,mime:"image/jpeg",source:{provider:"CLEVELAND_MUSEUM_CC0",
   objectID:meta.id,accession,title:meta.title,
   originalArtist:(meta.creators||[]).map(x=>x.description||x.name||"").filter(Boolean).join("; "),
   objectUrl:row.sourceUrl,metadataUrl,imageUrl:meta.images.print.url,
   rights:"CC0",rightsStatusFromMuseumAPI:meta.share_license_status,
   rightsUrl:"https://www.clevelandart.org/open-access",
   metadataAgreement:metadataAgreement(row,meta.title,(meta.creators||[]).map(x=>x.description||x.name||"").join("; "))}};
}
async function commonsSource(row){
 const raw=decodeURIComponent(new URL(row.sourceUrl).pathname.replace(/^\/wiki\//,"")).replaceAll("_"," ");
 assert(raw.startsWith("File:")&&!raw.includes("#"),"Invalid exact Commons title");
 const q=new URL("https://commons.wikimedia.org/w/api.php");
 for(const [k,v] of Object.entries({action:"query",format:"json",formatversion:"2",prop:"imageinfo",titles:raw,iiprop:"url|size|sha1|mime|extmetadata"}))q.searchParams.set(k,v);
 const page=(await (await request(q.toString())).json())?.query?.pages?.[0];
 assert(page&&!page.missing&&tidy(titleKey(page.title))===tidy(titleKey(raw)),"Commons file mismatch");
 if(row.verifiedMuseumAccession)assert(page.title.includes(row.verifiedMuseumAccession),"Source filename does not identify exact museum accession");
 if(row.verifiedStationRoman){
   const stationPage="Chiesa di San Polo (Venice) - VIA CRUCIS "+row.verifiedStationRoman+" - ";
   assert(page.title.startsWith("File:"+stationPage),"Incorrect San Polo Station or medium; exact painting file required");
   assert(!/etching|engraving|Fortuny|after Tiepolo/i.test(page.title),"San Polo original painting cannot be replaced with print or etching");
 }
 const info=page.imageinfo?.[0];
 if(commonsMetadataHasPradoProvenance(info?.extmetadata))throw Error("HOLD_PRADO_SOURCE_POLICY: Commons metadata identifies Prado provenance");
 assert(info&&["image/jpeg","image/png"].includes(info.mime),"Unsupported Commons format");
 const lic=untag(info.extmetadata?.LicenseShortName?.value);
 const licurl=untag(info.extmetadata?.LicenseUrl?.value);
 const copyrighted=untag(info.extmetadata?.Copyrighted?.value);
 assert(commonsLicenseUsable(lic,copyrighted),"Commons has no acceptable file rights declaration: "+lic);
 assert(typeof info.url==="string"&&new URL(info.url).hostname==="upload.wikimedia.org","Commons exact original missing");
 const r=await request(info.url,"image");
 assert((r.headers.get("content-type")||"").toLowerCase().includes(info.mime),"MIME mismatch");
 const bytes=Buffer.from(await r.arrayBuffer());
 if(info.sha1)assert.equal(createHash("sha1").update(bytes).digest("hex"),info.sha1,"Commons fingerprint mismatch");
 return {bytes,mime:info.mime,source:{provider:"WIKIMEDIA_COMMONS",exactFile:page.title,
    filePage:row.sourceUrl,apiUrl:q.toString(),imageUrl:info.url,licenseName:lic,licenseUrl:licurl,
    creator:untag(info.extmetadata?.Artist?.value),attribution:untag(info.extmetadata?.Attribution?.value),copyrightedFlag:copyrighted,
    usageTerms:untag(info.extmetadata?.UsageTerms?.value),attributionRequired:untag(info.extmetadata?.AttributionRequired?.value),
    licenseStillRequiresLegalCheck:true}};
}
export async function runBatch(index){
 assert(Number.isInteger(index)&&index>=0&&index<makeBatches().length,"Batch index outside catalogue");
 assert.equal(INTAKE.works.length,451);
 assert.deepEqual(RELEASED.media,[],"Never acquire on a branch with an unexpected live release table");
 const rows=makeBatches()[index],folder=join(process.cwd(),"artifacts","sacred-art-bulk","batch-"+String(index+1).padStart(2,"0"));
 await mkdir(folder,{recursive:true});
 const results=[];
 for(const row of rows){
   const gate=sourceGate(row);
   const evidence={artworkId:row.id,reviewGate:row.reviewGate,sourceGate:gate,provider:row.provider,
     catalogTitle:row.title,catalogArtist:row.artist,originalSourcePage:row.sourceUrl,
     curatorAuthority:row.reviewGate==="LEGACY_FIVE_PRESERVED"?"W64_PREVIOUS_FIVE_RETAINED":"OCT17_CURRENT_APPROVAL",
     reviewSourceImageKey:row.preferredImageKey,sourceClaimsAreNotRightsEvidence:true,
     sourcePolicy:row.sourcePolicy??null,
     imageStaged:false,productionCertified:false,calendarPublished:false,cropReviewed:false,phoneQaApproved:false};
   if(!["MET","COMMONS","CLEVELAND"].includes(gate)){results.push({...evidence,status:gate});continue;}
   try{
     const img=gate==="MET"?await metSource(row):gate==="CLEVELAND"?await clevelandSource(row):await commonsSource(row);
     assert(img.bytes.length>=70000&&img.bytes.length<=35000000,"Original file outside permitted size");
     const dimensions=parseImageDimensions(img.bytes,img.mime);
     assert(dimensions.width>=1000&&dimensions.height>=700,"Image below minimum source resolution");
     const hash=sha256(img.bytes),wanted=row.preferredImageKey?.split("|")?.[2];
     const match=!!wanted&&/^[0-9a-f]{64}$/i.test(wanted)&&wanted.toLowerCase()===hash;
     const filename=sha256(Buffer.from(row.id)).slice(0,16)+"-"+hash.slice(0,12)+(img.mime==="image/png"?".png":".jpg");
     await writeFile(join(folder,filename),img.bytes);
     const item={...evidence,status:"STAGED_SOURCE_QA_REQUIRED",imageStaged:true,
       sourceMetadata:img.source,technical:{filename,sha256:hash,bytes:img.bytes.length,mime:img.mime,...dimensions},
       matchesPreferredReviewBytes:match,preferredReviewHashKnown:!!wanted,
       exactPhotoReviewed:match,physicalOriginalIndependentlyCertified:false,
       legalReuseIndependentlyCertified:false};
     await writeFile(join(folder,filename+".json"),JSON.stringify(item,null,2)+"\n");
     results.push(item);
   }catch(e){const reason=String(e.message||e);results.push({...evidence,status:reason.includes(PRADO_SOURCE_HOLD)?PRADO_SOURCE_HOLD:"HOLD_SOURCE_CHECK",reason:reason.slice(0,350)});}
   await wait(350);
 }
 const staged=results.filter(x=>x.imageStaged).length,held=results.length-staged;
 const summary={schema:"AO_SACRED_ART_BULK_ACQUISITION_RESULT_V1",batch:index+1,range:[index*BATCH_SIZE,Math.min((index+1)*BATCH_SIZE,INTAKE.works.length)-1],
    evaluated:results.length,stagedForQA:staged,held,approvedSourceEligible:results.filter(x=>["MET","COMMONS","CLEVELAND"].includes(x.sourceGate)).length,
    released:0,reviewRequired:true,results};
 await writeFile(join(folder,"results.json"),JSON.stringify(summary,null,2)+"\n");
 const thumbs=results.filter(x=>x.imageStaged).map(x=>'<article><img loading="lazy" src="'+escaped(x.technical.filename)+'" alt=""><h2>'+escaped(x.catalogTitle)+'</h2><p>'+escaped(x.catalogArtist)+' · '+escaped(x.artworkId)+'</p><small>'+escaped(x.technical.width+"×"+x.technical.height)+' · '+escaped(x.status)+'</small></article>').join("");
 await writeFile(join(folder,"review.html"),'<!doctype html><html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Ad Orientem · Batch '+(index+1)+'</title><style>body{background:#080c12;color:#e3ddce;font:16px Georgia,serif;margin:20px}header{max-width:1100px;margin:auto}main{max-width:1250px;margin:auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:28px}article{min-width:0}img{width:100%;height:360px;object-fit:contain;background:#16191d}h2{font-size:1.05rem}p,small{color:#b9b0a0}small{font-size:12px}</style><header><p>AD ORIENTEM · TECHNICAL REVIEW · NOT RELEASED</p><h1>Batch '+(index+1)+'</h1><p>'+staged+' staged for independent QA · '+held+' held. Review original source, full frame, artist, crop and permissions separately.</p></header><main>'+thumbs+'</main></html>');
 console.log(JSON.stringify({batch:index+1,examined:results.length,stagedForQA:staged,held,certified:0}));
 return summary;
}
if(process.argv[1]&&/acquire-sacred-art-bulk\.mjs$/.test(process.argv[1])){
 const batchArg=Number(process.argv[2]);
 await runBatch(batchArg);
}
