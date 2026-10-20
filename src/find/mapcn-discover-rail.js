// Store Locator-style Discover rail ported from MapCN (MIT), using the
// existing Ad Orientem canonical Heritage map and Place ownership.
// No second MapLibre instance, coordinates, raw feeds or independent search.
const list=value=>Array.isArray(value)?value:[];
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const L=(language,en,fr)=>language==="fr"?fr:en;
const clean=value=>String(value??"").trim();
function vicinity(profile,item){
 const address=profile?.address??{};
 const fragments=[address.city||address.region,address.country].map(clean).filter(Boolean);
 return [...new Set(fragments)].join(" · ")||clean(item?.subtitle)||"";
}
// All results come from already filtered, map-publishable canonical Places.
// No approximate or unpublished point can be introduced by the rail.
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
 const shown=entries.slice(0,limit);
 let html='<aside class="aoMapcnDiscoverRail" data-mapcn-discover-rail aria-label="'+esc(L(vm.language,"Documented sacred places","Lieux sacrés documentés"))+'">';
 html+='<div class="aoMapcnDiscoverHead"><div><small>'+L(vm.language,"DISCOVER · SACRED ATLAS","DÉCOUVRIR · ATLAS SACRÉ")+'</small>';
 html+='<h2>'+L(vm.language,"Explore the places","Explorer les lieux")+'</h2></div><strong>'+entries.length+'</strong></div>';
 html+='<div class="aoMapcnDiscoverEntries" role="list">';
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
 else html+='<span>'+L(vm.language,"All matching map places shown","Tous les lieux cartographiés affichés")+'</span>';
 html+='</div></aside>';
 return html;
}
