#!/usr/bin/env node
/**
 * Ad Orientem · Commons metadata pass for 100 exact sacred-subject targets.
 *
 * Research, not publication: Commons free-photo licence alone does not clear
 * embedded statues, reliquaries, mosaics, private permissions or exact identity.
 * All previous editorial KEEP approvals are immutable.
 * Zero-cost: stores only canonical Commons URLs and metadata, never binaries.
 */
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {dirname} from "node:path";

const batchId=process.argv[2]==="--selftest"?"001":(process.argv[2]||"001");
if(!/^00[123]$/.test(batchId))throw Error("Only manifests 001–003 are authorized");
const source=`data/geography/research/sacred-atlas-commons-batch-${batchId}.manifest.json`;
const destination=`data/geography/research/sacred-atlas-commons-batch-${batchId}.results.json`;
const manifest=JSON.parse(await readFile(source,"utf8"));
if(manifest.batch_id!==batchId||manifest.total_targets!==manifest.targets.length||manifest.targets.length<1||manifest.targets.length>100)throw Error("Invalid batch manifest");
const API="https://commons.wikimedia.org/w/api.php";
const UA="AdOrientemSacredAtlasResearch/1.0 (https://github.com/Fulcanelli13/ad-orientem)";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const strip=s=>String(s||"").replace(/<[^>]*>/g," ").replace(/&(?:amp|quot|lt|gt|nbsp);/g," ").replace(/\s+/g," ").trim();
const normalize=s=>strip(s).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim();
const stops=new Set(["saint","saints","st","ste","the","of","our","lady","and","de","la","le","du","des","at","with","from","in","san","santa","sanctuaire","basilica","basilique","church","chapel","relies","relics","traditionally","associated","france","italy"]);
const tokens=s=>new Set(normalize(s).split(" ").filter(t=>t.length>=3&&!stops.has(t)));
function searchableName(t){
 return t.subject_title.replace(/^Relics traditionally associated with /i,"").replace(/^Relics of /i,"").replace(/^Glass shrine of /i,"").replace(/\bat (?:the )?[A-Z][\w-]+$/,"").trim();
}
function queryVariants(t){
 const subject=searchableName(t);
 const site=t.site_title.replace(/(?:Sanctuaire|Basilica|Basilique|Abbazia|Cathédrale|Duomo|Chapel|Church)\s+(?:de |di |of )?/gi,"").slice(0,65);
 return [...new Set([subject+" "+site,subject+" "+t.site_title.split(/[—,]/)[0]])].slice(0,2);
}
function normalizeLicense(v){
 const s=strip(v);
 if(/^(CC0|CC BY(?:-SA)?)\s*[1-4](?:\.\d)?$/i.test(s))return {compatible:true,kind:s};
 if(/^Public domain(?:\s|$)/i.test(s)||/^(?:PD-old|PD-US|PD-art|PD-self|PD-author|PDM)$/i.test(s))
  return {compatible:false,kind:s,reason:"Public-domain statement needs jurisdiction/origin verification"};
 return {compatible:false,kind:s||"UNSPECIFIED",reason:"Not a verified CC0/CC BY/CC BY-SA photograph licence"};
}
function overlapScore(t,p){
 const need=tokens(searchableName(t)+" "+t.site_title);
 const have=tokens(p.title+" "+(p.imageinfo?.[0]?.extmetadata?.ObjectName?.value||"")+" "+(p.imageinfo?.[0]?.extmetadata?.ImageDescription?.value||""));
 if(!need.size)return 0;
 let match=0;for(const w of need)if(have.has(w))match++;
 return +(match/need.size).toFixed(3);
}
async function getAPI(params){
 const u=new URL(API);for(const [k,v]of Object.entries({...params,action:"query",format:"json",formatversion:"2",maxlag:"5"}))u.searchParams.set(k,String(v));
 let lastError;
 for(let n=0;n<4;n++){
  try{
   const res=await fetch(u,{headers:{"User-Agent":UA,"Accept":"application/json"},signal:AbortSignal.timeout(18000)});
   if(res.status===429||res.status===503||res.status===502){lastError=new Error("HTTP "+res.status);await sleep(1500*(n+1));continue;}
   if(!res.ok)throw Error("Commons HTTP "+res.status);
   const json=await res.json();
   if(json.error?.code==="maxlag"){lastError=new Error("Commons maxlag");await sleep(2000*(n+1));continue;}
   if(json.error)throw Error("Commons "+JSON.stringify(json.error).slice(0,160));
   const pages=json.query?.pages||[];
   return Array.isArray(pages)?pages:Object.values(pages);
  }catch(e){lastError=e;await sleep(750*(n+1));}
 }
 throw lastError;
}
const imageProps={prop:"imageinfo",iiprop:"url|size|mime|sha1|extmetadata",iiextmetadatafilter:"LicenseShortName|LicenseUrl|Artist|Attribution|Credit|ObjectName|ImageDescription|Copyrighted|UsageTerms",iiurlwidth:"420"};
function candidate(t,p){
 const i=p.imageinfo?.[0]||{},m=i.extmetadata||{};
 const license=normalizeLicense(m.LicenseShortName?.value||m.UsageTerms?.value);
 const mime=i.mime||"";
 const photoLike=/^image\/(?:jpeg|png|webp|tiff)$/.test(mime);
 const goodSize=(i.width||0)>=700&&(i.height||0)>=700&&Math.max(i.width||0,i.height||0)>=1200;
 const author=strip(m.Artist?.value||m.Attribution?.value||m.Credit?.value);
 const relevance=overlapScore(t,p);
 const warnings=[];
 if(!license.compatible)warnings.push(license.reason);
 if(!photoLike)warnings.push("Not a supported raster-photo format");
 if(!goodSize)warnings.push("Low or unverified original resolution");
 if(!author)warnings.push("Photographer/creator metadata missing");
 if(relevance<0.18&&!t.known_candidate_file)warnings.push("Weak textual match; exact sacred object unverified");
 if(t.copyright_caution)warnings.push(t.copyright_caution);
 return {
  commons_title:p.title||null,commons_page:p.title?"https://commons.wikimedia.org/wiki/"+encodeURIComponent(p.title.replace(/ /g,"_")):null,
  commons_pageid:p.pageid||null,original_url:i.url||null,preview_url:i.thumburl||null,
  commons_sha1:i.sha1||null,original_width:i.width||null,original_height:i.height||null,
  mime,claimed_photographer:author||null,claimed_license:license.kind,license_url:strip(m.LicenseUrl?.value)||null,
  photo_license_compatible:license.compatible,dimensions_sufficient:goodSize,
  textual_relevance_score:relevance,preliminary_free_photo_candidate:license.compatible&&photoLike&&goodSize&&!!author,
  candidate_warnings:warnings,
  visual_identity_verified:false,photo_bytes_downloaded:false,original_sha256:null,
  underlying_artwork_rights_cleared:false,attribution_ready:false,publishable:false,published:false
 };
}
if(process.argv.includes("--selftest")){
 const sampleTarget={subject_title:"Saint Anthony's tongue reliquary",site_title:"Basilica di Sant'Antonio, Padova",copyright_caution:null,known_candidate_file:"File:La-lingua-di-sant-antonio.jpg"};
 const samplePage={pageid:117432749,title:"File:La-lingua-di-sant-antonio.jpg",imageinfo:[{width:960,height:1280,mime:"image/jpeg",url:"https://upload.wikimedia.org/wikipedia/commons/example.jpg",extmetadata:{LicenseShortName:{value:"CC BY-SA 4.0"},Artist:{value:"Elmiralaleh"},ImageDescription:{value:"La lingua di Sant Antonio, Padova"}}}]};
 const result=candidate(sampleTarget,samplePage);
 if(result.commons_pageid!==117432749||!result.preliminary_free_photo_candidate||!Number.isFinite(result.textual_relevance_score))throw Error("Candidate matching regression");
 if(result.publishable||result.underlying_artwork_rights_cleared||result.visual_identity_verified)throw Error("Research candidate must stay unpublished");
 console.log("PASS: exact title candidate, CC BY-SA, metadata, provenance, no premature publication");
 process.exit(0);
}
const output=[];let cursor=0;
async function worker(){
 while(true){
  const index=cursor++;if(index>=manifest.targets.length)return;
  const target=manifest.targets[index];
  const record={
   ordinal:target.ordinal,place_id:target.place_id,subject_id:target.subject_id,
   subject_title:target.subject_title,subject_class:target.subject_class,source_url:target.source_url,
   user_keep_vote:target.user_keep_vote,unchanged_original_candidate:target.known_candidate_file||null,
   candidate_searches:[],candidates:[],state:"RESEARCH_RUNNING",error:null,
   verification_gates:{physical_subject:false,exact_photo_preview_match:false,photographer_license:false,
    underlying_artwork_rights:false,source_bytes_integrity:false,photo_quality:false,attribution:false},
   publication_approved:false
  };
  try{
   const prohibitedOriginal=["WRONG_PHYSICAL_SITE_DO_NOT_PUBLISH","ARCHIVAL_POSTCARD_PUBLIC_DOMAIN_EVIDENCE_INCOMPLETE"].includes(target.known_candidate_hold);
   if(target.known_candidate_file&&!prohibitedOriginal){
    const pages=await getAPI({...imageProps,titles:target.known_candidate_file,redirects:"1"});
    record.candidate_searches.push({kind:"KNOWN_FILE",query:target.known_candidate_file});
    record.candidates=pages.filter(p=>!p.missing&&p.imageinfo).map(p=>candidate(target,p));
   }
   // A false/weak original match must not consume the user's entire slot.
   // Search correct-place alternatives automatically: the user delegated replacements.
   if(prohibitedOriginal||!record.candidates.some(c=>c.preliminary_free_photo_candidate)){
    for(const q of queryVariants(target)){
     record.candidate_searches.push({kind:"COMMONS_SEARCH",query:q});
     const pages=await getAPI({...imageProps,generator:"search",gsrsearch:q,gsrnamespace:"6",gsrlimit:"8",gsrwhat:"text"});
     for(const p of pages)if(p.imageinfo&&!record.candidates.some(z=>z.commons_title===p.title))record.candidates.push(candidate(target,p));
     if(record.candidates.some(c=>c.preliminary_free_photo_candidate&&c.textual_relevance_score>=0.18))break;
     await sleep(300);
    }
   }
   record.candidates.sort((a,b)=>Number(b.preliminary_free_photo_candidate)-Number(a.preliminary_free_photo_candidate)
     || b.textual_relevance_score-a.textual_relevance_score
     ||Number(b.dimensions_sufficient)-Number(a.dimensions_sufficient));
   record.candidates=record.candidates.slice(0,5);
   const plausible=record.candidates.find(c=>c.preliminary_free_photo_candidate&&c.textual_relevance_score>=0.18);
   const unsafe=["WRONG_PHYSICAL_SITE_DO_NOT_PUBLISH","ARCHIVAL_POSTCARD_PUBLIC_DOMAIN_EVIDENCE_INCOMPLETE"];
   record.state=unsafe.includes(target.known_candidate_hold)
    ?(plausible?"AUTOMATIC_REPLACEMENT_CANDIDATE_REQUIRES_SUBSITE_AND_RIGHTS_VERIFICATION":"IDENTITY_OR_HISTORICAL_HOLD")
    :plausible?"FREE_PHOTOGRAPH_LICENSE_CANDIDATE_IDENTITY_AND_ARTWORK_PENDING":"NO_PLAUSIBLE_CLEARLY_FREE_PHOTO_YET";
   if(target.user_keep_vote)record.state="EXISTING_KEEP_UNCHANGED_"+record.state;
  }catch(e){
   record.state="COMMONS_QUERY_FAILED";record.error=String(e?.message||e).slice(0,250);
   if(index<40)console.warn("Commons query failed:",target.ordinal,record.error);
  }
  output[index]=record;
  if((index+1)%10===0)console.log("Completed target index "+(index+1)+"/"+manifest.total_targets);
  await sleep(350);
 }
}
await Promise.all(Array.from({length:3},()=>worker()));
const count=(p)=>output.filter(p).length;
const stats={
 targets:output.length,round1_user_keeps_preserved:count(r=>r.user_keep_vote),
 source_file_candidates_returned:output.reduce((s,r)=>s+r.candidates.length,0),
 targets_with_free_photograph_license_candidate:count(r=>r.candidates.some(c=>c.preliminary_free_photo_candidate)),
 targets_with_textually_plausible_free_candidate:count(r=>r.candidates.some(c=>c.preliminary_free_photo_candidate&&c.textual_relevance_score>=0.18)),
 query_failures:count(r=>r.state==="COMMONS_QUERY_FAILED"),
 exact_visual_identity_verified:0,underlying_artwork_rights_cleared:0,publication_approved:0
};
const data={
 schema:"AO_SACRED_ATLAS_COMMONS_BATCH_RESULTS_V1",batch_id:batchId,
 generated_at:new Date().toISOString(),manifest_path:source,
 rights_policy:"Research-only metadata. A Commons photo licence does not establish the legal status of a photographed statue, relic container, mosaic or modern artwork. Editorial round-one KEEP decisions are unchanged. A plausible title match is NOT visual verification.",
 stats,results:output
};
await mkdir(dirname(destination),{recursive:true});
await writeFile(destination,JSON.stringify(data,null,2)+"\n");
console.log("Batch "+batchId+" stats:",JSON.stringify(stats));
if(stats.source_file_candidates_returned===0){console.error("ZERO COMMONS FILES RETURNED: service/API/search error, not cleared photo inventory");process.exitCode=2;}
