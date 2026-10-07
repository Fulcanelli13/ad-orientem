import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { auditVenue } from "../../src/find/contracts.js";
import { auditDirectoryGeo, hasDirectoryCoordinates, isMapPublishableGeo } from "../../src/find/geo-provenance.js";
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
const GENERATED=path.join(ROOT,"data/directory/generated");
const CACHE_PATH=path.join(ROOT,"data/directory/geocoding-cache.v1.json");
const PROVIDERS=(process.env.AO_GEOCODE_PROVIDERS??"fssp,icksp,ibp,sspx").split(",").map(x=>x.trim()).filter(Boolean);
const ENDPOINT=process.env.AO_GEOCODER_ENDPOINT??"https://nominatim.openstreetmap.org/search";
const USER_AGENT="AdOrientemDirectoryGeocoder/1.0 (+https://github.com/Fulcanelli13/ad-orientem)";
const OFFICIAL_PUBLIC=/^https:\/\/nominatim\.openstreetmap\.org\//i.test(ENDPOINT);
const ACK=process.env.AO_PUBLIC_NOMINATIM_ACK==="1";
const OFFLINE=process.env.AO_GEOCODER_OFFLINE==="1";
const DELAY_MS=Math.max(Number(process.env.AO_GEOCODER_DELAY_MS??1100),OFFICIAL_PUBLIC?1100:0);
const MAX_REQUESTS=Number(process.env.AO_GEOCODER_MAX_REQUESTS??1000);

