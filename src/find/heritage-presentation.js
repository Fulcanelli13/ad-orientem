// Map-first Sacred Geography: one physical Place, one pin, short preview.
// Full scholarly records remain accessible on explicit request.
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const arr=value=>Array.isArray(value)?value:[];
const L=(language,en,fr)=>language==="fr"?fr:en;
const CATEGORY_LABELS=Object.freeze({
  shrines:["Shrines","Sanctuaires"],relics:["Relics","Reliques"],
  pilgrimages:["Pilgrimages","Pèlerinages"],apparitions:["Apparitions","Apparitions"],
  traditions:["Customs","Coutumes"],
});
const label=(lang,key)=>L(lang,...CATEGORY_LABELS[key]);

// Editorial text comes exclusively from canonical source-owned records.
// No synthesized narratives, unsupported recognition claims or fallback biographies.
export function sacredPlaceSynopsis(place,{maxLength=340,language="en"}={}){
  if(!place)return "";
  const refs=[...arr(place.shrines),...arr(place.pilgrimages),...arr(place.apparitions),...arr(place.relics),...arr(place.traditions)];
  const summary=String(refs.map(item=>language==="fr"?(item?.summary_fr||item?.summary):item?.summary).find(value=>String(value??"").trim())??"").trim().replace(/\s+/g," ");
  if(summary.length<=maxLength)return summary;
  const prefix=summary.slice(0,maxLength),boundary=prefix.lastIndexOf(" ");
  return prefix.slice(0,boundary>maxLength*.7?boundary:maxLength).trimEnd()+"…";
}
function shortArea(place){
  const a=place?.address??{};
  const region=[a.city,a.region,a.country].filter(Boolean);
  return region.length?region.join(", "):place?.address_label??"";
}
export function compactHeritagePlaceSheet(vm){
  const p=vm.selectedPlace;if(!p)return "";
  const related=Object.keys(CATEGORY_LABELS).filter(key=>Number(p.counts?.[key])>0);
  const primary=related[0]??null;
  const synopsis=sacredPlaceSynopsis(p,{maxLength:250,language:vm.language});
  const area=shortArea(p);
  let html='<div class="aoFindSheetBackdrop" data-find-close-place><section class="aoFindSheet aoHeritagePreview" role="dialog" aria-modal="true" aria-label="'+esc(p.name)+'" data-explore-place-owner="'+esc(p.place_id)+'">';
  html+='<div class="aoHeritageSheetHandle" aria-hidden="true"></div>';
  html+='<div class="aoHeritageCardHeading"><div class="aoHeritageCardIdentity">';
  html+='<span class="aoHeritageCardKicker">'+esc(primary?label(vm.language,primary):L(vm.language,"Sacred place","Lieu sacré"))+'</span>';
  if(area)html+='<span class="aoHeritageCardLocation">'+esc(area)+'</span>';
  html+='</div><button type="button" class="aoHeritageCardClose" data-find-close-place aria-label="'+L(vm.language,"Close place preview","Fermer l’aperçu du lieu")+'">×</button></div>';
  html+='<h2 class="aoHeritageCardTitle">'+esc(p.name)+'</h2>';
  if(synopsis)html+='<p class="aoHeritageSynopsis">'+esc(synopsis)+'</p>';
  else html+='<p class="aoHeritageCardEmpty">'+L(vm.language,"Explore the original records and sources associated with this place.","Consultez les documents et les sources associés à ce lieu.")+'</p>';
  if(related.length>1)html+='<div class="aoHeritagePlaceTags" aria-label="'+L(vm.language,"Also associated with","Également associé à")+'">'+related.slice(1,4).map(key=>'<span data-category="'+key+'">'+esc(label(vm.language,key))+'</span>').join("")+'</div>';
  html+='<div class="aoHeritagePreviewActions"><button type="button" data-explore-expand-place>'+L(vm.language,"Explore this place","Explorer ce lieu")+' <span aria-hidden="true">→</span></button>';
  if(p.directions_url)html+='<a href="'+esc(p.directions_url)+'" target="_blank" rel="noopener noreferrer">'+L(vm.language,"Directions","Itinéraire")+'</a>';
  html+='</div>';
  if(p.geo?.indicative_only||p.geo?.precision==="complex_anchor")html+='<p class="aoHeritagePrecision">'+L(vm.language,"Indicative site pin · not an entrance location","Repère de site indicatif · pas une entrée")+'</p>';
  return html+'</section></div>';
}

