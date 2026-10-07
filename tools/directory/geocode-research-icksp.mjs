import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expandResearchProviderSnapshot } from "../../src/find/data-service.js";
import { auditDirectoryGeo, isMapPublishableGeo } from "../../src/find/geo-provenance.js";
import {
  buildDirectoryAddressOnlyQuery,
  buildDirectoryGeocodeQuery,
  buildDirectoryStructuredAttempts,
  geocodeCacheKey,
  structuredGeocodeFingerprint,
  nominatimGeoFromSelection,
  selectNominatimCandidate,
} from "./lib/geocode-utils.mjs";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const SNAPSHOT_PATH=path.join(ROOT,"data/directory/generated/v19/icksp-federated.v1.json");
const OVERLAY_PATH=path.join(ROOT,"data/directory/generated/v19/icksp-federated.geo.v1.json");
const GEOJSON_PATH=path.join(ROOT,"data/directory/generated/v19/icksp-federated.geojson");
const REPORT_PATH=path.join(ROOT,"data/directory/generated/v19/icksp-federated-geocode-report.v1.json");
const CACHE_PATH=path.join(ROOT,"data/directory/geocoding-cache.v1.json");
const ENDPOINT=process.env.AO_GEOCODER_ENDPOINT??"https://nominatim.openstreetmap.org/search";
const OFFICIAL_PUBLIC=/^https:\/\/nominatim\.openstreetmap\.org\//i.test(ENDPOINT);
const ACK=process.env.AO_PUBLIC_NOMINATIM_ACK==="1";
const OFFLINE=process.env.AO_GEOCODER_OFFLINE==="1";
const DELAY_MS=Math.max(Number(process.env.AO_GEOCODER_DELAY_MS??1100),OFFICIAL_PUBLIC?1100:0);
const MAX_REQUESTS=Number(process.env.AO_GEOCODER_MAX_REQUESTS??500);
const USER_AGENT="AdOrientemDirectoryResearchGeocoder/1.0 (+https://github.com/Fulcanelli13/ad-orientem)";

function safeArray(v){return Array.isArray(v)?v:[]}
async function readJson(file,fallback=null){
  try{return JSON.parse(await fs.readFile(file,"utf8"))}
  catch(error){if(error?.code==="ENOENT")return fallback;throw error}
}
async function writeJson(file,value){
  await fs.mkdir(path.dirname(file),{recursive:true});
  await fs.writeFile(file,JSON.stringify(value,null,2)+"\n","utf8");
}
function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms))}
function slimCandidate(candidate){
  return {
    lat:candidate?.lat??null,lon:candidate?.lon??null,display_name:candidate?.display_name??null,
    name:candidate?.name??null,type:candidate?.type??null,addresstype:candidate?.addresstype??null,
    category:candidate?.category??candidate?.class??null,osm_type:candidate?.osm_type??null,
    osm_id:candidate?.osm_id??null,importance:candidate?.importance??null,
    address:candidate?.address??{},namedetails:candidate?.namedetails??{},
  };
}
const cache=await readJson(CACHE_PATH,{
  schema:"AO_DIRECTORY_GEOCODING_CACHE_V1",
  provider:"OSM_NOMINATIM",
  endpoint:ENDPOINT,
  attribution:"© OpenStreetMap contributors, ODbL 1.0",
  records:{},
});
cache.records=cache.records??{};
let lastRequestAt=0,networkRequests=0;

async function fetchQuery({query,params,countryCode,key}){
  if(cache.records[key])return cache.records[key];
  if(OFFLINE)return {query,structured_params:params??null,country_code:countryCode,fetched_at:null,offline_miss:true,results:[]};
  if(OFFICIAL_PUBLIC&&!ACK)throw new Error("Public Nominatim use requires AO_PUBLIC_NOMINATIM_ACK=1");
  if(networkRequests>=MAX_REQUESTS)throw new Error("AO_GEOCODER_MAX_REQUESTS exceeded");
  const wait=Math.max(0,DELAY_MS-(Date.now()-lastRequestAt));
  if(wait)await sleep(wait);
  const url=new URL(ENDPOINT);
  url.searchParams.set("format","jsonv2");
  url.searchParams.set("limit","5");
  url.searchParams.set("addressdetails","1");
  url.searchParams.set("namedetails","1");
  url.searchParams.set("countrycodes",String(countryCode).toLowerCase());
  if(params){
    for(const [name,value] of Object.entries(params)){
      if(value!==null&&value!==undefined&&String(value).trim())url.searchParams.set(name,String(value).trim());
    }
  }else url.searchParams.set("q",query);
  lastRequestAt=Date.now(); networkRequests+=1;
  const response=await fetch(url,{headers:{"user-agent":USER_AGENT,accept:"application/json","accept-language":"en"}});
  if(!response.ok)throw new Error("Geocoder HTTP "+response.status+" for "+(query??structuredGeocodeFingerprint(params)));
  const record={
    query:params?null:query,structured_params:params??null,country_code:String(countryCode).toUpperCase(),
    fetched_at:new Date().toISOString(),results:safeArray(await response.json()).map(slimCandidate),
  };
  cache.records[key]=record;
  if(networkRequests%20===0)await writeJson(CACHE_PATH,cache);
  return record;
}

