#!/usr/bin/env node
/**
 * Verify ALL currently discovered Commons file-page metadata in 25-file
 * API requests. Read-only, review-only; NEVER declares an original
 * authenticated or a photographic reproduction licensed for publication.
 *
 * node tools/calendar/verify-sacred-art-117-commons-metadata.mjs
 */
import assert from "node:assert/strict";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {join} from "node:path";
const sourceFile=process.argv[2]||"artifacts/qa-discovery-merged/discovery-117-screened.json";
const outDir=process.argv[3]||"artifacts/qa-discovery-merged";
const URI="https://commons.wikimedia.org/w/api.php";
const sleep=n=>new Promise(resolve=>setTimeout(resolve,n));
const plain=s=>String(s??"").replace(/<[^>]*>/g," ").replace(/&(?:nbsp|amp|quot|lt|gt);/g," ").replace(/\s+/g," ").trim();
const normalize=s=>String(s??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const PRADO=/(museodelprado|(?:^|[^a-z])prado(?:[^a-z]|$))/i;
const BAD_MEDIA=/\b(?:engraving|etching|lithograph|woodcut|aquatint|facsimile|print after|photocopy|reproduction after|copy of)\b/i;
const required=["LicenseShortName","LicenseUrl","Copyrighted","Credit","Artist","ImageDescription",
  "Source","Attribution","ObjectName","UsageTerms","AttributionRequired","Permission","Categories"];
export function classifyEvidence(file,apiPage){
 const results={status:"HOLD_FILE_NOT_RETURNED",issues:[],liveFileUrl:null,
  actualFileSha1:null,liveLicense:null,licensedForApp:false,
  photoRightsIndependentlyVerified:false,originalPhysicalIdentityVerified:false,
  sourceVisualMatchToCurator:false,productionEligible:false,
  metadataSourceText:null,metadataArtistText:null,metadataObjectText:null};
 if(!apiPage||apiPage.missing||!apiPage.imageinfo?.[0])return results;
 const info=apiPage.imageinfo[0], ext=info.extmetadata||{};
 const m=Object.fromEntries(required.map(k=>[k,plain(ext[k]?.value)]));
 const combined=Object.values(m).join(" ")+" "+String(apiPage.title||"");
 const prado=PRADO.test(combined)||PRADO.test(file.commonsTitle)||PRADO.test(file.filePage);
 const mediaMismatch=BAD_MEDIA.test(combined);
 const shaMatch=!file.provenanceSha1||file.provenanceSha1.toLowerCase()===String(info.sha1||"").toLowerCase();
 const fileMatch=normalize(file.commonsTitle)===normalize(apiPage.title);
 const license=m.LicenseShortName.toLowerCase();
 const claim=String(file.licenseClaim||"").toLowerCase();
 const licenseMatch=!claim||claim===license;
 const permitted=/^(?:cc0(?:\s*1\.0)?|public domain|pd|cc by(?:-sa)?\s+[234]\.0)$/.test(license);
 const metadataURL=String(info.url||"");
 const imgHostOK=(()=>{try{return new URL(metadataURL).hostname==="upload.wikimedia.org"}catch{return false}})();
 const sufficientImage=Number(info.width)>=700&&Number(info.height)>=700&&
  Math.max(info.width,info.height)>=1200;
 const mimeOK=["image/jpeg","image/png"].includes(info.mime);
 if(!fileMatch)results.issues.push("COMMONS_TITLE_DISAGREEMENT");
 if(!shaMatch)results.issues.push("COMMONS_SHA1_CHANGED_FROM_DISCOVERY");
 if(!licenseMatch)results.issues.push("LICENSE_CHANGED_FROM_DISCOVERY");
 if(!permitted)results.issues.push("FILE_LICENSE_NOT_IN_ALLOWED_METADATA_LIST");
 if(prado)results.issues.push("PRADO_PROVENANCE_EMBARGO");
 if(mediaMismatch)results.issues.push("PRINT_COPY_OR_DIFFERENT_MEDIUM_HOLD");
 if(!imgHostOK||!mimeOK)results.issues.push("WRONG_IMAGE_HOST_OR_MIME");
 if(!sufficientImage)results.issues.push("SOURCE_RESOLUTION_TOO_SMALL");
 // Do not treat museum ownership or work age as permission to use THIS photo.
 results.status=results.issues.length?"HOLD_METADATA_EXCEPTION":"METADATA_COHERENT_ONLY";
 results.liveFileUrl=metadataURL;results.actualFileSha1=info.sha1||null;
 results.liveLicense=m.LicenseShortName;results.declaredRightsURL=m.LicenseUrl||null;
 results.licensedForApp=false;results.photoRightsIndependentlyVerified=false;
 results.originalPhysicalIdentityVerified=false;
 results.sourceVisualMatchToCurator=false;results.productionEligible=false;
 results.metadataSourceText=m.Source||null;
 results.metadataArtistText=m.Artist||null;
 results.metadataObjectText=m.ObjectName||m.ImageDescription||null;
 results.attributionText=m.Attribution||m.Credit||null;
 results.liveSize={width:info.width,height:info.height,mime:info.mime};
 return results;
}
export function countBatch(reviewRows){
 const tally={};
 for(const x of reviewRows)tally[x.evidence.status]=(tally[x.evidence.status]||0)+1;
 return tally;
}
async function fetchMetadataBatch(titles){
 const url=new URL(URI);
 for(const [k,v] of Object.entries({action:"query",format:"json",formatversion:"2",
  prop:"imageinfo",titles:titles.join("|"),iiprop:"url|size|sha1|mime|extmetadata",iiurlwidth:"360",maxlag:"5"}))
  url.searchParams.set(k,v);
 for(let attempt=0;attempt<4;attempt++){
  try{
   const response=await fetch(url,{redirect:"error",signal:AbortSignal.timeout(35000),
    headers:{"user-agent":"AdOrientemArtResearch/1.0 (https://github.com/Fulcanelli13/ad-orientem)"}});
   if([429,500,502,503,504].includes(response.status)){
    await sleep(1000*(attempt+1));continue;
   }
   if(!response.ok)throw Error("Commons HTTP "+response.status);
   const payload=await response.json();
   if(payload.error?.code==="maxlag"){await sleep(1000*(attempt+1));continue;}
   if(payload.error)throw Error("Commons API "+payload.error.code);
   return {pages:payload.query?.pages||[],error:null};
  }catch(e){
   if(attempt===3)return {pages:[],error:String(e.message||e).slice(0,150)};
   await sleep(1200*(attempt+1));
  }
 }
 return {pages:[],error:"Commons API retry budget exhausted"};
}
export async function runMetadata(){
 const discovery=JSON.parse(readFileSync(sourceFile,"utf8"));
 assert(discovery.schema==="AO_SACRED_ART_76_DISCOVERY_CANDIDATE_SCREEN_V1");
 assert(discovery.counts.approvedPhotos===0&&discovery.counts.publishedPhotos===0);
 const flat=discovery.records.flatMap(w=>w.candidates.map(c=>({artworkId:w.artworkId,
  title:w.approvedArtTitle,artist:w.approvedArtist,candidate:c})));
 assert.equal(flat.length,discovery.counts.fileCandidates);
 const unique=new Map();
 for(const x of flat){
  const c=x.candidate;
  assert(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/i.test(c.filePage));
  if(!unique.has(c.commonsTitle))unique.set(c.commonsTitle,c);
 }
 const names=[...unique.keys()];
 const groups=Array.from({length:Math.ceil(names.length/25)},(_,i)=>names.slice(i*25,(i+1)*25));
 const lookup=new Map(),apiErrors=[];
 for(const [i,group] of groups.entries()){
  const response=await fetchMetadataBatch(group);
  if(response.error)apiErrors.push({batch:i+1,count:group.length,error:response.error});
  for(const page of response.pages){
   if(page?.title)lookup.set(normalize(page.title),page);
  }
  await sleep(300);
 }
 const checks=flat.map(row=>{
  const c=row.candidate;
  const evidence=classifyEvidence(c,lookup.get(normalize(c.commonsTitle)));
  return {artworkId:row.artworkId,title:row.title,artist:row.artist,
   candidateFilePage:c.filePage,candidateFileTitle:c.commonsTitle,
   initialCandidateLane:c.reviewLane,initialCandidateScore:c.documentScore,
   sourceEvidence:{sha1:c.provenanceSha1||null,metadataLicenseClaim:c.licenseClaim},
   evidence};
 });
 const counts={catalogueCandidates:checks.length,distinctFiles:unique.size,
  batchesAttempted:groups.length,apiErrorBatches:apiErrors.length,
  statuses:countBatch(checks),possibleObjectIdentityReviews:checks.filter(x=>x.evidence.status==="METADATA_COHERENT_ONLY").length,
  photographicallyCertified:0,published:0};
 const result={schema:"AO_SACRED_ART_COMMONS_117_LIVE_METADATA_CHECK_V1",asOf:"2026-10-20",
  currentCIData:true,counts,apiErrors,
  policy:{noAutoPhotoApproval:true,noArtRatingChange:true,
   coherentMetadataIsNotExactOriginal:true,licensedForAppRequiresIndependentEvidence:true,
   noPradoOrMirrors:true,noImagesAcquired:true,noCommercialRightsInferred:true},
  records:checks};
 assert(checks.every(x=>x.evidence.productionEligible===false&&
  x.evidence.originalPhysicalIdentityVerified===false));
 mkdirSync(outDir,{recursive:true});
 writeFileSync(join(outDir,"discovery-117-live-commons-evidence.json"),JSON.stringify(result,null,2)+"\n");
 const csvval=v=>'"'+String(v??"").replace(/"/g,'""')+'"';
 const cols=["artworkId","title","artist","candidateFilePage","status","issues","actualFileSha1",
   "liveLicense","declaredRightsURL","metadataArtistText","metadataSourceText","metadataObjectText"];
 const table=[cols.join(",")];
 for(const x of checks)table.push([
  x.artworkId,x.title,x.artist,x.candidateFilePage,x.evidence.status,
  x.evidence.issues.join(";"),x.evidence.actualFileSha1,
  x.evidence.liveLicense,x.evidence.declaredRightsURL,
  x.evidence.metadataArtistText,x.evidence.metadataSourceText,
  x.evidence.metadataObjectText].map(csvval).join(","));
 writeFileSync(join(outDir,"discovery-117-live-commons-evidence.csv"),table.join("\n")+"\n");
 console.log(JSON.stringify(counts));
 return result;
}
if(process.argv[1]?.endsWith("verify-sacred-art-117-commons-metadata.mjs"))await runMetadata();
