// Unified Explore geography. A Place gets one marker even when several
// independent source-owned records refer to it. No proximity-based joins.
export const HERITAGE_CATEGORIES=Object.freeze(["shrines","relics","pilgrimages","apparitions","traditions"]);
// Geography provenance retains tradition attestations, but live map browsing is place-led, not a Customs Atlas.
export const PUBLIC_HERITAGE_CATEGORIES=Object.freeze(HERITAGE_CATEGORIES.filter(key=>key!=="traditions"));
const list=value=>Array.isArray(value)?value:[];
const text=value=>String(value??"").trim();

export function projectHeritagePlaces(projection,{categories=PUBLIC_HERITAGE_CATEGORIES,query="",customId=null}={}){
  const selected=new Set(list(categories).filter(category=>HERITAGE_CATEGORIES.includes(category)));
  const term=text(query).toLowerCase(),sites=new Map();
  for(const category of HERITAGE_CATEGORIES){
    if(!selected.has(category))continue;
    for(const item of list(projection?.byLens?.[category])){
      if(!item?.map_publishable||!item?.place_id||!item?.geo)continue;
      if(category==="traditions"&&item.kind!=="CUSTOM_ATTESTATION")continue;
      if(customId&&(category!=="traditions"||item?.raw?.custom?.custom_id!==customId))continue;
      if(term&&!String(item.search_text||[item.title,item.subtitle].join(" ")).toLowerCase().includes(term))continue;
      const placeId=item.place_id;
      if(!sites.has(placeId))sites.set(placeId,{primary:item,records:[],categories:new Set()});
      const site=sites.get(placeId);
      site.records.push(item);
      site.categories.add(category);
      // Prefer a shrine title when several record types share the exact Place.
      if(category==="shrines")site.primary=item;
    }
  }
  return Object.freeze([...sites.entries()].map(([placeId,site])=>Object.freeze({
    item_id:"heritage:place:"+placeId,
    place_id:placeId,
    lens:"heritage",
    kind:"HERITAGE_PLACE",
    title:site.primary.title,
    subtitle:site.primary.subtitle,
    geo:site.primary.geo,
    map_publishable:true,
    map_state:"MAPPED",
    heritage_primary:site.categories.has("shrines")?"shrines":
      HERITAGE_CATEGORIES.find(category=>site.categories.has(category)),
    heritage_categories:Object.freeze(HERITAGE_CATEGORIES.filter(category=>site.categories.has(category))),
    place_type:text(site.primary?.raw?.place?.place_type)||"other",
    heritage_record_count:site.records.length,
    search_text:site.records.map(item=>item.search_text).join(" "),
  })));
}

// Thematic practice cards are not pins. A selected practice can filter the map
// to its documented PLACE attestations without implying global distribution.
export function heritageCustomCards(canonical,{enabled=true,query=""}={}){
  if(!enabled)return Object.freeze([]);
  const term=text(query).toLowerCase();
  return Object.freeze(list(canonical).filter(item=>item?.kind==="CANONICAL_CUSTOM"&&(
    !term||String(item.search_text+" "+item.title).toLowerCase().includes(term)
  )));
}

/**
 * Shortlist the nearest already-publishable physical Places, without merging
 * unrelated identities or storing the device's coordinates in any registry.
 * Distances are geodesic approximations, NOT road routes or travel times.
 */
export function nearbyHeritagePlaces(items,position,{limit=6}={}){
  const lat=Number(position?.lat),lng=Number(position?.lng);
  if(position?.lat==null||position?.lng==null||!Number.isFinite(lat)||!Number.isFinite(lng)
     ||Math.abs(lat)>90||Math.abs(lng)>180)return Object.freeze([]);
  const radians=degrees=>degrees*Math.PI/180;
  const phi1=radians(lat),out=[],seen=new Set();
  for(const item of list(items)){
    const g=item?.geo??{},a=Number(g.lat),b=Number(g.lng);
    if(!item?.map_publishable||!item?.place_id||seen.has(item.place_id)||
       g.lat==null||g.lng==null||!Number.isFinite(a)||!Number.isFinite(b)
       ||Math.abs(a)>90||Math.abs(b)>180)continue;
    seen.add(item.place_id);
    const dphi=radians(a-lat),dlambda=radians(b-lng);
    const h=Math.sin(dphi/2)**2+Math.cos(phi1)*Math.cos(radians(a))*Math.sin(dlambda/2)**2;
    const km=6371.0088*2*Math.asin(Math.sqrt(Math.min(1,Math.max(0,h))));
    out.push(Object.freeze({place_id:item.place_id,title:item.title,
      subtitle:item.subtitle,place_type:item.place_type??"other",
      distance_km:Math.round(km*10)/10,
      indicative:Boolean(g.approximate||g.indicative_only||["complex_anchor","locality"].includes(g.precision)),
    }));
  }
  out.sort((a,b)=>a.distance_km-b.distance_km||String(a.title).localeCompare(String(b.title)));
  return Object.freeze(out.slice(0,Math.max(0,Math.min(12,Math.floor(Number(limit)||6)))));
}
