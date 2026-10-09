import {isMapPublishableGeo} from "./geo-provenance.js";

/**
 * Shared non-routing Find geography for non-SSPX traditional Mass communities.
 * Preserve every existing place pin and official URL. Never use country markers
 * as locality evidence or as a destination for directions.
 */
const norm=v=>String(v??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
  .toLowerCase().replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
const validCoordinates=geo=>geo!=null&&
  Number.isFinite(Number(geo.lat))&&geo.lat!==null&&geo.lat!==""&&
  Number.isFinite(Number(geo.lng))&&geo.lng!==null&&geo.lng!==""&&
  Math.abs(Number(geo.lat))<=90&&Math.abs(Number(geo.lng))<=180;
const aliasCode=raw=>{
  const cc=String(raw??"").toUpperCase().trim();
  if(cc==="GB-NIR"||cc==="GB-SCT"||cc==="GB-WLS"||cc==="GB-ENG")return "GB";
  if(cc==="UK")return "GB";
  return /^[A-Z]{2}$/.test(cc)?cc:null;
};
const mainIslandFallback={
  MU:[-20.25,57.5], // Country-only marker on Mauritius main island, not the bbox across Rodrigues
  NZ:[-41,173],     // Country-level NZ mainland indicator, not dateline midpoint
  GB:[54,-2],RU:[61,105],FJ:[-17.8,178],LK:[7.9,80.7],VA:[41.9029,12.4534],
};
const markerSource="https://github.com/samayo/country-json/tree/master/src";
const sourceGeo=rec=>{
  const g=rec?.venue?.geo||{};
  if(!isMapPublishableGeo(g,rec?.venue?.address?.country_code))return null;
  if(g.indicative_only||g.routing_eligible===false)return null;
  if(!["building","address","street","locality"].includes(g.precision))return null;
  if(!validCoordinates(g))return null;
  return g;
};
function add(index,key,value){
  if(!key)return;
  let entries=index.get(key);
  if(!entries){entries=[];index.set(key,entries)}
  if(!entries.includes(value))entries.push(value);
}
function medoid(rows){
  if(!rows.length)return null;
  if(rows.length===1)return rows[0];
  const sorted=(field)=>rows.map(x=>x[field]).sort((a,b)=>a-b);
  const mid=Math.floor(rows.length/2),lat=sorted("lat")[mid],lng=sorted("lng")[mid];
  return [...rows].sort((a,b)=>
    ((a.lat-lat)**2+(a.lng-lng)**2)-((b.lat-lat)**2+(b.lng-lng)**2))[0];
}
const safeCity=s=>norm(s).replace(/\b(city of|district of|ville de)\b/g,"").trim();
function cityVariants(raw){
  const x=String(raw||""),variants=[x,
    x.split(/\s+[—–]\s+|\s+\/\s+|\s*\(/)[0],
    x.split(",")[0]];
  return [...new Set(variants.map(safeCity).filter(x=>x.length>=3))];
}
function findAddressCity(formatted,cc,cityIndex){
  const tail=norm(String(formatted||"").slice(-125));
  if(!tail)return null;
  const candidates=[];
  for(const [city,rows] of cityIndex){
    if(!city.startsWith(cc+"|"))continue;
    const term=city.split("|")[1];
    if(term.length<5||!new RegExp("(?:^| )"+term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"(?: |$)").test(tail))continue;
    candidates.push({term,rows});
  }
  // Conservative: only one matching city. No fabricated locality if ambiguous.
  candidates.sort((a,b)=>b.term.length-a.term.length);
  if(candidates.length>1&&candidates[0].term.length===candidates[1].term.length)return null;
  return candidates[0]?.rows||null;
}
export function applyIndicativeOtherCommunityLocations(records,{countryReferences={}}={}){
  const list=Array.isArray(records)?records:[];
  const city=new Map(),region=new Map(),byCountry=new Map();
  for(const rec of list){
    const g=sourceGeo(rec);if(!g)continue;
    const v=rec.venue||{},cc=aliasCode(v.address?.country_code);if(!cc)continue;
    const point={lat:Number(g.lat),lng:Number(g.lng),ref:g.source_ref,url:g.source_url,
      cc,city:v.address?.city||"",region:v.address?.region||""};
    add(byCountry,cc,point);
    for(const term of cityVariants(point.city))add(city,cc+"|"+term,point);
    if(point.region)add(region,cc+"|"+norm(point.region),point);
  }
  const summary={other_total:0,already_mapped:0,locality_added:0,region_added:0,
    country_added:0,unresolved:0,source_anchor_countries:byCountry.size};
  const rows=list.map(rec=>{
    const v=rec?.venue||{},g=v.geo||{},ccRaw=v.address?.country_code;
    if(rec?.ministries?.some(m=>m?.community_id==="SSPX"))return rec;
    summary.other_total++;
    if(isMapPublishableGeo(g,ccRaw)){summary.already_mapped++;return rec}
    const cc=aliasCode(ccRaw);
    if(!cc){summary.unresolved++;return rec}
    let candidates=[];
    for(const x of cityVariants(v.address?.city)){
      candidates.push(...(city.get(cc+"|"+x)||[]));
    }
    if(!candidates.length&&!(v.address?.city))candidates=findAddressCity(v.address?.formatted,cc,city)||[];
    let precision="locality",scope="city",matched="SAME_COUNTRY_AND_LOCALITY_SOURCE";
    if(!candidates.length&&norm(v.address?.region)){
      candidates=region.get(cc+"|"+norm(v.address.region))||[];
      precision="region";scope="region";matched="SAME_COUNTRY_AND_REGION_SOURCE";
    }
    if(!candidates.length){
      candidates=byCountry.get(cc)||[];
      precision="country";scope="country";matched="INDICATIVE_COUNTRY_ONLY_NOT_VENUE_LOCATION";
    }
    let selected=medoid(candidates);
    if(!selected&&countryReferences?.[cc]&&Array.isArray(countryReferences[cc])){
      const [lat,lng]=countryReferences[cc];
      if(validCoordinates({lat,lng}))selected={lat,lng,ref:"COUNTRY_BBOX:"+cc,url:markerSource};
    }
    if(!selected&&mainIslandFallback[cc]){
      const [lat,lng]=mainIslandFallback[cc];
      selected={lat,lng,ref:"COUNTRY_MAINLAND:"+cc,url:markerSource};
    }
    if(!selected){summary.unresolved++;return rec}
    // A generic country reference never gains city-level precision.
    if(!candidates.length){precision="country";scope="country";matched="INDICATIVE_COUNTRY_ONLY_NOT_VENUE_LOCATION"}
    const geo={
      lat:Number(selected.lat),lng:Number(selected.lng),precision,
      geocoding_source:"OTHER",
      source_ref:"AO:INDICATIVE:"+v.venue_id,
      source_url:selected.url||null,
      supporting_source_ref:selected.ref||null,
      matched_country_code:String(ccRaw).toUpperCase(),
      matched_on:matched,indicative_scope:scope,indicative_only:true,
      routing_eligible:false,source_observed_at:"2026-10-09",
      locality_label:v.address?.city||null,
    };
    if(!isMapPublishableGeo(geo,ccRaw)){summary.unresolved++;return rec}
    if(precision==="locality")summary.locality_added++;
    else if(precision==="region")summary.region_added++;
    else summary.country_added++;
    return Object.freeze({...rec,venue:Object.freeze({...v,geo})});
  });
  return Object.freeze({records:Object.freeze(rows),summary:Object.freeze(summary)});
}
