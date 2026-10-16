import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {selectNominatimCandidate,nominatimGeoFromSelection,cleanDirectoryAddress} from "./lib/geocode-utils.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const input="data/directory/research/staging/map-first-r37/r52-priority-named-worship-addresses.json";
const rows=JSON.parse(await fs.readFile(path.join(root,input),"utf8")).records;
if(rows.length!==66)throw new Error("R52 queue count unexpectedly changed");
const out=path.join(process.env.RUNNER_TEMP??"/tmp","r52-priority-worship-geocodes");
const accepted=[],held=[],errors=[],cache=new Map(),report={input:66,requested:0,cache_hits:0,precise_candidates:0,held:0,errors:0,rate_limited:false,by_country:{},notes:"Candidates for review; no automatic release, no street-level driving directions"};
let last=0;
const nap=ms=>new Promise(ok=>setTimeout(ok,ms));
const normalize=s=>String(s??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").replace(/\s+/g," ").trim();
const sharedWords=new Set(["church","chapel","parish","catholic","saint","sainte","st","sts","santa","santo","eglise","chapelle","chiesa","kirche","kapelle","kostel","basilica","basilique","paroisse","parrocchia","pfarrkirche","our","lady","notre","dame","the","and","des","der","les","de","of","du","la","del","di"]);
const words=s=>[...new Set(normalize(s).split(" ").filter(x=>x.length>=4&&!sharedWords.has(x)))];
function nameScore(name,c){
 const original=words(name);
 const labels=[c.name,...Object.values(c.namedetails??{}),String(c.display_name??"").split(",")[0]].join(" ");
 const found=new Set(words(labels));
 return original.length?original.filter(x=>found.has(x)).length/original.length:0;
}
function locality(row){
 const a=cleanDirectoryAddress(row.address);
 const pattern=[
   /(?:^|[ -])(?:A-|B-|CH-|F-|CZ-|PL\s*|I-)(?:\d{4,6}|[A-Z]\d[A-Z])\s*([^,-]{3,48})/i,
   /(?:[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})\s*(?:-)?\s*(?:Great Britain|United Kingdom)?/i,
 ];
 const chunks=a.split(/\s+-\s+|,\s*/).map(x=>x.trim()).filter(Boolean);
 const end=chunks.at(-2)??chunks.at(-1)??a;
 const postcodeFirst=a.match(pattern[0]);
 if(postcodeFirst)return postcodeFirst[1].split(/\s+-\s+/)[0].trim();
 if(row.city?.trim())return row.city.trim();
 if(chunks.length>1)return end;
 return a;
}
async function geocode(q,country){
 const cacheKey=country+"|"+q;
 if(cache.has(cacheKey)){report.cache_hits++;return cache.get(cacheKey)}
 const wait=Date.now()-last;if(wait<1450)await nap(1450-wait);
 last=Date.now();report.requested++;
 const u=new URL("https://nominatim.openstreetmap.org/search");
 u.search=new URLSearchParams({q:q.slice(0,280),countrycodes:country.toLowerCase(),format:"jsonv2",addressdetails:"1",namedetails:"1",limit:"5",accept_language:"en"}).toString();
 const res=await fetch(u,{headers:{"User-Agent":"AdOrientemDirectoryResearch/1.0 (https://github.com/Fulcanelli13/ad-orientem; one-time named worship geocoding)","Referer":"https://github.com/Fulcanelli13/ad-orientem","Accept":"application/json"},signal:AbortSignal.timeout(20000)});
 if(!res.ok){const e=new Error("NOMINATIM_HTTP_"+res.status);e.status=res.status;throw e}
 const json=await res.json();if(!Array.isArray(json))throw Error("INVALID_GEOCODE_RESPONSE");
 cache.set(cacheKey,json);return json;
}
for(const row of rows){
 const base={source_id:row.id,name:row.name,cc:row.cc,affiliation:row.aff,address:row.address,original_source_url:row.url};
 report.by_country[row.cc]??={input:0,candidates:0,held:0};report.by_country[row.cc].input++;
 if(!row.name||!row.address||!/^[A-Z]{2}$/.test(row.cc)||!/^https?:\/\//.test(row.url)){
  held.push({...base,reason:"INVALID_SOURCE"});report.by_country[row.cc].held++;continue;
 }
 const simplified=locality(row);
 const tries=[
  {kind:"NAMED_SITE_ADDRESS",q:row.name+", "+cleanDirectoryAddress(row.address)},
  {kind:"NAMED_SITE_LOCALITY",q:row.name+", "+simplified},
 ];
 // Only two Nominatim lookups for each record. Address-only was already exhausted in R43/R45.
 const observed=[],precise=[];
 try{
  for(const attempt of tries){
   if(observed.length&&precise.length)break;
   const candidates=await geocode(attempt.q,row.cc);
   for(const c of candidates){
    if(String(c.address?.country_code||"").toUpperCase()!==row.cc)continue;
    const n=nameScore(row.name,c);
    const type=String(c.addresstype??c.type??"").toLowerCase();
    const building=/^(place_of_worship|church|chapel|cathedral|basilica|shrine|monastery|convent|building|amenity)$/.test(type);
    const lat=Number(c.lat),lng=Number(c.lon);
    if(!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180)continue;
    const candidate={lat,lng,name:c.name||"",display_name:c.display_name||"",osm_ref:String(c.osm_type??"")+":"+String(c.osm_id??""),type,name_overlap:Number(n.toFixed(3)),attempt:attempt.kind};
    observed.push(candidate);
    if(building&&n>=0.65)precise.push(candidate);
   }
  }
  const unique=new Map();
  for(const c of precise)unique.set(c.osm_ref,c);
  const matches=[...unique.values()];
  if(matches.length!==1){held.push({...base,reason:matches.length>1?"MULTIPLE_NAMED_BUILDINGS":"NO_SITE_SCALE_MATCH",matches,other_results:observed.slice(0,5)});report.by_country[row.cc].held++;continue}
  const chosen=matches[0];
  accepted.push({type:"Feature",geometry:{type:"Point",coordinates:[chosen.lng,chosen.lat]},properties:{
   ...base,source_url:row.url,coordinate_source:"OSM_NOMINATIM_NAME_LOCALITY_R52",coordinates_provisional:true,
   osm_source_ref:chosen.osm_ref,reported_venue:chosen.name,matched_display_name:chosen.display_name,
   named_match_score:chosen.name_overlap,geo_type:chosen.type,attempt:chosen.attempt,
   status:"RESEARCH_ONLY_PENDING_DUPLICATE_RECONCILIATION",attribution:"© OpenStreetMap contributors, ODbL 1.0"
  }});report.by_country[row.cc].candidates++;
 }catch(e){
  errors.push({...base,error:String(e)});
  held.push({...base,reason:"LOOKUP_ERROR",error:String(e)});report.by_country[row.cc].held++;
  if(e.status===429||e.status===403){report.rate_limited=true;break}
 }
}
report.precise_candidates=accepted.length;report.held=held.length;report.errors=errors.length;report.not_processed=66-accepted.length-held.length;
await fs.mkdir(out,{recursive:true});
await Promise.all([
 fs.writeFile(path.join(out,"named-site-candidates.geojson"),JSON.stringify({type:"FeatureCollection",metadata:{status:"RESEARCH_ONLY_NOT_PUBLISHED",attribution:"© OpenStreetMap contributors, ODbL 1.0"},features:accepted},null,2)),
 fs.writeFile(path.join(out,"held.json"),JSON.stringify(held,null,2)),
 fs.writeFile(path.join(out,"errors.json"),JSON.stringify(errors,null,2)),
 fs.writeFile(path.join(out,"report.json"),JSON.stringify(report,null,2))
]);
console.log("R52_COMPLETE",JSON.stringify(report));
if(report.rate_limited)process.exitCode=2;
