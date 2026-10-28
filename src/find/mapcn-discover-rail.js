// MapCN-inspired discovery; every result is an existing, map-publishable canonical Place.
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
   ||clean(a.item.title).localeCompare(clean(b.item.title)));
 const limit=Math.min(180,Math.max(24,Number(vm.filters?.mapcnDiscoverLimit)||36));
 const shown=entries.slice(0,limit),scoped=Boolean(vm.discoverViewport);
 const title=scoped?L(vm.language,"In this area","Dans cette région"):L(vm.language,"Explore places","Explorer les lieux");
 let html='<aside class="aoMapcnDiscoverRail" data-mapcn-discover-rail data-discover-expanded="false" aria-label="'+esc(L(vm.language,"Documented sacred places","Lieux sacrés documentés"))+'">';
 html+='<div class="aoMapcnDiscoverHead"><button type="button" class="aoMapcnDiscoverToggle" data-mapcn-discover-toggle aria-expanded="false" aria-controls="ao-mapcn-discover-items">';
 html+='<span class="aoMapcnDiscoverHeading"><small>'+L(vm.language,"DISCOVER · SACRED ATLAS","DÉCOUVRIR · ATLAS SACRÉ")+'</small>';
 html+='<span class="aoMapcnDiscoverTitle">'+title+'</span></span>';
 html+='<span class="aoMapcnDiscoverCount" aria-label="'+esc(L(vm.language,"Mapped places in this view","Lieux cartographiés dans cette vue"))+'">'+entries.length+'</span>';
 html+='<span class="aoMapcnDiscoverChevron" aria-hidden="true">⌃</span></button></div>';
 html+='<div class="aoMapcnDiscoverEntries" role="list" id="ao-mapcn-discover-items">';
 if(!shown.length)html+='<p class="aoMapcnDiscoverEmpty">'+L(vm.language,"No documented place in this map view. Move or zoom the map.","Aucun lieu documenté dans cette vue. Déplacez ou agrandissez la carte.")+'</p>';
 for(const {item,profile} of shown){
  const active=vm.selectedPlace?.place_id===item.place_id;
  const title=clean(profile?.name)||clean(item.title);
  const media=profile?.media;
  const photo=clean(media?.asset_path)&&clean(media?.license)&&clean(media?.credit);
  html+='<div role="listitem"><button type="button" class="aoMapcnDiscoverItem" data-explore-open-place="'+esc(item.place_id)+'" aria-current="'+(active?'true':'false')+'">';
  if(photo)html+='<img loading="lazy" decoding="async" alt="'+esc(vm.language==="fr"?(media.alt_fr||media.alt_en):(media.alt_en||media.alt_fr)||title)+'" src="'+esc(media.asset_path)+'">';
  else html+='<span class="aoMapcnDiscoverGlyph" aria-hidden="true">✠</span>';
  html+='<span class="aoMapcnDiscoverCopy"><small>'+esc(clean(item.heritage_primary||profile?.place_type||"sacred place").toUpperCase())+'</small>';
  html+='<strong>'+esc(title)+'</strong>';
  html+='<span>'+esc(vicinity(profile,item))+'</span>';
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
