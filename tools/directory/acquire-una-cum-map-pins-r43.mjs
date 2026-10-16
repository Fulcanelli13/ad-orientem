import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {cleanDirectoryAddress,selectNominatimCandidate,nominatimGeoFromSelection,geocodeCacheKey} from "./lib/geocode-utils.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const queueFile=path.join(root,"data/directory/research/staging/map-first-r37/r43-una-cum-geocode-queue.json");
const out=process.env.RUNNER_TEMP?path.join(process.env.RUNNER_TEMP,"r43-una-cum-address-geocodes"):"/tmp/r43-una-cum-address-geocodes";
const arg=(k,def)=>{const v=process.argv.find(x=>x.startsWith("--"+k+"="));return v?Number(v.split("=")[1]):def};
const start=arg("start",0),max=arg("max",460);
if(!Number.isInteger(start)||start<0||!Number.isInteger(max)||max<1||max>460)throw Error("INVALID_WORK_LIMIT");
const queue=JSON.parse(await fs.readFile(queueFile,"utf8")).records;
if(queue.length!==460)throw Error("SOURCE_QUEUE_COUNT_CHANGED");
const sorted=[...queue].sort((a,b)=>{
 const priority={Diocesan:0,FSSP:1,ICKSP:2,IBP:3,Oratorians:4,AASJMV:5};
 return (priority[a.affiliation]??9)-(priority[b.affiliation]??9)||a.cc.localeCompare(b.cc)||a.name.localeCompare(b.name);
});
const selected=sorted.slice(start,start+max);
const report={status:"STAGING_ONLY",start,selected:selected.length,request_count:0,cache_hits:0,pins:0,holds:0,errors:0,by_affiliation:{},requests_by_country:{},stopped_on_rate_limit:false,attribution:"© OpenStreetMap contributors; ODbL 1.0"};
const accepted=[],held=[],errors=[],cache=new Map();
let lastRequest=0;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function nominatim(query,country){
 const key=geocodeCacheKey({query,countryCode:country});
 if(cache.has(key)){report.cache_hits++;return {rows:cache.get(key),key}};
 const gap=Date.now()-lastRequest;if(gap<1350)await wait(1350-gap);
 lastRequest=Date.now();report.request_count++;
 report.requests_by_country[country]=(report.requests_by_country[country]||0)+1;
 const u=new URL("https://nominatim.openstreetmap.org/search");
 u.search=new URLSearchParams({q:query,countrycodes:country.toLowerCase(),format:"jsonv2",addressdetails:"1",namedetails:"1",limit:"3",accept_language:"en"}).toString();
 const response=await fetch(u,{headers:{"User-Agent":"AdOrientemDirectoryResearch/1.0 (https://github.com/Fulcanelli13/ad-orientem; one-time directory audit)","Referer":"https://github.com/Fulcanelli13/ad-orientem","Accept":"application/json"},signal:AbortSignal.timeout(18000)});
 if(!response.ok){const error=new Error("GEOCODE_HTTP_"+response.status);error.status=response.status;throw error}
 const rows=await response.json();if(!Array.isArray(rows))throw Error("INVALID_GEOCODE_RESPONSE");
 cache.set(key,rows);return {rows,key};
}
const suspiciousName=/\b(house|rectory|residence|seminary|headquarters|office|presbytery|provincialate)\b/i;
for(const row of selected){
 const slot=report.by_affiliation[row.affiliation]??={processed:0,accepted:0,held:0};
 slot.processed++;
 const base={source_id:row.id,name:row.name,iso:row.cc,address:row.address,source_url:row.url,affiliation:row.affiliation,origin_family:row.origin_family};
 const addr=cleanDirectoryAddress(row.address);
 if(!/^[A-Z]{2}$/.test(row.cc)||!row.name||!row.url?.startsWith("http")||addr.length<8||/\bP\.?O\.?\s*Box\b/i.test(row.address)){
   held.push({...base,reason:"INSUFFICIENT_ADDRESS_OR_SOURCE"});slot.held++;continue;
 }
 if(suspiciousName.test(row.name)&&!(/church|chapel|oratory|shrine|sanctuary|eglise|chapelle|iglesia/i).test(row.name)){
   held.push({...base,reason:"NON_WORSHIP_FACILITY_NEEDS_PUBLIC_MASS_VENUE_PROOF"});slot.held++;continue;
 }
 const venue={name:{official:row.name},address:{formatted:addr,country_code:row.cc}};
 try{
  const {rows,key}=await nominatim(addr,row.cc);
  const match=selectNominatimCandidate(venue,rows);
  if(!match||!["building","address","street"].includes(match.precision)){
    held.push({...base,reason:rows.length?"NO_SITE_SCALE_MATCH":"NO_GEOCODER_CANDIDATES",
      candidates:rows.slice(0,2).map(x=>({display_name:x.display_name,addresstype:x.addresstype}))});slot.held++;continue;
  }
  const geo=nominatimGeoFromSelection(match,{cacheKey:key});
  if(!geo||geo.matched_country_code!==row.cc||!(geo.lat||geo.lng)){held.push({...base,reason:"INVALID_OR_FOREIGN_COORDINATES"});slot.held++;continue}
  accepted.push({type:"Feature",geometry:{type:"Point",coordinates:[geo.lng,geo.lat]},properties:{
    ...base,coordinate_precision:geo.precision,coordinate_origin:"OSM_NOMINATIM_ADDRESS",
    osm_source_ref:geo.source_ref,geo_score:geo.match_score,query_fingerprint:key,
    map_status:"PROVISIONAL_PENDING_VENUE_IDENTITY",attribution:geo.attribution,
    note:"Source-stated affiliation; does not verify a particular Mass's una-cum commemoration, current schedule or canonical details"
  }});slot.accepted++;
 }catch(e){
   const error={...base,error:String(e)};errors.push(error);
   held.push({...base,reason:"GEOCODER_ERROR",error:String(e)});slot.held++;
   if(e.status===429||e.status===403){report.stopped_on_rate_limit=true;break}
 }
}
report.pins=accepted.length;report.holds=held.length;report.errors=errors.length;
report.processed=accepted.length+held.length;report.unprocessed=selected.length-report.processed;
await fs.mkdir(out,{recursive:true});
await fs.writeFile(path.join(out,"candidate-pins.geojson"),JSON.stringify({type:"FeatureCollection",metadata:{status:"RESEARCH_ONLY_NOT_PUBLISHED",source:"OpenStreetMap Nominatim",attribution:"© OpenStreetMap contributors, ODbL 1.0",disclaimer:"Not verified church entrance pins, no Mass times, no canonical-status inference"},features:accepted},null,2));
await fs.writeFile(path.join(out,"holds.json"),JSON.stringify(held,null,2));
await fs.writeFile(path.join(out,"report.json"),JSON.stringify(report,null,2));
await fs.writeFile(path.join(out,"errors.json"),JSON.stringify(errors,null,2));
console.log("R43_UNA_CUM_BATCH",JSON.stringify(report));
if(report.stopped_on_rate_limit)process.exitCode=2;
