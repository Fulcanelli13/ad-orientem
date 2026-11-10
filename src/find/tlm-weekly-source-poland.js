/** Operator-published Polish chapel patterns: six exact CL2 identities.
 * Never create RRULEs, future dated Masses, Missal/Una Cum or site ownership.
 */
export const CL27_POLAND_SOURCE_URL=new URL(
 "../../data/directory/cl27-weekly-mass-poland-20261110.v1.json",import.meta.url).href;
const EXPECTED=Object.freeze({
  "RG-A080BDE87FC4": {
    "url": "https://www.piusx.org.pl/kaplice/bajerze",
    "source_ids": [
      "AO-B33-L-PL-4D17D140DFBE",
      "AO-B40-SSPX-PL-BAJERZE"
    ],
    "certificate": "AO-27M-PL-001",
    "lines": [
      "SUNDAYS|07:00|UNKNOWN",
      "SUNDAYS|09:00|UNKNOWN",
      "WEEKDAY_MON_FRI|07:15|UNKNOWN",
      "SATURDAY|07:15|UNKNOWN",
      "FIRST_FRIDAY|19:00|UNKNOWN",
      "FIRST_SATURDAY|09:00|UNKNOWN"
    ]
  },
  "RG-3BD77BE4BBF9": {
    "url": "https://www.piusx.org.pl/kaplice/bialystok",
    "source_ids": [
      "AO-B40-SSPX-PL-BIA_YSTOK",
      "SSPXMAP:OPE-002710"
    ],
    "certificate": "AO-27M-PL-002",
    "lines": [
      "SUNDAYS|09:00|SUNG",
      "SATURDAY|18:00|UNKNOWN",
      "FIRST_FRIDAY|18:00|UNKNOWN"
    ]
  },
  "RG-3D9BC0A99E10": {
    "url": "https://www.piusx.org.pl/kaplice/bielsko-biala",
    "source_ids": [
      "AO-B40-SSPX-PL-BIELSKO_BIA_A",
      "SSPXMAP:OPE-002720",
      "ao-research-sspx-oct26-poland-sspx-oct26-pl-bielsko-bia-a-kaplica-sw-melchiora-grodzieckiego"
    ],
    "certificate": "AO-27M-PL-003",
    "lines": [
      "SUNDAYS|09:00|UNKNOWN",
      "SATURDAY|18:00|UNKNOWN",
      "FIRST_FRIDAY|18:00|UNKNOWN",
      "FIRST_SATURDAY|09:00|UNKNOWN"
    ]
  },
  "RG-858EA6AA6D6A": {
    "url": "https://www.piusx.org.pl/kaplice/boleslawiec",
    "source_ids": [
      "AO-B40-SSPX-PL-BOLES_AWIEC",
      "SSPXMAP:OPE-002727"
    ],
    "certificate": "AO-27M-PL-004",
    "lines": [
      "SUNDAYS|12:30|UNKNOWN",
      "FIRST_FRIDAY|18:00|UNKNOWN",
      "FIRST_SATURDAY|09:00|UNKNOWN"
    ]
  },
  "RG-F38DEA178149": {
    "url": "https://www.piusx.org.pl/kaplice/bukowiec",
    "source_ids": [
      "AO-B40-SSPX-PL-BUKOWIEC",
      "SSPXMAP:OPE-002718"
    ],
    "certificate": "AO-27M-PL-005",
    "lines": [
      "SUNDAYS|09:00|UNKNOWN",
      "SATURDAY|18:00|UNKNOWN",
      "FIRST_FRIDAY|18:00|UNKNOWN",
      "FIRST_SATURDAY|09:00|UNKNOWN",
      "THURSDAY_BEFORE_FIRST_FRIDAY|18:00|UNKNOWN"
    ]
  },
  "RG-513593EF876C": {
    "url": "https://www.piusx.org.pl/kaplice/bydgoszcz",
    "source_ids": [
      "AO-B40-SSPX-PL-BYDGOSZCZ",
      "SSPXMAP:OPE-002730"
    ],
    "certificate": "AO-27M-PL-006",
    "lines": [
      "SUNDAYS|08:30|SUNG",
      "FIRST_FRIDAY|18:00|UNKNOWN",
      "FIRST_SATURDAY|09:00|UNKNOWN"
    ]
  }
});
const T=v=>String(v??"").trim();
const SCOPES=new Set(["SUNDAYS","WEEKDAY_MON_FRI","SATURDAY","FIRST_FRIDAY","FIRST_SATURDAY","THURSDAY_BEFORE_FIRST_FRIDAY"]);
const TYPES=new Set(["UNKNOWN","LOW","SUNG"]);
const FORBIDDEN=["rrule","recurrence","next_mass","event_date","occurrences","calendar_events",
 "una_cum","canonical_status","pope_named_in_canon","missal","missal_edition",
 "rubrical_basis","rite","celebrant","venue_owner","ownership","gps","latitude","longitude"];
