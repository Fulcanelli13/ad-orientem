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
  const hasCoordinates=place?.geo?.lat!==null&&place?.geo?.lat!==undefined
    &&place?.geo?.lng!==null&&place?.geo?.lng!==undefined
    &&Number.isFinite(lat)&&Number.isFinite(lng);
  const query=hasCoordinates
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

function relatedPlacesForPlace(geography,placeId){
  const places=new Map(arr(geography?.places).map(place=>[place?.place_id,place]));
  return Object.freeze(arr(geography?.placeRelationships).flatMap(link=>{
    const oppositeId=link?.source_place_id===placeId?link?.target_place_id:
      link?.target_place_id===placeId?link?.source_place_id:null;
    const opposite=places.get(oppositeId);
    if(!opposite||!text(link?.source_url))return [];
    return [Object.freeze({
      place_id:oppositeId,
      title:opposite?.name?.official??oppositeId,
      address_label:addressLabel(opposite?.address),
      relationship_kind:link.relationship_kind??"RELATED",
      description_en:link.description_en??"",
      description_fr:link.description_fr??link.description_en??"",
      source_url:link.source_url,
      source_label:link.source_label??"Institutional source",
    })];
  }));
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
  const apparitions=arr(projection?.byLens?.apparitions).filter(item=>placeIdForItem(item)===placeId);
  const relics=arr(projection?.byLens?.relics).filter(item=>placeIdForItem(item)===placeId);
  return Object.freeze({shrines,traditions,pilgrimages,apparitions,relics});
}

export function buildExplorePlaceProfiles(dataset={},projection={}, {today=null}={}){
  const profiles=[];
  for(const place of arr(dataset?.geography?.places)){
    const placeId=place?.place_id;
    if(!placeId)continue;
    const related=relatedItemsForPlace(projection,placeId);
    const tlm=exactTlmItems(dataset,projection,placeId);
    const relatedPlaces=relatedPlacesForPlace(dataset?.geography,placeId);
    const allItems=[...related.shrines,...related.traditions,...related.pilgrimages,...related.apparitions,...related.relics];
    const calendar=temporalRows(related.pilgrimages,today);
    const seasonal=new Map();
    for(const pilgrimage of related.pilgrimages){
      for(const link of arr(pilgrimage?.raw?.temporalLinks)){
        if(link?.binding_state!=="NO_FIXED_CALENDAR_BINDING")continue;
        const id=link.temporal_link_id;
        if(!id||seasonal.has(id))continue;
        seasonal.set(id,Object.freeze({temporal_link_id:id,title:link.source_event_label??pilgrimage.title,pilgrimage_id:pilgrimage.source_id}));
      }
    }
    const seasonal_pilgrimages=Object.freeze([...seasonal.values()]);
    const saints=[...new Set(related.shrines.flatMap(item=>arr(item?.raw?.shrine?.associated_saints)).filter(Boolean))];
    const shrineIds=new Set(related.shrines.map(item=>item?.raw?.shrine?.shrine_id).filter(Boolean));
    const novenaMap=new Map(arr(dataset?.novenas?.records).map(record=>[record?.id,record]).filter(([id])=>id));
    const groupedNovenas=new Map();
    for(const link of arr(dataset?.novenas?.links)){
      if(!link?.novena_id||!(link?.place_id===placeId||(link?.shrine_id&&shrineIds.has(link.shrine_id))))continue;
      const record=novenaMap.get(link.novena_id);
      if(!record)continue;
      const previous=groupedNovenas.get(link.novena_id);
      if(previous){if(link.note&&!previous.notes.includes(link.note))previous.notes.push(link.note);continue;}
      groupedNovenas.set(link.novena_id,{id:link.novena_id,title_en:record.title_en??record.title_fr??link.novena_id,title_fr:record.title_fr??record.title_en??link.novena_id,notes:link.note?[link.note]:[]});
    }
    const novenas=Object.freeze([...groupedNovenas.values()].map(row=>Object.freeze({...row,notes:Object.freeze(row.notes)})));

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
        apparitions:related.apparitions.length,
        relics:related.relics.length,
        traditions:related.traditions.length,
        pilgrimages:related.pilgrimages.length,
        novenas:novenas.length,
        tlm:tlm.length,
      }),
      shrines:Object.freeze(related.shrines.map(itemRef)),
      apparitions:Object.freeze(related.apparitions.map(itemRef)),
      relics:Object.freeze(related.relics.map(itemRef)),
      traditions:Object.freeze(related.traditions.map(itemRef)),
      pilgrimages:Object.freeze(related.pilgrimages.map(itemRef)),
      tlm,
      related_places:relatedPlaces,
      saints:Object.freeze(saints),
      novenas,
      calendar,
      seasonal_pilgrimages,
      sources:Object.freeze([...uniqueSourceLinks(allItems,place),
        ...relatedPlaces.filter(row=>row.source_url).map(row=>Object.freeze({
          id:row.source_url,title:row.source_label,issuer:"Institutional place relationship",
          url:row.source_url,role:"RELATIONSHIP",
        })),
      ]),
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