function searchMatches(vm){
  const query=String(vm.filters?.query??"").trim();
  if(!query)return "";
  const normalized=query.toLocaleLowerCase();
  const results=arr(vm.items).slice().sort((a,b)=>{
    const rank=item=>{
      const title=String(item.title??"").toLocaleLowerCase();
      return title===normalized?0:title.startsWith(normalized)?1:title.includes(normalized)?2:3;
    };
    // Within a name match, prefer places supported by more distinct
    // source-owned records; e.g. Lourdes itself before similarly named chapels.
    return rank(a)-rank(b)
      ||(Number(b.heritage_record_count)||0)-(Number(a.heritage_record_count)||0)
      ||String(a.title).localeCompare(String(b.title));
  });
  let html='<div class="aoHeritageSearchResults" role="region" aria-label="'+L(vm.language,"Matching places","Lieux correspondants")+'">';
  html+='<div class="aoHeritageSearchCount" role="status">'+(results.length
    ?esc(String(results.length))+" "+L(vm.language,"places on the map","lieux sur la carte")
    :L(vm.language,"No place found. Try another name or category.","Aucun lieu trouvé. Essayez un autre nom ou thème."))+'</div>';
  for(const item of results.slice(0,6)){
    if(!item.place_id)continue;
    html+='<button type="button" data-explore-open-place="'+esc(item.place_id)+'"><span><strong>'+esc(item.title)+'</strong><small>'+esc(item.subtitle??"")+'</small></span><span aria-hidden="true">↗</span></button>';
  }
  if(results.length>6)html+='<small class="aoHeritageSearchFoot">'+L(vm.language,"Refine your search to see other places.","Affinez la recherche pour voir les autres lieux.")+'</small>';
  return html+'</div>';
}
export function renderHeritageToString(vm,{placeSheet,detailSheet}={}){
  const active=arr(vm.filters?.heritageCategories),all=active.length===Object.keys(CATEGORY_LABELS).length;
  const searching=Boolean(String(vm.filters?.query??"").trim());
  let html='<section class="aoFindSurface aoExploreSurface aoHeritageSurface" data-ao-find-owner="AO_FIND_APP_V1" data-ao-explore-owner="EXPLORE_V1">';
  html+='<header class="aoFindHeader"><button type="button" data-find-close aria-label="'+L(vm.language,"Back","Retour")+'">←</button><div><small>AD ORIENTEM · EXPLORE</small><h1>'+L(vm.language,"Sacred Geography","Géographie sacrée")+'</h1></div><span class="aoHeritageCount" aria-label="'+esc(String(vm.items.length))+' '+L(vm.language,"places on this map","lieux sur cette carte")+'">'+esc(String(vm.items.length))+' <small>'+L(vm.language,"places","lieux")+'</small></span><button type="button" data-find-glossary aria-label="'+L(vm.language,"Definitions","Définitions")+'">?</button></header>';
  html+='<p class="aoFindActionError" data-find-action-error role="alert" hidden></p>';
  html+='<nav class="aoExploreMainDestinations" aria-label="'+L(vm.language,"Explore destinations","Parcours Explorer")+'">';
  html+='<span class="active" aria-current="page">'+L(vm.language,"Sacred places","Lieux sacrés")+'</span>';
  html+='<button type="button" data-find-filter="lens" data-find-filter-value="tlm">'+L(vm.language,"Find a Mass","Trouver une messe")+'</button>';
  html+='<button type="button" data-find-filter="lens" data-find-filter-value="traditions">'+L(vm.language,"Traditions","Traditions")+'</button>';
  html+='</nav>';
  // Discover first: a single search and an uncluttered category rail.
  // Record-oriented navigation is intentionally secondary to the map.
  html+='<div class="aoHeritageTools"><div class="aoFindSearch"><input type="search" data-find-query value="'+esc(vm.filters?.query||"")+'" aria-label="'+L(vm.language,"Search sacred places","Chercher un lieu sacré")+'" placeholder="'+L(vm.language,"Search place, saint or devotion","Lieu, saint ou dévotion")+'" autocomplete="off" spellcheck="false"></div>';
  html+='<button type="button" class="aoHeritageNearby" data-heritage-nearby aria-label="'+L(vm.language,"Centre map near me","Centrer la carte près de moi")+'">'+L(vm.language,"Near me","Près de moi")+'</button>';
  html+='<details class="aoHeritageMore"><summary aria-label="'+L(vm.language,"Explore other maps and records","Explorer d’autres cartes et documents")+'">'+L(vm.language,"Browse","Parcourir")+'</summary><div><strong>'+L(vm.language,"Explore further","Pour approfondir")+'</strong><nav class="aoHeritageSecondary">';
  for(const [key,en,fr] of [["shrines","Shrine records","Fiches des sanctuaires"],["relics","Relic records","Fiches des reliques"],["pilgrimages","Pilgrimage records","Fiches des pèlerinages"],["apparitions","Apparition records","Fiches des apparitions"]]){
    html+='<button type="button" data-find-filter="lens" data-find-filter-value="'+key+'">'+L(vm.language,en,fr)+'</button>';
  }
  html+='</nav><p>'+L(vm.language,"The map shows physical places. Each record retains its sources and qualifications.","La carte situe des lieux. Chaque fiche conserve ses sources et ses réserves.")+'</p></div></details></div>';
  html+='<nav class="aoHeritageCategories" aria-label="'+L(vm.language,"Filter places on the map","Filtrer les lieux sur la carte")+'">';
  html+='<button type="button" data-heritage-category="ALL" aria-pressed="'+String(all)+'" class="'+(all?"active":"")+'">'+L(vm.language,"All places","Tous les lieux")+'</button>';
  for(const key of Object.keys(CATEGORY_LABELS))html+='<button type="button" data-heritage-category="'+key+'" data-category="'+key+'" class="'+(active.length===1&&active.includes(key)?"active":"")+'" aria-pressed="'+String(active.length===1&&active.includes(key))+'">'+esc(label(vm.language,key))+'</button>';
  html+='</nav>';
  html+='<p class="aoHeritageLocationStatus" data-heritage-location-status role="status" aria-live="polite" hidden></p>';
  html+='<div class="aoFindBody aoHeritageBody" data-find-view="map" data-explore-lens="heritage"><div class="aoFindMap" data-find-map><div class="aoFindMapFallback"><strong>'+L(vm.language,"Sacred places","Lieux sacrés")+'</strong><span>'+(vm.items.length?L(vm.language,"Loading documented places…","Chargement des lieux documentés…"):L(vm.language,"No places match. Change the search or category.","Aucun lieu trouvé. Modifiez le thème ou la recherche."))+'</span></div></div>';
  if(searching)html+=searchMatches(vm);
  else html+='<p class="aoHeritageMapHint">'+L(vm.language,"Tap a marker to discover a place","Touchez un repère pour découvrir le lieu")+'</p>';
  const customs=arr(vm.customCards);
  if(customs.length){
    html+='<div class="aoHeritageCustomStrip"><div class="aoHeritageStripHeading"><span>'+L(vm.language,"Living traditions","Traditions vivantes")+'</span>';
    if(vm.filters?.highlightCustomId)html+='<span class="aoHeritageStripActions"><button type="button" data-heritage-custom-details>'+L(vm.language,"About","Découvrir")+'</button><button type="button" data-heritage-custom-clear>'+L(vm.language,"Clear","Effacer")+'</button></span>';
    html+='</div><div class="aoHeritageCustomRail" aria-label="'+L(vm.language,"Discover customs","Découvrir les coutumes")+'">';
    for(const custom of customs){
      const id=custom.raw?.custom?.custom_id;if(!id)continue;
      const selected=vm.filters?.highlightCustomId===id;
      html+='<button type="button" data-heritage-custom="'+esc(id)+'" aria-pressed="'+String(selected)+'" class="'+(selected?"active":"")+'"><strong>'+esc(vm.language==="fr"&&custom.title_fr?custom.title_fr:custom.title)+'</strong><small>'+L(vm.language,"Examples","Exemples")+' · '+arr(custom.attestation_examples).length+'</small></button>';
    }
    html+='</div></div>';
  }
  html+='</div>';
  if(vm.filters?.highlightCustomId)html+='<p class="aoHeritageScope">'+L(vm.language,"Only documented examples are mapped; this does not imply a custom’s worldwide distribution.","Seuls des exemples attestés sont cartographiés ; cela ne représente pas la diffusion mondiale d’une coutume.")+'</p>';
  html+=(vm.selectedPlace?(vm.expandPlace?placeSheet(vm):compactHeritagePlaceSheet(vm)):detailSheet(vm));
  return html+'</section>';
}
