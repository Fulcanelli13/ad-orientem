import { CL2_PHYSICAL_SITE_INDEX_URL,projectCL2PhysicalDirectory } from "./cl2-physical-directory.js";
// Preliminary R49 venue snapshot. Source-affiliation groupings are editorial,
// never proof of a particular Canon's una-cum commemoration or active timetable.
export const PRELIMINARY_R49_URL=new URL("../../data/directory/preliminary-map-r49.v1.json",import.meta.url).href;
export const PUBLISHED_PROVISIONAL_MASS_SITES_URL=new URL("../../data/directory/published-provisional-mass-sites-20261026.v1.json",import.meta.url).href;
export const PUBLISHED_PROVISIONAL_MASS_SITES_EXPECTED=3;
export const PRELIMINARY_R49_TOTAL=1879;
export const PRELIMINARY_R49_ROME=1022;
const COLS=["id","name","country","locality","affiliation","group","lat","lng","url","other_url","precision"];
const tidy=s=>String(s??"").trim();
const searchKey=s=>tidy(s).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
// Exact source-affiliation names are identity hints for Explore filtering and
// neutral monograms, not proof of canonical standing or a particular Mass.
const REPORTED_INSTITUTION_LABELS=Object.freeze({
  "CANONS OF ST JOHN CANTIUS":"CANONS_ST_JOHN_CANTIUS",
  "CAPUCINS DE MORGON":"CAPUCHINS_MORGON",
  "FRATERNITÉ DE LA TRANSFIGURATION":"TRANSFIGURATION",
  "ORATORIANS":"ORATORIAN",
  "CARMÉLITES":"CARMELITE",
  "BÉNÉDICTINES":"BENEDICTINE",
  "DOMINICAINS":"DOMINICAN",
});
function providerGroup(affiliation,group){
  const x=tidy(affiliation).toUpperCase();
  if(["FSSP","ICKSP","IBP","AASJMV"].includes(x))return x;
  if(Object.hasOwn(REPORTED_INSTITUTION_LABELS,x))return REPORTED_INSTITUTION_LABELS[x];
  if(group==="SSPX")return "SSPX";
  if(x.startsWith("DIOCESAN"))return "DIOCESAN";
  return "OTHER";
}
function linkList(raw,limit=5){
  return tidy(raw).split(/\s*;\s*/).filter(url=>/^https?:\/\/[^\s]+$/i.test(url)).slice(0,limit);
}
export function validateR49Snapshot(json){
  if(json?.schema!=="AO_PRELIMINARY_TLM_MAP_R49"||!Array.isArray(json.records)||
     JSON.stringify(json.columns)!==JSON.stringify(COLS)||json.records.length!==PRELIMINARY_R49_TOTAL){
    throw new Error("Invalid preliminary R49 directory snapshot");
  }
  const ids=new Set();let rome=0,sspx=0,unknown=0;
  for(const row of json.records){
    if(!Array.isArray(row)||row.length!==COLS.length)throw new Error("Malformed R49 row");
    const [id,name,country,, ,group,lat,lng,url]=row;
    if(!tidy(id)||!tidy(name)||!/^[A-Z]{2}$/.test(country)||ids.has(id)||
       !Number.isFinite(lat)||lat<-90||lat>90||!Number.isFinite(lng)||lng<-180||lng>180||
       !/^https?:\/\//.test(url)||!["ROME","SSPX","UNKNOWN"].includes(group))
      throw new Error("Invalid or duplicate R49 venue");
    ids.add(id);
    if(group==="ROME")rome++;else if(group==="SSPX")sspx++;else unknown++;
  }
  if(rome!==PRELIMINARY_R49_ROME||sspx!==732||unknown!==125)
    throw new Error("R49 grouping count mismatch");
  return json;
}
export function projectPreliminaryR49(json){
  const source=validateR49Snapshot(json);
  return Object.freeze(source.records.map(row=>{
    const [id,name,country,locality,affiliation,group,lat,lng,url,other_url,precision]=row;
    const community_id=providerGroup(affiliation,group);
    const sources=[...linkList(url),...linkList(other_url)].filter((v,i,a)=>v&&a.indexOf(v)===i);
    const provisional="Provisional venue pin. Presence of the traditional Mass, affiliation, precise entrance and times have not been verified.";
    const label=tidy(affiliation)||"Affiliation unverified";
    return Object.freeze({
      item_id:"tlm:r49:"+id,source_id:id,lens:"tlm",kind:"TLM_VENUE",
      community_id,preliminary_group:group,affiliation_scope:"SOURCE_LABEL_ONLY",
      eyebrow:label,
      status:group==="ROME"?"SOURCE-REPORTED":group==="SSPX"?"SSPX · SEPARATE":"UNCLASSIFIED",
      title:name,
      subtitle:[locality,country].filter(Boolean).join(" · "),
      summary:provisional,
      address:{formatted:[locality,country].filter(Boolean).join(", ")},
      geo:{lat,lng,precision:tidy(precision)||"source_marker_unassessed",
        approximate:true,attribution:"© OpenStreetMap contributors · ODbL 1.0"},
      map_publishable:true,map_state:"PROVISIONAL",
      facts:Object.freeze([
        Object.freeze({label:"Affiliation",value:label}),
        Object.freeze({label:"Location",value:"Provisional source/geocoder map position"}),
        Object.freeze({label:"Mass times",value:"Not verified — consult the listed source"}),
      ]),
      sections:Object.freeze([]),
      source_links:Object.freeze(sources.map((sourceUrl,i)=>Object.freeze({
        id:id+"-source-"+i,title:i===0?"Venue source":"Additional source",
        issuer:"Directory source",url:sourceUrl,
      }))),
      actions:Object.freeze([]),
      note:"Affiliation is source-reported; canonical standing and whether the Pope is named in an individual Mass are not independently established. Check original sources before travelling.",
      search_text:searchKey([name,locality,country,affiliation,group].join(" ")),
    });
  }));
}
/**
 * Controlled addition of new physical venues to the existing provisional
 * TLM map. The original R49 dataset stays frozen and its validation unchanged.
 * Each addition needs direct liturgical evidence and independent site geometry,
 * but NO recurring time becomes certified by this map publication.
 */
export function projectPublishedProvisionalMassSites(baseItems,manifest){
  if(manifest?.schema!=="AO_TLM_SOURCE_REPORTED_MAP_ADDITIONS_V1"||
     manifest?.record_count!==PUBLISHED_PROVISIONAL_MASS_SITES_EXPECTED||
     !Array.isArray(manifest?.records)||manifest.records.length!==manifest.record_count)
    throw new Error("Invalid source-reported map release manifest");
  const sourceIds=new Set((Array.isArray(baseItems)?baseItems:[]).map(x=>x.source_id));
  const result=[];
  for(const record of manifest.records){
    const id=tidy(record?.research_group_id),name=tidy(record?.name),cc=tidy(record?.country);
    const geo=record?.geo??{},lat=Number(geo.lat),lng=Number(geo.lng);
    const safeUrl=v=>/^https:\/\/[^\s<>"]+$/i.test(tidy(v));
    if(!/^RG-B(?:85|89)-[A-Z0-9]+$/.test(id)||sourceIds.has(id)||
       !name||!/^[A-Z]{2}$/.test(cc)||!tidy(record?.locality)||
       !tidy(record?.address)||record?.group!=="ROME"||
       !Number.isFinite(lat)||Math.abs(lat)>90||!Number.isFinite(lng)||Math.abs(lng)>180||
       !["address","building"].includes(tidy(geo.precision))||
       !tidy(geo.source_ref)||!safeUrl(geo.source_url)||
       cc!==tidy(geo.matched_country_code)||
       !safeUrl(record.official_mass_url)||!safeUrl(record.official_building_url)||
       !safeUrl(record.independent_mass_url)||
       !tidy(record.mass_evidence)||!tidy(record.time_policy))
      throw new Error("Invalid/unreleased TLM location: "+id);
    sourceIds.add(id);
    const sourceLinks=[record.official_mass_url,record.official_building_url,
      record.independent_mass_url,geo.source_url].filter((u,i,a)=>a.indexOf(u)===i);
    result.push(Object.freeze({
      item_id:"tlm:published-provisional:"+id,source_id:id,lens:"tlm",kind:"TLM_VENUE",
      community_id:"DIOCESAN",preliminary_group:"ROME",
      eyebrow:"Diocesan / source-reported",status:"SOURCE-REPORTED",
      title:name,subtitle:[record.locality,cc].join(" · "),
      summary:"Traditional Latin Mass location supported by church/organizer evidence. The Mass timetable is not independently certified; confirm details with the venue.",
      address:{formatted:record.address},
      geo:{lat,lng,precision:geo.precision,approximate:true,
        attribution:geo.attribution,source_ref:geo.source_ref,source_url:geo.source_url},
      map_publishable:true,map_state:"PROVISIONAL",
      facts:Object.freeze([
        Object.freeze({label:"Mass use",value:"Traditional Latin Mass: source-reported"}),
        Object.freeze({label:"Coordinates",value:"Documented building/address; verify entrance"}),
        Object.freeze({label:"Mass times",value:"Not independently verified — check the parish or sanctuary"}),
      ]),
      sections:Object.freeze([]),
      source_links:Object.freeze(sourceLinks.map((u,i)=>Object.freeze({
        id:id+"-source-"+i,title:i===0?"Official Mass source":
          i===1?"Building identity":"Corroborating reference",
        issuer:"Source evidence",url:u,
      }))),
      actions:Object.freeze([]),
      note:record.mass_evidence+" Schedule policy: "+record.time_policy+
        ". Times are deliberately not imported into the recurring Mass calendar.",
      search_text:searchKey([name,record.locality,cc,record.affiliation,"DIOCESAN"].join(" ")),
    }));
  }
  return Object.freeze([...(Array.isArray(baseItems)?baseItems:[]),...result]);
}
let cache=null;
export async function loadPreliminaryR49({fetchImpl=fetch}={}){
  if(cache)return cache;
  const response=await fetchImpl(PRELIMINARY_R49_URL,{headers:{accept:"application/json"}});
  if(!response?.ok)throw new Error("R49 directory snapshot unavailable: HTTP "+response?.status);
  const base=projectPreliminaryR49(await response.json());
  let extended=base;
  try{
    const release=await fetchImpl(PUBLISHED_PROVISIONAL_MASS_SITES_URL,{headers:{accept:"application/json"}});
    if(release?.ok)extended=projectPublishedProvisionalMassSites(base,await release.json());
  }catch{
    // The base 1,879-place map must still load if the optional release is
    // unavailable or malformed. No unsupported additional point is displayed.
  }
  // The 2,579-site CL2 master is now the complete directory foundation.
  // A missing/corrupt index is a visible load failure, never a silently
  // truncated 1,879-site worldwide result.
  const full=await fetchImpl(CL2_PHYSICAL_SITE_INDEX_URL,{headers:{accept:"application/json"}});
  if(!full?.ok)throw new Error("CL2 worldwide physical-site index unavailable: HTTP "+full?.status);
  cache=projectCL2PhysicalDirectory(extended,await full.json(),{mapAffiliation:providerGroup});
  return cache;
}
export function filterPreliminaryR49(items,{query="",directoryGroup="ALL",affiliations=[]}={}){
  const q=searchKey(query),group=tidy(directoryGroup).toUpperCase();
  const allowed=["ALL","ROME","SSPX","UNKNOWN"].includes(group)?group:"ROME";
  const aff=new Set((Array.isArray(affiliations)?affiliations:[]).map(x=>tidy(x).toUpperCase()));
  return Object.freeze((Array.isArray(items)?items:[]).filter(item=>
    (allowed==="ALL"||item.preliminary_group===allowed)&&
    (!aff.size||aff.has(item.community_id))&&
    (!q||item.search_text.includes(q))
  ));
}
