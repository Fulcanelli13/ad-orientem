import { formatDisplayDate } from "../app/date-format.js";
import { calendarDateForSemanticKey } from "../calendar/intelligence.js";

const arr=value=>Array.isArray(value)?value:[];
const text=value=>String(value??"").trim();

function placeIdForItem(item){
  if(item?.place_id)return item.place_id;
  if(item?.raw?.place?.place_id)return item.raw.place.place_id;
  return null;
}

function addressLabel(address){
  return text(address?.formatted)||[
    address?.line1,address?.postal_code,address?.city,address?.region,address?.country??address?.country_code
  ].map(text).filter(Boolean).join(", ");
}

function directionsUrl(place){
  const lat=Number(place?.geo?.lat),lng=Number(place?.geo?.lng);
  const query=Number.isFinite(lat)&&Number.isFinite(lng)
    ? String(lat)+","+String(lng)
    : addressLabel(place?.address);
  return query?"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(query):null;
}

function uniqueSourceLinks(items,place){
  const seen=new Set(),out=[];
  for(const item of arr(items)){
    for(const source of arr(item?.source_links)){
      const key=source?.url||source?.id;
      if(!key||seen.has(key))continue;
      seen.add(key);
      out.push(Object.freeze({
        id:source?.id??key,
        title:source?.title??source?.issuer??"Source",
        issuer:source?.issuer??"",
        url:source?.url??null,
        role:"CONTENT",
      }));
    }
  }

  const geo=place?.geo??{};
  if(text(geo.source_url)&&!seen.has(geo.source_url)){
    seen.add(geo.source_url);
    out.push(Object.freeze({
      id:text(geo.source_ref)||geo.source_url,
      title:"Map coordinate source",
      issuer:text(geo.attribution),
      url:geo.source_url,
      role:"GEO",
    }));
  }
  return Object.freeze(out);
}

function itemRef(item){
  return Object.freeze({
    item_id:item?.item_id??null,
    lens:item?.lens??null,
    kind:item?.kind??null,
    title:item?.title??"",
    status:item?.status??"",
    summary:item?.summary??"",
    eyebrow:item?.eyebrow??"",
  });
}

function exactTlmItems(dataset,projection,placeId){
  const links=arr(dataset?.geography?.directoryPlaceLinks)
    .filter(link=>link?.place_id===placeId&&link?.relationship==="LOCATED_AT");
  if(!links.length)return Object.freeze([]);
  const venueIds=new Set(links.map(link=>link?.venue_id).filter(Boolean));
  return Object.freeze(arr(projection?.byLens?.tlm)
    .filter(item=>venueIds.has(item?.source_id))
    .map(itemRef));
}

function temporalRows(pilgrimageItems,today){
  const seen=new Set(),rows=[];
  const todayIso=/^\d{4}-\d{2}-\d{2}$/.test(String(today||""))?String(today):new Date().toISOString().slice(0,10);
  const year=Number(todayIso.slice(0,4));
  for(const item of arr(pilgrimageItems)){
    for(const link of arr(item?.raw?.temporalLinks)){
      const key=link?.calendar_semantic_key;
      if(!key||seen.has(key))continue;
      seen.add(key);
      let date=calendarDateForSemanticKey(key,year);
      if(date&&date<todayIso)date=calendarDateForSemanticKey(key,year+1);
      rows.push(Object.freeze({
        temporal_link_id:link?.temporal_link_id??null,
        semantic_key:key,
        title:link?.source_event_label??key,
        date:date??null,
        date_label:date?formatDisplayDate(date):"",
        binding_state:link?.binding_state??"UNKNOWN",
      }));
    }
  }
  return Object.freeze(rows.sort((a,b)=>(a.date??"9999").localeCompare(b.date??"9999")||a.title.localeCompare(b.title)));
}

function relatedItemsForPlace(projection,placeId){
  const shrines=arr(projection?.byLens?.shrines).filter(item=>placeIdForItem(item)===placeId);
  const traditions=arr(projection?.byLens?.traditions).filter(item=>placeIdForItem(item)===placeId);
  const pilgrimages=arr(projection?.byLens?.pilgrimages).filter(item=>placeIdForItem(item)===placeId);
  return Object.freeze({shrines,traditions,pilgrimages});
}

export function buildExplorePlaceProfiles(dataset={},projection={}, {today=null}={}){
  const profiles=[];
  for(const place of arr(dataset?.geography?.places)){
    const placeId=place?.place_id;
    if(!placeId)continue;
    const related=relatedItemsForPlace(projection,placeId);
    const tlm=exactTlmItems(dataset,projection,placeId);
    const allItems=[...related.shrines,...related.traditions,...related.pilgrimages];
    const calendar=temporalRows(related.pilgrimages,today);
    const saints=[...new Set(related.shrines.flatMap(item=>arr(item?.raw?.shrine?.associated_saints)).filter(Boolean))];

    profiles.push(Object.freeze({
      place_id:placeId,
      name:place?.name?.official??placeId,
      aliases:Object.freeze(arr(place?.name?.aliases).filter(Boolean)),
      place_type:place?.place_type??"other",
      address:place?.address??null,
      address_label:addressLabel(place?.address),
      geo:place?.geo??null,
      directions_url:directionsUrl(place),
      map_publishable:Boolean(allItems.some(item=>item?.map_publishable)),
      counts:Object.freeze({
        shrines:related.shrines.length,
        traditions:related.traditions.length,
        pilgrimages:related.pilgrimages.length,
        tlm:tlm.length,
      }),
      shrines:Object.freeze(related.shrines.map(itemRef)),
      traditions:Object.freeze(related.traditions.map(itemRef)),
      pilgrimages:Object.freeze(related.pilgrimages.map(itemRef)),
      tlm,
      saints:Object.freeze(saints),
      calendar,
      sources:uniqueSourceLinks(allItems,place),
      exact_tlm_link_state:tlm.length?"VERIFIED":"NONE",
      exact_tlm_note:tlm.length
        ?"Only Directory venues with an explicit shared-Place relationship are shown here."
        :"No TLM venue is currently linked to this exact Place. This does not make any claim about nearby Masses.",
      raw:Object.freeze({place}),
    }));
  }
  return Object.freeze(profiles);
}

export function explorePlaceProfile(profiles,placeId){
  return arr(profiles).find(profile=>profile?.place_id===placeId)??null;
}

export function placeIdForExploreItem(item){
  return placeIdForItem(item);
}
