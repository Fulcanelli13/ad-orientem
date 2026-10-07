import { auditVenue } from "./contracts.js";
import { isMapPublishableGeo } from "./geo-provenance.js";
const DEFAULT_PROVIDERS=Object.freeze(["fssp","icksp","ibp","sspx"]);
const RESEARCH_PROVIDERS=Object.freeze([
  Object.freeze({key:"diocesan",file:"diocesan.v1.json"}),
  Object.freeze({key:"aasjmv",file:"aasjmv.v1.json"}),
  Object.freeze({key:"fsvf",file:"fsvf.v1.json"}),
  Object.freeze({key:"canons",file:"canons-st-john-cantius.v1.json"}),
  Object.freeze({key:"cmri",file:"cmri.v1.json"}),
  Object.freeze({key:"rci",file:"rci.v1.json"}),
  Object.freeze({key:"cspv",file:"cspv.v1.json"}),
  Object.freeze({key:"smmd",file:"smmd.v1.json"}),
  Object.freeze({key:"icksp",file:"icksp-federated.v1.json"}),
]);

function safeArray(value){return Array.isArray(value)?value:[]}
function text(value){return String(value??"").trim()}
async function fetchJson(url,{fetchImpl=fetch,optional=false}={}){
  try{
    const response=await fetchImpl(url,{headers:{accept:"application/json"}});
    if(!response.ok){
      if(optional)return null;
      throw new Error("HTTP "+response.status+" for "+url);
    }
    return await response.json();
  }catch(error){
    if(optional)return null;
    throw error;
  }
}
function moduleUrl(relative){return new URL(relative,import.meta.url).href}
function slugId(value){
  return text(value).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase()
    .replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"record";
}
export function researchProviderUrl(file){
  return moduleUrl("../../data/directory/generated/v19/"+file);
}
export function directoryProviderUrls(provider){
  const base="../../data/directory/generated/"+provider+"/";
  return Object.freeze({
    venues:moduleUrl(base+"venues.v1.json"),
    ministries:moduleUrl(base+"ministries.v1.json"),
    schedules:moduleUrl(base+"schedules.v1.json"),
    sources:moduleUrl(base+"sources.v1.json"),
  });
}
function compactResearchRow(defaults,row,provider){
  return Object.freeze({...defaults,...row,p:provider});
}
export function expandResearchProviderSnapshot(snapshot={}){
  const provider=text(snapshot?.provider);
  const defaults=snapshot?.defaults&&typeof snapshot.defaults==="object"?snapshot.defaults:{};
  const generatedAt=text(snapshot?.generated_at)||null;
  const out={venues:[],ministries:[],schedules:[],sources:[]};
  for(const raw of safeArray(snapshot?.records)){
    const row=compactResearchRow(defaults,raw,provider);
    if(!row.u||!row.c||!row.cc||!row.n||!row.su)continue;
    const base=slugId(provider)+"-"+slugId(row.u);
    const venueId="ao-research-"+base;
    const ministryId="ao-ministry-"+base;
    const scheduleId="ao-schedule-"+base;
    const scheduleSourceId="src-research-"+base+"-schedule";
    const authorizationSourceId=row.au?"src-research-"+base+"-authorization":null;
    const editionSourceId=row.eu?"src-research-"+base+"-edition":null;
    const sourceIds=[scheduleSourceId,...(authorizationSourceId?[authorizationSourceId]:[]),...(editionSourceId?[editionSourceId]:[])];
    const formatted=text(row.a)||[row.l,row.r,row.cc].map(text).filter(Boolean).join(", ");
    const scheduleRaw=text(row.sr);
    const sunday=/\bsunday\b|\bdimanche\b|\bdomingo\b|\bdomenica\b|\bsonntag\b|\bsun\.?\b/i.test(scheduleRaw);
    out.venues.push({
      venue_id:venueId,
      name:{official:text(row.n),alternate:[]},
      venue_type:text(row.vt)||"other",
      upstream:{
        provider:"AO_RESEARCH_V1_9",
        upstream_id:text(row.u),
        provider_id:provider,
        provider_relationship:row.pr??null,
        source_liturgical_profile:row.sl??null,
        geometry_status:row.gs??null,
      },
      address:{
        line1:text(row.a)||null,line2:null,postal_code:null,
        city:text(row.l)||null,region:text(row.r)||null,country_code:text(row.cc),country:null,
        formatted:formatted||null,
      },
      geo:{lat:null,lng:null,precision:"unknown",geocoding_source:null},
      diocese:{diocese_id:null,name:text(row.j)||null,type:"diocese"},
      contact:{
        phone:[],email:[],website:[text(row.su)].filter(Boolean),
        schedule_url:[text(row.su)].filter(Boolean),bulletin_url:[],contact_form:[],official_social:[],
      },
      capabilities:{sunday_mass:sunday},
      status:"active",
      source_ids:sourceIds,
      upstream_updated_at:null,
    });
    out.ministries.push({
      ministry_id:ministryId,
      venue_id:venueId,
      community_id:text(row.c),
      relationship:text(row.rel)||"unknown",
      affiliation_confidence:text(row.ac)||"REVIEW",
      community_profile_ref:text(row.c),
      liturgical_usage:{
        family:text(row.f)||"ROMAN",
        books:text(row.b)||"UNKNOWN",
        mass_form:text(row.mf)||"TRADITIONAL_LATIN",
        evidence_source_ids:[editionSourceId??scheduleSourceId],
      },
      authorization:{
        status:row.az??null,
        parish_church_use:row.pc??null,
        apostolic_see_dispensation_evidence:row.ad??null,
        celebrant_permission_scope:row.cp??null,
        source_id:authorizationSourceId,
      },
      upstream:{
        provider_relationship:row.pr??null,
        una_cum_status_raw:row.uc??null,
        source_liturgical_profile:row.sl??null,
      },
      active:true,
      source_ids:sourceIds,
    });
    out.schedules.push({
      schedule_id:scheduleId,
      ministry_id:ministryId,
      service_type:text(row.svc)||"MASS",
      mass_type:"UNKNOWN",
      payload:{raw:scheduleRaw},
      source_ids:[scheduleSourceId],
      verification:{state:text(row.vs)||"OFFICIAL_VERIFIED",checked_at:generatedAt},
    });
    out.sources.push({
      source_id:scheduleSourceId,
      registry_source_id:null,
      source_type:text(row.st)||"COMMUNITY_OFFICIAL",
      publisher:text(row.j)||text(row.c)||provider,
      title:text(row.n),
      url:text(row.su),
      retrieved_at:generatedAt,
      authority:"PRIMARY",
      fields_supported:["venue","venue.contact","schedule","liturgical_usage"],
    });
    if(editionSourceId){
      out.sources.push({
        source_id:editionSourceId,
        registry_source_id:null,
        source_type:text(row.et)||text(row.st)||"COMMUNITY_OFFICIAL",
        publisher:text(row.j)||text(row.c)||provider,
        title:text(row.n)+" — liturgical edition",
        url:text(row.eu),
        retrieved_at:generatedAt,
        authority:"PRIMARY",
        fields_supported:["liturgical_usage"],
      });
    }
    if(authorizationSourceId){
      out.sources.push({
        source_id:authorizationSourceId,
        registry_source_id:null,
        source_type:text(row.at)||"DIOCESE_OFFICIAL",
        publisher:text(row.j)||text(row.c)||provider,
        title:text(row.n)+" — authorization",
        url:text(row.au),
        retrieved_at:generatedAt,
        authority:"PRIMARY",
        fields_supported:["authorization"],
      });
    }
  }
  return Object.freeze({
    venues:Object.freeze(out.venues),
    ministries:Object.freeze(out.ministries),
    schedules:Object.freeze(out.schedules),
    sources:Object.freeze(out.sources),
  });
}

