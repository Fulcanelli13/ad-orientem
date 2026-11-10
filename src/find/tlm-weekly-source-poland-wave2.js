/** Five strictly site-joined Polish source-published Mass patterns, CL27 Wave 2.
 * No occurrence generation, church identity migration, or ecclesial inference.
 */
export const CL27_POLAND_WAVE2_SOURCE_URL=new URL(
 "../../data/directory/cl27-weekly-mass-poland-wave2-20261110.v1.json",import.meta.url).href;
const EXPECTED=Object.freeze({
  "RG-718C93E329B6": {
    "source_ids": [
      "AO-B40-SSPX-PL-GNIEZNO",
      "SSPXMAP:OPE-002723"
    ],
    "name": "Kaplica pw. Matki Bożej Dobrej Rady",
    "description": "Our Lady of Good Counsel chapel, ul. Krzywe Koło 2",
    "original": "https://www.piusx.org.pl/kaplice/zestawienie",
    "url": "https://www.piusx.org.pl/kaplice/gniezno",
    "cert": "AO-27M-PL-009",
    "notice": null,
    "lines": [
      "SUNDAYS|13:30|UNKNOWN",
      "FIRST_FRIDAY|07:00|UNKNOWN",
      "FIRST_SATURDAY|09:00|UNKNOWN",
      "THURSDAY_SPECIAL|18:00|UNKNOWN"
    ]
  },
  "RG-08B30B0916B1": {
    "source_ids": [
      "AO-B33-L-PL-1D1F492238BE",
      "AO-B40-SSPX-PL-KATOWICE"
    ],
    "name": "Kaplica św. Jacka",
    "description": "ul. Uniczowska 13, Katowice, Poland",
    "original": "https://www.piusx.org.pl/kaplice/katowice",
    "url": "https://www.piusx.org.pl/kaplice/katowice",
    "cert": "AO-27M-PL-014",
    "notice": null,
    "lines": [
      "SUNDAYS|08:30|UNKNOWN",
      "SUNDAYS|18:00|UNKNOWN",
      "OTHER_SATURDAYS|18:00|UNKNOWN",
      "FIRST_FRIDAY|19:00|UNKNOWN",
      "FIRST_SATURDAY|09:00|UNKNOWN"
    ]
  },
  "RG-5C04CA9B3BD4": {
    "source_ids": [
      "AO-B40-SSPX-PL-KROSNO",
      "SSPXMAP:OPE-002715"
    ],
    "name": "Kaplica pw. św. Jana z Dukli",
    "description": "St. John of Dukla chapel, ul. Okrzei 4A",
    "original": "https://www.piusx.org.pl/kaplice/zestawienie",
    "url": "https://www.piusx.org.pl/kaplice/krosno",
    "cert": "AO-27M-PL-017",
    "notice": null,
    "lines": [
      "SUNDAYS|13:30|UNKNOWN",
      "FIRST_SATURDAY|08:00|UNKNOWN"
    ]
  },
  "RG-7F6111F5DA58": {
    "source_ids": [
      "AO-B40-SSPX-PL-LUBLIN",
      "SSPXMAP:OPE-002303"
    ],
    "name": "Kaplica pw. św. Stanisława Kostki",
    "description": "St. Stanislaus Kostka chapel, ul. Żeglarska 6",
    "original": "https://www.piusx.org.pl/kaplice/zestawienie",
    "url": "https://www.piusx.org.pl/kaplice/lublin",
    "cert": "AO-27M-PL-019",
    "notice": null,
    "lines": [
      "SUNDAYS|11:30|UNKNOWN",
      "FIRST_FRIDAY|18:00|UNKNOWN",
      "FIRST_SATURDAY|11:15|SUNG",
      "SATURDAY|18:00|UNKNOWN"
    ]
  },
  "RG-00E777838530": {
    "source_ids": [
      "AO-B40-SSPX-PL-ODZ",
      "SSPXMAP:OPE-002306",
      "ao-research-sspx-oct26-poland-sspx-oct26-pl-odz-kaplica-sw-piusa-v"
    ],
    "name": "Kaplica pw. św. Piusa V",
    "description": "St. Pius V chapel, ul. ks. Piotra Skargi 12",
    "original": "https://www.piusx.org.pl/kaplice/zestawienie",
    "url": "https://www.piusx.org.pl/kaplice/lodz",
    "cert": "AO-27M-PL-020",
    "notice": "https://www.piusx.org.pl/komunikaty/2026/244",
    "lines": [
      "SUNDAYS|09:00|SUNG",
      "SUNDAYS|12:00|LOW",
      "FIRST_FRIDAY|19:00|UNKNOWN",
      "FIRST_SATURDAY|10:00|UNKNOWN",
      "SATURDAY|18:00|LOW"
    ]
  }
});
const T=v=>String(v??"").trim();
const TYPES=new Set(["UNKNOWN","LOW","SUNG"]);
const SCOPES=new Set(["SUNDAYS","FIRST_FRIDAY","FIRST_SATURDAY",
 "THURSDAY_SPECIAL","OTHER_SATURDAYS","SATURDAY"]);
