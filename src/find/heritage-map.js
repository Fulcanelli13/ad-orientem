// Unified Explore geography. A Place gets one marker even when several
// independent source-owned records refer to it. No proximity-based joins.
export const HERITAGE_CATEGORIES=Object.freeze(["shrines","relics","pilgrimages","apparitions","traditions"]);
const list=value=>Array.isArray(value)?value:[];
const text=value=>String(value??"").trim();

export function projectHeritagePlaces(projection,{categories=HERITAGE_CATEGORIES,query="",customId=null}={}){
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
