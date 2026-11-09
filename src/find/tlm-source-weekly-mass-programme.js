// Source-published *weekly patterns* for ten exact CL2 venues. Never generate
// calendar occurrences, infer feast precedence, or claim real-time availability.
export const CL27_WEEKLY_SOURCE_PROGRAMME_URL=new URL(
 "../../data/directory/cl27-weekly-mass-source-20261109.v1.json",import.meta.url).href;
const T=v=>String(v??"").trim();
const HTTPS=v=>/^https:\/\/[^\s<>"']+$/i.test(T(v));
const EXPECTED=Object.freeze({
  "RG-005CCA55D4DF": "https://laportelatine.org/lieux/gavrus/reville",
  "RG-158B6DF9C6A3": "https://laportelatine.org/lieux/nantes",
  "RG-0A4EC539F260": "https://laportelatine.org/lieux/marseille/eglise-toulon",
  "RG-96C9520D0C32": "https://laportelatine.org/lieux/croix/lille",
  "RG-250DB3E4D38C": "https://laportelatine.org/lieux/plauzat/clermont-ferrand",
  "RG-59852CB2D7DC": "https://laportelatine.org/lieux/gavrus/caen",
  "RG-46D2128B7F14": "https://laportelatine.org/lieux/urmatt/strasbourg",
  "RG-87CE879054F4": "https://laportelatine.org/lieux/valdevesle/troyes",
  "RG-52D51472A0A6": "https://laportelatine.org/lieux/meylan/annecy",
  "RG-09C21A51FF9C": "https://laportelatine.org/lieux/suresnes/samoreau"
});
const SCOPES=new Set(["SUNDAYS_AND_FEASTS","WEEKDAY_UNSPECIFIED","WEDNESDAY_FRIDAY_SATURDAY","WEEKDAY_EXCEPT_SATURDAY","MONDAY_WEDNESDAY_FRIDAY","TUESDAY_THURSDAY","FRIDAY","SATURDAY"]);
const TYPES=new Set(["UNKNOWN","LOW","SUNG"]);
const EXPECTED_LINES=Object.freeze({
  "RG-005CCA55D4DF": [
    "SUNDAYS_AND_FEASTS|18:00|UNKNOWN"
  ],
  "RG-158B6DF9C6A3": [
    "SUNDAYS_AND_FEASTS|08:30|UNKNOWN",
    "SUNDAYS_AND_FEASTS|10:30|UNKNOWN",
    "SUNDAYS_AND_FEASTS|18:30|UNKNOWN",
    "WEEKDAY_UNSPECIFIED|07:15|UNKNOWN",
    "WEEKDAY_UNSPECIFIED|18:30|UNKNOWN"
  ],
  "RG-0A4EC539F260": [
    "SUNDAYS_AND_FEASTS|09:30|SUNG",
    "SUNDAYS_AND_FEASTS|18:30|LOW",
    "WEDNESDAY_FRIDAY_SATURDAY|18:30|UNKNOWN"
  ],
  "RG-96C9520D0C32": [
    "SUNDAYS_AND_FEASTS|10:30|UNKNOWN",
    "SUNDAYS_AND_FEASTS|18:30|UNKNOWN",
    "WEEKDAY_UNSPECIFIED|18:30|UNKNOWN"
  ],
  "RG-250DB3E4D38C": [
    "SUNDAYS_AND_FEASTS|10:30|UNKNOWN"
  ],
  "RG-59852CB2D7DC": [
    "SUNDAYS_AND_FEASTS|09:00|LOW",
    "SUNDAYS_AND_FEASTS|10:30|SUNG",
    "WEEKDAY_EXCEPT_SATURDAY|18:30|UNKNOWN"
  ],
  "RG-46D2128B7F14": [
    "SUNDAYS_AND_FEASTS|10:15|UNKNOWN",
    "MONDAY_WEDNESDAY_FRIDAY|18:30|UNKNOWN",
    "TUESDAY_THURSDAY|07:15|UNKNOWN",
    "SATURDAY|11:00|UNKNOWN"
  ],
  "RG-87CE879054F4": [
    "SUNDAYS_AND_FEASTS|18:00|UNKNOWN"
  ],
  "RG-52D51472A0A6": [
    "SUNDAYS_AND_FEASTS|09:00|UNKNOWN",
    "FRIDAY|18:30|UNKNOWN",
    "SATURDAY|18:00|UNKNOWN"
  ],
  "RG-09C21A51FF9C": [
    "SUNDAYS_AND_FEASTS|10:00|UNKNOWN"
  ]
});

const FORBIDDEN=["rrule","recurrence","next_mass","event_date","occurrences","calendar_events",
 "una_cum","canonical_status","pope_named_in_canon","missal","missal_edition",
 "rubrical_basis","rite","celebrant","venue_owner","ownership","gps","latitude","longitude"];
const forbidden=x=>FORBIDDEN.some(k=>Object.hasOwn(x,k));
const HHMM=v=>/^([01]\d|2[0-3]):[0-5]\d$/.test(T(v));
export function attachPublishedWeeklySourceProgrammes(items,manifest){
 if(manifest?.schema!=="AO_CL27_SOURCE_WEEKLY_MASS_PROGRAMME_V1"||
    manifest.publication!=="FIRST_PARTY_REPORTED_PATTERN_NOT_LIVE_MASS_OCCURRENCE"||
    manifest.reviewed_on!=="2026-11-09"||!Array.isArray(manifest.sites)||
    manifest.sites.length!==10||forbidden(manifest))
  throw new Error("Invalid CL27 source-weekly programme manifest");
 const byAnchor=new Map();
 for(const p of manifest.sites){
  if(!p||!Object.hasOwn(EXPECTED,p.cl2_anchor)||byAnchor.has(p.cl2_anchor)||
   p.source_page_url!==EXPECTED[p.cl2_anchor]||!HTTPS(p.source_page_url)||
   !HTTPS(p.existing_source_url)||!T(p.source_publisher)||!T(p.canonical_name)||
   !T(p.physical_description)||p.country!=="FR"||
   !/^SSPXMAP:OPE-\d{6}$/.test(T(p.source_id))||
   p.checked_on!=="2026-11-09"||p.subject_scope!=="ONE_NAMED_CL2_SITE_NOT_DISTRICT"||
   forbidden(p)||!Array.isArray(p.entries)||p.entries.length<1)
   throw new Error("Unsupported CL27 source-weekly site "+T(p?.cl2_anchor));
  const seen=new Set();
  for(const e of p.entries){
   if(!e||!SCOPES.has(e.scope)||!HHMM(e.time)||!TYPES.has(e.mass_type)||
     !T(e.label_en)||!T(e.label_fr)||typeof e.exception_en!=="string"||
     typeof e.exception_fr!=="string"||forbidden(e)||seen.has(e.scope+":"+e.time))
     throw new Error("Invalid or duplicate source-weekly Mass line "+T(p.cl2_anchor));
   seen.add(e.scope+":"+e.time);
   if(p.cl2_anchor==="RG-0A4EC539F260"&&e.scope==="SUNDAYS_AND_FEASTS"&&e.time==="18:30"&&
      (!["Christmas","Easter","Pentecost","July"].every(x=>e.exception_en.includes(x))||
       !["Noël","Pâques","Pentecôte","juillet"].every(x=>e.exception_fr.includes(x))))
      throw new Error("Toulon evening Mass exceptions missing");
   if(p.cl2_anchor==="RG-96C9520D0C32"&&e.scope==="SUNDAYS_AND_FEASTS"&&e.time==="18:30"&&
      (!["Christmas","Easter","July"].every(x=>e.exception_en.includes(x))||
       !["Noël","Pâques","juillet"].every(x=>e.exception_fr.includes(x))))
      throw new Error("Lille evening Mass exceptions missing");
   if(p.cl2_anchor==="RG-87CE879054F4"&&e.time==="18:00"&&
      (!["Christmas","Easter"].every(x=>e.exception_en.includes(x))||
       !["Noël","Pâques"].every(x=>e.exception_fr.includes(x))))
      throw new Error("Troyes Christmas/Easter exception missing");
   if(p.cl2_anchor==="RG-59852CB2D7DC"&&e.scope==="WEEKDAY_EXCEPT_SATURDAY"&&
      (!e.exception_en.includes("Saturday")||!e.exception_fr.includes("Samedi")))
      throw new Error("Caen Saturday exception missing");
   if(p.cl2_anchor==="RG-09C21A51FF9C"&&
      (!e.exception_en.includes("Saturday")||!e.exception_fr.includes("samedi")))
      throw new Error("Samoreau dated Saturday exception missing");
  }
  if(JSON.stringify(p.entries.map(e=>e.scope+"|"+e.time+"|"+e.mass_type))!==
     JSON.stringify(EXPECTED_LINES[p.cl2_anchor]))
    throw new Error("Unapproved source-weekly pattern change "+p.cl2_anchor);
  byAnchor.set(p.cl2_anchor,p);
 }
 if(byAnchor.size!==Object.keys(EXPECTED).length)throw new Error("Missing source-weekly site");
 const matched=new Set();
 const enriched=(Array.isArray(items)?items:[]).map(item=>{
  const p=byAnchor.get(item?.physical_group_id);
  if(!p)return item;
  if(matched.has(p.cl2_anchor)||item.kind!=="TLM_VENUE"||
    item.physical_site_source!=="CL2_MASTER"||item.source_id!==p.source_id||
    item.country_code!==p.country||
    item.title!==p.canonical_name||
    item.source_location_description!==p.physical_description||
    !Array.isArray(item.source_ids)||item.source_ids.length!==1||
    item.source_ids[0]!==p.source_id||
    !Array.isArray(item.source_links)||
    !item.source_links.some(s=>s?.url===p.existing_source_url)||
    !item.source_links.some(s=>s?.url===p.source_page_url)||
    item.weekly_source_programme)
    throw new Error("CL27 source-weekly site identity mismatch "+p.cl2_anchor);
  matched.add(p.cl2_anchor);
  return Object.freeze({...item,weekly_source_programme:Object.freeze({
   ...p,entries:Object.freeze(p.entries.map(e=>Object.freeze({...e})))
  })});
 });
 if(matched.size!==Object.keys(EXPECTED).length)
  throw new Error("CL27 source-weekly programme failed exact site join");
 return Object.freeze(enriched);
}
