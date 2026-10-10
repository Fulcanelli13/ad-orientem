// Map-first Explore presentation. This is a secondary discovery surface;
// canonical editorial records and source-specific Place details remain unchanged.
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#039;"}[c]));
const arr=value=>Array.isArray(value)?value:[];
const L=(language,en,fr)=>language==="fr"?fr:en;
const CATEGORY_LABELS=Object.freeze({
  shrines:["Shrines","Sanctuaires"],relics:["Relics","Reliques"],
  pilgrimages:["Pilgrimages","Pèlerinages"],apparitions:["Apparitions","Apparitions"],
  traditions:["Customs","Coutumes"],
});
const label=(lang,key)=>L(lang,...CATEGORY_LABELS[key]);

export function compactHeritagePlaceSheet(vm){
  const p=vm.selectedPlace;if(!p)return "";
  const related=Object.keys(CATEGORY_LABELS).filter(key=>Number(p.counts?.[key])>0);
  let html='<div class="aoFindSheetBackdrop" data-find-close-place><section class="aoFindSheet aoHeritagePreview" role="dialog" aria-modal="true" data-explore-place-owner="'+esc(p.place_id)+'">';
  html+='<header><div><small>'+L(vm.language,"SACRED PLACE","LIEU SACRÉ")+'</small><h2>'+esc(p.name)+'</h2>'+(p.address_label?'<p>'+esc(p.address_label)+'</p>':"")+'</div><button type="button" data-find-close-place aria-label="'+L(vm.language,"Close","Fermer")+'">×</button></header>';
  html+='<div class="aoHeritagePlaceTags">'+related.map(key=>'<span data-category="'+key+'">'+esc(label(vm.language,key))+' · '+Number(p.counts[key])+'</span>').join("")+'</div>';
  if(p.geo?.indicative_only)html+='<p class="aoHeritageCaution">'+L(vm.language,"Indicative point, not a precise entrance.","Position indicative, non une entrée précise.")+'</p>';
  if(p.counts?.relics)html+='<p class="aoHeritageCaution">'+L(vm.language,"Relic locations are source-reported, not independently authenticated.","Lieux de reliques attribués aux sources, sans authentification indépendante.")+'</p>';
  if(p.counts?.apparitions)html+='<p class="aoHeritageCaution">'+L(vm.language,"Historical testimony does not itself establish supernatural authenticity.","Le témoignage historique ne prouve pas à lui seul l’origine surnaturelle.")+'</p>';
  html+='<div class="aoHeritagePreviewActions"><button type="button" data-explore-expand-place>'+L(vm.language,"Explore this place","Découvrir ce lieu")+'</button>';
  if(p.directions_url)html+='<a href="'+esc(p.directions_url)+'" target="_blank" rel="noopener noreferrer">'+L(vm.language,"Directions","Itinéraire")+'</a>';
  return html+'</div></section></div>';
}

export function renderHeritageToString(vm,{placeSheet,detailSheet}={}){
  const active=arr(vm.filters?.heritageCategories);
  let html='<section class="aoFindSurface aoExploreSurface aoHeritageSurface" data-ao-find-owner="AO_FIND_APP_V1" data-ao-explore-owner="EXPLORE_V1">';
  html+='<header class="aoFindHeader"><button type="button" data-find-close aria-label="'+L(vm.language,"Back","Retour")+'">←</button><div><small>AD ORIENTEM · EXPLORE</small><h1>'+L(vm.language,"Sacred Geography","Géographie sacrée")+'</h1></div><button type="button" data-find-glossary aria-label="'+L(vm.language,"Definitions","Définitions")+'">?</button><span>'+vm.items.length+'</span></header>';
  html+='<p class="aoFindActionError" data-find-action-error role="alert" hidden></p>';
  html+='<nav class="aoHeritageCategories" aria-label="'+L(vm.language,"Map categories","Catégories de la carte")+'">';
  html+='<button type="button" data-heritage-category="ALL" aria-pressed="'+String(active.length===Object.keys(CATEGORY_LABELS).length)+'" class="'+(active.length===Object.keys(CATEGORY_LABELS).length?"active":"")+'">'+L(vm.language,"All","Tout")+'</button>';
  for(const key of Object.keys(CATEGORY_LABELS))html+='<button type="button" data-heritage-category="'+key+'" data-category="'+key+'" class="'+(active.includes(key)?"active":"")+'" aria-pressed="'+String(active.includes(key))+'">'+esc(label(vm.language,key))+'</button>';
  html+='</nav>';
  html+='<div class="aoHeritageTools"><div class="aoFindSearch"><input type="search" data-find-query value="'+esc(vm.filters?.query||"")+'" aria-label="'+L(vm.language,"Search heritage and places","Chercher dans les lieux et traditions")+'" placeholder="'+L(vm.language,"Search a place, saint or tradition","Chercher un lieu, un saint ou une tradition")+'"></div>';
  html+='<details class="aoHeritageMore"><summary>'+L(vm.language,"More","Plus")+'</summary><div><button type="button" data-find-filter="lens" data-find-filter-value="tlm">'+L(vm.language,"Traditional Mass Directory","Annuaire de la messe traditionnelle")+'</button><p>'+L(vm.language,"Pins show documented places. Customs without precise places remain thematic. Reported relics and apparitions retain their source qualifications.","Les repères indiquent des lieux attestés ; les coutumes sans lieu précis restent thématiques. Les reliques et apparitions conservent leurs réserves documentaires.")+'</p></div></details></div>';
  html+='<div class="aoFindBody aoHeritageBody" data-find-view="map" data-explore-lens="heritage"><div class="aoFindMap" data-find-map><div class="aoFindMapFallback"><strong>'+L(vm.language,"Sacred places","Lieux sacrés")+'</strong><span>'+(vm.items.length?L(vm.language,"Loading documented places…","Chargement des lieux documentés…"):L(vm.language,"No mapped examples match these filters. Try another category or search.","Aucun exemple cartographié ne correspond. Essayez un autre thème ou une autre recherche."))+'</span></div></div>';
  const customs=arr(vm.customCards);
  if(customs.length){
    html+='<div class="aoHeritageCustomStrip"><div class="aoHeritageStripHeading"><span>'+L(vm.language,"Living traditions","Traditions vivantes")+'</span>';
    if(vm.filters?.highlightCustomId)html+='<button type="button" data-heritage-custom-clear>'+L(vm.language,"Clear","Effacer")+'</button>';
    html+='</div><div class="aoHeritageCustomRail" aria-label="'+L(vm.language,"Discover customs","Découvrir les coutumes")+'">';
    for(const custom of customs){
      const id=custom.raw?.custom?.custom_id;if(!id)continue;
      const selected=vm.filters?.highlightCustomId===id;
      html+='<button type="button" data-heritage-custom="'+esc(id)+'" aria-pressed="'+String(selected)+'" class="'+(selected?"active":"")+'"><strong>'+esc(vm.language==="fr"&&custom.title_fr?custom.title_fr:custom.title)+'</strong><small>'+L(vm.language,"Examples","Exemples")+' · '+arr(custom.attestation_examples).length+'</small></button>';
    }
    html+='</div></div>';
  }
  html+='</div>';
  if(vm.filters?.highlightCustomId)html+='<p class="aoHeritageScope">'+L(vm.language,"Pins show only documented examples, not the full distribution of this custom.","Les repères montrent seulement des exemples attestés, non toute la répartition de cette coutume.")+'</p>';
  html+=(vm.selectedPlace?(vm.expandPlace?placeSheet(vm):compactHeritagePlaceSheet(vm)):detailSheet(vm));
  return html+'</section>';
}
