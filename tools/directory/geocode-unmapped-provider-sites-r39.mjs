import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {selectNominatimCandidate,nominatimGeoFromSelection} from "./lib/geocode-utils.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const out="/tmp/r39-provider-geocodes";
const plans=[["cmri",60],["diocesan",55],["cspv",19],["rci",21],["canons-st-john-cantius",4]];
const max=150,delayMs=1250,stamp="2026-10-10";
const marker={accepted:[],held:[],errors:[],requested:0,limit:max,provider_count:{}};
let last=0;
function clean(s){return String(s??"").trim().replace(/\s+/g," ")}
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function queryAddress(q,cc){
  const gap=Date.now()-last;if(gap<delayMs)await wait(delayMs-gap);
  last=Date.now();marker.requested++;
  const url=new URL("https://nominatim.openstreetmap.org/search");
  url.search=new URLSearchParams({q,countrycodes:cc.toLowerCase(),format:"jsonv2",addressdetails:"1",namedetails:"1",limit:"3",accept_language:"en"}).toString();
  const r=await fetch(url,{headers:{Accept:"application/json","User-Agent":"AdOrientemDirectoryResearch/1.0 (GitHub Fulcanelli13/ad-orientem; research only)","Referer":"https://github.com/Fulcanelli13/ad-orientem"},signal:AbortSignal.timeout(18000)});
  if(!r.ok){const e=new Error("NOMINATIM_HTTP_"+r.status);e.status=r.status;throw e}
  const j=await r.json();return Array.isArray(j)?j:[];
}
for(const [provider,limit] of plans){
  const file=path.join(root,"data/directory/generated/v19",provider+".v1.json"), doc=JSON.parse(await fs.readFile(file,"utf8"));
  const stats={source_records:doc.records.length,requested:0,candidates:0,held:0};
  marker.provider_count[provider]=stats;
  for(const row of doc.records.slice(0,limit)){
    const address=clean(row.a),country=clean(row.cc).toUpperCase(),name=clean(row.n),id=row.u,source=row.su||"";
    const state={provider,id,name,address,country,source_url:source,source_file:provider+".v1.json"};
    if(marker.requested>=max)break;
    if(!address||address.length<12||!country||!name||/P\.?\s*O\.?\s*Box|postal address|mailing address/i.test(address)){
      marker.held.push({...state,reason:"INSUFFICIENT_OR_NON_WORSHIP_ADDRESS"});stats.held++;continue;
    }
    if(/\b(planned|closed|relocated|no.public.mass)\b/i.test(String(row.ps||""))){
      marker.held.push({...state,reason:"NO_CONFIRMED_CURRENT_PUBLIC_SITE"});stats.held++;continue;
    }
    const venue={name:{official:name},address:{formatted:address,country_code:country,city:row.l||null}};
    try{
      stats.requested++;
      const results=await queryAddress(address,country);
      const best=selectNominatimCandidate(venue,results);
      if(!best||!["building","address","street"].includes(best.precision)){
        marker.held.push({...state,reason:results.length?"NO_ACCEPTABLE_SITE_PRECISION_OR_IDENTITY":"NO_GEOCODE_RESULTS",
          alternative_results:results.slice(0,2).map(c=>({display_name:c.display_name,lat:c.lat,lon:c.lon,type:c.addresstype}))});stats.held++;continue;
      }
      const geo=nominatimGeoFromSelection(best,{geocodedAt:new Date().toISOString()});
      if(!geo||geo.matched_country_code!==country){marker.held.push({...state,reason:"COUNTRY_MISMATCH"});stats.held++;continue}
      marker.accepted.push({type:"Feature",geometry:{type:"Point",coordinates:[geo.lng,geo.lat]},properties:{
         source_id:"V19:"+id,name,iso:country,locality:row.l||"",
         affiliation_label:provider==="cmri"?"CMRI":provider==="diocesan"?"Diocesan":provider==="cspv"?"SSPV/CSPV":provider==="rci"?"RCI":provider,
         address,source_url:source||"https://github.com/Fulcanelli13/ad-orientem/blob/main/data/directory/generated/v19/"+provider+".v1.json",
         coordinate_origin:"OSM_NOMINATIM_GEOCODE",location_precision:geo.precision,osm_source_ref:geo.source_ref,geo_score:geo.match_score,
         map_gate:"PROVISIONAL_REQUIRES_REVIEW",geocode_attribution:"© OpenStreetMap contributors, ODbL 1.0",
         note:"Geocoder candidate: source address and country passed scoring; not independently church-entrance verified."
      }});stats.candidates++;
    }catch(e){
      marker.errors.push({...state,error:String(e)});marker.held.push({...state,reason:"GEOCODER_NETWORK_ERROR"});stats.held++;
      if(e.status===429||e.status===403){marker.rate_limited=true;break}
    }
  }
  console.log("PROVIDER",provider,JSON.stringify(stats));
  if(marker.rate_limited)break;
}
await fs.mkdir(out,{recursive:true});
await fs.writeFile(path.join(out,"r39-uncached-candidate-pins.geojson"),JSON.stringify({type:"FeatureCollection",metadata:{
 status:"RESEARCH_ONLY_NOT_PUBLISHED",source:"Nominatim address geocoding",precision:"site-scale unverified",
 license:"OpenStreetMap ODbL attribution required",no_schedule_import:true},features:marker.accepted},null,2));
await fs.writeFile(path.join(out,"r39-geocode-holds.json"),JSON.stringify(marker.held,null,2));
await fs.writeFile(path.join(out,"r39-geocode-report.json"),JSON.stringify({requested:marker.requested,accepted:marker.accepted.length,holds:marker.held.length,errors:marker.errors.length,provider_count:marker.provider_count,rate_limited:!!marker.rate_limited,date:stamp},null,2));
console.log("R39_FINISH",JSON.stringify({requested:marker.requested,accepted:marker.accepted.length,holds:marker.held.length,rate_limited:!!marker.rate_limited}));