function safeArray(value){return Array.isArray(value)?value:[]}
async function readJson(file,fallback=null){
  try{return JSON.parse(await fs.readFile(file,"utf8"))}catch(error){
    if(error?.code==="ENOENT")return fallback;
    throw error;
  }
}
async function writeJson(file,value){
  await fs.mkdir(path.dirname(file),{recursive:true});
  await fs.writeFile(file,JSON.stringify(value,null,2)+"\n","utf8");
}
function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms))}
function slimCandidate(candidate){
  return {
    lat:candidate?.lat??null,
    lon:candidate?.lon??null,
    display_name:candidate?.display_name??null,
    name:candidate?.name??null,
    type:candidate?.type??null,
    addresstype:candidate?.addresstype??null,
    category:candidate?.category??candidate?.class??null,
    osm_type:candidate?.osm_type??null,
    osm_id:candidate?.osm_id??null,
    importance:candidate?.importance??null,
    address:candidate?.address??{},
    namedetails:candidate?.namedetails??{},
  };
}
function makeGeoJson(venues,ministries){
  const ministryByVenue=new Map(safeArray(ministries).map(m=>[m.venue_id,m]));
  return {
    type:"FeatureCollection",
    features:safeArray(venues).flatMap(venue=>{
      if(!isMapPublishableGeo(venue?.geo,venue?.address?.country_code))return [];
      const ministry=ministryByVenue.get(venue.venue_id);
      return [{
        type:"Feature",
        geometry:{type:"Point",coordinates:[Number(venue.geo.lng),Number(venue.geo.lat)]},
        properties:{
          venue_id:venue.venue_id,
          name:venue?.name?.official??null,
          venue_type:venue.venue_type??null,
          country_code:venue?.address?.country_code??null,
          city:venue?.address?.city??null,
          community_id:ministry?.community_id??"UNKNOWN",
          precision:venue?.geo?.precision??"unknown",
          approximate:["street","locality"].includes(String(venue?.geo?.precision??"").toLowerCase()),
          geocoding_source:venue?.geo?.geocoding_source??null,
        }
      }];
    })
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
const runStarted=new Date().toISOString();
const overall={schema:"AO_DIRECTORY_GEOCODING_REPORT_V1",generated_at:runStarted,provider:"OSM_NOMINATIM",endpoint:ENDPOINT,providers:{}};

async function fetchStructuredCandidates(params,countryCode,key){
  if(cache.records[key])return cache.records[key];
  if(OFFLINE)return {structured_params:params,country_code:String(countryCode).toUpperCase(),fetched_at:null,offline_miss:true,results:[]};
  if(OFFICIAL_PUBLIC&&!ACK){
    throw new Error("Public Nominatim use requires AO_PUBLIC_NOMINATIM_ACK=1 after reviewing https://operations.osmfoundation.org/policies/nominatim/");
  }
  if(networkRequests>=MAX_REQUESTS)throw new Error("AO_GEOCODER_MAX_REQUESTS exceeded");
  const wait=Math.max(0,DELAY_MS-(Date.now()-lastRequestAt));
  if(wait)await sleep(wait);
  const url=new URL(ENDPOINT);
  url.searchParams.set("format","jsonv2");
  url.searchParams.set("limit","5");
  url.searchParams.set("addressdetails","1");
  url.searchParams.set("namedetails","1");
  url.searchParams.set("countrycodes",String(countryCode).toLowerCase());
  for(const [name,value] of Object.entries(params??{})){
    if(value!==null&&value!==undefined&&String(value).trim())url.searchParams.set(name,String(value).trim());
  }
  lastRequestAt=Date.now();
  networkRequests+=1;
  const response=await fetch(url,{
    headers:{
      "user-agent":USER_AGENT,
      "accept":"application/json",
      "accept-language":"en",
    }
  });
  if(!response.ok)throw new Error("Geocoder HTTP "+response.status+" for structured "+structuredGeocodeFingerprint(params));
  const raw=await response.json();
  const record={
    structured_params:params,
    country_code:String(countryCode).toUpperCase(),
    fetched_at:new Date().toISOString(),
    results:safeArray(raw).map(slimCandidate),
  };
  cache.records[key]=record;
  if(networkRequests%20===0)await writeJson(CACHE_PATH,cache);
  return record;
}

async function fetchCandidates(query,countryCode,key){
  if(cache.records[key])return cache.records[key];
  if(OFFLINE)return {query,country_code:String(countryCode).toUpperCase(),fetched_at:null,offline_miss:true,results:[]};
  if(OFFICIAL_PUBLIC&&!ACK){
    throw new Error("Public Nominatim use requires AO_PUBLIC_NOMINATIM_ACK=1 after reviewing https://operations.osmfoundation.org/policies/nominatim/");
  }
  if(networkRequests>=MAX_REQUESTS)throw new Error("AO_GEOCODER_MAX_REQUESTS exceeded");
  const wait=Math.max(0,DELAY_MS-(Date.now()-lastRequestAt));
  if(wait)await sleep(wait);
  const url=new URL(ENDPOINT);
  url.searchParams.set("format","jsonv2");
  url.searchParams.set("limit","5");
  url.searchParams.set("addressdetails","1");
  url.searchParams.set("namedetails","1");
  url.searchParams.set("q",query);
  url.searchParams.set("countrycodes",String(countryCode).toLowerCase());
  lastRequestAt=Date.now();
  networkRequests+=1;
  const response=await fetch(url,{
    headers:{
      "user-agent":USER_AGENT,
      "accept":"application/json",
      "accept-language":"en",
    }
  });
  if(!response.ok)throw new Error("Geocoder HTTP "+response.status+" for "+query);
  const raw=await response.json();
  const record={
    query,
    country_code:String(countryCode).toUpperCase(),
    fetched_at:new Date().toISOString(),
    results:safeArray(raw).map(slimCandidate),
  };
  cache.records[key]=record;
  if(networkRequests%20===0)await writeJson(CACHE_PATH,cache);
  return record;
}

for(const provider of PROVIDERS){
  const dir=path.join(GENERATED,provider);
  const venueFile=path.join(dir,"venues.v1.json");
  const ministryFile=path.join(dir,"ministries.v1.json");
  const reportFile=path.join(dir,"import-report.v1.json");
  const issuesFile=path.join(dir,"validation-issues.v1.json");
  const geoFile=path.join(dir,"geo.v1.geojson");
  const geocodeReportFile=path.join(dir,"geocode-report.v1.json");
  const venueDoc=await readJson(venueFile);
  const ministryDoc=await readJson(ministryFile);
  const importReport=await readJson(reportFile);
  const previousGeocodeReport=await readJson(geocodeReportFile,{unresolved_records:[]});
  const previousPrimaryQueryByVenue=new Map(
    safeArray(previousGeocodeReport?.unresolved_records)
      .map(record=>{
        const previousPrimary=record?.query
          ?? safeArray(record?.attempts).find(attempt=>attempt?.kind==="PRIMARY_NAME_ADDRESS")?.query
          ?? null;
        return [record?.venue_id,previousPrimary];
      })
      .filter(([venueId,query])=>venueId&&query)
  );
  if(!venueDoc?.records)throw new Error("Missing venue corpus for "+provider);

  const venues=venueDoc.records;
  const report={
    schema:"AO_DIRECTORY_PROVIDER_GEOCODE_REPORT_V1",
    provider:provider.toUpperCase(),
    generated_at:new Date().toISOString(),
    total:venues.length,
    existing_valid:0,
    accepted:0,
    primary_accepted:0,
    fallback_accepted:0,
    structured_accepted:0,
    unresolved:0,
    existing_invalid:0,
    by_precision:{building:0,address:0,street:0,locality:0,region:0,unknown:0},
    unresolved_records:[],
  };

  for(const venue of venues){
    const countryCode=String(venue?.address?.country_code??"").toUpperCase();
    if(isMapPublishableGeo(venue?.geo,countryCode)){
      report.existing_valid+=1;
      report.by_precision[venue.geo.precision]=(report.by_precision[venue.geo.precision]??0)+1;
      continue;
    }
    if(hasDirectoryCoordinates(venue?.geo)){
      report.existing_invalid+=1;
      report.unresolved_records.push({venue_id:venue.venue_id,reason:"EXISTING_COORDINATE_PROVENANCE_INVALID",issues:auditDirectoryGeo(venue.geo,{countryCode})});
      continue;
    }
    const currentPrimaryQuery=buildDirectoryGeocodeQuery(venue);
    const previousPrimaryQuery=previousPrimaryQueryByVenue.get(venue.venue_id)??null;
    const primaryQuery=previousPrimaryQuery??currentPrimaryQuery;
    const fallbackQuery=buildDirectoryAddressOnlyQuery(venue);
    if(!primaryQuery||!countryCode){
      report.unresolved+=1;
      report.unresolved_records.push({venue_id:venue.venue_id,reason:"NO_QUERY_OR_COUNTRY",query:primaryQuery});
      continue;
    }

    const attempts=[];
    let chosen=null;
    const geocodeAttempts=[
      {kind:"PRIMARY_NAME_ADDRESS",query:primaryQuery},
      {kind:"FALLBACK_ADDRESS_ONLY",query:fallbackQuery},
      ...buildDirectoryStructuredAttempts(venue).map(attempt=>({
        ...attempt,
        query:"structured:"+structuredGeocodeFingerprint(attempt.params),
      })),
    ];
    for(const attempt of geocodeAttempts){
      if(!attempt.query)continue;
      if(attempts.some(item=>item.query===attempt.query))continue;
      const key=geocodeCacheKey({query:attempt.query,countryCode});
      const cached=attempt.params
        ? await fetchStructuredCandidates(attempt.params,countryCode,key)
        : await fetchCandidates(attempt.query,countryCode,key);
      const selection=selectNominatimCandidate(venue,cached.results);
      attempts.push({
        kind:attempt.kind,
        query:attempt.query,
        params:attempt.params??null,
        key,
        candidates:safeArray(cached.results).slice(0,3).map(c=>({
          display_name:c.display_name,
          type:c.addresstype??c.type,
          country_code:c?.address?.country_code??null,
        })),
      });
      if(selection){
        chosen={...attempt,key,selection};
        break;
      }
    }

    if(!chosen){
      report.unresolved+=1;
      report.unresolved_records.push({
        venue_id:venue.venue_id,
        reason:"NO_TRUSTWORTHY_MATCH",
        attempts,
      });
      continue;
    }

    const geo=nominatimGeoFromSelection(chosen.selection,{geocodedAt:new Date().toISOString(),cacheKey:chosen.key});
    const geoIssues=auditDirectoryGeo(geo,{countryCode,path:"geo"});
    if(geoIssues.length){
      report.unresolved+=1;
      report.unresolved_records.push({
        venue_id:venue.venue_id,
        reason:"SELECTED_GEO_FAILED_CONTRACT",
        query_kind:chosen.kind,
        query:chosen.query,
        issues:geoIssues,
      });
      continue;
    }
    venue.geo=geo;
    report.accepted+=1;
    if(chosen.kind==="FALLBACK_ADDRESS_ONLY")report.fallback_accepted+=1;
    else if(chosen.kind==="PRIMARY_NAME_ADDRESS")report.primary_accepted+=1;
    else report.structured_accepted=(report.structured_accepted??0)+1;
    report.by_precision[geo.precision]=(report.by_precision[geo.precision]??0)+1;
  }

  const validationIssues=[];
  for(const venue of venues){
    for(const issue of auditVenue(venue,"venue:"+venue.venue_id))validationIssues.push(issue);
  }
  const geojson=makeGeoJson(venues,ministryDoc?.records??[]);
  venueDoc.geocoded_at=new Date().toISOString();
  importReport.geocoded_at=venueDoc.geocoded_at;
  importReport.geo_feature_count=geojson.features.length;
  importReport.geocoding={
    provider:"OSM_NOMINATIM",
    accepted:report.accepted,
    primary_accepted:report.primary_accepted,
    fallback_accepted:report.fallback_accepted,
    structured_accepted:report.structured_accepted,
    existing_valid:report.existing_valid,
    unresolved:report.unresolved,
    existing_invalid:report.existing_invalid,
  };

  await writeJson(venueFile,venueDoc);
  await writeJson(issuesFile,{schema:"AO_DIRECTORY_VALIDATION_ISSUES_V1",generated_at:new Date().toISOString(),issues:validationIssues});
  await writeJson(geoFile,geojson);
  await writeJson(reportFile,importReport);
  await writeJson(geocodeReportFile,report);
  overall.providers[provider]={
    total:report.total,
    mapped:geojson.features.length,
    accepted:report.accepted,
    primary_accepted:report.primary_accepted,
    fallback_accepted:report.fallback_accepted,
    structured_accepted:report.structured_accepted,
    existing_valid:report.existing_valid,
    unresolved:report.unresolved,
    existing_invalid:report.existing_invalid,
    validation_issue_count:validationIssues.length,
    by_precision:report.by_precision,
  };
  console.log(provider.toUpperCase()+": "+geojson.features.length+"/"+venues.length+" mapped; "+validationIssues.length+" validation issues");
}

if(networkRequests>0){
  cache.updated_at=new Date().toISOString();
  cache.network_requests_this_run=networkRequests;
  await writeJson(CACHE_PATH,cache);
}
overall.network_requests=networkRequests;
overall.offline=OFFLINE;
overall.cache_records=Object.keys(cache.records).length;
await writeJson(path.join(GENERATED,"geocoding-report.v1.json"),overall);
console.log(JSON.stringify(overall,null,2));
