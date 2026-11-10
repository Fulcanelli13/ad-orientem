/** CL27 sourced weekly supplement: source claims, not a Calendar Mass recurrence.
 * This is a separate immutable 14-site release from the first ten churches.
 */
export const CL27_WEEKLY_SUPPLEMENT_URL=new URL(
 "../../data/directory/cl27-weekly-mass-supplement-20261110.v1.json",import.meta.url).href;
const T=x=>String(x??"").trim();
const EXPECTED=Object.freeze({
  "RG-1A2D13837643": {
    "url": "https://laportelatine.org/lieux/rouen",
    "source": "SSPXMAP:OPE-001641",
    "lines": [
      "SUNDAYS_AND_FEASTS|08:30|LOW",
      "SUNDAYS_AND_FEASTS|10:30|SUNG",
      "MONDAY|11:15|UNKNOWN",
      "MONDAY|18:30|UNKNOWN",
      "TUESDAY|07:15|UNKNOWN",
      "TUESDAY|18:30|UNKNOWN",
      "WEDNESDAY|07:15|UNKNOWN",
      "WEDNESDAY|18:30|UNKNOWN",
      "THURSDAY|07:15|UNKNOWN",
      "THURSDAY|11:15|UNKNOWN",
      "FRIDAY|07:15|UNKNOWN",
      "FRIDAY|18:30|UNKNOWN",
      "SATURDAY|07:15|UNKNOWN",
      "SATURDAY|11:15|UNKNOWN"
    ]
  },
  "RG-14211B3603D5": {
    "url": "https://laportelatine.org/lieux/dijon",
    "source": "SSPXMAP:OPE-001537",
    "lines": [
      "SUNDAYS_AND_FEASTS|10:00|UNKNOWN",
      "THURSDAY_SATURDAY|11:30|UNKNOWN"
    ]
  },
  "RG-291B45C8980A": {
    "url": "https://laportelatine.org/lieux/prieure-saint-martin/saint-gregoire-tours",
    "source": "SSPXMAP:OPE-001572",
    "lines": [
      "SUNDAYS_AND_FEASTS|08:30|LOW",
      "SUNDAYS_AND_FEASTS|10:30|SUNG",
      "WEEKDAY_UNSPECIFIED|18:00|UNKNOWN"
    ]
  },
  "RG-2C6CF5CC7023": {
    "url": "https://laportelatine.org/lieux/marseille/marseille-immaculee",
    "source": "SSPXMAP:OPE-002103",
    "lines": [
      "SUNDAYS_AND_FEASTS|08:30|LOW"
    ]
  },
  "RG-5F242504B732": {
    "url": "https://laportelatine.org/lieux/nice",
    "source": "SSPXMAP:OPE-001516",
    "lines": [
      "SUNDAYS_AND_FEASTS|10:00|UNKNOWN",
      "WEEKDAY_UNSPECIFIED|18:30|UNKNOWN"
    ]
  },
  "RG-1E9599A96067": {
    "url": "https://laportelatine.org/lieux/saint-nolff/vannes",
    "source": "SSPXMAP:OPE-002151",
    "lines": [
      "SUNDAYS_AND_FEASTS|08:15|UNKNOWN",
      "SUNDAYS_AND_FEASTS|10:00|UNKNOWN",
      "WEEKDAY_UNSPECIFIED|18:00|UNKNOWN",
      "THURSDAY_SCHOOL_YEAR|11:15|UNKNOWN"
    ]
  },
  "RG-2A002EB6E1C7": {
    "url": "https://laportelatine.org/lieux/gavrus/alencon",
    "source": "SSPXMAP:OPE-002155",
    "lines": [
      "SUNDAYS_AND_FEASTS|11:30|UNKNOWN"
    ]
  },
  "RG-4F4324815190": {
    "url": "https://laportelatine.org/lieux/lanvallay",
    "source": "SSPXMAP:OPE-001541",
    "lines": [
      "SUNDAYS_AND_FEASTS|08:00|LOW",
      "SUNDAYS_AND_FEASTS|09:15|LOW",
      "SUNDAYS_AND_FEASTS|10:30|SUNG"
    ]
  },
  "RG-34F1D4F47941": {
    "url": "https://laportelatine.org/lieux/bruges/saintes",
    "source": "SSPXMAP:OPE-002109",
    "lines": [
      "SUNDAYS_AND_FEASTS|11:00|UNKNOWN"
    ]
  },
  "RG-5EAC1BF12A8D": {
    "url": "https://laportelatine.org/lieux/sorgues/avignon",
    "source": "SSPXMAP:OPE-002187",
    "lines": [
      "SUNDAYS_AND_FEASTS|09:30|SUNG",
      "SUNDAYS_AND_FEASTS|11:30|LOW",
      "FIRST_FRIDAY|18:30|UNKNOWN"
    ]
  },
  "RG-1BE458F80327": {
    "url": "https://laportelatine.org/lieux/meylan/saint-baldoph",
    "source": "SSPXMAP:OPE-002170",
    "lines": [
      "SUNDAYS_AND_FEASTS|11:00|UNKNOWN",
      "FRIDAY|18:30|UNKNOWN"
    ]
  },
  "RG-39EDF6C1F5EA": {
    "url": "https://laportelatine.org/lieux/unieux/saint-etienne",
    "source": "SSPXMAP:OPE-002141",
    "lines": [
      "SUNDAYS_AND_FEASTS|09:00|SUNG",
      "WEDNESDAY_FRIDAY|18:30|LOW",
      "FIRST_SATURDAY|18:30|UNKNOWN"
    ]
  },
  "RG-215CD48E3795": {
    "url": "https://laportelatine.org/lieux/etcharry/villefranque",
    "source": "SSPXMAP:OPE-002160",
    "lines": [
      "SUNDAYS_AND_FEASTS|10:00|UNKNOWN"
    ]
  },
  "RG-6AF996070252": {
    "url": "https://laportelatine.org/lieux/les-fournils/la-rochelle",
    "source": "SSPXMAP:OPE-002108",
    "lines": [
      "SUNDAYS_AND_FEASTS|08:30|LOW",
      "SUNDAYS_AND_FEASTS|10:00|SUNG",
      "TUESDAY|18:45|UNKNOWN"
    ]
  }
});
const TYPES=new Set(["UNKNOWN","LOW","SUNG"]);
const SCOPES=new Set(["SUNDAYS_AND_FEASTS","WEEKDAY_UNSPECIFIED","MONDAY","TUESDAY","WEDNESDAY",
"THURSDAY","FRIDAY","SATURDAY","THURSDAY_SATURDAY","THURSDAY_SCHOOL_YEAR",
"WEDNESDAY_FRIDAY","FIRST_FRIDAY","FIRST_SATURDAY"]);
const FORBIDDEN=["rrule","recurrence","next_mass","event_date","occurrences","calendar_events",
"una_cum","canonical_status","pope_named_in_canon","missal","missal_edition",
"rubrical_basis","rite","celebrant","venue_owner","ownership","gps","latitude","longitude"];
const forbidden=x=>FORBIDDEN.some(k=>Object.hasOwn(x,k));
const details=[
 ["RG-1A2D13837643","MONDAY|11:15","Variable","variable"],
 ["RG-1A2D13837643","SATURDAY|07:15","first Saturdays","premiers samedis"],
 ["RG-14211B3603D5","THURSDAY_SATURDAY|11:30","and/or","et/ou"],
 ["RG-291B45C8980A","WEEKDAY_UNSPECIFIED|18:00","weekdays","jours"],
 ["RG-1E9599A96067","WEEKDAY_UNSPECIFIED|18:00","Thursday","jeudi"],
 ["RG-1E9599A96067","THURSDAY_SCHOOL_YEAR|11:15","Replaces","Remplace"],
 ["RG-5EAC1BF12A8D","SUNDAYS_AND_FEASTS|11:30","15 August","15 août"],
 ["RG-39EDF6C1F5EA","SUNDAYS_AND_FEASTS|09:00","Unieux","Unieux"],
 ["RG-6AF996070252","TUESDAY|18:45","Not guaranteed","non garanti"],
];
const required=new Map(details.map(([anchor,line,en,fr])=>[anchor+"|"+line,[en,fr]]));
const time=t=>/^([01]\d|2[0-3]):[0-5]\d$/.test(T(t));
export function attachPublishedWeeklySupplement(items,manifest){
 if(manifest?.schema!=="AO_CL27_SOURCE_WEEKLY_MASS_SUPPLEMENT_V1"||
    manifest.publication!=="FIRST_PARTY_REPORTED_PATTERN_NOT_LIVE_MASS_OCCURRENCE"||
    manifest.reviewed_on!=="2026-11-10"||!Array.isArray(manifest.sites)||
    manifest.sites.length!==14||forbidden(manifest))
  throw Error("Invalid CL27 fourteen-site supplement");
 const by=new Map();
 for(const p of manifest.sites){
  const expected=EXPECTED[p?.cl2_anchor];
  if(!expected||by.has(p.cl2_anchor)||p.country!=="FR"||
    p.source_id!==expected.source||p.source_page_url!==expected.url||
    p.source_publisher!=="FSSPX District de France · La Porte Latine"||
    !/^https:\/\/laportelatine\.org\/lieux\//.test(p.source_page_url)||
    !T(p.canonical_name)||!T(p.physical_description)||
    !T(p.existing_source_url)||p.checked_on!=="2026-11-10"||
    p.subject_scope!=="ONE_NAMED_CL2_SITE_NOT_DISTRICT"||forbidden(p)||
    !Array.isArray(p.entries)||p.entries.length!==expected.lines.length)
   throw Error("Invalid CL27 supplemental site identity "+T(p?.cl2_anchor));
  const claimed=[];
  for(const e of p.entries){
   if(!e||!SCOPES.has(e.scope)||!time(e.time)||!TYPES.has(e.mass_type)||
      !T(e.label_en)||!T(e.label_fr)||
      typeof e.exception_en!=="string"||typeof e.exception_fr!=="string"||forbidden(e))
    throw Error("Invalid source-weekly supplemental line "+p.cl2_anchor);
   claimed.push(e.scope+"|"+e.time+"|"+e.mass_type);
   const need=required.get(p.cl2_anchor+"|"+e.scope+"|"+e.time);
   if(need&&(!e.exception_en.includes(need[0])||!e.exception_fr.includes(need[1])))
    throw Error("Required seasonal or feast source exception missing "+p.cl2_anchor);
  }
  if(JSON.stringify(claimed)!==JSON.stringify(expected.lines))
   throw Error("Source-weekly supplement changed without source recollation "+p.cl2_anchor);
  by.set(p.cl2_anchor,p);
 }
 if(by.size!==Object.keys(EXPECTED).length)
  throw Error("Incomplete CL27 supplemental coverage");
 const matched=new Set();
 const result=(Array.isArray(items)?items:[]).map(item=>{
  const p=by.get(item?.physical_group_id);
  if(!p)return item;
  if(matched.has(p.cl2_anchor)||item.kind!=="TLM_VENUE"||
     item.physical_site_source!=="CL2_MASTER"||
     item.source_id!==p.source_id||item.country_code!==p.country||
     item.title!==p.canonical_name||
     item.source_location_description!==p.physical_description||
     !Array.isArray(item.source_ids)||item.source_ids.length!==1||
     item.source_ids[0]!==p.source_id||
     !Array.isArray(item.source_links)||
     !item.source_links.some(s=>s?.url===p.existing_source_url)||
     !item.source_links.some(s=>s?.url===p.source_page_url)||
     item.weekly_source_programme)
    throw Error("Supplement must join one distinct frozen CL2 church "+p.cl2_anchor);
  matched.add(p.cl2_anchor);
  return Object.freeze({...item,weekly_source_programme:Object.freeze({
    ...p,entries:Object.freeze(p.entries.map(e=>Object.freeze({...e})))
  })});
 });
 if(matched.size!==Object.keys(EXPECTED).length)
  throw Error("Missing named CL2 site for supplemental Mass timetable");
 return Object.freeze(result);
}
