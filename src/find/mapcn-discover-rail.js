// MapCN-inspired discovery; every result is an existing, map-publishable canonical Place.
import { sacredPlaceSynopsis } from "./place-source-synopsis.js";
import { renderSacredPlaceFallback } from "./sacred-place-visual-fallback.js";
// The visible-region filter is applied to the current MapLibre viewport, never to guessed
// coordinates or a second independent map/index.
const list=value=>Array.isArray(value)?value:[];
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const L=(language,en,fr)=>language==="fr"?fr:en;
const clean=value=>String(value??"").trim();
function vicinity(profile,item){
 const address=profile?.address??{};
 const fragments=[address.city||address.region,address.country].map(clean).filter(Boolean);
 return [...new Set(fragments)].join(" · ")||clean(item?.subtitle)||"";
}

// Relevance is measured from the MAP CAMERA, not the user's device location.
// This never asserts walking/driving distance or invents geographic evidence.
export function discoverCenterDistanceKm(item,center){
 const a=Number(item?.geo?.lat),b=Number(item?.geo?.lng);
 const c=Number(center?.lat),d=Number(center?.lng);
 if(![a,b,c,d].every(Number.isFinite)||Math.abs(a)>90||Math.abs(c)>90)return Infinity;
 const rad=Math.PI/180,phi1=a*rad,phi2=c*rad,dPhi=(c-a)*rad;
 const dLambda=Math.atan2(Math.sin((d-b)*rad),Math.cos((d-b)*rad));
 const h=Math.sin(dPhi/2)**2+Math.cos(phi1)*Math.cos(phi2)*Math.sin(dLambda/2)**2;
 return 6371*2*Math.asin(Math.sqrt(Math.max(0,Math.min(1,h))));
}
// A map-bound discovery result must already pass the ordinary publication gate.
// MapLibre owns longitude wrapping and antimeridian checks via bounds.contains.
export function discoverItemsWithinMapBounds(items,bounds){
 if(!bounds||typeof bounds.contains!=="function")return list(items);
 return list(items).filter(item=>{
  if(!item?.map_publishable||!item?.geo||item.geo.lat==null||item.geo.lng==null
    ||String(item.geo.lat).trim()===""||String(item.geo.lng).trim()==="")return false;
  const lat=Number(item.geo.lat),lng=Number(item.geo.lng);
  return Number.isFinite(lat)&&Number.isFinite(lng)&&lat>=-90&&lat<=90&&lng>=-180&&lng<=180
    &&Boolean(bounds.contains([lng,lat]));
 });
}
export function renderMapcnDiscoverRail(vm){
 const desktopSacred=Boolean(vm.desktopDocked&&vm.filters?.atlasEntry==="sacred");
 const byPlace=new Map(list(vm.placeProfiles).filter(p=>p?.place_id)
   .map(p=>[p.place_id,p]));
 const seen=new Set();
 const entries=list(vm.items).filter(item=>{
  const id=clean(item?.place_id);
  if(!id||seen.has(id)||!item?.map_publishable||!item?.geo)return false;
  const {lat,lng}=item.geo;
  if(lat==null||lng==null||!Number.isFinite(Number(lat))||!Number.isFinite(Number(lng)))return false;
  seen.add(id);return true;
 }).map(item=>({item,profile:byPlace.get(item.place_id)}))
  .sort((a,b)=>Number(Boolean(b.profile?.editorial_feature))-Number(Boolean(a.profile?.editorial_feature))
   ||Number(Boolean(b.profile?.media?.asset_path))-Number(Boolean(a.profile?.media?.asset_path))
   ||(vm.discoverCenter?discoverCenterDistanceKm(a.item,vm.discoverCenter)-discoverCenterDistanceKm(b.item,vm.discoverCenter):0)
   ||clean(a.item.title).localeCompare(clean(b.item.title)));
 // Editorial selections are separately labelled worldwide; they must
 // never masquerade as suggestions inside the current camera bounds.
 // Images and attribution come only from approved canonical Place profiles.
 const categories=list(vm.filters?.heritageCategories);
 const featured=list(vm.featuredPlaces).filter(p=>{
  const media=p?.media;
  return p?.editorial_feature&&p?.map_publishable&&list(p?.sources).length
   &&clean(media?.asset_path)&&clean(media?.credit)&&clean(media?.license)
   &&(!categories.length||categories.some(category=>Number(p?.counts?.[category])>0));
 }).sort((a,b)=>Number(a.editorial_feature.ordinal)-Number(b.editorial_feature.ordinal))
  .slice(0,5);
 const limit=Math.min(180,Math.max(24,Number(vm.filters?.mapcnDiscoverLimit)||36));
 const shown=entries.slice(0,limit),scoped=Boolean(vm.discoverViewport);
 const title=!vm.filters?.atlasEntry
   ?(scoped?L(vm.language,"In this area","Dans cette région"):L(vm.language,"Explore places","Explorer les lieux"))
   :vm.filters.atlasEntry==="discover"
     ?L(vm.language,"Places of the saints","Lieux des saints")
     :scoped?L(vm.language,"Sacred places in view","Lieux sacrés dans cette vue")
       :L(vm.language,"Sacred places","Lieux sacrés");
 // Desktop screen 7 opens the persistent results rail by default; phones
 // retain the approved low-profile Discover peek and its disclosure control.
 const initiallyExpanded=Boolean(vm.desktopDocked);
 let html='<aside class="aoMapcnDiscoverRail" data-mapcn-discover-rail data-discover-expanded="'+String(initiallyExpanded)+'" aria-label="'+esc(L(vm.language,"Documented sacred places","Lieux sacrés documentés"))+'">';
 html+='<div class="aoMapcnDiscoverHead"><button type="button" class="aoMapcnDiscoverToggle" data-mapcn-discover-toggle aria-expanded="'+String(initiallyExpanded)+'" aria-controls="ao-mapcn-discover-items">';
 html+='<span class="aoMapcnDiscoverHeading"><small>'+L(vm.language,"DISCOVER · SACRED ATLAS","DÉCOUVRIR · ATLAS SACRÉ")+'</small>';
 html+='<span class="aoMapcnDiscoverTitle">'+title+'</span></span>';
 html+='<span class="aoMapcnDiscoverCount" aria-label="'+esc(L(vm.language,"Mapped places in this view","Lieux cartographiés dans cette vue"))+'">'+entries.length+'</span>';
 html+='<span class="aoMapcnDiscoverChevron" aria-hidden="true">⌃</span></button></div>';
 // Desktop's approved category navigation belongs to the results rail.
 // Reuse the existing map-filter action, do not create a second filter owner.
 if(desktopSacred){
  const chosen=list(vm.filters?.heritageCategories);
  const all=!vm.journeyOpen&&chosen.length>1;
  html+='<nav class="aoMapcnCategoryTabs" aria-label="'+esc(L(vm.language,"Sacred place categories","Catégories de lieux sacrés"))+'">';
  if(vm.journeyOpen)html+='<button type="button" data-explore-journey-close>'+esc(L(vm.language,"Journeys ×","Parcours ×"))+'</button>';
  html+='<button type="button" data-heritage-category="ALL" aria-pressed="'+String(all)+'" class="'+(all?"active":"")+'">'+esc(L(vm.language,"All","Tous"))+'</button>';
  for(const [key,en,fr] of [["shrines","Shrines","Sanctuaires"],["apparitions","Apparitions","Apparitions"],["relics","Relics","Reliques"],["pilgrimages","Pilgrimages","Pèlerinages"]]){
   const selected=!vm.journeyOpen&&chosen.length===1&&chosen[0]===key;
   html+='<button type="button" data-heritage-category="'+key+'" aria-pressed="'+String(selected)+'" class="'+(selected?"active":"")+'">'+esc(L(vm.language,en,fr))+'</button>';
  }
  html+='<button type="button" data-find-filter="lens" data-find-filter-value="saints">'+esc(L(vm.language,"Saints","Saints"))+'</button>';
  html+='</nav>';
 }
 if(featured.length){
  html+='<section class="aoMapcnEditorialStrip" aria-label="'+L(vm.language,"Featured documented places worldwide","Lieux documentés à découvrir dans le monde")+'">';
  html+='<div class="aoMapcnEditorialHeading"><span>'+L(vm.language,"IN FOCUS · WORLDWIDE","À DÉCOUVRIR · MONDE")+'</span><small>'+L(vm.language,"Curated, source-backed places","Lieux sélectionnés et sourcés")+'</small></div>';
  html+='<div class="aoMapcnEditorialCarousel">';
  for(const [index,p] of featured.entries()){
   const media=p.media,alt=vm.language==="fr"?(media.alt_fr||media.alt_en):(media.alt_en||media.alt_fr);
   const location=[p?.address?.city,p?.address?.country].filter(Boolean).join(" · ");
   html+='<button type="button" class="aoMapcnEditorialCard" data-explore-open-place="'+esc(p.place_id)+'" aria-current="'+String(vm.selectedPlace?.place_id===p.place_id)+'">';
   // First two licensed cards are above the fold when the phone rail opens.
   // Leave the remainder lazy so this does not download the whole gallery.
   html+='<img loading="'+(index<2?"eager":"lazy")+'" decoding="'+(index<2?"sync":"async")+'" data-photo-orientation="'+esc(media.orientation||"landscape")+'" src="'+esc(media.asset_path)+'" alt="'+esc(alt||p.name)+'">';
   html+='<span class="aoMapcnEditorialLabel"><strong>'+esc(p.name)+'</strong><small>'+esc(location)+'</small></span></button>';
  }
  html+='</div></section>';
 }
 html+='<div class="aoMapcnDiscoverEntries" role="list" id="ao-mapcn-discover-items">';
 if(!shown.length)html+='<p class="aoMapcnDiscoverEmpty">'+L(vm.language,"No documented place in this map view. Move or zoom the map.","Aucun lieu documenté dans cette vue. Déplacez ou agrandissez la carte.")+'</p>';
 for(const {item,profile} of shown){
  const active=vm.selectedPlace?.place_id===item.place_id;
  const title=clean(profile?.name)||clean(item.title);
  const media=profile?.media;
  const photo=clean(media?.asset_path)&&clean(media?.license)&&clean(media?.credit);
  html+='<div role="listitem"><button type="button" class="aoMapcnDiscoverItem'+(desktopSacred?' aoMapcnDesktopPlaceCard':'')+'" data-explore-open-place="'+esc(item.place_id)+'" aria-current="'+(active?'true':'false')+'">';
  if(photo)html+='<img loading="lazy" decoding="async" alt="'+esc(vm.language==="fr"?(media.alt_fr||media.alt_en):(media.alt_en||media.alt_fr)||title)+'" src="'+esc(media.asset_path)+'">';
  else if(desktopSacred)html+=renderSacredPlaceFallback(profile??{place_type:item.place_type},vm.language,"preview");
  else html+='<span class="aoMapcnDiscoverGlyph" aria-hidden="true">✠</span>';
  html+='<span class="aoMapcnDiscoverCopy"><small>'+esc(clean(item.heritage_primary||profile?.place_type||"sacred place").toUpperCase())+'</small>';
  html+='<strong>'+esc(title)+'</strong>';
  html+='<span>'+esc(vicinity(profile,item))+'</span>';
  // Editorial summaries must be present in the existing source-owned Place;
  // never synthesize one from the category, institute or map location.
  if(desktopSacred&&profile){
   const preferred=list(vm.filters?.heritageCategories).length===1?vm.filters.heritageCategories[0]:null;
   const synopsis=sacredPlaceSynopsis(profile,{maxLength:145,language:vm.language,preferredCategory:preferred});
   if(synopsis)html+='<span class="aoMapcnPlaceSynopsis">'+esc(synopsis)+'</span>';
  }
  if(item.geo?.approximate||item.geo?.indicative_only||item.geo?.precision==="complex_anchor")
   html+='<em>'+L(vm.language,"Indicative site","Site indicatif")+'</em>';
  html+='</span><span class="aoMapcnDiscoverArrow" aria-hidden="true">↗</span></button></div>';
 }
 html+='</div><div class="aoMapcnDiscoverFoot">';
 if(entries.length>shown.length)html+='<button type="button" data-mapcn-discover-more>'
  +L(vm.language,"Show more places","Afficher plus de lieux")+' · '+(entries.length-shown.length)+'</button>';
 else if(entries.length)html+='<span>'+L(vm.language,"All places in this view shown","Tous les lieux de cette vue sont affichés")+'</span>';
 html+='</div></aside>';
 return html;
}