export function joinDirectoryRecords({venues=[],ministries=[],schedules=[],sources=[],communityProfiles=[]}={}){
  const ministriesByVenue=new Map(),schedulesByMinistry=new Map();
  for(const ministry of safeArray(ministries)){
    if(!ministry?.venue_id)continue;
    const list=ministriesByVenue.get(ministry.venue_id)??[];
    list.push(ministry);ministriesByVenue.set(ministry.venue_id,list);
  }
  for(const schedule of safeArray(schedules)){
    if(!schedule?.ministry_id)continue;
    const list=schedulesByMinistry.get(schedule.ministry_id)??[];
    list.push(schedule);schedulesByMinistry.set(schedule.ministry_id,list);
  }
  const sourceMap=new Map(safeArray(sources).map(x=>[x?.source_id,x]).filter(([id])=>id));
  const profileMap=new Map(safeArray(communityProfiles).map(x=>[x?.communityId,x]).filter(([id])=>id));
  return safeArray(venues).map(venue=>{
    const joinedMinistries=(ministriesByVenue.get(venue.venue_id)??[]).map(ministry=>({
      ...ministry,
      schedules:schedulesByMinistry.get(ministry.ministry_id)??[],
      communityProfile:profileMap.get(ministry.community_id)??null,
    }));
    const sourceIds=new Set([
      ...safeArray(venue.source_ids),
      ...joinedMinistries.flatMap(m=>safeArray(m.source_ids)),
      ...joinedMinistries.flatMap(m=>m.schedules.flatMap(s=>safeArray(s.source_ids))),
    ]);
    return Object.freeze({
      venue,
      ministries:joinedMinistries,
      sources:[...sourceIds].map(id=>sourceMap.get(id)).filter(Boolean),
    });
  });
}
export function publishableDirectoryRecords(records){
  return safeArray(records).filter(record=>{
    if(auditVenue(record?.venue).length!==0)return false;
    const icksp=safeArray(record?.ministries).filter(m=>m?.community_id==="ICKSP");
    if(icksp.length&&!icksp.some(m=>safeArray(m?.schedules).some(schedule=>schedule?.service_type==="MASS")))return false;
    return true;
  });
}
export async function loadDirectoryDataset({fetchImpl=fetch,providers=DEFAULT_PROVIDERS,researchProviders=RESEARCH_PROVIDERS}={}){
  const [statusData,communityData]=await Promise.all([
    fetchJson(moduleUrl("../../data/directory/status-assertions.v1.json"),{fetchImpl,optional:true}),
    fetchJson(moduleUrl("../../data/directory/communities.v1.json"),{fetchImpl,optional:true}),
  ]);
  const communityProfiles=safeArray(statusData?.communityProfiles);
  const loaded=[],unavailable=[];
  const merged={venues:[],ministries:[],schedules:[],sources:[]};
  for(const provider of providers){
    const urls=directoryProviderUrls(provider);
    const [venues,ministries,schedules,sources]=await Promise.all([
      fetchJson(urls.venues,{fetchImpl,optional:true}),
      fetchJson(urls.ministries,{fetchImpl,optional:true}),
      fetchJson(urls.schedules,{fetchImpl,optional:true}),
      fetchJson(urls.sources,{fetchImpl,optional:true}),
    ]);
    if(!venues?.records){unavailable.push(provider);continue}
    if(!loaded.includes(provider))loaded.push(provider);
    merged.venues.push(...safeArray(venues.records));
    merged.ministries.push(...safeArray(ministries?.records));
    merged.schedules.push(...safeArray(schedules?.records));
    merged.sources.push(...safeArray(sources?.records));
  }
  for(const descriptor of safeArray(researchProviders)){
    const snapshot=await fetchJson(researchProviderUrl(descriptor.file),{fetchImpl,optional:true});
    if(!snapshot?.records){unavailable.push(descriptor.key);continue}
    const expanded=expandResearchProviderSnapshot(snapshot);
    if(!loaded.includes(descriptor.key))loaded.push(descriptor.key);
    merged.venues.push(...expanded.venues);
    merged.ministries.push(...expanded.ministries);
    merged.schedules.push(...expanded.schedules);
    merged.sources.push(...expanded.sources);
  }
  const joined=joinDirectoryRecords({...merged,communityProfiles});
  const records=publishableDirectoryRecords(joined);
  return Object.freeze({
    records,
    skippedInvalidRecords:joined.length-records.length,
    communities:safeArray(communityData?.communities),
    communityProfiles,
    loadedProviders:loaded,
    unavailableProviders:unavailable,
    complete:unavailable.length===0,
  });
}
function haystack(record){
  const venue=record?.venue??{},ministries=safeArray(record?.ministries);
  return [
    venue?.name?.official,...safeArray(venue?.name?.alternate),venue?.address?.formatted,
    venue?.address?.city,venue?.address?.region,venue?.address?.country,venue?.address?.country_code,
    venue?.diocese?.name,...ministries.map(m=>m.community_id),...ministries.map(m=>m.external_community_name),
  ].map(text).filter(Boolean).join(" ").toLowerCase();
}
export function communionValue(record){
  const values=safeArray(record?.ministries).map(m=>m?.communityProfile?.communionProfile?.pope_named_in_canon??"UNKNOWN");
  if(values.includes("YES"))return "YES";
  if(values.includes("NO"))return "NO";
  if(values.some(v=>String(v).startsWith("VARIES")||v==="DISPUTED"))return "VARIES";
  return "UNKNOWN";
}
function scheduleText(record){
  return safeArray(record?.ministries).flatMap(m=>safeArray(m.schedules))
    .map(s=>[s.service_type,s.mass_type,s.payload?.raw,JSON.stringify(s.payload??{})].filter(Boolean).join(" "))
    .join(" ").toLowerCase();
}
function matchesDay(record,day){
  if(!day||day==="ANY")return true;
  const raw=scheduleText(record);
  if(day==="SUNDAY")return /sunday|dimanche|domingo|domenica|sonntag/.test(raw)||Boolean(record?.venue?.capabilities?.sunday_mass);
  if(day==="TODAY"){
    const tokens=[
      ["sunday","dimanche","domingo","domenica","sonntag"],["monday","lundi","lunes","lunedi","montag"],
      ["tuesday","mardi","martes","martedi","dienstag"],["wednesday","mercredi","miercoles","mercoledi","mittwoch"],
      ["thursday","jeudi","jueves","giovedi","donnerstag"],["friday","vendredi","viernes","venerdi","freitag"],
      ["saturday","samedi","sabado","sabato","samstag"],
    ][new Date().getDay()];
    return tokens.some(token=>raw.includes(token))||(new Date().getDay()===0&&Boolean(record?.venue?.capabilities?.sunday_mass));
  }
  return true;
}
export function filterDirectoryRecords(records,{query="",day="ANY",affiliations=[],unaCum="ANY",liturgy="ANY",massType="ANY"}={}){
  const q=text(query).toLowerCase(),affiliationSet=new Set(safeArray(affiliations).map(String));
  return safeArray(records).filter(record=>{
    if(q&&!haystack(record).includes(q))return false;
    if(!matchesDay(record,day))return false;
    const ministries=safeArray(record.ministries);
    if(affiliationSet.size&&!ministries.some(m=>affiliationSet.has(m.community_id)))return false;
    if(unaCum!=="ANY"&&communionValue(record)!==unaCum)return false;
    if(liturgy!=="ANY"){
      const ok=ministries.some(m=>{
        const u=m?.liturgical_usage??{};
        if(liturgy==="1962")return u.family==="ROMAN"&&u.books==="1962";
        if(liturgy==="PRE_1955")return u.family==="ROMAN"&&u.books==="PRE_1955";
        return u.family===liturgy;
      });
      if(!ok)return false;
    }
    if(massType!=="ANY"&&!scheduleText(record).includes(String(massType).toLowerCase()))return false;
    return true;
  });
}
export function directoryStats(records){
  const list=safeArray(records),countries=new Set(),communities=new Map();let geocoded=0;
  for(const record of list){
    const cc=record?.venue?.address?.country_code;if(cc)countries.add(cc);
    if(isMapPublishableGeo(record?.venue?.geo,record?.venue?.address?.country_code))geocoded++;
    for(const m of safeArray(record?.ministries))communities.set(m.community_id,(communities.get(m.community_id)??0)+1);
  }
  return Object.freeze({venues:list.length,countries:countries.size,geocoded,communities:Object.fromEntries(communities)});
}
