import { formatDisplayDate } from "../app/date-format.js";
import { calendarDateForSemanticKey } from "../calendar/intelligence.js";
import { existingPlaceEditorialConnections } from "./place-editorial-reuse.js";

const arr=value=>Array.isArray(value)?value:[];
const text=value=>String(value??"").trim();

/** Only reviewed, source-identified local media may enter a Place page.
 * A research candidate, hotlink, unrelated painting or uncredited image
 * must never silently become a published shrine photograph. */
export function resolveApprovedPlaceMedia(records,placeId){
  const approvedLicenses=Object.freeze({
    "CC0-1.0":/^https:\/\/creativecommons\.org\/publicdomain\/zero\/1\.0\//,
    "CC-BY-4.0":/^https:\/\/creativecommons\.org\/licenses\/by\/4\.0\//,
    // Earlier free-reuse ShareAlike licences are valid for carefully verified,
    // credited site photos. Require the exact matching canonical licence URL.
    "CC-BY-SA-2.0":/^https:\/\/creativecommons\.org\/licenses\/by-sa\/2\.0\//,
    "CC-BY-SA-3.0":/^https:\/\/creativecommons\.org\/licenses\/by-sa\/3\.0\//,
    "CC-BY-SA-4.0":/^https:\/\/creativecommons\.org\/licenses\/by-sa\/4\.0\//,
    "PUBLIC_DOMAIN":/^https:\/\/creativecommons\.org\/publicdomain\/mark\/1\.0\//,
  });
  const record=arr(records).find(row=>row?.place_id===placeId&&row?.status==="APPROVED");
  if(!record)return null;
  const path=text(record.asset_path);
  // Research and staging directories are *never* valid public image paths.
  // All files must be copied into the separately curated approved asset tree.
  const width=Number(record.width),height=Number(record.height);
  const orientation=height>width?"portrait":"landscape";
  if(!/^assets\/(?:places|approved\/place-media)\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_.-]+\.(?:png|webp|jpg|jpeg)$/.test(path)||
     !record.rights_verified||!record.subject_verified||!record.crop_reviewed||
     !approvedLicenses[record.license]?.test(text(record.license_url))||
     !/^https:\/\/[^\s]+$/.test(text(record.source_url))||
     !text(record.credit)||!text(record.alt_en)||!text(record.alt_fr)||
     !text(record.changes_en)||!text(record.changes_fr)||
     !Number.isFinite(width)||!Number.isFinite(height)||width<100||height<100||
     record.orientation!==orientation)return null;
  return Object.freeze({
    asset_path:path,credit:text(record.credit),license:text(record.license),
    license_url:text(record.license_url),changes_en:text(record.changes_en),
    changes_fr:text(record.changes_fr),orientation,
    source_url:text(record.source_url),alt_en:text(record.alt_en),alt_fr:text(record.alt_fr),
  });
}



/** Independently approved gallery assets only; never render hotlinks, candidate art or
 * a photograph assigned to a different physical Place. */
export function resolveApprovedPlaceGallery(records,placeId){
  const seen=new Set(),out=[];
  for(const record of arr(records)){
    if(record?.place_id!==placeId||record?.status!=="APPROVED"||record?.kind!=="PHOTO")continue;
    const path=text(record.asset_path);
    const id=text(record.media_id);
    const width=Number(record.width),height=Number(record.height);
    if(!id||seen.has(id)||!/^assets\/approved\/place-gallery\/[a-zA-Z0-9_-]+\.webp$/.test(path)||
       !record.rights_verified||!record.subject_verified||!record.crop_reviewed||
       record.license!=="CC-BY-SA-4.0"||
       !/^https:\/\/creativecommons\.org\/licenses\/by-sa\/4\.0\//.test(text(record.license_url))||
       !/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(text(record.source_url))||
       !/^[a-f0-9]{40}$/.test(text(record.source_sha1))||
       !/^[a-f0-9]{64}$/.test(text(record.derivative_sha256))||
       !text(record.credit)||!text(record.alt_en)||!text(record.alt_fr)||
       !text(record.label_en)||!text(record.label_fr)||
       !Number.isFinite(width)||!Number.isFinite(height)||Math.min(width,height)<500||
       record.orientation!==(height>width?"portrait":"landscape"))continue;
    seen.add(id);
    out.push(Object.freeze({
      media_id:id,asset_path:path,chapter_id:text(record.chapter_id),
      source_url:text(record.source_url),license_url:text(record.license_url),
      license:text(record.license),credit:text(record.credit),orientation:record.orientation,
      alt_en:text(record.alt_en),alt_fr:text(record.alt_fr),
      label_en:text(record.label_en),label_fr:text(record.label_fr),
      changes_en:text(record.changes_en),changes_fr:text(record.changes_fr),
    }));
  }
  return Object.freeze(out);
}

