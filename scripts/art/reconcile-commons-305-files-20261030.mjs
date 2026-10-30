/**
 * Ad Orientem Sacred Art — Commons accepted-unlinked 305 source-file audit.
 * Authoritative read-only MediaWiki Action API by exact numeric Commons page ID.
 * Never downloads image bytes or approves rights, media quality, or new painting
 * identities; preserves 2455 frozen editorial choices and locked canonical 383.
 * One batch of 20 file pages per query, to avoid costly extmetadata overload.
 */
import {readFileSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
const input="data/calendar/sacred-art-accepted-856-to-canonical-383-20261029.v1.json";
const output="data/calendar/sacred-art-phase1-commons-305-official-file-audit-20261030.v1.json";
const crosswalk=JSON.parse(readFileSync(input,"utf8"));
const source=crosswalk.records.filter(r=>r.sourceId.startsWith("commons:")&&r.canonical383.status==="NO_CONFIRMED_IDENTITY")
 .sort((a,b)=>Number(a.sourceId.split(":")[1])-Number(b.sourceId.split(":")[1]));
if(source.length!==305||new Set(source.map(r=>r.sourceId)).size!==305||
 source.filter(r=>r.review.decision==="IMPORT_WITH_CORRECTIONS").length!==6)
 throw Error("Commons 305 unlinked accepted/source scope unexpected");
const hash=s=>createHash("sha256").update(s).digest("hex");
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const api="https://commons.wikimedia.org/w/api.php";
const getOriginalFileTitle=s=>{
 try {
  const u=new URL(s);
  if(u.hostname!=="commons.wikimedia.org"||!u.pathname.startsWith("/wiki/File:"))return null;
  return decodeURIComponent(u.pathname.slice(6)).replaceAll("_"," ").normalize("NFC");
 } catch {return null;}
};
const standardTitle=s=>String(s||"").normalize("NFC").replaceAll("_"," ").trim();
const metadataKeys=["LicenseShortName","LicenseUrl","UsageTerms","Copyrighted","Artist","Credit","ObjectName","ImageDescription","AttributionRequired","Restrictions"];
const compactExt=o=>Object.fromEntries(metadataKeys.filter(k=>o?.[k]).map(k=>[k,{
 value:String(o[k]?.value??"").slice(0,k==="ImageDescription"?450:550),
 source:String(o[k]?.source??"").slice(0,100),hidden:!!o[k]?.hidden
}]));
const normalizedLicense=x=>String(x?.LicenseShortName?.value??x?.UsageTerms?.value??"")
 .replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim().slice(0,180);
const result=new Map();
const requestAudit=[];
async function callPageIDs(chunk,batchNumber){
 const ids=chunk.map(r=>r.sourceId.split(":")[1]);
 const u=new URL(api);
 Object.entries({
  action:"query",format:"json",formatversion:"2",
  prop:"imageinfo|pageprops",pageids:ids.join("|"),
  iiprop:"sha1|size|mime|mediatype|timestamp|url|extmetadata",
  iiextmetadatalanguage:"en",iiextmetadatafilter:metadataKeys.join("|"),
  iilimit:"1",maxlag:"5"
 }).forEach(([k,v])=>u.searchParams.set(k,v));
 let lastError="NOT_ATTEMPTED";
 for(let attempt=1;attempt<=4;attempt++){
  try{
   const res=await fetch(u,{signal:AbortSignal.timeout(38000),headers:{
    "Accept":"application/json","User-Agent":"AdOrientemSacredArtResearch/0.1 (https://github.com/Fulcanelli13/ad-orientem; read-only public media metadata)"}});
   if(!res.ok){lastError="HTTP_"+res.status;
    if([429,500,502,503,504].includes(res.status)){await sleep(1400*attempt);continue;}
    break;
   }
   const raw=await res.text(); const body=JSON.parse(raw);
   if(body.error){lastError="MEDIAWIKI_"+(body.error.code??"ERROR")+"_"+String(body.error.info??"").slice(0,100);
    if(body.error.code==="maxlag"){await sleep(1800*attempt);continue;}break;
   }
   if(!Array.isArray(body.query?.pages)){lastError="INVALID_QUERY_PAGES";break;}
   const got=new Map(body.query.pages.map(x=>[String(x.pageid),x]));
   const unanticipated=body.query.pages.filter(x=>!ids.includes(String(x.pageid))&&!x.missing);
   requestAudit.push({batch:batchNumber,requested:ids.length,received:body.query.pages.length,
    unknownReturned:unanticipated.map(x=>x.pageid),sha256:hash(raw),status:res.status,attempt});
   for(const original of chunk){
    const pageid=original.sourceId.split(":")[1],page=got.get(pageid);
    const base={
     sourceId:original.sourceId,originalDecision:original.review.decision,
     originalBatch:original.batch,originalReviewedTitle:original.review.title,
     originalArtist:original.review.artistAsPresented,
     originalSourceUrl:original.review.originalSourceUrl,
     originalCommonsTitle:getOriginalFileTitle(original.review.originalSourceUrl),
     originalCanonical383IdentityStatus:original.canonical383.status,
     originalCanonical383ArtworkId:original.canonical383.artworkId,
     originalUserReviewCorrections:original.review.corrections
    };
    if(!page){result.set(original.sourceId,{...base,status:"OFFICIAL_PAGEID_NOT_RETURNED",official:null,
      flags:["NO_AUTHORITATIVE_PAGE_PROOF"],uniquePhysicalWorkCertified:false,photographQualityCertified:false,
      imageRightsCertified:false,canonical383LinkNew:false,productionMutation:false});continue;}
    const ii=Array.isArray(page.imageinfo)?page.imageinfo[0]:null;
    const urlTitle=base.originalCommonsTitle;
    const currentTitle=standardTitle(page.title);
    const sourceTitleExact=urlTitle!==null&&standardTitle(urlTitle)===currentTitle;
    const pageIDExact=page.pageid===Number(pageid);
    const hasImage=!!ii?.sha1&&!!ii?.mime&&typeof ii.width==="number"&&typeof ii.height==="number";
    const official={
      pageId:page.pageid,namespace:page.ns,filePageTitle:page.title,
      filePageUrl:"https://commons.wikimedia.org/wiki/"+encodeURIComponent(page.title).replace(/%3A/ig,":"),
      pageProperties:{
       wikibaseItem:page.pageprops?.wikibase_item??null,
       imageDescription:page.pageprops?.description??null
      },
      fileCurrent:ii?{
       sha1:ii.sha1??null,mime:ii.mime??null,mediaType:ii.mediatype??null,
       width:ii.width??null,height:ii.height??null,bytes:ii.size??null,
       lastUploadTimestamp:ii.timestamp??null,
       canonicalTitle:ii.canonicaltitle??null,
       originalMediaUrl:ii.url??null,descriptionUrl:ii.descriptionurl??null,
       extmetadata:compactExt(ii.extmetadata??{})
      }:null
    };
    const status=pageIDExact&&page.ns===6&&hasImage?
      "COMMONS_FILE_PAGEID_AND_ORIGINAL_MEDIA_METADATA_VERIFIED":
      page.missing?"COMMONS_PAGE_DELETED_OR_MISSING":
      pageIDExact&&page.ns===6?"COMMONS_FILE_PAGE_EXISTS_IMAGEINFO_MISSING":
      "COMMONS_SOURCE_PAGE_REQUIRES_REVIEW";
    const meta=ii?.extmetadata??{};
    const copyright=String(meta.Copyrighted?.value??"");
    const license=normalizedLicense(meta);
    const flags=[
     ...(!pageIDExact?["SOURCE_PAGEID_MISMATCH"]:[]),
     ...(page.ns!==6?["NOT_A_COMMONS_FILE_PAGE"]:[]),
     ...(!sourceTitleExact?["FILE_RENAMED_OR_ORIGINAL_SOURCE_URL_CHANGED"]:[]),
     ...(!hasImage?["NO_CURRENT_FILE_SHA1_AND_IMAGE_DIMENSIONS"]:[]),
     ...(!license?["NO_MACHINE_READABLE_LICENSE_NAME"]:[]),
     ...(!meta.Artist?.value?["MISSING_FILE_ARTIST_METADATA"]:[]),
     ...(!meta.Credit?.value?["MISSING_FILE_CREDIT_METADATA"]:[]),
     ...(copyright==="True"?["COPYRIGHTED_FLAG_TRUE_REVIEW"]:[])
    ];
    result.set(original.sourceId,{...base,status,
     evidence:{pageIdExact,originalSourceFilenameMatchesCurrentTitle:sourceTitleExact,
      originalFileTitleFromUrl:urlTitle,currentCommonsFileTitle:page.title,
      originalSourceUrlResolvesToCurrentSamePageNotTested:true,
      licenseLabel:license,copyrightFlag:copyright||null},
     official,flags,
     exactCommonsFilePageIdentityCertified:status==="COMMONS_FILE_PAGEID_AND_ORIGINAL_MEDIA_METADATA_VERIFIED",
     uniquePhysicalWorkCertified:false,photographQualityCertified:false,
     imageRightsCertified:false,canonical383LinkNew:false,productionMutation:false});
   }
   return;
  }catch(e){lastError=String(e).slice(0,190);await sleep(1000*attempt);}
 }
 requestAudit.push({batch:batchNumber,requested:ids.length,status:"QUERY_FAILED",error:lastError});
 for(const original of chunk){
  result.set(original.sourceId,{sourceId:original.sourceId,originalDecision:original.review.decision,
   originalBatch:original.batch,originalReviewedTitle:original.review.title,
   originalArtist:original.review.artistAsPresented,originalSourceUrl:original.review.originalSourceUrl,
   originalCommonsTitle:getOriginalFileTitle(original.review.originalSourceUrl),
   originalCanonical383IdentityStatus:original.canonical383.status,
   originalCanonical383ArtworkId:original.canonical383.artworkId,
   originalUserReviewCorrections:original.review.corrections,
   status:"COMMONS_API_REQUEST_FAILED",error:lastError,official:null,flags:["OFFICIAL_FILE_IDENTITY_UNRESOLVED"],
   exactCommonsFilePageIdentityCertified:false,uniquePhysicalWorkCertified:false,
   photographQualityCertified:false,imageRightsCertified:false,canonical383LinkNew:false,productionMutation:false});
 }
}
const BATCH=15;
for(let i=0;i<source.length;i+=BATCH){
 await callPageIDs(source.slice(i,i+BATCH),Math.floor(i/BATCH)+1);
 console.log("Commons source file identities checked",Math.min(i+BATCH,source.length),"/305",
  "verified",[...result.values()].filter(r=>r.exactCommonsFilePageIdentityCertified).length);
 await sleep(500);
}
const rows=source.map(s=>result.get(s.sourceId));
if(rows.some(x=>!x)||rows.length!==305)throw Error("Commons 305 missing results");
const fingerprintBuckets=new Map();
for(const r of rows){
 const sha1=r.official?.fileCurrent?.sha1;
 if(sha1)fingerprintBuckets.set(sha1,[...(fingerprintBuckets.get(sha1)??[]),r.sourceId]);
}
const exactDuplicateSha1Groups=[...fingerprintBuckets.entries()].filter(([h,ids])=>ids.length>1)
 .map(([sha1,sourceIds])=>({sha1,sourceIds,interpretation:"EXACT_COMMONS_FILE_BYTES_DUPLICATE_NOT_PROOF_SAME_ARTWORK",physicalWorkIdentityNotPromoted:true}));
const counts={
 acceptedUnlinkedCommonsSourceCards:305,
 frozenImports:rows.filter(r=>r.originalDecision==="IMPORT").length,
 frozenImportsWithCorrections:rows.filter(r=>r.originalDecision==="IMPORT_WITH_CORRECTIONS").length,
 officialCurrentFilePageAndMediaVerified:rows.filter(r=>r.exactCommonsFilePageIdentityCertified).length,
 deletedOrMissingFilePages:rows.filter(r=>r.status==="COMMONS_PAGE_DELETED_OR_MISSING").length,
 officialPageHasNoCurrentFile:rows.filter(r=>r.status==="COMMONS_FILE_PAGE_EXISTS_IMAGEINFO_MISSING").length,
 officialApiRequestUnresolved:rows.filter(r=>r.status==="COMMONS_API_REQUEST_FAILED").length,
 otherUnresolved:rows.filter(r=>!r.exactCommonsFilePageIdentityCertified&&
   !["COMMONS_PAGE_DELETED_OR_MISSING","COMMONS_FILE_PAGE_EXISTS_IMAGEINFO_MISSING","COMMONS_API_REQUEST_FAILED"].includes(r.status)).length,
 originalSourceFilenameEqualsOfficialCurrentName:rows.filter(r=>r.evidence?.originalSourceFilenameMatchesCurrentTitle).length,
 potentialRenamedOrChangedSourceFilename:rows.filter(r=>r.flags.includes("FILE_RENAMED_OR_ORIGINAL_SOURCE_URL_CHANGED")).length,
 currentCommonsMediaSha1Available:rows.filter(r=>!!r.official?.fileCurrent?.sha1).length,
 uniqueCurrentMediaSha1:fingerprintBuckets.size,
 exactMediaByteDuplicatesInside305:exactDuplicateSha1Groups.length,
 wikibaseObjectLinksOnFilePages:rows.filter(r=>!!r.official?.pageProperties?.wikibaseItem).length,
 copyrightFlaggedTrue:rows.filter(r=>r.flags.includes("COPYRIGHTED_FLAG_TRUE_REVIEW")).length,
 noMachineLicenseName:rows.filter(r=>r.flags.includes("NO_MACHINE_READABLE_LICENSE_NAME")).length,
 noArtistField:rows.filter(r=>r.flags.includes("MISSING_FILE_ARTIST_METADATA")).length,
 noCreditField:rows.filter(r=>r.flags.includes("MISSING_FILE_CREDIT_METADATA")).length,
 originalFilesVisuallyInspected:0,physicalWorkIdentityCertifiedNew:0,
 canonical383LinkedNew:0,photoRightsClearedForApp:0,productionImports:0
};
if(counts.frozenImports!==299||counts.frozenImportsWithCorrections!==6||
  counts.officialCurrentFilePageAndMediaVerified+counts.deletedOrMissingFilePages+
  counts.officialPageHasNoCurrentFile+counts.officialApiRequestUnresolved+counts.otherUnresolved!==305)
 throw Error("Commons accepted-source or status counts invalid "+JSON.stringify(counts));
const report={schema:"AO_SACRED_ART_COMMONS_305_OFFICIAL_FILE_PAGE_AUDIT_V1",
 generatedAt:new Date().toISOString(),sourceCrosswalk:input,
 sourceCrosswalkSha256:hash(readFileSync(input)),apiEndpoint:api,
 method:"Batch MediaWiki Action API query by frozen Commons numeric file-page ID. File SHA1/dimensions/license metadata collected without reading image bytes. Artwork physical identity still separate.",
 requestEvidence:requestAudit,counts,exactFileSha1DuplicateGroups:exactDuplicateSha1Groups,
 caveats:[
 "Commons MediaWiki page ID and current media SHA1 establish source file identity only, not authorship, underlying physical painting or sameness with a canonical 383 artwork",
 "Copyrighted/LicenseShortName/UsageTerms metadata are community-edited source assertions and not complete legal rights clearance; no automatic photo approval",
 "Physical work identity is not inferred from identical titles, filenames, artist fields, category metadata or even duplicate image bytes",
 "Dimensions, SHA1 and metadata do not verify picture content, frame-free artwork, crop, colour fidelity, originality or technical quality",
 "File page moves may leave the frozen original Commons URL outdated even where the numeric file page remains valid"
 ],
 release:{frozenUserDecisionsUnmodified:true,canonical383Protected:true,
  sourcePhotoRightsApproved:false,sourcePhotosVisuallyApproved:false,
  uniqueNewPhysicalPaintingsPromoted:false,productionMutation:false},rows
};
writeFileSync(output,JSON.stringify(report,null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify({output,counts},null,2));