const forbidden=o=>o&&FORBIDDEN.some(k=>Object.hasOwn(o,k));
const HHMM=s=>/^([01]\d|2[0-3]):[0-5]\d$/.test(T(s));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function attachPublishedPolandSourcePatterns(items,manifest){
 if(manifest?.schema!=="AO_CL27_POLAND_OPERATOR_MASS_PATTERNS_V1"||
    manifest.publication!=="FIRST_PARTY_REPORTED_PATTERN_NOT_LIVE_MASS_OCCURRENCE"||
    manifest.reviewed_on!=="2026-11-10"||
    !Array.isArray(manifest.sites)||manifest.sites.length!==6||forbidden(manifest))
   throw Error("Invalid CL27 Poland operator manifest");
 const by=new Map();
 for(const p of manifest.sites){
  const ex=EXPECTED[p?.cl2_anchor];
  if(!ex||by.has(p.cl2_anchor)||p.country!=="PL"||
    p.source_page_url!==ex.url||!same(p.source_ids,ex.source_ids)||
    p.phase27m_certificate_id!==ex.certificate||
    p.source_publisher!=="FSSPX Poland · piusx.org.pl"||
    !T(p.canonical_name)||!T(p.physical_description)||!T(p.existing_source_url)||
    !/^https:\/\/www\.piusx\.org\.pl\/kaplice\//.test(p.existing_source_url)||
    p.checked_on!=="2026-11-10"||
    p.subject_scope!=="ONE_NAMED_CL2_SITE_NOT_DISTRICT"||
    forbidden(p)||!Array.isArray(p.entries)||p.entries.length!==ex.lines.length)
    throw Error("Invalid Polish chapel source scope "+T(p?.cl2_anchor));
  const actual=[],seen=new Set();
  for(const e of p.entries){
   if(!e||!SCOPES.has(e.scope)||!HHMM(e.time)||!TYPES.has(e.mass_type)||
     !T(e.label_en)||!T(e.label_fr)||
     typeof e.exception_en!=="string"||typeof e.exception_fr!=="string"||
     forbidden(e)||seen.has(e.scope+":"+e.time))
      throw Error("Invalid or duplicate Polish Mass source line "+p.cl2_anchor);
   seen.add(e.scope+":"+e.time);
   if((e.scope==="FIRST_FRIDAY"||e.scope==="FIRST_SATURDAY"||
       e.scope==="THURSDAY_BEFORE_FIRST_FRIDAY")&&
      (!T(e.exception_en)||!T(e.exception_fr)))
      throw Error("Conditional first-week pattern missing caution "+p.cl2_anchor);
   actual.push(e.scope+"|"+e.time+"|"+e.mass_type);
  }
  if(!same(actual,ex.lines))throw Error("Unapproved Polish source clock mutation "+p.cl2_anchor);
  by.set(p.cl2_anchor,p);
 }
 const found=new Set();
 const out=(Array.isArray(items)?items:[]).map(item=>{
  const p=by.get(item?.physical_group_id);
  if(!p)return item;
  if(found.has(p.cl2_anchor)||item.kind!=="TLM_VENUE"||
    item.physical_site_source!=="CL2_MASTER"||
    item.country_code!=="PL"||!T(item.title)||
    item.source_location_description!==p.physical_description||
    !same(item.source_ids,p.source_ids)||!p.source_ids.includes(item.source_id)||
    !Array.isArray(item.source_links)||
    !item.source_links.some(s=>s?.url===p.existing_source_url)||
    item.weekly_source_programme)
    throw Error("Poland source profile identity or timetable conflict "+p.cl2_anchor);
  found.add(p.cl2_anchor);
  return Object.freeze({...item,weekly_source_programme:Object.freeze({
    ...p,entries:Object.freeze(p.entries.map(e=>Object.freeze({...e})))
  })});
 });
 if(found.size!==6)throw Error("Poland source patterns failed all six CL2 joins");
 return Object.freeze(out);
}
