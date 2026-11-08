// Date-specific first-party Mass PROGRAMME on the existing CL2 church profile.
// Never creates a recurring schedule, Ministry, canonical status or global Mass
// event. A source-printed date is NOT confirmed live/available on that day.
export const CL27_DATED_MASS_PROGRAMME_URL=new URL(
 "../../data/directory/cl27-dated-mass-programme-paita-20261108.v1.json",import.meta.url).href;
const T=v=>String(v??"").trim();
const isoDay=v=>/^\d{4}-\d{2}-\d{2}$/.test(T(v))&&
 new Date(T(v)+"T00:00:00Z").toISOString().slice(0,10)===T(v);
const HTTPS=v=>/^https:\/\/[a-z0-9.-]+\/[^\s<>"']+$/i.test(T(v));
const EXPECTED_SITE="RG-51BC2B17C91F";
const EXPECTED_SOURCE="SSPXMAP:OPE-001948";
const EXPECTED_DATES=Object.freeze(["2026-11-22","2026-12-20"]);
const EXPECTED_BULLETIN="https://laportelatine.org/wp-content/uploads/2026/01/Annonces-56-bis_messes-dominicales-2026.pdf";

export function attachPublishedDatedMassProgramme(items,manifest){
 if(manifest?.schema!=="AO_CL27_EXACT_DATED_MASS_PROGRAMME_V1"||
    manifest?.publication!=="FIRST_PARTY_PRINTED_FUTURE_DATES_NOT_LIVE_AVAILABILITY"||
    !Array.isArray(manifest.sites)||manifest.sites.length!==1)
  throw new Error("Invalid CL27 date-specific publication manifest");
 const c=manifest.sites[0];
 if(c?.cl2_anchor!==EXPECTED_SITE||c?.canonical_name!=="Chapelle Saint-Joseph"||
    c.country!=="NC"||!T(c.physical_description)||
    !Array.isArray(c.canonical_source_ids)||c.canonical_source_ids.length!==2||
    c.canonical_source_ids[0]!==EXPECTED_SOURCE||
    !c.canonical_source_ids[1].includes("chapelle-saint-joseph-paita")||
    c.first_party_site_url!=="https://laportelatine.org/lieux/paita"||
    c.dated_bulletin_url!==EXPECTED_BULLETIN||
    c.subject_scope!=="ONE_NAMED_CHAPEL_DATED_PROGRAMME_NOT_WHOLE_DISTRICT"||
    c.timezone!=="Pacific/Noumea"||!T(c.publisher)||!T(c.source_edition)||
    !HTTPS(c.dated_bulletin_url)||!Array.isArray(c.events)||
    c.events.length!==EXPECTED_DATES.length||
    ["recurrence","rrule","weekday","weekly","una_cum","canonical_status",
      "missal_edition","pope_named_in_canon","owner","celebrant","lat","lng"].some(k=>Object.hasOwn(c,k)))
  throw new Error("Unverified CL27 dated chapel identity/claim");
 const keys=new Set(),days=new Set(),eventIds=new Set();
 for(const e of c.events){
  const key=T(e.local_date)+"@"+T(e.local_time);
  if(!isoDay(e.local_date)||!EXPECTED_DATES.includes(e.local_date)||
     new Date(e.local_date+"T00:00:00Z").getUTCDay()!==0||
     e.local_time!=="09:00"||e.service_type!=="MASS"||
     e.mass_type!=="SUNG"||e.printed_status!=="SOURCE_LISTED_DATE_CONFIRM_LOCALLY"||
     !T(e.source_programme_name_en)||!T(e.source_programme_name_fr)||
     e.event_id!=="CL27-Paita-"+e.local_date+"-0900"||
     keys.has(key)||days.has(e.local_date)||eventIds.has(e.event_id)||
     ["recurrence","rrule","weekday","weekly","una_cum","canonical_status",
       "missal_edition","pope_named_in_canon","owner","celebrant"].some(k=>Object.hasOwn(e,k)))
   throw new Error("Unverified/duplicated CL27 dated Mass event: "+key);
  keys.add(key);days.add(e.local_date);eventIds.add(e.event_id);
 }
 if(EXPECTED_DATES.some(d=>!days.has(d)))
  throw new Error("Missing one of the two printed 2026 Mass dates");
 const list=Array.isArray(items)?items:[];
 let seen=0;
 const result=list.map(item=>{
  if(item?.physical_group_id!==c.cl2_anchor)return item;
  if(++seen!==1||item.kind!=="TLM_VENUE"||
     item.physical_site_source!=="CL2_MASTER"||
     item.country_code!==c.country||
     item.source_id!==EXPECTED_SOURCE||
     item.source_location_description!==c.physical_description||
     !Array.isArray(item.source_ids)||
     item.source_ids.length!==c.canonical_source_ids.length||
     item.source_ids.some((id,i)=>id!==c.canonical_source_ids[i])||
     item.dated_mass_programme)
    throw new Error("CL27 printed programme cannot join canonical church");
  // No expansion into item.raw.ministries[].schedules or a global calendar.
  return Object.freeze({...item,dated_mass_programme:Object.freeze({
   ...c,events:Object.freeze([...c.events].sort((a,b)=>a.local_date.localeCompare(b.local_date)).map(e=>Object.freeze({...e})))
  })});
 });
 if(seen!==1)throw new Error("CL27 dated Mass programme missing exact physical CL2 site");
 return Object.freeze(result);
}

function sourceLocalDay(now,timezone){
 const fields=Object.fromEntries(new Intl.DateTimeFormat("en-US",{
  timeZone:timezone,year:"numeric",month:"2-digit",day:"2-digit"
 }).formatToParts(now).filter(p=>["year","month","day"].includes(p.type)).map(p=>[p.type,p.value]));
 return fields.year+"-"+fields.month+"-"+fields.day;
}
// Date filter is in the CHAPEL'S civil timezone, never the viewer's timezone.
// A printed entry may still be cancelled: callers must label it as a plan.
export function upcomingPrintedMasses(programme,{asOf}={}){
 if(!programme||!Array.isArray(programme.events))return Object.freeze([]);
 const localDate=typeof asOf==="string"?asOf:sourceLocalDay(asOf??new Date(),programme.timezone);
 if(!isoDay(localDate))throw new Error("Invalid CL27 programme local date");
 return Object.freeze(programme.events.filter(e=>e.local_date>=localDate));
}