const FORBIDDEN=["rrule","recurrence","next_mass","event_date","occurrences","calendar_events",
 "una_cum","canonical_status","pope_named_in_canon","missal","missal_edition",
 "rubrical_basis","rite","celebrant","venue_owner","ownership","gps","latitude","longitude"];
const forbidden=o=>o&&FORBIDDEN.some(k=>Object.hasOwn(o,k));
const HHMM=s=>/^([01]\d|2[0-3]):[0-5]\d$/.test(T(s));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const conditional=new Set(["FIRST_FRIDAY","FIRST_SATURDAY","THURSDAY_SPECIAL","OTHER_SATURDAYS"]);
export function attachPublishedPolandWave2SourcePatterns(items,manifest){
 if(manifest?.schema!=="AO_CL27_POLAND_WAVE2_OPERATOR_MASS_PATTERNS_V1"||
    manifest.publication!=="FIRST_PARTY_REPORTED_PATTERN_NOT_LIVE_MASS_OCCURRENCE"||
    manifest.reviewed_on!=="2026-11-10"||
    !Array.isArray(manifest.sites)||manifest.sites.length!==5||forbidden(manifest))
  throw Error("Invalid CL27 Poland Wave 2 manifest");
 const by=new Map();
 for(const p of manifest.sites){
  const e=EXPECTED[p?.cl2_anchor];
  if(!e||by.has(p.cl2_anchor)||p.country!=="PL"||
     !same(p.source_ids,e.source_ids)||p.canonical_name!==e.name||
     p.physical_description!==e.description||p.existing_source_url!==e.original||
     p.source_page_url!==e.url||
     p.source_directory_url!=="https://www.piusx.org.pl/kaplice/zestawienie"||
     (p.source_notice_url||null)!==e.notice||
     p.phase27m_certificate_id!==e.cert||
     p.source_publisher!=="FSSPX Poland · piusx.org.pl"||
     p.subject_scope!=="ONE_NAMED_CL2_SITE_NOT_DISTRICT"||
     p.checked_on!=="2026-11-10"||forbidden(p)||
     !/^https:\/\/www\.piusx\.org\.pl\/kaplice\//.test(p.existing_source_url)||
     !Array.isArray(p.entries)||p.entries.length!==e.lines.length)
     throw Error("Invalid Poland Wave 2 identity/scope "+T(p?.cl2_anchor));
  const found=[],seen=new Set();
  for(const line of p.entries){
   if(!line||!SCOPES.has(line.scope)||!HHMM(line.time)||!TYPES.has(line.mass_type)||
      !T(line.label_en)||!T(line.label_fr)||
      typeof line.exception_en!=="string"||typeof line.exception_fr!=="string"||
      forbidden(line)||seen.has(line.scope+":"+line.time))
     throw Error("Invalid Polish operator Mass time "+p.cl2_anchor);
   seen.add(line.scope+":"+line.time);
   if(conditional.has(line.scope)&&(!T(line.exception_en)||!T(line.exception_fr)))
     throw Error("Missing conditional Mass scope explanation "+p.cl2_anchor);
   found.push(line.scope+"|"+line.time+"|"+line.mass_type);
  }
  if(!same(found,e.lines))throw Error("Mutated first-party source Mass pattern "+p.cl2_anchor);
  by.set(p.cl2_anchor,p);
 }
 if(by.size!==5)throw Error("Five distinct Polish CL2 sources are required");
 const joined=new Set();
 const result=(Array.isArray(items)?items:[]).map(item=>{
  const p=by.get(item?.physical_group_id);
  if(!p)return item;
  if(joined.has(p.cl2_anchor)||item.kind!=="TLM_VENUE"||
     item.physical_site_source!=="CL2_MASTER"||item.country_code!=="PL"||
     item.source_location_description!==p.physical_description||
     !same(item.source_ids,p.source_ids)||!p.source_ids.includes(item.source_id)||
     !Array.isArray(item.source_links)||!item.source_links.some(x=>x?.url===p.existing_source_url)||
     item.weekly_source_programme)
    throw Error("Failed exact physical-site join or timetable collision "+p.cl2_anchor);
  joined.add(p.cl2_anchor);
  return Object.freeze({...item,weekly_source_programme:Object.freeze({
   ...p,entries:Object.freeze(p.entries.map(e=>Object.freeze({...e})))
  })});
 });
 if(joined.size!==5)throw Error("Five approved Polish CL2 sites not found in the rendered directory");
 return Object.freeze(result);
}
