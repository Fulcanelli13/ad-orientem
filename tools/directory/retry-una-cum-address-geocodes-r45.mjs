import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {cleanDirectoryAddress,selectNominatimCandidate,nominatimGeoFromSelection,geocodeCacheKey} from "./lib/geocode-utils.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const records=JSON.parse(await fs.readFile(path.join(root,"data/directory/research/staging/map-first-r37/r45-alternate-address-queue.json"),"utf8")).records;
if(records.length!==375)throw Error("R45_QUEUE_SIZE_NOT_375");
const output=path.join(process.env.RUNNER_TEMP||"/tmp","r45-una-cum-geocoding");
const report={submitted:records.length,attempted:0,requests:0,cache_hits:0,accepted:0,held:0,errors:0,skipped_non_worship:0,rate_limited:false,per_affiliation:{},per_country:{},attribution:"© OpenStreetMap contributors, ODbL 1.0"};
let last=0;const cache=new Map(),pins=[],holds=[],errors=[];
const nap=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const norm=s=>String(s||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const stopFacility=/\b(?:house|residence|headquarters|office|rectory|seminary|presbytery|apostolate|provincialate|novitiate)\b/i;
const worshipWord=/\b(?:church|parish|chapel|oratory|shrine|basilica|cathedral|sanctuary|abbey|monastery|eglise|chapelle|iglesia|igrej[a-z]+|kirche|parrocchia|chiesa|paroisse)\b/i;
const headNames={Diocesan:0,FSSP:1,ICKSP:2,IBP:3,Oratorians:4,AASJMV:5};
const sorted=[...records].sort((a,b)=>(headNames[a.aff]??9)-(headNames[b.aff]??9)||a.cc.localeCompare(b.cc)||a.name.localeCompare(b.name));
async function query(q,cc){
 const key=geocodeCacheKey({query:q,countryCode:cc});
 if(cache.has(key)){report.cache_hits++;return cache.get(key)}
 const lag=Date.now()-last;if(lag<1400)await nap(1400-lag);
 last=Date.now();report.requests++;
 const url=new URL("https://nominatim.openstreetmap.org/search");
 url.search=new URLSearchParams({q,countrycodes:cc.toLowerCase(),format:"jsonv2",addressdetails:"1",namedetails:"1",limit:"3",accept_language:"en"}).toString();
 const res=await fetch(url,{headers:{"User-Agent":"AdOrientemDirectoryResearch/1.0 (https://github.com/Fulcanelli13/ad-orientem; one-time Rome-recognised venue location lookup)","Referer":"https://github.com/Fulcanelli13/ad-orientem","Accept":"application/json"},signal:AbortSignal.timeout(19000)});
 if(!res.ok){const e=new Error("NOMINATIM_HTTP_"+res.status);e.status=res.status;throw e}
 const data=await res.json();if(!Array.isArray(data))throw Error("UNEXPECTED_GEOCODER_FORMAT");
 cache.set(key,data);return data;
}
const significant=s=>new Set(norm(s).split(/\s+/).filter(x=>x.length>=4));
function nameAgreement(source,candidate){
 const a=significant(source),b=significant([candidate.name,...Object.values(candidate.namedetails||{}),String(candidate.display_name||"").split(",")[0]].join(" "));
 if(!a.size)return 0;
 let match=0;for(const x of a)if(b.has(x))match++;
 return match/a.size;
}
for(const r of sorted){
 report.attempted++;
 report.per_affiliation[r.aff]??={seen:0,accepted:0,held:0};
 report.per_affiliation[r.aff].seen++;
 report.per_country[r.cc]??={seen:0,accepted:0,held:0};
 report.per_country[r.cc].seen++;
 const base={source_id:r.id,name:r.name,iso:r.cc,address:r.address,source_url:r.source_url,affiliation:r.aff,origin_family:r.origin_family};
 const hold=(reason,extra={})=>{holds.push({...base,reason,...extra});report.per_affiliation[r.aff].held++;report.per_country[r.cc].held++};
 if(!r.name||!r.cc||!r.source_url?.startsWith("http")){hold("INVALID_SOURCE_RECORD");continue}
 if(stopFacility.test(r.name)&&!worshipWord.test(r.name)){
  report.skipped_non_worship++;hold("NON_PUBLIC_MASS_FACILITY");continue;
 }
 const addr=cleanDirectoryAddress(r.address);
 if(addr.length<5){hold("INSUFFICIENT_LOCATION_TEXT");continue}
 const venue={name:{official:r.name},address:{formatted:addr,country_code:r.cc,city:r.city||undefined}};
 const queries=[[r.name,addr].filter(Boolean).join(", ")];
 // If a full street address has no named-place match, try the locality/postcode rather than repeating address-only search.
 const segments=addr.split(",").map(s=>s.trim()).filter(Boolean);
 const tail=segments.slice(-2).join(", ")||addr;
 const alternative=[r.name,r.city||tail].filter(Boolean).join(", ");
 if(norm(alternative)!==norm(queries[0]))queries.push(alternative);
 let selection=null,attempt=0,query_used="",reviewCandidates=[];
 try{
  for(const q of queries){
   attempt++;const results=await query(q.slice(0,275),r.cc);
   const eligible=results.filter(c=>String(c.address?.country_code||"").toUpperCase()===r.cc);
   let chosen=selectNominatimCandidate(venue,eligible);
   if(!chosen){
    const strong=eligible.map(c=>({candidate:c,precision:String(c.addresstype||""),name_match:nameAgreement(r.name,c)}))
      .filter(x=>["place_of_worship","church","chapel","cathedral","shrine","building","amenity"].includes(x.precision)&&x.name_match>=0.66)
      .sort((a,b)=>b.name_match-a.name_match);
    if(strong.length===1)chosen={candidate:strong[0].candidate,precision:"building",score:0.44};
   }
   if(chosen&&["building","address","street"].includes(chosen.precision)){
    // Ensure an exact named place or source-address agreement; avoid a random postcode or city centroid.
    const name_match=nameAgreement(r.name,chosen.candidate);
    const isNamedBuilding=chosen.precision==="building"&&name_match>=0.40;
    const isAddressMatch=["address","street"].includes(chosen.precision)&&chosen.score>=0.52;
    if(isNamedBuilding||isAddressMatch){
     selection=chosen;query_used=q;break;
    }
   }
   reviewCandidates.push(...eligible.slice(0,2).map(c=>({name:c.display_name,type:c.addresstype,lat:c.lat,lon:c.lon})));
  }
  if(!selection){hold("NO_ACCEPTED_NAMED_SITE", {tries:attempt,candidates:reviewCandidates.slice(0,3)});continue}
  const geo=nominatimGeoFromSelection(selection);
  if(!geo||geo.matched_country_code!==r.cc){hold("COUNTRY_OR_COORDINATE_MISMATCH");continue}
  pins.push({type:"Feature",geometry:{type:"Point",coordinates:[geo.lng,geo.lat]},properties:{
   ...base,coordinate_precision:geo.precision,coordinate_origin:"OSM_NOMINATIM_NAME_AND_ADDRESS",
   matched_source_ref:geo.source_ref,match_score:geo.match_score,attempts:attempt,
   query_used,attribution:geo.attribution,provisional:true,needs_physical_identity_reconciliation:true,
   note:"Not a certified entrance, individual una cum liturgy or verified current schedule"
  }});
  report.per_affiliation[r.aff].accepted++;report.per_country[r.cc].accepted++;
 }catch(e){
  errors.push({...base,error:String(e)});hold("GEOCODER_NETWORK_ERROR");
  if(e.status===403||e.status===429){report.rate_limited=true;break}
 }
}
report.accepted=pins.length;report.held=holds.length;report.errors=errors.length;
report.unprocessed=records.length-report.attempted;
await fs.mkdir(output,{recursive:true});
await Promise.all([
 fs.writeFile(path.join(output,"source-pins.geojson"),JSON.stringify({type:"FeatureCollection",metadata:{status:"RESEARCH_ONLY",attribution:"© OpenStreetMap contributors, ODbL 1.0",no_schedules:true},features:pins},null,2)),
 fs.writeFile(path.join(output,"holds.json"),JSON.stringify(holds,null,2)),
 fs.writeFile(path.join(output,"errors.json"),JSON.stringify(errors,null,2)),
 fs.writeFile(path.join(output,"report.json"),JSON.stringify(report,null,2))
]);
console.log("R45_ALTERNATE_ADDRESS_RESULTS",JSON.stringify(report));
if(report.rate_limited)process.exitCode=2;
