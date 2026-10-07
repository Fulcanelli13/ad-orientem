import { auditVenue } from "./contracts.js";
import { isMapPublishableGeo } from "./geo-provenance.js";
import { loadStaticDirectoryResearch } from "./static-directory-research.js";
const DEFAULT_PROVIDERS=Object.freeze(["fssp","icksp","ibp","sspx"]);

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
export function directoryProviderUrls(provider){
  const base="../../data/directory/generated/"+provider+"/";
  return Object.freeze({
    venues:moduleUrl(base+"venues.v1.json"),
    ministries:moduleUrl(base+"ministries.v1.json"),
    schedules:moduleUrl(base+"schedules.v1.json"),
    sources:moduleUrl(base+"sources.v1.json"),
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
  return safeArray(records).filter(record=>auditVenue(record?.venue).length===0);
}
export async function loadDirectoryDataset({fetchImpl=fetch,providers=DEFAULT_PROVIDERS}={}){
  const [statusData,communityData,coverageData]=await Promise.all([
    fetchJson(moduleUrl("../../data/directory/status-assertions.v1.json"),{fetchImpl,optional:true}),
    fetchJson(moduleUrl("../../data/directory/communities.v1.json"),{fetchImpl,optional:true}),
    fetchJson(moduleUrl("../../data/directory/provider-coverage.v1.json"),{fetchImpl,optional:true}),
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
    loaded.push(provider);
    merged.venues.push(...safeArray(venues.records));
    merged.ministries.push(...safeArray(ministries?.records));
    merged.schedules.push(...safeArray(schedules?.records));
    merged.sources.push(...safeArray(sources?.records));
  }
  const staticResearch=await loadStaticDirectoryResearch({fetchImpl});
  merged.venues.push(...safeArray(staticResearch.venues));
  merged.ministries.push(...safeArray(staticResearch.ministries));
  merged.schedules.push(...safeArray(staticResearch.schedules));
  merged.sources.push(...safeArray(staticResearch.sources));
  loaded.push(...safeArray(staticResearch.loadedBundles));
  unavailable.push(...safeArray(staticResearch.unavailableBundles));

  const joined=joinDirectoryRecords({...merged,communityProfiles});
  const seen=new Set();
  const records=publishableDirectoryRecords(joined).filter(record=>{
    const id=record?.venue?.venue_id;
    if(!id||seen.has(id))return false;
    seen.add(id);return true;
  });
  const knownCoverageGaps=safeArray(coverageData?.providers).filter(x=>x?.blocks_complete);
  return Object.freeze({
    records,
    skippedInvalidRecords:joined.length-records.length,
    communities:safeArray(communityData?.communities),
    communityProfiles,
    loadedProviders:loaded,
    unavailableProviders:unavailable,
    staticResearchIssues:safeArray(staticResearch.issues),
    providerCoverage:coverageData??null,
    knownCoverageGaps,
    complete:unavailable.length===0&&knownCoverageGaps.length===0,
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
