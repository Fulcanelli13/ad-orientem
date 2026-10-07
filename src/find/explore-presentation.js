const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const arr=value=>Array.isArray(value)?value:[];
const L=(language,en,fr)=>language==="fr"?fr:en;

const LENS_LABELS=Object.freeze({
  tlm:["TLM","TLM"],
  shrines:["Shrines","Sanctuaires"],
  traditions:["Traditions","Traditions"],
  pilgrimages:["Pilgrimages","Pèlerinages"],
});
const FACT_LABELS=Object.freeze({
  Diocese:["Diocese","Diocèse"],
  Liturgy:["Liturgy","Liturgie"],
  "Una cum":["Una cum","Una cum"],
  Location:["Location","Position"],
  Dedication:["Dedication","Dédicace"],
  Type:["Type","Type"],
  Evidence:["Evidence","Preuve"],
  Class:["Class","Classe"],
  Period:["Period","Période"],
  Confidence:["Confidence","Confiance"],
  Kind:["Kind","Type"],
  Route:["Route","Itinéraire"],
  Calendar:["Calendar","Calendrier"],
});
function lensLabel(language,lens){const pair=LENS_LABELS[lens]??[lens,lens];return language==="fr"?pair[1]:pair[0];}
function factLabel(language,label){const pair=FACT_LABELS[label];return pair?(language==="fr"?pair[1]:pair[0]):label;}
function addressText(address){
  return String(address?.formatted??"").trim()||[
    address?.line1,address?.postal_code,address?.city,address?.region,address?.country??address?.country_code
  ].filter(Boolean).join(", ");
}
function pill(name,value,label,current){
  return '<button type="button" data-find-filter="'+esc(name)+'" data-find-filter-value="'+esc(value)+'" class="'+(current===value?"active":"")+'" aria-pressed="'+String(current===value)+'">'+esc(label)+'</button>';
}
function sourceLinks(item,language){
  const links=arr(item?.source_links);
  if(!links.length)return "";
  let html='<section class="aoFindSources"><small>'+esc(L(language,"SOURCES","SOURCES"))+'</small><div>';
  links.forEach((source,index)=>{
    const label=source?.issuer||source?.title||L(language,"Source","Source")+" "+String(index+1);
    html+='<a href="'+esc(source.url)+'" target="_blank" rel="noopener">'+esc(label)+'</a>';
  });
  return html+'</div></section>';
}
function itemCard(item,vm){
  return '<button type="button" class="aoFindCard aoExploreCard" data-explore-item="'+esc(item.item_id)+'" data-explore-lens="'+esc(item.lens)+'">'
    +'<span class="aoFindCardTop"><small>'+esc(item.eyebrow||lensLabel(vm.language,item.lens))+'</small><i class="aoFindStatus" data-state="'+esc(item.map_publishable?"YES":"UNKNOWN")+'">'+esc(item.status||"")+'</i></span>'
    +'<strong>'+esc(item.title||"")+'</strong>'
    +(item.subtitle?'<span>'+esc(item.subtitle)+'</span>':"")
    +(item.summary?'<p>'+esc(String(item.summary).slice(0,240))+'</p>':"")
    +'</button>';
}
function detailSheet(vm){
  const item=vm.selected;if(!item)return "";
  let html='<div class="aoFindSheetBackdrop" data-find-close-detail><section class="aoFindSheet" role="dialog" aria-modal="true">';
  html+='<header><div><small>'+esc(item.eyebrow||lensLabel(vm.language,item.lens))+'</small><h2>'+esc(item.title||"")+'</h2>';
  if(item.subtitle)html+='<p>'+esc(item.subtitle)+'</p>';
  html+='</div><button type="button" data-find-close-detail aria-label="'+esc(L(vm.language,"Close","Fermer"))+'">×</button></header>';

  if(item.summary)html+='<p class="aoExploreLead">'+esc(item.summary)+'</p>';

  if(arr(item.facts).length){
    html+='<div class="aoFindFacts">';
    for(const fact of item.facts){
      html+='<div><small>'+esc(factLabel(vm.language,fact.label))+'</small><strong>'+esc(fact.value)+'</strong></div>';
    }
    html+='</div>';
  }

  if(arr(item.sections).length){
    html+='<section class="aoFindSchedules aoExploreSections">';
    for(const section of item.sections){
      html+='<article><small>'+esc(section.label||"")+'</small>';
      if(section.title)html+='<strong>'+esc(section.title)+'</strong>';
      if(section.body)html+='<p>'+esc(section.body)+'</p>';
      html+='</article>';
    }
    html+='</section>';
  }

  const address=addressText(item.address);
  if(address){
    html+='<section class="aoExploreAddress"><small>'+esc(L(vm.language,"PLACE","LIEU"))+'</small><p>'+esc(address)+'</p></section>';
  }

  if(arr(item.actions).length){
    html+='<section class="aoFindActions">';
    for(const action of item.actions){
      html+='<a href="'+esc(action.url)+'" target="_blank" rel="noopener">'+esc(
        action.label==="Directions"?L(vm.language,"Directions","Itinéraire"):
        action.label==="Destination"?L(vm.language,"Destination","Destination"):
        action.label==="Website"?L(vm.language,"Website","Site"):action.label
      )+'</a>';
    }
    html+='</section>';
  }

  html+=sourceLinks(item,vm.language);
  html+='<footer><small>'+esc(item.note||L(vm.language,"Source-backed Explore record.","Fiche Explore sourcée."))+'</small>';
  if(item?.geo?.attribution)html+='<small class="aoFindGeoAttribution">'+esc(item.geo.attribution)+'</small>';
  html+='</footer></section></div>';
  return html;
}
function emptyState(vm){
  if(vm.lens==="tlm"&&vm.unavailableProviders.length){
    return '<section class="aoFindEmpty"><strong>'+esc(L(vm.language,"Directory snapshot incomplete","Instantané de l’annuaire incomplet"))+'</strong>'
      +'<p>'+esc(L(vm.language,"Some official-source corpora are unavailable in this build. Explore does not invent missing venues.","Certains corpus de sources officielles sont indisponibles dans cette version. Explore n’invente pas les lieux manquants."))+'</p>'
      +'<small>'+esc(L(vm.language,"Unavailable sources: ","Sources indisponibles : ")+vm.unavailableProviders.join(", ").toUpperCase())+'</small></section>';
  }
  return '<section class="aoFindEmpty"><strong>'+esc(L(vm.language,"No matching records","Aucune fiche correspondante"))+'</strong><p>'+esc(L(vm.language,"Try a broader search or another Explore lens.","Essayez une recherche plus large ou un autre volet d’Explore."))+'</p></section>';
}
function tlmFilters(vm){
  const f=vm.filters??{},aff=arr(f.affiliations);
  let html='<div class="aoFindFilters aoExploreTlmFilters"><div>'+pill("day","ANY",L(vm.language,"Any day","Tous les jours"),f.day||"ANY")+pill("day","TODAY",L(vm.language,"Today","Aujourd’hui"),f.day||"ANY")+pill("day","SUNDAY",L(vm.language,"Sunday","Dimanche"),f.day||"ANY")+'</div>';
  html+='<div class="aoFindAffiliations">';
  for(const id of ["DIOCESAN","FSSP","ICKSP","SSPX","IBP","OTHER"])html+='<button type="button" data-find-affiliation="'+id+'" class="'+(aff.includes(id)?"active":"")+'" aria-pressed="'+String(aff.includes(id))+'">'+id+'</button>';
  html+='</div><details><summary>'+esc(L(vm.language,"Advanced TLM filters","Filtres TLM avancés"))+'</summary><div>';
  html+=pill("unaCum","ANY",L(vm.language,"Any communion status","Tout statut"),f.unaCum||"ANY")+pill("unaCum","YES","Una cum",f.unaCum||"ANY")+pill("unaCum","NO","Non-una cum",f.unaCum||"ANY")+pill("unaCum","UNKNOWN",L(vm.language,"Unknown","Inconnu"),f.unaCum||"ANY");
  html+='</div><div>'+pill("liturgy","ANY",L(vm.language,"Any liturgy","Toute liturgie"),f.liturgy||"ANY")+pill("liturgy","1962","1962",f.liturgy||"ANY")+pill("liturgy","PRE_1955","Pre-1955",f.liturgy||"ANY")+pill("liturgy","DOMINICAN","Dominican",f.liturgy||"ANY")+'</div><div>';
  for(const id of ["ANY","LOW","SUNG","SOLEMN"])html+=pill("massType",id,id==="ANY"?L(vm.language,"Any Mass type","Tout type de messe"):id,f.massType||"ANY");
  return html+'</div></details></div>';
}

