import {renderNetworkPanel} from "./mapcn-network-presentation.js";
import {renderAtlasCoveragePanel} from "./mapcn-atlas-coverage.js";
import {renderMapcnDiscoverRail} from "./mapcn-discover-rail.js";
import {renderTimeMassPanel} from "./mapcn-time-mass-presentation.js";
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
const PLACE_TYPES=Object.freeze({
  cathedral:["Cathedral","Cathédrale"],basilica:["Basilica","Basilique"],
  shrine:["Shrine","Sanctuaire"],monastery:["Monastery","Monastère"],
  chapel:["Chapel","Chapelle"],church:["Church","Église"],
  convent:["Convent","Couvent"],pilgrimage_destination:["Pilgrimage site","Lieu de pèlerinage"],
});
export const placeTypeLabel=(language,type)=>PLACE_TYPES[type]?L(language,...PLACE_TYPES[type]):L(language,"Sacred place","Lieu sacré");

// Editorial text comes exclusively from canonical source-owned records.
// No synthesized narratives, unsupported recognition claims or fallback biographies.
export function sacredPlaceSynopsis(place,{maxLength=340,language="en",preferredCategory=null}={}){
  if(!place)return "";
  const categories=["shrines","pilgrimages","apparitions","relics","traditions"];
  const ordered=categories.includes(preferredCategory)
    ?[preferredCategory,...categories.filter(key=>key!==preferredCategory)]:categories;
  // A relic or apparition selected on the map should not display an unrelated
  // shrine introduction merely because that Place also has a shrine record.
  // When the user explicitly filtered to one subject, an absent summary must
  // not be quietly replaced by a statement from a different subject.
  const refs=categories.includes(preferredCategory)&&arr(place[preferredCategory]).length
    ?arr(place[preferredCategory]):ordered.flatMap(key=>arr(place[key]));
  const summary=String(refs.map(item=>language==="fr"?(item?.summary_fr||item?.summary):item?.summary).find(value=>String(value??"").trim())??"").trim().replace(/\s+/g," ");
  if(summary.length<=maxLength)return summary;
  const prefix=summary.slice(0,maxLength),boundary=prefix.lastIndexOf(" ");
  return prefix.slice(0,boundary>maxLength*.7?boundary:maxLength).trimEnd()+"…";
}
function shortArea(place){
  const a=place?.address??{};
  // A card needs orientation, not an unbounded postal address.
  const region=[a.city||a.region,a.country].filter(Boolean);
  const unique=[...new Set(region.map(value=>String(value).trim()))];
  return unique.length?unique.join(" · "):place?.address_label??"";
}
export function compactHeritagePlaceSheet(vm){
  const p=vm.selectedPlace;if(!p)return "";
  const related=Object.keys(CATEGORY_LABELS).filter(key=>Number(p.counts?.[key])>0);
  const active=arr(vm.filters?.heritageCategories);
  const preferred=active.length===1&&related.includes(active[0])?active[0]:null;
  const primary=preferred??related[0]??null;
  const synopsis=sacredPlaceSynopsis(p,{maxLength:250,language:vm.language,preferredCategory:preferred});
  const area=shortArea(p);
  let html='<div class="aoFindSheetBackdrop aoHeritageCardLayer" data-find-close-place><section class="aoFindSheet aoHeritagePreview'+(p.editorial_feature?' aoHeritageEditorialPreview':'')+'" role="dialog" aria-modal="false" aria-label="'+esc(p.name)+'" data-explore-place-owner="'+esc(p.place_id)+'">';
  html+='<button type="button" class="aoHeritageSheetHandle" data-explore-sheet-toggle aria-label="'+L(vm.language,"Open full place details","Ouvrir la fiche complète du lieu")+'"></button>';
  html+='<div class="aoHeritageCardHeading"><div class="aoHeritageCardIdentity">';
  html+='<span class="aoHeritageCardKicker">'+(vm.journeyOpen?L(vm.language,"PILGRIMAGE PLACE","LIEU DE PÈLERINAGE")+' · ':(p.editorial_feature?L(vm.language,"IN FOCUS","À DÉCOUVRIR")+' · ':""))+esc(placeTypeLabel(vm.language,p.place_type))+'</span>';
  if(area)html+='<span class="aoHeritageCardLocation">'+esc(area)+'</span>';
  html+='</div><button type="button" class="aoHeritageCardClose" data-find-close-place aria-label="'+(vm.journeyOpen?L(vm.language,"Return to pilgrimage journey","Retour au parcours de pèlerinage"):L(vm.language,"Close place preview","Fermer l’aperçu du lieu"))+'">×</button></div>';
  html+='<h2 class="aoHeritageCardTitle">'+esc(p.name)+'</h2>';
  if(p.media)html+='<figure class="aoHeritagePlaceThumb" data-photo-orientation="'+esc(p.media.orientation)+'"><img loading="eager" fetchpriority="high" decoding="async" src="'+esc(p.media.asset_path)+'" alt="'+esc(vm.language==="fr"?p.media.alt_fr:p.media.alt_en)+'"><figcaption>'+esc(p.media.credit)+' · '+esc(p.media.license)+'</figcaption></figure>';
  if(synopsis)html+='<p class="aoHeritageSynopsis">'+esc(synopsis)+'</p>';
  else html+='<p class="aoHeritageCardEmpty">'+L(vm.language,"Explore the original records and sources associated with this place.","Consultez les documents et les sources associés à ce lieu.")+'</p>';
  if(arr(p.saints).length)html+='<p class="aoHeritageSaints">'+esc(L(vm.language,"Associated saints","Saints associés"))+' · '+esc(p.saints.slice(0,2).join(" · "))+'</p>';
  if(related.length)html+='<div class="aoHeritagePlaceTags" aria-label="'+L(vm.language,"Associated themes","Thèmes associés")+'">'+related.slice(0,3).map(key=>'<span data-category="'+key+'">'+esc(label(vm.language,key))+'</span>').join("")+'</div>';
  const feast=arr(p.calendar).find(entry=>/^\d{4}-\d{2}-\d{2}$/.test(entry?.date??""));
  if(feast)html+='<button type="button" class="aoHeritageFeastLink" data-explore-calendar-date="'+esc(feast.date)+'">'+esc(feast.title)+' <span>'+esc(feast.date_label??"")+' →</span></button>';
  html+='<div class="aoHeritagePreviewActions"><button type="button" data-explore-expand-place>'+L(vm.language,"Discover","Découvrir")+' <span aria-hidden="true">→</span></button>';
  const novena=arr(p.novenas).find(record=>record?.id);
  if(novena)html+='<button type="button" class="aoHeritagePrayAction" data-explore-open-novena="'+esc(novena.id)+'">'+L(vm.language,"Pray","Prier")+'</button>';
  if(arr(vm.placeJourneys).length){
    const related=arr(vm.placeJourneys),single=related.length===1;
    const labelText=single
      ?L(vm.language,"Explore pilgrimage","Explorer le pèlerinage")
      :L(vm.language,related.length+" documented journeys",related.length+" parcours attestés");
    html+='<button type="button" class="aoHeritageJourneyLink" '+
      (single?'data-explore-place-journey="'+esc(related[0].routeId)+'"':
        'data-explore-place-journey-list')+'>'+esc(labelText)+' <span aria-hidden="true">→</span></button>';
  }
  if(p.directions_url)html+='<a href="'+esc(p.directions_url)+'" target="_blank" rel="noopener noreferrer">'+L(vm.language,"Visit","Visiter")+'</a>';
  html+='</div>';
  if(p.geo?.indicative_only||p.geo?.precision==="complex_anchor")html+='<p class="aoHeritagePrecision">'+L(vm.language,"Indicative site pin · not an entrance location","Repère de site indicatif · pas une entrée")+'</p>';
  return html+'</section></div>';
}

