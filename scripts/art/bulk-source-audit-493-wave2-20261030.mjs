/**
 * Second-wave bulk source check: all 142 CC0-policy image/version holds,
 * and all 351 original Commons File pages in rights/alternatives queue.
 * No approved painting/photo changes; no photo-quality certification.
 */
import {readFileSync,writeFileSync} from "node:fs";
const B="data/calendar/sacred-art-master-v1/";
const parseCsv=(text)=>{
 const rows=[];let cols=[],value="",quoted=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(c==='"'){if(quoted&&text[i+1]==='"'){value+='"';i++;}else quoted=!quoted;}
  else if(c===","&&!quoted){cols.push(value);value="";}
  else if((c==="\r"||c==="\n")&&!quoted){
   if(c==="\r"&&text[i+1]==="\n")i++;
   cols.push(value);if(cols.some(Boolean))rows.push(cols);
   cols=[];value="";
  }else value+=c;
 }
 const headers=rows.shift();
 return rows.map(r=>Object.fromEntries(headers.map((h,i)=>[h.replace(/^\uFEFF/,""),r[i]||""])));
};
const photo=parseCsv(readFileSync(B+"queue-photo-qa-or-repair.csv","utf8"));
const rights=parseCsv(readFileSync(B+"queue-rights-or-alternative.csv","utf8"));
const initial=parseCsv(readFileSync(B+"first-pristine-photo-review.csv","utf8"));
if(photo.length!==217||rights.length!==772||initial.length!==73)
 throw Error("Expected initial queue baseline 217/772/73");
const initialSet=new Set(initial.map(x=>x.physical_work_group));
const official=photo.filter(x=>x.rights_category==="OPEN_ACCESS_EXACT_PHOTO_RECHECK");
const commons=rights.filter(x=>/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/i.test(x.source_url));
if(official.length!==142||commons.length!==351)
 throw Error("Expected 142 official and 351 Commons sources, got "+official.length+"/"+commons.length);
if([...official,...commons].some(x=>initialSet.has(x.physical_work_group)))
 throw Error("No prior human-review group may appear in second-wave audit");
