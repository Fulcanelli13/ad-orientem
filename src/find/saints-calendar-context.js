// Saints Explore consumes only source-reviewed Calendar identity links.
// Never guesses by saint name, invents a nominal feast, or sets Mass/Proper.
export const SAINTS_CALENDAR_CONTEXT_VERSION = "ao.saints.calendar-context.v1";
const iso=value=>typeof value==="string" && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(value+"T12:00:00Z")) &&
  new Date(value+"T12:00:00Z").toISOString().slice(0,10)===value;
const id=value=>typeof value==="string" && /^saint\.[a-z0-9-]+$/.test(value);
const source=value=>{
  const match=typeof value==="string" && /^sancti:(\d\d)-(\d\d)[a-z]?:[1-4]:[wr]$/.exec(value);
  if(!match)return false;
  const date="2024-"+match[1]+"-"+match[2];
  return iso(date); // 2024 permits the possible leap-day source without accepting 10-99.
};
export function sourceBoundCalendarContext(saintsId,bridge) {
  if(!/^saint:[a-z0-9-]+$/.test(saintsId||"") ||
     bridge?.schema!=="ao.saints.parallel-owner-identity-bridge.v1" ||
     bridge?.status!=="EDITORIAL_SOURCE_LINKS_ONLY_NOT_GLOBAL_ID_RENAMES" ||
     bridge?.observed_2026?.days!==365)return null;
  const blocked=new Set((bridge.nonlinks||[]).filter(x=>x.relation==="DISTINCT_PERSON_DO_NOT_MERGE").map(x=>x.saints_id));
  if(blocked.has(saintsId))return null;
  const records=(bridge.identity_links||[]).filter(x=>x.saints_id===saintsId &&
    x.status?.startsWith("EXACT_SUPPORTED_") && id(x.calendar_person_id));
  if(records.length!==1)return null; // disputed or multiply mapped saint identity
  const match=records[0];
  const observed=match.relation==="SAME_PERSON_EXACT_AUTHORITATIVE_LITURGICAL_SOURCE_ID" &&
    source(match.observed_calendar_2026_principal_id) &&
    iso(match.observed_date) &&
    match.observed_date.startsWith("2026-") &&
    match.calendar_person_source==="data/calendar/doctors-of-church-roster.review.v1.json";
  return Object.freeze({
    saintId:saintsId,
    calendarPersonId:match.calendar_person_id,
    identityCertainty:"EXACT_REVIEWED_CROSS_OWNER",
    observed1962:observed?Object.freeze({
      civilDate:match.observed_date,principalSourceId:match.observed_calendar_2026_principal_id,
      year:2026,scope:"ACTUALLY_OBSERVED_ON_THIS_DATE_IN_2026_RESOLVER",
      authority:"SOURCE_CALENDAR_RESOLVER_NOT_INDEPENDENT_LITURGICAL_CERTIFICATION",
    }):null,
    // Do not turn a 1992 canonisation into a feast date.
    modernMemorial:null,permittedMassSelection:false,properId:null,
  });
}