function nearbyPanel(vm){
  const nearest=arr(vm.nearby);
  if(!nearest.length)return "";
  let html='<section class="aoHeritageNearbyPanel" role="region" aria-label="'+L(vm.language,"Nearest documented places","Lieux documentés les plus proches")+'">';
  html+='<header><div><strong>'+L(vm.language,"Around you","Autour de vous")+'</strong><small>'+L(vm.language,"Approximate straight-line distances · not journey times","Distances approximatives à vol d’oiseau · pas des temps de trajet")+'</small></div><button type="button" data-heritage-nearby-close aria-label="'+L(vm.language,"Close nearby places","Fermer les lieux proches")+'">×</button></header>';
  for(const item of nearest){
    const d=Number(item.distance_km);
    const amount=Number.isFinite(d)?(d<10?d.toFixed(1):Math.round(d).toLocaleString(vm.language==="fr"?"fr-FR":"en-GB"))+" km":"";
    html+='<button type="button" class="aoHeritageNearbyResult" data-explore-open-place="'+esc(item.place_id)+'">';
    html+='<span><strong>'+esc(item.title)+'</strong><small>'+esc(placeTypeLabel(vm.language,item.place_type))+(item.indicative?" · "+L(vm.language,"Indicative pin","Repère indicatif"):"")+'</small></span>';
    html+='<span class="aoHeritageNearbyDistance">'+esc(amount)+'</span></button>';
  }
  html+='</section>';return html;
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
export function renderHeritageToString(vm,{placeSheet,detailSheet,itemPreview,journeyPanel}={}){
  const active=arr(vm.filters?.heritageCategories),publicKeys=Object.keys(CATEGORY_LABELS).filter(key=>key!=="traditions"),all=publicKeys.every(key=>active.includes(key))&&active.length===publicKeys.length;
  const searching=Boolean(String(vm.filters?.query??"").trim());
  let html='<section class="aoFindSurface aoExploreSurface aoHeritageSurface" data-ao-find-owner="AO_FIND_APP_V1" data-ao-explore-owner="EXPLORE_V1">';
  html+='<header class="aoFindHeader"><button type="button" data-find-close aria-label="'+L(vm.language,"Back","Retour")+'">←</button><div><small>'+L(vm.language,"EXPLORE","EXPLORER")+'</small><h1>'+L(vm.language,"Sacred places","Lieux sacrés")+'</h1></div>';
  html+='<button type="button" class="aoHeritageMassShortcut" data-find-filter="lens" data-find-filter-value="tlm" aria-label="'+L(vm.language,"Find a traditional Mass","Trouver une messe traditionnelle")+'">'+L(vm.language,"Mass","Messe")+'</button>';
  html+='<details class="aoHeritageMore"><summary aria-label="'+L(vm.language,"Explore other sections","Explorer d’autres rubriques")+'">'+L(vm.language,"More","Plus")+'</summary><div><strong>'+L(vm.language,"Explore further","Pour approfondir")+'</strong><nav class="aoHeritageSecondary">';
  html+='<button type="button" data-bible-atlas-open>'+L(vm.language,"Biblical Atlas · map through time","Atlas biblique · carte et chronologie")+'</button>';
  for(const [key,en,fr] of [["shrines","Shrine records","Fiches des sanctuaires"],["relics","Relic records","Fiches des reliques"],["pilgrimages","Pilgrimage records","Fiches des pèlerinages"],["apparitions","Apparition records","Fiches des apparitions"]]){
    html+='<button type="button" data-find-filter="lens" data-find-filter-value="'+key+'">'+L(vm.language,en,fr)+'</button>';
  }
  html+='</nav>';
  const featured=arr(vm.featuredPlaces);
  if(featured.length){
    html+='<details class="aoHeritageFeatured"><summary>'+L(vm.language,"Places in focus","Lieux à découvrir")+'</summary><div>';
    for(const place of featured){
      html+='<button type="button" data-explore-open-place="'+esc(place.place_id)+'"><span><strong>'+esc(place.name)+'</strong><small>'+esc(placeTypeLabel(vm.language,place.place_type))+'</small></span><span aria-hidden="true">→</span></button>';
    }
    html+='</div></details>';
  }
  html+='</div></details></header>';
  html+='<p class="aoFindActionError" data-find-action-error role="alert" hidden></p>';
  html+='<div class="aoHeritageTools"><div class="aoFindSearch"><input type="search" data-find-query value="'+esc(vm.filters?.query||"")+'" aria-label="'+L(vm.language,"Search sacred places","Chercher un lieu sacré")+'" placeholder="'+L(vm.language,"Search place, saint or devotion","Lieu, saint ou dévotion")+'" autocomplete="off" spellcheck="false"></div><button type="button" class="aoHeritageGlossaryButton" data-find-glossary aria-label="'+L(vm.language,"Definitions","Définitions")+'">?</button></div>';
  html+='<nav class="aoHeritageCategories" aria-label="'+L(vm.language,"Filter places on the map","Filtrer les lieux sur la carte")+'">';
  html+='<button type="button" data-find-filter="lens" data-find-filter-value="saints" aria-label="'+esc(L(vm.language,"Open Map of Saints","Ouvrir la carte des saints"))+'">'+esc(L(vm.language,"Saints","Saints"))+"</button>";
  html+='<button type="button" class="aoJourneyLaunch'+(vm.journeyOpen?' active':'')+
    '" data-explore-journey-open aria-pressed="'+String(vm.journeyOpen)+'">'+
    L(vm.language,"Journeys","Parcours")+'</button>';
  html+='<button type="button" class="aoTimeMassLaunch'+(vm.timeMass?' active':'')+
    '" data-explore-time-mass-toggle aria-pressed="'+String(Boolean(vm.timeMass))+'">'+
    L(vm.language,"Time & Mass","Temps & Messes")+'</button>';
  html+='<button type="button" class="aoAtlasLayersLaunch'+(vm.atlasCoverage?' active':'')+
    '" data-atlas-mode="heatmap" aria-pressed="'+String(Boolean(vm.atlasCoverage))+'">'+
    L(vm.language,"Layers","Couches")+'</button>';
  html+='<button type="button" class="aoNetworkLaunch'+(vm.network?' active':'')+
    '" data-network-toggle aria-pressed="'+String(Boolean(vm.network))+'">'+
    L(vm.language,"Network","Réseau")+'</button>';
  html+='<button type="button" data-heritage-category="ALL" aria-pressed="'+String(all)+'" class="'+(all?"active":"")+'">'+L(vm.language,"All places","Tous les lieux")+'</button>';
  for(const key of publicKeys)html+='<button type="button" data-heritage-category="'+key+'" data-category="'+key+'" class="'+(!vm.journeyOpen&&active.length===1&&active.includes(key)?"active":"")+'" aria-pressed="'+String(!vm.journeyOpen&&active.length===1&&active.includes(key))+'">'+esc(label(vm.language,key))+'</button>';
  html+='</nav>';
  html+='<p class="aoHeritageLocationStatus" data-heritage-location-status role="status" aria-live="polite" hidden></p>';
  html+='<div class="aoFindBody aoHeritageBody" data-find-view="map" data-explore-lens="heritage"><div class="aoFindMap" data-find-map><div class="aoFindMapFallback"><strong>'+L(vm.language,"Sacred places","Lieux sacrés")+'</strong><span>'+(vm.items.length?L(vm.language,"Loading documented places…","Chargement des lieux documentés…"):L(vm.language,"No places match. Change the search or category.","Aucun lieu trouvé. Modifiez le thème ou la recherche."))+'</span></div></div>';
  if(!vm.network&&!vm.timeMass&&!vm.atlasCoverage&&!arr(vm.nearby).length)html+='<button type="button" class="aoHeritageNearby" data-heritage-nearby aria-label="'+L(vm.language,"Find documented places near me","Trouver des lieux documentés près de moi")+'">'+L(vm.language,"Near me","Près de moi")+'</button>';
  if(!vm.network&&!vm.timeMass&&!vm.atlasCoverage)html+='<button type="button" class="aoHeritageWorldReset" data-heritage-world aria-label="'+L(vm.language,"Show all places on the world map","Afficher tous les lieux sur la carte du monde")+'">'+L(vm.language,"World view","Vue du monde")+'</button>';
  // Hide search suggestions when an editorial place folio is open.
  if(searching&&!vm.selectedPlace&&!vm.selected)html+=searchMatches(vm);
  else if(arr(vm.nearby).length)html+=nearbyPanel(vm);
  else html+='<p class="aoHeritageMapHint">'+L(vm.language,"Numbers zoom · icons open places","Chiffres : zoom · icônes : lieux")+'</p>';
  // MapCN's Store Locator rail shares the active canonical map and its
  // existing data-explore-open-place action. Hide it when a separate journey
  // has ownership or when the legacy search overlay is active.
  if(!vm.network&&!vm.atlasCoverage&&!vm.timeMass&&!vm.journeyOpen&&!searching&&!arr(vm.nearby).length&&!arr(vm.customCards).length&&!vm.filters?.highlightCustomId)
    html+=renderMapcnDiscoverRail(vm);
  if(vm.network)html+=renderNetworkPanel({graph:vm.network,language:vm.language,filters:vm.filters});
  if(vm.timeMass)html+=renderTimeMassPanel({board:vm.timeMass,language:vm.language,filters:vm.filters});
  if(vm.atlasCoverage)html+=renderAtlasCoveragePanel({
    coverage:{...vm.atlasCoverage,selectedCountry:vm.filters.atlasCountry},
    mode:vm.filters.atlasMode,language:vm.language,limit:vm.filters.atlasCountryLimit});
  // Customs remain in source-backed Place profiles, not in an Explore Atlas rail.
  html+='</div>';
  if(vm.journeyOpen&&typeof journeyPanel==="function"){
    html+=journeyPanel({language:vm.language,routes:vm.journeys,selectedId:vm.journeySelectedId});
  }
  if(vm.filters?.highlightCustomId)html+='<p class="aoHeritageScope">'+L(vm.language,"Only documented examples are mapped; this does not imply a custom’s worldwide distribution.","Seuls des exemples attestés sont cartographiés ; cela ne représente pas la diffusion mondiale d’une coutume.")+'</p>';
  html+=(vm.selectedPlace?(vm.expandPlace?placeSheet(vm):compactHeritagePlaceSheet(vm)):(vm.selected&&!vm.expandDetail&&itemPreview?itemPreview(vm):detailSheet(vm)));
  return html+'</section>';
}
