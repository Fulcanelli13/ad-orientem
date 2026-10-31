#!/usr/bin/env node
/**
 * Recover the 125 unresolved canonical Sacred Atlas Place covers.
 * Wikimedia research only: original exact file and site ID never auto-approved.
 * Single paced worker, no unbounded scraping. Source file and rights checked.
 */
import {readFile,writeFile} from "node:fs/promises";
const root="data/geography/research/";
const queue=JSON.parse(await readFile(root+"sacred-atlas-site-cover-recovery-125.v1.json","utf8"));
if(queue.items.length!==125||new Set(queue.items.map(x=>x.place_id)).size!==125)throw Error("125 unique Places required");
const UA="AdOrientem Sacred Atlas source recovery/1.0 (https://github.com/Fulcanelli13/ad-orientem)";
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const strip=s=>String(s||"").replace(/<[^>]*>/g," ").replace(/&(?:nbsp|amp|quot|lt|gt);/ig," ").replace(/\s+/g," ").trim();
const normalize=s=>strip(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const stop=new Set(["notre","dame","saint","mary","basilica","basilique","cathedral","catholic","church","saints","churches","of","the","sa","st","our","lady","sanctuaire","parish","shrine"]);
function relevance(site,title){
 const hay=normalize(title);
 const locality=normalize(site.city||"");
 const terms=normalize(site.site_name).split(" ").filter(w=>w.length>=4&&!stop.has(w));
 const words=new Set(terms);
 let hits=0;for(const w of words)if(hay.includes(w))hits++;
 if(locality&&hay.includes(locality))hits+=2;
 const denom=Math.max(1,words.size+2);
 return Math.min(1,hits/denom);
}
function licence(meta){
 const name=strip(meta.LicenseShortName?.value);
 const url=strip(meta.LicenseUrl?.value).replace(/\/(?:deed\.[a-z-]+)\/?$/i,"/");
 const canonical=/^https:\/\/creativecommons\.org\/licenses\/(by|by-sa)\/(2\.0|2\.5|3\.0|4\.0)\/?$/i.test(url)
  || /^https:\/\/creativecommons\.org\/publicdomain\/zero\/1\.0\/?$/i.test(url);
 const named=/^CC0(?:\s1\.0)?$|^CC BY(?:-SA)?\s(?:2\.0|2\.5|3\.0|4\.0)(?:\s[a-z]{2})?$/i.test(name);
 return {name,url,eligible:canonical&&named,public_domain_holds:/public domain|^pd-/i.test(name)};
}
async function api(params){
 const u=new URL("https://commons.wikimedia.org/w/api.php");
 for(const [k,v] of Object.entries({action:"query",format:"json",formatversion:2,maxlag:5,...params}))u.searchParams.set(k,String(v));
 let err;
 for(let attempt=0;attempt<6;attempt++){
  try{
   const response=await fetch(u,{headers:{"User-Agent":UA,"Accept":"application/json"},signal:AbortSignal.timeout(25000)});
   if(response.status===429||response.status===503){
    const retry=Number(response.headers.get("retry-after"))||0;
    const ms=Math.max(6000*Math.pow(2,attempt),1000*retry);
    console.warn("Wikimedia throttled",response.status,"pause",Math.min(ms,90000),"ms");
    await sleep(Math.min(ms,90000));continue;
   }
   if(!response.ok)throw Error("HTTP "+response.status);
   const json=await response.json();
   if(json.error?.code==="maxlag"){await sleep(9000*(attempt+1));continue}
   if(json.error)throw Error(JSON.stringify(json.error));
   const pages=json.query?.pages||[];
   return Array.isArray(pages)?pages:Object.values(pages);
  }catch(e){err=e;await sleep(1800*(attempt+1))}
 }
 throw err||Error("Wikimedia throttling persisted");
}
const props={prop:"imageinfo",iiprop:"url|sha1|size|mime|extmetadata",iiextmetadatafilter:"LicenseShortName|LicenseUrl|Artist|Attribution|Credit|ImageDescription",iiurlwidth:450};
function candidate(site,p){
 const img=p.imageinfo?.[0]||{},metadata=img.extmetadata||{};
 const rights=licence(metadata);
 const artist=strip(metadata.Artist?.value||metadata.Attribution?.value||metadata.Credit?.value);
 const validMime=/^image\/(?:jpeg|png|webp|tiff)$/.test(img.mime||"");
 const resolution=Math.min(img.width||0,img.height||0)>=700&&Math.max(img.width||0,img.height||0)>=1200;
 const title=p.title||"";
 const rel=relevance(site,title);
 const valid=!!title&&!p.missing&&validMime&&resolution&&rights.eligible&&!!artist&&/^[a-f0-9]{40}$/.test(img.sha1||"");
 return {title,commons_page:"https://commons.wikimedia.org/wiki/File:"+encodeURIComponent(title.replace(/^File:/,"").replaceAll(" ","_")),
  original_url:img.url||null,source_sha1:img.sha1||null,mime:img.mime||null,width:img.width||0,height:img.height||0,
  author:artist||null,license:rights.name,license_url:rights.url,license_candidate:rights.eligible,resolution_candidate:resolution,
  text_site_match:+rel.toFixed(3),preflight_passed:valid,site_verified:false,underlying_artwork_rights_verified:false,original_bytes_verified:false,published:false};
}
if(process.argv.includes("--selftest")){
 const e=licence({LicenseShortName:{value:"CC BY-SA 3.0 at"},LicenseUrl:{value:"https://creativecommons.org/licenses/by-sa/3.0/"}});
 if(!e.eligible)throw Error("A valid CC locale suffix was incorrectly excluded");
 if(licence({LicenseShortName:{value:"CC BY-NC 4.0"},LicenseUrl:{value:"https://creativecommons.org/licenses/by-nc/4.0/"}}).eligible)throw Error("NC licence accepted");
 if(relevance({site_name:"St. Olav Cathedral",city:"Oslo"},"File:StOlavsOsloFeb2009.jpg")<=0)throw Error("Exact city relevance broken");
 console.log("PASS: 125 unique canonical sites, CC BY-SA localized accepted, NC excluded, locality match");
 process.exit(0);
}
const results=[];
for(const [i,site] of queue.items.entries()){
 const q0=site.site_name+" "+(site.city||"")+" "+site.country_code;
 const q1=site.site_name+" "+(site.city||"");
 const q2=(site.city||"")+" "+site.site_name.replace(/^(?:Basilica|Basilique|Cathedral|Cathédrale|Sanctuaire|Church of|St\.)\s+/i,"");
 const queries=[...new Set([q0,q1,q2].map(strip))].filter(x=>x.length>6).slice(0,3);
 const record={place_id:site.place_id,site_name:site.site_name,city:site.city,country_code:site.country_code,
  origin_batch:site.original_batch,prior_selected_file:site.prior_selected_file,previous_reason:site.reason,
  candidates:[],searches:[],state:"PENDING",error:null};
 try{
  for(const term of queries){
   record.searches.push(term);
   const matches=await api({...props,generator:"search",gsrsearch:term,gsrnamespace:6,gsrlimit:12,gsrwhat:"text"});
   for(const p of matches){
    if(!p.imageinfo||p.missing||record.candidates.some(c=>c.title===p.title)||/Bukavu/i.test(p.title||"")&&site.country_code==="CD")continue;
    record.candidates.push(candidate(site,p));
   }
   if(record.candidates.some(c=>c.preflight_passed&&c.text_site_match>=0.3))break;
   await sleep(1400);
  }
  record.candidates.sort((a,b)=>Number(b.preflight_passed)-Number(a.preflight_passed)||b.text_site_match-a.text_site_match);
  record.candidates=record.candidates.slice(0,6);
  record.state=record.candidates.some(c=>c.preflight_passed&&c.text_site_match>=0.3)?"LICENSED_REPLACEMENT_CANDIDATE_REQUIRES_VISUAL_IDENTITY_QA":"NO_STRONG_SOURCE_YET";
 }catch(e){record.state="SOURCE_ERROR";record.error=String(e).slice(0,250)}
 results.push(record);
 if((i+1)%10===0)console.log("Recovery progress",i+1,"/",queue.items.length);
 await sleep(1700);
}
const summary={places:125,lookup_retries:queue.items.filter(x=>x.status==="SOURCE_LOOKUP_FAILED_OR_CHANGED").length,
 returned_files:results.reduce((n,r)=>n+r.candidates.length,0),strong_free_photo_leads:results.filter(r=>r.state==="LICENSED_REPLACEMENT_CANDIDATE_REQUIRES_VISUAL_IDENTITY_QA").length,
 no_strong_source:results.filter(r=>r.state==="NO_STRONG_SOURCE_YET").length,errors:results.filter(r=>r.state==="SOURCE_ERROR").length,bytes_downloaded:0,published:0};
await writeFile(root+"sacred-atlas-site-cover-recovery-125.results.json",JSON.stringify({schema:"AO_SACRED_ATLAS_SITE_COVER_RECOVERY_RESULTS_V1",date:new Date().toISOString(),summary,results},null,2)+"\n");
console.log("RECOVERY 125:",JSON.stringify(summary));
