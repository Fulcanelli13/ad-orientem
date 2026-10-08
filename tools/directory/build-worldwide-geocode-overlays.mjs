import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {expandResearchProviderSnapshot} from "../../src/find/data-service.js";
import {auditDirectoryGeo,isMapPublishableGeo} from "../../src/find/geo-provenance.js";
import {
  addressLooksLocalityOnly,buildDirectoryAddressOnlyQuery,
  buildDirectoryGeocodeQuery,buildDirectoryStructuredAttempts,
  geocodeCacheKey,structuredGeocodeFingerprint,nominatimGeoFromSelection,
  selectNominatimCandidate,
} from "./lib/geocode-utils.mjs";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const BASE=path.join(ROOT,"data/directory/generated/v19");
const CACHE_PATH=path.join(ROOT,"data/directory/geocoding-cache.v1.json");
const clean=x=>String(x??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
  .toLowerCase().replace(/[^a-z0-9]+/g," ").replace(/\s+/g," ").trim();
const arr=x=>Array.isArray(x)?x:[];
async function readJson(file,fallback=null){
  try{return JSON.parse(await fs.readFile(file,"utf8"))}
  catch(error){if(error.code==="ENOENT")return fallback;throw error;}
}
async function writeJson(file,body){
  await fs.mkdir(path.dirname(file),{recursive:true});
  await fs.writeFile(file,JSON.stringify(body,null,2)+"\n");
}
function strongName(venue,candidate){
  const target=clean(venue?.name?.official);
  const values=[candidate?.name,...Object.values(candidate?.namedetails??{}),
    String(candidate?.display_name??"").split(",")[0]].map(clean).filter(Boolean);
  if(!target||!values.length)return false;
  const a=new Set(target.split(" ").filter(x=>x.length>2));
  return values.some(value=>{
    if(value===target)return true;
    const b=new Set(value.split(" ").filter(x=>x.length>2));
    const common=[...a].filter(x=>b.has(x)).length;
    return a.size>=2&&common/a.size>=0.8;
  });
}
export function candidateQueries(venue){
  const country=String(venue?.address?.country_code??"").toUpperCase();
  const named=buildDirectoryGeocodeQuery(venue);
  const addressOnly=buildDirectoryAddressOnlyQuery(venue);
  const queries=[{kind:"NAME_AND_ADDRESS",query:named},{kind:"ADDRESS_ONLY",query:addressOnly}];
  for(const attempt of buildDirectoryStructuredAttempts(venue)){
    queries.push({kind:attempt.kind,query:"structured:"+structuredGeocodeFingerprint(attempt.params)});
  }
  const unique=new Set();
  return queries.filter(x=>{
    if(!country||!x.query||unique.has(x.query))return false;
    unique.add(x.query);return true;
  }).map(x=>({...x,key:geocodeCacheKey({query:x.query,countryCode:country})}));
}
export function selectCachedGeo(venue,cacheRecords,now="2026-10-08T00:00:00Z"){
  const country=String(venue?.address?.country_code??"").toUpperCase();
  for(const attempt of candidateQueries(venue)){
    const cached=cacheRecords?.[attempt.key];
    if(!cached?.results?.length)continue;
    const selected=selectNominatimCandidate(venue,cached.results);
    if(!selected)continue;
    // Prevent collapsing city-only sources onto a different church or address.
    if(addressLooksLocalityOnly(venue)&&!strongName(venue,selected.candidate))continue;
    const geo=nominatimGeoFromSelection(selected,{geocodedAt:cached.fetched_at||now,cacheKey:attempt.key});
    if(!geo||!isMapPublishableGeo(geo,country))continue;
    if(geo.precision==="locality"&&!strongName(venue,selected.candidate))continue;
    return {geo,kind:attempt.kind,cache_key:attempt.key};
  }
  return null;
}
export function reconcileGeoCollisions(suggestions,existing=[]){
  const accepted=[],holds=[];
  const byOsm=new Map();
  const normalized=r=>clean(r.country_code)+"|"+clean(r.address);
  for(const record of existing){
    if(!record?.geo?.source_ref)continue;
    let entries=byOsm.get(record.geo.source_ref)||[];
    entries.push(record);byOsm.set(record.geo.source_ref,entries);
  }
  for(const record of suggestions){
    const prior=byOsm.get(record.geo.source_ref)||[];
    const incompatible=prior.find(x=>normalized(x)!==normalized(record));
    if(incompatible){
      holds.push({venue_id:record.venue_id,reason:"OSM_OBJECT_REUSED_FOR_DIFFERENT_SOURCE_ADDRESSES",
        selected_osm_ref:record.geo.source_ref,conflicts_with:incompatible.venue_id});
      continue;
    }
    accepted.push(record);
    byOsm.set(record.geo.source_ref,[...prior,record]);
  }
  return {accepted,holds};
}
export async function planWorldwideCacheReuse({root=ROOT,write=false,now="2026-10-08T00:00:00Z"}={}){
  const snapshotsDir=path.join(root,"data/directory/generated/v19");
  const cache=await readJson(path.join(root,"data/directory/geocoding-cache.v1.json"),{records:{}});
  const names=(await fs.readdir(snapshotsDir)).filter(x=>x.endsWith(".v1.json")&&!x.includes(".geo."));
  const providers=[],candidates=[],already=[],pending=[];
  const byProvider=new Map();
  for(const name of names){
    const snapshot=await readJson(path.join(snapshotsDir,name));
    if(snapshot?.schema!=="AO_DIRECTORY_RESEARCH_PROVIDER_V1"||!snapshot?.provider)continue;
    const key=snapshot.provider,file=name.replace(/\.v1\.json$/,".geo.v1.json");
    const overlay=await readJson(path.join(snapshotsDir,file),{records:[]});
    const existingGeo=new Map(arr(overlay?.records).map(x=>[x.venue_id,x.geo]));
    const expanded=expandResearchProviderSnapshot(snapshot);
    const state={provider:key,source_file:name,overlay_file:file,source_records:expanded.venues.length,
      already_mappable:0,cache_candidate:0,accepted_new:0,unresolved:0,without_public_mass:0,
      insufficient_address:0,invalid_existing:0,collision_holds:0};
    const existingRows=[];
    for(let i=0;i<expanded.venues.length;i++){
      const venue=expanded.venues[i],schedule=expanded.schedules[i];
      const country=String(venue?.address?.country_code??"").toUpperCase();
      const existing=existingGeo.get(venue.venue_id);
      if(existing&&isMapPublishableGeo(existing,country)){
        state.already_mappable+=1;
        const row={venue_id:venue.venue_id,country_code:country,
          address:venue.address.formatted,geo:existing,provider:key};
        already.push(row);existingRows.push({venue_id:venue.venue_id,geo:existing});
        continue;
      }
      if(existing){
        state.invalid_existing++;
        pending.push({venue_id:venue.venue_id,provider:key,reason:"INVALID_EXISTING_GEO",
          issues:auditDirectoryGeo(existing,{countryCode:country})});
        continue;
      }
      if(!schedule||schedule.service_type!=="MASS"||!arr(schedule.source_ids).length||
         !String(schedule?.payload?.raw??"").trim() ||
         (key.startsWith("SSPX_")&&!["CURRENT_PUBLIC_MASS","CONDITIONAL_MASS"].includes(venue.publication_state))){
        state.without_public_mass++;
        continue;
      }
      if(!country||!venue.address.formatted||
         clean(venue.address.formatted).length<14){
        state.insufficient_address++;
        pending.push({venue_id:venue.venue_id,provider:key,reason:"INSUFFICIENT_SOURCE_ADDRESS"});
        continue;
      }
      const matched=selectCachedGeo(venue,cache.records,now);
      if(!matched){
        state.unresolved++;
        pending.push({venue_id:venue.venue_id,provider:key,reason:"NO_ACCEPTABLE_CACHED_MATCH",
          address:venue.address.formatted,country_code:country,
          query:buildDirectoryAddressOnlyQuery(venue)});
        continue;
      }
      state.cache_candidate++;
      candidates.push({venue_id:venue.venue_id,provider:key,country_code:country,
        address:venue.address.formatted,geo:matched.geo,matched_by:matched.kind});
    }
    byProvider.set(key,{state,existingRows});
    providers.push(state);
  }
  const matches=reconcileGeoCollisions(candidates,already);
  for(const h of matches.holds){
    byProvider.get(candidates.find(x=>x.venue_id===h.venue_id).provider).state.collision_holds++;
    pending.push(h);
  }
  for(const r of matches.accepted)byProvider.get(r.provider).state.accepted_new++;
  const summary={schema:"AO_DIRECTORY_WORLDWIDE_GEO_CACHE_REUSE_V1",generated_at:now,
    mode:"OFFLINE_CACHED_EVIDENCE_ONLY",source_snapshot_count:providers.length,
    records_examined:providers.reduce((a,p)=>a+p.source_records,0),
    already_mappable:already.length,accepted_from_cache:matches.accepted.length,
    unresolved:pending.length,cache_entries:Object.keys(cache.records||{}).length,
    total_map_eligible:already.length+matches.accepted.length,
    collision_holds:matches.holds.length,network_requests:0,
    providers,unresolved_records:pending,
    note:"Map overlays derive only from previously cached OSM results with country, quality and source-ref checks; no wholesale online Nominatim traffic or speculative map positions."};
  if(write){
    for(const {state,existingRows} of byProvider.values()){
      const selected=matches.accepted.filter(x=>x.provider===state.provider)
        .map(x=>({venue_id:x.venue_id,geo:x.geo}));
      if(!selected.length)continue;
      await writeJson(path.join(snapshotsDir,state.overlay_file),{
        schema:"AO_DIRECTORY_RESEARCH_GEO_OVERLAY_V1",provider:state.provider,
        generated_at:now,records:[...existingRows,...selected],
      });
    }
    await writeJson(path.join(root,"data/directory/research/worldwide-geo-cache-reuse-report.v1.json"),summary);
  }
  return {summary,accepted:matches.accepted,holds:matches.holds};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const write=process.argv.includes("--write");
  planWorldwideCacheReuse({write}).then(({summary,accepted})=>{
    const {unresolved_records,...compact}=summary;
    console.log(JSON.stringify(compact,null,2));
    console.log("NEW_GEO_OVERLAY_ROWS="+JSON.stringify(accepted));
  }).catch(error=>{console.error(error);process.exitCode=1;});
}
