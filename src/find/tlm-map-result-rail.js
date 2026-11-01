// TLM Atlas desktop contextual results: one source of truth, the existing
// filtered 2,582-site CL2 Directory and the current MapLibre viewport.
// No second map, geocoding, simulated venue or inferred Mass classification.
import {eligibleRenderedDirectoryImage} from "./directory-card.js";
import {massInstitutionEmblem} from "./institution-emblems.js";
import {discoverCenterDistanceKm} from "./mapcn-discover-rail.js";
const A=v=>Array.isArray(v)?v:[];
const T=v=>String(v??"").trim();
const E=v=>T(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const L=(lang,en,fr)=>lang==="fr"?fr:en;
export function tlmMapRailItems(items,center,{limit=12}={}){
  const seen=new Set();
  return Object.freeze(A(items).filter(item=>{
    const id=T(item?.item_id),lat=item?.geo?.lat,lng=item?.geo?.lng;
    if(!id||seen.has(id)||item?.kind!=="TLM_VENUE"||!item?.map_publishable||
      lat==null||lng==null||T(lat)===""||T(lng)==="")return false;
    const a=Number(lat),b=Number(lng);
    if(!Number.isFinite(a)||!Number.isFinite(b)||Math.abs(a)>90||Math.abs(b)>180)return false;
    seen.add(id);return true;
  }).sort((a,b)=>
    discoverCenterDistanceKm(a,center)-discoverCenterDistanceKm(b,center)||
    T(a.title).localeCompare(T(b.title))||
    T(a.item_id).localeCompare(T(b.item_id))).slice(0,Math.max(1,Math.min(24,Number(limit)||12))));
}
export function renderTlmMapResultRail({items=[],language="en",selectedId=null,center=null,loading=false}={}){
 const list=A(items);
 const selected=tlmMapRailItems(list,center);
 const title=L(language,"Churches in this view","Églises dans cette vue");
 let html='<aside class="aoTlmMapRail" data-tlm-map-rail aria-label="'+E(L(language,
   "Mapped traditional Mass directory results","Résultats de l’annuaire des messes traditionnelles"))+'">';
 html+='<details class="aoTlmMapRailDisclosure" open><summary class="aoTlmMapRailToggle"><span><small>'+
   E(L(language,"LATIN MASS · WORLD ATLAS","MESSE LATINE · ATLAS MONDIAL"))+'</small><strong>'+E(title)+
   '</strong></span><span class="aoTlmMapRailCount">'+(loading?"…":String(list.length))+'</span></summary>';
 html+='<div class="aoTlmMapRailItems" role="list">';
 if(loading)html+='<p class="aoTlmMapRailEmpty">'+E(L(language,"Reading current map view…","Lecture de la vue cartographique…"))+'</p>';
 else if(!list.length)html+='<p class="aoTlmMapRailEmpty">'+E(L(language,
  "No published map pin in this area. Move the map or switch to List for address-only sites.",
  "Aucun repère publié dans cette région. Déplacez la carte ou passez en liste pour les adresses sans repère."))+'</p>';
 for(const item of selected){
  const photo=eligibleRenderedDirectoryImage(item.cover_media,item);
  const emblem=photo?null:massInstitutionEmblem(item.community_id);
  const active=selectedId===item.item_id;
  html+='<div role="listitem"><button type="button" class="aoTlmMapRailItem" data-explore-item="'+E(item.item_id)+
    '" aria-current="'+String(active)+'">';
  html+='<span class="aoTlmMapRailVisual" data-visual-kind="'+(photo?"photo":emblem?"emblem":"neutral")+'">'+
    (photo?'<img loading="lazy" decoding="async" src="'+E(item.cover_media.asset_path)+'" alt="'+E(language==="fr"?item.cover_media.alt_fr:item.cover_media.alt_en)+'">':
     emblem?'<img data-tlm-emblem-image loading="lazy" decoding="async" src="'+E(emblem.image)+'" alt="">':
     '<span aria-hidden="true">✠</span>')+'</span>';
  html+='<span class="aoTlmMapRailCopy"><strong>'+E(item.title)+'</strong><small>'+E(item.subtitle||"")+'</small>'+
    (item.celebration_evidence?'<em>'+E(L(language,"1962 documented · named Masses only","1962 attesté · messes désignées seulement"))+'</em>':
     '<em>'+E(L(language,"Mass details · check source","Messes · vérifier à la source"))+'</em>')+
    '</span><span class="aoTlmMapRailArrow" aria-hidden="true">›</span></button></div>';
 }
 html+='</div><footer class="aoTlmMapRailFoot"><small>'+E(loading?"":L(language,
   "Showing the closest "+selected.length+" of "+list.length+" mapped matches. Unmapped venues remain in List.",
   "Affichage des "+selected.length+" lieux les plus proches parmi "+list.length+" résultats cartographiés. Les lieux sans repère restent dans la liste."))+
   '</small><button type="button" data-tlm-map-open-directory>'+
   E(L(language,"Open full directory","Ouvrir l’annuaire complet"))+'</button></footer></details></aside>';
 return html;
}
