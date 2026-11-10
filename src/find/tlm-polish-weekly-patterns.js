/** Six Polish CL27 first-party site patterns, not promised Mass occurrences.
 * Stacked after the 14-site French source supplement. No liturgical edition
 * or individual Canon, standing, legal owner, geospatial or date inference.
 */
export const CL27_POLISH_SOURCE_WEEKLY_URL=new URL(
 "../../data/directory/cl27-weekly-mass-poland-six-20261110.v1.json",import.meta.url).href;
const T=v=>String(v??"").trim();
const EXPECTED=Object.freeze({
  "RG-A080BDE87FC4": {
    "url": "https://www.piusx.org.pl/kaplice/bajerze",
    "source_id": "AO-B33-L-PL-4D17D140DFBE",
    "source_ids": [
      "AO-B33-L-PL-4D17D140DFBE",
      "AO-B40-SSPX-PL-BAJERZE"
    ],
    "lines": [
      "SUNDAY|07:00|UNKNOWN",
      "SUNDAY|09:00|UNKNOWN",
      "FIRST_FRIDAY|19:00|UNKNOWN",
      "FIRST_SATURDAY|09:00|UNKNOWN",
      "MONDAY_TO_FRIDAY|07:15|UNKNOWN",
      "SATURDAY|07:15|UNKNOWN"
    ],
    "name": "Kaplica Chrystusa Króla",
    "description": "Bajerze 36 (pałac), Kijewo Królewskie, Bajerze, Poland"
  },
  "RG-858EA6AA6D6A": {
    "url": "https://www.piusx.org.pl/kaplice/boleslawiec",
    "source_id": "AO-B40-SSPX-PL-BOLES_AWIEC",
    "source_ids": [
      "AO-B40-SSPX-PL-BOLES_AWIEC",
      "SSPXMAP:OPE-002727"
    ],
    "lines": [
      "SUNDAY|12:30|UNKNOWN",
      "FIRST_FRIDAY|18:00|UNKNOWN",
      "FIRST_SATURDAY|09:00|UNKNOWN"
    ],
    "name": "Kaplica pw. NMPanny Nieustającej Pomocy",
    "description": "Our Lady of Perpetual Help chapel, ul. Garncarska 17"
  },
  "RG-513593EF876C": {
    "url": "https://www.piusx.org.pl/kaplice/bydgoszcz",
    "source_id": "AO-B40-SSPX-PL-BYDGOSZCZ",
    "source_ids": [
      "AO-B40-SSPX-PL-BYDGOSZCZ",
      "SSPXMAP:OPE-002730"
    ],
    "lines": [
      "SUNDAY|08:30|SUNG",
      "FIRST_FRIDAY|18:00|UNKNOWN",
      "FIRST_SATURDAY|09:00|UNKNOWN"
    ],
    "name": "Kaplica pw. Matki Bożej Bolesnej",
    "description": "Our Lady of Sorrows chapel, ul. Fordońska 399"
  },
  "RG-5C04CA9B3BD4": {
    "url": "https://www.piusx.org.pl/kaplice/krosno",
    "source_id": "AO-B40-SSPX-PL-KROSNO",
    "source_ids": [
      "AO-B40-SSPX-PL-KROSNO",
      "SSPXMAP:OPE-002715"
    ],
    "lines": [
      "SUNDAY|13:30|UNKNOWN",
      "FIRST_SATURDAY|08:00|UNKNOWN"
    ],
    "name": "Kaplica pw. św. Jana z Dukli",
    "description": "St. John of Dukla chapel, ul. Okrzei 4A"
  },
  "RG-A0DBF5D61B7D": {
    "url": "https://www.piusx.org.pl/kaplice/szczecin",
    "source_id": "AO-B40-SSPX-PL-SZCZECIN",
    "source_ids": [
      "AO-B40-SSPX-PL-SZCZECIN",
      "SSPXMAP:OPE-002305",
      "ao-research-sspx-oct26-poland-sspx-oct26-pl-szczecin-kaplica-sw-wojciecha"
    ],
    "lines": [
      "SUNDAY|08:00|LOW",
      "SUNDAY|10:00|SUNG",
      "FIRST_FRIDAY|18:00|UNKNOWN",
      "SATURDAY|18:00|LOW"
    ],
    "name": "Kaplica p.w. sw. Wojciecha",
    "description": "St. Adalbert chapel, ul. Monte Cassino 30"
  },
  "RG-D70080C4D765": {
    "url": "https://www.piusx.org.pl/kaplice/torun",
    "source_id": "AO-B40-SSPX-PL-TORUN",
    "source_ids": [
      "AO-B40-SSPX-PL-TORUN",
      "SSPXMAP:OPE-002731"
    ],
    "lines": [
      "SUNDAY|12:30|UNKNOWN",
      "FIRST_SATURDAY|12:30|UNKNOWN"
    ],
    "name": "Kaplica pw. św. Jana Marii Vianneya",
    "description": "St. John Mary Vianney chapel, ul. Fałata 35/37"
  }
});
const SCOPES=new Set(["SUNDAY","FIRST_FRIDAY","FIRST_SATURDAY","MONDAY_TO_FRIDAY","SATURDAY"]);
const TYPES=new Set(["UNKNOWN","LOW","SUNG"]);
const FORBIDDEN=["rrule","recurrence","next_mass","event_date","occurrences","calendar_events",
 "una_cum","canonical_status","pope_named_in_canon","missal","missal_edition",
 "rubrical_basis","rite","celebrant","venue_owner","ownership","gps","latitude","longitude"];