const delay=t=>new Promise(r=>setTimeout(r,t));
const norm=s=>String(s||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
 .replace(/[^a-z0-9]+/gi," ").toLowerCase().trim();
const sanitize=s=>String(s||"").replace(/<[^>]+>/g," ").replace(/&amp;/g,"&")
 .replace(/&quot;/g,'"').replace(/\s+/g," ").trim().slice(0,1500);
async function fetchJson(url){
 let error=null;for(let i=0;i<3;i++){
  try{
   const response=await fetch(url,{signal:AbortSignal.timeout(25000),
    headers:{"User-Agent":"AdOrientemSacredArtAudit/20261030 (https://github.com/Fulcanelli13/ad-orientem)","Accept":"application/json"}});
   if(!response.ok){error="HTTP_"+response.status;
    if([429,500,502,503,504].includes(response.status)){await delay(750*(i+1));continue}
    return {ok:false,error,status:response.status};}
   return {ok:true,data:await response.json(),status:response.status};
  }catch(e){error=String(e).slice(0,180);await delay(400*(i+1))}
 }
 return {ok:false,error,status:null};
}
async function pool(rows,fn,concurrency){
 let i=0;await Promise.all(Array.from({length:Math.min(rows.length,concurrency)},async()=>{
  while(i<rows.length)await fn(rows[i++]);
 }));
}
const officialResults=[];
await pool(official,async r=>{
 const isMet=r.canon_artwork_id.startsWith("met-")||r.physical_work_group.startsWith("CANONICAL::met-");
 const isCma=r.canon_artwork_id.startsWith("cma-")||r.physical_work_group.startsWith("CANONICAL::cma-");
 let lane=isMet?"MET":isCma?"CLEVELAND":"UNKNOWN";
 const id=String((r.canon_artwork_id||r.physical_work_group.split("::").pop()).split("-").pop());
 const api=lane==="MET"?"https://collectionapi.metmuseum.org/public/collection/v1/objects/"+id:
 lane==="CLEVELAND"?"https://openaccess-api.clevelandart.org/api/artworks/"+id:"";
 const result=api?await fetchJson(api):{ok:false,error:"NO_CANONICAL_PROVIDER_ID"};
 const d=result.data?.data&&lane==="CLEVELAND"?result.data.data:result.data||{};
 const sameId=(lane==="MET"?Number(d.objectID):Number(d.id))===Number(id);
 const accession=d.accession_number||d.accessionNumber||"";
 const pageId=String(r.source_url||"").split("/").pop();
 const urlMatch=lane==="MET"?Number(pageId)===Number(id):
  norm(pageId)===norm(accession);
 const free=lane==="MET"?d.isPublicDomain===true:
  String(d.share_license_status||"").toUpperCase()==="CC0";
 const original=lane==="MET"?d.primaryImage||"":
  d.images?.print?.url||d.images?.web?.url||"";
 const thumb=lane==="MET"?d.primaryImageSmall||"":
  d.images?.web?.url||"";
 let code=!result.ok?"UNREACHABLE":!sameId?"OFFICIAL_OBJECT_ID_MISMATCH":
 !urlMatch?"ARCHIVED_MUSEUM_URL_MISMATCH":
 !free?"OFFICIAL_RIGHTS_NOT_OPEN":
 !original?"NO_OFFICIAL_ORIGINAL_IMAGE_URL":"OFFICIAL_OPEN_ACCESS_IMAGE_CANDIDATE";
 officialResults.push({group:r.physical_work_group,title:r.title,artist:r.artist,
  originalQueue:"PHOTO_QA_OR_REPAIR",sourceUrl:r.source_url,
  officialApi:api,provider:lane,officialObjectId:sameId?id:null,
  accession:accession||null,originalRightsValue:lane==="MET"?d.isPublicDomain:
   d.share_license_status||null,sourceUrlVerified:urlMatch,
  currentRightsOpen:free,
  officialTitle:d.title||null,officialArtist:d.artistDisplayName||d.creators?.map(x=>x.description).join("; ")||null,
  originalImageUrl:original,previewImageUrl:thumb||original,
  publishedDimensions:lane==="CLEVELAND"?d.images?.print||null:
   d.dimensions||null,
  objectCurrentPrimaryImageMayDifferFromArchivedPhoto:true,
  status:code,error:result.error||null,httpStatus:result.status||null,
  originalPhotoNativeDownloaded:false,pristineReview:false,releaseApproved:false});
},6);
const commonsResults=[];
function commonsTitle(url){let value=url.split("/wiki/").pop().split("?")[0];
 try{value=decodeURIComponent(value)}catch{}
 return value.replaceAll("_"," ");
}
for(let start=0;start<commons.length;start+=25){
 const group=commons.slice(start,start+25);
 const api=new URL("https://commons.wikimedia.org/w/api.php");
 Object.entries({action:"query",format:"json",prop:"imageinfo",
  iiprop:"sha1|size|url|extmetadata",iiurlwidth:"600",redirects:"1",maxlag:"5",
  titles:group.map(x=>commonsTitle(x.source_url)).join("|")}).forEach(
  ([k,v])=>api.searchParams.set(k,v));
 const result=await fetchJson(api.href);
 const pages=Object.values(result.data?.query?.pages||{});
 const mapping=new Map();
 for(const entry of [...(result.data?.query?.normalized||[]),...(result.data?.query?.redirects||[])])
  mapping.set(norm(entry.from),norm(entry.to));
 const follow=s=>{let k=norm(s),visited=new Set();
  while(mapping.has(k)&&!visited.has(k)){visited.add(k);k=mapping.get(k)}return k};
 const pagesByTitle=new Map(pages.map(p=>[norm(p.title),p]));
 for(const r of group){
  const page=pagesByTitle.get(follow(commonsTitle(r.source_url)));
  const info=page?.imageinfo?.[0]||null;
  const meta=info?.extmetadata||{};
  const val=k=>sanitize(meta[k]?.value||"");
  const license=val("LicenseShortName"),licenseUrl=val("LicenseUrl"),
    copyrighted=val("Copyrighted"),restrictions=val("Restrictions");
  const name=license.toLowerCase(),url=licenseUrl.toLowerCase();
  const pd=/public domain|pd-art|pd-old|pd-mark|pd us/.test(name)||
   name==="cc0"||url.includes("/publicdomain/zero/");
  const commercialNo=/\b(?:non.?commercial|cc by-nc|cc by-nd|no.?derivative)\b/i.test(
   name+" "+val("UsageTerms")+" "+licenseUrl);
  const permissionConflict=pd&&copyrighted.toLowerCase()==="true";
  const freedom=pd&&!commercialNo&&!permissionConflict&&!!info?.url&&!!info?.sha1;
  const attribution=/\bcc.by\b|attribution|by-sa/i.test(name)&&!pd;
  const status=!result.ok?"COMMONS_API_UNAVAILABLE":
   !info?"COMMONS_SOURCE_FILE_UNRESOLVED":
   permissionConflict?"COPYRIGHT_CONFLICT_METADATA":
   commercialNo?"NONCOMMERCIAL_OR_NODERIVATIVES_LICENSE":
   freedom?"COMMONS_PD_OR_CC0_FILE_METADATA":
   attribution?"CC_BY_OR_BY_SA_COMPLIANCE_DEFERRED":
   "RIGHTS_METADATA_UNRESOLVED";
  commonsResults.push({group:r.physical_work_group,title:r.title,artist:r.artist,
   originalQueue:"RIGHTS_OR_ALTERNATIVE",sourceUrl:r.source_url,
   commonsPageId:page?.pageid||null,commonsPageTitle:page?.title||null,
   fileSha1:info?.sha1||null,mime:info?.mime||null,
   fileWidth:info?.width||null,fileHeight:info?.height||null,fileBytes:info?.size||null,
   licenceShortName:license,licenceUrl:licenseUrl,copyrighted,
   restrictions,author:val("Artist")||val("Attribution")||"",
   credit:val("Credit")||"",usageTerms:val("UsageTerms")||"",
   sourcePageCurrentImageUrl:info?.url||"",previewImageUrl:info?.thumburl||"",
   freeSourceFileMetadataCandidate:freedom,
   attributionLicenceDeferred:attribution,
   status,error:result.error||null,httpStatus:result.status||null,
   originalPhotoNativeDownloaded:false,pristineReview:false,
   exactFileReuseLegalCertification:false,releaseApproved:false});
 }
 console.log("Commons audit:",Math.min(start+25,commons.length),"/",commons.length);
 await delay(200);
}
officialResults.sort((a,b)=>a.group.localeCompare(b.group));
commonsResults.sort((a,b)=>a.group.localeCompare(b.group));
const list=[...officialResults,...commonsResults],statuses={};
for(const x of list)statuses[x.status]=(statuses[x.status]||0)+1;
const counts={
 originalFirstPhotoReviewPreserved:73,
 officialObjectPhotoAuditRequested:142,officialObjectPhotoAuditCompleted:officialResults.length,
 commonsRightsAuditRequested:351,commonsRightsAuditCompleted:commonsResults.length,
 totalSourceGroupsProcessed:list.length,
 clearOfficialCurrentOpenAccessImageCandidates:officialResults.filter(x=>x.status==="OFFICIAL_OPEN_ACCESS_IMAGE_CANDIDATE").length,
 commonsCurrentPdOrCc0FileCandidates:commonsResults.filter(x=>x.status==="COMMONS_PD_OR_CC0_FILE_METADATA").length,
 deferredAttributionLicenseCount:commonsResults.filter(x=>x.attributionLicenceDeferred).length,
 unresolvedOrRestrictedCount:list.filter(x=>!["OFFICIAL_OPEN_ACCESS_IMAGE_CANDIDATE",
  "COMMONS_PD_OR_CC0_FILE_METADATA"].includes(x.status)).length,
 titleIdentityAutoMerges:0,historicalDecisionsChanged:0,photoPristineCertified:0,
 fileRightsFinallyCertified:0,productionImports:0,feesEur:0,statuses};
if(officialResults.length!==142||commonsResults.length!==351||
 list.some(x=>x.releaseApproved||x.pristineReview||
 x.originalPhotoNativeDownloaded))
 throw Error("Source audit incomplete or photo gate violated");
const out={schema:"AO_SACRED_ART_WAVE2_OFFICIAL_AND_COMMONS_BULK_AUDIT_V1",
 date:"2026-10-30",counts,
 immutableInput:["data/calendar/sacred-art-master-v1/queue-photo-qa-or-repair.csv",
 "data/calendar/sacred-art-master-v1/queue-rights-or-alternative.csv",
 "data/calendar/sacred-art-master-v1/first-pristine-photo-review.csv"],
 restrictions:["Source page/official collection API data is not native downloaded photograph QA",
 "The Commons extmetadata rights statement is file-specific but may have jurisdiction or photographic-reproduction exceptions",
 "Institutional CC0 applies only to eligible official images; archived alternate photographs need their own evidence",
 "No automatically approved pristine images, final copyright certifications, physical-work mergers or app imports",
 "Previous 73 human review gallery must remain immutable and disjoint",
 "Failure to retrieve a source is not evidence of restricted copyright."],
 results:list,release:{historicalChoicesUntouched:true,
 old73ReviewUnchanged:true,appRelease:false}};
writeFileSync(B+"wave2-493-official-source-audit-20261030.v1.json",JSON.stringify(out,null,2)+"\n");
console.log(JSON.stringify(counts,null,2));
