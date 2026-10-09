import {isMapPublishableGeo} from "./geo-provenance.js";

/**
 * Indicative map layer, NOT a geocoder or a routing service.
 * The official chapel / district URL remains the visitor's authority.
 * Existing address pins are never moved or overwritten.
 */
const MAP_API="https://map.fsspx.org/api/v1/places";
const clean=s=>String(s??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
  .toLowerCase().replace(/\s+/g," ").trim();
const key=s=>clean(s).replace(/[^a-z0-9]+/g," ").trim();
const localityParts=s=>{
  const full=key(s);
  const short=key(String(s??"").split(/\s+[—–]\s+|\s*\(|\s*,\s*|\s+\/\s+/)[0]);
  return [...new Set([full,short].filter(Boolean))];
};
const coords=x=>{
  const lat=x?.lat,lng=x?.lng;
  if(lat===null||lat===undefined||lat===""||lng===null||lng===undefined||lng==="")return null;
  const a=Number(lat),b=Number(lng);
  return Number.isFinite(a)&&Math.abs(a)<=90&&Number.isFinite(b)&&Math.abs(b)<=180
    ?{lat:a,lng:b}:null;
};
const placeCoord=p=>coords(p);
function cityKey(cc,city){return String(cc||"").toUpperCase()+"|"+key(city)}
function addIndex(index,cc,city,point){
  if(!city||!cc)return;
  for(const part of localityParts(city)){
    const k=cityKey(cc,part),list=index.get(k)||[];
    if(!list.includes(point)){list.push(point);index.set(k,list)}
  }
}
function bestRepresentative(points){
  if(!points.length)return null;
  if(points.length===1)return points[0];
  // A medoid is always a real first-party source point, not a fabricated street GPS location.
  const sorted=(axis)=>points.map(p=>p[axis]).sort((a,b)=>a-b);
  const lat=sorted("lat")[Math.floor(points.length/2)],lng=sorted("lng")[Math.floor(points.length/2)];
  return [...points].sort((a,b)=>
    ((a.lat-lat)**2+(a.lng-lng)**2)-((b.lat-lat)**2+(b.lng-lng)**2))[0];
}
function sspx(record){return record?.ministries?.some(m=>m?.community_id==="SSPX")}
function isExistingGeo(record){
  return isMapPublishableGeo(record?.venue?.geo,record?.venue?.address?.country_code);
}
function itemFromVenue(record){
  const v=record?.venue,g=v?.geo;
  if(!sspx(record)||!isExistingGeo(record)||!["OFFICIAL_SOURCE","OSM_NOMINATIM"].includes(g?.geocoding_source))return null;
  return {...coords(g),cc:v.address.country_code,city:v.address.city,
    region:v.address.region,name:v.name?.official,source_ref:g.source_ref,source_url:g.source_url,
    source_kind:g.geocoding_source};
}
function officialItem(raw){
  if(raw?.relationship!=="fsspx"||raw?.sundayMass!==true)return null;
  const point=placeCoord(raw),cc=String(raw.countryCode??"").toUpperCase();
  if(!point||!cc||!raw.city)return null;
  return {...point,cc,city:raw.city,region:raw.region,name:raw.name,
    source_ref:"SSPX:"+(raw.crmId||raw.slug),source_url:raw.url||(
      "https://map.fsspx.org/en/places/"+encodeURIComponent(raw.slug||"")),
    source_kind:"OFFICIAL_SOURCE"};
}
const nameSimilarity=(a,b)=>{
  const as=new Set(key(a).split(" ").filter(Boolean)),bs=new Set(key(b).split(" ").filter(Boolean));
  if(!as.size||!bs.size)return 0;
  let common=0;for(const word of as)if(bs.has(word))common++;
  return 2*common/(as.size+bs.size);
};
export function applyIndicativeSspxLocations(records,{officialPlaces=[]}={}){
  const input=Array.isArray(records)?records:[];
  const anchors=input.map(itemFromVenue).filter(Boolean);
  const official=(Array.isArray(officialPlaces)?officialPlaces:[]).map(officialItem).filter(Boolean);
  const known=[...official,...anchors];
  const cities=new Map(),regions=new Map(),countries=new Map();
  for(const point of known){
    addIndex(cities,point.cc,point.city,point);
    if(point.region)addIndex(regions,point.cc,point.region,point);
    const list=countries.get(point.cc)||[];list.push(point);countries.set(point.cc,list);
  }
  const report={total_sspx:0,already_mapped:0,locality_added:0,region_added:0,country_added:0,unresolved:0,
    official_source_places:official.length};
  const result=input.map(record=>{
    if(!sspx(record))return record;
    report.total_sspx++;
    if(isExistingGeo(record)){report.already_mapped++;return record}
    const v=record.venue||{},cc=String(v.address?.country_code||"").toUpperCase();
    if(!cc){report.unresolved++;return record}
    const area=v.address?.city||"";
    const allCity=[...new Set(localityParts(area).flatMap(c=>cities.get(cityKey(cc,c))||[]))];
    let candidates=allCity,precision="locality",scope="city",match="INDICATIVE_VERIFIED_CITY";
    if(!candidates.length&&key(v.address?.region)){
      const rk=key(v.address.region);
      candidates=regions.get(cityKey(cc,rk))||[];
      precision="region";scope="region";match="INDICATIVE_VERIFIED_REGION";
    }
    if(!candidates.length&&official.length){
      // Unique, distinctive official chapel name can bridge district city naming differences.
      const byName=official.filter(p=>p.cc===cc&&nameSimilarity(p.name,v.name?.official)>=0.96);
      if(byName.length===1&&key(v.name?.official).split(" ").length>=3){
        candidates=byName;precision="locality";scope="official-place";
        match="INDICATIVE_UNIQUE_OFFICIAL_NAME_AND_COUNTRY";
      }
    }
    if(!candidates.length){
      // Fallback marker shows only the COUNTRY, not the chapel's actual street or city.
      // Useful for discovery / opening its existing official link, never for navigation.
      candidates=countries.get(cc)||[];
      precision="country";scope="country";match="INDICATIVE_COUNTRY_ONLY_NOT_VENUE_LOCATION";
    }
    const candidate=bestRepresentative(candidates);
    if(!candidate){report.unresolved++;return record}
    const geo={lat:candidate.lat,lng:candidate.lng,precision,
      geocoding_source:"OTHER",source_ref:"AO:SSPX_INDICATIVE:"+v.venue_id,
      source_url:candidate.source_url||null,matched_country_code:cc,
      matched_on:match,indicative_scope:scope,indicative_only:true,
      routing_eligible:false,source_observed_at:"2026-10-09",
      supporting_source_ref:candidate.source_ref,
      locality_label:area||null};
    if(!isMapPublishableGeo(geo,cc)){report.unresolved++;return record}
    if(precision==="locality")report.locality_added++;
    else if(precision==="region")report.region_added++;
    else report.country_added++;
    return Object.freeze({...record,venue:Object.freeze({...v,geo})});
  });
  return Object.freeze({records:Object.freeze(result),summary:Object.freeze(report)});
}
export async function fetchOfficialSspxPlaceIndex({fetchImpl=fetch,timeoutMs=5000}={}){
  const out=[];
  const controller=typeof AbortController!=="undefined"?new AbortController():null;
  const timer=controller?setTimeout(()=>controller.abort(),timeoutMs):null;
  try{
    for(let offset=0;offset<=2000;offset+=1000){
      const url=MAP_API+"?lang=en&sundayMass=true&limit=1000&offset="+offset;
      const response=await fetchImpl(url,{headers:{accept:"application/json"},...(controller?{signal:controller.signal}:{})});
      if(!response?.ok)break;
      const result=await response.json();
      if(!Array.isArray(result?.items))break;
      out.push(...result.items);
      if(out.length>=Number(result.total||0)||result.items.length<1000)break;
    }
  }catch{
    // Offline mode: existing first-party coordinates are still used for coarse discovery.
  }finally{if(timer!==null)clearTimeout(timer)}
  return out;
}
