// Derived read-model adapter for the single CL2 physical-site master.
// Exactly one Explore record per effective physical site; source aliases are
// preserved for search and provenance, never published as duplicate churches.
export const CL2_PHYSICAL_SITE_INDEX_URL=new URL("../../data/directory/generated/cl2-physical-site-index.v1.json",import.meta.url).href;
export const CL2_PHYSICAL_SITE_COUNT=2579;
export const CL2_EXPECTED_R49_GROUPS=1844;
export const CL2_EXPECTED_NEW_GROUPS=735;
const T=v=>String(v??"").trim();
const normal=s=>T(s).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const validUrl=s=>/^https?:\/\/[^\s<>"']+$/i.test(s);
const https=s=>/^https:\/\/[^\s<>"']+$/i.test(s);
const unique=a=>[...new Set(a)];

// Explicit adjudications of divergent *existing* R49 site pins. Keep original
// source records immutable and preserve the selected venue's item/source ID.
// A church building is corroborated; a precise visitor entrance is NOT.
// Never infer a new coordinate from the postal address or another venue.
const REVIEWED_SITE_GEO_SOURCES=Object.freeze({
 "RG-956BB24E14EA":Object.freeze({
  sourceId:"LMD:maternal-heart-of-mary-church-lewisham-australia",
  evidence:Object.freeze([
   "https://mapcarta.com/W1072172027", // OSM exact FSSP church building
   "https://maternalheart.org/contact-us/", // parish address, Charles O'Neill Way
  ]),
 }),
 "RG-4279040C75AD":Object.freeze({
  sourceId:"LMD:crypt-chapel-of-our-lady-of-sorrows-geraldton-australia",
  evidence:Object.freeze([
   "https://towerbells.org/data/AUGRLNSF.HTM", // Cathedral Avenue, independent building location
   "https://www.geraldtondiocese.org.au/parishes/geraldton-parishes",
  ]),
 }),
});
const family=(aff,mapAffiliation)=>{
 const group=mapAffiliation?.(aff,"UNKNOWN");
 return T(group)||"OTHER";
};
export function validateCL2PhysicalIndex(index){
 if(index?.schema!=="AO_CL2_PHYSICAL_SITE_RUNTIME_INDEX_V1"||
   !Array.isArray(index.records)||index.records.length!==CL2_PHYSICAL_SITE_COUNT||
   index.counts?.effective_physical_sites!==CL2_PHYSICAL_SITE_COUNT)
   throw new Error("Invalid CL2 effective-physical-site directory index");
 const seen=new Set(),sourceOwners=new Map();
 for(const row of index.records){
  if(!Array.isArray(row)||row.length!==7||!/^RG-[A-Z0-9-]+$/.test(T(row[0]))||
    seen.has(row[0])||!Array.isArray(row[1])||!row[1].length||
    !T(row[2])||!/^[A-Z]{2}$/.test(T(row[3]))||
    !Array.isArray(row[6])||row[6].some(u=>!validUrl(u)))
    throw new Error("Invalid CL2 source-owned physical-site row");
  seen.add(row[0]);
  for(const source of row[1]){
   if(!T(source))throw new Error("Empty physical-site source identity");
   if(sourceOwners.has(source)&&sourceOwners.get(source)!==row[0])
    throw new Error("One source ID maps to multiple physical sites: "+source);
   sourceOwners.set(source,row[0]);
  }
 }
 return index;
}
/**
 * Reuse the existing R49 map coordinates and exact-photo source identifiers.
 * Admit missing CL2 groups as list-only research candidates. Do not geocode,
 * synthesize a schedule, or infer an institute's liturgy or ecclesial position.
 * The three separately approved additions remain distinct pending CL2 matching.
 */
export function projectCL2PhysicalDirectory(baseItems,index,{mapAffiliation}={}){
 validateCL2PhysicalIndex(index);
 const base=Array.isArray(baseItems)?baseItems:[];
 const sourceToItem=new Map();
 for(const item of base)if(item?.source_id)sourceToItem.set(item.source_id,item);
 const claimed=new Set(),result=[];let matched=0,unmapped=0,absorbedAliasRows=0;
 const list=Array.isArray(index.records)?index.records:[];
 for(const row of list){
  const [anchor,sourceIds,name,country,description,affiliation,sourceUrls]=row;
  const exact=unique(sourceIds.map(id=>sourceToItem.get(id)).filter(Boolean));
  const linked=exact.sort((a,b)=>
   Number(Boolean(b.geo?.precision==="building"))-Number(Boolean(a.geo?.precision==="building")));
  const selected=linked[0]??null;
  const review=REVIEWED_SITE_GEO_SOURCES[anchor]??null;
  const siteGeoSource=review?linked.find(x=>x.source_id===review.sourceId):null;
  if(review&&(!selected||!sourceIds.includes(review.sourceId)||
     !siteGeoSource?.geo||!Number.isFinite(siteGeoSource.geo.lat)||
     !Number.isFinite(siteGeoSource.geo.lng)||review.evidence.some(x=>!https(x))))
    throw new Error("Unverifiable CL2 site coordinate adjudication: "+anchor);
  const source_links=unique([...(review?.evidence??[]),
    ...(linked.flatMap(item=>(item.source_links??[]).map(s=>s.url))),
    ...sourceUrls].filter(url=>https(url))).slice(0,12).map((url,i)=>Object.freeze({
     id:anchor+"-source-"+i,title:i===0?"Original listing":"Additional research source",
     issuer:"CL2 physical-site sources",url
    }));
  const search_text=normal([name,country,description,affiliation,...sourceIds,
    ...linked.flatMap(item=>[item.title,item.subtitle,item.eyebrow,item.search_text])].join(" "));
  if(selected){
   for(const a of linked)claimed.add(a.item_id);
   absorbedAliasRows+=Math.max(0,linked.length-1);
   matched++;
   // Transfer the independently corroborated *existing source point* only,
   // never the source's venue identity, timetable or implied entrance accuracy.
   const siteGeo=review?Object.freeze({...selected.geo,
    lat:siteGeoSource.geo.lat,lng:siteGeoSource.geo.lng,
    precision:"source_marker_unassessed",approximate:true,
    source_ref:review.sourceId,source_url:review.evidence[0],
    review_scope:"PHYSICAL_CHURCH_NOT_ENTRANCE",
   }):selected.geo;
   result.push(Object.freeze({...selected,
    ...(review?{
     geo:siteGeo,address:Object.freeze({formatted:T(description)}),
     note:T(selected.note)+" Site marker cross-checked against the church building, not a verified entrance.",
    }:{}),
    physical_group_id:anchor,source_ids:Object.freeze([...sourceIds]),
    physical_site_source:"CL2_MASTER",source_links:Object.freeze(source_links),
    search_text,affiliation_scope:"SOURCE_LABEL_ONLY",
   }));
  }else{
   unmapped++;
   const affiliationName=T(affiliation)||"Source affiliation not established";
   const community_id=family(affiliationName,mapAffiliation);
   result.push(Object.freeze({
    item_id:"tlm:cl2:"+anchor,source_id:sourceIds[0],
    physical_group_id:anchor,source_ids:Object.freeze([...sourceIds]),
    physical_site_source:"CL2_MASTER",lens:"tlm",kind:"TLM_VENUE",
    community_id,preliminary_group:"UNKNOWN",affiliation_scope:"SOURCE_LABEL_ONLY",
    eyebrow:affiliationName,status:"RESEARCH-LISTED · MASS UNVERIFIED",
    title:T(name),subtitle:[T(description),country].filter(Boolean).join(" · "),
    summary:"Physical site recorded in the research master. Current traditional Mass use, the minister, liturgical books and timetable have not been independently verified.",
    address:{formatted:T(description)||country},geo:null,map_publishable:false,
    map_state:"ADDRESS_ONLY",facts:Object.freeze([
     {label:"Source identity",value:"CL2 physical-site master · "+anchor},
     {label:"Affiliation",value:affiliationName+" (source label only)"},
     {label:"Mass times",value:"Unverified · no timetable published"},
    ]),sections:Object.freeze([]),actions:Object.freeze([]),
    source_links:Object.freeze(source_links),
    note:"Research-listed site, not a confirmed current Mass venue. Source affiliation does not establish the celebrant, Una Cum, missal, rite, or official ministry. Verify locally before travelling.",
    search_text,
   }));
  }
 }
 const extra=base.filter(item=>!claimed.has(item.item_id));
 // Only the three approved, non-CL2 additions may survive outside this master.
 if(matched!==CL2_EXPECTED_R49_GROUPS||unmapped!==CL2_EXPECTED_NEW_GROUPS||
   absorbedAliasRows!==35||extra.length!==3||
   extra.some(item=>!T(item.item_id).startsWith("tlm:published-provisional:")))
  throw new Error("CL2/Explore physical-site reconciliation changed: "+
   JSON.stringify({matched,unmapped,absorbedAliasRows,extra:extra.length}));
 return Object.freeze([...result,...extra]);
}