const snapshot=await readJson(SNAPSHOT_PATH);
const previous=await readJson(OVERLAY_PATH,{records:[]});
const previousByVenue=new Map(safeArray(previous?.records).map(x=>[x?.venue_id,x?.geo]).filter(([id,geo])=>id&&geo));
const expanded=expandResearchProviderSnapshot(snapshot);
const runStarted=new Date().toISOString();
const report={
  schema:"AO_DIRECTORY_RESEARCH_GEOCODE_REPORT_V1",provider:"ICKSP_FEDERATED_V13",
  generated_at:runStarted,total:expanded.venues.length,existing_valid:0,accepted:0,
  primary_accepted:0,fallback_accepted:0,structured_accepted:0,unresolved:0,invalid_existing:0,
  by_precision:{building:0,address:0,street:0,locality:0,region:0,unknown:0},
  unresolved_records:[],
};
const records=[];
for(const original of expanded.venues){
  const venue=structuredClone(original);
  const countryCode=String(venue?.address?.country_code??"").toUpperCase();
  const oldGeo=previousByVenue.get(venue.venue_id);
  if(oldGeo)venue.geo=oldGeo;
  if(isMapPublishableGeo(venue.geo,countryCode)){
    report.existing_valid+=1;
    report.by_precision[venue.geo.precision]=(report.by_precision[venue.geo.precision]??0)+1;
    records.push({venue_id:venue.venue_id,geo:venue.geo});
    continue;
  }
  if(oldGeo){
    report.invalid_existing+=1;
    report.unresolved_records.push({venue_id:venue.venue_id,reason:"EXISTING_COORDINATE_PROVENANCE_INVALID",issues:auditDirectoryGeo(oldGeo,{countryCode})});
    continue;
  }
  const primary=buildDirectoryGeocodeQuery(venue),fallback=buildDirectoryAddressOnlyQuery(venue);
  if(!primary||!countryCode){
    report.unresolved+=1;
    report.unresolved_records.push({venue_id:venue.venue_id,reason:"NO_QUERY_OR_COUNTRY"});
    continue;
  }
  const attempts=[
    {kind:"PRIMARY_NAME_ADDRESS",query:primary},
    {kind:"FALLBACK_ADDRESS_ONLY",query:fallback},
    ...buildDirectoryStructuredAttempts(venue).map(a=>({...a,query:"structured:"+structuredGeocodeFingerprint(a.params)})),
  ];
  let chosen=null; const seen=new Set(),attemptLog=[];
  for(const attempt of attempts){
    if(!attempt.query||seen.has(attempt.query))continue;
    seen.add(attempt.query);
    const key=geocodeCacheKey({query:attempt.query,countryCode});
    const cached=await fetchQuery({query:attempt.query,params:attempt.params??null,countryCode,key});
    const selection=selectNominatimCandidate(venue,cached.results);
    attemptLog.push({kind:attempt.kind,query:attempt.query,key,candidate_count:safeArray(cached.results).length});
    if(selection){chosen={...attempt,key,selection};break}
  }
  if(!chosen){
    report.unresolved+=1;
    report.unresolved_records.push({venue_id:venue.venue_id,name:venue?.name?.official,address:venue?.address?.formatted,reason:"NO_TRUSTWORTHY_MATCH",attempts:attemptLog});
    continue;
  }
  const geo=nominatimGeoFromSelection(chosen.selection,{geocodedAt:runStarted,cacheKey:chosen.key});
  const issues=auditDirectoryGeo(geo,{countryCode,path:"geo"});
  if(issues.length){
    report.unresolved+=1;
    report.unresolved_records.push({venue_id:venue.venue_id,reason:"SELECTED_GEO_FAILED_CONTRACT",issues});
    continue;
  }
  records.push({venue_id:venue.venue_id,geo});
  report.accepted+=1;
  if(chosen.kind==="PRIMARY_NAME_ADDRESS")report.primary_accepted+=1;
  else if(chosen.kind==="FALLBACK_ADDRESS_ONLY")report.fallback_accepted+=1;
  else report.structured_accepted+=1;
  report.by_precision[geo.precision]=(report.by_precision[geo.precision]??0)+1;
}
const geoByVenue=new Map(records.map(x=>[x.venue_id,x.geo]));
const geojson={
  type:"FeatureCollection",
  features:expanded.venues.flatMap(venue=>{
    const geo=geoByVenue.get(venue.venue_id);
    if(!geo||!isMapPublishableGeo(geo,venue?.address?.country_code))return [];
    return [{type:"Feature",geometry:{type:"Point",coordinates:[Number(geo.lng),Number(geo.lat)]},properties:{
      venue_id:venue.venue_id,name:venue?.name?.official??null,venue_type:venue?.venue_type??null,
      country_code:venue?.address?.country_code??null,city:venue?.address?.city??null,
      community_id:"ICKSP",precision:geo.precision,geocoding_source:geo.geocoding_source,
    }}];
  })
};
report.mapped=geojson.features.length;
report.network_requests=networkRequests;
await writeJson(OVERLAY_PATH,{schema:"AO_DIRECTORY_RESEARCH_GEO_OVERLAY_V1",provider:"ICKSP_FEDERATED_V13",generated_at:runStarted,records});
await writeJson(GEOJSON_PATH,geojson);
await writeJson(REPORT_PATH,report);
if(networkRequests){
  cache.updated_at=runStarted;
  cache.network_requests_this_run=networkRequests;
  await writeJson(CACHE_PATH,cache);
}
console.log(JSON.stringify(report,null,2));