function publishedIllustratedPlaceGuide(guides,placeId){
  const guide=arr(guides).find(row=>row?.place_id===placeId&&row?.publication==="PUBLISHED");
  if(!guide||!/^https:\/\/[^\s]+$/.test(text(guide.official_url)))return null;
  const sourced=value=>/^https:\/\/[^\s]+$/.test(text(value?.source_url));
  const paragraphs=arr(guide.sections).flatMap(section=>arr(section?.paragraphs));
  if(!paragraphs.length||!paragraphs.every(row=>text(row?.en)&&text(row?.fr)&&sourced(row)))return null;
  if(!arr(guide.stops).every(row=>text(row?.name_en)&&text(row?.name_fr)&&sourced(row)))return null;
  if(!arr(guide.chronology).every(row=>text(row?.when)&&sourced(row)))return null;
  if(!arr(guide.programmes).every(row=>text(row?.date_kind)&&sourced(row)))return null;
  // Candidate research can never become a place guide through fallback titles or pins.
  // Artwork is independently licensed through the existing approved-media registry.
  return Object.freeze({...guide,gallery:Object.freeze([])});
}

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
    summary_fr:item?.summary_fr??null,
    eyebrow:item?.eyebrow??"",
    source_links:Object.freeze(arr(item?.source_links)
      .filter(link=>/^https:\/\/[^\s]+$/i.test(text(link?.url)))
      .map(link=>Object.freeze({
        url:text(link.url),title:text(link?.title)||"Source",
        issuer:text(link?.issuer)||text(link?.title)||"Source",
      }))),
  });
}

/**
 * A restrained source-first editorial sequence. Every paragraph is the prose
 * of one exact-place canonical owner and can be opened at its own original
 * external source. No assistant-written biographies, inferred narratives,
 * combined claims, or unsourced calendar dates are introduced here.
 */
