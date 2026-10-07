import { auditVenue } from "./contracts.js";

const STATIC_BUNDLES=Object.freeze([
  Object.freeze({id:"static:diocesan",path:"../../data/directory/static/diocesan.v1.json"}),
  Object.freeze({id:"static:provider-research",path:"../../data/directory/static/provider-research.v1.json"}),
  Object.freeze({id:"static:icksp-confirmed-mass",path:"../../data/directory/static/icksp-confirmed-mass.v1.json"}),
]);

function safeArray(value){return Array.isArray(value)?value:[]}
function nonEmpty(value){return typeof value==="string"&&value.trim().length>0}
function slug(value){
  return String(value??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase()
    .replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
}
function moduleUrl(relative){return new URL(relative,import.meta.url).href}
function sourceTypeFor(source,row){
  const tier=String(source?.tier??"").toUpperCase();
  if(/DIOCESE|ARCHDIOCESE|BISHOP/.test(tier))return "DIOCESE_OFFICIAL";
  if(/PARISH/.test(tier))return "PARISH_OFFICIAL";
  return row?.community==="DIOCESAN"?"COMMUNITY_OFFICIAL":"COMMUNITY_OFFICIAL";
}
function venueTypeFor(value){
  const v=String(value??"").toUpperCase();
  if(/SCHOOL/.test(v))return "school_chapel";
  if(/MONASTERY/.test(v))return "monastery";
  if(/CONVENT/.test(v))return "convent";
  if(/PRIORY/.test(v))return "priory";
  if(/ORATORY/.test(v))return "oratory";
  if(/MISSION/.test(v))return "mission";
  if(/CHAPEL/.test(v))return "chapel";
  if(/RESIDENCE|HOUSE/.test(v))return "residence";
  if(/RETREAT/.test(v))return "retreat_house";
  if(/TEMPORARY|HOTEL|COMMUNITY_CENTER/.test(v))return "other";
  return /CHURCH|PARISH|CATHEDRAL|SHRINE/.test(v)?"church":"other";
}
function frequencyText(value){
  return String(value??"schedule published by source").replaceAll("_"," ").replaceAll(";","; ");
}
function hasSunday(value){return /SUNDAY|SUN\b|DIMANCHE|DOMINGO|DOMENICA|SONNTAG/i.test(String(value??""))}
function hasWeekday(value){return /MON|TUE|WED|THU|FRI|WEEKDAY|DAILY|LUNDI|MARDI|MERCREDI|JEUDI|VENDREDI/i.test(String(value??""))}
function addressFor(row){
  const formatted=row.address||[row.locality,row.region,row.country_code].filter(nonEmpty).join(", ");
  return {
    line1:row.address||null,line2:null,postal_code:null,
    city:row.locality||null,region:row.region||null,country_code:row.country_code||null,
    country:null,formatted:formatted||null,
  };
}
function sourceRows(row,bundleId,generatedAt){
  const rawSources=safeArray(row.sources);
  return rawSources.map((entry,index)=>{
    const source=typeof entry==="string"?{url:entry}:entry;
    const sourceId="src-static-"+slug(row.id)+"-"+(index+1);
    return {
      source_id:sourceId,registry_source_id:null,source_type:sourceTypeFor(source,row),
      publisher:row.community==="DIOCESAN"?(row.jurisdiction||"Diocesan source"):(row.community||"Provider source"),
      title:(row.name||row.id)+" — "+(source.role||"official source"),url:source.url||null,
      retrieved_at:generatedAt||null,authority:"PRIMARY",
      fields_supported:["venue","venue.contact","ministry.liturgical_usage","schedule"],
      bundle_id:bundleId,source_role:source.role||null,source_tier:source.tier||null,
    };
  }).filter(x=>x.url);
}
export function expandStaticDirectoryBundle(bundle){
  const venues=[],ministries=[],schedules=[],sources=[],issues=[];
  const bundleId=bundle?.schema??"AO_DIRECTORY_STATIC_UNKNOWN";
  for(const row of safeArray(bundle?.records)){
    if(!row?.id||!row?.community||!row?.country_code)continue;
    const venueId=row.venue_id||("ao-static-"+slug(row.id));
    const sourceRecords=sourceRows(row,bundleId,bundle?.generated_at);
    const sourceIds=sourceRecords.map(x=>x.source_id);
    const venue={
      venue_id:venueId,
      name:{official:row.name||row.id,alternate:[]},
      venue_type:venueTypeFor(row.venue_type),
      upstream:{provider:"STATIC_RESEARCH",research_id:row.id,bundle_id:bundleId},
      address:addressFor(row),
      geo:{lat:null,lng:null,precision:"unknown",geocoding_source:null,source_url:null,source_ref:null,upstream_precision:null},
      diocese:{diocese_id:null,name:row.jurisdiction||row.diocese||null,type:"diocese"},
      contact:{phone:row.phone?[String(row.phone)]:[],email:[],website:[],
        schedule_url:sourceRecords.filter(x=>x.source_role==="schedule"||!x.source_role).map(x=>x.url).filter(Boolean),
        bulletin_url:[],contact_form:[],official_social:[]},
      capabilities:{sunday_mass:hasSunday(row.frequency),weekday_mass:hasWeekday(row.frequency),mass_frequency:row.frequency||null},
      status:"active",source_ids:sourceIds,
    };
    const ministryId="ao-ministry-"+slug(venueId);
    const ministry={
      ministry_id:ministryId,venue_id:venueId,community_id:row.community,
      external_community_name:null,affiliation_confidence:row.confidence||"DIRECT",
      upstream_relationship:row.provider_relationship||null,relationship:row.relationship||"unknown",
      community_profile_ref:row.community,
      liturgical_usage:{family:row.family||"ROMAN",books:row.books||"UNKNOWN",
        mass_form:"TRADITIONAL_LATIN",evidence_source_ids:sourceIds},
      active:true,source_ids:sourceIds,
      research:{authorization_status:row.authorization_status||null,notes:row.notes||null,una_cum_assertion:row.una_cum||null},
    };
    const schedule={
      schedule_id:"ao-schedule-"+slug(row.id)+"-1",ministry_id:ministryId,service_type:"MASS",mass_type:"UNKNOWN",
      payload:{raw:frequencyText(row.frequency),symbolic_frequency:row.frequency||null},
      source_ids:sourceIds,
      verification:{state:row.verification||"OFFICIAL_VERIFIED",checked_at:row.verified_on||bundle?.generated_at||null},
    };
    const venueIssues=auditVenue(venue,"static:"+row.id);
    if(venueIssues.length)issues.push(...venueIssues);
    venues.push(venue);ministries.push(ministry);schedules.push(schedule);sources.push(...sourceRecords);
  }
  return Object.freeze({venues,ministries,schedules,sources,issues});
}
async function fetchJson(url,fetchImpl){
  try{
    const response=await fetchImpl(url,{headers:{accept:"application/json"}});
    if(!response.ok)return null;
    return await response.json();
  }catch{return null}
}
export async function loadStaticDirectoryResearch({fetchImpl=fetch}={}){
  const merged={venues:[],ministries:[],schedules:[],sources:[]};
  const loadedBundles=[],unavailableBundles=[],issues=[];
  for(const spec of STATIC_BUNDLES){
    const data=await fetchJson(moduleUrl(spec.path),fetchImpl);
    if(!data?.records){unavailableBundles.push(spec.id);continue}
    const expanded=expandStaticDirectoryBundle(data);
    merged.venues.push(...expanded.venues);
    merged.ministries.push(...expanded.ministries);
    merged.schedules.push(...expanded.schedules);
    merged.sources.push(...expanded.sources);
    issues.push(...expanded.issues);
    loadedBundles.push(spec.id);
  }
  return Object.freeze({...merged,loadedBundles,unavailableBundles,issues});
}
