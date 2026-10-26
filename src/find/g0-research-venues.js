// B84–B90 physical-venue research intake. This is an operational staging
// projection, deliberately separate from published Find and the R49 map.
// G0 evidence is not a recurring Mass schedule or permission to create a pin.
import {auditVenue} from "./contracts.js";
import {isMapPublishableGeo} from "./geo-provenance.js";

const txt=x=>String(x??"").trim();
const normalize=x=>txt(x).normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
  .replace(/[łŁ]/g,"l").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const isHttps=x=>/^https:\/\/[^\s<>"]+$/i.test(txt(x));
const list=x=>Array.isArray(x)?x:[];
function country(row){return txt(row?.cc||row?.venue?.address?.country_code).toUpperCase()}
function name(row){return txt(row?.name?.official||row?.venue?.name?.official||row?.name)}
function locality(row){return txt(row?.locality||row?.venue?.address?.city)}
function address(row){return txt(row?.physical_address||row?.venue?.address?.line1)}
function identityKeys(row){
  const cc=country(row),city=normalize(locality(row)),n=normalize(name(row)),a=normalize(address(row));
  return {name:cc&&city&&n?cc+"|"+city+"|"+n:null,
    address:cc&&city&&a.length>=12?cc+"|"+city+"|"+a:null};
}
function canonicalResearchRecord(row){
  const id=txt(row.research_group_id),sourceId="src-g0-"+id.toLowerCase();
  const venue={
    venue_id:"ao-g0-"+id.toLowerCase(),
    name:{official:txt(row.name),alternate:[]},venue_type:"other",
    upstream:{provider:"AO_G0_CANONICAL_RESEARCH",upstream_id:id,
      source_batch:txt(row.batch),linked_provider_id:txt(row.related_existing_provider_id)||null},
    address:{line1:txt(row.physical_address),line2:null,postal_code:null,
      city:txt(row.locality),region:null,country_code:txt(row.cc).toUpperCase(),
      country:null,formatted:txt(row.physical_address)+", "+txt(row.locality)+", "+txt(row.cc).toUpperCase()},
    geo:{lat:null,lng:null,precision:"unknown",geocoding_source:null},
    diocese:{name:null},contact:{phone:[],email:[],website:[txt(row.liturgical_source_url)],
      schedule_url:[],bulletin_url:[],contact_form:[],official_social:[]},
    capabilities:{sunday_mass:false},status:"research_only",
    publication_state:"G0_RESEARCH_ONLY",source_ids:[sourceId],
    map_publishable:false,
  };
  return Object.freeze({
    venue,
    ministries:Object.freeze([]), // Do not invent officiating clergy, jurisdiction or liturgical edition.
    sources:Object.freeze([{source_id:sourceId,source_type:"COMMUNITY_OFFICIAL",
      publisher:"Original-site/source evidence — research review required",
      title:txt(row.name),url:txt(row.liturgical_source_url),
      authority:"SOURCE_UNCERTIFIED_FOR_CURRENT_MASS",
      fields_supported:["venue","physical_address"]}]),
    research:{group_id:id,batch:txt(row.batch),
      building_source_url:txt(row.building_source_url),
      verification_state:"UNVERIFIED",map_state:"NOT_PUBLISHED",
      no_schedule_certification:true},
  });
}
/**
 * Apply a strict, reversible building-identity screen against the active
 * provider corpus. Ambiguous overlaps are held; source IDs are never deleted.
 * The returned records are private operational research rows, NOT user-facing
 * public Find records. No G0 row may produce a map marker or a Mass time.
 */
export function stageG0ResearchVenues(snapshot,{existingRecords=[]}={}){
  if(snapshot?.schema!=="AO_DIRECTORY_CANONICAL_G0_RESEARCH_VENUE_ADMISSIONS_V1"||
     !Array.isArray(snapshot.records)||
     snapshot.record_count!==snapshot.records.length)
    throw new Error("Invalid G0 venue research corpus");
  const existingNames=new Set(),existingAddresses=new Set(),existingSourceIds=new Set();
  for(const record of list(existingRecords)){
    const keys=identityKeys(record);
    if(keys.name)existingNames.add(keys.name);
    if(keys.address)existingAddresses.add(keys.address);
    const upstream=txt(record?.venue?.upstream?.upstream_id);
    if(upstream)existingSourceIds.add(upstream);
  }
  const seenIds=new Set(),accepted=[],held=[],linked=[];
  for(const row of snapshot.records){
    const id=txt(row?.research_group_id),keys=identityKeys(row);
    if(!/^RG-B(?:84|85|86|87|88|89|90)-[A-Z0-9]+$/.test(id)||seenIds.has(id))
      throw new Error("Missing or duplicate frozen G0 research identity: "+id);
    seenIds.add(id);
    if(!/^[A-Z]{2}$/.test(country(row))||!name(row)||!locality(row)||
       !address(row)||!isHttps(row?.liturgical_source_url)||row?.admission_status!=="G0_RESEARCH_ONLY"||
       row?.map_publication!=="NOT_PUBLISHED"||
       row?.scheduled_mass_status!=="UNVERIFIED_NOT_IMPORTED"){
      held.push(Object.freeze({id,reason:"INVALID_OR_UNATTESTED_SOURCE_FIELDS"}));continue;
    }
    const linkedProvider=txt(row.related_existing_provider_id);
    if(linkedProvider||existingSourceIds.has(id)){
      linked.push(Object.freeze({id,upstream_id:linkedProvider||id,reason:"EXISTING_PROVIDER_SOURCE"}));continue;
    }
    if((keys.address&&existingAddresses.has(keys.address))||
       (keys.name&&existingNames.has(keys.name))){
      held.push(Object.freeze({id,reason:"POTENTIAL_SAME_PHYSICAL_BUILDING"}));continue;
    }
    const record=canonicalResearchRecord(row);
    if(auditVenue(record.venue).length||isMapPublishableGeo(record.venue.geo,record.venue.address.country_code)||
       record.ministries.length||record.research.map_state!=="NOT_PUBLISHED"){
      held.push(Object.freeze({id,reason:"FAILED_PRIVATE_VENUE_RELEASE_GATE"}));continue;
    }
    accepted.push(record);
    if(keys.name)existingNames.add(keys.name);
    if(keys.address)existingAddresses.add(keys.address);
  }
  return Object.freeze({
    records:Object.freeze(accepted),linked:Object.freeze(linked),held:Object.freeze(held),
    summary:Object.freeze({total:snapshot.records.length,staged:accepted.length,
      linked:linked.length,held:held.length,public_pins:0,verified_mass_rows:0}),
  });
}