export function sourceBoundPlaceChapters(related){
  const chapters=[],seen=new Set();
  const groups=[["shrines","ORIGIN",1],["pilgrimages","PILGRIMAGE",3],
    ["apparitions","APPARITION",1],["relics","RELIC",1],["traditions","TRADITION",1]];
  for(const [group,kind,max] of groups){
    let added=0;
    for(const item of arr(related?.[group])){
      if(added>=max)break;
      const summary_en=text(item?.summary).replace(/\s+/g," ");
      const summary_fr=text(item?.summary_fr).replace(/\s+/g," ");
      // Never promise a complete French editorial paragraph if the underlying
      // source owner has only the original English. Record details stay readable.
      if(!summary_en||!summary_fr||summary_en===summary_fr)continue;
      // Some research-side Apparition/Relic entries deliberately carry a
      // generic evidence-scoping sentence rather than historical prose.
      // Preserve these in the source-owned records, not as devotional copy.
      if(!["ORIGIN","PILGRIMAGE"].includes(kind)&&(
        /^(the linked institution records|the linked source records|documented source|this entry records|the record identifies|a source (?:records|identifies))/i.test(summary_en)||
        /(?:at the indicated site|the linked institution|as reported in the source)/i.test(summary_en)
      ))continue;
      const sources=arr(item?.source_links).filter(source=>/^https:\/\/[^\s]+$/i.test(text(source?.url)));
      if(!sources.length)continue;
      const fingerprint=summary_en.toLowerCase().replace(/\W+/g," ").trim();
      if(seen.has(fingerprint))continue;
      seen.add(fingerprint);
      chapters.push(Object.freeze({
        kind,item_id:item?.item_id??null,
        title_en:text(item?.title),title_fr:text(item?.title_fr)||text(item?.title),
        body_en:summary_en,body_fr:summary_fr,
        sources:Object.freeze(sources.slice(0,2).map(source=>Object.freeze({
          url:source.url,title:source.title,issuer:source.issuer,
        }))),
      }));
      added++;
    }
  }
  return Object.freeze(chapters);
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
  // Curation is an editorial discovery index, not a new evidence owner.
  // Only exact existing source IDs and physical Place identities qualify.
  const featured=new Map(arr(dataset?.editorial?.featured).map((entry,index)=>[entry?.place_id,{...entry,ordinal:index}]));
  for(const place of arr(dataset?.geography?.places)){
    const placeId=place?.place_id;
    if(!placeId)continue;
    const curated=featured.get(placeId);
    const featuredPlace=curated&&arr(place?.source_ids).includes(curated.source_id)?curated:null;
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
    const novenaSources=new Map(arr(dataset?.novenas?.sources).filter(row=>row?.id&&/^https:\/\/[^\s]+$/i.test(text(row?.url))).map(row=>[row.id,row]));
    const groupedNovenas=new Map();
    for(const link of arr(dataset?.novenas?.links)){
      if(!link?.novena_id||!(link?.place_id===placeId||(link?.shrine_id&&shrineIds.has(link.shrine_id))))continue;
      const record=novenaMap.get(link.novena_id);
      if(!record)continue;
      const previous=groupedNovenas.get(link.novena_id);
      const citations=arr(link.source_ids).map(id=>novenaSources.get(id)).filter(Boolean);
      if(previous){
        if(link.note&&!previous.notes.includes(link.note))previous.notes.push(link.note);
        for(const source of citations)if(!previous.sources.some(row=>row.url===source.url))previous.sources.push(source);
        continue;
      }
      groupedNovenas.set(link.novena_id,{
        id:link.novena_id,
        title_en:record.title_en??record.title_fr??link.novena_id,
        title_fr:record.title_fr??record.title_en??link.novena_id,
        sources:citations,
        notes:link.note?[link.note]:[],
      });
    }
    const novenas=Object.freeze([...groupedNovenas.values()].map(row=>Object.freeze({
      id:row.id,title_en:row.title_en,title_fr:row.title_fr,
      // Research-side notes remain available for provenance/regression only,
      // but are never printed in the user-facing devotional cards.
      notes:Object.freeze(row.notes),
      sources:Object.freeze(row.sources.map(source=>Object.freeze({
        url:source.url,title:source.title??source.id,
      }))),
    })));
    const candidateChapters=sourceBoundPlaceChapters(related);
    // All exactly linked Places may become editorial readers, without adding
    // them to the separate 20-site "In focus" discovery menu. Require both
    // a sourced bilingual shrine account and a sourced bilingual pilgrimage
    // witness; untranslated/general records remain in their original lenses.
    const sourceBoundChapters=candidateChapters.some(row=>row.kind==="ORIGIN")
      &&candidateChapters.some(row=>row.kind==="PILGRIMAGE")
      ?candidateChapters:Object.freeze([]);
    // Existing approved guides own the site story. The relic corpus owns custody;
    // the Saints pilot remains EDITORIAL_REVIEW_ONLY and is NOT exposed here.
    const editorial=existingPlaceEditorialConnections(placeId,{
      geography:dataset?.geography,
      guideCorpora:[{guides:dataset?.editorial?.placeGuides}],
      phenomena:dataset?.sacredPhenomena,
      customs:dataset?.customs,
      saints:dataset?.saints,
    });
    const originalRelics=new Map(related.relics.map(item=>[item.source_id,item]));
    const sacredTreasures=Object.freeze(editorial.sacred_objects.map(entry=>{
      const linked=originalRelics.get(entry.id);
      const raw=linked?.raw?.record??null;
      return Object.freeze({
        ...entry,kind:raw?.relic_kind??null,associated_person:raw?.associated_person??null,
        item_id:linked?.item_id??null,lens:linked?.lens??null,
        access_notice_en:raw?.access_notice_en??null,
        access_notice_fr:raw?.access_notice_fr??null,
        display_notice_en:raw?.display_notice_en??null,
        display_notice_fr:raw?.display_notice_fr??null,
      });
    }));

    profiles.push(Object.freeze({
      place_id:placeId,
      name:place?.name?.official??placeId,
      editorial_feature:featuredPlace?Object.freeze({ordinal:featuredPlace.ordinal,source_id:featuredPlace.source_id}):null,
      aliases:Object.freeze(arr(place?.name?.aliases).filter(Boolean)),
      place_type:place?.place_type??"other",
      media:resolveApprovedPlaceMedia(dataset?.media?.approved,placeId),
      gallery:resolveApprovedPlaceGallery(dataset?.media?.gallery,placeId),
      illustrated_guide:publishedIllustratedPlaceGuide(dataset?.editorial?.placeGuides,placeId),
      editorial_intro:editorial.introduction,
      sacred_treasures:sacredTreasures,
      site_customs:editorial.customs,
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
      story_chapters:sourceBoundChapters,
      calendar,
      seasonal_pilgrimages,
      sources:Object.freeze([...uniqueSourceLinks(allItems,place),
        ...novenas.flatMap(row=>row.sources.map(source=>Object.freeze({
          id:source.url,title:source.title,issuer:"Devotional source",url:source.url,role:"DEVOTION",
        }))),
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
