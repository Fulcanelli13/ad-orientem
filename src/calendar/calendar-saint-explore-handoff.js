// Calendar -> Explore Saints exact identity handoff.
// The Saints editorial bridge, not names or later feast dates, owns the link.
// The canonical 1962 day resolver still owns rank, feast, Mass and Proper.
export const CALENDAR_SAINT_PROFILE_HANDOFF_VERSION="ao-calendar-saints-exact-handoff-v1";
const BRIDGE_URL=new URL("../../data/saints/parallel-owner-identity-bridge-20261015.v1.json",import.meta.url).href;
const iso=x=>typeof x==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&
  !Number.isNaN(Date.parse(x+"T12:00:00Z"))&&
  new Date(x+"T12:00:00Z").toISOString().slice(0,10)===x;
const originalId=x=>typeof x==="string"&&/^sancti:\d{2}-\d{2}[a-z]?:[1-4]:[wr]$/.test(x);
let cached=null,pending=null;
export async function loadCalendarSaintProfileBridge(fetcher=globalThis.fetch){
  if(cached)return cached;
  if(pending)return pending;
  if(typeof fetcher!=="function")return null;
  pending=Promise.resolve().then(()=>fetcher(BRIDGE_URL,{headers:{accept:"application/json"}}))
    .then(r=>r?.ok?r.json():null)
    .then(value=>{
      if(value?.schema!=="ao.saints.parallel-owner-identity-bridge.v1"||
         value?.status!=="EDITORIAL_SOURCE_LINKS_ONLY_NOT_GLOBAL_ID_RENAMES"||
         !Array.isArray(value.identity_links)||!Array.isArray(value.nonlinks))return null;
      cached=value;return cached;
    }).catch(()=>null).finally(()=>{pending=null});
  return pending;
}
export function exactCalendarPrincipalSaintProfile({date,principalId,bridge}={}){
  if(!iso(date)||!originalId(principalId)||
     bridge?.schema!=="ao.saints.parallel-owner-identity-bridge.v1"||
     bridge?.status!=="EDITORIAL_SOURCE_LINKS_ONLY_NOT_GLOBAL_ID_RENAMES")return null;
  const blocked=new Set((bridge.nonlinks??[])
    .filter(x=>x?.relation==="DISTINCT_PERSON_DO_NOT_MERGE").map(x=>x.saints_id));
  const links=(bridge.identity_links??[]).filter(x=>
     x?.status==="EXACT_SUPPORTED_NO_OWNER_MUTATION"&&
     x?.relation==="SAME_PERSON_EXACT_AUTHORITATIVE_LITURGICAL_SOURCE_ID"&&
     x?.observed_calendar_2026_principal_id===principalId&&
     iso(x?.observed_date)&&
     x.observed_date.slice(5)===date.slice(5)&&
     /^saint:[a-z0-9-]+$/.test(x.saints_id||"")&&
     /^saint\.[a-z0-9-]+$/.test(x.calendar_person_id||"")&&
     !blocked.has(x.saints_id));
  if(links.length!==1)return null; // disputed or ambiguous = no deep link
  const link=links[0];
  return Object.freeze({
     calendarPersonId:link.calendar_person_id,
     saintsId:link.saints_id,
     observedSourceId:principalId,
     selectedDate:date,
     readOnly:true,massSelectionAuthority:"NONE",sourceOwner:"SAINTS_EXACT_EDITORIAL_BRIDGE",
  });
}

export function exactCalendarSupplementarySaintProfile({date,card,bridge}={}){
  if(!iso(date)||!card||
     card.currentCalendarDate!==date.slice(5)||
     card.secondaryOnly!==true||
     card.massSelectionAuthority!=="NONE"||
     card.changes1962Principal!==false||
     card.selectedFormularyId!==null||
     !/^saint\.[a-z0-9-]+$/.test(card.id||"")||
     bridge?.schema!=="ao.saints.parallel-owner-identity-bridge.v1"||
     bridge?.status!=="EDITORIAL_SOURCE_LINKS_ONLY_NOT_GLOBAL_ID_RENAMES")return null;
  const forbidden=new Set((bridge.nonlinks??[])
    .filter(x=>x?.relation==="DISTINCT_PERSON_DO_NOT_MERGE").map(x=>x.saints_id));
  const links=(bridge.identity_links??[]).filter(x=>
    x?.status==="EXACT_SUPPORTED_NO_OWNER_MUTATION"&&
    /^saint:[a-z0-9-]+$/.test(x.saints_id||"")&&
    x.calendar_person_id===card.id&&
    !forbidden.has(x.saints_id));
  if(links.length!==1)return null;
  return Object.freeze({saintsId:links[0].saints_id,calendarPersonId:card.id,
    selectedDate:date,readOnly:true,massSelectionAuthority:"NONE",
    sourceOwner:"SAINTS_EXACT_EDITORIAL_BRIDGE"});
}