export function buildExploreViewModel({
  language="en",
  items=[],
  lens="tlm",
  counts={},
  loadedProviders=[],
  unavailableProviders=[],
  view="list",
  filters={},
  selectedId=null,
}={}){
  const list=arr(items);
  const selected=list.find(item=>item?.item_id===selectedId)??null;
  const mapped=list.filter(item=>item?.map_publishable).length;
  const addressOnly=list.filter(item=>!item?.map_publishable&&item?.address).length;
  return Object.freeze({
    language,
    items:list,
    lens,
    counts,
    loadedProviders:arr(loadedProviders),
    unavailableProviders:arr(unavailableProviders),
    view,
    filters,
    selected,
    mapped,
    addressOnly,
  });
}

export function renderExploreToString(vm){
  const f=vm.filters??{},loaded=vm.lens==="tlm"&&vm.loadedProviders.length?vm.loadedProviders.join(" · ").toUpperCase():String(vm.counts?.[vm.lens]??vm.items.length);
  let html='<section class="aoFindSurface aoExploreSurface" data-ao-find-owner="AO_FIND_APP_V1" data-ao-explore-owner="EXPLORE_V1">';
  html+='<header class="aoFindHeader"><button type="button" data-find-close aria-label="'+esc(L(vm.language,"Back","Retour"))+'">←</button><div><small>AD ORIENTEM · EXPLORE</small><h1>'+esc(L(vm.language,"Explore","Explorer"))+'</h1></div><span>'+esc(loaded)+'</span></header>';

  html+='<nav class="aoExploreLensTabs">';
  for(const lens of ["tlm","shrines","traditions","pilgrimages"]){
    const label=lensLabel(vm.language,lens);
    const count=vm.counts?.[lens];
    html+='<button type="button" data-find-filter="lens" data-find-filter-value="'+esc(lens)+'" class="'+(vm.lens===lens?"active":"")+'" aria-pressed="'+String(vm.lens===lens)+'"><span>'+esc(label)+'</span>'+(Number.isFinite(Number(count))?'<small>'+esc(count)+'</small>':"")+'</button>';
  }
  html+='</nav>';

  html+='<div class="aoFindSearch"><input type="search" data-find-query value="'+esc(f.query||"")+'" placeholder="'+esc(
    vm.lens==="tlm"?L(vm.language,"City, church, diocese or country","Ville, église, diocèse ou pays"):
    vm.lens==="shrines"?L(vm.language,"Shrine, saint or place","Sanctuaire, saint ou lieu"):
    vm.lens==="traditions"?L(vm.language,"Custom, region, period or place","Coutume, région, période ou lieu"):
    L(vm.language,"Pilgrimage, shrine, route or place","Pèlerinage, sanctuaire, itinéraire ou lieu")
  )+'"></div>';

  html+='<nav class="aoFindViewTabs">'+pill("view","list",L(vm.language,"List","Liste"),vm.view)+pill("view","map",L(vm.language,"Map","Carte"),vm.view)+'</nav>';
  if(vm.lens==="tlm")html+=tlmFilters(vm);

  const noun=vm.lens==="tlm"?L(vm.language,"venues","lieux"):vm.lens==="shrines"?L(vm.language,"shrines","sanctuaires"):vm.lens==="traditions"?L(vm.language,"attestations","attestations"):L(vm.language,"pilgrimages","pèlerinages");
  html+='<div class="aoFindResultMeta"><strong>'+String(vm.items.length)+'</strong><span>'+esc(noun)+'</span>';
  if(vm.mapped)html+='<span> · '+String(vm.mapped)+' '+esc(L(vm.language,"mapped","cartographiés"))+'</span>';
  if(vm.addressOnly)html+='<span> · '+String(vm.addressOnly)+' '+esc(L(vm.language,"address only","adresse seule"))+'</span>';
  html+='</div>';

  html+='<div class="aoFindBody" data-find-view="'+esc(vm.view)+'" data-explore-lens="'+esc(vm.lens)+'">';
  if(vm.view==="map"){
    html+='<div class="aoFindMap" data-find-map><div class="aoFindMapFallback"><strong>'+esc(lensLabel(vm.language,vm.lens))+'</strong><span>'+esc(
      vm.mapped
        ?L(vm.language,"Loading source-backed map points…","Chargement des points cartographiques sourcés…")
        :vm.addressOnly
          ?L(vm.language,"These records have canonical addresses, but no publishable coordinates yet. Use List for full access.","Ces fiches ont des adresses canoniques, mais pas encore de coordonnées publiables. Utilisez Liste pour tout consulter.")
          :L(vm.language,"No publishable map points in this lens yet.","Aucun point cartographique publiable dans ce volet pour le moment.")
    )+'</span></div></div>';
  }else if(vm.items.length){
    html+='<div class="aoFindList">'+vm.items.map(item=>itemCard(item,vm)).join("")+'</div>';
  }else html+=emptyState(vm);
  html+='</div>'+detailSheet(vm)+'</section>';
  return html;
}
