#!/usr/bin/env node
/**
 * Canonical Sacred Atlas Place cover gaps, first 100 locations.
 * Source-first research: 21 existing approved gallery files are reusable,
 * 75 existing editorial Commons titles are checked EXACTLY,
 * unselected Places get bounded verified-site discovery.
 * Outputs permanent, non-published metadata; never invent Place identities.
 */
import {readFile,writeFile} from "node:fs/promises";
const input="data/geography/research/sacred-atlas-site-covers-batch-001.v1.json";
const output="data/geography/research/sacred-atlas-site-covers-batch-001.results.json";
const manifest=JSON.parse(await readFile(input,"utf8"));
if(manifest.total!==100||manifest.sites.length!==100)throw Error("Expected 100 canonical Place sites");
const unique=new Set(manifest.sites.map(s=>s.place_id));
if(unique.size!==100)throw Error("Duplicate canonical site in batch");
const UA="AdOrientem Sacred Atlas photo research/1.0 (https://github.com/Fulcanelli13/ad-orientem)";
const API="https://commons.wikimedia.org/w/api.php";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const tidy=x=>String(x||"").replace(/<[^>]+>/g," ").replace(/&(?:amp|quot|lt|gt|nbsp);/gi," ").replace(/\s+/g," ").trim();
const norm=x=>tidy(x).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const score=(site,filename)=>{
 const terms=new Set(norm(site.site_name+" "+(site.city||"")).split(" ").filter(x=>x.length>=4&&!["saint","notre","dame","basilica","basilique","eglise","cathedrale","cathédrale","chapelle","church","parish","abbey","shrine","sanctuaire"].includes(x)));
 const name=norm(filename);
 let found=0;for(const x of terms)if(name.includes(x))found++;
 return terms.size?+(found/terms.size).toFixed(3):0;
};
const licenseInfo=x=>{
 const name=tidy(x);
 const allowed=/^(?:CC0(?:\s*1\.0)?|CC BY(?:-SA)?\s*(?:2\.0|2\.5|3\.0|4\.0))$/i.test(name);
 return {name,photo_license_candidate:allowed,public_domain_needs_extra_check:/public domain|PD-/i.test(name)};
};
async function query(params){
 const u=new URL(API);
 for(const [k,v] of Object.entries({action:"query",format:"json",formatversion:2,maxlag:5,...params}))u.searchParams.set(k,String(v));
 let err;
 for(let n=0;n<4;n++){
  try{
   const r=await fetch(u,{headers:{"User-Agent":UA,"Accept":"application/json"},signal:AbortSignal.timeout(18000)});
   if(r.status===429||r.status===503){err=new Error("HTTP "+r.status);await sleep(1300*(n+1));continue}
   if(!r.ok)throw Error("Commons HTTP "+r.status);
   const payload=await r.json();
   if(payload.error?.code==="maxlag"){err=new Error("maxlag");await sleep(1900*(n+1));continue}
   if(payload.error)throw Error(JSON.stringify(payload.error));
   const pages=payload.query?.pages||[];
   return Array.isArray(pages)?pages:Object.values(pages);
  }catch(e){err=e;await sleep((n+1)*550)}
 }
 throw err;
}
const props={prop:"imageinfo",iiprop:"url|size|mime|sha1|extmetadata",iiextmetadatafilter:"LicenseShortName|LicenseUrl|Artist|Attribution|Credit|ImageDescription|DateTimeOriginal",iiurlwidth:400};
function transform(p,site){
 const info=p.imageinfo?.[0]||{},meta=info.extmetadata||{};
 const license=licenseInfo(meta.LicenseShortName?.value);
 const credit=tidy(meta.Artist?.value||meta.Attribution?.value||meta.Credit?.value);
 const suffix=String(p.title||"").replace(/^File:/,"");
 const exact=!!p.title&&!p.missing;
 const goodSize=Math.min(info.width||0,info.height||0)>=700&&Math.max(info.width||0,info.height||0)>=1200;
 const photoMime=/^image\/(?:jpeg|png|webp|tiff)$/.test(info.mime||"");
 return {
  commons_title:exact?p.title:null,
  commons_page:exact?"https://commons.wikimedia.org/wiki/File:"+encodeURIComponent(suffix.replace(/ /g,"_")):null,
  original_url:info.url||null,original_width:info.width||0,original_height:info.height||0,
  source_sha1:info.sha1||null,photographer:credit||null,claimed_license:license.name,
  claimed_license_url:tidy(meta.LicenseUrl?.value)||null,
  photo_license_candidate:license.photo_license_candidate,
  requires_public_domain_proof:license.public_domain_needs_extra_check,
  resolution_candidate:goodSize,mime:info.mime||null,
  text_match_score:score(site,p.title||""),
  metadata_preflight_passed:exact&&goodSize&&photoMime&&license.photo_license_candidate&&!!credit&&!!meta.LicenseUrl?.value&&!!info.sha1,
  exact_physical_site_visually_verified:false,
  original_bytes_sha1_verified:false,
  underlying_artwork_rights_verified:false,
  image_quality_verified:false,
  publishable:false,published:false
 };
}
if(process.argv.includes("--selftest")){
 const wrong={place_id:"place:CD:notre-dame-du-congo-cathedral-kinshasa",site_name:"Notre-Dame du Congo Kinshasa",city:"Kinshasa"};
 if(!licenseInfo("CC BY-SA 4.0").photo_license_candidate||licenseInfo("CC BY-NC 4.0").photo_license_candidate)throw Error("Licence gate broken");
 if(score(wrong,"File:Notre-Dame de la paix de Bukavu.jpg")>=0.5)throw Error("Wrong-city title accepted");
 if(unique.size!==100)throw Error("Coverage broken");
 console.log("PASS: 100 unique exact Places, noncommercial photo rejected, wrong-city textual match rejected");
 process.exit(0);
}
let idx=0;const records=Array(manifest.sites.length);
async function worker(){
 while(true){
  const j=idx++;if(j>=manifest.sites.length)return;
  const site=manifest.sites[j];
  const record={
   ordinal:site.batch_sequence,place_id:site.place_id,site_name:site.site_name,
   action:site.action,country_code:site.country_code,city:site.city,coords:site.coordinates,
   previous_selection:site.prior_selected_commons_file||null,
   candidate_searches:[],candidates:[],previous_gallery_asset:null,
   state:"RESEARCH_ONLY_NOT_PUBLISHED",error:null
  };
  try{
   if(site.action==="REUSE_EXISTING_APPROVED_GALLERY_AFTER_COVER_QA"){
    const vetted=site.usable_gallery_assets?.find(x=>x.rights_verified&&x.subject_verified&&x.derivative_sha256&&x.asset_path);
    if(!vetted)throw Error("No source verified gallery photo");
    record.previous_gallery_asset=vetted;
    record.state="REUSE_PREVIOUSLY_APPROVED_GALLERY_BYTES_NO_DOWNLOAD";
   }else{
    let pages=[];
    if(site.action==="HOLD_WRONG_CITY_RESEARCH_CORRECT_SITE"){
     record.state="WRONG_CITY_SOURCE_HELD";
     // Explicit prior Bukavu file is NOT queried, never approved.
    }else if(site.candidate_override?.commons_title){
     const title=site.candidate_override.commons_title;
     record.candidate_searches.push({kind:"PINNED_EXACT_SOURCE",query:title});
     pages=await query({...props,titles:title,redirects:1});
    }else if(site.prior_selected_commons_file){
     const title=site.prior_selected_commons_file;
     record.candidate_searches.push({kind:"PREVIOUS_EDITORIAL_SELECTION",query:title});
     pages=await query({...props,titles:title,redirects:1});
    }else{
     const term=site.site_name+" "+(site.city||"")+" "+site.country_code;
     record.candidate_searches.push({kind:"PLACE_AND_CITY_SEARCH",query:term});
     pages=await query({...props,generator:"search",gsrsearch:term,gsrnamespace:6,gsrlimit:10,gsrwhat:"text"});
    }
    record.candidates=pages.filter(x=>x.imageinfo&&!x.missing).map(x=>transform(x,site));
    record.candidates.sort((a,b)=>Number(b.metadata_preflight_passed)-Number(a.metadata_preflight_passed)||b.text_match_score-a.text_match_score);
    record.candidates=record.candidates.slice(0,7);
    if(site.candidate_override?.source_sha1 && record.candidates[0]?.source_sha1!==site.candidate_override.source_sha1)
     throw Error("Pinned source SHA1 mismatch; no acquisition");
    if(record.state!=="WRONG_CITY_SOURCE_HELD"){
     const acceptable=record.candidates.some(c=>c.metadata_preflight_passed&&(site.prior_selected_commons_file||site.candidate_override||c.text_match_score>=0.4));
     record.state=acceptable?"COMMONS_LICENSED_PHOTO_CANDIDATE_NEEDS_IMAGE_AND_SITE_QA":"NO_USABLE_EXACT_SOURCE_FOUND";
    }
   }
  }catch(e){record.state="SOURCE_LOOKUP_FAILED_OR_CHANGED";record.error=String(e).slice(0,250)}
  records[j]=record;
  if((j+1)%10===0)console.log("Searched Place index "+(j+1)+"/100");
  await sleep(300);
 }
}
await Promise.all(Array.from({length:3},()=>worker()));
const summary={
 locations:100,reuse_approved_gallery:records.filter(x=>x.previous_gallery_asset).length,
 source_file_candidates:records.reduce((n,x)=>n+x.candidates.length,0),
 locations_with_compatible_photo_metadata:records.filter(x=>x.candidates.some(z=>z.metadata_preflight_passed)).length,
 pinned_current_source_sha_changed:records.filter(x=>x.error?.includes("SHA1 mismatch")).length,
 wrong_city_hold:records.filter(x=>x.state==="WRONG_CITY_SOURCE_HELD").length,
 errors:records.filter(x=>x.state==="SOURCE_LOOKUP_FAILED_OR_CHANGED").length,
 original_image_bytes_acquired:0,app_cover_published:0
};
await writeFile(output,JSON.stringify({schema:"AO_SACRED_ATLAS_SITE_COVER_COMMONS_BATCH_RESULTS_V1",as_of:new Date().toISOString(),input,summary,records},null,2)+"\n");
console.log("Site cover batch 001:",JSON.stringify(summary));
if(summary.source_file_candidates===0)throw Error("Commons produced no source file candidates");