const forbidden=x=>FORBIDDEN.some(k=>Object.hasOwn(x,k));
const HHMM=v=>/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(T(v));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function attachPolishFirstPartyWeeklyPatterns(items,manifest){
 if(manifest?.schema!=="AO_CL27_POLISH_SOURCE_WEEKLY_V1"||
    manifest.publication!=="FIRST_PARTY_REPORTED_PATTERN_NOT_LIVE_MASS_OCCURRENCE"||
    manifest.reviewed_on!=="2026-11-10"||!Array.isArray(manifest.sites)||
    manifest.sites.length!==6||forbidden(manifest))
  throw Error("Invalid Polish CL27 site source programme");
 const by=new Map();
 for(const p of manifest.sites){
  const exp=EXPECTED[p?.cl2_anchor];
  if(!exp||by.has(p.cl2_anchor)||p.country!=="PL"||p.source_id!==exp.source_id||
     !same(p.source_ids,exp.source_ids)||p.source_page_url!==exp.url||
     p.existing_source_url!=="https://www.piusx.org.pl/kaplice/zestawienie"||
     p.source_publisher!=="Bractwo Kapłańskie Świętego Piusa X w Polsce"||
     p.checked_on!=="2026-11-10"||p.subject_scope!=="ONE_NAMED_CL2_SITE_NOT_DISTRICT"||
     p.canonical_name!==exp.name||p.physical_description!==exp.description||forbidden(p)||
     !Array.isArray(p.entries)||p.entries.length!==exp.lines.length)
   throw Error("Unsupported Polish CL27 source site "+T(p?.cl2_anchor));
  const actual=[];
  for(const e of p.entries){
   if(!e||!SCOPES.has(e.scope)||!HHMM(e.time)||!TYPES.has(e.mass_type)||
       !T(e.label_en)||!T(e.label_fr)||
       typeof e.exception_en!=="string"||typeof e.exception_fr!=="string"||forbidden(e))
    throw Error("Invalid Polish source line "+p.cl2_anchor);
   actual.push(e.scope+"|"+e.time+"|"+e.mass_type);
   if(p.cl2_anchor==="RG-A080BDE87FC4"&&e.scope==="SATURDAY"&&
      !e.exception_en.includes("09:00"))
    throw Error("Bajerze first Saturday caution missing");
  }
  if(!same(actual,exp.lines))throw Error("Unapproved Polish Mass-time pattern "+p.cl2_anchor);
  by.set(p.cl2_anchor,p);
 }
 if(by.size!==6)throw Error("Incomplete Polish CL27 site programme");
 const matched=new Set();
 const result=(Array.isArray(items)?items:[]).map(item=>{
  const p=by.get(item?.physical_group_id);
  if(!p)return item;
  if(matched.has(p.cl2_anchor)||item.kind!=="TLM_VENUE"||
    item.physical_site_source!=="CL2_MASTER"||!p.source_ids.includes(item.source_id)||
    item.country_code!==p.country||
    item.source_location_description!==p.physical_description||
    !same(item.source_ids,p.source_ids)||
    !Array.isArray(item.source_links)||
    !item.source_links.some(s=>s?.url===p.existing_source_url)||
    item.weekly_source_programme)
   throw Error("Polish source cannot join existing CL2 site "+p.cl2_anchor);
  matched.add(p.cl2_anchor);
  return Object.freeze({...item,weekly_source_programme:Object.freeze({
    ...p,entries:Object.freeze(p.entries.map(e=>Object.freeze({...e})))
  })});
 });
 if(matched.size!==6)throw Error("Missing exact CL2 Polish chapel for source pattern");
 return Object.freeze(result);
}
